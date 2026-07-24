# Alba Assessments

This repository contains three complete assessment deliverables: a public-data company intelligence application, a secure sales-pipeline dashboard, and an automated competitive-intelligence workflow. Together they demonstrate product design, full-stack engineering, data modelling, AI-assisted analysis, workflow automation, testing, security, and production handoff.

Each numbered folder is intentionally self-contained. The projects share a common theme—turning fragmented business data into useful decisions—but they do **not** depend on one another at runtime. A reviewer can inspect, run, deploy, or import any deliverable independently.

## At a glance

| Folder | Deliverable | What it answers | Primary stack | Status |
| --- | --- | --- | --- | --- |
| [`01-web-app`](./01-web-app) | **Signal** — company intelligence web app | “What can public evidence tell me about this company?” | Next.js, TypeScript, public APIs, Gemini | Complete; deployable to Vercel |
| [`02-dashboard`](./02-dashboard) | **PipelineOS** — sales pipeline CRM and analytics dashboard | “What is happening in my revenue pipeline, and what needs attention?” | Next.js, Supabase, PostgreSQL, Recharts | Complete; deployable to Vercel + Supabase |
| [`03-n8n-workflow`](./03-n8n-workflow) | **AI Competitive Intelligence Digest** | “What changed across key AI competitors since the last briefing?” | n8n, Gemini, Google Sheets, Gmail | Complete; importable into n8n |

## Repository structure

```text
alba-assessments/
├── 01-web-app/          Signal: public-data company intelligence
├── 02-dashboard/        PipelineOS: authenticated CRM and analytics
├── 03-n8n-workflow/     Daily AI competitive-intelligence automation
└── README.md            Consolidated portfolio guide (this file)
```

The numbered order reflects the assessment sequence, not a deployment dependency:

1. **Research:** Signal resolves a company and composes a source-aware intelligence brief.
2. **Operate:** PipelineOS helps a revenue team manage and analyse its own customer pipeline.
3. **Monitor:** The n8n workflow collects new competitor activity and delivers a daily ranked digest.

## 01 — Signal

Signal turns scattered public company data into a concise, evidence-aware report. A user searches for a company; the application resolves its identity, gathers independent public signals in parallel, normalises them, and uses Gemini to create a grounded synthesis. When an optional source or the AI layer fails, the rest of the report remains available.

### What it includes

- Global company search using Wikidata, GLEIF, official-domain discovery, and website metadata
- Public-signal fusion across Wikipedia, Wikidata, GLEIF, GitHub, Google News RSS, REST Countries, and company websites
- Evidence-constrained Gemini summaries with a deterministic non-AI fallback
- Shareable company URLs and a programmatic company-report endpoint
- Per-source loading, empty, unavailable, and rate-limit states
- Responsive editorial UI, keyboard navigation, reduced-motion support, metadata, sitemap, and social preview
- Server-only credentials, schema validation, caching, timeouts, bounded retries, and graceful degradation

### How it works

```text
Search request
    ↓
Resolve company identity
    ↓
Collect independent public evidence in parallel
    ↓
Normalise source results and isolate failures
    ↓
Generate a grounded brief, or use the deterministic fallback
    ↓
Render a shareable company report
```

### Run locally

Requirements: Node.js 20.9 or newer.

```bash
cd 01-web-app
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Configure the optional and production variables described in [`01-web-app/.env.example`](./01-web-app/.env.example). Never commit `.env.local` or real credentials.

### Verify and deploy

```bash
cd 01-web-app
npm run check
```

For Vercel, import this repository and set **Root Directory** to `01-web-app`. Add the production environment variables, including the deployed application URL and this repository URL, before the final smoke test.

The final local mobile Lighthouse audit recorded **97 Performance, 100 Accessibility, 100 Best Practices, and 100 SEO**. The implementation includes nine Vitest tests plus strict TypeScript, zero-warning lint, formatting, and production-build checks.

### Detailed documentation

- [Project README](./01-web-app/README.md)
- [Build log and trade-offs](./01-web-app/BUILD_LOG.md)
- [Submission documentation](./01-web-app/docs/12_SUBMISSION_DOCUMENTATION.md)
- [Assessment checklist](./01-web-app/docs/ASSESSMENT_CHECKLIST.md)
- [Technical and product documentation (DOCX)](./01-web-app/docs/Signal_Technical_and_Product_Documentation.docx)

## 02 — PipelineOS

PipelineOS is an authenticated sales-pipeline workspace for companies, contacts, deals, activities, and tags. It combines full CRUD workflows with server-computed analytics and treats PostgreSQL Row Level Security as the authorization boundary between user workspaces.

### What it includes

- Email/password sign-up, confirmation, sign-in, sign-out, and password recovery
- Supabase-backed CRUD for companies, contacts, deals, activities, tags, and deal-tag relationships
- Owner-isolated Row Level Security on every application table
- Relationship triggers that prevent cross-owner foreign-key references
- Server-computed revenue, pipeline, source, conversion, and activity analytics
- Authenticated global search and user-scoped JSON export
- Responsive charts, filters, sorting, pagination, dialogs, toasts, optimistic mutations, and rollback
- Versioned database migrations and deterministic synthetic assessment data

### How it works

```text
Authenticated browser
    ↓
