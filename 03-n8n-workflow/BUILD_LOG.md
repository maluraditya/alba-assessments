# Build Log: AI Competitive Intelligence Digest

An n8n workflow that monitors six AI-lab competitors of OpenAI, analyses each new story with Gemini acting as a competitive analyst, and delivers one priority-ranked HTML briefing by email every morning.

---

## Goal & scope decision

### What I chose to build

A daily competitive intelligence pipeline framed from inside OpenAI, watching Anthropic, Google DeepMind, xAI, Perplexity, Mistral AI and Cohere across four public sources.

I picked this over the simpler suggestions (repo activity report, price watcher) for one reason: it forces a genuinely hard problem that the easy options don't — **the same story arriving from multiple sources in different shapes, needing to be recognised as one thing**. That's what makes it a real pipeline rather than a fetch-and-format exercise. Deduplication, idempotency, and a data contract all become mandatory rather than decorative.

The output also has to survive a taste test: would a strategy lead actually read this email, or delete it? That constraint drove more design decisions than the technical requirements did.

### What I deliberately left out

**A separate error-trigger workflow.** The brief allows either an error-trigger workflow *or* `continueOnFail` with a handled branch. I chose the handled branch because it degrades more gracefully — an error-trigger workflow fires *after* the run dies, whereas the handled branch keeps the other five competitors reporting. Failed sources land in an `error_log` sheet and the briefing still goes out.

**Reddit as a source.** Reddit deprecated unauthenticated `.json` endpoints in May 2026; those URLs now return 403. The official Data API is approval-gated behind a multi-week queue. Including it would have meant either a broken node or a blocked submission.

**Near-duplicate clustering.** Four outlets covering one launch currently produce four cards. I designed the fix (title-token Jaccard clustering in `Dedupe & Sort`, keeping the longest-body member as representative and attaching the rest as citations) but did not ship it. It's documented as the top item in Known Limitations, and visible in the sample email — I'd rather it be an acknowledged gap than a hidden one.

**A reusable sub-workflow.** This is a bonus item and I got close: `AI Competitive Analyst` + `Validate AI Output` form a clean seam, one article in, structured JSON out. I scoped the build to a single importable file because it's easier to review and import, and the seam is documented so extraction is a short job.

**Original plan was four workflows.** I started designing an orchestrator + collector + analyser + error handler split. I collapsed it to one file mid-build — a four-file submission is harder to review and the sub-workflow boundaries were adding ceremony without adding resilience at this scale.

---

## Stack & tooling

| Component | Choice | Why |
|---|---|---|
| **Orchestration** | n8n (cloud) | Required by the brief. Split-In-Batches gives loop accumulation for free. |
| **LLM** | Gemini 2.5 Flash via AI Agent node | Cheap enough that a 40-item daily run is a rounding error. `temperature: 0.2` — this is assessment, not creative writing. |
| **Output shaping** | Structured Output Parser | Enforces the JSON contract at the node level rather than relying on prompt discipline. |
| **Storage** | Google Sheets, three tabs | `history` (record), `seen_ledger` (idempotency), `error_log` (observability). Chose Sheets over a database because a reviewer can open it in a browser — verifiability was a requirement, and a Postgres instance nobody can see fails that. |
| **Delivery** | Gmail node, hand-built HTML | No template library. Gmail and Outlook strip `<style>` blocks, so inline styles and table layout were the only option. |
| **Sources** | Company RSS, GitHub REST, HN Algolia, Google News RSS | All free, all no-auth. Deliberate — a submission that needs four paid API keys can't be run by whoever grades it. |

### Sources I evaluated and rejected

- **Reddit** — dead without OAuth as of May 2026
- **Product Hunt** — poor signal for frontier AI labs
- **YouTube RSS** — real, but the content is video titles with no body text, so the LLM has almost nothing to assess
- **Careers/pricing page scraping** — was in the original spec; dropped because it needs per-company CSS selectors that break constantly, and the maintenance cost exceeded the signal

