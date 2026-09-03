#!/usr/bin/env node
// Fill in archive_url for cited sources, so a record survives its citations rotting.
//
// check-links.mjs tells you a link is DEAD or UNREACHABLE. This is the other half: it
// asks the Wayback Machine for a snapshot and records it. A load-bearing source that
// 404s is a record we can no longer stand behind; the same source with an archive URL
// is still checkable by a reader, which is the whole promise.
//
//   node scripts/archive-sources.mjs            # only sources that are currently failing
//   node scripts/archive-sources.mjs --all      # every source missing an archive_url
//   node scripts/archive-sources.mjs --dry-run  # report, write nothing
//
// Deliberately does NOT ask Wayback to create new snapshots. It records what already
// exists. A source with no snapshot is reported so a human can decide whether to
// re-source the claim or archive it by hand.

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEVICES = join(ROOT, "data/devices");
const ALL = process.argv.includes("--all");
const DRY = process.argv.includes("--dry-run");

const reachable = async (url) => {
  try {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), 15000);
    const r = await fetch(url, { redirect: "follow", signal: c.signal,
      headers: { "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" } });
    clearTimeout(t);
    // 403/429 means alive but refusing us. A reader gets through; no archive needed.
    return r.ok || r.status === 403 || r.status === 429;
  } catch { return false; }
};

const wayback = async (url) => {
  try {
    const r = await fetch(`https://archive.org/wayback/available?url=${encodeURIComponent(url)}`,
      { signal: AbortSignal.timeout(25000) });
    const snap = (await r.json())?.archived_snapshots?.closest;
    return snap?.available && snap.status === "200" ? snap.url.replace(/^http:/, "https:") : null;
  } catch { return null; }
};

// A sequential pass over 300+ sources is unusable — most of the wall clock is spent
// waiting on liveness checks that are independent of each other.
const pool = async (items, n, fn) => {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); }
  }));
  return out;
};

const docs = readdirSync(DEVICES).filter((x) => x.endsWith(".json"))
  .map((f) => ({ f, p: join(DEVICES, f), d: JSON.parse(readFileSync(join(DEVICES, f), "utf8")) }));

const jobs = [];
for (const doc of docs)
  for (const s of doc.d.sources ?? [])
    if (!s.archive_url) jobs.push({ doc, s });

const alreadyFine = docs.reduce((n, d) => n + (d.d.sources ?? []).filter((s) => s.archive_url).length, 0);

const needed = ALL ? jobs : (await pool(jobs, 8, async (j) => (await reachable(j.s.url)) ? null : j)).filter(Boolean);

let filled = 0, missing = 0;
const touched = new Set();

await pool(needed, 4, async (j) => {
  const a = await wayback(j.s.url);
  if (a) {
    j.s.archive_url = a;
    touched.add(j.doc);
    filled++;
    console.log(`archived  ${j.doc.d.model_id}  ${j.s.url.slice(0, 70)}`);
  } else {
    missing++;
    console.log(`NO SNAPSHOT  ${j.doc.d.model_id}  (${j.s.class}) ${j.s.url.slice(0, 70)}`);
  }
});

if (!DRY) for (const doc of touched) writeFileSync(doc.p, JSON.stringify(doc.d, null, 2) + "\n");

console.log(`\n${filled} archived · ${missing} with no snapshot · ${alreadyFine} already had one · ${jobs.length - needed.length} live and fine${DRY ? "  (dry run, nothing written)" : ""}`);
if (missing) console.log("A source with no snapshot and no live page cannot support a claim. Re-source it or withdraw the record.");
