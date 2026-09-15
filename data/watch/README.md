# Watch runs

One file per `watch` run, dated. The `watch` job asks a single question of every vendor
behind a published record: **has a device we already listed lost function, gained an
account requirement, or had a capability moved behind a subscription since we verified
it?**

These files are proposals, not decisions. A watch run may not edit `data/vendors.json`
or any device record — it writes its findings here and the orchestrator scores them.
That separation is deliberate: the ledger is the most consequential thing on the site
and the agent that found an incident is the worst-placed to judge how hard it lands.

`nothing_found_for` is a result, not an omission. A watch run that finds nothing is the
outcome the catalog wants most, and recording which vendors were checked and came back
clean is what makes the next run cheaper.

**Run `watch` on its own, not inside a discovery wave.** `OPERATIONS.md` §3 already says
one job type per run; the 2026-09-14 run is why. Sharing a session with two discovery
agents left it 2 of the session's 200 web searches, enough to source two ledger
candidates and not enough to sweep the catalog — Grizzl-E, Withings and most of the
vendor list went unchecked.
