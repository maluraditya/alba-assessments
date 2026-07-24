"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { StageMetric } from "@/lib/types";
import { formatCompactCurrency, formatCurrency } from "@/lib/utils";
import {
  chartTooltipContentStyle,
  chartTooltipItemStyle,
  chartTooltipLabelStyle,
} from "@/components/charts/chart-tooltip-theme";

export function PipelineChart({ data }: { data: StageMetric[] }) {
  return (
    <div className="h-[270px] w-full" role="img" aria-label="Pipeline value by stage">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="#e8e9e3" vertical={false} />
          <XAxis dataKey="stage" axisLine={false} tickLine={false} tick={{ fill: "#85877e", fontSize: 10 }} dy={8} />
          <YAxis tickFormatter={formatCompactCurrency} axisLine={false} tickLine={false} tick={{ fill: "#85877e", fontSize: 10 }} />
          <Tooltip
            cursor={{ fill: "#f2f3ed" }}
            contentStyle={chartTooltipContentStyle}
            itemStyle={chartTooltipItemStyle}
            labelStyle={chartTooltipLabelStyle}
            formatter={(value) => [formatCurrency(Number(value)), "Pipeline"]}
          />
          <Bar dataKey="value" fill="#86b831" radius={[6, 6, 2, 2]} maxBarSize={42} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
