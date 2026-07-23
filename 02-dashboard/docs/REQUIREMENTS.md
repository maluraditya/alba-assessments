# Requirements checklist

This document maps the Alba Corp brief and the extended PipelineOS brief to concrete implementation evidence.

## Core requirements

- [x] **Structured multi-entity product** — normalized CRM with profiles, companies, contacts, deals, activities, tags, and deal tags.
- [x] **Full CRUD** — authenticated repository operations and working create/edit/delete UI for companies, contacts, deals, and activities; tags and profiles use the same reusable repository.
- [x] **Handled mutation feedback** — optimistic updates/deletes roll back on errors; creates show pending states; successful actions use toasts.
- [x] **Meaningful charts** — monthly closed-won revenue, pipeline value by stage, lead-to-win funnel, deals by source, and activity velocity use Recharts.
- [x] **Beautiful, fluid UI** — responsive product shell, purposeful spacing, Framer Motion transitions, keyboard focus, reduced-motion support, loading skeletons, error recovery, and empty states.
- [x] **Backend as source of truth** — no local CRM JSON, browser storage, or mock-data fallback; all persisted data is read from and written to Supabase.
- [x] **Complete data-model documentation** — schema, types, constraints, indexes, relationships, functions, migration order, ERD, and deployment configuration are documented.

## Advanced options

- [x] **Authentication** — email/password registration, email confirmation callback, login, logout, session refresh, forgot-password email, and password update.
- [x] **Secure isolated data** — RLS is enabled on all seven tables with four explicit policies per table; ownership triggers prevent cross-user relationships.
- [x] **Security boundary proof** — anonymous access and cross-account access are covered by the documented live two-account procedure and automated schema assertions.
- [x] **Server-computed analytics** — security-invoker SQL views and `get_dashboard_analytics()` return chart-ready aggregates; React does not aggregate raw CRM records.
- [ ] **Real-time subscriptions** — not selected; the submission uses RLS and server analytics as its advanced options.
- [ ] **File storage** — not selected; the current CRM scope has no required file workflow.

## Extended PipelineOS requirements

- [x] Next.js App Router, strict TypeScript, Tailwind CSS, shadcn-style primitives, Framer Motion, Supabase, Recharts, React Hook Form, Zod, and Lucide.
- [x] UUID, `created_at`, `updated_at`, and `owner_id` on every application entity.
- [x] Company → contacts; company/contact → deals; deal/contact → activities; deals ↔ tags through `deal_tags`.
- [x] Dashboard, Companies, Contacts, Deals, Activities, Analytics, Settings, Login, auth callback, and password-reset pages.
- [x] Global authenticated search and `Cmd/Ctrl+K` command menu.
- [x] Filters, sorting, pagination, dialogs, toast notifications, and keyboard shortcuts.
- [x] Server Components for initial reads and client components only for interaction.
- [x] Bounded range queries and owner-aligned database indexes.
- [x] Semantic tables, labels, ARIA names, keyboard focus, and reduced-motion behavior.
- [x] README, ERD, schema guide, migration SQL, RLS catalogue, architecture diagram, security test, and deployment guide.
- [x] No inline application SQL, no owner-ID magic constants, no duplicated frontend dataset, and no second database stack.

## Known next-stage work

- [ ] Visual redesign and dark-mode theme system.
- [ ] Cursor-based pagination for workspaces exceeding the current bounded server read.
- [ ] Optional Supabase Realtime subscriptions.
- [ ] Optional private attachment storage with bucket RLS.
- [ ] Production observability, rate limits, backup policy, and CI-hosted browser tests.
- [ ] Production Lighthouse measurement after a public deployment URL is finalized.
