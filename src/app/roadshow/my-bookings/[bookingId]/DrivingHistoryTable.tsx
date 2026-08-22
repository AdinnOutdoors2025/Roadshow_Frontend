"use client";

import {
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
} from "lucide-react";
import {
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import type { DrivingSummaryVehicle } from "./useDrivingSummary";

function todayIndiaKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function formatHistoryDay(day: string) {
  const date = new Date(`${day}T00:00:00`);

  if (Number.isNaN(date.getTime())) return day;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatShortDay(day: string) {
  const date = new Date(`${day}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return {
      weekday: "",
      date: day,
    };
  }

  return {
    weekday: new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
    }).format(date),
    date: new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
    }).format(date),
  };
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
  loading,
}: {
  vehicles: DrivingSummaryVehicle[];
  days: string[];
  selectedDay: string;
  onSelectDay: (day: string) => void;
  loading?: boolean;
}) {
  const withData = vehicles.filter(
    (vehicle) => vehicle.drivingSummary,
  );

  /* useDrivingSummary clears its vehicles the instant the selected day
     changes, before the new day's fetch resolves — rendered as-is, that
     flashed this table to "No driving history..." and back on every date
     click. Hold the last populated render (date label included, so the
     two never show a mismatched pair) and dim it under a spinner instead,
     so a day switch reads as a brief refresh rather than a content swap.
     Adjusted during render (React's documented pattern for deriving state
     from a prop change) rather than in a useEffect, so there's no extra
     post-commit render pass before the held values are available. */
  const [prevVehicles, setPrevVehicles] = useState(vehicles);
  const [lastGoodData, setLastGoodData] = useState(withData);
  const [lastGoodDay, setLastGoodDay] = useState(selectedDay);

  if (vehicles !== prevVehicles) {
    setPrevVehicles(vehicles);

    if (withData.length) {
      setLastGoodData(withData);
      setLastGoodDay(selectedDay);
    }
  }

  const showRefreshOverlay = Boolean(loading) && withData.length === 0;
  const displayData = showRefreshOverlay ? lastGoodData : withData;
  const displayDay = showRefreshOverlay ? lastGoodDay : selectedDay;

  const today = todayIndiaKey();

  const carouselRef = useRef<HTMLDivElement | null>(null);

  const dragRef = useRef({
    active: false,
    startX: 0,
    scrollLeft: 0,
  });

  const dayItems = useMemo(
    () =>
      days.map((day) => ({
        day,
        isToday: day === today,
        isFuture: day > today,
        isPast: day < today,
        ...formatShortDay(day),
      })),
    [days, today],
  );

  function scrollDates(direction: -1 | 1) {
    const element = carouselRef.current;

    if (!element) return;

    element.scrollBy({
      left:
        direction *
        Math.max(
          300,
          element.clientWidth * 0.72,
        ),
      behavior: "smooth",
    });
  }

  function startDrag(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    if (event.pointerType === "touch") return;

    const target = event.target as HTMLElement;

    if (target.closest("a, button, input, select")) return;

    const element = carouselRef.current;

    if (!element) return;

    dragRef.current = {
      active: true,
      startX: event.clientX,
      scrollLeft: element.scrollLeft,
    };

    element.setPointerCapture?.(event.pointerId);
    element.classList.add(
      "RS_DrivingHistoryDateCarousel--dragging",
    );
  }

  function moveDrag(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    const element = carouselRef.current;

    if (!element || !dragRef.current.active) return;

    element.scrollLeft =
      dragRef.current.scrollLeft -
      (event.clientX - dragRef.current.startX);
  }

  function stopDrag() {
    dragRef.current.active = false;
    carouselRef.current?.classList.remove(
      "RS_DrivingHistoryDateCarousel--dragging",
    );
  }

  return (
    <div className="RS_DrivingHistory">
      {days.length > 1 && (
        <div className="RS_DrivingHistoryDateShell">
          <div className="RS_DrivingHistoryDateHead">
            <div>
              <span>CAMPAIGN DATE</span>
              <strong>
                Select a completed or current day
              </strong>
            </div>

            <div className="RS_DrivingHistoryDateControls">
              <button
                type="button"
                onClick={() => scrollDates(-1)}
                aria-label="Previous dates"
              >
                <ChevronLeft size={19} />
              </button>

              <button
                type="button"
                onClick={() => scrollDates(1)}
                aria-label="Next dates"
              >
                <ChevronRight size={19} />
              </button>
            </div>
          </div>

          <div
            ref={carouselRef}
            className="RS_DrivingHistoryDateCarousel"
            onPointerDown={startDrag}
            onPointerMove={moveDrag}
            onPointerUp={stopDrag}
            onPointerCancel={stopDrag}
            onLostPointerCapture={stopDrag}
          >
            <div className="RS_DrivingHistoryDateTrack">
              {dayItems.map((item, index) => {
                const active =
                  item.day === selectedDay;

                const title = item.isFuture
                  ? "Future dates can't be accessed until that campaign day arrives."
                  : item.isToday
                    ? "Open today's driving report"
                    : "Open this completed campaign day";

                return (
                  <button
                    key={item.day}
                    type="button"
                    disabled={item.isFuture}
                    title={title}
                    /* Reuses the same card look as the CAMPAIGN DATE
                       TIMELINE picker further down the page (RST_DayTimelineItem)
                       so the two day-pickers on this page read as one
                       consistent pattern instead of two different designs. */
                    className={[
                      "RST_DayTimelineItem",
                      active && "RST_DayTimelineItem--active",
                      item.isFuture && "RST_DayTimelineItem--future",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => {
                      if (!item.isFuture) {
                        onSelectDay(item.day);
                      }
                    }}
                  >
                    <span
                      className={`RST_DayTimelineDot ${
                        item.isFuture
                          ? ""
                          : item.isToday
                            ? "RST_ReportStatus--ongoing"
                            : "RST_ReportStatus--completed"
                      }`}
                    />

                    <span className="RST_DayTimelineCopy">
                      <small>
                        Day {String(index + 1).padStart(2, "0")}
                      </small>

                      <strong>{item.date}</strong>

                      <em>
                        {item.isFuture
                          ? "Upcoming · Locked"
                          : item.isToday
                            ? "Today"
                            : "Completed"}
                      </em>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {displayData.length ? (
        <div
          className={[
            "RS_DrivingHistoryTableZone",
            showRefreshOverlay && "RS_DrivingHistoryTableZone--loading",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {showRefreshOverlay && (
            <div className="RS_DrivingHistoryTableOverlay">
              <LoaderCircle className="RST_Spin" size={20} />
              <span>Refreshing…</span>
            </div>
          )}

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

            {displayData.map(
              ({
                registrationNumber,
                drivingSummary,
              }) => {
                if (!drivingSummary) return null;

                return (
                  <div
                    key={registrationNumber}
                    className="RS_DrivingHistoryRowGroup"
                  >
                    <div className="RS_DrivingHistoryRow">
                      <span data-label="Vehicle">
                        <strong className="RS_DrivingVehicleNumber">
                          {registrationNumber}
                        </strong>
                      </span>

                      <span data-label="Date">
                        {formatHistoryDay(displayDay)}
                      </span>

                      <span data-label="Speed (Avg / Top)">
                        {drivingSummary.avgSpeedKmh} /{" "}
                        {drivingSummary.topSpeedKmh} km/h
                      </span>

                      <span data-label="Distance">
                        {fmtKm(
                          drivingSummary.tripDistanceKm,
                        )}
                      </span>

                      <span data-label="Odometer (Open → Close)">
                        {fmtKm(
                          drivingSummary.openingOdoReadingKm,
                        )}{" "}
                        →{" "}
                        {fmtKm(
                          drivingSummary.closingOdoReadingKm,
                        )}
                      </span>

                      <span data-label="Fuel (Start → End)">
                        {fmtFuel(
                          drivingSummary.startFuelLitres,
                        )}{" "}
                        →{" "}
                        {fmtFuel(
                          drivingSummary.endFuelLitres,
                        )}
                      </span>

                      <span data-label="Idle / Parking">
                        {drivingSummary.idleCount} /{" "}
                        {drivingSummary.parkingCount}
                      </span>

                      <span data-label="Ignition Mode">
                        <span className="RS_DrivingModeBadge">
                          {drivingSummary.vehicleMode ||
                            "—"}
                        </span>
                      </span>
                    </div>

                    {(drivingSummary.startAddress ||
                      drivingSummary.endAddress) && (
                      <div className="RS_DrivingHistoryRoute">
                        <span>Route</span>

                        <strong>
                          {drivingSummary.startAddress ||
                            "—"}{" "}
                          <em>→</em>{" "}
                          {drivingSummary.endAddress ||
                            "—"}
                        </strong>
                      </div>
                    )}
                  </div>
                );
              },
            )}
          </div>
        </div>
      ) : (
        <div className="RS_DrivingHistoryEmpty">
          {loading ? (
            <>
              <LoaderCircle className="RST_Spin" size={20} />
              Loading driving details...
            </>
          ) : (
            "No driving history is available for this day yet."
          )}
        </div>
      )}
    </div>
  );
}
