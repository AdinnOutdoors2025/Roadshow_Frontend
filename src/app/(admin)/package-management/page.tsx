
"use client";

import React, { useEffect, useState } from "react";
import PackageFormModal from "./PackageFormModal";
import DeleteConfirmModal from "./DeleteModal";
import API_BASE from "../../../../baseurl";
import { FaRegEdit } from "react-icons/fa";
import { MdOutlineDelete } from "react-icons/md";
import { HiOutlineCube } from "react-icons/hi";
import { HiOutlinePlus } from "react-icons/hi2";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import { useSearch } from "@/context/SearchContext";


export interface Package {
  _id?: string;
  vehicleType: string;
  vehicleModel: string;
  perDayRentalCost: number;
  dailyKmLimit: number;
  additionalHourCharges: number;
  endUserCustomizationPermission: boolean;
  promoterAvailable: boolean;
  promoterChargePerDay?: number;
  driverCharges: number;
  rtoCharges: number;
  isActive: boolean;
  inactiveReason?: string;
   perKmCharge: number, 
}

const HEADERS = [
  "S.NO", "Vehicle Type", "Vehicle Model", "Per Day Cost",
  "KM Limit", "Extra Hour Charges", "Promoter Charges",
  "Driver Charges", "RTO Charges", "Status", "Actions",
];

const ITEMS_PER_PAGE = 10;


