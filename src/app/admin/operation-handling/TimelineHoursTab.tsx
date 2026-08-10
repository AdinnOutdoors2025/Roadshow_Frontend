/* eslint-disable */
// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Truck, ChevronDown, ChevronRight as ChevronRightIcon,
  AlertTriangle, RefreshCw, Clock,
} from "lucide-react";
import { getToken } from "../../utils/auth";
import API_BASE from "../../../../baseurl";

const fmtDateLabel = (dateKey: string) =>
  new Date(dateKey + "T00:00:00.000Z").toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", weekday: "short",
  });

const fmtHM = (ms: number) => {
  const totalMin = Math.round((ms || 0) / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h}h ${m}m`;
};

const POSITION_META: Record<string, { label: string; bar: string; dot: string; chip: string }> = {
  M: { label: "Moving", bar: "bg-emerald-500", dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300" },
  P: { label: "Parked", bar: "bg-blue-500", dot: "bg-blue-500", chip: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300" },
  S: { label: "Idle", bar: "bg-amber-500", dot: "bg-amber-500", chip: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300" },
};
const NO_DATA_META = { label: "No Data", bar: "bg-gray-300 dark:bg-gray-700", dot: "bg-gray-400", chip: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400" };

const DAY_MS = 24 * 60 * 60 * 1000;

// IST midnight → midnight window for the given yyyy-mm-dd day key.
function dayWindowUTC(day: string) {
  const fromDateUTC = new Date(`${day}T00:00:00+05:30`).getTime();
  const toDateUTC = fromDateUTC + DAY_MS - 1000;
  return { fromDateUTC, toDateUTC };
}

// GPS API returns "lat,lng" strings for startLocation/endLocation — same
// reverse-geocode service used server-side in driverlocationcontroller.js.
async function reverseGeocode(latLng: string): Promise<string> {
  const [lat, lon] = (latLng || "").split(",").map((s) => s.trim());
  if (!lat || !lon) return "";
  try {
    const res = await axios.get("https://nominatim.openstreetmap.org/reverse", {
      params: { lat, lon, format: "json" },
    });
    return res.data?.display_name || "";
  } catch {
    return "";
  }
}

export default function TimelineHoursTab({ order, vehicleTypes }: { order: { _id: string }, vehicleTypes: any }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [dayTab, setDayTab] = useState<Record<number, string>>({});
  const [regTab, setRegTab] = useState<Record<string, string>>({});

  // GPS history cache, keyed by `${reg}:${day}` — avoids re-hitting the
  // third-party API every time the admin flips back to a tab they already viewed.
  const [gpsCache, setGpsCache] = useState<Record<string, any>>({});
  const [gpsLoading, setGpsLoading] = useState<Record<string, boolean>>({});
  const [gpsError, setGpsError] = useState<Record<string, string>>({});

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE}admin/pipeline/${order._id}/day-by-day-history`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      const payload = res.data?.data;
      setData(payload);
      const firstVt = payload?.vehicleTypes?.[0];
      if (firstVt) setExpanded({ [firstVt.vehicleIndex]: true });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load timeline hours");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order._id]);

  const getVehicleTypeName = (vehicleTypeId: string) => {
    if (!vehicleTypeId || !vehicleTypes) return "";
    const v = vehicleTypes.find((vt: any) => vt._id === vehicleTypeId);
    return v?.typeName || vehicleTypeId;
  };

  // Per vehicle type: full campaign day list.
  const perVehicleType = useMemo(() => {
    if (!data?.vehicleTypes) return {};
    const out: Record<number, { days: string[] }> = {};
    data.vehicleTypes.forEach((vt: any) => {
      const days: string[] = [];
      const from = vt.fromDate?.slice(0, 10);
      const to = vt.toDate?.slice(0, 10);
      if (from && to) {
        let cur = from;
        while (cur <= to) {
          days.push(cur);
          const d = new Date(cur + "T00:00:00.000Z");
          d.setUTCDate(d.getUTCDate() + 1);
          cur = d.toISOString().slice(0, 10);
        }
      }
      out[vt.vehicleIndex] = { days };
    });
    return out;
  }, [data]);

  const fetchGpsHistory = async (reg: string, day: string) => {
    const key = `${reg}:${day}`;
    if (gpsCache[key] || gpsLoading[key]) return;
    setGpsLoading((p) => ({ ...p, [key]: true }));
    setGpsError((p) => ({ ...p, [key]: "" }));
    try {
      const { fromDateUTC, toDateUTC } = dayWindowUTC(day);
      const res = await axios.get("https://gpsvtsprobend.vamosys.com/getVehicleHistory", {
        params: { userId: "ADINN12", vehicleId: reg, fromDateUTC, toDateUTC, interval: -1 },
      });
      setGpsCache((p) => ({ ...p, [key]: res.data }));
    } catch (err) {
      setGpsError((p) => ({ ...p, [key]: "Failed to load GPS movement data for this day" }));
    } finally {
      setGpsLoading((p) => ({ ...p, [key]: false }));
    }
  };

  // Fetch GPS history for whichever reg/day is currently active on each
  // expanded vehicle-type card. Kept as a single top-level effect (rather
  // than one per card) so hooks are never called inside the .map() below.
  useEffect(() => {
    if (!data?.vehicleTypes) return;
    data.vehicleTypes.forEach((vt: any) => {
      if (!expanded[vt.vehicleIndex]) return;
      const { days } = perVehicleType[vt.vehicleIndex] || { days: [] };
      const activeDay = dayTab[vt.vehicleIndex] || days[0];
      if (!activeDay) return;
      const dayKey = `${vt.vehicleIndex}:${activeDay}`;
      const regs: string[] = vt.registrationNumbers || [];
      const activeReg = regTab[dayKey] || regs[0];
      if (!activeReg) return;
      fetchGpsHistory(activeReg, activeDay);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, expanded, dayTab, regTab, perVehicleType]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data || !data.vehicleTypes?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-6">
        <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
        <p className="text-sm text-gray-500">No timeline data available for this order yet.</p>
        <button
          onClick={fetchHistory}
          className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold"
        >
          <RefreshCw size={12} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-3">
      {data.vehicleTypes.map((vt: any) => {
        const isOpen = !!expanded[vt.vehicleIndex];
        const { days } = perVehicleType[vt.vehicleIndex] || { days: [] };
        const activeDay = dayTab[vt.vehicleIndex] || days[0];
        const dayKey = `${vt.vehicleIndex}:${activeDay}`;
        const regs: string[] = (vt.registrationNumbers || []).map((r: any) =>
          typeof r === "string" ? r : r.registrationNumber
        ).filter(Boolean);
        const activeReg = regTab[dayKey] || regs[0];
        const gpsKey = activeReg && activeDay ? `${activeReg}:${activeDay}` : null;

        const gps = gpsKey ? gpsCache[gpsKey] : null;
        const isGpsLoading = gpsKey ? gpsLoading[gpsKey] : false;
        const errMsg = gpsKey ? gpsError[gpsKey] : "";

        return (
          <div key={vt.vehicleIndex} className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900">
            <button
              onClick={() => setExpanded((p) => ({ ...p, [vt.vehicleIndex]: !p[vt.vehicleIndex] }))}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <Truck size={15} className="text-blue-500" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                    {getVehicleTypeName(vt.vehicleType)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {regs.length} vehicle{regs.length !== 1 ? "s" : ""} · {days.length} day{days.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              {isOpen ? <ChevronDown size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronRightIcon size={16} className="text-gray-400 flex-shrink-0" />}
            </button>

            {isOpen && (
              <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3 space-y-3">
                {days.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No campaign days found.</p>
                ) : (
                  <>
                    <div className="flex gap-1.5 overflow-x-auto pb-1 border-b border-gray-100 dark:border-gray-800">
                      {days.map((day) => (
                        <button
                          key={day}
                          onClick={() => setDayTab((p) => ({ ...p, [vt.vehicleIndex]: day }))}
                          className={`flex-shrink-0 px-3 py-2 text-xs font-semibold border-b-2 transition-all -mb-px whitespace-nowrap ${
                            activeDay === day
                              ? "border-violet-500 text-violet-600 dark:text-violet-400"
                              : "border-transparent text-gray-400 hover:text-gray-600"
                          }`}
                        >
                          {fmtDateLabel(day)}
                        </button>
                      ))}
                    </div>

                    {regs.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-8">No vehicles for this campaign.</p>
                    ) : (
                      <>
                        <div className="flex flex-wrap gap-1.5">
                          {regs.map((reg) => (
                            <button
                              key={reg}
                              onClick={() => setRegTab((p) => ({ ...p, [dayKey]: reg }))}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-all ${
                                activeReg === reg
                                  ? "bg-teal-600 border-teal-600 text-white"
                                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                              }`}
                            >
                              {reg}
                            </button>
                          ))}
                        </div>

                        <div className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                          <div className="flex items-center justify-between gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/50">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-mono text-sm font-bold text-gray-800 dark:text-gray-100">{activeReg}</span>
                              <span className="text-xs text-gray-400">{fmtDateLabel(activeDay)}</span>
                            </div>
                            <Clock size={13} className="text-gray-400" />
                          </div>

                          {isGpsLoading ? (
                            <div className="flex items-center justify-center py-10">
                              <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                            </div>
                          ) : errMsg ? (
                            <div className="flex flex-col items-center justify-center py-8 gap-2">
                              <p className="text-xs text-gray-400">{errMsg}</p>
                              <button
                                onClick={() => activeReg && activeDay && fetchGpsHistory(activeReg, activeDay)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold"
                              >
                                <RefreshCw size={11} /> Retry
                              </button>
                            </div>
                          ) : gps ? (
                            <TimelineDayDetail gps={gps} day={activeDay} />
                          ) : (
                            <p className="px-3 py-8 text-xs text-gray-400 text-center">No GPS data.</p>
                          )}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Aggregate bar + important vehicle/day details for one reg/day ──
function TimelineDayDetail({ gps, day }: { gps: any; day: string }) {
  const running = gps.totalRunningTime || 0;
  const parked = gps.totalParkedTime || 0;
  const idle = gps.totalIdleTime || 0;
  const noData = gps.totalNoDataTime || 0;
  const total = running + parked + idle + noData || DAY_MS;

  const aggregateSegments = [
    { key: "M", ms: running },
    { key: "P", ms: parked },
    { key: "S", ms: idle },
    { key: "N", ms: noData },
  ].filter((s) => s.ms > 0);

  // Resolve startLocation/endLocation "lat,lng" strings into a human address
  // via the same reverse-geocode service the backend uses for driver pings.
  const [addresses, setAddresses] = useState<{ start: string; end: string }>({ start: "", end: "" });
  const [addressLoading, setAddressLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setAddresses({ start: "", end: "" });
    const hasStart = !!gps.startLocation;
    const hasEnd = !!gps.endLocation;
    if (!hasStart && !hasEnd) return;
    setAddressLoading(true);
    Promise.all([
      hasStart ? reverseGeocode(gps.startLocation) : Promise.resolve(""),
      hasEnd ? reverseGeocode(gps.endLocation) : Promise.resolve(""),
    ]).then(([start, end]) => {
      if (!cancelled) setAddresses({ start, end });
    }).finally(() => {
      if (!cancelled) setAddressLoading(false);
    });
    return () => { cancelled = true; };
  }, [gps.startLocation, gps.endLocation]);

  const locationValue = (raw: string, resolved: string) => {
    if (!raw) return "—";
    if (addressLoading) return "Resolving address...";
    return resolved || raw;
  };

  const infoCards = [
    { label: "Driver", value: gps.driverName || "—", sub: gps.driverMobile || "" },
    { label: "Trip Distance", value: gps.tripDistance ? `${gps.tripDistance} km` : "—" },
    { label: "Avg Speed", value: gps.avgSpeed != null ? `${gps.avgSpeed} km/h` : "—" },
    { label: "Top Speed", value: gps.topSpeed != null ? `${gps.topSpeed} km/h` : "—", sub: gps.topSpeedTime || "" },
    { label: "Opening Odo", value: gps.openingOdoReading != null ? `${gps.openingOdoReading} km` : "—" },
    { label: "Closing Odo", value: gps.closingOdoReading != null ? `${gps.closingOdoReading} km` : "—" },
    { label: "Over Speed", value: gps.overSpeedInstances != null ? `${gps.overSpeedInstances} time${gps.overSpeedInstances === 1 ? "" : "s"}` : "—", sub: gps.overSpeedLimit ? `limit ${gps.overSpeedLimit} km/h` : "" },
    { label: "Idle Count", value: gps.idleCount != null ? gps.idleCount : "—" },
    { label: "Parking Count", value: gps.parkingCount != null ? gps.parkingCount : "—" },
    { label: "Fuel (Start → End)", value: gps.startFuel != null && gps.endFuel != null ? `${gps.startFuel} → ${gps.endFuel} L` : "—" },
    { label: "Start Location", value: locationValue(gps.startLocation, addresses.start), sub: gps.startLocation || "", wide: true },
    { label: "End Location", value: locationValue(gps.endLocation, addresses.end), sub: gps.endLocation || "", wide: true },
    { label: "Vehicle Mode", value: gps.vehicleMode || "—" },
  ];

  return (
    <div className="p-4 space-y-5">
      {/* Aggregate 24-hour bar */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">24-Hour Summary</p>
        <div className="w-full h-3.5 rounded-full overflow-hidden flex bg-gray-100 dark:bg-gray-800 shadow-inner">
          {aggregateSegments.map((s, i) => {
            const meta = s.key === "N" ? NO_DATA_META : POSITION_META[s.key];
            const pct = Math.max((s.ms / total) * 100, 0.5);
            return <div key={i} className={meta.bar} style={{ width: `${pct}%` }} title={`${meta.label}: ${fmtHM(s.ms)}`} />;
          })}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
          {[{ key: "M", ms: running }, { key: "P", ms: parked }, { key: "S", ms: idle }, { key: "N", ms: noData }].map((s) => {
            const meta = s.key === "N" ? NO_DATA_META : POSITION_META[s.key];
            return (
              <div key={s.key} className="flex items-center gap-2 rounded-lg border border-gray-100 dark:border-gray-800 px-2.5 py-2">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${meta.dot}`} />
                <div className="min-w-0">
                  <p className="text-[11px] text-gray-400 leading-tight">{meta.label}</p>
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-200 leading-tight">{fmtHM(s.ms)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Important vehicle/day details */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Vehicle Details — {fmtDateLabel(day)}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {infoCards.map((c, i) => (
            <div
              key={i}
              className={`rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 px-3 py-2.5 ${c.wide ? "col-span-2 sm:col-span-3" : ""}`}
            >
              <p className="text-[11px] text-gray-400 uppercase tracking-wide">{c.label}</p>
              <p className={`text-sm font-semibold text-gray-800 dark:text-gray-100 mt-0.5 ${c.wide ? "" : "truncate"}`} title={c.wide ? undefined : String(c.value)}>
                {c.value === "—" || c.value === "" ? <span className="text-gray-400 font-normal">Missing</span> : c.value}
              </p>
              {c.sub && <p className="text-[11px] text-gray-400 mt-0.5 break-all">{c.sub}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