---

## Key decisions & trade-offs

**Decision: priority is decided by deterministic rules, not by the model.**
Because "Critical" needs to mean the same thing every day. The LLM scores threat, opportunity, confidence and sentiment; a regex rules table in `Validate AI Output` decides the priority band. *Alternative considered: letting the model set priority directly.* Rejected after the first real run returned **11 out of 11 items as Critical**, including an Axios headline with no body that the model itself rated confidence 2/10. Rules also mean a non-engineer can read and argue with the classification logic.

**Decision: idempotency key is a fingerprint, not the URL.**
Because Google News returns opaque `news.google.com/rss/articles/CBM...` redirect tokens rather than publisher URLs. The same story arriving via two feeds carries two different tokens, so a URL-keyed ledger silently leaks duplicates. *Alternative considered: resolving each redirect with an HTTP HEAD request.* Rejected as one extra request per item for a cosmetic gain. The fingerprint is `djb2(company + normalized_title + publisher_host)` — deterministic, no crypto import, survives both redirect tokens and minor headline edits.

**Decision: write to Sheets before sending the email.**
Because a failed delivery must not corrupt idempotency state. *Trade-off accepted:* if the email bounces, that day's briefing is lost. That's the right way round — a missing email is visible and recoverable from the `history` sheet, whereas silently re-reporting the same twelve stories every morning until someone notices is not.

**Decision: the normaliser detects source type by payload shape, not by node name.**
Because it makes the pipeline order-independent. `Array.isArray(d.hits)` means Hacker News; `d.rss?.channel` means Google News. Reordering or adding a source doesn't break anything downstream. *Alternative considered: tagging each item with a `_source` field at fetch time.* Cleaner in principle, but every fetch node would need an extra Set node — four more nodes for no functional gain.

**Decision: one Code node holds the entire competitor registry.**
Because adding a competitor should be a one-line edit, not a workflow refactor. Every downstream node reads generically from the item fields. *Alternative considered: a Google Sheets registry tab.* Better for a non-technical operator, but adds an API call and a credential dependency to the workflow's very first step — a bad failure mode for something that runs unattended at 9am.

**Decision: error branches terminate rather than rejoin the main path.**
Learned the hard way — see below.

**Decision: collapsed four workflows into one.**
Because a single importable file is dramatically easier to review, and the sub-workflow boundaries I'd drawn were adding indirection without adding resilience at six competitors and forty items.

---

## Hard parts / dead ends

### The duplicate email bug (two separate causes, ~50 min)

This was the hardest problem in the build, and it wasn't hard because it was complex — it was hard because I misdiagnosed it twice.

**Symptom:** three to five near-identical emails per run, each containing a subset of the items.

**Cause 1 — convergent branches.** The `Route By Priority` Switch fanned into four `Tag` nodes, and all four connected directly into `Append To History Sheet`. **n8n executes a node once per inbound connection — it does not merge them.** So everything downstream of that Sheets node, including the email, ran once per priority bucket that had data.

Fixed with a 4-input Merge node in append mode, reconverging the branches into a single batch before the Sheets write.

**Cause 2 — the error branch feeding back into the loop.** After fixing Cause 1 I was still getting five emails, and I spent several rounds convinced the Aggregate node was broken. It wasn't. `Log Failed Source` was wired back into `Throttle Between Competitors`, giving the Wait node **two inbound edges**. It therefore executed twice on any iteration where a source failed, pushing two signals back into `Loop Over Competitors`. The loop got called more times than it had competitors, and every extra call after the list was exhausted fired the **done** output again — with the full accumulated set each time.

That's why the email count tracked the number of failing feeds, and why it drifted from 6 to 5 as I fixed feed URLs. A behavioural fingerprint I completely missed at the time.

