"use client";

import { useState, useRef, useCallback } from "react";
import axios from "axios";
import { getToken } from "@/utils/auth";
import API_BASE from "../../../../../baseurl";
import toast from "react-hot-toast";
import {
  Upload,
  FileText,
  Trash2,
  ChevronRight,
  AlertCircle,
  IndianRupee,
  Calendar,
  CheckCircle2,
  Download,
  Clock,
  User,
  StickyNote,
} from "lucide-react";
import DatePicker from "@/utils/datepicker";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface PoDocumentLog {
  _id: string;
  poDocument: string;
  poDate: string;
  poNotes?: string;
  uploadedBy?: string;
  uploadedAt: string;
}

interface PaymentStageFirst {
  _id: string;
  advancePayment: number;
  paymentProofDocument: string;
  paymentDate: string;
  paymentVerification: string;
  paymentNotes?: string;
  uploadedBy?: string;
  uploadedAt: string;
}

// ─── Shared helpers ─────────────────────────────────────────────────────────────
const fmt = (n?: number | null) =>
  n != null ? `₹ ${n.toLocaleString("en-IN")}` : "—";

const fmtDate = (s?: string) =>
  s
    ? new Date(s).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

// ─── DragDropFileInput ──────────────────────────────────────────────────────────
// Reusable drag-drop file upload component
function DragDropFileInput({
  file,
  onFileChange,
  onRemove,
  accept = ".pdf,.jpg,.jpeg,.png",
  label = "Upload Document",
}: {
  file: File | null;
  onFileChange: (f: File | null) => void;
  onRemove: () => void;
  accept?: string;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const dropped = e.dataTransfer.files?.[0];
      if (dropped) onFileChange(dropped);
    },
    [onFileChange]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  // File type icon
  const fileIcon = () => {
    if (!file) return null;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return "📄";
    if (["jpg", "jpeg", "png"].includes(ext || "")) return "🖼️";
    return "📎";
  };

  return (
    <div className="space-y-2">
      {!file ? (
        <label
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
            dragging
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.01]"
              : "border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
          }`}
        >
          <div className="text-center pointer-events-none">
            <div
              className={`text-3xl mb-2 transition-transform duration-200 ${
                dragging ? "scale-110" : ""
              }`}
            >
              {dragging ? "📂" : "☁️"}
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {dragging ? "Drop file here" : label}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Drag & drop or click · PDF, JPG, PNG
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => onFileChange(e.target.files?.[0] || null)}
          />
        </label>
      ) : (
        // Preview card after file selected
        <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-xl flex-shrink-0">
            {fileIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
              {file.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {(file.size / 1024).toFixed(1)} KB · Ready to upload
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )}
    </div>
  );
}


export function WaitingForPOSection({
  order,
  onRefresh,
}: {
  order: any;
  onRefresh: () => Promise<void>;
}) {
  // Show only if current stage is waitingForPO OR has existing PO logs
  const hasLogs = (order.poDocumentLogs || []).length > 0;
  const isCurrentStage = order.pipelineStatus === "waitingForPO";
  if (!isCurrentStage && !hasLogs) return null;

  const [poFile, setPoFile] = useState<File | null>(null);
  const [poDate, setPoDate] = useState("");
  const [poNotes, setPoNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    if (!poFile) return setError("Please upload a PO document");
    if (!poDate) return setError("Please select PO date");

    setSaving(true);
    try {
      const token = getToken();
      const fd = new FormData();
      fd.append("pipelineStatus", "waitingForPO");
      fd.append("poDocument", poFile);
      fd.append("poDate", poDate);
      if (poNotes.trim()) fd.append("poNotes", poNotes.trim());

      await axios.patch(`${API_BASE}admin/pipeline/${order._id}`, fd, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("PO document saved!");
      // Reset form
      setPoFile(null);
      setPoDate("");
      setPoNotes("");
      await onRefresh();
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Something went wrong";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const logs: PoDocumentLog[] = order.poDocumentLogs || [];

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl md:rounded-2xl border border-gray-200/60 dark:border-gray-700/50  shadow-sm hover:shadow-md transition-all duration-300">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-3 md:px-5 py-2.5 md:py-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-b border-amber-100 dark:border-amber-900/30">
        <span className="text-base md:text-lg">📋</span>
        <h3 className="text-[10px] md:text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
           PO Documents
        </h3>
        {logs.length > 0 && (
          <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
            {logs.length} doc{logs.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="p-3 md:p-5 space-y-4 md:space-y-5">

        {/* ── Existing PO Logs ── */}
        {logs.length > 0 && (
          <div className="space-y-2">
            <p className="text-[12px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Uploaded Documents
            </p>
            {logs.map((log, i) => (
              <div
                key={log._id}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50 hover:shadow-sm transition-all group"
              >
                {/* Icon */}
                <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-base flex-shrink-0">
                  📄
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      PO Document {i + 1}
                    </p>
                    <span className="text-[12px] px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium">
                      Uploaded
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {/* PO Date */}
                    <span className="flex items-center gap-1 text-[12px] text-gray-500 dark:text-gray-400">
                      <Calendar size={10} />
                      {fmtDate(log.poDate)}
                    </span>
                    {/* Uploaded by */}
                    {log.uploadedBy && (
                      <span className="flex items-center gap-1 text-[12px] text-gray-500 dark:text-gray-400">
                        <User size={10} />
                        {log.uploadedBy}
                      </span>
                    )}
                    {/* Upload time */}
                    <span className="flex items-center gap-1 text-[12px] text-gray-500 dark:text-gray-400">
                      <Clock size={10} />
                      {fmtDate(log.uploadedAt)}
                    </span>
                  </div>
                  {/* Notes */}
                  {log.poNotes && (
                    <p className="mt-1 text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                      <StickyNote size={10} />
                      {log.poNotes}
                    </p>
                  )}
                </div>

                {/* Download */}
                {/* <a
                  href={log.poDocument}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sky-500 hover:text-sky-700 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all"
                  title="View document"
                >
                  <Download size={15} />
                </a> */}
                <a
  href={`http://localhost:3001${log.poDocument}`}
  target="_blank"
  rel="noreferrer"
  className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sky-500 hover:text-sky-700 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all"
  title="View document"
>
  <Download size={15} />
</a>
              </div>
            ))}
          </div>
        )}

        {/* ── Upload New PO (only when stage is waitingForPO) ── */}
        {isCurrentStage && (
          <div className="space-y-3 md:space-y-4">
            {logs.length > 0 && (
              <div className="border-t border-dashed border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                  Upload New PO
                </p>
              </div>
            )}

            {/* File Upload */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                PO Document <span className="text-red-500">*</span>
              </label>
              <DragDropFileInput
                file={poFile}
                onFileChange={setPoFile}
                onRemove={() => setPoFile(null)}
                label="Drag & drop or click to upload PO"
              />
            </div>

            {/* PO Date */}
             <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                PO Date <span className="text-red-500">*</span>
              </label>
              {/* <input
                type="date"
                value={poDate}
                onChange={(e) => setPoDate(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
              /> */}
               <DatePicker
                value={poDate}
                onChange={setPoDate}
                label="Payment Date"
                required
              />
            </div>

            {/* PO Notes */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Notes{" "}
                <span className="text-gray-400 font-normal text-[10px]">(optional)</span>
              </label>
              <textarea
                value={poNotes}
                onChange={(e) => setPoNotes(e.target.value)}
                rows={2}
                placeholder="Any notes about this PO..."
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none transition-all"
              />
            </div>
             </div>

            {/* Auto-route info badge */}
            <div
              className={`rounded-xl px-3 py-2.5 text-xs border flex items-start gap-2 ${
                order.customerType === 1
                  ? "bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300"
                  : order.customerType === 0
                  ? "bg-cyan-50 border-cyan-200 text-cyan-700 dark:bg-cyan-900/20 dark:border-cyan-800 dark:text-cyan-300"
                  : "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"
              }`}
            >
              <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
              <span>
                {order.customerType === 1
                  ? "New Customer — will auto-move to Payment Processing Stage 1"
                  : order.customerType === 0
                  ? "Existing Customer — will auto-move to Project Code Creation"
                  : "⚠ Customer type not set on this order"}
              </span>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Save PO Document
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}