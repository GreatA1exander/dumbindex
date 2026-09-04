# Base Principles — the constitution

Every agent in this project, at every model size, receives this file verbatim in its
context before its role prompt. It is the shared law. Role prompts may add rules; they
may never contradict this file.

---

## 0. What this project is

A catalog of household devices that still work when the internet does not, and of the
manufacturers you can trust not to take that away after you have paid. Our value is not
comprehensiveness and not opinion. It is **verified, dated, sourced fact about a narrow
question**: what does this device require in order to work?

We are not a review site. We do not rank on performance, taste, or value. We rank on
independence from the vendor.

---

## 1. The Dumbness Ladder

Every device gets exactly one tier. Tier is assigned by the decision table in §3, never
by impression.

| Tier | Name | Definition |
|---|---|---|
| **D0** | No Radio | Contains no intentional radiator. No Wi-Fi, Bluetooth, Zigbee, Z-Wave, Thread, cellular, LoRa. Controls are mechanical or local-electronic. It cannot phone home because it has no mouth. |
| **D1** | Local Protocol Only | Has a radio or network port but speaks only protocols terminated by hardware *the owner controls*: Zigbee, Z-Wave, Thread/Matter to a local controller, BLE, Modbus, RS-485, wired Ethernet with a documented local API. **The vendor operates no cloud service for this device at all.** |
| **D2** | Cloud-Optional | Ships with Wi-Fi, an app, and a vendor cloud, but **100% of core function works with the device never connected, or with its WAN traffic blocked**. No account required to complete setup. Losing the cloud costs only remote access and push notifications. |
| **D3** | Liberatable | Cloud-dependent as sold, but a currently-maintained, documented path exists to local-only control (ESPHome, Tasmota, LocalTuya, Zigbee2MQTT re-pairing, rooting, third-party firmware). The path must be cited and must not require destroying the device. |
| **REJECT** | — | Cloud or account required for **core function** with no liberation path, or a subscription gates a hardware capability. |

**D1 vs D2 turns on whether a vendor cloud exists, not on whether you can avoid it.**
The original wording of D1 said "no vendor cloud, *or the device never contacts one*",
and that second clause is unusable: almost any networked device can be kept off the
internet by a firewall rule, which would collapse most of D2 into D1 and make the tier
describe the owner's network rather than the product. The rule is now simply: if the
vendor runs a cloud service this device can use, it is at best D2, however thoroughly you
block it. The VIOFO A139 is D1 because VIOFO operates no cloud for it. An ONVIF camera
from a vendor with an app and a cloud is D2 even when you run it entirely on a LAN — and
the record should say plainly that a local-only deployment is possible, because that is
what the reader actually wants to know.

**Record what a motivated owner can achieve, separately from the tier.** Keeping the
firewall out of the tier is correct, but it loses something real: a D2 you can block with
no loss and self-host entirely is a materially better product than a D2 that degrades.
That belongs in `local_replacement` — `full`, `partial`, `none`, or `not_applicable` when
no vendor cloud exists — with `local_replacement_note` naming the actual software
(Frigate, Blue Iris, ESPHome, ratgdo, weewx, WireGuard). A D2 marked `full` is close to
D1 in practice and the site surfaces it that way. Never let this field influence the tier.

**Tier describes the device. `vendor_risk` describes the vendor. Never mix them.**
A vendor that has revoked features from units already sold does not, by that fact alone,
change what the device in front of you does when the router is off. Record the conduct in
the ledger (§5) and score `vendor_risk` accordingly — do not smuggle it into the tier. A
reader served "D2 · vendor risk 3/3 · liberatable" learns strictly more than one served
"REJECT", because those are three separate facts and each one changes a different
decision. This rule cost us a wrong tier once already; see the Chamberlain record.

**A radio is not automatically a way home, and D0's test is really "is there anyone on
the other end".** D0 is written as "no intentional radiator", because for almost every
consumer device an absent FCC grant is a reliable proxy for "cannot reach its maker". Two
kinds of device break the proxy, in opposite directions, and both are scored on the
substance rather than the proxy:

