This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Enforcement layer

This project pins a strict toolchain. The one command to run — and the one
agents should run — is:

```bash
pnpm check
```

That is `typecheck && lint && build`. If it is green, the tree is good.

### Scripts

| Script              | What it does                                              | Blocking |
| ------------------- | --------------------------------------------------------- | -------- |
| `pnpm check`        | `typecheck` → `lint` → `build`                            | yes      |
| `pnpm typecheck`    | `tsc --noEmit` over the whole project, including `probe/` | yes      |
| `pnpm lint`         | Oxlint, type-aware, excluding `probe/`                    | yes      |
| `pnpm probe`        | Regression test for the linter itself (see below)         | yes      |
| `pnpm test`         | Vitest                                                    | yes      |
| `pnpm lint:eslint`  | ESLint parity report                                      | **no**   |
| `pnpm format`       | oxfmt, writes in place                                    | —        |
| `pnpm format:check` | oxfmt, check only                                         | —        |

### Two linters, on purpose

**Oxlint blocks. ESLint is advisory.**

Oxlint (`.oxlintrc.json`) is the enforcing linter, with `options.typeAware`
enabled and backed by `oxlint-tsgolint`, so type-aware rules such as
`no-floating-promises` and the `no-unsafe-*` family actually run.

ESLint is kept installed alongside it to catch parity gaps while Oxlint
proves itself — see [ESLint sunset](#eslint-sunset--ends-2026-09-11) for the
end date and the exact removal steps. `pnpm lint:eslint` swallows its own exit code and its CI step
is `continue-on-error`, so **it can never fail a build**. Note that
`eslint-config-next/typescript` ships typescript-eslint's _non_-type-checked
`recommended` preset — type-aware rules are silently absent by default — so
`eslint.config.mjs` adds `parserOptions.projectService` and the
`strictTypeChecked` preset to make the comparison fair.

### ESLint sunset — ends 2026-09-11

ESLint runs advisory alongside Oxlint for a two-week parity check.

|                 |                                         |
| --------------- | --------------------------------------- |
| **Started**     | 2026-08-28                              |
| **Ends**        | 2026-09-11                              |
| **Looking for** | rules ESLint catches that Oxlint misses |

Read the output from `pnpm lint:eslint` locally, or from the
**ESLint parity report (advisory, non-blocking)** step in CI. Anything ESLint
flags that Oxlint stays silent on is a candidate parity gap — record it before
the end date.

**Expected non-gaps.** Two differences are deliberate and should not be counted:

- `typescript/require-await` is enabled in **both** linters, and suppressed in
  exactly one place — a single `eslint-disable` directive at the top of
  `src/features/notes/store.ts`, needed only because the in-memory store
  satisfies an async interface with a synchronous `Map`. Oxlint honours
  `eslint-disable` directives, so that one comment covers both linters and
  neither should report it. Delete the directive when the store is replaced;
  `scripts/cleanup.ts` prints a reminder.
- On `probe/probe.tsx`, Oxlint reports two findings ESLint does not
  (`react(exhaustive-effect-dependencies)`, `react(hooks)`). See the probe
  section below — they are duplicates of rules both linters already report.

**Removing ESLint on 2026-09-11.** Four steps:

```bash
pnpm remove eslint eslint-config-next typescript-eslint
rm eslint.config.mjs
```

Then edit two files:

1. `package.json` — delete the `lint:eslint` script.
2. `.github/workflows/ci.yml` — delete the `ESLint parity report (advisory,
non-blocking)` step.

Afterwards, `grep -rn "eslint" --exclude-dir=node_modules .` should return only
the `eslint-disable` directive in `src/features/notes/store.ts`. That directive
keeps working — Oxlint honours `eslint-disable` by default — but if a reference
to ESLint in a repo with no ESLint reads oddly, rewrite it as
`oxlint-disable typescript/require-await` (both forms are verified to work).

### `probe/` — do not "fix" it

`probe/probe.tsx` is a **permanent fixture**, not broken code.

It contains exactly one violation of each of ten rules we care about, each
tagged with an `// EXPECT: <rule>` comment. `pnpm probe` lints only that file,
using the real `.oxlintrc.json`, and **exits non-zero if any of the ten rules
fails to fire**.

This is a regression test for the linter, not for the app. It catches the
failure mode where a config change — a dropped plugin, `options.typeAware`
flipped to `false`, a missing `oxlint-tsgolint` install — silently stops
enforcing a rule and nobody notices for a month.

The ten rules:

```
no-floating-promises          no-misused-promises      await-thenable
no-unsafe-assignment          no-unsafe-call           no-explicit-any
react-hooks/exhaustive-deps   react-hooks/rules-of-hooks
@next/next/no-img-element     @next/next/no-sync-scripts
```

Oxlint reports twelve findings on this file, not ten. The two extras are
`react(exhaustive-effect-dependencies)` and `react(hooks)` — Oxlint's
React-Compiler-based equivalents of `exhaustive-deps` and `rules-of-hooks`,
firing on the _same_ two violations. They are duplicates by design, not
unaccounted findings. ESLint reports exactly the ten.

Rules of engagement:

- **Never "fix" the violations.** If `pnpm probe` fails, the linter config
  regressed — fix `.oxlintrc.json`, not `probe/probe.tsx`.
- Everything else in the file must stay valid TypeScript. `pnpm typecheck`
  covers `probe/` and must pass.
- `probe/` is excluded from `pnpm lint` and from `next build` (via
  `tsconfig.build.json`, which `next.config.ts` points at). It lives outside
  `src/app` so it can never become a route.
- To add a rule to the contract: add one violation, tag it with
  `// EXPECT: <rule>`, and enable the rule in `.oxlintrc.json`. The probe
  script reads the `EXPECT` comments, so nothing else needs updating.

### Environment variables

`src/env.ts` validates `process.env` with zod and is imported by
`next.config.ts`, so a missing or malformed variable fails the build up front:

```
Error: Invalid environment variables:
  APP_URL: Invalid input: expected string, received undefined
```

Every variable must also be listed in `.env.example` (committed, no values).
Copy it to `.env` to get started.

### TypeScript

`strict`, plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
`verbatimModuleSyntax`, `noImplicitOverride`, and `noFallthroughCasesInSwitch`.
Path aliases use `paths` **without** `baseUrl`, which is deprecated in
TypeScript 6.
