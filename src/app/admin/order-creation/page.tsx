// /* eslint-disable */
// // @ts-nocheck

// "use client";

// import React, { useEffect, useState } from "react";
// import AdminOrderForm from "./AdminOrderForm";
// import { HiOutlineShoppingBag, HiOutlineEye, HiOutlineDocumentText, HiOutlineArrowRight } from "react-icons/hi";
// import { HiOutlinePlus, HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi2";
// import API_BASE from "../../../../baseurl";
// import { useAuthGuard } from "../../utils/useAuthGuard"; 
// import { getToken } from "../../utils/auth";
// import { useVehicle } from '../../../context/vehicletypecontext';
// import OrderPDFView from "./print";
// import OrderDetailDrawer from "./orderdetails";
// import { useRouter } from "next/navigation";

// interface BookingItem {
//   vehicleModel: string;
//   vehicleType: string;
//   campaignType: string;
//   otherCampaignType?: string;
//   fromDate: string;
//   toDate: string;
//   state: string;
//   city: string;
//   quantity: number;
//   totalDays: number;
//   extraDays?: number;
//   extraKm?: number;
//   extraHours?: number;
//   subtotal: number;
//   gstAmount: number;
//   totalAmount: number;
//   needPromoter: boolean;
//   fromLocation?: string;
//   toLocation?: string;
//   promoterType?: string;
//   otherPromoterType?: string;
//   promoterGender?: string;
//   promoterLanguage?: string;
//   promoterQuantity?: number;
//   bookingFor?: string;
//   gstNumber?: string;
//   perDayRentalCost?: number;
//   driverCharges?: number;
//   promoterChargePerDay?: number;
//   rtoCharges?: number;
//   additionalHourCharges?: number;
//   rentalCost?: number;
//   driverCost?: number;
//   promoterCost?: number;
//   rtoCost?: number;
//   extraKmCost?: number;
//   extraHourCost?: number;
//   campaignImages?: string[];
//   campaignVideos?: string[];
//   additionalCharges?: { id: string; label: string; amount: number; mode: "+" | "-" }[];
//   additionalFields?: { id: string; label: string; amount: number; mode: "+" | "-" }[];
//   dailyKmcharges?: number
// }


// interface VehicleType {
//   _id: string;
//   name: string;
// }

// interface Order {
//   _id: string;
//   orderId: string;
//   name: string;
//   phone: string;
//   address?: string;
//   email?: string;
//   grandTotal: number;
//   orderStatus: "Pending" | "Confirmed" | "Cancelled";
//   pipelineStatus: "newOrder" | "proposal" | "negotiation" | "closedWon" | "closedLoss";
//   isAdminCreated?: boolean;
//   bookingItems: BookingItem[];
//   createdAt: string;
//   handlername?: string;
//   campaignType?: number
//   grandGst?: number
//   dailyKmcharges?: number
//   customerType: number
//   handlerName?: string;
//   poDocumentLogs?: any[];
//   paymentStageFirst?: any[];
//   negotiationLogs?: any[];
//   grandNegotiationTotal?: number | null;
//   pipelineLogs?: any[];

// }



// const HEADERS = [
//   "S.No",
//   "Order ID",
//   "Customer",
//   "Vehicles",
//   "Duration",
//   "Location",
//   "Grand Total",
//   "Pipeline",
//   "Order Status",
//   "Created",
//   "Actions",
// ];

// const ITEMS_PER_PAGE = 10;

// const PIPELINE_CONFIG: Record<string, { label: string; color: string }> = {
//   newOrder: { label: "New Order", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
//   proposal: { label: "Proposal", color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" },
//   negotiation: { label: "Negotiation", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
//   closedWon: { label: "Closed Won", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
//   closedLoss: { label: "Closed Loss", color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
// };

// const STATUS_CONFIG: Record<string, { color: string; dot: string }> = {
//   Pending: { color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", dot: "bg-amber-400 animate-pulse" },
//   Confirmed: { color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", dot: "bg-green-500" },
//   Cancelled: { color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400", dot: "bg-red-400" },
// };




// function formatDate(d: string) {
//   if (!d) return "—";
//   return new Date(d).toLocaleString("en-IN", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//     second: "2-digit"
//   });
// }



// function getDateRange(items: BookingItem[]) {
//   if (!items || items.length === 0) return "—";
//   try {
//     const dates = items.flatMap((i) => [
//       new Date(i.fromDate),
//       new Date(i.toDate),
//     ]);
//     const min = new Date(Math.min(...dates.map((d) => d.getTime())));
//     const max = new Date(Math.max(...dates.map((d) => d.getTime())));
//     return `${formatDate(min.toISOString())} → ${formatDate(max.toISOString())}`;
//   } catch {
//     return "—";
//   }
// }

// function getLocations(items: BookingItem[]) {
//   if (!items || items.length === 0) return "—";
//   const cities = [...new Set(items.map((i) => i.city).filter(Boolean))];
//   return cities.length ? cities.join(", ") : "—";
// }

// function getTotalDays(items: BookingItem[]) {
//   return items.reduce((s, i) => s + (i.totalDays || 0), 0);
// }


// export default function OrdersPage() {

//   const [orders, setOrders] = useState<Order[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [showForm, setShowForm] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
//   const [selectedpdf, setSelectedpdf] = useState<Order | null>(null);
//   const [selectedpdfWithoutHistory, setSelectedpdfWithoutHistory] = useState<Order | null>(null);
//   const [successMsg, setSuccessMsg] = useState<string | null>(null);

//   const [filterFromDate, setFilterFromDate] = useState("");
//   const [filterToDate, setFilterToDate] = useState("");


//   const [filterPipeline, setFilterPipeline] = useState("all");
//   const [filterStatus, setFilterStatus] = useState("all");
//   const [searchQ, setSearchQ] = useState("");
//   useAuthGuard();


//   const router = useRouter();

//   const { vehicleTypes, fetchVehicleTypes } = useVehicle();



//   useEffect(() => {
//     fetchVehicleTypes()
//   }, [])

