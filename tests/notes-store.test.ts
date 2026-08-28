import { beforeEach, describe, expect, it } from "vitest";

import { createInMemoryNoteStore } from "@/features/notes/store";
import type { NoteStore } from "@/features/notes/store";
import type { Note } from "@/features/notes/types";

const SEED: readonly Note[] = [
  {
    id: "note-1",
    title: "First",
    body: "First body",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

describe("in-memory note store", () => {
  let store: NoteStore;

  // A fresh store per test — never the exported singleton, so tests cannot
  // leak state into each other.
  beforeEach(() => {
    store = createInMemoryNoteStore(SEED);
  });

  it("lists seeded notes", async () => {
    const notes = await store.list();

    expect(notes).toHaveLength(1);
    expect(notes[0]?.title).toBe("First");
  });

  it("returns undefined for an unknown id", async () => {
    expect(await store.get("does-not-exist")).toBeUndefined();
  });

  it("creates a note with a fresh id and timestamps", async () => {
    const created = await store.create({ title: "Second", body: "Body" });

    expect(created.id).not.toBe("note-1");
    expect(created.createdAt).toBe(created.updatedAt);
    expect(await store.get(created.id)).toStrictEqual(created);
    expect(await store.list()).toHaveLength(2);
  });

  it("lists newest first", async () => {
    const created = await store.create({ title: "Second", body: "Body" });
    const notes = await store.list();

    expect(notes[0]?.id).toBe(created.id);
  });

  it("updates an existing note and bumps updatedAt", async () => {
    const updated = await store.update("note-1", {
      title: "Renamed",
      body: "New body",
    });

    expect(updated?.title).toBe("Renamed");
    expect(updated?.createdAt).toBe("2026-01-01T00:00:00.000Z");
    expect(updated?.updatedAt).not.toBe("2026-01-01T00:00:00.000Z");
  });

  it("returns undefined when updating an unknown id", async () => {
    expect(await store.update("does-not-exist", { title: "x", body: "y" })).toBeUndefined();
  });

  it("does not mutate the seed array it was given", async () => {
    await store.create({ title: "Second", body: "Body" });

    expect(SEED).toHaveLength(1);
  });
});
