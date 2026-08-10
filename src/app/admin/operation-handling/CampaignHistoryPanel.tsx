

/* eslint-disable */
// @ts-nocheck


interface VehicleEntry {
  _id: string;
  vehicleRegistrationNumber: string;

}

interface DriverHistoryEntry {
  _id?: string;
  vehicleIndex: number;
  entryId?: string | number;
  vehicleRegistrationNumber?: string;
  driverName?: string;
  driverPhone?: string;
  action: "created" | "updated";
  changedBy?: string;
  changedAt: string;
  changedFields?: Record<string, { old: any; new: any }>;
}

interface IssueHistoryEntry {
  vehicleIndex: number;
  vehicleRegNo: string;
  reportedAt: string;
  resolvedAt?: string;
  status: "open" | "resolved" | "closed";
  issueDescription: string;
  issuePhoto?: string;
  reportedBy?: string;
}

interface UnavailableHistoryEntry {
  vehicleIndex: number;
  vehicleRegNo: string;
  reportedAt: string;
  status: "unavailable" | "available";
  reason?: string;
  photo?: string;
  reportedBy?: string;
}

interface Segment {
  _id: string;
  driverName?: string;
  driverPhone?: string;
  vehicleRegistrationNumber?: string;
  action: "created" | "updated";
  changedBy?: string;
  changedFields?: Record<string, { old: any; new: any }>;
  startDate: string;
  endDate: string;
  isOngoing: boolean;
}

interface DateGroup {
  key: string;
  date: string;
  segments: Segment[];
}

interface ActivityItem {
  kind: "issue" | "unavailable";
  date: string;
  data: IssueHistoryEntry | UnavailableHistoryEntry;
}

interface CampaignHistoryPanelProps {
  vehicleEntries: VehicleEntry[];
  driverHistory: DriverHistoryEntry[];
  issueHistory: IssueHistoryEntry[];
  unavailableHistory: UnavailableHistoryEntry[];
  vehicleIndex: number;
  campaignFromDate: string;
  campaignToDate: string;
}

// ─── Functions ────────────────────────────────────────────────────────────

function buildVehicleSegments(
  driverHistoryForVehicle: DriverHistoryEntry[],
  campaignToDate: string
): Segment[] {
  const sorted = [...driverHistoryForVehicle].sort(
    (a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime()
  );

  const segments: Segment[] = [];
  let current: any = null;

sorted.forEach((entry) => {
  if (entry.action === "removed") {
    if (current) {
      current.endDate = entry.changedAt;
      current.isOngoing = false;
      current.wasRemoved = true;
      current.removalReason = entry.changedFields?.reason || "";
      current.removedBy = entry.changedBy;
      current.removedAt = entry.changedAt;
    }
    current = null;
    return;
  }

  if (current) {
    current.endDate = entry.changedAt;
    current.isOngoing = false;
  }

  current = {
    _id: entry._id || `${entry.vehicleRegistrationNumber}-${entry.changedAt}`,
    driverName: entry.driverName,
    driverPhone: entry.driverPhone,
    vehicleRegistrationNumber: entry.vehicleRegistrationNumber,
    action: entry.action,
    changedBy: entry.changedBy,
    changedFields: entry.changedFields,
    startDate: entry.changedAt,
    endDate: campaignToDate,
    isOngoing: true,
  };
  segments.push(current);
});

  return segments;
}

function groupSegmentsByDate(segments: Segment[]): DateGroup[] {
  const dayKey = (d: string): string =>
    new Date(d).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

  const groups: DateGroup[] = [];
  segments.forEach((seg) => {
    const key = dayKey(seg.startDate);
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.segments.push(seg);
    } else {
      groups.push({ key, date: seg.startDate, segments: [seg] });
    }
  });

  return groups;
}



const dayKeyOf = (d: string): string =>
  new Date(d).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });


function generateCampaignDates(fromDate?: string, toDate?: string): string[] {
  if (!fromDate || !toDate) return [];

  const dates: string[] = [];
  const start = new Date(fromDate);
  const end = new Date(toDate);

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return [];

  const cur = new Date(start);
  let guard = 0;
  while (cur <= end && guard < 366) {
    dates.push(cur.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }));
    cur.setDate(cur.getDate() + 1);
    guard++;
  }
  return dates;
}


