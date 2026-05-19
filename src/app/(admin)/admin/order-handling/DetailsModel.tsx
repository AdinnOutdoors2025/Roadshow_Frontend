

"use client";

import { Clock, Car, User, ReceiptText, GitBranch, Percent, History, X, FileText, Phone, Mail, MapPin, Building2, Calendar, Hash, IndianRupee, Package, ChevronRight, Download, Tag, ChevronDown, ChevronUp, Image, Route, Users, Megaphone, Wrench } from "lucide-react";
import NegotiationForm from "./customernegotiationForm";
import { WaitingForPOSection } from "./waitingforpo";
import { PaymentStage1Section } from "./PaymentStagefirst";
import { useState } from "react";
import axios from "axios";
import { getToken } from "@/utils/auth";
import API_BASE from "../../../../../baseurl";
import toast from "react-hot-toast";


// ─── Types ────────────────────────────────────────────────────────────────────
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
    grandTotal: number;
    grandGst?: number;
    grandNegotiationTotal?: number;
    bookingItems: BookingItem[];
    negotiationLogs?: NegotiationLog[];
    pipelineLogs: PipelineLog[];
    poDocument?: string;
    poDocumentLogs?: PoDocumentLog[];
    paymentStageFirst?: PaymentStageFirst[];
    createdAt: string;
    isAdminCreated?: boolean;
}

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

interface AdditionalField {
    label: string;
    mode: "+" | "-";
    amount: number;
}

interface BookingItem {
    vehicleModel: string;
    city: string;
    state?: string;
    quantity: number;
    fromDate: string;
    toDate: string;
    totalDays: number;
    totalAmount: number;
    subtotal?: number;
    perDayRentalCost?: number;
    bookingFor?: string;
    campaignType?: string;
    otherCampaignType?: string;
    fromLocation?: string;
    toLocation?: string;
    extraKm?: number;
    extraHours?: number;
    extraDays?: number;
    extraKmCost?: number;
    extraHourCost?: number;
    needPromoter?: boolean;
    promoterType?: string;
    otherPromoterType?: string;
    promoterGender?: string;
    promoterLanguage?: string;
    promoterQuantity?: number;
    promoterCost?: number;
    promoterChargePerDay?: number;
    rentalCost?: number;
    driverCost?: number;
    driverCharges?: number;
    rtoCost?: number;
    dailyKmcharges?: number;
    additionalHourCharges?: number;
    additionalFields?: AdditionalField[];
    campaignImages?: string[];
    campaignVideos?: string[];
    gstNumber?: string;
}

interface NegotiationLog {
    fromStage: string;
    toStage: string;
    amount?: number;
    discountAmount?: number;
    movedBy: string;
    movedAt: string;
    discountNotes: any;
}

interface PipelineLog {
    fromStage?: string;
    toStage: string;
    handlerName?: string;
    movedBy: string;
    movedAt: string;
}



const STAGE_MAP: Record<string, { label: string; gradient: string; icon: string }> = {
    newOrder: { label: "To-Do", gradient: "from-slate-400 to-slate-500", icon: "📋" },
    inProgress: { label: "In Progress", gradient: "from-blue-400 to-blue-600", icon: "🔄" },
    customerConfirmation: { label: "Customer Confirmation & Negotiation", gradient: "from-violet-400 to-violet-600", icon: "🤝" },
    waitingForPO: { label: "Waiting for PO", gradient: "from-amber-400 to-amber-600", icon: "⏳" },
    paymentStage1: { label: "Payment Processing Stage 1", gradient: "from-orange-400 to-orange-600", icon: "💳" },
    projectCodeCreation: { label: "Project Code Creation", gradient: "from-cyan-400 to-cyan-600", icon: "🔢" },
    projectExecution: { label: "Project Execution", gradient: "from-teal-400 to-teal-600", icon: "⚙️" },
    onRoad: { label: "On Road", gradient: "from-sky-400 to-sky-600", icon: "🚗" },
    campaignRunning: { label: "Campaign Running", gradient: "from-indigo-400 to-indigo-600", icon: "📣" },
    vehicleUnavailable: { label: "Vehicle Unavailable", gradient: "from-red-400 to-red-500", icon: "🚫" },
    clientClosure: { label: "Client Closure & Feedback", gradient: "from-pink-400 to-pink-600", icon: "📝" },
    invoiceGeneration: { label: "Invoice Generation", gradient: "from-fuchsia-400 to-fuchsia-600", icon: "🧾" },
    paymentStage2: { label: "Payment Processing Stage 2", gradient: "from-purple-400 to-purple-600", icon: "💰" },
    closedWon: { label: "Closed Won", gradient: "from-green-400 to-green-600", icon: "🎉" },
    closedLost: { label: "Closed Lost", gradient: "from-rose-400 to-rose-600", icon: "❌" },
};


const fmt = (n?: number | null) =>
    n != null ? `₹ ${n.toLocaleString("en-IN")}` : "—";

