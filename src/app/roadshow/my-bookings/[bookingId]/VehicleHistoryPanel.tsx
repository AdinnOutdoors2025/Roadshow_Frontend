/* eslint-disable */
// @ts-nocheck
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
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import DatePicker from "react-datepicker";
import Select, {
  type SingleValue,
  type StylesConfig,
} from "react-select";

import "react-datepicker/dist/react-datepicker.css";

import {
  type VehicleHistoryPreset,
  type VehicleHistoryVehicle,
  useVehicleHistory,
} from "./useVehicleHistory";
import RouteHistoryMap from "./RouteHistoryMap";

type VehicleOption = {
  value: string;
  label: string;
  unavailable?: boolean;
};

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

function dateKeyToPickerDate(value: string) {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function pickerDateToKey(date: Date | null) {
  if (!date) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function timeStringToPickerDate(value: string) {
  const [hours, minutes] = String(value || "00:00")
    .split(":")
    .map(Number);

  const date = new Date();
  date.setHours(
    Number.isFinite(hours) ? hours : 0,
    Number.isFinite(minutes) ? minutes : 0,
    0,
    0,
  );

  return date;
}

function pickerDateToTimeString(date: Date | null) {
  if (!date) return "00:00";

  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}

function isFutureDate(date: Date) {
  const today = dateKeyToPickerDate(todayIndiaKey());

  if (!today) return false;

  const target = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    12,
    0,
    0,
    0,
  );

  return target.getTime() > today.getTime();
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

const selectStyles: StylesConfig<VehicleOption, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: 48,
    borderRadius: 12,
    borderColor: state.isFocused ? "#8dbbf1" : "#dfe5ec",
    boxShadow: state.isFocused
      ? "0 0 0 4px rgba(40, 125, 224, 0.08)"
      : "none",
    background: "#fff",
    cursor: "pointer",
    transition: "border-color 180ms ease, box-shadow 180ms ease",
    ":hover": {
      borderColor: "#c7d1dd",
    },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "0 12px",
  }),
  singleValue: (base) => ({
    ...base,
    color: "#29313d",
    fontSize: 14,
    fontWeight: 650,
  }),
  placeholder: (base) => ({
    ...base,
    color: "#8c96a2",
    fontSize: 14,
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "#6c7784",
    paddingInline: 10,
  }),
  menu: (base) => ({
    ...base,
    zIndex: 90,
    overflow: "hidden",
    border: "1px solid #e3e8ee",
    borderRadius: 12,
    boxShadow: "0 18px 45px rgba(20, 31, 48, 0.14)",
  }),
  option: (base, state) => ({
    ...base,
    padding: "11px 13px",
    color: state.isDisabled ? "#a8afb8" : "#303844",
    background: state.isSelected
      ? "#edf5ff"
      : state.isFocused
        ? "#f6f9fc"
        : "#fff",
    cursor: state.isDisabled ? "not-allowed" : "pointer",
    fontSize: 13,
    fontWeight: state.isSelected ? 700 : 550,
  }),
};