**How I actually found it:** I stopped reading the canvas and read the exported JSON's `connections` object, building a reverse map of inbound edges per node. Two nodes had multiple inbound connections into the same input. One was the intended loop feedback; the other was the bug. **Thirty seconds in the JSON after most of an hour on the canvas** — a lesson I'll carry forward.

**Dead end worth recording:** I spent real time trying to solve this downstream — adding a Code node after Aggregate to consolidate, then considering `$getWorkflowStaticData` to accumulate across executions. Both were wrong. Every node in n8n runs once per inbound batch, *including Code nodes*, so there is no downstream fix for an upstream fan-out. The static-data approach would additionally have leaked yesterday's items into today's email.

### Five of six RSS feeds didn't exist (~20 min)

I built the registry with plausible-looking feed URLs (`/news/rss.xml`, `/feed.xml`) inferred from convention rather than verified. Five of six 404'd, 403'd, or returned HTML.

The real finding: **most AI labs don't publish RSS at all.** Anthropic, xAI, Mistral, Cohere and Perplexity have no official feed; Perplexity additionally blocks non-browser requests with a 403. Only Google DeepMind has one.

Fixed by switching to Google News publisher-filtered feeds (`?q=site:anthropic.com`) — always available, no credentials, no dependency on volunteer-maintained mirrors. Trade-off is headlines and snippets instead of full post bodies, which is why confidence scores on those items run lower and why the rules cap thin-sourced items below Critical.

**Silver lining:** this became the best possible demonstration of the error handling. Five sources failed on a real run, five rows appeared in `error_log`, and the briefing went out anyway. That's now the evidence in the verification section of the docs.

### Priority inflation (~15 min)

First real analysis run: 11 of 11 items Critical. Two bugs compounding.

The launch regex `/announc\w+|launch\w*/` matches essentially every AI news headline. And the escalation rule `threat >= 8 → Critical` had no confidence floor, so a bare Axios headline the model rated confidence 2/10 still went out as a critical alert.

Fixed by requiring **both** a launch-or-pricing signal **and** threat ≥ 7 **and** confidence ≥ 6 for Critical, with a hard ceiling: confidence ≤ 2 can never exceed Medium regardless of what the model says.

### Invisible hyperlinks (~5 min)

Headlines in the email were styled `color:#1a1a1a; text-decoration:none` to look clean. They were links, but nobody could tell — the feedback was "I need live URLs" when the URLs were already there. Fixed with proper blue underlined links plus an explicit "Read on macrumors.com →" line per card.

A small thing that taught a real lesson: **a link that doesn't look like a link is a broken link.**

---

## How I verified it works

### Manual test sequence

1. **Single execution** — ran manually and walked the canvas left to right, checking that every node after the loop shows an execution count of exactly **1**. This is the fastest tell for the fan-in class of bug and I now check it first.
2. **Item counts at each stage** — confirmed the funnel narrows sensibly: ~378 raw → ~40 after dedupe → ~10 after the ledger gate and cost cap.
3. **Email rendering** — opened in Gmail web and mobile. Checked that empty priority sections are omitted, headlines are visibly clickable, and the Recommended Actions block populates from Critical + High only.
4. **Sheet writes** — verified `history` and `seen_ledger` grew by the same count in the same run. A mismatch means one of the two appends is failing.

### Edge cases checked

| Case | Expected | Result |
|---|---|---|
| **Idempotency** — run twice back to back | Second run finds nothing new, sends no email, writes no rows | ✅ Reaches `Filter Already Seen` and terminates |
| **Dead feed** — deliberately broke Cohere's URL | Workflow completes, other competitors report, `error_log` gains a row | ✅ Verified on a real run with five simultaneous failures |
| **Zero new items** | Flow terminates cleanly rather than stalling | ✅ `_no_new_items` sentinel handles it |
| **Malformed LLM response** | Degrades to a low-confidence placeholder row, run continues | ✅ Fence-stripping + brace-match rescue + fallback |
| **Empty source response** | Normaliser emits a placeholder so the loop can continue | ✅ `_empty` item path |
| **HTML injection in a headline** | Escaped, layout intact | ✅ All values pass through `esc()` |

