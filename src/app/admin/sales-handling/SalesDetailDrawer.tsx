/* eslint-disable */
// @ts-nocheck

"use client";

import {
  X, ChevronRight, ChevronDown, Clock, Phone, Mail,
  MapPin, Hash, User, Tag, Calendar, Building2,
  IndianRupee, ReceiptText, Percent, Download,
  Upload, FileText, CheckCircle2, AlertCircle,
  StickyNote, Eye, Trash2, TrendingDown,
  Car, Search, FileEdit, Handshake,
  Trophy, XCircle, Milestone,
  PlusCircle, ImageIcon, Video,
  Users, BadgeCheck, Banknote,
  AlertTriangle, History, MoreHorizontal,
  MessageSquare, RotateCcw, CheckCheck, UserCog,
} from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import axios from "axios";
import { getToken } from "../../utils/auth";
import { jwtDecode } from "jwt-decode";
import toast, { Toaster } from "react-hot-toast";
import API_BASE from "../../../../baseurl";
import { SALES_STAGE_MAP, SALES_STAGES, SalesOrder } from "./page";
import {
  FiClipboard, FiSearch, FiFileText, FiRepeat,
  FiCheckCircle, FiCode, FiXCircle,
} from "react-icons/fi";
import CodeCreationTab from "./CodeCreationTab";
import DatePicker from "../../utils/datepicker";
import { useVehicle } from '../../../context/vehicletypecontext';


// ── File size limits ──────────────────────────────────────────────────────────
const IMAGE_MIMES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const IMAGE_MAX_MB = 5;
const DOC_MAX_MB = 10;

const validateFileSize = (file: File): string | null => {
  const isImage = IMAGE_MIMES.includes(file.type);
  const maxMB = isImage ? IMAGE_MAX_MB : DOC_MAX_MB;
  const fileMB = file.size / (1024 * 1024);
  if (fileMB > maxMB) {
    return isImage
      ? `Image size ${fileMB.toFixed(2)} MB exceeds the ${IMAGE_MAX_MB} MB limit`
      : `Document size ${fileMB.toFixed(2)} MB exceeds the ${DOC_MAX_MB} MB limit`;
  }
  return null;
};



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

const fmtRelative = (s?: string) => {
  if (!s) return "";
  const diff = Date.now() - new Date(s).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};


const formatINR = (value: string | number) => {
  const num = parseFloat(String(value).replace(/[^0-9.]/g, ""));
  if (isNaN(num) || value === "" || value === undefined) return "";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
};

const fmtStageDuration = (s?: string) => {
  if (!s) return "—";
  const diff = Date.now() - new Date(s).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m in Current Stage`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m in Current Stage`;
  return `${Math.floor(hrs / 24)}d ${hrs % 24}h in Current Stage`;
};

// const getFileUrl = (p: string) => {
//   if (!p) return "";
//   if (p.startsWith("http")) return p;
//   return `http://localhost:3001${p.startsWith("/") ? p : `/${p}`}`;
// };

const getFileUrl = (p: string) => {
  if (!p) return "";
  if (p.startsWith("http")) return p;
  const path = p.startsWith("/") ? p : `/${p}`;

  const encodedPath = path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `http://localhost:3001${encodedPath}`;
};

const isImage = (f: string) => /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(f);


type Tab = "overview" | "comments" | "pipeline" | "documents" | "codeCreation" | "invoice" | "dateConflict" | "orderEditHistory";

function DocPreviewModal({ url, label, onClose }: { url: string; label: string; onClose: () => void }) {
  const img = isImage(url);
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{label}</p>
          <div className="flex items-center gap-2">
            <a href={url} download target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-sky-600 hover:bg-sky-50 transition-all">
              <Download size={13} /> Download
            </a>
            <button onClick={onClose}
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
  );
}


