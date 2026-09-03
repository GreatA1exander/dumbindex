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

| Gate | 2026-09-03 | Target |
|---|---|---|
| No domain below 5 records | 8 of 14 below | 14 of 14 at 5+ |
| High-traffic domains (kitchen, av, security, computing, climate) | 2, 9, 2, 10, 7 | 10-15 each |
| Total published records | 66 | 120-150 |
| `/downgrades` demonstrates the thesis | historical section only | at least one observed entry |

**Repo public: done** (2026-09-02). MIT for code, CC BY-SA 4.0 for data, CI running the
validator, golden gate, build and page-weight check on every push, plus a weekly link
check. The launch gate below is what remains.

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

**Weight future runs toward D2 and D3.** *(Getting worse, not better.)*
Published tiers as of 2026-09-03: **49 D0, 5 D1, 11 D2, 1 D3**. Three quarters of the
catalog is now devices where the answer was never in doubt — and the ratio has moved the
wrong way as the catalog has grown, because D0 records are the cheapest to research and
agents given a per-domain quota naturally find them first.

That is a problem worth naming plainly. Nobody agonises over whether a keyed padlock
phones home. The purchases people actually struggle with are the contested ones: the
camera that works locally but only if you never open the app, the thermostat that is fine
until a firmware update, the appliance sold in two configurations under one model number.
Those are D2 and D3, they are where the ladder earns its keep, and there are twelve of
them.

Two candidate fixes, neither tried yet:
- Give agents a tier quota rather than a record quota — "six records, at least three
  above D0" — and let them return fewer records rather than pad with easy ones.
- Treat D0 records in already-covered subcategories as having near-zero marginal value.
  The fifth mechanical timer teaches a reader nothing the first four did not.

**A single D0 record is still worth writing when its subcategory is empty**, because
someone searching "dumb light bulb" needs to find one. The problem is the fiftieth, not
the first.

**QNAP needs a ledger decision.**
qnap-ts-233-us is published at vendor_risk 0. QNAP has a history of NAS-targeting
ransomware and of force-pushing firmware to shipped devices in response to it. Whether a
forced security patch counts as "removing function from devices already sold" under the
ledger scale is a genuine question the scale does not answer, and the answer will apply
to more vendors than QNAP. Decide the principle, then score.

## Open questions for the project, not the catalog

**Open-sourcing the repo.** Resolved 2026-09-02: public, unannounced, dual-licensed.
Issues open, `data/` PRs closed until a review policy exists, code PRs welcome. See
CONTRIBUTING.md.

**Agent waves keep dying to session limits.** Waves 2 and 3 were both killed mid-run.
Wave 2's output was recoverable because agents had written records to disk before dying;
wave 3 lost five agents entirely because they researched everything before writing.
Briefs now say to write each record as it is finished rather than batching at the end,
which converts a total loss into a partial one. The underlying sizing question — how many
agents a wave can afford — is still open and currently answered by guessing.
