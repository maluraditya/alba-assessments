# Two-account RLS verification

Run these tests against a disposable local or staging Supabase project after
applying migrations and `seed.sql`. The hosted assessment migrations create
the same two isolated workspaces.

## Accounts

- Account A: `alex@pipelineos.demo`
- Account B: `sam@pipelineos.demo`
- Seed password: `PipelineOS-demo-2026!`

## Verification procedure

1. Sign in as Account A and create one company, contact, deal, activity, and tag.
2. Record only the generated UUIDs. Do not share the Account A session token.
3. Sign out and sign in as Account B.
4. List every table. Account A's rows must not appear.
5. Request each Account A UUID directly. Every select must return no row.
6. Attempt to update and delete each Account A UUID. No row may change.
7. Attempt to create an Account B contact linked to Account A's company UUID.
   The ownership trigger must reject it.
8. Repeat the relationship test for deal/company, activity/deal, and
   deal-tag/tag.
9. Call `get_dashboard_analytics()`. Its values must reflect only Account B.
10. Sign back in as Account A and confirm every original row still exists.

## Expected result

Account B can create and manage its own records but cannot observe, mutate,
delete, aggregate, or reference any Account A record.

## Hosted assessment evidence

The production assessment project is checked through the authenticated REST
API after migrations deploy:

- Account A can read its five companies and cannot read Account B's isolation
  test company by UUID.
- Account B can read its single isolation test company and cannot read any of
  Account A's five companies, including direct UUID requests.
- Anonymous inserts return PostgreSQL error `42501`.
- Anonymous analytics and search RPC calls return HTTP `401`.
- Cross-owner activity and deal-tag writes are rejected by ownership triggers.

Re-run this test after any policy, grant, relationship, or analytics migration.
