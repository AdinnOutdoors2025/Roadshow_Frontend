


/* eslint-disable */
// @ts-nocheck

"use client";

import {
    X, ChevronRight, ChevronDown, Clock, Phone, Mail,
    MapPin, Hash, User, Tag, Calendar, Building2,
    IndianRupee, ReceiptText, Percent, Download,
    Upload, FileText, CheckCircle2, AlertCircle,
    StickyNote, Eye, Trash2, ImageIcon,
    PlusCircle, MessageSquare, MoreHorizontal,
    AlertTriangle, History, XCircle,
    Folder,
} from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import axios from "axios";
import { getToken } from "../../utils/auth";
import toast from "react-hot-toast";
import API_BASE from "../../../../baseurl";


// ─── Types ─────────────────────────────────────────────────────────────────────
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
    todoArray?: any[];
    todoUploadedBy?: string;
    projectMailLogs?: any[];
    OnRoadTab?: any[];
    isAdminCreated?: boolean;
    companyName?: string;
    clientName?: string;
    designation?: string;
    gstNumber?: string;
    customerCategory?: string;
}

const IMAGE_MIMES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const IMAGE_MAX_MB = 5;
const DOC_MAX_MB = 10;

const validateFileSize = (file: File): string | null => {
    const isImage = IMAGE_MIMES.includes(file.type);
    const fileMB = file.size / (1024 * 1024);
    if (isImage && fileMB > IMAGE_MAX_MB)
        return `Image upload only 5 MB allowed. "${file.name}" is ${fileMB.toFixed(2)} MB`;
    if (!isImage && fileMB > DOC_MAX_MB)
        return `PDF document upload only 10 MB allowed. "${file.name}" is ${fileMB.toFixed(2)} MB`;
    return null;
};



const STAGE_MAP: Record<string, { label: string; gradient: string; color: string; bg: string }> = {

    todo: { label: "To-Do", gradient: "from-slate-400 to-slate-500", color: "text-slate-700", bg: "bg-slate-100" },
    projectCodeCreation: { label: "Project Code Creation", gradient: "from-cyan-400 to-cyan-600", color: "text-cyan-700", bg: "bg-cyan-50" },
    projectExecution: { label: "Project Execution", gradient: "from-teal-400 to-teal-600", color: "text-teal-700", bg: "bg-teal-50" },
    onRoad: { label: "On Road", gradient: "from-sky-400 to-sky-600", color: "text-sky-700", bg: "bg-sky-50" },
    campaignRunning: { label: "Campaign Running", gradient: "from-indigo-400 to-indigo-600", color: "text-indigo-700", bg: "bg-indigo-50" },
    vehicleUnavailable: { label: "Vehicle Unavailable", gradient: "from-red-400 to-red-500", color: "text-red-700", bg: "bg-red-50" },
    clientClosure: { label: "Client Closure & Feedback", gradient: "from-pink-400 to-pink-600", color: "text-pink-700", bg: "bg-pink-50" },
    invoiceGeneration: { label: "Invoice Generation", gradient: "from-fuchsia-400 to-fuchsia-600", color: "text-fuchsia-700", bg: "bg-fuchsia-50" },
    paymentStage2: { label: "Payment Processing Stage 2", gradient: "from-purple-400 to-purple-600", color: "text-purple-700", bg: "bg-purple-50" },
    closedWon: { label: "Closed Won", gradient: "from-green-400 to-green-600", color: "text-green-700", bg: "bg-green-50" },
    closedLost: { label: "Closed Lost", gradient: "from-rose-400 to-rose-600", color: "text-rose-700", bg: "bg-rose-50" },
};

