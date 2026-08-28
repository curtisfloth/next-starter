import { describe, expect, it } from "vitest";

import { TITLE_MAX_LENGTH, noteInputSchema } from "@/features/notes/schema";

describe("noteInputSchema", () => {
  it("accepts a valid note and trims whitespace", () => {
    const result = noteInputSchema.safeParse({
      title: "  Ship it  ",
      body: "  Body text  ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Ship it");
      expect(result.data.body).toBe("Body text");
    }
  });

  it("rejects an empty title", () => {
    const result = noteInputSchema.safeParse({ title: "   ", body: "Body" });

    expect(result.success).toBe(false);
    if (!result.success) {
      const titleIssue = result.error.issues.find((issue) => issue.path.includes("title"));
      expect(titleIssue?.message).toBe("Title is required.");
    }
  });

  it("rejects a title over the maximum length", () => {
    const result = noteInputSchema.safeParse({
      title: "a".repeat(TITLE_MAX_LENGTH + 1),
      body: "Body",
    });

    expect(result.success).toBe(false);
  });

  it("rejects non-string input, which is what FormData.get can return", () => {
    const result = noteInputSchema.safeParse({ title: null, body: "Body" });

    expect(result.success).toBe(false);
  });
});