function getDayView(
  segments: Segment[],
  dateKey: string
): { mode: "updated" | "carried" | "none"; segments: Segment[] } {
  if (!dateKey) return { mode: "none", segments: [] };


  const startedToday = segments
    .filter((seg) => dayKeyOf(seg.startDate) === dateKey)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  if (startedToday.length > 0) {
    return { mode: "updated", segments: startedToday };
  }


  const t = new Date(`${dateKey}T23:59:59`).getTime();
  const candidates = segments.filter((seg) => {
    const start = new Date(seg.startDate).getTime();
    const end = seg.isOngoing ? Infinity : new Date(seg.endDate).getTime();
    return start < t && (seg.isOngoing || end >= new Date(`${dateKey}T00:00:00`).getTime());
  });

  if (candidates.length > 0) {

    const latest = candidates.reduce((a, b) =>
      new Date(a.startDate).getTime() > new Date(b.startDate).getTime() ? a : b
    );
    return { mode: "carried", segments: [latest] };
  }

  return { mode: "none", segments: [] };
}


function hasUpdateOnDay(segments: Segment[], dateKey: string): boolean {
  return segments.some((seg) => dayKeyOf(seg.startDate) === dateKey);
}

function hasRemovalOnDay(segments: Segment[], dateKey: string): boolean {
  return segments.some((seg: any) => seg.wasRemoved && dayKeyOf(seg.endDate) === dateKey);
}

