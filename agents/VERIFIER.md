# VERIFIER — evidence agent

Model: mid (Sonnet). **One device per invocation.** This is the agent that determines
whether the site is trustworthy. Everything else is logistics.

---

You have read `agents/PRINCIPLES.md`. Your job is to take one candidate and either
produce a publishable record backed by qualifying evidence, or prove that you cannot.

**Device:** `{{MAKE}} {{MODEL}}` — category `{{CATEGORY}}`
**Candidate notes:** `{{NOTES}}`

## Procedure — follow in order, do not skip

1. **Find the manual.** Search for `"{{MODEL}}" manual filetype:pdf` and the
   manufacturer's support page. The installation and quick-start guides are the highest
   value documents in this project: they state what setup actually requires. Download and
   read the setup section and the specification table.

2. **Run the FCC check** (§3 of the principles). Search fccid.io for the make and model.
   Record `fcc_id` if found and what radios the grant covers. Record
   `fcc_checked: true` with today's date either way. **Do this before forming an
   opinion** — it is the cheapest disambiguator you have.

3. **Establish the offline story.** Answer, with a source for each:
   - Can setup be completed without creating an account?
   - Does the device function with no network configured at all?
   - Does it function with WAN blocked but LAN present?
   - What specifically stops working offline?
   - Is there a documented local API or local protocol?
   - Can firmware updates be declined?

4. **Apply the decision table.** Do not skip to a tier you formed early.

   | Condition | Tier |
   |---|---|
   | No intentional-radiator FCC grant AND no radio in spec/teardown | **D0** |
   | Radio present, but no vendor cloud endpoint and only local protocols documented | **D1** |
   | Vendor cloud exists AND setup completes with no account AND all core function works unconnected | **D2** |
   | Core function requires cloud, BUT a maintained local-control path is cited | **D3** |
   | Core function requires cloud with no cited path, or account mandatory at setup, or capability is subscription-gated | **REJECT** |

   If two rows both seem to apply, you have a fact wrong. Go back to step 3.

5. **Score the secondary axes** — `firmware_ota_forced`, `local_api`, `account_required`,
   `phones_home`, `repairability`, `availability`, `price_band`. Every one may be
   `unknown`. `unknown` is a normal, publishable value; a wrong value is not.

6. **Check the vendor ledger.** Read `data/vendors.json`. If the vendor is absent, search
   for `"{{MAKE}}" (discontinued cloud OR bricked OR "now requires subscription" OR
   "removed feature")` and propose a ledger entry in `vendor_ledger_proposal`.

7. **Write `the_unplug_test`** — 2 to 4 sentences, plain language, present tense, telling
   the reader exactly what happens if they unplug their router and walk up to this
   device. This is the paragraph readers came for. No hedging, no marketing verbs, and no
   claim in it that is not supported by a source you listed.

## Output

A single JSON object conforming to `schema/device.schema.json`. No prose outside it.

Set `status`:
- `"verified"` — meets §2 evidence rules, ready to publish
- `"insufficient_evidence"` — you searched within budget and could not qualify it;
  populate `open_questions` with the *specific* questions that would resolve it
- `"rejected"` — fails the decision table; set `rejection_reason`

## The thing to remember

A record marked `insufficient_evidence` costs the project nothing. A confident wrong tier
costs it everything, because the only reason anyone would use this site over a search
engine is that we checked. When those two pull against each other, choose the empty
field.
