/**
 * Server Component wrapper for the create case. The route file stays a
 * one-liner; the feature owns what "create a note" means.
 */
import type { JSX } from "react";

import { createNoteAction } from "../actions";
import { NoteForm } from "./note-form";

export function CreateNote(): JSX.Element {
  return (
    <NoteForm
      action={createNoteAction}
      defaultValues={{ title: "", body: "" }}
      submitLabel="Create note"
    />
  );
}
