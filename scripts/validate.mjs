#!/usr/bin/env node
// Mechanical gate: agents are validated by this, not by a reviewer's patience.
// Schema conformance + the project rules a schema cannot express.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

// Resolve everything from the repo root so these run correctly from any cwd —
// `npm --prefix site run check` executes with cwd=site/.
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const R = (...p) => resolve(ROOT, ...p);


const DEVICES = R("data/devices");
const TAX = JSON.parse(readFileSync(R("schema/taxonomy.json"), "utf8"));
const DOMAINS = new Map(TAX.domains.map(d => [d.slug, new Set(d.subcategories)]));
const today = new Date().toISOString().slice(0, 10);
const errors = [];
const warn = [];

const files = existsSync(DEVICES) ? readdirSync(DEVICES).filter(f => f.endsWith(".json")) : [];
if (!files.length) console.log("no device records yet");

for (const f of files) {
  const p = join(DEVICES, f);
  let d;
  try { d = JSON.parse(readFileSync(p, "utf8")); }
  catch (e) { errors.push(`${f}: unparseable — ${e.message}`); continue; }

  const E = m => errors.push(`${f}: ${m}`);
  const W = m => warn.push(`${f}: ${m}`);

  for (const k of ["model_id","make","model","category","tier","status","the_unplug_test","sources","last_verified"])
    if (d[k] == null) E(`missing required field '${k}'`);
  if (d.model_id && f !== `${d.model_id}.json`) E(`filename must match model_id (${d.model_id}.json)`);

  // Taxonomy discipline (Principles §6): no invented categories.
  if (d.category && !DOMAINS.has(d.category)) E(`unknown domain '${d.category}'`);
  else if (d.subcategory && !DOMAINS.get(d.category).has(d.subcategory))
    E(`subcategory '${d.subcategory}' not listed under domain '${d.category}' in taxonomy.json`);
  else if (d.status === "verified" && !d.subcategory) W(`no subcategory — it will not appear in domain sub-navigation`);

  const src = d.sources ?? [];
  // Principles §2: tier claims need one Class A or two independent Class B.
  if (d.status === "verified") {
    const a = src.filter(s => s.class === "A").length;
    const b = src.filter(s => s.class === "B").length;
    if (!(a >= 1 || b >= 2)) E(`verified but evidence is below bar (A=${a}, B=${b})`);
    if (src.some(s => s.class === "C") && a === 0 && b === 0) E(`sole support is Class C`);
    if (!d.the_unplug_test || d.the_unplug_test.length < 60) E(`the_unplug_test too thin to be useful`);
  }
  for (const s of src) {
    if (!s.supports) E(`source ${s.url} does not say what it supports`);
    if (!s.accessed) E(`source ${s.url} has no access date`);
  }

  // §11: staleness. 18 months invalidates evidence; 60 days is a nudge.
  if (d.last_verified) {
    const age = (Date.now() - Date.parse(d.last_verified)) / 864e5;
    if (age > 545 && d.status === "verified") E(`last_verified ${Math.round(age)}d ago — evidence expired`);
    else if (age > 60) W(`last_verified ${Math.round(age)}d ago — due for refresh`);
    if (d.last_verified > today) E(`last_verified is in the future`);
  }

  // §4.10: agents must never insert commercial links.
  if (d.affiliate && d.agent_meta?.model) E(`affiliate set on an agent-written record`);
  // D3 must cite a real, maintained path.
  if (d.tier === "D3" && !d.liberation?.guide_url) E(`D3 requires liberation.guide_url`);
  // Unknowns are fine; silent unknowns are not.
  if (d.status === "insufficient_evidence" && !(d.open_questions?.length)) E(`insufficient_evidence with no open_questions`);
  if (d.tier === "REJECT" && !d.rejection_reason) E(`REJECT with no rejection_reason`);
}

for (const w of warn) console.log(`WARN  ${w}`);
for (const e of errors) console.error(`FAIL  ${e}`);
console.log(`\n${files.length} records, ${errors.length} errors, ${warn.length} warnings`);
process.exit(errors.length ? 1 : 0);
