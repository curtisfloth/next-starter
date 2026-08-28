/**
 * Template landing page.
 *
 * This is scaffolding, not application code: it exists so a freshly cloned
 * project opens on something that says what the stack is and where the docs
 * are, instead of the Next.js logo. `scripts/cleanup.ts` deletes it along with
 * the notes slice — write your own `page.tsx` and this goes away.
 */
import Link from "next/link";
import type { JSX } from "react";

const REPO_URL = "https://github.com/curtisfloth/next-starter";

const STACK: readonly { readonly name: string; readonly detail: string }[] = [
  { name: "Next.js 16", detail: "App Router, Turbopack" },
  { name: "React 19", detail: "Server Components by default" },
  { name: "TypeScript 5.9", detail: "strict, no baseUrl" },
  { name: "Tailwind CSS 4", detail: "with shadcn/ui" },
  { name: "Oxlint", detail: "type-aware, blocking" },
  { name: "oxfmt", detail: "formatting" },
  { name: "Vitest", detail: "unit tests" },
  { name: "Zod", detail: "validated env in src/env.ts" },
  { name: "pnpm", detail: "pinned via packageManager" },
];

export default function Home(): JSX.Element {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-10 p-8 sm:p-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">next-starter</h1>
        <p className="text-sm text-muted-foreground">
          A Next.js template with the linting, typing and CI rules already decided. Run{" "}
          <code className="rounded bg-black/[.06] px-1.5 py-0.5 font-mono text-[0.9em] dark:bg-white/[.08]">
            pnpm check
          </code>{" "}
          — if it is green, the tree is good.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Stack</h2>
        <ul className="flex flex-col gap-1.5 text-sm">
          {STACK.map((item) => (
            <li key={item.name} className="flex flex-wrap gap-x-2">
              <span className="font-medium">{item.name}</span>
              <span className="text-muted-foreground">{item.detail}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Reference implementation</h2>
        <p className="text-sm text-muted-foreground">
          <Link href="/notes" className="font-medium text-foreground underline underline-offset-4">
            The notes slice
          </Link>{" "}
          is a worked example of the house patterns: routes that only route, feature code in{" "}
          <code className="font-mono">src/features/</code>, a swappable store, server actions with
          Zod validation, and the loading/error/not-found boundaries.
        </p>
        <p className="text-sm text-muted-foreground">
          It is an example, not a dependency. Delete it — and this page — with{" "}
          <code className="rounded bg-black/[.06] px-1.5 py-0.5 font-mono text-[0.9em] dark:bg-white/[.08]">
            node scripts/cleanup.ts
          </code>
          .
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Read next</h2>
        <p className="text-sm text-muted-foreground">
          <code className="font-mono">README.md</code> covers the enforcement layer: what{" "}
          <code className="rounded bg-black/[.06] px-1.5 py-0.5 font-mono text-[0.9em] dark:bg-white/[.08]">
            probe/
          </code>{" "}
          is and why it must never be &ldquo;fixed&rdquo;, the two-linter parity window, and the
          env-var contract.{" "}
          <a
            href={`${REPO_URL}#readme`}
            className="font-medium text-foreground underline underline-offset-4"
          >
            Read it on GitHub
          </a>
          .
        </p>
      </section>
    </main>
  );
}