//   function formatINR(amount: number): string {
//     return new Intl.NumberFormat("en-IN", {
//       maximumFractionDigits: 0,
//     }).format(amount);
//   }

//   const fetchOrders = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const token = getToken();

//       const res = await fetch(`${API_BASE}admin/orders`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       if (!res.ok) {
//         const errData = await res.json().catch(() => ({}));
//         throw new Error(errData.message || `Server error: ${res.status}`);
//       }

//       const data = await res.json();
//       const list: Order[] = data.data?.orders || [];
//       setOrders(list);
//       setCurrentPage(1);
//     } catch (err: any) {
//       setError(err.message || "Failed to load orders");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchOrders();
//   }, []);


//   useEffect(() => {
//     if (!successMsg) return;
//     const t = setTimeout(() => setSuccessMsg(null), 4000);
//     return () => clearTimeout(t);
//   }, [successMsg]);





//   // const filtered = orders.filter((o) => {
//   //   const matchPipeline = filterPipeline === "all" || o.pipelineStatus === filterPipeline;
//   //   const matchStatus = filterStatus === "all" || o.orderStatus === filterStatus;
//   //   const q = searchQ.trim().toLowerCase();
//   //   const matchSearch = !q ||
//   //     (o.orderId || "").toLowerCase().includes(q) ||
//   //     (o.name || "").toLowerCase().includes(q) ||
//   //     (o.phone || "").includes(q);
//   //   return matchPipeline && matchStatus && matchSearch;
//   // });


// const filtered = orders.filter((o) => {
//   const matchPipeline = filterPipeline === "all" || o.pipelineStatus === filterPipeline;
//   const matchStatus = filterStatus === "all" || o.orderStatus === filterStatus;

//   // Enhanced search logic
//   const q = searchQ.trim().toLowerCase();
//   const matchSearch = !q || (() => {
//     // Search by Order ID
//     if ((o.orderId || "").toLowerCase().includes(q)) return true;

//     // Search by Customer Name
//     if ((o.name || "").toLowerCase().includes(q)) return true;

//     // Search by Phone
//     if ((o.phone || "").includes(q)) return true;

//     // Search by Vehicles (vehicle models and types)
//     if (o.bookingItems && o.bookingItems.length > 0) {
//       const vehicleSearchText = o.bookingItems.map(item => 
//         `${item.vehicleModel || ""} ${item.vehicleType || ""}`
//       ).join(" ").toLowerCase();
//       if (vehicleSearchText.includes(q)) return true;
//     }

//     // Search by Duration
//     if (o.bookingItems && o.bookingItems.length > 0) {
//       const durationText = getDateRange(o.bookingItems).toLowerCase();
//       if (durationText.includes(q)) return true;

//       // Also search by total days
//       const totalDays = getTotalDays(o.bookingItems);
//       if (totalDays.toString().includes(q)) return true;
//     }

//     // Search by Location (cities and states)
//     if (o.bookingItems && o.bookingItems.length > 0) {
//       const locationText = o.bookingItems.map(item => 
//         `${item.city || ""} ${item.state || ""}`
//       ).join(" ").toLowerCase();
//       if (locationText.includes(q)) return true;
//     }

//     // Search by Grand Total
//     const displayTotal = o.grandNegotiationTotal && o.grandNegotiationTotal > 0
//       ? o.grandNegotiationTotal
//       : o.grandTotal;

//     if (displayTotal) {
//       // Search in different formats
//       if (displayTotal.toString().includes(q)) return true;
//       if (formatINR(displayTotal).toLowerCase().includes(q)) return true;
//       if (displayTotal.toLocaleString("en-IN").includes(q)) return true;
//     }

//     // Search by Created date
//     if (o.createdAt) {
//       const createdDateText = formatDate(o.createdAt).toLowerCase();
//       if (createdDateText.includes(q)) return true;

//       // Also search by date parts
//       const date = new Date(o.createdAt);
//       const dateFormats = [
//         date.toLocaleDateString("en-IN"),
//         date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
//         date.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }),
//         date.toISOString().split('T')[0], // YYYY-MM-DD format
//       ];
//       if (dateFormats.some(format => format.toLowerCase().includes(q))) return true;
//     }

//     return false;
//   })();

//   return matchPipeline && matchStatus && matchSearch;
// });


//   // ── Pagination 
//   const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
//   const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
//   const currentItems = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

//   const goToPage = (page: number) => {
//     setCurrentPage(page);
//     document.getElementById("orders-table-top")?.scrollIntoView({ behavior: "smooth" });
//   };


//   const stats = {
//     total: orders.length,
//     pending: orders.filter((o) => o.orderStatus === "Pending").length,
//     confirmed: orders.filter((o) => o.orderStatus === "Confirmed").length,
//     closedWon: orders.filter((o) => o.pipelineStatus === "closedWon").length,
//     adminCreated: orders.filter((o) => o.isAdminCreated).length,
//   };

//     const getVehicleTypeName = (vehicleTypeId: string) => {
//         if (!vehicleTypeId || !vehicleTypes) return "";
//         const vehicle = vehicleTypes.find((vt: any) => vt._id === vehicleTypeId);
//         return vehicle?.typeName || vehicleTypeId;
//     };

//   return (
//     <div id="orders-table-top" className="w-full space-y-4">


//       {successMsg && (
//         <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-900/20">
//           <svg className="h-4 w-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//           </svg>
//           <p className="text-sm font-medium text-green-700 dark:text-green-400">{successMsg}</p>
//         </div>
//       )}


//       <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
//         {[
//           { label: "Total Orders", val: stats.total, color: "text-gray-800 dark:text-white", bg: "bg-gray-50 dark:bg-gray-800/60" },
//           { label: "Pending", val: stats.pending, color: "text-amber-700 dark:text-amber-300", bg: "bg-amber-50 dark:bg-amber-900/20" },
//           { label: "Confirmed", val: stats.confirmed, color: "text-green-700 dark:text-green-300", bg: "bg-green-50 dark:bg-green-900/20" },
//           { label: "Closed Won", val: stats.closedWon, color: "text-blue-700 dark:text-blue-300", bg: "bg-blue-50 dark:bg-blue-900/20" },
//           { label: "Admin Created", val: stats.adminCreated, color: "text-violet-700 dark:text-violet-300", bg: "bg-violet-50 dark:bg-violet-900/20" },
//         ].map(({ label, val, color, bg }) => (
//           <div key={label} className={`rounded-xl border border-gray-200 dark:border-gray-700 ${bg} px-4 py-3`}>
//             <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
//             <p className={`text-2xl font-bold mt-0.5 ${color}`}>{loading ? "—" : val}</p>
//           </div>
//         ))}
//       </div>


