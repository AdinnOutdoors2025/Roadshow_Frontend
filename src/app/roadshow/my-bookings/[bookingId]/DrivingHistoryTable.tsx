"use client";

import type { DrivingSummaryVehicle } from "./useDrivingSummary";

function formatHistoryDay(day: string) {
  const date = new Date(`${day}T00:00:00`);
  if (Number.isNaN(date.getTime())) return day;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function fmtKm(value: number) {
  return `${Number(value || 0).toFixed(2)} km`;
}

function fmtFuel(value: number | null) {
  return value == null ? "—" : `${value} L`;
}

export default function DrivingHistoryTable({
  vehicles,
  days,
  selectedDay,
  onSelectDay,
}: {
  vehicles: DrivingSummaryVehicle[];
  days: string[];
  selectedDay: string;
  onSelectDay: (day: string) => void;
}) {
  const withData = vehicles.filter((v) => v.drivingSummary);

  return (
    <div className="RS_DrivingHistory">
      {days.length > 1 && (
        <div className="RS_DrivingHistoryDayTabs">
          {days.map((day) => (
            <button
              key={day}
              type="button"
              className={
                day === selectedDay
                  ? "RS_DrivingHistoryDayTab RS_DrivingHistoryDayTab--active"
                  : "RS_DrivingHistoryDayTab"
              }
              onClick={() => onSelectDay(day)}
            >
              {formatHistoryDay(day)}
            </button>
          ))}
        </div>
      )}

      {withData.length ? (
        <div className="RS_DrivingHistoryTable">
          <div className="RS_DrivingHistoryHeaderRow">
            <span>Vehicle</span>
            <span>Date</span>
            <span>Speed (Avg / Top)</span>
            <span>Distance</span>
            <span>Odometer (Open → Close)</span>
            <span>Fuel (Start → End)</span>
            <span>Idle / Parking</span>
            <span>Ignition Mode</span>
          </div>

          {withData.map(({ registrationNumber, drivingSummary }) => {
            if (!drivingSummary) return null;

            return (
              <div key={registrationNumber} className="RS_DrivingHistoryRowGroup">
                <div className="RS_DrivingHistoryRow">
                  <span data-label="Vehicle">{registrationNumber}</span>
                  <span data-label="Date">{formatHistoryDay(selectedDay)}</span>
                  <span data-label="Speed (Avg / Top)">
                    {drivingSummary.avgSpeedKmh} / {drivingSummary.topSpeedKmh} km/h
                  </span>
                  <span data-label="Distance">
                    {fmtKm(drivingSummary.tripDistanceKm)}
                  </span>
                  <span data-label="Odometer (Open → Close)">
                    {fmtKm(drivingSummary.openingOdoReadingKm)} →{" "}
                    {fmtKm(drivingSummary.closingOdoReadingKm)}
                  </span>
                  <span data-label="Fuel (Start → End)">
                    {fmtFuel(drivingSummary.startFuelLitres)} →{" "}
                    {fmtFuel(drivingSummary.endFuelLitres)}
                  </span>
                  <span data-label="Idle / Parking">
                    {drivingSummary.idleCount} / {drivingSummary.parkingCount}
                  </span>
                  <span data-label="Ignition Mode">
                    {drivingSummary.vehicleMode || "—"}
                  </span>
                </div>

                {(drivingSummary.startAddress || drivingSummary.endAddress) && (
                  <div className="RS_DrivingHistoryRoute">
                    <span>Route: </span>
                    <strong>
                      {drivingSummary.startAddress || "—"} →{" "}
                      {drivingSummary.endAddress || "—"}
                    </strong>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="RS_DrivingHistoryEmpty">
          No driving history is available for this day yet.
        </div>
      )}
    </div>
  );
}
