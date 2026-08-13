/* eslint-disable */
// @ts-nocheck

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { getToken } from "../../utils/auth";
import { jwtDecode } from "jwt-decode";
import { toast, Toaster } from "react-hot-toast";
import { User, Clock, TrendingUp, AlertCircle, Search, X, SlidersHorizontal } from "lucide-react";
import SalesDetailDrawer from "./SalesDetailDrawer";
import API_BASE from "../../../../baseurl";
import OrderDatePicker from "@/app/utils/OrderDatePicker";
import "../admin_css/admin.css";
import {
  FiClipboard,
  FiSearch,
  FiFileText,
  FiRepeat,
  FiCheckCircle, FiCode,
  FiXCircle,
} from "react-icons/fi";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface SalesOrder {
  _id: string;
  orderId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  customerType: number | null;
  customerCategory?: string;
  companyName?: string;
  clientName?: string;
  designation?: string;
  gstNumber?: string;
  salesPipelineStatus: string;
  salesHandlerName?: string;
  grandTotal: number;
  grandGst?: number;
  salesNegotiationFinalAmount?: number | null;
  bookingItems: any[];
  needAnalysisArray: any[];
  proposalArray: any[];
  salesNegotiationArray: any[];
  closedWonArray: any[];
  closedLostArray: any[];
  salesPipelineLogs: any[];
  createdAt: string;
  updatedAt?: string;
  poCommentsArray: any[];
  hasDateConflict?: boolean;
  projectCodeCommentsArray: any[];
  closedLostCommentsArray: any[];
 orderEditHistory?: {
  _id: string;
  editedBy: string;
  editedAt: string;
  customerChanges: { field: string; oldValue: any; newValue: any }[];
  vehicleChanges: {
    vehicleIndex: number;
    action: "modified" | "added" | "removed";
    vehicleLabel?: string;
    changes: { field: string; oldValue: any; newValue: any }[];
  }[];
}[];
}

// ── Stage config ──────────────────────────────────────────────────────────────
export const SALES_STAGES = [
  {
    key: "enquiry",
    label: "Enquiry",
    color: "text-slate-700",
    bg: "bg-slate-100",
    dot: "bg-slate-500",
    headerGrad: "from-slate-400 to-slate-400",
    icon: FiClipboard,
    step: 1,
  },
  {
    key: "proposalPriceQuote",
    label: "Proposal & Price Quote",
    color: "text-violet-700",
    bg: "bg-violet-50",
    dot: "bg-violet-500",
    headerGrad: "from-violet-400 to-violet-400",
    icon: FiFileText,
    step: 2,
  },
  {
    // Key stays "closedWon" (unchanged internally/backend) — this stage's
    // actual purpose is PO document upload, so it's labeled "PO Document".
    key: "closedWon",
    label: "Order Confirmation ",
    color: "text-green-700",
    bg: "bg-green-50",
    dot: "bg-green-500",
    headerGrad: "from-green-400 to-green-400",
    icon: FiCheckCircle,
    step: 3,
  },
  {
    key: "projectCodeCreation",
    label: "Project Code Creation",
    color: "text-teal-700",
    bg: "bg-teal-50",
    dot: "bg-teal-500",
    headerGrad: "from-teal-400 to-teal-400",
    icon: FiCode,
    step: 4,
  },
  {
    // The real "Closed Won" (deal finalized), distinct from the PO Document
    // stage above — separate key/data (salesFinalClosedWonArray).
    key: "salesFinalClosedWon",
    label: "Closed Won",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    dot: "bg-emerald-500",
    headerGrad: "from-emerald-400 to-emerald-400",
    icon: FiCheckCircle,
    step: 5,
  },
  {
    key: "closedLost",
    label: "Closed Lost",
    color: "text-rose-700",
    bg: "bg-rose-50",
    dot: "bg-rose-500",
    headerGrad: "from-rose-400 to-rose-400",
    icon: FiXCircle,
    step: 6,
  },
];



export const SALES_STAGE_MAP = Object.fromEntries(
  SALES_STAGES.map((s) => [s.key, s])
);

// ── File size limits ──────────────────────────────────────────────────────────
const IMAGE_MIMES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const IMAGE_MAX_MB = 5;
const DOC_MAX_MB = 10;

const validateFileSize = (file: File): string | null => {
  const isImage = IMAGE_MIMES.includes(file.type);
  const maxMB = isImage ? IMAGE_MAX_MB : DOC_MAX_MB;
  const fileMB = file.size / (1024 * 1024);
  if (fileMB > maxMB) {
    return isImage
      ? `Image size ${fileMB.toFixed(2)} MB exceeds the ${IMAGE_MAX_MB} MB limit`
      : `Document size ${fileMB.toFixed(2)} MB exceeds the ${DOC_MAX_MB} MB limit`;
  }
  return null;
};



// ── Formatters ────────────────────────────────────────────────────────────────
const fmt = (n?: number | null) =>
  n != null ? `₹ ${n.toLocaleString("en-IN")}` : "—";