//       <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

//         <div className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 dark:border-gray-800">
//           <div className="flex items-center gap-3">
//             <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30">
//               <HiOutlineShoppingBag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
//             </span>
//             <div>
//               <h3 className="text-base font-semibold text-gray-900 dark:text-white">Order Management</h3>
//               {!loading && (
//                 <p className="text-xs text-gray-400 mt-0.5">
//                   {filtered.length} order{filtered.length !== 1 ? "s" : ""}
//                   {filtered.length !== orders.length && ` (filtered from ${orders.length})`}
//                 </p>
//               )}
//             </div>
//             <button
//               onClick={() => router.push("/admin/order-handling")}
//               className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all duration-150"
//             >

//               Order Handling
//               <HiOutlineArrowRight className="h-4 w-4 stroke-2" />
//             </button>

//           </div>
//           <button
//             onClick={() => setShowForm(true)}
//             className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all duration-150"
//           >
//             <HiOutlinePlus className="h-4 w-4 stroke-2" />
//             Create Order
//           </button>
//         </div>


//         <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-6 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">


//           <div className="relative w-full sm:max-w-xs">
//             <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//             </svg>
//             <input
//               type="text"
//               value={searchQ}
//               onChange={(e) => { setSearchQ(e.target.value); setCurrentPage(1); }}
//               placeholder="Search order ID, name, phone..."
//               className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500"
//             />
//           </div>


//           <select
//             value={filterPipeline}
//             onChange={(e) => { setFilterPipeline(e.target.value); setCurrentPage(1); }}
//             className="text-sm rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
//           >
//             <option value="all">All Pipeline</option>
//             {Object.entries(PIPELINE_CONFIG).map(([k, v]) => (
//               <option key={k} value={k}>{v.label}</option>
//             ))}
//           </select>


//           <select
//             value={filterStatus}
//             onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
//             className="text-sm rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
//           >
//             <option value="all">All Status</option>
//             <option value="Pending">Pending</option>
//             <option value="Confirmed">Confirmed</option>
//             <option value="Cancelled">Cancelled</option>
//           </select>


//           {(searchQ || filterPipeline !== "all" || filterStatus !== "all") && (
//             <button
//               onClick={() => { setSearchQ(""); setFilterPipeline("all"); setFilterStatus("all"); setCurrentPage(1); }}
//               className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100 transition-colors dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
//             >
//               Reset filters
//             </button>
//           )}


//           <button
//             onClick={fetchOrders}
//             disabled={loading}
//             className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
//           >
//             <svg className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//             </svg>
//             Refresh
//           </button>
//         </div>




//         <div className="p-4 sm:p-6">


//           {loading && (
//             <div className="flex flex-col items-center justify-center py-20 gap-3">
//               <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-blue-200 border-t-blue-600" />
//               <p className="text-sm text-gray-400 dark:text-gray-500">Loading orders…</p>
//             </div>
//           )}


//           {!loading && error && (
//             <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-900/20">
//               <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
//                 <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//               </svg>
//               <div className="flex-1 text-sm text-red-700 dark:text-red-400">
//                 {error}
//                 <button
//                   onClick={fetchOrders}
//                   className="ml-2 font-medium underline underline-offset-2 hover:no-underline"
//                 >
//                   Retry
//                 </button>
//               </div>
//             </div>
//           )}


//           {!loading && !error && (
//             <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
//               <div className="overflow-x-auto">
//                 <table className="w-full min-w-[1200px] border-collapse text-sm">


//                   <thead>
//                     <tr className="bg-gray-50 dark:bg-gray-800/60">
//                       {HEADERS.map((h) => (
//                         <th
//                           key={h}
//                           className="whitespace-nowrap px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
//                         >
//                           {h}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>


//                   <tbody className="divide-y divide-gray-100 dark:divide-gray-800">


//                     {currentItems.length === 0 && (
//                       <tr>
//                         <td colSpan={HEADERS.length} className="px-5 py-20 text-center">
//                           <div className="flex flex-col items-center gap-3">
//                             <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
//                               <HiOutlineShoppingBag className="h-7 w-7 text-gray-400" />
//                             </span>
//                             <div>
//                               <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
//                                 {searchQ || filterPipeline !== "all" || filterStatus !== "all"
//                                   ? "No orders match your filters"
//                                   : "No orders yet"}
//                               </p>
//                               <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
//                                 {searchQ || filterPipeline !== "all" || filterStatus !== "all"
//                                   ? "Try adjusting your search or filters"
//                                   : 'Click "Create Order" to create the first order'}
//                               </p>
//                             </div>
//                           </div>
//                         </td>
//                       </tr>
//                     )}


//                     {currentItems.map((order, idx) => {
//                       const pipeline = PIPELINE_CONFIG[order.pipelineStatus] || { label: order.pipelineStatus, color: "bg-gray-100 text-gray-500" };
//                       const statusCfg = STATUS_CONFIG[order.orderStatus] || { color: "bg-gray-100 text-gray-500", dot: "bg-gray-400" };
//                       const vehicleCount = order.bookingItems?.length || 0;
//                       const vehicleNames = [...new Set((order.bookingItems || []).map((b) => b.vehicleType).filter(Boolean))].join(", ");
//                       const displayTotal = order.grandNegotiationTotal && order.grandNegotiationTotal > 0
//                         ? order.grandNegotiationTotal
//                         : order.grandTotal;

//                       return (
//                         <tr
//                           key={order._id}
//                           className={`group transition-colors duration-100 hover:bg-blue-50/40 dark:hover:bg-blue-900/10
//                             ${idx % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50/50 dark:bg-gray-800/20"}`}
//                         >

