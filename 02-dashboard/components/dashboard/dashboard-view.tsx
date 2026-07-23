import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CircleDollarSign,
  CircleGauge,
  Handshake,
  Plus,
  Target,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "./metric-card";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { PipelineChart } from "@/components/charts/pipeline-chart";
import type { Activity, AnalyticsPayload, Deal, Profile } from "@/lib/types";
import { formatCompactCurrency } from "@/lib/utils";

export function DashboardView({ analytics, deals, activities, profile }: { analytics: AnalyticsPayload; deals: Deal[]; activities: Activity[]; profile?: Profile }) {
  const { metrics, monthlyRevenue, pipelineByStage } = analytics;
  const firstName = profile?.full_name?.split(" ")[0] || "there";
  const today = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date());
  return (
    <AppShell>
      <div className="mx-auto max-w-[1540px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <PageHeader
          eyebrow={today}
          title={`Good morning, ${firstName}.`}
          description={`Here’s the live pulse of your pipeline. ${metrics.openDeals} active ${metrics.openDeals === 1 ? "deal" : "deals"} and ${metrics.overdueActivities} overdue ${metrics.overdueActivities === 1 ? "activity" : "activities"}.`}
          actions={
            <>
              <Link href="/analytics" className="hidden h-10 items-center justify-center rounded-lg border border-[#dedfd8] bg-white px-4 text-sm font-medium text-[#22231f] transition hover:bg-[#f5f5f1] focus-visible:ring-2 focus-visible:ring-[#d8ff72] sm:inline-flex">
                View analytics
              </Link>
              <Link href="/deals" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#d8ff72] px-4 text-sm font-medium text-[#11120f] transition hover:bg-[#e3ff94] focus-visible:ring-2 focus-visible:ring-[#d8ff72] focus-visible:ring-offset-2 focus-visible:ring-offset-[#10110f]">
                <Plus className="size-4" />
                New deal
              </Link>
            </>
          }
        />

        <section className="mt-9 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Key sales metrics">
          <MetricCard label="Open pipeline" value={formatCompactCurrency(metrics.pipelineValue)} helper="from last month" delta={metrics.pipelineDelta} icon={TrendingUp} />
          <MetricCard label="Revenue won" value={formatCompactCurrency(metrics.wonRevenue)} helper="this month" delta={metrics.revenueDelta} icon={CircleDollarSign} />
          <MetricCard label="Win rate" value={`${metrics.winRate}%`} helper="across closed deals" icon={Target} />
          <MetricCard label="Average deal" value={formatCompactCurrency(metrics.averageDealSize)} helper={`${metrics.openDeals} active opportunities`} icon={CircleGauge} />
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
          <Card className="p-5 sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold tracking-[-0.02em]">Revenue momentum</p>
                <p className="mt-1 text-[11px] text-[#85877e]">Closed-won revenue by month</p>
              </div>
              <Badge className="bg-[#eff7dd] text-[#5e7e26]">Live</Badge>
            </div>
            <div className="mt-5">
              <RevenueChart data={monthlyRevenue} />
            </div>
          </Card>
          <Card className="p-5 sm:p-6">
            <div>
              <p className="text-sm font-semibold tracking-[-0.02em]">Pipeline by stage</p>
              <p className="mt-1 text-[11px] text-[#85877e]">Current open opportunity value</p>
            </div>
            <div className="mt-5">
              <PipelineChart data={pipelineByStage} />
            </div>
          </Card>
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_.75fr]">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#e4e5de] px-5 py-4 sm:px-6">
              <div>
                <p className="text-sm font-semibold tracking-[-0.02em]">Deals requiring attention</p>
                <p className="mt-1 text-[11px] text-[#85877e]">High-value opportunities with upcoming milestones</p>
              </div>
              <Link href="/deals" className="flex items-center gap-1 text-[11px] font-medium text-[#5f6159] hover:text-black">
                View all <ArrowRight className="size-3" />
              </Link>
            </div>
            <div className="divide-y divide-[#ecece6]">
              {deals.slice(0, 4).map((deal) => (
                <Link key={deal.id} href="/deals" className="grid grid-cols-[1fr_auto] gap-3 px-5 py-4 transition hover:bg-[#fafaf7] sm:grid-cols-[1.4fr_.65fr_.5fr] sm:items-center sm:px-6">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-[#24251f]">{deal.name}</p>
                    <p className="mt-1 text-[10px] text-[#898b82]">{deal.company?.name}</p>
                  </div>
                  <div className="hidden sm:block">
                    <Badge>{deal.stage.replace("_", " ")}</Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-semibold">{formatCompactCurrency(deal.value)}</p>
                    <p className="mt-1 text-[10px] text-[#898b82]">{deal.probability}% likely</p>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#e4e5de] px-5 py-4">
              <div>
                <p className="text-sm font-semibold tracking-[-0.02em]">Next up</p>
                <p className="mt-1 text-[11px] text-[#85877e]">Your upcoming activities</p>
              </div>
              <CalendarClock className="size-4 text-[#8d8f86]" />
            </div>
            <div className="divide-y divide-[#ecece6]">
              {activities.slice(0, 4).map((activity, index) => (
                <div key={activity.id} className="flex gap-3 px-5 py-4">
                  <div className="mt-0.5 flex flex-col items-center">
                    <span className="grid size-7 place-items-center rounded-full border border-[#dfe0d9] bg-[#f7f7f3] text-[10px] font-semibold">{index + 1}</span>
                    {index < 3 ? <span className="mt-1 h-full w-px bg-[#e4e5de]" /> : null}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-medium">{activity.title}</p>
                    <p className="mt-1 truncate text-[10px] text-[#8a8c83]">{activity.deal?.name}</p>
                    <p className="mt-2 text-[10px] font-medium text-[#67724e]">{activity.due_at ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(activity.due_at)) : "No due date"}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="mt-4 rounded-2xl border border-[#25261f] bg-[#171815] p-5 text-white sm:flex sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#d8ff72] text-[#171815]">
              <Handshake className="size-4" />
            </span>
            <div>
              <p className="text-sm font-medium">Pipeline snapshot</p>
              <p className="mt-1 max-w-xl text-[11px] leading-5 text-[#8f9189]">
                {formatCompactCurrency(metrics.pipelineValue)} is currently open across {metrics.openDeals} opportunities, with a {metrics.winRate}% win rate on closed deals.
              </p>
            </div>
          </div>
          <Link href="/analytics" className="mt-4 inline-flex h-8 items-center gap-2 rounded-lg bg-white px-3 text-xs font-medium text-[#20211d] sm:mt-0">Review analytics <ArrowRight className="size-3" /></Link>
        </section>
      </div>
    </AppShell>
  );
}