function InactiveReasonModal({
  onConfirm,
  onCancel,
  loading,
}: {
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
        <div className="px-6 pt-6 pb-4">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-1">
            Reason for Deactivation
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Please provide a reason for marking this package as inactive.
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason..."
            rows={3}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none resize-none
              focus:border-blue-500 focus:ring-1 focus:ring-blue-500
              dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
          />
        </div>
        <div className="flex items-center gap-3 border-t border-gray-100 px-6 py-4 dark:border-gray-700">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={loading || !reason.trim()}
            className="flex-1 rounded-lg bg-orange-500 py-2.5 text-sm font-medium text-white hover:bg-orange-600 transition-colors disabled:opacity-60"
          >
            {loading ? "Saving..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PackageTable() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);


  const [showReasonModal, setShowReasonModal] = useState(false);
  const [toggleTarget, setToggleTarget] = useState<Package | null>(null);
  const [toggleLoading, setToggleLoading] = useState(false);


  const [filterType, setFilterType] = useState("");
  const [filterModel, setFilterModel] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const { searchTerm } = useSearch();

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}packages/`);
      if (!res.ok) throw new Error("Failed to fetch packages");
      const data = await res.json();
      setPackages(data.data);
      setCurrentPage(1);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPackages(); }, []);


  // const filteredPackages = packages.filter((pkg) => {
  //   if (filterType && pkg.vehicleType !== filterType) return false;
  //   if (filterModel && pkg.vehicleModel !== filterModel) return false;
  //   if (filterStatus === "active" && !pkg.isActive) return false;
  //   if (filterStatus === "inactive" && pkg.isActive) return false;
  //   return true;
  // });


const filteredPackages = packages.filter((pkg) => {
  if (filterType && pkg.vehicleType !== filterType) return false;
  if (filterModel && pkg.vehicleModel !== filterModel) return false;

  if (filterStatus === "active" && !pkg.isActive) return false;
  if (filterStatus === "inactive" && pkg.isActive) return false;

  if (searchTerm) {
    const term = searchTerm.toLowerCase();

    const matchesSearch =
      pkg.vehicleType.toLowerCase().includes(term) ||
      pkg.vehicleModel.toLowerCase().includes(term) ||
      pkg.perDayRentalCost.toString().includes(term) ||
      pkg.dailyKmLimit.toString().includes(term) ||

    
      pkg.additionalHourCharges.toString().includes(term) ||
      (pkg.promoterChargePerDay?.toString() || "").includes(term) ||
      pkg.driverCharges.toString().includes(term) ||
      pkg.rtoCharges.toString().includes(term) ||

     
      (term === "true" && (
        pkg.endUserCustomizationPermission ||
        pkg.promoterAvailable
      )) ||
      (term === "false" && (
        !pkg.endUserCustomizationPermission ||
        !pkg.promoterAvailable
      )) ||

      (term === "customizable" && pkg.endUserCustomizationPermission) ||
      (term === "non-customizable" && !pkg.endUserCustomizationPermission) ||

      (term === "promoter" && pkg.promoterAvailable) ||
      (term === "no promoter" && !pkg.promoterAvailable) ||

      (term === "active" && pkg.isActive) ||
      (term === "inactive" && !pkg.isActive);

    if (!matchesSearch) return false;
  }

  return true;
});

  

  const uniqueTypes = Array.from(new Set(packages.map((p) => p.vehicleType)));
  const uniqueModels = Array.from(new Set(packages.map((p) => p.vehicleModel)));

  const totalItems = filteredPackages.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredPackages.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document.getElementById("package-table")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAddNew = () => { setEditingPackage(null); setShowFormModal(true); };
  const handleEdit = (pkg: Package) => { setEditingPackage(pkg); setShowFormModal(true); };
  const handleDeleteClick = (id: string) => { setDeletingId(id); setShowDeleteModal(true); };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      setDeleteLoading(true);
      const res = await fetch(`${API_BASE}packages/${deletingId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete package");
      await fetchPackages();
      setShowDeleteModal(false);
      setDeletingId(null);
    } catch (err: any) {
      alert(err.message || "Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFormSuccess = () => {
    setShowFormModal(false);
    setEditingPackage(null);
    fetchPackages();
  };

 
  const handleToggleClick = (pkg: Package) => {
    if (pkg.isActive) {
    
      setToggleTarget(pkg);
      setShowReasonModal(true);
    } else {
    
      doToggle(pkg, "");
    }
  };

  const doToggle = async (pkg: Package, reason: string) => {
    try {
      setToggleLoading(true);
      const res = await fetch(`${API_BASE}packages/${pkg._id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error("Failed to toggle status");
      await fetchPackages();
    } catch (err: any) {
      alert(err.message || "Toggle failed");
    } finally {
      setToggleLoading(false);
      setShowReasonModal(false);
      setToggleTarget(null);
    }
  };

  return (
    <div id="package-table" className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

      {/* Header */}
      <div className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30">
            <HiOutlineCube className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </span>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Package Management</h3>
        </div>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all duration-150"
        >
          <HiOutlinePlus className="h-4 w-4 stroke-2" />
          Add Package
        </button>
      </div>


      <div className="flex flex-wrap gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
        <select
          value={filterType}
          onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        >
          <option value="">All Vehicle Types</option>
          {uniqueTypes.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        <select
          value={filterModel}
          onChange={(e) => { setFilterModel(e.target.value); setCurrentPage(1); }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        >
          <option value="">All Vehicle Models</option>
          {uniqueModels.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {(filterType || filterModel || filterStatus) && (
          <button
            onClick={() => { setFilterType(""); setFilterModel(""); setFilterStatus(""); setCurrentPage(1); }}
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100 transition-colors dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="p-4 sm:p-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-blue-200 border-t-blue-600" />
            <p className="text-sm text-gray-400">Loading packages…</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={fetchPackages} className="ml-2 text-sm font-medium underline">Retry</button>
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1080px] border-collapse text-sm">
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
                      <td colSpan={11} className="px-5 py-16 text-center">
                        <p className="text-sm text-gray-500">No packages found.</p>
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((pkg, idx) => (
                      <tr
                        key={pkg._id}
                        className={`group transition-colors hover:bg-blue-50/40 dark:hover:bg-blue-900/10 ${
                          idx % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50/50 dark:bg-gray-800/20"
                        }`}
                      >
                        <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                          {startIndex + idx + 1}
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-blue-400 opacity-70" />
                            <span className="font-medium text-gray-800 dark:text-gray-200">{pkg.vehicleType}</span>
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{pkg.vehicleModel}</td>
                        <td className="px-5 py-4 text-center font-semibold text-gray-800 dark:text-gray-100">
                          ₹{pkg.perDayRentalCost.toLocaleString("en-IN")}
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                            {pkg.dailyKmLimit} km
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center text-gray-600 dark:text-gray-300">
                          ₹{pkg.additionalHourCharges.toLocaleString("en-IN")}/hr
                        </td>
                        <td className="px-5 py-4">
                          {pkg.promoterAvailable ? (
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Yes {pkg.promoterChargePerDay ? `· ₹${pkg.promoterChargePerDay.toLocaleString("en-IN")}/day` : ""}
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">No</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-center text-gray-600 dark:text-gray-300">
                          ₹{pkg.driverCharges.toLocaleString("en-IN")}
                        </td>
                        <td className="px-5 py-4 text-center text-gray-600 dark:text-gray-300">
                          ₹{pkg.rtoCharges.toLocaleString("en-IN")}
                        </td>
                        <td className="px-5 py-4">
                       
                          <button
                            onClick={() => handleToggleClick(pkg)}
                            title={pkg.isActive ? "Click to Deactivate" : "Click to Activate"}
                            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all hover:opacity-80 active:scale-95"
                            style={pkg.isActive
                              ? { background: "#dcfce7", color: "#15803d" }
                              : { background: "#fee2e2", color: "#dc2626" }
                            }
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${pkg.isActive ? "bg-green-500 animate-pulse" : "bg-red-400"}`} />
                            {pkg.isActive ? "Active" : "Inactive"}
                          </button>
                       
                          {/* {!pkg.isActive && pkg.inactiveReason && (
                            <p className="mt-1 text-xs text-gray-400 max-w-[120px] truncate" title={pkg.inactiveReason}>
                              {pkg.inactiveReason}
                            </p>
                          )} */}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEdit(pkg)}
                              title="Edit"
                              className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 active:scale-95 transition-all dark:border-gray-700 dark:bg-gray-800"
                            >
                              <FaRegEdit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => pkg._id && handleDeleteClick(pkg._id)}
                              title="Delete"
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

           
            {filteredPackages.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-end gap-4 border-t border-gray-100 bg-gray-50/70 px-5 py-4 dark:border-gray-800 dark:bg-gray-800/40">
                {/* <div className="flex gap-1">
                  {packages.filter((p) => p.isActive).length > 0 && (
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                      {packages.filter((p) => p.isActive).length} active
                    </span>
                  )}
                  {packages.filter((p) => !p.isActive).length > 0 && (
                    <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-600">
                      {packages.filter((p) => !p.isActive).length} inactive
                    </span>
                  )}
                </div> */}

                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`inline-flex items-center justify-center h-8 w-8 rounded-lg border transition-all ${
                        currentPage === 1
                          ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "border-gray-200 bg-white text-gray-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 active:scale-95"
                      }`}
                    >
                      <HiOutlineChevronLeft className="h-4 w-4" />
                    </button>
                    <p className="text-xs text-gray-400">
                      Showing <span className="font-medium text-gray-600">{startIndex + 1}</span> to{" "}
                      <span className="font-medium text-gray-600">{Math.min(startIndex + ITEMS_PER_PAGE, totalItems)}</span>{" "}
                      of <span className="font-medium text-gray-600">{totalItems}</span>
                    </p>
                    <button
                      onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`inline-flex items-center justify-center h-8 w-8 rounded-lg border transition-all ${
                        currentPage === totalPages
                          ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "border-gray-200 bg-white text-gray-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 active:scale-95"
                      }`}
                    >
                      <HiOutlineChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

   
      {showFormModal && (
        <PackageFormModal
          editingPackage={editingPackage}
          onSuccess={handleFormSuccess}
          onClose={() => { setShowFormModal(false); setEditingPackage(null); }}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmModal
          loading={deleteLoading}
          onConfirm={handleDeleteConfirm}
          onCancel={() => { setShowDeleteModal(false); setDeletingId(null); }}
        />
      )}


      {showReasonModal && toggleTarget && (
        <InactiveReasonModal
          loading={toggleLoading}
          onConfirm={(reason) => doToggle(toggleTarget, reason)}
          onCancel={() => { setShowReasonModal(false); setToggleTarget(null); }}
        />
      )}
    </div>
  );
}