//                           <td className="px-5 py-4 text-xs text-gray-400 dark:text-gray-500">
//                             {startIndex + idx + 1}
//                           </td>


//                           <td className="px-5 py-4">
//                             <div className="flex flex-col gap-1">
//                               <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
//                                 {order.orderId}
//                               </span>
//                               {order.isAdminCreated && (
//                                 <span className="inline-flex w-fit items-center rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-600 dark:bg-violet-900/30 dark:text-violet-300">
//                                   Admin
//                                 </span>
//                               )}
//                             </div>
//                           </td>


//                           <td className="px-5 py-4">
//                             <p className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[130px]">
//                               {order.name}
//                             </p>
//                             <p className="text-xs text-gray-400 mt-0.5">{order.phone}</p>
//                           </td>


//                           <td className="px-5 py-4">
//                             <div className="flex flex-col gap-1">
//                               <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 w-fit">
//                                 {vehicleCount} vehicle{vehicleCount !== 1 ? "s" : ""}
//                               </span>
//                               {vehicleNames && (
//                                 <span className="text-xs text-gray-400 truncate max-w-[150px]" title={vehicleNames}>
//                                 {getVehicleTypeName(vehicleNames)} 
//                                 </span>
//                               )}
//                             </div>
//                           </td>


//                           <td className="px-5 py-4 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
//                             {getDateRange(order.bookingItems || [])}
//                           </td>


//                           <td className="px-5 py-4">
//                             <p className="text-xs text-gray-600 dark:text-gray-300 max-w-[130px] truncate" title={getLocations(order.bookingItems || [])}>
//                               {getLocations(order.bookingItems || [])}
//                             </p>
//                           </td>


//                           <td className="px-5 py-4">
//                             {/* <p className="font-bold text-gray-900 dark:text-white">
//                               ₹{displayTotal ? displayTotal.toLocaleString("en-IN") : "—"}
//                             </p> */}

//                             {/* {order.grandNegotiationTotal &&
//                               order.grandNegotiationTotal > 0 &&
//                               order.grandNegotiationTotal !== order.grandTotal && ( */}
//                             <p className="text-[13px] text-gray-400">
//                               ₹{formatINR(order.grandTotal)}
//                             </p>
//                             {/* )
//                             } */}
//                           </td>


//                           <td className="px-5 py-4">
//                             <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${pipeline.color}`}>
//                               {pipeline.label}
//                             </span>
//                           </td>


//                           <td className="px-5 py-4">
//                             <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusCfg.color}`}>
//                               <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
//                               {order.orderStatus}
//                             </span>
//                           </td>


//                           <td className="px-5 py-4 text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
//                             {formatDate(order.createdAt)}
//                           </td>


//                           <td className="px-5 py-4">
//                             <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity duration-150">

//                               {/* View Button */}
//                               <div className="relative group/tooltip">
//                                 <button
//                                   onClick={() => setSelectedOrder(order)}
//                                   className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 active:scale-95 transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
//                                 >
//                                   <HiOutlineEye className="h-4 w-4" />
//                                 </button>
//                                 <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-md shadow-sm opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none dark:bg-gray-700">
//                                   View Details
//                                   <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></span>
//                                 </span>
//                               </div>

//                               {/* PDF With History */}
//                               <div className="relative group/tooltip">
//                                 <button
//                                   onClick={() => setSelectedpdf(order)}
//                                   className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-green-400 hover:bg-green-50 hover:text-green-600 active:scale-95 transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
//                                 >
//                                   <HiOutlineDocumentText className="h-4 w-4" />
//                                 </button>
//                                 <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-md shadow-sm opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none dark:bg-gray-700">
//                                   PDF With History
//                                   <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></span>
//                                 </span>
//                               </div>

//                               {/* PDF Without History */}
//                               <div className="relative group/tooltip">
//                                 <button
//                                   onClick={() => setSelectedpdfWithoutHistory(order)}
//                                   className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600 active:scale-95 transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
//                                 >
//                                   <HiOutlineDocumentText className="h-4 w-4" />
//                                 </button>
//                                 <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-md shadow-sm opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none dark:bg-gray-700">
//                                   PDF Without History
//                                   <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></span>
//                                 </span>
//                               </div>

//                             </div>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>


//               {filtered.length > 0 && (
//                 <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 bg-gray-50/70 px-5 py-4 dark:border-gray-800 dark:bg-gray-800/40">


//                   <div className="flex gap-1.5 flex-wrap">
//                     {Object.entries(STATUS_CONFIG).map(([s, cfg]) => {
//                       const count = orders.filter((o) => o.orderStatus === s).length;
//                       return count > 0 ? (
//                         <span key={s} className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}>
//                           {count} {s}
//                         </span>
//                       ) : null;
//                     })}
//                   </div>


//                   {totalPages > 1 && (
//                     <div className="flex items-center gap-1.5">
//                       <button
//                         onClick={() => goToPage(currentPage - 1)}
//                         disabled={currentPage === 1}
//                         className={`inline-flex items-center justify-center h-8 w-8 rounded-lg border transition-all duration-150
//                           ${currentPage === 1
//                             ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-600"
//                             : "border-gray-200 bg-white text-gray-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 active:scale-95 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-blue-500"
//                           }`}
//                       >
//                         <HiOutlineChevronLeft className="h-4 w-4" />
//                       </button>

//                       <p className="text-xs text-gray-400 dark:text-gray-500 px-1">
//                         Showing{" "}
//                         <span className="font-medium text-gray-600 dark:text-gray-300">{startIndex + 1}</span>
//                         {" "}–{" "}
//                         <span className="font-medium text-gray-600 dark:text-gray-300">
//                           {Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)}
//                         </span>
//                         {" "}of{" "}
//                         <span className="font-medium text-gray-600 dark:text-gray-300">{filtered.length}</span>
//                         {" "}orders
//                       </p>

