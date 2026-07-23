"use client";

import { Cell, Funnel, FunnelChart as RechartsFunnelChart, LabelList, ResponsiveContainer, Tooltip } from "recharts";
import type { FunnelMetric } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

const colors = ["#d8ff72", "#b9e858", "#91cb48", "#67aa3c", "#3e7f32"];

export function FunnelChart({ data }: { data: FunnelMetric[] }) {
  return <div className="h-[330px] w-full" role="img" aria-label="Deal conversion funnel from lead to closed won"><ResponsiveContainer width="100%" height="100%"><RechartsFunnelChart margin={{ top: 12, right: 100, bottom: 12, left: 16 }}><Tooltip contentStyle={{ background: "#10110f", border: "1px solid rgba(255,255,255,.12)", borderRadius: 12, color: "#fff", fontSize: 12 }} formatter={(value, name, item) => [formatCurrency(Number(item.payload.value)), `${item.payload.deals} deals`]} /><Funnel dataKey="value" nameKey="stage" data={data} isAnimationActive><LabelList position="right" fill="#d7d8d2" stroke="none" dataKey="stage" fontSize={11} />{data.map((item, index) => <Cell key={item.stage} fill={colors[index % colors.length]} />)}</Funnel></RechartsFunnelChart></ResponsiveContainer></div>;
}
