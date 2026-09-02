#!/usr/bin/env node
// Link rot is REFRESH's most mechanical duty and does not need a model to do it.
// Distinguishes dead (gone) from blocked (alive, refuses bots) — conflating them
// would have us withdraw records over sites that are perfectly fine for a reader.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const R = (...p) => resolve(ROOT, ...p);
const UA = "Mozilla/5.0 (compatible; dumbindex-linkcheck/1.0; +https://dumbindex.com)";

const targets = [];
for (const f of readdirSync(R("data/devices")).filter((x) => x.endsWith(".json"))) {
  const d = JSON.parse(readFileSync(R("data/devices", f), "utf8"));
  for (const s of d.sources ?? []) targets.push({ id: d.model_id, url: s.url, role: `source(${s.class})` });
  for (const w of d.where_to_buy ?? []) targets.push({ id: d.model_id, url: w.url, role: "where_to_buy" });
  if (d.liberation?.guide_url) targets.push({ id: d.model_id, url: d.liberation.guide_url, role: "liberation" });
}
if (existsSync(R("data/vendors.json"))) {
  const v = JSON.parse(readFileSync(R("data/vendors.json"), "utf8"));
  for (const [slug, vendor] of Object.entries(v.vendors ?? {}))
    for (const i of vendor.incidents ?? []) targets.push({ id: `vendor:${slug}`, url: i.source, role: "incident" });
}

const classify = (status) => {
  if (status === 0) return "UNREACHABLE";
  if (status === 404 || status === 410) return "DEAD";
  if (status === 403 || status === 401 || status === 429) return "BLOCKED";
  if (status >= 500) return "SERVER_ERR";
  return "OK";
};

async function probe(url) {
  for (const method of ["HEAD", "GET"]) {
    try {
      const c = new AbortController();
      const t = setTimeout(() => c.abort(), 20000);
      const r = await fetch(url, { method, redirect: "follow", signal: c.signal, headers: { "user-agent": UA } });
      clearTimeout(t);
      // Some hosts reject HEAD but serve GET; only trust a HEAD failure after GET agrees.
      if (method === "HEAD" && (r.status === 405 || r.status === 403)) continue;
      return r.status;
    } catch { if (method === "GET") return 0; }
  }
  return 0;
}

const results = [];
for (let i = 0; i < targets.length; i += 6) {
  const batch = targets.slice(i, i + 6);
  const got = await Promise.all(batch.map(async (t) => ({ ...t, status: await probe(t.url) })));
  results.push(...got.map((g) => ({ ...g, verdict: classify(g.status) })));
}

const bad = results.filter((r) => ["DEAD", "UNREACHABLE", "SERVER_ERR"].includes(r.verdict));
const blocked = results.filter((r) => r.verdict === "BLOCKED");

for (const r of [...bad, ...blocked])
  console.log(`${r.verdict.padEnd(11)} ${String(r.status).padEnd(4)} ${r.id.padEnd(34)} ${r.role.padEnd(14)} ${r.url}`);

console.log(`\n${results.length} links · ${results.length - bad.length - blocked.length} ok · ${blocked.length} blocked (alive, refuses bots) · ${bad.length} need attention`);
if (bad.length) console.log("\nDEAD/UNREACHABLE links are load-bearing if they support a tier — archive or re-source before the record can stay verified.");
process.exit(bad.length ? 1 : 0);
