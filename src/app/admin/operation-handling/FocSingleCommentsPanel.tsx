

// @ts-nocheck

import axios from "axios";
import { useState, useRef, useEffect } from "react";
import API_BASE from "../../../../baseurl";
import { toast, Toaster } from "react-hot-toast";
import { FileText, Gift, MessageSquare, Paperclip, X } from "lucide-react";

export default function FocSingleCommentsPanel({
    focEntries,
    activeFocId,
    onSelectFoc,
    onPreview,
    order,
    onRefresh,
    token,
    currentUsername
}: {
    focEntries: any[];
    activeFocId: string | null;
    onSelectFoc: (focId: string) => void;
    onPreview: (src: string) => void;
    order: { _id: string };
    onRefresh: () => Promise<void>;
    token: string | null;
    currentUsername: string;
}) {
    const focIndex = focEntries.findIndex((f: any) => f._id === activeFocId);
    const activeFoc = focIndex >= 0 ? focEntries[focIndex] : null;

    const [chatMessage, setChatMessage] = useState("");
    const [chatAttachment, setChatAttachment] = useState<File | null>(null);
    const [chatSending, setChatSending] = useState(false);
    const [chatFileInputKey, setChatFileInputKey] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messages = activeFoc?.focChatMessages || [];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fmtDatetime = (s?: string) =>
        s ? new Date(s).toLocaleString("en-IN", {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        }) : "—";

    const sendChatMessage = async () => {
        if (!activeFoc || (!chatMessage.trim() && !chatAttachment)) return;

        // File size validation
        if (chatAttachment) {
            const isImage = chatAttachment.type.startsWith("image/");
            const isPDF = chatAttachment.type === "application/pdf";
            const fileSizeMB = chatAttachment.size / (1024 * 1024);

            if (isImage && fileSizeMB > 5) {
                toast.error("Image upload only 5 MB allowed");
                return;
            }
            if (isPDF && fileSizeMB > 10) {
                toast.error("PDF document upload only 10 MB allowed");
                return;
            }
        }

        setChatSending(true);
        try {
            const fd = new FormData();
            if (chatMessage.trim()) fd.append("message", chatMessage.trim());
            if (chatAttachment) fd.append("attachment", chatAttachment);

            await axios.post(
                `${API_BASE}admin/pipeline/${order._id}/campaign-closure/${activeFoc._id}/chat`,
                fd,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setChatMessage("");
            setChatAttachment(null);
            setChatFileInputKey((k) => k + 1);
            await onRefresh();
        } catch (e: any) {
            toast.error(e?.response?.data?.message || "Something went wrong");
        } finally {
            setChatSending(false);
        }
    };

    const isChatOpen = activeFoc ? (activeFoc.status === "pending" && !activeFoc.isAdminCreated) : false;

    const isImageUrl = (url?: string) => !!url && /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(url);

    const getDocUrl = (path?: string) => {
        if (!path) return "";
        if (path.startsWith("http")) return path;
        return `${API_BASE.replace("/api", "")}${path.startsWith("/") ? path : `/${path}`}`;
    };

    return (
        <div className="flex flex-col h-full">
             <Toaster position="top-right" />
            {/* ── FOC chip selector row ─────────────────────────────── */}
            {/* {focEntries.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mb-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                    {focEntries.map((foc: any, idx: number) => {
                        const isSelected = foc._id === activeFocId;
                        return (
                            <button
                                key={foc._id}
                                onClick={() => onSelectFoc(foc._id)}
                                className={`flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-full border transition-colors ${isSelected
                                    ? "bg-indigo-600 text-white border-indigo-600"
                                    : "bg-white dark:bg-gray-900 text-gray-500 border-gray-200 dark:border-gray-700 hover:border-indigo-300"
                                    }`}
                            >
                                <Gift size={10} />
                                FOC #{idx + 1}
                                <span className={`w-1.5 h-1.5 rounded-full ${foc.status === "approved" ? "bg-emerald-400" : "bg-orange-400"
                                    }`} />
                            </button>
                        );
                    })}
                </div>
            )} */}

            {focEntries.length > 0 && (
<div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-gray-100 dark:border-gray-800 min-w-0">
    <div className="flex items-center gap-1.5 flex-1 overflow-x-auto scrollbar-hide min-w-0">
            {focEntries.map((foc: any, idx: number) => {
                const isSelected = foc._id === activeFocId;
                return (
                    <button
                        key={foc._id}
                        onClick={() => onSelectFoc(foc._id)}
                        className={`flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-full border transition-colors ${isSelected
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white dark:bg-gray-900 text-gray-500 border-gray-200 dark:border-gray-700 hover:border-indigo-300"
                            }`}
                    >
                        {/* <Gift size={10} /> */}
                        FOC #{idx + 1}
                        <span className={`w-1.5 h-1.5 rounded-full ${foc.status === "approved" ? "bg-emerald-400" : "bg-orange-400"}`} />
                    </button>
                );
            })}
        </div>
        <button
            onClick={onRefresh}
            className="ml-auto flex items-center gap-1 text-[11px] text-gray-400 hover:text-indigo-500 transition-colors px-2 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            title="Refresh comments"
        >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M8 16H3v5" />
            </svg>
            Refresh
        </button>
    </div>
)}

            {!activeFoc ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                    <MessageSquare size={28} className="mb-2 opacity-30" />
                    <p className="text-sm">Select a FOC entry above to view its comments</p>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${activeFoc.status === "approved"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                            : "bg-orange-50 text-orange-600 border border-orange-200"
                            }`}>
                            {activeFoc.status === "approved" ? "Approved" : "Pending"}
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto min-h-0 flex flex-col space-y-3 px-1 pb-3">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <MessageSquare size={28} className="mb-2 opacity-30" />
                                <p className="text-sm">No comments yet</p>
                            </div>
                        ) : (
                            messages.map((m: any) => {
                                const isSelf = m.senderUsername === currentUsername;
                                return (
                                    <div key={m._id} className={`flex ${isSelf ? "justify-end" : "justify-start"}`}>
                                        <div className={`max-w-[75%] rounded-xl px-3 py-2 ${isSelf
                                            ? "bg-indigo-600 text-white rounded-br-sm"
                                            : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-sm"
                                            }`}>
                                            <p className="text-[12px] font-semibold mb-0.5 opacity-80">
                                                {m.senderUsername} · {m.senderRole === "admin" ? "Admin" : "Staff"}
                                            </p>
                                            {m.message && <p className="text-xs whitespace-pre-wrap">{m.message}</p>}
                                            {m.attachment && (
                                                isImageUrl(getDocUrl(m.attachment)) ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => onPreview(getDocUrl(m.attachment))}
                                                        className="block mt-1"
                                                    >
                                                        <img
                                                            src={getDocUrl(m.attachment)}
                                                            alt="attachment"
                                                            className="max-w-full rounded-lg"
                                                        />
                                                    </button>
                                                ) : (
                                                    <a
                                                        href={getDocUrl(m.attachment)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`mt-1 flex items-center gap-1 text-[11px] underline ${isSelf ? "text-indigo-100" : "text-indigo-600"}`}
                                                    >
                                                        <FileText size={11} /> View document
                                                    </a>
                                                )
                                            )}
                                            <p className={`text-[10px] mt-1 ${isSelf ? "text-indigo-200" : "text-gray-400"}`}>
                                                {fmtDatetime(m.sentAt)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {isChatOpen ? (
                        <div className="border-t border-gray-100 dark:border-gray-800 pt-2 pb-1 mt-2 flex-shrink-0">
                            {chatAttachment && (
                                <div className="flex items-center gap-2 mb-2 px-2 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-[11px]">
                                    <Paperclip size={11} className="text-gray-400" />
                                    <span className="truncate flex-1">{chatAttachment.name}</span>
                                    <button onClick={() => { setChatAttachment(null); setChatFileInputKey((k) => k + 1); }}>
                                        <X size={11} className="text-red-500" />
                                    </button>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5">
                                <input
                                    type="file"
                                    accept=".pdf,image/*"
                                    id="chat-attachment-single"
                                    key={chatFileInputKey}
                                    className="hidden"
                                    onChange={(e) => setChatAttachment(e.target.files?.[0] || null)}
                                />
                                <label
                                    htmlFor="chat-attachment-single"
                                    className="cursor-pointer w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-indigo-500 hover:border-indigo-300 flex-shrink-0"
                                >
                                    <Paperclip size={13} />
                                </label>
                                <input
                                    type="text"
                                    value={chatMessage}
                                    onChange={(e) => setChatMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    onKeyDown={(e) => { if (e.key === "Enter") sendChatMessage(); }}
                                />
                                <button
                                    onClick={sendChatMessage}
                                    disabled={chatSending || (!chatMessage.trim() && !chatAttachment)}
                                    className="w-7 h-7 flex items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white flex-shrink-0"
                                >
                                    {chatSending ? (
                                        <span className="text-[9px]">...</span>
                                    ) : (
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7Z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-[11px] text-gray-400 text-center border-t border-gray-100 dark:border-gray-800 pt-2 mt-2">
                            This FOC request is approved — chat is closed
                        </p>
                    )}
                </>
            )}
        </div>
    );
}
