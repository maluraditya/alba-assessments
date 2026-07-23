"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlyRevenue } from "@/lib/types";
import { formatCompactCurrency, formatCurrency } from "@/lib/utils";

export function RevenueChart({ data }: { data: MonthlyRevenue[] }) {
  return (
    <div className="h-[270px] w-full" role="img" aria-label="Monthly revenue chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#b8e659" stopOpacity={0.32} />
              <stop offset="100%" stopColor="#b8e659" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e8e9e3" vertical={false} />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#85877e", fontSize: 11 }} dy={8} />
          <YAxis tickFormatter={formatCompactCurrency} axisLine={false} tickLine={false} tick={{ fill: "#85877e", fontSize: 10 }} />
          <Tooltip
            cursor={{ stroke: "#b8baaf", strokeDasharray: "4 4" }}
            contentStyle={{ background: "#171815", border: "1px solid rgba(255,255,255,.08)", borderRadius: 10, fontSize: 12 }}
            labelStyle={{ color: "#9b9d95", marginBottom: 4 }}
            formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
          />
          <Area type="monotone" dataKey="revenue" stroke="#86b831" strokeWidth={2.5} fill="url(#revenue-fill)" activeDot={{ r: 4, fill: "#171815", stroke: "#d8ff72", strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
