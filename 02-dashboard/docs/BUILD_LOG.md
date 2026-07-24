# Build Log: PipelineOS

## Goal & scope decision

I chose to build PipelineOS, a focused sales-pipeline CRM for a small revenue team. Sales data naturally fits the assignment because it has several related entities, clear CRUD workflows, useful aggregations, and a meaningful security boundary between user workspaces.

The implemented scope includes companies, contacts, deals, activities, tags, dashboards, global search, authentication, owner-isolated Row Level Security, and server-computed analytics. I deliberately left out Realtime subscriptions and file attachments because authentication, RLS, and SQL analytics provided a stronger demonstration of backend capability within the assessment scope. The final product uses a consistent light interface; dark mode was removed after visual review in favor of one polished theme.

## Stack & tooling

- **Next.js App Router and TypeScript** — Server Components handle authenticated initial reads while Client Components are limited to forms, charts, command-menu interaction, and optimistic updates. Strict TypeScript catches integration errors before deployment.
- **Tailwind CSS and shadcn-style primitives** — used to create a cohesive product interface without introducing a generic administration template.
- **Supabase** — provides PostgreSQL, relationships, migrations, authentication, Row Level Security, REST access, and SQL functions in one production service.
- **Recharts** — renders the pipeline funnel, revenue trend, source mix, pipeline coverage, and activity-velocity charts from backend aggregates.
- **React Hook Form and Zod** — provide reusable form state and validation for CRM mutations.
- **Framer Motion** — adds restrained list and state transitions, with reduced-motion support.
- **Lucide** — supplies a consistent accessible icon system.
- **Vercel** — hosts the native Next.js production deployment.
- **Supabase CLI and GitHub integration** — keep schema, RLS, functions, and seed fixtures reproducible through versioned SQL.
- **OpenAI Codex** — assisted with implementation, repository inspection, UI iteration, test creation, deployment diagnosis, and documentation. Every generated change was reviewed through TypeScript, lint, builds, automated assertions, or live backend checks before release.

## Key decisions & trade-offs

- **Decision: use a normalized PostgreSQL schema** because the product needs enforceable relationships between companies, contacts, deals, activities, and tags. The alternative considered was a flatter deal-centric model, which would have duplicated company and contact data and weakened relationship queries.
- **Decision: place `owner_id` on every application table** because workspace isolation should be explicit and easy to audit. Relying only on ownership inherited through a parent record would have produced more complicated policies and greater risk of accidental cross-user access.
- **Decision: combine RLS policies with ownership-validation triggers** because RLS protects row access while triggers also prevent a user from creating a relationship to another user's foreign key. RLS alone was not sufficient for this relationship-level invariant.
- **Decision: compute analytics in PostgreSQL** because the brief asks the backend to do real work and returning chart-ready aggregates reduces browser payloads. Pulling every deal into React and aggregating it there was considered but rejected.
- **Decision: use authenticated repository services** because one reusable CRUD abstraction keeps authentication checks, pagination, error handling, and table access consistent. Direct Supabase calls scattered throughout page components would have created duplication.
- **Decision: make the application shell persistent in the root layout** because the sidebar and global-search header should not disappear during route transitions. Page-level shells were simpler initially, but they caused visible unmounting whenever a loading boundary appeared.
- **Decision: support the current Supabase publishable key and the legacy anonymous-key variable** because hosted projects may use either credential format. The service-role key is never shipped to the browser.
- **Decision: keep a single light visual system** because visual testing showed that mixing dark feature panels with light cards made the product feel inconsistent. A dual-theme system was deferred rather than shipping two less-refined themes.
- **Decision: maintain native Next.js and Sites-compatible build targets** because Vercel expects `.next`, while the existing repository workflow also included a Vinext/Cloudflare-compatible target. The native Next.js build is the production default.

## Hard parts / dead ends

- **Supabase GitHub integration initially showed no tables.** The integration needed `02-dashboard` as its working directory because that folder contains `supabase/`. Migrations deploy through the integration, but `supabase/seed.sql` is not automatically executed on the hosted project, so assessment demo workspaces were also represented through versioned migrations.
- **The first Vercel build used a missing generated Vite plugin.** `vite.config.ts` imported from an ignored `build/` directory. The plugin was moved into a committed `config/` directory and covered by a regression test.
- **Vercel then expected `.next`, but the default build produced a Vinext bundle.** The production build command was changed to native `next build`, with the alternate bundle retained as `build:sites`.
- **Authenticated pages failed during prerender with “Supabase is not configured.”** Configuration validation ran before Next.js observed request-bound APIs. Supabase configuration was centralized, authenticated routes were made explicitly dynamic, and the server client now reads request cookies before validating configuration.
- **Google-hosted fonts introduced a build-time network dependency.** A restricted production simulation failed while downloading three fonts. The UI was moved to high-quality system font stacks so builds are self-contained.
- **The original authentication form sent password resets from the sign-in screen.** This gave users little feedback. Recovery was changed into an email-only screen followed by a dedicated inbox confirmation state and the existing new-password page.
- **Chart hover content had unreadable text.** Recharts tooltip styling was inconsistent across charts. A shared black-background, white-text tooltip theme fixed contrast and removed per-chart drift.
- **Dashboard and Analytics initially overlapped too much.** The dashboard was redesigned as an operational command center with a conversion funnel, channel mix, execution velocity, priority queue, and next commitments. Analytics remains the deeper server-aggregated reporting surface.

