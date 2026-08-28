/**
 * Request-time read layer.
 *
 * The store is a synchronous in-memory Map, so without `connection()` Next.js
 * would happily resolve these reads during prerendering and bake the seed data
 * into the static output. `await connection()` stops prerendering and defers
 * the read to request time, which is what we want for mutable data.
 *
 * Note what we are NOT doing: `use cache`. Notes change on every mutation, so
 * caching them would serve stale data. Reach for `use cache` + `cacheLife` only
 * for data that is genuinely shared and slow-changing.
 *
 * The `<Suspense>` boundary these reads need is provided by the route's
 * loading.tsx.
 */
import { connection } from "next/server";

import { noteStore } from "./store";
import type { Note } from "./types";

export async function listNotes(): Promise<readonly Note[]> {
  await connection();
  return noteStore.list();
}

export async function getNote(id: string): Promise<Note | undefined> {
  await connection();
  return noteStore.get(id);
}
