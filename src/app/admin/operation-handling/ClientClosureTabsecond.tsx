
/* eslint-disable */
// @ts-nocheck

"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../../utils/auth";
import toast from "react-hot-toast";
import API_BASE from "../../../../baseurl";
import {
    MessageSquare,
    Clock,
    ChevronDown,
    CheckCircle2,
    ShieldCheck,
    Gift,
    Wallet,
    FileText,
    Paperclip,
    X,
    Eye,
} from "lucide-react";
import OrderDatePicker from "@/app/utils/OrderDatePicker";
import FocSingleCommentsPanel from "./FocSingleCommentsPanel";

interface Order {
    _id: string;
    handlerName?: string;
    clientFeedbackHistory?: any[];
    campaignClosureArray?: any[];
    bookingItems?: any[];
}

const fmtDatetime = (s?: string) =>
    s ? new Date(s).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    }) : "—";

const fmtDateOnly = (s?: string) =>
    s ? new Date(s).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
    }) : "—";

const getRatingStyle = (rating: string) => {
    if (rating === "Good") return { bg: "bg-green-100", color: "text-green-700", border: "border-green-200" };
    if (rating === "Average") return { bg: "bg-yellow-100", color: "text-yellow-700", border: "border-yellow-200" };
    if (rating === "Poor") return { bg: "bg-red-100", color: "text-red-700", border: "border-red-200" };
    return { bg: "bg-gray-100", color: "text-gray-700", border: "border-gray-200" };
};

const fieldLabel: Record<string, string> = {
    reason: "Reason",
    fromDate: "From Date",
    toDate: "To Date",
    document: "Document",
};

const isImageUrl = (url?: string) => !!url && /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(url);

