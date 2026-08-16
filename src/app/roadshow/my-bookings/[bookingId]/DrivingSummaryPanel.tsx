"use client";

import type { DrivingSummaryVehicle } from "./useDrivingSummary";

function formatHM(ms: number) {
  const totalMinutes = Math.round((ms || 0) / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m}m`;
}

const SEGMENT_META = {
  moving: { label: "Moving", className: "RS_TimeSegment--moving" },
  parked: { label: "Parked", className: "RS_TimeSegment--parked" },
  idle: { label: "Idle", className: "RS_TimeSegment--idle" },
  noData: { label: "No Data", className: "RS_TimeSegment--noData" },
} as const;

export default function DrivingSummaryPanel({
  vehicles,
}: {
  vehicles: DrivingSummaryVehicle[];
}) {
  const withData = vehicles.filter((v) => v.drivingSummary);

  if (!withData.length) return null;

  return (
    <div className="RS_DrivingSummaryList">
      {withData.map(({ registrationNumber, drivingSummary }) => {
        if (!drivingSummary) return null;

        const segments = [
          { key: "moving" as const, ms: drivingSummary.movingTimeMs },
          { key: "parked" as const, ms: drivingSummary.parkedTimeMs },
          { key: "idle" as const, ms: drivingSummary.idleTimeMs },
          { key: "noData" as const, ms: drivingSummary.noDataTimeMs },
        ];

        return (
          <div key={registrationNumber} className="RS_DrivingSummaryCard">
            <div className="RS_DrivingSummaryHeader">
              <strong>{registrationNumber}</strong>
              <span>Today</span>
            </div>

            <p className="RS_TrackingSectionLabel">24-Hour Summary</p>

            <div className="RS_TimeLegend">
              {segments.map((s) => (
                <div key={s.key} className="RS_TimeLegendItem">
                  <span className={`RS_TimeDot ${SEGMENT_META[s.key].className}`} />
                  <span>
                    <small>{SEGMENT_META[s.key].label}</small>
                    <strong>{formatHM(s.ms)}</strong>
                  </span>
                </div>
              ))}
            </div>

            <div className="RS_DrivingStatsGrid">
              <div>
                <small>Trip Distance</small>
                <strong>{drivingSummary.tripDistanceKm} km</strong>
              </div>
              <div>
                <small>Avg Speed</small>
                <strong>{drivingSummary.avgSpeedKmh} km/h</strong>
              </div>
              <div>
                <small>Top Speed</small>
                <strong>{drivingSummary.topSpeedKmh} km/h</strong>
              </div>
              <div>
                <small>Over Speed</small>
                <strong>
                  {drivingSummary.overSpeedInstances}{" "}
                  {drivingSummary.overSpeedInstances === 1 ? "time" : "times"}
                </strong>
                {drivingSummary.overSpeedLimitKmh > 0 && (
                  <span className="RS_DrivingStatSub">
                    limit {drivingSummary.overSpeedLimitKmh} km/h
                  </span>
                )}
              </div>
            </div>

            {(drivingSummary.startAddress || drivingSummary.endAddress) && (
              <div className="RS_DrivingLocations">
                {drivingSummary.startAddress && (
                  <div>
                    <small>Start Location</small>
                    <span>{drivingSummary.startAddress}</span>
                  </div>
                )}
                {drivingSummary.endAddress && (
                  <div>
                    <small>End / Latest Location</small>
                    <span>{drivingSummary.endAddress}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