## How I verified it works

- Ran strict TypeScript checking and ESLint after each production change.
- Ran both the native Next.js/Vercel build and the Vinext/Sites-compatible build.
- Added repository contract tests covering required routes, deployment configuration, persistent layout behavior, the authentication lifecycle, RLS coverage, backend analytics, global search security, and the absence of frontend demo-data fallbacks.
- Verified hosted authentication using two demo accounts with intentionally different workspaces.
- Confirmed Alex can read 9 companies, 9 contacts, 13 deals, 13 activities, and 3 tags.
- Confirmed Sam can read 4 companies, 3 contacts, 7 deals, 8 activities, and 2 tags.
- Queried each account for the other account's company rows and received zero results in both directions.
- Confirmed `get_dashboard_analytics()` returns authenticated, account-specific aggregates for both users.
- Performed reversible create, update, and delete checks against hosted Supabase for companies, contacts, deals, activities, tags, and `deal_tags`; all temporary verification rows were removed.
- Verified anonymous access is rejected and cross-owner relationship writes are blocked by database rules.
- Monitored GitHub-triggered Vercel deployments through completion and confirmed the native production build succeeds even when environment variables are absent during build-time analysis.
- Manually reviewed responsive layouts, empty states, loading skeletons, persistent sidebar navigation, chart tooltips, sign-up confirmation, login/logout, and password-recovery states.

### Lighthouse results

Lighthouse 12.8.2 was run three times against the `/login` route from the native Next.js production build using its default mobile profile. The table reports the median result so a single unusually fast or slow run does not determine the submission score.

Scores are out of 100; Lighthouse considers scores of 90 or above to be in its highest, green rating band.

| Category | Median score |
| --- | ---: |
| Performance | **95** |
| Accessibility | **100** |
| Best Practices | **96** |
| SEO | **100** |

Median lab metrics were approximately **0.8 s FCP**, **2.9 s LCP**, **130 ms Total Blocking Time**, **0 CLS**, and **1.5 s Speed Index**. The audit used the same compiled production output deployed by Vercel. The generated Vercel deployment URL currently requires Vercel authentication for unauthenticated visitors, so the audit was executed against the local production server rather than scoring Vercel's protection page.

With more time, I would add Playwright coverage for complete browser-based authentication and CRUD flows, run those tests in CI against a disposable Supabase branch, and add automated accessibility checks.

## Known limitations

- Supabase Realtime subscriptions are not implemented; users see committed data after a mutation or navigation rather than cross-tab live updates.
- File attachments and Supabase Storage are not included because the selected CRM workflows do not require them for the assessment.
- Server reads are deliberately bounded and the UI provides pagination, but very large workspaces would benefit from cursor-based pagination and URL-persisted filters.
- The product currently ships one polished light theme rather than light and dark modes.
- The project does not yet include production error monitoring, alerting, point-in-time recovery configuration, or application-level rate-limit dashboards.
- Authentication email delivery still depends on the Supabase email provider and its production SMTP configuration.
- The generated Vercel deployment URL is protected by Vercel authentication for unauthenticated visitors; external Lighthouse services can audit the hosted page after that protection is disabled.
- Demo accounts and synthetic seed rows are assessment fixtures and must be removed before onboarding real customers.

## Time spent

The initial end-to-end build took approximately **2.5 hours**. Review-driven UI refinement and production hardening took approximately **1.5 hours**, followed by **30 minutes** of final documentation and security verification, for roughly **4.5 hours total**.

- Product scope, schema, and architecture: ~20 minutes
- Supabase migrations, authentication, RLS, and seed workspaces: ~45 minutes
- CRUD services, forms, search, and route implementation: ~45 minutes
- SQL analytics, charts, and dashboard composition: ~40 minutes
- Documentation and security verification: ~30 minutes
- UI iteration, authentication UX, deployment diagnosis, and production hardening: ~90 minutes

The extra time beyond the original assessment window went primarily into deployment compatibility, live security verification, and interface iteration rather than expanding the product scope.
