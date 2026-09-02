# Operations — cadence, runtime, and the improvement loop

---

## 1. Runtime, given a $20 Pro plan

The honest tradeoff:

| Option | Cost | Runs when laptop is off | Review gate | Verdict |
|---|---|---|---|---|
| **`/schedule` routines in Claude Code** | included in Pro | no | you add one | **start here** |
| `launchd` + `claude -p` headless | included in Pro | no (unless you wake the Mac) | you add one | equivalent; use if you want shell control |
| GitHub Actions + Claude Code | separate API billing, roughly **$0.20–0.50 per device verified** → ~$10–25/mo at this cadence | yes | PR review, built in | migrate when the catalog earns it |
| Cloud scheduled agents | draws on the same subscription quota | yes | weaker | fine, but least control over the repo |

**Recommendation: run locally under the subscription.** Claude Code's scheduled routines
authenticate as you, so a run costs quota rather than dollars. Pro's quota is measured in
rolling windows with a weekly cap and Sonnet is the workhorse (Opus is restricted on Pro
— check `/status`). That constraint is the reason every run in this design is small,
single-purpose, and hands off through files: **one 20–40 minute Sonnet run per day fits
comfortably; four sprawling ones do not.**

Design consequence, and the important one: **the runtime is a detail, not the
architecture.** Every job is `prompt file + data directory + git commit`. Moving to
GitHub Actions later means adding a workflow YAML and an API key — no prompt rewrite, no
schema change. Do not couple anything to the local machine.

Practical setup:

```
/schedule  →  "Run agents/ORCHESTRATOR.md in ~/Projects/dumbdevices"  daily at 09:00
```

Pick a time you are usually at the machine. Runs commit to a `bot/YYYY-MM-DD` branch;
you review with `git diff main` over coffee and merge. That five-minute human gate is
worth more than any amount of agent self-checking, and it is what keeps a bad prompt
change from quietly poisoning forty records.

---

## 2. Phasing — do not automate first

**Phase 0 — bootstrap (weeks 1–4, human-led).** You and Claude, interactively, seed
30–50 devices across 5 categories. No cron. The purpose is not the catalog; it is to
discover what the procedure actually needs to say. Every time you correct the model,
that correction becomes a rule in `PRINCIPLES.md` or `VERIFIER.md`. **You cannot write a
good agent prompt before you have done the work by hand a few dozen times.**

**Phase 0.5 — golden set.** Hand-verify 20–25 of those records to the standard in §2 of
the principles. Include 5 genuinely ambiguous devices and 3 traps — devices that look D2
and are actually REJECT. This file (`data/eval/golden.json`) is the only thing standing
between you and slow, invisible quality decay. Build it before you turn on the cron.

**Phase 1 — daily automation.** Schedule kicks in.

**Phase 2 — monthly critic**, once you have three months of journals to reason over.

---

## 3. Weekly cadence

One job type per run. Never two.

| Day | Job | Budget |
|---|---|---|
| Mon | `discover` — one rotating domain from `schema/taxonomy.json` | 10 candidates |
| Tue–Thu | `verify` — drain the queue | ≤4 devices/run |
| Fri | `refresh` — oldest shard by `last_verified` | ¼ of catalog |
| Sat | `watch` — vendor and firmware incidents | published devices only |
| 1st of month | `meta` — `agents/CRITIC.md` | 3 rule changes max |

Refresh in weekly quarters means every record is re-checked monthly, and the load per run
stays flat as the catalog grows — until roughly 400 devices, at which point shard into
eighths and accept a two-month cycle rather than lengthening runs.

---

## 4. State and handoff

Three files carry everything between runs. **Assume each run is a different model with
total amnesia** — because within a few months it will be.

- `data/state.json` — `{shard_index, next_domain, domain_rotation_pos, unfinished[], prompt_version, last_run}`
- `data/queue.json` — candidates awaiting verification, with attempt counts
- `data/journal/YYYY-MM-DD-<job>.json` — one per run

Nothing important may live only in a model's context.

---

## 5. Journal entry schema

The journal is not a log for humans. It is the training data for the critic, so it must
record failures at least as carefully as successes.

```json
{
  "run_id": "2026-09-04-verify",
  "job": "verify",
  "prompt_version": "git sha of agents/",
  "model": "claude-sonnet-5",
  "devices": [{"model_id":"...","outcome":"verified|insufficient|rejected|blocked"}],
  "sources_that_worked": [{"domain":"fccid.io","claims_supported":4}],
  "sources_that_failed": [{"domain":"...","fetches":3,"claims_supported":0}],
  "searches_used": 27,
  "wall_clock_min": 34,
  "subagent_failures": [{"device":"...","error":"..."}],
  "surprises": "free text — the field the critic reads first"
}
```

---

## 6. How the system gets better over time

Five mechanisms. Together they are the difference between a scraper that decays and a
project that compounds.

**1. The golden set is a regression test.** Every prompt change is scored against
`data/eval/golden.json` before merge: tier accuracy, citation validity, hallucination
rate. A change that does not improve the score is not merged. This is the single most
important mechanism here — without it "improvement" is vibes, and prompt quality drifts
downward invisibly because nothing ever fails loudly.

**2. Prompts are versioned code.** `agents/*.md` in git; every record stamps
`agent_meta.prompt_version`. When quality drops you can bisect prompt history the same
way you bisect a bug, and you can tell which records were produced under which rules.

**3. Source yield drives search order.** The critic computes claims-supported per source
from the journals and rewrites SCOUT's search order. High-yield sources move up and get
named explicitly; zero-yield sources get dropped. This is how cost per verified record
falls over time, and cost is your binding constraint on Pro.

**4. Failure taxonomy becomes rules.** Every rejected or reverted record is classified
(evidence-too-weak / table-misapplied / source-misread / stale / schema-abuse). When a
class recurs three times, it earns an explicit rule. **This is the actual mechanism by
which the prompt gets smart** — not by being rewritten more eloquently, but by
accumulating scar tissue from specific real failures.

**5. The ratchet.** The evidence bar in §2 of the principles only ever goes up. If
throughput is disappointing, the answer is more runs or narrower scope — never a lower
bar. Write this down because in month four you will be tempted, and the temptation will
feel like pragmatism.

### Metrics worth a dashboard page

- tier accuracy on the golden set (target ≥ 95%)
- citation validity: sample 10 published sources/month, does the URL load and support the
  claim? (target 100%; anything less is an emergency, not a metric)
- stall rate: `insufficient_evidence` as % of attempts (expect 25–40%; healthy, not a bug)
- tokens per verified record (should fall)
- alert precision: of "this device got worse" alerts, how many were real? (target 100% —
  one false alarm costs more trust than ten missed ones)

Plot these monthly. If accuracy is flat and cost is falling, the system is working. If
throughput is rising while accuracy is flat, you are about to have a bad time.

---

## 7. Failure modes to watch for

- **Confident drift.** The model gets fluent at producing well-formed records that are
  subtly wrong. Only the golden set catches this. Re-run it monthly even when nothing
  changed.
- **Category monoculture.** Discovery keeps finding lamps because lamps are easy. Force
  category rotation in `state.json`; do not let the agent choose.
- **Source capture.** One forum becomes 80% of citations. The yield table will show it;
  cap any single domain at 40% of Class B evidence.
- **Silent staleness.** A record with `last_verified` six months old rendering as current
  fact. Make the site render the age of every claim visibly (§ BRAND.md) so decay is
  embarrassing rather than invisible.
- **Scope creep into reviews.** The moment entries start saying which device is *better*,
  the project needs a different evidence standard than it has. Keep to the connectivity
  question.