function fmtDt(s?: string): string {
  if (!s) return "—";
  return new Date(s).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtD(s?: string): string {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtDShort(dateKey?: string): string {
  if (!dateKey) return "—";
  return new Date(`${dateKey}T12:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

function fmtDayName(dateKey?: string): string {
  if (!dateKey) return "";
  return new Date(`${dateKey}T12:00:00`).toLocaleDateString("en-IN", {
    weekday: "short",
  });
}

function getImageUrlCH(url?: string): string | null {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${(window as any).API_BASE?.replace("/api", "") || ""}${url}`;
}

// Mirrors the status tag logic in OnRoadTab.tsx so a registration number's
// current state (On Road / Unavailable / Released / Assigned) is never
// ambiguous, even after chained replacements.
function getRegStatusCH(entry: any) {
  if (!entry) return { label: "—", cls: "bg-gray-100 text-gray-400 border-gray-200" };
  if (entry.entryStatus === "removed") {
    return { label: "Released", cls: "bg-gray-200 text-gray-600 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600" };
  }
  if (entry.unavailableStatus) {
    return { label: "Unavailable", cls: "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800" };
  }
  if (entry.onRoadStatus === 1) {
    return { label: "On Road", cls: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800" };
  }
  return { label: "Assigned", cls: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800" };
}

function RegStatusBadgeCH({ entry }: { entry: any }) {
  const { label, cls } = getRegStatusCH(entry);
  return (
    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border leading-none ${cls}`}>
      {label}
    </span>
  );
}



import React, { useState, useEffect } from "react";
import { Clock, AlertTriangle, XCircle, User, CheckCircle2 } from "lucide-react";

export default function CampaignHistoryPanel({
  vehicleEntries,
  driverHistory,
  issueHistory,
  unavailableHistory,
  vehicleIndex,
  campaignFromDate,
  campaignToDate,
}: CampaignHistoryPanelProps) {
  const [activeVehicleTab, setActiveVehicleTab] = useState<number>(0);
  const [activeGroupIdx, setActiveGroupIdx] = useState<number>(0);

  const [activeSubTab, setActiveSubTab] = useState<"driverStatus" | "campaignStatus">(
    "driverStatus"
  );
  const [activeCampaignDateIdx, setActiveCampaignDateIdx] = useState<number>(0);

  const activeEntry = vehicleEntries[activeVehicleTab];

  const vehicleDriverHistory = (driverHistory || []).filter((h) => {
    if (h.vehicleIndex !== vehicleIndex || !activeEntry) return false;
    if (h.entryId) return String(h.entryId) === String(activeEntry._id);
    return (
      h.vehicleRegistrationNumber === activeEntry.vehicleRegistrationNumber ||
      h.changedFields?.vehicleRegistrationNumber?.old === activeEntry.vehicleRegistrationNumber ||
      h.changedFields?.vehicleRegistrationNumber?.new === activeEntry.vehicleRegistrationNumber
    );
  });


  const segments = buildVehicleSegments(vehicleDriverHistory, campaignToDate);


  const dateGroups = groupSegmentsByDate(segments);

  useEffect(() => {
    setActiveGroupIdx(Math.max(0, dateGroups.length - 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVehicleTab]);

  const selectedGroup = dateGroups[activeGroupIdx];


  const campaignDates = generateCampaignDates(campaignFromDate, campaignToDate);

  useEffect(() => {
    const todayKey = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    const todayIdx = campaignDates.indexOf(todayKey);
    setActiveCampaignDateIdx(todayIdx >= 0 ? todayIdx : Math.max(0, campaignDates.length - 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVehicleTab, campaignFromDate, campaignToDate]);

  const selectedDateKey = campaignDates[activeCampaignDateIdx];
  const dayView = getDayView(segments, selectedDateKey); // { mode, segments }

  const relevantRegNos = new Set(
    vehicleDriverHistory.map((h) => h.vehicleRegistrationNumber).filter(Boolean) as string[]
  );

  const scopedIssues = (issueHistory || []).filter(
    (iss) => iss.vehicleIndex === vehicleIndex && relevantRegNos.has(iss.vehicleRegNo)
  );

  const scopedUnavailable = (unavailableHistory || []).filter(
    (u) => u.vehicleIndex === vehicleIndex && relevantRegNos.has(u.vehicleRegNo)
  );

  const isWithinSegment = (dateStr: string, segment: Segment): boolean => {
    const t = new Date(dateStr).getTime();
    const start = new Date(segment.startDate).getTime();
    const end = new Date(segment.endDate).getTime();
    return t >= start && t <= end;
  };


  const activityForSelectedDate: ActivityItem[] = (() => {
    if (!selectedDateKey || dayView.segments.length === 0) return [];
    const regsForDay = new Set(dayView.segments.map((s) => s.vehicleRegistrationNumber).filter(Boolean));

    const dayIssues = scopedIssues.filter((iss) => {
      if (!regsForDay.has(iss.vehicleRegNo)) return false;
      return dayKeyOf(iss.reportedAt) === selectedDateKey;
    });
    const dayUnavailable = scopedUnavailable.filter((u) => {
      if (!regsForDay.has(u.vehicleRegNo)) return false;
      return dayKeyOf(u.reportedAt) === selectedDateKey;
    });
    return [
      ...dayIssues.map((iss) => ({ kind: "issue" as const, date: iss.reportedAt, data: iss })),
      ...dayUnavailable.map((u) => ({ kind: "unavailable" as const, date: u.reportedAt, data: u })),
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  })();

  const lastActivityDate = ((): Date | null => {
    const allDates = [
      ...vehicleDriverHistory.map((h) => h.changedAt),
      ...scopedIssues.map((i) => i.reportedAt),
      ...scopedIssues.filter((i) => i.resolvedAt).map((i) => i.resolvedAt as string),
      ...scopedUnavailable.map((u) => u.reportedAt),
    ].filter(Boolean);
    if (allDates.length === 0) return null;
    return new Date(Math.max(...allDates.map((d) => new Date(d).getTime())));
  })();

  const todayKeyForBadge = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

  return (
    <div>
      {/* Vehicle tabs */}
      {vehicleEntries.length > 1 && (
        <div className="flex gap-1 px-3 pt-3 pb-0 border-b border-gray-100 dark:border-gray-800 overflow-x-auto">
        {vehicleEntries.map((entry, i) => (
            <button
              key={entry._id || i}
              onClick={() => setActiveVehicleTab(i)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap flex-shrink-0 ${activeVehicleTab === i
                ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
            >
              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-white ${entry.entryStatus === "removed" ? "bg-red-500" : "bg-blue-500"}`} style={{ fontSize: "9px" }}>
                V{i + 1}
              </div>
              <span className="font-mono text-xs">{entry.vehicleRegistrationNumber || `Vehicle ${i + 1}`}</span>
              <RegStatusBadgeCH entry={entry} />
            </button>
          ))}
        </div>
      )}

      {/* Campaign date range + last activity summary */}
      <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <Clock size={14} />
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {fmtD(campaignFromDate)} → {fmtD(campaignToDate)}
          </span>
        </div>
        {lastActivityDate && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
            Last activity · {fmtDt(lastActivityDate.toISOString())}
          </span>
        )}
      </div>

      {/* Driver Status / Campaign Status sub-tabs */}
      <div className="flex items-center gap-1 px-3 pt-3 pb-2 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
          <button
            onClick={() => setActiveSubTab("driverStatus")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${activeSubTab === "driverStatus"
              ? "bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 shadow-sm"
              : "text-gray-400 hover:text-gray-600"
              }`}
          >
            Driver Status
          </button>
          <button
            onClick={() => setActiveSubTab("campaignStatus")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${activeSubTab === "campaignStatus"
              ? "bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 shadow-sm"
              : "text-gray-400 hover:text-gray-600"
              }`}
          >
            Campaign Status
          </button>
        </div>
      </div>


      {activeSubTab === "driverStatus" && (
        <>
          {dateGroups.length > 0 && (
            <div className="flex gap-1.5 px-3 pt-3 pb-2 border-b border-gray-100 dark:border-gray-800 overflow-x-auto">
              {dateGroups.map((grp, i) => {
                return (
                  <button
                    key={grp.key}
                    onClick={() => setActiveGroupIdx(i)}
                    className={`flex flex-col items-start gap-0.5 px-3 py-1.5 rounded-lg border text-left whitespace-nowrap flex-shrink-0 transition-all ${activeGroupIdx === i
                      ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                  >
                    <span className="text-[11px] text-gray-400">{fmtD(grp.date)}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="p-4 max-h-[460px] overflow-y-auto space-y-4">
            {!selectedGroup ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                No campaign history for this vehicle
              </div>
            ) : (
              [...selectedGroup.segments].reverse().map((seg) => {
                const segIssues = scopedIssues
                  .filter((iss) => iss.vehicleRegNo === seg.vehicleRegistrationNumber)
                  .filter((iss) => isWithinSegment(iss.reportedAt, seg));

                const segUnavailable = scopedUnavailable
                  .filter((u) => u.vehicleRegNo === seg.vehicleRegistrationNumber)
                  .filter((u) => isWithinSegment(u.reportedAt, seg));

                const activity: ActivityItem[] = [
                  ...segIssues.map((iss) => ({ kind: "issue" as const, date: iss.reportedAt, data: iss })),
                  ...segUnavailable.map((u) => ({ kind: "unavailable" as const, date: u.reportedAt, data: u })),
                ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                return (
                  <div key={seg._id}>
                    {/* Segment header card */}
                    <div
                      className={`rounded-xl border p-3 ${seg.isOngoing
                        ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/10"
                        : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/40"
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {(seg.driverName || "D")[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                              {seg.driverName || "—"}
                            </p>
                            <p className="text-xs text-gray-400 font-mono">
                              {seg.driverPhone} · {seg.vehicleRegistrationNumber}
                            </p>
                          </div>
                        </div>
                       <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                            seg.isOngoing
                              ? "bg-emerald-100 text-emerald-700"
                              : (seg as any).wasRemoved
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {seg.isOngoing ? "Active" : (seg as any).wasRemoved ? "Released" : "Closed"}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {fmtDt(seg.startDate)} → {seg.isOngoing ? "Ongoing" : fmtDt(seg.endDate)}
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        {seg.action === "created" ? "Driver added" : "Driver updated"} by{" "}
                        {seg.changedBy || "—"}
                      </p>

                      {(seg as any).wasRemoved && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg px-2 py-1 w-fit dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                          <XCircle size={12} />
                          Released by {(seg as any).removedBy || "—"} on {fmtDt((seg as any).removedAt)}
                          {(seg as any).removalReason && (
                            <span className="font-normal text-red-500"> — {(seg as any).removalReason}</span>
                          )}
                        </div>
                      )}

                      {seg.action === "updated" && seg.changedFields && Object.keys(seg.changedFields).length > 0 && (
                        <div className="mt-1.5 space-y-0.5 pt-1.5 border-t border-gray-200 dark:border-gray-700">
                          {Object.entries(seg.changedFields).map(([field, val]) => (
                            <p key={field} className="text-xs text-gray-500">
                              <span className="font-medium capitalize">{field}:</span>{" "}
                              <span className="line-through text-red-400">{val.old}</span>
                              {" → "}
                              <span className="text-emerald-600 font-medium">{val.new}</span>
                            </p>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* In-segment activity */}
                    {activity.length > 0 && (
                      <div className="mt-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-2">
                        {activity.map((act, idx) => {
                          const issueData = act.kind === "issue" ? (act.data as IssueHistoryEntry) : null;
                          const unavailableData =
                            act.kind === "unavailable" ? (act.data as UnavailableHistoryEntry) : null;

                          return (
                            <div key={idx} className="flex gap-2">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white ${act.kind === "issue"
                                  ? issueData?.status === "open"
                                    ? "bg-red-500"
                                    : "bg-emerald-500"
                                  : "bg-orange-500"
                                  }`}
                              >
                                {act.kind === "issue" ? (
                                  <AlertTriangle size={12} />
                                ) : (
                                  <XCircle size={12} />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    {act.kind === "issue"
                                      ? issueData?.status === "open"
                                        ? "Issue reported"
                                        : "Issue resolved"
                                      : unavailableData?.status === "unavailable"
                                        ? "Marked unavailable"
                                        : "Marked available"}
                                  </span>
                                  <span className="text-xs text-gray-400">{fmtDt(act.date)}</span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                  {act.kind === "issue" ? issueData?.issueDescription : unavailableData?.reason}
                                </p>
                                {act.kind === "issue" && issueData?.issuePhoto && (
                                  <a href={getImageUrlCH(issueData.issuePhoto)} target="_blank" rel="noreferrer">
                                    <img
                                      src={getImageUrlCH(issueData.issuePhoto) || undefined}
                                      className="w-12 h-10 rounded-lg object-cover border mt-1 hover:opacity-80"
                                      alt="activity"
                                    />
                                  </a>
                                )}
                                {act.kind === "unavailable" && unavailableData?.photo && (
                                  <a href={getImageUrlCH(unavailableData.photo)} target="_blank" rel="noreferrer">
                                    <img
                                      src={getImageUrlCH(unavailableData.photo) || undefined}
                                      className="w-12 h-10 rounded-lg object-cover border mt-1 hover:opacity-80"
                                      alt="activity"
                                    />
                                  </a>
                                )}
                                <p className="text-xs text-gray-400 mt-0.5">
                                  By{" "}
                                  {act.kind === "issue"
                                    ? issueData?.reportedBy || "—"
                                    : unavailableData?.reportedBy || "—"}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}


      {activeSubTab === "campaignStatus" && (
        <>
          {campaignDates.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">
              Campaign dates not available
            </div>
          ) : (
            <>

              <div className="flex gap-1.5 px-3 pt-3 pb-2 border-b border-gray-100 dark:border-gray-800 overflow-x-auto">
                {campaignDates.map((dateKey, i) => {
                  const changedThisDay = hasUpdateOnDay(segments, dateKey);
                  const isToday = dateKey === todayKeyForBadge;
                  return (
                    <button
                      key={dateKey}
                      onClick={() => setActiveCampaignDateIdx(i)}
                      className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg border text-center whitespace-nowrap flex-shrink-0 transition-all relative ${activeCampaignDateIdx === i
                        ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                    >
                      <span
                        className={`text-[10px] font-medium ${activeCampaignDateIdx === i ? "text-blue-500" : "text-gray-400"
                          }`}
                      >
                        {fmtDayName(dateKey)}
                      </span>
                      <span
                        className={`text-xs font-bold ${activeCampaignDateIdx === i ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-300"
                          }`}
                      >
                        {fmtDShort(dateKey)}
                      </span>
                      {changedThisDay && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute top-1 right-1" />
                      )}
                      {hasRemovalOnDay(segments, dateKey) && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 absolute top-1 left-1" />
                      )}
                      {isToday && (
                        <span className="text-[9px] font-semibold text-emerald-500">Today</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="p-4 max-h-[460px] overflow-y-auto space-y-3">
                {dayView.mode === "none" ? (
                  <div className="p-6 text-center text-gray-400 text-sm">
                    No driver assigned on {fmtDShort(selectedDateKey)}
                  </div>
                ) : (
                  <>

                    {[...dayView.segments].reverse().map((seg, segIdx) => {
                      const showUpdatedBadge = dayView.mode === "updated";

                      return (
                        <div
                          key={seg._id}
                          className={`rounded-xl border p-3 ${seg.isOngoing
                            ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/10"
                            : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/40"
                            }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {(seg.driverName || "D")[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                  {seg.driverName || "—"}
                                </p>
                                <p className="text-xs text-gray-400 font-mono">
                                  {seg.driverPhone} · {seg.vehicleRegistrationNumber}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${seg.isOngoing
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                }`}
                            >
                              {seg.isOngoing ? "Active" : "Closed"}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Driving on {fmtD(selectedDateKey)}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {fmtDt(seg.startDate)} → {seg.isOngoing ? "Ongoing" : fmtDt(seg.endDate)}
                          </p>

                          {showUpdatedBadge && (
                            <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 w-fit dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400">
                              <User size={12} />
                              {seg.action === "created" ? "Driver added on this date" : "Driver updated on this date"}
                            </div>
                          )}

                          {(seg as any).wasRemoved && dayKeyOf((seg as any).endDate) === selectedDateKey && (
                            <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg px-2 py-1 w-fit dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                              <XCircle size={12} />
                              Vehicle released on this date
                              {(seg as any).removalReason && (
                                <span className="font-normal text-red-500"> — {(seg as any).removalReason}</span>
                              )}
                            </div>
                          )}

                          {showUpdatedBadge &&
                            seg.action === "updated" &&
                            seg.changedFields &&
                            Object.keys(seg.changedFields).length > 0 && (
                              <div className="mt-1.5 space-y-0.5 pt-1.5 border-t border-gray-200 dark:border-gray-700">
                                {Object.entries(seg.changedFields).map(([field, val]) => (
                                  <p key={field} className="text-xs text-gray-500">
                                    <span className="font-medium capitalize">{field}:</span>{" "}
                                    <span className="line-through text-red-400">{val.old}</span>
                                    {" → "}
                                    <span className="text-emerald-600 font-medium">{val.new}</span>
                                  </p>
                                ))}
                              </div>
                            )}
                        </div>
                      );
                    })}


                    {activityForSelectedDate.length > 0 && (
                      <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-2">
                        {activityForSelectedDate.map((act, idx) => {
                          const issueData = act.kind === "issue" ? (act.data as IssueHistoryEntry) : null;
                          const unavailableData =
                            act.kind === "unavailable" ? (act.data as UnavailableHistoryEntry) : null;

                          return (
                            <div key={idx} className="flex gap-2">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white ${act.kind === "issue"
                                  ? issueData?.status === "open"
                                    ? "bg-red-500"
                                    : "bg-emerald-500"
                                  : "bg-orange-500"
                                  }`}
                              >
                                {act.kind === "issue" ? (
                                  <AlertTriangle size={12} />
                                ) : (
                                  <XCircle size={12} />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    {act.kind === "issue"
                                      ? issueData?.status === "open"
                                        ? "Issue reported"
                                        : "Issue resolved"
                                      : unavailableData?.status === "unavailable"
                                        ? "Marked unavailable"
                                        : "Marked available"}
                                  </span>
                                  <span className="text-xs text-gray-400">{fmtDt(act.date)}</span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                  {act.kind === "issue" ? issueData?.issueDescription : unavailableData?.reason}
                                </p>
                                {act.kind === "issue" && issueData?.issuePhoto && (
                                  <a href={getImageUrlCH(issueData.issuePhoto)} target="_blank" rel="noreferrer">
                                    <img
                                      src={getImageUrlCH(issueData.issuePhoto) || undefined}
                                      className="w-12 h-10 rounded-lg object-cover border mt-1 hover:opacity-80"
                                      alt="activity"
                                    />
                                  </a>
                                )}
                                {act.kind === "unavailable" && unavailableData?.photo && (
                                  <a href={getImageUrlCH(unavailableData.photo)} target="_blank" rel="noreferrer">
                                    <img
                                      src={getImageUrlCH(unavailableData.photo) || undefined}
                                      className="w-12 h-10 rounded-lg object-cover border mt-1 hover:opacity-80"
                                      alt="activity"
                                    />
                                  </a>
                                )}
                                <p className="text-xs text-gray-400 mt-0.5">
                                  By{" "}
                                  {act.kind === "issue"
                                    ? issueData?.reportedBy || "—"
                                    : unavailableData?.reportedBy || "—"}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {activityForSelectedDate.length === 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 pl-1">
                        <CheckCircle2 size={12} />
                        No issues reported on this date
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
