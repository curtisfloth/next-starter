import type { NextConfig } from "next";

// Importing this for its side effect: it validates process.env against the
// zod schema in src/env.ts and throws before the build starts if a required
// variable is missing or malformed.
import { env } from "./src/env";

const nextConfig: NextConfig = {
  typescript: {
    // The probe fixture is deliberately un-lintable but must stay
    // type-checkable, so it lives in tsconfig.json. Next 16 type-checks the
    // whole tsconfig project during `next build`, so point the build at a
    // config that excludes probe/ and tests.
    tsconfigPath: "tsconfig.build.json",
  },
  env: {
    APP_URL: env.APP_URL,
  },
};

export default nextConfig;
