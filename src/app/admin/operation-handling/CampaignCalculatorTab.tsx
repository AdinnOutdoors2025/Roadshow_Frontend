/* eslint-disable */
// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Calendar, Truck, User, Phone, IndianRupee, RefreshCw,
  ArrowRightLeft, LogOut, ChevronLeft, ChevronRight, Gauge,
  Clock, Users, ReceiptText, AlertTriangle,
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

export default function CampaignCalculatorTab({ order }: { order: Order }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
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
      // default to the last day that actually has cost activity, else last day
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

  const totalVehiclesToday = selectedDay
    ? selectedDay.vehicles.reduce((s: number, v: any) => s + v.activeCount, 0)
    : 0;

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Header / summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard icon={Calendar} label="Campaign Window" value={`${fmtDateLabel(data.campaignStart)} → ${fmtDateLabel(data.campaignEnd)}`} small />
        <SummaryCard icon={IndianRupee} label="Grand Total (computed)" value={fmt(data.grandTotal)} />
        <SummaryCard icon={ReceiptText} label="Order Taxable Amount" value={fmt(data.orderTaxableAmount)} />
        <SummaryCard
          icon={Gauge}
          label="Reconciliation"
          value={data.reconciliationDiff === 0 ? "Matched ✓" : fmt(data.reconciliationDiff)}
          tone={data.reconciliationDiff === 0 ? "good" : "warn"}
        />
      </div>

      {/* Day picker strip */}
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
          {/* Selected day summary */}
          <div className="grid grid-cols-3 gap-3">
            <SummaryCard icon={Truck} label="Active Vehicles" value={String(totalVehiclesToday)} />
            <SummaryCard icon={IndianRupee} label="Day Total" value={fmt(selectedDay.dayTotal)} />
            <SummaryCard icon={ReceiptText} label="Cumulative up to this day" value={fmt(selectedDay.cumulativeTotal)} />
          </div>

          {/* Vehicle-wise breakdown */}
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
                      className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-xs ${
                        e.isReplacement
                          ? "border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800/50"
                          : "border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/30"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex items-center gap-1 font-mono font-semibold text-gray-700 dark:text-gray-300">
                          <Truck size={11} /> {e.vehicleRegistrationNumber || "—"}
                        </span>
                        <span className="flex items-center gap-1 text-gray-500">
                          <User size={11} /> {e.driverName || "—"}
                        </span>
                        <span className="hidden sm:flex items-center gap-1 text-gray-400">
                          <Phone size={11} /> {e.driverPhone || "—"}
                        </span>
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
                      </div>
                    </div>
                  ))}

                  {v.releasedToday?.length > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800/40 text-xs text-rose-700 dark:text-rose-300">
                      <LogOut size={11} />
                      Released today: {v.releasedToday.join(", ")}
                    </div>
                  )}

                  {/* cost lines */}
                  <div className="pt-2 mt-1 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <CostLine label="Base (rental+driver)" value={v.dailyVehicleAmount} />
                    {v.rtoAppliedToday > 0 && <CostLine label="RTO (one-time)" value={v.rtoAppliedToday} />}
                    {v.promoterAmountToday > 0 && <CostLine label="Promoter (daily share)" value={v.promoterAmountToday} />}
                    {(v.extraKmCost > 0 || v.extraHourCost > 0) && (
                      <CostLine label="Extra KM/Hours" value={v.extraKmCost + v.extraHourCost} />
                    )}
                  </div>

                  {v.extraDetailsToday?.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {v.extraDetailsToday.map((ex: any, i: number) => (
                        <div key={i} className="flex items-center gap-1.5 text-[11px] text-gray-500">
                          <Clock size={10} />
                          {ex.registrationNumber}: {ex.extraKm} km / {ex.extraHours} hrs logged for {ex.loggedFor} → {fmt(ex.extraKmCost + ex.extraHourCost)} ({ex.addedBy})
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

function CostLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between px-2 py-1 rounded-md bg-gray-50 dark:bg-gray-800/40">
      <span className="text-gray-400">{label}</span>
      <span className="font-semibold text-gray-700 dark:text-gray-300">{fmt(value)}</span>
    </div>
  );
}