Next.js Server Components and validated mutations
    ↓
Authenticated Supabase client
    ↓
PostgreSQL tables, RLS policies, triggers, views, and RPC functions
    ↓
User-scoped records and chart-ready aggregates
```

### Run locally

Requirements: Node.js 22.13 or newer, a Supabase project or local Supabase CLI environment, and the variables listed in `02-dashboard/.env.example`.

```bash
cd 02-dashboard
npm install
cp .env.example .env.local
supabase start
supabase db reset
npm run dev
```

PipelineOS deliberately has no local JSON fallback: Supabase configuration and an authenticated session are required. The bundled seed is for local or disposable assessment environments only and must be removed before handling real customer data.

### Verify and deploy

```bash
cd 02-dashboard
npm run check
```

Deployment has two coordinated parts:

1. Apply the versioned migrations to Supabase, using `02-dashboard` as the GitHub integration working directory.
2. Deploy the application to Vercel with **Root Directory** set to `02-dashboard` and configure the Supabase URL and publishable key.

The release gate covers strict TypeScript, ESLint, both supported builds, repository contract tests, authenticated CRUD, global-search isolation, and a two-account RLS test. The median local production Lighthouse audit recorded **95 Performance, 100 Accessibility, 96 Best Practices, and 100 SEO**.

### Detailed documentation

- [Project README](./02-dashboard/README.md)
- [Build log and trade-offs](./02-dashboard/docs/BUILD_LOG.md)
- [Architecture](./02-dashboard/docs/ARCHITECTURE.md)
- [Database design](./02-dashboard/docs/DATABASE.md)
- [Entity relationship diagram](./02-dashboard/docs/ERD.md)
- [Security verification](./02-dashboard/docs/SECURITY_TEST.md)
- [Deployment guide](./02-dashboard/docs/DEPLOYMENT.md)
- [Technical and product documentation (DOCX)](./02-dashboard/docs/PipelineOS_End-to-End_Documentation.docx)

## 03 — AI Competitive Intelligence Digest

The third deliverable is a 39-node n8n workflow that runs every morning, watches six AI-lab competitors across four public source types, filters out previously reported stories, analyses genuinely new items with Gemini, records the results, and sends one priority-ranked HTML briefing.

It monitors Anthropic, Google DeepMind, xAI, Perplexity, Mistral AI, and Cohere from the perspective of an OpenAI strategy team. Competitors, schedule, limits, recipient, and data destinations can all be reconfigured after import.

### What it includes

- Daily 09:00 schedule in the n8n instance timezone, plus manual execution for testing
- Company/publisher news feeds, GitHub activity, Hacker News, and Google News collection
- One normalized data contract across heterogeneous source payloads
- Fingerprint-based deduplication and a persistent seen ledger for idempotency
- Gemini analysis with structured output and deterministic priority rules
- Cost control through a test-time limit of 10 AI-analysed items per run
- Google Sheets history, seen-ledger, and error-log tabs
- One responsive HTML email ordered Critical → High → Medium → Low
- Per-source retry and handled-error branches, allowing partial success

### How it works

```text
09:00 schedule or manual run
    ↓
Loop through six competitors and collect four source types
    ↓
Normalise, deduplicate, sort, and remove seen fingerprints
    ↓
Apply the cost cap and analyse new items with Gemini
    ↓
Validate output and assign deterministic priority
    ↓
