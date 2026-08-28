#!/usr/bin/env node
/**
 * Removes the example "notes" vertical slice.
 *
 * The notes slice exists to demonstrate the house patterns. When you start a
 * real project, run this to strip it:
 *
 *   node scripts/cleanup.ts            # remove it
 *   node scripts/cleanup.ts --dry-run  # show what would be removed
 *
 * It removes:
 *   - the routes under src/app/notes
 *   - the feature directory src/features/notes
 *   - the slice's tests
 *   - shadcn components in src/components/ui that nothing else imports once
 *     the slice is gone
 *   - itself
 *
 * It does NOT touch the enforcement layer (probe/, .oxlintrc.json, CI, env
 * validation), which is the part you actually want to keep.
 */
import { existsSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dryRun = process.argv.includes("--dry-run");

/** Paths that belong to the slice outright. */
const SLICE_PATHS: readonly string[] = [
  "src/app/notes",
  "src/features/notes",
  "tests/notes-schema.test.ts",
  "tests/notes-store.test.ts",
  // The landing page exists to advertise the slice and link to it, so it goes
  // at the same time. The build is fine without a `/` route — only
  // `/_not-found` remains — but the site root will 404 until you add your own.
  "src/app/page.tsx",
];

/** Directories scanned when deciding whether a UI component is still used. */
const SOURCE_DIRS: readonly string[] = ["src", "tests", "probe", "scripts"];

const SOURCE_EXTENSIONS: readonly string[] = [".ts", ".tsx", ".mts", ".js", ".jsx", ".mjs"];

const removed: string[] = [];

/**
 * Absolute paths already removed. Tracked explicitly so that `--dry-run`
 * reaches the same conclusions as a real run: nothing is deleted from disk,
 * but the usage scan below still treats these as gone.
 */
const removedPaths = new Set<string>();

function isRemoved(absolute: string): boolean {
  for (const entry of removedPaths) {
    if (absolute === entry || absolute.startsWith(`${entry}${path.sep}`)) {
      return true;
    }
  }
  return false;
}

function remove(relativePath: string): void {
  const absolute = path.join(repoRoot, relativePath);
  if (!existsSync(absolute) || isRemoved(absolute)) {
    return;
  }

  if (!dryRun) {
    rmSync(absolute, { recursive: true, force: true });
  }
  removedPaths.add(absolute);
  removed.push(relativePath);
}

function listSourceFiles(): string[] {
  const files: string[] = [];

  function walk(absoluteDir: string): void {
    if (!existsSync(absoluteDir)) {
      return;
    }

    for (const entry of readdirSync(absoluteDir, { withFileTypes: true })) {
      const absolute = path.join(absoluteDir, entry.name);

      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name.startsWith(".") || isRemoved(absolute)) {
          continue;
        }
        walk(absolute);
        continue;
      }

      if (SOURCE_EXTENSIONS.includes(path.extname(entry.name)) && !isRemoved(absolute)) {
        files.push(absolute);
      }
    }
  }

  for (const dir of SOURCE_DIRS) {
    walk(path.join(repoRoot, dir));
  }

  return files;
}

/**
 * True when any remaining file imports `src/components/ui/<name>`.
 *
 * This is a text scan, not a real module graph: it looks for the `@/components/
 * ui/<name>` alias and, for sibling components, a relative `./<name>` import.
 * That covers how shadcn components are actually imported. If you wire up an
 * exotic import style, re-check by hand.
 */
function isComponentUsed(name: string, files: readonly string[]): boolean {
  const componentPath = path.join(repoRoot, "src", "components", "ui", `${name}.tsx`);

  return files.some((file) => {
    // `files` is listed once per sweep, but this sweep may already have
    // deleted some of them — skip those instead of reading a missing file.
    if (file === componentPath || isRemoved(file)) {
      return false;
    }

    const source = readFileSync(file, "utf8");

    if (source.includes(`components/ui/${name}"`)) {
      return true;
    }

    const isSiblingComponent = path.dirname(file) === path.dirname(componentPath);

    return isSiblingComponent && source.includes(`"./${name}"`);
  });
}

function removeUnusedUiComponents(): void {
  const uiDir = path.join(repoRoot, "src", "components", "ui");
  if (!existsSync(uiDir)) {
    return;
  }

  // Removing one component can orphan another (components import each other),
  // so keep sweeping until a pass removes nothing.
  let removedInPass = true;
  while (removedInPass) {
    removedInPass = false;

    const files = listSourceFiles();
    const components = readdirSync(uiDir)
      .filter((entry) => entry.endsWith(".tsx"))
      .map((entry) => path.basename(entry, ".tsx"))
      .filter((name) => !isRemoved(path.join(uiDir, `${name}.tsx`)));

    for (const component of components) {
      if (isComponentUsed(component, files)) {
        continue;
      }

      remove(path.posix.join("src", "components", "ui", `${component}.tsx`));
      removedInPass = true;
    }
  }
}

function removeEmptyDirectory(relativePath: string): void {
  const absolute = path.join(repoRoot, relativePath);
  if (!existsSync(absolute) || !statSync(absolute).isDirectory()) {
    return;
  }

  const remaining = readdirSync(absolute).filter((entry) => !isRemoved(path.join(absolute, entry)));

  if (remaining.length === 0) {
    remove(relativePath);
  }
}

for (const slicePath of SLICE_PATHS) {
  remove(slicePath);
}

removeUnusedUiComponents();

removeEmptyDirectory("src/features");
removeEmptyDirectory("src/components/ui");
removeEmptyDirectory("src/components");

// Last: this script has no purpose once the slice is gone.
remove("scripts/cleanup.ts");

const label = dryRun ? "Would remove" : "Removed";
console.log(`${label} ${String(removed.length)} path(s):`);
for (const entry of removed.toSorted((a, b) => a.localeCompare(b))) {
  console.log(`  ${entry}`);
}

if (dryRun) {
  console.log("\nDry run — nothing was deleted.");
} else {
  console.log("\nThe notes slice is gone. Run `pnpm check` to confirm the tree is clean.");
  console.log("\nsrc/app/page.tsx went with it, so `/` now 404s. Add your own page.tsx.");
  console.log(
    [
      "",
      "REMINDER: src/features/notes/store.ts carried a temporary",
      "`eslint-disable @typescript-eslint/require-await` directive. It existed",
      "only because the in-memory store satisfied an async interface with a",
      "synchronous Map, and that store is now gone.",
      "",
      "Re-enable require-await everywhere: check that no suppression or",
      "file-scoped override survives.",
      "",
      '  grep -rn "require-await" --exclude-dir=node_modules .',
      "",
    ].join("\n"),
  );
}
