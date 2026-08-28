/**
 * Server Component. Reads data directly — no client-side fetching, no
 * data-fetching library, no loading state of its own (loading.tsx covers it).
 */
import Link from "next/link";
import type { JSX } from "react";

import { listNotes } from "../queries";

export async function NoteList(): Promise<JSX.Element> {
  const notes = await listNotes();

  if (notes.length === 0) {
    return <p className="text-sm text-muted-foreground">No notes yet. Create the first one.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {notes.map((note) => (
        <li key={note.id} className="rounded-lg border border-input p-4">
          <Link
            href={`/notes/${note.id}`}
            className="font-medium underline-offset-4 hover:underline"
          >
            {note.title}
          </Link>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{note.body}</p>
          <time dateTime={note.updatedAt} className="mt-2 block text-xs text-muted-foreground">
            Updated {note.updatedAt.slice(0, 10)}
          </time>
        </li>
      ))}
    </ul>
  );
}
