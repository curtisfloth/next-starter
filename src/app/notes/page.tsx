/**
 * Routing only. All notes logic lives in src/features/notes.
 *
 * Default export is required by Next.js; everywhere else we use named exports.
 */
import Link from "next/link";
import type { JSX } from "react";

import { NoteList } from "@/features/notes/components/note-list";

export const metadata = {
  title: "Notes",
};

export default function NotesPage(): JSX.Element {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Notes</h1>
        <Link href="/notes/new" className="text-sm underline underline-offset-4">
          New note
        </Link>
      </div>
      <NoteList />
    </main>
  );
}
