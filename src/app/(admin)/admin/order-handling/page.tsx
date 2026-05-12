// components/PipelineBoard.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import API_BASE from "../../../../../baseurl";
import { MdOutlineAccessTime } from "react-icons/md";
import { getToken } from "@/utils/auth";

// ─── Types ────────────────────────────────────────────────────────────────────
interface BookingItem {
    vehicleModel: string;
    city: string;
    quantity: number;
    fromDate: string;
    toDate: string;
    totalDays: number;
    perDayRentalCost: number;
    totalAmount: number;
    campaignType: string;
    state: string;
    fromLocation: string;
    toLocation: string;
    needPromoter: boolean;
    promoterType: string;
    promoterGender: string;
    promoterLanguage: string;
    promoterQuantity: number;
    extraKm: number;
    extraHours: number;
    rentalCost: number;
    driverCost: number;
    promoterCost: number;
    rtoCost: number;
    extraKmCost: number;
    extraHourCost: number;
    additionalNet: number;
    subtotal: number;
}

interface PipelineLog {
    fromStage: string | null;
    toStage: string;
    movedBy: string;
    movedAt: string;
    handlerName?: string;
    paymentAmount?: number;
    advancePayment?: number;
    totalPayment?: number;
}

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
    bookingItems: BookingItem[];
    handlerName?: string;
    poDocument?: string;
    paymentAmount?: number;
    advancePayment?: number;
    totalPayment?: number;
    isAdminCreated?: boolean;
    pipelineLogs: PipelineLog[];
    negotiationLogs?: any[];
    createdAt: string;
}

// ─── Stage config ─────────────────────────────────────────────────────────────
const STAGES: { key: string; label: string; color: string; bg: string; dot: string }[] = [
    { key: "todo", label: "To-Do", color: "text-slate-700", bg: "bg-slate-100", dot: "bg-slate-400" },
    { key: "inProgress", label: "In Progress", color: "text-blue-700", bg: "bg-blue-50", dot: "bg-blue-500" },
    { key: "customerConfirmation", label: "Customer Confirmation & Negotiation", color: "text-violet-700", bg: "bg-violet-50", dot: "bg-violet-500" },
    { key: "waitingForPO", label: "Waiting for PO", color: "text-amber-700", bg: "bg-amber-50", dot: "bg-amber-500" },
    { key: "paymentStage1", label: "Payment Processing Stage 1", color: "text-orange-700", bg: "bg-orange-50", dot: "bg-orange-500" },
    { key: "projectCodeCreation", label: "Project Code Creation", color: "text-cyan-700", bg: "bg-cyan-50", dot: "bg-cyan-500" },
    { key: "projectExecution", label: "Project Execution", color: "text-teal-700", bg: "bg-teal-50", dot: "bg-teal-500" },
    { key: "onRoad", label: "On Road", color: "text-sky-700", bg: "bg-sky-50", dot: "bg-sky-500" },
    { key: "campaignRunning", label: "Campaign Running", color: "text-indigo-700", bg: "bg-indigo-50", dot: "bg-indigo-500" },
    { key: "vehicleUnavailable", label: "Vehicle Unavailable", color: "text-red-700", bg: "bg-red-50", dot: "bg-red-400" },
    { key: "clientClosure", label: "Client Closure & Feedback", color: "text-pink-700", bg: "bg-pink-50", dot: "bg-pink-500" },
    { key: "invoiceGeneration", label: "Invoice Generation", color: "text-fuchsia-700", bg: "bg-fuchsia-50", dot: "bg-fuchsia-500" },
    { key: "paymentStage2", label: "Payment Processing Stage 2", color: "text-purple-700", bg: "bg-purple-50", dot: "bg-purple-500" },
    { key: "closedWon", label: "Closed Won", color: "text-green-700", bg: "bg-green-50", dot: "bg-green-500" },
    { key: "closedLost", label: "Closed Lost", color: "text-rose-700", bg: "bg-rose-50", dot: "bg-rose-500" },
];

const STAGE_MAP = Object.fromEntries(STAGES.map((s) => [s.key, s]));

