/**
 * Validation for the notes slice.
 *
 * This module is deliberately free of Next.js and of the store: it is pure
 * data validation, which is what makes it cheap to unit test (see
 * tests/notes-schema.test.ts).
 */
import { z } from "zod";

export const TITLE_MAX_LENGTH = 80;
export const BODY_MAX_LENGTH = 2000;

export const noteInputSchema = z.object({
  title: z
    .string({ error: "Title is required." })
    .trim()
    .min(1, "Title is required.")
    .max(TITLE_MAX_LENGTH, `Title must be ${String(TITLE_MAX_LENGTH)} characters or fewer.`),
  body: z
    .string({ error: "Body is required." })
    .trim()
    .min(1, "Body is required.")
    .max(BODY_MAX_LENGTH, `Body must be ${String(BODY_MAX_LENGTH)} characters or fewer.`),
});

export type NoteInput = z.infer<typeof noteInputSchema>;
