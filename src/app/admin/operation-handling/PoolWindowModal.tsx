/* eslint-disable */
// @ts-nocheck
"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { XCircle, Gauge } from "lucide-react";
import API_BASE from "../../../../baseurl";
import { getToken } from "../../utils/auth";
import DatePicker from "../../utils/datepicker";

const toISODate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "";
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
};

// Lets ops narrow the date range within which the Order-Creation-purchased
// Extra KM/Hours pool (bal.purchasedKm/purchasedHours) is treated as
// "available" against logged usage. Defaults to the vehicle's full campaign
// window when unset; usage logged outside the chosen window falls straight
// to overage instead of drawing against the pool.
export default function PoolWindowModal({ order, vehicle, vehicleIndex, balance, onClose, onRefresh }) {
  const campaignFromISO = toISODate(vehicle.fromDate);
  const campaignToISO = toISODate(vehicle.toDate);

  const [fromDate, setFromDate] = useState(balance?.purchasedWindowFrom || campaignFromISO);
  const [toDate, setToDate] = useState(balance?.purchasedWindowTo || campaignToISO);
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    if (!fromDate) return toast.error("From date is required");
    if (!toDate) return toast.error("To date is required");
    if (new Date(fromDate) > new Date(toDate))
      return toast.error("From date must be before or equal to To date");

    setSubmitting(true);
    try {
      await axios.post(
        `${API_BASE}admin/pipeline/${order._id}/purchased-pool-window`,
        { vehicleIndex, fromDate, toDate },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      toast.success("Purchased pool window updated!");
      onRefresh();
      onClose();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to update pool window");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async () => {
    setSubmitting(true);
    try {
      await axios.post(
        `${API_BASE}admin/pipeline/${order._id}/purchased-pool-window`,
        { vehicleIndex, fromDate: null, toDate: null },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      toast.success("Reset to full campaign window!");
      onRefresh();
      onClose();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to reset pool window");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Gauge size={15} className="text-fuchsia-500" />
              Purchased Extra KM/Hours Pool — Applicable Dates
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Campaign range: {vehicle.fromDate ? new Date(vehicle.fromDate).toLocaleDateString("en-IN") : "—"}
              {" → "}
              {vehicle.toDate ? new Date(vehicle.toDate).toLocaleDateString("en-IN") : "—"}
            </p>
          </div>
          <button onClick={onClose}>
            <XCircle size={18} className="text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          The purchased pool ({balance?.purchasedKm ?? 0} km · {balance?.purchasedHours ?? 0} hrs) only offsets
          logged usage that falls within this window. Usage logged outside it is billed in full as overage.
          Defaults to the whole campaign if left unset.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">From Date</label>
            <DatePicker value={fromDate} onChange={setFromDate} minDate={campaignFromISO} maxDate={campaignToISO} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">To Date</label>
            <DatePicker value={toDate} onChange={setToDate} minDate={fromDate || campaignFromISO} maxDate={campaignToISO} />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleReset}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-semibold transition-all disabled:opacity-40"
          >
            Reset to Full Campaign
          </button>
          <button
            onClick={handleSave}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl bg-fuchsia-500 hover:bg-fuchsia-600 text-white text-sm font-semibold transition-all disabled:opacity-40"
          >
            {submitting ? "Saving..." : "Save Dates"}
          </button>
        </div>
      </div>
    </div>
  );
}