The idempotency test is the one I'd point a reviewer at first. It's the single best proof the thing is safe to run unattended.

### What was automated

Nothing beyond n8n's own retry logic — `retryOnFail: true, maxTries: 3, waitBetweenTries: 2000` on every fetch and every Sheets write.

### What I'd add with more time

- **A canary check** — if fewer than N competitors report, email an alert rather than a suspiciously short briefing. Right now a dead feed and a quiet news day look identical from the reader's side.
- **Pinned test data** on the fetch nodes so the transformation logic can be exercised without hitting live APIs.
- **A weekly digest** comparing threat scores week over week — the `history` sheet already holds everything needed and nothing reads from it yet.
- **Assertion node after the normaliser** validating the data contract, so a source that silently changes shape fails loudly instead of quietly producing zero items.

---

## Known limitations

**Near-duplicate stories get separate cards.** Four outlets covering one launch produce four fingerprints, four LLM calls and four cards — visible in the sample email in the docs. The fix is designed but unshipped. This is the first thing I'd do next, and it cuts LLM cost as much as it cuts noise.

**No sub-workflow.** The clean seam exists and is documented; extraction is a small job. It's a bonus item I chose not to spend the time on.

**`blog_rss` and `news_query` now overlap.** Since five of six blog feeds became Google News queries, that source and the dedicated Google News node hit the same backend for the same company. Fingerprinting collapses the duplicates, so it's wasteful rather than broken — but it's redundancy I'd design out.

**Google News is deep but stale.** Median item age skews several days, feeds cap around 100 items with no pagination, and the redirect-token scheme is undocumented and has changed before without notice. Fine for this; I wouldn't build a business on it.

**GitHub is unauthenticated.** 60 requests/hour. Six competitors daily is comfortable, but adding competitors or increasing frequency needs a credential.

**Feed URLs will drift.** AI labs restructure their newsrooms constantly. The `error_log` sheet makes this visible rather than silent, which is the honest mitigation — it doesn't prevent breakage, it just makes breakage cheap to diagnose.

**The `Limit` node ships at 10.** Intentional cost cap for testing and demonstration. Production should be 40, or the node deleted so `MAX_ITEMS_PER_RUN` governs. Documented in three places because it's exactly the kind of thing that gets forgotten and then looks like a bug.

**Sheets doesn't scale.** Fine at a few thousand rows. `Read Seen Ledger` pulls the whole tab on every run, so at ~10k rows this needs a date-bounded read or a real database.

**Timezone is instance-dependent.** The trigger says 09:00; which 09:00 depends on the n8n instance setting. Should be pinned explicitly in workflow settings.

---

## Time spent

**Roughly 3.5 hours**, in one continuous session.

| Phase | Time | Notes |
|---|---|---|
| Scoping & source research | 25m | Verifying which APIs and feeds actually work in 2026 — Reddit and RSS availability were both surprises that changed the design |
| Architecture & first build | 45m | Registry, loop, four fetches, normaliser, data contract |
| AI stage — prompt, schema, rules engine | 35m | Most of this was tuning the priority rules after seeing 11/11 Critical |
| **Debugging duplicate emails** | **50m** | Two separate fan-in bugs; the single largest time sink and mostly self-inflicted by not reading the JSON sooner |
| Fixing RSS feeds | 20m | Discovering that five of six labs publish no feed at all |
| HTML email design & iteration | 20m | Layout, priority colours, the invisible-link fix |
| Testing & verification | 15m | Idempotency, deliberate-failure, and edge-case runs |

**Where the time actually went:** roughly a third on building and two thirds on debugging and verification. The 50 minutes on the email bug would have been five if I'd read the exported JSON's connections object at the start instead of squinting at a 39-node canvas. That's the transferable lesson from this build — **when a visual tool is lying to you, read the file.**
