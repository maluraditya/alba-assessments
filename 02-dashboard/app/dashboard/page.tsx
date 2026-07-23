import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { loadDashboard } from "@/lib/data/loaders";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const data = await loadDashboard();
  return <DashboardView analytics={data.analytics} deals={data.deals} activities={data.activities} profile={data.profile} />;
}