const ROW1 = STAGES.slice(0, 8);
const ROW2 = STAGES.slice(8, 15);

const fmt = (n?: number | null) =>
    n != null ? `₹ ${n.toLocaleString("en-IN")}` : "—";

// const fmtDate = (d?: string) =>
//   d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";


const fmtDate = (d?: string) =>
    d
        ? new Date(d)
            .toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
            .replace(/ /g, "-")
        : "—";


const fmtDateTime = (d?: string) => {
    if (!d) return "—";
    const date = new Date(d);
    const datePart = date
        .toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
        .replace(/ /g, "-");
    const timePart = date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
    return `${datePart} · ${timePart}`;
};


const customerLabel = (type: number | null) =>
    type === 1 ? "New Customer" : type === 0 ? "Exist Customer" : "Not Set";



// ─── Main component ───────────────────────────────────────────────────────────
export default function PipelineBoard() {
    const [grouped, setGrouped] = useState<Record<string, Order[]>>({});
    const [loading, setLoading] = useState(true);

    // drag state
    const dragOrder = useRef<Order | null>(null);
    const dragFrom = useRef<string>("");

    // modals
    const [drawerOrder, setDrawerOrder] = useState<Order | null>(null);
    const [dropTarget, setDropTarget] = useState<{ order: Order; toStage: string } | null>(null);

    // modal form states
    const [handlerName, setHandlerName] = useState("");
    const [custType, setCustType] = useState<0 | 1 | null>(null);
    const [poFile, setPoFile] = useState<File | null>(null);
    const [payAmt, setPayAmt] = useState("");
    const [advAmt, setAdvAmt] = useState("");
    const [totAmt, setTotAmt] = useState("");
    const [saving, setSaving] = useState(false);
    const [modalError, setModalError] = useState("");
    const [confirmMove, setConfirmMove] = useState<{ order: Order; toStage: string } | null>(null);

    // ── Fetch ──────────────────────────────────────────────────────────
  const fetchPipeline = async () => {
  setLoading(true);

  try {
    const token = getToken(); 

    const { data } = await axios.get(`${API_BASE}admin/pipeline`, {
      headers: {
        Authorization: `Bearer ${token}`, 
      },
    });

    setGrouped(data.data.grouped);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};


    useEffect(() => { fetchPipeline(); }, []);

    // ── Drag handlers ──────────────────────────────────────────────────
    const onDragStart = (order: Order, fromStage: string) => {
        dragOrder.current = order;
        dragFrom.current = fromStage;
    };

    const onDrop = (toStage: string) => {
        const order = dragOrder.current;
        if (!order || dragFrom.current === toStage) return;

        // Stages that need modal
        const needsModal =
            toStage === "inProgress" ||
            toStage === "waitingForPO" ||
            toStage === "paymentStage1" ||
            toStage === "projectCodeCreation";

        if (dragFrom.current === "todo" && toStage === "inProgress") {
            setConfirmMove({ order, toStage });
            return;
        }

        if (needsModal) {
            setHandlerName(""); setCustType(null);
            setPoFile(null); setPayAmt(""); setAdvAmt(""); setTotAmt("");
            setModalError("");
            setDropTarget({ order, toStage });
        } else {
            commitMove(order, toStage, {});
        }
    };

    // ── Commit move ────────────────────────────────────────────────────
    // const commitMove = async (
    //     order: Order,
    //     toStage: string,
    //     extra: {
    //         handlerName?: string;
    //         customerType?: number;
    //         poFile?: File | null;
    //         paymentAmount?: number;
    //         advancePayment?: number;
    //         totalPayment?: number;
    //     }
    // ) => {
    //     try {
    //         setSaving(true);
    //         const fd = new FormData();
    //         fd.append("pipelineStatus", toStage);
    //         fd.append("movedBy", "Admin");
    //         if (extra.handlerName) fd.append("handlerName", extra.handlerName);
    //         if (extra.customerType != null) fd.append("customerType", String(extra.customerType));
    //         if (extra.poFile) fd.append("poDocument", extra.poFile);
    //         if (extra.paymentAmount) fd.append("paymentAmount", String(extra.paymentAmount));
    //         if (extra.advancePayment) fd.append("advancePayment", String(extra.advancePayment));
    //         if (extra.totalPayment) fd.append("totalPayment", String(extra.totalPayment));

    //         await axios.patch(`${API_BASE}admin/pipeline/${order._id}`, fd, {
    //             headers: { "Content-Type": "multipart/form-data" },
    //         });

    //         setDropTarget(null);
    //         await fetchPipeline();
    //     } catch (e: any) {
    //         setModalError(e?.response?.data?.message || "Something went wrong");
    //     } finally {
    //         setSaving(false);
    //     }
    // };


    const commitMove = async (
  order: Order,
  toStage: string,
  extra: {
    handlerName?: string;
    customerType?: number;
    poFile?: File | null;
    paymentAmount?: number;
    advancePayment?: number;
    totalPayment?: number;
  }
) => {
  try {
    setSaving(true);

    const token = getToken(); 

    const fd = new FormData();
    fd.append("pipelineStatus", toStage);
    fd.append("movedBy", "Admin");

    if (extra.handlerName) fd.append("handlerName", extra.handlerName);
    if (extra.customerType != null) fd.append("customerType", String(extra.customerType));
    if (extra.poFile) fd.append("poDocument", extra.poFile);
    if (extra.paymentAmount) fd.append("paymentAmount", String(extra.paymentAmount));
    if (extra.advancePayment) fd.append("advancePayment", String(extra.advancePayment));
    if (extra.totalPayment) fd.append("totalPayment", String(extra.totalPayment));

    await axios.patch(`${API_BASE}admin/pipeline/${order._id}`, fd, {
      headers: {
        Authorization: `Bearer ${token}`,  
      },
    });

    setDropTarget(null);
    await fetchPipeline();
  } catch (e: any) {
    setModalError(e?.response?.data?.message || "Something went wrong");
  } finally {
    setSaving(false);
  }
};

    // ── Modal submit ───────────────────────────────────────────────────
    const handleModalSubmit = () => {
        if (!dropTarget) return;
        const { order, toStage } = dropTarget;
        setModalError("");

        if (toStage === "inProgress") {
            if (!handlerName.trim()) return setModalError("Handler name is required");
            if ((order.customerType === null || order.customerType === undefined) && custType === null)
                return setModalError("Please select customer type");
            commitMove(order, toStage, {
                handlerName,
                customerType: order.customerType ?? custType ?? undefined,
            });
        }

        if (toStage === "waitingForPO") {
            if (!poFile) return setModalError("Please upload the PO document");
            commitMove(order, toStage, { poFile });
        }

        if (toStage === "paymentStage1" || toStage === "projectCodeCreation") {
            if (toStage === "paymentStage1") {
                if (!payAmt || !advAmt || !totAmt) return setModalError("All payment fields are required");
                commitMove(order, toStage, {
                    paymentAmount: Number(payAmt),
                    advancePayment: Number(advAmt),
                    totalPayment: Number(totAmt),
                });
            } else {
                commitMove(order, toStage, {});
            }
        }
    };

    // ── Render ─────────────────────────────────────────────────────────
    if (loading)
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );

    return (
        <div className="flex flex-col h-full">
            {/* Board */}
            {/* <div className="overflow-x-auto pb-4">
        <div className="flex gap-3 px-4 pt-4" style={{ minWidth: "max-content" }}>
          {STAGES.map((stage) => {
            const orders = grouped[stage.key] || [];
            return (
              <div
                key={stage.key}
                className="flex flex-col w-56 flex-shrink-0"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(stage.key)}
              >
               
                <div className={`flex items-center justify-between px-3 py-2 rounded-xl mb-2 ${stage.bg}`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${stage.dot}`} />
                    <span className={`text-xs font-semibold truncate ${stage.color}`}>
                      {stage.label}
                    </span>
                  </div>
                  <span className={`ml-1 flex-shrink-0 text-xs font-bold px-1.5 py-0.5 rounded-full ${stage.bg} ${stage.color} border border-current border-opacity-20`}>
                    {orders.length}
                  </span>
                </div>

               
                <div className="flex flex-col gap-2 min-h-[60px]">
                  {orders.map((order) => (
                    <OrderCard
                      key={order._id}
                      order={order}
                      stageKey={stage.key}
                      onDragStart={() => onDragStart(order, stage.key)}
                      onClick={() => setDetailOrder(order)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div> */}

            <div className="flex flex-col gap-4 px-4 pt-4">
                {/* Row 1 — 8 columns */}
                <div className="flex gap-3" style={{ minWidth: "max-content" }}>
                    {ROW1.map((stage) => (
                        <StageColumn
                            key={stage.key}
                            stage={stage}
                            orders={grouped[stage.key] || []}
                            onDrop={onDrop}
                            onDragStart={onDragStart}
                            onCardClick={setDrawerOrder}
                        />
                    ))}
                </div>

                {/* Divider */}
                <div className="border-t-2 border-dashed border-gray-200 dark:border-gray-700 mx-2" />

                {/* Row 2 — 7 columns */}
                <div className="flex gap-3" style={{ minWidth: "max-content" }}>
                    {ROW2.map((stage) => (
                        <StageColumn
                            key={stage.key}
                            stage={stage}
                            orders={grouped[stage.key] || []}
                            onDrop={onDrop}
                            onDragStart={onDragStart}
                            onCardClick={setDrawerOrder}
                        />
                    ))}
                </div>
            </div>

            {/* ── Detail Modal ── */}
            {/* {detailOrder && (
        <DetailModal order={detailOrder} onClose={() => setDetailOrder(null)} />
      )} */}


            {drawerOrder && (
                <DetailDrawer order={drawerOrder} onClose={() => setDrawerOrder(null)} />
            )}

            {/* ── Todo → InProgress Confirm Modal ── */}
            {confirmMove && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6">

                        {/* Icon */}
                        <div className="flex justify-center mb-4">
                            {/* <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-2xl">
                    🚀
                </div> */}
                        </div>

                        {/* Title */}
                        <h2 className="text-center text-base font-semibold text-gray-900 dark:text-white mb-1">
                            Move to In Progress?
                        </h2>

                        {/* Message */}
                        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                            Status has moved from{" "}
                            <span className="font-semibold text-slate-600">To-Do</span>{" "}
                            to the next stage:{" "}
                            <span className="font-semibold text-blue-600">In Progress</span>.
                        </p>

                        {/* Order ID */}
                        <p className="text-center text-xs text-gray-400 font-mono mb-5">
                            {/* {confirmMove.order.orderId} */}
                        </p>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmMove(null)}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    const { order, toStage } = confirmMove;
                                    setConfirmMove(null);
                                    setHandlerName(""); setCustType(null);
                                    setPoFile(null); setPayAmt(""); setAdvAmt(""); setTotAmt("");
                                    setModalError("");
                                    setDropTarget({ order, toStage });
                                }}
                                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all"
                            >
                                Yes, Move
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Stage Transition Modal ── */}
            {dropTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                    Move to{" "}
                                    <span className={`${STAGE_MAP[dropTarget.toStage]?.color}`}>
                                        {STAGE_MAP[dropTarget.toStage]?.label}
                                    </span>
                                </h2>
                                <p className="text-xs text-gray-500 mt-0.5">{dropTarget.order.orderId}</p>
                            </div>
                            <button
                                onClick={() => setDropTarget(null)}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                ✕
                            </button>
                        </div>

                        {/* ── inProgress ── */}
                        {dropTarget.toStage === "inProgress" && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Handler Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        value={handlerName}
                                        onChange={(e) => setHandlerName(e.target.value)}
                                        placeholder="Enter handler name"
                                        className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Customer type — only if null */}
                                {(dropTarget.order.customerType === null || dropTarget.order.customerType === undefined) && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Customer Type <span className="text-red-500">*</span>
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {(["existing", "new"] as const).map((t, i) => (
                                                <button
                                                    key={t}
                                                    type="button"
                                                    onClick={() => setCustType(i === 0 ? 1 : 0)}
                                                    className={`rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all text-left ${custType === (i === 0 ? 1 : 0)
                                                        ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                                                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                                        }`}
                                                >
                                                    <div className={`h-3 w-3 rounded-full border-2 mb-2 transition-all ${custType === (i === 0 ? 1 : 0) ? "border-blue-500 bg-blue-500" : "border-gray-300"}`} />
                                                    <p className="font-semibold text-xs">{t === "existing" ? "Existing Customer" : "New Customer"}</p>
                                                    <p className="text-xs mt-0.5 opacity-60">{t === "existing" ? "Already registered" : "Create new account"}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── waitingForPO ── */}
                        {dropTarget.toStage === "waitingForPO" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Upload PO Document <span className="text-red-500">*</span>
                                </label>
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all">
                                    {poFile ? (
                                        <div className="text-center">
                                            <div className="text-2xl mb-1">📄</div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{poFile.name}</p>
                                            <p className="text-xs text-gray-400">{(poFile.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <div className="text-2xl mb-1">☁️</div>
                                            <p className="text-sm text-gray-500">Click to upload PO document</p>
                                            <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG supported</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        className="hidden"
                                        onChange={(e) => setPoFile(e.target.files?.[0] || null)}
                                    />
                                </label>
                            </div>
                        )}

                        {/* ── paymentStage1 ── */}
                        {dropTarget.toStage === "paymentStage1" && (
                            <div className="space-y-3">
                                <p className="text-xs text-gray-500 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
                                    Enter payment details for this order
                                </p>
                                {[
                                    { label: "Payment Amount", val: payAmt, set: setPayAmt },
                                    { label: "Advance Payment", val: advAmt, set: setAdvAmt },
                                    { label: "Total Payment", val: totAmt, set: setTotAmt },
                                ].map(({ label, val, set }) => (
                                    <div key={label}>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            {label} <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                                            <input
                                                type="number"
                                                value={val}
                                                onChange={(e) => set(e.target.value)}
                                                placeholder="0"
                                                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl pl-7 pr-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ── projectCodeCreation (customerType 0) ── */}
                        {dropTarget.toStage === "projectCodeCreation" && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg px-3 py-2">
                                This order will move to <strong>Project Code Creation</strong> (Agency customer path).
                            </p>
                        )}

                        {/* Error */}
                        {modalError && (
                            <p className="mt-3 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                                {modalError}
                            </p>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 mt-5">
                            <button
                                onClick={() => setDropTarget(null)}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleModalSubmit}
                                disabled={saving}
                                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium transition-all"
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

// ─── Order Card ───────────────────────────────────────────────────────────────
function OrderCard({ order, stageKey, onDragStart, onClick }: {
    order: Order;
    stageKey: string;
    onDragStart: () => void;
    onClick: () => void;
}) {
    const stage = STAGE_MAP[stageKey];
    const displayAmt = order.grandNegotiationTotal ?? order.grandTotal;

    return (
        <div
            draggable
            onDragStart={onDragStart}
            onClick={onClick}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-3 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 transition-all select-none"
        >
            {/* Order ID */}
            <p className="text-[10px] font-mono text-gray-400 dark:text-gray-500 mb-0.5">
                {order.orderId}
            </p>

            {/* Name */}
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-tight">
                {order.name}
            </p>


            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                <MdOutlineAccessTime className="text-[14px]" />
                {fmtDateTime(order.createdAt)}
            </p>

            {/* Grand Total */}
            <p className={`text-base font-bold mt-1.5 ${stage.color}`}>
                {fmt(displayAmt)}
            </p>

            {/* Customer Type + Handler */}
            <div className="flex items-center justify-between mt-2 gap-1">
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${order.customerType === 1
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20"
                        : order.customerType === 0
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20"
                            : "bg-gray-100 text-gray-400"
                    }`}>
                    {customerLabel(order.customerType)}
                </span>

                {order.handlerName && (
                    <span className="text-[10px] font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-2 py-0.5 rounded-full truncate max-w-[80px]">
                        {order.handlerName}
                    </span>
                )}
            </div>
        </div>
    );
}
// ─── Detail Modal ─────────────────────────────────────────────────────────────
function DetailDrawer({ order, onClose }: { order: Order; onClose: () => void }) {
    const stage = STAGE_MAP[order.pipelineStatus];

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 w-full max-w-3xl max-h-[70vh] flex flex-col shadow-2xl rounded-2xl">
                {/* Header */}
                <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-5 py-4 flex items-center justify-between rounded-t-2xl">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Order Details</h2>
                        <p className="text-xs text-gray-400 mt-0.5">{order.orderId}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {order.handlerName && (
                            <span className="text-xs font-medium text-violet-600 bg-violet-50 dark:bg-violet-900/30 px-2.5 py-1 rounded-full">
                                {order.handlerName}
                            </span>
                        )}
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 dark:bg-red-900/20 text-red-500 flex items-center justify-center text-sm font-bold transition-all"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    {/* Customer info */}
                    <Section title="Customer Information">
                        <Row label="Order ID" value={order.orderId} />
                        <Row label="Name" value={order.name} />
                        <Row label="Phone" value={order.phone} />
                        {order.email && <Row label="Email" value={order.email} />}
                        {order.address && <Row label="Address" value={order.address} />}
                        <Row
                            label="Customer Type"
                            value={
                                order.customerType === 1
                                    ? "Individual"
                                    : order.customerType === 0
                                        ? "Agency"
                                        : "Not set"
                            }
                        />
                    </Section>

                    {/* Pipeline status */}
                    <Section title="Pipeline Status">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${stage?.bg} ${stage?.color}`}>
                            <span className={`w-2 h-2 rounded-full ${stage?.dot}`} />
                            {stage?.label}
                        </div>
                    </Section>

                    {/* Pricing */}
                    <Section title="Pricing">
                        <Row label="Grand Total" value={fmt(order.grandTotal)} highlight />
                        {order.grandNegotiationTotal != null && (
                            <Row label="Negotiated Total" value={fmt(order.grandNegotiationTotal)} highlight />
                        )}
                        <Row label="GST" value={fmt(order.grandGst)} />
                        {order.paymentAmount != null && order.paymentAmount > 0 && <Row label="Payment Amount" value={fmt(order.paymentAmount)} />}
                        {order.advancePayment != null && order.advancePayment > 0 && <Row label="Advance Payment" value={fmt(order.advancePayment)} />}
                        {order.totalPayment != null && order.totalPayment > 0 && <Row label="Total Payment" value={fmt(order.totalPayment)} />}
                    </Section>

                    {/* Vehicle Bookings */}
                    <Section title="Vehicle Bookings">
                        <div className="overflow-x-auto -mx-1">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-800">
                                        {["Vehicle", "City", "Qty", "From", "To", "Days", "Price/Day", "Total"].map((h) => (
                                            <th key={h} className="text-left px-2 py-2 text-gray-400 font-medium whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.bookingItems.map((item, i) => (
                                        <tr key={i} className="border-b border-gray-50 dark:border-gray-800/50">
                                            <td className="px-2 py-2 font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{item.vehicleModel}</td>
                                            <td className="px-2 py-2 text-gray-500 whitespace-nowrap">{item.city}</td>
                                            <td className="px-2 py-2 text-gray-500">{item.quantity}</td>
                                            <td className="px-2 py-2 text-gray-500 whitespace-nowrap">{fmtDate(item.fromDate)}</td>
                                            <td className="px-2 py-2 text-gray-500 whitespace-nowrap">{fmtDate(item.toDate)}</td>
                                            <td className="px-2 py-2 text-gray-500">{item.totalDays}</td>
                                            <td className="px-2 py-2 text-gray-500 whitespace-nowrap">{fmt(item.perDayRentalCost)}</td>
                                            <td className="px-2 py-2 font-semibold text-blue-600 whitespace-nowrap">{fmt(item.totalAmount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="text-right mt-2">
                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                Total Amount : {fmt(order.grandTotal)}
                            </span>
                        </div>
                    </Section>

                    {/* Negotiation History */}
                    {order.negotiationLogs && order.negotiationLogs.length > 0 && (
                        <Section title="Negotiation History">
                            {order.negotiationLogs.map((log: any, i: number) => (
                                <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                                    <span className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                            {log.fromStage} → {log.toStage}
                                        </p>
                                        {log.amount && (
                                            <p className="text-xs text-green-600 font-semibold">
                                                Negotiated: {fmt(log.amount)}
                                            </p>
                                        )}
                                        <p className="text-[10px] text-gray-400 mt-0.5">
                                            {log.movedBy} · {fmtDate(log.movedAt)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-800">
                                <span className="text-xs text-gray-500">Current Negotiation Total</span>
                                <span className="text-sm font-bold text-gray-800 dark:text-white">
                                    {fmt(order.grandNegotiationTotal ?? order.grandTotal)}
                                </span>
                            </div>
                        </Section>
                    )}

                    {/* Pipeline History */}
                    <Section title="Pipeline History">
                        {[...order.pipelineLogs].reverse().map((log, i) => {
                            const toStage = STAGE_MAP[log.toStage];
                            return (
                                <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                                    <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${toStage?.dot || "bg-gray-400"}`} />
                                    <div>
                                        {log.fromStage ? (
                                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                {STAGE_MAP[log.fromStage]?.label || log.fromStage}{" "}
                                                <span className="text-gray-400">→</span>{" "}
                                                {toStage?.label || log.toStage}
                                            </p>
                                        ) : (
                                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                Start → {toStage?.label || log.toStage}
                                            </p>
                                        )}
                                        {log.handlerName && (
                                            <p className="text-[10px] text-violet-500 mt-0.5">Handler: {log.handlerName}</p>
                                        )}
                                        <p className="text-[10px] text-gray-400 mt-0.5">
                                            {log.movedBy} · {fmtDate(log.movedAt)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </Section>

                    {/* PO document */}
                    {order.poDocument && (
                        <Section title="PO Document">
                            <a
                                href={order.poDocument}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                            >
                                📄 View PO Document
                            </a>
                        </Section>
                    )}
                </div>
            </div>
        </div>
    );
}




function StageColumn({ stage, orders, onDrop, onDragStart, onCardClick }: {
    stage: { key: string; label: string; color: string; bg: string; dot: string };
    orders: Order[];
    onDrop: (stageKey: string) => void;
    onDragStart: (order: Order, stageKey: string) => void;
    onCardClick: (order: Order) => void;
}) {
    return (
        <div
            className="flex flex-col w-56 flex-shrink-0"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(stage.key)}
        >
            {/* Column header */}
            <div className={`flex items-center justify-between px-3 py-2 rounded-xl mb-2 ${stage.bg}`}>
                <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${stage.dot}`} />
                    <span className={`text-xs font-semibold truncate ${stage.color}`}>
                        {stage.label}
                    </span>
                </div>
                <span className={`ml-1 flex-shrink-0 text-xs font-bold px-1.5 py-0.5 rounded-full ${stage.bg} ${stage.color} border border-current border-opacity-20`}>
                    {orders.length}
                </span>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2 min-h-[60px]">
                {orders.map((order) => (
                    <OrderCard
                        key={order._id}
                        order={order}
                        stageKey={stage.key}
                        onDragStart={() => onDragStart(order, stage.key)}
                        onClick={() => onCardClick(order)}
                    />
                ))}
            </div>
        </div>
    );
}

// ─── Small helpers ────────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4">
            <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                {title}
            </h3>
            {children}
        </div>
    );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
            <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
            <span className={`text-xs font-medium ${highlight ? "text-blue-600 dark:text-blue-400 font-bold" : "text-gray-800 dark:text-gray-200"}`}>
                {value}
            </span>
        </div>
    );
}