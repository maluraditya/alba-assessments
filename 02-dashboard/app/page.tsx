import { DashboardView } from "@/components/dashboard/dashboard-view";
import { loadDashboard } from "@/lib/data/loaders";

export default async function Home() {
  const data = await loadDashboard();
  return <DashboardView analytics={data.analytics} deals={data.deals} activities={data.activities} profile={data.profile} />;
}
