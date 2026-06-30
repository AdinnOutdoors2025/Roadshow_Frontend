
/* eslint-disable */
// @ts-nocheck
"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import API_BASE from "../../../../baseurl";
import { getToken } from "../../utils/auth";
import { jwtDecode } from "jwt-decode";
import { toast, Toaster } from "react-hot-toast";
import { User, Clock, XCircle, CheckCircle2 } from "lucide-react";
import DetailDrawer from "./DetailsModel";
import OnRoadSubmitModal from "./DriverForm";
import ClosedLostModal from "./ClosedLostModal";
import ClosedWonModal from "./ClosedWonModal";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Order {
  _id: string;
  orderId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  customerType: number | null;
  pipelineStatus: string;
  orderStatus: string;
  grandTotal: number;
  grandNegotiationTotal?: number | null;
  grandGst: number;
  bookingItems: any[];
  handlerName?: string;
  isAdminCreated?: boolean;
  pipelineLogs: any[];
  negotiationLogs?: any[];
  projectCodeArray?: any[];
  projectExecutionArray?: any[];
  createdAt: string;
  updatedAt?: string;
  projectCodeArray?:any[];
}

// ─── Stage Config ─────────────────────────────────────────────────────────────
const STAGES = [
  { key: "todo", label: "To-Do", color: "text-slate-700", bg: "bg-slate-100", dot: "bg-slate-400", headerGrad: "from-slate-400 to-slate-500" },
  { key: "projectExecution", label: "Project Execution", color: "text-teal-700", bg: "bg-teal-50", dot: "bg-teal-500", headerGrad: "from-teal-400 to-teal-600" },
  { key: "onRoad", label: "On Road", color: "text-sky-700", bg: "bg-sky-50", dot: "bg-sky-500", headerGrad: "from-sky-400 to-sky-600" },
  { key: "vehicleUnavailable", label: "Vehicle Unavailable", color: "text-red-700", bg: "bg-red-50", dot: "bg-red-400", headerGrad: "from-red-400 to-red-500" },
  { key: "clientClosure", label: "Client Closure & Feedback", color: "text-pink-700", bg: "bg-pink-50", dot: "bg-pink-500", headerGrad: "from-pink-400 to-pink-600" },
  { key: "invoiceGeneration", label: "Invoice Generation", color: "text-fuchsia-700", bg: "bg-fuchsia-50", dot: "bg-fuchsia-500", headerGrad: "from-fuchsia-400 to-fuchsia-600" },
  { key: "paymentStage2", label: "Payment Processing Stage 2", color: "text-purple-700", bg: "bg-purple-50", dot: "bg-purple-500", headerGrad: "from-purple-400 to-purple-600" },
  { key: "closedWon", label: "Closed Won", color: "text-green-700", bg: "bg-green-50", dot: "bg-green-500", headerGrad: "from-green-400 to-green-600" },
  { key: "closedLost", label: "Closed Lost", color: "text-rose-700", bg: "bg-rose-50", dot: "bg-rose-400", headerGrad: "from-rose-400 to-rose-600" },
];

const STAGE_MAP = Object.fromEntries(STAGES.map((s) => [s.key, s]));

const fmt = (n?: number | null) =>
  n != null ? `₹ ${n.toLocaleString("en-IN")}` : "—";

const fmtDatetimenew = (s?: string) => {
  if (!s) return { date: "—", time: "" };
  const d = new Date(s);
  return {
    date: d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit" }),
  };
};

