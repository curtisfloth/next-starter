import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tseslint from "typescript-eslint";

/**
 * ADVISORY ONLY.
 *
 * Oxlint is the blocking linter (`pnpm lint`). This config exists so we can run
 * both linters side by side for two weeks and record parity gaps. It must never
 * fail `pnpm check` or block CI — see the `lint:eslint` script and the
 * non-blocking CI step.
 *
 * `eslint-config-next/typescript` ships typescript-eslint's `recommended`
 * preset, which is NOT type-checked, so type-aware rules are silently absent.
 * We add `projectService` and the type-checked presets below so the comparison
 * against Oxlint's `options.typeAware` is actually fair.
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Turn on type-aware linting for TS/TSX sources.
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["*.mjs"],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Type-aware rules cannot run on files outside the TS program.
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    extends: [tseslint.configs.disableTypeChecked],
  },

  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // NOTE: probe/ is deliberately NOT ignored here. `pnpm lint:eslint` is
    // advisory and always exits 0, so letting it see the fixture gives us a
    // continuous parity readout against Oxlint and proves that
    // `parserOptions.projectService` is actually wired (type-aware rules fire).
  ]),
]);

export default eslintConfig;
