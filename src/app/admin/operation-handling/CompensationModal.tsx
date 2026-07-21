/* eslint-disable */
// @ts-nocheck
"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { XCircle, Gift } from "lucide-react";
import API_BASE from "../../../../baseurl";
import { getToken } from "../../utils/auth";
import DatePicker from "../../utils/datepicker";

const toISODate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "";
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
};

// Campaign Compensation: extra working hours or extra campaign days granted
// for a date range, to make up for downtime caused by issues/unavailability.
// Scope: whole vehicle-type slot (campaign-level) or one specific reg no.
export default function CompensationModal({ order, vehicle, vehicleIndex, vehicleEntries, onClose, onRefresh }) {
  const activeEntries = (vehicleEntries || []).filter((e) => e.entryStatus !== "removed");

  const [campaignLevel, setCampaignLevel] = useState(true);
  const [selectedEntryId, setSelectedEntryId] = useState("");
  const [compensationType, setCompensationType] = useState("hours");
  const [compensationValue, setCompensationValue] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const campaignFromISO = toISODate(vehicle.fromDate);
  const campaignToISO = toISODate(vehicle.toDate);

  const handleSubmit = async () => {
    if (!campaignLevel && !selectedEntryId) return toast.error("Select a driver / vehicle, or apply campaign-level");

    const value = Number(compensationValue) || 0;
    if (value <= 0) return toast.error("Enter a compensation value greater than 0");
    if (!fromDate) return toast.error("From date is required");
    if (!toDate) return toast.error("To date is required");
    if (new Date(fromDate) > new Date(toDate))
      return toast.error("From date must be before or equal to To date");

    setSubmitting(true);
    try {
      await axios.post(
        `${API_BASE}admin/pipeline/${order._id}/compensation`,
        {
          vehicleIndex,
          entryId: campaignLevel ? null : selectedEntryId,
          compensationType,
          compensationValue: value,
          fromDate,
          toDate,
          reason,
        },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      toast.success("Compensation added!");
      onRefresh();
      onClose();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to add compensation");
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
              <Gift size={15} className="text-emerald-500" />
              Add Campaign Compensation
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

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/40 rounded-lg px-3 py-2 cursor-pointer">
            <input
              type="checkbox"
              checked={campaignLevel}
              onChange={(e) => {
                setCampaignLevel(e.target.checked);
                if (e.target.checked) setSelectedEntryId("");
              }}
              className="accent-emerald-600"
            />
            Apply to whole vehicle type (campaign-level), not one registration number
          </label>

          {!campaignLevel && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Driver / Vehicle</label>
              <select
                value={selectedEntryId}
                onChange={(e) => setSelectedEntryId(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              >
                <option value="">Select driver / reg no</option>
                {activeEntries.map((entry) => (
                  <option key={entry._id} value={entry._id}>
                    {entry.driverName || "—"} · {entry.vehicleRegistrationNumber || "—"}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Compensation Type</label>
            <div className="flex gap-2">
              {["hours", "days"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setCompensationType(t)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                    compensationType === t
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {t === "hours" ? "Extra Working Hours" : "Extra Campaign Days"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              {compensationType === "hours" ? "Extra Hours per Day" : "Extra Days"}
            </label>
            <input
              type="number"
              min="0"
              value={compensationValue}
              onChange={(e) => setCompensationValue(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              placeholder="e.g. 2"
            />
          </div>

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

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              placeholder="e.g. Compensating for 3 hours of vehicle downtime"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-all disabled:opacity-40"
        >
          {submitting ? "Saving..." : "Save Compensation"}
        </button>
      </div>
    </div>
  );
}
