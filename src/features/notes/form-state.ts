/**
 * Shape of the value a note form action returns to `useActionState`.
 *
 * This lives outside actions.ts because a `"use server"` module may only
 * export async functions — a plain `const` there is a build error.
 *
 * Expected errors (validation) are modelled as return values, not thrown.
 * Throwing is reserved for genuinely unexpected failures, which the route's
 * error.tsx boundary catches.
 */
export interface NoteFieldErrors {
  readonly title?: readonly string[];
  readonly body?: readonly string[];
}

export interface NoteFormState {
  /** Form-level message. Empty string means "nothing to report". */
  readonly message: string;
  readonly fieldErrors: NoteFieldErrors;
}

export const emptyNoteFormState: NoteFormState = {
  message: "",
  fieldErrors: {},
};
