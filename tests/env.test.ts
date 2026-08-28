import { describe, expect, it } from "vitest";

import { env, parseEnv } from "@/env";

describe("env", () => {
  it("exposes the validated environment", () => {
    expect(env.APP_URL).toBe("http://localhost:3000");
    expect(env.NEXT_PUBLIC_APP_NAME).toBe("Nextjs Skeleton (test)");
  });

  it("throws a readable error when a required variable is missing", () => {
    expect(() => parseEnv({ NEXT_PUBLIC_APP_NAME: "x" })).toThrow(/Invalid environment variables/);
    expect(() => parseEnv({ NEXT_PUBLIC_APP_NAME: "x" })).toThrow(/APP_URL/);
  });

  it("rejects a malformed URL", () => {
    expect(() => parseEnv({ APP_URL: "not-a-url", NEXT_PUBLIC_APP_NAME: "x" })).toThrow(/APP_URL/);
  });
});
