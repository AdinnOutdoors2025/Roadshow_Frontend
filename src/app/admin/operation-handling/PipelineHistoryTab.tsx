
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
    OnRoadTab?:any[];
    isAdminCreated?: boolean;
    companyName?: string;
    clientName?: string;
    designation?: string;
    gstNumber?: string;
    customerCategory?: string;
}


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


export default function PipelineHistoryTab({ order }: { order: Order }) {
    const logs = [...(order.pipelineLogs || [])].reverse();

    const fmtDatetime = (s?: string) =>
    s
        ? new Date(s).toLocaleString("en-IN", {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        })
        : "—";

    return (
        <div className="p-4 space-y-3">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-100 dark:border-violet-800/50">
                <History size={19} className="text-violet-500" />
                <span className="text-md font-bold text-violet-700 dark:text-violet-300">Pipeline History</span>
                <span className="ml-auto px-2 py-0.5 rounded-full text-[13px] font-semibold bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
                    {logs.length} events
                </span>
            </div>

            {logs.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">No pipeline history yet</div>
            ) : (
                <div className="space-y-0 pt-2">
                    {logs.map((log: any, i: number) => {
                        const toS = STAGE_MAP[log.toStage];
                        const fromS = STAGE_MAP[log.fromStage];
                        const fromLabel = log.fromStage
                            ? (fromS?.label || log.fromStage)
                            : "Start";
                        const toLabel = toS?.label || log.toStage;
                        const dotColor = toS?.gradient || "from-gray-400 to-gray-500";
                        const isLast = i === logs.length - 1;
                        // "Started at To-Do" (the very first log entry) should read the
                        // Project Code created date, matching the board card's "Created At" —
                        // not the raw document-creation timestamp on pipelineLogs[0].movedAt.
                        const displayMovedAt = !log.fromStage
                            ? (order.projectCodeArray?.[0]?.savedAt || log.movedAt)
                            : log.movedAt;

                        return (
                            <div key={i} className="flex items-start gap-3 relative">
                                {!isLast && (
                                    <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-100 dark:bg-gray-700" />
                                )}
                                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${dotColor} flex-shrink-0 flex items-center justify-center mt-0.5 relative z-10`}>
                                    <div className="w-2.5 h-2.5 rounded-full bg-white/70" />
                                </div>
                                <div className="flex-1 pb-4">
                                    <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-3 border border-gray-100 dark:border-gray-700/50">
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                            {log.fromStage
                                                ? `${fromLabel} → ${toLabel}`
                                                : `Started at ${toLabel}`}
                                        </p>
                                        {log.notes?.trim() && (
                                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 italic">{log.notes}</p>
                                        )}
                                        <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-400 flex-wrap">
                                            <span>By {log.movedBy || "—"}</span>
                                            {log.handlerName && <><span>·</span><span>Assigned By: {log.handlerName}</span></>}
                                            <span>·</span>
                                            <span>{fmtDatetime(displayMovedAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}