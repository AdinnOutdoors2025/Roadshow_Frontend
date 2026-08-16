"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import type { DayWiseReportRow } from "../useCampaignTracking";

const STATUS_LABEL: Record<DayWiseReportRow["status"], string> = {
  completed: "Completed",
  ongoing: "Ongoing",
  upcoming: "Upcoming",
  not_reported: "Not Yet Reported",
};

function formatDay(day: string) {
  const date = new Date(`${day}T00:00:00`);
  if (Number.isNaN(date.getTime())) return day;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function DayWiseReportTable({
  rows,
}: {
  rows: DayWiseReportRow[];
}) {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  if (!rows.length) return null;

  return (
    <div className="RS_DayWiseTable">
      <div className="RS_DayWiseHeaderRow">
        <span>Date</span>
        <span>Route</span>
        <span>Distance</span>
        <span>Activations</span>
        <span>Leads</span>
        <span>People Engaged</span>
        <span>Status</span>
      </div>

      {rows.map((row) => {
        const isExpanded = expandedDay === row.day;
        const hasPhotos = row.photos.length > 0;

        return (
          <div key={row.day} className="RS_DayWiseRowGroup">
            <button
              type="button"
              className={`RS_DayWiseRow RS_DayWiseRow--${row.status}`}
              onClick={() => hasPhotos && setExpandedDay(isExpanded ? null : row.day)}
            >
              <span data-label="Date">{formatDay(row.day)}</span>
              <span data-label="Route">
                {row.isAbsentDay ? "Vehicle absent" : row.routeNote || "-"}
              </span>
              <span data-label="Distance">
                {row.status === "upcoming" ? "-" : `${row.distanceCoveredKm} km`}
              </span>
              <span data-label="Activations">
                {row.status === "upcoming" ? "-" : row.activationsCount}
              </span>
              <span data-label="Leads">
                {row.status === "upcoming" ? "-" : row.leadsCollected}
              </span>
              <span data-label="People Engaged">
                {row.status === "upcoming" ? "-" : row.peopleEngaged}
              </span>
              <span className="RS_DayWiseStatusCell">
                <span className={`RS_DayWiseStatusBadge RS_DayWiseStatusBadge--${row.status}`}>
                  {STATUS_LABEL[row.status]}
                </span>
                {hasPhotos && (
                  <ChevronDown
                    size={15}
                    strokeWidth={2}
                    className={`RS_DayWiseChevron ${isExpanded ? "RS_DayWiseChevron--open" : ""}`}
                  />
                )}
              </span>
            </button>

            {isExpanded && hasPhotos && (
              <div className="RS_DayWisePhotos">
                {row.photos.map((url) => (
                  <img key={url} src={url} alt={`Campaign photo — ${formatDay(row.day)}`} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
