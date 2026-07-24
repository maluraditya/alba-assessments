"use client";

import { Cell, Funnel, FunnelChart as RechartsFunnelChart, LabelList, ResponsiveContainer, Tooltip } from "recharts";
import {
  chartTooltipContentStyle,
  chartTooltipItemStyle,
  chartTooltipLabelStyle,
} from "@/components/charts/chart-tooltip-theme";
import type { FunnelMetric } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

const colors = ["#d8ff72", "#b9e858", "#91cb48", "#67aa3c", "#3e7f32"];

export function FunnelChart({ data }: { data: FunnelMetric[] }) {
  return <div className="h-[330px] w-full" role="img" aria-label="Deal conversion funnel from lead to closed won"><ResponsiveContainer width="100%" height="100%"><RechartsFunnelChart margin={{ top: 12, right: 100, bottom: 12, left: 16 }}><Tooltip contentStyle={chartTooltipContentStyle} itemStyle={chartTooltipItemStyle} labelStyle={chartTooltipLabelStyle} formatter={(value, name, item) => [formatCurrency(Number(item.payload.value)), `${item.payload.deals} deals`]} /><Funnel dataKey="value" nameKey="stage" data={data} isAnimationActive><LabelList position="right" fill="#5f6159" stroke="none" dataKey="stage" fontSize={11} />{data.map((item, index) => <Cell key={item.stage} fill={colors[index % colors.length]} />)}</Funnel></RechartsFunnelChart></ResponsiveContainer></div>;
}