function HistoryVehicle({
  vehicle,
}: {
  vehicle: VehicleHistoryVehicle;
}) {
  const [expanded, setExpanded] = useState(true);

  const tableWrapRef = useRef<HTMLDivElement | null>(null);
  const tableDragRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });

  function startTableDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;

    const target = event.target as HTMLElement;

    if (target.closest("a, button, input, select")) return;

    const element = tableWrapRef.current;

    if (!element) return;

    tableDragRef.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: element.scrollLeft,
      scrollTop: element.scrollTop,
    };

    element.setPointerCapture?.(event.pointerId);
    element.classList.add("RST_HistoryTableWrap--dragging");
  }

  function moveTableDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const element = tableWrapRef.current;

    if (!element || !tableDragRef.current.active) return;

    element.scrollLeft =
      tableDragRef.current.scrollLeft -
      (event.clientX - tableDragRef.current.startX);

    element.scrollTop =
      tableDragRef.current.scrollTop -
      (event.clientY - tableDragRef.current.startY);
  }

  function stopTableDrag() {
    tableDragRef.current.active = false;
    tableWrapRef.current?.classList.remove(
      "RST_HistoryTableWrap--dragging",
    );
  }

  function handleTableWheel(event: ReactWheelEvent<HTMLDivElement>) {
    const element = tableWrapRef.current;

    if (!element) return;

    /*
      Shift + wheel = horizontal table navigation.
      A trackpad's native horizontal deltaX is left untouched.
    */
    if (
      event.shiftKey &&
      Math.abs(event.deltaY) > Math.abs(event.deltaX)
    ) {
      event.preventDefault();
      element.scrollLeft += event.deltaY;
    }
  }

  if (vehicle.unavailable) {
    return (
      <article className="RST_HistoryVehicle RST_HistoryVehicle--unavailable">
        <div className="RST_HistoryVehicleHeader">
          <div>
            <span className="RST_HistoryVehicleIcon">
              <Truck size={20} />
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
          This vehicle is marked unavailable in the On Road operation stage,
          so GPS history is not requested for it.
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
            <Truck size={20} />
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
          size={20}
          className={expanded ? "RST_HistoryChevron--open" : ""}
        />
      </button>

      {expanded && (
        <>
          <div className="RST_HistoryMetrics">
            <div>
              <Route size={18} />
              <span>
                <small>Distance</small>
                <strong>{vehicle.summary.distanceKm.toFixed(2)} km</strong>
              </span>
            </div>

            <div>
              <Gauge size={18} />
              <span>
                <small>Top speed</small>
                <strong>{vehicle.summary.maxSpeedKmh.toFixed(0)} km/h</strong>
              </span>
            </div>

            <div>
              <Zap size={18} />
              <span>
                <small>Ignition ON</small>
                <strong>{vehicle.summary.ignitionOnCount}</strong>
              </span>
            </div>

            <div>
              <Clock3 size={18} />
              <span>
                <small>Moving / Parked / Idle</small>
                <strong>
                  {vehicle.summary.movingCount} /{" "}
                  {vehicle.summary.parkedCount} /{" "}
                  {vehicle.summary.idleCount}
                </strong>
              </span>
            </div>
          </div>

          {(vehicle.summary.startAddress ||
            vehicle.summary.endAddress) && (
            <div className="RST_HistoryRouteSummary">
              <MapPin size={18} />

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

          {vehicle.rows.some(
            (row) => row.latitude != null && row.longitude != null,
          ) && (
            <div className="RST_HistoryRouteMapWrap">
              <div className="RST_HistoryRouteMapHeader">
                <MapPin size={15} />
                <span>Route map</span>
                <small>
                  View the travelled route for the selected filters ·
                  Green flag = start, orange flag = most recent point ·
                  Arrows show direction of travel · Tap a point for time,
                  speed, odometer, fuel and a Google Maps link · Zoom to
                  explore and drag to navigate the map.
                </small>
              </div>

              <RouteHistoryMap rows={vehicle.rows} />
            </div>
          )}

          {vehicle.rows.length ? (
            <div
              ref={tableWrapRef}
              className="RST_HistoryTableWrap"
              onPointerDown={startTableDrag}
              onPointerMove={moveTableDrag}
              onPointerUp={stopTableDrag}
              onPointerCancel={stopTableDrag}
              onLostPointerCapture={stopTableDrag}
              onWheel={handleTableWheel}
              title="Drag the table to scroll. Use Shift + mouse wheel for horizontal scrolling."
            >
              <div className="RST_HistoryTable">
                <div className="RST_HistoryTableHead">
                  <span>Date & Time</span>
                  <span>Max Speed</span>
                  <span>Out</span>
                  <span>Address</span>
                  <span>Direction</span>
                  <span>G-Map</span>
                  <span>C-Dist</span>
                  <span>Odometer</span>
                  <span>Fuel</span>
                  <span>Ignition</span>
                </div>

                {vehicle.rows.map((row) => (
                  <div
                    key={row.id}
                    className="RST_HistoryTableRow"
                  >
                    <span data-label="Date & Time">
                      {formatDateTime(row.at)}
                    </span>

                    <span data-label="Max Speed">
                      {row.maxSpeedKmh == null
                        ? "—"
                        : `${row.maxSpeedKmh} km/h`}
                    </span>

                    <span data-label="Out">{row.out || "—"}</span>

                    <span
                      data-label="Address"
                      className="RST_HistoryAddress"
                      title={row.address || undefined}
                    >
                      {row.address || "—"}
                    </span>

                    <span data-label="Direction">
                      {row.direction || "—"}
                    </span>

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

                    <span data-label="C-Dist">
                      {row.cumulativeDistanceKm == null
                        ? "—"
                        : `${row.cumulativeDistanceKm.toFixed(2)} km`}
                    </span>

                    <span data-label="Odometer">
                      {row.odometerKm == null
                        ? "—"
                        : `${row.odometerKm.toFixed(2)} km`}
                    </span>

                    <span data-label="Fuel">
                      {row.fuelLitres == null
                        ? "—"
                        : `${row.fuelLitres} L`}
                    </span>

                    <span data-label="Ignition">
                      <span
                        className={`RST_IgnitionBadge ${
                          String(row.ignitionStatus).toLowerCase() ===
                          "on"
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
  const [preset, setPreset] =
    useState<VehicleHistoryPreset>("today");

  const [vehicleFilter, setVehicleFilter] = useState(
    selectedVehicle || "all",
  );

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

  /*
    Guard against an invalid custom range without changing the API shape.
    The backend still receives the same preset/fromDate/fromTime/toDate/toTime
    query parameters that it already expects.
  */
  useEffect(() => {
    if (preset !== "custom") return;

    const today = todayIndiaKey();

    if (fromDate > today) {
      setFromDate(today);
    }

    if (toDate > today) {
      setToDate(today);
    }

    if (fromDate && toDate && fromDate > toDate) {
      setToDate(fromDate);
    }
  }, [preset, fromDate, toDate]);

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
    vehicle:
      vehicleFilter === "all"
        ? undefined
        : vehicleFilter,
    preset,
    fromDate,
    fromTime: `${fromTime}:00`,
    toDate,
    toTime: `${toTime}:59`,
  });

  const returnedVehicles = data?.vehicles || [];

  const activeCount = useMemo(
    () =>
      vehicles.filter((vehicle) => !vehicle.unavailable)
        .length,
    [vehicles],
  );

  const vehicleOptions = useMemo<VehicleOption[]>(
    () => [
      {
        value: "all",
        label: `All vehicles (${vehicles.length})`,
      },
      ...vehicles.map((vehicle) => ({
        value: vehicle.registrationNumber,
        label: `${vehicle.registrationNumber}${
          vehicle.unavailable ? " — Unavailable" : ""
        }`,
        unavailable: vehicle.unavailable,
      })),
    ],
    [vehicles],
  );

  const selectedVehicleOption =
    vehicleOptions.find(
      (option) => option.value === vehicleFilter,
    ) || vehicleOptions[0];

  function selectVehicle(
    option: SingleValue<VehicleOption>,
  ) {
    if (!option) return;

    setVehicleFilter(option.value);
  }

  const todayDate =
    dateKeyToPickerDate(todayIndiaKey()) || new Date();

  return (
    <section className="RST_HistorySection">
      <div className="RST_SectionHeading">
        <div>
          <span>VEHICLE HISTORY</span>
          <h2>GPS movement report</h2>
        </div>

        <small>
          Select a vehicle and period to review real GPS
          records. Future dates are locked because movement
          data does not exist yet.
        </small>
      </div>

      <div className="RST_HistoryCommandBar">
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
          <div className="RST_HistoryVehicleSelect">
            <Select<VehicleOption, false>
              value={selectedVehicleOption}
              options={vehicleOptions}
              onChange={selectVehicle}
              styles={selectStyles}
              isSearchable
              aria-label="Vehicle"
              getOptionLabel={(option) => option.label}
              getOptionValue={(option) => option.value}
            />
          </div>

          <button
            type="button"
            className="RST_HistoryRefresh"
            onClick={() => void refresh()}
            disabled={refreshing || loading}
          >
            <RefreshCw
              size={17}
              className={refreshing ? "RST_Spin" : ""}
            />
            <span>
              {refreshing ? "Refreshing" : "Refresh"}
            </span>
          </button>
        </div>
      </div>

      {preset === "custom" && (
        <div className="RST_HistoryCustomRange">
          <label>
            <span>From date</span>

            <div className="RST_PickerField">
              <CalendarDays size={17} />

              <DatePicker
                selected={dateKeyToPickerDate(fromDate)}
                onChange={(date) => {
                  const key = pickerDateToKey(date);

                  if (!key) return;

                  setFromDate(key);

                  if (toDate && key > toDate) {
                    setToDate(key);
                  }
                }}
                maxDate={todayDate}
                filterDate={(date) => !isFutureDate(date)}
                dateFormat="dd MMM yyyy"
                placeholderText="Select date"
                popperPlacement="bottom-start"
                showPopperArrow={false}
                renderDayContents={(day, date) => (
                  <span
                    title={
                      isFutureDate(date)
                        ? "Future dates can't be accessed"
                        : undefined
                    }
                  >
                    {day}
                  </span>
                )}
              />
            </div>
          </label>

          <label>
            <span>From time</span>

            <div className="RST_PickerField">
              <Clock3 size={17} />

              <DatePicker
                selected={timeStringToPickerDate(fromTime)}
                onChange={(date) =>
                  setFromTime(
                    pickerDateToTimeString(date),
                  )
                }
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="h:mm aa"
                popperPlacement="bottom-start"
                showPopperArrow={false}
              />
            </div>
          </label>

          <label>
            <span>To date</span>

            <div className="RST_PickerField">
              <CalendarDays size={17} />

              <DatePicker
                selected={dateKeyToPickerDate(toDate)}
                onChange={(date) => {
                  const key = pickerDateToKey(date);

                  if (!key) return;

                  setToDate(key);

                  if (fromDate && key < fromDate) {
                    setFromDate(key);
                  }
                }}
                minDate={
                  dateKeyToPickerDate(fromDate) ||
                  undefined
                }
                maxDate={todayDate}
                filterDate={(date) => !isFutureDate(date)}
                dateFormat="dd MMM yyyy"
                placeholderText="Select date"
                popperPlacement="bottom-start"
                showPopperArrow={false}
                renderDayContents={(day, date) => (
                  <span
                    title={
                      isFutureDate(date)
                        ? "Future dates can't be accessed"
                        : undefined
                    }
                  >
                    {day}
                  </span>
                )}
              />
            </div>
          </label>

          <label>
            <span>To time</span>

            <div className="RST_PickerField">
              <Clock3 size={17} />

              <DatePicker
                selected={timeStringToPickerDate(toTime)}
                onChange={(date) =>
                  setToTime(
                    pickerDateToTimeString(date),
                  )
                }
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="h:mm aa"
                popperPlacement="bottom-start"
                showPopperArrow={false}
              />
            </div>
          </label>

          <div className="RST_FutureDateHint">
            <CalendarDays size={16} />
            Future dates are disabled. History can be
            viewed only up to today.
          </div>
        </div>
      )}

      <div className="RST_HistoryStatusLine">
        <span>
          <History size={16} />
          {activeCount} trackable{" "}
          {activeCount === 1 ? "vehicle" : "vehicles"}
        </span>

        {data?.range && (
          <span>
            <CalendarDays size={16} />
            {data.range.fromDate} {data.range.fromTime}
            <strong>→</strong>
            {data.range.toDate} {data.range.toTime}
          </span>
        )}

        <span className="RST_HistoryScrollHint">
          Drag table to scroll · Shift + wheel for
          horizontal movement
        </span>
      </div>

      {loading ? (
        <div className="RST_HistoryLoading">
          <RefreshCw
            className="RST_Spin"
            size={23}
          />
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
          No vehicle history is available for this
          selection.
        </div>
      )}
    </section>
  );
}
