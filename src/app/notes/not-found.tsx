/**
 * Rendered when the notes feature calls notFound() — see edit-note.tsx.
 */
import Link from "next/link";
import type { JSX } from "react";

export default function NoteNotFound(): JSX.Element {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold">Note not found</h1>
      <p className="text-sm text-muted-foreground">That note does not exist, or it was removed.</p>
      <Link href="/notes" className="text-sm underline underline-offset-4">
        Back to notes
      </Link>
    </main>
  );
}
