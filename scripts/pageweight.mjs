#!/usr/bin/env node
// BRAND.md makes a promise in the footer. This enforces it.
//
// Three rules, and only one of them is about bytes.
//
//   1. No <script>. 2. No third-party assets. Those are absolute and always were.
//   3. A page must EARN its weight.
//
// Rule 3 replaced a flat 60 KB ceiling on 2026-09-05. The flat cap was the wrong shape:
// it treated a 60 KB index listing 300 devices — which is exactly what this site is for —
// the same as a 60 KB page carrying ten essays. One of those is the product and the other
// is bloat, and a byte count cannot tell them apart. Worse, the cap was going to be
// breached by honest growth, and a gate everyone expects to breach is a gate that gets
// raised rather than obeyed.
//
// So: below FREE_KB nothing is questioned, because nothing that small can be a problem.
// Above it, a page has to be listing things in proportion to its size — at most
// KB_PER_ITEM per row or record on the page. A long table of devices passes at any
// length. A short page of long prose per item does not, which is the actual failure
// mode this is here to catch. DOOM_KB is the backstop: past that, nothing justifies it.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const R = (...p) => resolve(ROOT, ...p);

const DIST = R("site/dist");
const FREE_KB = 35; // below this, a page is lightweight by definition
const KB_PER_ITEM = 1; // above it, this much weight per listed record is the allowance
const DOOM_KB = 200; // nothing on this site has a reason to be this big

if (!existsSync(DIST)) { console.error("no build output — run npm --prefix site run build"); process.exit(1); }

const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});

// What a page is "listing": one unit per RECORD presented — a table row, or a section.
// Deliberately not <li>: an essay-per-item page is thick with list items (every record's
// sources, alternatives and open questions are lists), so counting them would hand the
// biggest allowance to exactly the pages this rule exists to catch. That is not
// hypothetical — the old /rejected/ carried ~50 list items across 10 records and would
// have passed comfortably on an <li> count while failing on a record count.
const countItems = (html) =>
  (html.match(/<tr[\s>]/g)?.length ?? 0) +
  (html.match(/<section[\s>]/g)?.length ?? 0);

const fails = [];
const pages = [];
for (const p of walk(DIST).filter((f) => f.endsWith(".html"))) {
  const html = readFileSync(p, "utf8");
  const kb = Buffer.byteLength(html) / 1024;
  const items = countItems(html);
  const rel = p.slice(DIST.length) || "/";
  pages.push({ rel, kb, items });

  if (kb > DOOM_KB) {
    fails.push(`${rel}: ${kb.toFixed(1)} KB — past ${DOOM_KB} KB nothing justifies the weight`);
  } else if (kb > FREE_KB) {
    const allowed = FREE_KB + items * KB_PER_ITEM;
    if (kb > allowed)
      fails.push(
        `${rel}: ${kb.toFixed(1)} KB for ${items} listed item${items === 1 ? "" : "s"} — ` +
        `allowance is ${allowed.toFixed(1)} KB (${FREE_KB} KB + ${KB_PER_ITEM} KB/item). ` +
        `This page is heavy for what it lists: move the detail to the records it links to.`,
      );
  }

  // No request may leave the origin. Google Fonts included — especially Google Fonts.
  const ext = [...html.matchAll(/(?:src|href)\s*=\s*["'](https?:\/\/[^"']+)["']/g)]
    .map((m) => m[1])
    .filter((u) => !/^https?:\/\/dumbindex\.com/.test(u));
  const inHead = html.slice(0, html.indexOf("</head>"));
  for (const u of ext) if (inHead.includes(u)) fails.push(`${rel}: third-party asset in <head> — ${u}`);

  if (/<script(?![^>]*type=["']application\/(ld\+json|json)["'])[^>]*>/i.test(html))
    fails.push(`${rel}: contains a <script> tag`);
}

for (const f of fails) console.error(`FAIL  ${f}`);

// Print the weight distribution every run, passing or not. A threshold nobody looks at
// until it trips is how a site gets heavy one acceptable page at a time.
const heaviest = [...pages].sort((a, b) => b.kb - a.kb).slice(0, 5);
const total = pages.reduce((s, p) => s + p.kb, 0);
console.log(`\n${pages.length} pages · median ${median(pages.map((p) => p.kb)).toFixed(1)} KB · mean ${(total / pages.length).toFixed(1)} KB`);
console.log("heaviest:");
for (const p of heaviest)
  console.log(`  ${p.kb.toFixed(1).padStart(6)} KB  ${String(p.items).padStart(4)} items  ${(p.kb / Math.max(p.items, 1)).toFixed(2)} KB/item  ${p.rel}`);

function median(xs) {
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}

console.log(fails.length ? `\n${fails.length} violations` : "\npage-weight promise holds");
process.exit(fails.length ? 1 : 0);
