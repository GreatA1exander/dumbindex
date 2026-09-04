# Working on dumbindex

Orientation for a Claude session picking this up cold. [README.md](README.md) says what the
project is; [OPERATIONS.md](OPERATIONS.md) says how the cadence works. This file is the
part that otherwise lives only in someone's head.

## Start here

```bash
cat data/state.json          # what the last run left, and what is unfinished
ls -t data/journal | head -3 # the last three runs, including what went wrong
node scripts/validate.mjs    # should be N records, 0 errors, 0 warnings
```

`state.json.unfinished` is the to-do list, ordered roughly by value. It is written to be
read by someone with no memory of the previous session, because that is usually what
happens.

## Environment

**Node lives at `~/.local/opt/node` (24.20.0 LTS), symlinked into `~/.local/bin`.** Not
Homebrew. Homebrew dropped Intel x86_64 support and silently *dry-runs* installs on this
machine — `brew install node` prints plausible output and installs nothing. If `node` is
missing from PATH, fix PATH; do not reach for brew.

`npm ci` in `site/` needs esbuild's postinstall, which npm 11 gates. The approval lives in
`site/package.json` under `allowScripts`, which is tracked, so CI inherits it. If a build
fails with a missing esbuild binary, that is what broke.

## The gates

All five must pass before anything is committed. CI runs the first four on every push.

```bash
node scripts/validate.mjs      # schema, enums, evidence bar, cross-field consistency
node scripts/score-golden.mjs  # 19 hand-verified cases; fails if a trap regresses or <90%
(cd site && npm run build)
node scripts/pageweight.mjs    # <60KB/page, no <script>, no third-party assets
node scripts/check-links.mjs   # slow (~3 min); weekly in CI, not on every push
node scripts/archive-sources.mjs  # fills archive_url from Wayback for sources that 404
```

**Never edit a script to make a record pass.** The validator is the only thing standing
between this catalog and plausible-sounding nonsense. If it is wrong, fix it deliberately
and say so in the commit; if a record is wrong, fix the record.

## Running a discovery wave

Waves are the main activity. What has been learned the hard way:

- **Three agents, not six.** Six exhausts the session and they all die together.
- **Tell agents to write each record to disk as it is finished.** Waves get killed
  mid-run routinely. The wave whose agents batched their writes lost everything; the ones
  that wrote as they went kept most of it. This single instruction has saved two waves.
- **Quota by tier, not by record count** — see `agents/SCOUT.md`. Five records of which
  at least three are D1/D2/D3. Returning fewer is explicitly allowed and encouraged.
- **Seed each brief with a ranked candidate list.** This produced the best runs. Discovery
  is biased toward easy records; contested devices can be named in advance by whoever
  holds the whole catalog, and verifying is what agents are good at.
- **Ask for pairs.** The best output this project has produced is two records, not one:
  a device that passes and one that fails at the same job and price, cross-referenced.
- Give each brief the tier error most likely *in that domain*.

**WebSearch has a per-session budget (200) shared with every subagent.** Three agents
exhaust it. When it runs out, agents start improvising — one cited a search-results page
routed through a text proxy as a source. Expect degradation, and prefer seeded lists.

## Reviewing agent output — do not skip this

Agents are good and still wrong in specific, repeating ways. Every wave so far has
contained at least one real error, and every one was found by review rather than by the
validator. Run `git status` first: nothing outside `data/devices/` should have changed.

Then look for these, in order of how often they have actually occurred:

1. **A claim the record's own `open_questions` undercuts.** The single most common defect.
   A record asserts a tier while conceding the deciding fact is unconfirmed. Scan the
   open questions and ask: does this hedge the thing the tier rests on, or just the price?
2. **Upward tier drift.** The tier quota gives agents a reason to call things more
   contested than they are. A radio-free bench supply was filed D1 on defensible-sounding
   reasoning. Now checked by the validator, but the incentive remains.
3. **A verdict carrying more than its sources.** Rejections are the dangerous case. Two
   sources that contradict each other on the deciding fact; inference from silence
   ("support did not correct the reviewer"); a vendor not advertising a capability treated
   as documentation it is absent.
4. **Citation quality.** Search queries or proxied pages as sources (now validated
   against). A specific FCC grant ID named while the URL points at a search page.
   The same URL cited twice as two sources.
5. **Fields contradicting the tier.** A local device password filed as a vendor account;
   `radios` disagreeing with the tier.
6. **Enum gaps.** Agents flag these honestly rather than fudging — four times so far
   (`dect`, `proprietary_24ghz`/`rfid_lf`, `two_way_radio`, `ant_plus`). When one is
   flagged, extend the schema and backfill; do not leave `unknown` standing.

When an error is found, fix the record **and** the thing that let it through — a
PRINCIPLES rule, a VERIFIER guard, or a validator check. Then verify the check bites by
reinstating the error and watching it fail. Every commit here does this.

## Invariants

- **`vendor_risk > 0` requires a matching entry in `data/vendors.json`.** Scores never
  come from reputation. Enforced.
- **Vendor conduct is not a tier input.** It goes to `vendor_risk`. A printer that prints
  over USB with no account is D0 no matter what its maker has done elsewhere.
- **Tier describes the device; `local_replacement` describes what an owner can achieve.**
  Never let the second influence the first.
- **D3 requires a cited, maintained `liberation.guide_url`** for that exact model.
- **`unknown` is publishable. A wrong value is not.** This applies to `price_band`
  especially — a missing price has never made a record wrong, and two records have been
  lost to search budget spent confirming prices.
- Never delete a published record. Set `availability: "discontinued"`.

## After a wave

Journal it (schema in `OPERATIONS.md` §5), including what went wrong — the journals are
written to be useful to someone diagnosing a problem, not to look good. Then update
`data/state.json` so the next session can start cold. Commit messages here are long and
explain *why*, because the git log is the project's reasoning record.

## Working with the repo owner

Bring decisions that change what the work is *for* — the tier quota was proposed with a
recommendation and adopted, rather than applied unilaterally. Routine judgement calls
inside a wave do not need asking. Report what actually happened, including the failures;
several of the most useful findings here have been things that did not work.
