/* eslint-disable */
// @ts-nocheck
"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { XCircle, Navigation } from "lucide-react";
import API_BASE from "../../../../baseurl";
import { getToken } from "../../utils/auth";
import DatePicker from "../../utils/datepicker";

const toISODate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "";
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
};

export default function ExtraKmModal({ order, vehicle, vehicleIndex, vehicleEntries, bookingStatusMap, onClose, onRefresh }) {
 const [selectedEntryId, setSelectedEntryId] = useState("");
  const [campaignLevel, setCampaignLevel] = useState(false);
  const [extraKm, setExtraKm] = useState("");
  const [extraHours, setExtraHours] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [distributionMethod, setDistributionMethod] = useState("");
  const [submitting, setSubmitting] = useState(false);

const campaignFromISO = toISODate(vehicle.fromDate);
  const campaignToISO = toISODate(vehicle.toDate);

  // Extra KM/Hours purchased at Order Creation form a free-use pool for this
  // vehicle slot; usage beyond it is additional billable overage.
  const purchasedKm = vehicle.extraKm || 0;
  const purchasedHours = vehicle.extraHours || 0;
  const loggedForVehicle = (order.extraKmDetailsArray || []).filter((e) => e.vehicleIndex === vehicleIndex);
  const usedKm = loggedForVehicle.reduce((s, e) => s + (e.extraKm || 0), 0);
  const usedHours = loggedForVehicle.reduce((s, e) => s + (e.extraHours || 0), 0);
  const remainingKm = Math.max(purchasedKm - usedKm, 0);
  const remainingHours = Math.max(purchasedHours - usedHours, 0);

  // ── NEW: booking mismatch check ──
  const cleanRegForCheck = (r) => (r || "").replace(/\s+/g, "").toUpperCase();
  const isEntryBookingValid = (entry) => {
    const bs = bookingStatusMap?.[cleanRegForCheck(entry.vehicleRegistrationNumber)];
    return !!(
      bs &&
      bs.currentStatus === "Booked" &&
      String(bs.orderId) === String(order._id) &&
      bs.orderDisplayId === order.orderId
    );
  };

  const activeEntries = (vehicleEntries || []).filter((e) => e.entryStatus !== "removed");

const handleSubmit = async () => {
    if (!campaignLevel) {
      if (!selectedEntryId) return toast.error("Select a driver / vehicle");
      const selectedEntry = activeEntries.find((e) => e._id === selectedEntryId);
      // if (selectedEntry && !isEntryBookingValid(selectedEntry)) {
      //   return toast.error("This vehicle's registration doesn't match the booking. Please update driver first.");
      // }
    }

    const km = Number(extraKm) || 0;
    const hrs = Number(extraHours) || 0;
    if (km <= 0 && hrs <= 0) return toast.error("Enter extra KM or extra hours");

    if (!fromDate) return toast.error("From date is required");
    if (!toDate) return toast.error("To date is required");
    if (new Date(fromDate) > new Date(toDate))
      return toast.error("From date must be before or equal to To date");
    if (!distributionMethod) return toast.error("Select how to distribute the extra KM/Hours (Daily or Split)");

    setSubmitting(true);
    try {
      await axios.post(
        `${API_BASE}admin/pipeline/${order._id}/extra-km`,
        {
          vehicleIndex,
          entryId: campaignLevel ? null : selectedEntryId,
          extraKm: km,
          extraHours: hrs,
          fromDate,
          toDate,
          distributionMethod,
        },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      toast.success("Extra KM details added!");
      onRefresh();
      onClose();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to add extra KM details");
    } finally {
      setSubmitting(false);
    }
  };

  const cleanReg = (r) => (r || "").replace(/\s+/g, "").toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-4">

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Navigation size={15} className="text-orange-500" />
              Add Extra KM / Hours
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

        {/* {(purchasedKm > 0 || purchasedHours > 0) && (
          <div className="flex items-center justify-between rounded-lg bg-orange-50 dark:bg-orange-900/10 px-3 py-2 text-xs">
            <span className="text-orange-700 dark:text-orange-300 font-semibold">Purchased balance remaining</span>
            <span className="text-orange-700 dark:text-orange-300 font-semibold">{remainingKm} km · {remainingHours} hrs</span>
          </div>
        )} */}
        {((Number(extraKm) || 0) > remainingKm || (Number(extraHours) || 0) > remainingHours) && (
          <p className="text-[11px] text-amber-600 -mt-2">
            This exceeds the purchased balance — the excess will be billed as additional usage in the campaign settlement.
          </p>
        )}

        <div className="space-y-3">
          {/* <label className="flex items-center gap-2 text-xs font-semibold text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/40 rounded-lg px-3 py-2 cursor-pointer">
            <input
              type="checkbox"
              checked={campaignLevel}
              onChange={(e) => {
                setCampaignLevel(e.target.checked);
                if (e.target.checked) setSelectedEntryId("");
              }}
              className="accent-orange-600"
            />
            Apply to whole vehicle type (campaign-level), not one registration number
          </label> */}

          {/* Driver / Reg No dropdown */}
          {!campaignLevel && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Driver / Vehicle</label>
             <select
                value={selectedEntryId}
                onChange={(e) => setSelectedEntryId(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-300"
              >
                <option value="">Select driver / reg no</option>
                {activeEntries.map((entry) => {
                  const isValid = isEntryBookingValid(entry);
                  return (
                    <option key={entry._id} value={entry._id}>
                      {entry.driverName || "—"} · {entry.vehicleRegistrationNumber || "—"}

                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Extra KM */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Extra KM</label>
            <input
              type="number"
              min="0"
              value={extraKm}
              onChange={(e) => setExtraKm(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-300"
              placeholder="e.g. 2"
            />
          </div>

          {/* Extra Hours */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Extra Hours</label>
            <input
              type="number"
              min="0"
              value={extraHours}
              onChange={(e) => setExtraHours(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-300"
              placeholder="e.g. 2"
            />
          </div>

          {/* From / To Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
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
                maxDate={campaignToISO}
              />
            </div>
          </div>
          {/* Distribution Method */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Apply Across Date Range <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDistributionMethod("daily")}
                className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                  distributionMethod === "daily"
                    ? "bg-orange-500 border-orange-500 text-white"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                Daily
                <div className={`mt-0.5 text-[10px] font-normal ${distributionMethod === "daily" ? "text-orange-100" : "text-gray-400"}`}>
                  Full amount applies every day
                </div>
              </button>
              <button
                type="button"
                onClick={() => setDistributionMethod("split")}
                className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                  distributionMethod === "split"
                    ? "bg-orange-500 border-orange-500 text-white"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                Split
                <div className={`mt-0.5 text-[10px] font-normal ${distributionMethod === "split" ? "text-orange-100" : "text-gray-400"}`}>
                  Total divided evenly across days
                </div>
              </button>
            </div>
            {distributionMethod === "split" && fromDate && toDate && (() => {
              const start = new Date(fromDate);
              const end = new Date(toDate);
              const dayCount = Math.max(Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1, 1);
              const km = Number(extraKm) || 0;
              const hrs = Number(extraHours) || 0;
              if (km <= 0 && hrs <= 0) return null;
              const perDayKm = (km / dayCount).toFixed(1);
              const perDayHrs = (hrs / dayCount).toFixed(1);
              return (
                <p className="text-[11px] text-gray-400 mt-1">
                  Preview:{" "}
                  {km > 0 && <>≈ {perDayKm} km/day</>}
                  {km > 0 && hrs > 0 && " · "}
                  {hrs > 0 && <>≈ {perDayHrs} hrs/day</>}
                  {" "}over {dayCount} day{dayCount !== 1 ? "s" : ""}
                </p>
              );
            })()}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting || !distributionMethod}
          className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-all disabled:opacity-40"
        >
          {submitting ? "Saving..." : "Save Extra KM Details"}
        </button>
      </div>
    </div>
  );
}