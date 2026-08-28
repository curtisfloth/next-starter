import Link from "next/link";
import type { JSX } from "react";

import { CreateNote } from "@/features/notes/components/create-note";

export const metadata = {
  title: "New note",
};

export default function NewNotePage(): JSX.Element {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">New note</h1>
        <Link href="/notes" className="text-sm underline underline-offset-4">
          Back to notes
        </Link>
      </div>
      <CreateNote />
    </main>
  );
}