const fmtDate = (s?: string) => {
  if (!s) return { date: "—", time: "" };
  const d = new Date(s);
  return {
    date: d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit" }),
  };
};

// ── Order Card ────────────────────────────────────────────────────────────────
function SalesOrderCard({
  order,
  stageKey,
  onDragStart,
  onClick,
}: {
  order: SalesOrder;
  stageKey: string;
  onDragStart: () => void;
  onClick: () => void;
}) {
  const stage = SALES_STAGE_MAP[stageKey];
  const displayAmt = order.grandTotal;

  const { date, time } = fmtDate(order.createdAt);

  const custBadge =
    order.customerType === 1
      ? { bg: "#E7F1FF", color: "#0A3F91", label: "organization" }
      : order.customerType === 0
        ? { bg: "#E6FBF4", color: "#046B4F", label: "Individual" }
        : { bg: "#F4F2EA", color: "#4A4A45", label: "—" };

  const totalNegotiated = (order.salesNegotiationArray || []).reduce(
    (s, n) => s + (n.amount || 0),
    0
  );

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3 cursor-grab active:cursor-grabbing hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-700 transition duration-150 select-none"
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-[13px] font-mono text-gray-400">{order.orderId}</p>
        <span
          className="text-[13px] font-medium px-2 py-0.5 rounded-full"
          style={{ background: custBadge.bg, color: custBadge.color }}
        >
          {custBadge.label}
        </span>
      </div>

      {/* Name */}
      <p className="text-md font-semibold text-gray-900 dark:text-gray-100 leading-tight mb-1 truncate">
        {order.name}
      </p>

       {order.hasDateConflict && (
        <div className="flex items-center gap-1 mb-2 px-2 py-1 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 animate-pulse">
          <AlertCircle size={11} className="text-red-500 shrink-0" />
          <span className="text-[11px] font-semibold text-red-600 dark:text-red-400">Date Conflict</span>
        </div>
      )}

      {/* Amount */}
      <p className={`text-base font-bold mb-2 ${stage.color}`}>
        {fmt(displayAmt)}
      </p>



      {/* Footer */}
      <div className="flex items-center justify-between">
        {order.salesHandlerName ? (
          <span className="text-[13px] font-medium text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-900/30 px-2 py-0.5 rounded-full flex items-center gap-1 max-w-120px truncate">
            <User size={12} className="shrink-0" />
            {order.salesHandlerName}
          </span>
        ) : (
          <span />
        )}
        <div className="flex flex-col items-end shrink-0 ml-2">
          <span className="text-[13px] text-gray-400 leading-none mb-0.5">
            Created At
          </span>
          <span className="text-[13px] text-gray-500 whitespace-nowrap">{date}</span>
          <span className="text-[13px] text-gray-500 flex items-center gap-1 whitespace-nowrap">
            <Clock size={10} />
            {time}
          </span>
        </div>
      </div>
    </div>
  );
}


