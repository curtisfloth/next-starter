/**
 * probe/probe.tsx — LINTER REGRESSION FIXTURE. DO NOT "FIX" THIS FILE.
 *
 * Every violation below is deliberate and permanent. `pnpm probe` lints this
 * file with Oxlint (using the real `.oxlintrc.json`, not a special one) and
 * fails if any of the 10 expected rules stops firing. That is how we detect a
 * lint-config change that silently disables a rule.
 *
 * Rules:
 *   - Each violation is preceded by `// EXPECT: <rule>`.
 *   - Each of the 10 expected rules fires exactly once.
 *   - Everything else must be valid TypeScript: `tsc --noEmit` must pass.
 *
 * Full accounting of Oxlint's output on this file: the 10 expected rules, plus
 * exactly two extras — react(exhaustive-effect-dependencies) and react(hooks).
 * Those are Oxlint's React-Compiler-based equivalents of exhaustive-deps and
 * rules-of-hooks; they fire on the SAME two violations, not on new ones, so
 * they are duplicates by design rather than unaccounted findings.
 *
 * This file is excluded from `pnpm lint` and from the Next.js build
 * (see tsconfig.build.json), but it IS included in tsconfig.json so that
 * tsgolint can build a program for it.
 */
import { useEffect, useState } from "react";
import type { JSX } from "react";

async function resolveLater(): Promise<string> {
  await Promise.resolve();
  return "ok";
}

function runLater(callback: () => void): void {
  callback();
}

/* ------------------------------------------------------------------ *
 * Type-aware TypeScript rules (need oxlint-tsgolint + options.typeAware)
 * ------------------------------------------------------------------ */

export function floatingPromise(): void {
  // EXPECT: no-floating-promises
  resolveLater();
}

export function misusedPromise(): void {
  // EXPECT: no-misused-promises
  runLater(async () => {
    await resolveLater();
  });
}

export async function awaitThenable(): Promise<number> {
  // EXPECT: await-thenable
  const total = await 42;
  return total;
}

// EXPECT: no-unsafe-assignment
export const parsedConfig = JSON.parse("{}");

export function unsafeCall(): void {
  // EXPECT: no-explicit-any
  const looseCallback: any = () => "called";
  // EXPECT: no-unsafe-call
  looseCallback();
}

/* ------------------------------------------------------------------ *
 * React rules
 * ------------------------------------------------------------------ */

export function ExhaustiveDeps({ userId }: { userId: string }): JSX.Element {
  const [label] = useState("probe");

  // EXPECT: react-hooks/exhaustive-deps
  useEffect(() => {
    document.title = userId;
  }, []);

  return <span>{label}</span>;
}

export function RulesOfHooks({ enabled }: { enabled: boolean }): JSX.Element {
  if (enabled) {
    // EXPECT: react-hooks/rules-of-hooks
    const [count] = useState(0);
    return <span>{count}</span>;
  }

  return <span>disabled</span>;
}

/* ------------------------------------------------------------------ *
 * Next.js rules
 * ------------------------------------------------------------------ */

export function ImgElement(): JSX.Element {
  // EXPECT: @next/next/no-img-element
  return <img src="/probe-fixture.png" alt="probe fixture" />;
}

export function SyncScript(): JSX.Element {
  // EXPECT: @next/next/no-sync-scripts
  return <script src="https://example.com/probe-fixture.js" />;
}
