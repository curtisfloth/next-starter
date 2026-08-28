/**
 * Server Component wrapper for the edit case.
 *
 * Two patterns worth copying:
 *  - `notFound()` is called here, in the feature, not in the route file. The
 *    route only knows it renders <EditNote />; the feature decides what
 *    "missing" means. Next renders the nearest not-found.tsx.
 *  - The note id is bound to the action on the SERVER via `.bind`, so it is
 *    never emitted into the markup as a hidden input a client could tamper
 *    with. The action still re-checks that the note exists.
 */
import { notFound } from "next/navigation";
import type { JSX } from "react";

import { updateNoteAction } from "../actions";
import { getNote } from "../queries";
import { NoteForm } from "./note-form";

export async function EditNote({ id }: { readonly id: string }): Promise<JSX.Element> {
  const note = await getNote(id);

  if (note === undefined) {
    notFound();
  }

  return (
    <NoteForm
      action={updateNoteAction.bind(null, note.id)}
      defaultValues={{ title: note.title, body: note.body }}
      submitLabel="Save changes"
    />
  );
}
