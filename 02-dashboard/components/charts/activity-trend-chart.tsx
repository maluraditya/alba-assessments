"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  chartTooltipContentStyle,
  chartTooltipItemStyle,
  chartTooltipLabelStyle,
} from "@/components/charts/chart-tooltip-theme";
import type { ActivityMetric } from "@/lib/types";

export function ActivityTrendChart({ data }: { data: ActivityMetric[] }) {
  return <div className="h-[250px] w-full" role="img" aria-label="Completed sales activities over the last seven days"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 16, right: 8, bottom: 0, left: -28 }}><CartesianGrid stroke="#e8e9e3" vertical={false} /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#85877e", fontSize: 10 }} dy={8} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#85877e", fontSize: 10 }} /><Tooltip cursor={{ fill: "#f2f3ed" }} contentStyle={chartTooltipContentStyle} itemStyle={chartTooltipItemStyle} labelStyle={chartTooltipLabelStyle} /><Bar dataKey="completed" name="Completed" fill="#86b831" radius={[5, 5, 1, 1]} maxBarSize={34} /></BarChart></ResponsiveContainer></div>;
}
