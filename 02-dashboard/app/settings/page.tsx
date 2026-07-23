import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { SettingsForm } from "@/components/settings/settings-form";
import { loadProfile } from "@/lib/data/loaders";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const profile = await loadProfile();
  return <AppShell><div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10"><PageHeader eyebrow="Workspace" title="Settings" description="Manage your profile, workspace preferences, and security posture." /><SettingsForm profile={profile} /></div></AppShell>;
}
