

"use client";

import { useState } from "react";
import axios from "axios";
import { getToken } from "@/utils/auth";
import toast from "react-hot-toast";
import API_BASE from "../../../../../baseurl";
import { Percent, IndianRupee, Plus, X, Tag, TrendingDown, AlertCircle, CheckCircle2, ArrowRight, Calculator, History } from "lucide-react";

interface NegotiationFormProps {
    order: any;
    onNegotiationSaved: () => Promise<void>;
}

const HIDE_STAGES = ["todo", "inProgress", "newOrder"];
const HIDE_ADD_DISCOUNT_STAGES = ["todo", "inProgress", "newOrder", "waitingForPO", "paymentStage1", "projectCodeCreation", "projectExecution", "onRoad", "campaignRunning", "vehicleUnavailable", "clientClosure", "invoiceGeneration", "paymentStage2", "closedWon", "closedLost"];

const formatIndianNumber = (value: string | number) => {
    if (!value) return "";

    const number = value.toString().replace(/,/g, "");

    return new Intl.NumberFormat("en-IN").format(Number(number));
};

export default function NegotiationForm({ order, onNegotiationSaved }: NegotiationFormProps) {
    if (HIDE_STAGES.includes(order.pipelineStatus)) return null;

    const MAX_DISCOUNT_PCT = Number(process.env.NEXT_PUBLIC_MAX_DISCOUNT_PERCENT) || 15;

    const subtotal = order.bookingItems.reduce(
        (sum: number, item: any) => sum + (item.totalAmount || 0), 0
    );
    const gst = order.grandGst;
    const grandTotal = order.grandTotal;

    const previousLogs = order.negotiationLogs || [];
    const filteredLogs = previousLogs.filter((log: any) => (log.discountAmount || 0) > 0);

    console.log("filteredLogs", filteredLogs)

    const previousTotalDiscount = previousLogs.reduce(
        (sum: number, log: any) => sum + (log.discountAmount || 0), 0
    );

    const remainingSubtotal = subtotal - previousTotalDiscount;
    const maxAllowedTotal = Math.floor((subtotal * MAX_DISCOUNT_PCT) / 100);
    const maxDiscountAmount = Math.max(0, maxAllowedTotal - previousTotalDiscount);

    const [showNewDiscount, setShowNewDiscount] = useState(false);
    const [discountType, setDiscountType] = useState<"amount" | "percent">("amount");
    const [discountValue, setDiscountValue] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [discountNotes, setDiscountNotes] = useState("");



            
  function fmtDatetime(d: string) {
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

    const discVal = Number(discountValue) || 0;
    const discountAmt =
        discountType === "percent"
            ? Math.round((remainingSubtotal * Math.min(discVal, MAX_DISCOUNT_PCT)) / 100)
            : discVal;

    const percentExceeded = discountType === "percent" && discVal > MAX_DISCOUNT_PCT;
    const amountExceeded = discountType === "amount" && discVal > maxDiscountAmount;
    const isInvalid = percentExceeded || amountExceeded;

    const balanceAfterNew = remainingSubtotal - discountAmt;

    const fmt = (n?: number | null) =>
        n != null ? `₹ ${n.toLocaleString("en-IN")}` : "—";

    const handleSubmit = async () => {
        if (isInvalid) {
            toast.error("Discount limit exceeded");
            return;
        }
        if (!showNewDiscount || discVal === 0) {
            toast.error("Please add a discount amount");
            return;
        }

        setSaving(true);
        setError("");

        try {
            const token = getToken();
            const fd = new FormData();
            fd.append("pipelineStatus", "customerConfirmation");
            fd.append("discountType", discountType);
            fd.append("discountValue", String(discVal));
            fd.append("discountNotes", discountNotes);

            await axios.patch(`${API_BASE}admin/pipeline/${order._id}`, fd, {
                headers: { Authorization: `Bearer ${token}` },
            });

            toast.success("🎉 Discount added successfully!");
            await onNegotiationSaved();
            setShowNewDiscount(false);
            setDiscountValue("");
            setDiscountNotes("");
        } catch (e: any) {
            const msg = e?.response?.data?.message || "Something went wrong";
            setError(msg);
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200/60 dark:border-gray-700/50 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
            {/* Header */}


            <div className="p-5 space-y-4">
                {/* ── Summary Cards ── */}
                <div className="grid grid-cols-4 gap-3">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/40 dark:to-gray-800/60 rounded-xl p-3.5 border border-gray-100 dark:border-gray-700/50">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Calculator size={14} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <p className="text-[12px] font-semibold text-gray-400 uppercase">Subtotal</p>
                        </div>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{fmt(subtotal)}</p>
                    </div>

                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/40 dark:to-gray-800/60 rounded-xl p-3.5 border border-gray-100 dark:border-gray-700/50">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <IndianRupee size={14} className="text-purple-600 dark:text-purple-400" />
                            </div>
                            <p className="text-[12px] font-semibold text-gray-400 uppercase">GST</p>
                        </div>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{fmt(gst)}</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-3.5 border-2 border-blue-200 dark:border-blue-700/50">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center">
                                <IndianRupee size={14} className="text-white" />
                            </div>
                            <p className="text-[12px] font-semibold text-blue-600 dark:text-blue-400 uppercase">Grand Total</p>
                        </div>
                        <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{fmt(grandTotal)}</p>
                    </div>

                    <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl p-3.5 border-2 border-red-200 dark:border-red-700/50">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 rounded-lg bg-red-500 flex items-center justify-center">
                                <Percent size={14} className="text-white" />
                            </div>
                            <p className="text-[12px] font-semibold text-red-600 dark:text-red-400 uppercase">Discount</p>
                        </div>
                        <p className="text-lg font-bold text-red-700 dark:text-red-300">- ₹{previousTotalDiscount.toLocaleString("en-IN")}</p>
                    </div>
                </div>

                {/* ── Discount History ── */}
                {previousLogs.length > 0 && (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-xl border border-amber-200 dark:border-amber-800/50 p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <History size={16} className="text-amber-600 dark:text-amber-400" />
                            <p className="text-md font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                                Discount History
                            </p>
                        </div>


                        <div className="space-y-2">
                            {filteredLogs.map((log: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/60 dark:bg-gray-800/40 border border-amber-100 dark:border-amber-900/30 hover:shadow-sm transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                {log.movedBy || "Unknown"}
                                            </p>
                                            <p className="text-[12px] text-gray-400 mt-0.5">
                                                {fmtDatetime(log.movedAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 mb-0.5">Amount</p>
                                        <p className="text-sm font-bold text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
                                            - ₹{(log.discountAmount || 0).toLocaleString("en-IN")}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {/* Total Discount */}
                            <div className="flex items-center justify-between p-3 mt-2 rounded-lg bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800/50">
                                <div className="flex items-center gap-2">
                                    <TrendingDown size={16} className="text-red-600 dark:text-red-400" />
                                    <span className="text-xs font-bold text-red-700 dark:text-red-400">
                                        Total Discount Applied
                                    </span>
                                </div>
                                <span className="text-lg font-bold text-red-700 dark:text-red-400">
                                    - ₹{previousTotalDiscount.toLocaleString("en-IN")}
                                </span>
                            </div>

                            {/* Balance */}
                            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50">
                                <div className="flex items-center gap-2">
                                    <ArrowRight size={16} className="text-blue-600 dark:text-blue-400" />
                                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                                        Balance After Discounts
                                    </span>
                                </div>
                                <span className="text-sm font-bold text-blue-700 dark:text-blue-400">
                                    ₹{remainingSubtotal.toLocaleString("en-IN")}
                                </span>
                            </div>
                        </div>
                    </div>
                )}


                {!showNewDiscount && !HIDE_ADD_DISCOUNT_STAGES.includes(order.pipelineStatus) && (
                    <button
                        type="button"
                        onClick={() => setShowNewDiscount(true)}
                        className="w-full group py-4 rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-700 hover:border-blue-500 dark:hover:border-blue-500 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 transition-all duration-300"
                    >
                        <div className="flex items-center justify-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all">
                                <Plus size={20} className="text-blue-600 dark:text-blue-400 group-hover:text-white" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-300">
                                    Add New Discount
                                </p>
                                <p className="text-xs text-blue-500 dark:text-blue-500/70 mt-0.5">
                                    Max {MAX_DISCOUNT_PCT}% of subtotal allowed
                                </p>
                            </div>
                        </div>
                    </button>
                )}

                {/* ── New Discount Input ── */}
                {showNewDiscount && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-blue-300 dark:border-blue-700 p-5 space-y-4 animate-in slide-in-from-top-2 duration-300">
                        {/* Header with cancel */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                                    <Tag size={16} className="text-white" />
                                </div>
                                <p className="text-sm font-bold text-blue-700 dark:text-blue-300">
                                    New Discount
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowNewDiscount(false);
                                    setDiscountValue("");
                                    setDiscountType("amount");
                                }}
                                className="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center transition-colors group"
                            >
                                <X size={16} className="text-gray-400 group-hover:text-red-500" />
                            </button>
                        </div>

                        {/* Max allowed info */}
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50">
                            <AlertCircle size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                                    Maximum Allowed Discount
                                </p>
                                <p className="text-lg font-bold text-blue-800 dark:text-blue-300 mt-0.5">
                                    ₹{maxDiscountAmount.toLocaleString("en-IN")}
                                </p>
                                <p className="text-[10px] text-blue-600 dark:text-blue-500/70 mt-1">
                                    {MAX_DISCOUNT_PCT}% of ₹{subtotal.toLocaleString("en-IN")} − previous discounts
                                </p>
                            </div>
                        </div>

                        {/* Toggle & Input */}
                        <div className="space-y-3">
                            <div className="flex rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                                <button
                                    type="button"
                                    onClick={() => { setDiscountType("amount"); setDiscountValue(""); }}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-all ${discountType === "amount"
                                        ? "bg-blue-600 text-white shadow-lg"
                                        : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                                        }`}
                                >
                                    <IndianRupee size={16} />
                                    Amount
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setDiscountType("percent"); setDiscountValue(""); }}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-all ${discountType === "percent"
                                        ? "bg-blue-600 text-white shadow-lg"
                                        : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                                        }`}
                                >
                                    <Percent size={16} />
                                    Percent
                                </button>
                            </div>


                            <div className="relative">
                                <input
                                    type="text"
                                    value={
                                        discountType === "amount"
                                            ? formatIndianNumber(discountValue)
                                            : discountValue
                                    }
                                    onChange={(e) => {
                                        const rawValue = e.target.value.replace(/,/g, "");

                                        if (/^\d*$/.test(rawValue)) {
                                            setDiscountValue(rawValue);
                                        }
                                    }}
                                    placeholder={
                                        discountType === "percent"
                                            ? `Enter percentage (max ${MAX_DISCOUNT_PCT}%)`
                                            : `Enter amount (max ₹${maxDiscountAmount.toLocaleString("en-IN")})`
                                    }
                                    className={`w-full px-4 py-3.5 rounded-xl border-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm font-medium focus:outline-none focus:ring-4 transition-all ${isInvalid
                                        ? "border-red-300 dark:border-red-700 focus:ring-red-100 dark:focus:ring-red-900/30"
                                        : "border-gray-200 dark:border-gray-700 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-500"
                                        }`}
                                />

                                {discountType === "percent" && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Percent size={18} className="text-gray-400" />
                                    </div>
                                )}

                                {discountType === "amount" && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <IndianRupee size={18} className="text-gray-400" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <textarea
                                    value={discountNotes}
                                    onChange={(e) => setDiscountNotes(e.target.value)}
                                    placeholder="Add notes (optional)..."
                                    rows={2}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 
    dark:border-gray-700 bg-white dark:bg-gray-800 text-sm
    text-gray-900 dark:text-white placeholder-gray-400
    focus:outline-none focus:ring-4 focus:ring-blue-100
    dark:focus:ring-blue-900/30 focus:border-blue-500 resize-none"
                                />

                            </div>
                        </div>

                        {/* Validation Errors */}
                        {isInvalid && (
                            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50">
                                <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-semibold text-red-700 dark:text-red-400">
                                        Discount Limit Exceeded
                                    </p>
                                    <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">
                                        {percentExceeded && `Maximum allowed is ${MAX_DISCOUNT_PCT}% (₹${maxDiscountAmount.toLocaleString("en-IN")})`}
                                        {amountExceeded && `Maximum allowed amount is ₹${maxDiscountAmount.toLocaleString("en-IN")}`}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Live Balance Preview */}
                        {discountAmt > 0 && !isInvalid && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-white/80 dark:bg-gray-800/40 border border-orange-200 dark:border-orange-800/50">
                                    <div className="flex items-center gap-2">
                                        <TrendingDown size={16} className="text-orange-500" />
                                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">This Discount</span>
                                    </div>
                                    <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                                        - ₹{discountAmt.toLocaleString("en-IN")}
                                    </span>
                                </div>

                                <div className={`p-4 rounded-xl border-2 ${balanceAfterNew > 0
                                    ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700"
                                    : "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700"
                                    }`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {balanceAfterNew > 0 ? (
                                                <CheckCircle2 size={18} className="text-green-600 dark:text-green-400" />
                                            ) : (
                                                <AlertCircle size={18} className="text-red-600 dark:text-red-400" />
                                            )}
                                            <span className={`text-xs font-semibold ${balanceAfterNew > 0
                                                ? "text-green-700 dark:text-green-400"
                                                : "text-red-700 dark:text-red-400"
                                                }`}>
                                                New Balance After Discount
                                            </span>
                                        </div>
                                        <span className={`text-lg font-bold ${balanceAfterNew > 0
                                            ? "text-green-700 dark:text-green-400"
                                            : "text-red-700 dark:text-red-400"
                                            }`}>
                                            ₹{balanceAfterNew.toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50">
                                <AlertCircle size={14} className="text-red-500" />
                                <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={saving || isInvalid || discVal === 0}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group"
                        >
                            {saving ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" />
                                    Confirm Discount
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}



export function NegotiationHeader({ order }: { order: any }) {
    const previousLogs = order.negotiationLogs || [];
    const filteredLogs = previousLogs.filter((log: any) => (log.discountAmount || 0) > 0);
    
    return (
        <div className="flex items-center gap-2.5">
            <span className="text-lg">💰</span>
            <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Customer Negotiation
            </h3>
            {previousLogs.length > 0 && (
                <span className="ml-auto px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                    {filteredLogs.length} discount{filteredLogs.length !== 1 ? 's' : ''}
                </span>
            )}
        </div>
    );
}