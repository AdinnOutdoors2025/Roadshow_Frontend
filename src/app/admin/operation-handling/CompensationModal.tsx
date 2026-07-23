/* eslint-disable */
// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
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

const daysBetween = (fromISO, toISO) => {
  if (!fromISO || !toISO) return 0;
  const a = new Date(`${fromISO}T00:00:00.000Z`).getTime();
  const b = new Date(`${toISO}T00:00:00.000Z`).getTime();
  return Math.max(Math.round((b - a) / (24 * 3_600_000)), 0);
};

const addDaysISO = (iso, days) => {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return toISODate(d);
};

// Campaign Compensation: extra working hours or extra campaign days granted,
// scoped to whole vehicle-type slot (campaign-level) or one specific reg no.
// Three flows:
//   - "single" scope: whole compensation applied once, to the exact campaign
//     day this modal was opened from (Compensation Type/date pickers hidden —
//     always "hours").
//   - "split" + "hours": a per-day extra-hours value, spread across an
//     admin-chosen date range starting from the day the modal was opened from.
//   - "split" + "days": Extra Campaign Days — no manual value entry, the day
//     count is derived from (To Date − campaign end date). Days requests go
//     through the FOC approval rule (super admin: instant; others: pending
//     until a super admin approves it in Client Closure).
export default function CompensationModal({ order, vehicle, vehicleIndex, vehicleEntries, detectedLossDate, detectedLossHours, onClose, onRefresh }) {
  const activeEntries = (vehicleEntries || []).filter((e) => e.entryStatus !== "removed");
  const hasDetectedLoss = !!detectedLossDate && Number(detectedLossHours) > 0;

  const campaignFromISO = toISODate(vehicle.fromDate);
  const campaignToISO = toISODate(vehicle.toDate);
  const singleDate = detectedLossDate || campaignFromISO;

  const [campaignLevel, setCampaignLevel] = useState(true);
  const [selectedEntryId, setSelectedEntryId] = useState("");
  const [compensationType, setCompensationType] = useState("hours");
  const [compensationValue, setCompensationValue] = useState(hasDetectedLoss ? String(detectedLossHours) : "");
  // "single" = apply the whole value to just this date; "split" = spread it
  // (hours: per-day value across a range) or extend the campaign (days).
  const [applyScope, setApplyScope] = useState("single");
  const [fromDate, setFromDate] = useState(singleDate);
  const [toDate, setToDate] = useState(singleDate);
  const [reason, setReason] = useState(
    hasDetectedLoss ? `Compensating for ${detectedLossHours}h of downtime on ${detectedLossDate}` : ""
  );
  const [submitting, setSubmitting] = useState(false);

  const isSingle = applyScope === "single";
  const isSplitDays = applyScope === "split" && compensationType === "days";
  const isSplitHours = applyScope === "split" && compensationType === "hours";
  const derivedDaysValue = isSplitDays ? daysBetween(campaignToISO, toDate) : null;

  // Keep the date fields correct whenever scope/type changes.
  useEffect(() => {
    if (isSingle) {
      setCompensationType("hours");
      setFromDate(singleDate);
      setToDate(singleDate);
    } else if (isSplitHours) {
      setFromDate(singleDate);
      if (!toDate || toDate < singleDate) setToDate(campaignToISO);
    } else if (isSplitDays) {
      setFromDate(campaignToISO);
      if (!toDate || toDate <= campaignToISO) setToDate(campaignToISO);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyScope, compensationType]);

  const handleSubmit = async () => {
    if (!campaignLevel && !selectedEntryId) return toast.error("Select a driver / vehicle, or apply campaign-level");

    const value = isSplitDays ? derivedDaysValue : Number(compensationValue) || 0;
    if (value <= 0) {
      return toast.error(isSplitDays ? "Pick a To Date after the campaign end date" : "Enter a compensation value greater than 0");
    }
    if (!fromDate) return toast.error("From date is required");
    if (!toDate) return toast.error("To date is required");
    if (new Date(fromDate) > new Date(toDate))
      return toast.error("From date must be before or equal to To date");

    setSubmitting(true);
    try {
      const res = await axios.post(
        `${API_BASE}admin/pipeline/${order._id}/compensation`,
        {
          vehicleIndex,
          entryId: campaignLevel ? null : selectedEntryId,
          compensationType,
          compensationValue: value,
          applyScope,
          fromDate,
          toDate,
          reason,
        },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      toast.success(res.data?.message || "Compensation added!");
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
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-3 flex-shrink-0">
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

        <div className="space-y-3 px-6 overflow-y-auto flex-1">
          {hasDetectedLoss && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
              <span className="font-semibold">{detectedLossHours}h loss detected</span> on {new Date(detectedLossDate + "T00:00:00.000Z").toLocaleDateString("en-IN")} (issue + unavailable hours). Choose below how to apply the compensation for it.
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Apply this compensation to</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setApplyScope("single")}
                className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                  applyScope === "single"
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                This date only
              </button>
              <button
                type="button"
                onClick={() => setApplyScope("split")}
                className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                  applyScope === "split"
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                Split across a date range
              </button>
            </div>
            <p className="mt-1 text-[11px] text-gray-400">
              {isSingle
                ? `Applied once, on ${new Date(singleDate + "T00:00:00.000Z").toLocaleDateString("en-IN")} only.`
                : isSplitHours
                ? "Granted per day, spread evenly across every day in the From→To range."
                : "Extends the campaign — the number of extra days is the gap between the campaign end date and your chosen To Date."}
            </p>
          </div>

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

          {!isSingle && (
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
          )}

          {!isSplitDays && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                {isSingle ? "Hours" : "Extra Hours per Day"}
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
          )}

          {isSplitDays && (
            <div className="rounded-lg bg-sky-50 dark:bg-sky-900/10 border border-sky-200 dark:border-sky-800/40 px-3 py-2 text-xs text-sky-800 dark:text-sky-300">
              Extra days requested: <span className="font-bold">{derivedDaysValue}</span> (campaign end date → your chosen To Date below)
            </div>
          )}

          {!isSingle && (
            <div className="space-y-3">
              <div className={isSplitDays ? "opacity-60 pointer-events-none" : ""}>
                <label className="block text-xs font-semibold text-gray-500 mb-1">From Date</label>
                <DatePicker
                  value={fromDate}
                  onChange={setFromDate}
                  minDate={campaignFromISO}
                  maxDate={campaignToISO}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">To Date</label>
                <DatePicker
                  value={toDate}
                  onChange={setToDate}
                  minDate={fromDate || campaignFromISO}
                  // DatePicker falls back to an 18-100-years-old birthdate
                  // range when maxDate is left undefined — harmless for a
                  // normal booking-date field, but for the "extend the
                  // campaign" To Date (isSplitDays), minDate is already the
                  // campaign end date (e.g. 2026), which sits *after* that
                  // fallback's ~2008 cutoff, making minAllowedYear >
                  // maxAllowedYear and silently emptying the year dropdown.
                  // Always pass an explicit cap here instead.
                  maxDate={isSplitHours ? campaignToISO : addDaysISO(campaignToISO, 180)}
                />
              </div>
            </div>
          )}

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

        <div className="p-6 pt-3 flex-shrink-0">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-all disabled:opacity-40"
          >
            {submitting ? "Saving..." : isSplitDays ? "Request / Apply Extension" : "Save Compensation"}
          </button>
        </div>
      </div>
    </div>
  );
}
