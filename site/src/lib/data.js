// Build-time data access. `data/` is the source of truth; the site is a pure
// function of it (README invariant 1). Nothing here writes.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../..");

export const taxonomy = JSON.parse(readFileSync(join(ROOT, "schema/taxonomy.json"), "utf8"));
export const ledger = JSON.parse(readFileSync(join(ROOT, "data/vendors.json"), "utf8"));
export const vendors = Object.entries(ledger.vendors ?? {})
  .map(([slug, v]) => ({ slug, ...v }))
  .sort((a, b) => b.vendor_risk - a.vendor_risk || a.name.localeCompare(b.name));
export const riskScale = ledger._scale ?? {};

// Match a device to its ledger entry by make. Vendors not in the ledger simply
// have no entry yet — that is not the same as a clean record, and the UI says so.
export const vendorFor = (make) =>
  vendors.find((v) => v.name.toLowerCase().startsWith(String(make).toLowerCase().split(" ")[0]));
export const domains = taxonomy.domains;
export const domainBySlug = new Map(domains.map((d) => [d.slug, d]));

function loadDevices() {
  const dir = join(ROOT, "data/devices");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(join(dir, f), "utf8")))
    // Only verified records reach the site. Everything else is work in progress.
    .filter((d) => d.status === "verified" || d.status === "needs_reverification")
    .sort((a, b) => (a.make + a.model).localeCompare(b.make + b.model));
}

export const devices = loadDevices();

// Rejections are published too. A reader searching for a specific popular device
// deserves a clear answer rather than silence — silence reads as "not researched".
function loadRejected() {
  const dir = join(ROOT, "data/devices");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(join(dir, f), "utf8")))
    .filter((d) => d.status === "rejected")
    .sort((a, b) => (a.make + a.model).localeCompare(b.make + b.model));
}
export const rejected = loadRejected();

export const TIERS = {
  D0: { name: "No Radio",      short: "No radio at all. It cannot phone home." },
  D1: { name: "Local Only",    short: "Speaks only to hardware you control." },
  D2: { name: "Cloud-Optional",short: "Full function with the router off." },
  D3: { name: "Liberatable",   short: "Cloud-bound as sold; a local path exists." },
};

export const byDomain = (slug) => devices.filter((d) => d.category === slug);
export const bySub = (slug, sub) => devices.filter((d) => d.category === slug && d.subcategory === sub);
export const byTier = (t) => devices.filter((d) => d.tier === t);

// Subcategories that actually have devices — never render an empty page.
export function populatedSubs(slug) {
  const d = domainBySlug.get(slug);
  if (!d) return [];
  return d.subcategories
    .map((s) => ({ sub: s, count: bySub(slug, s).length }))
    .filter((x) => x.count > 0);
}

export function ageDays(iso) {
  if (!iso) return null;
  return Math.round((Date.now() - Date.parse(iso)) / 864e5);
}

// One timeline, two views. /updates shows everything; /downgrades filters to the
// entries that mean a device got worse. Deriving both from the same list means the
// alarm channel can never drift out of sync with the record it describes.
const MATERIAL = new Set(["tier_change", "vendor_incident"]);

export function timeline() {
  return [...devices, ...rejected]
    .flatMap((d) => (d.changelog ?? []).map((c) => ({ ...c, kind: c.kind ?? "listed", device: d })))
    // Newest first; within a day, material changes outrank routine listings so a
    // downgrade is never buried under the day's additions.
    .sort((a, b) => b.date.localeCompare(a.date) || rank(a.kind) - rank(b.kind));
}
const rank = (k) => (MATERIAL.has(k) ? 0 : k === "correction" || k === "availability" ? 1 : 2);
export const downgrades = () => timeline().filter((c) => MATERIAL.has(c.kind));

export const KIND_LABEL = {
  listed: "new",
  tier_change: "got worse",
  vendor_incident: "vendor",
  availability: "stock",
  correction: "correction",
};

// Devices whose vendor cloud can be fully replaced with hardware you run.
// This is not a tier — it is what a motivated owner can achieve with one.
export const selfHostable = () => devices.filter((d) => d.local_replacement === "full");

export const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
