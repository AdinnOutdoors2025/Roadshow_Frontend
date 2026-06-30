/* eslint-disable */
// @ts-nocheck
"use client";

import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { XCircle, Paperclip, X, FileText, AlertTriangle } from "lucide-react";
import API_BASE from "../../../../baseurl";
import { getToken } from "../../utils/auth";

interface Props {
    order: { _id: string; orderId: string ; projectCodeArray?:any[]};
    onClose: () => void;
    onSuccess: () => Promise<void> | void;
}

export default function ClosedLostModal({ order, onClose, onSuccess }: Props) {
    const [reason, setReason] = useState("");
    const [doc, setDoc] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [confirmChecked, setConfirmChecked] = useState(false);

    const handleSubmit = async () => {
        if (!reason.trim()) {
            setError("Reason is required");
            return;
        }
        if (!confirmChecked) {
            setError("Please confirm you understand this cannot be undone");
            return;
        }
        setError("");
        setLoading(true);
        try {
            const token = getToken();
            const fd = new FormData();
            fd.append("reason", reason.trim());
            if (doc) fd.append("document", doc);

            await axios.post(`${API_BASE}admin/pipeline/${order._id}/closed-lost`, fd, {
                headers: { Authorization: `Bearer ${token}` },
            });

            toast.success("Order moved to Closed Lost!");
            await onSuccess();
            onClose();
        } catch (e: any) {
            toast.error(e?.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6">

                <div className="flex justify-center mb-4">
                    <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
                        <XCircle size={26} className="text-rose-600" />
                    </div>
                </div>

                <h2 className="text-center text-base font-semibold text-gray-900 dark:text-white mb-1">
                    Move to Closed Lost?
                </h2>
                <p className="text-center text-xs text-gray-400 font-mono mb-3">
                   {order.projectCodeArray[0].projectCode}
                </p>

                <div className="flex items-start gap-2 mb-4 px-3 py-2.5 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
                    <AlertTriangle size={14} className="text-rose-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-rose-600 dark:text-rose-400">
                        Once moved to Closed Lost, this order cannot be moved to any other stage again.
                    </p>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => { setReason(e.target.value); setError(""); }}
                        rows={3}
                        placeholder="Enter reason for closing as lost..."
                        className={`w-full border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 resize-none ${error && !reason.trim() ? "border-red-400 focus:ring-red-300" : "border-gray-200 dark:border-gray-700 focus:ring-rose-400"
                            }`}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Document <span className="text-gray-400">(optional)</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-3 text-center hover:border-gray-300 transition-colors">
                        <input
                            type="file"
                            accept=".pdf,image/*"
                            id="closed-lost-doc"
                            className="hidden"
                            onChange={(e) => setDoc(e.target.files?.[0] || null)}
                        />
                        {doc ? (
                            <div className="flex items-center justify-center gap-2">
                                {doc.type.startsWith("image/") ? (
                                    <img
                                        src={URL.createObjectURL(doc)}
                                        alt="preview"
                                        className="w-12 h-12 object-cover rounded"
                                    />
                                ) : (
                                    <FileText size={20} className="text-gray-400" />
                                )}
                                <span className="text-xs text-gray-500 truncate max-w-[160px]">{doc.name}</span>
                                <button
                                    type="button"
                                    onClick={() => setDoc(null)}
                                    className="text-red-500 hover:text-red-600"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <label htmlFor="closed-lost-doc" className="cursor-pointer flex flex-col items-center text-gray-400">
                                <Paperclip size={20} className="mb-1" />
                                <span className="text-xs">Upload PDF or Image</span>
                            </label>
                        )}
                    </div>
                </div>

                <label className="flex items-start gap-2 mb-4 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={confirmChecked}
                        onChange={(e) => { setConfirmChecked(e.target.checked); setError(""); }}
                        className="mt-0.5 w-4 h-4 rounded border-gray-300 text-rose-600 accent-rose-600 cursor-pointer"
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        I understand this action is permanent and the order cannot be moved to any other stage afterwards.
                    </span>
                </label>

                {error && (
                    <p className="mb-3 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                        {error}
                    </p>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-sm font-medium transition-all"
                    >
                        {loading ? "Saving..." : "Confirm"}
                    </button>
                </div>
            </div>
        </div>
    );
}