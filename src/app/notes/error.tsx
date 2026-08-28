"use client";

/**
 * Error boundaries must be Client Components.
 *
 * Next 16 passes `retry`, which re-fetches and re-renders the segment. (The
 * older `reset` prop still exists but only clears the boundary without
 * re-fetching — prefer `retry`.)
 *
 * This catches UNEXPECTED errors. Validation failures are not errors: the
 * actions return them and the form renders them inline.
 */
import type { JSX } from "react";

export default function NotesError({
  error,
  retry,
}: {
  readonly error: Error & { readonly digest?: string };
  readonly retry: () => void;
}): JSX.Element {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">
        {error.digest === undefined
          ? "The notes could not be loaded."
          : `The notes could not be loaded. Reference: ${error.digest}`}
      </p>
      <div>
        <button
          type="button"
          onClick={() => {
            retry();
          }}
          className="text-sm underline underline-offset-4"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
