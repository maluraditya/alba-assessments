# Database schema

## Normalization

The schema keeps companies, people, opportunities, activities, and tags in
separate relations. Deals reference one company and an optional primary
contact. Activities belong to a deal and may reference a contact. Deal-to-tag
membership is modeled by `deal_tags`, avoiding repeated tag arrays.

Every application table has:

- UUID primary key
- `created_at`
- `updated_at`, maintained by a trigger
- `owner_id`, referencing `auth.users`

## Integrity

- Enum types constrain deal stage and activity type.
- Values, probabilities, names, and tag colors have check constraints.
- Ownership-aware triggers reject cross-owner company, contact, deal, or tag
  relationships.
- Cascades remove dependent records where ownership cannot remain meaningful.
- Unique constraints prevent duplicate company names, emails, tags, and
  deal/tag memberships within a workspace.

## Indexes

Indexes target the access paths used by the UI:

- owner + updated time for recent lists
- owner + company and owner + person name for relationship lookup
- owner + stage and owner + close date for pipeline filters
- owner + due date for incomplete activity queues
- join-table indexes in both deal and tag directions

## Analytics contract

The `get_dashboard_analytics` RPC returns:

- headline metrics
- six-month closed-won revenue
- pipeline value and count by stage
- deal count by source
- recently completed activities

The frontend treats this payload as chart-ready data and does not recompute
business metrics in React.

## Authenticated search

`search_workspace(search_query)` searches the current user's companies,
contacts, and deals and returns at most twelve navigation-ready results. It is
`SECURITY INVOKER`, explicitly filters by `auth.uid()`, and is executable only
by the `authenticated` database role.

## Storage and edge functions

PipelineOS does not currently require file storage or Edge Functions. No
storage buckets are created. Structured CRM data and aggregate functions remain
in PostgreSQL; this keeps the deployed surface minimal and auditable.
