"use client";


import React from "react";
import { OrderState, VehicleConfig } from "./AdminOrderForm";

interface Props {
  order: OrderState;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
}

export default function OrderSummaryStep({ order, onBack, onSubmit, loading }: Props) {
  const { customerSelection, vehicles } = order;
  const customer = customerSelection.customer;

  const grandTotal = vehicles.reduce((s, v) => s + (v.pricing?.totalAmount || 0), 0);
  const totalGst   = vehicles.reduce((s, v) => s + (v.pricing?.gstAmount || 0), 0);
  const subTotal   = vehicles.reduce((s, v) => s + (v.pricing?.subtotal || 0), 0);

  const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800 dark:text-gray-200 text-right max-w-[60%]">{value}</span>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Order Summary</h3>
        <p className="text-xs text-gray-400 mt-0.5">Confirm Before review </p>
      </div>

      {/* Customer */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
          Customer · <span className={`${customerSelection.type === "new" ? "text-green-500" : "text-blue-500"}`}>
            {customerSelection.type === "new" ? "New" : "Existing"}
          </span>
        </p>
        <div className="space-y-1.5">
          <Row label="Name"    value={customer?.name} />
          <Row label="Phone"   value={customer?.phone} />
          <Row label="Address" value={customer?.address || "—"} />
          <Row label="ID"      value={<span className="font-mono text-xs text-gray-400">{customer?._id}</span>} />
        </div>
      </div>

      {/* Vehicles */}
      {vehicles.map((v, idx) => {
        const p = v.pricing;
        const days = v.fromDate && v.toDate
          ? Math.ceil((new Date(v.toDate).getTime() - new Date(v.fromDate).getTime()) / 86400000)
          : 0;
        return (
          <div key={v.id} className="rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/30 text-xs font-bold text-blue-600">V{idx + 1}</span>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{v.vehicleModel} · {v.vehicleType}</p>
            </div>
            <div className="space-y-1.5">
              <Row label="Booking For"  value={v.bookingFor} />
              <Row label="Campaign"     value={v.campaignType === "Other" ? v.otherCampaignType : v.campaignType} />
              <Row label="Duration"     value={`${v.fromDate} → ${v.toDate} (${days}d)`} />
              <Row label="State / City" value={`${v.state} / ${v.city}`} />
              <Row label="Route"        value={`${v.fromLocation} → ${v.toLocation}`} />
              <Row label="Quantity"     value={v.quantity} />
              <Row label="Promoter"     value={v.needPromoter ? (v.promoterType === "Other" ? v.otherPromoterType : v.promoterType) : "No"} />
              <Row label="Images"       value={v.campaignImages.length > 0 ? `${v.campaignImages.length} file(s)` : "None"} />
              <Row label="Videos"       value={v.campaignVideos.length > 0 ? `${v.campaignVideos.length} file(s)` : "None"} />
            </div>
            {p && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-1">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300"><span>Subtotal</span><span>₹{p.subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300"><span>GST (18%)</span><span>₹{p.gstAmount.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm font-bold text-gray-900 dark:text-white"><span>Vehicle Total</span><span>₹{p.totalAmount.toLocaleString()}</span></div>
              </div>
            )}
          </div>
        );
      })}

      {/* Grand Total */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-900/10 p-4 space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-500 mb-2">Order Total</p>
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300"><span>Total Subtotal</span><span>₹{subTotal.toLocaleString()}</span></div>
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300"><span>Total GST</span><span>₹{totalGst.toLocaleString()}</span></div>
        <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white border-t border-blue-200 dark:border-blue-900/40 pt-2 mt-1"><span>Grand Total</span><span>₹{grandTotal.toLocaleString()}</span></div>
      </div>

      {/* Notes */}
      {/* <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
        <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
        <p className="text-xs text-amber-700 dark:text-amber-400">
          Order confirm ஆனபின் GPS tracking link auto-generate ஆகும். Media 24–72 hours-ல் LED compatibility-க்கு review ஆகும். Pipeline status: <strong>newOrder</strong>
        </p>
      </div> */}

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
