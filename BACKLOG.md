# Backlog

Deliberately deferred, with the reason. Not a wishlist — things we decided to do later
and want to be held to.

## Launch gate

Agreed 2026-09-02. The repo going public and the site launching are **separate events with
different bars**, and conflating them delays the cheap one for the sake of the expensive one.

**Repo public: now.** Unannounced. Nobody finds a GitHub URL by accident, so there is no
first impression to spend. What it buys immediately is free CI on public repos — the
validator and golden gate on every change, which does not currently run anywhere.

**Launch (announcing it) waits for all of:**

| Gate | Now | Target |
|---|---|---|
| No domain below 5 records | 8 of 14 below | 14 of 14 at 5+ |
| High-traffic domains (kitchen, av, security, computing, climate) | 1-3 each | 10-15 each |
| Total records | 21 | 120-150 |
| `/downgrades` demonstrates the thesis | historical section only | at least one observed entry |

Density per domain matters more than the total, because that is how people arrive: someone
asking "is there a dumb dishwasher" who finds an empty subcategory concludes the site is
abandoned, regardless of how good the rest of it is.

Sequencing is what `OPERATIONS.md` already prescribes: finish Phase 0 by hand at 30-50
records — enough to prove the procedure across more domain shapes — then turn on the
automation and let it carry the catalogue to launch density.

## Deferred

**RSS / Atom feed for `/updates`, and `sitemap.xml`.**
Deferred 2026-09-02. The reasoning: feeds and sitemaps are retention and discovery
mechanisms, and there is no point optimising either until the site is worth returning to
and worth finding. Revisit once the catalog is broad enough that `/updates` has something
to say weekly, and `/downgrades` has at least one real entry. Both are roughly an hour's
work. The `/updates` page was named with a feed in mind, so nothing needs restructuring
when we come back — this is purely sequencing.

**A doorbell-form-factor camera with local recording.**
The Ring rejection currently points at a Reolink PoE camera, which answers the real
question but is not a like-for-like swap. Find and verify an actual doorbell that records
to ONVIF/RTSP or onboard storage.

**SONOFF BASICR4.**
The BASICR2 record resolved to D3 and discontinued. The R4 is the model a reader can buy,
and its DIY-mode support may place it at D2 — worth its own record.

**A replacement hold-trap for the golden set.**
`data/eval/golden.json` lost its only `insufficient_evidence` trap when research resolved
the SONOFF question. That discipline is the most valuable thing the traps protect. The
next genuine hold encountered in a run must be added as a trap case.

**Family records for Whirlpool, LG and Samsung ranges.**
The GE family record works because GE publishes its own "does my appliance have WiFi"
check. The others name connectivity differently (SmartThings, ThinQ) and need their own
identification procedures.

**Weight future runs toward D2 and D3.**
The catalog is 11 D0 and skews toward devices where the answer was never in doubt. The
purchases people actually agonise over are the nuanced ones. This is a research-priority
note, not a feature.

## Open questions for the project, not the catalog

**Open-sourcing the repo.** Discussed 2026-09-02; see the notes in that conversation.
Decision pending.
