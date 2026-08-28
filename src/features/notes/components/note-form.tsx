"use client";

/**
 * The one Client Component in this slice.
 *
 * It is a Client Component only because `useActionState` needs to render the
 * pending state and the validation errors the action returns. Everything else
 * — the list, the data reads — stays on the server.
 *
 * It is deliberately action-agnostic: create and edit both render this form and
 * differ only in the action passed in. The edit case binds the note id on the
 * server (see edit-note.tsx) so the id never rides along in the markup.
 */
import { useActionState, useId } from "react";
import type { JSX } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { emptyNoteFormState } from "../form-state";
import type { NoteFormState } from "../form-state";
import { BODY_MAX_LENGTH, TITLE_MAX_LENGTH } from "../schema";

export interface NoteFormValues {
  readonly title: string;
  readonly body: string;
}

interface NoteFormProps {
  readonly action: (state: NoteFormState, formData: FormData) => Promise<NoteFormState>;
  readonly defaultValues: NoteFormValues;
  readonly submitLabel: string;
}

function FieldErrors({
  errors,
  id,
}: {
  readonly errors: readonly string[];
  readonly id: string;
}): JSX.Element | null {
  if (errors.length === 0) {
    return null;
  }

  return (
    <ul id={id} className="text-sm text-destructive" role="alert">
      {errors.map((error) => (
        <li key={error}>{error}</li>
      ))}
    </ul>
  );
}

export function NoteForm({ action, defaultValues, submitLabel }: NoteFormProps): JSX.Element {
  const [state, formAction, pending] = useActionState(action, emptyNoteFormState);

  const titleId = useId();
  const bodyId = useId();
  const titleErrorId = `${titleId}-error`;
  const bodyErrorId = `${bodyId}-error`;

  const titleErrors = state.fieldErrors.title ?? [];
  const bodyErrors = state.fieldErrors.body ?? [];

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-6">
      {state.message === "" ? null : (
        <p className="text-sm text-destructive" role="alert">
          {state.message}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor={titleId}>Title</Label>
        <Input
          id={titleId}
          name="title"
          defaultValue={defaultValues.title}
          maxLength={TITLE_MAX_LENGTH}
          aria-invalid={titleErrors.length > 0}
          aria-describedby={titleErrors.length > 0 ? titleErrorId : undefined}
        />
        <FieldErrors errors={titleErrors} id={titleErrorId} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={bodyId}>Body</Label>
        <Textarea
          id={bodyId}
          name="body"
          rows={6}
          defaultValue={defaultValues.body}
          maxLength={BODY_MAX_LENGTH}
          aria-invalid={bodyErrors.length > 0}
          aria-describedby={bodyErrors.length > 0 ? bodyErrorId : undefined}
        />
        <FieldErrors errors={bodyErrors} id={bodyErrorId} />
      </div>

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
