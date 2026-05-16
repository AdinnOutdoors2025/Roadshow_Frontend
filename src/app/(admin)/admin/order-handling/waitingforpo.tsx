
"use client";

import { useState, useRef, useCallback } from "react";
import axios from "axios";
import { getToken } from "@/utils/auth";
import API_BASE from "../../../../../baseurl";
import toast from "react-hot-toast";
import {
  Trash2, AlertCircle, Calendar,
  CheckCircle2, Download, Clock,
  User, StickyNote, Eye, X, ArrowRight,
} from "lucide-react";
import DatePicker from "@/utils/datepicker";

interface PoDocumentLog {
  _id: string;
  poDocument: string;
  poDate: string;
  poNotes?: string;
  uploadedBy?: string;
  uploadedAt: string;
}

const fmtDate = (s?: string) =>
  s ? new Date(s).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  }) : "—";

const isImageFile = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext || '');
};

// ─── Move Confirm Modal ────────────────────────────────────────────────────────
function MoveConfirmModal({
  customerType,
  onYes,
  onNo,
  onCancel,
  saving,
}: {
  customerType: number;
  onYes: () => void;
  onNo?: () => void;        // only for new customer
  onCancel: () => void;
  saving: boolean;
}) {
  const isNew = customerType === 1;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center text-2xl">
            🗂️
          </div>
        </div>

        {/* Title */}
        <h2 className="text-center text-base font-semibold text-gray-900 dark:text-white mb-2">
          Move Stage?
        </h2>

        {isNew ? (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
            Where do you want to move this order?
            <br />
            <span className="text-xs text-gray-400">
              Yes → Project Code Creation &nbsp;|&nbsp; No → Payment Stage 1
            </span>
          </p>
        ) : (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
            Move this order to{" "}
            <span className="font-semibold text-cyan-600">Project Code Creation</span>?
          </p>
        )}

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          >
            Cancel
          </button>

          {isNew && (
            <button
              onClick={onNo}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-medium transition-all"
            >
              {saving ? "..." : "No (Pay Stage 1)"}
            </button>
          )}

          <button
            onClick={onYes}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 text-white text-sm font-medium transition-all"
          >
            {saving ? "Moving..." : "Yes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Document Preview Modal ────────────────────────────────────────────────────
function DocumentPreviewModal({ url, filename, onClose }: {
  url: string; filename: string; onClose: () => void;
}) {
  const isImage = isImageFile(filename);
  const fullUrl = `http://localhost:3001${url}`;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">📄 {filename}</p>
          <div className="flex items-center gap-2">
            <a href={fullUrl} download target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-sky-600 hover:bg-sky-50 transition-all">
              <Download size={14} /> Download
            </a>
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all">
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="relative w-full" style={{ height: 'calc(90vh - 60px)' }}>
          {isImage ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800/50 p-4">
              <img src={fullUrl} alt={filename} className="max-w-full max-h-full object-contain rounded-lg shadow-lg" />
            </div>
          ) : (
            <iframe src={fullUrl} className="w-full h-full" title={filename} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── DragDropFileInput ─────────────────────────────────────────────────────────
function DragDropFileInput({ file, onFileChange, onRemove, accept = ".pdf,.jpg,.jpeg,.png", label = "Upload Document" }: {
  file: File | null; onFileChange: (f: File | null) => void;
  onRemove: () => void; accept?: string; label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) onFileChange(dropped);
  }, [onFileChange]);

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
        <label onDrop={handleDrop} onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
            dragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.01]"
              : "border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
          }`}>
          <div className="text-center pointer-events-none">
            <div className={`text-3xl mb-2 transition-transform duration-200 ${dragging ? "scale-110" : ""}`}>
              {dragging ? "📂" : "☁️"}
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {dragging ? "Drop file here" : label}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Drag & drop or click · PDF, JPG, PNG</p>
          </div>
          <input ref={inputRef} type="file" accept={accept} className="hidden"
            onChange={(e) => onFileChange(e.target.files?.[0] || null)} />
        </label>
      ) : (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-xl flex-shrink-0">
            {fileIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{file.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{(file.size / 1024).toFixed(1)} KB · Ready to upload</p>
          </div>
          <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(); if (inputRef.current) inputRef.current.value = ""; }}
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
            <Trash2 size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function WaitingForPOSection({ order, onRefresh }: { order: any; onRefresh: () => Promise<void> }) {
  const hasLogs = (order.poDocumentLogs || []).length > 0;
  const isCurrentStage = order.pipelineStatus === "waitingForPO";
  if (!isCurrentStage && !hasLogs) return null;

  const [poFile, setPoFile] = useState<File | null>(null);
  const [poNotes, setPoNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [previewLog, setPreviewLog] = useState<PoDocumentLog | null>(null);

  // Modal state: null = hidden, "move" = show modal
  const [showMoveModal, setShowMoveModal] = useState(false);
  // Which action triggered the modal
  const [pendingMoveToStage, setPendingMoveToStage] = useState<string | null>(null);

  const logs: PoDocumentLog[] = order.poDocumentLogs || [];
  const customerType: number = order.customerType;
  const isExisting = customerType === 0;
  const isNew = customerType === 1;

  // ── Core save function ──────────────────────────────────────────
  const doSave = async (moveToStage?: string) => {
    setError("");
    if (!poFile) return setError("Please upload a PO document");

    setSaving(true);
    try {
      const token = getToken();
      const fd = new FormData();
      fd.append("pipelineStatus", "waitingForPO");
      fd.append("poDocument", poFile);
      // Use today's date as poDate (backend requirement)
      fd.append("poDate", new Date().toISOString());
      if (poNotes.trim()) fd.append("poNotes", poNotes.trim());
      if (moveToStage) fd.append("moveToStage", moveToStage);

      await axios.patch(`${API_BASE}admin/pipeline/${order._id}`, fd, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(moveToStage ? "PO saved & order moved!" : "PO document saved!");
      setPoFile(null);
      setPoNotes("");
      setShowMoveModal(false);
      setPendingMoveToStage(null);
      await onRefresh();
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Something went wrong";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Button handlers ─────────────────────────────────────────────

  // "Save PO Document" — just save, stay in waitingForPO
  const handleSaveOnly = () => doSave(undefined);

  // "Save PO & Move" button clicked → show modal
  const handleSaveAndMove = () => {
    setError("");
    if (!poFile) return setError("Please upload a PO document");
    setShowMoveModal(true);
  };

  // Modal: Yes → projectCodeCreation
  const handleModalYes = () => doSave("projectCodeCreation");

  // Modal: No → paymentStage1 (only new customer)
  const handleModalNo = () => doSave("paymentStage1");

  // Modal: Cancel
  const handleModalCancel = () => { setShowMoveModal(false); setPendingMoveToStage(null); };

  return (
    <>
      {/* Preview Modal */}
      {previewLog && (
        <DocumentPreviewModal
          url={previewLog.poDocument}
          filename={`PO Document - ${fmtDate(previewLog.poDate)}`}
          onClose={() => setPreviewLog(null)}
        />
      )}

      {/* Move Confirm Modal */}
      {showMoveModal && (
        <MoveConfirmModal
          customerType={customerType}
          onYes={handleModalYes}
          onNo={isNew ? handleModalNo : undefined}
          onCancel={handleModalCancel}
          saving={saving}
        />
      )}

      <div className="bg-white dark:bg-gray-800/50 rounded-xl md:rounded-2xl border border-gray-200/60 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-all duration-300">
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
              {/* <p className="text-[12px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Uploaded Documents
              </p> */}
              {logs.map((log, i) => (
                <div key={log._id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50 hover:shadow-sm transition-all group">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-base flex-shrink-0">
                    {isImageFile(log.poDocument) ? "🖼️" : "📄"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">PO Document {i + 1}</p>
                      <span className="text-[12px] px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium">Uploaded</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {log.uploadedBy && (
                        <span className="flex items-center gap-1 text-[12px] text-gray-500 dark:text-gray-400">
                          Uploaded BY <User size={10} /> {log.uploadedBy}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-[12px] text-gray-500 dark:text-gray-400">
                        <Clock size={10} /> {fmtDate(log.poDate)}
                      </span>
                    </div>
                    {log.poNotes && (
                      <p className="mt-1 text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                        <StickyNote size={10} /> {log.poNotes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setPreviewLog(log)}
                      className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sky-500 hover:text-sky-700 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all" title="Preview">
                      <Eye size={15} />
                    </button>
                    <a href={`http://localhost:3001${log.poDocument}`} download target="_blank" rel="noreferrer"
                      className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-green-500 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all" title="Download">
                      <Download size={15} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Upload New PO ── */}
         {isCurrentStage && logs.length === 0 && ( 
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

              {/* Notes only (no PO Date field) */}
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

              {/* Error */}
              {error && (
                <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              {/* ── Two Buttons ── */}
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Button 1: Save only */}
                <button
                  onClick={handleSaveOnly}
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl border-2 border-amber-400 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-bold transition-all flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <><div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-500 rounded-full animate-spin" /> Saving...</>
                  ) : (
                    <><CheckCircle2 size={16} /> Save PO Document</>
                  )}
                </button>

                {/* Button 2: Save & Move */}
                <button
                  onClick={handleSaveAndMove}
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                >
                  {saving ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Moving...</>
                  ) : isExisting ? (
                    <><ArrowRight size={16} /> Save & Move to Project Code</>
                  ) : (
                    <><ArrowRight size={16} /> Save PO & Move Next Stage</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}