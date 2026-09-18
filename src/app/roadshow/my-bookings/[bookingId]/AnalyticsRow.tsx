"use client";

import type { CSSProperties } from "react";

type ProgressRingStyle = CSSProperties & { "--rst-progress"?: string };

export type UtilizationDay = {
  key: string;
  label: string;
  km: number;
  isToday: boolean;
  isFuture: boolean;
};

/* Three analytics cards reinterpreted from the reference dashboard's
   fleet-wide widgets into this booking's own already-fetched data:
   - Campaign Performance reuses the existing day-progress ring/legend.
   - Vehicle Utilization bar-charts data.dayWiseReport's per-day distance
     (already loaded with the tracking payload — no extra fetch).
   - Route Coverage aggregates that same per-day distance instead of the
     multi-city stats the reference shows (this booking has one location). */
export default function AnalyticsRow({
  performance,
  utilizationDays,
  coverage,
}: {
  performance: {
    percent: number | null;
    statusLabel: string;
    totalDays: number | string;
    completedDays: number | string;
    remainingDays: number | string;
  };
  utilizationDays: UtilizationDay[];
  coverage: {
    totalKm: number;
    daysRun: number;
    totalDays: number | string;
    location: string;
    percent: number;
  };
}) {
  const maxKm = Math.max(1, ...utilizationDays.map((day) => day.km));

  return (
    <section className="RST_AnalyticsGrid">
      <div className="RST_AnalyticsCard RST_AnalyticsCard--performance">
        <div className="RST_SectionHeading RST_SectionHeading--compact">
          <div>
            <span>CAMPAIGN PERFORMANCE</span>
            <h2>Overall completion</h2>
          </div>
        </div>

        <div className="RST_ProgressBody">
          <div
            className="RST_ProgressRing"
            style={
              {
                "--rst-progress": `${(performance.percent ?? 0) * 3.6}deg`,
              } as ProgressRingStyle
            }
          >
            <div>
              <strong>
                {performance.percent === null
                  ? performance.statusLabel
                  : `${performance.percent}%`}
              </strong>
              <small>{performance.percent === null ? "Status" : "Completed"}</small>
            </div>
          </div>

          <div className="RST_ProgressStats">
            <div>
              <span>Total Days</span>
              <strong>{performance.totalDays}</strong>
            </div>
            <div>
              <span>Days Completed</span>
              <strong>{performance.completedDays}</strong>
            </div>
            <div>
              <span>Days Remaining</span>
              <strong>{performance.remainingDays}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="RST_AnalyticsCard RST_AnalyticsCard--utilization">
        <div className="RST_SectionHeading RST_SectionHeading--compact">
          <div>
            <span>VEHICLE UTILIZATION</span>
            <h2>Distance per campaign day</h2>
          </div>
        </div>

        {utilizationDays.length ? (
          <div className="RST_UtilBars">
            {utilizationDays.map((day) => (
              <div
                key={day.key}
                className={`RST_UtilBar ${day.isToday ? "RST_UtilBar--today" : ""} ${
                  day.isFuture ? "RST_UtilBar--future" : ""
                }`}
                title={`${day.label}: ${day.km.toFixed(1)} km`}
              >
                <span className="RST_UtilBarTrack">
                  <span
                    className="RST_UtilBarFill"
                    style={{ height: `${Math.max(4, (day.km / maxKm) * 100)}%` }}
                  />
                </span>
                <small>{day.label}</small>
              </div>
            ))}
          </div>
        ) : (
          <div className="RST_PerformanceEmpty">
            <strong>No day-wise report submitted yet</strong>
            <span>Daily distance bars will appear once reports come in.</span>
          </div>
        )}
      </div>

      <div className="RST_AnalyticsCard RST_AnalyticsCard--coverage">
        <div className="RST_SectionHeading RST_SectionHeading--compact">
          <div>
            <span>ROUTE COVERAGE</span>
            <h2>Campaign so far</h2>
          </div>
        </div>

        <div className="RST_ProgressBody">
          <div
            className="RST_ProgressRing RST_ProgressRing--teal"
            style={
              {
                "--rst-progress": `${coverage.percent * 3.6}deg`,
              } as ProgressRingStyle
            }
          >
            <div>
              <strong>{coverage.percent}%</strong>
              <small>Days Run</small>
            </div>
          </div>

          <div className="RST_ProgressStats">
            <div>
              <span>Distance Covered</span>
              <strong>{coverage.totalKm.toFixed(1)} km</strong>
            </div>
            <div>
              <span>Days Run</span>
              <strong>
                {coverage.daysRun} / {coverage.totalDays || "—"}
              </strong>
            </div>
            <div>
              <span>Route</span>
              <strong>{coverage.location || "—"}</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
