import Link from "next/link";
import type { JSX } from "react";

import { EditNote } from "@/features/notes/components/edit-note";

export const metadata = {
  title: "Edit note",
};

/**
 * `PageProps` is a Next.js-generated global helper — no import needed. It types
 * `params` from the route path itself, so a rename of the [id] segment becomes
 * a type error here.
 */
export default async function EditNotePage({
  params,
}: PageProps<"/notes/[id]">): Promise<JSX.Element> {
  const { id } = await params;

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit note</h1>
        <Link href="/notes" className="text-sm underline underline-offset-4">
          Back to notes
        </Link>
      </div>
      <EditNote id={id} />
    </main>
  );
}
