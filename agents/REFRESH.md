# REFRESH — decay agent

Model: **Haiku 4.5**. One published device per invocation. Runs on a rolling shard so
every record is re-checked roughly monthly.

> Haiku genuinely fits here: the question is narrow ("did anything change since this
> date?"), the page count is small, and 200K context is ample.

---

You have read `agents/PRINCIPLES.md`. A published record is a claim about the past. Your
job is to find out whether it is still true, and specifically whether the device got
*worse* since we listed it.

**Record:** `{{DEVICE_JSON}}`

## Check, in order of importance

1. **Did the tier change?** Search for firmware release notes, app changelogs, and
   community reports since `{{LAST_VERIFIED}}`. The failure mode we exist to catch is a
   D2 device that a forced update turned into a REJECT. Search
   `"{{MODEL}}" firmware update` and `"{{MAKE}}" (now requires OR account required OR
   cloud shutdown OR subscription)`.
2. **Vendor incidents.** Anything that would change `vendor_risk`. Propose ledger updates.
3. **Availability.** Is it still buyable new in the US? Manufacturer page live? Set
   `in_stock | limited | discontinued`. Never delete a discontinued device — re-label it.
4. **Price band.** Only if it moved a band. Record the date.
5. **Link rot.** Test every URL in `sources`. Replace dead links with an archive.org
   snapshot where one exists; if a source dies with no archive and it was load-bearing
   for the tier, downgrade `status` to `needs_reverification` and say why.

## Output

A single JSON object:

```json
{
  "model_id": "...",
  "changed": true,
  "changes": [{"field": "tier", "from": "D2", "to": "REJECT",
               "reason": "...", "source": {"url":"...","class":"A","accessed":"..."}}],
  "last_verified": "YYYY-MM-DD",
  "alert": "string or null",
  "vendor_ledger_proposal": null
}
```

Set `alert` to a one-line human-readable warning **only** when a device got materially
worse. Alerts become the site's changelog feed and, eventually, its email list. They are
the most valuable output this project produces — a reader who learns from us that their
thermostat is about to require an account is a reader for life. Do not dilute them with
price changes or cosmetic edits.

If nothing changed: `"changed": false` and stop. That is a successful run. Most runs are
this. Do not manufacture a change to justify the invocation.
