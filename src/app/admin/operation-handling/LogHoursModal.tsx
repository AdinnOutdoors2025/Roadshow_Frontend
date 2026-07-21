/* eslint-disable */
// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { XCircle, Clock } from "lucide-react";
import API_BASE from "../../../../baseurl";
import { getToken } from "../../utils/auth";
import DatePicker from "../../utils/datepicker";

const CAMPAIGN_HOURS_PER_DAY = Number(process.env.NEXT_PUBLIC_CAMPAIGN_HOURS_PER_DAY) || 8;
const DEFAULT_LOGIN_TIME = process.env.NEXT_PUBLIC_DEFAULT_LOGIN_TIME || "11:00";
const DEFAULT_LOGOUT_TIME = process.env.NEXT_PUBLIC_DEFAULT_LOGOUT_TIME || "18:00";

const toISODate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "";
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
};

export default function LogHoursModal({ order, vehicle, vehicleIndex, vehicleEntries, onClose, onRefresh }) {
  const activeEntries = (vehicleEntries || []).filter((e) => e.entryStatus !== "removed");

  const [selectedEntryId, setSelectedEntryId] = useState(activeEntries[0]?._id || "");
  const [day, setDay] = useState(toISODate(new Date()));
  const [startTime, setStartTime] = useState(DEFAULT_LOGIN_TIME);
  const [endTime, setEndTime] = useState(DEFAULT_LOGOUT_TIME);
  const [remarks, setRemarks] = useState("");
  const [isAbsentDay, setIsAbsentDay] = useState(false);
  const [absentDayResolution, setAbsentDayResolution] = useState("");
  const [billingMode, setBillingMode] = useState("full");
  const [submitting, setSubmitting] = useState(false);

  const campaignFromISO = toISODate(vehicle.fromDate);
  const campaignToISO = toISODate(vehicle.toDate);

  const preview = useMemo(() => {
    if (!day || !startTime || !endTime) return null;
    const start = new Date(`${day}T${startTime}:00`);
    const end = new Date(`${day}T${endTime}:00`);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) return null;
    const runningHours = Math.round(((end - start) / (1000 * 60 * 60)) * 100) / 100;
    const absentHours = Math.max(Math.round((CAMPAIGN_HOURS_PER_DAY - runningHours) * 100) / 100, 0);
    return { runningHours, absentHours };
  }, [day, startTime, endTime]);

  const handleSubmit = async () => {
    if (!selectedEntryId) return toast.error("Select a driver / vehicle");
    if (!day) return toast.error("Select a date");
    if (isAbsentDay && !absentDayResolution) {
      return toast.error("Choose Extend Campaign or Close on Original End Date");
    }

    let startISO = null;
    let endISO = null;
    if (!isAbsentDay) {
      if (!startTime) return toast.error("Start time is required");
      if (!endTime) return toast.error("End time is required");

      const start = new Date(`${day}T${startTime}:00`);
      const end = new Date(`${day}T${endTime}:00`);
      if (end <= start) return toast.error("End time must be after start time");
      startISO = start.toISOString();
      endISO = end.toISOString();
    }

    setSubmitting(true);
    try {
      await axios.post(
        `${API_BASE}admin/pipeline/${order._id}/daily-hours`,
        {
          vehicleIndex,
          entryId: selectedEntryId,
          day,
          startTime: startISO,
          endTime: endISO,
          remarks,
          isAbsentDay,
          billingMode: isAbsentDay ? "absent" : billingMode,
          absentDayResolution: isAbsentDay ? absentDayResolution : null,
        },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      toast.success("Daily hours logged!");
      onRefresh();
      onClose();
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to log daily hours";
      if (/absentDayResolution/i.test(msg)) {
        toast.error("Please choose Extend Campaign or Close on Original End Date for the absent day.");
      } else {
        toast.error(msg);
      }
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
              <Clock size={15} className="text-indigo-500" />
              Log Daily Hours
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
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Driver / Vehicle</label>
            <select
              value={selectedEntryId}
              onChange={(e) => setSelectedEntryId(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-300"
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
            <label className="block text-xs font-semibold text-gray-500 mb-1">Date</label>
            <DatePicker value={day} onChange={setDay} minDate={campaignFromISO} maxDate={campaignToISO} />
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-lg px-3 py-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isAbsentDay}
              onChange={(e) => {
                setIsAbsentDay(e.target.checked);
                if (!e.target.checked) setAbsentDayResolution("");
              }}
              className="accent-amber-600"
            />
            Mark vehicle Absent for the full day
          </label>

          {isAbsentDay && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                What happens to this campaign day? <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => setAbsentDayResolution("extend")}
                  className={`text-left px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                    absentDayResolution === "extend"
                      ? "bg-amber-500 border-amber-500 text-white"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  Extend Campaign (+1 Day)
                  <div className={`mt-0.5 text-[10px] font-normal ${absentDayResolution === "extend" ? "text-amber-100" : "text-gray-400"}`}>
                    Pushes the vehicle's campaign end date out by a day, at zero charge, until real data is logged.
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setAbsentDayResolution("close")}
                  className={`text-left px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                    absentDayResolution === "close"
                      ? "bg-amber-500 border-amber-500 text-white"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  Close on Original End Date
                  <div className={`mt-0.5 text-[10px] font-normal ${absentDayResolution === "close" ? "text-amber-100" : "text-gray-400"}`}>
                    Keeps the original campaign end date — this day bills as zero.
                  </div>
                </button>
              </div>
            </div>
          )}

          {!isAbsentDay && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </div>
          )}

          {!isAbsentDay && preview && (
            <div className="flex items-center justify-between rounded-lg bg-indigo-50 dark:bg-indigo-900/20 px-3 py-2 text-xs">
              <span className="text-indigo-700 dark:text-indigo-300 font-semibold">Running: {preview.runningHours} hrs</span>
              <span className={preview.absentHours > 0 ? "text-amber-600 font-semibold" : "text-gray-400"}>
                Absent: {preview.absentHours} hrs (of {CAMPAIGN_HOURS_PER_DAY} hr day)
              </span>
            </div>
          )}

          {!isAbsentDay && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Bill this day as</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBillingMode("full")}
                  className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                    billingMode === "full"
                      ? "bg-indigo-500 border-indigo-500 text-white"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  Full Day
                </button>
                <button
                  type="button"
                  onClick={() => setBillingMode("partial")}
                  className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                    billingMode === "partial"
                      ? "bg-indigo-500 border-indigo-500 text-white"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  Partial (actual hours run)
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={2}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Optional remarks for the day"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting || (isAbsentDay && !absentDayResolution)}
          className="w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-all disabled:opacity-40"
        >
          {submitting ? "Saving..." : "Save Daily Hours"}
        </button>
      </div>
    </div>
  );
}
