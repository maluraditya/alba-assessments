# Architecture

PipelineOS uses the Next.js App Router for the product surface and Supabase for
identity, PostgreSQL persistence, and row-level authorization.

```mermaid
flowchart LR
  U["Authenticated user"] --> UI["Next.js App Router"]
  UI --> SC["Server Components"]
  UI --> CC["Interactive Client Components"]
  CC --> AUTH["Supabase Auth"]
  SC --> REPO["Typed data services"]
  CC --> REPO
  REPO --> API["Supabase PostgREST / RPC"]
  API --> RLS["PostgreSQL Row Level Security"]
  RLS --> DB[("Normalized PostgreSQL tables")]
  DB --> VIEWS["Security-invoker views"]
  DB --> RPC["Dashboard analytics RPC"]
  VIEWS --> API
  RPC --> API
  CC --> SEARCH["Authenticated search RPC"]
  SEARCH --> RLS
```

## Frontend

- Server Components own the default page composition and initial reads.
- Client Components are limited to workflows that need interaction: authenticated
  command search, filtering, sorting, forms, optimistic writes, and charts.
- Suspense-ready boundaries and skeleton primitives support streaming without
  forcing the whole application into client rendering.
- Reusable shell, cards, buttons, badges, toolbars, charts, forms, and
  repositories avoid route-level duplication.

## Data access

`lib/data/service.ts` exposes authenticated repositories for each entity. Every
operation first verifies the Supabase user. The browser receives only the
anonymous project key; PostgreSQL RLS remains the authority for authorization.

The application never adds inline SQL. Database behavior belongs in versioned
migrations under `supabase/migrations/`.

## Analytics

React does not aggregate raw CRM records. PostgreSQL provides:

- `monthly_revenue`
- `pipeline_by_stage`
- `deal_conversion`
- `average_sales_cycle`
- `get_dashboard_analytics()`

The RPC performs one authenticated round trip and returns chart-ready JSON.
Views use `security_invoker = true`, preserving table RLS.

## Performance

- Compound owner/date and owner/stage indexes match common filters.
- Tables paginate with bounded ranges; production defaults to 20 records.
- Joins are selected intentionally through explicit relationship projections.
- Analytics are aggregated near the data and returned in a single payload.
- Mutations update the Supabase source of truth. Optimistic updates and deletes
  roll back when the database rejects a request.

## Authentication lifecycle

The browser uses Supabase email/password authentication. Sign-up includes the
profile display name and confirmation callback; the proxy refreshes session
cookies; protected Server Components verify the user before reading data;
password recovery returns through the callback to the reset page; and sign-out
clears the session before returning to login.