function DocItem({ docPath, label, notes, by, at }: {
  docPath: string; label: string; notes?: string; by?: string; at?: string;
}) {
  const [preview, setPreview] = useState(false);
  const url = getFileUrl(docPath);
  if (!docPath) return null;
  return (
    <>
      {preview && <DocPreviewModal url={url} label={label} onClose={() => setPreview(false)} />}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50 hover:shadow-sm transition-all">
        <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
          {isImage(docPath) ? <ImageIcon size={16} className="text-blue-500" /> : <FileText size={16} className="text-blue-500" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{label}</p>
          {notes && <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1"><StickyNote size={15} /> {notes}</p>}
          {by && <p className="text-[13px] text-gray-400 mt-0.5">By {by} · {fmtDatetime(at)}</p>}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => setPreview(true)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sky-500 hover:bg-sky-50 transition-all">
            <Eye size={14} />
          </button>
          <a href={url} download target="_blank" rel="noreferrer"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-green-500 hover:bg-green-50 transition-all">
            <Download size={14} />
          </a>
        </div>
      </div>
    </>
  );
}


function DragDropFile({ file, onFile, onRemove, accept = ".pdf,.jpg,.jpeg,.png", label }: {
  file: File | null; onFile: (f: File | null) => void;
  onRemove: () => void; accept?: string; label?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const ext = file?.name.split(".").pop()?.toLowerCase();

  // const onDrop = useCallback((e: React.DragEvent) => {
  //   e.preventDefault(); setDragging(false);
  //   const f = e.dataTransfer.files?.[0];
  //   if (f) onFile(f);
  // }, [onFile]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) {
      const err = validateFileSize(f);
      if (err) { toast.error(err); return; }
      onFile(f);
    }
  }, [onFile]);

  return !file ? (
    <label onDrop={onDrop} onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-all ${dragging ? "border-blue-500 bg-blue-50" : "border-gray-200 dark:border-gray-600 hover:border-blue-300 hover:bg-blue-50/30"}`}>
      <Upload size={20} className={dragging ? "text-blue-500 mb-1" : "text-gray-300 mb-1"} />
      <p className="text-xs text-gray-400">{label || "Click or drag to upload"}</p>
      <p className="text-[10px] text-gray-300 mt-0.5">PDF, JPG, PNG</p>
      <input ref={ref} type="file" accept={accept} className="hidden"
        // onChange={(e) => onFile(e.target.files?.[0] || null)} />
        onChange={(e) => {
          const f = e.target.files?.[0] || null;
          if (f) {
            const err = validateFileSize(f);
            if (err) { toast.error(err); e.target.value = ""; return; }
          }
          onFile(f);
        }} />
    </label>
  ) : (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200">
      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
        {ext === "pdf" ? <FileText size={15} className="text-blue-500" /> : <ImageIcon size={15} className="text-blue-500" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{file.name}</p>
        <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
      </div>
      <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(); if (ref.current) ref.current.value = ""; }}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 transition-all">
        <Trash2 size={13} />
      </button>
    </div>
  );
}


function StageUploadForm({
  order, stage, onRefresh,
  docFieldName, notesFieldName, amountFieldName,
  label, showAmount,
}: {
  order: SalesOrder; stage: string; onRefresh: () => Promise<void>;
  docFieldName: string; notesFieldName: string; amountFieldName?: string;
  label: string; showAmount?: boolean;
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
      setFile(null); setNotes(""); setAmount("");
      await onRefresh();
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Something went wrong";
      setError(msg); toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3 mt-3">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
        <PlusCircle size={12} /> Add {label}
      </p>
      <DragDropFile file={file} onFile={setFile} onRemove={() => setFile(null)} />
      {showAmount && (
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
            Negotiation Amount <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
            <input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full pl-7 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
        </div>
      )}
      <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
        placeholder="Add notes (optional)..."
        className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
      {error && (
        <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2 flex items-center gap-1.5">
          <AlertCircle size={12} /> {error}
        </p>
      )}
      <button onClick={handleSave} disabled={saving}
        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold transition-all flex items-center justify-center gap-2">
        {saving ? (
          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
        ) : (
          <><CheckCircle2 size={14} /> Save {label}</>
        )}
      </button>
    </div>
  );
}


function VehicleItemCard({ item, index }: { item: any; index: number }) {
  const [open, setOpen] = useState(false);
  const fmtDate = (s: string) =>
    s ? new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const campaignLabel = item.campaignType === "Other"
    ? (item.otherCampaignType || "Other") : (item.campaignType || "—");
  const drivingRoute = item.campaignLocation || (item.fromLocation && item.toLocation
    ? `${item.fromLocation} → ${item.toLocation}` : null);
  const locationLabel = [item.state, item.city].filter(Boolean).join(" / ") || "—";

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const p = path.startsWith('/') ? path : `/${path}`;
    const encodedPath = p
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');
    return `http://localhost:3001${encodedPath}`;
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-left hover:brightness-95 transition-all">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0">
          V{index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">Vehicle {index + 1}</p>
          <p className="text-xs text-gray-500">{campaignLabel}</p>
        </div>
        <p className="text-sm font-bold text-blue-600 mr-2">{fmt(item.totalAmount)}</p>
        <ChevronDown size={14} className={`text-gray-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="p-3 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { label: "Campaign", value: campaignLabel },
              { label: "Location", value: locationLabel },
              item.fromDate && { label: "Duration", value: `${fmtDate(item.fromDate)} → ${fmtDate(item.toDate)} (${item.totalDays}d)` },
              drivingRoute && { label: "Campaign Location", value: drivingRoute },
              item.extraKm > 0 && { label: "Extra KM", value: `${item.extraKm} km` },
              item.extraHours > 0 && { label: "Extra Hours", value: `${item.extraHours} hrs` },
            ].filter(Boolean).map((f: any, i) => (
              <div key={i}>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{f.label}</p>
                <p className="text-gray-800 dark:text-gray-200 font-medium">{f.value}</p>
              </div>
            ))}
          </div>
          {/* Price breakdown */}
          <div className="border-t border-gray-100 dark:border-gray-700 pt-2 space-y-1">
            {item.rentalCost > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Rental</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{fmt(item.rentalCost)}</span>
              </div>
            )}
            {item.promoterCost > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Promoter</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{fmt(item.promoterCost)}</span>
              </div>
            )}
            {item.rtoCost > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">RTO</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{fmt(item.rtoCost)}</span>
              </div>
            )}
            {(item.additionalFields || []).filter((f: any) => f.label).map((f: any, i: number) => (
              <div key={i} className="flex justify-between text-xs">
                <span className={f.mode === "-" ? "text-red-500" : "text-gray-500"}>{f.label}</span>
                <span className={`font-semibold ${f.mode === "-" ? "text-red-600" : "text-gray-800 dark:text-gray-200"}`}>
                  {f.mode === "-" ? "−" : "+"}{fmt(Number(f.amount))}
                </span>
              </div>
            ))}
            <div className="flex justify-between text-xs font-bold pt-1 border-t border-gray-100 dark:border-gray-700">
              <span className="text-gray-700 dark:text-gray-300">Total</span>
              <span className="text-blue-600">{fmt(item.totalAmount)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}





import PipelineHistoryTab from "./PipelineHistoryTab";
import { ChevronLeft } from "lucide-react";
import DateConflictTab from "./DateConflictTab";
import AdminOrderForm from "../order-creation/AdminOrderForm";
import OrderEditHistoryTab from "./OrderEditHistoryTab";


function OverviewTab({
  order, onRefresh, onStageMove, getVehicleTypeName, onOpenHandover, onResolveHandover,
}: {
  order: SalesOrder; onRefresh: () => Promise<void>;
  onStageMove: (order: SalesOrder, toStage: string) => void;
  getVehicleTypeName: any;
  onOpenHandover?: () => void;
  onResolveHandover?: (assignmentId: string, makePermanent: boolean) => void;
}) {

  const [activeVehicleTab, setActiveVehicleTab] = useState<number>(0);
  const [showHandoverHistory, setShowHandoverHistory] = useState(false);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  const handlerAssignmentHistory: any[] = (order as any).handlerAssignmentHistory || [];
  const activeTemporaryHandover = handlerAssignmentHistory.find(
    (h: any) => h.status === "active" && h.isTemporary
  );



  const stageIdx = SALES_STAGES.findIndex((s) => s.key === order.salesPipelineStatus);
  const stage = SALES_STAGE_MAP[order.salesPipelineStatus];
  const subtotal = order.bookingItems.reduce((s: number, i: any) => s + (i.totalAmount || 0), 0);
  const totalNegotiated = (order.salesNegotiationArray || []).reduce((s, n) => s + (n.amount || 0), 0);
  const taxable = subtotal - totalNegotiated;
  const gstAmt = Math.floor(taxable * 0.18);
  const finalAmt = taxable + gstAmt;




  const currentVehicle = order.bookingItems[activeVehicleTab];


  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsContainerRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = tabsContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      tabsContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };


  useEffect(() => {
    if (tabsContainerRef.current) {
      const activeTabElement = tabsContainerRef.current.children[activeVehicleTab] as HTMLElement;
      if (activeTabElement) {
        activeTabElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [activeVehicleTab]);


  const baseDays =
  Math.ceil(
    (new Date(currentVehicle.toDate).getTime() -
      new Date(currentVehicle.fromDate).getTime()) /
      86400000
  ) + 1;

  return (
    <div className="p-4 space-y-4">

      <div className="rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
          <User size={16} className="text-gray-400" />
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Customer Details</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Order ID</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{order.orderId}</p>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Customer Name</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{order.name}</p>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Customer Type</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {order.customerType === 1 ? "Organization" : order.customerType === 0 ? "Individual" : "—"}
              </p>
            </div>

            <div>
              <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Phone</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">+91 {order.phone}</p>
            </div>
            {order.email && (
              <div>
                <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Email</p>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{order.email}</p>
              </div>
            )}
            {order.address && (
              <div className="col-span-2">
                <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Address</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{order.address}</p>
              </div>
            )}
            {order.companyName && (
              <div>
                <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Company Name</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{order.companyName}</p>
              </div>
            )}
            {order.gstNumber && (
              <div>
                <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Gst Number</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{order.gstNumber}</p>
              </div>
            )}
            {order.designation && (
              <div>
                <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Designation</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{order.designation}</p>
              </div>
            )}
            <div>
              <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Order Created At</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{fmtDatetime(order.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Handler Assignment */}
      {order.salesPipelineStatus !== "enquiry" && (
      <div className="rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <UserCog size={15} className="text-gray-400" />
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Handler Assignment</h3>
          </div>
          {onOpenHandover && (
            <button
              onClick={onOpenHandover}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-violet-400 hover:text-violet-600 text-[12px] font-semibold"
            >
              <RotateCcw size={12} /> Reassign
            </button>
          )}
        </div>
        <div className="p-4 space-y-3">
          {order.salesHandlerName ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {order.salesHandlerName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{order.salesHandlerName}</p>
                {activeTemporaryHandover && (
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Temporary handover</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No handler assigned yet</p>
          )}

          {activeTemporaryHandover && (
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <p className="text-[11px] text-amber-700 dark:text-amber-300">
                Covering for <span className="font-semibold">{activeTemporaryHandover.previousHandler}</span> (
                {activeTemporaryHandover.leaveStartDate ? fmtDatetime(activeTemporaryHandover.leaveStartDate).split(",")[0] : ""}
                {" – "}
                {activeTemporaryHandover.leaveEndDate ? fmtDatetime(activeTemporaryHandover.leaveEndDate).split(",")[0] : ""})
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <button
                  onClick={() => onResolveHandover?.(activeTemporaryHandover._id, false)}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-md bg-white dark:bg-gray-800 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 text-[10px] font-semibold"
                >
                  <RotateCcw size={10} /> Return
                </button>
                <button
                  onClick={() => onResolveHandover?.(activeTemporaryHandover._id, true)}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-semibold"
                >
                  <CheckCheck size={10} /> Make Permanent
                </button>
              </div>
            </div>
          )}

          {handlerAssignmentHistory.length > 0 && (
            <button
              onClick={() => setShowHandoverHistory((v) => !v)}
              className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600"
            >
              <History size={11} /> Handover history ({handlerAssignmentHistory.length})
            </button>
          )}
          {showHandoverHistory && (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-0.5">
              {handlerAssignmentHistory.slice().reverse().map((h: any) => {
                const statusStyle =
                  h.status === "madePermanent"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800"
                    : h.status === "reverted"
                      ? "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                      : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800";
                const statusLabel =
                  h.status === "madePermanent" ? "Made Permanent"
                    : h.status === "reverted" ? "Reverted"
                      : "Active";
                return (
                  <div
                    key={h._id}
                    className="rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/40 p-2.5"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800 dark:text-gray-200">
                        <span>{h.previousHandler || "—"}</span>
                        <ChevronRight size={13} className="text-gray-400 flex-shrink-0" />
                        <span>{h.newHandler}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded-md text-[11px] font-medium border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                          {h.isTemporary ? "Temporary" : "Permanent"}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded-md text-[11px] font-semibold border ${statusStyle}`}>
                          {statusLabel}
                        </span>
                      </div>
                    </div>
                    <p className="text-[13px] text-gray-600 dark:text-gray-300 mt-1.5">{h.reason}</p>
                    <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-1">
                      {fmtDatetime(h.assignedAt)} · by {h.assignedBy}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      )}


      <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">

        <div className="relative flex items-center bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">

          <button
            onClick={() => scrollTabs('left')}
            className="absolute left-0 z-10 flex items-center justify-center w-8 h-full bg-gradient-to-r from-gray-50 dark:from-gray-800/50 to-transparent hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all disabled:opacity-30"
            style={{ left: 0 }}
          >
            <ChevronLeft size={18} className="text-gray-600 dark:text-gray-400" />
          </button>


          <div
            ref={tabsContainerRef}
            className="flex overflow-x-auto scrollbar-hide gap-1 px-8"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
            {order.bookingItems.map((vehicle: any, idx: number) => {
              const vehicleCount = vehicle.quantity;
              const vehicleName = getVehicleTypeName(vehicle.vehicleType);
              const campaignName = vehicle.campaignType === "Other" ? vehicle.otherCampaignType : vehicle.campaignType;

              return (
                <button
                  key={idx}
                  onClick={() => setActiveVehicleTab(idx)}
                  className={`
              flex-shrink-0 flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all whitespace-nowrap
              ${activeVehicleTab === idx
                      ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }
            `}
                >
                  <span className="flex items-center justify-center w-10 h-6 text-sm font-bold text-blue-600">
                    {idx + 1} vehicle
                  </span>
                </button>
              );
            })}
          </div>


          <button
            onClick={() => scrollTabs('right')}
            className="absolute right-0 z-10 flex items-center justify-center w-8 h-full bg-gradient-to-l from-gray-50 dark:from-gray-800/50 to-transparent hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all"
            style={{ right: 0 }}
          >
            <ChevronRight size={18} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>


        {currentVehicle && (
          <div className="p-4 space-y-3">

            <div className="space-y-1.5 bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg">
              {(
                [
                  ["Vehicle Model", getVehicleTypeName(currentVehicle.vehicleType)], // Fixed: changed 'vehicle' to 'currentVehicle'
                  ["Booking For", order.customerCategory],
                  (currentVehicle.campaignType === "Other" ? currentVehicle.otherCampaignType : currentVehicle.campaignType)
                    ? ["Campaign", currentVehicle.campaignType === "Other" ? currentVehicle.otherCampaignType : currentVehicle.campaignType]
                    : null,
                  [
                    "Duration",
                    currentVehicle.fromDate && currentVehicle.toDate
                      ? `${new Date(currentVehicle.fromDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })} → ${new Date(currentVehicle.toDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })} (${baseDays}D base${currentVehicle.extraDays > 0
                        ? ` +${currentVehicle.extraDays}D = ${baseDays + currentVehicle.extraDays
                        }D total`
                        : ""
                      })`
                      : "—",
                  ],
              ["Campaign Location", currentVehicle.campaignLocation || `${currentVehicle.fromLocation} → ${currentVehicle.toLocation}`],
              (currentVehicle.state || currentVehicle.city) ? ["State / City", `${currentVehicle.state || ""} / ${currentVehicle.city || ""}`] : null,
              ["Vehicle Count", `${currentVehicle.quantity} ${currentVehicle.quantity === 1 ? "Vehicle" : "Vehicles"}`],
                  currentVehicle.extraKm > 0 ? ["Extra KM", `${currentVehicle.extraKm} km`] : null,
                  currentVehicle.extraHours > 0 ? ["Extra Hours", `${currentVehicle.extraHours} hours`] : null,
              currentVehicle.needPromoter ? ["Promoter", `${currentVehicle.promoterType === "Other" ? currentVehicle.otherPromoterType : currentVehicle.promoterType} · ${currentVehicle.promoterGender} · ${currentVehicle.promoterLanguage} · Qty ${currentVehicle.promoterQuantity}`] : null,
              currentVehicle.gstNumber ? ["GST", currentVehicle.gstNumber] : null,
              ] as ([string, string] | null)[]
              )
                .filter((item): item is [string, string] => item !== null)
                .map(([label, value], i) => (
              <div key={i} className="flex justify-between text-md gap-4">
                <span className="text-gray-500 shrink-0">{label}</span>
                <span className="text-gray-800 dark:text-gray-200 font-medium text-right">{value}</span>
              </div>
              ))
              }
            </div>


            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <p className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <IndianRupee size={14} />
                Price Breakdown
              </p>
              <div className="space-y-2">
                {currentVehicle.rentalCost > 0 && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600 dark:text-gray-400 text-md">
                      Rental ({currentVehicle.totalDays}D × {formatINR(currentVehicle.perDayRentalCost)} × {currentVehicle.quantity})
                    </span>
                    <span className="text-gray-800 dark:text-gray-200 font-medium">
                      {formatINR(currentVehicle.rentalCost)}
                    </span>
                  </div>
                )}

                {(currentVehicle.promoterCost ?? 0) > 0 && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600 dark:text-gray-400 text-md">
                      Promoter Charges ({currentVehicle.totalDays}D × {formatINR(currentVehicle.promoterChargePerDay)} × {currentVehicle.promoterQuantity})
                    </span>
                    <span className="text-gray-800 dark:text-gray-200 font-medium">
                      {formatINR(currentVehicle.promoterCost)}
                    </span>
                  </div>
                )}

                {(currentVehicle.rtoCost ?? 0) > 0 && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600 dark:text-gray-400 text-md">RTO Charges</span>
                    <span className="text-gray-800 dark:text-gray-200 font-medium">
                      {formatINR(currentVehicle.rtoCost)}
                    </span>
                  </div>
                )}

                {(currentVehicle.extraKmCost ?? 0) > 0 && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600 dark:text-gray-400 text-md">
                      Extra KM Charges ({currentVehicle.extraKm} km × {formatINR(currentVehicle.dailyKmcharges)})
                    </span>
                    <span className="text-gray-800 dark:text-gray-200 font-medium">
                      {formatINR(currentVehicle.extraKmCost)}
                    </span>
                  </div>
                )}

                {(currentVehicle.extraHourCost ?? 0) > 0 && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600 dark:text-gray-400 text-md">
                      Extra Hours Charges ({currentVehicle.extraHours} hrs × {formatINR(currentVehicle.additionalHourCharges)})
                    </span>
                    <span className="text-gray-800 dark:text-gray-200 font-medium">
                      {formatINR(currentVehicle.extraHourCost)}
                    </span>
                  </div>
                )}

                {(currentVehicle.additionalFields || []).filter((c: any) => c.label).map((c: any, fIdx: number) => (
                  <div key={fIdx} className="flex justify-between items-center py-1">
                    <span className={c.mode === "-" ? "text-red-500 text-md" : "text-gray-600 dark:text-gray-400 text-md"}>
                      {c.label}
                    </span>
                    <span className={c.mode === "-" ? "text-red-600 font-medium" : "text-gray-800 dark:text-gray-200 font-medium"}>
                      {c.mode === "-" ? "-" : "+"}
                      {formatINR(c.amount)}
                    </span>
                  </div>
                ))}

                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-700 dark:text-gray-300 font-semibold text-md">Subtotal</span>
                    <span className="text-gray-900 dark:text-white font-bold text-base">
                      {formatINR(currentVehicle.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-900 dark:text-white font-bold text-md">Total (excl. GST)</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                      {formatINR(currentVehicle.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Overall Price Breakdown */}
      <div className="rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
          <IndianRupee size={13} className="text-gray-400" />
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider"> Price Breakdown</h3>
        </div>
        <div className="p-4">
          <table className="w-full text-md">
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              <tr className=" border-t border-gray-200 dark:border-gray-700">
                <td colSpan={2} className="py-2 text-gray-500 font-medium ">Subtotal (Excl. GST)</td>
                <td className="py-2 text-right font-bold text-gray-800 dark:text-gray-200">{fmt(subtotal)}</td>
              </tr>
              <tr>
                <td colSpan={2} className="py-1.5 text-gray-500">Taxable Amount</td>
                <td className="py-1.5 text-right font-bold text-gray-800 dark:text-gray-200">{fmt(taxable)}</td>
              </tr>
              <tr>
                <td colSpan={2} className="py-1.5 text-gray-500">GST (18%)</td>
                <td className="py-1.5 text-right font-bold text-gray-800 dark:text-gray-200">{fmt(gstAmt)}</td>
              </tr>
              <tr className="border-t-2 border-red-100 dark:border-red-900/30">
                <td colSpan={2} className="py-2 text-red-600 font-bold">Final Amount</td>
                <td className="py-2 text-right font-bold text-red-600 text-base">{fmt(finalAmt)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Closed Lost */}
      {order.salesPipelineStatus === "closedLost" && (order.closedLostArray || []).length > 0 && (
        <div className="rounded-xl border border-rose-100 dark:border-rose-800/50 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 dark:bg-rose-900/20 border-b border-rose-100 dark:border-rose-800/50">
            <XCircle size={13} className="text-rose-500" />
            <h3 className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">Closed Lost — Reason</h3>
          </div>
          <div className="p-4 space-y-2">
            {order.closedLostArray.map((item, i) => (
              <div key={i} className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200/50">
                <p className="text-sm font-semibold text-rose-700 flex items-center gap-1.5 mb-1">
                  <AlertTriangle size={12} /> Reason:
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{item.reason}</p>
                <p className="text-xs text-gray-400 mt-1">By {item.uploadedBy} · {fmtDatetime(item.uploadedAt)}</p>
                {item.document && <div className="mt-2"><DocItem docPath={item.document} label="Supporting Document" /></div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


function CommentsTab({ order, onRefresh }: { order: SalesOrder; onRefresh: () => Promise<void> }) {
  const [comment, setComment] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);


  const [showNameModal, setShowNameModal] = useState(false);
  const [enquiryName, setEnquiryName] = useState(order.enquiryName || "");
  const [nameInput, setNameInput] = useState("");
  const [nameError, setNameError] = useState("");
  const [savingName, setSavingName] = useState(false);

  const isEnquiry = order.salesPipelineStatus === "enquiry";
  const [commentsTab, setCommentsTab] = useState("all");


  const allComments: Array<{
    text: string; by: string; at: string; stage: string; stageGroup: string; docPath?: string;
  }> = [];

  (order.enquiryArray || []).forEach((item) => {
    if (item.notes || item.document) {
      allComments.push({
        text: item.notes || "",
        by: item.uploadedBy || "—",
        at: item.uploadedAt,
        stage: "Enquiry",
        stageGroup: "enquiry",
        docPath: item.document,
      });
    }
  });

  (order.needAnalysisArray || []).forEach((item) => {
    if (item.notes || item.analysisDocument) {
      allComments.push({
        text: item.notes || "",
        by: item.uploadedBy || "—",
        at: item.uploadedAt,
        stage: "Need Analysis",
        stageGroup: "needAnalysis",
        docPath: item.analysisDocument,
      });
    }
  });

  (order.proposalArray || []).forEach((item) => {
    if (item.notes || item.proposalDocument) {
      allComments.push({
        text: item.notes || "",
        by: item.uploadedBy || "—",
        at: item.uploadedAt,
        stage: "Proposal",
        stageGroup: "proposal",
        docPath: item.proposalDocument,
      });
    }
  });

  (order.salesNegotiationArray || []).forEach((item) => {
    if (item.notes || item.document) {
      allComments.push({
        text: item.notes || "",
        by: item.uploadedBy || "—",
        at: item.uploadedAt,
        stage: "Negotiation",
        stageGroup: "negotiation",
        docPath: item.document,
      });
    }
  });

  (order.closedWonArray || []).forEach((item) => {
    if (item.salesPoNotes || item.salesPoDocument) {
      allComments.push({
        text: item.salesPoNotes || "",
        by: item.uploadedBy || "—",
        at: item.uploadedAt,
        stage: "PO Document",
        stageGroup: "closedWon",
        docPath: item.salesPoDocument,
        isMandatoryPO: true,
      });
    }
  });

  (order.poCommentsArray || []).forEach((item) => {
    if (item.notes || item.document) {
      allComments.push({
        text: item.notes || "",
        by: item.uploadedBy || "—",
        at: item.uploadedAt,
        stage: "PO Comment",
        stageGroup: "closedWon",
        docPath: item.document,
      });
    }
  });

  (order.projectCodeCommentsArray || []).forEach((item) => {
    if (item.notes || item.document) {
      allComments.push({
        text: item.notes || "",
        by: item.uploadedBy || "—",
        at: item.uploadedAt,
        stage: "Project Code Creation",
        stageGroup: "projectCode",
        docPath: item.document,
      });
    }
  });

  (order.salesFinalClosedWonArray || []).forEach((item) => {
    if (item.notes || item.document) {
      allComments.push({
        text: item.notes || "",
        by: item.uploadedBy || "—",
        at: item.uploadedAt,
        stage: "Closed Won",
        stageGroup: "salesFinalClosedWon",
        docPath: item.document,
      });
    }
  });

  (order.closedLostCommentsArray || []).forEach((item) => {
    if (item.notes || item.document) {
      allComments.push({
        text: item.notes || "",
        by: item.uploadedBy || "—",
        at: item.uploadedAt,
        stage: "Closed Lost",
        stageGroup: "closedLost",
        docPath: item.document,
      });
    }
  });

  (order.closedLostArray || []).forEach((item) => {
    if (item.reason) {
      allComments.push({
        text: item.reason,
        by: item.uploadedBy || "—",
        at: item.uploadedAt,
        stage: "Closed Lost",
        stageGroup: "closedLost",
        docPath: item.document,
      });
    }
  });

  allComments.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  const commentsTabs: Array<{ key: string; label: string }> = [
    { key: "all", label: "All" },
    { key: "enquiry", label: "Enquiry" },
    { key: "proposal", label: "Proposal & Price Quote" },
    { key: "closedWon", label: "PO Document" },
    { key: "projectCode", label: "Project Code Creation" },
    { key: "salesFinalClosedWon", label: "Closed Won" },
  ];

  const filteredComments =
    commentsTab === "all"
      ? allComments
      : allComments.filter((c) => c.stageGroup === commentsTab);

  // ── Enquiry name confirm & save ────────────────────────────────────────
  const handleNameConfirm = async () => {
    if (!nameInput.trim()) {
      setNameError("Name is required");
      return;
    }
    const name = nameInput.trim();
    setSavingName(true);
    try {
      const token = getToken();
      await axios.patch(
        `${API_BASE}sales/pipeline/${order._id}/enquiry-name`,
        { enquiryName: name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEnquiryName(name);
      setShowNameModal(false);
      await onRefresh();
      await submitComment(name);
    } catch (e: any) {
      setNameError(e?.response?.data?.message || "Save failed, try again");
    } finally {
      setSavingName(false);
    }
  };


  const submitComment = async (uploadedByName: string) => {
    setSaving(true);
    try {
      const token = getToken();
      const fd = new FormData();
      fd.append("stage", order.salesPipelineStatus);

      // const notesFieldMap: Record<string, string> = {
      //   enquiry: "enquiryNotes",
      //   needAnalysis: "analysisNotes",
      //   proposalPriceQuote: "proposalNotes",
      //   negotiationReview: "negotiationNotes",
      //   closedWon: "salesPoNotes",
      // };
      // const docFieldMap: Record<string, string> = {
      //   enquiry: "enquiryDocument",
      //   needAnalysis: "analysisDocument",
      //   proposalPriceQuote: "proposalDocument",
      //   negotiationReview: "negotiationDocument",
      //   closedWon: "salesPoDocument",
      // };

      const notesFieldMap: Record<string, string> = {
        enquiry: "enquiryNotes",
        needAnalysis: "analysisNotes",
        proposalPriceQuote: "proposalNotes",
        negotiationReview: "negotiationNotes",
        closedWon: "poCommentNotes",
        projectCodeCreation: "projectCodeCommentNotes",
        salesFinalClosedWon: "salesFinalClosedWonNotes",
        closedLost: "closedLostCommentNotes",
      };
      const docFieldMap: Record<string, string> = {
        enquiry: "enquiryDocument",
        needAnalysis: "analysisDocument",
        proposalPriceQuote: "proposalDocument",
        negotiationReview: "negotiationDocument",
        closedWon: "poCommentDocument",
        projectCodeCreation: "projectCodeCommentDocument",
        salesFinalClosedWon: "salesFinalClosedWonDocument",
        closedLost: "closedLostCommentDocument",
      };

      const notesField = notesFieldMap[order.salesPipelineStatus] || "analysisNotes";
      const docField = docFieldMap[order.salesPipelineStatus] || "analysisDocument";

      fd.append(notesField, comment.trim());


      if (isEnquiry) {
        fd.append("enquiryName", uploadedByName);
      }

      if (file) fd.append(docField, file);

      await axios.post(`${API_BASE}sales/pipeline/${order._id}/documents`, fd, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Comment added!");
      setComment("");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      await onRefresh();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };


  const handleAddComment = async () => {
    if (!comment.trim() && !file) return;

    if (isEnquiry && !enquiryName) {
      const token = getToken();
      const loggedInUsername = token ? (jwtDecode(token) as any)?.username : "";
      if (loggedInUsername) {
        setEnquiryName(loggedInUsername);
        await submitComment(loggedInUsername);
        return;
      }
      setNameInput("");
      setNameError("");
      setShowNameModal(true);
      return;
    }
    await submitComment(isEnquiry ? enquiryName : "");
  };

  const stageLabel = SALES_STAGE_MAP[order.salesPipelineStatus]?.label || order.salesPipelineStatus;

  return (
    <div className="p-4 space-y-4">


      {showNameModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-5 space-y-4">


            <input
              type="text"
              value={nameInput}
              onChange={(e) => { setNameInput(e.target.value); setNameError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleNameConfirm()}
              placeholder="Please Enter Your Name"
              autoFocus
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {nameError && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle size={12} /> {nameError}
              </p>
            )}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowNameModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleNameConfirm}
                disabled={savingName}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-sm font-semibold text-white transition-all"
              >
                {savingName ? "Saving..." : "Confirm & Upload"}
              </button>
            </div>
          </div>
        </div>
      )}


      <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
            Add a comment · <span className="text-gray-400">{stageLabel}</span>
          </p>

          {isEnquiry && enquiryName && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50">
              <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white">
                {enquiryName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">{enquiryName}</span>
            </div>
          )}
        </div>
        <div className="p-4 space-y-3">
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Type your comment here..."
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs text-gray-500 hover:bg-gray-50 cursor-pointer transition-all">
              <Upload size={13} /> {file ? file.name : "Attach File"}
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  if (f) {
                    const err = validateFileSize(f);
                    if (err) { toast.error(err); e.target.value = ""; return; }
                  }
                  setFile(f);
                }}
              />
            </label>
            {file && (
              <button
                onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ""; }}
                className="text-red-400 hover:text-red-600 text-xs"
              >
                Remove
              </button>
            )}
            <button
              onClick={handleAddComment}
              disabled={saving || (!comment.trim() && !file)}
              className="ml-auto px-5 py-2 rounded-xl bg-gray-900 dark:bg-white hover:bg-gray-700 dark:hover:bg-gray-100 disabled:opacity-40 text-white dark:text-gray-900 text-sm font-semibold transition-all"
            >
              {saving ? "Saving..." : "Add Comment"}
            </button>
          </div>
        </div>
      </div>


      <div>
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Comments History</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {commentsTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setCommentsTab(t.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                commentsTab === t.key
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {filteredComments.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">No comments yet</div>
        ) : (
          <div className="space-y-3">
            {/* {allComments.map((c, i) => {
              const initials = c.by.charAt(0).toUpperCase();
              const colors = ["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500"];
              const color = colors[c.by.charCodeAt(0) % colors.length];
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-transparent hover:border-gray-100 dark:hover:border-gray-700/50 transition-all"
                >
                  <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{c.by}</span>
                      <span className="text-sm text-gray-400 px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700">
                        {c.stage}
                      </span>
                    </div>
                    {c.text && <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">{c.text}</p>}
                    {c.docPath && (
                      <div className="mt-1">
                        <DocItem docPath={c.docPath} label="Attached Document" />
                      </div>
                    )}
                    <p className="text-[13px] text-gray-400 mt-1">{fmtDatetime(c.at)}</p>
                  </div>
                </div>
              );
            })} */}
            {filteredComments.map((c, i) => {
              const initials = c.by.charAt(0).toUpperCase();
              const colors = ["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500"];
              const color = colors[c.by.charCodeAt(0) % colors.length];
              return (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-transparent hover:border-gray-100 dark:hover:border-gray-700/50 transition-all">
                  <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{c.by}</span>
                      <span
                        className={`text-sm px-1.5 py-0.5 rounded-full ${c.isMandatoryPO
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-semibold"
                          : "text-gray-400 bg-gray-100 dark:bg-gray-700"
                          }`}
                      >
                        {c.isMandatoryPO && "✓ "}{c.stage}
                      </span>
                    </div>
                    {c.text && <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">{c.text}</p>}
                    {c.docPath && (
                      <div className="mt-1">
                        <DocItem docPath={c.docPath} label={c.isMandatoryPO ? "Sales PO Document" : "Attached Document"} />
                      </div>
                    )}
                    <p className="text-[13px] text-gray-400 mt-1">{fmtDatetime(c.at)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


function DocumentsTab({
  order, onRefresh, onPoUploadSuccess,
}: {
  order: SalesOrder; onRefresh: () => Promise<void>;
  onPoUploadSuccess?: () => void;
}) {
  const [poFile, setPoFile] = useState<File | null>(null);
  const [poNotes, setPoNotes] = useState("");
  const [poSaving, setPoSaving] = useState(false);
  const [showPoForm, setShowPoForm] = useState(false);

  // ── PO document correction — open until Project Code is created ─────────
  const hasProjectCode =
    order.salesPipelineStatus === "projectCodeCreation" ||
    ((order as any).projectCodeArray || []).length > 0;
  const poDocumentEditHistory: any[] = (order as any).poDocumentEditHistory || [];
  const [showPoEdit, setShowPoEdit] = useState(false);
  const [showPoEditHistory, setShowPoEditHistory] = useState(false);
  const [poEditFile, setPoEditFile] = useState<File | null>(null);
  const [poEditReason, setPoEditReason] = useState("");
  const [poEditSaving, setPoEditSaving] = useState(false);

  const handlePoDocumentEdit = async () => {
    if (!poEditFile) { toast.error("Select the corrected PO document"); return; }
    const sizeErr = validateFileSize(poEditFile);
    if (sizeErr) { toast.error(sizeErr); return; }
    if (!poEditReason.trim()) { toast.error("Reason for correction is required"); return; }
    setPoEditSaving(true);
    try {
      const token = getToken();
      const fd = new FormData();
      fd.append("poDocument", poEditFile);
      fd.append("reason", poEditReason.trim());
      await axios.patch(`${API_BASE}sales/pipeline/${order._id}/po-document`, fd, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("PO document corrected");
      setShowPoEdit(false);
      setPoEditFile(null);
      setPoEditReason("");
      await onRefresh();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to update PO document");
    } finally {
      setPoEditSaving(false);
    }
  };

  const handlePoUpload = async () => {
    if (!poFile) { toast.error("Please select a PO document"); return; }
    const sizeErr = validateFileSize(poFile);
    if (sizeErr) { toast.error(sizeErr); return; }
    setPoSaving(true);
    try {
      const token = getToken();
      const fd = new FormData();
      fd.append("stage", "closedWon");
      fd.append("salesPoDocument", poFile);
      if (poNotes.trim()) fd.append("salesPoNotes", poNotes.trim());
      await axios.post(`${API_BASE}sales/pipeline/${order._id}/documents`, fd, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("PO Document uploaded!");
      setPoFile(null); setPoNotes(""); setShowPoForm(false);
      await onRefresh();
      onPoUploadSuccess?.();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Something went wrong");
    } finally {
      setPoSaving(false);
    }
  };


  const sections = [

    {
      label: "PO Documents",
      color: "green",
      docs: (order.closedWonArray || []).filter(i => i.salesPoDocument).map(i => ({
        path: i.salesPoDocument, notes: i.salesPoNotes, by: i.uploadedBy, at: i.uploadedAt,
      })),
    },

  ].filter(s => s.docs.length > 0);

  const colorMap: Record<string, string> = {
    blue: "text-blue-700 bg-blue-50 border-blue-100",
    violet: "text-violet-700 bg-violet-50 border-violet-100",
    amber: "text-amber-700 bg-amber-50 border-amber-100",
    green: "text-green-700 bg-green-50 border-green-100",
    rose: "text-rose-700 bg-rose-50 border-rose-100",
  };


  const canUploadPO = ["closedWon", "projectCodeCreation"].includes(order.salesPipelineStatus);

  return (
    <div className="p-4 space-y-4">



      {sections.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <FileText size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No documents uploaded yet</p>
        </div>
      ) : (
        sections.map((section, si) => (
          <div key={si} className={`rounded-xl border overflow-hidden ${colorMap[section.color]?.split(" ").slice(2).join(" ") || "border-gray-100"}`}>
            <div className={`px-4 py-2.5 border-b ${colorMap[section.color]?.split(" ").slice(1).join(" ") || ""}`}>
              <h3 className={`text-sm font-bold uppercase tracking-wider ${colorMap[section.color]?.split(" ")[0] || "text-gray-500"}`}>
                {section.label}
              </h3>
            </div>
            <div className="p-3 space-y-2 bg-white dark:bg-gray-900">
              {section.docs.map((doc, di) => (
                <DocItem key={di}
                  docPath={doc.path}
                  label={`${section.label.replace(" Documents", "")} ${di + 1}`}
                  notes={doc.notes}
                  by={doc.by}
                  at={doc.at}
                />
              ))}

              {section.label === "PO Documents" && (
                <div className="pt-1">
                  <div className="flex items-center gap-2">
                    {!hasProjectCode && (
                      <button
                        onClick={() => setShowPoEdit((v) => !v)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[12px] font-semibold"
                      >
                        <FileEdit size={12} /> Edit PO Document
                      </button>
                    )}
                    {poDocumentEditHistory.length > 0 && (
                      <button
                        onClick={() => setShowPoEditHistory((v) => !v)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-[12px] font-semibold"
                      >
                        <History size={12} /> Edit History ({poDocumentEditHistory.length})
                      </button>
                    )}
                  </div>

                  {showPoEditHistory && poDocumentEditHistory.length > 0 && (
                    <div className="mt-3 space-y-2.5">
                      {poDocumentEditHistory.slice().reverse().map((h: any, hi: number) => (
                        <div key={h._id} className="rounded-xl border border-amber-100 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-900/10 p-2.5">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[11px] font-bold">
                              <FileEdit size={10} /> Correction #{poDocumentEditHistory.length - hi}
                            </span>
                            <span className="text-[11px] text-gray-400">{fmtDatetime(h.editedAt)}</span>
                          </div>
                          <DocItem
                            docPath={h.document}
                            label="PO Document"
                            by={h.editedBy}
                            at={h.editedAt}
                          />
                          <p className="text-[12px] text-gray-600 dark:text-gray-300 mt-2 flex items-start gap-1">
                            <StickyNote size={12} className="mt-0.5 flex-shrink-0 text-gray-400" />
                            <span><span className="font-semibold text-gray-700 dark:text-gray-300">Reason:</span> <span className="italic">{h.reason}</span></span>
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {showPoEdit && !hasProjectCode && (
                    <div className="mt-3 space-y-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-900/10 p-3">
                      <div>
                        <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                          <Upload size={11} />PO Document
                        </p>
                        <DragDropFile
                          file={poEditFile}
                          onFile={setPoEditFile}
                          onRemove={() => setPoEditFile(null)}
                          accept=".pdf,.jpg,.jpeg,.png"
                          label="Click or drag to upload corrected PO"
                        />
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                          <StickyNote size={11} /> Reason for Correction
                        </p>
                        <textarea
                          value={poEditReason}
                          onChange={(e) => setPoEditReason(e.target.value)}
                          placeholder="e.g. Wrong PO number, incorrect amount..."
                          rows={2}
                          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-amber-300"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handlePoDocumentEdit}
                          disabled={poEditSaving}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-[12px] font-semibold transition-all"
                        >
                          <CheckCircle2 size={13} /> {poEditSaving ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                          onClick={() => { setShowPoEdit(false); setPoEditFile(null); setPoEditReason(""); }}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-[12px] font-semibold transition-all"
                        >
                          <X size={13} /> Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default function SalesDetailDrawer({
  order, onClose, onRefresh, onStageMove, staffAdmins, currentUserIsAdmin, saving,
  onOpenConflictOrder, highlightOrderId, onClosedLostConflictOrder, onEditConflictOrder,
  editOrderId, onEditOrderHandled,
}: {
  order: SalesOrder; onClose: () => void; onRefresh: () => Promise<void>;
  onStageMove: (order: SalesOrder, toStage: string) => void;
  staffAdmins: { username: string }[];
  currentUserIsAdmin: number;
  saving: boolean;
  onOpenConflictOrder?: (orderObjectId: string) => void;
  highlightOrderId?: string | null;
  onClosedLostConflictOrder?: (orderObjectId: string) => void;
  onEditConflictOrder?: (orderObjectId: string) => void;
  editOrderId?: string | null;
  onEditOrderHandled?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const stage = SALES_STAGE_MAP[order.salesPipelineStatus];
  const stageIdx = SALES_STAGES.findIndex((s) => s.key === order.salesPipelineStatus);
  const [showEditForm, setShowEditForm] = useState(false);
  const { vehicleTypes, fetchVehicleTypes } = useVehicle();

  // Date Conflict tab "Edit" button on a conflicting order routed us here —
  // auto-open the edit form once this order is actually showing.
  useEffect(() => {
    if (editOrderId && editOrderId === order._id) {
      setShowEditForm(true);
      onEditOrderHandled?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editOrderId, order._id]);

  // ── Handler handover / reassignment ────────────────────────────────────
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [handoverNewHandler, setHandoverNewHandler] = useState("");
  const [handoverIsTemporary, setHandoverIsTemporary] = useState(true);
  const [handoverLeaveStart, setHandoverLeaveStart] = useState("");
  const [handoverLeaveEnd, setHandoverLeaveEnd] = useState("");
  const [handoverReason, setHandoverReason] = useState("");
  const [handoverSaving, setHandoverSaving] = useState(false);
  const handlerAssignmentHistory: any[] = (order as any).handlerAssignmentHistory || [];
  const activeTemporaryHandover = handlerAssignmentHistory.find(
    (h: any) => h.status === "active" && h.isTemporary
  );
  const todayIso = new Date().toISOString().slice(0, 10);
  const oneYearAheadIso = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const submitHandover = async () => {
    if (!handoverNewHandler.trim()) { toast.error("Select the new handler"); return; }
    if (!handoverReason.trim()) { toast.error("Reason is required"); return; }
    if (handoverIsTemporary && (!handoverLeaveStart || !handoverLeaveEnd)) {
      toast.error("Leave start and end dates are required"); return;
    }
    setHandoverSaving(true);
    try {
      const token = getToken();
      await axios.patch(
        `${API_BASE}sales/pipeline/${order._id}/reassign-handler`,
        {
          newHandler: handoverNewHandler.trim(),
          isTemporary: handoverIsTemporary,
          leaveStartDate: handoverIsTemporary ? handoverLeaveStart : null,
          leaveEndDate: handoverIsTemporary ? handoverLeaveEnd : null,
          reason: handoverReason.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Handler reassigned");
      setShowHandoverModal(false);
      setHandoverNewHandler(""); setHandoverLeaveStart(""); setHandoverLeaveEnd(""); setHandoverReason("");
      await onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reassign handler");
    } finally {
      setHandoverSaving(false);
    }
  };

  const resolveHandover = async (assignmentId: string, makePermanent: boolean) => {
    try {
      const token = getToken();
      await axios.patch(
        `${API_BASE}sales/pipeline/${order._id}/handover/${assignmentId}/resolve`,
        { makePermanent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(makePermanent ? "Handover made permanent" : "Order returned to previous handler");
      await onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to resolve handover");
    }
  };

  useEffect(() => {
    fetchVehicleTypes()
  }, [])

  const getVehicleTypeName = (vehicleTypeId: string) => {
    if (!vehicleTypeId || !vehicleTypes) return "";
    const vehicle = vehicleTypes.find((vt: any) => vt._id === vehicleTypeId);
    return vehicle?.typeName || vehicleTypeId;
  };

  const canEdit = !["closedWon", "projectCodeCreation", "salesFinalClosedWon", "closedLost"]
    .includes(order.salesPipelineStatus);

  const getNextLabel = (): string | null => {
    const s = order.salesPipelineStatus;
    if (s === "enquiry") return "Move to Proposal & Price Quote";
    if (s === "proposalPriceQuote") return "Move to PO Document";
    if (s === "closedWon") return "Move to Project Code Creation";
    if (s === "projectCodeCreation") return "Move to Closed Won";
    return null;
  };

  const getNextStageShortLabel = (): string | null => {
    const s = order.salesPipelineStatus;
    if (s === "enquiry") return "Proposal & Price Quote";
    if (s === "proposalPriceQuote") return "Order Confirmation";
    if (s === "closedWon") return "Project Code";
    if (s === "projectCodeCreation") return "Closed Won";
    return null;
  };

  const nextStageKey = () => {
    const s = order.salesPipelineStatus;
    if (s === "enquiry") return "proposalPriceQuote";
    if (s === "proposalPriceQuote") return "closedWon";
    if (s === "closedWon") return "projectCodeCreation";
    if (s === "projectCodeCreation") return "salesFinalClosedWon";
    return null;
  };

  const nextLabel = getNextLabel();
  const nextShort = getNextStageShortLabel();

  // Single shared handler for every "Move to Next Stage" trigger (header
  // button, mobile button, Overview Quick Actions button) so validation
  // (and its toast.error on failure, e.g. incomplete Project Code Creation)
  // behaves identically no matter which button/tab it's clicked from.
  const handleMoveToNext = () => {
    const ns = nextStageKey();
    if (ns) onStageMove(order, ns);
  };


  const stageReached = (key: string) => {
    const idx = SALES_STAGES.findIndex((s) => s.key === key);
    return idx <= stageIdx;
  };

  const isPoStage = ["closedWon", "projectCodeCreation"].includes(order.salesPipelineStatus);


  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "comments", label: "Comments" },
    { key: "pipeline", label: "Pipeline History" },
    ...(isPoStage ? [{ key: "documents" as Tab, label: "PO Document" }] : []),
    ...(order.hasDateConflict ? [{ key: "dateConflict" as Tab, label: "Date Conflict" }] : []),
    ...((order.orderEditHistory || []).length > 0
      ? [{ key: "orderEditHistory" as Tab, label: "Edit History" }]
      : []),
    ...(order.salesPipelineStatus === "projectCodeCreation"
      ? [{ key: "codeCreation" as Tab, label: "Code Creation" }]
      : []),
  ];


  useEffect(() => {

    if (order.salesPipelineStatus === "projectCodeCreation") {
      setActiveTab("codeCreation");
    }
  }, [order.salesPipelineStatus]);


  const subtotal = order.bookingItems.reduce((s: number, i: any) => s + (i.totalAmount || 0), 0);
  const totalNegotiated = (order.salesNegotiationArray || []).reduce((s, n) => s + (n.amount || 0), 0);
  const taxable = subtotal - totalNegotiated;
  const gstAmt = Math.floor(taxable * 0.18);
  const finalAmt = taxable + gstAmt;
  const lastComment = [...(order.needAnalysisArray || []), ...(order.proposalArray || []), ...(order.salesNegotiationArray || [])]
    .filter(i => i.uploadedAt)
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())[0];

  const StageIcon = stage?.icon || FiClipboard;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      {/* Mounted with the drawer itself (not any one tab) so "Move to Next
          Stage" validation toasts show consistently no matter which tab is
          active — react-hot-toast's default z-index (9999) sits above the
          modal's z-50 backdrop. */}
      <Toaster position="top-right" />
      {/* <div className="bg-white dark:bg-gray-950 w-full sm:max-w-4xl h-full sm:max-h-[92vh] flex flex-col shadow-2xl sm:rounded-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300"> */}

      <div className={`bg-white dark:bg-gray-950 w-full sm:max-w-4xl h-full sm:max-h-[92vh] flex flex-col shadow-2xl sm:rounded-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300 transition-all ${highlightOrderId === order._id ? "ring-4 ring-amber-400" : ""
        }`}>

        <div className="flex-shrink-0 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">

          <div className="flex items-center gap-3 px-4 py-3">

            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${stage?.headerGrad || "from-gray-500 to-gray-600"}`}>
              <StageIcon size={15} className="text-white" />
            </div>


            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-bold text-gray-900 dark:text-white">Sales Order</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[13px] font-semibold ${stage?.bg || "bg-gray-100"} ${stage?.color || "text-gray-700"}`}>
                  {stage?.label || order.salesPipelineStatus}
                </span>
                {(order.companyName || order.clientName) && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[13px] font-bold text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-900/30 truncate">
                    {order.companyName || order.clientName}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[13px] text-gray-400 mt-0.5">
                <span className="font-mono">{order.orderId}</span>
                <span>·</span>
                {/* <Clock size={10} />
                <span>{fmtDatetime(order.updatedAt)}</span> */}
              </div>
            </div>

            {canEdit && (
              <button
                onClick={() => setShowEditForm(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-blue-400 hover:text-blue-600 text-sm font-semibold transition-all whitespace-nowrap"
              >
                <FileEdit size={13} /> Edit
              </button>
            )}


            {nextShort && (
              <button
                onClick={handleMoveToNext}
                disabled={saving}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold transition-all whitespace-nowrap"
              >
                {saving
                  ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><ChevronRight size={12} /> Move to {nextShort}</>
                }
              </button>
            )}


            {order.salesHandlerName && (
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <div className={`w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white`}>
                  {order.salesHandlerName.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{order.salesHandlerName}</span>
              </div>
            )}


            <button onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
              <X size={16} />
            </button>
          </div>


          {nextShort && (
            <div className="sm:hidden flex items-center gap-2 px-4 pb-3">
              <button
                onClick={handleMoveToNext}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold transition-all"
              >
                {saving ? "Moving..." : <><ChevronRight size={12} /> Move to {nextShort}</>}
              </button>
              {!["closedWon", "closedLost", "projectCodeCreation"].includes(order.salesPipelineStatus) && (
                <button onClick={() => onStageMove(order, "closedLost")}
                  className="px-3 py-2 rounded-lg bg-rose-50 text-rose-600 text-xs font-semibold border border-rose-200">
                  <XCircle size={12} />
                </button>
              )}
            </div>
          )}

          {/* Tabs */}
          <div className="flex items-center border-b border-gray-100 dark:border-gray-800 px-4">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-md font-medium border-b-2 transition-all -mb-px whitespace-nowrap ${activeTab === tab.key
                  ? "border-red-500 text-red-600 dark:text-red-400"
                  : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  }`}
              >
                {tab.label}
                {tab.key === "dateConflict" && order.hasDateConflict && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                )}
              </button>
            ))}
          </div>
        </div>


        <div className="flex-1 overflow-y-auto">


          {activeTab === "overview" && (
            <div className="flex flex-col sm:flex-row h-full min-h-0">

              <div className="flex-1 overflow-y-auto sm:border-r border-gray-100 dark:border-gray-800">
                <OverviewTab
                  order={order} onRefresh={onRefresh} onStageMove={onStageMove} getVehicleTypeName={getVehicleTypeName}
                  onOpenHandover={() => setShowHandoverModal(true)}
                  onResolveHandover={resolveHandover}
                />
              </div>


              <div className="w-full sm:w-[260px] flex-shrink-0 overflow-y-auto p-4 space-y-3 bg-gray-50/50 dark:bg-gray-900/40">

                <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Current Stage</p>
                    <MoreHorizontal size={14} className="text-gray-300" />
                  </div>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-bold ${stage?.bg || "bg-gray-100"} ${stage?.color || "text-gray-700"} mb-2`}>
                    <StageIcon size={13} />
                    {stage?.label}
                  </div>
                  {order.salesHandlerName && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {order.salesHandlerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{order.salesHandlerName}</p>
                        {activeTemporaryHandover && (
                          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Temporary handover</p>
                        )}
                      </div>
                    </div>
                  )}

                  {order.updatedAt && (
                    <p className="text-[13px] text-gray-400 mt-2">
                      Updated On<br />
                      {fmtDatetime(order.updatedAt)} ({fmtRelative(order.updatedAt)})
                    </p>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Quick Actions</p>
                  <div className="space-y-2">
                    {nextShort && (
                      <button
                        onClick={handleMoveToNext}
                        disabled={saving}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gray-900 dark:bg-white hover:bg-gray-700 dark:hover:bg-gray-100 disabled:opacity-60 text-white dark:text-gray-900 text-sm font-medium transition-all"
                      >
                        <ChevronRight size={13} /> Move to Next Stage
                      </button>
                    )}
                    <button
                      onClick={() => setActiveTab("comments")}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                    >
                      <MessageSquare size={13} /> Add Comment
                    </button>

                    {["closedWon", "projectCodeCreation"].includes(order.salesPipelineStatus) && (
                      <button
                        onClick={() => setActiveTab("documents")}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-xs font-medium hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
                      >
                        <FileText size={13} /> PO Document
                      </button>
                    )}

                    {order.salesPipelineStatus === "projectCodeCreation" && (
                      <button
                        onClick={() => setActiveTab("codeCreation")}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400 text-xs font-medium hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all"
                      >
                        <FiCode size={13} /> Code Creation
                      </button>
                    )}

                  </div>
                </div>

                {/* Summary */}
                <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
                  <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Summary</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-sm">Total Vehicles</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">{order.bookingItems.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-sm">Final Amount</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200 text-xs">{fmt(finalAmt)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-sm">Last Updated At</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200 text-xs">{fmtRelative(order.updatedAt)}</span>
                    </div>
                    {lastComment && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-sm">Last updated Comment</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200 text-xs">{fmtRelative(lastComment.uploadedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "comments" && (
            <CommentsTab order={order} onRefresh={onRefresh} />
          )}

          {activeTab === "pipeline" && (
            <PipelineHistoryTab order={order} />
          )}



          {activeTab === "documents" && (
            <DocumentsTab
              order={order}
              onRefresh={onRefresh}
              onPoUploadSuccess={() => setActiveTab("documents")}
            />
          )}
          {activeTab === "codeCreation" && (
            <CodeCreationTab order={order} onRefresh={onRefresh} />
          )}
         
          {activeTab === "orderEditHistory" && (
            <OrderEditHistoryTab order={order} getVehicleTypeName={getVehicleTypeName} />
          )}

          {activeTab === "dateConflict" && (
            <DateConflictTab
              order={order}
              onOpenConflictOrder={onOpenConflictOrder}
              onClosedLostConflictOrder={onClosedLostConflictOrder}
              onEditConflictOrder={onEditConflictOrder}
            />
          )}


          {showEditForm && (
            <AdminOrderForm
              editingOrder={order}
              onClose={() => setShowEditForm(false)}
              onSuccess={async () => {
                setShowEditForm(false);
                toast.success("Order updated successfully!");
                await onRefresh();
              }}
              getVehicleTypeName={getVehicleTypeName}
            />
          )}

          {showHandoverModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Reassign Handler</h3>
                  <button onClick={() => setShowHandoverModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500">New Handler</label>
                    <select
                      value={handoverNewHandler}
                      onChange={(e) => setHandoverNewHandler(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                    >
                      <option value="">Select handler...</option>
                      {staffAdmins
                        .filter((s) => s.username !== order.salesHandlerName)
                        .map((s) => (
                          <option key={s.username} value={s.username}>{s.username}</option>
                        ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="handoverTemp"
                      type="checkbox"
                      checked={handoverIsTemporary}
                      onChange={(e) => setHandoverIsTemporary(e.target.checked)}
                    />
                    <label htmlFor="handoverTemp" className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      Temporary (e.g. leave handover) — return or make permanent later
                    </label>
                  </div>

                  {handoverIsTemporary && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-semibold text-gray-500">Leave Start (From Date)</label>
                        <div className="mt-1">
                          <DatePicker
                            value={handoverLeaveStart}
                            onChange={setHandoverLeaveStart}
                            minDate={todayIso}
                            maxDate={handoverLeaveEnd || oneYearAheadIso}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500">Leave End (To Date)</label>
                        <div className="mt-1">
                          <DatePicker
                            value={handoverLeaveEnd}
                            onChange={setHandoverLeaveEnd}
                            minDate={handoverLeaveStart || todayIso}
                            maxDate={oneYearAheadIso}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-gray-500">Reason</label>
                    <textarea
                      value={handoverReason}
                      onChange={(e) => setHandoverReason(e.target.value)}
                      rows={2}
                      placeholder="e.g. Handler on leave, manager reassignment..."
                      className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={submitHandover}
                      disabled={handoverSaving}
                      className="flex-1 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-semibold"
                    >
                      {handoverSaving ? "Saving..." : "Reassign"}
                    </button>
                    <button
                      onClick={() => setShowHandoverModal(false)}
                      className="flex-1 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}


function EnquiryCommentModal({
  onClose,
  onSubmit,
  saving,
}: {
  onClose: () => void;
  onSubmit: (enquiryName: string, notes: string, file: File | null) => Promise<void>;
  saving: boolean;
}) {
  const [enquiryName, setEnquiryName] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!enquiryName.trim()) { setError("Enquiry name is required"); return; }
    if (!notes.trim() && !file) { setError("Please add notes or a document"); return; }
    setError("");
    await onSubmit(enquiryName, notes, file);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">Add Enquiry Comment</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
              Enquiry Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={enquiryName}
              onChange={(e) => setEnquiryName(e.target.value)}
              placeholder="Enter enquiry person name..."
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Type your comment here..."
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>
          <DragDropFile file={file} onFile={setFile} onRemove={() => setFile(null)} />
          {error && (
            <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2 flex items-center gap-1.5">
              <AlertCircle size={12} /> {error}
            </p>
          )}
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold transition-all flex items-center justify-center gap-2"
          >
            {saving ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
            ) : (
              <><CheckCircle2 size={14} /> Save Comment</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

