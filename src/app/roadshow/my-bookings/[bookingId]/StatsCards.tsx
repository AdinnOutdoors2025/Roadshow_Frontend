"use client";

import type { LucideIcon } from "lucide-react";

export type StatCardData = {
  key: string;
  icon: LucideIcon;
  tone: "red" | "blue" | "green" | "purple";
  label: string;
  value: string;
};

/* KPI card row scoped to THIS booking only (see page.tsx for why — the
   reference design's numbers are fleet-wide admin aggregates that don't
   exist on the single-booking tracking API this page calls). */
export default function StatsCards({ stats }: { stats: StatCardData[] }) {
  return (
    <section className="RST_StatsGrid">
      {stats.map(({ key, icon: Icon, tone, label, value }) => (
        <div key={key} className={`RST_StatCard RST_StatCard--${tone}`}>
          <span className="RST_StatIcon">
            <Icon size={20} />
          </span>
          <div className="RST_StatBody">
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        </div>
      ))}
    </section>
  );
}
