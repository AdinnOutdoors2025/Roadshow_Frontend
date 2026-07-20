/* eslint-disable */
// @ts-nocheck
"use client";

import { XCircle, Truck, RefreshCw, AlertTriangle, CheckCircle, User, Navigation } from "lucide-react";

const fmtDatetime = (s) => {
  if (!s) return "—";
  return new Date(s).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const cleanReg = (r) => (r || "").replace(/\s+/g, "").toUpperCase();

export default function RegNoHistoryModal({ order, regNo, onClose }) {
  const target = cleanReg(regNo);

  const events = [];

  (order.onRoadDriverHistory || []).forEach((h) => {
    const matchesDirect = cleanReg(h.vehicleRegistrationNumber) === target;
    const matchesOld = cleanReg(h.changedFields?.vehicleRegistrationNumber?.old) === target;
    const matchesNew = cleanReg(h.changedFields?.vehicleRegistrationNumber?.new) === target;
    if (!matchesDirect && !matchesOld && !matchesNew) return;

    if (h.action === "created") {
      events.push({
        at: h.changedAt,
        type: "added",
        title: "Vehicle Added",
        body: `${h.driverName || "—"} · ${h.driverPhone || "—"} — ${h.vehicleRegistrationNumber}`,
        sub: h.changedFields?.reason ? `Comments: ${h.changedFields.reason}` : "",
        by: h.changedBy,
      });
    } else if (h.action === "removed") {
      const isReplacedOut = !!h.changedFields?.replacedBy;
      events.push({
        at: h.changedAt,
        type: isReplacedOut ? "replaced-out" : "removed",
        title: isReplacedOut ? "Replaced (Outgoing)" : "Vehicle Removed",
        body: `${h.driverName || "—"} · ${h.driverPhone || "—"} — ${h.vehicleRegistrationNumber}`,
        sub: h.changedFields?.reason ? `Comments: ${h.changedFields.reason}` : "",
        by: h.changedBy,
        extra: isReplacedOut ? `Replaced by ${h.changedFields.replacedBy}` : "",
      });
    } else if (h.action === "updated") {
      events.push({
        at: h.changedAt,
        type: "updated",
        title: "Driver / Vehicle Updated",
        body: `${h.driverName || "—"} · ${h.driverPhone || "—"} — ${h.vehicleRegistrationNumber}`,
        sub: h.reason ? `Reason: ${h.reason}` : "",
        by: h.changedBy,
      });
    }
  });

  (order.onRoadUnavailableHistory || []).forEach((h) => {
    const isOldSide = cleanReg(h.vehicleRegNo) === target;
    const isReplacementSide = cleanReg(h.replacementVehicleRegNo) === target;
    if (!isOldSide && !isReplacementSide) return;

    if (isOldSide) {
      if (h.eventType === "replaced") {
        events.push({
          at: h.replacedAt || h.reportedAt,
          type: "replaced",
          title: "Vehicle Replaced",
          body: `${h.reason || "—"}`,
          sub: `Old: ${h.vehicleRegNo} → Replacement: ${h.replacementVehicleRegNo} (${h.replacementDriverName || "—"})`,
          by: h.reportedBy,
        });
      } else {
        events.push({
          at: h.reportedAt,
          type: "unavailable",
          title: h.inventoryStatus ? `Marked ${h.inventoryStatus}` : "Marked Unavailable",
          body: h.reason || "—",
          sub: "",
          by: h.reportedBy,
        });
        if (h.status === "available" && h.resolvedBy) {
          events.push({
            at: h.resolvedAt,
            type: "available",
            title: "Marked Available",
            body: h.resolveDescription || "—",
            sub: "",
            by: h.resolvedBy,
          });
        }
      }
    }
    if (isReplacementSide) {
      events.push({
        at: h.replacedAt || h.reportedAt,
        type: "replacement-in",
        title: "Assigned as Replacement",
        body: `${h.replacementDriverName || "—"} · ${h.replacementDriverPhone || "—"} — replacing ${h.vehicleRegNo}`,
        sub: h.reason ? `Reason: ${h.reason}` : "",
        by: h.reportedBy,
      });
    }
  });

  (order.onRoadIssues || []).forEach((iss) => {
    if (cleanReg(iss.vehicleRegNo) !== target) return;
    events.push({
      at: iss.reportedAt,
      type: "issue",
      title: `Issue Reported${iss.status === "resolved" ? " (Resolved)" : ""}`,
      body: iss.issueDescription,
      sub: "",
      by: iss.reportedBy,
    });
  });

  events.sort((a, b) => new Date(a.at || 0).getTime() - new Date(b.at || 0).getTime());

  const ICON_MAP = {
    added: { icon: Truck, cls: "bg-blue-500" },
    removed: { icon: XCircle, cls: "bg-gray-400" },
    "replaced-out": { icon: RefreshCw, cls: "bg-amber-500" },
    replaced: { icon: RefreshCw, cls: "bg-amber-500" },
    "replacement-in": { icon: RefreshCw, cls: "bg-emerald-500" },
    unavailable: { icon: AlertTriangle, cls: "bg-red-500" },
    available: { icon: CheckCircle, cls: "bg-emerald-500" },
    updated: { icon: User, cls: "bg-indigo-500" },
    issue: { icon: AlertTriangle, cls: "bg-orange-500" },
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Navigation size={15} className="text-blue-500" />
              Vehicle History · {regNo}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {events.length} event{events.length !== 1 ? "s" : ""} across this campaign
            </p>
          </div>
          <button onClick={onClose}>
            <XCircle size={18} className="text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {events.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">No history found for this registration number</p>
          ) : (
            <div className="space-y-4">
              {events.map((ev, i) => {
                const meta = ICON_MAP[ev.type] || { icon: Truck, cls: "bg-gray-400" };
                const Icon = meta.icon;
                return (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${meta.cls}`}>
                        <Icon size={14} className="text-white" />
                      </div>
                      {i < events.length - 1 && (
                        <div className="w-0.5 bg-gray-200 dark:bg-gray-700 flex-1 min-h-[16px] mt-1" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pb-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{ev.title}</span>
                        <span className="text-xs text-gray-400">{fmtDatetime(ev.at)}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">{ev.body}</p>
                      {ev.sub && <p className="text-xs text-gray-400 mt-0.5">{ev.sub}</p>}
                      {ev.extra && <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">{ev.extra}</p>}
                      {ev.by && <p className="text-xs text-gray-400 mt-1">By {ev.by}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
