"use client";


import React, { useState } from "react";
import { VehicleConfig } from "./AdminOrderForm";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineTruck } from "react-icons/hi2";
import VehicleFormModal from "./VehicleFormModal";

interface Props {
  vehicles: VehicleConfig[];
  onChange: (vehicles: VehicleConfig[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function VehicleListStep({ vehicles, onChange, onNext, onBack }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editingV, setEditingV] = useState<VehicleConfig | null>(null);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const openAdd = () => { setEditingV(null); setShowModal(true); };
  const openEdit = (v: VehicleConfig) => { setEditingV(v); setShowModal(true); };
  const remove = (id: string) => onChange(vehicles.filter((v) => v.id !== id));

  const handleSave = (v: VehicleConfig) => {
    onChange(editingV ? vehicles.map((x) => (x.id === v.id ? v : x)) : [...vehicles, v]);
    setShowModal(false);
    setEditingV(null);
    setError("");
  };

 


  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).replace(/ /g, "-");
  };

  const handleNext = () => {
    if (vehicles.length === 0) { setError("At least one vehicle add "); return; }
    onNext();
  };

  const totalDiscount = vehicles.reduce((s, v) => s + ((v.pricing as any)?.additionalCuts || 0), 0);
  const taxableAmount = vehicles.reduce((s, v) => s + (v.pricing?.subtotal || 0), 0);
  const subTotal = taxableAmount + totalDiscount;
  const totalGst = Math.floor(taxableAmount * 0.18);
  const grandTotal = taxableAmount + totalGst;

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
      <div className="flex items-center justify-end mb-2">




        {vehicles.length > 0 && (
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            <HiOutlinePlus className="h-3.5 w-3.5 stroke-2" />
            Add Vehicle
          </button>
        )}
      </div>

      {vehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
            <HiOutlineTruck className="h-6 w-6 text-gray-400" />
          </span>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">No vehicles added</p>
            <p className="text-xs text-gray-400 mt-0.5">Click "Add Vehicle" to configure the first vehicle</p>
          </div>
          <button onClick={openAdd} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
            <HiOutlinePlus className="h-4 w-4 stroke-2" />
            Add Vehicle
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {vehicles.map((v, idx) => (
            <div key={v.id} className="rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-xs font-bold text-blue-600">V{idx + 1}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{v.vehicleModel} · {v.vehicleType}</p>

                    <p className="text-xs text-gray-400">
                      {v.fromDate && v.toDate
                        ? `${formatDate(v.fromDate)} → ${formatDate(v.toDate)} · ${Math.ceil((new Date(v.toDate).getTime() - new Date(v.fromDate).getTime()) / 86400000)}d`
                        : "Dates not set"}
                      {v.city ? ` · ${v.city}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {v.pricing && (
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                      {formatINR(v.pricing.totalAmount)}
                    </span>
                  )}
                  <button onClick={() => openEdit(v)} className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-all dark:border-gray-700 dark:bg-gray-800">
                    <HiOutlinePencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => remove(v.id)} className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-red-400 hover:bg-red-50 hover:text-red-600 transition-all dark:border-gray-700 dark:bg-gray-800">
                    <HiOutlineTrash className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setExpandedId(expandedId === v.id ? null : v.id)}
                    className="inline-flex items-center justify-center h-8 px-2 rounded-lg border border-gray-200 bg-white text-xs text-gray-500 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-all dark:border-gray-700 dark:bg-gray-800"
                  >
                    {expandedId === v.id ? "Hide" : "Details"}
                  </button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {v.campaignType && <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">{v.campaignType}</span>}

                {v.needPromoter && (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    Promoter · {v.promoterType === "Other" ? v.otherPromoterType : v.promoterType}
                  </span>
                )}
                {v.quantity > 1 && <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">Qty: {v.quantity}</span>}
                {!v.pricing && <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-600">Pricing pending</span>}
               
              </div>
               {expandedId === v.id && v.pricing && (
  <PricingBreakdown vehicle={v} formatINR={formatINR} />
)}
            </div>

            
          ))}



          {vehicles.length > 0 && (
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-900/10 p-4 space-y-1.5">
              <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-2">
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


              <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white border-t border-blue-100 dark:border-blue-900/30 pt-1.5 mt-1">
                <span>Grand Total</span>
                <span>{formatINR(grandTotal)}</span>
              </div>
            </div>
          )}
        </div>
        
      )}

      

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex items-center justify-between pt-2">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
        <button onClick={handleNext} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
          Review Order
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      {showModal && <VehicleFormModal editing={editingV} onSave={handleSave} onClose={() => { setShowModal(false); setEditingV(null); }} />}
    </div>
  );
}


function PricingBreakdown({ vehicle: v, formatINR }: { vehicle: VehicleConfig; formatINR: (n: number) => string }) {
  const p = v.pricing!;
  // const rows: { label: string; amount: number }[] = [
  //   { label: `Rental (${p.totalDays}D × ${formatINR(p.perDayRentalCost)} × Qty ${v.quantity})`, amount: p.rentalCost },
  //   { label: `Driver (${p.totalDays}D × ${formatINR(p.driverCharges)} × Qty ${v.quantity})`, amount: p.driverCost },
  // ];
  const rows: { label: string; amount: number }[] = [
  { label: `Rental (Driver charges included) (${p.totalDays}D × ${formatINR(p.perDayRentalCost)} × Qty ${v.quantity})`, amount: p.rentalCost + p.driverCost },
];
  if (v.needPromoter && p.promoterCost > 0)
    rows.push({ label: `Promoter (${p.totalDays}D × ${formatINR(p.promoterChargePerDay)} × ${v.promoterQuantity} promoter)`, amount: p.promoterCost });
  rows.push({ label: "RTO Charges", amount: p.rtoCost });
  if ((p as any).extraKmCost > 0)
    rows.push({ label: `Extra KM / K (${v.extraKm} × ${formatINR((p as any).dailyKmcharges || 0)})`, amount: (p as any).extraKmCost });
  if ((p as any).extraHourCost > 0)
    rows.push({ label: `Extra Hours / H (${v.extraHours} × ${formatINR(p.additionalHourCharges)})`, amount: (p as any).extraHourCost });

  v.additionalCharges.filter(c => c.label).forEach(c => {
    rows.push({ label: `${c.label}`, amount: c.mode === "+" ? c.amount : -c.amount });
  });

  return (
    <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-3 space-y-1">
      {rows.map((r, i) => (
        <div key={i} className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>{r.label}</span>
          <span className={r.amount < 0 ? "text-red-500" : ""}>{r.amount < 0 ? "-" : ""}{formatINR(Math.abs(r.amount))}</span>
        </div>
      ))}
      {(p as any).additionalCuts > 0 && (
        <div className="flex justify-between text-xs text-red-500 font-medium">
          <span>Total Discount</span>
          <span>-{formatINR((p as any).additionalCuts)}</span>
        </div>
      )}
      <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-200 border-t border-gray-200 dark:border-gray-700 pt-1 mt-1">
        <span>Total (excl. GST)</span>
        <span>{formatINR(p.totalAmount)}</span>
      </div>
    </div>
  );
}