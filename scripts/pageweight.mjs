#!/usr/bin/env node
// BRAND.md makes a promise in the footer. This enforces it.
// The site is dumb too: no third-party requests, no client JS, every page under 60 KB.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const DIST = "site/dist";
const LIMIT = 60 * 1024;
if (!existsSync(DIST)) { console.error("no build output — run npm --prefix site run build"); process.exit(1); }

const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});

const fails = [];
let worst = 0, worstFile = "";
for (const p of walk(DIST).filter((f) => f.endsWith(".html"))) {
  const html = readFileSync(p, "utf8");
  const bytes = Buffer.byteLength(html);
  if (bytes > worst) { worst = bytes; worstFile = p; }
  if (bytes > LIMIT) fails.push(`${p}: ${(bytes / 1024).toFixed(1)} KB exceeds 60 KB`);

  // No request may leave the origin. Google Fonts included — especially Google Fonts.
  const ext = [...html.matchAll(/(?:src|href)\s*=\s*["'](https?:\/\/[^"']+)["']/g)]
    .map((m) => m[1])
    .filter((u) => !/^https?:\/\/dumbindex\.com/.test(u));
  const inHead = html.slice(0, html.indexOf("</head>"));
  for (const u of ext) if (inHead.includes(u)) fails.push(`${p}: third-party asset in <head> — ${u}`);

  if (/<script(?![^>]*type=["']application\/(ld\+json|json)["'])[^>]*>/i.test(html))
    fails.push(`${p}: contains a <script> tag`);
}

for (const f of fails) console.error(`FAIL  ${f}`);
console.log(`\nheaviest page: ${worstFile} at ${(worst / 1024).toFixed(1)} KB (budget 60 KB)`);
console.log(fails.length ? `${fails.length} violations` : "page-weight promise holds");
process.exit(fails.length ? 1 : 0);
