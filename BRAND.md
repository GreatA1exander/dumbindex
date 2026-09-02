# Brand and style guide

## Name and domain

**`dumbindex.com`** — recommended, and confirmed available 2026-09-01.

It works because the scope is no longer just the house. "Index" says catalog and
reference rather than blog or review site, which is exactly the promise. It reads as a
brand ("The Dumb Index"), it is short, and it survives the project growing from kettles
to dashcams without renaming.

Also available in `.com` as of 2026-09-01:

| Domain | Note |
|---|---|
| `unplugtest.com` / `theunplugtest.com` | Ties to the site's signature per-device section. Memorable, but names the test rather than the catalog. |
| `dumbcatalog.com` | Near-synonym of the pick; slightly longer, slightly flatter. |
| `dumbregistry.com` | More official-sounding; "registry" implies membership more than curation. |
| `unsmartdevices.com` / `notsmartdevices.com` | Explicit, SEO-legible, no personality. |
| `dumbonpurpose.com` | Best tagline-as-domain; weakest as a reference-site name. |
| `nocloudgear.com` / `cloudfreegear.com` | Descriptive; "cloud-free" dates faster than "dumb". |
| `dumbspec.com`, `dumbfinder.com`, `dumbrated.com` | Fallbacks. |

Taken across every TLD checked: `dumbdevices.*`, `dumbappliances.com`, `stilldumb.com`,
`thedumblist.com`, `keepitdumb.com`, `nocloud.house`, `localonly.dev`.

Buy `dumbindex.com` and park `theunplugtest.com` as a redirect if you want the second
name for the newsletter.

Tagline candidates, in descending order of how much I like them:
- *Devices that still work when the internet doesn't.*
- *A catalog of devices that mind their own business.*
- *Buy it once. Own it after.*

## The governing idea

**The site practices what it preaches.** This is the whole brand, and it is also the
design constraint that keeps the build simple — which is exactly what you asked for.

Hard rules, enforced in CI:

- No third-party requests. No fonts, no CDN, no analytics, no embeds, no cookie banner
  because there are no cookies.
- No JavaScript required to read anything. JS may enhance filtering; the filters must
  also work as plain links with query params.
- Page weight budget: **< 60 KB** for any page, images included.
- Static HTML, no client-side routing.
- Works in reader mode, works in Lynx, prints correctly.

Put these in the footer as a promise with the actual measured page weight next to it.
It is the single most persuasive thing on the site to the audience you are courting.

## Visual direction: the service manual

Not a tech blog, not Wirecutter. The reference is a **1980s appliance service manual**:
dense, tabular, high-contrast, monospaced accents, utterly unexcited. Information density
is the aesthetic. Whitespace is earned, not decorative.

- **Type:** system stack only — `ui-sans-serif, -apple-system, Segoe UI, Roboto` for body,
  `ui-monospace, SFMono-Regular, Menlo, monospace` for tiers, model numbers, dates, and
  spec tables. No webfonts; that is a third-party request.
- **Color:** paper and ink. `#faf9f7` / `#16150f`. One signal color used *only* for tier
  badges and alerts. Full dark mode via `prefers-color-scheme` with no toggle.
- **Tier badges** are the visual system. Monospace, boxed, always the same four glyphs:
  `D0` `D1` `D2` `D3`. Color-code but never rely on color alone — the tier text is the
  label, and colorblind readers get the same information.
- **No hero images. No stock photography. No product beauty shots.** One small product
  photo per device page, sourced from the manufacturer, or none. Never a lifestyle image.
- **Every claim shows its age.** A `verified 2026-08-14` timestamp next to every device
  entry, greying visibly as it ages past 60 days. Decay must be embarrassing rather than
  invisible — this is a design decision doing quality-control work.

## Layout and navigation

Organization is the product. A flat list of 300 devices is a spreadsheet; the domain
structure is what makes it a reference. Navigation is generated from
`schema/taxonomy.json`, so it can never drift from the data.

**Three levels, and no more:**

```
/                      the index — every device, one dense sortable table
/automotive/           domain page — intro, subcategory jump-links, table
/automotive/dashcam/   subcategory page — the deepest useful page
/device/viofo-a129/    the device record
```

- **Home.** One table: make, model, domain, tier, verified date, in stock. Sortable and
  filterable by tier and domain through plain links with query params — no cards, no grid,
  no hero. A reader should scan forty rows without scrolling past anything decorative.
  Above it, one line of text explaining the ladder, and the four tier badges as filters.
- **Domain pages** (14 of them). A short paragraph on what the cloud problem looks like
  *in this domain specifically* — the printer story is not the dashcam story — then
  subcategory jump-links, then the filtered table.
- **Subcategory pages.** Same table, tighter scope. These are the pages that will rank in
  search, because "dashcam no app" is what people actually type. Give each one a
  hand-written sentence; a generated stub is worth nothing to a reader or a crawler.
- **Device page.** `the_unplug_test` paragraph at the very top, above the fold and above
  the spec table. Then specs, then sources **with their evidence class visible**, then the
  changelog. Publishing the evidence class is unusual and it is the credibility moat.
- **`/changed`.** Reverse-chronological feed of tier changes and vendor incidents. This
  becomes the newsletter and it is the reason people return. Build it early even while empty.
- **`/method`.** The ladder, the evidence rules, and a plain statement that research is
  agent-assisted with human review. Volunteering that reads as confidence; this audience
  will work it out regardless.

**Cross-cutting views** — cheap to generate, disproportionately useful:
`/tier/d0` (the purists' list), `/no-account`, `/no-forced-updates`, `/discontinued`.

## Monetization, kept open without compromising

Leave the door open, and build the guardrails now while it costs nothing:

- The schema already has an `affiliate` field, human-filled only, agents forbidden.
- **Never let commercial relationships touch the tier.** Publish that rule on `/method`
  before you have any revenue, so it is a standing commitment rather than a later
  defence.
- Least-corrosive orders: affiliate links (disclosed per-link, not just in a footer) →
  a single sponsor slot with no product placement → a paid alerts newsletter for tier
  changes → a data license for the JSON.
- Keep `data/` under an open license (CC BY-SA) regardless. The catalog's value is trust,
  and giving away the data cheaply purchases exactly that.