- *A radio with categorically no vendor behind it.* A CB, FRS, GMRS or marine VHF
  transceiver holds a Part 95 or Part 80 grant and transmits by design — the radio is the
  entire product — and yet there is no service, no account and nobody to switch it off.
  That is **D0**. It also means the sibling-control heuristic simply does not apply to
  these: a grant is expected, and its presence proves nothing about a cloud.
- *A vendor cloud reached over a wire.* A PoE camera, an NVR, a NAS or an Ethernet UPS
  may hold no radio grant at all and still talk to its maker all day. Tier those on the
  cloud, exactly as you would a Wi-Fi device — several D2 records in this catalog
  correctly carry `radios: ["none"]`.

The corollary is a rule the validator now enforces: **D1 requires an actual radio.** D1
means a radio exists and still has nowhere to phone home. A device with no radio and no
vendor cloud is D0, and filing it as D1 quietly overstates how contested it was.

**D1 is a negative claim, and negative claims have to be hunted rather than noticed.**
Every other tier rests on something you found: a cloud endpoint, an account gate, a
liberation guide. D1 rests on something you did *not* find, and the two ways that goes
wrong both showed up in one wave.

- *Judging the core-function path instead of the device.* The Garmin Alpha 200i was filed
  D1 on genuinely clean evidence — the collar transmits to the handheld over a Part 95J
  MURS link, there is no cloud in the tracking path, and Garmin says so. All true, and
  not the question. The same handheld has Bluetooth, Wi-Fi, an Iridium radio and a
  "Connected Features" page in Garmin's own manual naming Garmin Explore. A vendor cloud
  plainly exists; it simply is not needed to track a dog. That is D2, and the honest
  record says the tracking path is clean *within* D2 rather than borrowing D1 for it.
  **Ask what the whole device can reach, not what its best feature avoids.**
- *Reading silence as absence.* The Panasonic S5II was filed D1 partly on a support page
  where "no account requirement appears anywhere in the feature descriptions" — a page
  that simply does not discuss accounts. Panasonic does host an online LUT library. The
  tier survived, but only because a better fact existed underneath: Panasonic's own
  procedure has you disconnect the camera before the phone goes online, so the camera
  reaches nothing. **A page that does not mention a cloud is not a page saying there
  isn't one.** Cite the document that describes what the device *does* connect to.

So, before filing D1: enumerate every radio in the device, not just the one carrying core
function — the validator now rejects a D1 whose `radios` still contains `unknown`, because
an unidentified radio is an unfinished search. Then read the two places a vendor cloud is
declared if it exists at all: the manual's connected-features or network section, and the
companion app's own documentation. Say in `tier_rationale` where you looked. If the
answer is "the vendor operates no cloud for this device", that sentence is the load-bearing
claim of the record and needs a source behind it like any other.

**An account on the device is not an account with the vendor.** Setting an admin
username and password during setup of a NAS, a router, or a network camera creates a
credential stored on hardware you own. Nothing is registered with anyone, nothing can be
revoked, and the device does not care whether the vendor still exists. That is
`account_required: none`. Reserve `for_setup` for a vendor account — one you register
with the company, that they can suspend, and that ties the device to their servers. The
distinction matters because a mandatory vendor account at setup is a REJECT trigger, and
filing a local admin password under it would reject most of the good hardware in
networking and storage. The test: if the vendor went out of business tonight, could you
still get in tomorrow? If yes, it was a local credential.

**"Core function" is the thing the appliance exists to do.** A refrigerator's core
function is refrigeration, not the door screen. A video doorbell's core function includes
showing you who is there — so a doorbell that needs the cloud for video is not D2 no
matter how well the chime works offline. When in doubt, state the core function you
assumed in `open_questions` rather than choosing silently.

D0 and D1 are the site's centre of gravity. D2 is the pragmatic bulk. D3 is a separate,
clearly-labeled section for people willing to hold a soldering iron — never mixed into
the main lists.

---

## 2. Evidence classes

Every factual field carries a source. Sources are graded:

- **Class A — Primary.** Manufacturer manual, installation guide, or spec sheet (prefer
  the PDF); FCC ID grant and internal photos (fccid.io); official firmware release notes;
  a teardown with photographs of the board.
