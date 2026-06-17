


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
import {
    FiClipboard, FiSearch, FiFileText, FiRepeat,
    FiCheckCircle, FiCode, FiXCircle,
} from "react-icons/fi";
import CommentsTab from "./CommentsTab";
import PipelineHistoryTab from "./PipelineHistoryTab";
import ProjectExecutionTab from "./ProjectExecutionTab";
import ProjectExecutionHistoryTab from "./ProjectExecutionHistoryTab";
import CombinedHistoryTab from "./CombinedHistoryTab";
import OverviewTab from "./OverviewTab";
import OnRoadTab from "./OnRoadTab";
import { useVehicle } from "../../../context/vehicletypecontext";


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

type Tab = "overview" | "comments" | "pipeline" | "onRoad";


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

const NEXT_STAGE: Record<string, string> = {
    todo: "projectExecution",
    projectCodeCreation: "projectExecution",
    projectExecution: "onRoad",
    onRoad: "campaignRunning",
    campaignRunning: "clientClosure",
    clientClosure: "invoiceGeneration",
    invoiceGeneration: "paymentStage2",
    paymentStage2: "closedWon",
};

const NEXT_LABEL: Record<string, string> = {
    todo: "Move to Project Execution ⚙️",
    projectCodeCreation: "Move to Project Execution ⚙️",
    projectExecution: "Move to On Road 🚗",
    onRoad: "Move to Campaign Running 📣",
    campaignRunning: "Move to Client Closure 📝",
    clientClosure: "Move to Invoice Generation 🧾",
    invoiceGeneration: "Move to Payment Stage 2 💰",
    paymentStage2: "Move to Closed Won 🎉",
};

// ─── Formatters ─────────────────────────────────────────────────────────────────
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

const getFileUrl = (p: string) => {
    if (!p) return "";
    if (p.startsWith("http")) return p;
    return `http://localhost:3001${p.startsWith("/") ? p : `/${p}`}`;
};

const isImage = (f: string) => /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(f);


