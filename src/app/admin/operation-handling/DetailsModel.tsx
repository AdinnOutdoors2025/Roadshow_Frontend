


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

// ─── Doc Preview Modal ──────────────────────────────────────────────────────────
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

// ─── Doc Item ───────────────────────────────────────────────────────────────────
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
        if (f) onFile(f);
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
                onChange={(e) => onFile(e.target.files?.[0] || null)} />
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

// ─── Vehicle Item Card ──────────────────────────────────────────────────────────
function VehicleItemCard({ item, index }: { item: any; index: number }) {
    const [open, setOpen] = useState(false);

    const fmtDate = (s: string) =>
        s ? new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

    const campaignLabel =
        item.campaignType === "Other" ? item.otherCampaignType || "Other" : item.campaignType || "—";
    const locationLabel = [item.state, item.city].filter(Boolean).join(" / ") || "—";
    const drivingRoute =
        item.fromLocation && item.toLocation ? `${item.fromLocation} → ${item.toLocation}` : null;

    return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-left hover:brightness-95 transition-all"
            >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0">
                    V{index + 1}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">
                        {item.vehicleModel || "Vehicle Details"}
                    </p>
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
                            item.fromDate && {
                                label: "Duration",
                                value: `${fmtDate(item.fromDate)} → ${fmtDate(item.toDate)} (${item.totalDays}d)`,
                            },
                            drivingRoute && { label: "Route", value: drivingRoute },
                            item.extraKm > 0 && { label: "Extra KM", value: `${item.extraKm} km` },
                            item.extraHours > 0 && { label: "Extra Hours", value: `${item.extraHours} hrs` },
                            item.quantity && { label: "Quantity", value: `${item.quantity} vehicles` },
                        ]
                            .filter(Boolean)
                            .map((f: any, i: number) => (
                                <div key={i}>
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{f.label}</p>
                                    <p className="text-gray-800 dark:text-gray-200 font-medium">{f.value}</p>
                                </div>
                            ))}
                    </div>

                    {/* Price */}
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-2 space-y-1">
                        {item.rentalCost > 0 && (
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Rental</span>
                                <span className="font-semibold">{fmt(item.rentalCost)}</span>
                            </div>
                        )}
                        {item.promoterCost > 0 && (
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Promoter</span>
                                <span className="font-semibold">{fmt(item.promoterCost)}</span>
                            </div>
                        )}
                        {item.rtoCost > 0 && (
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">RTO</span>
                                <span className="font-semibold">{fmt(item.rtoCost)}</span>
                            </div>
                        )}
                        {(item.additionalFields || []).filter((f: any) => f.label).map((f: any, i: number) => (
                            <div key={i} className="flex justify-between text-xs">
                                <span className={f.mode === "-" ? "text-red-500" : "text-gray-500"}>{f.label}</span>
                                <span className={`font-semibold ${f.mode === "-" ? "text-red-600" : ""}`}>
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


import { useVehicle } from '../../../context/vehicletypecontext';
import OnRoadTab from "./OnRoadTab";
import { ChevronLeft } from "lucide-react";

function OverviewTab({ order, onRefresh, onStageMove }: {
    order: Order; onRefresh: () => Promise<void>;
    onStageMove: (order: Order, toStage: string) => void;
}) {

    const { vehicleTypes, fetchVehicleTypes } = useVehicle();
    const [openItems, setOpenItems] = useState<Record<number, boolean>>({});
    const [activeVehicleTab, setActiveVehicleTab] = useState<number>(0);
    const tabsContainerRef = useRef<HTMLDivElement>(null);
    const toggleItem = (idx: number) => {
        setOpenItems(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    useEffect(() => {
        fetchVehicleTypes()
    }, [])


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



    const formatINR = (value: string | number) => {
        const num = parseFloat(String(value).replace(/[^0-9.]/g, ""));
        if (isNaN(num) || value === "" || value === undefined) return "";
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(num);
    };


    const subtotal = order.bookingItems.reduce((s: number, i: any) => s + (i.totalAmount || 0), 0);
    const totalDiscount = (order.negotiationLogs || []).reduce((s, l) => s + (l.discountAmount || 0), 0);
    const taxable = subtotal - totalDiscount;
    const gstAmt = Math.floor(taxable * 0.18);
    const finalAmt = taxable + gstAmt;


    const projectCodes = order.projectCodeArray || [];

    const getVehicleTypeName = (vehicleTypeId: string) => {
        if (!vehicleTypeId || !vehicleTypes) return "";
        const vehicle = vehicleTypes.find((vt: any) => vt._id === vehicleTypeId);
        return vehicle?.typeName || vehicleTypeId;
    };

    return (

        <div className="p-4 space-y-4">
            {/* Customer Details */}
            <div className="rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                    <User size={15} className="text-gray-400" />
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

            {/* Order Details */}

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

                    {/* Right Scroll Button */}
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
                                    ["Campaign", currentVehicle.campaignType === "Other" ? currentVehicle.otherCampaignType : currentVehicle.campaignType],
                                    ["Duration", currentVehicle.fromDate && currentVehicle.toDate
                                        ? `${new Date(currentVehicle.fromDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} → ${new Date(currentVehicle.toDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} (${Math.ceil((new Date(currentVehicle.toDate).getTime() - new Date(currentVehicle.fromDate).getTime()) / 86400000)}D base${currentVehicle.extraDays > 0 ? ` +${currentVehicle.extraDays} D = ${Math.ceil((new Date(currentVehicle.toDate).getTime() - new Date(currentVehicle.fromDate).getTime()) / 86400000) + currentVehicle.extraDays}D total` : ""})`
                                        : "—"],
                                    ["Driving route", `${currentVehicle.fromLocation} → ${currentVehicle.toLocation}`],
                                    ["State / City", `${currentVehicle.state} / ${currentVehicle.city}`],
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

                        {/* Pricing Breakdown */}
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

                                {(currentVehicle.additionalCharges || []).filter((c: any) => c.label).map((c: any, fIdx: number) => (
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

            {/* Price Breakdown */}
            <div className="rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">

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
                                <p className="text-[11px] text-gray-400 mt-1">By {item.uploadedBy} · {fmtDatetime(item.uploadedAt)}</p>
                                {item.document && <div className="mt-2"><DocItem docPath={item.document} label="Supporting Document" /></div>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

    );
}



function CommentsTab({ order, onRefresh }: { order: Order; onRefresh: () => Promise<void> }) {
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

    const isTodo = order.pipelineStatus === "todo";
    const stageLabel = STAGE_MAP[order.pipelineStatus]?.label || order.pipelineStatus;


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


function PipelineHistoryTab({ order }: { order: Order }) {
    const logs = [...(order.pipelineLogs || [])].reverse();

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
                                            {log.handlerName && <><span>·</span><span>Handler: {log.handlerName}</span></>}
                                            <span>·</span>
                                            <span>{fmtDatetime(log.movedAt)}</span>
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


import {
    FiClipboard, FiSearch, FiFileText, FiRepeat,
    FiCheckCircle, FiCode, FiXCircle,
} from "react-icons/fi";
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


    const projectCodes = order.projectCodeArray || [];
    const hasProjectCode = projectCodes.length > 0;


    const tabs: { key: Tab; label: string }[] = [
        { key: "overview", label: "Overview" },
        { key: "comments", label: "Comments" },
        { key: "pipeline", label: "Pipeline History" },

        ...(order.pipelineStatus === "onRoad"
            ? [{ key: "onRoad" as Tab, label: "On Road" }]
            : []),

    ];


    useEffect(() => {
        if (order.pipelineStatus === "onRoad") {
            setActiveTab("onRoad");
        }
    }, [order.pipelineStatus, order._id]);


    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
            <div className="bg-white dark:bg-gray-950 w-full sm:max-w-4xl h-full sm:max-h-[92vh] flex flex-col shadow-2xl sm:rounded-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300">


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

                        {/* Move to next */}
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
                                <OverviewTab order={order} onRefresh={onRefresh} onStageMove={onStageMove} />
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

                                {/* Quick Actions */}
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

                    {activeTab === "pipeline" && (
                        <PipelineHistoryTab order={order} />
                    )}

                    {activeTab === "onRoad" && (
                        <OnRoadTab order={order} onRefresh={onRefresh} />
                    )}

                </div>
            </div>
        </div>
    );
}