- **Class B — Corroborated community.** Home Assistant community threads, ESPHome device
  index, Zigbee2MQTT / Z-Wave JS device databases, iFixit guides, r/homeassistant and
  r/BuyItForLife posts with specifics, well-documented GitHub issues.
- **Class C — Weak.** Vendor marketing copy, retailer bullet points, a single undated
  forum comment, an AI-written review farm, a YouTube title.

**Rules:**
- Tier assignment requires **one Class A source, or two independent Class B sources**.
- Class C may never be the sole support for any published claim.
- Two sources are "independent" only if they are not quoting each other and not both
  derived from vendor copy.
- Every source is stored with `url`, `class`, `accessed` (ISO date), and a one-line
  `supports` note saying which claim it backs.

---

## 3. The FCC heuristic (US, and this is why we are US-first)

For any device sold in the United States that contains an intentional radiator, the
manufacturer must hold an FCC equipment authorization, and the ID must appear on the
device or in its documentation.

- Search `fccid.io` and the FCC OET database for the manufacturer's grantee code and the
  model.
- **A grant for an intentional radiator names the radios.** Internal photos and the RF
  exposure exhibit usually identify the exact Wi-Fi/BLE module.
- **A missing grant is only evidence when you have the sibling control.** "No grant
  found" on its own is weak — it may just mean you searched badly. What makes it strong
  is establishing that *the vendor demonstrably files when it has radios*: list the
  grants that vendor does hold, confirm they cover the models with Wi-Fi or Bluetooth,
  and only then treat the gap for your model as meaningful. **Always search the grantee,
  not just the model.** Record the sibling grants you found in the `supports` note.
- A Part 15B "verification" (unintentional radiator) is not a radio grant — it is the
  opposite, and it supports D0.
- Record `fcc_id` on the device record when found, and `fcc_checked: true` with the date
  when the check was performed and came up empty.

This heuristic is cheap, deterministic, and checkable by a small model. Use it before
you use judgment.

### Other third parties with enforcement power

The FCC check works because someone with the power to punish a lie has already made the
manufacturer answer the question. The same logic gives you other cheap, strong evidence —
look for it before you resort to reading marketing copy:

- **Standardised-exam approval** (SAT, ACT, AP, and most professional licensing bodies)
  categorically excludes devices with communication capability. An exam-approved
  calculator or watch has been certified radio-free by a body that enforces it.
- **Commercial and food-service certifications** (NSF, ETL-Sanitation, cETLus) indicate a
  product built for an operator who cannot tolerate cloud dependence, and such lines
  usually document their controls precisely.
- **Intrinsic-safety and hazardous-location ratings** (ATEX, Class I Div 2) severely
  constrain what radios a device may contain.
- **Prison, hospital, and government procurement variants** of consumer products are
  routinely stripped of radios, and the stripped SKU is usually purchasable by anyone.

Record which of these you used in the source's `supports` note, the same as an FCC check.

---

## 4. Rules for the agent, in priority order

1. **Cite or null.** If you cannot support a field with a qualifying source, write
   `null` and add a specific question to `open_questions`. An empty field is a correct
   answer. A guessed field is a defect that will outlive you.
2. **One device per task.** Never reason about several devices in one pass. Batch
   thinking is where cross-contamination happens.
3. **Follow the decision table; do not exercise taste.** Tier, availability, and risk
   fields are outputs of stated rules over stated evidence. If the evidence does not
   determine an answer, the answer is `unknown`, not your best guess.
4. **Bounded search.** Maximum 8 search queries and 12 page fetches per device. If you
   exhaust the budget without qualifying evidence, emit the record with
   `status: "insufficient_evidence"` and stop. Running longer does not make you righter.
5. **Emit JSON only.** Your output is a single JSON object conforming to
   `schema/device.schema.json`. No prose outside it. A script validates you; a human
   does not read your reasoning.
6. **Never touch the site.** Agents write to `data/` and nothing else. Rendering is a
   deterministic build step. If the site needs a change, describe it in the run journal
   for a human.
7. **Flag, do not fix.** If you find a contradiction with an existing record, do not
   overwrite it. Emit your finding with `conflicts_with` set and let the reconcile step
   handle it.
