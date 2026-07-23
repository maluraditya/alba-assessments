import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function source(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

test("ships product metadata and no starter preview marker", async () => {
  const layout = await source("app/layout.tsx");
  assert.match(layout, /PipelineOS/);
  assert.match(layout, /secure sales pipeline/);
  assert.doesNotMatch(layout, /codex-preview/);
  await assert.rejects(
    access(path.join(root, "app/_sites-preview/SkeletonPreview.tsx")),
  );
});

test("uses Supabase as the only CRM source of truth", async () => {
  await assert.rejects(access(path.join(root, "lib/demo-data.ts")));
  const loaders = await source("lib/data/loaders.ts");
  assert.doesNotMatch(loaders, /demoCompanies|demoDeals|demoAnalytics/);
  const service = await source("lib/data/service.ts");
  assert.match(service, /async create\(/);
  assert.match(service, /async update\(/);
  assert.match(service, /async delete\(/);
  assert.match(service, /dealTags: new OwnedRepository/);
});

test("includes the complete email authentication lifecycle", async () => {
  const login = await source("components/auth/login-form.tsx");
  assert.match(login, /signInWithPassword/);
  assert.match(login, /signUp/);
  assert.match(login, /resetPasswordForEmail/);
  const sidebar = await source("components/layout/sidebar.tsx");
  assert.match(sidebar, /signOut/);
  await access(path.join(root, "app/auth/reset/page.tsx"));
  await access(path.join(root, "proxy.ts"));
});

test("includes every required product route", async () => {
  const routes = [
    "dashboard",
    "companies",
    "contacts",
    "deals",
    "activities",
    "analytics",
    "settings",
  ];
  await Promise.all(
    routes.map((route) => access(path.join(root, "app", route, "page.tsx"))),
  );
});

test("enables owner-isolated RLS on every application table", async () => {
  const migration = await source(
    "supabase/migrations/202607240002_rls.sql",
  );
  const tables = [
    "profiles",
    "companies",
    "contacts",
    "deals",
    "activities",
    "tags",
    "deal_tags",
  ];
  for (const table of tables) {
    assert.match(
      migration,
      new RegExp(`alter table public\\.${table} enable row level security`),
    );
    assert.match(
      migration,
      new RegExp(`create policy "${table}_select_own"`),
    );
    assert.match(
      migration,
      new RegExp(`create policy "${table}_insert_own"`),
    );
    assert.match(
      migration,
      new RegExp(`create policy "${table}_update_own"`),
    );
    assert.match(
      migration,
      new RegExp(`create policy "${table}_delete_own"`),
    );
  }
});

test("keeps analytics in PostgreSQL", async () => {
  const schema = await source(
    "supabase/migrations/202607240001_initial_schema.sql",
  );
  assert.match(schema, /create or replace view public\.monthly_revenue/);
  assert.match(schema, /create or replace view public\.pipeline_by_stage/);
  assert.match(schema, /create or replace view public\.deal_conversion/);
  assert.match(schema, /create or replace view public\.average_sales_cycle/);
  assert.match(
    schema,
    /create or replace function public\.get_dashboard_analytics/,
  );
  assert.match(schema, /security invoker/);
});

test("global search is authenticated and server-computed", async () => {
  const migration = await source("supabase/migrations/202607240006_authenticated_global_search.sql");
  assert.match(migration, /security invoker/);
  assert.match(migration, /owner_id = auth\.uid\(\)/);
  assert.match(migration, /revoke all on function public\.search_workspace\(text\) from anon/);
  assert.match(migration, /grant execute on function public\.search_workspace\(text\) to authenticated/);
});
