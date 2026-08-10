
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { HiOutlineClipboardList, HiOutlineSearch } from "react-icons/hi";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import API_BASE from "../../../../baseurl";
import { getToken } from "../../utils/auth";
import { useVehicle } from "@/context/vehicletypecontext";

const HEADERS = ["S.NO", "Client OrderId", "Name", "Phone", "Email", "Vehicle Details", "Status"];
const ITEMS_PER_PAGE = 10;

const STATUS_MAP: Record<number, { label: string; bg: string; color: string }> = {
    0: { label: "Todo", bg: "#fef3c7", color: "#b45309" },
    1: { label: "In Progress", bg: "#dbeafe", color: "#1d4ed8" },
    2: { label: "Completed", bg: "#dcfce7", color: "#15803d" },
};



const STATUS_TABS = [
    { label: "All", value: undefined },
    { label: "Todo", value: 0 },
    { label: "In Progress", value: 1 },
    { label: "Completed", value: 2 },
];

export default function ClientRequestTable() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
    const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
    const { vehicleTypes, fetchVehicleTypes } = useVehicle();

    useEffect(() => { fetchVehicleTypes(); }, []);


    const getVehicleTypeName = (vehicleTypeId: string) => {
        if (!vehicleTypeId || !vehicleTypes) return vehicleTypeId;
        const vehicle = vehicleTypes.find((vt: any) => vt._id === vehicleTypeId);
        return (vehicle as any)?.typeName || vehicleTypeId;
    };

    const fetchClientRequests = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const token = getToken();
            const params = new URLSearchParams();
            if (statusFilter !== undefined) params.append("status", String(statusFilter));
            if (appliedSearch.trim()) params.append("search", appliedSearch.trim());

            const res = await fetch(`${API_BASE}client-requests?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) throw new Error("Failed to fetch client requests");
            const data = await res.json();
            setRequests(data.data);
            setCurrentPage(1);
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }, [statusFilter, appliedSearch]);

    useEffect(() => {
        fetchClientRequests();
    }, [fetchClientRequests]);

    const handleApplyFilter = () => {
        setAppliedSearch(searchInput);
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleApplyFilter();
        }
    };

    const handleResetFilter = () => {
        setSearchInput("");
        setAppliedSearch("");
        setStatusFilter(undefined);
    };

    const totalItems = requests.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = requests.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleStatusChange = async (id: string, newStatus: number) => {
        try {
            setStatusUpdatingId(id);
            const token = getToken();
            const res = await fetch(`${API_BASE}client-requests/${id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error("Failed to update status");
            await fetchClientRequests();
        } catch (err: any) {
            alert(err.message || "Status update failed");
        } finally {
            setStatusUpdatingId(null);
        }
    };

    const formatDate = (d: string) =>
        d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";


    const renderVehicleDetails = (vehicleTypes: any[]) => {
        if (!vehicleTypes || vehicleTypes.length === 0) return <span className="text-gray-400">—</span>;

        return (
            <div className="max-h-[120px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
                {vehicleTypes.map((vt, index) => (
                    <div key={index} className="mb-2 last:mb-0 text-xs border-b border-gray-100 last:border-0 pb-1 last:pb-0">
                        <div className="font-medium text-gray-700">
                            Vehicle {index + 1}
                        </div>
                        <div className="text-gray-500 space-y-0.5">
                            <div>Model: <span className="text-gray-600 font-mono text-[12px]">{getVehicleTypeName(vt.vehicleType?._id) || vt.vehicleType || "—"}</span></div>
                            <div>Qty: <span className="text-gray-600">{vt.quantity}</span></div>
                            <div>From: <span className="text-gray-600">{formatDate(vt.fromDate)}</span></div>
                            <div>To: <span className="text-gray-600">{formatDate(vt.toDate)}</span></div>
                            <div>Days: <span className="text-gray-600 font-medium">{vt.totalDays || "—"}</span></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            {/* Header */}
            <div className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30">
                        <HiOutlineClipboardList className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </span>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Client Request Order Management</h3>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 dark:border-gray-800">
                <div className="flex w-full sm:w-auto items-center gap-2">
                    <div className="relative w-full sm:w-72">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            placeholder="Search by Client Order ID, Name, Email, Phone..."
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:bg-white dark:border-gray-700 dark:bg-gray-800"
                        />
                    </div>
                    <button
                        onClick={handleApplyFilter}
                        className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 active:scale-95 transition-all whitespace-nowrap"
                    >
                        Apply Filter
                    </button>
                    {(appliedSearch || searchInput || statusFilter !== undefined) && (
                        <button
                            onClick={handleResetFilter}
                            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:border-red-300 hover:bg-red-50 hover:text-red-600 active:scale-95 transition-all whitespace-nowrap dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        >
                            Reset
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {STATUS_TABS.map((tab) => (
                        <button
                            key={tab.label}
                            onClick={() => setStatusFilter(tab.value)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${statusFilter === tab.value
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-4 sm:p-6">
                {loading && (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-blue-200 border-t-blue-600" />
                        <p className="text-sm text-gray-400">Loading...</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                        <p className="text-sm text-red-700">{error}</p>
                        <button onClick={fetchClientRequests} className="ml-2 text-sm font-medium underline">Retry</button>
                    </div>
                )}

                {!loading && !error && (
                    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px] border-collapse text-sm">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800/60">
                                        {HEADERS.map((h) => (
                                            <th key={h} className="whitespace-nowrap px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {currentItems.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-5 py-16 text-center text-sm text-gray-500">
                                                No client requests found.
                                            </td>
                                        </tr>
                                    ) : (
                                        currentItems.map((cr, idx) => {
                                            const statusInfo = STATUS_MAP[cr.status] ?? STATUS_MAP[0];
                                            return (
                                                <tr
                                                    key={cr._id}
                                                    className={`group transition-colors hover:bg-blue-50/40 dark:hover:bg-blue-900/10 ${idx % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50/50 dark:bg-gray-800/20"
                                                        }`}
                                                >
                                                    <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{startIndex + idx + 1}</td>
                                                    <td className="px-5 py-4">
                                                        <span
                                                            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                                                            style={{ background: statusInfo.bg, color: statusInfo.color }}
                                                        >
                                                            {cr.clientOrderId}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 font-medium text-gray-800 dark:text-gray-200">{cr.name}</td>
                                                    <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{cr.phone || "—"}</td>
                                                    <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{cr.email || "—"}</td>
                                                    <td className="px-5 py-4 min-w-[250px] max-w-[300px]">
                                                        {renderVehicleDetails(cr.vehicleTypes)}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        {cr.status === 2 ? (
                                                            <span
                                                                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                                                                style={{ background: statusInfo.bg, color: statusInfo.color }}
                                                            >
                                                                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                                                Completed
                                                            </span>
                                                        ) : (
                                                            <select
                                                                value={cr.status}
                                                                disabled={statusUpdatingId === cr._id}
                                                                onChange={(e) => handleStatusChange(cr._id, Number(e.target.value))}
                                                                className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-blue-400 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800"
                                                                style={{ color: statusInfo.color }}
                                                            >
                                                                <option value={0}>Todo</option>
                                                                <option value={1}>In Progress</option>
                                                                <option value={2}>Completed</option>
                                                            </select>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/70 px-5 py-4 dark:border-gray-800 dark:bg-gray-800/40">
                                <button
                                    onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-blue-400 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    <HiOutlineChevronLeft className="h-4 w-4" />
                                </button>
                                <p className="text-xs text-gray-400">
                                    {startIndex + 1} – {Math.min(startIndex + ITEMS_PER_PAGE, totalItems)} of {totalItems}
                                </p>
                                <button
                                    onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-blue-400 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    <HiOutlineChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}