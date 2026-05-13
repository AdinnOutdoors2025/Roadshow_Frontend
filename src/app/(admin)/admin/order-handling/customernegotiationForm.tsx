

"use client";

import { useState } from "react";
import axios from "axios";
import { getToken } from "@/utils/auth";
import toast from "react-hot-toast";
import API_BASE from "../../../../../baseurl";

interface NegotiationFormProps {
    order: any;
    onNegotiationSaved: () => Promise<void>;

}

const HIDE_STAGES = ["todo", "inProgress", "newOrder"];

export default function NegotiationForm({ order, onNegotiationSaved }: NegotiationFormProps) {

    if (HIDE_STAGES.includes(order.pipelineStatus)) return null;

    const MAX_DISCOUNT_PCT = Number(process.env.NEXT_PUBLIC_MAX_DISCOUNT_PERCENT) || 15;

    const subtotal = order.bookingItems.reduce(
        (sum: number, item: any) => sum + (item.totalAmount || 0), 0
    );
    const gst = order.grandGst;
    const grandTotal = order.grandTotal;

    //   // ✅ Previous negotiations total
    //   const previousLogs = order.negotiationLogs || [];
    //   const previousTotalDiscount = previousLogs.reduce(
    //     (sum: number, log: any) => sum + (log.discountAmount || 0), 0
    //   );
    //   const remainingSubtotal = subtotal - previousTotalDiscount;

    //   // ✅ Max discount இந்த remaining-ல இருந்து மட்டும்
    //   const maxDiscountAmount = Math.round((remainingSubtotal * MAX_DISCOUNT_PCT) / 100);

    // ✅ CORRECT
    const previousLogs = order.negotiationLogs || [];

    // ✅ 0 discount logs filter பண்ணி காட்டாதே
    const filteredLogs = previousLogs.filter((log: any) => (log.discountAmount || 0) > 0);

    const previousTotalDiscount = previousLogs.reduce(
        (sum: number, log: any) => sum + (log.discountAmount || 0), 0
    );

    // Balance = subtotal - all previous discounts
    const remainingSubtotal = subtotal - previousTotalDiscount;

    // ✅ Max = subtotal × 15% - previousTotalDiscount
    // எப்பவும் original subtotal வைத்து 15% போட்டு, previous discount கழி
    const maxAllowedTotal = Math.round((subtotal * MAX_DISCOUNT_PCT) / 100);
    const maxDiscountAmount = Math.max(0, maxAllowedTotal - previousTotalDiscount);

    // ✅ New discount input fields state
    const [showNewDiscount, setShowNewDiscount] = useState(false);
    const [discountType, setDiscountType] = useState<"amount" | "percent">("amount");
    const [discountValue, setDiscountValue] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const discVal = Number(discountValue) || 0;
    const discountAmt =
        discountType === "percent"
            ? Math.round((remainingSubtotal * Math.min(discVal, MAX_DISCOUNT_PCT)) / 100)
            : discVal;

    const percentExceeded = discountType === "percent" && discVal > MAX_DISCOUNT_PCT;
    const amountExceeded = discountType === "amount" && discVal > maxDiscountAmount;
    const isInvalid = percentExceeded || amountExceeded;

    // ✅ Final balance = remainingSubtotal - new discount
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

            await axios.patch(`${API_BASE}admin/pipeline/${order._id}`, fd, {
                headers: { Authorization: `Bearer ${token}` },
            });

            toast.success("Discount added successfully!");
            await onNegotiationSaved(); 
            setShowNewDiscount(false);  
            setDiscountValue("");       
        } catch (e: any) {
            const msg = e?.response?.data?.message || "Something went wrong";
            setError(msg);
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Section title="Customer Negotiation">
            <div className="space-y-3">

                {/* ── Summary rows ── */}
                <Row label="Subtotal" value={fmt(subtotal)} />
                <Row label="GST" value={fmt(gst)} />
                <Row label="Grand Total" value={fmt(grandTotal)} highlight />

                {/* ── Existing discount logs ── */}
                {previousLogs.length > 0 && (
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-3 space-y-2">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Discount History
                        </p>

                        {filteredLogs.map((log: any, i: number) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-orange-50 text-orange-500 text-[10px] font-bold flex items-center justify-center border border-orange-200">
                                        {i + 1}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                       Stage {i + 1} Discount
                                    </span>
                                </div>
                                <span className="text-xs font-semibold text-orange-600">
                                    - ₹{(log.discountAmount || 0).toLocaleString("en-IN")}
                                </span>
                            </div>
                        ))}

                        {/* Total discount */}
                        <div className="border-t border-gray-100 dark:border-gray-800 pt-2 flex justify-between">
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                Total Discount Applied
                            </span>
                            <span className="text-xs font-bold text-red-600">
                                - ₹{previousTotalDiscount.toLocaleString("en-IN")}
                            </span>
                        </div>

                        {/* Balance after existing discounts */}
                        <div className="flex justify-between">
                            <span className="text-xs text-gray-500">Balance (after discounts)</span>
                            <span className="text-xs font-bold text-blue-600">
                                ₹{remainingSubtotal.toLocaleString("en-IN")}
                            </span>
                        </div>
                    </div>
                )}

                {/* ── Add new discount button ── */}
                {!showNewDiscount && (
                    <button
                        type="button"
                        onClick={() => setShowNewDiscount(true)}
                        className="w-full py-2.5 rounded-xl border-2 border-dashed border-blue-300 text-blue-600 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center justify-center gap-2"
                    >
                        <span className="text-lg font-bold">+</span>
                        Add Discount
                    </button>
                )}

                {/* ── New discount input ── */}
                {showNewDiscount && (
                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-3 space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                                New Discount
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowNewDiscount(false);
                                    setDiscountValue("");
                                    setDiscountType("amount");
                                }}
                                className="text-xs text-gray-400 hover:text-gray-600"
                            >
                                ✕ Cancel
                            </button>
                        </div>

                        {/* Max allowed info */}
                        <div className="text-[10px] text-blue-600 bg-blue-100 dark:bg-blue-900/20 rounded-lg px-2 py-1">
                            Max allowed: ₹{maxDiscountAmount.toLocaleString("en-IN")}
                            ({MAX_DISCOUNT_PCT}% of ₹{subtotal.toLocaleString("en-IN")} − previous discounts)
                        </div>


                        {/* Toggle ₹ / % */}
                        <div className="flex gap-2">
                            <div className="flex overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => { setDiscountType("amount"); setDiscountValue(""); }}
                                    className={`px-3 py-2 text-sm font-semibold ${discountType === "amount" ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-800 text-gray-500"}`}
                                >₹</button>
                                <button
                                    type="button"
                                    onClick={() => { setDiscountType("percent"); setDiscountValue(""); }}
                                    className={`px-3 py-2 text-sm font-semibold ${discountType === "percent" ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-800 text-gray-500"}`}
                                >%</button>
                            </div>

                            <input
                                type="number"
                                value={discountValue}
                                onChange={(e) => setDiscountValue(e.target.value)}
                                placeholder={
                                    discountType === "percent"
                                        ? `Max ${MAX_DISCOUNT_PCT}%`
                                        : `Max ₹${maxDiscountAmount.toLocaleString("en-IN")}`
                                }
                                className={`flex-1 border rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${isInvalid ? "border-red-400 focus:ring-red-400" : "border-gray-200 dark:border-gray-700 focus:ring-blue-500"}`}
                            />
                        </div>

                        {/* Validation errors */}
                        {percentExceeded && (
                            <p className="text-xs text-red-500">
                                Max {MAX_DISCOUNT_PCT}% = ₹{maxDiscountAmount.toLocaleString("en-IN")}
                            </p>
                        )}
                        {amountExceeded && (
                            <p className="text-xs text-red-500">
                                Max discount ₹{maxDiscountAmount.toLocaleString("en-IN")}
                            </p>
                        )}

                        {/* Live balance preview */}
                        {discountAmt > 0 && !isInvalid && (
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="text-orange-500">This discount:</span>
                                    <span className="font-semibold text-orange-600">- ₹{discountAmt.toLocaleString("en-IN")}</span>
                                </div>
                                <div className={`rounded-xl px-3 py-2 text-sm font-semibold border ${balanceAfterNew > 0 ? "border-red-200 bg-red-50 text-red-600" : "border-green-200 bg-green-50 text-green-600"}`}>
                                    New Balance: ₹{balanceAfterNew.toLocaleString("en-IN")}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {error && <p className="text-xs text-red-500">{error}</p>}

                {/* Submit — only show when new discount input is open */}
                {showNewDiscount && (
                    <button
                        onClick={handleSubmit}
                        disabled={saving || isInvalid || discVal === 0}
                        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium"
                    >
                        {saving ? "Saving..." : "Confirm Discount"}
                    </button>
                )}
            </div>
        </Section>
    );
}

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