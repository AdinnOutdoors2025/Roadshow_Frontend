

/* eslint-disable */
// @ts-nocheck

"use client";

import {
  X, ChevronRight, ChevronDown, Clock, Phone, Mail,
  MapPin, Hash, User, Tag, Calendar, Building2,
  IndianRupee, ReceiptText, Percent, Download,
  Upload, FileText, CheckCircle2, AlertCircle,
  StickyNote, Eye, Trash2, TrendingDown,
  Car, DollarSign, Search, FileEdit, Handshake,
  Trophy, XCircle, RotateCcw, Star, Truck,
  Megaphone, Route, Clock3, MapPinned, Milestone,
  PlusCircle, MinusCircle, ImageIcon, Video,
  Users, Flame, Package, BadgeCheck, Banknote,
  TrendingUp, AlertTriangle, History, ChevronUp,
  ArrowRight, CheckSquare, Ban,
} from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import axios from "axios";
import { getToken } from "@/utils/auth";
import toast from "react-hot-toast";
import API_BASE from "../../../../../baseurl";
import { SALES_STAGE_MAP, SALES_STAGES, SalesOrder } from "./page";

// ── Formatters ────────────────────────────────────────────────────────────────
const fmt = (n?: number | null) =>
  n != null ? `₹ ${n.toLocaleString("en-IN")}` : "—";

const fmtDatetime = (s?: string) =>
  s
    ? new Date(s).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    })
    : "—";

const getFileUrl = (p: string) => {
  if (!p) return "";
  if (p.startsWith("http")) return p;
  return `http://localhost:3001${p.startsWith("/") ? p : `/${p}`}`;
};

const isImage = (f: string) =>
  /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(f);

// ── Collapsible Section ───────────────────────────────────────────────────────
function Section({
  icon, title, accent, children, defaultOpen = true, badge,
}: {
  icon: React.ReactNode; title: string; accent?: string;
  children: React.ReactNode; defaultOpen?: boolean; badge?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200/60 dark:border-gray-700/50 overflow-hidden shadow-sm">
      <button type="button" onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-2.5 px-5 py-3 bg-gradient-to-r ${accent || "from-gray-50 to-gray-100"} dark:from-gray-800/80 dark:to-gray-800/40 border-b border-gray-100 dark:border-gray-700/50 text-left hover:brightness-95 transition-all`}>
        <span className="text-base">{icon}</span>
        <h3 className="text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex-1">{title}</h3>
        {badge && <span className="mr-1">{badge}</span>}
        <ChevronDown size={15} className={`text-gray-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="p-4 md:p-5 animate-in fade-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Info Chip ─────────────────────────────────────────────────────────────────
function InfoChip({ icon, label, value, highlight, full }: {
  icon?: React.ReactNode; label: string; value: React.ReactNode;
  highlight?: boolean; full?: boolean;
}) {
  return (
    <div className={`${full ? "col-span-2" : ""} ${highlight ? "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700" : "bg-gray-50/80 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50"} rounded-xl p-3.5`}>
      <div className="flex items-center gap-1.5 mb-1.5">
        {icon && <span className="text-gray-400 text-xs">{icon}</span>}
        <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      </div>
      <div className="text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200 break-words">{value}</div>
    </div>
  );
}

// ── Pricing Row ───────────────────────────────────────────────────────────────
function PricingRow({ label, value, highlight, negative, icon }: {
  label: string; value: string; highlight?: boolean; negative?: boolean; icon?: React.ReactNode;
}) {
  return (
    <div className={`flex items-center justify-between py-2.5 px-4 rounded-lg transition-all ${highlight ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700" : "hover:bg-gray-50 dark:hover:bg-gray-800/40"}`}>
      <div className="flex items-center gap-2">
        {icon && <span className="text-gray-400 text-sm">{icon}</span>}
        <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      </div>
      <span className={`text-sm font-bold ${highlight ? "text-blue-700 dark:text-blue-300 text-lg" : negative ? "text-red-600 dark:text-red-400" : "text-gray-800 dark:text-gray-200"}`}>
        {value}
      </span>
    </div>
  );
}

// ── Timeline Item ─────────────────────────────────────────────────────────────
function TimelineItem({ dotColor, children, isLast }: {
  dotColor: string; children: React.ReactNode; isLast: boolean;
}) {
  return (
    <div className="flex items-start gap-3 group">
      <div className="flex flex-col items-center pt-1.5">
        <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${dotColor} ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ring-gray-100 dark:ring-gray-700`} />
        {!isLast && <div className="w-0.5 flex-1 bg-gradient-to-b from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-800 mt-1.5" style={{ minHeight: 24 }} />}
      </div>
      <div className="flex-1 pb-4">{children}</div>
    </div>
  );
}

// ── Drag-drop file input ──────────────────────────────────────────────────────
function DragDropFile({ file, onFile, onRemove, accept = ".pdf,.jpg,.jpeg,.png", label }: {
  file: File | null; onFile: (f: File | null) => void;
  onRemove: () => void; accept?: string; label?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const ext = file?.name.split(".").pop()?.toLowerCase();

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(f);
  }, [onFile]);

  const FileTypeIcon = () => {
    if (ext === "pdf") return <FileText size={18} className="text-blue-500" />;
    if (["jpg", "jpeg", "png"].includes(ext || "")) return <ImageIcon size={18} className="text-blue-500" />;
    return <FileText size={18} className="text-blue-500" />;
  };

  return !file ? (
    <label onDrop={onDrop} onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-all ${dragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50/30"}`}>
      <div className="text-center pointer-events-none">
        <div className="flex justify-center mb-1">
          {dragging
            ? <Upload size={24} className="text-blue-500" />
            : <Upload size={24} className="text-gray-400" />}
        </div>
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{label || "Drag & drop or click to upload"}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">PDF, JPG, PNG</p>
      </div>
      <input ref={ref} type="file" accept={accept} className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] || null)} />
    </label>
  ) : (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700">
      <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
        <FileTypeIcon />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{file.name}</p>
        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
      </div>
      <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(); if (ref.current) ref.current.value = ""; }}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition-all">
        <Trash2 size={14} />
      </button>
    </div>
  );
}

