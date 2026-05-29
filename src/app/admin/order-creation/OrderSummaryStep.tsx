

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



  const totalDiscount  = vehicles.reduce((s, v) => s + ((v.pricing as any)?.additionalCuts || 0), 0);
const taxableAmount  = vehicles.reduce((s, v) => s + (v.pricing?.subtotal || 0), 0);
const subTotal       = taxableAmount + totalDiscount;
const totalGst       = Math.floor(taxableAmount * 0.18);
const grandTotal     = taxableAmount + totalGst;

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
          <Row label="Address" value={customer?.address || "—"} />
      
        </div>
      </div>

   
      {vehicles.map((v, idx) => {
        const p = v.pricing;
        const baseDays = v.fromDate && v.toDate
          ? Math.ceil((new Date(v.toDate).getTime() - new Date(v.fromDate).getTime()) / 86400000)
          : 0;
        const totalDays = baseDays + (v.extraDays || 0);

        return (
          <div key={v.id} className="rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/30 text-xs font-bold text-blue-600">V{idx + 1}</span>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{v.vehicleModel} · {v.vehicleType}</p>
            </div>
            <div className="space-y-1.5">
              <Row label="Booking For" value={v.bookingFor} />
              <Row label="Campaign" value={v.campaignType === "Other" ? v.otherCampaignType : v.campaignType} />
              <Row label="Duration" value={`${formatDate(v.fromDate)} → ${formatDate(v.toDate)} (${baseDays}D ${v.extraDays ? ` +${v.extraDays} D extra = ${totalDays}D total` : ""})`} />
              <Row label="State / City" value={`${v.state} / ${v.city}`} />
              <Row label="Route" value={`${v.fromLocation} → ${v.toLocation}`} />
              <Row label="Quantity" value={v.quantity} />
              {v.extraKm > 0 && <Row label="Extra KM" value={v.extraKm} />}
              <Row label="Promoter" value={v.needPromoter ? (v.promoterType === "Other" ? v.otherPromoterType : v.promoterType) : "No"} />

            </div>

         
            {v.additionalCharges.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-1">
                <p className="text-[10px] font-semibold uppercase text-gray-400 mb-1">Additional Charges</p>
                {v.additionalCharges.map((c) => (
                  <div key={c.id} className="flex justify-between text-sm">
                    <span className="text-gray-500">{c.label || "Unnamed"}</span>
                    <span className={c.mode === "+" ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
                    {c.mode}{formatINR(c.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}



            {p && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-1">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                  <span>Subtotal</span>
                   <span>{formatINR(p.subtotal)}</span>
                </div>
                {(p as any).additionalCuts > 0 && (
                  <div className="flex justify-between text-sm text-red-500">
                    <span>Discount</span>
                    <span>-{formatINR((p as any).additionalCuts)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-gray-900 dark:text-white">
                  <span>Total (excl. GST)</span>
                  <span>{formatINR(p.totalAmount)}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}



      <div className="rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-900/10 p-4 space-y-1.5">
  <p className="text-xs font-semibold uppercase tracking-wide text-blue-500 mb-2">
    Order Total ({vehicles.length} vehicle{vehicles.length > 1 ? "s" : ""})
  </p>


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

      <div className="flex items-center justify-between pt-2">
        <button onClick={onBack} disabled={loading} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 disabled:opacity-60">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
        <button onClick={onSubmit} disabled={loading} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors">
          {loading && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>}
          Confirm & Create Order
        </button>
      </div>
    </div>
  );
}

