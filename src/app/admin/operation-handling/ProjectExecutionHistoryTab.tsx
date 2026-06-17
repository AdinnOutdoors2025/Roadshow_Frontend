

/* eslint-disable */
// @ts-nocheck
"use client";

import { CheckCircle2, Clock, User, ArrowRight, Truck, History, Tag, Phone } from "lucide-react";


interface Order {
  _id: string;
  orderId: string;
  pipelineLogs: any[];
  onRoadExecutionArray?: any[];
  onRoadHistory?: any[];
  bookingItems: any[];
  handlerName?: string;
}

const fmtDatetime = (s?: string) => {
  if (!s) return "—";
  return new Date(s).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const STAGE_LABEL: Record<string, string> = {
  todo: "To-Do",
  projectCodeCreation: "Project Code Creation",
  projectExecution: "Project Execution",
  onRoad: "On Road",
  campaignRunning: "Campaign Running",
  vehicleUnavailable: "Vehicle Unavailable",
  clientClosure: "Client Closure",
  invoiceGeneration: "Invoice Generation",
  paymentStage2: "Payment Stage 2",
  closedWon: "Closed Won",
  closedLost: "Closed Lost",
};

const STAGE_COLOR: Record<string, { bg: string; text: string; dot: string }> = {
  todo: { bg: "bg-slate-100 dark:bg-slate-800/50", text: "text-slate-700 dark:text-slate-300", dot: "bg-slate-400" },
  projectExecution: { bg: "bg-teal-50 dark:bg-teal-900/20", text: "text-teal-700 dark:text-teal-300", dot: "bg-teal-500" },
  onRoad: { bg: "bg-sky-50 dark:bg-sky-900/20", text: "text-sky-700 dark:text-sky-300", dot: "bg-sky-500" },
  campaignRunning: { bg: "bg-indigo-50 dark:bg-indigo-900/20", text: "text-indigo-700 dark:text-indigo-300", dot: "bg-indigo-500" },
  vehicleUnavailable: { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-700 dark:text-red-300", dot: "bg-red-400" },
  clientClosure: { bg: "bg-pink-50 dark:bg-pink-900/20", text: "text-pink-700 dark:text-pink-300", dot: "bg-pink-500" },
  invoiceGeneration: { bg: "bg-fuchsia-50 dark:bg-fuchsia-900/20", text: "text-fuchsia-700 dark:text-fuchsia-300", dot: "bg-fuchsia-500" },
  paymentStage2: { bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-700 dark:text-purple-300", dot: "bg-purple-500" },
  closedWon: { bg: "bg-green-50 dark:bg-green-900/20", text: "text-green-700 dark:text-green-300", dot: "bg-green-500" },
  closedLost: { bg: "bg-rose-50 dark:bg-rose-900/20", text: "text-rose-700 dark:text-rose-300", dot: "bg-rose-500" },
};


function StageBadge({ stage }: { stage: string }) {
  const color = STAGE_COLOR[stage] || { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${color.bg} ${color.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
      {STAGE_LABEL[stage] || stage}
    </span>
  );
}


function TimelineItem({
  log,
  isFirst,
  isLast,
  driverDetails,
}: {
  log: any;
  isFirst: boolean;
  isLast: boolean;
  driverDetails?: any[];
}) {
  const color = STAGE_COLOR[log.toStage] || { dot: "bg-gray-400" };

  return (
    <div className="flex gap-4">

      <div className="flex flex-col items-center flex-shrink-0">
        <div className={`w-3 h-3 rounded-full ${color.dot} ring-2 ring-white dark:ring-gray-900 shadow-sm mt-1`} />
        {!isLast && <div className="w-0.5 flex-1 bg-gray-100 dark:bg-gray-800 mt-1" />}
      </div>


      <div className={`pb-5 flex-1 min-w-0 ${isLast ? "pb-0" : ""}`}>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-all">

          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              {log.fromStage && (
                <>
                  <StageBadge stage={log.fromStage} />
                  <ArrowRight size={13} className="text-gray-400 flex-shrink-0" />
                </>
              )}
              <StageBadge stage={log.toStage} />
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
              <Clock size={11} />
              {fmtDatetime(log.movedAt)}
            </div>
          </div>


          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
              {(log.movedBy || "?").charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-gray-500">
              Moved by <span className="font-semibold text-gray-700 dark:text-gray-300">{log.movedBy || "—"}</span>
            </span>
            {log.handlerName && (
              <span className="text-xs text-gray-400">
                · Handler: <span className="font-semibold text-violet-700 dark:text-violet-400">{log.handlerName}</span>
              </span>
            )}
          </div>


          {log.toStage === "onRoad" && driverDetails && driverDetails.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Truck size={12} /> Driver Details Added
              </p>
              <div className="space-y-2">
                {driverDetails.map((d: any, i: number) => (
                  <div key={d._id || i} className="flex items-center gap-3 p-2.5 rounded-lg bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800/50">
                    <div className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                      V{(d.vehicleIndex ?? i) + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{d.driverName}</p>
                      <p className="text-[11px] text-gray-500">{d.driverPhone} · <span className="font-mono text-sky-700 dark:text-sky-400">{d.vehicleRegistrationNumber}</span></p>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${d.onRoadStatus === 1
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                      }`}>
                      {d.onRoadStatus === 1 ? "🟢" : "⏸"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {log.notes?.trim() && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-500 italic">"{log.notes}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


function DriverStatusSummary({ entries, bookingItems }: { entries: any[]; bookingItems: any[] }) {
  if (!entries || entries.length === 0) return null;

  const formatUploadTime = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border border-teal-100 dark:border-teal-800/50 mb-4">
        <Truck size={18} className="text-teal-500" />
        <span className="text-md font-bold text-teal-700 dark:text-teal-300">Driver Status Summary</span>
        <span className="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-100 dark:bg-teal-900/40 text-teal-700">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          {entries.filter(e => e.onRoadStatus === 1).length} Active
        </span>
      </div>

      <div className="space-y-0">
        {entries.map((entry: any, i: number, arr: any[]) => {
          const isActive = entry.onRoadStatus === 1;
          const isLast = i === arr.length - 1;
          const dotGradient = isActive
            ? "from-green-400 to-emerald-600"
            : "from-gray-400 to-gray-500";

          return (
            <div key={entry._id || i} className="flex items-start gap-3 relative">
              {!isLast && (
                <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-100 dark:bg-gray-700" />
              )}
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${dotGradient} flex-shrink-0 flex items-center justify-center mt-0.5 relative z-10`}>
                <span className="text-[10px] font-bold text-white">V{(entry.vehicleIndex ?? i) + 1}</span>
              </div>
              <div className="flex-1 pb-4">
                <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-3 border border-gray-100 dark:border-gray-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-blue-500" />
                      <p className="text-md font-semibold text-gray-800 dark:text-gray-200">
                        {entry.driverName}
                      </p>
                      <span className="text-sm text-gray-400 font-normal">(Driver)</span>
                    </div>
                    <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-sm font-semibold ${isActive
                      ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400"
                      : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                      }`}>
                      {isActive ? (
                        <>
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                          On Road
                        </>
                      ) : (
                        <>
                          <Clock size={10} />
                          Off Road
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <Phone size={15} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{entry.driverPhone}</span>
                    <span>·</span>
                    <Truck size={16} className="text-gray-400" />
                    <span className="text-sm font-mono font-semibold text-teal-600 dark:text-teal-400">
                      {entry.vehicleRegistrationNumber}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                    <Clock size={13} className="text-gray-400" />
                    <span>Created at: {formatUploadTime(entry.uploadedAt)}</span>
                    {entry.uploadedBy && (
                      <>
                        <span>·</span>
                        <User size={14} className="text-gray-400" />
                        <span>Created By {entry.uploadedBy}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


export default function ProjectExecutionHistoryTab({ order }: { order: Order }) {
  const logs = [...(order.pipelineLogs || [])].reverse();
  const driverEntries = order.onRoadExecutionArray || [];
  const onRoadHistory = order.onRoadHistory || [];

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <History className="w-9 h-9 text-gray-400" />
        </div>
        <p className="text-base font-semibold text-gray-600 dark:text-gray-400">No pipeline history</p>
        <p className="text-sm text-gray-400 mt-1">Stage changes will appear here</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {driverEntries.length > 0 && (
        <DriverStatusSummary entries={driverEntries} bookingItems={order.bookingItems} />
      )}

      {onRoadHistory.length > 0 && (
        <div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 border border-sky-100 dark:border-sky-800/50 mb-4">
            <Truck size={14} className="text-sky-500" />
            <span className="text-sm font-bold text-sky-700 dark:text-sky-300">On Road Status Changes</span>
            <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-100 dark:bg-sky-900/40 text-sky-700">
              {onRoadHistory.length} events
            </span>
          </div>

          <div className="space-y-0">
            {[...onRoadHistory].reverse().map((h: any, i: number, arr: any[]) => {
              const isLast = i === arr.length - 1;
              const isCreated = h.action === "created";
              const dotGradient = isCreated
                ? "from-green-400 to-emerald-600"
                : "from-amber-400 to-orange-500";

              return (
                <div key={h._id || i} className="flex items-start gap-3 relative">
                  {!isLast && (
                    <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-100 dark:bg-gray-700" />
                  )}
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${dotGradient} flex-shrink-0 flex items-center justify-center mt-0.5 relative z-10`}>
                    <div className="w-2.5 h-2.5 rounded-full bg-white/70" />
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-3 border border-gray-100 dark:border-gray-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          Vehicle {(h.vehicleIndex ?? 0) + 1} —{" "}
                          {isCreated ? "On Road status added" : "Details edited"}
                        </p>
                      </div>

                      {h.action === "edited" && Object.keys(h.changedFields || {}).length > 0 && (
                        <div className="mb-2 space-y-1">
                          {Object.entries(h.changedFields).map(([field, val]: any) => (
                            <div key={field} className="flex items-center gap-2 text-xs">
                              <span className="text-gray-500 w-20 capitalize">
                                {field === "driverName" ? "Driver Name"
                                  : field === "driverPhone" ? "Phone"
                                    : field === "vehicleRegistrationNumber" ? "Reg. No"
                                      : field === "onRoadStatus" ? "Status"
                                        : field}:
                              </span>
                              <span className="line-through text-red-500">
                                {field === "onRoadStatus" ? (val.old === 1 ? "On Road" : "Off Road") : (val.old || "—")}
                              </span>
                              <span className="text-gray-400">→</span>
                              <span className="text-green-600 font-semibold">
                                {field === "onRoadStatus" ? (val.new === 1 ? "On Road" : "Off Road") : val.new}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">{h.driverName}</span>
                        <span>·</span>
                        <span>{h.driverPhone}</span>
                        <span>·</span>
                        <span className="font-mono text-sky-700 dark:text-sky-400">{h.vehicleRegistrationNumber}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-gray-400 flex-wrap">
                        <Clock size={12} className="text-gray-400" />
                        <span>{fmtDatetime(h.changedAt)}</span>
                        <span>·</span>
                        <User size={12} className="text-gray-400" />
                        <span>By {h.changedBy || "—"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}