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

**The menu has two rows, and they answer two different questions.** The first row is the
14 domains — "what kind of thing am I shopping for", which is why nearly everyone is
here, and it gets full ink weight. The second is a lighter row of cross-sections of the
same catalog: all devices, updates, downgrades, rejected, vendors, self-hostable. Pages
that explain the *site* rather than help you use it — Method, How to check, Corrections —
are not in the header at all; they live in the footer of every page. They are the most
important pages for trusting the catalog and among the least important for using it, and
putting them at the same level as "Kitchen & Cooking" said the opposite.

**Three levels of catalog, and no more** (plus the flat index at `/devices/`):

```
/                      what this is — the ladder explained, then browse by type
/devices/              the index — every device, one dense table
/automotive/           domain page — intro, then a table per subcategory
/automotive/dashcam/   subcategory page — the deepest useful page
/device/viofo-a129/    the device record
```

- **Home.** *Amended 2026-09-04.* This used to be the full device table, on the reasoning
  that a reader should be able to scan forty rows immediately. That stopped working
  somewhere past sixty records: the page became a wall, it said nothing about what the
  site was for, and it was the page closest to the 60 KB budget. Home is now an
  explanation — what is in the catalog, the four tiers with a line each, then browse by
  type — and the flat table moved to `/devices/`, linked from the nav and from home. The
  rule that survives unchanged is **no cards, no grid, no hero, nothing decorative**: the
  homepage is prose and tables, and the tier ladder is a definition list, not a card deck.
- **`/devices/`.** The index that home used to be: make, model, type, tier, account,
  forced OTA, price, verified. One row per record, no decoration.
- **Domain pages** (14 of them). A short paragraph on what the cloud problem looks like
  *in this domain specifically* — the printer story is not the dashcam story — then one
  table **per subcategory**, in sections with in-page jump links. The domain page is the
  "show me everything here" view; grouping is what keeps that from reading as an
  undifferentiated run of rows. Every stacked table shares one fixed column grid, so the
  columns line up down the whole page — sizing each table to its own contents makes the
  page look ragged, which is a real defect and not a small one.
- **Subcategory pages.** Same table, tighter scope. These are the pages that will rank in
  search, because "dashcam no app" is what people actually type. Give each one a
  hand-written sentence; a generated stub is worth nothing to a reader or a crawler.
- **Device page.** `the_unplug_test` paragraph at the very top, above the fold and above
  the spec table. Then specs, then sources **with their evidence class visible**, then the
  changelog. Publishing the evidence class is unusual and it is the credibility moat.
- **`/updates`.** The full reverse-chronological feed — new listings, tier changes,
  vendor incidents, corrections. This is the subscribable thing.
- **`/downgrades`.** A filtered view of the same timeline showing only devices that got
  *worse after purchase*. This is the newsletter and the reason people return, and it is
  deliberately narrow: a feed that cries wolf about its own housekeeping teaches readers
  to skip it, and then the one alert that matters gets skipped too. One source of truth,
  two views — the downgrade page is a filter, never a second list to maintain.
- **`/self-hostable`.** Devices at D2 whose cloud can be fully replaced by software you
  run. The tier deliberately excludes "you could firewall it", because that describes the
  reader's network rather than the product — this page is where that difference lives.
- **`/method`.** The ladder, the evidence rules, and a plain statement that research is
  agent-assisted with human review. Volunteering that reads as confidence; this audience
  will work it out regardless.

- **`/rejected`.** Popular devices that did not qualify, with the reason and the sources,
  each pointing at an alternative. Listed rather than omitted because people search these
  by name, and finding nothing looks identical to not having checked.

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