const getDocUrl = (path?: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${API_BASE.replace("/api", "")}${path.startsWith("/") ? path : `/${path}`}`;
};




function FieldDiff({ field, oldVal, newVal, onPreview }: { field: string; oldVal: any; newVal: any; onPreview: (src: string) => void }) {
    if (field === "document") {
        const oldUrl = oldVal ? getDocUrl(oldVal) : "";
        const newUrl = newVal ? getDocUrl(newVal) : "";
        return (
            <div className="flex items-center gap-2 mt-1">
                <span className="font-medium text-gray-500">{fieldLabel.document}:</span>
                <div className="flex items-center gap-1.5">
                    {oldUrl ? (
                        isImageUrl(oldUrl) ? (
                            <button
                                type="button"
                                onClick={() => onPreview(oldUrl)}
                                className="block"
                            >
                                <img
                                    src={oldUrl}
                                    alt="old document"
                                    className="w-8 h-8 rounded object-cover border border-gray-200 dark:border-gray-700 hover:opacity-80"
                                />
                            </button>
                        ) : (
                            <a href={oldUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-400 hover:text-indigo-500">
                                <FileText size={16} />
                            </a>
                        )
                    ) : (
                        <span className="text-gray-400">—</span>
                    )}
                    <span className="text-gray-400">→</span>
                    {newUrl ? (
                        isImageUrl(newUrl) ? (
                            <button
                                type="button"
                                onClick={() => onPreview(newUrl)}
                                className="block"
                            >
                                <img
                                    src={newUrl}
                                    alt="new document"
                                    className="w-8 h-8 rounded object-cover border border-gray-200 dark:border-gray-700 hover:opacity-80"
                                />
                            </button>
                        ) : (
                            <a href={newUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-indigo-500 hover:underline">
                                <FileText size={14} /> View
                            </a>
                        )
                    ) : (
                        <span className="text-gray-400">—</span>
                    )}
                </div>
            </div>
        );
    }

    const fmtVal = (v: any) => {
        if (v === null || v === undefined || v === "") return "—";
        if (field === "fromDate" || field === "toDate") return fmtDateOnly(v);
        return String(v);
    };

    return (
        <p className="text-gray-500 mt-0.5">
            <span className="font-medium">{fieldLabel[field] || field}:</span>{" "}
            {fmtVal(oldVal)} → {fmtVal(newVal)}
        </p>
    );
}


export default function ClientClosureTabSecond({
    order,
    onRefresh,
    bookingItemId,
    isAdmin = 1, autoOpenFoc = false,
}: {
    order: Order;
    onRefresh: () => Promise<void>;
    bookingItemId?: string;
    isAdmin?: number;
    autoOpenFoc?: boolean
}) {
    // const [mainTab, setMainTab] = useState<"feedback" | "campaignStatus">("feedback");
    const [mainTab, setMainTab] = useState(
        autoOpenFoc ? "campaignStatus" : "feedback"
    );

    // Feedback state
    const [comments, setComments] = useState("");
    const [rating, setRating] = useState("");
    const [feedbackLoading, setFeedbackLoading] = useState(false);

    // Campaign Status state
    const [extendedTab, setExtendedTab] = useState<"foc" | "paid">("foc");

    const currentBookingItem = order.bookingItems?.find(
        (item: any) => String(item._id) === String(bookingItemId)
    );



    const currentItemToDate = currentBookingItem?.toDate
        ? new Date(currentBookingItem.toDate).toISOString().split("T")[0]
        : "";


    const focEntriesForItem = (order.campaignClosureArray || []).filter((c: any) => {
        if (c.type !== "foc") return false;
        if (!bookingItemId) return false;
        const cId = (typeof c.bookingItemId === "object" && c.bookingItemId !== null)
            ? (c.bookingItemId.$oid || c.bookingItemId._id || c.bookingItemId.toString())
            : String(c.bookingItemId ?? "");
        return cId === String(bookingItemId);
    });

    const focHistory = focEntriesForItem; // alias used for the history list below
    const pendingFoc = focEntriesForItem.find((f: any) => f.status === "pending" || !f.status);


    const [focReason, setFocReason] = useState(pendingFoc?.reason || "");
    const [focFromDate, setFocFromDate] = useState(
        pendingFoc?.fromDate
            ? new Date(pendingFoc.fromDate).toISOString().split("T")[0]
            : currentItemToDate
    );
    const [focToDate, setFocToDate] = useState(
        pendingFoc?.toDate ? new Date(pendingFoc.toDate).toISOString().split("T")[0] : ""
    );
    const [focDoc, setFocDoc] = useState<File | null>(null);
    const [focLoading, setFocLoading] = useState(false);
    const [approveLoading, setApproveLoading] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewSrc, setPreviewSrc] = useState("");
    // Paid form
    const [paidFromDate] = useState(currentItemToDate);
    const [paidToDate, setPaidToDate] = useState("");
    const [paidLoading, setPaidLoading] = useState(false);
    const [localPreviewUrl, setLocalPreviewUrl] = useState("");
    const [fileInputKey, setFileInputKey] = useState(0);
    const [historyPanelTab, setHistoryPanelTab] = useState<"history" | "comments">("history");
    const [activeCommentFocId, setActiveCommentFocId] = useState<string | null>(null);
    const token = getToken();


    useEffect(() => {
        setFocReason(pendingFoc?.reason || "");
        setFocFromDate(
            pendingFoc?.fromDate
                ? new Date(pendingFoc.fromDate).toISOString().split("T")[0]
                : currentItemToDate
        );
        setFocToDate(
            pendingFoc?.toDate ? new Date(pendingFoc.toDate).toISOString().split("T")[0] : ""
        );
        setFocDoc(null);
    }, [pendingFoc?._id]);


    // ── Submit Feedback ───────────────────────────────────────────
    const submitFeedback = async () => {
        setFeedbackLoading(true);
        try {
            const fd = new FormData();
            if (bookingItemId) fd.append("bookingItemId", bookingItemId);
            if (comments.trim()) fd.append("comments", comments.trim());
            if (rating) fd.append("rating", rating);

            await axios.post(`${API_BASE}admin/pipeline/${order._id}/client-feedback`, fd, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Feedback submitted!");
            setComments("");
            setRating("");
            await onRefresh();
        } catch (e: any) {
            toast.error(e?.response?.data?.message || "Something went wrong");
        } finally {
            setFeedbackLoading(false);
        }
    };


    const submitClosure = async (type: "foc" | "paid") => {
        if (type === "foc") setFocLoading(true);
        if (type === "paid") setPaidLoading(true);

        try {
            const fd = new FormData();
            fd.append("type", type);

            if (type === "foc") {
                if (!focReason.trim()) { toast.error("Reason is required"); return; }
                if (!focToDate) { toast.error("To date is required"); return; }
                fd.append("reason", focReason.trim());
                fd.append("fromDate", focFromDate);
                fd.append("toDate", focToDate);
                if (focDoc) fd.append("document", focDoc);
                if (bookingItemId) fd.append("bookingItemId", bookingItemId);
            }

            if (type === "paid") {
                if (!paidToDate) { toast.error("To date is required"); return; }
                fd.append("fromDate", paidFromDate);
                fd.append("toDate", paidToDate);
                if (bookingItemId) fd.append("bookingItemId", bookingItemId);
            }

            await axios.post(`${API_BASE}admin/pipeline/${order._id}/campaign-closure`, fd, {
                headers: { Authorization: `Bearer ${token}` },
            });

            toast.success(
                type === "foc"
                    ? (pendingFoc ? "FOC request updated!" : "FOC request submitted!")
                    : "Extended details saved!"
            );

            if (type === "foc") { setFocDoc(null); setFileInputKey((k) => k + 1); }
            if (type === "paid") { setPaidToDate(""); }

            await onRefresh();
        } catch (e: any) {
            toast.error(e?.response?.data?.message || "Something went wrong");
        } finally {
            setFocLoading(false);
            setPaidLoading(false);
        }
    };


    const approveFoc = async () => {
        if (!pendingFoc?._id) return;
        if (!focReason.trim()) { toast.error("Reason is required"); return; }
        if (!focToDate) { toast.error("To date is required"); return; }

        setApproveLoading(true);
        try {

            const updateFd = new FormData();
            updateFd.append("type", "foc");
            updateFd.append("reason", focReason.trim());
            updateFd.append("fromDate", focFromDate);
            updateFd.append("toDate", focToDate);
            if (focDoc) updateFd.append("document", focDoc);
            if (bookingItemId) updateFd.append("bookingItemId", bookingItemId);

            await axios.post(`${API_BASE}admin/pipeline/${order._id}/campaign-closure`, updateFd, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // 2) Approve the (now updated) pending entry
            await axios.patch(
                `${API_BASE}admin/pipeline/${order._id}/campaign-closure/${pendingFoc._id}/approve`,
                new FormData(),
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success("FOC extension approved!");
            setFocDoc(null);
            setFileInputKey((k) => k + 1);
            await onRefresh();
        } catch (e: any) {
            toast.error(e?.response?.data?.message || "Something went wrong");
        } finally {
            setApproveLoading(false);
        }
    };

    const createAndApproveFoc = async () => {
        if (!focReason.trim()) { toast.error("Reason is required"); return; }
        if (!focFromDate) { toast.error("From date is required"); return; }
        if (!focToDate) { toast.error("To date is required"); return; }

        setApproveLoading(true);
        try {
            const fd = new FormData();
            fd.append("reason", focReason.trim());
            fd.append("fromDate", focFromDate);
            fd.append("toDate", focToDate);
            if (focDoc) fd.append("document", focDoc);
            if (bookingItemId) fd.append("bookingItemId", bookingItemId);

            await axios.post(`${API_BASE}admin/pipeline/${order._id}/foc/create-and-approve`, fd, {
                headers: { Authorization: `Bearer ${token}` },
            });

            toast.success("FOC extension created and approved!");
            setFocDoc(null);
            setFileInputKey((k) => k + 1);
            await onRefresh();
        } catch (e: any) {
            toast.error(e?.response?.data?.message || "Something went wrong");
        } finally {
            setApproveLoading(false);
        }
    };

    const feedbackHistory = (order.clientFeedbackHistory || []).filter((fb: any) => {
        if (!bookingItemId) return false;
        const fbId =
            (typeof fb.bookingItemId === "object" && fb.bookingItemId !== null)
                ? (fb.bookingItemId.$oid || fb.bookingItemId._id || fb.bookingItemId.toString())
                : String(fb.bookingItemId ?? "");
        return fbId === String(bookingItemId);
    });


    useEffect(() => {
        if (focDoc) {
            const url = URL.createObjectURL(focDoc);
            setLocalPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setLocalPreviewUrl("");
        }
    }, [focDoc]);

    const isSuperAdmin = Number(isAdmin) === 1;




    const pendingDocUrl = pendingFoc?.document ? getDocUrl(pendingFoc.document) : "";
    const displayDocUrl = localPreviewUrl || pendingDocUrl;
    const displayIsImage = focDoc ? focDoc.type.startsWith("image/") : isImageUrl(pendingDocUrl);

    const openPreview = (src: string) => {
        setPreviewSrc(src);
        setPreviewOpen(true);
    };

    const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
    const MAX_DOC_SIZE = 10 * 1024 * 1024;

    const handleFocFileChange = (file: File | null) => {
        if (!file) {
            setFocDoc(null);
            return;
        }

        const isImage = file.type.startsWith("image/");

        if (isImage && file.size > MAX_IMAGE_SIZE) {
            toast.error("Image upload only 5 MB");
            return;
        }

        if (!isImage && file.size > MAX_DOC_SIZE) {
            toast.error("Document upload only 10 MB");
            return;
        }

        setFocDoc(file);
    };


    return (
        <div className="p-4 h-full flex flex-col">

            {/* Main Tabs */}
            <div className="flex gap-1 mb-4 border-b border-gray-100 dark:border-gray-800">
                {[
                    { key: "feedback", label: "Feedback" },
                    { key: "campaignStatus", label: "Campaign Status" },
                ].map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setMainTab(t.key as any)}
                        className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${mainTab === t.key
                            ? "border-blue-500 text-blue-600 dark:text-blue-400"
                            : "border-transparent text-gray-400 hover:text-gray-600"
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ── Feedback Tab ────────────────────────────────────── */}
            {mainTab === "feedback" && (
                <div className="flex flex-col sm:flex-row gap-4 flex-1 min-h-0">
                    <div className="w-full sm:w-[340px] flex-shrink-0">
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                                Add Feedback
                            </h3>
                            <div className="mb-4">
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                    Comments <span className="text-gray-400">(optional)</span>
                                </label>
                                <textarea
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    rows={4}
                                    placeholder="Enter client feedback..."
                                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                    Rating <span className="text-gray-400">(optional)</span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={rating}
                                        onChange={(e) => setRating(e.target.value)}
                                        className="w-full appearance-none border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 pr-8"
                                    >
                                        <option value="">-- Select Rating --</option>
                                        <option value="Good">Good</option>
                                        <option value="Average">Average</option>
                                        <option value="Poor">Poor</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-2.5 top-3 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                            <button
                                onClick={submitFeedback}
                                disabled={feedbackLoading || (!comments.trim() && !rating)}
                                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-all"
                            >
                                {feedbackLoading ? "Submitting..." : "Submit Feedback"}
                            </button>
                        </div>
                    </div>


                    <div className="flex-1 overflow-y-auto max-h-[400px]"> {/* Add max-height or fixed height */}
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 sticky top-0 bg-white dark:bg-gray-800 z-10 py-2">
                            Feedback History ({feedbackHistory.length})
                        </h3>
                        {feedbackHistory.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <MessageSquare size={32} className="mb-2 opacity-30" />
                                <p className="text-sm">No feedback yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {[...feedbackHistory].reverse().map((fb: any) => {
                                    const style = getRatingStyle(fb.rating);
                                    return (
                                        <div key={fb._id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                                                        {(fb.createdBy || "A").charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        {fb.createdBy || "Admin"}
                                                    </span>
                                                </div>
                                                {fb.rating && (
                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${style.bg} ${style.color} ${style.border}`}>
                                                        {fb.rating}
                                                    </span>
                                                )}
                                            </div>
                                            {fb.comments && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{fb.comments}</p>
                                            )}
                                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                                <Clock size={10} />
                                                {fmtDatetime(fb.createdDate)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}


            {mainTab === "campaignStatus" && (
                <div className="flex-1 min-h-0 overflow-y-auto">

                    <div className="flex gap-1 mb-4 border-b border-gray-100 dark:border-gray-800">
                        {[
                            { key: "foc", label: "FOC" },
                            // { key: "paid", label: "Paid Extended" },
                        ].map((t) => (
                            <button
                                key={t.key}
                                onClick={() => setExtendedTab(t.key as any)}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-all -mb-px ${extendedTab === t.key
                                    ? "border-indigo-500 text-indigo-600"
                                    : "border-transparent text-gray-400 hover:text-gray-600"
                                    }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col lg:flex-row gap-4">

                        {/* FOC Form */}
                        {extendedTab === "foc" && (
                            <>
                                <div className="w-full lg:max-w-lg lg:flex-1 min-w-0">
                                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                                {isSuperAdmin
                                                    ? <ShieldCheck size={16} className="text-indigo-600" />
                                                    : <Gift size={16} className="text-indigo-600" />}
                                            </div>
                                            <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200">
                                                {isSuperAdmin
                                                    ? (pendingFoc ? "Review FOC Request" : "Create FOC Extension")
                                                    : (pendingFoc ? "Update FOC Request" : "FOC Extension")}
                                            </h3>
                                            {pendingFoc && (
                                                <span className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
                                                    Pending
                                                </span>
                                            )}
                                        </div>


                                        <>

                                            <div className="mb-3">
                                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                                    Reason <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                    value={focReason}
                                                    onChange={(e) => setFocReason(e.target.value)}
                                                    rows={3}
                                                    placeholder="Enter reason for FOC extension..."
                                                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                                        From Date <span className="text-red-500">*</span>
                                                        {isSuperAdmin && (
                                                            <span className="text-[10px] text-indigo-500 ml-1">(editable)</span>
                                                        )}
                                                    </label>
                                                    {isSuperAdmin ? (
                                                        <OrderDatePicker
                                                            value={focFromDate}
                                                            onChange={setFocFromDate}
                                                            placeholder="Select from date"
                                                        />
                                                    ) : (
                                                        <div className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 text-gray-500 cursor-not-allowed">
                                                            {fmtDateOnly(focFromDate)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                                        To Date <span className="text-red-500">*</span>
                                                    </label>
                                                    <OrderDatePicker
                                                        value={focToDate}
                                                        onChange={setFocToDate}
                                                        placeholder="Select to date"
                                                        minDate={focFromDate}
                                                    />
                                                </div>
                                            </div>


                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                                    Document / Image <span className="text-gray-400">(optional)</span>
                                                </label>
                                                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center hover:border-gray-300 transition-colors">
                                                    <input
                                                        type="file"
                                                        accept=".pdf,image/*"
                                                        id="foc-doc"
                                                        key={fileInputKey}
                                                        className="hidden"
                                                        // onChange={(e) => setFocDoc(e.target.files?.[0] || null)}
                                                        onChange={(e) => handleFocFileChange(e.target.files?.[0] || null)}
                                                    />
                                                    {displayDocUrl ? (
                                                        <div className="w-full">
                                                            {displayIsImage ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openPreview(displayDocUrl)}
                                                                    className="relative w-full rounded overflow-hidden group block"
                                                                >
                                                                    <img
                                                                        src={displayDocUrl}
                                                                        alt="document preview"
                                                                        className="w-full h-28 object-cover rounded"
                                                                    />
                                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all">
                                                                        <Eye size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                    </div>
                                                                </button>
                                                            ) : (
                                                                <a
                                                                    href={displayDocUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center justify-center gap-2 py-3 text-sm text-gray-500"
                                                                >
                                                                    <FileText size={18} />
                                                                    {focDoc ? focDoc.name : "View document"}
                                                                </a>
                                                            )}
                                                            <div className="flex items-center justify-center gap-3 mt-2">
                                                                <label htmlFor="foc-doc" className="text-xs text-indigo-500 hover:underline cursor-pointer">
                                                                    Replace
                                                                </label>
                                                                {focDoc && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setFocDoc(null)}
                                                                        className="text-xs text-red-500 hover:underline flex items-center gap-1"
                                                                    >
                                                                        <X size={11} /> Remove new file
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <label htmlFor="foc-doc" className="cursor-pointer flex flex-col items-center">
                                                            <Paperclip size={22} className="mb-1 text-gray-400" />
                                                            <p className="text-xs text-gray-500">Upload PDF or Image</p>
                                                        </label>
                                                    )}
                                                </div>
                                            </div>

                                            {isSuperAdmin ? (
                                                pendingFoc ? (
                                                    <button
                                                        onClick={approveFoc}
                                                        disabled={approveLoading || pendingFoc?.status === "approved" || !focReason.trim() || !focFromDate || !focToDate}
                                                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold transition-all"
                                                    >
                                                        <CheckCircle2 size={16} />
                                                        {approveLoading ? "Approving..." : "Approve FOC Extension"}
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={createAndApproveFoc}
                                                        disabled={approveLoading || !focReason.trim() || !focFromDate || !focToDate}
                                                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold transition-all"
                                                    >
                                                        <CheckCircle2 size={16} />
                                                        {approveLoading ? "Creating..." : "Create & Approve FOC Extension"}
                                                    </button>
                                                )
                                            ) : (
                                                <button
                                                    onClick={() => submitClosure("foc")}
                                                    disabled={focLoading || !focReason.trim() || !focFromDate || !focToDate}
                                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold transition-all"
                                                >
                                                    <Gift size={16} />
                                                    {focLoading
                                                        ? "Submitting..."
                                                        : pendingFoc
                                                            ? "Update FOC Request"
                                                            : "Submit FOC Extension"}
                                                </button>
                                            )}
                                        </>
                                    </div>
                                </div>

                                <div className="w-full lg:w-[500px] flex-shrink-0 min-w-0 flex flex-col h-[420px] lg:h-[500px]">
                                    <div className="flex items-center gap-3 mb-3 sticky top-0 bg-white dark:bg-gray-800 z-10 py-2">
                                        <button
                                            onClick={() => setHistoryPanelTab("history")}
                                            className={`text-sm font-semibold pb-1 border-b-2 transition-colors ${historyPanelTab === "history"
                                                ? "border-indigo-500 text-gray-700 dark:text-gray-300"
                                                : "border-transparent text-gray-400 hover:text-gray-600"
                                                }`}
                                        >
                                            FOC History ({focHistory.length})
                                        </button>

                                        <button
                                            onClick={() => {
                                                setHistoryPanelTab("comments");
                                                if (!activeCommentFocId && focHistory.length > 0) {
                                                    setActiveCommentFocId(focHistory[0]._id);
                                                }
                                            }}
                                            className={`text-sm font-semibold pb-1 border-b-2 transition-colors flex items-center gap-1 ${historyPanelTab === "comments"
                                                ? "border-blue-500 text-gray-700 dark:text-gray-300"
                                                : "border-transparent text-gray-400 hover:text-gray-600"
                                                }`}
                                        >
                                            <MessageSquare size={13} />
                                            Comments
                                        </button>
                                    </div>


                                    <div className="flex-1 overflow-y-auto min-h-0">
                                        {historyPanelTab === "history" ? (
                                            focHistory.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                                    <p className="text-sm">No FOC entries yet</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {[...focHistory].reverse().map((foc: any, displayIdx: number) => {
                                                        const sequenceNumber = focHistory.length - displayIdx;
                                                        return (
                                                            <FocHistoryCard
                                                                key={foc._id}
                                                                foc={foc}
                                                                onPreview={openPreview}
                                                                index={sequenceNumber}
                                                                order={order}
                                                                onRefresh={onRefresh}
                                                                token={token}
                                                                onOpenComments={(focId) => {
                                                                    setActiveCommentFocId(focId);
                                                                    setHistoryPanelTab("comments");
                                                                }}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            )
                                        ) : (

                                            <FocSingleCommentsPanel
                                                focEntries={focHistory}
                                                activeFocId={activeCommentFocId}
                                                onSelectFoc={(focId) => setActiveCommentFocId(focId)}
                                                onPreview={openPreview}
                                                order={order}
                                                onRefresh={onRefresh}
                                                token={token}
                                                currentUsername={(() => {
                                                    try {
                                                        if (!token) return "";
                                                        const payload = JSON.parse(atob(token.split(".")[1]));
                                                        return payload.username || "";
                                                    } catch {
                                                        return "";
                                                    }
                                                })()}
                                            />
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Paid Extension */}
                        {extendedTab === "paid" && (
                            <div className="w-full lg:max-w-lg">
                                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                            <Wallet size={16} className="text-purple-600" />
                                        </div>
                                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Paid Extension</h3>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                                From Date <span className="text-xs text-gray-400">(campaign end)</span>
                                            </label>
                                            <div className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 text-gray-500 cursor-not-allowed">
                                                {fmtDateOnly(paidFromDate)}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                                To Date <span className="text-red-500">*</span>
                                            </label>
                                            <OrderDatePicker
                                                value={paidToDate}
                                                onChange={setPaidToDate}
                                                placeholder="Select to date"
                                                minDate={paidFromDate}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => submitClosure("paid")}
                                        disabled={paidLoading || !paidToDate}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-semibold transition-all"
                                    >
                                        <Wallet size={16} />
                                        {paidLoading ? "Submitting..." : "Submit Paid Extension"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Full-size document preview modal ─────────────────── */}
            {previewOpen && previewSrc && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
                    onClick={() => setPreviewOpen(false)}
                >
                    <button
                        onClick={() => setPreviewOpen(false)}
                        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                    <img
                        src={previewSrc}
                        alt="Document full preview"
                        className="max-w-full max-h-full rounded-lg object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
}



function FocHistoryCard({
    foc,
    onPreview,
    index,
    order,
    onRefresh,
    token,
    onOpenComments,
}: {
    foc: any;
    onPreview: (src: string) => void;
    index: number;
    order: { _id: string };
    onRefresh: () => Promise<void>;
    token: string | null;
    onOpenComments: (focId: string) => void;
}) {
    const fromDateStr = fmtDateOnly(foc.fromDate);
    const toDateStr = fmtDateOnly(foc.toDate);
    const history = foc.focHistory || [];
    const status = foc.status || "pending";
    const docUrl = foc.document ? getDocUrl(foc.document) : "";
    const messages = foc.focChatMessages || [];
    const hasChat = !foc.isAdminCreated;

    const [historyExpanded, setHistoryExpanded] = useState(false);

    const projectCode = (order as any)?.projectCodeArray?.[0]?.projectCode || "";
    const customerName = (order as any)?.clientName || "";
    const purposeLabel =
        foc.focPurpose === "absent-day"
            ? "Vehicle Absent — Extend +1 Day"
            : foc.focPurpose === "compensation-hours"
            ? "Extra Working Hours Compensation"
            : foc.focPurpose === "compensation-days"
            ? "Extra Campaign Days Compensation"
            : null;
    const compensationValue =
        foc.focPurpose === "compensation-hours"
            ? foc.compensationHoursValue
            : foc.focPurpose === "compensation-days"
            ? foc.compensationDaysValue
            : null;
    const compensationValueLabel =
        foc.focPurpose === "compensation-hours" && compensationValue
            ? `${compensationValue}h`
            : foc.focPurpose === "compensation-days" && compensationValue
            ? `${compensationValue} day(s)`
            : null;
    // Issue day = the date the loss/absence happened (fromDate for
    // absent-day/hours requests raised from that same day's Daily Timeline).
    // Compensation applied range = fromDate→toDate this FOC actually covers.
    const isSameDayApplication = fromDateStr === toDateStr;

    return (
        <div className={`bg-white dark:bg-gray-900 rounded-xl border p-3 ${status === "approved"
            ? "border-emerald-100 dark:border-emerald-800/30"
            : "border-orange-100 dark:border-orange-800/30"
            }`}>
            {(projectCode || customerName) && (
                <div className="flex items-center gap-2 flex-wrap mb-1.5 text-[11px] text-gray-400">
                    {projectCode && <span className="font-mono font-semibold text-gray-600 dark:text-gray-300">{projectCode}</span>}
                    {projectCode && customerName && <span>·</span>}
                    {customerName && <span>{customerName}</span>}
                </div>
            )}

            <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                    <Gift size={11} /> FOC #{index}
                </span>

                <div className="flex items-center gap-2 flex-wrap">
                    {hasChat && (
                        <button
                            onClick={() => onOpenComments(foc._id)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors shrink-0"
                        >
                            <MessageSquare size={11} />
                            Comments {messages.length > 0 ? `(${messages.length})` : ""}
                        </button>
                    )}
                    {status === "approved" ? (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center gap-1 shrink-0">
                            <CheckCircle2 size={11} /> Approved
                        </span>
                    ) : (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200 shrink-0">
                            Pending
                        </span>
                    )}
                </div>
            </div>

            {(purposeLabel || compensationValueLabel) && (
                <div className="flex items-center gap-2 flex-wrap mb-2">
                    {purposeLabel && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-200">
                            {purposeLabel}
                        </span>
                    )}
                    {compensationValueLabel && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-50 text-gray-600 border border-gray-200">
                            Value: {compensationValueLabel}
                        </span>
                    )}
                </div>
            )}

            <p className="text-md text-gray-700 dark:text-gray-300 mb-2 break-words">{foc.reason || "—"}</p>
            <div className="flex items-center gap-2 text-sm text-gray-400 flex-wrap">
                <Clock size={10} />
                {isSameDayApplication
                    ? <>Compensation applied on {fromDateStr} (same date)</>
                    : <>Compensation applied: {fromDateStr} → {toDateStr} (split)</>}
            </div>
            <p className="text-sm text-gray-400 mt-1">Requested by {foc.createdBy}</p>

            {docUrl && (
                <div className="mt-2">
                    {isImageUrl(docUrl) ? (
                        <button
                            type="button"
                            onClick={() => onPreview(docUrl)}
                            className="relative w-16 h-16 rounded overflow-hidden border border-gray-200 dark:border-gray-700 group"
                        >
                            <img src={docUrl} alt="current document" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all">
                                <Eye size={13} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </button>
                    ) : (
                        <a
                            href={docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-indigo-500 hover:underline"
                        >
                            <FileText size={12} /> View current document
                        </a>
                    )}
                </div>
            )}

            {status === "approved" && foc.approvedBy && (
                <p className="text-xs text-emerald-600 mt-2">
                    Approved by {foc.approvedBy} · {fmtDatetime(foc.approvedAt)}
                </p>
            )}

            {/* ── View/Hide changes ──────────────────────────────────── */}
            {history.length > 0 && (
                <div className="mt-3 border-t border-gray-100 dark:border-gray-800 pt-2">
                    <button
                        onClick={() => setHistoryExpanded((p) => !p)}
                        className="text-[13px] text-gray-400 hover:text-indigo-500 flex items-center gap-1"
                    >
                        <ChevronDown size={11} className={`transition-transform ${historyExpanded ? "rotate-180" : ""}`} />
                        {historyExpanded ? "Hide" : "View"} changes ({history.length})
                    </button>

                    {historyExpanded && (
                        <div className="mt-2 space-y-2">
                            {[...history].reverse().map((h: any, i: number) => (
                                <div key={h._id || i} className="text-[11px] bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
                                    <div className="flex text-sm items-center justify-between mb-1 flex-wrap gap-1">
                                        <span className={`font-semibold capitalize ${h.action === "approved"
                                            ? "text-emerald-600"
                                            : h.action === "created"
                                                ? "text-indigo-600"
                                                : "text-orange-600"
                                            }`}>
                                            {h.action}
                                        </span>
                                        <span className="text-gray-400">{fmtDatetime(h.changedAt)}</span>
                                    </div>
                                    <p className="text-gray-500 text-sm">by {h.changedBy}</p>
                                    {h.changedFields && Object.keys(h.changedFields).length > 0 && (
                                        <div className="mt-1 space-y-1 text-sm">
                                            {Object.entries(h.changedFields).map(([field, vals]: any) => (
                                                <FieldDiff key={field} field={field} oldVal={vals?.old} newVal={vals?.new} onPreview={onPreview} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}
