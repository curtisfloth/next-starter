/**
 * THE SWAP POINT.
 *
 * Everything else in this slice talks to the `NoteStore` interface, never to
 * the implementation. To move to a real database, rewrite this one file:
 * keep the interface, replace `createInMemoryNoteStore` with a Prisma/Drizzle/
 * whatever-backed implementation, and nothing else in the slice changes.
 *
 * The interface is async even though the in-memory implementation resolves
 * immediately. That is on purpose — a real store will be async, and having
 * callers already `await` means the swap is not a refactor.
 *
 * This module must stay free of Next.js imports so it can be unit tested and
 * reused outside a request (see tests/notes-store.test.ts). Request-time
 * concerns live in queries.ts.
 */

/* eslint-disable @typescript-eslint/require-await -- TEMPORARY, tied to the
   synchronous store. require-await is enabled globally and contradicts
   promise-function-async only here: these methods satisfy an async interface
   backed by a synchronous Map, so they have nothing to await. A real database
   implementation will await, so DELETE THIS DIRECTIVE when the Map goes.
   One directive covers both linters — Oxlint honours eslint-disable and maps
   @typescript-eslint/* onto its own typescript/* namespace. */

import type { NoteInput } from "./schema";
import type { Note } from "./types";

export interface NoteStore {
  /** Newest first. */
  list(): Promise<readonly Note[]>;
  /** `undefined` when no note has that id. */
  get(id: string): Promise<Note | undefined>;
  create(input: NoteInput): Promise<Note>;
  /** `undefined` when no note has that id. */
  update(id: string, input: NoteInput): Promise<Note | undefined>;
}

/**
 * Seed data is fixed rather than generated. Module-level `Date.now()` or
 * `crypto.randomUUID()` would run during prerendering and produce build-time
 * values baked into the output.
 */
const SEED_NOTES: readonly Note[] = [
  {
    id: "note-1",
    title: "Read the house patterns",
    body: "Routes in src/app do routing only. Feature code lives in src/features/<name>.",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "note-2",
    title: "Swap the store",
    body: "Only src/features/notes/store.ts knows how notes are persisted.",
    createdAt: "2026-01-02T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
  },
];

export function createInMemoryNoteStore(seed: readonly Note[] = SEED_NOTES): NoteStore {
  const notes = new Map<string, Note>(seed.map((note) => [note.id, note]));
  let sequence = seed.length;

  function nextId(): string {
    sequence += 1;
    return `note-${String(sequence)}`;
  }

  return {
    async list(): Promise<readonly Note[]> {
      const all = [...notes.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return all;
    },

    async get(id: string): Promise<Note | undefined> {
      return notes.get(id);
    },

    async create(input: NoteInput): Promise<Note> {
      const now = new Date().toISOString();
      const note: Note = {
        id: nextId(),
        title: input.title,
        body: input.body,
        createdAt: now,
        updatedAt: now,
      };
      notes.set(note.id, note);
      return note;
    },

    async update(id: string, input: NoteInput): Promise<Note | undefined> {
      const existing = notes.get(id);
      if (existing === undefined) {
        return undefined;
      }

      const updated: Note = {
        ...existing,
        title: input.title,
        body: input.body,
        updatedAt: new Date().toISOString(),
      };
      notes.set(id, updated);
      return updated;
    },
  };
}

/**
 * Process-wide singleton. In-memory state survives requests but not a server
 * restart, and dev-mode hot reload may reset it. That is acceptable for a
 * reference slice and is exactly the limitation a real store removes.
 */
export const noteStore: NoteStore = createInMemoryNoteStore();
