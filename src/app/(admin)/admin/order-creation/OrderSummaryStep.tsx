


"use client";

import React from "react";
import { OrderState } from "./AdminOrderForm";

interface Props {
  order: OrderState;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
}

export default function OrderSummaryStep({ order, onBack, onSubmit, loading }: Props) {
  const { customerSelection, vehicles } = order;
  const customer = customerSelection.customer;

  const totalDiscount = vehicles.reduce((s, v) => s + ((v.pricing as any)?.additionalCuts || 0), 0);
  const taxableAmount = vehicles.reduce((s, v) => s + (v.pricing?.subtotal || 0), 0);
  const subTotal = taxableAmount + totalDiscount;
  const totalGst = Math.floor(taxableAmount * 0.18);
  const grandTotal = taxableAmount + totalGst;

  const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800 dark:text-gray-200 text-right max-w-[60%]">{value}</span>
    </div>
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).replace(/ /g, "-");
  };

  const formatINR = (value: string | number) => {
    const num = parseFloat(String(value).replace(/[^0-9.]/g, ""));
    if (isNaN(num) || value === "" || value === undefined) return "";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Helper function to display vehicle count in a user-friendly way
  const getVehicleCountDisplay = (count: number) => {
    if (count === 1) return "1 Vehicle";
    return `${count} Vehicles`;
  };

  return (
    <div className="space-y-5">
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Order Summary</h3>
        <p className="text-xs text-gray-400 mt-0.5">Confirm before creating order</p>
      </div>

  
      <div className="rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
          Customer ·{" "}
          <span className={customerSelection.type === "new" ? "text-green-500" : "text-blue-500"}>
            {customerSelection.type === "new" ? "New" : "Existing"}
          </span>
        </p>
        <div className="space-y-1.5">
          <Row label="Name" value={customer?.name} />
          <Row label="Phone" value={customer?.phone} />
          <Row label="Email" value={order.customerForm?.email || "—"} />
          <Row label="Address" value={customer?.address || "—"} />
        </div>
      </div>

      {/* Vehicles Section */}
      {order.vehicles.map((v, idx) => {
        const p = v.pricing;
        const totalVehicleCount = v.quantity;
        
        return (
          <div key={v.id} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            {/* Header with Vehicle Count Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-xs font-bold text-blue-600">
                  {idx + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {v.vehicleModel} · {v.vehicleType}
                  </p>
                  <p className="text-xs text-gray-400">
                    {v.city} · {v.fromDate} → {v.toDate}
                  </p>
                </div>
              </div>
              
            
              <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                  {totalVehicleCount}
                </span>
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  {totalVehicleCount === 1 ? "Vehicle" : "Vehicles"}
                </span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="space-y-1.5 bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg">
              {[
                ["Booking For", v.bookingFor],
                ["Campaign", v.campaignType === "Other" ? v.otherCampaignType : v.campaignType],
                ["Duration", v.fromDate && v.toDate
                  ? `${new Date(v.fromDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} → ${new Date(v.toDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} (${Math.ceil((new Date(v.toDate).getTime() - new Date(v.fromDate).getTime()) / 86400000)}D base${v.extraDays > 0 ? ` +${v.extraDays} D = ${Math.ceil((new Date(v.toDate).getTime() - new Date(v.fromDate).getTime()) / 86400000) + v.extraDays}D total` : ""})`
                  : "—"],
                ["Driving route", `${v.fromLocation} → ${v.toLocation}`],
                ["State / City", `${v.state} / ${v.city}`],
                ["Vehicle Count", `${totalVehicleCount} ${totalVehicleCount === 1 ? "Vehicle" : "Vehicles"} ✕ ${v.vehicleModel}`],
                v.extraKm > 0 ? ["Extra KM", `${v.extraKm} km`] : null,
                v.extraHours > 0 ? ["Extra Hours", `${v.extraHours} hours`] : null,
                v.needPromoter ? ["Promoter", `${v.promoterType === "Other" ? v.otherPromoterType : v.promoterType} · ${v.promoterGender} · ${v.promoterLanguage} · Qty ${v.promoterQuantity}`] : null,
                v.gstNumber ? ["GST", v.gstNumber] : null,
              ].filter(Boolean).map(([label, value], i) => (
                <div key={i} className="flex justify-between text-sm gap-4">
                  <span className="text-gray-500 shrink-0">{label}</span>
                  <span className="text-gray-800 dark:text-gray-200 font-medium text-right">{value}</span>
                </div>
              ))}
            </div>

            {/* Pricing Breakdown */}
            {p && (
              <div className="border-t border-gray-100 dark:border-gray-700 pt-3 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Pricing Breakdown</p>
                {[
                  { label: `Rental (Driver charges included) (${p.totalDays}D × ${formatINR(p.perDayRentalCost)} × ${totalVehicleCount} ${totalVehicleCount === 1 ? "Vehicle" : "Vehicles"})`, val: p.rentalCost },
                  v.needPromoter && p.promoterCost > 0 ? { label: `Promoter (${p.totalDays}D × ${formatINR(p.promoterChargePerDay)} × ${v.promoterQuantity})`, val: p.promoterCost } : null,
                  { label: "RTO Charges", val: p.rtoCost },
                  (p as any).extraKmCost > 0 ? { label: `Extra KM (${v.extraKm} × ₹${(p as any).dailyKmcharges || ""})`, val: (p as any).extraKmCost } : null,
                  (p as any).extraHourCost > 0 ? { label: `Extra Hours (${v.extraHours} × ${formatINR(p.additionalHourCharges)})`, val: (p as any).extraHourCost } : null,
                ].filter(Boolean).map((row: any, i) => (
                  <div key={i} className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{row.label}</span>
                    <span>{formatINR(row.val)}</span>
                  </div>
                ))}

                {v.additionalCharges.filter(c => c.label).map(c => (
                  <div key={c.id} className="flex justify-between text-sm">
                    <span className={c.mode === "-" ? "text-red-400" : "text-gray-600"}>{c.label}</span>
                    <span className={c.mode === "-" ? "text-red-500" : "text-gray-600"}>
                      {c.mode === "-" ? "-" : "+"}{formatINR(c.amount)}
                    </span>
                  </div>
                ))}

                <div className="flex justify-between text-sm font-semibold text-gray-700 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700 pt-1">
                  <span>Subtotal</span>
                  <span>{formatINR(p.subtotal)}</span>
                </div>
                {(p as any).additionalCuts > 0 && (
                  <div className="flex justify-between text-xs text-red-500">
                    <span>Discount</span>
                    <span>-{formatINR((p as any).additionalCuts)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-gray-800 dark:text-gray-100">
                  <span>Total (excl. GST)</span>
                  <span>{formatINR(p.totalAmount)}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Order Total Section */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-900/10 p-4 space-y-1.5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
            Order Total
          </p>
          <div className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
            <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
              {vehicles.reduce((sum, v) => sum + v.quantity, 0)}
            </span>
            <span className="text-xs text-blue-600 dark:text-blue-400">
              {vehicles.reduce((sum, v) => sum + v.quantity, 0) === 1 ? "Vehicle" : "Vehicles Total"}
            </span>
          </div>
        </div>

        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
          <span>Subtotal (excl. GST)</span>
          <span>{formatINR(subTotal)}</span>
        </div>

        {totalDiscount > 0 && (
          <>
            <div className="flex justify-between text-sm text-red-500">
              <span>Discount</span>
              <span>-{formatINR(totalDiscount)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
              <span>Taxable Amount</span>
              <span>{formatINR(taxableAmount)}</span>
            </div>
          </>
        )}

        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
          <span>GST (18%)</span>
          <span>{formatINR(totalGst)}</span>
        </div>

        <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white border-t border-blue-200 dark:border-blue-900/40 pt-2 mt-1">
          <span>Grand Total</span>
          <span>{formatINR(grandTotal)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button 
          onClick={onBack} 
          disabled={loading} 
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 disabled:opacity-60"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <button 
          onClick={onSubmit} 
          disabled={loading} 
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          {loading && (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          )}
          Confirm & Create Order
        </button>
      </div>
    </div>
  );
}