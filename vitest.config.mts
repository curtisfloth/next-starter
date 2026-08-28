import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Resolves the "@/*" alias from tsconfig.json (no baseUrl needed).
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    // Keep the probe fixture out of the test run entirely.
    exclude: ["node_modules/**", ".next/**", "probe/**"],
    env: {
      APP_URL: "http://localhost:3000",
      NEXT_PUBLIC_APP_NAME: "Nextjs Skeleton (test)",
    },
  },
});
