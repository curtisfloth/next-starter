/**
 * Domain types for the notes slice.
 *
 * Timestamps are ISO-8601 strings rather than `Date` objects so a note can
 * cross the server/client boundary without a serialization step.
 */
export interface Note {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
