/* eslint-disable */
// @ts-nocheck
"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { XCircle, Car, Plus } from "lucide-react";
import API_BASE from "../../../../baseurl";
import { getToken } from "../../utils/auth";

function VehicleRegSelect({ vehicleTypeId, value, onChange, disabled, hasError }) {
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [fetched, setFetched] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchVehicles = async () => {
    if (!vehicleTypeId || loading) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}api/getNewVehicles`, {
        params: { vehicleType: vehicleTypeId },
      });
      const docs = res?.data?.data || [];
      const flat = [];
      docs.forEach((doc) => {
        (doc.registrationVehicles || []).forEach((rv) => {
          if (rv?.statusAvailability?.currentStatus === "Available" && rv.registrationNumber) {
            flat.push({
              _id: rv._id,
              registrationNumber: rv.registrationNumber,
              city: rv.city,
              vehicleDocId: doc._id,
            });
          }
        });
      });
      setVehicles(flat);
      setFetched(true);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  const handleFocus = () => {
    if (disabled) return;
    setOpen(true);
    if (!fetched) fetchVehicles();
  };

  const normalize = (s) => (s || "").replace(/\s+/g, "").toUpperCase();
  const filtered = query.trim()
    ? vehicles.filter((v) => normalize(v.registrationNumber).includes(normalize(query)))
    : vehicles;

  const handleSelect = (v) => {
    onChange(v.registrationNumber, v.vehicleDocId);
    setQuery(v.registrationNumber);
    setOpen(false);
  };

  const handleInputChange = (e) => {
    const val = e.target.value.toUpperCase();
    setQuery(val);
    onChange(val, null);
    if (!open) setOpen(true);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={handleFocus}
        disabled={disabled}
        className={`w-full border rounded-lg pl-9 pr-3 py-2 text-sm uppercase bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 transition-all ${hasError ? "border-red-300" : "border-gray-200 dark:border-gray-600"}`}
        placeholder="Type or search reg. no"
        autoComplete="off"
      />
      {open && !disabled && (
        <div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
          {loading ? (
            <div className="px-3 py-3 text-sm text-gray-400 flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
              Loading available vehicles...
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-3 py-3 text-sm text-gray-400">
              {vehicles.length === 0 ? "No available vehicles found" : "No match found"}
            </div>
          ) : (
            filtered.map((v) => (
              <button
                type="button"
                key={v._id}
                onClick={() => handleSelect(v)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between gap-2"
              >
                <span className="font-semibold text-gray-700 dark:text-gray-200">{v.registrationNumber}</span>
                {v.city && <span className="text-[11px] text-gray-400 truncate max-w-[110px]">{v.city}</span>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function AddVehicleModal({ order, vehicle, vehicleIndex, onClose, onRefresh }) {
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [regNo, setRegNo] = useState("");
  const [vehicleDocId, setVehicleDocId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fmtDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const normalizeDate = (d) => {
    if (!d) return null;
    const dt = new Date(d);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
  };

  const handleSubmit = async () => {
    if (!driverName.trim()) return toast.error("Driver name required");
    if (!/^\d{10}$/.test(driverPhone)) return toast.error("Enter valid 10-digit phone");
    if (!regNo.trim()) return toast.error("Registration number required");
    if (!vehicleDocId) return toast.error("Select a vehicle from the list");

    const cleanReg = regNo.trim().toUpperCase().replace(/\s+/g, "");

    setSubmitting(true);
    try {
      const token = getToken();
      const fd = new FormData();
      fd.append("vehicleIndex", String(vehicleIndex));
      fd.append("driverName", driverName.trim());
      fd.append("driverPhone", driverPhone.trim());
      fd.append("vehicleRegistrationNumber", cleanReg);
      fd.append("onRoadStatus", "0");

      await axios.post(`${API_BASE}admin/pipeline/${order._id}/onroad-details`, fd, {
        headers: { Authorization: `Bearer ${token}` },
      });

      try {
        const bookedRemarks = `Booked for Order ${order.orderId} - ${order.name || "Customer"} (${fmtDate(vehicle.fromDate)} to ${fmtDate(vehicle.toDate)})`;
        await axios.put(
          `${API_BASE}api/updateRegistrationVehicleByRegNo/${cleanReg}`,
          {
            currentStatus: "Booked",
            fromDate: normalizeDate(vehicle.fromDate),
            toDate: normalizeDate(vehicle.toDate),
            remarks: bookedRemarks,
            orderId: order._id,
            orderDisplayId: order.orderId || "",
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (statusErr) {
        toast.error("Driver saved, but vehicle status update failed. Please update manually.");
      }

      toast.success("Vehicle added successfully!");
      onRefresh();
      onClose();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to add vehicle");
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
              <Plus size={15} className="text-emerald-500" />
              Add Replacement Vehicle
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Campaign range: {fmtDate(vehicle.fromDate)} → {fmtDate(vehicle.toDate)}
            </p>
          </div>
          <button onClick={onClose}>
            <XCircle size={18} className="text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Driver Name</label>
            <input
              type="text"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              placeholder="Driver name"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Driver Phone</label>
            <input
              type="tel"
              value={driverPhone}
              onChange={(e) => setDriverPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              placeholder="9876543210"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Vehicle Reg. No</label>
            <VehicleRegSelect
              vehicleTypeId={vehicle.vehicleType}
              value={regNo}
              onChange={(val, docId) => {
                setRegNo(val);
                if (docId) setVehicleDocId(docId);
              }}
              disabled={false}
              hasError={false}
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-all disabled:opacity-40"
        >
          {submitting ? "Adding..." : "Add Vehicle"}
        </button>
      </div>
    </div>
  );
}