"use client";

import {
  CalendarDays,
  ChevronDown,
  Clock3,
  Gauge,
  History,
  MapPin,
  RefreshCw,
  Route,
  Truck,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  type VehicleHistoryPreset,
  type VehicleHistoryVehicle,
  useVehicleHistory,
} from "./useVehicleHistory";

function todayIndiaKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function yesterdayIndiaKey() {
  const today = new Date(`${todayIndiaKey()}T00:00:00+05:30`);
  today.setDate(today.getDate() - 1);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(today);
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function HistoryVehicle({
  vehicle,
}: {
  vehicle: VehicleHistoryVehicle;
}) {
  const [expanded, setExpanded] = useState(true);

  if (vehicle.unavailable) {
    return (
      <article className="RST_HistoryVehicle RST_HistoryVehicle--unavailable">
        <div className="RST_HistoryVehicleHeader">
          <div>
            <span className="RST_HistoryVehicleIcon">
              <Truck size={18} />
            </span>
            <div>
              <strong>{vehicle.registrationNumber}</strong>
              <small>Vehicle unavailable</small>
            </div>
          </div>
          <span className="RST_VehicleState RST_VehicleState--unavailable">
            Unavailable
          </span>
        </div>

        <div className="RST_HistoryUnavailable">
          This vehicle is marked unavailable in the On Road operation stage, so
          GPS history is not requested for it.
        </div>
      </article>
    );
  }

  return (
    <article className="RST_HistoryVehicle">
      <button
        type="button"
        className="RST_HistoryVehicleHeader RST_HistoryVehicleHeader--button"
        onClick={() => setExpanded((value) => !value)}
      >
        <div>
          <span className="RST_HistoryVehicleIcon">
            <Truck size={18} />
          </span>
          <div>
            <strong>{vehicle.registrationNumber}</strong>
            <small>
              {vehicle.summary.pointCount
                ? `${vehicle.summary.pointCount} GPS records`
                : "No GPS records"}
            </small>
          </div>
        </div>
        <ChevronDown
          size={18}
          className={expanded ? "RST_HistoryChevron--open" : ""}
        />
      </button>

      {expanded && (
        <>
          <div className="RST_HistoryMetrics">
            <div>
              <Route size={16} />
              <span>
                <small>Distance</small>
                <strong>{vehicle.summary.distanceKm.toFixed(2)} km</strong>
              </span>
            </div>

            <div>
              <Gauge size={16} />
              <span>
                <small>Top speed</small>
                <strong>{vehicle.summary.maxSpeedKmh.toFixed(0)} km/h</strong>
              </span>
            </div>

            <div>
              <Zap size={16} />
              <span>
                <small>Ignition ON</small>
                <strong>{vehicle.summary.ignitionOnCount}</strong>
              </span>
            </div>

            <div>
              <Clock3 size={16} />
              <span>
                <small>Moving / Parked / Idle</small>
                <strong>
                  {vehicle.summary.movingCount} / {vehicle.summary.parkedCount} /{" "}
                  {vehicle.summary.idleCount}
                </strong>
              </span>
            </div>
          </div>

          {(vehicle.summary.startAddress || vehicle.summary.endAddress) && (
            <div className="RST_HistoryRouteSummary">
              <MapPin size={17} />
              <div>
                <small>Route</small>
                <strong>
                  {vehicle.summary.startAddress || "—"}
                  <span> → </span>
                  {vehicle.summary.endAddress || "—"}
                </strong>
              </div>
            </div>
          )}

          {vehicle.rows.length ? (
            <div className="RST_HistoryTableWrap">
              <div className="RST_HistoryTable">
                <div className="RST_HistoryTableHead">
                  <span>Date & Time</span>
                  <span>Max (km/h)</span>
                  <span>Out</span>
                  <span>Address</span>
                  <span>Direction</span>
                  <span>G-Map</span>
                  <span>C-Dist (km)</span>
                  <span>Odo (km)</span>
                  <span>Fuel (L)</span>
                  <span>Ignition</span>
                </div>

                {vehicle.rows.map((row) => (
                  <div key={row.id} className="RST_HistoryTableRow">
                    <span data-label="Date & Time">{formatDateTime(row.at)}</span>
                    <span data-label="Max (km/h)">
                      {row.maxSpeedKmh == null ? "—" : row.maxSpeedKmh}
                    </span>
                    <span data-label="Out">{row.out || "—"}</span>
                    <span data-label="Address" className="RST_HistoryAddress">
                      {row.address || "—"}
                    </span>
                    <span data-label="Direction">{row.direction || "—"}</span>
                    <span data-label="G-Map">
                      {row.googleMapUrl ? (
                        <a
                          href={row.googleMapUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Map
                        </a>
                      ) : (
                        "—"
                      )}
                    </span>
                    <span data-label="C-Dist (km)">
                      {row.cumulativeDistanceKm == null
                        ? "—"
                        : row.cumulativeDistanceKm.toFixed(2)}
                    </span>
                    <span data-label="Odo (km)">
                      {row.odometerKm == null
                        ? "—"
                        : row.odometerKm.toFixed(2)}
                    </span>
                    <span data-label="Fuel (L)">
                      {row.fuelLitres == null ? "—" : row.fuelLitres}
                    </span>
                    <span data-label="Ignition">
                      <span
                        className={`RST_IgnitionBadge ${
                          String(row.ignitionStatus).toLowerCase() === "on"
                            ? "RST_IgnitionBadge--on"
                            : ""
                        }`}
                      >
                        {row.ignitionStatus || "—"}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="RST_HistoryEmpty">
              No vehicle history was returned for this selected period.
            </div>
          )}
        </>
      )}
    </article>
  );
}

export default function VehicleHistoryPanel({
  mongoId,
  token,
  enabled,
  vehicles,
  selectedVehicle,
}: {
  mongoId: string;
  token: string | null;
  enabled: boolean;
  vehicles: {
    registrationNumber: string;
    unavailable: boolean;
  }[];
  selectedVehicle?: string;
}) {
  const [preset, setPreset] = useState<VehicleHistoryPreset>("today");
  const [vehicleFilter, setVehicleFilter] = useState(selectedVehicle || "all");
  const [fromDate, setFromDate] = useState(todayIndiaKey());
  const [toDate, setToDate] = useState(todayIndiaKey());
  const [fromTime, setFromTime] = useState("00:00");
  const [toTime, setToTime] = useState("23:59");

  useEffect(() => {
    if (selectedVehicle && vehicleFilter !== "all") {
      setVehicleFilter(selectedVehicle);
    }
  }, [selectedVehicle]);

  useEffect(() => {
    if (preset === "today") {
      const key = todayIndiaKey();
      setFromDate(key);
      setToDate(key);
      setFromTime("00:00");
      setToTime("23:59");
    }

    if (preset === "yesterday") {
      const key = yesterdayIndiaKey();
      setFromDate(key);
      setToDate(key);
      setFromTime("00:00");
      setToTime("23:59");
    }
  }, [preset]);

  const {
    data,
    loading,
    refreshing,
    error,
    refresh,
  } = useVehicleHistory({
    mongoId,
    token,
    enabled,
    vehicle: vehicleFilter === "all" ? undefined : vehicleFilter,
    preset,
    fromDate,
    fromTime: `${fromTime}:00`,
    toDate,
    toTime: `${toTime}:59`,
  });

  const returnedVehicles = data?.vehicles || [];

  const activeCount = useMemo(
    () => vehicles.filter((vehicle) => !vehicle.unavailable).length,
    [vehicles],
  );

  return (
    <section className="RST_HistorySection">
      <div className="RST_SectionHeading">
        <div>
          <span>VEHICLE HISTORY</span>
          <h2>GPS movement report</h2>
        </div>

        <small>
          Real vehicle records only. Filters are sent to your backend, which
          calls Vamosys server-side.
        </small>
      </div>

      <div className="RST_HistoryToolbar">
        <div className="RST_HistoryQuickFilters">
          {(
            [
              ["6h", "6 Hours"],
              ["12h", "12 Hours"],
              ["today", "Today"],
              ["yesterday", "Yesterday"],
              ["custom", "Custom"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={
                preset === key
                  ? "RST_HistoryFilter RST_HistoryFilter--active"
                  : "RST_HistoryFilter"
              }
              onClick={() => setPreset(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="RST_HistoryActions">
          <select
            value={vehicleFilter}
            onChange={(event) => setVehicleFilter(event.target.value)}
            aria-label="Vehicle"
          >
            <option value="all">All vehicles ({vehicles.length})</option>
            {vehicles.map((vehicle) => (
              <option
                key={vehicle.registrationNumber}
                value={vehicle.registrationNumber}
              >
                {vehicle.registrationNumber}
                {vehicle.unavailable ? " — Unavailable" : ""}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="RST_HistoryRefresh"
            onClick={() => void refresh()}
            disabled={refreshing || loading}
          >
            <RefreshCw
              size={16}
              className={refreshing ? "RST_Spin" : ""}
            />
            Refresh
          </button>
        </div>
      </div>

      {preset === "custom" && (
        <div className="RST_HistoryCustomRange">
          <label>
            <span>From date</span>
            <input
              type="date"
              value={fromDate}
              max={todayIndiaKey()}
              onChange={(event) => setFromDate(event.target.value)}
            />
          </label>

          <label>
            <span>From time</span>
            <input
              type="time"
              value={fromTime}
              onChange={(event) => setFromTime(event.target.value)}
            />
          </label>

          <label>
            <span>To date</span>
            <input
              type="date"
              value={toDate}
              max={todayIndiaKey()}
              onChange={(event) => setToDate(event.target.value)}
            />
          </label>

          <label>
            <span>To time</span>
            <input
              type="time"
              value={toTime}
              onChange={(event) => setToTime(event.target.value)}
            />
          </label>
        </div>
      )}

      <div className="RST_HistoryStatusLine">
        <span>
          <History size={15} />
          {activeCount} trackable{" "}
          {activeCount === 1 ? "vehicle" : "vehicles"}
        </span>

        {data?.range && (
          <span>
            <CalendarDays size={15} />
            {data.range.fromDate} {data.range.fromTime} → {data.range.toDate}{" "}
            {data.range.toTime}
          </span>
        )}
      </div>

      {loading ? (
        <div className="RST_HistoryLoading">
          <RefreshCw className="RST_Spin" size={22} />
          Loading vehicle history...
        </div>
      ) : error ? (
        <div className="RST_InlineError">{error}</div>
      ) : returnedVehicles.length ? (
        <div className="RST_HistoryVehicleList">
          {returnedVehicles.map((vehicle) => (
            <HistoryVehicle
              key={vehicle.registrationNumber}
              vehicle={vehicle}
            />
          ))}
        </div>
      ) : (
        <div className="RST_HistoryEmpty">
          No vehicle history is available for this selection.
        </div>
      )}
    </section>
  );
}
