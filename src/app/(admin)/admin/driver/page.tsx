"use client";

import React, { useEffect, useState } from "react";
import { FaRegEdit } from "react-icons/fa";
import { MdOutlineDelete } from "react-icons/md";
import { HiOutlinePlus } from "react-icons/hi";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import { HiOutlineUsers } from "react-icons/hi2";
import { toast, Toaster } from "react-hot-toast";
import API_BASE from "../../../../../baseurl";
import DriverFormModal, { Driver } from "./driverFormModal";
import DeleteConfirmModal from "./DeleteModel";
import { getToken } from "@/utils/auth";

const HEADERS = [
    "S.NO",
    "Name",
    "DOB",
    "Gender",
    "License No",
    "Aadhar No",
    "Address",
    "District",
    "State",
    "Country",
    "Pincode",
    "PAN Number",
    "Actions",
];
const ITEMS_PER_PAGE = 10;

export default function DriverTable() {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const [showFormModal, setShowFormModal] = useState(false);
    const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [genderFilter, setGenderFilter] = useState<"all" | "Male" | "Female" | "Other">("all");

    const fetchDrivers = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = getToken();
            const res = await fetch(`${API_BASE}drivers`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to fetch drivers");
            const data = await res.json();
            setDrivers(data.data);
            setCurrentPage(1);
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrivers();
    }, []);

    const filteredDrivers = drivers.filter((d) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
            d.name.toLowerCase().includes(q) ||
            d.aadharNo.toLowerCase().includes(q) ||
            d.panNumber.toLowerCase().includes(q) ||
            d.dist.toLowerCase().includes(q) ||
            d.state.toLowerCase().includes(q);
        const matchesGender =
            genderFilter === "all" ? true : d.gender === genderFilter;
        return matchesSearch && matchesGender;
    });

    const totalItems = filteredDrivers.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = filteredDrivers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, genderFilter]);

    const handleDeleteConfirm = async () => {
        if (!deletingId) return;
        try {
            setDeleteLoading(true);
            const token = getToken();
            const res = await fetch(`${API_BASE}drivers/${deletingId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to delete");
            await fetchDrivers();
            setShowDeleteModal(false);
            setDeletingId(null);
            toast.success("Driver deleted successfully!");
        } catch (err: any) {
            toast.error(err.message || "Delete failed");
        } finally {
            setDeleteLoading(false);
        }
    };


    const formatDate = (dateString:string) => {
    if (!dateString) return "—";
    
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
};


    return (
        <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30">
                        <HiOutlineUsers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </span>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        Driver Management
                    </h3>
                </div>
                <button
                    onClick={() => {
                        setEditingDriver(null);
                        setShowFormModal(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 active:scale-95 transition-all"
                >
                    <HiOutlinePlus className="h-4 w-4 stroke-2" />
                    Add Driver
                </button>
            </div>

            {/* Search + Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                {/* Search */}
                <div className="relative w-72">
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                        />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by name, aadhar, PAN..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Gender Filter */}
                <select
                    value={genderFilter}
                    onChange={(e) =>
                        setGenderFilter(e.target.value as "all" | "Male" | "Female" | "Other")
                    }
                    className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 cursor-pointer"
                >
                    <option value="all">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>

                {/* Clear Filter */}
                {(searchQuery || genderFilter !== "all") && (
                    <button
                        onClick={() => {
                            setSearchQuery("");
                            setGenderFilter("all");
                            setCurrentPage(1);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
                    >
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                        Clear Filter
                    </button>
                )}
            </div>

            <div className="p-4 sm:p-6">
                {/* Loading */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-blue-200 border-t-blue-600" />
                        <p className="text-sm text-gray-400">Loading...</p>
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                        <p className="text-sm text-red-700">{error}</p>
                        <button
                            onClick={fetchDrivers}
                            className="ml-2 text-sm font-medium underline"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Table */}
                {!loading && !error && (
                    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1100px] border-collapse text-sm">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800/60">
                                        {HEADERS.map((h) => (
                                            <th
                                                key={h}
                                                className="whitespace-nowrap px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {currentItems.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={HEADERS.length}
                                                className="px-5 py-16 text-center text-sm text-gray-500"
                                            >
                                                No drivers found.
                                            </td>
                                        </tr>
                                    ) : (
                                        currentItems.map((driver, idx) => (
                                            <tr
                                                key={driver._id}
                                                className={`group transition-colors hover:bg-blue-50/40 dark:hover:bg-blue-900/10 ${idx % 2 === 0
                                                    ? "bg-white dark:bg-gray-900"
                                                    : "bg-gray-50/50 dark:bg-gray-800/20"
                                                    }`}
                                            >
                                                <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                                                    {startIndex + idx + 1}
                                                </td>

                                                <td className="px-5 py-4 font-medium text-gray-800 dark:text-gray-200">
                                                    {driver.name}
                                                </td>

                                                {/* <td className="px-5 py-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                                    {driver.dob || "—"}
                                                </td> */}

                                                <td className="px-5 py-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                                    {formatDate(driver.dob)}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="inline-flex items-center rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                                        {driver.gender || "—"}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4 text-gray-600 dark:text-gray-300 font-mono text-xs">
                                                    {driver.drivingLicenseNo || "—"}
                                                </td>
                                                <td className="px-5 py-4 text-gray-600 dark:text-gray-300 font-mono text-xs">
                                                    {driver.aadharNo || "—"}
                                                </td>

                                                <td className="px-5 py-4 text-gray-600 dark:text-gray-300 max-w-[120px] truncate">
                                                    {driver.house || "—"}
                                                </td>

                                                <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                                                    {driver.dist || "—"}
                                                </td>

                                                <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                                                    {driver.state || "—"}
                                                </td>

                                                <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                                                    {driver.country || "—"}
                                                </td>

                                                <td className="px-5 py-4 text-gray-600 dark:text-gray-300 font-mono text-xs">
                                                    {driver.pincode || "—"}
                                                </td>

                                                <td className="px-5 py-4 text-gray-600 dark:text-gray-300 font-mono text-xs">
                                                    {driver.panNumber || "—"}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => {
                                                                setEditingDriver(driver);
                                                                setShowFormModal(true);
                                                            }}
                                                            className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 active:scale-95 transition-all dark:border-gray-700 dark:bg-gray-800"
                                                        >
                                                            <FaRegEdit className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setDeletingId(driver._id!);
                                                                setShowDeleteModal(true);
                                                            }}
                                                            className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-red-400 hover:bg-red-50 hover:text-red-600 active:scale-95 transition-all dark:border-gray-700 dark:bg-gray-800"
                                                        >
                                                            <MdOutlineDelete className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/70 px-5 py-4 dark:border-gray-800 dark:bg-gray-800/40">
                                <button
                                    onClick={() =>
                                        currentPage > 1 && setCurrentPage(currentPage - 1)
                                    }
                                    disabled={currentPage === 1}
                                    className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-blue-400 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    <HiOutlineChevronLeft className="h-4 w-4" />
                                </button>
                                <p className="text-xs text-gray-400">
                                    {startIndex + 1} –{" "}
                                    {Math.min(startIndex + ITEMS_PER_PAGE, totalItems)} of{" "}
                                    {totalItems}
                                </p>
                                <button
                                    onClick={() =>
                                        currentPage < totalPages &&
                                        setCurrentPage(currentPage + 1)
                                    }
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

            {/* Form Modal */}
            {showFormModal && (
                <DriverFormModal
                    editingDriver={editingDriver}
                    onSuccess={() => {
                        setShowFormModal(false);
                        fetchDrivers();
                    }}
                    onClose={() => {
                        setShowFormModal(false);
                        setEditingDriver(null);
                    }}
                />
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <DeleteConfirmModal
                    loading={deleteLoading}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => {
                        setShowDeleteModal(false);
                        setDeletingId(null);
                    }}
                />
            )}
        </div>
    );
}
