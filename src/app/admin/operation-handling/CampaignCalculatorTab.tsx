/* eslint-disable */
// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Calendar, Truck, User, Phone, IndianRupee, RefreshCw,
  ArrowRightLeft, LogOut, ChevronLeft, ChevronRight, Gauge,
  Clock, ReceiptText, AlertTriangle, LayoutGrid, ListChecks,
  FileCheck2, MinusCircle, Gift, AlertOctagon, ShieldAlert, CalendarX2,
  ChevronDown, ChevronUp, History,
} from "lucide-react";
import { getToken } from "../../utils/auth";
import API_BASE from "../../../../baseurl";
import CompensationModal from "./CompensationModal";
import PoolWindowModal from "./PoolWindowModal";
import LogHoursModal from "./LogHoursModal";


const ABSENT_SUGGEST_THRESHOLD_HOURS = Number(process.env.NEXT_PUBLIC_ABSENT_THRESHOLD_HOURS) || 4;

interface Order {
  _id: string;
  orderId: string;
}

const fmt = (n?: number | null) =>
  n != null ? `₹ ${Number(n).toLocaleString("en-IN")}` : "₹ 0";

const fmtHm = (n?: number | null) => {
  if (n == null || isNaN(n)) return "0h";
  const totalMinutes = Math.round(Math.abs(n) * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const sign = n < 0 ? "-" : "";
  if (h === 0) return `${sign}${m}m`;
  if (m === 0) return `${sign}${h}h`;
  return `${sign}${h}h ${m}m`;
};

const fmtClock = (d?: string | null) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "—";
  let h = dt.getHours();
  const m = dt.getMinutes();
  const suffix = h >= 12 ? "pm" : "am";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, "0")} ${suffix}`;
};

const TIMELINE_STYLE: Record<string, { label: string; className: string; dot: string }> = {
  running: { label: "Running", className: "text-indigo-600 dark:text-indigo-400", dot: "bg-indigo-500" },
  issue: { label: "Issue", className: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
  unavailable: { label: "Unavailable", className: "text-rose-600 dark:text-rose-400", dot: "bg-rose-500" },
};

const toISODateKey = (d?: string | null) => {
  if (!d) return null;
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return null;
  return dt.toISOString().slice(0, 10);
};

const fmtShortDate = (d?: string | null) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

const fmtDateLabel = (dateKey: string) =>
  new Date(dateKey + "T00:00:00.000Z").toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", weekday: "short",
  });


const fmtDatetime = (d?: string | null) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "—";
  return dt.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};


const HISTORY_CATEGORY_META: Record<string, any> = {
  issueHistory: {
    icon: AlertOctagon,
    label: "issue",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    border: "border-amber-100 dark:border-amber-900/40",
    getTimestamp: (e: any) => e.createdAt,
    getTitle: (e: any) => "Issue Reported",
  },
  unavailableHistory: {
    icon: ShieldAlert,
    label: "unavailable",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
    border: "border-rose-100 dark:border-rose-900/40",
    getTimestamp: (e: any) => e.reportedAt,
    getTitle: (e: any) => (e.eventType === "replaced" ? "Replaced" : "Marked Unavailable"),
  },
  extraKmHistory: {
    icon: Gauge,
    label: "extra-km",
    badge: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300",
    border: "border-fuchsia-100 dark:border-fuchsia-900/40",
    getTimestamp: (e: any) => e.updatedAt,
    getTitle: (e: any) => "Extra KM / Hours Applied",
  },
  driverChangeHistory: {
    icon: ArrowRightLeft,
    label: "driver",
    badge: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
    border: "border-sky-100 dark:border-sky-900/40",
    getTimestamp: (e: any) => e.changedAt,
  
    getTitle: (e: any) =>
      e.eventType === "Vehicle Added" ? "Vehicle Assigned" : e.eventType === "Vehicle Removed" ? "Vehicle Removed" : "Driver/Vehicle Updated",
  },
};

const SECTIONS = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "daily", label: "Daily Timeline", icon: Calendar },
  { key: "vehicles", label: "Vehicle Breakdown", icon: Truck },
  { key: "billing", label: "Final Billing", icon: FileCheck2 },
];

export default function CampaignCalculatorTab({ order, onRefresh: parentOnRefresh, vehicleTypes, isAdmin }: { order: Order, onRefresh?: () => Promise<void>, vehicleTypes:any, isAdmin?: number }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [historyData, setHistoryData] = useState<any>(null);
  const [section, setSection] = useState("overview");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [compensationVehicleIndex, setCompensationVehicleIndex] = useState<number | null>(null);
  const [poolWindowVehicleIndex, setPoolWindowVehicleIndex] = useState<number | null>(null);
  const [logHoursVehicleIndex, setLogHoursVehicleIndex] = useState<number | null>(null);
  const [logHoursEntryId, setLogHoursEntryId] = useState<string | null>(null);
  const [expandedTimelines, setExpandedTimelines] = useState<Record<string, boolean>>({});
  const toggleTimeline = (entryId: string) =>
    setExpandedTimelines((prev) => ({ ...prev, [entryId]: !prev[entryId] }));
 
  const [expandedSlotVehicleIndex, setExpandedSlotVehicleIndex] = useState<number | null>(null);

  const fetchCalculator = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE}admin/pipeline/${order._id}/campaign-calculator`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      const payload = res.data?.data;
      setData(payload);
      const days = payload?.days || [];
      const lastActive = [...days].reverse().find((d: any) => d.dayTotal > 0);
      setSelectedDate((lastActive || days[days.length - 1])?.date || null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load campaign calculator");
    } finally {
      setLoading(false);
    }
  };


  const fetchHistory = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}admin/pipeline/${order._id}/day-by-day-history`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setHistoryData(res.data?.data || null);
    } catch (err: any) {
      // Non-fatal — the History section will just show "no data" if this fails.
    }
  };

  useEffect(() => {
    fetchCalculator();
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order._id]);


  const refreshAll = async () => {
    await Promise.all([fetchCalculator(), fetchHistory(), parentOnRefresh ? parentOnRefresh() : Promise.resolve()]);
  };

  const dayIndex = useMemo(() => {
    if (!data) return -1;
    return data.days.findIndex((d: any) => d.date === selectedDate);
  }, [data, selectedDate]);

  const selectedDay = dayIndex >= 0 ? data.days[dayIndex] : null;

  const goPrevDay = () => {
    if (!data || dayIndex <= 0) return;
    setSelectedDate(data.days[dayIndex - 1].date);
  };
  const goNextDay = () => {
    if (!data || dayIndex < 0 || dayIndex >= data.days.length - 1) return;
    setSelectedDate(data.days[dayIndex + 1].date);
  };

  // Per-vehicle-type totals rolled up across every campaign day, for the Vehicle Breakdown section.
  const vehicleTotals = useMemo(() => {
    if (!data?.days) return [];
    const map: Record<number, any> = {};
    data.days.forEach((d: any) => {
      d.vehicles.forEach((v: any) => {
        if (!map[v.vehicleIndex]) {
          map[v.vehicleIndex] = {
            vehicleIndex: v.vehicleIndex,
            vehicleType: v.vehicleType,
            vehicleModel: v.vehicleModel,
            bookedQuantity: v.bookedQuantity,
            daysActive: 0,
            rentalTotal: 0,
            extraKmTotal: 0,
            extraHourTotal: 0,
            rtoTotal: 0,
            promoterTotal: 0,
            compensationTotal: 0,
            grandTotal: 0,
          };
        }
        const m = map[v.vehicleIndex];
        if (v.activeCount > 0) m.daysActive += 1;
        m.rentalTotal += v.dailyVehicleAmount || 0;
        m.extraKmTotal += v.extraKmCost || 0;
        m.extraHourTotal += v.extraHourCost || 0;
        m.rtoTotal += v.rtoAppliedToday || 0;
        m.promoterTotal += v.promoterAmountToday || 0;
        m.compensationTotal += v.compensationToday || 0;
        m.grandTotal += v.itemDayTotal || 0;
      });
    });
    return Object.values(map).sort((a: any, b: any) => a.vehicleIndex - b.vehicleIndex);
  }, [data]);


  const entriesByVehicle = useMemo(() => {
    if (!data?.days) return {};
    const map: Record<number, any[]> = {};
    data.days.forEach((d: any) => {
      d.vehicles.forEach((v: any) => {
        if (!map[v.vehicleIndex]) map[v.vehicleIndex] = [];
        v.entries.forEach((e: any) => {
          if (!map[v.vehicleIndex].some((x: any) => x._id === e.entryId)) {
            map[v.vehicleIndex].push({
              _id: e.entryId,
              driverName: e.driverName,
              vehicleRegistrationNumber: e.vehicleRegistrationNumber,
              entryStatus: "active",
            });
          }
        });
      });
    });
    return map;
  }, [data]);


  const historyEventsByEntry = useMemo(() => {
    const out: Record<string, any[]> = {};
    if (!historyData) return out;
    Object.keys(HISTORY_CATEGORY_META).forEach((catKey) => {
      (historyData[catKey] || []).forEach((e: any) => {
        const meta = HISTORY_CATEGORY_META[catKey];
        const key = e.entryId;
        if (!key) return;
        if (!out[key]) out[key] = [];
        out[key].push({ ...e, _category: catKey, _timestamp: meta.getTimestamp(e) });
      });
    });
    Object.keys(out).forEach((key) => {
      out[key].sort((a, b) => new Date(a._timestamp || 0).getTime() - new Date(b._timestamp || 0).getTime());
    });
    return out;
  }, [historyData]);


  function parseTimeToDecimalHour(str, fallback) {
    const m = String(str || "").trim().match(/^(\d{1,2}):(\d{2})$/);
    if (!m) {
      const n = Number(str);
      return isNaN(n) ? fallback : n;
    }
    return Number(m[1]) + Number(m[2]) / 60;
  }
  const SHIFT_START_HOUR = parseTimeToDecimalHour(process.env.NEXT_PUBLIC_DEFAULT_LOGIN_TIME, 16);
  let SHIFT_END_HOUR = parseTimeToDecimalHour(process.env.NEXT_PUBLIC_DEFAULT_LOGOUT_TIME, 24);
  if (SHIFT_END_HOUR <= SHIFT_START_HOUR) SHIFT_END_HOUR += 24;

  function istWallClockMs(dayKey, hourDecimal) {
    const totalMinutes = Math.round(hourDecimal * 60);
    const dayOffset = Math.floor(totalMinutes / (24 * 60));
    const minutesInDay = totalMinutes - dayOffset * 24 * 60;
    const hh = String(Math.floor(minutesInDay / 60)).padStart(2, "0");
    const mm = String(minutesInDay % 60).padStart(2, "0");
    const base = new Date(`${dayKey}T00:00:00.000Z`);
    base.setUTCDate(base.getUTCDate() + dayOffset);
    const targetDayKey = base.toISOString().slice(0, 10);
    return new Date(`${targetDayKey}T${hh}:${mm}:00+05:30`).getTime();
  }

  function shiftWindowForDay(dayKey) {
    return { start: istWallClockMs(dayKey, SHIFT_START_HOUR), end: istWallClockMs(dayKey, SHIFT_END_HOUR) };
  }

  function overlapWithShiftHours(startMs, endMs) {
    if (!(endMs > startMs)) return 0;
    const dayMs = 24 * 3_600_000;
    const firstDayKey = new Date(startMs - dayMs).toISOString().slice(0, 10);
    const totalDays = Math.ceil((endMs - startMs) / dayMs) + 3;
    let hours = 0;
    let cursor = new Date(`${firstDayKey}T00:00:00.000Z`);
    for (let i = 0; i < totalDays; i++) {
      const dayKey = cursor.toISOString().slice(0, 10);
      const { start: ws, end: we } = shiftWindowForDay(dayKey);
      const s = Math.max(ws, startMs);
      const e = Math.min(we, endMs);
      if (e > s) hours += (e - s) / 3_600_000;
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return hours;
  }


  function computeEntryDurationsFromEvents(events: any[]) {
    const now = Date.now();
    let issueHours = 0;
    events
      .filter((e) => e._category === "issueHistory")
      .forEach((e) => {
        const start = new Date(e.createdAt || e._timestamp).getTime();
        const end = e.resolvedAt ? new Date(e.resolvedAt).getTime() : now;
        if (start && end > start) issueHours += overlapWithShiftHours(start, end);
      });

    let unavailableHours = 0;
    const unavailEvents = events.filter((e) => e._category === "unavailableHistory");
    unavailEvents
      .filter((e) => e.eventType !== "replaced")
      .forEach((e) => {
        const start = new Date(e.reportedAt || e._timestamp).getTime();
        let end: number;
        if (e.resolvedAt) {
          end = new Date(e.resolvedAt).getTime();
        } else {
          const next = unavailEvents.find(
            (u) => u !== e && u.eventType === "replaced" && new Date(u._timestamp).getTime() > start
          );
          end = next ? new Date(next._timestamp).getTime() : now;
        }
        if (start && end > start) unavailableHours += overlapWithShiftHours(start, end);
      });

 
    const createdEv = events.find((e) => e._category === "driverChangeHistory" && e.eventType === "Vehicle Added");
    const removedEv = events.find((e) => e._category === "driverChangeHistory" && e.eventType === "Vehicle Removed");
    const startAt = createdEv ? new Date(createdEv.changedAt || createdEv._timestamp).getTime() : null;
    const endAt = removedEv ? new Date(removedEv.changedAt || removedEv._timestamp).getTime() : now;
    const totalElapsedHours = startAt && endAt > startAt ? overlapWithShiftHours(startAt, endAt) : 0;
    const runningHours = Math.max(totalElapsedHours - issueHours - unavailableHours, 0);

    return {
      runningHours: Math.round(runningHours * 100) / 100,
      issueHours: Math.round(issueHours * 100) / 100,
      unavailableHours: Math.round(unavailableHours * 100) / 100,
      onRoadStartAt: createdEv?.changedAt || createdEv?._timestamp || null,
      onRoadEndAt: removedEv?.changedAt || removedEv?._timestamp || null,
    };
  }

  function computeEntryDurationsForDay(events: any[], dayKey: string) {

    const { start: dayStart, end: dayEnd } = shiftWindowForDay(dayKey);
    const now = Date.now();
    const clip = (t: number) => Math.min(Math.max(t, dayStart), dayEnd);

    let issueHours = 0;
    events
      .filter((e) => e._category === "issueHistory")
      .forEach((e) => {
        const start = new Date(e.createdAt || e._timestamp).getTime();
        const end = e.resolvedAt ? new Date(e.resolvedAt).getTime() : now;
        if (!start || end <= start) return;
        if (end <= dayStart || start >= dayEnd) return;
        const s = clip(start);
        const en = clip(end);
        if (en > s) issueHours += (en - s) / 3_600_000;
      });

    let unavailableHours = 0;
    const unavailEvents = events.filter((e) => e._category === "unavailableHistory");
    unavailEvents
      .filter((e) => e.eventType !== "replaced")
      .forEach((e) => {
        const start = new Date(e.reportedAt || e._timestamp).getTime();
        let end: number;
        if (e.resolvedAt) {
          end = new Date(e.resolvedAt).getTime();
        } else {
          const next = unavailEvents.find(
            (u) => u !== e && u.eventType === "replaced" && new Date(u._timestamp).getTime() > start
          );
          end = next ? new Date(next._timestamp).getTime() : now;
        }
        if (!start || end <= start) return;
        if (end <= dayStart || start >= dayEnd) return;
        const s = clip(start);
        const en = clip(end);
        if (en > s) unavailableHours += (en - s) / 3_600_000;
      });


    const createdEv = events.find((e) => e._category === "driverChangeHistory" && e.eventType === "Vehicle Added");
    const removedEv = events.find((e) => e._category === "driverChangeHistory" && e.eventType === "Vehicle Removed");
    const entryStart = createdEv ? new Date(createdEv.changedAt || createdEv._timestamp).getTime() : null;
    const entryEnd = removedEv ? new Date(removedEv.changedAt || removedEv._timestamp).getTime() : now;

    if (entryStart == null || entryEnd <= dayStart || entryStart >= dayEnd) {
      return { runningHours: 0, issueHours: 0, unavailableHours: 0 };
    }
    const windowStart = clip(entryStart);
    const windowEnd = clip(entryEnd);
    const totalElapsedHours = windowEnd > windowStart ? (windowEnd - windowStart) / 3_600_000 : 0;
    const runningHours = Math.max(totalElapsedHours - issueHours - unavailableHours, 0);

    return {
      runningHours: Math.round(runningHours * 100) / 100,
      issueHours: Math.round(issueHours * 100) / 100,
      unavailableHours: Math.round(unavailableHours * 100) / 100,
    };
  }

      const getVehicleTypeName = (vehicleTypeId) => {
    if (!vehicleTypeId || !vehicleTypes) return "";
    const v = vehicleTypes.find((vt) => vt._id === vehicleTypeId);
    return v?.typeName || vehicleTypeId;
  };


  const entrySummaryByVehicle = useMemo(() => {
    if (!data?.days) return {};
    const map: Record<number, Record<string, any>> = {};
    data.days.forEach((d: any) => {
      d.vehicles.forEach((v: any) => {
        if (!map[v.vehicleIndex]) map[v.vehicleIndex] = {};
        v.entries.forEach((e: any) => {
          if (!e.entryId) return;
          if (!map[v.vehicleIndex][e.entryId]) {
            map[v.vehicleIndex][e.entryId] = {
              entryId: e.entryId,
              driverName: e.driverName,
              driverPhone: e.driverPhone,
              vehicleRegistrationNumber: e.vehicleRegistrationNumber,
              isReplacement: !!e.isReplacement,
              runningHours: 0,
              absentHours: 0,
              issueHours: 0,
              unavailableHours: 0,
              compensationHours: 0,
              compensationDeduction: 0,
              firstDay: d.date,
              lastDay: d.date,
            };
          }
          const s = map[v.vehicleIndex][e.entryId];
          s.runningHours += e.runningHours || 0;
          s.absentHours += e.absentHours || 0;
          s.issueHours += e.issueHours || 0;
          s.unavailableHours += e.unavailableHours || 0;
          s.compensationHours += e.compensationHours || 0;
          s.compensationDeduction += e.compensationDeduction || 0;
          s.isReplacement = s.isReplacement || !!e.isReplacement;
          if (e.vehicleRegistrationNumber) s.vehicleRegistrationNumber = e.vehicleRegistrationNumber;
          if (e.driverName) s.driverName = e.driverName;
          s.lastDay = d.date;
        });
      });
    });
 
    Object.keys(historyEventsByEntry).forEach((entryId) => {
      const events = historyEventsByEntry[entryId];
      const first = events[0];
      if (first == null || first.vehicleIndex == null) return;
      const vIdx = first.vehicleIndex;
      if (!map[vIdx]) map[vIdx] = {};
      if (map[vIdx][entryId]) return;
      const latestWithReg = [...events].reverse().find((e) => e.vehicleRegistrationNumber);
      const isReplacement = events.some(
        (e) => e._category === "driverChangeHistory" && e.eventType === "Vehicle Added" && e.changedFields?.replacementFor
      );
      map[vIdx][entryId] = {
        entryId,
        driverName: latestWithReg?.driverName || "",
        driverPhone: latestWithReg?.driverPhone || "",
        vehicleRegistrationNumber: latestWithReg?.vehicleRegistrationNumber || "",
        isReplacement,
        runningHours: 0,
        absentHours: 0,
        issueHours: 0,
        unavailableHours: 0,
        compensationHours: 0,
        compensationDeduction: 0,
        firstDay: null,
        lastDay: null,
      };
    });

 
    Object.keys(map).forEach((vIdxKey) => {
      Object.keys(map[vIdxKey]).forEach((entryId) => {
        const events = historyEventsByEntry[entryId];
        if (!events || events.length === 0) return;
        const derived = computeEntryDurationsFromEvents(events);
        const s = map[vIdxKey][entryId];
        s.runningHours = derived.runningHours;
        s.issueHours = derived.issueHours;
        s.unavailableHours = derived.unavailableHours;
        s.onRoadStartAt = derived.onRoadStartAt;
        s.onRoadEndAt = derived.onRoadEndAt;
      });
    });

    return map;
  }, [data, historyEventsByEntry]);

  const compensationVehicleMeta =
    compensationVehicleIndex != null
      ? (data?.bookingItemsMeta || []).find((b: any) => b.vehicleIndex === compensationVehicleIndex)
      : null;

  const logHoursVehicleMeta =
    logHoursVehicleIndex != null
      ? (data?.bookingItemsMeta || []).find((b: any) => b.vehicleIndex === logHoursVehicleIndex)
      : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-6">
        <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
        <p className="text-sm text-gray-500">Could not load the campaign calculator for this order.</p>
        <button
          onClick={fetchCalculator}
          className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold"
        >
          <RefreshCw size={12} /> Retry
        </button>
      </div>
    );
  }

  const fb = data.finalBilling || {};
  const totalVehiclesToday = selectedDay
    ? selectedDay.vehicles.reduce((s: number, v: any) => s + v.activeCount, 0)
    : 0;

 
  const daySummary = (() => {
    if (!selectedDay) return null;
    let runningHours = 0, issueHours = 0, unavailableHours = 0, absentHours = 0, campaignHours = 0;
    let poolFee = 0, overageCost = 0;
    selectedDay.vehicles.forEach((v: any) => {
      [...(v.entries || []), ...(v.releasedToday || [])].forEach((e: any) => {
       
        const entryEvents = historyEventsByEntry[e.entryId] || [];
        const todayDurations = computeEntryDurationsForDay(entryEvents, selectedDay.date);
        runningHours += todayDurations.runningHours || 0;
        issueHours += todayDurations.issueHours || 0;
        unavailableHours += todayDurations.unavailableHours || 0;
        absentHours += e.absentHours || 0;
        campaignHours += e.totalCampaignHours || e.campaignHours || 0;
      });
      poolFee += (v.extraKmPoolFeeToday || 0) + (v.extraHourPoolFeeToday || 0);
      overageCost += (v.extraKmCost - (v.extraKmPoolFeeToday || 0)) + (v.extraHourCost - (v.extraHourPoolFeeToday || 0));
    });
    const totalHours = runningHours + issueHours + unavailableHours + absentHours;
    return {
      runningHours: Math.round(runningHours * 100) / 100,
      issueHours: Math.round(issueHours * 100) / 100,
      unavailableHours: Math.round(unavailableHours * 100) / 100,
      absentHours: Math.round(absentHours * 100) / 100,
      campaignHours: Math.round(campaignHours * 100) / 100,
      totalHours: Math.round(totalHours * 100) / 100,
      poolFee: Math.round(poolFee * 100) / 100,
      overageCost: Math.round(overageCost * 100) / 100,
    };
  })();

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Section tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-gray-100 dark:border-gray-800">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.key}
              onClick={() => setSection(s.key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all -mb-px whitespace-nowrap ${
                section === s.key
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon size={13} /> {s.label}
            </button>
          );
        })}
      </div>

      {/* ── Overview ── */}
      {section === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={Calendar} label="Campaign Window" value={`${fmtDateLabel(data.campaignStart)} → ${fmtDateLabel(data.campaignEnd)}`} small />
            <SummaryCard icon={IndianRupee} label="Grand Total (actual)" value={fmt(data.grandTotal)} />
            <SummaryCard icon={ReceiptText} label="Estimated (Order Creation)" value={fmt(data.orderTaxableAmount)} />
            <SummaryCard
              icon={Gauge}
              label="Reconciliation"
              value={data.reconciliationDiff === 0 ? "Matched ✓" : fmt(data.reconciliationDiff)}
              tone={data.reconciliationDiff === 0 ? "good" : "warn"}
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={MinusCircle} label="Compensation Deducted" value={fmt(fb.totalCompensation)} tone={fb.totalCompensation > 0 ? "warn" : undefined} />
            <SummaryCard icon={ReceiptText} label={`GST (${fb.gstPercent ?? 0}%)`} value={fmt(fb.gstAmount)} />
            <SummaryCard icon={IndianRupee} label="Final Invoice Amount" value={fmt(fb.finalInvoiceAmount)} tone="good" />
            <SummaryCard icon={Truck} label="Vehicle Types" value={String(vehicleTotals.length)} small />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={AlertOctagon} label="Total Issue Hours" value={fmtHm(fb.totalIssueHours)} tone={fb.totalIssueHours > 0 ? "warn" : undefined} />
            <SummaryCard icon={ShieldAlert} label="Total Unavailable Hours" value={fmtHm(fb.totalUnavailableHours)} tone={fb.totalUnavailableHours > 0 ? "warn" : undefined} />
            <SummaryCard icon={Gift} label="Compensation Granted" value={`${fmtHm(fb.totalCompensationHoursGranted)} / +${fb.totalCompensationDaysGranted ?? 0}d`} />
            <SummaryCard icon={CalendarX2} label="Completed / Absent Days" value={`${fb.totalCompletedCampaignDays ?? 0} / ${fb.totalAbsentDays ?? 0}`} tone={fb.totalAbsentDays > 0 ? "warn" : undefined} />
          </div>

          <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Estimated  (Campaign Calculator)</p>
              {/* <p className="text-[11px] text-gray-400 mt-0.5">
                Actual amounts only appear after Operations logs them in the On-Road tab. Differences are expected until every day's activity is logged.
              </p> */}
            </div>
            <div className="flex items-center justify-between px-4 pt-2 text-[10px] font-bold text-gray-400 uppercase tracking-wide">
              <span></span>
              <div className="flex items-center gap-4">
                <span className="w-24 text-right">Estimated</span>
                <span className="w-24 text-right">Actual</span>
                <span className="w-24 text-right">Diff</span>
              </div>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              <CompareRow label="Rental + Driver" estimated={fb.estimatedRental} actual={fb.actualRental} />
              <CompareRow label="RTO Charges" estimated={fb.estimatedRto} actual={fb.actualRto} />
              <CompareRow label="Promoter Charges" estimated={fb.estimatedPromoter} actual={fb.actualPromoter} />
              <CompareRow label="Extra KM" estimated={fb.estimatedExtraKm} actual={fb.actualExtraKm} />
              <CompareRow label="Extra Hours" estimated={fb.estimatedExtraHours} actual={fb.actualExtraHours} />
              <CompareRow label="Total (before GST)" estimated={data.orderTaxableAmount} actual={data.grandTotal} bold />
            </div>
          </div>
        </div>
      )}

      {/* ── Daily Timeline ── */}
      {section === "daily" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Select a Campaign Day</p>
              <div className="flex items-center gap-1">
                <button onClick={goPrevDay} disabled={dayIndex <= 0}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-30">
                  <ChevronLeft size={14} />
                </button>
                <button onClick={goNextDay} disabled={dayIndex < 0 || dayIndex >= data.days.length - 1}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-30">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {data.days.map((d: any) => {
                const active = d.date === selectedDate;
                return (
                  <button
                    key={d.date}
                    onClick={() => setSelectedDate(d.date)}
                    className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-lg border text-xs transition-all ${
                      active
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span className="font-semibold">
                      {new Date(d.date + "T00:00:00.000Z").toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </span>
                    <span className={`mt-0.5 ${active ? "text-blue-100" : "text-gray-400"}`}>{fmt(d.dayTotal)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedDay && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <SummaryCard icon={Truck} label="Active Vehicles" value={String(totalVehiclesToday)} />
                <SummaryCard icon={IndianRupee} label="Day Total" value={fmt(selectedDay.dayTotal)} />
                <SummaryCard icon={ReceiptText} label="Cumulative up to this day" value={fmt(selectedDay.cumulativeTotal)} />
              </div>

              {daySummary && (
                <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800">
                    <Calendar size={14} className="text-indigo-600" />
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {fmtDateLabel(selectedDay.date)} · Daily Summary
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300 font-semibold">
                      DAY TOTAL — all vehicles combined
                    </span>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Hours breakdown */}
                    <div>
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Hours Breakdown</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 px-3 py-2">
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1"><Clock size={11} /> Running</p>
                          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">{fmtHm(daySummary.runningHours)}</p>
                        </div>
                        <div className="rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 px-3 py-2">
                          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1"><AlertOctagon size={11} /> Issue</p>
                          <p className="text-sm font-bold text-amber-700 dark:text-amber-300 mt-0.5">{fmtHm(daySummary.issueHours)}</p>
                        </div>
                        <div className="rounded-lg bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 px-3 py-2">
                          <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1"><ShieldAlert size={11} /> Unavailable</p>
                          <p className="text-sm font-bold text-rose-700 dark:text-rose-300 mt-0.5">{fmtHm(daySummary.unavailableHours)}</p>
                        </div>
                        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 px-3 py-2">
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold flex items-center gap-1"><CalendarX2 size={11} /> Absent</p>
                          <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mt-0.5">{fmtHm(daySummary.absentHours)}</p>
                        </div>
                      </div>
                      <p className="mt-2 text-[11px] text-gray-400">
                        Total: {fmtHm(daySummary.runningHours)} run + {fmtHm(daySummary.issueHours)} issue + {fmtHm(daySummary.unavailableHours)} unavailable + {fmtHm(daySummary.absentHours)} absent
                        {" "}= <span className="font-semibold text-gray-600 dark:text-gray-300">{fmtHm(daySummary.totalHours)}</span>
                        {daySummary.campaignHours > 0 && <> (of {fmtHm(daySummary.campaignHours)} expected)</>}
                      </p>
                    </div>

                    {/* Cost breakdown */}
                    <div>
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Extra KM/Hours Cost</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="rounded-lg bg-sky-50 dark:bg-sky-900/10 border border-sky-100 dark:border-sky-900/30 px-3 py-2 flex items-center justify-between">
                          <span className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold">Pool (one-time)</span>
                          <span className="text-sm font-bold text-sky-700 dark:text-sky-300">{fmt(daySummary.poolFee)}</span>
                        </div>
                        <div className="rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 px-3 py-2 flex items-center justify-between">
                          <span className="text-[11px] text-orange-600 dark:text-orange-400 font-semibold">Overage (on-road logged)</span>
                          <span className="text-sm font-bold text-orange-700 dark:text-orange-300">{fmt(daySummary.overageCost)}</span>
                        </div>
                      </div>
                      <p className="mt-2 text-[11px] text-gray-400">
                        Pool is a flat one-time fee charged once regardless of usage; Overage is the full package-rate cost of everything logged on-road today, billed separately.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {selectedDay.vehicles.length > 0 && (
                  <p className="text-[11px] text-gray-400 px-1 -mt-1">
                    VEHICLE-WISE — below, each card is one vehicle-type slot's own breakdown for {fmtDateLabel(selectedDay.date)} (old + replacement entries shown separately); the Daily Summary above is the sum of all of these.
                  </p>
                )}
                {selectedDay.vehicles.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-8">
                    No vehicle type is within its campaign window on {fmtDateLabel(selectedDay.date)}.
                  </p>
                )}

                {selectedDay.vehicles.map((v: any) => {
                  const isSlotExpanded = expandedSlotVehicleIndex === v.vehicleIndex;
                  return (
                  <div key={v.vehicleIndex} className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setExpandedSlotVehicleIndex(isSlotExpanded ? null : v.vehicleIndex)}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800 text-left hover:bg-gray-100 dark:hover:bg-gray-800/70"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isSlotExpanded ? <ChevronUp size={14} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />}
                        <Truck size={14} className="text-teal-600 flex-shrink-0" />
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                        {getVehicleTypeName(v.vehicleType)}
                        </span>
                        <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300 font-semibold flex-shrink-0">
                          {v.activeCount}/{v.bookedQuantity} active
                        </span>
                        {v.isCompensationExtensionDay && (
                          <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 font-semibold flex-shrink-0">
                            Compensation Extension Day
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(ev) => { ev.stopPropagation(); setCompensationVehicleIndex(v.vehicleIndex); }}
                          onKeyDown={(ev) => { if (ev.key === "Enter") { ev.stopPropagation(); setCompensationVehicleIndex(v.vehicleIndex); } }}
                          className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 font-semibold cursor-pointer"
                        >
                          <Gift size={11} /> Compensation
                        </span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white flex-shrink-0">{fmt(v.itemDayTotal)}</span>
                      </div>
                    </button>

                    {isSlotExpanded && (
                    <>
                    {(v.issueHoursToday > 0 || v.unavailableHoursToday > 0 || v.compensationHoursGrantedToday > 0) && (
                      <div className="flex flex-wrap items-center gap-3 px-4 py-2 text-[11px] bg-amber-50/60 dark:bg-amber-900/10 border-b border-gray-100 dark:border-gray-800">
                        {v.issueHoursToday > 0 && (
                          <span className="flex items-center gap-1 text-amber-700 dark:text-amber-300 font-semibold">
                            <AlertOctagon size={11} /> Issue: {fmtHm(v.issueHoursToday)}
                          </span>
                        )}
                        {v.unavailableHoursToday > 0 && (
                          <span className="flex items-center gap-1 text-rose-700 dark:text-rose-300 font-semibold">
                            <ShieldAlert size={11} /> Unavailable: {fmtHm(v.unavailableHoursToday)}
                          </span>
                        )}
                        {(v.issueHoursToday > 0 || v.unavailableHoursToday > 0) && (
                          <span className="text-gray-500">Total Downtime: {fmtHm(v.downtimeHoursToday)}</span>
                        )}
                        {v.compensationHoursGrantedToday > 0 && (
                          <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-semibold">
                            <Gift size={11} /> Compensation: +{fmtHm(v.compensationHoursGrantedToday)}
                          </span>
                        )}
                      </div>
                    )}

                    {v.combinedRunningHoursToday > 0 && (
                      <div className="px-4 py-2 text-[11px] bg-indigo-50/60 dark:bg-indigo-900/10 border-b border-gray-100 dark:border-gray-800">
                        <span className="flex items-center gap-1 text-indigo-700 dark:text-indigo-300 font-semibold">
                          <Clock size={11} /> Combined Running Today: {fmtHm(v.combinedRunningHoursToday)}
                        </span>
                        <span className="text-gray-400 mt-0.5 block">
                          Old + replacement vehicle running hours added together for this slot today
                          {v.downtimeHoursToday > 0 && <> · Loss (not running): {fmtHm(v.downtimeHoursToday)}</>}
                        </span>
                      </div>
                    )}

                    {v.compensationStatus?.hasLoss && (
                      <div
                        className={`px-4 py-2 text-[11px] border-b border-gray-100 dark:border-gray-800 ${
                          v.compensationStatus.state === "approved"
                            ? "bg-emerald-50/70 dark:bg-emerald-900/10"
                            : v.compensationStatus.state === "pending"
                            ? "bg-sky-50/70 dark:bg-sky-900/10"
                            : "bg-amber-50/70 dark:bg-amber-900/10"
                        }`}
                      >
                        {v.compensationStatus.state === "approved" ? (
                          <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-semibold">
                            <Gift size={11} />
                            {fmtHm(v.compensationStatus.lossHours)} loss — Compensated{" "}
                            {v.compensationStatus.scope === "this-date"
                              ? "(this date only)"
                              : `(split across ${fmtShortDate(v.compensationStatus.dateFrom)} → ${fmtShortDate(v.compensationStatus.dateTo)}, ${v.compensationStatus.valuePerDay}h/day)`}
                          </span>
                        ) : v.compensationStatus.state === "pending" ? (
                          <span className="flex items-center gap-1 text-sky-700 dark:text-sky-300 font-semibold">
                            <ShieldAlert size={11} />
                            {fmtHm(v.compensationStatus.lossHours)} loss — Requested, waiting for admin approval{" "}
                            {v.compensationStatus.scope === "this-date"
                              ? "(this date only)"
                              : `(${fmtShortDate(v.compensationStatus.dateFrom)} → ${fmtShortDate(v.compensationStatus.dateTo)})`}
                          </span>
                        ) : (
                          <div className="flex items-center justify-between gap-2">
                            <span className="flex items-center gap-1 text-amber-700 dark:text-amber-300 font-semibold">
                              <AlertOctagon size={11} />
                              {fmtHm(v.compensationStatus.lossHours)} loss — Not compensated yet
                            </span>
                            <button
                              onClick={() => setCompensationVehicleIndex(v.vehicleIndex)}
                              className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 underline"
                            >
                              Add Compensation
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="p-3 space-y-2">
                      {v.entries.length === 0 && (
                        <p className="text-xs text-gray-400 italic px-1">No driver/vehicle assigned yet for this slot.</p>
                      )}

                      {[...v.entries, ...(v.releasedToday || [])].map((e: any) => {
                        const entrySummary = entrySummaryByVehicle[v.vehicleIndex]?.[e.entryId];
                        const entryEvents = historyEventsByEntry[e.entryId] || [];
                        const hasTimeline =
                          (Array.isArray(e.timeline) && e.timeline.length > 0) || entryEvents.length > 0;
                        const isExpanded = !!expandedTimelines[e.entryId];
                        const replacedEvent = entryEvents.find(
                          (ev: any) => ev._category === "unavailableHistory" && ev.eventType === "replaced"
                        );
                        const isReleasedEntry = !!e.removed;
                        // Header badge shows TODAY-ONLY hours (event-derived, bounded to
                        // the currently selected Daily Timeline day) — not the entry's
                        // lifetime total (that lives in the expand panel's "total
                        // running" line) and not the backend's assumed-work-window
                        // fallback, per the stakeholder's "0m vs 8h" contradiction report.
                        const todayDurations = selectedDay
                          ? computeEntryDurationsForDay(entryEvents, selectedDay.date)
                          : { runningHours: e.runningHours, issueHours: e.issueHours, unavailableHours: e.unavailableHours };
                        return (
                        <div key={e.entryId}>
                          <div
                            className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-xs flex-wrap ${
                              isReleasedEntry
                                ? "border-rose-200 bg-rose-50 dark:bg-rose-900/10 dark:border-rose-800/50"
                                : e.isReplacement
                                ? "border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800/50"
                                : "border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/30"
                            } ${hasTimeline ? "rounded-b-none" : ""}`}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-wrap">
                              <span className="flex items-center gap-1 font-mono font-semibold text-gray-700 dark:text-gray-300">
                                <Truck size={11} /> {e.vehicleRegistrationNumber || "—"}
                              </span>
                              <span className="flex items-center gap-1 text-gray-500">
                                <User size={11} /> {e.driverName || "—"}
                              </span>
                              <span className="hidden sm:flex items-center gap-1 text-gray-400">
                                <Phone size={11} /> {e.driverPhone || "—"}
                              </span>
                              {todayDurations.runningHours != null && (
                                <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold">
                                  <Clock size={11} /> {fmtHm(todayDurations.runningHours)} run
                                  {e.absentHours > 0 && <span className="text-amber-600">· {fmtHm(e.absentHours)} absent</span>}
                                </span>
                              )}
                              {todayDurations.issueHours > 0 && (
                                <span className="flex items-center gap-1 text-amber-600 font-semibold">
                                  <AlertOctagon size={11} /> {fmtHm(todayDurations.issueHours)} issue
                                </span>
                              )}
                              {todayDurations.unavailableHours > 0 && (
                                <span className="flex items-center gap-1 text-rose-600 font-semibold">
                                  <ShieldAlert size={11} /> {fmtHm(todayDurations.unavailableHours)} unavailable
                                </span>
                              )}
                              {e.compensationHours > 0 && (
                                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                                  <Gift size={11} /> +{fmtHm(e.compensationHours)} comp.
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {isReleasedEntry && (
                                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 font-semibold">
                                  <LogOut size={10} /> Released Today
                                </span>
                              )}
                              {e.wasReplacedToday && (
                                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 font-semibold">
                                  <ArrowRightLeft size={10} /> Replaced by {e.replacedByRegistrationNumber || "—"}
                                </span>
                              )}
                              {e.isReplacement && (
                                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 font-semibold">
                                  <ArrowRightLeft size={10} /> Replacement
                                </span>
                              )}
                              {e.createdOnThisDay && (
                                <span className="px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 font-semibold">
                                  Assigned Today
                                </span>
                              )}
                              {e.isAbsentDay && (
                                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 font-semibold">
                                  <CalendarX2 size={10} />
                                  {e.absentDayResolution === "extend"
                                    ? "Absent — Extended +1 Day"
                                    : e.absentDayResolution === "close"
                                    ? "Absent — Closed on Original Date"
                                    : "Absent"}
                                </span>
                              )}
                              {e.billingMode === "partial" && (
                                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 font-semibold">
                                  <Clock size={10} /> Partial Day Billing
                                </span>
                              )}
                              {e.compensationDeduction > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 font-semibold">
                                  -{fmt(e.compensationDeduction)}
                                </span>
                              )}
                              {!e.isAbsentDay && !isReleasedEntry && (() => {
                                const downtimeToday = (todayDurations.issueHours || 0) + (todayDurations.unavailableHours || 0);
                                const suggestAbsent = downtimeToday >= ABSENT_SUGGEST_THRESHOLD_HOURS;
                                return (
                                  <button
                                    onClick={() => { setLogHoursVehicleIndex(v.vehicleIndex); setLogHoursEntryId(e.entryId); }}
                                    title={
                                      suggestAbsent
                                        ? `Downtime crossed ${ABSENT_SUGGEST_THRESHOLD_HOURS}h today — consider marking this vehicle Absent`
                                        : "Log hours / mark absent for this vehicle"
                                    }
                                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full border font-semibold ${
                                      suggestAbsent
                                        ? "border-amber-300 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300 animate-pulse"
                                        : "border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    }`}
                                  >
                                    <CalendarX2 size={10} /> Mark Absent
                                  </button>
                                );
                              })()}
                              {hasTimeline && (
                                <button
                                  onClick={() => toggleTimeline(e.entryId)}
                                  title={isExpanded ? "Hide this vehicle's minute-by-minute issue/unavailable timeline" : "View this vehicle's minute-by-minute issue/unavailable timeline"}
                                  className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 font-semibold"
                                >
                                  <History size={10} />
                                  {isExpanded ? "Hide Timeline" : "View Timeline"}
                                  {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                                </button>
                              )}
                            </div>
                          </div>

                          {hasTimeline && isExpanded && (
                            <div className="rounded-b-lg border border-t-0 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 space-y-2">
                              {Array.isArray(e.timeline) && e.timeline.length > 0 && (
                                <div className="space-y-1">
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Today's Running Time Timeline</p>
                                  {e.timeline.map((seg: any, i: number) => {
                                    const style = TIMELINE_STYLE[seg.type] || TIMELINE_STYLE.running;
                                    return (
                                      <div key={i} className="flex items-center gap-2 text-[11px]">
                                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`} />
                                        <span className={`font-semibold ${style.className}`}>{style.label}</span>
                                        <span className="text-gray-500 dark:text-gray-400">
                                          {fmtClock(seg.start)}–{fmtClock(seg.end)}
                                        </span>
                                        <span className="text-gray-400">({fmtHm(seg.hours)})</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {entrySummary && (
                                <div className="flex flex-wrap items-center gap-3 text-[11px] pt-1 border-t border-gray-100 dark:border-gray-800">
                                  <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold">
                                    <Clock size={11} /> {fmtHm(entrySummary.runningHours)} total running
                                  </span>
                                  {entrySummary.issueHours > 0 && (
                                    <span className="flex items-center gap-1 text-amber-600 font-semibold">
                                      <AlertOctagon size={11} /> {fmtHm(entrySummary.issueHours)} issue
                                    </span>
                                  )}
                                  {entrySummary.unavailableHours > 0 && (
                                    <span className="flex items-center gap-1 text-rose-600 font-semibold">
                                      <ShieldAlert size={11} /> {fmtHm(entrySummary.unavailableHours)} unavailable
                                    </span>
                                  )}
                                  {(entrySummary.onRoadStartAt || entrySummary.onRoadEndAt) && (
                                    <span className="text-gray-400">
                                      On-Road: {fmtDatetime(entrySummary.onRoadStartAt)} {entrySummary.onRoadEndAt ? `→ ${fmtDatetime(entrySummary.onRoadEndAt)}` : "→ still active"}
                                    </span>
                                  )}
                                </div>
                              )}

                              {(() => {
                            
                                const toDayKey = (d: any) => (d ? new Date(d).toISOString().slice(0, 10) : null);
                                const onSelectedDay = (ts: any) => toDayKey(ts) === selectedDay.date;

                                const issueEvents = entryEvents.filter(
                                  (ev: any) => ev._category === "issueHistory" && onSelectedDay(ev.createdAt)
                                );
                                const unavailEvents = entryEvents.filter(
                                  (ev: any) =>
                                    ev._category === "unavailableHistory" &&
                                    ev.eventType !== "replaced" &&
                                    onSelectedDay(ev.reportedAt)
                                );
                                const extraKmEvents = entryEvents.filter(
                                  (ev: any) => ev._category === "extraKmHistory" && onSelectedDay(ev.updatedAt)
                                );
                                const replacedToday = replacedEvent && onSelectedDay(replacedEvent._timestamp) ? replacedEvent : null;
                                if (
                                  issueEvents.length === 0 &&
                                  unavailEvents.length === 0 &&
                                  extraKmEvents.length === 0 &&
                                  !replacedToday
                                ) {
                                  return null;
                                }
                                return (
                                  <div className="space-y-1.5 pt-1 border-t border-gray-100 dark:border-gray-800">
                                    {issueEvents.map((ev: any, i: number) => (
                                      <div key={`issue-${i}`} className="rounded-lg border border-amber-100 dark:border-amber-900/40 px-2.5 py-2 text-[11px]">
                                        <span className="flex items-center gap-1 font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 w-fit">
                                          <AlertOctagon size={10} /> Issue Time
                                        </span>
                                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                                          Reported {fmtDatetime(ev.createdAt)}
                                          {ev.resolvedAt ? (
                                            <> → Resolved {fmtDatetime(ev.resolvedAt)} · Duration: {fmtHm((new Date(ev.resolvedAt).getTime() - new Date(ev.createdAt).getTime()) / 3_600_000)}</>
                                          ) : (
                                            <span className="text-amber-600"> · Still open</span>
                                          )}
                                        </p>
                                      </div>
                                    ))}

                                    {unavailEvents.map((ev: any, i: number) => (
                                      <div key={`unavail-${i}`} className="rounded-lg border border-rose-100 dark:border-rose-900/40 px-2.5 py-2 text-[11px]">
                                        <span className="flex items-center gap-1 font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 w-fit">
                                          <ShieldAlert size={10} /> Unavailable Time
                                        </span>
                                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                                          Marked unavailable {fmtDatetime(ev.reportedAt)}
                                          {ev.resolvedAt ? (
                                            <> → Available again {fmtDatetime(ev.resolvedAt)} · Duration: {fmtHm((new Date(ev.resolvedAt).getTime() - new Date(ev.reportedAt).getTime()) / 3_600_000)}</>
                                          ) : replacedToday ? (
                                            <> → Replaced {fmtDatetime(replacedToday._timestamp)} · Duration: {fmtHm((new Date(replacedToday._timestamp).getTime() - new Date(ev.reportedAt).getTime()) / 3_600_000)}</>
                                          ) : (
                                            <span className="text-rose-600"> · Still unavailable</span>
                                          )}
                                        </p>
                                      </div>
                                    ))}

                                    {extraKmEvents.map((ev: any, i: number) => (
                                      <div key={`extrakm-${i}`} className="rounded-lg border border-fuchsia-100 dark:border-fuchsia-900/40 px-2.5 py-2 text-[11px]">
                                        <span className="flex items-center gap-1 font-bold px-1.5 py-0.5 rounded-full bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300 w-fit">
                                          <Gauge size={10} /> Extra KM/Hours
                                        </span>
                                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                                          {ev.extraKm ?? 0} km · {ev.extraHours ?? 0} hrs — applied {fmtDatetime(ev.updatedAt)} (period: {ev.loggedFor || "—"})
                                        </p>
                                      </div>
                                    ))}

                                    {replacedToday && (
                                      <div className="rounded-lg border border-amber-100 dark:border-amber-900/40 px-2.5 py-2 text-[11px]">
                                        <span className="flex items-center gap-1 font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 w-fit">
                                          <ArrowRightLeft size={10} /> Vehicle Replaced
                                        </span>
                                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                                          Old vehicle {entrySummary?.vehicleRegistrationNumber || "—"} (running {fmtHm(entrySummary?.runningHours)}) replaced at {fmtDatetime(replacedToday._timestamp)} by new vehicle{" "}
                                          <span className="font-mono font-semibold text-gray-700 dark:text-gray-300">{replacedToday.replacementVehicleRegistrationNumber || "—"}</span>
                                          {replacedToday.replacementDriverName ? ` (${replacedToday.replacementDriverName}${replacedToday.replacementDriverPhone ? ` · ${replacedToday.replacementDriverPhone}` : ""})` : ""}
                                          — new vehicle on-road from {fmtDatetime(replacedToday._timestamp)}.
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                        );
                      })}

                      <div className="pt-3 mt-1 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                          <ReceiptText size={11} /> Price Breakdown — {fmtDateLabel(selectedDay.date)}
                        </p>
                        <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden">
                          <PriceRow label={`Rental + Driver (${v.activeCount} vehicle${v.activeCount !== 1 ? "s" : ""} × ${fmt(v.baseDailyRate)})`} value={v.dailyVehicleAmount} />
                          {v.promoterAmountToday > 0 && <PriceRow label="Promoter Charges (today's share)" value={v.promoterAmountToday} />}
                          {v.rtoAppliedToday > 0 && <PriceRow label="RTO Charges (one-time, first day)" value={v.rtoAppliedToday} />}
                          {(v.extraKmPoolFeeToday > 0 || v.extraHourPoolFeeToday > 0) && (
                            <PriceRow label="Extra KM/Hours Pool (one-time, first day)" value={v.extraKmPoolFeeToday + v.extraHourPoolFeeToday} />
                          )}
                          {(v.extraKmCost - v.extraKmPoolFeeToday > 0 || v.extraHourCost - v.extraHourPoolFeeToday > 0) && (
                            <PriceRow label="Extra KM/Hours Overage (logged today)" value={(v.extraKmCost - v.extraKmPoolFeeToday) + (v.extraHourCost - v.extraHourPoolFeeToday)} />
                          )}
                          {v.compensationToday > 0 && <PriceRow label="Compensation / Absent-day Deduction" value={-v.compensationToday} negative />}
                          <PriceRow label="Day Total" value={v.itemDayTotal} bold />
                        </div>
                      </div>

                      {v.extraDetailsToday?.length > 0 && (
                        <div className="mt-1.5 space-y-1.5">
                          {v.extraDetailsToday.map((ex: any, i: number) => {
                            const resolvedKm = ex.resolvedExtraKmToday ?? ex.extraKm;
                            const resolvedHrs = ex.resolvedExtraHoursToday ?? ex.extraHours;
                            const isSplit = ex.distributionMethod === "split";
                            return (
                              <div
                                key={i}
                                className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/30 px-2.5 py-2 text-[11px]"
                              >
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 font-mono font-semibold">
                                    <Truck size={10} /> {ex.registrationNumber}
                                  </span>
                                  <span className={`px-1.5 py-0.5 rounded-full font-semibold ${isSplit ? "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300" : "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300"}`}>
                                    {isSplit ? "Split Extra KM/Hours" : "Daily Extra KM/Hours"}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-300 font-semibold">
                                    Drove {resolvedKm} km extra & ran {resolvedHrs} hrs extra today
                                  </span>
                                  {ex.withinPurchasedBalance ? (
                                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 font-semibold">
                                      Covered — within the package's free allowance
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 font-semibold">
                                      + {fmt(ex.extraKmCost + ex.extraHourCost)} extra charge (over the free allowance)
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1 text-gray-500 dark:text-gray-400">
                                  {isSplit && (ex.recordExtraKm != null || ex.recordExtraHours != null) ? (
                                    <>Logged as {ex.recordExtraKm ?? 0} km / {ex.recordExtraHours ?? 0} hrs, split evenly across {ex.loggedFor || "the range"}</>
                                  ) : (
                                    <>Recorded for {ex.loggedFor}</>
                                  )}
                                  {ex.addedBy ? <> · logged by {ex.addedBy}</> : null}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    </>
                    )}
                  </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Vehicle Breakdown ── */}
      {section === "vehicles" && (
        <div className="space-y-3">
          {vehicleTotals.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No vehicle data for this campaign.</p>
          ) : (
            vehicleTotals.map((v: any) => (
              <div key={v.vehicleIndex} className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2 min-w-0">
                    <Truck size={14} className="text-teal-600 flex-shrink-0" />
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                      {v.vehicleType} {v.vehicleModel ? `· ${v.vehicleModel}` : ""}
                    </span>
                    <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300 font-semibold flex-shrink-0">
                      {v.daysActive} active day{v.daysActive !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCompensationVehicleIndex(v.vehicleIndex)}
                      className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 font-semibold"
                    >
                      <Gift size={11} /> Compensation
                    </button>
                    <span className="text-sm font-bold text-gray-900 dark:text-white flex-shrink-0">{fmt(v.grandTotal)}</span>
                  </div>
                </div>
                <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <CostLine label="Rental Total" value={v.rentalTotal} />
                  <CostLine label="RTO Total" value={v.rtoTotal} />
                  <CostLine label="Promoter Total" value={v.promoterTotal} />
                  <CostLine label="Extra KM Total" value={v.extraKmTotal} />
                  <CostLine label="Extra Hours Total" value={v.extraHourTotal} />
                  {v.compensationTotal > 0 && <CostLine label="Compensation" value={-v.compensationTotal} negative />}
                </div>
                {(() => {
                  const meta = (data.bookingItemsMeta || []).find((b: any) => b.vehicleIndex === v.vehicleIndex);
                  if (!meta) return null;
                  return (
                    <div className="px-3 pb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-500">
                      <span>Scheduled Days: {meta.totalScheduledDays}{meta.extraDaysGranted > 0 ? ` (incl. +${meta.extraDaysGranted} compensation)` : ""}</span>
                      <span>Completed: {meta.completedCampaignDays}</span>
                      {meta.absentDaysCount > 0 && <span className="text-amber-600 font-semibold">Absent: {meta.absentDaysCount}</span>}
                      {meta.effectiveToDate && meta.toDate && toISODateKey(meta.effectiveToDate) !== toISODateKey(meta.toDate) && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          Original: {fmtShortDate(meta.fromDate)}–{fmtShortDate(meta.toDate)} · Extended to: {fmtShortDate(meta.effectiveToDate)}
                          {meta.absentExtendDaysGranted > 0 ? ` (+${meta.absentExtendDaysGranted} absent day${meta.absentExtendDaysGranted !== 1 ? "s" : ""})` : ""}
                        </span>
                      )}
                    </div>
                  );
                })()}
                {(() => {
                  const bal = (data.extraKmBalances || []).find((b: any) => b.vehicleIndex === v.vehicleIndex);
                  if (!bal || (bal.purchasedKm === 0 && bal.purchasedHours === 0)) return null;
                  return (
                    <div className="px-3 pb-3">
                      <div className="rounded-lg bg-fuchsia-50 dark:bg-fuchsia-900/10 border border-fuchsia-100 dark:border-fuchsia-800/40 px-3 py-2 text-[11px] flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="text-fuchsia-700 dark:text-fuchsia-300 font-semibold">Extra KM/Hours Pool</span>
                        <span>Purchased: {bal.purchasedKm} km · {bal.purchasedHours} hrs</span>
                        <span>Used: {bal.usedKm} km · {bal.usedHours} hrs</span>
                        <span>Remaining: {bal.remainingKm} km · {bal.remainingHours} hrs</span>
                        {(bal.overageKm > 0 || bal.overageHours > 0) && (
                          <span className="text-rose-600 dark:text-rose-400 font-semibold">
                            Overage: {bal.overageKm} km · {bal.overageHours} hrs → {fmt(bal.overageKmCost + bal.overageHourCost)}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-fuchsia-700 dark:text-fuchsia-300">
                          Applicable: {bal.purchasedWindowFrom ? new Date(bal.purchasedWindowFrom).toLocaleDateString("en-IN") : "—"}
                          {" → "}
                          {bal.purchasedWindowTo ? new Date(bal.purchasedWindowTo).toLocaleDateString("en-IN") : "—"}
                          {!bal.isPurchasedWindowCustom && <span className="text-gray-400">(full campaign)</span>}
                        </span>
                        <button
                          onClick={() => setPoolWindowVehicleIndex(v.vehicleIndex)}
                          className="text-[11px] px-2 py-0.5 rounded-lg border border-fuchsia-200 dark:border-fuchsia-800/50 text-fuchsia-700 dark:text-fuchsia-300 hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/20 font-semibold"
                        >
                          Edit Dates
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Final Billing ── */}
      {section === "billing" && (
        <div className="max-w-md rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <ListChecks size={15} className="text-blue-500" /> Campaign Summary
            </p>
          </div>
          <div className="p-4 space-y-1 text-sm">
            <BillingLine label="Estimated Amount" value={fb.estimatedAmount} />
            <BillingLine label="Actual Rental" value={fb.actualRental} />
            <BillingLine label="Extra KM" value={fb.actualExtraKm} />
            <BillingLine label="Extra Hours" value={fb.actualExtraHours} />
            <BillingLine label="RTO Charges" value={fb.actualRto} />
            <BillingLine label="Promoter Charges" value={fb.actualPromoter} />
            <BillingLine label="Compensation / Deductions" value={fb.totalCompensation} negative={fb.totalCompensation > 0} />
            <BillingLine label="Campaign Extensions" value={fb.campaignExtensionAmount} />
            <div className="border-t border-gray-100 dark:border-gray-800 my-2" />
            <BillingLine label="Final Amount Before GST" value={fb.finalAmountBeforeGst} bold />
            <BillingLine label={`GST (${fb.gstPercent ?? 0}%)`} value={fb.gstAmount} />
            <div className="border-t border-gray-100 dark:border-gray-800 my-2" />
            <div className="flex items-center justify-between pt-1">
              <span className="text-sm font-bold text-gray-900 dark:text-white">Final Invoice Amount</span>
              <span className="text-base font-bold text-green-600 dark:text-green-400">{fmt(fb.finalInvoiceAmount)}</span>
            </div>
          </div>
        </div>
      )}

      {compensationVehicleIndex != null && compensationVehicleMeta && (
        <CompensationModal
          order={order}
          vehicle={{ fromDate: compensationVehicleMeta.fromDate, toDate: compensationVehicleMeta.toDate }}
          vehicleIndex={compensationVehicleIndex}
          vehicleEntries={entriesByVehicle[compensationVehicleIndex] || []}
          detectedLossDate={selectedDay?.date || null}
          detectedLossHours={
            selectedDay?.vehicles.find((v: any) => v.vehicleIndex === compensationVehicleIndex)?.downtimeHoursToday || 0
          }
          isAdmin={isAdmin}
          onClose={() => setCompensationVehicleIndex(null)}
          onRefresh={refreshAll}
        />
      )}

      {poolWindowVehicleIndex != null && (() => {
        const meta = (data?.bookingItemsMeta || []).find((b: any) => b.vehicleIndex === poolWindowVehicleIndex);
        const bal = (data?.extraKmBalances || []).find((b: any) => b.vehicleIndex === poolWindowVehicleIndex);
        if (!meta) return null;
        return (
          <PoolWindowModal
            order={order}
            vehicle={{ fromDate: meta.fromDate, toDate: meta.toDate }}
            vehicleIndex={poolWindowVehicleIndex}
            balance={bal}
            onClose={() => setPoolWindowVehicleIndex(null)}
            onRefresh={fetchCalculator}
          />
        );
      })()}

      {logHoursVehicleIndex != null && logHoursVehicleMeta && (
        <LogHoursModal
          order={order}
          vehicle={{ fromDate: logHoursVehicleMeta.fromDate, toDate: logHoursVehicleMeta.toDate }}
          vehicleIndex={logHoursVehicleIndex}
          vehicleEntries={entriesByVehicle[logHoursVehicleIndex] || []}
          lockedEntryId={logHoursEntryId}
          lockedDate={selectedDay?.date || null}
          onClose={() => { setLogHoursVehicleIndex(null); setLogHoursEntryId(null); }}
          onRefresh={refreshAll}
        />
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, small = false, tone }: any) {
  const toneClass =
    tone === "good"
      ? "text-green-600 dark:text-green-400"
      : tone === "warn"
      ? "text-amber-600 dark:text-amber-400"
      : "text-gray-900 dark:text-white";
  return (
    <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-3">
      <div className="flex items-center gap-1.5 text-gray-400 mb-1">
        <Icon size={12} />
        <span className="text-[10px] font-bold uppercase tracking-wide">{label}</span>
      </div>
      <p className={`${small ? "text-xs" : "text-sm"} font-bold ${toneClass} truncate`}>{value}</p>
    </div>
  );
}


function PriceRow({ label, value, bold = false, negative = false }: { label: string; value: number; bold?: boolean; negative?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-3 py-2 text-xs ${bold ? "bg-gray-50 dark:bg-gray-800/40" : "bg-white dark:bg-gray-900"}`}>
      <span className={bold ? "font-bold text-gray-800 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}>{label}</span>
      <span
        className={
          bold
            ? "font-bold text-blue-600 dark:text-blue-400"
            : negative
            ? "font-semibold text-rose-600 dark:text-rose-400"
            : "font-semibold text-gray-800 dark:text-gray-200"
        }
      >
        {negative ? `-${fmt(Math.abs(value))}` : fmt(value)}
      </span>
    </div>
  );
}

function CostLine({ label, value, negative = false }: { label: string; value: number; negative?: boolean }) {
  return (
    <div className="flex items-center justify-between px-2 py-1 rounded-md bg-gray-50 dark:bg-gray-800/40">
      <span className="text-gray-400">{label}</span>
      <span className={`font-semibold ${negative ? "text-rose-600 dark:text-rose-400" : "text-gray-700 dark:text-gray-300"}`}>{fmt(value)}</span>
    </div>
  );
}

function CompareRow({ label, estimated, actual, bold = false }: { label: string; estimated: number; actual: number; bold?: boolean }) {
  const diff = Math.round(((actual || 0) - (estimated || 0)) * 100) / 100;
  return (
    <div className={`flex items-center justify-between px-4 py-2 text-xs ${bold ? "bg-gray-50 dark:bg-gray-800/40" : ""}`}>
      <span className={`text-gray-500 dark:text-gray-400 ${bold ? "font-bold" : ""}`}>{label}</span>
      <div className="flex items-center gap-4">
        <span className="text-gray-400 w-24 text-right">{fmt(estimated)}</span>
        <span className={`w-24 text-right ${bold ? "font-bold text-gray-900 dark:text-white" : "font-semibold text-gray-700 dark:text-gray-300"}`}>{fmt(actual)}</span>
        <span className={`w-24 text-right font-semibold ${diff === 0 ? "text-gray-300" : diff < 0 ? "text-amber-600" : "text-emerald-600"}`}>
          {diff === 0 ? "—" : `${diff > 0 ? "+" : ""}${fmt(diff)}`}
        </span>
      </div>
    </div>
  );
}

function BillingLine({ label, value, bold = false, negative = false }: any) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className={`text-gray-500 dark:text-gray-400 ${bold ? "font-semibold" : ""}`}>{label}</span>
      <span className={`${bold ? "font-bold text-gray-900 dark:text-white" : "font-semibold"} ${negative ? "text-rose-600 dark:text-rose-400" : "text-gray-700 dark:text-gray-300"}`}>
        {negative ? "− " : ""}{fmt(value)}
      </span>
    </div>
  );
}
