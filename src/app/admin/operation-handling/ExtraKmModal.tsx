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

export default function ExtraKmModal({ order, vehicle, vehicleIndex, vehicleEntries, onClose, onRefresh }) {
  const [selectedEntryId, setSelectedEntryId] = useState(vehicleEntries?.[0]?._id || "");
  const [extraKm, setExtraKm] = useState("");
  const [extraHours, setExtraHours] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const campaignFromISO = toISODate(vehicle.fromDate);
  const campaignToISO = toISODate(vehicle.toDate);

  const handleSubmit = async () => {
    if (!selectedEntryId) return toast.error("Select a driver / vehicle");

    const km = Number(extraKm) || 0;
    const hrs = Number(extraHours) || 0;
    if (km <= 0 && hrs <= 0) return toast.error("Enter extra KM or extra hours");

    if (!fromDate) return toast.error("From date is required");
    if (!toDate) return toast.error("To date is required");
    if (new Date(fromDate) > new Date(toDate))
      return toast.error("From date must be before or equal to To date");

    setSubmitting(true);
    try {
      await axios.post(
        `${API_BASE}admin/pipeline/${order._id}/extra-km`,
        {
          vehicleIndex,
          entryId: selectedEntryId,
          extraKm: km,
          extraHours: hrs,
          fromDate,
          toDate,
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

        <div className="space-y-3">
          {/* Driver / Reg No dropdown */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Driver / Vehicle</label>
            <select
              value={selectedEntryId}
              onChange={(e) => setSelectedEntryId(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              <option value="">Select driver / reg no</option>
              {(vehicleEntries || []).map((entry) => (
                <option key={entry._id} value={entry._id}>
                  {entry.driverName || "—"} · {entry.vehicleRegistrationNumber || "—"}
                </option>
              ))}
            </select>
          </div>

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
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-all disabled:opacity-40"
        >
          {submitting ? "Saving..." : "Save Extra KM Details"}
        </button>
      </div>
    </div>
  );
}