// ── Document Viewer ───────────────────────────────────────────────────────────
function DocItem({ docPath, label, notes, by, at }: {
  docPath: string; label: string; notes?: string; by?: string; at?: string;
}) {
  const [preview, setPreview] = useState(false);
  const url = getFileUrl(docPath);
  const img = isImage(docPath);
  if (!docPath) return null;
  return (
    <>
      {preview && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{label}</p>
              <div className="flex items-center gap-2">
                <a href={url} download target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-sky-600 hover:bg-sky-50 transition-all">
                  <Download size={13} /> Download
                </a>
                <button onClick={() => setPreview(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all">
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="relative" style={{ height: "calc(90vh - 60px)" }}>
              {img ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800/50 p-4">
                  <img src={url} alt={label} className="max-w-full max-h-full object-contain rounded-lg shadow-lg" />
                </div>
              ) : (
                <iframe src={url} className="w-full h-full" title={label} />
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50 hover:shadow-sm transition-all">
        <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
          {img ? <ImageIcon size={16} className="text-blue-500" /> : <FileText size={16} className="text-blue-500" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{label}</p>
          {notes && <p className="text-[15px] text-gray-600 mt-0.5 flex items-center gap-1"><StickyNote size={11} /> {notes}</p>}
          {by && <p className="text-[13px] text-gray-400 mt-0.5">By {by} · {fmtDatetime(at)}</p>}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => setPreview(true)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sky-500 hover:text-sky-700 hover:bg-sky-50 transition-all">
            <Eye size={14} />
          </button>
          <a href={url} download target="_blank" rel="noreferrer"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-green-500 hover:text-green-700 hover:bg-green-50 transition-all">
            <Download size={14} />
          </a>
        </div>
      </div>
    </>
  );
}

// ── Stage Document Upload Form ────────────────────────────────────────────────
function StageUploadForm({
  order, stage, onRefresh,
  docFieldName, notesFieldName, amountFieldName,
  label, accent, showAmount,
}: {
  order: SalesOrder; stage: string; onRefresh: () => Promise<void>;
  docFieldName: string; notesFieldName: string; amountFieldName?: string;
  label: string; accent?: string; showAmount?: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    if (!file && !notes.trim() && !(showAmount && amount)) {
      setError("Please provide a document, notes, or amount");
      return;
    }
    setSaving(true);
    try {
      const token = getToken();
      const fd = new FormData();
      fd.append("stage", stage);
      if (file) fd.append(docFieldName, file);
      if (notes.trim()) fd.append(notesFieldName, notes.trim());
      if (showAmount && amount) fd.append(amountFieldName || "amount", amount);
      await axios.post(`${API_BASE}sales/pipeline/${order._id}/documents`, fd, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`${label} saved!`);
      setFile(null);
      setNotes("");
      setAmount("");
      await onRefresh();
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Something went wrong";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3 mt-3 ${accent || ""}`}>
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
        <PlusCircle size={13} /> Add {label}
      </p>
      <DragDropFile file={file} onFile={setFile} onRemove={() => setFile(null)} label={`Upload ${label} (optional)`} />
      {showAmount && (
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Negotiation Amount <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
            <input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full pl-7 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
        </div>
      )}
      <div>
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
          Notes <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes..."
          className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
      </div>
      {error && (
        <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2 flex items-center gap-1.5">
          <AlertCircle size={13} /> {error}
        </p>
      )}
      <button onClick={handleSave} disabled={saving}
        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold transition-all flex items-center justify-center gap-2">
        {saving ? (
          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
        ) : (
          <><CheckCircle2 size={15} /> Save {label}</>
        )}
      </button>
    </div>
  );
}


import { useVehicle } from './../../../../../src/context/vehicletypecontext';

// ── Vehicle Item Card ─────────────────────────────────────────────────────────
function VehicleItemCard({ item, index }: { item: any; index: number }) {
  const { vehicleTypes, fetchVehicleTypes } = useVehicle();
  const [open, setOpen] = useState(false);

  const getVehicleTypeName = (vehicleTypeId: string) => {
    if (!vehicleTypeId || !vehicleTypes) return "";
    const vehicle: any = vehicleTypes.find((vt: any) => vt._id === vehicleTypeId);
    return vehicle?.typeName || vehicleTypeId;
  };

  useEffect(() => {
    fetchVehicleTypes();
  }, []);

  const campaignLabel = item.campaignType === "Other"
    ? (item.otherCampaignType || "Other")
    : (item.campaignType || "—");

  const promoterTypeLabel = item.promoterType === "Other"
    ? (item.otherPromoterType || "Other")
    : (item.promoterType || "—");

  const drivingRoute = item.fromLocation && item.toLocation
    ? `${item.fromLocation} → ${item.toLocation}`
    : null;

  const locationLabel = [item.state, item.city].filter(Boolean).join(" / ") || "—";

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `http://localhost:3001${path.startsWith('/') ? path : `/${path}`}`;
  };

  const fmtDate = (s: string) =>
    s ? new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-gray-200 dark:border-gray-700 text-left hover:brightness-95 transition-all">
        <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0">V{index + 1}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{getVehicleTypeName(item.vehicleType)}</p>
        </div>
        <div className="text-right mr-2">
          <p className="text-xs text-gray-400">Total</p>
          <p className="text-sm font-bold text-blue-600">{fmt(item.totalAmount)}</p>
        </div>
        <ChevronDown size={15} className={`text-gray-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="p-3 md:p-4 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">

          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {[
              item.bookingFor && { icon: <User size={14} className="text-gray-400" />, label: "Booking For", value: item.bookingFor },
              { icon: <Megaphone size={14} className="text-gray-400" />, label: "Campaign", value: campaignLabel },
              { icon: <Calendar size={14} className="text-gray-400" />, label: "Duration", value: `${fmtDatetime(item.fromDate)} → ${fmtDatetime(item.toDate)} (${item.totalDays} days)` },
              { icon: <MapPin size={14} className="text-gray-400" />, label: "Location", value: locationLabel },
              drivingRoute && { icon: <Route size={14} className="text-gray-400" />, label: "Driving Route", value: drivingRoute },
              item.extraKm && item.extraKm > 0 ? { icon: <Milestone size={14} className="text-gray-400" />, label: "Extra KM", value: `${item.extraKm} km` } : null,
              item.extraHours && item.extraHours > 0 ? { icon: <Clock size={14} className="text-gray-400" />, label: "Extra Hours", value: `${item.extraHours} hrs` } : null,
              item.extraDays && item.extraDays > 0 ? { icon: <Calendar size={14} className="text-gray-400" />, label: "Extra Days", value: `${item.extraDays} days` } : null,
              item.gstNumber ? { icon: <Hash size={14} className="text-gray-400" />, label: "GST Number", value: item.gstNumber } : null,
            ].filter(Boolean).map((field: any, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="flex-shrink-0 mt-0.5">{field.icon}</span>
                <div className="flex-1">
                  <span className="text-gray-400 block text-[12px] font-semibold uppercase tracking-wide">{field.label}</span>
                  <span className="text-gray-800 dark:text-gray-200 font-medium text-xs md:text-sm">{field.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Promoter Details */}
          {item.needPromoter && (
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 border border-purple-200 dark:border-purple-800/50">
              <p className="text-xs font-bold text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-1.5">
                <Users size={13} /> Promoter Details
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-400 block text-[12px] uppercase tracking-wide">Type</span>
                  <span className="text-gray-800 dark:text-gray-200 font-medium">{promoterTypeLabel}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[12px] uppercase tracking-wide">Gender</span>
                  <span className="text-gray-800 dark:text-gray-200 font-medium">{item.promoterGender || "—"}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[12px] uppercase tracking-wide">Language</span>
                  <span className="text-gray-800 dark:text-gray-200 font-medium">{item.promoterLanguage || "—"}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[12px] uppercase tracking-wide">Quantity</span>
                  <span className="text-gray-800 dark:text-gray-200 font-medium">{item.promoterQuantity || 0}</span>
                </div>
              </div>
            </div>
          )}

          {/* Pricing Breakdown per item */}
          <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
            <p className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <IndianRupee size={13} /> Price Breakdown
            </p>
            <div className="space-y-1.5">
              {item.rentalCost ? (
                <div className="flex justify-between items-center py-1 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Rental Charges</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {fmt(item.rentalCost || 0)}
                  </span>
                </div>
              ) : null}

              {item.promoterCost > 0 && (
                <div className="flex justify-between items-center py-1 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Promoter ({item.totalDays}D × {fmt(item.promoterChargePerDay)} × {item.promoterQuantity})
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{fmt(item.promoterCost)}</span>
                </div>
              )}

              {item.rtoCost && item.rtoCost > 0 && (
                <div className="flex justify-between items-center py-1 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">RTO Charges</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{fmt(item.rtoCost)}</span>
                </div>
              )}

              {item.extraKmCost && item.extraKmCost > 0 && (
                <div className="flex justify-between items-center py-1 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Extra KM ({item.extraKm} km × {fmt(item.dailyKmcharges)})
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{fmt(item.extraKmCost)}</span>
                </div>
              )}

              {item.extraHourCost && item.extraHourCost > 0 && (
                <div className="flex justify-between items-center py-1 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Extra Hours ({item.extraHours} hrs × {fmt(item.additionalHourCharges)})
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{fmt(item.extraHourCost)}</span>
                </div>
              )}

              {(item.additionalFields || []).filter((f: any) => f.label).map((f: any, fIdx: number) => (
                <div key={fIdx} className="flex justify-between items-center py-1 text-sm">
                  <span className={f.mode === "-" ? "text-red-500" : "text-gray-500 dark:text-gray-400"}>
                    {f.label}
                  </span>
                  <span className={`font-semibold ${f.mode === "-" ? "text-red-600 dark:text-red-400" : "text-gray-800 dark:text-gray-200"}`}>
                    {f.mode === "-" ? "−" : "+"}{fmt(Number(f.amount))}
                  </span>
                </div>
              ))}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-1">
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Subtotal (excl. GST)</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{fmt(item.subtotal || item.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Media */}
          {((item.campaignImages?.length ?? 0) > 0 || (item.campaignVideos?.length ?? 0) > 0) && (
            <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ImageIcon size={12} /> Campaign Media
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(item.campaignImages || []).map((img: string, imgIdx: number) => (
                  <div key={imgIdx} className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                    onClick={() => window.open(getImageUrl(img), '_blank')}>
                    <img
                      src={getImageUrl(img)}
                      alt={`Campaign ${imgIdx + 1}`}
                      className="w-full h-24 md:h-32 object-cover hover:opacity-90 transition"
                    />
                    <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                      <ImageIcon size={9} /> Image {imgIdx + 1}
                    </span>
                  </div>
                ))}
                {(item.campaignVideos || []).map((vid: string, vidIdx: number) => (
                  <div key={vidIdx} className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                    onClick={() => window.open(getImageUrl(vid), '_blank')}>
                    <video src={getImageUrl(vid)} className="w-full h-24 md:h-32 object-cover" />
                    <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Video size={9} /> Video {vidIdx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Drawer ───────────────────────────────────────────────────────────────
export default function SalesDetailDrawer({
  order, onClose, onRefresh, onStageMove, staffAdmins, currentUserIsAdmin, saving,
}: {
  order: SalesOrder; onClose: () => void; onRefresh: () => Promise<void>;
  onStageMove: (order: SalesOrder, toStage: string) => void;
  staffAdmins: { username: string }[];
  currentUserIsAdmin: number;
  saving: boolean;
}) {
  const stage = SALES_STAGE_MAP[order.salesPipelineStatus];
  const stageIdx = SALES_STAGES.findIndex((s) => s.key === order.salesPipelineStatus);

  // ── Pricing ───────────────────────────────────────────────────────────────
  const subtotal = order.bookingItems.reduce((s: number, i: any) => s + (i.totalAmount || 0), 0);
  const totalNegotiated = (order.salesNegotiationArray || []).reduce((s, n) => s + (n.amount || 0), 0);
  const taxable = subtotal - totalNegotiated;
  const gstAmt = Math.floor(taxable * 0.18);
  const finalAmt = taxable + gstAmt;

  // ── Next stage label ──────────────────────────────────────────────────────
  const getNextLabel = (): string | null => {
    const s = order.salesPipelineStatus;
    if (s === "enquiry") return "Move to Need Analysis";
    if (s === "needAnalysis") return "Move to Proposal";
    if (s === "proposalPriceQuote") return "Move to Negotiation";
    if (s === "negotiationReview") return "Move to Closed Won";
    return null;
  };
  const nextLabel = getNextLabel();

  const nextStageKey = () => {
    const s = order.salesPipelineStatus;
    if (s === "enquiry") return "needAnalysis";
    if (s === "needAnalysis") return "proposalPriceQuote";
    if (s === "proposalPriceQuote") return "negotiationReview";
    if (s === "negotiationReview") return "closedWon";
    return null;
  };

  // ── Is stage visible ──────────────────────────────────────────────────────
  const stageReached = (key: string) => {
    const idx = SALES_STAGES.findIndex((s) => s.key === key);
    return idx <= stageIdx;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900/60 to-black/70 backdrop-blur-md p-2 md:p-4">
      <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 w-full max-w-4xl h-full md:max-h-[90vh] flex flex-col shadow-2xl rounded-xl md:rounded-3xl border border-gray-200/60 dark:border-gray-700/50 overflow-hidden animate-in fade-in zoom-in duration-300">

        {/* ── Header ── */}
        <div className={`relative flex-shrink-0 bg-gradient-to-r ${stage?.headerGrad || "from-slate-700 to-slate-800"} text-white px-4 md:px-6 py-4 md:py-5`}>
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 md:gap-4 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20">
                <stage.icon size={16} className="text-white flex-shrink-0" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h2 className="text-base md:text-xl font-bold tracking-tight">Sales Order</h2>
                  {stage && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-semibold bg-white/20 backdrop-blur-sm border border-white/30 text-white">
                      {stage.label}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-white/70 flex-wrap">
                  <span className="font-mono">{order.orderId}</span>
                  <span className="w-1 h-1 rounded-full bg-white/30 hidden sm:inline" />
                  <Clock size={12} className="hidden sm:inline" />
                  <span className="hidden sm:inline">{fmtDatetime(order.updatedAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Stage progress pills */}
              <div className="hidden lg:flex items-center gap-1">
                {SALES_STAGES.filter(s => !["closedLost"].includes(s.key)).map((s) => (
                  <div key={s.key} className={`h-1.5 rounded-full transition-all ${s.key === order.salesPipelineStatus ? "w-8 bg-white" : stageReached(s.key) ? "w-4 bg-white/60" : "w-4 bg-white/20"}`} />
                ))}
              </div>

              {/* Next stage button */}
              {nextLabel && (
                <button onClick={() => { const ns = nextStageKey(); if (ns) onStageMove(order, ns); }}
                  disabled={saving}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold transition-all disabled:opacity-60">
                  {saving
                    ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><ChevronRight size={13} /> {nextLabel}</>}
                </button>
              )}

              {/* Closed Lost button */}
              {!["closedWon", "closedLost"].includes(order.salesPipelineStatus) && (
                <button onClick={() => onStageMove(order, "closedLost")}
                  className="hidden sm:flex items-center gap-1 px-2.5 py-2 rounded-xl bg-rose-500/30 hover:bg-rose-500/50 backdrop-blur-sm border border-rose-300/30 text-white text-xs font-medium transition-all">
                  <XCircle size={13} /> Lost
                </button>
              )}

              {/* Handler badge */}
              {order.salesHandlerName && (
                <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-xs font-bold">
                    {order.salesHandlerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[10px] text-white/70">Handler</p>
                    <p className="text-xs font-semibold">{order.salesHandlerName}</p>
                  </div>
                </div>
              )}

              <button onClick={onClose}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white flex items-center justify-center transition-all hover:rotate-90 duration-300">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Mobile: next button */}
          {nextLabel && (
            <div className="sm:hidden mt-3 flex gap-2">
              <button onClick={() => { const ns = nextStageKey(); if (ns) onStageMove(order, ns); }}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold transition-all disabled:opacity-60">
                {saving ? "Moving..." : <>{nextLabel} <ChevronRight size={12} /></>}
              </button>
              {!["closedWon", "closedLost"].includes(order.salesPipelineStatus) && (
                <button onClick={() => onStageMove(order, "closedLost")}
                  className="px-3 py-2 rounded-xl bg-rose-500/30 hover:bg-rose-500/50 backdrop-blur-sm border border-rose-300/30 text-white text-xs font-medium transition-all flex items-center gap-1">
                  <XCircle size={13} /> Lost
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto p-3 md:p-5 space-y-3 md:space-y-4">

          {/* 1. Customer Information */}
          <Section
            icon={<User size={14} className="text-blue-500" />}
            title="Customer Information"
            accent="from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
            defaultOpen={false}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
              <InfoChip icon={<Hash size={13} />} label="Order ID" value={order.orderId} />
              <InfoChip icon={<Phone size={13} />} label="Phone" value={`+91 ${order.phone}`} />
              <InfoChip icon={<User size={13} />} label="Name" value={order.name} highlight />
              {order.email && <InfoChip icon={<Mail size={13} />} label="Email" value={order.email} />}
              <InfoChip icon={<Tag size={13} />} label="Customer Type"
                value={<span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${order.customerType === 1 ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
                  {order.customerType === 1 ? "Organization" : order.customerType === 0 ? "Individual" : "Not Set"}
                </span>} />
              {order.address && <InfoChip icon={<MapPin size={13} />} label="Address" value={order.address} />}
              {order.companyName && <InfoChip icon={<Building2 size={13} />} label="Company" value={order.companyName} />}
              {order.gstNumber && <InfoChip icon={<Hash size={13} />} label="GST Number" value={order.gstNumber} />}
              <InfoChip icon={<Calendar size={13} />} label="Created" value={fmtDatetime(order.createdAt)} />
              {order.salesHandlerName && (
                <InfoChip icon={<User size={13} />} label="Sales Handler" value={
                  <span className="text-violet-700 font-semibold">{order.salesHandlerName}</span>
                } />
              )}
            </div>
          </Section>

          {/* 2. Vehicle Bookings */}
          <Section
            icon={<Car size={14} className="text-purple-500" />}
            title="Vehicle Bookings"
            accent="from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
            defaultOpen={false}
            badge={<span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-700">{order.bookingItems.length} vehicle{order.bookingItems.length !== 1 ? "s" : ""}</span>}
          >
            <div className="space-y-3">
              {order.bookingItems.map((item: any, i: number) => (
                <VehicleItemCard key={i} item={item} index={i} />
              ))}
            </div>
          </Section>

          {/* 4. Need Analysis */}
          {stageReached("needAnalysis") && (
            <Section
              icon={<Search size={14} className="text-blue-500" />}
              title="Need Analysis"
              accent="from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20"
              defaultOpen={order.salesPipelineStatus === "needAnalysis"}
              badge={(order.needAnalysisArray || []).length > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700">
                  {order.needAnalysisArray.length} doc{order.needAnalysisArray.length !== 1 ? "s" : ""}
                </span>
              ) : undefined}
            >
              {(order.needAnalysisArray || []).length > 0 ? (
                <div className="space-y-2 mb-2">
                  {order.needAnalysisArray.map((item, i) => (
                    <div key={i}>
                      {item.analysisDocument && (
                        <DocItem docPath={item.analysisDocument} label={`Analysis Doc ${i + 1}`} notes={item.notes} by={item.uploadedBy} at={item.uploadedAt} />
                      )}
                      {!item.analysisDocument && item.notes && (
                        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50">
                          <p className="text-md text-gray-700 dark:text-gray-300">{item.notes}</p>
                          <p className="text-[10px] text-gray-400 mt-1">By {item.uploadedBy} · {fmtDatetime(item.uploadedAt)}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-3">No documents added yet</p>
              )}
              {order.salesPipelineStatus === "needAnalysis" && (
                <StageUploadForm order={order} stage="needAnalysis" onRefresh={onRefresh}
                  docFieldName="analysisDocument" notesFieldName="analysisNotes" label="Analysis Document"
                  accent="bg-blue-50/50 dark:bg-blue-900/10" />
              )}
            </Section>
          )}

          {/* 5. Proposal */}
          {stageReached("proposalPriceQuote") && (
            <Section
              icon={<FileEdit size={14} className="text-violet-500" />}
              title="Proposal & Price Quote"
              accent="from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20"
              defaultOpen={order.salesPipelineStatus === "proposalPriceQuote"}
              badge={(order.proposalArray || []).length > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-100 text-violet-700">
                  {order.proposalArray.length} doc{order.proposalArray.length !== 1 ? "s" : ""}
                </span>
              ) : undefined}
            >
              {(order.proposalArray || []).length > 0 ? (
                <div className="space-y-2 mb-2">
                  {order.proposalArray.map((item, i) => (
                    <div key={i}>
                      {item.proposalDocument && (
                        <DocItem docPath={item.proposalDocument} label={`Proposal Doc ${i + 1}`} notes={item.notes} by={item.uploadedBy} at={item.uploadedAt} />
                      )}
                      {!item.proposalDocument && item.notes && (
                        <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800/50">
                          <p className="text-sm text-gray-700 dark:text-gray-300">{item.notes}</p>
                          <p className="text-[10px] text-gray-400 mt-1">By {item.uploadedBy} · {fmtDatetime(item.uploadedAt)}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-3">No proposals added yet</p>
              )}
              {order.salesPipelineStatus === "proposalPriceQuote" && (
                <StageUploadForm order={order} stage="proposalPriceQuote" onRefresh={onRefresh}
                  docFieldName="proposalDocument" notesFieldName="proposalNotes" label="Proposal Document"
                  accent="bg-violet-50/50 dark:bg-violet-900/10" />
              )}
            </Section>
          )}

          {/* 6. Negotiation & Review */}
          {stageReached("negotiationReview") && (
            <Section
              icon={<Handshake size={14} className="text-amber-500" />}
              title="Negotiation & Review"
              accent="from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20"
              defaultOpen={order.salesPipelineStatus === "negotiationReview"}
              badge={(order.salesNegotiationArray || []).length > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700">
                  {order.salesNegotiationArray.length} entry
                </span>
              ) : undefined}
            >
              {(order.salesNegotiationArray || []).length > 0 ? (
                <div className="space-y-2 mb-2">
                  {order.salesNegotiationArray.map((item, i) => (
                    <div key={i} className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[15px] font-bold text-amber-700">Negotiation {i + 1}</p>
                        {item.amount > 0 && <span className="text-sm font-bold text-red-600">−{fmt(item.amount)}</span>}
                      </div>
                      {item.notes && <p className="text-[13px] text-gray-600 dark:text-gray-400 mb-1">{item.notes}</p>}
                      <p className="text-[13px] text-gray-400">By {item.uploadedBy} · {fmtDatetime(item.uploadedAt)}</p>
                      {item.document && <DocItem docPath={item.document} label={`Negotiation Doc ${i + 1}`} />}
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800/50">
                    <span className="text-xs font-bold text-red-700 flex items-center gap-1.5"><TrendingDown size={13} /> Total Negotiated</span>
                    <span className="text-base font-bold text-red-700">−{fmt(totalNegotiated)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-3">No negotiations yet</p>
              )}
              {order.salesPipelineStatus === "negotiationReview" && (
                <StageUploadForm order={order} stage="negotiationReview" onRefresh={onRefresh}
                  docFieldName="negotiationDocument" notesFieldName="negotiationNotes" amountFieldName="amount"
                  label="Negotiation Entry" showAmount accent="bg-amber-50/50 dark:bg-amber-900/10" />
              )}
            </Section>
          )}

          {/* 7. Closed Won */}
          {stageReached("closedWon") && order.salesPipelineStatus === "closedWon" && (
            <Section
              icon={<Trophy size={14} className="text-green-500" />}
              title="Closed Won — PO Documents"
              accent="from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
              defaultOpen={true}
            >
              {(order.closedWonArray || []).length > 0 ? (
                <div className="space-y-2">
                  {order.closedWonArray.map((item, i) => (
                    <DocItem key={i} docPath={item.salesPoDocument} label={`Sales PO Document ${i + 1}`} notes={item.salesPoNotes} by={item.uploadedBy} at={item.uploadedAt} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-3">No PO documents</p>
              )}
            </Section>
          )}

          {/* 3. Pricing Breakdown */}
          <Section
            icon={<IndianRupee size={14} className="text-green-500" />}
            title="Pricing Breakdown"
            accent="from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
            defaultOpen={true}
          >
            <div className="space-y-1">
              <PricingRow label="Subtotal" value={fmt(subtotal)} icon={<IndianRupee size={15} />} />
              {totalNegotiated > 0 && (
                <PricingRow label="Total Negotiated Amount" value={`− ${fmt(totalNegotiated)}`} icon={<TrendingDown size={15} />} negative />
              )}
              <PricingRow label="Taxable Amount" value={fmt(taxable)} icon={<ReceiptText size={15} />} />
              <PricingRow label="GST (18%)" value={fmt(gstAmt)} icon={<Percent size={15} />} />
            </div>
            <div className="mt-4 p-5 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700/50">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center shadow-lg mr-3">
                  <Banknote size={22} className="text-white" />
                </div>
                <div className="flex-1 text-right">
                  <p className="text-[10px] text-green-600 font-semibold uppercase tracking-wider mb-1">Final Amount</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{fmt(finalAmt)}</p>
                </div>
              </div>
            </div>
          </Section>

          {/* 8. Closed Lost */}
          {order.salesPipelineStatus === "closedLost" && (order.closedLostArray || []).length > 0 && (
            <Section
              icon={<XCircle size={14} className="text-rose-500" />}
              title="Closed Lost — Reason"
              accent="from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20"
              defaultOpen={true}
            >
              {order.closedLostArray.map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 space-y-2">
                  <p className="text-sm font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle size={13} /> Reason:
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{item.reason}</p>
                  <p className="text-[10px] text-gray-400">By {item.uploadedBy} · {fmtDatetime(item.uploadedAt)}</p>
                  {item.document && <DocItem docPath={item.document} label="Supporting Document" />}
                </div>
              ))}
            </Section>
          )}

          {/* 9. Pipeline History */}
          <Section
            icon={<History size={14} className="text-violet-500" />}
            title="Pipeline History"
            accent="from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20"
            defaultOpen={false}
            badge={<span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-100 text-violet-700">{(order.salesPipelineLogs || []).length} events</span>}
          >
            <div className="space-y-0">
              {[...(order.salesPipelineLogs || [])].reverse().map((log, i, arr) => {
                const toS = SALES_STAGE_MAP[log.toStage];
                const fromLabel = log.fromStage ? (SALES_STAGE_MAP[log.fromStage]?.label || log.fromStage) : "Start";
                return (
                  <TimelineItem key={i} dotColor={toS?.headerGrad || "from-gray-400 to-gray-500"} isLast={i === arr.length - 1}>
                    <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-3 border border-gray-100 dark:border-gray-700/50 hover:shadow-sm transition-all">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {log.fromStage ? `${fromLabel} → ${toS?.label || log.toStage}` : `Started at ${toS?.label || log.toStage}`}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400 flex-wrap">
                        <span>By {log.movedBy}</span>
                        {log.handlerName && <><span>·</span><span>Handler: {log.handlerName}</span></>}
                        <span>·</span>
                        <span>{fmtDatetime(log.movedAt)}</span>
                      </div>
                    </div>
                  </TimelineItem>
                );
              })}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