export default function CommentsTab({ order, onRefresh }: { order: Order; onRefresh: () => Promise<void> }) {
    const [comment, setComment] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    // ── Name Modal state ───────────────────────────────────────────────────
    const [showNameModal, setShowNameModal] = useState(false);
    const [uploaderName, setUploaderName] = useState(order.todoUploadedBy || "");
    const [nameInput, setNameInput] = useState("");
    const [nameError, setNameError] = useState("");
    const [savingName, setSavingName] = useState(false);
    const isImage = (f: string) => /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(f);

    const isTodo = order.pipelineStatus === "todo";
    const stageLabel = STAGE_MAP[order.pipelineStatus]?.label || order.pipelineStatus;

    const fmtDatetime = (s?: string) =>
        s
            ? new Date(s).toLocaleString("en-IN", {
                day: "2-digit", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit",
            })
            : "—";

    const allComments: Array<{
        text: string; by: string; at: string; stage: string; docPath?: string;
    }> = [];

    (order.todoArray || []).forEach((item: any) => {
        if (item.notes || item.document) {
            allComments.push({
                text: item.notes || "",
                by: item.uploadedBy || "—",
                at: item.uploadedAt,
                stage: "To-Do",
                docPath: item.document || undefined,
            });
        }
    });

    (order.projectExecutionArray || []).forEach((item: any) => {
        if (item.notes || item.document) {
            allComments.push({
                text: item.notes || "",
                by: item.uploadedBy || "—",
                at: item.uploadedAt,
                stage: "Project Execution",
                docPath: item.document || undefined,
            });
        }
    });

    (order.onRoadCommentsArray || []).forEach((item: any) => {
        if (item.notes || item.document) {
            allComments.push({
                text: item.notes || "",
                by: item.uploadedBy || "—",
                at: item.uploadedAt,
                stage: "On Road",
                docPath: item.document || undefined,
            });
        }
    });

    allComments.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

    // ── Submit comment (actual API call) ───────────────────────────────────
    const submitComment = async (byName: string) => {
        setSaving(true);
        try {
            const token = getToken();
            const fd = new FormData();
            fd.append("stage", order.pipelineStatus);
            fd.append("notes", comment.trim());
            fd.append("uploadedBy", byName);
            if (file) fd.append("document", file);
            await axios.post(`${API_BASE}admin/pipeline/${order._id}/documents`, fd, {
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


    const handleAddCommentClick = () => {
        if (!comment.trim() && !file) return;
        if (isTodo && !uploaderName) {
            setNameInput("");
            setNameError("");
            setShowNameModal(true);
            return;
        }
        submitComment(uploaderName || "");
    };


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
                `${API_BASE}admin/pipeline/${order._id}/todo-uploader`,
                { todoUploadedBy: name },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUploaderName(name);
            setShowNameModal(false);
            await onRefresh();
            submitComment(name);
        } catch (e: any) {
            setNameError(e?.response?.data?.message || "Save failed, try again");
        } finally {
            setSavingName(false);
        }
    };

    return (
        <div className="p-4 space-y-4">


            {showNameModal && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-5 space-y-4">
                        <div className="flex items-center gap-3">


                        </div>
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

            {/* ── Add Comment Box ── */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                        Add a comment · <span className="text-gray-400">{stageLabel}</span>
                    </p>

                    {isTodo && uploaderName && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50">
                            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white">
                                {uploaderName.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">{uploaderName}</span>
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
                    <DragDropFile
                        file={file}
                        onFile={setFile}
                        onRemove={() => { setFile(null); if (fileRef.current) fileRef.current.value = ""; }}
                        label="Attach document or image (optional)"
                    />
                    <button
                        onClick={handleAddCommentClick}
                        disabled={saving || (!comment.trim() && !file)}
                        className="w-full py-2.5 rounded-xl bg-gray-900 dark:bg-white hover:bg-gray-700 dark:hover:bg-gray-100 disabled:opacity-40 text-white dark:text-gray-900 text-sm font-semibold transition-all"
                    >
                        {saving ? "Saving..." : "Add Comment"}
                    </button>
                </div>
            </div>

            {/* ── Comments History ── */}
            <div>
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Comments History</h3>
                {allComments.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">No comments yet</div>
                ) : (
                    <div className="space-y-3">
                        {allComments.map((c, i) => {
                            const initials = (c.by || "?").charAt(0).toUpperCase();
                            const colors = ["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500"];
                            const color = colors[(c.by || "").charCodeAt(0) % colors.length];
                            return (
                                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-transparent hover:border-gray-100 dark:hover:border-gray-700/50 transition-all">
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
                                                <DocItem docPath={c.docPath} label="Attached File" />
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


// ─── Drag-Drop File Input ───────────────────────────────────────────────────────
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
        if (f) {
            const err = validateFileSize(f);
            if (err) { toast.error(err); return; }
            onFile(f);
        }
    }, [onFile]);

    return !file ? (
        <label
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            className={`flex text-[11px] flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-all ${dragging ? "border-blue-500 bg-blue-50" : "border-gray-200 dark:border-gray-600 hover:border-blue-300 hover:bg-blue-50/30"}`}
        >
            <Upload size={20} className={dragging ? "text-blue-500 mb-1" : "text-gray-300 mb-1"} />
            <p className="text-xs text-gray-400">{label || "Click or drag to upload"}</p>
            <p className="text-[11px] text-gray-300 mt-0.5">PDF, JPG, PNG</p>
            <input ref={ref} type="file" accept={accept} className="hidden"
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
                {ext === "pdf"
                    ? <FileText size={15} className="text-blue-500" />
                    : <ImageIcon size={15} className="text-blue-500" />}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{file.name}</p>
                <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemove(); if (ref.current) ref.current.value = ""; }}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 transition-all"
            >
                <Trash2 size={13} />
            </button>
        </div>
    );
}

// ─── Doc Item ───────────────────────────────────────────────────────────────────
function DocItem({ docPath, label, notes, by, at }: {
    docPath: string; label: string; notes?: string; by?: string; at?: string;
}) {

    const getFileUrl = (p: string) => {
        if (!p) return "";
        if (p.startsWith("http")) return p;
        return `http://localhost:3001${p.startsWith("/") ? p : `/${p}`}`;
    };

    const isImage = (f: string) => /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(f);

    const [preview, setPreview] = useState(false);
    const url = getFileUrl(docPath);
    if (!docPath) return null;
    return (
        <>
            {preview && <DocPreviewModal url={url} label={label} onClose={() => setPreview(false)} />}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50 hover:shadow-sm transition-all">
                <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    {isImage(docPath)
                        ? <ImageIcon size={16} className="text-blue-500" />
                        : <FileText size={16} className="text-blue-500" />}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{label}</p>
                    {notes && <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1"><StickyNote size={12} /> {notes}</p>}
                    {by && <p className="text-[11px] text-gray-400 mt-0.5">By {by} · {fmtDatetime(at)}</p>}
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

function DocPreviewModal({ url, label, onClose }: { url: string; label: string; onClose: () => void }) {
    const isImage = (f: string) => /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(f);
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
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 p-4">
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