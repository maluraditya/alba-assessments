import { redirect } from "next/navigation";
import type { Activity, AnalyticsPayload, Company, Contact, Deal, Profile } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getDashboardAnalytics } from "./analytics";
import { repositories } from "./service";

export { isSupabaseConfigured };

async function authenticatedRepositories() {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) redirect("/login");
  return { client, repos: repositories(client) };
}

export async function loadCompanies(): Promise<Company[]> {
  const { repos } = await authenticatedRepositories();
  return (await repos.companies.list({ pageSize: 50 })).data;
}

export async function loadContacts(): Promise<Contact[]> {
  const { repos } = await authenticatedRepositories();
  return (await repos.contacts.list({ pageSize: 50 })).data;
}

export async function loadDeals(): Promise<Deal[]> {
  const { repos } = await authenticatedRepositories();
  return (await repos.deals.list({ pageSize: 50 })).data;
}

export async function loadActivities(): Promise<Activity[]> {
  const { repos } = await authenticatedRepositories();
  return (await repos.activities.list({ pageSize: 50 })).data;
}

export async function loadAnalytics(): Promise<AnalyticsPayload> {
  const { client } = await authenticatedRepositories();
  return getDashboardAnalytics(client);
}

export async function loadDashboard() {
  const { client, repos } = await authenticatedRepositories();
  const [analytics, deals, activities, profiles] = await Promise.all([
    getDashboardAnalytics(client),
    repos.deals.list({ pageSize: 4 }),
    repos.activities.list({ pageSize: 4 }),
    repos.profiles.list({ pageSize: 1 }),
  ]);
  return { analytics, deals: deals.data, activities: activities.data, profile: profiles.data[0] };
}

export async function requirePageUser() {
  return authenticatedRepositories();
}

export async function loadProfile(): Promise<Profile> {
  const { repos } = await authenticatedRepositories();
  const result = await repos.profiles.list({ pageSize: 1 });
  if (!result.data[0]) throw new Error("Profile not found");
  return result.data[0];
}
