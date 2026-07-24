"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  chartTooltipContentStyle,
  chartTooltipItemStyle,
  chartTooltipLabelStyle,
} from "@/components/charts/chart-tooltip-theme";
import type { SourceMetric } from "@/lib/types";

const colors = ["#58604b", "#9aca43", "#c8b6ff", "#f2bd5a", "#8aa1b1"];

export function SourceChart({ data }: { data: SourceMetric[] }) {
  return (
    <div className="h-[260px]" role="img" aria-label="Deals by source">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="deals" nameKey="source" innerRadius={62} outerRadius={94} paddingAngle={3} stroke="none">
            {data.map((item, index) => (
              <Cell key={item.source} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={chartTooltipContentStyle} itemStyle={chartTooltipItemStyle} labelStyle={chartTooltipLabelStyle} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
