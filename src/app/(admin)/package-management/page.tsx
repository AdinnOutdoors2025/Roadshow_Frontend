

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
}

const HEADERS = [
  "S.NO",
  "Vehicle Type",
  "Vehicle Model",
  "Per Day Cost",
  "KM Limit",
  "Extra Hour Charges",
  "Promoter Charges",
  "Driver Charges",
  "RTO Charges",
  "Status",
  "Actions",
];

const ITEMS_PER_PAGE = 10;

export default function PackageTable() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(ITEMS_PER_PAGE);

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  useEffect(() => {
    fetchPackages();
  }, []);


  const totalItems = packages.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = packages.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);

    document.getElementById("package-table")?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const handleAddNew = () => {
    setEditingPackage(null);
    setShowFormModal(true);
  };

  const handleEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    setShowFormModal(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      setDeleteLoading(true);
      const res = await fetch(`${API_BASE}packages/${deletingId}`, {
        method: "DELETE",
      });
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



  return (
    <div id="package-table" className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">


      <div className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30">
            <HiOutlineCube className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Package Management
            </h3>

          </div>
        </div>

        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all duration-150"
        >
          <HiOutlinePlus className="h-4 w-4 stroke-2" />
          Add Package
        </button>
      </div>


      <div className="p-4 sm:p-6">


        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-blue-200 border-t-blue-600" />
            <p className="text-sm text-gray-400 dark:text-gray-500">Loading packages…</p>
          </div>
        )}


        {!loading && error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-900/20">
            <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1 text-sm text-red-700 dark:text-red-400">
              {error}
              <button onClick={fetchPackages} className="ml-2 font-medium underline underline-offset-2 hover:no-underline">
                Retry
              </button>
            </div>
          </div>
        )}


        {!loading && !error && (
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1080px] border-collapse text-sm">


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
                      <td colSpan={10} className="px-5 py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                            <HiOutlineCube className="h-6 w-6 text-gray-400" />
                          </span>
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">No packages yet</p>
                            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">Click "Add Package" to create your first one.</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((pkg, idx) => (
                      <tr
                        key={pkg._id}
                        className={`group transition-colors duration-100 hover:bg-blue-50/40 dark:hover:bg-blue-900/10 ${idx % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50/50 dark:bg-gray-800/20"
                          }`}
                      >

                        <td className="px-5 py-4 text-left text-gray-600 dark:text-gray-300">
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </td>

                        <td className="px-5 py-4 text-left">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-blue-400 opacity-70" />
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                              {pkg.vehicleType}
                            </span>
                          </span>
                        </td>


                        <td className="px-5 py-4 text-left text-gray-600 dark:text-gray-300">
                          {pkg.vehicleModel}
                        </td>


                        <td className="px-5 py-4 text-center">
                          <span className="font-semibold text-gray-800 dark:text-gray-100">
                            ₹{pkg.perDayRentalCost.toLocaleString()}
                          </span>
                        </td>


                        <td className="px-5 py-4 text-left">
                          <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                            {pkg.dailyKmLimit} km
                          </span>
                        </td>


                        <td className="px-5 py-4 text-center text-gray-600 dark:text-gray-300">
                          ₹{pkg.additionalHourCharges}/hr
                        </td>


                        <td className="px-5 py-4 text-left">
                          {pkg.promoterAvailable ? (
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Yes {pkg.promoterChargePerDay ? `· ₹${pkg.promoterChargePerDay}/day` : ""}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                              No
                            </span>
                          )}
                        </td>


                        <td className="px-5 py-4 text-center text-gray-600 dark:text-gray-300">
                          ₹{pkg.driverCharges}
                        </td>


                        <td className="px-5 py-4 text-center text-gray-600 dark:text-gray-300">
                          ₹{pkg.rtoCharges}
                        </td>


                        <td className="px-5 py-4 text-left">
                          {pkg.isActive ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                              Inactive
                            </span>
                          )}
                        </td>


                        <td className="px-5 py-4 text-left">
                          <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity duration-150">
                            <button
                              onClick={() => handleEdit(pkg)}
                              title="Edit"
                              className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 active:scale-95 transition-all duration-150 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-blue-500 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                            >
                              <FaRegEdit className="h-3.5 w-3.5" />
                            </button>

                            <button
                              onClick={() => pkg._id && handleDeleteClick(pkg._id)}
                              title="Delete"
                              className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-red-400 hover:bg-red-50 hover:text-red-600 active:scale-95 transition-all duration-150 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
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


            {packages.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 bg-gray-50/70 px-5 py-4 dark:border-gray-800 dark:bg-gray-800/40">




                <div className="flex gap-1">
                  {packages.filter((p) => p.isActive).length > 0 && (
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      {packages.filter((p) => p.isActive).length} active
                    </span>
                  )}
                  {packages.filter((p) => !p.isActive).length > 0 && (
                    <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400">
                      {packages.filter((p) => !p.isActive).length} inactive
                    </span>
                  )}
                </div>


                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                  
                    <button
                      onClick={handlePrevious}
                      disabled={currentPage === 1}
                      className={`inline-flex items-center justify-center h-8 w-8 rounded-lg border transition-all duration-150 ${currentPage === 1
                          ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-600"
                          : "border-gray-200 bg-white text-gray-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 active:scale-95 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-blue-500 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                        }`}
                    >
                      <HiOutlineChevronLeft className="h-4 w-4" />
                    </button>


                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Showing <span className="font-medium text-gray-600 dark:text-gray-300">{startIndex + 1}</span> to{" "}
                      <span className="font-medium text-gray-600 dark:text-gray-300">
                        {Math.min(endIndex, totalItems)}
                      </span>{" "}
                      of <span className="font-medium text-gray-600 dark:text-gray-300">{totalItems}</span> packages
                    </p>

                    <button
                      onClick={handleNext}
                      disabled={currentPage === totalPages}
                      className={`inline-flex items-center justify-center h-8 w-8 rounded-lg border transition-all duration-150 ${currentPage === totalPages
                          ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-600"
                          : "border-gray-200 bg-white text-gray-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 active:scale-95 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-blue-500 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
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
          onClose={() => {
            setShowFormModal(false);
            setEditingPackage(null);
          }}
        />
      )}

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