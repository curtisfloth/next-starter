/**
 * Wraps the segment in a <Suspense> boundary. This is what lets the reads in
 * queries.ts defer to request time via connection() while the shell streams
 * immediately.
 */
import type { JSX } from "react";

export default function NotesLoading(): JSX.Element {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-8">
      <p className="text-sm text-muted-foreground">Loading notes…</p>
    </main>
  );
}
