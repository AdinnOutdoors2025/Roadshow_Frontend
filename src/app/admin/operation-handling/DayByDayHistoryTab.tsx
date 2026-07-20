/* eslint-disable */
// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Truck, User, RefreshCw, ChevronDown, ChevronRight as ChevronRightIcon,
  ArrowRightLeft, AlertTriangle, Gauge, XCircle, Clock,
} from "lucide-react";
import { getToken } from "../../utils/auth";
import API_BASE from "../../../../baseurl";

const fmtDatetime = (s?: string) => {
  if (!s) return "—";
  return new Date(s).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const fmtTime = (s?: string) => {
  if (!s) return "";
  return new Date(s).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

const fmtDateLabel = (dateKey: string) =>
  new Date(dateKey + "T00:00:00.000Z").toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", weekday: "short",
  });

const getImageUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_BASE.replace("/api", "")}${url}`;
};

// Unified per-category presentation metadata: icon, accent color, timestamp field, title/body renderer.
const CATEGORY_META: Record<string, any> = {
  driverChangeHistory: {
    icon: ArrowRightLeft,
    color: "sky",
    getTimestamp: (e: any) => e.changedAt,
    getTitle: (e: any) => e.eventType || "Driver Change",
    renderBody: (e: any) => (
      <>
        {(e.oldDriverName || e.newDriverName) ? (
          <div className="grid grid-cols-2 gap-2 mt-1.5 text-xs">
            <div>
              <p className="text-gray-400">Old Driver</p>
              <p className="font-semibold text-gray-700 dark:text-gray-300">{e.oldDriverName || "—"} · {e.oldDriverPhone || "—"}</p>
              {e.oldVehicleRegistrationNumber && <p className="font-mono text-gray-500">{e.oldVehicleRegistrationNumber}</p>}
            </div>
            <div>
              <p className="text-gray-400">New Driver</p>
              <p className="font-semibold text-gray-700 dark:text-gray-300">{e.newDriverName || "—"} · {e.newDriverPhone || "—"}</p>
              {e.newVehicleRegistrationNumber && <p className="font-mono text-gray-500">{e.newVehicleRegistrationNumber}</p>}
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-500 mt-1">
            {e.driverName} · {e.driverPhone} — <span className="font-mono">{e.vehicleRegistrationNumber}</span>
          </p>
        )}
        {e.comments && <p className="text-xs text-gray-400 mt-1.5">Comments: {e.comments}</p>}
        <p className="text-xs text-gray-400 mt-1">Updated by {e.changedBy || "—"}</p>
      </>
    ),
  },
  issueHistory: {
    icon: AlertTriangle,
    color: "amber",
    getTimestamp: (e: any) => (e.status === "resolved-today" ? e.resolvedAt || e.createdAt : e.createdAt),
    getTitle: (e: any) => (e.status === "resolved-today" ? "Issue Resolved" : e.status === "open" ? "Issue Reported" : "Issue"),
    renderBody: (e: any) => (
      <>
        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{e.issueDescription}</p>
        {e.issuePhoto && (
          <a href={getImageUrl(e.issuePhoto)} target="_blank" rel="noreferrer">
            <img src={getImageUrl(e.issuePhoto)} className="w-14 h-12 rounded-lg object-cover border mt-1.5" alt="issue" />
          </a>
        )}
        {e.resolveDescription && (
          <div className="mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-800/50">
            <p className="text-xs text-emerald-600 font-semibold">Resolution</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{e.resolveDescription}</p>
            <p className="text-xs text-gray-400 mt-0.5">By {e.resolvedBy} · {fmtDatetime(e.resolvedAt)}</p>
          </div>
        )}
        <p className="text-xs text-gray-400 mt-1.5">Created by {e.createdBy}</p>
      </>
    ),
  },
  extraKmHistory: {
    icon: Gauge,
    color: "fuchsia",
    getTimestamp: (e: any) => e.updatedAt,
    getTitle: (e: any) => `${e.extraKm} km / ${e.extraHours} hrs`,
    renderBody: (e: any) => (
      <>
        <p className="text-xs text-gray-500 mt-1">Logged for period: {e.loggedFor}</p>
        <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
          ₹ {Number(e.totalCost || 0).toLocaleString("en-IN")}
        </p>
        <p className="text-xs text-gray-400 mt-1">Updated by {e.updatedBy}</p>
      </>
    ),
  },
  dailyHoursHistory: {
    icon: Clock,
    color: "indigo",
    getTimestamp: (e: any) => e.loggedAt,
    getTitle: (e: any) => `${e.runningHours} hrs logged`,
    renderBody: (e: any) => (
      <>
        <p className="text-xs text-gray-500 mt-1">
          {fmtTime(e.startTime)} – {fmtTime(e.endTime)}
        </p>
        <div className="flex items-center gap-3 mt-1 text-xs">
          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Running: {e.runningHours} hrs</span>
          {e.absentHours > 0 && <span className="text-amber-600 font-semibold">Absent: {e.absentHours} hrs</span>}
        </div>
        {e.remarks && <p className="text-xs text-gray-400 mt-1.5">Remarks: {e.remarks}</p>}
        <p className="text-xs text-gray-400 mt-1">Logged by {e.loggedBy}</p>
      </>
    ),
  },
  unavailableHistory: {
    icon: XCircle,
    color: "rose",
    getTimestamp: (e: any) => e.reportedAt,
    getTitle: (e: any) =>
      e.eventType === "replaced" ? "Vehicle Replaced" : e.status === "unavailable" ? "Marked Unavailable" : "Marked Available",
    renderBody: (e: any) => (
      <>
        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{e.reason}</p>
        {e.photo && (
          <a href={getImageUrl(e.photo)} target="_blank" rel="noreferrer">
            <img src={getImageUrl(e.photo)} className="w-14 h-12 rounded-lg object-cover border mt-1.5" alt="unavailable" />
          </a>
        )}
        {e.eventType === "replaced" && (
          <div className="mt-2 pt-2 border-t border-rose-200 dark:border-rose-800/50 grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-gray-400">Old Vehicle</p>
              <p className="font-mono font-semibold text-gray-700 dark:text-gray-300">{e.vehicleRegistrationNumber}</p>
            </div>
            <div>
              <p className="text-amber-600">Replacement</p>
              <p className="font-mono font-semibold text-gray-700 dark:text-gray-300">{e.replacementVehicleRegistrationNumber}</p>
              <p className="text-gray-500">{e.replacementDriverName} · {e.replacementDriverPhone}</p>
            </div>
          </div>
        )}
        {e.resolveDescription && (
          <div className="mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-800/50">
            <p className="text-xs text-emerald-600 font-semibold">Resolution</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{e.resolveDescription}</p>
          </div>
        )}
        <p className="text-xs text-gray-400 mt-1.5">Reported by {e.reportedBy}</p>
      </>
    ),
  },
};

const ACCENT = {
  sky: { dot: "bg-sky-500", border: "border-sky-100 dark:border-sky-900/40", chip: "bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300" },
  amber: { dot: "bg-amber-500", border: "border-amber-100 dark:border-amber-900/40", chip: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300" },
  fuchsia: { dot: "bg-fuchsia-500", border: "border-fuchsia-100 dark:border-fuchsia-900/40", chip: "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-900/20 dark:text-fuchsia-300" },
  rose: { dot: "bg-rose-500", border: "border-rose-100 dark:border-rose-900/40", chip: "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300" },
  indigo: { dot: "bg-indigo-500", border: "border-indigo-100 dark:border-indigo-900/40", chip: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300" },
};

const STATUS_CHIP: Record<string, string> = {
  "On Road": "bg-emerald-100 text-emerald-700",
  Unavailable: "bg-red-100 text-red-700",
  Released: "bg-gray-200 text-gray-600",
  Replaced: "bg-amber-100 text-amber-700",
  Removed: "bg-gray-200 text-gray-600",
};

// Walking a reg's own chronological events, decide status/driver "as of" a given day (inclusive).
// Also returns the day the current (terminal) status took effect, so callers can decide
// whether a Removed/Unavailable/Replaced vehicle should still be shown "today" or not.
function computeRegSnapshot(eventsUpToDay: any[]) {
  let status = "On Road";
  let statusReason = "";
  let statusTime: string | null = null;
  let statusDay: string | null = null;
  for (let i = eventsUpToDay.length - 1; i >= 0; i--) {
    const e = eventsUpToDay[i];
    if (e._category === "unavailableHistory") {
      status = e.eventType === "replaced" ? "Replaced" : e.status === "unavailable" ? "Unavailable" : "On Road";
      statusReason = e.reason || "";
      statusTime = e._timestamp;
      statusDay = e._day;
      break;
    }
    if (e._category === "driverChangeHistory" && /removed/i.test(e.eventType || "")) {
      status = "Removed";
      statusReason = e.comments || "";
      statusTime = e.changedAt;
      statusDay = e._day;
      break;
    }
  }
  let driverName = "";
  let driverPhone = "";
  for (let i = eventsUpToDay.length - 1; i >= 0; i--) {
    const e = eventsUpToDay[i];
    if (e._category === "driverChangeHistory") {
      driverName = e.newDriverName || e.driverName || "";
      driverPhone = e.newDriverPhone || e.driverPhone || "";
      break;
    }
  }
  return { status, statusReason, statusTime, statusDay, driverName, driverPhone };
}

export default function DayByDayHistoryTab({ order }: { order: { _id: string } }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [dayTab, setDayTab] = useState<Record<number, string>>({});
  const [regTab, setRegTab] = useState<Record<string, string>>({});

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
      toast.error(err?.response?.data?.message || "Failed to load day-by-day history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order._id]);

  // Per vehicle type: full campaign day list + every event tagged & grouped by registration number.
  const perVehicleType = useMemo(() => {
    if (!data?.vehicleTypes) return {};
    const out: Record<number, { days: string[]; eventsByReg: Record<string, any[]> }> = {};

    data.vehicleTypes.forEach((vt: any) => {
      const allEvents: any[] = [];
      Object.keys(CATEGORY_META).forEach((catKey) => {
        (data[catKey] || []).forEach((e: any) => {
          if (e.vehicleIndex !== vt.vehicleIndex) return;
          const meta = CATEGORY_META[catKey];
          allEvents.push({ ...e, _category: catKey, _timestamp: meta.getTimestamp(e), _day: e.day });
        });
      });
      allEvents.sort((a, b) => new Date(a._timestamp || 0).getTime() - new Date(b._timestamp || 0).getTime());

      const eventsByReg: Record<string, any[]> = {};
      allEvents.forEach((e) => {
        const reg = e.vehicleRegistrationNumber;
        if (reg) {
          if (!eventsByReg[reg]) eventsByReg[reg] = [];
          eventsByReg[reg].push(e);
        }
        // A "replaced" event also introduces the replacement reg as active from that day.
        if (e._category === "unavailableHistory" && e.eventType === "replaced" && e.replacementVehicleRegistrationNumber) {
          const rreg = e.replacementVehicleRegistrationNumber;
          if (!eventsByReg[rreg]) eventsByReg[rreg] = [];
          eventsByReg[rreg].push({ ...e, vehicleRegistrationNumber: rreg, _category: "driverChangeHistory", eventType: "Replacement Vehicle Added", newDriverName: e.replacementDriverName, newDriverPhone: e.replacementDriverPhone });
        }
      });

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
      allEvents.forEach((e) => {
        if (e._day && !days.includes(e._day)) days.push(e._day);
      });
      days.sort();

      out[vt.vehicleIndex] = { days, eventsByReg };
    });
    return out;
  }, [data]);

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
        <p className="text-sm text-gray-500">No day-by-day history available for this order yet.</p>
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
        const { days, eventsByReg } = perVehicleType[vt.vehicleIndex] || { days: [], eventsByReg: {} };
        const activeDay = dayTab[vt.vehicleIndex] || days[0];

        // Build the day's vehicle roster: every reg active on activeDay. Vehicles whose status
        // turned Removed/Unavailable/Replaced on an earlier day are dropped — only On Road
        // vehicles (or ones whose status just changed today) carry forward.
        const dayRows = Object.keys(eventsByReg)
          .map((reg) => {
            const events = eventsByReg[reg];
            const eventsUpToDay = events.filter((e) => (e._day || "") <= activeDay);
            if (eventsUpToDay.length === 0) return null;
            const snapshot = computeRegSnapshot(eventsUpToDay);
            if (snapshot.status !== "On Road" && snapshot.statusDay !== activeDay) return null;
            const todaysEvents = events.filter((e) => e._day === activeDay);
            return { reg, firstDay: eventsUpToDay[0]._day, todaysEvents, ...snapshot };
          })
          .filter(Boolean)
          .sort((a: any, b: any) => (a.firstDay || "").localeCompare(b.firstDay || ""));

        const dayKey = `${vt.vehicleIndex}:${activeDay}`;
        const activeReg = regTab[dayKey] || dayRows[0]?.reg;
        const activeRow = dayRows.find((r: any) => r.reg === activeReg);

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
                    {vt.vehicleType} {vt.vehicleModel ? `· ${vt.vehicleModel}` : ""}
                  </p>
                  <p className="text-xs text-gray-400">
                    {vt.registrationNumbers.length} vehicle{vt.registrationNumbers.length !== 1 ? "s" : ""} · {days.length} day{days.length !== 1 ? "s" : ""}
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

                    <div className="pt-1 space-y-3">
                      {dayRows.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-8">No vehicles active on this day.</p>
                      ) : (
                        <>
                          <div className="flex flex-wrap gap-1.5">
                            {dayRows.map((row: any) => (
                              <button
                                key={row.reg}
                                onClick={() => setRegTab((p) => ({ ...p, [dayKey]: row.reg }))}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-all ${
                                  activeReg === row.reg
                                    ? "bg-teal-600 border-teal-600 text-white"
                                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                }`}
                              >
                                {row.reg}
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeReg === row.reg ? "bg-white/20 text-white" : STATUS_CHIP[row.status] || "bg-blue-100 text-blue-700"}`}>
                                  {row.status}
                                </span>
                              </button>
                            ))}
                          </div>

                          {activeRow && (
                            <div className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                              <div className="flex items-center justify-between gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/50">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="font-mono text-sm font-bold text-gray-800 dark:text-gray-100">{activeRow.reg}</span>
                                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_CHIP[activeRow.status] || "bg-blue-100 text-blue-700"}`}>
                                    {activeRow.status}
                                  </span>
                                </div>
                                {activeRow.driverName && (
                                  <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                                    <User size={11} /> {activeRow.driverName}{activeRow.driverPhone ? ` · ${activeRow.driverPhone}` : ""}
                                  </div>
                                )}
                              </div>

                              {activeRow.status === "Unavailable" && activeRow.statusReason && (
                                <p className="px-3 pt-2 text-xs text-red-600 dark:text-red-400">
                                  Unavailable since {fmtTime(activeRow.statusTime)}: {activeRow.statusReason}
                                </p>
                              )}
                              {activeRow.status === "Replaced" && activeRow.statusReason && (
                                <p className="px-3 pt-2 text-xs text-amber-600 dark:text-amber-400">
                                  Replaced at {fmtTime(activeRow.statusTime)}: {activeRow.statusReason}
                                </p>
                              )}

                              {activeRow.todaysEvents.length === 0 ? (
                                <p className="px-3 py-2 text-xs text-gray-400">Continued from previous day — no new activity.</p>
                              ) : (
                                <div className="p-3 space-y-2">
                                  {activeRow.todaysEvents.map((e: any, i: number) => {
                                    const meta = CATEGORY_META[e._category];
                                    const accent = ACCENT[meta.color];
                                    const Icon = meta.icon;
                                    return (
                                      <div key={i} className={`rounded-lg border p-2.5 ${accent.border}`}>
                                        <div className="flex items-center justify-between gap-2">
                                          <span className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${accent.chip}`}>
                                            <Icon size={10} /> {meta.getTitle(e)}
                                          </span>
                                          <span className="text-xs text-gray-400 whitespace-nowrap">{fmtTime(e._timestamp)}</span>
                                        </div>
                                        {meta.renderBody(e)}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
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