8. **Prefer the manual over the marketing.** When the box says "no app required" and the
   quick-start guide says "download the app to begin", the guide wins and the
   contradiction goes in `notes`.
9. **Prices are bands, not numbers.** Record a price band and the date observed, from a
   manufacturer or major retailer listing page. Never present a scraped price as current.
   Never scrape behind a login or in violation of a robots.txt directive.
10. **No commercial insertions.** Agents never add affiliate parameters, referral codes,
    or sponsored placement. The `affiliate` field exists in the schema and is filled by a
    human, never by you.
11. **Recency matters and decays.** A claim sourced more than 18 months ago is stale and
    must be re-verified before it can support a tier. Firmware changes tiers.
12. **Write plainly.** Short sentences. No superlatives, no "game-changing", no
    "seamlessly". The voice is a service manual, not a press release.

---

## 5. Enshittification watch

A device's tier is a snapshot, not a property. Vendors change it after purchase. We track
this explicitly because it is the whole reason the site exists.

Maintain `data/vendors.json`. For each vendor record dated, sourced incidents of:
- a feature working at purchase and later requiring an account, a subscription, or a
  firmware update;
- a cloud shutdown that reduced a shipped device's function;
- forced OTA updates that cannot be declined;
- hardware capability moved behind a paywall.

`vendor_risk` (0–3) is computed from that ledger, not from reputation. A vendor with a
documented incident cannot be scored 0 regardless of how good the current product is.

**`firmware_ota_forced` is the single most important field on the site.** A D2 device
that accepts forced OTA is a D2 device only until the vendor decides otherwise. Say so
on the page.

---

## 5b. Family records — when a model number is the wrong answer

Some categories churn SKUs faster than this project can track them, and large kitchen
appliances are the worst: manufacturers sell connected and non-connected versions inside
one line with no naming convention separating them, and revise model numbers annually. A
single SKU published today is stale within a year, and chasing them is a losing race.

For these, write a **family record** (`record_type: "family"`) whose deliverable is the
*procedure* rather than the product: `identify` tells the reader exactly how to check a
model themselves — which spec-sheet field to look for, what the connected variant is
called, which parts of the model number are noise. The last step belongs to the buyer at
the point of purchase, and that is a feature, not a compromise: a method stays true after
every SKU on the shelf has been replaced.

Family records meet the same evidence bar as any other. The best `identify` text is
sourced to the manufacturer's own support documentation — vendors frequently publish the
check, because their customers ask which model they own. `known_dumb_models` may list
verified examples but is always explicitly non-exhaustive.

Use a family record only when a single model number genuinely cannot be pinned. Prefer a
device record whenever one is available.

## 6. Scope

**In scope:** any device a US consumer buys and operates, across the 14 domains in
`schema/taxonomy.json` — kitchen, laundry, climate, lighting, security, automotive,
audio/video, computing, cameras, health, baby and pet, tools and outdoor, wearables,
office and hobby.

This is deliberately broader than "appliances." A dashcam that uploads to a vendor cloud,
a trail camera that needs a cellular subscription, a car head unit that phones home, a
printer that bricks on third-party ink, and a baby monitor with a mandatory account are
all squarely the point. Rolling stock of consumer electronics is where the cloud
dependency problem is worst, and where the reader has the fewest good guides.

**Out of scope at launch:** vehicles themselves (as opposed to aftermarket automotive
gear), industrial and commercial-only equipment, phones, tablets, laptops, and anything
not purchasable by a US consumer.

**Taxonomy discipline:** `category` must be one of the 14 domain slugs and `subcategory`
must appear under that domain in `schema/taxonomy.json`. If a device does not fit, do not
invent a category and do not force it into a near-miss — emit it with the closest domain,
set `open_questions` with a proposed subcategory, and let a human extend the taxonomy.
Categories are a human decision; unchecked category growth is how a reference site turns
into a junk drawer.

**Availability requirement:** a device is publishable only if it can be bought new in the
US right now, or is explicitly marked `availability: "discontinued"` and worth hunting
secondhand.

## 7. What good looks like

A published entry a skeptical reader can act on in thirty seconds: what it is, what tier,
what exactly happens when you unplug the router, what the vendor could still do to you,
where to buy it, and the sources to check us. Nothing else.