// ─── Order Card ───────────────────────────────────────────────────────────────
function OrderCard({ order, stageKey, onDragStart, onClick }: {
  order: Order;
  stageKey: string;
  onDragStart: () => void;
  onClick: () => void;
}) {

  const stage = STAGE_MAP[stageKey];
  const subtotal = order.bookingItems.reduce((s, i) => s + (i.totalAmount || 0), 0);
  const totalDiscount = (order.negotiationLogs || []).reduce((s, l) => s + (l.discountAmount || 0), 0);
  const taxable = subtotal - totalDiscount;
  const gstAmt = Math.floor(taxable * 0.18);
  const finalNet = taxable + gstAmt;
  const hasProjectCode = (order.projectCodeArray || []).length > 0;

  const hasPendingFoc = (order.campaignClosureArray || []).some(
    (c: any) => c.type === "foc" && (c.status === "pending" || !c.status)
  );

  const unavailableVehicles = (order.onRoadExecutionArray || []).filter(
    e => e.unavailableStatus === true
  );
  const totalVehicles = (order.onRoadExecutionArray || []).length;
  const unavailableCount = unavailableVehicles.length;
  const availableCount = totalVehicles - unavailableCount;

  const fmtDate = (s?: string) => {
    if (!s) return { date: "—", time: "" };
    const d = new Date(s);
    return {
      date: d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      time: d.toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const { date, time } = fmtDate(order.projectCodeArray[0].savedAt);
  const custBadge =
    order.customerType === 1
      ? { bg: "#E7F1FF", color: "#0A3F91", label: "organization" }
      : order.customerType === 0
        ? { bg: "#E6FBF4", color: "#046B4F", label: "Individual" }
        : { bg: "#F4F2EA", color: "#4A4A45", label: "—" };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3 cursor-grab active:cursor-grabbing hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-700 transition duration-150 ease-out select-none"
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-[13px] font-mono text-gray-400 dark:text-gray-500">{order.projectCodeArray![0].projectCode}</p>
        <span
          className="text-[11px] font-medium px-2 py-0.5 rounded-full"
          style={{ background: custBadge.bg, color: custBadge.color }}
        >
          {custBadge.label}
        </span>
      </div>

      <p className="text-md font-semibold text-gray-900 dark:text-gray-100 leading-tight mb-2">
        {order.name}
      </p>

      <p className={`text-lg font-bold mb-2 ${stage?.color}`}>
        {fmt(finalNet)}
      </p>

      <div className="flex items-center justify-between">
        {order.handlerName ? (
          <span className="text-[13px] font-medium text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-900/30 px-2 py-0.5 rounded-full flex items-center gap-1 max-w-[130px] truncate">
            <User size={12} className="flex-shrink-0" />
            {order.handlerName}
          </span>
        ) : (
          <span />
        )}
        <div className="flex flex-col items-end shrink-0 ml-2">
          <span className="text-[12px] text-gray-400 leading-none mb-0.5">
            Created At
          </span>
          <span className="text-[12px] text-gray-500 whitespace-nowrap">{date}</span>
          <span className="text-[12px] text-gray-500 flex items-center gap-1 whitespace-nowrap">
            <Clock size={10} />
            {time}
          </span>
        </div>
      </div>

      {stageKey === "vehicleUnavailable" && (
        <div className="flex items-center gap-2 mt-2">
          <span className="flex items-center gap-1 p-1 text-xs font-semibold rounded-full bg-red-50 text-red-600 border border-red-200">
            {unavailableCount} Unavailable
          </span>
          <span className="flex items-center gap-1 p-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
            {availableCount} Available
          </span>
        </div>
      )}

      {hasPendingFoc && (
        <div className="mt-2">
          <span className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-full bg-orange-50 text-orange-600 border border-orange-200 animate-pulse">
            ⏳ Waiting for FOC
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Stage Column ─────────────────────────────────────────────────────────────
function StageColumn({ stage, orders, onDrop, onDragStart, onCardClick }: {
  stage: typeof STAGES[0];
  orders: Order[];
  onDrop: (stageKey: string) => void;
  onDragStart: (order: Order, stageKey: string) => void;
  onCardClick: (order: Order) => void;
}) {
  const stageTotal = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  const fmtTotal = stageTotal > 0
    ? `₹${stageTotal.toLocaleString("en-IN")}`
    : null;

  return (
    <div
      className="flex flex-col w-56 flex-shrink-0"
      // style={{ height: "calc(88vh - 80px)" }}
      style={{ height: "calc(100vh - 130px)" }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => onDrop(stage.key)}
    >
      {/* Header */}
      <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl mb-2 flex-shrink-0 bg-gradient-to-r ${stage.headerGrad}`}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full flex-shrink-0 bg-white/60" />
          <span className="text-sm font-bold text-white truncate">{stage.label}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
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

      <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {orders.map((order) => (
          <OrderCard
            key={order._id}
            order={order}
            stageKey={stage.key}
            onDragStart={() => onDragStart(order, stage.key)}
            onClick={() => onCardClick(order)}
          />
        ))}
        {orders.length === 0 && (
          <div className="flex-1 min-h-[80px] rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center">
            <p className="text-xs text-gray-400 dark:text-gray-600">Drop here</p>
          </div>
        )}
      </div>
    </div>
  );
}


export default function PipelineBoard() {
  const [grouped, setGrouped] = useState<Record<string, Order[]>>({});
  const [loading, setLoading] = useState(true);
  const [drawerOrder, setDrawerOrder] = useState<Order | null>(null);
  const [currentUserIsAdmin, setCurrentUserIsAdmin] = useState<number>(1);
  const [staffAdmins, setStaffAdmins] = useState<{ username: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [defaultTab, setDefaultTab] = useState("overview");

  const dragOrder = useRef<Order | null>(null);
  const dragFrom = useRef<string>("");
const [closedWonModalOrder, setClosedWonModalOrder] = useState<Order | null>(null);
const [closedLostModalOrder, setClosedLostModalOrder] = useState<Order | null>(null);

  const [handlerModal, setHandlerModal] = useState<Order | null>(null);
  const [handlerName, setHandlerName] = useState("");
  const [handlerError, setHandlerError] = useState("");

  const [superAdminUsername, setSuperAdminUsername] = useState("Admin");

  const [pendingToStage, setPendingToStage] = useState<string>("projectExecution");

  const fetchPipeline = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const { data } = await axios.get(`${API_BASE}admin/pipeline`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // setGrouped(data.data.grouped);
      const rawGrouped = data.data.grouped;
      const onRoadOrders = rawGrouped["onRoad"] || [];
      const unavailableOrders = onRoadOrders.filter(order =>
        (order.onRoadExecutionArray || []).some(e => e.unavailableStatus === true)
      );
      setGrouped({
        ...rawGrouped,
        vehicleUnavailable: unavailableOrders,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load pipeline");
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
      setStaffAdmins(data.data.data || []);
    } catch { }
  };

  useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setCurrentUserIsAdmin(decoded.isAdmin ?? 1);
        setSuperAdminUsername(decoded.username || "Admin");
      } catch { }
    }
    fetchPipeline();
    fetchStaffList();
  }, []);

  // ── commitMove ─────────────────────────────────────────────────
  const commitMove = async (
    order: Order,
    toStage: string,
    extra?: Record<string, string>
  ) => {
    setSaving(true);
    try {
      const token = getToken();
      const fd = new FormData();
      fd.append("pipelineStatus", toStage);
      if (extra) {
        Object.entries(extra).forEach(([k, v]) => fd.append(k, v));
      }
      await axios.patch(`${API_BASE}admin/pipeline/${order._id}`, fd, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Order moved successfully!");


      if (drawerOrder?._id === order._id) {
        const { data } = await axios.get(`${API_BASE}admin/pipeline`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // setGrouped(data.data.grouped);
        const rawGrouped2 = data.data.grouped;
        const onRoadOrders2 = rawGrouped2["onRoad"] || [];
        const unavailableOrders2 = onRoadOrders2.filter(order =>
          (order.onRoadExecutionArray || []).some(e => e.unavailableStatus === true)
        );
        setGrouped({
          ...rawGrouped2,
          vehicleUnavailable: unavailableOrders2,
        });
        const updated = Object.values(data.data.grouped)
          .flat()
          .find((o: any) => o._id === order._id) as Order | undefined;
        if (updated) setDrawerOrder(updated);
      } else {
        await fetchPipeline();
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Something went wrong";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };



  const onDrop = (toStage: string) => {
    const order = dragOrder.current;
    if (!order || dragFrom.current === toStage) return;
    handleStageMove(order, toStage);
  };




const handleStageMove = (order: Order, toStage: string) => {
    const fromStage = order.pipelineStatus;

    if (fromStage === "closedLost") {
      toast.error("This order is closed lost and cannot be moved.");
      return;
    }

    const PIPELINE_STAGE_ORDER = [
      "todo",
      "projectExecution",
      "onRoad",
      "campaignRunning",
      "vehicleUnavailable",
      "clientClosure",
      "invoiceGeneration",
      "paymentStage2",
      "closedWon",
      "closedLost",
    ];
    const LOCKED_BACK_STAGES = ["todo", "projectExecution"];
    const fromIndex = PIPELINE_STAGE_ORDER.indexOf(fromStage);
    const toIndex = PIPELINE_STAGE_ORDER.indexOf(toStage);

    if (LOCKED_BACK_STAGES.includes(toStage) && toIndex < fromIndex) {
      const stageLabel = toStage === "todo" ? "To-Do" : "Project Execution";
      toast.error(`Cannot move back to the "${stageLabel}" stage!`);
      return;
    }


    if (toStage === "closedWon") {
      setClosedWonModalOrder(order);
      return;
    }

    
    if (toStage === "closedLost") {
      setClosedLostModalOrder(order);
      return;
    }

    if (fromStage === "projectExecution" && toStage === "onRoad") {
      commitMove(order, toStage);
      return;
    }

    if (fromStage === "todo" && toStage === "projectExecution") {
      if (currentUserIsAdmin === 0) {
        commitMove(order, toStage);
        return;
      }
      setHandlerName("");
      setHandlerError("");
      setPendingToStage(toStage);
      setHandlerModal(order);
      return;
    }

    if (fromStage === "todo") {
      toast.error("Please move to Project Execution first!");
      return;
    }

    commitMove(order, toStage);
};

  const submitHandlerModal = async () => {
    if (!handlerModal) return;
    setHandlerError("");

    if (!handlerName.trim()) {
      setHandlerError("Please select a handler");
      return;
    }

    await commitMove(handlerModal, pendingToStage, { handlerName: handlerName.trim() });
    setHandlerModal(null);
    setHandlerName("");
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    // <div className="flex flex-col h-full">
    <div className="flex flex-col h-full overflow-hidden w-full">
      <Toaster position="top-right" />


      <div className="flex-1 overflow-x-auto overflow-y-hidden px-4 pt-4 pb-2">
        <div className="flex gap-3" style={{ minWidth: "max-content" }}>
          {STAGES.map((stage) => (
            <StageColumn
              key={stage.key}
              stage={stage}
              orders={grouped[stage.key] || []}
              onDrop={onDrop}
              onDragStart={(order, key) => {
                dragOrder.current = order;
                dragFrom.current = key;
              }}
             

              onCardClick={(order) => {
                const hasPendingFoc = (order.campaignClosureArray || []).some(
                  (c: any) => c.type === "foc" && (c.status === "pending" || !c.status)
                );
                if (hasPendingFoc) {
                  setDefaultTab("clientClosure");
                } else if (stage.key === "vehicleUnavailable") {
                  setDefaultTab("VehicleUnavailable");
                } else if (stage.key === "onRoad") {
                  setDefaultTab("onRoad");
                } else if (stage.key === "clientClosure") {
                  setDefaultTab("clientClosure");
                } else {
                  setDefaultTab("overview");
                }
                setDrawerOrder(order);
              }}
            />
          ))}
        </div>
      </div>


      {drawerOrder && (
        <DetailDrawer
          order={drawerOrder}
          onClose={() => setDrawerOrder(null)}
          defaultTab={defaultTab}
          staffAdmins={staffAdmins}
          currentUserIsAdmin={currentUserIsAdmin}
          onStageMove={handleStageMove}
          saving={saving}
          onRefresh={async () => {
            const token = getToken();
            const { data } = await axios.get(`${API_BASE}admin/pipeline`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            // setGrouped(data.data.grouped);
            const rawGrouped3 = data.data.grouped;
            const onRoadOrders3 = rawGrouped3["onRoad"] || [];
            const unavailableOrders3 = onRoadOrders3.filter(order =>
              (order.onRoadExecutionArray || []).some(e => e.unavailableStatus === true)
            );
            setGrouped({
              ...rawGrouped3,
              vehicleUnavailable: unavailableOrders3,
            });
            const updatedOrder = Object.values(data.data.grouped)
              .flat()
              .find((o: any) => o._id === drawerOrder._id) as Order | undefined;
            if (updatedOrder) setDrawerOrder(updatedOrder);
          }}
        />
      )}

      {closedWonModalOrder && (
  <ClosedWonModal
    order={closedWonModalOrder}
    onClose={() => setClosedWonModalOrder(null)}
    onSuccess={async () => {
      if (drawerOrder?._id === closedWonModalOrder._id) {
        const token = getToken();
        const { data } = await axios.get(`${API_BASE}admin/pipeline`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const rawGrouped = data.data.grouped;
        const onRoadOrders = rawGrouped["onRoad"] || [];
        const unavailableOrders = onRoadOrders.filter((o: any) =>
          (o.onRoadExecutionArray || []).some((e: any) => e.unavailableStatus === true)
        );
        setGrouped({ ...rawGrouped, vehicleUnavailable: unavailableOrders });
        const updated = Object.values(data.data.grouped)
          .flat()
          .find((o: any) => o._id === closedWonModalOrder._id) as Order | undefined;
        if (updated) setDrawerOrder(updated);
      } else {
        await fetchPipeline();
      }
    }}
  />
)}

{closedLostModalOrder && (
  <ClosedLostModal
    order={closedLostModalOrder}
    onClose={() => setClosedLostModalOrder(null)}
    onSuccess={async () => {
      if (drawerOrder?._id === closedLostModalOrder._id) {
        const token = getToken();
        const { data } = await axios.get(`${API_BASE}admin/pipeline`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const rawGrouped = data.data.grouped;
        const onRoadOrders = rawGrouped["onRoad"] || [];
        const unavailableOrders = onRoadOrders.filter((o: any) =>
          (o.onRoadExecutionArray || []).some((e: any) => e.unavailableStatus === true)
        );
        setGrouped({ ...rawGrouped, vehicleUnavailable: unavailableOrders });
        const updated = Object.values(data.data.grouped)
          .flat()
          .find((o: any) => o._id === closedLostModalOrder._id) as Order | undefined;
        if (updated) setDrawerOrder(updated);
      } else {
        await fetchPipeline();
      }
    }}
  />
)}


      {handlerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6">

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-2xl">
                {pendingToStage === "projectCodeCreation" ? "🗂️" : "⚙️"}
              </div>
            </div>


            <h2 className="text-center text-base font-semibold text-gray-900 dark:text-white mb-1">
              Move to {pendingToStage === "projectCodeCreation" ? "Project Code Creation" : "Project Execution"}?
            </h2>
            <p className="text-center text-xs text-gray-400 font-mono mb-5">
              {handlerModal.orderId}
            </p>


            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assign Handler <span className="text-red-500">*</span>
              </label>


              <button
                type="button"
                onClick={() =>
                  setHandlerName(handlerName === superAdminUsername ? "" : superAdminUsername)
                }
                className={`w-full mb-3 flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${handlerName === superAdminUsername
                  ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300"
                  : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-teal-300 hover:bg-teal-50/40"
                  }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${handlerName === superAdminUsername
                    ? "bg-teal-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                    }`}
                >
                  {superAdminUsername.charAt(0).toUpperCase()}
                </div>
                <span className="flex-1 text-left">{superAdminUsername}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 font-semibold">
                  Super Admin (Me)
                </span>
                {handlerName === superAdminUsername && (
                  <svg className="w-4 h-4 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                <span className="text-[10px] text-gray-400 font-medium">OR SELECT STAFF</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>


              <select
                value={staffAdmins.some((s) => s.username === handlerName) ? handlerName : ""}
                onChange={(e) => setHandlerName(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option value="">-- Select staff admin --</option>
                {staffAdmins.map((s) => (
                  <option key={s.username} value={s.username}>
                    {s.username}
                  </option>
                ))}
              </select>
            </div>

            {handlerError && (
              <p className="mb-3 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                {handlerError}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setHandlerModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={submitHandlerModal}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-medium transition-all"
              >
                {saving ? "Moving..." : "Confirm Move"}
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
