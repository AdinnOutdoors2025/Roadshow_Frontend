


"use client";

import React, { useState } from "react";
import { OrderState } from "./AdminOrderForm";

interface Props {
  order: OrderState;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
  getVehicleTypeName?:any
  editingOrder?:any
}

export default function OrderSummaryStep({ order, onBack, onSubmit, loading ,getVehicleTypeName,editingOrder }: Props) {
  const { customerSelection, vehicles } = order;
  const customer = customerSelection.customer;
  const [activeVehicleIndex, setActiveVehicleIndex] = useState(0);

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

  const formatINR = (value: string | number) => {
    const num = parseFloat(String(value).replace(/[^0-9.]/g, ""));
    if (isNaN(num) || value === "" || value === undefined) return "";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const goPrev = () => setActiveVehicleIndex((i) => Math.max(0, i - 1));
  const goNext = () => setActiveVehicleIndex((i) => Math.min(vehicles.length - 1, i + 1));

  const v = vehicles[activeVehicleIndex];
  const p = v?.pricing;
  const totalVehicleCount = v?.quantity;

  return (
    <div className="space-y-5">
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Order Summary</h3>
        <p className="text-xs text-gray-400 mt-0.5">Confirm before creating order</p>
      </div>

      {/* Customer Card */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 p-4">
        <div className="space-y-1.5">
          <Row label="Name" value={customer?.name || "—"} />
          <Row label="Phone" value={`+91 ${customer?.phone || ""}`} />
          <Row label="Email" value={customer?.email || "—"} />


          {order.customerForm?.companyName && (
            <Row label="Company Name" value={order.customerForm.companyName} />
          )}

          {order.customerForm?.designation && (
            <Row label="Designation" value={order.customerForm.designation} />
          )}

          {order.customerForm?.gstNumber && (
            <Row label="GST Number" value={order.customerForm.gstNumber} />
          )}
          <Row label="Address" value={customer?.address || "—"} />
        </div>
      </div>

      {/* Vehicle Tabs */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-2">
          <button
            onClick={goPrev}
            disabled={activeVehicleIndex === 0}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex gap-5 overflow-x-auto scrollbar-hide flex-1 px-1">
            {vehicles.map((vh, idx) => (
              <button
                key={vh.id}
                onClick={() => setActiveVehicleIndex(idx)}
                className={`relative whitespace-nowrap py-2.5 text-sm font-semibold transition-colors ${activeVehicleIndex === idx
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                  }`}
              >
                {idx + 1} Vehicle
                {activeVehicleIndex === idx && (
                  <span className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-blue-600 rounded-full" />
                )}
              </button>
            ))}
          </div>

          <button
            onClick={goNext}
            disabled={activeVehicleIndex === vehicles.length - 1}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Active Vehicle Content */}
        {v && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-xs font-bold text-blue-600">
                  {activeVehicleIndex + 1}
                </span>
                <div>
                  {/* <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {v.vehicleModel} · {v.vehicleType}
                  </p> */}

                    {editingOrder ? (
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200"> {getVehicleTypeName(v.vehicleType)}</p>
                    ) :(<p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{v.vehicleModel} · {v.vehicleType}</p>)}


                  <p className="text-xs text-gray-400">
                    {v.city} · {v.fromDate} → {v.toDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span className="text-sm font-bold text-blue-700 dark:text-blue-300">{totalVehicleCount}</span>
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  {totalVehicleCount === 1 ? "Vehicle" : "Vehicles"}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg">
              {(
                [
                  ["Booking For", order.customerCategory],
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
                ] as ([string, string] | null)[]
              )
                .filter((item): item is [string, string] => item !== null)
                .map(([label, value], i) => (
                  <div key={i} className="flex justify-between text-sm gap-4">
                    <span className="text-gray-500 shrink-0">{label}</span>
                    <span className="text-gray-800 dark:text-gray-200 font-medium text-right">{value}</span>
                  </div>
                ))}
            </div>

            {p && (
              <div className="border-t border-gray-100 dark:border-gray-700 pt-3 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Pricing Breakdown</p>
                {[
                  { label: `Rental (${p.totalDays}D × ${formatINR(p.perDayRentalCost)} × ${totalVehicleCount} ${totalVehicleCount === 1 ? "Vehicle" : "Vehicles"})`, val: p.rentalCost },
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

                {v.additionalCharges.filter((c) => c.label).map((c) => (
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
        )}
      </div>

      {/* Order Total Section */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-900/10 p-4 space-y-1.5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">Order Total</p>
          <div className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
            <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
              {vehicles.reduce((sum, vh) => sum + vh.quantity, 0)}
            </span>
            <span className="text-xs text-blue-600 dark:text-blue-400">
              {vehicles.reduce((sum, vh) => sum + vh.quantity, 0) === 1 ? "Vehicle" : "Vehicles Total"}
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