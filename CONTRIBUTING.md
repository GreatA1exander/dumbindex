# Contributing

The short version: **issues are open, `data/` pull requests are not yet, code pull
requests are welcome.**

## Why data PRs are closed for now

Not because contributions are unwelcome — because the review policy that makes them safe
isn't finished. Two specific risks:

- A manufacturer submitting a PR that softens a rejection or nudges a tier.
- A poorly-sourced incident added to the vendor ledger, which is the part of this project
  with real consequences for named companies.

The guardrails already exist as code — `scripts/validate.mjs` enforces the evidence bar
and `scripts/score-golden.mjs` blocks trap regressions, both on every PR — so opening
`data/` is a matter of writing down the review policy, not of building machinery. It will
open. In the meantime an issue gets your finding into the catalogue just as reliably, and
costs you less work.

## What is most useful

**A device that got worse.** Top of the list, by a distance. A firmware update that added
an account requirement, a server shutdown, a feature moved behind a subscription. We are
slowest to notice these on our own and they are the reason the project exists — file them
whether or not we list the device.

**A boring device.** A mechanical timer nobody reviews is worth more here than another
widely-covered gadget. Commercial and contractor-grade equipment especially: a business
will not tolerate hardware that stops working when a vendor's server does, and that
requirement keeps local controls in production long after the consumer line drops them.

**A correction.** Including "your source doesn't say that." A claim whose evidence does
not hold up comes down even when we still believe the conclusion.

**Code.** The site, the scripts, the schema. Ordinary PRs, CI must pass.

## The bar a record has to clear

Worth knowing even for an issue, because it is what we will go and do with your report.

Every claim carries a source, an evidence class and the date we read it:

| Class | What it is |
|---|---|
| **A** Primary | Manufacturer manual or spec sheet, FCC filings, firmware release notes, photographed teardowns |
| **B** Corroborated | Home Assistant / ESPHome device databases, Zigbee2MQTT and Z-Wave JS indexes, iFixit, detailed first-hand reports |
| **C** Weak | Vendor marketing, retailer bullet points, undated forum comments — never sufficient alone |

A tier needs **one Class A source, or two independent Class B sources**. Two sources are
only independent if they are not quoting each other and not both derived from the vendor's
own copy: five retailers repeating one spec sheet is one source.

Where the bar cannot be met, the field reads `unknown` and the record may be held
entirely. **An empty field is a correct answer; a guess is a defect.** The full method is
at [/how-to-check](https://dumbindex.com/how-to-check/).

## Rules that do not bend

- **The evidence bar only ever rises.** If throughput disappoints, the answer is more runs
  or narrower scope — never a lower bar.
- **Tier describes the device; `vendor_risk` describes the vendor.** A company behaving
  badly does not change what the hardware does when your router is off. Both facts get
  published, separately.
- **Vendor ledger entries always get human review.** Passing CI is not sufficient there.
- **No commercial relationship affects a tier.** There are none today. The rule stands
  regardless, and it is written here before there is any revenue to tempt us.
- **We do not remove a rejection because a manufacturer asks.** The fix is the same for
  everyone: show us what the device does.

## Running the gates locally

```bash
npm --prefix site ci
npm --prefix site run check     # validate + golden gate + build + page weight
node scripts/check-links.mjs    # slow; runs weekly in CI
```

`npm run check` is exactly what CI runs. If it passes locally it will pass there.

## A note on how this is made

Research is agent-assisted and human-reviewed, and the prompts driving it are in
[`agents/`](agents/) rather than hidden. That is deliberate: a site whose entire claim is
"check us" has no business being opaque about its own method. If you think a prompt
encodes a bad rule, that is a legitimate and welcome pull request — arguably the highest-
leverage one available, since every future record passes through it.
