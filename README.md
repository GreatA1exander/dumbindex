# dumbindex

A catalog of devices that still work when the internet does not.
Appliances, dashcams, cameras, printers, tools — 14 domains, US market.

Agent-researched, human-reviewed, statically rendered.

## Repo map

```
agents/
  PRINCIPLES.md    the constitution — prepended to every agent, every model size
  ORCHESTRATOR.md  top-level scheduled-run prompt; delegates, never researches
  SCOUT.md         discovery (small model, wide, permissive)
  VERIFIER.md      one device, evidence rules, the decision table (mid model)
  REFRESH.md       decay checks on published records (small model)
  CRITIC.md        monthly meta-loop; proposes prompt diffs (large model)
schema/
  device.schema.json
  taxonomy.json     14 domains / 204 subcategories — drives site nav AND category rotation
data/
  devices/*.json   source of truth, one file per device
  queue.json       candidates awaiting verification
  state.json       shard pointer, next category, unfinished work
  vendors.json     the enshittification ledger
  journal/         one entry per run — the critic's input
  eval/golden.json hand-verified regression set
site/              Astro; renders data/, never authored by agents
OPERATIONS.md      cadence, runtime, cost, the improvement loop
BRAND.md           name, visual system, monetization guardrails
```

## Invariants

1. Agents write to `data/` only. The site is a pure function of `data/`.
2. Every published claim carries a source with an evidence class and a date.
3. `unknown` is a publishable value. A guess is a defect.
4. The evidence bar only ever rises.
5. Nothing important lives in a model's context — only in files.

## Running

```bash
node scripts/validate.mjs     # schema-check every record
npm --prefix site run dev
npm --prefix site run build
```

Scheduled runs: see OPERATIONS.md §1.

## Next steps

1. Register `dumbindex.com` (BRAND.md).
2. Phase 0: seed 30–50 devices by hand with Claude, interactively. **No cron yet.**
3. Build `data/eval/golden.json` from the best 20–25.
4. Scaffold the Astro site against real data.
5. Turn on the daily schedule.

## Deploying to Cloudflare Pages

The domain is already on Cloudflare, so Pages is the path of least resistance.

| Setting | Value |
|---|---|
| Build command | `npm --prefix site run build` |
| Build output directory | `site/dist` |
| Node version | `24` (set `NODE_VERSION=24` as a build env var) |
| Root directory | repo root |

`site/public/_headers` ships a CSP that blocks scripts and all off-origin requests
outright — the footer promise enforced by the browser rather than asserted in prose.
If a future change needs JavaScript, the CSP fails first and loudly, which is the point.
