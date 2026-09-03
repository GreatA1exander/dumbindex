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
const SCHEMA = JSON.parse(readFileSync(R("schema/device.schema.json"), "utf8")).properties;
// Driven off the schema itself so the two cannot drift apart. A hand-maintained copy of
// the allowed values here would be wrong within a month — the radios enum alone has been
// extended twice by agents who found something it had no honest tag for.
const ENUMS = Object.entries(SCHEMA)
  .map(([k, v]) => [k, v.enum ?? v.items?.enum])
  .filter(([, allowed]) => allowed);
const LEDGER = JSON.parse(readFileSync(R("data/vendors.json"), "utf8")).vendors;
// Same match rule the site uses, so a record that validates also renders a vendor link.
const ledgerFor = make => Object.values(LEDGER).find(v =>
  v.name.toLowerCase().startsWith(String(make).toLowerCase().split(" ")[0]));
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
  // Two entries pointing at one page are one source, not two. Listing it twice
  // overstates the evidence even when the record clears the bar on other grounds.
  const seen = new Map();
  for (const s of src) seen.set(s.url, (seen.get(s.url) ?? 0) + 1);
  for (const [u, n] of seen) if (n > 1) E(`cites the same URL ${n} times as separate sources — ${u}`);

  // §5: vendor_risk is computed from the ledger, never from reputation. A score with no
  // dated, sourced incident behind it is exactly the vibes-based judgement the ladder
  // exists to prevent — and it is invisible on the site, since /vendors renders the
  // ledger rather than the record.
  // The schema declares enums; nothing was checking them. An out-of-enum value is not a
  // cosmetic slip — it silently drops the field out of every site filter that switches on
  // it, so the record renders looking complete while answering nothing.
  for (const [k, allowed] of ENUMS) {
    if (d[k] === undefined || d[k] === null) continue;
    for (const v of Array.isArray(d[k]) ? d[k] : [d[k]])
      if (!allowed.includes(v)) E(`${k} = ${JSON.stringify(v)} is not one of: ${allowed.join(", ")}`);
  }

  if (d.vendor_risk > 0) {
    const v = ledgerFor(d.make);
    if (!v) E(`vendor_risk ${d.vendor_risk} but no entry for "${d.make}" in data/vendors.json — score it from a dated incident or drop it to 0`);
    else if (v.vendor_risk !== d.vendor_risk) E(`vendor_risk ${d.vendor_risk} disagrees with the ledger's ${v.vendor_risk} for ${v.name}`);
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

  // A rejection with nowhere to go wastes the reader's trip. If no alternative exists
  // yet, that is a finding to record in open_questions, not a blank to leave.
  if (d.status === "rejected" && !(d.alternatives?.length) && !(d.open_questions?.length))
    E(`rejected with neither an alternative nor an open question about finding one`);
  for (const a of d.alternatives ?? [])
    if (!existsSync(join(DEVICES, `${a.model_id}.json`)))
      E(`alternative '${a.model_id}' does not exist in the catalog`);

  // D0 and D1 have no vendor cloud by definition, so there is nothing to self-host.
  if (["D0", "D1"].includes(d.tier) && d.local_replacement && d.local_replacement !== "not_applicable")
    E(`${d.tier} should have local_replacement 'not_applicable' — the tier means no vendor cloud exists`);
  if (d.status === "verified" && ["D2", "D3"].includes(d.tier) && !d.local_replacement)
    W(`${d.tier} with no local_replacement — the reader cannot tell whether the cloud is replaceable`);

  // Family records answer a different question and need different fields.
  if (d.record_type === "family" && !d.identify)
    E(`family record with no 'identify' guidance — that guidance is the entire point`);
}

for (const w of warn) console.log(`WARN  ${w}`);
for (const e of errors) console.error(`FAIL  ${e}`);
console.log(`\n${files.length} records, ${errors.length} errors, ${warn.length} warnings`);
process.exit(errors.length ? 1 : 0);