const fmtDatetime = (s?: string) =>
    s
        ? new Date(s).toLocaleString("en-IN", {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        })
        : "—";

const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `http://localhost:3001${path.startsWith('/') ? path : `/${path}`}`;
};

// ─── Accordion Section ────────────────────────────────────────────────────────
function Section({
    icon,
    title,
    accent,
    children,
    defaultOpen = true,
    badge,
}: {
    icon: React.ReactNode;
    title: string;
    accent?: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    badge?: React.ReactNode;
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="bg-white dark:bg-gray-800/50 rounded-xl md:rounded-2xl border border-gray-200/60 dark:border-gray-700/50 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
            {/* Clickable Header */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center gap-2 md:gap-2.5 px-3 md:px-5 py-2.5 md:py-3 bg-gradient-to-r ${accent || 'from-gray-50 to-gray-100'} dark:from-gray-800/80 dark:to-gray-800/40 border-b border-gray-100 dark:border-gray-700/50 text-left transition-all hover:brightness-95`}
            >
                <span className="text-base md:text-lg">{icon}</span>
                <h3 className="text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex-1">
                    {title}
                </h3>
                {badge && <span className="mr-1">{badge}</span>}
                {/* Chevron rotates based on open/close */}
                <span className={`text-gray-400 dark:text-gray-500 transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}>
                    <ChevronDown size={16} />
                </span>
            </button>

            {/* Collapsible Content */}
            {isOpen && (
                <div className="p-3 md:p-5 animate-in fade-in slide-in-from-top-1 duration-200">
                    {children}
                </div>
            )}
        </div>
    );
}

function InfoChip({ icon, label, value, full, highlight }: { icon?: React.ReactNode; label: string; value: React.ReactNode; full?: boolean; highlight?: boolean }) {
    return (
        <div className={`group ${full ? "col-span-2" : ""} ${highlight ? "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700" : "bg-gray-50/80 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50"} rounded-lg md:rounded-xl p-2.5 md:p-3.5 hover:shadow-md transition-all duration-200`}>
            <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                {icon && <span className="text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors text-xs md:text-sm">{icon}</span>}
                <p className="text-[9px] md:text-[12px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</p>
            </div>
            <div className="text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200 break-words">{value}</div>
        </div>
    );
}

function PricingRow({ label, value, highlight, icon, negative }: { label: string; value: string; highlight?: boolean; icon?: React.ReactNode; negative?: boolean }) {
    return (
        <div className={`flex items-center justify-between py-2.5 md:py-3 px-3 md:px-4 rounded-lg transition-all duration-200 ${highlight ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700' : 'hover:bg-gray-50 dark:hover:bg-gray-800/40'}`}>
            <div className="flex items-center gap-1.5 md:gap-2">
                {icon && <span className="text-gray-400 text-xs md:text-sm">{icon}</span>}
                <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{label}</span>
            </div>
            <span className={`text-xs md:text-sm font-bold ${highlight ? 'text-blue-700 dark:text-blue-300 md:text-lg' : negative ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>
                {value}
            </span>
        </div>
    );
}

function TimelineItem({ dotColor, children, isLast }: { dotColor: string; children: React.ReactNode; isLast: boolean }) {
    return (
        <div className="flex items-start gap-2 md:gap-3 group">
            <div className="flex flex-col items-center pt-1 md:pt-1.5">
                <div className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-gradient-to-br ${dotColor} ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ring-gray-100 dark:ring-gray-700 group-hover:scale-110 transition-transform`} />
                {!isLast && <div className="w-0.5 flex-1 bg-gradient-to-b from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-800 mt-1 md:mt-1.5" style={{ minHeight: 24 }} />}
            </div>
            <div className="flex-1 pb-3 md:pb-4 group-hover:translate-x-1 transition-transform">{children}</div>
        </div>
    );
}

