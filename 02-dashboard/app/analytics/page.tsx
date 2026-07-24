import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { PipelineChart } from "@/components/charts/pipeline-chart";
import { SourceChart } from "@/components/charts/source-chart";
import { loadAnalytics } from "@/lib/data/loaders";
import { formatCompactCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const { metrics, monthlyRevenue, pipelineByStage, dealsBySource, activitiesCompleted } = await loadAnalytics();
  const totalActivities = activitiesCompleted.reduce((sum, item) => sum + item.completed, 0);
  return (
    <AppShell><div className="mx-auto max-w-[1540px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <PageHeader eyebrow="Intelligence" title="Analytics" description="Server-aggregated revenue intelligence, without exporting your pipeline to a spreadsheet." />
      <section className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Open pipeline", formatCompactCurrency(metrics.pipelineValue)],
          ["Win rate", `${metrics.winRate}%`],
          ["Avg. deal size", formatCompactCurrency(metrics.averageDealSize)],
          ["Activities done", totalActivities.toString()],
        ].map(([label, value]) => (
          <Card key={label} className="p-5"><p className="text-[11px] text-[#7c7e75]">{label}</p><div className="mt-4 flex items-end justify-between"><p className="text-2xl font-semibold tracking-[-0.04em]">{value}</p><span className="text-[10px] font-medium text-[#719d2c]">Live</span></div></Card>
        ))}
      </section>
      <section className="mt-4 grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Card className="p-6"><p className="text-sm font-semibold">Revenue performance</p><p className="mt-1 text-[11px] text-[#85877e]">Closed-won revenue vs. target</p><div className="mt-5"><RevenueChart data={monthlyRevenue} /></div></Card>
        <Card className="p-6"><p className="text-sm font-semibold">Pipeline coverage</p><p className="mt-1 text-[11px] text-[#85877e]">Value at each active stage</p><div className="mt-5"><PipelineChart data={pipelineByStage} /></div></Card>
      </section>
      <section className="mt-4 grid gap-4 lg:grid-cols-[.8fr_1.2fr]">
        <Card className="p-6"><p className="text-sm font-semibold">Acquisition mix</p><p className="mt-1 text-[11px] text-[#85877e]">Deal creation by source</p><SourceChart data={dealsBySource} /><div className="grid grid-cols-2 gap-2">{dealsBySource.map((item, index) => <div key={item.source} className="flex items-center gap-2 text-[10px] text-[#6f7169]"><span className="size-2 rounded-full" style={{ background: ["#58604b", "#9aca43", "#c8b6ff", "#f2bd5a", "#8aa1b1"][index] }} />{item.source}<span className="ml-auto font-medium">{item.deals}</span></div>)}</div></Card>
        <Card className="relative overflow-hidden p-6">
          <div className="absolute -right-16 -top-16 size-52 rounded-full bg-[#d8ff72]/25 blur-3xl" />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dfe0d9] bg-[#f6f7f1] px-2.5 py-1 text-[10px] text-[#62645c]"><Sparkles className="size-3 text-[#719d2c]" /> Pipeline brief</span>
          <p className="mt-8 max-w-xl font-serif text-3xl leading-[1.05] tracking-[-0.03em]">{metrics.openDeals} active opportunities represent {formatCompactCurrency(metrics.pipelineValue)} in open pipeline.</p>
          <p className="mt-5 max-w-xl text-[12px] leading-6 text-[#74766e]">This summary is generated from the authenticated analytics RPC. Closed opportunities currently convert at {metrics.winRate}%, and {metrics.overdueActivities} activities need attention.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">{[[formatCompactCurrency(metrics.wonRevenue), "Revenue won this month"], [metrics.openDeals.toString(), "Open opportunities"], [metrics.overdueActivities.toString(), "Overdue activities"]].map(([value, label]) => <div key={label} className="rounded-xl border border-[#e4e5de] bg-[#fafaf7] p-4"><p className="text-lg font-medium">{value}</p><p className="mt-1 text-[9px] uppercase tracking-wider text-[#74766f]">{label}</p></div>)}</div>
        </Card>
      </section>
    </div></AppShell>
  );
}