function SalesStageColumn({
  stage,
  orders,
  onDrop,
  onDragStart,
  onCardClick,
}: {
  stage: (typeof SALES_STAGES)[0];
  orders: SalesOrder[];
  onDrop: (key: string) => void;
  onDragStart: (order: SalesOrder, key: string) => void;
  onCardClick: (order: SalesOrder) => void;
}) {
  const StageIcon = stage.icon;

  const stageTotal = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  const fmtTotal = stageTotal > 0
    ? `₹${stageTotal.toLocaleString("en-IN")}`
    : null;
  return (
    <div
      className="flex flex-col w-56 shrink-0"
      style={{ height: "calc(88vh - 120px)" }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => onDrop(stage.key)}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-3 py-2.5 rounded-xl mb-2 shrink-0 bg-gradient-to-r ${stage.headerGrad}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <StageIcon size={16} className="text-white shrink-0" />
          <span className="text-sm font-bold text-white truncate">
            {stage.label}
          </span>
        </div>


        <div className="flex items-center gap-1.5 shrink-0 ml-1">
          {fmtTotal && (
            <span className="text-[13px] font-semibold px-1.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
              {fmtTotal}
            </span>
          )}
          <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
            {orders.length}
          </span>
        </div>

      </div>


      <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-0.5 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {orders.map((order) => (
          <SalesOrderCard
            key={order._id}
            order={order}
            stageKey={stage.key}
            onDragStart={() => onDragStart(order, stage.key)}
            onClick={() => onCardClick(order)}
          />
        ))}
        {orders.length === 0 && (
          <div className="flex-1 min-h-[80px] rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center">
            <p className="text-xs text-gray-400">
              {orders.length === 0 ? "No matching orders" : "Drop here"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Filter Bar ────────────────────────────────────────────────────────────────
function SalesFilterBar({
  search, setSearch,
  handlerFilter, setHandlerFilter,
  customerTypeFilter, setCustomerTypeFilter,
  dateFrom, setDateFrom,
  dateTo, setDateTo,
  minAmount, setMinAmount,
  maxAmount, setMaxAmount,
  staffAdmins,
  onClearAll,
  activeFilterCount,
}: any) {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="px-4 pt-3 pb-2 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px] max-w-[360px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order ID, client, company, handler..."
            className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Handler dropdown */}
        <select
          value={handlerFilter}
          onChange={(e) => setHandlerFilter(e.target.value)}
          className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">All Handlers</option>
          {staffAdmins.map((s: any) => (
            <option key={s.username} value={s.username}>{s.username}</option>
          ))}
        </select>

        {/* Customer type chips */}
        <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-lg p-0.5">
          {[
            { key: "", label: "All" },
            { key: "0", label: "Individual" },
            { key: "1", label: "Organization" },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setCustomerTypeFilter(opt.key)}
              className={`text-xs font-medium px-2.5 py-1.5 rounded-md transition-all ${customerTypeFilter === opt.key
                ? "bg-blue-500 text-white"
                : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* More filters toggle */}
        <button
          onClick={() => setShowMore((p) => !p)}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border transition-all ${showMore
            ? "bg-indigo-500 text-white border-indigo-500"
            : "bg-white dark:bg-gray-800 text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
        >
          <SlidersHorizontal size={13} />
          More Filters
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <X size={13} />
            Clear all ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Expandable: date range + amount range */}
      {showMore && (
        <div className="flex items-end gap-3 flex-wrap mt-3 pt-3 border-t border-dashed border-gray-200 dark:border-gray-700">
          <div className="w-40">
            <label className="block text-[11px] font-medium text-gray-500 mb-1">Created From</label>
            <OrderDatePicker
              value={dateFrom}
              onChange={setDateFrom}
              placeholder="From date"
              maxDate={dateTo || undefined}
            />
          </div>
          <div className="w-40">
            <label className="block text-[11px] font-medium text-gray-500 mb-1">Created To</label>
            <OrderDatePicker
              value={dateTo}
              onChange={setDateTo}
              placeholder="To date"
              minDate={dateFrom || undefined}
            />
          </div>

          <div className="w-36">
            <label className="block text-[11px] font-medium text-gray-500 mb-1">Min Amount (₹)</label>
            <input
              type="number"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              placeholder="0"
              className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="w-36">
            <label className="block text-[11px] font-medium text-gray-500 mb-1">Max Amount (₹)</label>
            <input
              type="number"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              placeholder="No limit"
              className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>
      )}
    </div>
  );
}


export default function SalesPipelineBoard() {
  const [grouped, setGrouped] = useState<Record<string, SalesOrder[]>>({});
  const [loading, setLoading] = useState(true);
  const [drawerOrder, setDrawerOrder] = useState<SalesOrder | null>(null);
  const [currentUserIsAdmin, setCurrentUserIsAdmin] = useState<number>(1);
  const [staffAdmins, setStaffAdmins] = useState<{ username: string }[]>([]);
 const [saving, setSaving] = useState(false);
  const [highlightOrderId, setHighlightOrderId] = useState<string | null>(null);



  const [closedWonWarningModal, setClosedWonWarningModal] = useState<SalesOrder | null>(null);
  const [pendingProjectCodeOrder, setPendingProjectCodeOrder] = useState<SalesOrder | null>(null);


  const dragOrder = useRef<SalesOrder | null>(null);
  const dragFrom = useRef<string>("");
  const suppressCardClick = useRef(false);

  // ── Modals state ─────────────────────────────────────────────────────────
  const [handlerModal, setHandlerModal] = useState<SalesOrder | null>(null);
  const [handlerName, setHandlerName] = useState("");
  const [handlerError, setHandlerError] = useState("");

  const [closedWonModal, setClosedWonModal] = useState<SalesOrder | null>(null);
  const [poFile, setPoFile] = useState<File | null>(null);
  const [poNotes, setPoNotes] = useState("");
  const [poError, setPoError] = useState("");

  const [closedLostModal, setClosedLostModal] = useState<SalesOrder | null>(null);
  const [lostReason, setLostReason] = useState("");
  const [lostFile, setLostFile] = useState<File | null>(null);
  const [lostError, setLostError] = useState("");

  // Date Conflict tab: "Edit" on a conflicting order switches the drawer to
  // that order and asks SalesDetailDrawer to auto-open its edit form.
  const [pendingEditOrderId, setPendingEditOrderId] = useState<string | null>(null);

  const [projectMailModal, setProjectMailModal] = useState<SalesOrder | null>(null);
  const [projectMailTo, setProjectMailTo] = useState("");
  const [projectMailCc, setProjectMailCc] = useState("");
  const [projectMailSubject, setProjectMailSubject] = useState("");
  const [projectMailNotes, setProjectMailNotes] = useState("");
  const [projectMailToError, setProjectMailToError] = useState("");
  const [projectMailCcError, setProjectMailCcError] = useState("");
  const [projectMailSending, setProjectMailSending] = useState(false);

  // ── Filter state ─────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [handlerFilter, setHandlerFilter] = useState("");
  const [customerTypeFilter, setCustomerTypeFilter] = useState(""); // "", "0", "1"
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");




  const boardScrollRef = useRef<HTMLDivElement>(null);
  const scrollAnimFrame = useRef<number | null>(null);


  const handleBoardDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const container = boardScrollRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const edgeSize = 80;
    const maxSpeed = 20;

    const distFromLeft = e.clientX - rect.left;
    const distFromRight = rect.right - e.clientX;

    if (scrollAnimFrame.current) {
      cancelAnimationFrame(scrollAnimFrame.current);
      scrollAnimFrame.current = null;
    }

    if (distFromLeft < edgeSize) {
      const speed = Math.ceil((1 - distFromLeft / edgeSize) * maxSpeed);
      const step = () => {
        container.scrollLeft -= speed;
        scrollAnimFrame.current = requestAnimationFrame(step);
      };
      scrollAnimFrame.current = requestAnimationFrame(step);
    } else if (distFromRight < edgeSize) {
      const speed = Math.ceil((1 - distFromRight / edgeSize) * maxSpeed);
      const step = () => {
        container.scrollLeft += speed;
        scrollAnimFrame.current = requestAnimationFrame(step);
      };
      scrollAnimFrame.current = requestAnimationFrame(step);
    }
  };

  const stopBoardAutoScroll = () => {
    if (scrollAnimFrame.current) {
      cancelAnimationFrame(scrollAnimFrame.current);
      scrollAnimFrame.current = null;
    }
  };

  const activeFilterCount = [
    search.trim() !== "",
    handlerFilter !== "",
    customerTypeFilter !== "",
    dateFrom !== "",
    dateTo !== "",
    minAmount !== "",
    maxAmount !== "",
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setSearch("");
    setHandlerFilter("");
    setCustomerTypeFilter("");
    setDateFrom("");
    setDateTo("");
    setMinAmount("");
    setMaxAmount("");
  };


  const fetchPipeline = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const { data } = await axios.get(`${API_BASE}sales/pipeline`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const validated = {};
      Object.entries(data.data.grouped).forEach(([stage, orders]) => {
        validated[stage] = (orders as SalesOrder[]).map((order: any) => ({
          ...order,
          salesPipelineStatus: order.salesPipelineStatus || "enquiry",
        }));
      });

      setGrouped(validated as Record<string, SalesOrder[]>);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load sales pipeline");
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffList = async () => {
    try {
      const token = getToken();
      const { data } = await axios.get(`${API_BASE}staff-admins`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaffAdmins((data.data.data || []).filter((s: any) => s.status === "active"));
    } catch { }
  };

  useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setCurrentUserIsAdmin(decoded.isAdmin ?? 1);
      } catch { }
    }
    fetchPipeline();
    fetchStaffList();
  }, []);

  // ── commitMove ────────────────────────────────────────────────────────────
  const commitMove = async (
    order: SalesOrder,
    toStage: string,
    extra?: Record<string, string | File>
  ) => {
    setSaving(true);
    try {
      const token = getToken();
      const fd = new FormData();
      fd.append("salesPipelineStatus", toStage);

      if (extra) {
        Object.entries(extra).forEach(([k, v]) => {
          if (v instanceof File) fd.append(k, v);
          else fd.append(k, v);
        });
      }
      await axios.patch(`${API_BASE}sales/pipeline/${order._id}`, fd, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Order moved successfully!");

      if (drawerOrder?._id === order._id) {
        const { data } = await axios.get(`${API_BASE}sales/pipeline`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGrouped(data.data.grouped);
        const updated = Object.values(data.data.grouped)
          .flat()
          .find((o: any) => o._id === order._id) as SalesOrder | undefined;
        if (updated) setDrawerOrder(updated);
      } else {
        await fetchPipeline();
      }
      return true;
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Something went wrong";
      toast.error(msg);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // ── onDrop ────────────────────────────────────────────────────────────────
  const onDrop = (toStage: string) => {
    const order = dragOrder.current;
    if (!order) {
      toast.error("No order selected");
      return;
    }
    if (!order.salesPipelineStatus) {
      toast.error("Order has no stage. Please refresh.");
      return;
    }
    if (dragFrom.current === toStage) return;
    handleStageMove(order, toStage);
  };


  const handleStageMove = (order: SalesOrder, toStage: string) => {
    const fromStage = order.salesPipelineStatus;

    if (!fromStage) {
      toast.error("Invalid order stage. Please refresh.");
      return;
    }


    if (fromStage === "closedLost") {
      toast.error("This order is closed lost and cannot be moved.");
      return;
    }

    if (
      toStage === "salesFinalClosedWon" &&
      ["proposalPriceQuote"].includes(fromStage)
    ) {
      toast.error("Cannot move directly to Closed Won stage — please move through Project Code Creation stage first!");
      return;
    }


    if (fromStage === "projectCodeCreation") {
      if (toStage === "closedLost") {
        setLostReason("");
        setLostFile(null);
        setLostError("");
        setClosedLostModal(order);
        return;
      }
      if (toStage === "salesFinalClosedWon") {
        const mailSent = ((order as any).projectMailLogs || []).length > 0;
        const codeCreated = ((order as any).projectCodeArray || []).length > 0;
        if (!mailSent || !codeCreated) {
          toast.error("Please complete the Project Code Creation stage");
          return;
        }
        commitMove(order, toStage);
        return;
      }

      toast.error("Cannot move back from Project Code Creation stage!");
      return;
    }

    if (fromStage === "salesFinalClosedWon") {
      toast.error("Closed Won is the final stage — this order cannot be moved further!");
      return;
    }

    const STAGE_ORDER_LIST = [
      "enquiry",
      "proposalPriceQuote",
      "closedWon",
      "projectCodeCreation",
      "salesFinalClosedWon",
      "closedLost",
    ];
    const LOCKED_BACK_STAGES = ["enquiry"];
    const fromIndex = STAGE_ORDER_LIST.indexOf(fromStage);
    const toIndex = STAGE_ORDER_LIST.indexOf(toStage);

    if (LOCKED_BACK_STAGES.includes(toStage) && toIndex < fromIndex) {
      const stageLabel = toStage === "enquiry" ? "Enquiry" : "Need Analysis";
      toast.error(`Cannot move back to the "${stageLabel}" stage!`);
      return;
    }

   

    if (
      fromStage === "closedWon" &&
      toStage !== "projectCodeCreation" &&
      toStage !== "closedLost"
    ) {
      toast.error("PO Document order can only move to Project Code Creation or Closed Lost.");
      return;
    }

    if (toStage === "closedLost") {
      setLostReason("");
      setLostFile(null);
      setLostError("");
      setClosedLostModal(order);
      return;
    }

    if (toStage === "proposalPriceQuote" && !order.salesHandlerName) {
      if (currentUserIsAdmin !== 1) {
        commitMove(order, "proposalPriceQuote");
        return;
      }
      setHandlerName("");
      setHandlerError("");
      setHandlerModal(order);
      return;
    }

    if (!order.salesHandlerName && fromStage === "enquiry") {
      toast.error("Please move to Proposal & Price Quote first before proceeding!");
      return;
    }

    if (toStage === "closedWon") {
      setPoFile(null);
      setPoNotes("");
      setPoError("");
      setClosedWonModal(order);
      return;
    }

    if (
      toStage === "projectCodeCreation" &&
      ["proposalPriceQuote"].includes(fromStage)
    ) {
      setPendingProjectCodeOrder(order);
      setClosedWonWarningModal(order);
      return;
    }

    if (fromStage === "closedWon" && toStage === "projectCodeCreation") {
      openProjectMailModal(order);
      return;
    }

    commitMove(order, toStage);
  };

  // ── Project Code Creation mail modal ────────────────────────────────────────
  const openProjectMailModal = async (order: SalesOrder) => {
    setProjectMailTo("");
    setProjectMailCc("");
    setProjectMailNotes("");
    setProjectMailToError("");
    setProjectMailCcError("");
    setProjectMailSubject(`Project Code Creation Request - ${order.orderId} - ${order.name}`);
    setProjectMailModal(order);

    try {
      const token = getToken();
      const { data } = await axios.get(`${API_BASE}project-settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjectMailTo(data.data?.data?.defaultTo || "");
      setProjectMailCc(data.data?.data?.defaultCc || "");
    } catch (e) {
      // Project setting fetch failed — leave To/CC empty, user can type manually.
    }
  };

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isValidEmailField = (value: string) => {
    const emails = value.split(",").map((e) => e.trim()).filter(Boolean);
    if (emails.length === 0) return false;
    return emails.every(isValidEmail);
  };

  const submitProjectMailModal = async () => {
    if (!projectMailModal) return;
    setProjectMailToError("");
    setProjectMailCcError("");

    if (!projectMailTo.trim()) {
      setProjectMailToError("To email is required");
      return;
    }
    if (!isValidEmailField(projectMailTo)) {
      setProjectMailToError("Enter a valid email address");
      return;
    }
    if (projectMailCc.trim() && !isValidEmailField(projectMailCc)) {
      setProjectMailCcError("Enter a valid email address");
      return;
    }

    setProjectMailSending(true);
    try {
      const success = await commitMove(projectMailModal, "projectCodeCreation", {
        to: projectMailTo,
        cc: projectMailCc,
        subject: projectMailSubject,
        additionalNotes: projectMailNotes,
      });
      if (success) setProjectMailModal(null);
    } finally {
      setProjectMailSending(false);
    }
  };


  const submitHandlerModal = async () => {
    if (!handlerModal) return;
    setHandlerError("");

    const isStaff = currentUserIsAdmin !== 1;

    if (!isStaff && !handlerName.trim()) {
      setHandlerError("Please select a handler");
      return;
    }

    const extra: Record<string, string> = {};
    if (!isStaff) {
      extra.handlerName = handlerName.trim();
    }

    await commitMove(handlerModal, "proposalPriceQuote", extra);
    setHandlerModal(null);
  };

  const submitClosedWon = async () => {
    if (!closedWonModal) return;
    setPoError("");
    const extra: Record<string, string | File> = { salesPoNotes: poNotes };
    if (poFile) extra.salesPoDocument = poFile;
    await commitMove(closedWonModal, "closedWon", extra);
    setClosedWonModal(null);
    setPoFile(null);
    setPoNotes("");
  };

  const submitClosedLost = async () => {
    if (!closedLostModal) return;
    setLostError("");
    if (!lostReason.trim()) {
      setLostError("Reason is required");
      return;
    }
    const extra: Record<string, string | File> = { reason: lostReason };
    if (lostFile) extra.closedLostDocument = lostFile;
    await commitMove(closedLostModal, "closedLost", extra);
    setClosedLostModal(null);
    setLostReason("");
    setLostFile(null);
  };

  const handleOpenConflictOrder = (orderObjectId: string) => {
    const target = Object.values(grouped).flat().find((o) => o._id === orderObjectId);
    if (target) {
      setDrawerOrder(target);
      setHighlightOrderId(orderObjectId);
      setTimeout(() => setHighlightOrderId(null), 3000);
    } else {
      toast.error("Order not found in current board view. Refresh to try.");
    }
  };

  // Date Conflict tab "Closed Lost" button — reuses the same stage-move
  // pipeline as the kanban board, targeting the conflicting order (not
  // necessarily the order whose drawer is currently open).
  const handleClosedLostConflictOrder = (orderObjectId: string) => {
    const target = Object.values(grouped).flat().find((o) => o._id === orderObjectId);
    if (target) {
      handleStageMove(target, "closedLost");
    } else {
      toast.error("Order not found in current board view. Refresh to try.");
    }
  };

  // Date Conflict tab "Edit" button — switches the drawer to the conflicting
  // order and asks SalesDetailDrawer to auto-open its edit form.
  const handleEditConflictOrder = (orderObjectId: string) => {
    const target = Object.values(grouped).flat().find((o) => o._id === orderObjectId);
    if (target) {
      setDrawerOrder(target);
      setPendingEditOrderId(orderObjectId);
    } else {
      toast.error("Order not found in current board view. Refresh to try.");
    }
  };

  const handleDrawerRefresh = async () => {
    const token = getToken();
    const { data } = await axios.get(`${API_BASE}sales/pipeline`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setGrouped(data.data.grouped);
    if (drawerOrder) {
      const updated = Object.values(data.data.grouped)
        .flat()
        .find((o: any) => o._id === drawerOrder._id) as SalesOrder | undefined;
      if (updated) setDrawerOrder(updated);
    }
  };

  // ── Apply filters to grouped data ──────────────────────────────────────────
  const filteredGrouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    const from = dateFrom ? new Date(dateFrom + "T00:00:00") : null;
    const to = dateTo ? new Date(dateTo + "T23:59:59") : null;
    const min = minAmount !== "" ? Number(minAmount) : null;
    const max = maxAmount !== "" ? Number(maxAmount) : null;

    const matches = (order: SalesOrder) => {
      // Search: orderId, client name, company name, handler name
      if (q) {
        const orderId = order.orderId?.toLowerCase() || "";
        const name = order.name?.toLowerCase() || "";
        const company = order.companyName?.toLowerCase() || "";
        const client = order.clientName?.toLowerCase() || "";
        const handler = order.salesHandlerName?.toLowerCase() || "";
        if (
          !orderId.includes(q) &&
          !name.includes(q) &&
          !company.includes(q) &&
          !client.includes(q) &&
          !handler.includes(q)
        ) {
          return false;
        }
      }

      // Handler dropdown
      if (handlerFilter && order.salesHandlerName !== handlerFilter) return false;

      // Customer type
      if (customerTypeFilter !== "" && String(order.customerType) !== customerTypeFilter) return false;

      // Date range (based on createdAt)
      if (from || to) {
        const created = order.createdAt ? new Date(order.createdAt) : null;
        if (!created) return false;
        if (from && created < from) return false;
        if (to && created > to) return false;
      }

      // Amount range (based on grandTotal)
      if (min !== null || max !== null) {
        const amt = order.grandTotal || 0;
        if (min !== null && amt < min) return false;
        if (max !== null && amt > max) return false;
      }

      return true;
    };

    const result: Record<string, SalesOrder[]> = {};
    Object.keys(grouped).forEach((key) => {
      result[key] = (grouped[key] || []).filter(matches);
    });
    return result;
  }, [grouped, search, handlerFilter, customerTypeFilter, dateFrom, dateTo, minAmount, maxAmount]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="flex flex-col h-full">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

      <SalesFilterBar
        search={search} setSearch={setSearch}
        handlerFilter={handlerFilter} setHandlerFilter={setHandlerFilter}
        customerTypeFilter={customerTypeFilter} setCustomerTypeFilter={setCustomerTypeFilter}
        dateFrom={dateFrom} setDateFrom={setDateFrom}
        dateTo={dateTo} setDateTo={setDateTo}
        minAmount={minAmount} setMinAmount={setMinAmount}
        maxAmount={maxAmount} setMaxAmount={setMaxAmount}
        staffAdmins={staffAdmins}
        onClearAll={clearAllFilters}
        activeFilterCount={activeFilterCount}
      />

      {/* ── Board ── */}
      {/* <div className="flex-1 overflow-x-auto overflow-y-hidden px-4 pt-4 pb-2">
        <div className="flex gap-3" style={{ minWidth: "max-content" }}>
          {SALES_STAGES.map((stage) => (
            <SalesStageColumn
              key={stage.key}
              stage={stage}
              orders={filteredGrouped[stage.key] || []}
              onDrop={onDrop}
              onDragStart={(order, key) => {
                dragOrder.current = order;
                dragFrom.current = key;
              }}
              onCardClick={setDrawerOrder}
            />
          ))}
        </div>
      </div> */}

      {/* ── Board ── */}
      <div
        ref={boardScrollRef}
        className="flex-1 overflow-x-auto overflow-y-hidden px-4 pt-4 pb-2"
        onDragOver={handleBoardDragOver}
        onDrop={stopBoardAutoScroll}
        onDragEnd={stopBoardAutoScroll}
      >
        <div className="flex gap-3" style={{ minWidth: "max-content" }}>
          {SALES_STAGES.map((stage) => (
            <SalesStageColumn
              key={stage.key}
              stage={stage}
              orders={filteredGrouped[stage.key] || []}
              onDrop={onDrop}
              onDragStart={(order, key) => {
                dragOrder.current = order;
                dragFrom.current = key;
                suppressCardClick.current = true;
                setTimeout(() => {
                  suppressCardClick.current = false;
                }, 300);
              }}
              onCardClick={(order) => {
                if (suppressCardClick.current) {
                  suppressCardClick.current = false;
                  return;
                }
                setDrawerOrder(order);
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Detail Drawer ── */}
     {drawerOrder && (
        <SalesDetailDrawer
          order={drawerOrder}
          onClose={() => setDrawerOrder(null)}
          onRefresh={handleDrawerRefresh}
          onStageMove={handleStageMove}
          staffAdmins={staffAdmins}
          currentUserIsAdmin={currentUserIsAdmin}
          saving={saving}
          onOpenConflictOrder={handleOpenConflictOrder}
          highlightOrderId={highlightOrderId}
          onClosedLostConflictOrder={handleClosedLostConflictOrder}
          onEditConflictOrder={handleEditConflictOrder}
          editOrderId={pendingEditOrderId}
          onEditOrderHandled={() => setPendingEditOrderId(null)}
        />
      )}

      {/* ── Handler Modal ── */}
      {handlerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <FiSearch size={28} className="text-blue-500" />
              </div>
            </div>
            <h2 className="text-center text-base font-semibold text-gray-900 dark:text-white mb-1">
              Move to Proposal & Price Quote?
            </h2>
            <p className="text-center text-xs text-gray-400 font-mono mb-5">
              {handlerModal.orderId}
            </p>

            {currentUserIsAdmin === 1 ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Assign Handler <span className="text-red-500">*</span>
                </label>

                {(() => {
                  const superAdminUsername =
                    (jwtDecode(getToken()!) as any).username || "Admin";
                  const isSuperSelected = handlerName === superAdminUsername;
                  return (
                    <button
                      type="button"
                      onClick={() =>
                        setHandlerName(isSuperSelected ? "" : superAdminUsername)
                      }
                      className={`w-full mb-2 flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${isSuperSelected
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                        : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-blue-300 hover:bg-blue-50/40"
                        }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isSuperSelected
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                          }`}
                      >
                        {superAdminUsername.charAt(0).toUpperCase()}
                      </div>
                      <span className="flex-1 text-left">{superAdminUsername}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-semibold">
                        Super Admin (Me)
                      </span>
                      {isSuperSelected && (
                        <svg
                          className="w-4 h-4 text-blue-500 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </button>
                  );
                })()}

                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                  <span className="text-[10px] text-gray-400 font-medium">
                    OR SELECT STAFF
                  </span>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                </div>

                <select
                  value={
                    staffAdmins.some((s) => s.username === handlerName)
                      ? handlerName
                      : ""
                  }
                  onChange={(e) => setHandlerName(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">-- Select Sales User --</option>
                  {staffAdmins.map((s) => (
                    <option key={s.username} value={s.username}>
                      {s.username}
                    </option>
                  ))}
                </select>


              </div>
            ) : (
              <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-3 py-2.5">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  You will be assigned as handler.
                </p>
              </div>
            )}

            {handlerError && (
              <p className="mb-3 text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">
                {handlerError}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setHandlerModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={submitHandlerModal}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium transition-all"
              >
                {saving ? "Moving..." : "Confirm Move"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Closed Won Modal ── */}
      {closedWonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                <FiCheckCircle size={28} className="text-green-500" />
              </div>
            </div>
            <h2 className="text-center text-base font-semibold text-gray-900 dark:text-white mb-1">
            Order Confirmation 
            </h2>
            <p className="text-center text-xs text-gray-400 font-mono mb-5">
              {closedWonModal.orderId}
            </p>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sales PO Document (optional)
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  if (f) {
                    const err = validateFileSize(f);
                    if (err) { toast.error(err); e.target.value = ""; return; }
                  }
                  setPoFile(f);
                }}
                className="w-full cursor-pointer text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-700 file:font-medium hover:file:bg-green-100 transition-all"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes (optional)
              </label>
              <textarea
                rows={2}
                value={poNotes}
                onChange={(e) => setPoNotes(e.target.value)}
                placeholder="PO notes..."
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
              />
            </div>

            {poError && (
              <p className="mb-3 text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">
                {poError}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setClosedWonModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={submitClosedWon}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
              >
                {saving ? (
                  "Closing..."
                ) : (
                  <>
                    <FiCheckCircle size={14} /> Close Won
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}



      {projectMailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center">
                <FiCode size={28} className="text-teal-500" />
              </div>
            </div>
            <h2 className="text-center text-base font-semibold text-gray-900 dark:text-white mb-1">
              Move to Project Code Creation
            </h2>
            <p className="text-center text-xs text-gray-400 font-mono mb-5">
              {projectMailModal.orderId}
            </p>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                To <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={projectMailTo}
                onChange={(e) => setProjectMailTo(e.target.value)}
                placeholder="adinn@gmail.com,adinn1@gmail.com"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
              {projectMailToError && (
                <p className="mt-1 text-xs text-red-500">{projectMailToError}</p>
              )}
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                CC
              </label>
              <input
                type="text"
                value={projectMailCc}
                onChange={(e) => setProjectMailCc(e.target.value)}
                placeholder="adinn1@gmail.com,adinn2@gmail.com"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
              {projectMailCcError && (
                <p className="mt-1 text-xs text-red-500">{projectMailCcError}</p>
              )}
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={projectMailSubject}
                onChange={(e) => setProjectMailSubject(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Additional Notes
              </label>
              <textarea
                rows={2}
                value={projectMailNotes}
                onChange={(e) => setProjectMailNotes(e.target.value)}
                placeholder="Add any additional notes for the project team..."
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setProjectMailModal(null)}
                disabled={projectMailSending}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={submitProjectMailModal}
                disabled={projectMailSending}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
              >
                {projectMailSending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}

      {closedWonWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center">
                <FiCheckCircle size={28} className="text-amber-500" />
              </div>
            </div>
            <h2 className="text-center text-base font-semibold text-gray-900 dark:text-white mb-2">
              You need to complete the Closed Won stage
            </h2>
            <p className="text-center text-sm text-gray-400 mb-5">
              Before moving to Project Code Creation, the Closed Won stage must be completed. Do you want to mark it as Closed Won now?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setClosedWonWarningModal(null);
                  setPendingProjectCodeOrder(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setClosedWonWarningModal(null);
                  setPoFile(null);
                  setPoNotes("");
                  setPoError("");
                  setClosedWonModal(pendingProjectCodeOrder);
                }}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-all"
              >
                Yes, Closed Won
              </button>
            </div>
          </div>
        </div>
      )}




      {/* ── Closed Lost Modal ── */}
      {closedLostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center">
                <FiXCircle size={28} className="text-rose-500" />
              </div>
            </div>
            <h2 className="text-center text-base font-semibold text-gray-900 dark:text-white mb-1">
              Mark as Closed Lost
            </h2>
            <p className="text-center text-xs text-gray-400 font-mono mb-5">
              {closedLostModal.orderId}
            </p>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
                placeholder="Why was this deal lost?"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Supporting Document{" "}
                <span className="text-gray-400 font-normal text-[10px]">
                  (optional)
                </span>
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  if (f) {
                    const err = validateFileSize(f);
                    if (err) { toast.error(err); e.target.value = ""; return; }
                  }
                  setLostFile(f);
                }}
                className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-rose-50 file:text-rose-700 file:font-medium hover:file:bg-rose-100 transition-all"
              />
            </div>

            {lostError && (
              <p className="mb-3 text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">
                {lostError}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setClosedLostModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={submitClosedLost}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
              >
                {saving ? (
                  "Closing..."
                ) : (
                  <>
                    <FiXCircle size={14} /> Confirm Lost
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
