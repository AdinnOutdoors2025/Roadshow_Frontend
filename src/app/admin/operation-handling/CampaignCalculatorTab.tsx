/* eslint-disable */
// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Calendar, Truck, User, Phone, IndianRupee, RefreshCw,
  ArrowRightLeft, LogOut, ChevronLeft, ChevronRight, Gauge,
  Clock, ReceiptText, AlertTriangle, LayoutGrid, ListChecks,
  FileCheck2, MinusCircle,
} from "lucide-react";
import { getToken } from "../../utils/auth";
import API_BASE from "../../../../baseurl";

interface Order {
  _id: string;
  orderId: string;
}

const fmt = (n?: number | null) =>
  n != null ? `₹ ${Number(n).toLocaleString("en-IN")}` : "₹ 0";

const fmtDateLabel = (dateKey: string) =>
  new Date(dateKey + "T00:00:00.000Z").toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", weekday: "short",
  });

const SECTIONS = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "daily", label: "Daily Timeline", icon: Calendar },
  { key: "vehicles", label: "Vehicle Breakdown", icon: Truck },
  { key: "billing", label: "Final Billing", icon: FileCheck2 },
];

export default function CampaignCalculatorTab({ order }: { order: Order }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [section, setSection] = useState("overview");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const fetchCalculator = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE}admin/pipeline/${order._id}/campaign-calculator`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      const payload = res.data?.data;
      setData(payload);
      const days = payload?.days || [];
      const lastActive = [...days].reverse().find((d: any) => d.dayTotal > 0);
      setSelectedDate((lastActive || days[days.length - 1])?.date || null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load campaign calculator");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalculator();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order._id]);

  const dayIndex = useMemo(() => {
    if (!data) return -1;
    return data.days.findIndex((d: any) => d.date === selectedDate);
  }, [data, selectedDate]);

  const selectedDay = dayIndex >= 0 ? data.days[dayIndex] : null;

  const goPrevDay = () => {
    if (!data || dayIndex <= 0) return;
    setSelectedDate(data.days[dayIndex - 1].date);
  };
  const goNextDay = () => {
    if (!data || dayIndex < 0 || dayIndex >= data.days.length - 1) return;
    setSelectedDate(data.days[dayIndex + 1].date);
  };

  // Per-vehicle-type totals rolled up across every campaign day, for the Vehicle Breakdown section.
  const vehicleTotals = useMemo(() => {
    if (!data?.days) return [];
    const map: Record<number, any> = {};
    data.days.forEach((d: any) => {
      d.vehicles.forEach((v: any) => {
        if (!map[v.vehicleIndex]) {
          map[v.vehicleIndex] = {
            vehicleIndex: v.vehicleIndex,
            vehicleType: v.vehicleType,
            vehicleModel: v.vehicleModel,
            bookedQuantity: v.bookedQuantity,
            daysActive: 0,
            rentalTotal: 0,
            extraKmTotal: 0,
            extraHourTotal: 0,
            rtoTotal: 0,
            promoterTotal: 0,
            compensationTotal: 0,
            grandTotal: 0,
          };
        }
        const m = map[v.vehicleIndex];
        if (v.activeCount > 0) m.daysActive += 1;
        m.rentalTotal += v.dailyVehicleAmount || 0;
        m.extraKmTotal += v.extraKmCost || 0;
        m.extraHourTotal += v.extraHourCost || 0;
        m.rtoTotal += v.rtoAppliedToday || 0;
        m.promoterTotal += v.promoterAmountToday || 0;
        m.compensationTotal += v.compensationToday || 0;
        m.grandTotal += v.itemDayTotal || 0;
      });
    });
    return Object.values(map).sort((a: any, b: any) => a.vehicleIndex - b.vehicleIndex);
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-6">
        <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
        <p className="text-sm text-gray-500">Could not load the campaign calculator for this order.</p>
        <button
          onClick={fetchCalculator}
          className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold"
        >
          <RefreshCw size={12} /> Retry
        </button>
      </div>
    );
  }

  const fb = data.finalBilling || {};
  const totalVehiclesToday = selectedDay
    ? selectedDay.vehicles.reduce((s: number, v: any) => s + v.activeCount, 0)
    : 0;

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Section tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-gray-100 dark:border-gray-800">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.key}
              onClick={() => setSection(s.key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all -mb-px whitespace-nowrap ${
                section === s.key
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon size={13} /> {s.label}
            </button>
          );
        })}
      </div>

      {/* ── Overview ── */}
      {section === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={Calendar} label="Campaign Window" value={`${fmtDateLabel(data.campaignStart)} → ${fmtDateLabel(data.campaignEnd)}`} small />
            <SummaryCard icon={IndianRupee} label="Grand Total (actual)" value={fmt(data.grandTotal)} />
            <SummaryCard icon={ReceiptText} label="Estimated (Order Creation)" value={fmt(data.orderTaxableAmount)} />
            <SummaryCard
              icon={Gauge}
              label="Reconciliation"
              value={data.reconciliationDiff === 0 ? "Matched ✓" : fmt(data.reconciliationDiff)}
              tone={data.reconciliationDiff === 0 ? "good" : "warn"}
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={MinusCircle} label="Compensation Deducted" value={fmt(fb.totalCompensation)} tone={fb.totalCompensation > 0 ? "warn" : undefined} />
            <SummaryCard icon={ReceiptText} label={`GST (${fb.gstPercent ?? 0}%)`} value={fmt(fb.gstAmount)} />
            <SummaryCard icon={IndianRupee} label="Final Invoice Amount" value={fmt(fb.finalInvoiceAmount)} tone="good" />
            <SummaryCard icon={Truck} label="Vehicle Types" value={String(vehicleTotals.length)} small />
          </div>

          <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Estimated (Order Creation) vs Actual (Campaign Calculator)</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Actual amounts only appear after Operations logs them in the On-Road tab. Differences are expected until every day's activity is logged.
              </p>
            </div>
            <div className="flex items-center justify-between px-4 pt-2 text-[10px] font-bold text-gray-400 uppercase tracking-wide">
              <span></span>
              <div className="flex items-center gap-4">
                <span className="w-24 text-right">Estimated</span>
                <span className="w-24 text-right">Actual</span>
                <span className="w-24 text-right">Diff</span>
              </div>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              <CompareRow label="Rental + Driver" estimated={fb.estimatedRental} actual={fb.actualRental} />
              <CompareRow label="RTO Charges" estimated={fb.estimatedRto} actual={fb.actualRto} />
              <CompareRow label="Promoter Charges" estimated={fb.estimatedPromoter} actual={fb.actualPromoter} />
              <CompareRow label="Extra KM" estimated={fb.estimatedExtraKm} actual={fb.actualExtraKm} />
              <CompareRow label="Extra Hours" estimated={fb.estimatedExtraHours} actual={fb.actualExtraHours} />
              <CompareRow label="Total (before GST)" estimated={data.orderTaxableAmount} actual={data.grandTotal} bold />
            </div>
          </div>
        </div>
      )}

      {/* ── Daily Timeline ── */}
      {section === "daily" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Select a Campaign Day</p>
              <div className="flex items-center gap-1">
                <button onClick={goPrevDay} disabled={dayIndex <= 0}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-30">
                  <ChevronLeft size={14} />
                </button>
                <button onClick={goNextDay} disabled={dayIndex < 0 || dayIndex >= data.days.length - 1}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-30">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {data.days.map((d: any) => {
                const active = d.date === selectedDate;
                return (
                  <button
                    key={d.date}
                    onClick={() => setSelectedDate(d.date)}
                    className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-lg border text-xs transition-all ${
                      active
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span className="font-semibold">
                      {new Date(d.date + "T00:00:00.000Z").toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </span>
                    <span className={`mt-0.5 ${active ? "text-blue-100" : "text-gray-400"}`}>{fmt(d.dayTotal)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedDay && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <SummaryCard icon={Truck} label="Active Vehicles" value={String(totalVehiclesToday)} />
                <SummaryCard icon={IndianRupee} label="Day Total" value={fmt(selectedDay.dayTotal)} />
                <SummaryCard icon={ReceiptText} label="Cumulative up to this day" value={fmt(selectedDay.cumulativeTotal)} />
              </div>

              <div className="space-y-3">
                {selectedDay.vehicles.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-8">
                    No vehicle type is within its campaign window on {fmtDateLabel(selectedDay.date)}.
                  </p>
                )}

                {selectedDay.vehicles.map((v: any) => (
                  <div key={v.vehicleIndex} className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2 min-w-0">
                        <Truck size={14} className="text-teal-600 flex-shrink-0" />
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                          {v.vehicleType} {v.vehicleModel ? `· ${v.vehicleModel}` : ""}
                        </span>
                        <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300 font-semibold flex-shrink-0">
                          {v.activeCount}/{v.bookedQuantity} active
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white flex-shrink-0">{fmt(v.itemDayTotal)}</span>
                    </div>

                    <div className="p-3 space-y-2">
                      {v.entries.length === 0 && (
                        <p className="text-xs text-gray-400 italic px-1">No driver/vehicle assigned yet for this slot.</p>
                      )}

                      {v.entries.map((e: any) => (
                        <div
                          key={e.entryId}
                          className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-xs flex-wrap ${
                            e.isReplacement
                              ? "border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800/50"
                              : "border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/30"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-wrap">
                            <span className="flex items-center gap-1 font-mono font-semibold text-gray-700 dark:text-gray-300">
                              <Truck size={11} /> {e.vehicleRegistrationNumber || "—"}
                            </span>
                            <span className="flex items-center gap-1 text-gray-500">
                              <User size={11} /> {e.driverName || "—"}
                            </span>
                            <span className="hidden sm:flex items-center gap-1 text-gray-400">
                              <Phone size={11} /> {e.driverPhone || "—"}
                            </span>
                            {e.runningHours != null && (
                              <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold">
                                <Clock size={11} /> {e.runningHours}h run
                                {e.absentHours > 0 && <span className="text-amber-600">· {e.absentHours}h absent</span>}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {e.isReplacement && (
                              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 font-semibold">
                                <ArrowRightLeft size={10} /> Replacement
                              </span>
                            )}
                            {e.createdOnThisDay && (
                              <span className="px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 font-semibold">
                                Assigned Today
                              </span>
                            )}
                            {e.compensationDeduction > 0 && (
                              <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 font-semibold">
                                -{fmt(e.compensationDeduction)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}

                      {v.releasedToday?.length > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800/40 text-xs text-rose-700 dark:text-rose-300">
                          <LogOut size={11} />
                          Released today: {v.releasedToday.join(", ")}
                        </div>
                      )}

                      <div className="pt-2 mt-1 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
                        <CostLine label="Base (rental+driver)" value={v.dailyVehicleAmount} />
                        {v.rtoAppliedToday > 0 && <CostLine label="RTO (one-time)" value={v.rtoAppliedToday} />}
                        {v.promoterAmountToday > 0 && <CostLine label="Promoter (daily share)" value={v.promoterAmountToday} />}
                        {(v.extraKmPoolFeeToday > 0 || v.extraHourPoolFeeToday > 0) && (
                          <CostLine label="Extra KM/Hours Pool (one-time)" value={v.extraKmPoolFeeToday + v.extraHourPoolFeeToday} />
                        )}
                        {(v.extraKmCost - v.extraKmPoolFeeToday > 0 || v.extraHourCost - v.extraHourPoolFeeToday > 0) && (
                          <CostLine label="Extra KM/Hours Overage" value={(v.extraKmCost - v.extraKmPoolFeeToday) + (v.extraHourCost - v.extraHourPoolFeeToday)} />
                        )}
                        {v.compensationToday > 0 && <CostLine label="Compensation" value={-v.compensationToday} negative />}
                      </div>

                      {v.extraDetailsToday?.length > 0 && (
                        <div className="mt-1 space-y-1">
                          {v.extraDetailsToday.map((ex: any, i: number) => (
                            <div key={i} className="flex items-center gap-1.5 text-[11px] text-gray-500">
                              <Clock size={10} />
                              {ex.registrationNumber}: {ex.extraKm} km / {ex.extraHours} hrs logged for {ex.loggedFor} →{" "}
                              {ex.withinPurchasedBalance ? (
                                <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 font-semibold">Within purchased balance</span>
                              ) : (
                                <span className="font-semibold text-gray-700 dark:text-gray-300">{fmt(ex.extraKmCost + ex.extraHourCost)} additional</span>
                              )}{" "}
                              ({ex.addedBy})
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Vehicle Breakdown ── */}
      {section === "vehicles" && (
        <div className="space-y-3">
          {vehicleTotals.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No vehicle data for this campaign.</p>
          ) : (
            vehicleTotals.map((v: any) => (
              <div key={v.vehicleIndex} className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2 min-w-0">
                    <Truck size={14} className="text-teal-600 flex-shrink-0" />
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                      {v.vehicleType} {v.vehicleModel ? `· ${v.vehicleModel}` : ""}
                    </span>
                    <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300 font-semibold flex-shrink-0">
                      {v.daysActive} active day{v.daysActive !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white flex-shrink-0">{fmt(v.grandTotal)}</span>
                </div>
                <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <CostLine label="Rental Total" value={v.rentalTotal} />
                  <CostLine label="RTO Total" value={v.rtoTotal} />
                  <CostLine label="Promoter Total" value={v.promoterTotal} />
                  <CostLine label="Extra KM Total" value={v.extraKmTotal} />
                  <CostLine label="Extra Hours Total" value={v.extraHourTotal} />
                  {v.compensationTotal > 0 && <CostLine label="Compensation" value={-v.compensationTotal} negative />}
                </div>
                {(() => {
                  const bal = (data.extraKmBalances || []).find((b: any) => b.vehicleIndex === v.vehicleIndex);
                  if (!bal || (bal.purchasedKm === 0 && bal.purchasedHours === 0)) return null;
                  return (
                    <div className="px-3 pb-3">
                      <div className="rounded-lg bg-fuchsia-50 dark:bg-fuchsia-900/10 border border-fuchsia-100 dark:border-fuchsia-800/40 px-3 py-2 text-[11px] flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="text-fuchsia-700 dark:text-fuchsia-300 font-semibold">Extra KM/Hours Pool</span>
                        <span>Purchased: {bal.purchasedKm} km · {bal.purchasedHours} hrs</span>
                        <span>Used: {bal.usedKm} km · {bal.usedHours} hrs</span>
                        <span>Remaining: {bal.remainingKm} km · {bal.remainingHours} hrs</span>
                        {(bal.overageKm > 0 || bal.overageHours > 0) && (
                          <span className="text-rose-600 dark:text-rose-400 font-semibold">
                            Overage: {bal.overageKm} km · {bal.overageHours} hrs → {fmt(bal.overageKmCost + bal.overageHourCost)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Final Billing ── */}
      {section === "billing" && (
        <div className="max-w-md rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <ListChecks size={15} className="text-blue-500" /> Campaign Summary
            </p>
          </div>
          <div className="p-4 space-y-1 text-sm">
            <BillingLine label="Estimated Amount" value={fb.estimatedAmount} />
            <BillingLine label="Actual Rental" value={fb.actualRental} />
            <BillingLine label="Extra KM" value={fb.actualExtraKm} />
            <BillingLine label="Extra Hours" value={fb.actualExtraHours} />
            <BillingLine label="RTO Charges" value={fb.actualRto} />
            <BillingLine label="Promoter Charges" value={fb.actualPromoter} />
            <BillingLine label="Compensation / Deductions" value={fb.totalCompensation} negative={fb.totalCompensation > 0} />
            <BillingLine label="Campaign Extensions" value={fb.campaignExtensionAmount} />
            <div className="border-t border-gray-100 dark:border-gray-800 my-2" />
            <BillingLine label="Final Amount Before GST" value={fb.finalAmountBeforeGst} bold />
            <BillingLine label={`GST (${fb.gstPercent ?? 0}%)`} value={fb.gstAmount} />
            <div className="border-t border-gray-100 dark:border-gray-800 my-2" />
            <div className="flex items-center justify-between pt-1">
              <span className="text-sm font-bold text-gray-900 dark:text-white">Final Invoice Amount</span>
              <span className="text-base font-bold text-green-600 dark:text-green-400">{fmt(fb.finalInvoiceAmount)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, small = false, tone }: any) {
  const toneClass =
    tone === "good"
      ? "text-green-600 dark:text-green-400"
      : tone === "warn"
      ? "text-amber-600 dark:text-amber-400"
      : "text-gray-900 dark:text-white";
  return (
    <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-3">
      <div className="flex items-center gap-1.5 text-gray-400 mb-1">
        <Icon size={12} />
        <span className="text-[10px] font-bold uppercase tracking-wide">{label}</span>
      </div>
      <p className={`${small ? "text-xs" : "text-sm"} font-bold ${toneClass} truncate`}>{value}</p>
    </div>
  );
}

function CostLine({ label, value, negative = false }: { label: string; value: number; negative?: boolean }) {
  return (
    <div className="flex items-center justify-between px-2 py-1 rounded-md bg-gray-50 dark:bg-gray-800/40">
      <span className="text-gray-400">{label}</span>
      <span className={`font-semibold ${negative ? "text-rose-600 dark:text-rose-400" : "text-gray-700 dark:text-gray-300"}`}>{fmt(value)}</span>
    </div>
  );
}

function CompareRow({ label, estimated, actual, bold = false }: { label: string; estimated: number; actual: number; bold?: boolean }) {
  const diff = Math.round(((actual || 0) - (estimated || 0)) * 100) / 100;
  return (
    <div className={`flex items-center justify-between px-4 py-2 text-xs ${bold ? "bg-gray-50 dark:bg-gray-800/40" : ""}`}>
      <span className={`text-gray-500 dark:text-gray-400 ${bold ? "font-bold" : ""}`}>{label}</span>
      <div className="flex items-center gap-4">
        <span className="text-gray-400 w-24 text-right">{fmt(estimated)}</span>
        <span className={`w-24 text-right ${bold ? "font-bold text-gray-900 dark:text-white" : "font-semibold text-gray-700 dark:text-gray-300"}`}>{fmt(actual)}</span>
        <span className={`w-24 text-right font-semibold ${diff === 0 ? "text-gray-300" : diff < 0 ? "text-amber-600" : "text-emerald-600"}`}>
          {diff === 0 ? "—" : `${diff > 0 ? "+" : ""}${fmt(diff)}`}
        </span>
      </div>
    </div>
  );
}

function BillingLine({ label, value, bold = false, negative = false }: any) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className={`text-gray-500 dark:text-gray-400 ${bold ? "font-semibold" : ""}`}>{label}</span>
      <span className={`${bold ? "font-bold text-gray-900 dark:text-white" : "font-semibold"} ${negative ? "text-rose-600 dark:text-rose-400" : "text-gray-700 dark:text-gray-300"}`}>
        {negative ? "− " : ""}{fmt(value)}
      </span>
    </div>
  );
}
