/* eslint-disable */
// @ts-nocheck
"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  XCircle, Truck, User, Phone, Car, ArrowRightLeft,
  CheckCircle2, AlertCircle, Search,
} from "lucide-react";
import API_BASE from "../../../../baseurl";
import { getToken } from "../../utils/auth";

export default function ReplaceVehicleModal({
  order,
  vehicle,          // the bookingItem
  vehicleIndex,
  entry,             // the old on-road entry being replaced
  vehicleTypeName,
  onClose,
  onRefresh,
}: any) {
  const [availableVehicles, setAvailableVehicles] = useState<any[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedReg, setSelectedReg] = useState("");
  const [driverName, setDriverName] = useState(entry?.driverName || "");
  const [driverPhone, setDriverPhone] = useState(entry?.driverPhone || "");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fetchedOnce = useRef(false);

  const unavailableCount = (order.onRoadExecutionArray || []).filter(
    (e: any) => e.vehicleIndex === vehicleIndex && e.unavailableStatus === true
  ).length;

  const fetchAvailableVehicles = async () => {
    if (!vehicle?.vehicleType) return;
    setLoadingVehicles(true);
    try {
      const { data } = await axios.get(`${API_BASE}api/getNewVehicles`, {
        params: { vehicleType: vehicle.vehicleType },
      });
      const docs = data?.data || [];
      const flat: any[] = [];
      docs.forEach((doc: any) => {
        (doc.registrationVehicles || []).forEach((rv: any) => {
          if (rv?.statusAvailability?.currentStatus === "Available" && rv.registrationNumber) {
            flat.push({
              registrationNumber: rv.registrationNumber,
              city: rv.city,
              vehicleDescription: doc.vehicleDescription,
            });
          }
        });
      });
      setAvailableVehicles(flat);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to load available vehicles");
    } finally {
      setLoadingVehicles(false);
    }
  };

  useEffect(() => {
    if (fetchedOnce.current) return;
    fetchedOnce.current = true;
    fetchAvailableVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const normalize = (s: string) => (s || "").replace(/\s+/g, "").toUpperCase();
  const filtered = query.trim()
    ? availableVehicles.filter((v) => normalize(v.registrationNumber).includes(normalize(query)))
    : availableVehicles;

  const handleSubmit = async () => {
    if (!selectedReg) return toast.error("Select a replacement vehicle");
    if (!driverName.trim()) return toast.error("Driver name is required");
    if (!/^\d{10}$/.test(driverPhone)) return toast.error("Enter a valid 10-digit driver phone number");
    if (!reason.trim()) return toast.error("Reason/comments are required");

    setSubmitting(true);
    try {
      await axios.post(
        `${API_BASE}admin/pipeline/${order._id}/onroad-replace/${entry._id}`,
        {
          newVehicleRegistrationNumber: selectedReg,
          driverName: driverName.trim(),
          driverPhone: driverPhone.trim(),
          reason: reason.trim(),
        },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      toast.success("Vehicle replaced successfully!");
      onRefresh();
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to replace vehicle");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <ArrowRightLeft size={15} className="text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Replace Vehicle</h3>
              <p className="text-xs text-gray-400 mt-0.5">{vehicleTypeName || "Vehicle"}</p>
            </div>
          </div>
          <button onClick={onClose}>
            <XCircle size={18} className="text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Summary counts */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/10 p-3">
              <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wide">Available Vehicles</p>
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{availableVehicles.length}</p>
            </div>
            <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 p-3">
              <p className="text-[11px] font-bold text-red-600 uppercase tracking-wide">Unavailable Vehicles</p>
              <p className="text-lg font-bold text-red-700 dark:text-red-300">{unavailableCount}</p>
            </div>
          </div>

          {/* Current vehicle/driver being replaced */}
          <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 p-3 space-y-1.5">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">Current Vehicle (Being Replaced)</p>
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <Truck size={13} className="text-gray-400" />
              <span className="font-mono font-semibold">{entry?.vehicleRegistrationNumber || "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <User size={13} className="text-gray-400" />
              <span>{entry?.driverName || "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <Phone size={13} className="text-gray-400" />
              <span>{entry?.driverPhone || "—"}</span>
            </div>
          </div>

          {/* Replacement driver details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Driver Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="Driver name"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Driver Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="9876543210"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </div>
            <p className="col-span-2 text-[11px] text-gray-400 -mt-1">
              Defaults to the current driver — edit if a different driver is taking over the replacement vehicle.
            </p>
          </div>

          {/* Replacement reg select */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-500">
                Select Replacement Vehicle
              </label>
              <span className="text-[11px] text-gray-400">{filtered.length} shown</span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value.toUpperCase())}
                placeholder="Search available registration numbers..."
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg pl-9 pr-3 py-2.5 text-sm uppercase bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </div>

            <div className="mt-2 h-40 overflow-y-scroll overscroll-contain border border-gray-100 dark:border-gray-800 rounded-lg divide-y divide-gray-100 dark:divide-gray-800">
              {loadingVehicles && (
                <p className="text-xs text-gray-400 text-center py-4">Loading available vehicles...</p>
              )}
              {!loadingVehicles && filtered.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">No available vehicles of this type</p>
              )}
              {filtered.map((v) => (
                <button
                  key={v.registrationNumber}
                  onClick={() => setSelectedReg(v.registrationNumber)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left transition-all ${
                    selectedReg === v.registrationNumber
                      ? "bg-amber-50 dark:bg-amber-900/20"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Car size={13} className="text-gray-400" />
                    <span className="text-sm font-mono font-semibold text-gray-700 dark:text-gray-300">
                      {v.registrationNumber}
                    </span>
                    {v.city && <span className="text-xs text-gray-400">· {v.city}</span>}
                  </div>
                  {selectedReg === v.registrationNumber && (
                    <CheckCircle2 size={15} className="text-amber-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Reason / Comments <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why is this vehicle being replaced? (breakdown, accident, etc.)"
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </div>

          {selectedReg && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 p-3 text-xs text-amber-700 dark:text-amber-300">
              <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
              <span>
                <b>{entry?.vehicleRegistrationNumber}</b> will move to the Vehicle Unavailable stage and{" "}
                <b>{selectedReg}</b> will take over the campaign with the same driver.
              </span>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
          <button
            onClick={handleSubmit}
            disabled={submitting || !selectedReg || !reason.trim()}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-all disabled:opacity-40"
          >
            {submitting ? "Replacing..." : "Confirm Replacement"}
          </button>
        </div>
      </div>
    </div>
  );
}
