# PipelineOS

PipelineOS is a production-oriented sales pipeline dashboard built with Next.js, TypeScript, Tailwind CSS, Supabase, Recharts, Framer Motion, React Hook Form, and Zod.

It is a focused CRM workspace rather than a generic admin template: authenticated users manage companies, contacts, deals, activities, and tags; PostgreSQL Row Level Security isolates every workspace; and PostgreSQL produces chart-ready analytics through authenticated functions and security-invoker views.

## Features

- Complete Supabase-backed create, read, update, and delete workflows
- Optimistic updates and deletes with rollback on request failure
- Email/password sign-up, confirmation callback, sign-in, sign-out, and password recovery
- Owner-isolated RLS across all seven application tables
- Cross-owner relationship validation for every foreign-key workflow
- Server-computed revenue, pipeline, source, conversion, and activity analytics
- Authenticated global search through a PostgreSQL RPC
- Responsive charts, filters, sorting, pagination, dialogs, toasts, and keyboard navigation
- Server Components for initial reads, bounded queries, loading states, empty states, and error recovery
- Authenticated JSON export containing only the current user's rows

## Why Supabase

Supabase provides PostgreSQL relationships, SQL analytics, email authentication, Row Level Security, migration-based infrastructure, and a production API in one service. The browser receives only the publishable key; PostgreSQL remains the authorization boundary.

## Local setup

1. Install Node.js 22.13 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and add the Supabase project URL and publishable key.
4. Run `supabase start` and `supabase db reset`, or apply every migration in `supabase/migrations/` in timestamp order.
5. Run `npm run dev`.

The application does not fall back to local JSON or mock CRM records. Supabase configuration and an authenticated session are required.

## Demo data

`supabase/seed.sql` is deterministic development/test data for local or disposable environments. The hosted assessment project also contains an isolated synthetic workspace created by a versioned migration. Demo records live in Supabase and are protected by the same RLS policies as every other workspace; no demo dataset is bundled into the frontend.

Remove assessment accounts and seed migrations before adapting this repository for real customer data.

## Quality commands

- `npm run typecheck` — strict TypeScript verification
- `npm run lint` — ESLint and React rules
- `npm test` — production build and repository contract tests
- `npm run check` — complete local quality gate

## Documentation

- [Requirements checklist](docs/REQUIREMENTS.md)
- [Database schema](docs/DATABASE.md)
- [Entity relationship diagram](docs/ERD.md)
- [Architecture](docs/ARCHITECTURE.md)
- [RLS verification](docs/SECURITY_TEST.md)
- [Deployment guide](docs/DEPLOYMENT.md)

## Repository layout

```text
app/                 App Router pages, auth callbacks, loading and errors
components/          Feature, layout, chart, form, and UI components
hooks/               Reusable optimistic collection state
lib/data/            Authenticated repositories, loaders, and analytics client
lib/supabase/        Browser and server Supabase clients
supabase/migrations/ Versioned schema, RLS, RPC, fixes, and assessment seed
supabase/seed.sql    Deterministic local test data
docs/                Schema, architecture, security, deployment, checklist
tests/               Build-time repository contract tests
```

## Security model

Every persisted entity carries `owner_id`. Each table has explicit authenticated policies for select, insert, update, and delete using `auth.uid()`. Relationship triggers prevent cross-owner foreign-key references. Analytics and search use `SECURITY INVOKER`; execution is revoked from `PUBLIC` and `anon` and granted only to `authenticated`.