Write history + seen ledger, build one report, send one email
```

### Import and configure

Requirements: n8n 1.60 or newer, Google Sheets and Gmail access, and a Gemini API key.

1. In n8n, choose **Workflows → Import from File**.
2. Import [`AI Competitive Intelligence Digest - Alba Corp.json`](./03-n8n-workflow/AI%20Competitive%20Intelligence%20Digest%20-%20Alba%20Corp.json).
3. Create/select the Gemini, Google Sheets OAuth, and Gmail OAuth credentials.
4. Create the required `history`, `seen_ledger`, and `error_log` sheet tabs with the exact headers documented in the project README.
5. Update all Sheets nodes, the email recipient, and—if desired—the competitor registry.
6. Run manually before activating the daily schedule.

The exported workflow contains credential references, not secrets. Still review and replace spreadsheet IDs, addresses, and instance-specific configuration before publishing or sharing a modified export.

### Verify and operate

On the first manual run, confirm that every node after the competitor loop executes exactly once, one email arrives, and `history` and `seen_ledger` grow by the same number of rows. Immediately run it again: no second email and no additional rows is the key idempotency test. A deliberately broken feed should add an `error_log` row without stopping the other competitors.

The workflow ships with a 10-item LLM limit for economical testing. Raise it to 40—or remove that node and rely on `MAX_ITEMS_PER_RUN`—only after the end-to-end checks pass.

### Detailed documentation

- [Project README and complete node walkthrough](./03-n8n-workflow/README.md)
- [Build log, debugging notes, and trade-offs](./03-n8n-workflow/BUILD_LOG.md)
- [Importable n8n workflow](./03-n8n-workflow/AI%20Competitive%20Intelligence%20Digest%20-%20Alba%20Corp.json)
- [Workflow documentation (PDF)](./03-n8n-workflow/AI%20Competitive%20Intelligence%20Digest%20N8N%20Workflow%20Documentation.pdf)

## Build chronology and effort

The three deliverables were completed as focused assessment builds and then hardened through testing, debugging, documentation, and deployment-oriented review.

| Deliverable | Approximate effort | Main time investment |
| --- | ---: | --- |
| Signal | ~4 hours | Identity resolution, resilient API fusion, UI/accessibility, testing, and documentation |
| PipelineOS | ~4.5 hours | Schema/RLS, CRUD and analytics, UI iteration, deployment compatibility, and security verification |
| AI Competitive Intelligence Digest | ~3.5 hours | Workflow architecture, source research, fan-in debugging, idempotency, and email verification |
| **Combined** | **~12 hours** | Three independent, documented, reviewer-ready deliverables |

These figures are implementation journals rather than promises of production delivery time. See each build log for the detailed sequence, dead ends, decisions, and follow-up opportunities.

## Shared engineering principles

Although the implementations differ, the same principles run through all three:

- **Evidence before synthesis:** AI output is grounded in collected data and validated before use.
- **Failure isolation:** one unavailable provider, feed, or panel should not destroy an otherwise useful result.
- **Explicit contracts:** TypeScript/Zod schemas, SQL relationships, and the workflow’s normalized item shape define boundaries clearly.
- **Security by construction:** secrets stay out of the repository; server-side services and database policies enforce access.
- **Reproducible verification:** every deliverable includes a release checklist or manual proof sequence, not only implementation code.
- **Honest limitations:** known source, scale, deployment, and testing constraints are documented beside the relevant project.

## Recommended review path

For a quick review, use this order:

1. Read the “At a glance” table above.
2. Open each project README for screenshots, architecture, and feature-level detail.
3. Review each build log for scope decisions, trade-offs, time spent, and debugging evidence.
4. Run `npm run check` in each web project.
5. Import the n8n JSON into a credential-free test instance, configure test destinations, and perform the two-run idempotency check.
6. Consult the DOCX/PDF handoff documents for standalone, reviewer-ready documentation.

## Security and responsible use

- Do not commit `.env.local`, service-role keys, OAuth tokens, API keys, customer records, or production exports.
- Treat the PipelineOS demo data as synthetic assessment fixtures; remove it before using the system with real users.
- Review the n8n export for spreadsheet IDs, recipient addresses, and credential references before sharing a fork.
- Respect upstream API terms, quotas, and feed availability. Public data does not imply unlimited or permanent access.
- Keep AI summaries reviewable and source-linked; none of these projects should be treated as an autonomous decision-maker.

## Current status

All three assessment folders are implemented and documented. The web projects include repeatable quality commands and deployment guides; the automation includes an importable workflow, setup instructions, verification steps, a PDF guide, and a build journal. Project-specific known limitations and suggested next steps remain in the respective READMEs and build logs.