//                       <button
//                         onClick={() => goToPage(currentPage + 1)}
//                         disabled={currentPage === totalPages}
//                         className={`inline-flex items-center justify-center h-8 w-8 rounded-lg border transition-all duration-150
//                           ${currentPage === totalPages
//                             ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-600"
//                             : "border-gray-200 bg-white text-gray-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 active:scale-95 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-blue-500"
//                           }`}
//                       >
//                         <HiOutlineChevronRight className="h-4 w-4" />
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>


//       {showForm && (
//         <AdminOrderForm
//           onClose={() => setShowForm(false)}
//           onSuccess={(orderId) => {
//             setShowForm(false);
//             setSuccessMsg(` Order ${orderId} created successfully!`);
//             fetchOrders();
//           }}
//         />
//       )}


//       {selectedOrder && (
//         <OrderDetailDrawer
//           order={selectedOrder}
//           onClose={() => setSelectedOrder(null)}
//           vehicleTypes={vehicleTypes}
//         />
//       )}

//       {/* {selectedpdf && (
//         <OrderPDFView
//           order={selectedpdf}
//           onClose={() => setSelectedpdf(null)}
//           vehicleTypes={vehicleTypes}

//         />
//       )} */}


//       {selectedpdf && (
//         <OrderPDFView
//           order={selectedpdf}
//           onClose={() => setSelectedpdf(null)}
//           vehicleTypes={vehicleTypes}
//           showHistory={true}
//         />
//       )}


//       {selectedpdfWithoutHistory && (
//         <OrderPDFView
//           order={selectedpdfWithoutHistory}
//           onClose={() => setSelectedpdfWithoutHistory(null)}
//           vehicleTypes={vehicleTypes}
//           showHistory={false}
//         />
//       )}

//     </div>
//   );
// }


/* eslint-disable */
// @ts-nocheck

"use client";

import React, { useEffect, useState, useCallback } from "react";
import AdminOrderForm from "./AdminOrderForm";
import {
  HiOutlineShoppingBag,
  HiOutlineEye,
  HiOutlineDocumentText,
  HiOutlineArrowRight,
} from "react-icons/hi";
import {
  HiOutlinePlus,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi2";
import API_BASE from "../../../../baseurl";
import { useAuthGuard } from "../../utils/useAuthGuard";
import { getToken } from "../../utils/auth";
import { useVehicle } from "../../../context/vehicletypecontext";
import OrderPDFView from "./print";
import OrderDetailDrawer from "./orderdetails";
import { useRouter } from "next/navigation";
import OrderDatePicker from "@/app/utils/OrderDatePicker";


// ─── Types ────────────────────────────────────────────────────────────────────
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
  campaignLocation?: string;
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
  dailyKmcharges?: number;
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
  pipelineStatus: string;
  salesPipelineStatus?: string;
  isAdminCreated?: boolean;
  bookingItems: BookingItem[];
  createdAt: string;
  handlername?: string;
  campaignType?: number;
  grandGst?: number;
  dailyKmcharges?: number;
  customerType: number;
  handlerName?: string;
  poDocumentLogs?: any[];
  paymentStageFirst?: any[];
  negotiationLogs?: any[];
  grandNegotiationTotal?: number | null;
  pipelineLogs?: any[];
}

// ─── Constants ────────────────────────────────────────────────────────────────
const HEADERS = [
  "S.No",
  "Order ID",
  "Customer",
  "Vehicles",
  "Duration",
  "Location",
  "Grand Total",
  "Order Status",
  "Created",
  "Actions",
];

const LIMIT_OPTIONS = [10, 20, 30, 50, 100];