export default function DetailDrawer({
    order, onClose, onRefresh, staffAdmins = [], currentUserIsAdmin = 1,
    onStageMove, saving,
}: {
    order: Order;
    onClose: () => void;
    onRefresh: () => Promise<void>;
    staffAdmins?: { username: string }[];
    currentUserIsAdmin?: number;
    onStageMove: (order: Order, toStage: string) => void;
    saving: boolean;
}) {

    const [activeTab, setActiveTab] = useState<Tab>("overview");
    const stage = STAGE_MAP[order.pipelineStatus];
    const StageIcon = stage?.icon || FiClipboard;

    const nextStageKey = NEXT_STAGE[order.pipelineStatus];
    const nextLabel = NEXT_LABEL[order.pipelineStatus];

    const subtotal = order.bookingItems.reduce((s: number, i: any) => s + (i.totalAmount || 0), 0);
    const totalDiscount = (order.negotiationLogs || []).reduce((s, l) => s + (l.discountAmount || 0), 0);
    const taxable = subtotal - totalDiscount;
    const gstAmt = Math.floor(taxable * 0.18);
    const finalAmt = taxable + gstAmt;


      const { vehicleTypes, fetchVehicleTypes } = useVehicle();

//   useEffect(() => {
//     fetchVehicleTypes();
//   }, []);


    const projectCodes = order.projectCodeArray || [];
    const hasProjectCode = projectCodes.length > 0;


    const tabs = [
        { key: "overview", label: "Overview" },
        { key: "comments", label: "Comments" },
        { key: "history", label: "History" },
        ...(order.pipelineStatus === "projectExecution" || order.pipelineStatus === "onRoad"
            ? [{ key: "projectExecution", label: "Project Execution" }]
            : []),
        ...(order.pipelineStatus === "onRoad"
            ? [{ key: "onRoad", label: "On Road" }]
            : []),
    ];



    useEffect(() => {
        if (order.pipelineStatus === "onRoad") {
            setActiveTab("onRoad");
        } else if (order.pipelineStatus === "projectExecution") {
            setActiveTab("projectExecution");
        }
    }, [order.pipelineStatus, order._id]);


    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
            <div className="bg-white dark:bg-gray-950 w-full sm:max-w-6xl h-full sm:max-h-[92vh] flex flex-col shadow-2xl sm:rounded-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300">


                <div className="flex-shrink-0 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3 px-4 py-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${stage?.headerGrad || "from-gray-500 to-gray-600"}`}>
                            <StageIcon size={15} className="text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-base font-bold text-gray-900 dark:text-white">Order Details</span>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[13px] font-semibold ${stage?.bg || "bg-gray-100"} ${stage?.color || "text-gray-700"}`}>
                                    {stage?.label || order.pipelineStatus}
                                </span>
                            </div>
                            <p className="text-[13px] font-mono text-gray-400 mt-0.5">{order.projectCodeArray[0].projectCode}</p>
                        </div>

                    
                        {nextLabel && (
                            <button
                                onClick={() => onStageMove(order, nextStageKey)}
                                disabled={saving}
                                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold transition-all whitespace-nowrap"
                            >
                                {saving
                                    ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    : <><ChevronRight size={12} /> {STAGE_MAP[nextStageKey]?.label || "Next Stage"}</>
                                }
                            </button>
                        )}


                        {order.handlerName && (
                            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
                                    {order.handlerName.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{order.handlerName}</span>
                            </div>
                        )}

                        <button onClick={onClose}
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                            <X size={16} />
                        </button>
                    </div>


                    {nextLabel && (
                        <div className="sm:hidden flex items-center gap-2 px-4 pb-3">
                            <button
                                onClick={() => onStageMove(order, nextStageKey)}
                                disabled={saving}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold transition-all"
                            >
                                {saving ? "Moving..." : <><ChevronRight size={12} /> Move to {STAGE_MAP[nextStageKey]?.label}</>}
                            </button>
                        </div>
                    )}


                    <div className="flex items-center border-b border-gray-100 dark:border-gray-800 px-4">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-3 py-2.5 text-md font-medium border-b-2 transition-all -mb-px whitespace-nowrap ${activeTab === tab.key
                                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                                    : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>


                <div className="flex-1 overflow-y-auto">
                    {activeTab === "overview" && (
                        <div className="flex flex-col sm:flex-row h-full min-h-0">
                            {/* Main content */}
                            <div className="flex-1 overflow-y-auto sm:border-r border-gray-100 dark:border-gray-800">
                                <OverviewTab order={order} onRefresh={onRefresh} onStageMove={onStageMove} vehicleTypes={vehicleTypes} />
                            </div>


                            <div className="w-full sm:w-[240px] flex-shrink-0 overflow-y-auto p-4 space-y-3 bg-gray-50/50 dark:bg-gray-900/40">


                                <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
                                    <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Current Stage</p>
                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-bold ${stage?.bg || "bg-gray-100"} ${stage?.color || "text-gray-700"} mb-2`}>
                                        {stage?.label}
                                    </div>
                                    {order.handlerName && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                                                {order.handlerName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{order.handlerName}</p>
                                                {/* <p className="text-[10px] text-gray-400">Handler</p> */}
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


                                {hasProjectCode && (
                                    <div className="rounded-xl border border-cyan-200 dark:border-cyan-800/50 bg-white dark:bg-gray-900 overflow-hidden">

                                        <div className="flex items-center gap-2 px-3 py-2 bg-cyan-50 dark:bg-cyan-900/20 border-b border-cyan-100 dark:border-cyan-800/50">
                                            <Folder className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                                            <p className="text-xs font-bold text-cyan-700 dark:text-cyan-300 uppercase tracking-wide">
                                                Project Codes
                                            </p>
                                            <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300">
                                                {projectCodes.length}
                                            </span>
                                        </div>
                                        <div className="p-2 space-y-2">
                                            {projectCodes.map((code: any, i: number) => (
                                                <div
                                                    key={code._id || i}
                                                    className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50"
                                                >

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1 flex-wrap">
                                                            <span className="text-[15px]">Project Code:</span>
                                                            <span className="font-mono text-xs font-bold text-cyan-700 dark:text-cyan-300">
                                                                {code.projectCode}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1 flex-wrap">
                                                            <span className="text-[15px]">Estimation:</span>
                                                            <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-300">
                                                                {code.estimationCode}
                                                            </span>
                                                        </div>
                                                        <p className="text-[13px] text-gray-500 mt-0.5">
                                                            {code.savedBy} · {fmtDatetime(code.savedAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}


                                <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
                                    <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Quick Actions</p>
                                    <div className="space-y-2">
                                        {nextLabel && (
                                            <button
                                                onClick={() => onStageMove(order, nextStageKey)}
                                                disabled={saving}
                                                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gray-900 dark:bg-white hover:bg-gray-700 dark:hover:bg-gray-100 disabled:opacity-60 text-white dark:text-gray-900 text-sm font-medium  transition-all"
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

                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "comments" && (
                        <CommentsTab order={order} onRefresh={onRefresh} />
                    )}



                    {activeTab === "onRoad" && (
                        <OnRoadTab order={order} onRefresh={onRefresh} vehicleTypes={vehicleTypes} />
                    )}

                    {activeTab === "history" && (
                        <CombinedHistoryTab order={order} />
                    )}



                    {activeTab === "projectExecution" && (
                        <ProjectExecutionTab order={order} onRefresh={onRefresh} vehicleTypes={vehicleTypes} />
                    )}

                </div>
            </div>
        </div>
    );
}
