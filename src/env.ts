/**
 * Zod-validated environment variables.
 *
 * `next.config.ts` imports this module, so an invalid or missing variable
 * fails `next build` (and `next dev`) immediately with a readable error
 * instead of surfacing as `undefined` at runtime.
 *
 * Every variable defined here must also be listed in `.env.example`.
 */
import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  /** Absolute base URL of this deployment, e.g. http://localhost:3000 */
  APP_URL: z.url(),

  /** Exposed to the browser — must be prefixed with NEXT_PUBLIC_. */
  NEXT_PUBLIC_APP_NAME: z.string().min(1),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(source: Record<string, string | undefined> = process.env): Env {
  const result = envSchema.safeParse(source);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => {
        const path = issue.path.join(".") || "(root)";
        return `  ${path}: ${issue.message}`;
      })
      .join("\n");

    throw new Error(
      `Invalid environment variables:\n${details}\n\n` +
        `See .env.example for the full list of required variables.`,
    );
  }

  return result.data;
}

export const env: Env = parseEnv();
