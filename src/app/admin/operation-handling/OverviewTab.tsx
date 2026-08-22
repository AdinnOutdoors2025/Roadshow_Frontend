
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
    Folder, RotateCcw, CheckCheck, UserCog,
} from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import axios from "axios";
import { getToken } from "../../utils/auth";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import API_BASE from "../../../../baseurl";
import { useVehicle } from '../../../context/vehicletypecontext';
import { ChevronLeft } from "lucide-react";
import DatePicker from "../../utils/datepicker";
import HandlerSearchSelect from "../../utils/HandlerSearchSelect";


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

export default function OverviewTab({ order, onRefresh, onStageMove, vehicleTypes, staffAdmins = [], currentUserIsAdmin = 1 }: {
    order: Order; onRefresh: () => Promise<void>;
    onStageMove: (order: Order, toStage: string) => void;
    staffAdmins?: { username: string }[];
    currentUserIsAdmin?: number;
}) {

    // Sales/Operation (non-admin) logins only ever see themselves as a
    // reassignment target, and don't see the Handler Assignment panel at
    // all when the order is already theirs. Admin login is untouched.
    const isStaffUser = currentUserIsAdmin !== 1;
    const [currentUsername, setCurrentUsername] = useState("");
    useEffect(() => {
        const token = getToken();
        if (token) {
            try { setCurrentUsername((jwtDecode(token) as any)?.username || ""); } catch { }
        }
    }, []);
    const isOwnOrder = isStaffUser && order.handlerName && order.handlerName === currentUsername;

    // ── Handler reassignment / handover ──────────────────────────────────────
    const [showHandoverModal, setShowHandoverModal] = useState(false);
    const [showHandoverHistory, setShowHandoverHistory] = useState(false);
    const [handoverNewHandler, setHandoverNewHandler] = useState("");
    const [handoverIsTemporary, setHandoverIsTemporary] = useState(true);
    const [handoverLeaveStart, setHandoverLeaveStart] = useState("");
    const [handoverLeaveEnd, setHandoverLeaveEnd] = useState("");
    const [handoverReason, setHandoverReason] = useState("");
    const [handoverSaving, setHandoverSaving] = useState(false);
    const opsHandlerAssignmentHistory: any[] = (order as any).opsHandlerAssignmentHistory || [];
    const activeTemporaryHandover = opsHandlerAssignmentHistory.find(
        (h: any) => h.status === "active" && h.isTemporary
    );

    const todayIso = new Date().toISOString().slice(0, 10);
    const oneYearAheadIso = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const submitHandover = async () => {
        if (!handoverNewHandler.trim()) { toast.error("Select the new handler"); return; }
        if (!handoverReason.trim()) { toast.error("Reason is required"); return; }
        if (handoverIsTemporary && (!handoverLeaveStart || !handoverLeaveEnd)) {
            toast.error("Leave start and end dates are required"); return;
        }
        setHandoverSaving(true);
        try {
            const token = getToken();
            await axios.patch(
                `${API_BASE}admin/pipeline/${order._id}/reassign-handler`,
                {
                    newHandler: handoverNewHandler.trim(),
                    isTemporary: handoverIsTemporary,
                    leaveStartDate: handoverIsTemporary ? handoverLeaveStart : null,
                    leaveEndDate: handoverIsTemporary ? handoverLeaveEnd : null,
                    reason: handoverReason.trim(),
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Handler reassigned");
            setShowHandoverModal(false);
            setHandoverNewHandler(""); setHandoverLeaveStart(""); setHandoverLeaveEnd(""); setHandoverReason("");
            await onRefresh();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to reassign handler");
        } finally {
            setHandoverSaving(false);
        }
    };

    const resolveHandover = async (assignmentId: string, makePermanent: boolean) => {
        try {
            const token = getToken();
            await axios.patch(
                `${API_BASE}admin/pipeline/${order._id}/handover/${assignmentId}/resolve`,
                { makePermanent },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(makePermanent ? "Handover made permanent" : "Order returned to previous handler");
            await onRefresh();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to resolve handover");
        }
    };

    // const { vehicleTypes, fetchVehicleTypes } = useVehicle();
    const [openItems, setOpenItems] = useState<Record<number, boolean>>({});
    const [activeVehicleTab, setActiveVehicleTab] = useState<number>(0);
    const tabsContainerRef = useRef<HTMLDivElement>(null);
    const toggleItem = (idx: number) => {
        setOpenItems(prev => ({ ...prev, [idx]: !prev[idx] }));
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

    const fmtRelative = (s?: string) => {
        if (!s) return "";
        const diff = Date.now() - new Date(s).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    // useEffect(() => {
    //     fetchVehicleTypes()
    // }, [])


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

      const baseDays =
  Math.ceil(
    (new Date(currentVehicle.toDate).getTime() -
      new Date(currentVehicle.fromDate).getTime()) /
      86400000
  ) + 1;

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

            {/* Handler Assignment */}
            {order?.pipelineStatus !== "todo" && !isOwnOrder && (
            <div className="rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <UserCog size={15} className="text-gray-400" />
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Handler Assignment</h3>
                    </div>
                    <button
                        onClick={() => setShowHandoverModal(true)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-violet-400 hover:text-violet-600 text-[12px] font-semibold"
                    >
                        <RotateCcw size={12} /> Reassign
                    </button>
                </div>
                <div className="p-4 space-y-3">
                    {order.handlerName ? (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                                {order.handlerName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{order.handlerName}</p>
                                {activeTemporaryHandover && (
                                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Temporary handover</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400">No handler assigned yet</p>
                    )}

                    {activeTemporaryHandover && (
                        <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                            <p className="text-[11px] text-amber-700 dark:text-amber-300">
                                Covering for <span className="font-semibold">{activeTemporaryHandover.previousHandler}</span> (
                                {activeTemporaryHandover.leaveStartDate ? fmtDatetime(activeTemporaryHandover.leaveStartDate).split(",")[0] : ""}
                                {" – "}
                                {activeTemporaryHandover.leaveEndDate ? fmtDatetime(activeTemporaryHandover.leaveEndDate).split(",")[0] : ""})
                            </p>
                            <div className="flex items-center gap-1.5 mt-1.5">
                                <button
                                    onClick={() => resolveHandover(activeTemporaryHandover._id, false)}
                                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-md bg-white dark:bg-gray-800 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 text-[10px] font-semibold"
                                >
                                    <RotateCcw size={10} /> Return
                                </button>
                                <button
                                    onClick={() => resolveHandover(activeTemporaryHandover._id, true)}
                                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-semibold"
                                >
                                    <CheckCheck size={10} /> Make Permanent
                                </button>
                            </div>
                        </div>
                    )}

                    {opsHandlerAssignmentHistory.length > 0 && (
                        <button
                            onClick={() => setShowHandoverHistory((v) => !v)}
                            className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600"
                        >
                            <History size={11} /> Handover history ({opsHandlerAssignmentHistory.length})
                        </button>
                    )}
                    {showHandoverHistory && (
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-0.5">
                            {opsHandlerAssignmentHistory.slice().reverse().map((h: any) => {
                                const statusStyle =
                                    h.status === "madePermanent"
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800"
                                        : h.status === "reverted"
                                            ? "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                                            : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800";
                                const statusLabel =
                                    h.status === "madePermanent" ? "Made Permanent"
                                        : h.status === "reverted" ? "Reverted"
                                            : "Active";
                                return (
                                    <div
                                        key={h._id}
                                        className="rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/40 p-2.5"
                                    >
                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                            <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800 dark:text-gray-200">
                                                <span>{h.previousHandler || "—"}</span>
                                                <ChevronRight size={13} className="text-gray-400 flex-shrink-0" />
                                                <span>{h.newHandler}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="px-1.5 py-0.5 rounded-md text-[11px] font-medium border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                                                    {h.isTemporary ? "Temporary" : "Permanent"}
                                                </span>
                                                <span className={`px-1.5 py-0.5 rounded-md text-[11px] font-semibold border ${statusStyle}`}>
                                                    {statusLabel}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-[13px] text-gray-600 dark:text-gray-300 mt-1.5">{h.reason}</p>
                                        <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-1">
                                            {fmtDatetime(h.assignedAt)} · by {h.assignedBy}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            )}

            {showHandoverModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-5">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">Reassign Handler</h3>
                            <button onClick={() => setShowHandoverModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-gray-500">New Handler</label>
                                {isStaffUser ? (
                                    <HandlerSearchSelect
                                        value={handoverNewHandler}
                                        onChange={setHandoverNewHandler}
                                        options={currentUsername ? [{ username: currentUsername }] : []}
                                    />
                                ) : (
                                    <select
                                        value={handoverNewHandler}
                                        onChange={(e) => setHandoverNewHandler(e.target.value)}
                                        className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                                    >
                                        <option value="">Select handler...</option>
                                        {staffAdmins.map((s) => (
                                            <option key={s.username} value={s.username}>{s.username}</option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    id="opsHandoverTemp"
                                    type="checkbox"
                                    checked={handoverIsTemporary}
                                    onChange={(e) => setHandoverIsTemporary(e.target.checked)}
                                />
                                <label htmlFor="opsHandoverTemp" className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                    Temporary (e.g. leave handover) — return or make permanent later
                                </label>
                            </div>

                            {handoverIsTemporary && (
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500">Leave Start (From Date)</label>
                                        <div className="mt-1">
                                            <DatePicker
                                                value={handoverLeaveStart}
                                                onChange={setHandoverLeaveStart}
                                                minDate={todayIso}
                                                maxDate={handoverLeaveEnd || oneYearAheadIso}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500">Leave End (To Date)</label>
                                        <div className="mt-1">
                                            <DatePicker
                                                value={handoverLeaveEnd}
                                                onChange={setHandoverLeaveEnd}
                                                minDate={handoverLeaveStart || todayIso}
                                                maxDate={oneYearAheadIso}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-semibold text-gray-500">Reason</label>
                                <textarea
                                    value={handoverReason}
                                    onChange={(e) => setHandoverReason(e.target.value)}
                                    rows={2}
                                    placeholder="e.g. Handler on leave, manager reassignment..."
                                    className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <button
                                    onClick={submitHandover}
                                    disabled={handoverSaving}
                                    className="flex-1 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-semibold"
                                >
                                    {handoverSaving ? "Saving..." : "Reassign"}
                                </button>
                                <button
                                    onClick={() => setShowHandoverModal(false)}
                                    className="flex-1 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-semibold"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                                    order.customerCategory ? ["Booking For", order.customerCategory] : null,
                                    (currentVehicle.campaignType === "Other" ? currentVehicle.otherCampaignType : currentVehicle.campaignType)
                                        ? ["Campaign", currentVehicle.campaignType === "Other" ? currentVehicle.otherCampaignType : currentVehicle.campaignType]
                                        : null,
                                    // ["Duration", currentVehicle.fromDate && currentVehicle.toDate
                                    //     ? `${new Date(currentVehicle.fromDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} → ${new Date(currentVehicle.toDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} (${Math.ceil((new Date(currentVehicle.toDate).getTime() - new Date(currentVehicle.fromDate).getTime()) / 86400000)}D base${currentVehicle.extraDays > 0 ? ` +${currentVehicle.extraDays} D = ${Math.ceil((new Date(currentVehicle.toDate).getTime() - new Date(currentVehicle.fromDate).getTime()) / 86400000) + currentVehicle.extraDays}D total` : ""})`
                                    //     : "—"],
                                    [
                                        "Duration",
                                        currentVehicle.fromDate && currentVehicle.toDate
                                            ? `${new Date(currentVehicle.fromDate).toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })} → ${new Date(currentVehicle.toDate).toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })} (${baseDays}D base${currentVehicle.extraDays > 0
                                                ? ` +${currentVehicle.extraDays}D = ${baseDays + currentVehicle.extraDays
                                                }D total`
                                                : ""
                                            })`
                                            : "—",
                                    ],
                                    (currentVehicle.campaignLocation || (currentVehicle.fromLocation && currentVehicle.toLocation))
                                        ? ["Campaign Location", currentVehicle.campaignLocation || `${currentVehicle.fromLocation} → ${currentVehicle.toLocation}`]
                                        : null,
                                    (currentVehicle.state || currentVehicle.city)
                                        ? ["State / City", [currentVehicle.state, currentVehicle.city].filter(Boolean).join(" / ")]
                                        : null,
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

                                {(currentVehicle.additionalFields || []).filter((c: any) => c.label).map((c: any, fIdx: number) => (
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
            {order?.pipelineStatus === "closedLost" &&
                order?.orderClosedLostArray?.length > 0 && (
                    <div className="rounded-xl border border-rose-100 dark:border-rose-800/50 overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 dark:bg-rose-900/20 border-b border-rose-100 dark:border-rose-800/50">
                            <XCircle size={13} className="text-rose-500" />
                            <h3 className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">
                                Closed Lost — Reason
                            </h3>
                        </div>

                        <div className="p-4 space-y-3">
                            {order.orderClosedLostArray.map((item, index) => (
                                <div
                                    key={item._id || index}
                                    className="p-3 rounded-lg border border-rose-200 bg-rose-50"
                                >
                                    <div>
                                        <span className="font-semibold">Reason:</span>
                                        <p>{item.reason || "-"}</p>
                                    </div>

                                    <div className="mt-2 text-xs text-gray-500">
                                        Uploaded By: {item.uploadedBy || "-"}
                                    </div>

                                    <div className="text-xs text-gray-500">
                                        Uploaded At: {fmtDatetime(item.uploadedAt)}
                                    </div>

                                    {item.document ? (
                                        <div className="mt-2">
                                            <DocItem
                                                docPath={item.document}
                                                label="Supporting Document"
                                            />
                                        </div>
                                    ) : (
                                        <p className="mt-2 text-xs text-gray-400">
                                            No document uploaded
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
        </div>

    );
}


function DocItem({ docPath, label, notes, by, at }: {
    docPath: string; label: string; notes?: string; by?: string; at?: string;
}) {

    // const getFileUrl = (p: string) => {
    //     if (!p) return "";
    //     if (p.startsWith("http")) return p;
    //     return `http://localhost:3001${p.startsWith("/") ? p : `/${p}`}`;
    // };

    const getFileUrl = (p: string) => {
        if (!p) return "";
        if (p.startsWith("http")) return p;
        const path = p.startsWith("/") ? p : `/${p}`;

        const encodedPath = path
            .split("/")
            .map((segment) => encodeURIComponent(segment))
            .join("/");
        return `http://localhost:3001${encodedPath}`;
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
