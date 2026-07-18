/* eslint-disable */
// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Truck, User, Phone, Calendar, RefreshCw, ChevronLeft, ChevronRight,
  ArrowRightLeft, AlertTriangle, Gauge, History as HistoryIcon,
  XCircle, CheckCircle2, FileText, Clock,
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

const fmtDateLabel = (dateKey: string) =>
  new Date(dateKey + "T00:00:00.000Z").toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", weekday: "short",
  });

const getImageUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_BASE.replace("/api", "")}${url}`;
};

const CATEGORIES = [
  { key: "driverChangeHistory", label: "Driver Change History", icon: ArrowRightLeft },
  { key: "issueHistory", label: "Issue / Escalation History", icon: AlertTriangle },
  { key: "extraKmHistory", label: "Extra KM History", icon: Gauge },
  { key: "unavailableHistory", label: "Vehicle Unavailable History", icon: XCircle },
];

export default function DayByDayHistoryTab({ order }: { order: { _id: string } }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [vehicleIndex, setVehicleIndex] = useState<number | null>(null);
  const [regNo, setRegNo] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [category, setCategory] = useState(CATEGORIES[0].key);

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
      if (firstVt) {
        setVehicleIndex(firstVt.vehicleIndex);
        setRegNo(firstVt.registrationNumbers?.[0]?.registrationNumber || null);
        setSelectedDate(payload.campaignStart);
      }
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

  const activeVehicleType = useMemo(
    () => data?.vehicleTypes?.find((v: any) => v.vehicleIndex === vehicleIndex),
    [data, vehicleIndex]
  );

  const days = useMemo(() => {
    if (!activeVehicleType) return [];
    const from = activeVehicleType.fromDate?.slice(0, 10);
    const to = activeVehicleType.toDate?.slice(0, 10);
    if (!from || !to) return [];
    const out: string[] = [];
    let cur = from;
    while (cur <= to) {
      out.push(cur);
      const d = new Date(cur + "T00:00:00.000Z");
      d.setUTCDate(d.getUTCDate() + 1);
      cur = d.toISOString().slice(0, 10);
    }
    return out;
  }, [activeVehicleType]);

  const dayIdx = days.indexOf(selectedDate || "");

  const filteredEvents = useMemo(() => {
    if (!data || vehicleIndex == null || !regNo || !selectedDate) return [];
    const list = data[category] || [];
    return list.filter(
      (e: any) =>
        e.vehicleIndex === vehicleIndex &&
        e.vehicleRegistrationNumber === regNo &&
        e.day === selectedDate
    );
  }, [data, category, vehicleIndex, regNo, selectedDate]);

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
    <div className="p-4 sm:p-6 space-y-4">
      {/* Level 1: Vehicle Type */}
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">1. Vehicle Type</p>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {data.vehicleTypes.map((vt: any) => (
            <button
              key={vt.vehicleIndex}
              onClick={() => {
                setVehicleIndex(vt.vehicleIndex);
                setRegNo(vt.registrationNumbers?.[0]?.registrationNumber || null);
                setSelectedDate(vt.fromDate?.slice(0, 10));
              }}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                vehicleIndex === vt.vehicleIndex
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <Truck size={12} /> {vt.vehicleType} {vt.vehicleModel ? `· ${vt.vehicleModel}` : ""}
            </button>
          ))}
        </div>
      </div>

      {/* Level 2: Registration Number */}
      {activeVehicleType && (
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">2. Registration Number</p>
          {activeVehicleType.registrationNumbers.length === 0 ? (
            <p className="text-xs text-gray-400">No vehicles have been assigned to this slot yet.</p>
          ) : (
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {activeVehicleType.registrationNumbers.map(({ registrationNumber: reg, status }: any) => (
                <button
                  key={reg}
                  onClick={() => setRegNo(reg)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-all ${
                    regNo === reg
                      ? "bg-teal-600 border-teal-600 text-white"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {reg}
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      regNo === reg
                        ? "bg-white/20 text-white"
                        : status === "On Road"
                        ? "bg-emerald-100 text-emerald-700"
                        : status === "Unavailable"
                        ? "bg-red-100 text-red-700"
                        : status === "Released"
                        ? "bg-gray-200 text-gray-600"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {status}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Level 3: Campaign Date */}
      {regNo && days.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">3. Campaign Date</p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => dayIdx > 0 && setSelectedDate(days[dayIdx - 1])}
                disabled={dayIdx <= 0}
                className="w-6 h-6 flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 disabled:opacity-30"
              >
                <ChevronLeft size={12} />
              </button>
              <button
                onClick={() => dayIdx < days.length - 1 && setSelectedDate(days[dayIdx + 1])}
                disabled={dayIdx < 0 || dayIdx >= days.length - 1}
                className="w-6 h-6 flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 disabled:opacity-30"
              >
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {days.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDate(d)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                  selectedDate === d
                    ? "bg-violet-600 border-violet-600 text-white"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {new Date(d + "T00:00:00.000Z").toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category tabs */}
      {selectedDate && (
        <>
          <div className="flex items-center gap-1 overflow-x-auto border-b border-gray-100 dark:border-gray-800 pb-0">
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              return (
                <button
                  key={c.key}
                  onClick={() => setCategory(c.key)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all -mb-px whitespace-nowrap ${
                    category === c.key
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <Icon size={12} /> {c.label}
                </button>
              );
            })}
          </div>

          <div className="pt-2">
            <p className="text-xs text-gray-400 mb-3">
              Showing <b>{category.replace(/([A-Z])/g, " $1")}</b> for <b className="font-mono">{regNo}</b> on{" "}
              <b>{fmtDateLabel(selectedDate)}</b>
            </p>

            {filteredEvents.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">No records for this category on this day.</p>
            ) : (
              <div className="space-y-2.5">
                {category === "driverChangeHistory" && filteredEvents.map((e: any, i: number) => (
                  <EventCard key={i} accent="sky">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{e.eventType}</span>
                      <span className="text-xs text-gray-400">{fmtDatetime(e.changedAt)}</span>
                    </div>
                    {(e.oldDriverName || e.newDriverName) ? (
                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
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
                        {e.driverName} · {e.driverPhone} — {e.vehicleRegistrationNumber}
                      </p>
                    )}
                    {e.comments && <p className="text-xs text-gray-400 mt-1.5">Comments: {e.comments}</p>}
                    <p className="text-xs text-gray-400 mt-1">Updated by {e.changedBy || "—"}</p>
                  </EventCard>
                ))}

                {category === "issueHistory" && filteredEvents.map((e: any, i: number) => (
                  <EventCard key={i} accent={e.status === "open" ? "amber" : "emerald"}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${e.status === "open" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {e.status === "resolved-today" ? "Resolved Today" : e.status}
                      </span>
                      <span className="text-xs text-gray-400">{fmtDatetime(e.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1.5">{e.issueDescription}</p>
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
                  </EventCard>
                ))}

                {category === "extraKmHistory" && filteredEvents.map((e: any, i: number) => (
                  <EventCard key={i} accent="fuchsia">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                        {e.extraKm} km / {e.extraHours} hrs
                      </span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        ₹ {Number(e.totalCost || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Logged for period: {e.loggedFor}</p>
                    <p className="text-xs text-gray-400 mt-1">Updated by {e.updatedBy} · {fmtDatetime(e.updatedAt)}</p>
                  </EventCard>
                ))}

                {category === "driverStatusHistory" && filteredEvents.map((e: any, i: number) => (
                  <EventCard key={i} accent="indigo">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 capitalize">
                        Driver {e.statusEvent}
                      </span>
                      <span className="text-xs text-gray-400">{fmtDatetime(e.changedAt)}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1.5">{e.driverName} · {e.driverPhone}</p>
                    {e.comments && <p className="text-xs text-gray-400 mt-1">Comments: {e.comments}</p>}
                    <p className="text-xs text-gray-400 mt-1">Updated by {e.changedBy || "—"}</p>
                  </EventCard>
                ))}

                {category === "vehicleStatusTimeline" && filteredEvents.map((e: any, i: number) => (
                  <EventCard key={i} accent={e.statusLabel === "No Changes" ? "gray" : "sky"}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{e.statusLabel}</span>
                    </div>
                    {(e.performedBy || e.comments) && (
                      <p className="text-xs text-gray-400 mt-1">
                        {e.performedBy && <>By {e.performedBy}</>} {e.comments && <>· {e.comments}</>}
                      </p>
                    )}
                  </EventCard>
                ))}

                {category === "unavailableHistory" && filteredEvents.map((e: any, i: number) => (
                  <EventCard key={i} accent="rose">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                        {e.eventType === "replaced" ? "Replaced" : e.status === "unavailable" ? "Unavailable" : "Available"}
                      </span>
                      <span className="text-xs text-gray-400">{fmtDatetime(e.reportedAt)}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1.5">{e.reason}</p>
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
                    <p className="text-xs text-gray-400 mt-1.5">Released by {e.reportedBy}</p>
                  </EventCard>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function EventCard({ children, accent = "gray" }: { children: any; accent?: string }) {
  const accentMap: Record<string, string> = {
    sky: "border-sky-100 dark:border-sky-900/40",
    amber: "border-amber-100 dark:border-amber-900/40",
    emerald: "border-emerald-100 dark:border-emerald-900/40",
    fuchsia: "border-fuchsia-100 dark:border-fuchsia-900/40",
    indigo: "border-indigo-100 dark:border-indigo-900/40",
    rose: "border-rose-100 dark:border-rose-900/40",
    gray: "border-gray-100 dark:border-gray-800",
  };
  return (
    <div className={`rounded-xl border bg-white dark:bg-gray-900 p-3 ${accentMap[accent] || accentMap.gray}`}>
      {children}
    </div>
  );
}
