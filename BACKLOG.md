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

| Gate | 2026-09-04 | Target |
|---|---|---|
| No domain below 5 records | 2 of 14 below (health 6, photo 5) | 14 of 14 at 5+ |
| High-traffic domains (kitchen, av, security, computing, climate) | 8, 9, 7, 10, 7 | 10-15 each |
| Total published records | 105 | 120-150 |
| Domains at 8+ | 8 of 14 | 14 of 14 |
| `/downgrades` demonstrates the thesis | historical section only | at least one observed entry |

Six domains remain short of 8: photo 3, baby-pet 3, health 2, climate 1, security 1,
tools 1. Four of those are one or two records from target.

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

**Weight future runs toward D2 and D3.** *(Fixed, and holding — keep watching.)*
Published tiers 2026-09-04: **71 D0, 10 D1, 23 D2, 1 D3.** Three waves ago it was 63 D0
against 20 above it, and worsening every wave.

**Fix adopted 2026-09-03** and written into `agents/SCOUT.md` under "Your quota is by
tier, not by record count": a run is measured on how many D1/D2/D3 records it produces,
not how many records; a D0 in an already-covered subcategory is worth close to nothing; a
D0 in an EMPTY subcategory still earns its place; searches are spent on facts that decide
a tier, never on price. Wave 5 ran 6 of 8 above D0, wave 6 ran 10 of 15.

The thing to watch now is the opposite failure. The quota gives agents a reason to
classify upward, and wave 6 produced the first instance — a radio-free bench supply filed
D1 on defensible-sounding reasoning. `validate.mjs` now fails any D1 without a radio, but
the incentive is still there and only that one shape of it is checked.


**Fix adopted 2026-09-03** and written into `agents/SCOUT.md` under "Your quota is by
tier, not by record count": a run is measured on how many D1/D2/D3 records it produces,
not how many records; a D0 in an already-covered subcategory is worth close to nothing;
searches are spent on facts that decide a tier, never on price. Watch whether the ratio
actually moves — the previous note said this was a research-priority item and it drifted
for four waves without anyone acting on it.

**A single D0 record is still worth writing when its subcategory is empty**, because
someone searching "dumb light bulb" needs to find one. The problem is the fiftieth, not
the first.

**APC / Schneider Electric: ledger candidate, evidence not checkable.**
The lighting run found that when an APC SmartConnect plan lapses the UPS drops to "Basic
Monitoring" and loses event notifications, remote diagnostics and remote firmware
upgrades — features that worked at purchase. That is exactly the pattern the ledger
tracks. It is not in the ledger, because the only source for it
(smartconnect-support.apc.com) does not resolve from here and has no Wayback snapshot,
and an incident a reader cannot check is not one we can publish. Re-source it, then score
it. The agent that found it correctly escalated rather than scoring the vendor itself.

**Two records left unwritten for want of purchasability evidence, not technical evidence.**
Both have their tier evidence already in hand and only need a price band and a current
retail listing:
- A GRI 100/110-series wired door contact. Class A datasheet confirms a passive two-wire
  reed switch with no electronics at all — about as clean a D0 as exists — but GRI sells
  through trade distributors rather than consumer retail.
- A non-smart LED bulb. The obvious record that "dumb light bulb" searchers want, blocked
  because Feit, GE, Sylvania and Signify all serve JS-rendered pages that WebFetch cannot
  read and the search budget was exhausted.

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
