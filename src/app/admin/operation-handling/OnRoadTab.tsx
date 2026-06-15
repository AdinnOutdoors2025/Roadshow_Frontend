
/* eslint-disable */
// @ts-nocheck
'use client';

import { useState } from "react";
import {
  X, User, Truck, Clock, FileText, Eye, ZoomIn,
  CheckCircle, Shield, Navigation, History, Pencil,
  XCircle, AlertCircle
} from "lucide-react";

interface Order {
  _id: string;
  orderId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  customerType?: number;
  pipelineStatus: string;
  handlerName?: string;
  updatedAt: string;
  createdAt: string;
  grandTotal: number;
  grandGst?: number;
  grandNegotiationTotal?: number;
  bookingItems: any[];
  negotiationLogs?: any[];
  pipelineLogs: any[];
  projectCodeArray?: any[];
  projectExecutionArray?: any[];
  onRoadExecutionArray?: any[];
  onRoadHistory?: any[];
  isAdminCreated?: boolean;
  companyName?: string;
  clientName?: string;
  designation?: string;
  gstNumber?: string;
  customerCategory?: string;
}

const getFileUrl = (p: string) => {
  if (!p) return "";
  if (p.startsWith("http")) return p;
  return `http://localhost:3001${p.startsWith("/") ? p : `/${p}`}`;
};

const fmtDatetime = (s?: string) => {
  if (!s) return "—";
  return new Date(s).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

// ─── Photo Card ───────────────────────────────────────────────────────────────
function PhotoCard({ url, label, icon }: { url: string; label: string; icon?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (!url) return null;

  return (
    <>
      <div
        className="relative group cursor-pointer rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 hover:border-sky-400 dark:hover:border-sky-500 transition-all duration-200 shadow-sm hover:shadow-md"
        onClick={() => !hasError && setIsOpen(true)}
      >
        <div className="aspect-square relative">
          {isLoading && !hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <img
            src={url}
            alt={label}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
            onLoad={() => setIsLoading(false)}
            onError={() => { setIsLoading(false); setHasError(true); }}
          />
          {hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800">
              {icon || <Truck className="w-5 h-5 text-gray-400" />}
              <span className="text-[10px] text-gray-400 mt-1">Failed to load</span>
            </div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
          <span className="text-[10px] font-medium text-white flex items-center justify-center gap-1">
            {icon && <span className="inline-flex">{icon}</span>}
            {label}
          </span>
        </div>
        {!hasError && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
              <ZoomIn className="w-4 h-4 text-white" />
            </div>
          </div>
        )}
      </div>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
        >
          <div className="relative max-w-5xl w-full">
            <img
              src={url}
              alt={label}
              className="w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
              onClick={e => e.stopPropagation()}
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
              {icon && <span className="text-white">{icon}</span>}
              <span className="text-sm text-white font-medium">{label}</span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all backdrop-blur-sm"
          >
            <X size={20} />
          </button>
        </div>
      )}
    </>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function OnRoadTab({ order, onRefresh }: { order: Order; onRefresh: () => Promise<void> }) {
  const allEntries = order.onRoadExecutionArray || [];


  const entries = allEntries.filter((e: any) => e.onRoadStatus === 1);
  const history = order.onRoadHistory || [];

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900/30 dark:to-blue-900/30 flex items-center justify-center shadow-inner">
            <Truck className="w-10 h-10 text-sky-400 dark:text-sky-500" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <X className="w-3 h-3 text-gray-500" />
          </div>
        </div>
        <p className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">No Active On Road Vehicles</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center max-w-xs leading-relaxed">
          Vehicles will appear here once their On Road status is enabled in the Project Execution tab.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-sm">
            <Truck size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">On Road Vehicles</h3>
            <p className="text-xs text-gray-500">{entries.length} active vehicle{entries.length > 1 ? "s" : ""}</p>
          </div>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 animate-pulse">
          🟢 {entries.length} On Road
        </span>
      </div>

      {/* Entries */}
      {entries.map((entry: any, idx: number) => (
        <div
          key={entry._id || idx}
          className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
        >
          {/* Top accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-blue-600" />

          {/* Card Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                  {idx + 1}
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-900 animate-pulse" />
              </div>
              <div>
                <span className="text-sm font-bold text-gray-800 dark:text-white">
                  Vehicle {(entry.vehicleIndex ?? idx) + 1}
                </span>
                <span className="ml-2 text-[10px] font-medium text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                  Active
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{fmtDatetime(entry.uploadedAt)}</span>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6 space-y-5">
            {/* Driver + Vehicle Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Driver */}
              <div className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30 rounded-xl p-4 border border-sky-200 dark:border-sky-800">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span className="text-xs font-bold text-sky-700 dark:text-sky-300 uppercase tracking-wide">Driver</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Name</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{entry.driverName || "—"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Phone</span>
                    <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">{entry.driverPhone || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Vehicle */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-3">
                  <Truck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide">Vehicle</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Reg. Number</span>
                    <span className="text-sm font-bold font-mono text-purple-700 dark:text-purple-400">{entry.vehicleRegistrationNumber || "—"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Uploaded By */}
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
              <User className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">
                Recorded by: <span className="font-medium text-gray-700 dark:text-gray-300">{entry.uploadedBy || "System"}</span>
              </span>
            </div>

            {/* Gatepass Photo */}
            {entry.gatepassPhoto && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide text-xs">Gatepass</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xs">
                  <PhotoCard
                    url={getFileUrl(entry.gatepassPhoto)}
                    label="Gate Pass"
                    icon={<FileText className="w-3 h-3" />}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* On Road History */}
      {history.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-100 dark:border-violet-800/50 mb-4">
            <History size={15} className="text-violet-500" />
            <span className="text-sm font-bold text-violet-700 dark:text-violet-300">On Road History</span>
            <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-100 dark:bg-violet-900/40 text-violet-700">
              {history.length} events
            </span>
          </div>

          <div className="space-y-3">
            {[...history].reverse().map((h: any, i: number) => (
              <div key={h._id || i} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50">
                {/* Action Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                    h.action === "created"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  }`}>
                    {h.action === "created" ? <CheckCircle size={11} /> : <Pencil size={11} />}
                    {h.action === "created" ? "Added" : "Edited"}
                  </span>
                  <span className="text-xs text-gray-400">{fmtDatetime(h.changedAt)}</span>
                </div>

                {/* Changed Fields */}
                {h.action === "edited" && Object.keys(h.changedFields || {}).length > 0 && (
                  <div className="mb-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 space-y-1.5">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">Changes:</p>
                    {Object.entries(h.changedFields).map(([field, val]: any) => (
                      <div key={field} className="flex items-center gap-2 text-xs">
                        <span className="font-medium text-gray-600 dark:text-gray-400 w-28 capitalize">
                          {field === "driverName" ? "Driver Name"
                            : field === "driverPhone" ? "Phone"
                            : field === "vehicleRegistrationNumber" ? "Reg. No"
                            : field}:
                        </span>
                        <span className="line-through text-red-500">{val.old || "—"}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-green-600 font-semibold">{val.new}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Snapshot */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gray-400 mb-0.5">Driver</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{h.driverName}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-0.5">Phone</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{h.driverPhone}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-0.5">Reg. Number</p>
                    <p className="font-semibold font-mono text-gray-800 dark:text-gray-200">{h.vehicleRegistrationNumber}</p>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 mt-2">By {h.changedBy}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
