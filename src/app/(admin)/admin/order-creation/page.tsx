

"use client";

import React, { useEffect, useState } from "react";
import AdminOrderForm from "./AdminOrderForm";
import { HiOutlineShoppingBag, HiOutlineEye } from "react-icons/hi";
import { HiOutlinePlus, HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi2";
import API_BASE from "../../../../../baseurl";
import { useAuthGuard } from "../../../../utils/useAuthGuard";
import { getToken } from "@/utils/auth";
import { useVehicle } from './../../../../../src/context/vehicletypecontext';

interface BookingItem {
  vehicleModel: string;
  vehicleType: string;
  campaignType: string;
  otherCampaignType?: string;
  fromDate: string;
  toDate: string;
  state: string;
  city: string;
  quantity: number;
  totalDays: number;
  extraDays?: number;
  extraKm?: number;
  extraHours?: number;
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
  needPromoter: boolean;
  fromLocation?: string;
  toLocation?: string;
  promoterType?: string;
  otherPromoterType?: string;
  promoterGender?: string;
  promoterLanguage?: string;
  promoterQuantity?: number;
  bookingFor?: string;
  gstNumber?: string;
  perDayRentalCost?: number;
  driverCharges?: number;
  promoterChargePerDay?: number;
  rtoCharges?: number;
  additionalHourCharges?: number;
  rentalCost?: number;
  driverCost?: number;
  promoterCost?: number;
  rtoCost?: number;
  extraKmCost?: number;
  extraHourCost?: number;
  campaignImages?: string[];
  campaignVideos?: string[];
  additionalCharges?: { id: string; label: string; amount: number; mode: "+" | "-" }[];
  additionalFields?: { id: string; label: string; amount: number; mode: "+" | "-" }[];
  dailyKmcharges?: number
}


interface VehicleType {
  _id: string;
  name: string;
}

interface Order {
  _id: string;
  orderId: string;
  name: string;
  phone: string;
  address?: string;
  email?: string;
  grandTotal: number;
  orderStatus: "Pending" | "Confirmed" | "Cancelled";
  pipelineStatus: "newOrder" | "proposal" | "negotiation" | "closedWon" | "closedLoss";
  isAdminCreated?: boolean;
  bookingItems: BookingItem[];
  createdAt: string;
  handlername?: string;
  grandNegotiationTotal?: number;
  campaignType?: string
  grandGst?: number
  dailyKmcharges?: number
  customerType: string
}



const HEADERS = [
  "S.No",
  "Order ID",
  "Customer",
  "Vehicles",
  "Duration",
  "Location",
  "Grand Total",
  "Pipeline",
  "Order Status",
  "Created",
  "Actions",
];

const ITEMS_PER_PAGE = 10;

const PIPELINE_CONFIG: Record<string, { label: string; color: string }> = {
  newOrder: { label: "New Order", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  proposal: { label: "Proposal", color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" },
  negotiation: { label: "Negotiation", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
  closedWon: { label: "Closed Won", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
  closedLoss: { label: "Closed Loss", color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
};

const STATUS_CONFIG: Record<string, { color: string; dot: string }> = {
  Pending: { color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", dot: "bg-amber-400 animate-pulse" },
  Confirmed: { color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", dot: "bg-green-500" },
  Cancelled: { color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400", dot: "bg-red-400" },
};




function formatDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}



function getDateRange(items: BookingItem[]) {
  if (!items || items.length === 0) return "—";
  try {
    const dates = items.flatMap((i) => [
      new Date(i.fromDate),
      new Date(i.toDate),
    ]);
    const min = new Date(Math.min(...dates.map((d) => d.getTime())));
    const max = new Date(Math.max(...dates.map((d) => d.getTime())));
    return `${formatDate(min.toISOString())} → ${formatDate(max.toISOString())}`;
  } catch {
    return "—";
  }
}

function getLocations(items: BookingItem[]) {
  if (!items || items.length === 0) return "—";
  const cities = [...new Set(items.map((i) => i.city).filter(Boolean))];
  return cities.length ? cities.join(", ") : "—";
}

function getTotalDays(items: BookingItem[]) {
  return items.reduce((s, i) => s + (i.totalDays || 0), 0);
}


export default function OrdersPage() {

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);


  const [filterPipeline, setFilterPipeline] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  useAuthGuard();

  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);


  const { vehicleTypes, fetchVehicleTypes } = useVehicle();
 


  useEffect(() => {
    fetchVehicleTypes()
  }, [])

  function formatINR(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(amount);
  }

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();

      const res = await fetch(`${API_BASE}admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Server error: ${res.status}`);
      }

      const data = await res.json();
      const list: Order[] = data.data?.orders || [];
      setOrders(list);
      setCurrentPage(1);
    } catch (err: any) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);


  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(null), 4000);
    return () => clearTimeout(t);
  }, [successMsg]);





  const filtered = orders.filter((o) => {
    const matchPipeline = filterPipeline === "all" || o.pipelineStatus === filterPipeline;
    const matchStatus = filterStatus === "all" || o.orderStatus === filterStatus;
    const q = searchQ.trim().toLowerCase();
    const matchSearch = !q ||
      (o.orderId || "").toLowerCase().includes(q) ||
      (o.name || "").toLowerCase().includes(q) ||
      (o.phone || "").includes(q);
    return matchPipeline && matchStatus && matchSearch;
  });

  // ── Pagination 
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    document.getElementById("orders-table-top")?.scrollIntoView({ behavior: "smooth" });
  };


  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.orderStatus === "Pending").length,
    confirmed: orders.filter((o) => o.orderStatus === "Confirmed").length,
    closedWon: orders.filter((o) => o.pipelineStatus === "closedWon").length,
    adminCreated: orders.filter((o) => o.isAdminCreated).length,
  };



  return (
    <div id="orders-table-top" className="w-full space-y-4">


      {successMsg && (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-900/20">
          <svg className="h-4 w-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-medium text-green-700 dark:text-green-400">{successMsg}</p>
        </div>
      )}


      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total Orders", val: stats.total, color: "text-gray-800 dark:text-white", bg: "bg-gray-50 dark:bg-gray-800/60" },
          { label: "Pending", val: stats.pending, color: "text-amber-700 dark:text-amber-300", bg: "bg-amber-50 dark:bg-amber-900/20" },
          { label: "Confirmed", val: stats.confirmed, color: "text-green-700 dark:text-green-300", bg: "bg-green-50 dark:bg-green-900/20" },
          { label: "Closed Won", val: stats.closedWon, color: "text-blue-700 dark:text-blue-300", bg: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "Admin Created", val: stats.adminCreated, color: "text-violet-700 dark:text-violet-300", bg: "bg-violet-50 dark:bg-violet-900/20" },
        ].map(({ label, val, color, bg }) => (
          <div key={label} className={`rounded-xl border border-gray-200 dark:border-gray-700 ${bg} px-4 py-3`}>
            <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${color}`}>{loading ? "—" : val}</p>
          </div>
        ))}
      </div>


      <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

        <div className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30">
              <HiOutlineShoppingBag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Order Management</h3>
              {!loading && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {filtered.length} order{filtered.length !== 1 ? "s" : ""}
                  {filtered.length !== orders.length && ` (filtered from ${orders.length})`}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all duration-150"
          >
            <HiOutlinePlus className="h-4 w-4 stroke-2" />
            Create Order
          </button>
        </div>


        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-6 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">


          <div className="relative w-full sm:max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQ}
              onChange={(e) => { setSearchQ(e.target.value); setCurrentPage(1); }}
              placeholder="Search order ID, name, phone..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500"
            />
          </div>


          <select
            value={filterPipeline}
            onChange={(e) => { setFilterPipeline(e.target.value); setCurrentPage(1); }}
            className="text-sm rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            <option value="all">All Pipeline</option>
            {Object.entries(PIPELINE_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>


          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="text-sm rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
          </select>


          {(searchQ || filterPipeline !== "all" || filterStatus !== "all") && (
            <button
              onClick={() => { setSearchQ(""); setFilterPipeline("all"); setFilterStatus("all"); setCurrentPage(1); }}
              className="text-xs font-medium text-blue-600 hover:underline whitespace-nowrap dark:text-blue-400"
            >
              Reset filters
            </button>
          )}


          <button
            onClick={fetchOrders}
            disabled={loading}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
          >
            <svg className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>


        <div className="p-4 sm:p-6">


          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-blue-200 border-t-blue-600" />
              <p className="text-sm text-gray-400 dark:text-gray-500">Loading orders…</p>
            </div>
          )}


          {!loading && error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-900/20">
              <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1 text-sm text-red-700 dark:text-red-400">
                {error}
                <button
                  onClick={fetchOrders}
                  className="ml-2 font-medium underline underline-offset-2 hover:no-underline"
                >
                  Retry
                </button>
              </div>
            </div>
          )}


          {!loading && !error && (
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px] border-collapse text-sm">


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


                    {currentItems.length === 0 && (
                      <tr>
                        <td colSpan={HEADERS.length} className="px-5 py-20 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                              <HiOutlineShoppingBag className="h-7 w-7 text-gray-400" />
                            </span>
                            <div>
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                {searchQ || filterPipeline !== "all" || filterStatus !== "all"
                                  ? "No orders match your filters"
                                  : "No orders yet"}
                              </p>
                              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                {searchQ || filterPipeline !== "all" || filterStatus !== "all"
                                  ? "Try adjusting your search or filters"
                                  : 'Click "Create Order" to create the first order'}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}


                    {currentItems.map((order, idx) => {
                      const pipeline = PIPELINE_CONFIG[order.pipelineStatus] || { label: order.pipelineStatus, color: "bg-gray-100 text-gray-500" };
                      const statusCfg = STATUS_CONFIG[order.orderStatus] || { color: "bg-gray-100 text-gray-500", dot: "bg-gray-400" };
                      const vehicleCount = order.bookingItems?.length || 0;
                      const vehicleNames = [...new Set((order.bookingItems || []).map((b) => b.vehicleModel).filter(Boolean))].join(", ");
                      const displayTotal = order.grandNegotiationTotal && order.grandNegotiationTotal > 0
                        ? order.grandNegotiationTotal
                        : order.grandTotal;

                      return (
                        <tr
                          key={order._id}
                          className={`group transition-colors duration-100 hover:bg-blue-50/40 dark:hover:bg-blue-900/10
                            ${idx % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50/50 dark:bg-gray-800/20"}`}
                        >

                          <td className="px-5 py-4 text-xs text-gray-400 dark:text-gray-500">
                            {startIndex + idx + 1}
                          </td>


                          <td className="px-5 py-4">
                            <div className="flex flex-col gap-1">
                              <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                                {order.orderId}
                              </span>
                              {order.isAdminCreated && (
                                <span className="inline-flex w-fit items-center rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-600 dark:bg-violet-900/30 dark:text-violet-300">
                                  Admin
                                </span>
                              )}
                            </div>
                          </td>


                          <td className="px-5 py-4">
                            <p className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[130px]">
                              {order.name}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">{order.phone}</p>
                          </td>


                          <td className="px-5 py-4">
                            <div className="flex flex-col gap-1">
                              <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 w-fit">
                                {vehicleCount} vehicle{vehicleCount !== 1 ? "s" : ""}
                              </span>
                              {vehicleNames && (
                                <span className="text-xs text-gray-400 truncate max-w-[150px]" title={vehicleNames}>
                                  {vehicleNames}
                                </span>
                              )}
                            </div>
                          </td>


                          <td className="px-5 py-4 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                            {getDateRange(order.bookingItems || [])}
                          </td>


                          <td className="px-5 py-4">
                            <p className="text-xs text-gray-600 dark:text-gray-300 max-w-[130px] truncate" title={getLocations(order.bookingItems || [])}>
                              {getLocations(order.bookingItems || [])}
                            </p>
                          </td>


                          <td className="px-5 py-4">
                            <p className="font-bold text-gray-900 dark:text-white">
                              ₹{displayTotal ? displayTotal.toLocaleString("en-IN") : "—"}
                            </p>

                            {order.grandNegotiationTotal &&
                              order.grandNegotiationTotal > 0 &&
                              order.grandNegotiationTotal !== order.grandTotal && (
                                <p className="text-[10px] text-gray-400 line-through">
                                  ₹{formatINR(order.grandTotal)}
                                </p>
                              )
                            }
                          </td>


                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${pipeline.color}`}>
                              {pipeline.label}
                            </span>
                          </td>


                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusCfg.color}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                              {order.orderStatus}
                            </span>
                          </td>


                          <td className="px-5 py-4 text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                            {formatDate(order.createdAt)}
                          </td>


                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity duration-150">

                              <button
                                onClick={() => setSelectedOrder(order)}
                                title="View"
                                className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 active:scale-95 transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                              >
                                <HiOutlineEye className="h-4 w-4" />
                              </button>


                              {/* {order.orderStatus !== "Confirmed" && order.orderStatus !== "Cancelled" && (
                                <button
                                  onClick={() => setEditingOrder(order)}
                                  title="Edit"
                                  className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-600 active:scale-95 transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                >
                                  <HiOutlinePencil className="h-4 w-4" />
                                </button>
                              )} */}


                              {/* {order.orderStatus !== "Confirmed" && (
                                <button
                                  onClick={() => setDeletingOrder(order)}
                                  title="Delete"
                                  className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-red-400 hover:bg-red-50 hover:text-red-600 active:scale-95 transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                >
                                  <HiOutlineTrash className="h-4 w-4" />
                                </button>
                              )} */}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>


              {filtered.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 bg-gray-50/70 px-5 py-4 dark:border-gray-800 dark:bg-gray-800/40">


                  <div className="flex gap-1.5 flex-wrap">
                    {Object.entries(STATUS_CONFIG).map(([s, cfg]) => {
                      const count = orders.filter((o) => o.orderStatus === s).length;
                      return count > 0 ? (
                        <span key={s} className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}>
                          {count} {s}
                        </span>
                      ) : null;
                    })}
                  </div>


                  {totalPages > 1 && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`inline-flex items-center justify-center h-8 w-8 rounded-lg border transition-all duration-150
                          ${currentPage === 1
                            ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-600"
                            : "border-gray-200 bg-white text-gray-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 active:scale-95 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-blue-500"
                          }`}
                      >
                        <HiOutlineChevronLeft className="h-4 w-4" />
                      </button>

                      <p className="text-xs text-gray-400 dark:text-gray-500 px-1">
                        Showing{" "}
                        <span className="font-medium text-gray-600 dark:text-gray-300">{startIndex + 1}</span>
                        {" "}–{" "}
                        <span className="font-medium text-gray-600 dark:text-gray-300">
                          {Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)}
                        </span>
                        {" "}of{" "}
                        <span className="font-medium text-gray-600 dark:text-gray-300">{filtered.length}</span>
                        {" "}orders
                      </p>

                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`inline-flex items-center justify-center h-8 w-8 rounded-lg border transition-all duration-150
                          ${currentPage === totalPages
                            ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-600"
                            : "border-gray-200 bg-white text-gray-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 active:scale-95 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-blue-500"
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
      </div>


      {showForm && (
        <AdminOrderForm
          onClose={() => setShowForm(false)}
          onSuccess={(orderId) => {
            setShowForm(false);
            setSuccessMsg(` Order ${orderId} created successfully!`);
            fetchOrders();
          }}
        />
      )}


      {selectedOrder && (
        <OrderDetailDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          vehicleTypes={vehicleTypes}
        />
      )}

    </div>
  );
}


function OrderDetailDrawer({ order, onClose, vehicleTypes }: { order: Order; onClose: () => void, vehicleTypes: any }) {
  const pipeline = PIPELINE_CONFIG[order.pipelineStatus] || { label: order.pipelineStatus, color: "bg-gray-100 text-gray-500" };
  const statusCfg = STATUS_CONFIG[order.orderStatus] || { color: "bg-gray-100 text-gray-500", dot: "bg-gray-400" };

  const displayTotal = order.grandNegotiationTotal && order.grandNegotiationTotal > 0
    ? order.grandNegotiationTotal
    : order.grandTotal;

  function formatINR(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(amount);
  }


  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `http://localhost:3001${path.startsWith('/') ? path : `/${path}`}`;
  };



  const getVehicleTypeName = (vehicleTypeId: string) => {
    if (!vehicleTypeId || !vehicleTypes) return '';
    const vehicle = vehicleTypes.find((vt: any) => vt._id === vehicleTypeId);
    return vehicle?.typeName || vehicleTypeId;
  };




  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl h-full overflow-y-auto bg-white shadow-2xl dark:bg-gray-900 flex flex-col animate-in slide-in-from-right duration-300">

        {/* ── Header ── */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-5 dark:border-gray-700 dark:bg-gray-900 shadow-sm">
          <div>
            <p className="font-mono text-base font-bold text-blue-600 dark:text-blue-400">{order.orderId}</p>
            <p className="text-sm text-gray-500 mt-1">{formatDate(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${statusCfg.color}`}>
              <span className={`h-2 w-2 rounded-full ${statusCfg.dot}`} />
              {order.orderStatus}
            </span>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-all"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 px-6 py-6 space-y-6">

          {/* Customer Information Section */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-6 w-1 bg-blue-500 rounded-full"></div>
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Customer Information</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 p-5 space-y-3">
              {[
                { label: "Full Name", val: order.name, icon: "👤" },
                { label: "Phone Number", val: order.phone, icon: "📞" },
                { label: "Email Address", val: order.email || "—", icon: "✉️" },
                { label: "Address", val: order.address || "—", icon: "📍" },
              ].map(({ label, val, icon }) => (
                <div key={label} className="flex items-start gap-3 text-sm">
                  <span className="text-lg">{icon}</span>
                  <div className="flex-1">
                    <span className="text-gray-500 block text-xs mb-0.5">{label}</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200 text-base">{val}</span>
                  </div>
                </div>
              ))}

              <div className="flex items-start gap-3 text-sm">
                <span className="text-lg">🏷️</span>
                <div className="flex-1">
                  <span className="text-gray-500 block text-xs mb-0.5">Customer Type</span>
                  <span className={`font-medium text-base inline-flex items-center gap-2 ${order.customerType === 1
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-blue-600 dark:text-blue-400'
                    }`}>
                    <span className={`w-2 h-2 rounded-full ${order.customerType === 1 ? 'bg-green-500' : 'bg-blue-500'
                      }`}></span>
                    {order.customerType === 1 ? '🆕 New Customer' : '⭐ Existing Customer'}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📊</span>
                    <span className="text-gray-500 text-sm">Pipeline Status</span>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold ${pipeline.color}`}>
                    {pipeline.label}
                  </span>
                </div>
              </div>

              {order.handlername && (
                <div className="flex items-center gap-3">
                  <span className="text-lg">👨‍💼</span>
                  <div className="flex-1">
                    <span className="text-gray-500 block text-xs mb-0.5">Assigned Handler</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200 text-base">{order.handlername}</span>
                  </div>
                </div>
              )}

              {order.isAdminCreated && (
                <div className="flex items-center gap-3">
                  <span className="text-lg">🏷️</span>
                  <div className="flex-1">
                    <span className="text-gray-500 block text-xs mb-0.5">Order Source</span>
                    <span className="text-sm font-semibold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-2 py-1 rounded inline-block">Admin Created</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Vehicles Section */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-6 w-1 bg-green-500 rounded-full"></div>
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Vehicles ({order.bookingItems?.length || 0})
              </p>
            </div>
            <div className="space-y-4">
              {(order.bookingItems || []).map((item, i) => {
                const baseDays = item.fromDate && item.toDate
                  ? Math.ceil(
                    (new Date(item.toDate).getTime() - new Date(item.fromDate).getTime()) / 86400000
                  )
                  : 0;
                const extraDays = item.extraDays || 0;
                const totalDays = baseDays + extraDays;

                const durationLabel = item.fromDate && item.toDate
                  ? `${formatDate(item.fromDate)} → ${formatDate(item.toDate)}`
                  : "—";

                return (
                  <div key={i} className="rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 overflow-hidden">
                    {/* Vehicle Header */}
                    <div className="bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800/50 p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">V{i + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                            {item.vehicleModel || "Vehicle Details"}
                          </p>
                          {/* {item.vehicleType && (
                            <p className="text-sm text-gray-500 mt-0.5">{item.vehicleType}</p>
                          )} */}
                          {item.vehicleType && (
                            <p className="text-sm text-gray-500 mt-0.5">
                              {getVehicleTypeName(item.vehicleType)}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Quantity</p>
                          <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{item.quantity || 1}x</p>
                        </div>
                      </div>
                    </div>

                    {/* Booking Details Grid */}
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { icon: "👤", label: "Booking For", value: item.bookingFor || "—" },
                          { icon: "🎯", label: "Campaign", value: item.campaignType === "Other" ? (item.otherCampaignType || "Other") : (item.campaignType || "—") },
                          { icon: "📅", label: "Duration", value: durationLabel && item.totalDays ? `${durationLabel} (${item.totalDays} Days Total)` : "—" },
                          { icon: "📍", label: "Location", value: [item.state, item.city].filter(Boolean).join(" / ") || "—" },
                          { icon: "🛣️", label: " Driving Route", value: item.fromLocation && item.toLocation ? `${item.fromLocation} → ${item.toLocation}` : "—" },
                          item.extraKm && item.extraKm > 0 ? { icon: "➕", label: "Extra KM", value: `${item.extraKm} km` } : null,
                          item.extraHours && item.extraHours > 0 ? { icon: "⏰", label: "Extra Hours", value: `${item.extraHours} hrs` } : null,
                          item.extraDays && item.extraDays > 0 ? { icon: "📆", label: "Extra Days", value: `${item.extraDays} days` } : null,
                        ].filter(Boolean).map((field: any, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="text-base">{field.icon}</span>
                            <div className="flex-1">
                              <span className="text-gray-500 block text-xs">{field.label}</span>
                              <span className="text-gray-800 dark:text-gray-200 font-medium text-sm">{field.value}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Promoter Details */}
                      {item.needPromoter && (
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                          <p className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-2">
                            <span>🎤</span> Promoter Details
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <span className="text-gray-500 block text-xs">Type</span>
                              <span className="text-gray-800 dark:text-gray-200 text-sm">
                                {item.promoterType === "Other" ? (item.otherPromoterType || "Other") : (item.promoterType || "—")}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 block text-xs">Gender</span>
                              <span className="text-gray-800 dark:text-gray-200 text-sm">{item.promoterGender || "—"}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 block text-xs">Language</span>
                              <span className="text-gray-800 dark:text-gray-200 text-sm">{item.promoterLanguage || "—"}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 block text-xs">Quantity</span>
                              <span className="text-gray-800 dark:text-gray-200 text-sm">{item.promoterQuantity || 0}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {item.gstNumber && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                          <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 mb-1">GST Information</p>
                          <p className="text-gray-800 dark:text-gray-200 text-sm">GST Number: {item.gstNumber}</p>
                        </div>
                      )}

                      {/* Pricing Breakdown */}
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                          <span>💰</span> Price Breakdown
                        </p>
                        <div className="space-y-2">
                          {(item.rentalCost || item.driverCost) ? (
                            <div className="flex justify-between items-center py-1">
                              <span className="text-gray-600 dark:text-gray-400 text-sm">
                                Rental & Driver Charges
                              </span>
                              <span className="text-gray-800 dark:text-gray-200 font-medium text-base">
                                ₹{((item.rentalCost || 0) + (item.driverCost || 0)).toLocaleString("en-IN")}
                              </span>
                            </div>
                          ) : null}

                          {item.promoterCost && item.promoterCost > 0 && (
                            <div className="flex justify-between items-center py-1">
                              <span className="text-gray-600 dark:text-gray-400 text-sm">
                                Promoter Charges ({item.totalDays}D × ₹{item.promoterChargePerDay?.toLocaleString("en-IN")} × {item.promoterQuantity})
                              </span>
                              <span className="text-gray-800 dark:text-gray-200 font-medium text-base">
                                ₹{item.promoterCost.toLocaleString("en-IN")}
                              </span>
                            </div>
                          )}

                          {item.rtoCost && (
                            <div className="flex justify-between items-center py-1">
                              <span className="text-gray-600 dark:text-gray-400 text-sm">RTO Charges</span>
                              <span className="text-gray-800 dark:text-gray-200 font-medium text-base">
                                ₹{item.rtoCost.toLocaleString("en-IN")}
                              </span>
                            </div>
                          )}

                          {item.extraKmCost && item.extraKmCost > 0 && (
                            <div className="flex justify-between items-center py-1">
                              <span className="text-gray-600 dark:text-gray-400 text-sm">
                                Extra KM Charges ({item.extraKm} km × ₹{item.dailyKmcharges?.toLocaleString("en-IN")})
                              </span>
                              <span className="text-gray-800 dark:text-gray-200 font-medium text-base">
                                ₹{item.extraKmCost.toLocaleString("en-IN")}
                              </span>
                            </div>
                          )}

                          {item.extraHourCost && item.extraHourCost > 0 && (
                            <div className="flex justify-between items-center py-1">
                              <span className="text-gray-600 dark:text-gray-400 text-sm">
                                Extra Hours Charges ({item.extraHours} hrs × ₹{item.additionalHourCharges?.toLocaleString("en-IN")})
                              </span>
                              <span className="text-gray-800 dark:text-gray-200 font-medium text-base">
                                ₹{item.extraHourCost.toLocaleString("en-IN")}
                              </span>
                            </div>
                          )}

                          {(item.additionalFields || []).filter((f: any) => f.label).map((f: any, fIdx: number) => (
                            <div key={fIdx} className="flex justify-between items-center py-1">
                              <span className={f.mode === "-" ? "text-red-500 text-sm" : "text-gray-600 dark:text-gray-400 text-sm"}>
                                {f.label}
                              </span>
                              <span className={f.mode === "-" ? "text-red-600 font-medium text-base" : "text-gray-800 dark:text-gray-200 font-medium text-base"}>
                                {f.mode === "-" ? "-" : "+"}₹{Number(f.amount).toLocaleString("en-IN")}
                              </span>
                            </div>
                          ))}

                          <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                            <div className="flex justify-between items-center py-1">
                              <span className="text-gray-700 dark:text-gray-300 font-semibold text-sm">Subtotal</span>
                              <span className="text-gray-900 dark:text-white font-bold text-lg">
                                ₹{formatINR(item.subtotal || 0)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                              <span className="text-gray-900 dark:text-white font-bold text-base">Total (excl. GST)</span>
                              <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">
                                ₹{formatINR(item.totalAmount || 0)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Campaign Media */}
                      {((item.campaignImages?.length ?? 0) > 0 || (item.campaignVideos?.length ?? 0) > 0) && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                            <span>📸</span> Campaign Media
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            {(item.campaignImages || []).map((img: string, imgIdx: number) => (
                              <div key={imgIdx} className="relative group">
                                <img
                                  src={getImageUrl(img)}
                                  alt={`Campaign ${imgIdx + 1}`}
                                  className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-90 transition"
                                  onClick={() => window.open(getImageUrl(img), '_blank')}
                                />
                                <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">Image {imgIdx + 1}</span>
                              </div>
                            ))}
                            {(item.campaignVideos || []).map((vid: string, vidIdx: number) => (
                              <div key={vidIdx} className="relative group">
                                <video
                                  src={getImageUrl(vid)}
                                  className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer"
                                  onClick={() => window.open(getImageUrl(vid), '_blank')}
                                />
                                <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">Video {vidIdx + 1}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Order Total Summary */}
          {(() => {
            const bookingItems = order.bookingItems || [];
            const totalDiscount = bookingItems.reduce((s, item) =>
              s + (item.additionalFields || [])
                .filter((c) => c.mode === "-")
                .reduce((a, c) => a + Number(c.amount), 0), 0
            );
            const subTotal = bookingItems.reduce((s, item) => s + (item.subtotal || 0), 0);
            const Taxableamount = bookingItems.reduce((s, item) => s + (item.subtotal || 0), 0) + totalDiscount;
            const totalGst = Math.floor(subTotal * 0.18);
            const grandTotal = subTotal + totalGst;
            const finalDisplayTotal = order.grandNegotiationTotal && order.grandNegotiationTotal > 0
              ? order.grandNegotiationTotal
              : order.grandTotal || grandTotal;

            return (
              <div className=" rounded-xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-5 shadow-lg">
                <p className="text-base font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300 mb-4 flex items-center gap-2">
                  <span>💰</span> Order Summary ({bookingItems.length} vehicle{bookingItems.length > 1 ? "s" : ""})
                </p>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-blue-200 dark:border-blue-800">
                    <span className="text-gray-700 dark:text-gray-300 text-base">Subtotal (excl. GST)</span>
                    <span className="text-gray-900 dark:text-white font-semibold text-lg">₹{formatINR(Taxableamount)}</span>
                  </div>

                  {totalDiscount > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-blue-200 dark:border-blue-800">
                      <span className="text-red-600 dark:text-red-400 text-base font-medium">Discount Applied</span>
                      <span className="text-red-600 dark:text-red-400 font-bold text-lg">-₹{formatINR(totalDiscount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-2 border-b border-blue-200 dark:border-blue-800">
                    <span className="text-gray-700 dark:text-gray-300 text-base">Taxable Amount</span>
                    <span className="text-gray-900 dark:text-white font-semibold text-lg">₹{formatINR(subTotal)}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-blue-200 dark:border-blue-800">
                    <span className="text-gray-700 dark:text-gray-300 text-base">GST (18%)</span>
                    <span className="text-gray-900 dark:text-white font-semibold text-lg">₹{formatINR(order.grandGst || totalGst)}</span>
                  </div>

                  {order.grandNegotiationTotal && order.grandNegotiationTotal > 0 && order.grandNegotiationTotal !== order.grandTotal && (
                    <div className="flex justify-between items-center py-2 border-b border-blue-200 dark:border-blue-800">
                      <span className="text-gray-500 text-base line-through">Original Total</span>
                      <span className="text-gray-500 text-base line-through">₹{formatINR(order.grandTotal)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-3 mt-2 border-t-2 border-blue-300 dark:border-blue-700">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">Grand Total</span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹{formatINR(finalDisplayTotal)}</span>
                  </div>
                </div>
              </div>
            );
          })()}

        </div>
      </div>
    </div>
  );
}

