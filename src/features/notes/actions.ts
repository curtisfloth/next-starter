"use server";

/**
 * Server Actions for the notes slice.
 *
 * House pattern:
 *  1. Validate the raw FormData with zod. Never trust it — a Server Action is
 *     reachable by direct POST, not only through our own form.
 *  2. Model validation failures as RETURN VALUES so the form can render them.
 *     Do not throw for expected errors.
 *  3. Mutate through the store interface.
 *  4. revalidatePath, then redirect. redirect() throws a control-flow
 *     exception, so anything after it is unreachable.
 *
 * A `"use server"` module may only export async functions. Types and constants
 * for these actions live in form-state.ts.
 */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import type { NoteFormState } from "./form-state";
import { noteInputSchema } from "./schema";
import { noteStore } from "./store";

const NOTES_PATH = "/notes";

function toFormState(error: z.ZodError): NoteFormState {
  const { fieldErrors } = z.flattenError(error);
  return {
    message: "Please fix the errors below.",
    fieldErrors,
  };
}

function readNoteInput(formData: FormData): z.ZodSafeParseResult<z.infer<typeof noteInputSchema>> {
  return noteInputSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
  });
}

export async function createNoteAction(
  _prevState: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const parsed = readNoteInput(formData);

  if (!parsed.success) {
    return toFormState(parsed.error);
  }

  await noteStore.create(parsed.data);

  revalidatePath(NOTES_PATH);
  return redirect(NOTES_PATH);
}

export async function updateNoteAction(
  id: string,
  _prevState: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const parsed = readNoteInput(formData);

  if (!parsed.success) {
    return toFormState(parsed.error);
  }

  const updated = await noteStore.update(id, parsed.data);

  if (updated === undefined) {
    return {
      message: "That note no longer exists.",
      fieldErrors: {},
    };
  }

  revalidatePath(NOTES_PATH);
  return redirect(NOTES_PATH);
}
