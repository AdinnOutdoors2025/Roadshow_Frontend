"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaRegEdit } from "react-icons/fa";
import { MdOutlineDelete } from "react-icons/md";
import { HiOutlinePlus, HiOutlineUserGroup } from "react-icons/hi";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import API_BASE from "../../../../baseurl";
import StaffAdminFormModal from "./StaffAdminFormModal";
import DeleteConfirmModal from "./DeleteModal";
import { getToken } from "../../utils/auth";


const HEADERS = ["S.NO", "Username", "Email", "Phone", "Role", "Status", "Actions"];
const ITEMS_PER_PAGE = 10;

export default function StaffAdminTable() {
  const [staffAdmins, setStaffAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingStaffAdmin, setEditingStaffAdmin] = useState<any | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const fetchStaffAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      const { data } = await axios.get(`${API_BASE}staff-admins`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaffAdmins(data.data.data);
      setCurrentPage(1);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch staff admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaffAdmins(); }, []);

  const filteredStaffAdmins = staffAdmins.filter((sa) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (sa.username || "").toLowerCase().includes(q) ||
      (sa.email || "").toLowerCase().includes(q) ||
      (sa.phone || "").toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" ? true : sa.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalItems = filteredStaffAdmins.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredStaffAdmins.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      setDeleteLoading(true);
      const token = getToken();
      await axios.delete(`${API_BASE}staff-admins/${deletingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchStaffAdmins();
      setShowDeleteModal(false);
      setDeletingId(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

      {/* Header */}
      <div className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30">
            <HiOutlineUserGroup className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </span>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Sales Management</h3>
        </div>
        <button
          onClick={() => { setEditingStaffAdmin(null); setShowFormModal(true); }}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 active:scale-95 transition-all"
        >
          <HiOutlinePlus className="h-4 w-4 stroke-2" />
          Add Sales User
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
            placeholder="Search by username, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
          className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* Clear Filter */}
        {(searchQuery || statusFilter !== "all") && (
          <button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
              setCurrentPage(1);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear Filter
          </button>
        )}
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
            <button onClick={fetchStaffAdmins} className="ml-2 text-sm font-medium underline">Retry</button>
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse text-sm">
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
                      <td colSpan={6} className="px-5 py-16 text-center text-sm text-gray-500">
                        No sales users found.
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((sa, idx) => (
                      <tr
                        key={sa._id}
                        className={`group transition-colors hover:bg-blue-50/40 dark:hover:bg-blue-900/10 ${idx % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50/50 dark:bg-gray-800/20"
                          }`}
                      >
                        <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{startIndex + idx + 1}</td>
                        <td className="px-5 py-4 font-medium text-gray-800 dark:text-gray-200">{sa.username}</td>
                        <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{sa.email || "—"}</td>
                        <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{sa.phone || "—"}</td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                            Sales
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                            style={sa.status === "active"
                              ? { background: "#dcfce7", color: "#15803d" }
                              : { background: "#fee2e2", color: "#dc2626" }
                            }
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${sa.status === "active" ? "bg-green-500 animate-pulse" : "bg-red-400"}`} />
                            {sa.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => { setEditingStaffAdmin(sa); setShowFormModal(true); }}
                              className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 active:scale-95 transition-all dark:border-gray-700 dark:bg-gray-800"
                            >
                              <FaRegEdit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => { setDeletingId(sa._id!); setShowDeleteModal(true); }}
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

      {showFormModal && (
        <StaffAdminFormModal
          editingStaffAdmin={editingStaffAdmin}
          onSuccess={() => { setShowFormModal(false); fetchStaffAdmins(); }}
          onClose={() => { setShowFormModal(false); setEditingStaffAdmin(null); }}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmModal
          loading={deleteLoading}
          onConfirm={handleDeleteConfirm}
          onCancel={() => { setShowDeleteModal(false); setDeletingId(null); }}
        />
      )}
    </div>
  );
}