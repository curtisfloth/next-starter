#!/usr/bin/env node
/**
 * Regression test for the linter itself.
 *
 * Lints ONLY probe/probe.tsx with Oxlint, using the project's real
 * `.oxlintrc.json`, and fails if any rule named in an `// EXPECT: <rule>`
 * comment did not actually fire.
 *
 * This exists so a future config change (a dropped plugin, `typeAware` flipped
 * off, a missing oxlint-tsgolint install) cannot silently disable a rule
 * without a red build.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const PROBE_FILE = "probe/probe.tsx";

/** `typescript(no-unsafe-call)` -> `no-unsafe-call` */
function bareFromOxlintCode(code) {
  const match = /^(?<plugin>[^(]+)\((?<rule>[^)]+)\)$/u.exec(code);
  return match?.groups ? match.groups.rule : code;
}

/** `@next/next/no-img-element` -> `no-img-element` */
function bareFromExpectName(name) {
  const parts = name.split("/");
  return parts[parts.length - 1];
}

const source = readFileSync(PROBE_FILE, "utf8");

const expected = [];
const lines = source.split("\n");
lines.forEach((line, index) => {
  const match = /^\s*\/\/\s*EXPECT:\s*(?<rule>\S+)\s*$/u.exec(line);
  if (match?.groups) {
    expected.push({ rule: match.groups.rule, line: index + 1 });
  }
});

if (expected.length === 0) {
  console.error(`probe: no "// EXPECT: <rule>" comments found in ${PROBE_FILE}.`);
  console.error("probe: the fixture has been gutted — restore it.");
  process.exit(1);
}

// Deliberately NOT passing `--type-aware`: the probe must exercise the real
// `.oxlintrc.json`. If someone flips `options.typeAware` to false, the
// type-aware rules stop firing and this script fails, which is the point.
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const localBin = path.join(repoRoot, "node_modules", ".bin", "oxlint");
const oxlintBin = existsSync(localBin) ? localBin : "oxlint";

const result = spawnSync(oxlintBin, ["--no-ignore", "--format", "json", PROBE_FILE], {
  encoding: "utf8",
  shell: false,
  env: process.env,
  cwd: repoRoot,
});

if (result.error) {
  console.error(`probe: failed to run oxlint: ${result.error.message}`);
  process.exit(1);
}

let report;
try {
  report = JSON.parse(result.stdout);
} catch {
  console.error("probe: could not parse oxlint JSON output.");
  console.error(result.stdout || result.stderr);
  process.exit(1);
}

const diagnostics = report.diagnostics ?? [];
const fired = new Map();
for (const diagnostic of diagnostics) {
  const bare = bareFromOxlintCode(diagnostic.code);
  fired.set(bare, (fired.get(bare) ?? 0) + 1);
}

const missing = [];
console.log(`probe: linting ${PROBE_FILE} — ${expected.length} expected rules\n`);

for (const { rule, line } of expected) {
  const bare = bareFromExpectName(rule);
  const count = fired.get(bare) ?? 0;
  if (count > 0) {
    console.log(`  ok    ${rule}  (fired ${count}x)`);
  } else {
    console.log(`  FAIL  ${rule}  (did not fire — declared at ${PROBE_FILE}:${line})`);
    missing.push(rule);
  }
}

if (missing.length > 0) {
  console.error(`\nprobe: FAILED — ${missing.length} of ${expected.length} rules did not fire:`);
  for (const rule of missing) console.error(`  - ${rule}`);
  console.error(
    "\nA rule stopped firing. Do NOT edit probe/probe.tsx to make this pass —\n" +
      "the fixture is correct by definition. Fix .oxlintrc.json (plugins,\n" +
      "options.typeAware) or reinstall oxlint-tsgolint.",
  );
  process.exit(1);
}

console.log(`\nprobe: OK — all ${expected.length} rules fired on ${PROBE_FILE}.`);
process.exit(0);
