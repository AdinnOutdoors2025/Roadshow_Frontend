/* eslint-disable */
// @ts-nocheck
"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { XCircle, AlertTriangle } from "lucide-react";
import API_BASE from "../../../../baseurl";
import { getToken } from "../../utils/auth";

export default function ReleaseVehicleModal({ order, vehicleEntries, onClose, onRefresh }) {
  const [selectedEntryId, setSelectedEntryId] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const activeEntries = (vehicleEntries || []).filter((e) => e.entryStatus !== "removed");

  const handleSubmit = async () => {
    if (!selectedEntryId) return toast.error("Select a vehicle to release");

    setSubmitting(true);
    try {
      await axios.post(
        `${API_BASE}admin/pipeline/${order._id}/onroad-release/${selectedEntryId}`,
        { reason: reason.trim() },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      toast.success("Vehicle released from campaign!");
      onRefresh();
      onClose();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to release vehicle");
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
              <AlertTriangle size={15} className="text-red-500" />
              Release Vehicle from Campaign
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Removes this vehicle from the campaign and frees it up for other bookings
            </p>
          </div>
          <button onClick={onClose}>
            <XCircle size={18} className="text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Select Vehicle</label>
            <select
              value={selectedEntryId}
              onChange={(e) => setSelectedEntryId(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              <option value="">Select driver / reg no</option>
              {activeEntries.map((entry) => (
                <option key={entry._id} value={entry._id}>
                  {entry.driverName || "—"} · {entry.vehicleRegistrationNumber || "—"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Reason (optional)</label>
            <textarea
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
              rows={3}
              placeholder="e.g. Campaign ended early for this vehicle, client requested reduction..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400">
          Vehicle history (issues, extra KM, driver logs) will still be visible in Driver History and Campaign History tabs after release.
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting || !selectedEntryId}
          className="w-full py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all disabled:opacity-40"
        >
          {submitting ? "Releasing..." : "Release Vehicle"}
        </button>
      </div>
    </div>
  );
}