const PIPELINE_CONFIG: Record<string, { label: string; color: string }> = {
  todo: { label: "To-Do", color: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300" },
  projectExecution: { label: "Project Execution", color: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300" },
  onRoad: { label: "On Road", color: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300" },
  campaignRunning: { label: "Campaign Running", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" },
  vehicleUnavailable: { label: "Vehicle Unavailable", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
  clientClosure: { label: "Client Closure", color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300" },
  invoiceGeneration: { label: "Invoice Generation", color: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300" },
  paymentStage2: { label: "Payment Stage 2", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
  closedWon: { label: "Closed Won", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
  closedLost: { label: "Closed Lost", color: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300" },
  newOrder: { label: "New Order", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  proposal: { label: "Proposal", color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" },
  negotiation: { label: "Negotiation", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
  closedWon2: { label: "Closed Won", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  closedLoss: { label: "Closed Loss", color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
};

const STATUS_CONFIG: Record<string, { color: string; dot: string }> = {
  Pending: {
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    dot: "bg-amber-400 animate-pulse",
  },
  Confirmed: {
    color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    dot: "bg-green-500",
  },
  Cancelled: {
    color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    dot: "bg-red-400",
  },
  Completed: {
    color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    dot: "bg-green-500",
  },
};

// Operation-handling's pipelineStatus is the source of truth for whether an
// order actually finished — order.orderStatus is a separate, rarely-updated
// field that stays "Pending" even after the order reaches Closed Won/Lost.
const displayOrderStatus = (order: Order): "Pending" | "Confirmed" | "Cancelled" | "Completed" => {
  if (order.pipelineStatus === "closedWon") return "Completed";
  if (
    order.salesPipelineStatus === "salesFinalClosedWon" ||
    order.salesPipelineStatus === "invoiceGeneration"
  )
    return "Completed";
  if (order.pipelineStatus === "closedLost" || order.salesPipelineStatus === "closedLost") return "Cancelled";
  return order.orderStatus;
};


function formatDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateShort(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount);
}


export default function OrdersPage() {

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(1);


  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedpdf, setSelectedpdf] = useState<Order | null>(null);
  const [selectedpdfWithoutHistory, setSelectedpdfWithoutHistory] = useState<Order | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [searchQ, setSearchQ] = useState("");
  const [filterPipeline, setFilterPipeline] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterVehicleType, setFilterVehicleType] = useState("all");
  const [filterDurationFrom, setFilterDurationFrom] = useState("");
  const [filterDurationTo, setFilterDurationTo] = useState("");
  const [filterCreatedFrom, setFilterCreatedFrom] = useState("");
  const [filterCreatedTo, setFilterCreatedTo] = useState("");


  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedPipeline, setAppliedPipeline] = useState("all");
  const [appliedStatus, setAppliedStatus] = useState("all");
  const [appliedVehicleType, setAppliedVehicleType] = useState("all");
  const [appliedDurationFrom, setAppliedDurationFrom] = useState("");
  const [appliedDurationTo, setAppliedDurationTo] = useState("");
  const [appliedCreatedFrom, setAppliedCreatedFrom] = useState("");
  const [appliedCreatedTo, setAppliedCreatedTo] = useState("");


  const [debouncedSearch, setDebouncedSearch] = useState("");

  useAuthGuard();
  const router = useRouter();
  const { vehicleTypes, fetchVehicleTypes } = useVehicle();

  useEffect(() => { fetchVehicleTypes(); }, []);



  const handleApplyFilters = () => {
    setAppliedSearch(searchQ);
    setAppliedPipeline(filterPipeline);
    setAppliedStatus(filterStatus);
    setAppliedVehicleType(filterVehicleType);
    setAppliedDurationFrom(filterDurationFrom);
    setAppliedDurationTo(filterDurationTo);
    setAppliedCreatedFrom(filterCreatedFrom);
    setAppliedCreatedTo(filterCreatedTo);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(null), 4000);
    return () => clearTimeout(t);
  }, [successMsg]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();

      // Build query params — ONLY applied states use pannuvaom
      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      params.set("limit", String(itemsPerPage));
      if (appliedSearch.trim()) params.set("search", appliedSearch.trim());
      if (appliedPipeline !== "all") params.set("pipelineStatus", appliedPipeline);
      if (appliedStatus !== "all") params.set("orderStatus", appliedStatus);
      if (appliedVehicleType !== "all") params.set("vehicleType", appliedVehicleType);
      if (appliedDurationFrom) params.set("durationFrom", appliedDurationFrom);
      if (appliedDurationTo) params.set("durationTo", appliedDurationTo);
      if (appliedCreatedFrom) params.set("createdFrom", appliedCreatedFrom);
      if (appliedCreatedTo) params.set("createdTo", appliedCreatedTo);

      const res = await fetch(`${API_BASE}admin/orders?${params.toString()}`, {
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
      setOrders(data.data?.orders || []);
      setTotalOrders(data.data?.total || 0);
      setTotalPages(data.data?.totalPages || 1);
    } catch (err: any) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    itemsPerPage,
    appliedSearch,
    appliedPipeline,
    appliedStatus,
    appliedVehicleType,
    appliedDurationFrom,
    appliedDurationTo,
    appliedCreatedFrom,
    appliedCreatedTo,
  ]);


  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);


  const resetPage = () => setCurrentPage(1);


  const hasActiveFilters =
    appliedSearch ||
    appliedPipeline !== "all" ||
    appliedStatus !== "all" ||
    appliedVehicleType !== "all" ||
    appliedDurationFrom ||
    appliedDurationTo ||
    appliedCreatedFrom ||
    appliedCreatedTo;


  const hasPendingChanges =
    searchQ !== appliedSearch ||
    filterPipeline !== appliedPipeline ||
    filterStatus !== appliedStatus ||
    filterVehicleType !== appliedVehicleType ||
    filterDurationFrom !== appliedDurationFrom ||
    filterDurationTo !== appliedDurationTo ||
    filterCreatedFrom !== appliedCreatedFrom ||
    filterCreatedTo !== appliedCreatedTo;

  const resetAllFilters = () => {

    setSearchQ("");
    setFilterPipeline("all");
    setFilterStatus("all");
    setFilterVehicleType("all");
    setFilterDurationFrom("");
    setFilterDurationTo("");
    setFilterCreatedFrom("");
    setFilterCreatedTo("");
    setAppliedSearch("");
    setAppliedPipeline("all");
    setAppliedStatus("all");
    setAppliedVehicleType("all");
    setAppliedDurationFrom("");
    setAppliedDurationTo("");
    setAppliedCreatedFrom("");
    setAppliedCreatedTo("");
    setCurrentPage(1);
  };

  const getVehicleTypeName = (vehicleTypeId: string) => {
    if (!vehicleTypeId || !vehicleTypes) return vehicleTypeId;
    const vehicle = vehicleTypes.find((vt: any) => vt._id === vehicleTypeId);
    return vehicle?.typeName || vehicleTypeId;
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    document.getElementById("orders-table-top")?.scrollIntoView({ behavior: "smooth" });
  };


  const startIndex = (currentPage - 1) * itemsPerPage;

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


      <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

        {/* Header */}
        <div className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30">
              <HiOutlineShoppingBag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Order Management</h3>
              {!loading && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {totalOrders} order{totalOrders !== 1 ? "s" : ""} total
                </p>
              )}
            </div>
            <button
              onClick={() => router.push("/admin/sales-handling")}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all duration-150"
            >
              Sales Handling
              <HiOutlineArrowRight className="h-4 w-4 stroke-2" />
            </button>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all duration-150"
          >
            <HiOutlinePlus className="h-4 w-4 stroke-2" />
            Create Order
          </button>
        </div>


        <div className="flex flex-wrap items-center gap-2 px-6 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQ}
              onChange={(e) => { setSearchQ(e.target.value); resetPage(); }}
              placeholder="Search ID, name, phone, city..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500"
            />
          </div>


          <select
            value={filterVehicleType}
            onChange={(e) => { setFilterVehicleType(e.target.value); resetPage(); }}
            className="text-sm rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            <option value="all">All Vehicles</option>
            {(vehicleTypes || []).map((vt: any) => (
              <option key={vt._id} value={vt._id}>{vt.typeName}</option>
            ))}
          </select>


          {/* <select
            value={itemsPerPage}
            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            className="text-sm rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            {LIMIT_OPTIONS.map((n) => (
              <option key={n} value={n}>Show {n}</option>
            ))}
          </select> */}

          <button
            onClick={handleApplyFilters}
            disabled={loading || !hasPendingChanges}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all
              ${hasPendingChanges
                ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-sm"
                : "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600"
              }`}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            Apply Filters
          </button>

          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className=" rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100 transition-colors dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
            >
              Reset filters
            </button>
          )}

          {/* Refresh */}
          <button
            onClick={() => fetchOrders()}
            disabled={loading}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
          >
            <svg className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>


        <div className="flex flex-wrap items-center gap-3 px-6 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20">


          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
              Duration:
            </span>
            <div className="w-36">
              <OrderDatePicker
                value={filterDurationFrom}
                onChange={(v) => { setFilterDurationFrom(v); resetPage(); }}
                placeholder="From date"
              />
            </div>
            <span className="text-xs text-gray-400">→</span>
            <div className="w-36">
              <OrderDatePicker
                value={filterDurationTo}
                onChange={(v) => { setFilterDurationTo(v); resetPage(); }}
                placeholder="To date"
                minDate={filterDurationFrom || undefined}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />


          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
              Created:
            </span>
            <div className="w-36">
              <OrderDatePicker
                value={filterCreatedFrom}
                onChange={(v) => { setFilterCreatedFrom(v); resetPage(); }}
                placeholder="From date"
              />
            </div>
            <span className="text-xs text-gray-400">→</span>
            <div className="w-36">
              <OrderDatePicker
                value={filterCreatedTo}
                onChange={(v) => { setFilterCreatedTo(v); resetPage(); }}
                placeholder="To date"
                minDate={filterCreatedFrom || undefined}
              />
            </div>
          </div>


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
                <button onClick={fetchOrders} className="ml-2 font-medium underline underline-offset-2 hover:no-underline">
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          {!loading && !error && (
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] border-collapse text-sm">

                  {/* Head */}
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/60">
                      {HEADERS.map((h) => (
                        <th
                          key={h}
                          className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  {/* Body */}
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">

                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={HEADERS.length} className="px-5 py-20 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                              <HiOutlineShoppingBag className="h-7 w-7 text-gray-400" />
                            </span>
                            <div>
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                {hasActiveFilters ? "No orders match your filters" : "No orders yet"}
                              </p>
                              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                {hasActiveFilters
                                  ? "Try adjusting your search or filters"
                                  : 'Click "Create Order" to create the first order'}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}

                    {orders.map((order, idx) => {
                      const pipeline =
                        PIPELINE_CONFIG[order.pipelineStatus] || {
                          label: order.pipelineStatus,
                          color: "bg-gray-100 text-gray-500",
                        };
                      const resolvedOrderStatus = displayOrderStatus(order);
                      const statusCfg = STATUS_CONFIG[resolvedOrderStatus] || {
                        color: "bg-gray-100 text-gray-500",
                        dot: "bg-gray-400",
                      };

                      const displayTotal =
                        order.grandNegotiationTotal && order.grandNegotiationTotal > 0
                          ? order.grandNegotiationTotal
                          : order.grandTotal;

                      const vehicleCount = order.bookingItems?.length || 0;

                      return (
                        <tr
                          key={order._id}
                          className={`group transition-colors duration-100 hover:bg-blue-50/40 dark:hover:bg-blue-900/10
                            ${idx % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50/50 dark:bg-gray-800/20"}`}
                        >
                          {/* S.No */}
                          <td className="px-4 py-4 text-xs text-gray-400 dark:text-gray-500">
                            {startIndex + idx + 1}
                          </td>

                          {/* Order ID */}
                          <td className="px-4 py-4">
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

                          {/* Customer */}
                          <td className="px-4 py-4">
                            <p className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[130px]">
                              {order.name}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">{order.phone}</p>
                          </td>

                          {/* Vehicles — stacked per bookingItem */}
                          {/* <td className="px-4 py-4">
                            <div className="flex flex-col gap-1">
                             
                              {(order.bookingItems || []).map((item, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-1.5"
                                >
                                  <span
                                    className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[130px]"
                                    title={getVehicleTypeName(item.vehicleType)}
                                  >
                                    {i + 1}. {getVehicleTypeName(item.vehicleType)}
                                  </span>
                                  <span className="inline-flex items-center rounded-full bg-blue-50 px-1.5 py-0.5 text-[11px] font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 shrink-0">
                                    ×{item.quantity}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td> */}

                          {/* Vehicles — stacked per bookingItem */}
                          <td className="px-4 py-4">
                            <div className="flex flex-col gap-1 max-h-[72px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                              {(order.bookingItems || []).map((item, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                  <span
                                    className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[130px]"
                                    title={getVehicleTypeName(item.vehicleType)}
                                  >
                                    {i + 1}. {getVehicleTypeName(item.vehicleType)}
                                  </span>
                                  <span className="inline-flex items-center rounded-full bg-blue-50 px-1.5 py-0.5 text-[11px] font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 shrink-0">
                                    ×{item.quantity}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>


                          {/* <td className="px-4 py-4">
                            <div className="flex flex-col gap-1.5">
                              {(order.bookingItems || []).map((item, i) => (
                                <div key={i} className="flex flex-col">
                                  <span className="text-[12px] text-gray-400 leading-none mb-0.5">
                                    Vehicle {i + 1}
                                  </span>
                                  <span className="text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                    {formatDateShort(item.fromDate)} → {formatDateShort(item.toDate)}
                                  </span>
                                  <span className="text-[12px] text-gray-400">
                                    {item.totalDays} day{item.totalDays !== 1 ? "s" : ""}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td> */}

                          <td className="px-4 py-4">
                            <div className="flex flex-col gap-1.5 max-h-[100px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                              {(order.bookingItems || []).map((item, i) => (
                                <div key={i} className="flex flex-col">
                                  <span className="text-[12px] text-gray-400 leading-none mb-0.5">
                                    Vehicle {i + 1}
                                  </span>
                                  <span className="text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                    {formatDateShort(item.fromDate)} → {formatDateShort(item.toDate)}
                                  </span>
                                  <span className="text-[12px] text-gray-400">
                                    {item.totalDays} day{item.totalDays !== 1 ? "s" : ""}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>


                          {/* <td className="px-4 py-4">
                            <div className="flex flex-col gap-1.5">
                              {(order.bookingItems || []).map((item, i) => (
                                <div key={i} className="flex flex-col">
                                  <span className="text-[12px] text-gray-400 leading-none mb-0.5">
                                    Vehicle {i + 1}
                                  </span>
                                  <span
                                    className="text-xs text-gray-600 dark:text-gray-300 truncate max-w-[120px]"
                                    title={`${item.city}${item.state ? ", " + item.state : ""}`}
                                  >
                                    {item.city || "—"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td> */}

                          {/* Location */}
                          <td className="px-4 py-4">
                            <div className="flex flex-col gap-1.5 max-h-[100px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                              {(order.bookingItems || []).map((item, i) => (
                                <div key={i} className="flex flex-col">
                                  {/* <span className="text-[12px] text-gray-400 leading-none mb-0.5">
                                    Vehicle {i + 1}
                                  </span> */}
                                  <span
                                    className="text-xs text-gray-600 dark:text-gray-300 truncate max-w-[120px]"
                                    title={`${item.city}${item.state ? ", " + item.state : ""}`}
                                  >
                                    {item.campaignLocation || "—"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>

                          {/* Grand Total */}
                          <td className="px-4 py-4">
                            <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-200">
                              ₹{formatINR(order.grandTotal)}
                            </p>

                          </td>

                          {/* Pipeline */}
                          {/* <td className="px-4 py-4">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${pipeline.color}`}>
                              {pipeline.label}
                            </span>
                          </td> */}

                          {/* Order Status */}
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusCfg.color}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                              {resolvedOrderStatus}
                            </span>
                          </td>

                          {/* Created */}
                          <td className="px-4 py-4 text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                            {formatDate(order.createdAt)}
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity duration-150">

                              {/* View */}
                              <div className="relative group/tooltip">
                                <button
                                  onClick={() => setSelectedOrder(order)}
                                  className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 active:scale-95 transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                >
                                  <HiOutlineEye className="h-4 w-4" />
                                </button>
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-md shadow-sm opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none dark:bg-gray-700">
                                  View Details
                                  <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
                                </span>
                              </div>

                              {/* PDF With History */}
                              <div className="relative group/tooltip">
                                <button
                                  onClick={() => setSelectedpdf(order)}
                                  className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-green-400 hover:bg-green-50 hover:text-green-600 active:scale-95 transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                >
                                  <HiOutlineDocumentText className="h-4 w-4" />
                                </button>
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-md shadow-sm opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none dark:bg-gray-700">
                                  PDF 
                                  <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
                                </span>
                              </div>

                              {/* PDF Without History */}
                              {/* <div className="relative group/tooltip">
                                <button
                                  onClick={() => setSelectedpdfWithoutHistory(order)}
                                  className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600 active:scale-95 transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                >
                                  <HiOutlineDocumentText className="h-4 w-4" />
                                </button>
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-md shadow-sm opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none dark:bg-gray-700">
                                  PDF Without History
                                  <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
                                </span>
                              </div> */}

                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ── Pagination ── */}
              {totalOrders > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 bg-gray-50/70 px-5 py-4 dark:border-gray-800 dark:bg-gray-800/40">

                  {/* Info */}
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Showing{" "}
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                      {startIndex + 1}
                    </span>
                    {" "}–{" "}
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                      {Math.min(startIndex + itemsPerPage, totalOrders)}
                    </span>
                    {" "}of{" "}
                    <span className="font-medium text-gray-600 dark:text-gray-300">{totalOrders}</span>
                    {" "}orders
                  </p>

                  {/* Page buttons */}
                  {totalPages > 1 && (
                    <div className="flex items-center gap-1">

                      {/* Prev */}
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`inline-flex items-center justify-center h-8 w-8 rounded-lg border transition-all
                          ${currentPage === 1
                            ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-600"
                            : "border-gray-200 bg-white text-gray-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 active:scale-95 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                      >
                        <HiOutlineChevronLeft className="h-4 w-4" />
                      </button>

                      {/* Page numbers */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((p) => {
                          if (totalPages <= 7) return true;
                          if (p === 1 || p === totalPages) return true;
                          if (Math.abs(p - currentPage) <= 2) return true;
                          return false;
                        })
                        .reduce((acc: (number | "...")[], p, i, arr) => {
                          if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("...");
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((p, i) =>
                          p === "..." ? (
                            <span key={`ellipsis-${i}`} className="px-1 text-xs text-gray-400">…</span>
                          ) : (
                            <button
                              key={p}
                              onClick={() => goToPage(p as number)}
                              className={`inline-flex items-center justify-center h-8 min-w-[32px] px-2 rounded-lg border text-xs font-medium transition-all
                                ${currentPage === p
                                  ? "border-blue-500 bg-blue-500 text-white"
                                  : "border-gray-200 bg-white text-gray-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                }`}
                            >
                              {p}
                            </button>
                          )
                        )}

                      {/* Next */}
                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`inline-flex items-center justify-center h-8 w-8 rounded-lg border transition-all
                          ${currentPage === totalPages
                            ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-600"
                            : "border-gray-200 bg-white text-gray-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 active:scale-95 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
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

      {/* Modals */}
      {showForm && (
        <AdminOrderForm
          onClose={() => setShowForm(false)}
          onSuccess={(orderId) => {
            setShowForm(false);
            setSuccessMsg(`Order ${orderId} created successfully!`);
            fetchOrders(); 
          }}
        />
      )}

      {selectedOrder && (
        <OrderDetailDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          vehicleTypes={vehicleTypes}
          resolvedOrderStatus={displayOrderStatus(selectedOrder)}
        />
      )}

      {selectedpdf && (
        <OrderPDFView
          order={selectedpdf}
          onClose={() => setSelectedpdf(null)}
          vehicleTypes={vehicleTypes}
          showHistory={true}
        />
      )}

      {selectedpdfWithoutHistory && (
        <OrderPDFView
          order={selectedpdfWithoutHistory}
          onClose={() => setSelectedpdfWithoutHistory(null)}
          vehicleTypes={vehicleTypes}
          showHistory={false}
        />
      )}
    </div>
  );
}
