// components/PipelineBoard.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import API_BASE from "../../../../../baseurl";
import { getToken } from "@/utils/auth";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";

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
    updatedAt?: string;
    paymentStageFirst:string;
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

const fmtDatetime = (d?: string) =>
    d
        ? new Date(d)
            .toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
            })
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




export default function PipelineBoard() {

    const initialForm = {
  
        handlerName: "",
        custType: null as 0 | 1 | null,

       
        discountType: "amount" as "amount" | "percent",
        discountValue: "",

       
        poFile: null as File | null,
        poDate: "",
        poNotes: "",

        
        advPayment: "",
        paymentProofFile: null as File | null,
        paymentDate: "",
        paymentVerification: "",
        paymentNotes: "",
    };
    const [grouped, setGrouped] = useState<Record<string, Order[]>>({});
    const [loading, setLoading] = useState(true);

  
    const dragOrder = useRef<Order | null>(null);
    const dragFrom = useRef<string>("");


    const [drawerOrder, setDrawerOrder] = useState<any | null>(null);
    const [dropTarget, setDropTarget] = useState<{ order: Order; toStage: string } | null>(null);


    const [saving, setSaving] = useState(false);
    const [modalError, setModalError] = useState("");
    const [confirmMove, setConfirmMove] = useState<{ order: Order; toStage: string } | null>(null);
    const [currentUserIsAdmin, setCurrentUserIsAdmin] = useState<number>(1);
    const [staffAdmins, setStaffAdmins] = useState<{ username: string }[]>([]);
    const [form, setForm] = useState(initialForm);
    const [projectCodeConfirm, setProjectCodeConfirm] = useState<Order | null>(null);


    const setField = <K extends keyof typeof initialForm>(
        key: K,
        value: (typeof initialForm)[K]
    ) => setForm((prev) => ({ ...prev, [key]: value }));

  
    const resetForm = () => setForm(initialForm);



  
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

    const fetchStaffList = async () => {
        try {
            const token = getToken();
            const { data } = await axios.get(`${API_BASE}staff-admins`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setStaffAdmins(data.data.data || []);
        } catch { }
    };


    const onDragStart = (order: Order, fromStage: string) => {
        dragOrder.current = order;
        dragFrom.current = fromStage;
    };


const onDrop = (toStage: string) => {
    const order = dragOrder.current;
    if (!order || dragFrom.current === toStage) return;


    if (dragFrom.current === "todo" && toStage === "inProgress") {
        if (currentUserIsAdmin === 0) {
            commitMove(order, toStage, {});
        } else {
            setConfirmMove({ order, toStage });
        }
        return;
    }

    if (toStage === "projectCodeCreation") {
        setProjectCodeConfirm(order);
        return;
    }


    if (toStage === "inProgress") {
        resetForm();
        setModalError("");
        setDropTarget({ order, toStage });
        return;
    }

  
    commitMove(order, toStage, {});
};

    const commitMove = async (
        order: Order,
        toStage: string,
        extra: {
            handlerName?: string;
            customerType?: number;
            poFile?: File | null;
            poDate?: string;
            poNotes?: string;
            advancePayment?: number;
            paymentProofFile?: File | null;
            paymentDate?: string;
            paymentVerification?: string;
            paymentNotes?: string;
            discountType?: string;
            discountValue?: number;
        }
    ) => {
        try {
            setSaving(true);
            const token = getToken();
            const fd = new FormData();
            fd.append("pipelineStatus", toStage);

            if (extra.handlerName) fd.append("handlerName", extra.handlerName);
            if (extra.customerType != null) fd.append("customerType", String(extra.customerType));

            if (extra.poFile) fd.append("poDocument", extra.poFile);
            if (extra.poDate) fd.append("poDate", extra.poDate);
            if (extra.poNotes) fd.append("poNotes", extra.poNotes);

        
            if (extra.paymentProofFile) fd.append("paymentProofDocument", extra.paymentProofFile);
            if (extra.advancePayment) fd.append("advancePayment", String(extra.advancePayment));
            if (extra.paymentDate) fd.append("paymentDate", extra.paymentDate);
            if (extra.paymentVerification) fd.append("paymentVerification", extra.paymentVerification);
            if (extra.paymentNotes) fd.append("paymentNotes", extra.paymentNotes);

         
            if (extra.discountType) fd.append("discountType", extra.discountType);
            if (extra.discountValue != null) fd.append("discountValue", String(extra.discountValue));

            await axios.patch(`${API_BASE}admin/pipeline/${order._id}`, fd, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setDropTarget(null);
            resetForm();       
            toast.success("Order moved successfully!");
            await fetchPipeline();
        } catch (e: any) {
            const msg = e?.response?.data?.message || "Something went wrong";
            setModalError(msg);
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

   
    const handleModalSubmit = () => {
        if (!dropTarget) return;
        const { order, toStage } = dropTarget;
        setModalError("");

        
        if (toStage === "inProgress") {
            if (currentUserIsAdmin === 1 && !form.handlerName.trim())
                return setModalError("Handler name is required");
            if (
                (order.customerType === null || order.customerType === undefined) &&
                form.custType === null
            )
                return setModalError("Please select customer type");

            commitMove(order, toStage, {
                handlerName: currentUserIsAdmin === 1 ? form.handlerName : undefined,
                customerType: order.customerType ?? form.custType ?? undefined,
            });
        }

    

       
        if (toStage === "projectCodeCreation") {
            commitMove(order, toStage, {});
        }
    };



  
    if (loading)
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );

    return (
        <div className="flex flex-col h-full">

            <div className="flex flex-col gap-4 px-4 pt-4">
             
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

           
                <div className="border-t-2 border-dashed border-gray-200 dark:border-gray-700 mx-2" />

              
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


            {drawerOrder && (
                <DetailDrawer
                    order={drawerOrder}
                    onClose={() => setDrawerOrder(null)}
                    onRefresh={async () => {
                        const token = getToken();
                        const { data } = await axios.get(`${API_BASE}admin/pipeline`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        setGrouped(data.data.grouped);
                      
                        const updatedOrder = Object.values(data.data.grouped)
                            .flat()
                            .find((o: any) => o._id === drawerOrder._id) as Order | undefined;
                        if (updatedOrder) setDrawerOrder(updatedOrder);
                    }}
                />
            )}

          
            {confirmMove && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6">

                        {/* Icon */}
                        <div className="flex justify-center mb-4">
                            <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-2xl">
                    🚀
                </div>
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
                                    resetForm();         
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

            {/* ── Project Code Creation Confirm Modal ── */}
            {projectCodeConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6">
                        <div className="flex justify-center mb-4">
                            <div className="w-14 h-14 rounded-full bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center text-2xl">
                                🗂️
                            </div>
                        </div>
                        <h2 className="text-center text-base font-semibold text-gray-900 dark:text-white mb-2">
                            Move to Project Code Creation?
                        </h2>
                        <p className="text-center text-xs font-mono text-gray-400 mb-2">
                            {projectCodeConfirm.orderId}
                        </p>
                        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
                            Are you sure you want to move{" "}
                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                                {projectCodeConfirm.name}
                            </span>{" "}
                            to{" "}
                            <span className="font-semibold text-cyan-600">Project Code Creation</span>?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setProjectCodeConfirm(null)}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    commitMove(projectCodeConfirm, "projectCodeCreation", {});
                                    setProjectCodeConfirm(null);
                                }}
                                disabled={saving}
                                className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 text-white text-sm font-medium transition-all"
                            >
                                {saving ? "Moving..." : "Yes, Move"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

         
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

                     
                        {dropTarget.toStage === "inProgress" && (
                            <div className="space-y-4">
                                {currentUserIsAdmin === 1 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Assign Handler <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={form.handlerName}
                                            onChange={(e) => setField("handlerName", e.target.value)}
                                            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">-- Select Handler --</option>
                                            {staffAdmins.map((s) => (
                                                <option key={s.username} value={s.username}>{s.username}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {currentUserIsAdmin === 0 && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-3 py-2.5">
                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                            You will be assigned as the handler for this order.
                                        </p>
                                    </div>
                                )}

                                {(dropTarget.order.customerType === null || dropTarget.order.customerType === undefined) && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Customer Type <span className="text-red-500">*</span>
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {(["existing", "new"] as const).map((t, i) => {
                                                const val = i === 0 ? 1 : 0;
                                                return (
                                                    <button
                                                        key={t}
                                                        type="button"
                                                        onClick={() => setField("custType", val as 0 | 1)}
                                                        className={`rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all text-left ${form.custType === val
                                                            ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                                                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                                            }`}
                                                    >
                                                        <div className={`h-3 w-3 rounded-full border-2 mb-2 transition-all ${form.custType === val ? "border-blue-500 bg-blue-500" : "border-gray-300"
                                                            }`} />
                                                        <p className="font-semibold text-xs">
                                                            {t === "existing" ? "Existing Customer" : "New Customer"}
                                                        </p>
                                                        <p className="text-xs mt-0.5 opacity-60">
                                                            {t === "existing" ? "Already registered" : "Create new account"}
                                                        </p>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}



                      
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



import { User, Clock } from "lucide-react";
import DetailDrawer from "./DetailsModel";



function OrderCard({ order, stageKey, onDragStart, onClick }: {
    order: Order;
    stageKey: string;
    onDragStart: () => void;
    onClick: () => void;
}) {
    const stage = STAGE_MAP[stageKey];

     const logs: any = order.paymentStageFirst || [];
    const totalAdvance = logs.reduce((sum, log) => sum + (log.advancePayment || 0), 0);

    // Pricing calculations
    const subtotal = order.bookingItems.reduce((s, i) => s + (i.totalAmount || 0), 0);
    const totalDiscount = (order.negotiationLogs || []).reduce((s, l) => s + (l.discountAmount || 0), 0);
    const taxable = subtotal - totalDiscount;
    const gstAmt = Math.floor(taxable * 0.18);
    const finalNet = taxable + gstAmt;
    const balanceAmount = finalNet - totalAdvance;

    // const displayAmt = order.grandNegotiationTotal ?? order.grandTotal;
    const displayAmt = balanceAmount;

    const custBadge =
        order.customerType === 1
            ? { bg: "#E7F1FF", color: "#0A3F91", label: "New Customer" }
            : order.customerType === 0
                ? { bg: "#E6FBF4", color: "#046B4F", label: "Existing Customer" }
                : { bg: "#F4F2EA", color: "#4A4A45", label: "Not Set" };

    return (
        <div
            draggable
            onDragStart={onDragStart}
            onClick={onClick}
            className="
                bg-white dark:bg-gray-900 
                border border-gray-200 dark:border-gray-800 
                rounded-xl p-3 cursor-grab active:cursor-grabbing 
                hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-700 
                transition duration-150 ease-out select-none
            "
        >
           
            <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-mono text-gray-400 dark:text-gray-500">
                    {order.orderId}
                </p>

                <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{ background: custBadge.bg, color: custBadge.color }}
                >
                    {custBadge.label}
                </span>
            </div>

           
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight mb-2">
                {order.name}
            </p>

           
            <p className={`text-lg font-bold mb-3 ${stage.color}`}>
                {fmt(displayAmt)}
            </p>

           
            <div className="flex items-center justify-between">
                {order.handlerName ? (
                    <span className="
                        text-[11px] font-medium 
                        text-violet-700 dark:text-violet-300 
                        bg-violet-100 dark:bg-violet-900/30 
                        px-2 py-0.5 rounded-full 
                        flex items-center gap-1 max-w-[130px] truncate
                    ">
                        <User size={12} className="flex-shrink-0" />
                        {order.handlerName}
                    </span>
                ) : (
                    <span />
                )}

                <span className="
                    text-[10px] text-gray-500 dark:text-gray-400 
                    flex items-center gap-1
                ">
                    <Clock size={12} />
                    {fmtDate(order.updatedAt)}
                </span>
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
                        onClick={() => onCardClick(order)}
                    />
                ))}
            </div>
        </div>
    );
}
