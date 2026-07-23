"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ActivityMetric } from "@/lib/types";

export function ActivityTrendChart({ data }: { data: ActivityMetric[] }) {
  return <div className="h-[250px] w-full" role="img" aria-label="Completed sales activities over the last seven days"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 16, right: 8, bottom: 0, left: -28 }}><CartesianGrid stroke="rgba(255,255,255,.07)" vertical={false} /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#777970", fontSize: 10 }} dy={8} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#777970", fontSize: 10 }} /><Tooltip cursor={{ fill: "rgba(255,255,255,.04)" }} contentStyle={{ background: "#10110f", border: "1px solid rgba(255,255,255,.12)", borderRadius: 10, color: "#fff", fontSize: 12 }} /><Bar dataKey="completed" name="Completed" fill="#d8ff72" radius={[5, 5, 1, 1]} maxBarSize={34} /></BarChart></ResponsiveContainer></div>;
}
