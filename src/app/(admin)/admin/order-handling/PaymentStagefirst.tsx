


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



    
  function fmtDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

const formatIndianNumber = (value: string | number) => {
  if (!value) return "";

  const number = value.toString().replace(/,/g, "");

  return new Intl.NumberFormat("en-IN").format(Number(number));
};

// ─── DragDropFileInput ──────────────────────────────────────────────────────────

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
          className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${dragging
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.01]"
              : "border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
            }`}
        >
          <div className="text-center pointer-events-none">
            <div
              className={`text-3xl mb-2 transition-transform duration-200 ${dragging ? "scale-110" : ""
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




export function PaymentStage1Section({
  order,
  onRefresh,
}: {
  order: any;
  onRefresh: () => Promise<void>;
}) {
  const hasLogs = (order.paymentStageFirst || []).length > 0;
  const isCurrentStage = order.pipelineStatus === "paymentStage1";
  if (!isCurrentStage && !hasLogs) return null;



  // Form state
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [advPayment, setAdvPayment] = useState("");
 
  const [paymentNotes, setPaymentNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Confirm modal for "Move to Project Code Creation"
  const [showConfirm, setShowConfirm] = useState(false);
  const [movingSaving, setMovingSaving] = useState(false);


const handleSave = async () => {
  setError("");
  if (!proofFile) return setError("Please upload payment proof");
  if (!advPayment) return setError("Advance payment amount is required");


  setSaving(true);
  try {
    const token = getToken();
    const fd = new FormData();
    fd.append("pipelineStatus", "paymentStage1");
    fd.append("paymentProofDocument", proofFile);
    fd.append("advancePayment", advPayment);
    fd.append("paymentDate", new Date().toISOString()); 
    fd.append("paymentVerification", "Verified");       
    if (paymentNotes.trim()) fd.append("paymentNotes", paymentNotes.trim());

    await axios.patch(`${API_BASE}admin/pipeline/${order._id}`, fd, {
      headers: { Authorization: `Bearer ${token}` },
    });

    toast.success("Payment details saved!");
    setProofFile(null);
    setAdvPayment("");
   
    setPaymentNotes("");
    await onRefresh();
  } catch (e: any) {
    const msg = e?.response?.data?.message || "Something went wrong";
    setError(msg);
    toast.error(msg);
  } finally {
    setSaving(false);
  }
};
  const handleMoveToProjectCode = async () => {
    setMovingSaving(true);
    try {
      const token = getToken();
      const fd = new FormData();
      fd.append("pipelineStatus", "projectCodeCreation");

      await axios.patch(`${API_BASE}admin/pipeline/${order._id}`, fd, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Moved to Project Code Creation!");
      setShowConfirm(false);
      await onRefresh();
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Something went wrong";
      toast.error(msg);
    } finally {
      setMovingSaving(false);
    }
  };

  const logs: PaymentStageFirst[] = order.paymentStageFirst || [];
  const totalAdvance = logs.reduce((sum, log) => sum + (log.advancePayment || 0), 0);

  return (
    <>
      <div className="bg-white dark:bg-gray-800/50 rounded-xl md:rounded-2xl border border-gray-200/60 dark:border-gray-700/50 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
     

        <div className="p-3 md:p-5 space-y-4 md:space-y-5">

   
          {logs.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Payment History
              </p>
              {logs.map((log, i) => (
                <div
                  key={log._id}
                  className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50 hover:shadow-sm transition-all"
                >
                  {/* Top row */}
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-sm flex-shrink-0">
                        💸
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                          Payment {i + 1}
                        </p>
                        {/* <p className="text-[10px] text-gray-400">
                          {fmtDate(log.uploadedAt)}
                        </p> */}
                      </div>
                    </div>
            
                    <span className="text-sm font-bold text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 px-3 py-1 rounded-lg">
                      {fmt(log.advancePayment)}
                    </span>
                  </div>

           
                  <div className="grid grid-cols-2 gap-2 text-[12px] mt-2">
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                      <Calendar size={12} />
                      <span>{fmtDate(log.paymentDate)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${log.paymentVerification === "Verified"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }`}
                      >
                        {log.paymentVerification === "Verified" ? "✓ " : "⏳ "}
                        {log.paymentVerification}
                      </span>
                    </div>
                    {log.uploadedBy && (
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                        <User size={12} />
                        <span>{log.uploadedBy}</span>
                      </div>
                    )}
                    {log.paymentNotes && (
                      <div className="col-span-2 flex items-start gap-1.5 text-gray-400">
                        <StickyNote size={12} className="flex-shrink-0 mt-0.5" />
                        <span>{log.paymentNotes}</span>
                      </div>
                    )}
                  </div>

                  {/* Proof download */}
                  <a
                    href={log.paymentProofDocument}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 flex items-center gap-2 text-[11px] text-sky-600 dark:text-sky-400 hover:underline"
                  >
                    <Download size={12} />
                    View Payment Proof
                  </a>
                </div>
              ))}
            </div>
          )}

          {logs.length > 1 && (
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 mt-2">
              <div className="flex items-center gap-2">
                <IndianRupee size={14} className="text-orange-600 dark:text-orange-400" />
                <span className="text-xs font-bold text-orange-700 dark:text-orange-300 uppercase tracking-wide">
                  Total Advance Amount
                </span>
              </div>
              <span className="text-sm font-extrabold text-orange-700 dark:text-orange-300">
                {fmt(totalAdvance)}
              </span>
            </div>
          )}

          {/* ── Upload New Payment (only when stage is paymentStage1) ── */}
          {isCurrentStage && (
            <div className="space-y-3 md:space-y-4">
              {logs.length > 0 && (
                <div className="border-t border-dashed border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                    Add New Payment
                  </p>
                </div>
              )}

              {/* Advance Payment */}
              <div className="grid grid-cols-2 gap-3">
                <div >
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Advance Payment <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <IndianRupee size={14} />
                    </span>

                    <input
                      type="text"
                      value={formatIndianNumber(advPayment)}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/,/g, "");

                        if (/^\d*$/.test(rawValue)) {
                          setAdvPayment(rawValue);
                        }
                      }}
                      placeholder="0"
                      className="w-full border border-gray-200 dark:border-gray-700 rounded-xl pl-8 pr-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
                    />
                  </div>


                </div>
               
              </div>

              {/* Payment Proof Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Payment Proof <span className="text-red-500">*</span>
                </label>
                <DragDropFileInput
                  file={proofFile}
                  onFileChange={setProofFile}
                  onRemove={() => setProofFile(null)}
                  label="Drag & drop or click to upload proof"
                />
              </div>

              {/* Payment Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Notes{" "}
                  <span className="text-gray-400 font-normal text-[10px]">(optional)</span>
                </label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  rows={2}
                  placeholder="Any notes about this payment..."
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none transition-all"
                />
              </div>

              {/* Error */}
              {error && (
                <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              {/* Save Payment Button */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Save Payment Details
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="border-t border-dashed border-gray-200 dark:border-gray-700" />

              {/* Move to Project Code Creation */}
              <button
                onClick={() => setShowConfirm(true)}
                className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
              >
                <ChevronRight size={16} />
                Move to Project Code Creation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Confirm Modal: Move to Project Code Creation ── */}
      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center text-2xl">
                🗂️
              </div>
            </div>

            <h2 className="text-center text-base font-semibold text-gray-900 dark:text-white mb-2">
              Move to Project Code Creation?
            </h2>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to move this order from{" "}
              <span className="font-semibold text-orange-600">
                Payment Processing Stage 1
              </span>{" "}
              to{" "}
              <span className="font-semibold text-cyan-600">
                Project Code Creation
              </span>
              ?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={movingSaving}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleMoveToProjectCode}
                disabled={movingSaving}
                className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
              >
                {movingSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Moving...
                  </>
                ) : (
                  "Yes, Move"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

