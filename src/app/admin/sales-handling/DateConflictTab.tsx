


/* eslint-disable */
// @ts-nocheck

"use client";

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { getToken } from "../../utils/auth";
import API_BASE from "../../../../baseurl";
import { AlertTriangle, ChevronRight, Clock, CheckCircle2, XCircle, Search, X, ChevronLeft } from "lucide-react";
import { SalesOrder } from "./page";
import { useVehicle } from '../../../context/vehicletypecontext';
import DatePicker from "@/app/utils/datepicker";


const fmtDate = (s?: string) =>
    s ? new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const fmtDatetime = (s?: string) =>
    s
        ? new Date(s).toLocaleString("en-IN", {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        })
        : "—";

const rankLabel = (rank: number) => {
    if (rank === 1) return "1st";
    if (rank === 2) return "2nd";
    if (rank === 3) return "3rd";
    return `${rank}th`;
};

const getStatusKey = (c: ConflictEntry): "closedLost" | "closedWon" | "inProgress" => {
    if (c.pipelineStatus === "closedLost" || c.salesPipelineStatus === "closedLost") return "closedLost";
    if (c.pipelineStatus === "closedWon" || c.salesPipelineStatus === "closedWon") return "closedWon";
    return "inProgress";
};

const getDealStatus = (c: ConflictEntry) => {
    const key = getStatusKey(c);
    if (key === "closedLost") return { label: "Closed Lost", cls: "bg-red-100 text-red-700 border-red-200" };
    if (key === "closedWon") {
        if (c.pipelineStatus === "closedWon") {
            return { label: "Closed Won", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" };
        }
        return { label: "Closed Won (Sales)", cls: "bg-emerald-50 text-emerald-600 border-emerald-200" };
    }
    return { label: "In Progress", cls: "bg-amber-100 text-amber-700 border-amber-200" };
};

interface ReservedVehicle {
    driverName?: string;
    driverPhone?: string;
    vehicleRegistrationNumber?: string;
    onRoadStatus?: number;
    reservedAt?: string;
}

interface ConflictEntry {
    orderObjectId: string;
    bookingItemId: string;
    orderId: string;
    name: string;
    companyName?: string;
    handlerName?: string;
    fromDate: string;
    toDate: string;
    quantity?: number;
    createdAt: string;
    rank: number;
    isCurrent: boolean;
    reservedVehicles: ReservedVehicle[];
    isReserved: boolean;
    pipelineStatus?: string;
    salesPipelineStatus?: string;
}

interface AvailabilityInfo {
    available: boolean;
    availableCount?: number;
    requiredQuantity?: number;
    currentlyAvailable?: number;
    soonToBeFree?: number;
    totalFleet?: number;
    error?: string;
}

interface ConflictGroup {
    vehicleType: string;
    vehicleIndex: number;
    thisOrderFromDate: string;
    thisOrderToDate: string;
    entries: ConflictEntry[];
    availability?: AvailabilityInfo;
}

const PAGE_SIZE = 10;


const _today = new Date();
const _currentYear = _today.getFullYear();
const TODAY_ISO = `${_currentYear}-${String(_today.getMonth() + 1).padStart(2, "0")}-${String(_today.getDate()).padStart(2, "0")}`;

const BOOKING_MIN_DATE = `${_currentYear - 2}-01-01`;
const BOOKING_MAX_DATE = `${_currentYear + 2}-12-31`;
const CREATED_MIN_DATE = `${_currentYear - 2}-01-01`;

export default function DateConflictTab({
    order, onOpenConflictOrder,
}: {
    order: SalesOrder;
    onOpenConflictOrder?: (orderObjectId: string) => void;
}) {
    const { vehicleTypes, fetchVehicleTypes } = useVehicle();
    const [loading, setLoading] = useState(true);
    const [conflictData, setConflictData] = useState<Record<string, ConflictGroup>>({});
    const [activeVehicleTypeKey, setActiveVehicleTypeKey] = useState<string>("");

    // ── Filters ──────────────────────────────────────────────────
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"" | "inProgress" | "closedWon" | "closedLost">("");
    const [bookingFrom, setBookingFrom] = useState("");
    const [bookingTo, setBookingTo] = useState("");
    const [createdFrom, setCreatedFrom] = useState("");
    const [createdTo, setCreatedTo] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchVehicleTypes();
        fetchConflicts();
    }, [order._id]);

    // Vehicle type maarina, filters + page reset pannurom
    useEffect(() => {
        setSearch("");
        setStatusFilter("");
        setBookingFrom("");
        setBookingTo("");
        setCreatedFrom("");
        setCreatedTo("");
        setCurrentPage(1);
    }, [activeVehicleTypeKey]);

    const fetchConflicts = async () => {
        setLoading(true);
        try {
            const token = getToken();
            const { data } = await axios.get(`${API_BASE}sales/pipeline/${order._id}/date-conflicts`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const conflicts = data.data.conflicts || {};
            setConflictData(conflicts);
            const keys = Object.keys(conflicts);
            if (keys.length > 0) setActiveVehicleTypeKey(keys[0]);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const getVehicleTypeName = (vehicleTypeId: string) => {
        if (!vehicleTypeId || !vehicleTypes) return vehicleTypeId;
        const vehicle = vehicleTypes.find((vt: any) => vt._id === vehicleTypeId);
        return vehicle?.typeName || vehicleTypeId;
    };

    const vehicleTypeKeys = Object.keys(conflictData);
    const activeGroup = conflictData[activeVehicleTypeKey];

    // ── Filtered entries ─────────────────────────────────────────
    const filteredEntries = useMemo(() => {
        if (!activeGroup) return [];
        const q = search.trim().toLowerCase();

        return activeGroup.entries.filter((c) => {
            // Search: Order ID or Customer name
            if (q) {
                const orderIdMatch = c.orderId?.toLowerCase().includes(q);
                const nameMatch = (c.companyName || c.name || "").toLowerCase().includes(q);
                if (!orderIdMatch && !nameMatch) return false;
            }

            // Status filter
            if (statusFilter && getStatusKey(c) !== statusFilter) return false;

            // Booking dates filter (overlap logic)
            if (bookingFrom) {
                const bFrom = new Date(bookingFrom + "T00:00:00");
                if (new Date(c.toDate) < bFrom) return false;
            }
            if (bookingTo) {
                const bTo = new Date(bookingTo + "T23:59:59");
                if (new Date(c.fromDate) > bTo) return false;
            }

            // Created At filter
            if (createdFrom) {
                const cFrom = new Date(createdFrom + "T00:00:00");
                if (new Date(c.createdAt) < cFrom) return false;
            }
            if (createdTo) {
                const cTo = new Date(createdTo + "T23:59:59");
                if (new Date(c.createdAt) > cTo) return false;
            }

            return true;
        });
    }, [activeGroup, search, statusFilter, bookingFrom, bookingTo, createdFrom, createdTo]);

    // Filter maarina page 1 ku reset pannurom
    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, bookingFrom, bookingTo, createdFrom, createdTo]);

    const totalPages = Math.max(1, Math.ceil(filteredEntries.length / PAGE_SIZE));
    const paginatedEntries = filteredEntries.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    const activeFilterCount = [
        search.trim() !== "",
        statusFilter !== "",
        bookingFrom !== "",
        bookingTo !== "",
        createdFrom !== "",
        createdTo !== "",
    ].filter(Boolean).length;

    const clearAllFilters = () => {
        setSearch("");
        setStatusFilter("");
        setBookingFrom("");
        setBookingTo("");
        setCreatedFrom("");
        setCreatedTo("");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (vehicleTypeKeys.length === 0) {
        return (
            <div className="p-4">
                <div className="text-center py-14 text-gray-400">
                    <AlertTriangle size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-medium">No date conflicts found</p>
                    <p className="text-xs text-gray-400 mt-1">
                        Intha order oda vehicle bookings vera edhavadhu order kooda date overlap aagala.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-4">
            {vehicleTypeKeys.length > 1 && (
                <div className="flex items-center gap-2 flex-wrap">
                    {vehicleTypeKeys.map((key) => {
                        const grp = conflictData[key];
                        return (
                            <button
                                key={key}
                                onClick={() => setActiveVehicleTypeKey(key)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${activeVehicleTypeKey === key
                                    ? "bg-red-500 text-white border-red-500"
                                    : "bg-white dark:bg-gray-800 text-gray-600 border-gray-200 hover:bg-gray-50"
                                    }`}
                            >
                                {getVehicleTypeName(grp.vehicleType)}
                                <span className="opacity-75 text-[11px]">
                                    {" "}({fmtDate(grp.thisOrderFromDate)} → {fmtDate(grp.thisOrderToDate)})
                                </span>
                                {" "}({grp.entries.length - 1})
                            </button>
                        );
                    })}
                </div>
            )}

            {activeGroup && (
                <>
                    <div className="rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/40 p-3 flex items-start gap-2">
                        <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700 dark:text-red-300">
                            <span className="font-semibold">{getVehicleTypeName(activeGroup.vehicleType)}</span>{" "}
                            has{" "}
                            <span className="font-semibold">{activeGroup.entries.length}</span>{" "}
                            overlapping orders within the selected date range, including this order.
                            The orders are ranked below based on their creation time.
                        </p>
                    </div>

                    {/* Real Inventory Availability Check */}
                    {activeGroup.availability && (
                        <div
                            className={`rounded-xl border p-3 ${activeGroup.availability.available
                                ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/40"
                                : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/40"
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-3">
                                {activeGroup.availability.available ? (
                                    <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                                ) : (
                                    <XCircle size={16} className="text-red-500 flex-shrink-0" />
                                )}
                                <p
                                    className={`text-sm font-semibold ${activeGroup.availability.available
                                        ? "text-emerald-700 dark:text-emerald-300"
                                        : "text-red-700 dark:text-red-300"
                                        }`}
                                >
                                    {activeGroup.availability.available
                                        ? "The vehicle is available for the selected date range."
                                        : "The vehicle is not available for the selected date range."}
                                </p>
                            </div>

                            {activeGroup.availability.error ? (
                                <p className="text-xs text-gray-500">{activeGroup.availability.error}</p>
                            ) : (
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="rounded-lg bg-white/60 dark:bg-black/10 py-2">
                                        <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                                            {activeGroup.availability.totalFleet ?? "—"}
                                        </p>
                                        <p className="text-[11px] text-gray-500">Total Vehicle</p>
                                    </div>
                                    <div className="rounded-lg bg-white/60 dark:bg-black/10 py-2">
                                        <p
                                            className={`text-lg font-bold ${activeGroup.availability.available ? "text-emerald-600" : "text-red-600"
                                                }`}
                                        >
                                            {activeGroup.availability.availableCount}
                                        </p>
                                        <p className="text-[11px] text-gray-500">Available Vehicle</p>
                                    </div>
                                    <div className="rounded-lg bg-white/60 dark:bg-black/10 py-2">
                                        <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                                            {activeGroup.availability.requiredQuantity}
                                        </p>
                                        <p className="text-[11px] text-gray-500">Order Vehicle Count</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Filter Bar ── */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-900">
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Search: Order / Customer */}
                            <div className="relative flex-1 min-w-[200px] max-w-[280px]">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search Order ID or Customer..."
                                    className="w-full pl-8 pr-7 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                                {search && (
                                    <button
                                        onClick={() => setSearch("")}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={13} />
                                    </button>
                                )}
                            </div>

                            {/* Status dropdown */}
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                                <option value="">All Status</option>
                                <option value="inProgress">In Progress</option>
                                <option value="closedWon">Closed Won</option>
                                <option value="closedLost">Closed Lost</option>
                            </select>

                            {activeFilterCount > 0 && (
                                <button
                                    onClick={clearAllFilters}
                                    className="flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                >
                                    <X size={13} />
                                    Clear all ({activeFilterCount})
                                </button>
                            )}
                        </div>

                        {/* Date range filters */}
                        {/* <div className="flex items-end gap-3 flex-wrap mt-3 pt-3 border-t border-dashed border-gray-200 dark:border-gray-700">
                            <div className="w-40">
                                <label className="block text-[11px] font-medium text-gray-500 mb-1">Booking From</label>
                                <DatePicker value={bookingFrom} onChange={setBookingFrom} maxDate={bookingTo || undefined} />
                            </div>
                            <div className="w-40">
                                <label className="block text-[11px] font-medium text-gray-500 mb-1">Booking To</label>
                                <DatePicker value={bookingTo} onChange={setBookingTo} minDate={bookingFrom || undefined} />
                            </div>
                            <div className="w-40">
                                <label className="block text-[11px] font-medium text-gray-500 mb-1">Created From</label>
                                <DatePicker value={createdFrom} onChange={setCreatedFrom} maxDate={createdTo || undefined} />
                            </div>
                            <div className="w-40">
                                <label className="block text-[11px] font-medium text-gray-500 mb-1">Created To</label>
                                <DatePicker value={createdTo} onChange={setCreatedTo} minDate={createdFrom || undefined} />
                            </div>
                        </div> */}

                        {/* Date range filters */}
                        <div className="flex items-end gap-3 flex-wrap mt-3 pt-3 border-t border-dashed border-gray-200 dark:border-gray-700">
                            {/* Booking dates: campaign booking future-um irukalam, so wide range (2024 - current+2 years) */}
                            <div className="w-40">
                                <label className="block text-[11px] font-medium text-gray-500 mb-1">Booking From</label>
                                <DatePicker
                                    value={bookingFrom}
                                    onChange={setBookingFrom}
                                    minDate={BOOKING_MIN_DATE}
                                    maxDate={bookingTo || BOOKING_MAX_DATE}
                                />
                            </div>
                            <div className="w-40">
                                <label className="block text-[11px] font-medium text-gray-500 mb-1">Booking To</label>
                                <DatePicker
                                    value={bookingTo}
                                    onChange={setBookingTo}
                                    minDate={bookingFrom || BOOKING_MIN_DATE}
                                    maxDate={BOOKING_MAX_DATE}
                                />
                            </div>
                            {/* Created At: order created date — past mattum, future varaathu */}
                            <div className="w-40">
                                <label className="block text-[11px] font-medium text-gray-500 mb-1">Created From</label>
                                <DatePicker
                                    value={createdFrom}
                                    onChange={setCreatedFrom}
                                    minDate={CREATED_MIN_DATE}
                                    maxDate={createdTo || TODAY_ISO}
                                />
                            </div>
                            <div className="w-40">
                                <label className="block text-[11px] font-medium text-gray-500 mb-1">Created To</label>
                                <DatePicker
                                    value={createdTo}
                                    onChange={setCreatedTo}
                                    minDate={createdFrom || CREATED_MIN_DATE}
                                    maxDate={TODAY_ISO}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── Table ── */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                                        <th className="text-left px-3 py-2.5 text-xs font-bold text-gray-500 uppercase whitespace-nowrap">#</th>
                                        <th className="text-left px-3 py-2.5 text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Order</th>
                                        <th className="text-left px-3 py-2.5 text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Customer</th>
                                        <th className="text-left px-3 py-2.5 text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Status</th>
                                        <th className="text-left px-3 py-2.5 text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Booking Dates</th>
                                        <th className="text-left px-3 py-2.5 text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Vehicle Assigned</th>
                                        <th className="text-left px-3 py-2.5 text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Created At</th>
                                        <th className="text-left px-3 py-2.5 text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Vehicle Model</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {paginatedEntries.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="text-center py-10 text-gray-400 text-sm">
                                                No matching orders for the selected filters
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedEntries.map((c, idx) => (
                                            <tr
                                                key={c.bookingItemId || `${c.orderObjectId}-${idx}`}
                                                className={`transition-all ${c.isCurrent
                                                    ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500"
                                                    : " hover:bg-gray-50 dark:hover:bg-gray-800/40"
                                                    }`}
                                            >
                                                <td className="px-3 py-2.5 align-top whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex items-center justify-center min-w-[36px] px-2 py-1 rounded-full text-[11px] font-bold ${c.rank === 1
                                                            ? "bg-amber-100 text-amber-700"
                                                            : c.isCurrent
                                                                ? "bg-blue-100 text-blue-700"
                                                                : "bg-gray-100 text-gray-600"
                                                            }`}
                                                    >
                                                        {rankLabel(c.rank)}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2.5 align-top whitespace-nowrap">
                                                    <p className={`font-mono text-xs ${c.isCurrent ? "text-blue-600 dark:text-blue-400 font-semibold" : "text-gray-500"}`}>
                                                        {c.orderId}
                                                    </p>
                                                </td>
                                                <td className="px-3 py-2.5 align-top whitespace-nowrap">
                                                    <p className={`font-semibold ${c.isCurrent ? "text-blue-700 dark:text-blue-300" : "text-gray-800 dark:text-gray-200"}`}>
                                                        {c.companyName || c.name}
                                                    </p>
                                                    {c.isCurrent ? (
                                                        <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500 text-white whitespace-nowrap">
                                                            This Order
                                                        </span>
                                                    ) : (
                                                        c.handlerName && <p className="text-[11px] text-gray-400 mt-0.5">{c.handlerName}</p>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2.5 align-top whitespace-nowrap">
                                                    {(() => {
                                                        const status = getDealStatus(c);
                                                        return (
                                                            <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border ${status.cls}`}>
                                                                {status.label}
                                                            </span>
                                                        );
                                                    })()}
                                                </td>
                                                <td className="px-3 py-2.5 align-top text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                                    {fmtDate(c.fromDate)} → {fmtDate(c.toDate)}
                                                </td>
                                                <td className="px-3 py-2.5 align-top">
                                                    {c.isReserved ? (
                                                        <div className="flex flex-col gap-1.5 max-h-[200px] overflow-y-auto pr-1">
                                                            {c.reservedVehicles.map((rv, rvIdx) => (
                                                                <div
                                                                    key={rvIdx}
                                                                    className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/10 px-2 py-1.5 whitespace-nowrap flex-shrink-0"
                                                                >
                                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500 text-white">
                                                                            Reserved
                                                                        </span>
                                                                        <span className="font-mono text-xs font-semibold text-gray-800 dark:text-gray-200">
                                                                            {rv.vehicleRegistrationNumber || "—"}
                                                                        </span>
                                                                    </div>
                                                                    {rv.driverName && (
                                                                        <p className="text-[12px] text-gray-500 mt-0.5">Driver: {rv.driverName}</p>
                                                                    )}
                                                                    {rv.reservedAt && (
                                                                        <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                                                                            <Clock size={10} className="flex-shrink-0" />
                                                                            Reserved on {fmtDatetime(rv.reservedAt)}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 whitespace-nowrap">
                                                            Not Booked Yet
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2.5 align-top text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={11} className="flex-shrink-0" />
                                                        {fmtDatetime(c.createdAt)}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2.5 align-top whitespace-nowrap">
                                                    <p className="text-gray-700 dark:text-gray-300 font-medium">
                                                        {getVehicleTypeName(activeGroup.vehicleType)}
                                                    </p>
                                                    <p className="text-[12px] text-gray-400 mt-0.5">
                                                        Qty: {c.quantity || 1}
                                                    </p>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* ── Pagination ── */}
                        {filteredEntries.length > 0 && (
                            <div className="flex items-center justify-between px-3 py-2.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
                                <p className="text-[11px] text-gray-500">
                                    Showing {(currentPage - 1) * PAGE_SIZE + 1}-
                                    {Math.min(currentPage * PAGE_SIZE, filteredEntries.length)} of {filteredEntries.length}
                                </p>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                                    >
                                        <ChevronLeft size={14} />
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setCurrentPage(p)}
                                            className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-all ${p === currentPage
                                                ? "bg-red-500 text-white"
                                                : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                                    >
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}