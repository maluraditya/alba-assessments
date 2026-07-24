# AI Competitive Intelligence Digest

An n8n workflow that monitors six AI-lab competitors every morning, analyses what it finds with an LLM acting as a competitive analyst, and delivers a single priority-ranked HTML briefing by email — with every story logged to Google Sheets and re-runs guaranteed not to duplicate anything.

**39 nodes. One workflow. Four public data sources. No paid APIs beyond Gemini.**

---

## Table of contents

1. [What it does and why](#1-what-it-does-and-why)
2. [Architecture at a glance](#2-architecture-at-a-glance)
3. [Node-by-node walkthrough](#3-node-by-node-walkthrough)
4. [The delivered output](#4-the-delivered-output)
5. [The data contract](#5-the-data-contract)
6. [Setup and credentials](#6-setup-and-credentials)
7. [How to run it](#7-how-to-run-it)
8. [How to verify it worked](#8-how-to-verify-it-worked)
9. [Design decisions worth defending](#9-design-decisions-worth-defending)
10. [Known limitations](#10-known-limitations)

**Live artefacts:** [Google Sheet — history, seen_ledger, error_log](https://docs.google.com/spreadsheets/d/1fMCeM_tuTnzR05-aVOIvh5zwd5SuhHoA1209xRKOEys/edit)

---

## 1. What it does and why

### The problem

Competitive intelligence is a real job that mostly gets done badly. Someone on the strategy team opens fifteen tabs on Monday, skims headlines, and forms an impression. It isn't repeatable, it isn't recorded, and the same story read by two people produces two different conclusions.

The tedious parts are all automatable: gathering the sources, throwing away what you've already seen, and writing a first-pass assessment. The judgement part isn't — so this workflow does the first three and hands a structured draft to a human.

### What it actually does

Every morning at 09:00 the workflow:

1. Checks four public sources for each of six competitors of **OpenAI**
2. Normalises four completely different payload shapes into one schema
3. Throws away anything it reported on before
4. Sends each genuinely-new story to Gemini, prompted to read it as an analyst sitting inside OpenAI
5. Assigns a priority using **deterministic rules**, not the model's opinion
6. Writes everything to Google Sheets
7. Emails one HTML briefing, grouped Critical → High → Medium → Low

### Who it watches, and why those six

| Competitor | Why they're on the list |
|---|---|
| **Anthropic** | Claude — closest rival on frontier model quality and enterprise API business |
| **Google DeepMind** | Gemini — backed by Google's distribution and compute |
| **xAI** | Grok — bundled into X and increasingly into other products |
| **Perplexity** | AI search — competes for the consumer question-answering use case |
| **Mistral AI** | Open-weight European models — competes on cost and sovereignty |
| **Cohere** | Enterprise and RAG-focused — competes for the same business customers |

The framing matters. "We are OpenAI" is literally in the Gemini system prompt, which is why the analysis reads *"this threatens our pricing power"* rather than producing a neutral summary. Every story is judged against one question: **does this affect our revenue, our technical lead, or our customers?**

### Sources

| Source | Endpoint | What it gives |
|---|---|---|
| Company blog | RSS (Google News `site:` filter for labs with no feed) | Official announcements |
| GitHub | `api.github.com/orgs/{org}/repos` | Repo activity, shipping signals |
| Hacker News | `hn.algolia.com/api/v1/search_by_date` | Developer sentiment, early reaction |
| Google News | `news.google.com/rss/search` | Third-party coverage and analysis |

---

## 2. Architecture at a glance

```
                    ┌─────────────────────┐
  09:00 cron ──────▶│  Competitor         │
                    │  Registry (6 orgs)  │
                    └──────────┬──────────┘
                               ▼
        ┌────────────  Loop Over Competitors  ◀──────────┐
        │  (batch size 1, "loop" output)                 │
        ▼                                                │
  ┌─────────┬─────────┬─────────┬─────────┐              │
  │  Blog   │ GitHub  │   HN    │  Google │  4 parallel  │
  │   RSS   │  REST   │ Algolia │   News  │  retry ×3    │
  └────┬────┴────┬────┴────┬────┴────┬────┘              │
       └─────────┴────┬────┴─────────┘                   │
                      ▼                                  │
              Merge All Sources (4 inputs)               │
                      ▼                                  │
            Normalize To Common Schema                   │
                      ▼                                  │
              Fetch Succeeded?  ──false──▶ error_log ────┤
                      │ true                             │
                      └──▶ Throttle (2s) ────────────────┘
                              │
                   ("done" output, once)
                              ▼
                       Dedupe & Sort
                              ▼
                  Read Seen Ledger (Sheets)
                              ▼
                  Filter Already Seen ◀── idempotency gate
                              ▼
                     Limit (10 — testing)
                              ▼
              AI Competitive Analyst (Agent)
                ├─ Google Gemini Chat Model
                └─ Structured Output Parser
                              ▼
                    Validate AI Output ◀── rules engine
                              ▼
                Route By Priority (Switch ×4)
                   ▼      ▼      ▼      ▼
                 Tag    Tag    Tag    Tag
                Crit   High    Med    Low
                   └──────┴──────┴──────┘
                              ▼
                     Merge (4 inputs) ◀── one batch again
                              ▼
                   Append To History Sheet
                              ▼
                   Append To Seen Ledger
                              ▼
                    Aggregate For Report
                              ▼
                     Build HTML Report
                              ▼
                      Send Email (Gmail)
```

---

## 3. Node-by-node walkthrough

### Stage 1 — Collect

![Stage 1 — Collect](docs/images/01-collect.png)

| Node | Type | What it does |
|---|---|---|
| **Daily 9AM Trigger** | Schedule Trigger | Fires at 09:00 daily. |
| **Build Competitor Registry** | Code | Emits one item per competitor with `company`, `github_org`, `news_query`, `blog_rss`, plus the run-wide constants: `LOOKBACK_HOURS = 48`, `MAX_ITEMS_PER_RUN`, and a precomputed `cutoff_epoch`. **This is the only node you edit to add or remove a competitor.** |
| **Loop Over Competitors** | Split In Batches | Batch size 1. The `loop` output drives the fetches; the `done` output fires **once** at the end carrying every competitor's items pooled together. |
| **Fetch Company Blog (RSS)** | RSS Feed Read | Official announcements. |
| **Fetch GitHub Activity** | HTTP Request | `GET /orgs/{org}/repos?sort=pushed&direction=desc&per_page=10` |
| **Fetch Hacker News** | HTTP Request | Algolia `search_by_date`, filtered server-side with `created_at_i > cutoff_epoch`. |
| **Fetch Google News RSS** | HTTP Request | `when:2d` search feed, fetched as raw text. |
| **Parse News XML** | XML | Converts the Google News response into JSON. |
| **Merge All Sources** | Merge (4 inputs, append) | Pools four heterogeneous payloads into one stream. |
| **Normalize To Common Schema** | Code | The heart of the collect stage — see §5. |
| **Fetch Succeeded?** | IF | Routes `_fetch_error: true` items away from the happy path. |
| **Log Failed Source** | Google Sheets | Appends to `error_log` and **dead-ends deliberately**. |
| **Throttle Between Competitors** | Wait (2s) | Politeness delay, then feeds back into the loop. |

**Error handling here is the point.** Every fetch node carries:

```
retryOnFail: true
maxTries: 3
waitBetweenTries: 2000    (2s, escalating)
onError: continueRegularOutput
alwaysOutputData: true
```

A failed node emits `{ error: ... }` instead of throwing. The normaliser catches that shape, tags it, and `Fetch Succeeded?` routes it to the error log. **One dead feed never stops the other five competitors.**

> ⚠️ **A wiring note that cost real debugging time.** `Log Failed Source` must *not* connect back to `Throttle Between Competitors`. If it does, the Wait node has two inbound edges, executes twice per iteration, and pushes two signals back into the loop — which causes the `done` output to fire multiple times and produces **duplicate emails**. Error branches should terminate, not rejoin.

---

### Stage 2 — Dedupe and idempotency

![Stage 2 — Dedupe and idempotency](docs/images/02-dedupe-idempotency.png)

| Node | Type | What it does |
|---|---|---|
| **Dedupe & Sort** | Code | Runs **once** on the loop's `done` output. Drops error and empty items, collapses exact fingerprint duplicates, sorts newest first, caps at `MAX_ITEMS_PER_RUN`. |
| **Read Seen Ledger** | Google Sheets | Reads every fingerprint reported previously. **`executeOnce: true`** — without this it fires once per item and multiplies the whole downstream chain. |
| **Filter Already Seen** | Code | Anti-joins candidates against the ledger. Emits a single `_no_new_items` sentinel when nothing survives, so the flow terminates cleanly rather than stalling. |
| **Limit** | Limit | **`maxItems: 10` — set deliberately low for testing.** |

#### 🔟 The limit is intentional

`Limit` is capped at **10 items** on purpose. It is the last gate before the LLM, so it is a direct dial on API cost: **10 items = 10 Gemini calls per run.**

This keeps test runs cheap while the workflow is being demonstrated and tuned. **For production, raise it to 40** (or delete the node and let `MAX_ITEMS_PER_RUN` in the registry govern instead — it does the same job, one node earlier).

Nothing else in the workflow depends on this value. It exists purely as a cost guard.

#### Why fingerprints, not URLs

The obvious idempotency key is the article URL. It doesn't work here.

Google News returns **opaque redirect tokens** (`news.google.com/rss/articles/CBM...`) rather than publisher URLs. The same story arriving via two feeds carries two different tokens, so a URL-keyed ledger lets both through and you get the same story twice.

The fingerprint is instead:

```javascript
djb2( company + "|" + normalized_title + "|" + publisher_host )
```

Deterministic, no crypto import, and survives redirect tokens and minor headline edits.

---

### Stage 3 — Analyse

![Stage 3 — Analyse](docs/images/03-analyse.png)

| Node | Type | What it does |
|---|---|---|
| **AI Competitive Analyst** | AI Agent | System prompt frames the model as an analyst inside OpenAI. User message carries the normalised article. |
| **Google Gemini Chat Model** | Gemini Chat Model | `temperature: 0.2` — low, because this is assessment, not creative writing. |
| **Structured Output Parser** | Structured Output Parser | Enforces the JSON shape via `jsonSchemaExample`. |
| **Validate AI Output** | Code | Repairs malformed responses **and** applies the priority rules engine. |
| **Route By Priority** | Switch (4 outputs) | Critical / High / Medium / Low, fallback → Low. |
| **Tag Critical / High / Medium / Low** | Set ×4 | Attach `priority_colour` and `priority_rank` for report rendering. |
| **Merge** | Merge (4 inputs, append) | **Reconverges the four branches into one batch.** |

#### What the AI returns

```json
{
  "category": "model_launch",
  "summary": "Two to three sentences on what actually happened.",
  "business_impact": "Effect on OpenAI's revenue, moat, or roadmap.",
  "customer_impact": "What an OpenAI customer would notice.",
  "sentiment": "negative",
  "threat_level": 7,
  "opportunity_level": 3,
  "priority": "High",
  "recommended_action": "A concrete, assignable next step.",
  "confidence": 8,
  "executive_summary": "One sentence under 25 words."
}
```

#### Two safety nets

**1. The AI does not decide priority.** It scores threat, opportunity, confidence and sentiment. A set of fixed regex rules in `Validate AI Output` decides what counts as Critical or High:

| Signal | Priority |
|---|---|
| Funding, acquisition | Medium |
| Model launch / release | High |
| Pricing change | High |
| Hiring surge | High |
| Launch **or** pricing, **and** threat ≥ 7 | Critical |

This means "Critical" means the same thing every day, even if the model has an off morning. It also means the business logic is readable by someone who can't write code.

**2. A broken AI response never crashes the run.** `Validate AI Output` strips markdown fences, attempts a brace-match rescue, and falls back to a low-confidence placeholder row. The run continues.

#### Why the Merge node is not optional

n8n executes a node **once per inbound connection**. Four `Tag` nodes wired directly into one Sheets node would make everything downstream — including the email — run four times. The Merge node reconverges them into a single batch, which is exactly why you get **one email instead of four**.

---

### Stage 4 — Deliver

![Stage 4 — Deliver](docs/images/04-deliver.png)

| Node | Type | What it does |
|---|---|---|
| **Append To History Sheet** | Google Sheets | One row per story — the analytical record. |
| **Append To Seen Ledger** | Google Sheets | Fingerprint + URL — the idempotency record. |
| **Aggregate For Report** | Aggregate | `aggregateAllItemData` → collapses all items into a single `items` array. |
| **Build HTML Report** | Code | Renders the email. Inline styles and table layout only — Gmail and Outlook strip `<style>` blocks. |
| **Send a message** | Gmail | Delivers the HTML briefing. |

#### Write-before-send is deliberate

Sheets are written **before** the email is built. If delivery fails, tomorrow's run still won't repeat today's stories, because the ledger already has them.

The tradeoff is explicit: a delivery failure loses that day's email entirely. That's the right trade — a missed email is visible and recoverable from the `history` sheet; silently re-reporting the same twelve stories every morning until someone notices is not.

The email layout and its rendering rules are documented in full in [§4 The delivered output](#4-the-delivered-output).

---

## 4. The delivered output

This is what actually lands in the inbox. Everything above exists to produce this one artefact.

![The delivered email briefing](docs/images/05-email-output.png)

*A real run: 20 new items across 4 competitors, 4 scored Critical, average threat 2.7/10.*

### Layout, top to bottom

```
┌──────────────────────────────────────────────────────┐
│  1. HEADER                                           │
│     Competitive Intelligence Brief                   │
│     2026-07-24 · 20 new items · 4 competitors        │
├──────────────────────────────────────────────────────┤
│  2. EXECUTIVE SUMMARY                    (grey card) │
│     Counts · critical count in red · avg threat      │
│     • One-line summary per critical item             │
├──────────────────────────────────────────────────────┤
│  3. CRITICAL                                    (4)  │
│     ┌────────────────────────────────────────────┐   │
│     │ COMPANY · CATEGORY · SOURCE   (coloured)   │   │
│     │ Headline — hyperlinked to the article      │   │
│     │ Summary (2–3 sentences)                    │   │
│     │ Business impact:  …                        │   │
│     │ Customer impact:  …                        │   │
│     │ Action:           …                        │   │
│     │ Threat 8/10 · Opp 1/10 · Impact 5.2 ·      │   │
│     │ Confidence 6/10 · Sentiment negative       │   │
│     └────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────┤
│  4. HIGH PRIORITY / MEDIUM / LOW                     │
│     Same card format, different accent colour        │
├──────────────────────────────────────────────────────┤
│  5. RECOMMENDED ACTIONS                              │
│     Bulleted, drawn from Critical + High items only  │
├──────────────────────────────────────────────────────┤
│  6. FOOTER — sources used, scoring caveat            │
└──────────────────────────────────────────────────────┘
```

### The reasoning behind each section

**Header** — date, item count and competitor count. Tells the reader in one second whether this is a busy day or a quiet one.

**Executive summary** — the only part most readers will finish. Counts, the critical count highlighted in red, average threat level, then one bullet per critical item. Each bullet is the model's `executive_summary` field, constrained by the prompt to a single sentence under 25 words.

**Priority sections** — one per level, ordered Critical → High → Medium → Low. **Empty sections are omitted entirely**, so a quiet day produces a short email rather than four empty headers. The count appears beside each header.

**Story cards** — each carries a coloured left border matching its priority (`#b3261e` Critical, `#c77700` High, `#1a73e8` Medium, `#5f6368` Low), set by the four `Tag` nodes in Stage 3. The three impact lines sit in a grey sub-panel so they read as analysis rather than as more description.

**Score strip** — threat, opportunity, impact, confidence and sentiment in small grey type at the bottom of each card. Deliberately understated: these are advisory model outputs, not facts, and shouldn't compete visually with the summary. If the LLM response failed to parse, an `AI parse degraded` marker appears here in red.

**Recommended actions** — every action from Critical and High items collected into one list. This is the section a strategy lead can forward without reading anything else.

### Subject line

The subject escalates automatically based on content:

```
Competitive Brief 2026-07-24 — 20 updates
[CRITICAL] Competitive Brief 2026-07-24 — 4 critical, 20 updates
```

The `[CRITICAL]` prefix only appears when at least one item clears the Critical rule, so it stays meaningful as an inbox filter.

### Rendering constraints

The report is built in `Build HTML Report` as a single HTML string, under two hard constraints imposed by email clients:

| Constraint | Why |
|---|---|
| **Inline styles only** — no `<style>` block | Gmail and Outlook strip `<head>` styles entirely |
| **Table-based layout** — no flexbox or grid | Outlook's rendering engine is Word, which supports neither |

Every value is HTML-escaped before insertion, so a headline containing `&` or `<` cannot break the layout.

### Reading the sample above

Two things visible in this real run are worth noting honestly:

**Four near-identical Opus 5 stories.** Four outlets covered one launch, producing four fingerprints and four separate cards. This is the known clustering limitation in §10 — a title-similarity pass in `Dedupe & Sort` would collapse these into one card with citations.

**Only 4 of 6 competitors appear.** Two produced nothing that run. Check `error_log` before assuming it's a quiet news day — a dead feed looks identical to silence from the reader's side, which is exactly why that sheet exists.

---

## 5. The data contract

Four sources with four unrelated payload shapes converge on one schema. Everything downstream depends only on this contract, which is why adding a fifth source requires changing exactly one node.

```javascript
{
  company:      "Anthropic",
  source:       "google_news",        // company_blog | github | hacker_news | google_news
  category:     "news",
  title:        "…",
  date:         "2026-07-24T09:12:00.000Z",   // ISO 8601, always
  url:          "https://…",
  content:      "…",                  // HTML stripped, capped at 2500 chars
  fingerprint:  "anthropic-3f9a2c11", // idempotency key
  run_date:     "2026-07-24",
  collected_at: "2026-07-24T09:00:04.812Z",
  _fetch_error: false
}
```

Failed fetches use a parallel shape so the IF node can route them without special-casing:

```javascript
{
  company: "Cohere",
  source: "upstream_fetch",
  _fetch_error: true,
  error_message: "Feed not recognized as RSS 1 or 2.",
  run_date: "2026-07-24",
  collected_at: "2026-07-24T19:42:07.213Z"
}
```

The normaliser detects source type **by payload shape**, not by node name:

| Detection | Source |
|---|---|
| `Array.isArray(d.hits)` | Hacker News (one object containing an array) |
| `d.rss && d.rss.channel` | Google News (parsed XML) |
| `d.full_name && d.html_url` | GitHub (array already split into items by n8n) |
| `d.link && (d.isoDate \|\| d.pubDate)` | RSS blog feed |

Every branch is wrapped in `try/catch`; a parse failure becomes a tagged error item, never an exception.

---

## 6. Setup and credentials

### Prerequisites

- n8n (cloud or self-hosted), version 1.60+ for AI Agent v2.1
- A Google account (Sheets + Gmail)
- A Google Gemini API key

### Credentials to create

| Credential | Type in n8n | Used by |
|---|---|---|
| Gemini | `Google Gemini(PaLM) Api` | Google Gemini Chat Model |
| Google Sheets | `Google Sheets OAuth2 API` | 4 Sheets nodes |
| Gmail | `Gmail OAuth2 API` | Send a message |

> 🔐 **Never commit real credentials, spreadsheet IDs or email addresses.** Before pushing this workflow to a public repo, replace the `documentId` values and the `sendTo` address with placeholders. n8n exports credential *references* (IDs and names), not secrets — but the sheet ID and recipient address are still yours.

### Google Sheet — three tabs required

**Live sheet used by this workflow:** [https://docs.google.com/spreadsheets/d/1fMCeM_tuTnzR05-aVOIvh5zwd5SuhHoA1209xRKOEys/edit](https://docs.google.com/spreadsheets/d/1fMCeM_tuTnzR05-aVOIvh5zwd5SuhHoA1209xRKOEys/edit)

> Set sharing to **Anyone with the link → Viewer** so reviewers can see the output without requesting access. If you are forking this for your own use, create your own spreadsheet and replace the `documentId` in all four Sheets nodes.

Create one spreadsheet with three tabs. **Header row names must match exactly.**

**Tab: `history`**
```
run_date | company | category | priority | threat_level | opportunity_level |
impact_score | confidence | sentiment | source | url | summary | recommended_action
```

**Tab: `seen_ledger`**
```
fingerprint | run_date | company | url
```

**Tab: `error_log`**
```
timestamp | run_date | company | source | error_message
```

### Import and configure

1. n8n → **Workflows → Import from File** → select `workflow.json`
2. Open each Google Sheets node → select your spreadsheet and the matching tab
3. Open `Google Gemini Chat Model` → select your Gemini credential → set model to `models/gemini-2.5-flash`
4. Open `Send a message` → select your Gmail credential → set the recipient
5. *(Optional)* Open `Build Competitor Registry` → edit the `COMPETITORS` array

### A note on RSS feeds

Most AI labs **do not publish RSS feeds.** Anthropic, xAI, Mistral, Cohere and Perplexity all lack one; Perplexity additionally blocks non-browser requests with a 403. Only Google DeepMind has a working official feed.

The registry therefore uses Google News publisher-filtered feeds as a stand-in:

```
https://news.google.com/rss/search?q=site:anthropic.com&hl=en-US&gl=US&ceid=US:en
```

Always available, no credentials, no third-party mirror dependency. The tradeoff is headlines and snippets instead of full post bodies — which is why confidence scores on those items run lower, and why the rules cap thin-sourced items below Critical.

---

## 7. How to run it

### Manual (recommended first)

Open the workflow → **Execute Workflow**. Takes 1–3 minutes depending on how many items pass the ledger.

The first run analyses everything in the 48-hour window, so it is the most expensive. Subsequent runs only see genuinely new stories.

### Scheduled

Toggle **Active**. Fires daily at 09:00 in the instance timezone.

### Cost control before you activate

| Setting | Where | Test | Production |
|---|---|---|---|
| `Limit → maxItems` | Limit node | **10** | 40 or delete |
| `MAX_ITEMS_PER_RUN` | Build Competitor Registry | 40 | 40 |
| `retryOnFail` | AI Competitive Analyst | off | on |

Whatever number sits in the `Limit` node is very close to what you pay Gemini for. **It ships at 10 deliberately.**

---

## 8. How to verify it worked

Run manually, then check five things in order.

### ✅ 1. Every node executed exactly once after the loop

Watch the execution badges on the canvas. From `Dedupe & Sort` onward every node must read **✓1**.

If any node after the loop shows ✓2 or higher, something is fanning in and you will get duplicate emails and duplicate sheet rows. The usual causes: `Read Seen Ledger` missing `executeOnce: true`, or `Log Failed Source` wired back into `Throttle Between Competitors`.

### ✅ 2. One email arrives

Subject looks like:

```
Competitive Brief 2026-07-24 — 11 updates
```

Open it. Sections should appear in priority order, empty ones hidden, headlines clickable, and the Recommended Actions block populated at the bottom. See [§4 The delivered output](#4-the-delivered-output) for a screenshot of a successful run and a breakdown of every section.

> Open the [live sheet](https://docs.google.com/spreadsheets/d/1fMCeM_tuTnzR05-aVOIvh5zwd5SuhHoA1209xRKOEys/edit) to check tabs 3, 4 and the bonus check below.

### ✅ 3. `history` tab has one row per story

Every row should carry a `priority`, `threat_level`, `opportunity_level` and `summary`. A row where `summary` starts with `[AI analysis unavailable]` means the LLM returned something unparseable and the fallback did its job — the run survived, which is the point.

### ✅ 4. `seen_ledger` grew by the same count

Same number of new rows as `history`. If they differ, one of the two Sheets appends is failing — check `error_log`.

### ✅ 5. Idempotency — the important one

**Run the workflow again immediately.**

Expected: execution reaches `Filter Already Seen`, finds nothing new, and stops. **No second email. No new sheet rows.**

This is the single best proof the workflow is production-safe. If `history` grows on the second run, the ledger read is failing.

### Bonus: prove the error handling

Open `Build Competitor Registry` and break one feed URL — change Cohere's `blog_rss` to a 404. Re-run.

Expected: the workflow **completes**, the other five competitors still report, and `error_log` gains a row:

| timestamp | run_date | company | source | error_message |
|---|---|---|---|---|
| 2026-07-24T19:42:07.213Z | 2026-07-24 | Cohere | upstream_fetch | Feed not recognized as RSS 1 or 2. |

That table is a real excerpt from a real run. Five sources failed that morning and the briefing still went out.

---

## 9. Design decisions worth defending

**Priority is rule-based, not model-decided.** The LLM scores; fixed rules classify. Consistency across runs matters more than nuance, and a non-engineer can read and argue with a regex table in a way they can't with a prompt.

**Fingerprints, not URLs.** Google News redirect tokens make URL-keyed dedup silently leaky. This only surfaces by running the thing and seeing the same story arrive twice.

**Error branches terminate.** Failed items go to the log and stop. Rejoining them to the main path caused the loop to over-fire and produce duplicate emails — a subtle bug that looked like an Aggregate problem and wasn't.

**Sheets before email.** Delivery failure must not corrupt idempotency state.

**One registry node.** Adding a competitor is a one-line edit in one Code node. Every other node reads generically from the item.

**Detection by payload shape.** The normaliser doesn't care which node produced an item, so re-ordering or adding sources doesn't break it.

---

## 10. Known limitations

**RSS feeds drift.** AI labs restructure their newsrooms constantly. When a competitor stops appearing, check `error_log` first — that's exactly what it's for.

**GitHub rate limits.** Unauthenticated API allows 60 requests/hour. Six competitors daily is fine; add a GitHub credential before increasing frequency.

**Google News is deep but stale.** Median item age skews several days and feeds cap around 100 items with no pagination. Freshness comes from the blog, GitHub and HN sources; Google News widens the net.

**Reddit is deliberately absent.** Unauthenticated `.json` endpoints were deprecated in May 2026 and now return 403. Adding Reddit would require an approval-gated OAuth app.

**Near-duplicate stories still get separate cards.** Nine outlets covering one launch produce nine fingerprints and nine LLM calls. A title-similarity clustering pass in `Dedupe & Sort` would collapse these — a worthwhile next improvement.

**No sub-workflow.** `AI Competitive Analyst` + `Validate AI Output` form a clean seam (one article in, structured JSON out) and would extract into a reusable sub-workflow with no other changes.

---

## Repository contents

```
.
├── README.md
├── workflow.json                    # importable n8n workflow
└── docs/
    ├── DOCUMENTATION.docx           # full written documentation
    └── images/
        ├── 01-collect.png
        ├── 02-dedupe-idempotency.png
        ├── 03-analyse.png
        ├── 04-deliver.png
        └── 05-email-output.png   # the delivered briefing
```

**Live artefacts**

| Artefact | Link |
|---|---|
| Google Sheet (history · seen_ledger · error_log) | [Open](https://docs.google.com/spreadsheets/d/1fMCeM_tuTnzR05-aVOIvh5zwd5SuhHoA1209xRKOEys/edit) |
| Sample delivered email | [docs/images/05-email-output.png](docs/images/05-email-output.png) |