// ─── Vehicle Item Accordion ───────────────────────────────────────────────────
function VehicleItemCard({ item, index }: { item: BookingItem; index: number }) {
    const [isOpen, setIsOpen] = useState(true);

    const campaignLabel = item.campaignType === "Other"
        ? (item.otherCampaignType || "Other")
        : (item.campaignType || "—");

    const promoterTypeLabel = item.promoterType === "Other"
        ? (item.otherPromoterType || "Other")
        : (item.promoterType || "—");

    const drivingRoute = item.fromLocation && item.toLocation
        ? `${item.fromLocation} → ${item.toLocation}`
        : null;

    const locationLabel = [item.state, item.city].filter(Boolean).join(" / ") || "—";

    return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Vehicle Header — clickable */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-3 p-3 md:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-gray-200 dark:border-gray-700 text-left hover:brightness-95 transition-all"
            >
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs md:text-sm font-bold text-blue-600 dark:text-blue-400">V{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm md:text-base font-bold text-gray-800 dark:text-gray-100 truncate">
                        {item.vehicleModel || "Vehicle Details"}
                    </p>
                    {/* <p className="text-xs text-gray-500 mt-0.5">{item.city} · {item.quantity}x · {item.totalDays} days</p> */}
                </div>
                <div className="text-right mr-2">
                    <p className="text-xs text-gray-400">Total</p>
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{fmt(item.totalAmount)}</p>
                </div>
                <ChevronDown size={16} className={`text-gray-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div className="p-3 md:p-4 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">

                    {/* Basic Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        {[
                            item.bookingFor && { icon: "👤", label: "Booking For", value: item.bookingFor },
                            { icon: "🎯", label: "Campaign", value: campaignLabel },
                            { icon: "📅", label: "Duration", value: `${fmtDatetime(item.fromDate)} → ${fmtDatetime(item.toDate)} (${item.totalDays} days)` },
                            { icon: "📍", label: "Location", value: locationLabel },
                            drivingRoute && { icon: "🛣️", label: "Driving Route", value: drivingRoute },
                            item.extraKm && item.extraKm > 0 ? { icon: "➕", label: "Extra KM", value: `${item.extraKm} km` } : null,
                            item.extraHours && item.extraHours > 0 ? { icon: "⏰", label: "Extra Hours", value: `${item.extraHours} hrs` } : null,
                            item.extraDays && item.extraDays > 0 ? { icon: "📆", label: "Extra Days", value: `${item.extraDays} days` } : null,
                            item.gstNumber ? { icon: "🧾", label: "GST Number", value: item.gstNumber } : null,
                        ].filter(Boolean).map((field: any, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                                <span className="text-base flex-shrink-0">{field.icon}</span>
                                <div className="flex-1">
                                    <span className="text-gray-400 block text-[10px] font-semibold uppercase tracking-wide">{field.label}</span>
                                    <span className="text-gray-800 dark:text-gray-200 font-medium text-xs md:text-sm">{field.value}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Promoter Details */}
                    {item.needPromoter && (
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 border border-purple-200 dark:border-purple-800/50">
                            <p className="text-xs font-bold text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-1.5">
                                🎤 Promoter Details
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="text-gray-400 block text-[10px] uppercase tracking-wide">Type</span>
                                    <span className="text-gray-800 dark:text-gray-200 font-medium">{promoterTypeLabel}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-[10px] uppercase tracking-wide">Gender</span>
                                    <span className="text-gray-800 dark:text-gray-200 font-medium">{item.promoterGender || "—"}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-[10px] uppercase tracking-wide">Language</span>
                                    <span className="text-gray-800 dark:text-gray-200 font-medium">{item.promoterLanguage || "—"}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-[10px] uppercase tracking-wide">Quantity</span>
                                    <span className="text-gray-800 dark:text-gray-200 font-medium">{item.promoterQuantity || 0}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pricing Breakdown per item */}
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                        <p className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            💰 Price Breakdown
                        </p>
                        <div className="space-y-1.5">
                            {/* Rental + Driver */}
                            {(item.rentalCost || item.driverCost) ? (
                                <div className="flex justify-between items-center py-1 text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Rental & Driver Charges</span>
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                                        {fmt((item.rentalCost || 0) + (item.driverCost || 0))}
                                    </span>
                                </div>
                            ) : null}

                            {/* Promoter */}
                            {item.promoterCost && item.promoterCost > 0 && (
                                <div className="flex justify-between items-center py-1 text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">
                                        Promoter ({item.totalDays}D × {fmt(item.promoterChargePerDay)} × {item.promoterQuantity})
                                    </span>
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">{fmt(item.promoterCost)}</span>
                                </div>
                            )}

                            {/* RTO */}
                            {item.rtoCost && item.rtoCost > 0 && (
                                <div className="flex justify-between items-center py-1 text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">RTO Charges</span>
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">{fmt(item.rtoCost)}</span>
                                </div>
                            )}

                            {/* Extra KM */}
                            {item.extraKmCost && item.extraKmCost > 0 && (
                                <div className="flex justify-between items-center py-1 text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">
                                        Extra KM ({item.extraKm} km × {fmt(item.dailyKmcharges)})
                                    </span>
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">{fmt(item.extraKmCost)}</span>
                                </div>
                            )}

                            {/* Extra Hours */}
                            {item.extraHourCost && item.extraHourCost > 0 && (
                                <div className="flex justify-between items-center py-1 text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">
                                        Extra Hours ({item.extraHours} hrs × {fmt(item.additionalHourCharges)})
                                    </span>
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">{fmt(item.extraHourCost)}</span>
                                </div>
                            )}

                            {/* Additional Fields */}
                            {(item.additionalFields || []).filter((f) => f.label).map((f, fIdx) => (
                                <div key={fIdx} className="flex justify-between items-center py-1 text-sm">
                                    <span className={f.mode === "-" ? "text-red-500" : "text-gray-500 dark:text-gray-400"}>
                                        {f.label}
                                    </span>
                                    <span className={`font-semibold ${f.mode === "-" ? "text-red-600 dark:text-red-400" : "text-gray-800 dark:text-gray-200"}`}>
                                        {f.mode === "-" ? "−" : "+"}{fmt(Number(f.amount))}
                                    </span>
                                </div>
                            ))}

                            {/* Divider + Subtotal */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-1">
                                <div className="flex justify-between items-center py-1">
                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Subtotal (excl. GST)</span>
                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{fmt(item.subtotal || item.totalAmount)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Campaign Images */}
                    {((item.campaignImages?.length ?? 0) > 0 || (item.campaignVideos?.length ?? 0) > 0) && (
                        <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                📸 Campaign Media
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {(item.campaignImages || []).map((img, imgIdx) => (
                                    <div key={imgIdx} className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                                        onClick={() => window.open(getImageUrl(img), '_blank')}>
                                        <img
                                            src={getImageUrl(img)}
                                            alt={`Campaign ${imgIdx + 1}`}
                                            className="w-full h-24 md:h-32 object-cover hover:opacity-90 transition"
                                        />
                                        <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                                            Image {imgIdx + 1}
                                        </span>
                                    </div>
                                ))}
                                {(item.campaignVideos || []).map((vid, vidIdx) => (
                                    <div key={vidIdx} className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                                        onClick={() => window.open(getImageUrl(vid), '_blank')}>
                                        <video src={getImageUrl(vid)} className="w-full h-24 md:h-32 object-cover" />
                                        <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                                            Video {vidIdx + 1}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}


export default function DetailDrawer({
    order,
    onClose,
    onRefresh,
    staffAdmins = [],
    currentUserIsAdmin = 1,
}: {
    order: Order;
    onClose: () => void;
    onRefresh: () => Promise<void>;
    staffAdmins?: { username: string }[];
    currentUserIsAdmin?: number;
}) {
    const stage = STAGE_MAP[order.pipelineStatus];
    const [moving, setMoving] = useState(false);
    const [showHandlerModal, setShowHandlerModal] = useState(false);
    const [handlerName, setHandlerName] = useState("");
    const [handlerError, setHandlerError] = useState("");
    const [custType, setCustType] = useState<0 | 1 | null>(null);
    const [handlerOpen, setHandlerOpen] = useState(false);

    const logs: PaymentStageFirst[] = order.paymentStageFirst || [];
    const totalAdvance = logs.reduce((sum, log) => sum + (log.advancePayment || 0), 0);

    const subtotal = order.bookingItems.reduce((s, i) => s + (i.totalAmount || 0), 0);
    const totalDiscount = (order.negotiationLogs || []).reduce((s, l) => s + (l.discountAmount || 0), 0);
    const taxable = subtotal - totalDiscount;
    const gstAmt = Math.floor(taxable * 0.18);
    const finalNet = taxable + gstAmt;
    const balanceAmount = finalNet - totalAdvance;
    const discountPercentage = subtotal > 0 ? Math.round((totalDiscount / subtotal) * 100) : 0;

    const doMove = async (toStage: string, extra?: Record<string, string>) => {
        setMoving(true);
        try {
            const token = getToken();
            const fd = new FormData();
            fd.append("pipelineStatus", toStage);
            if (extra) {
                Object.entries(extra).forEach(([k, v]) => fd.append(k, v));
            }
            await axios.patch(`${API_BASE}admin/pipeline/${order._id}`, fd, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Order moved successfully!");
            await onRefresh();
        } catch (e: any) {
            toast.error(e?.response?.data?.message || "Something went wrong");
        } finally {
            setMoving(false);
        }
    };

    const handleNextStage = () => {
        const status = order.pipelineStatus;
        if (status === "newOrder") {
            setHandlerName(""); setHandlerError(""); setCustType(null);
            setShowHandlerModal(true);
            return;
        }
        if (status === "inProgress") { doMove("customerConfirmation"); return; }
        if (status === "customerConfirmation") { doMove("waitingForPO"); return; }
        if (status === "waitingForPO") {
            const hasPoDocument = (order.poDocumentLogs?.length ?? 0) > 0;
            if (!hasPoDocument) { toast.error("Please upload PO document first!"); return; }
            if (order.customerType === 0) doMove("projectCodeCreation");
            else if (order.customerType === 1) doMove("paymentStage1");
            return;
        }
        if (status === "paymentStage1") { doMove("projectCodeCreation"); return; }
    };

    const handleHandlerSubmit = async () => {
        setHandlerError("");
        if (currentUserIsAdmin === 1 && !handlerName.trim()) { setHandlerError("Please select a handler"); return; }
        if ((order.customerType === null || order.customerType === undefined) && custType === null) {
            setHandlerError("Please select customer type"); return;
        }
        const extra: Record<string, string> = {};
        if (currentUserIsAdmin === 1) extra.handlerName = handlerName;
        if (order.customerType === null || order.customerType === undefined) extra.customerType = String(custType);
        await doMove("inProgress", extra);
        setShowHandlerModal(false);
    };

    const getNextStageLabel = (): string | null => {
        const status = order.pipelineStatus;
        if (status === "newOrder") return "Move to In Progress 🚀";
        if (status === "inProgress") return "Move to Customer Confirmation 🤝";
        if (status === "customerConfirmation") return "Move to Waiting for PO ⏳";
        if (status === "waitingForPO") {
            if (order.customerType === 0) return "Move to Project Code Creation 🔢";
            if (order.customerType === 1) return "Move to Payment Stage 1 💳";
            return "Move to Next Stage";
        }
        if (status === "paymentStage1") return "Move to Project Code Creation 🔢";
        return null;
    };

    const nextStageLabel = getNextStageLabel();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900/60 to-black/70 backdrop-blur-md p-2 md:p-4">
            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 w-full max-w-4xl h-full md:max-h-[85vh] flex flex-col shadow-2xl rounded-xl md:rounded-3xl border border-gray-200/60 dark:border-gray-700/50 overflow-hidden animate-in fade-in zoom-in duration-300">

                {/* ── Header ── */}
                <div className="relative flex-shrink-0 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 dark:from-gray-800 dark:via-gray-750 dark:to-gray-800 text-white px-3 md:px-6 py-3 md:py-5">
                    <div className="absolute inset-0 opacity-5">
                        {/* <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-blue-500 rounded-full blur-3xl" /> */}
                        <div className="absolute bottom-0 left-0 w-36 md:w-48 h-36 md:h-48 bg-purple-500 rounded-full blur-3xl" />
                    </div>

                    <div className="relative flex items-start justify-between gap-3 md:gap-4">
                        <div className="flex items-center gap-2 md:gap-4 min-w-0">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20">
                                <span className="text-xl md:text-2xl">🚗</span>
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 md:gap-3 mb-1 flex-wrap">
                                    <h2 className="text-base md:text-xl font-bold tracking-tight truncate">Order Details</h2>
                                    {stage && (
                                        <span className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-semibold bg-white/20 backdrop-blur-sm border border-white/30 text-white whitespace-nowrap">
                                            <span className="hidden md:inline">{stage.icon}</span>
                                            {stage.label}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5 md:gap-2 text-[11px] md:text-sm text-white/70 flex-wrap">
                                    <span className="font-mono text-xs md:text-sm">{order.orderId}</span>
                                    <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-white/30 hidden sm:inline" />
                                    <Clock size={12} className="md:w-[14px] md:h-[14px] hidden sm:inline" />
                                    <span className="hidden sm:inline">{fmtDatetime(order.updatedAt)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                            {order.handlerName && (
                                <div className="hidden sm:flex items-center gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-xs md:text-sm font-bold">
                                        {order.handlerName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-[10px] md:text-xs text-white/70">Handler</p>
                                        <p className="text-xs md:text-sm font-semibold">{order.handlerName}</p>
                                    </div>
                                </div>
                            )}

                            {nextStageLabel && (
                                <button
                                    onClick={handleNextStage}
                                    disabled={moving}
                                    className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold transition-all disabled:opacity-60"
                                >
                                    {moving ? (
                                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <><ChevronRight size={14} className="flex-shrink-0" />{nextStageLabel}</>
                                    )}
                                </button>
                            )}

                            <button
                                onClick={onClose}
                                className="w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white flex items-center justify-center transition-all hover:rotate-90 duration-300"
                            >
                                <X size={16} className="md:w-[18px] md:h-[18px]" />
                            </button>
                        </div>
                    </div>

                    {order.handlerName && (
                        <div className="sm:hidden mt-2 flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-xs font-bold">
                                {order.handlerName.charAt(0)}
                            </div>
                            <div>
                                <p className="text-[10px] text-white/70">Handler</p>
                                <p className="text-xs font-semibold">{order.handlerName}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Scrollable Body ── */}
                <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-3 md:space-y-5 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">

                    {/* ── 1. Customer Information ── */}
                    <Section icon="👤" title="Customer Information" accent="from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20" defaultOpen={false}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                            <InfoChip icon={<Hash size={14} />} label="Order ID" value={order.orderId} />
                            <InfoChip icon={<Phone size={14} />} label="Phone" value={`+91 ${order.phone}`} />
                            <InfoChip icon={<User size={14} />} label="Name" value={order.name} highlight />
                            {order.email && <InfoChip icon={<Mail size={14} />} label="Email" value={order.email} />}
                            <InfoChip
                                icon={<Tag size={14} />}
                                label="Customer Type"
                                value={
                                    <span className={`inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-semibold ${order.customerType === 1
                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                        }`}>
                                        {order.customerType === 1 ? "🆕 New" : order.customerType === 0 ? "🔄 Existing" : "❓ Not Set"}
                                    </span>
                                }
                            />
                            {order.address && <InfoChip icon={<MapPin size={14} />} label="Address" value={order.address} />}
                            <InfoChip icon={<Calendar size={14} />} label="Created Date" value={fmtDatetime(order.createdAt)} />

                            {/* ✅ NEW: isAdminCreated badge */}
                            {order.isAdminCreated && (
                                <InfoChip
                                    icon={<Tag size={14} />}
                                    label="Order Source"
                                    value={
                                        <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-2 py-1 rounded inline-block">
                                            🏷️ Admin Created
                                        </span>
                                    }
                                />
                            )}
                        </div>
                    </Section>

                    {/* ── 2. Vehicle Bookings ── */}
                    <Section
                        icon="📅"
                        title="Vehicle Bookings"
                        accent="from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
                        defaultOpen={false}
                        badge={
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                                {order.bookingItems.length} vehicle{order.bookingItems.length > 1 ? "s" : ""}
                            </span>
                        }
                    >
                        <div className="space-y-3">
                            {order.bookingItems.map((item, i) => (
                                <VehicleItemCard key={i} item={item} index={i} />
                            ))}
                        </div>
                    </Section>

                    {/* ── 3. Negotiation Form ── */}
                    {/* <NegotiationForm order={order} onNegotiationSaved={onRefresh} /> */}
                    {/* ── 3. Negotiation Form ── */}
                    <Section
                        icon="💰"
                        title="Customer Negotiation"
                        accent="from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20"
                        defaultOpen={false}
                        badge={
                            (order.negotiationLogs || []).filter((l: any) => (l.discountAmount || 0) > 0).length > 0 ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                                    {(order.negotiationLogs || []).filter((l: any) => (l.discountAmount || 0) > 0).length} discount
                                </span>
                            ) : undefined
                        }
                    >
                        <NegotiationForm order={order} onNegotiationSaved={onRefresh} />
                    </Section>

                    {/* ── 4. Waiting for PO ── */}
                    <Section
                        icon="📋"
                        title="PO Documents"
                        accent="from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20"
                        defaultOpen={false}
                        badge={
                            (order.poDocumentLogs || []).length > 0 ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                                    {(order.poDocumentLogs || []).length} doc
                                </span>
                            ) : undefined
                        }
                    >
                        <WaitingForPOSection order={order} onRefresh={onRefresh} />
                    </Section>

                    {/* ── 5. Payment Stage 1 ── */}
                    <Section
                        icon="💳"
                        title="Payment Processing Stage 1"
                        accent="from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20"
                        defaultOpen={false}
                        badge={
                            (order.paymentStageFirst || []).length > 0 ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                                    {(order.paymentStageFirst || []).length} payment
                                </span>
                            ) : undefined
                        }
                    >
                        <PaymentStage1Section order={order} onRefresh={onRefresh} />
                    </Section>


                    {/* ── 4. Waiting for PO ── */}
                    {/* <WaitingForPOSection order={order} onRefresh={onRefresh} /> */}

                    {/* ── 5. Payment Stage 1 ── */}
                    {/* <PaymentStage1Section order={order} onRefresh={onRefresh} /> */}

                    {/* ── 6. Pricing Breakdown ── */}
                    <Section icon="💰" title="Pricing Breakdown" accent="from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20" defaultOpen={true}>
                        <div className="space-y-1">
                            <PricingRow label="Subtotal" value={fmt(subtotal)} icon={<IndianRupee size={16} />} />
                            {totalDiscount > 0 && (
                                <PricingRow
                                    label={`Discount Applied (${discountPercentage}%)`}
                                    value={`− ${fmt(totalDiscount)}`}
                                    icon={<Percent size={16} />}
                                    negative
                                />
                            )}
                            <PricingRow label="Taxable Amount" value={fmt(taxable)} icon={<ReceiptText size={16} />} />
                            <PricingRow label="GST (18%)" value={fmt(gstAmt)} icon={<Building2 size={16} />} />
                            {totalAdvance > 0 && (
                                <PricingRow label="Advance Paid" value={`− ${fmt(totalAdvance)}`} icon={<IndianRupee size={16} />} negative />
                            )}
                        </div>

                        <div className="mt-3 md:mt-4 p-4 md:p-5 rounded-xl md:rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700/50">
                            <div className="flex items-center justify-between">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-green-500 flex items-center justify-center text-xl md:text-2xl shadow-lg mr-3">
                                    💵
                                </div>
                                <div className="flex-1 text-right">
                                    <p className="text-[10px] md:text-xs text-green-600 dark:text-green-400 font-semibold uppercase tracking-wider mb-0.5 md:mb-1">
                                        Final Amount
                                    </p>
                                    <p className="text-xl md:text-2xl font-bold text-green-700 dark:text-green-300">
                                        {fmt(finalNet)}
                                    </p>
                                    {totalAdvance > 0 && (
                                        <div className="mt-2 pt-2 border-t border-green-200 dark:border-green-700">
                                            <p className="text-[10px] md:text-xs text-orange-600 dark:text-orange-400 font-semibold uppercase tracking-wider mb-0.5">
                                                Balance Due
                                            </p>
                                            <p className="text-base md:text-lg font-bold text-orange-600 dark:text-orange-400">
                                                {fmt(balanceAmount)} 💵
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* ── 7. Notes — default CLOSED ── */}
                    <Section
                        icon="📝"
                        title="Notes"
                        accent="from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20"
                        defaultOpen={false}
                    >
                        {/* Discount Notes */}
                        {(order.negotiationLogs || []).filter(l => l.discountNotes).length > 0 && (
                            <div className="mb-4">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">💬 Discount Negotiation Notes</p>
                                <div className="space-y-2">
                                    {order.negotiationLogs!.filter((l: any) => l.discountNotes).map((log: any, i: number) => (
                                        <div key={i} className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50">
                                            <p className="text-sm text-gray-700 dark:text-gray-300">{log.discountNotes}</p>
                                            <p className="text-xs text-gray-400 mt-1">By {log.movedBy} • {fmtDatetime(log.movedAt)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* PO Notes */}
                        {(order.poDocumentLogs || []).filter(l => l.poNotes).length > 0 && (
                            <div className="mb-4">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">📄 PO Notes</p>
                                <div className="space-y-2">
                                    {order.poDocumentLogs!.filter((l: any) => l.poNotes).map((log: any, i: number) => (
                                        <div key={i} className="p-3 rounded-xl bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800/50">
                                            <p className="text-sm text-gray-700 dark:text-gray-300">{log.poNotes}</p>
                                            <p className="text-xs text-gray-400 mt-1">By {log.uploadedBy} • {fmtDatetime(log.poDate)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Payment Notes */}
                        {(order.paymentStageFirst || []).filter(l => l.paymentNotes).length > 0 && (
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">💳 Payment Notes</p>
                                <div className="space-y-2">
                                    {order.paymentStageFirst!.filter((l: any) => l.paymentNotes).map((log: any, i: number) => (
                                        <div key={i} className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50">
                                            <p className="text-sm text-gray-700 dark:text-gray-300">{log.paymentNotes}</p>
                                            <p className="text-xs text-gray-400 mt-1">By {log.uploadedBy} • {fmtDatetime(log.paymentDate)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* No notes fallback */}
                        {(order.negotiationLogs || []).filter(l => l.discountNotes).length === 0 &&
                            (order.poDocumentLogs || []).filter(l => l.poNotes).length === 0 &&
                            (order.paymentStageFirst || []).filter(l => l.paymentNotes).length === 0 && (
                                <p className="text-sm text-gray-400 text-center py-4">No notes added yet</p>
                            )}
                    </Section>

                    {/* ── 8. Pipeline Journey — default CLOSED ── */}
                    <Section
                        icon="🔄"
                        title="Pipeline Journey"
                        accent="from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20"
                        defaultOpen={false}
                        badge={
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400">
                                {order.pipelineLogs.length} events
                            </span>
                        }
                    >
                        <div className="space-y-0">
                            {(() => {
                                const timelineItems: {
                                    type: 'pipeline' | 'negotiation';
                                    label: string;
                                    sub?: string;
                                    by: string;
                                    at: string;
                                    dotColor: string;
                                }[] = [];

                                const pipelineEntries = order.pipelineLogs.filter(log =>
                                    !(log.fromStage === 'customerConfirmation' && log.toStage === 'customerConfirmation')
                                );

                                pipelineEntries.forEach(log => {
                                    const toStage = STAGE_MAP[log.toStage];
                                    const fromLabel = log.fromStage ? (STAGE_MAP[log.fromStage]?.label || log.fromStage) : 'Start';
                                    const toLabel = toStage?.label || log.toStage;
                                    timelineItems.push({
                                        type: 'pipeline',
                                        label: `${fromLabel} → ${toLabel}`,
                                        by: log.movedBy,
                                        at: log.movedAt,
                                        dotColor: toStage?.gradient || 'from-gray-400 to-gray-500',
                                    });
                                });

                                const negLogs = order.negotiationLogs || [];
                                if (negLogs.length > 0) {
                                    const totalNegDiscount = negLogs.reduce((sum, n) => sum + (n.discountAmount || 0), 0);
                                    const latest = negLogs.reduce((prev, curr) =>
                                        new Date(curr.movedAt) > new Date(prev.movedAt) ? curr : prev
                                    );
                                    timelineItems.push({
                                        type: 'negotiation',
                                        label: 'Customer Confirmation',
                                        sub: `Total Discount: ${fmt(totalNegDiscount)}`,
                                        by: latest.movedBy,
                                        at: latest.movedAt,
                                        dotColor: 'from-violet-400 to-purple-500',
                                    });
                                }

                                timelineItems.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

                                return timelineItems.map((item, i, arr) => (
                                    <TimelineItem key={i} dotColor={item.dotColor} isLast={i === arr.length - 1}>
                                        <div className="bg-gray-50 dark:bg-gray-800/40 rounded-lg md:rounded-xl p-2.5 md:p-3.5 border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition-all">
                                            <p className="text-md font-semibold text-gray-800 dark:text-gray-200">{item.label}</p>
                                            {item.type === 'negotiation' && item.sub && (
                                                <div className="flex items-center gap-1.5 mt-1.5">
                                                    <span className="text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 px-2 py-0.5 rounded-full">
                                                        {item.sub}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-400 flex-wrap">
                                                <span>By {item.by}</span>
                                                <span>•</span>
                                                <span>{fmtDatetime(item.at)}</span>
                                            </div>
                                        </div>
                                    </TimelineItem>
                                ));
                            })()}
                        </div>
                    </Section>

                    {/* ── 9. PO Document ── */}
                    {order.poDocument && (
                        <Section icon="📄" title="Purchase Order" accent="from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20" defaultOpen={true}>
                            <a
                                href={order.poDocument}
                                target="_blank"
                                rel="noreferrer"
                                className="group flex items-center justify-between p-3 md:p-4 rounded-lg md:rounded-xl bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 border-2 border-sky-200 dark:border-sky-700/50 hover:shadow-lg transition-all"
                            >
                                <div className="flex items-center gap-2 md:gap-3">
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-sky-500 flex items-center justify-center text-lg md:text-xl shadow-md">
                                        📎
                                    </div>
                                    <div>
                                        <p className="text-sm md:text-base font-semibold text-sky-700 dark:text-sky-300">View Document</p>
                                        <p className="text-[10px] md:text-xs text-sky-500 dark:text-sky-400">Click to open in new tab</p>
                                    </div>
                                </div>
                                <Download size={16} className="md:w-[18px] md:h-[18px] text-sky-600 dark:text-sky-400 group-hover:translate-y-1 transition-transform" />
                            </a>
                        </Section>
                    )}
                </div>

                {/* ── Handler Modal ── */}
                {showHandlerModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6">
                            <div className="flex justify-center mb-4">
                                <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-2xl">🚀</div>
                            </div>
                            <h2 className="text-center text-base font-semibold text-gray-900 dark:text-white mb-1">Move to In Progress?</h2>
                            <p className="text-center text-xs text-gray-400 font-mono mb-5">{order.orderId}</p>

                            {currentUserIsAdmin === 1 ? (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Assign Handler <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <button type="button" onClick={() => setHandlerOpen(prev => !prev)}
                                            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between">
                                            <span className={handlerName ? "text-gray-900 dark:text-white" : "text-gray-400"}>
                                                {handlerName || "-- Select Handler --"}
                                            </span>
                                            <ChevronDown size={16} className={`text-gray-400 transition-transform ${handlerOpen ? "rotate-180" : ""}`} />
                                        </button>
                                        {handlerOpen && (
                                            <div className="absolute z-[70] w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
                                                <div className="px-3 py-2.5 text-sm text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                                                    onClick={() => { setHandlerName(""); setHandlerOpen(false); }}>
                                                    -- Select Handler --
                                                </div>
                                                {staffAdmins.map((s) => (
                                                    <div key={s.username} onClick={() => { setHandlerName(s.username); setHandlerOpen(false); }}
                                                        className={`px-3 py-2.5 text-sm cursor-pointer transition-colors ${handlerName === s.username ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>
                                                        {s.username}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-3 py-2.5">
                                    <p className="text-sm text-blue-700 dark:text-blue-300">You will be assigned as the handler for this order.</p>
                                </div>
                            )}

                            {(order.customerType === null || order.customerType === undefined) && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Customer Type <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {(["existing", "new"] as const).map((t, i) => {
                                            const val = i === 0 ? 1 : 0;
                                            return (
                                                <button key={t} type="button" onClick={() => setCustType(val as 0 | 1)}
                                                    className={`rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all text-left ${custType === val ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"}`}>
                                                    <div className={`h-3 w-3 rounded-full border-2 mb-2 transition-all ${custType === val ? "border-blue-500 bg-blue-500" : "border-gray-300"}`} />
                                                    <p className="font-semibold text-xs">{t === "existing" ? "Existing Customer" : "New Customer"}</p>
                                                    <p className="text-xs mt-0.5 opacity-60">{t === "existing" ? "Already registered" : "Create new account"}</p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {handlerError && (
                                <p className="mb-3 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                                    {handlerError}
                                </p>
                            )}

                            <div className="flex gap-3">
                                <button onClick={() => setShowHandlerModal(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                                    Cancel
                                </button>
                                <button onClick={handleHandlerSubmit} disabled={moving}
                                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium transition-all">
                                    {moving ? "Moving..." : "Confirm Move"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
