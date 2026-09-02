#!/usr/bin/env node
// The regression gate. Scores data/devices/ against the hand-verified expectations
// in data/eval/golden.json. A prompt change that does not improve this score is not
// merged — see OPERATIONS.md §6. Writes a dated result so the trend is visible.
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

// Resolve everything from the repo root so these run correctly from any cwd —
// `npm --prefix site run check` executes with cwd=site/.
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const R = (...p) => resolve(ROOT, ...p);


const golden = JSON.parse(readFileSync(R("data/eval/golden.json"), "utf8"));
const today = new Date().toISOString().slice(0, 10);
const rows = [];

for (const c of golden.cases) {
  const p = R("data/devices", `${c.id}.json`);
  if (!existsSync(p)) { rows.push({ ...c, result: "MISSING", detail: "no record produced" }); continue; }
  const d = JSON.parse(readFileSync(p, "utf8"));
  const fails = [];

  // A held record has no tier to check — holding is the whole expectation.
  if (c.expected_status === "insufficient_evidence") {
    if (d.status !== "insufficient_evidence")
      fails.push(`published '${d.status}' where the correct answer was to hold the record`);
  } else {
    if (d.tier !== c.expected_tier) fails.push(`tier ${d.tier} ≠ ${c.expected_tier}`);
    if (d.status !== c.expected_status) fails.push(`status ${d.status} ≠ ${c.expected_status}`);
  }
  if (c.expected_vendor_risk != null && d.vendor_risk !== c.expected_vendor_risk)
    fails.push(`vendor_risk ${d.vendor_risk} ≠ ${c.expected_vendor_risk}`);
  if (c.expected_availability && d.availability !== c.expected_availability)
    fails.push(`availability ${d.availability} ≠ ${c.expected_availability}`);

  // Citation validity: did the run actually reach the sources that settle this case?
  const urls = (d.sources ?? []).map((s) => s.url).join(" ");
  const missed = (c.must_find ?? []).filter((m) => !urls.includes(m));
  if (missed.length) fails.push(`did not cite ${missed.join(", ")}`);

  // An ambiguous case answered with no recorded uncertainty is a lucky guess, not a pass.
  if (c.difficulty === "ambiguous" && !(d.open_questions ?? []).length && d.status === "verified")
    fails.push("ambiguous case published with no open_questions — uncertainty was not recorded");

  rows.push({ ...c, result: fails.length ? "FAIL" : "PASS", detail: fails.join("; ") });
}

const by = (d) => rows.filter((r) => r.difficulty === d);
const pct = (rs) => (rs.length ? Math.round((rs.filter((r) => r.result === "PASS").length / rs.length) * 100) : 100);

for (const r of rows) {
  const mark = r.result === "PASS" ? "pass" : r.result.toLowerCase();
  console.log(`${mark.padEnd(7)} ${r.difficulty.padEnd(10)} ${r.id}${r.detail ? `\n           ↳ ${r.detail}` : ""}`);
}

const overall = pct(rows);
console.log(`\noverall ${overall}%  ·  easy ${pct(by("easy"))}%  ambiguous ${pct(by("ambiguous"))}%  trap ${pct(by("trap"))}%`);
console.log(`${rows.filter((r) => r.result === "PASS").length}/${rows.length} cases`);

mkdirSync(R("data/eval/results"), { recursive: true });
writeFileSync(R("data/eval/results", `${today}.json`), JSON.stringify({
  date: today, overall,
  by_difficulty: { easy: pct(by("easy")), ambiguous: pct(by("ambiguous")), trap: pct(by("trap")) },
  cases: rows.map(({ id, difficulty, result, detail }) => ({ id, difficulty, result, detail })),
}, null, 2));

// Traps encode the failure modes that cost us real errors. Never let those regress.
if (pct(by("trap")) < 100) { console.error("\nA trap case regressed. This gate blocks the merge."); process.exit(1); }
process.exit(overall < 90 ? 1 : 0);
