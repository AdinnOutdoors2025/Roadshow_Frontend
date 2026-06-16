
/* eslint-disable */
// @ts-nocheck
"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Truck, User, Phone, Car, Upload, Eye,
  Plus, XCircle, AlertCircle,
  CheckCircle, Clock, ChevronDown, ChevronUp,
} from "lucide-react";
import API_BASE from "../../../../baseurl";
import { getToken } from "../../utils/auth";
import { useVehicle } from '../../../context/vehicletypecontext';

const fmtDate = (s?: string) => {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

const fmtDatetime = (s?: string) => {
  if (!s) return "—";
  return new Date(s).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};


function DriverForm({ vehicleIndex, slotIndex, orderId, existingEntry, onSaved }) {
  const [driverName, setDriverName] = useState(existingEntry?.driverName || "");
  const [driverPhone, setDriverPhone] = useState(existingEntry?.driverPhone || "");
  const [regNo, setRegNo] = useState(existingEntry?.vehicleRegistrationNumber || "");
  const [gatepassFile, setGatepassFile] = useState(null);
  const [gatepassPreview, setGatepassPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const fileRef = useRef(null);

  const isSaved = !!existingEntry?._id;

  const validate = () => {
    const e = {};
    if (!driverName.trim()) e.driverName = "Driver name required";
    if (!driverPhone.trim()) e.driverPhone = "Phone required";
    else if (!/^\d{10}$/.test(driverPhone)) e.driverPhone = "Enter valid 10-digit number";
    if (!regNo.trim()) e.regNo = "Registration number required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const token = getToken();
      const fd = new FormData();
      fd.append("vehicleIndex", String(vehicleIndex));
      fd.append("driverName", driverName.trim());
      fd.append("driverPhone", driverPhone.trim());
      fd.append("vehicleRegistrationNumber", regNo.trim().toUpperCase());
      fd.append("onRoadStatus", "0");
      if (gatepassFile) fd.append("gatepassPhoto", gatepassFile);

      await axios.post(`${API_BASE}admin/pipeline/${orderId}/onroad-details`, fd, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`Driver ${slotIndex + 1} details saved!`);
      onSaved();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (file) => {
    if (!file) return;
    const valid = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!valid.includes(file.type)) { toast.error("Only image files allowed"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB allowed"); return; }
    if (gatepassPreview) URL.revokeObjectURL(gatepassPreview);
    setGatepassFile(file);
    setGatepassPreview(URL.createObjectURL(file));
  };

  return (
    <div className={`rounded-xl border p-4 space-y-3 transition-all bg-white dark:bg-gray-900 ${
      isSaved
        ? "border-gray-200 dark:border-gray-700"
        : "border-dashed border-gray-200 dark:border-gray-700"
    }`}>

     
      {isSaved && (
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[13px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
            <CheckCircle size={16} /> Saved
          </span>
          <span className="text-sm text-gray-400">{fmtDatetime(existingEntry?.uploadedAt)}</span>
        </div>
      )}

     
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

        {/* Driver Name */}
        <div>
          <label className="block text-base font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
            Driver Name <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
            <input
              type="text"
              value={driverName}
              onChange={e => setDriverName(e.target.value)}
              disabled={isSaved}
              className={`w-full border rounded-lg pl-9 pr-3 py-2.5 text-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all ${
                errors.driverName ? "border-red-300" : "border-gray-200 dark:border-gray-600"
              }`}
              placeholder="Enter driver name"
            />
          </div>
          {errors.driverName && (
            <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
              {errors.driverName}
            </p>
          )}
        </div>

        {/* Driver Phone */}
        <div>
          <label className="block text-base font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
            Driver Phone <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">+91</span>
            {/* <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" /> */}
            <input
              type="tel"
              value={driverPhone}
              onChange={e => setDriverPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              disabled={isSaved}
              maxLength={10}
              className={`w-full border rounded-lg pl-10 pr-9 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all ${
                errors.driverPhone ? "border-red-300" : "border-gray-200 dark:border-gray-600"
              }`}
              placeholder="9876543210"
            />
          </div>
          {errors.driverPhone && (
            <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
             {errors.driverPhone}
            </p>
          )}
        </div>

        {/* Reg Number */}
        <div>
          <label className="block text-base font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
            Vehicle Reg. No <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={regNo}
              onChange={e => setRegNo(e.target.value.toUpperCase())}
              disabled={isSaved}
              className={`w-full border rounded-lg pl-9 pr-3 py-2.5 text-sm uppercase bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all ${
                errors.regNo ? "border-red-300" : "border-gray-200 dark:border-gray-600"
              }`}
              placeholder="TN01AB1234"
            />
          </div>
          {errors.regNo && (
            <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
              {errors.regNo}
            </p>
          )}
        </div>

        {/* Gatepass Photo */}
        <div>
          <label className="block text-base font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
            Gatepass Photo <span className="text-gray-600 text-[14px] font-normal">(Optional)</span>
          </label>
          {isSaved && existingEntry?.gatepassPhoto ? (
            <a
              href={existingEntry.gatepassPhoto.startsWith("http") ? existingEntry.gatepassPhoto : `http://localhost:3001${existingEntry.gatepassPhoto}`}
              target="_blank" rel="noreferrer"
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 text-sm font-medium hover:bg-gray-100 transition-all"
            >
              <Eye size={15} className="text-gray-400" /> View Gatepass
            </a>
          ) : isSaved ? (
            <div className="px-3 py-2.5 rounded-lg border border-gray-200 text-xs text-gray-400 bg-gray-50 dark:bg-gray-800">
              No photo uploaded
            </div>
          ) : (
            <>
              {gatepassPreview ? (
                <div className="relative">
                  <img src={gatepassPreview} alt="Gatepass" className="w-full h-20 object-cover rounded-lg border border-gray-200" />
                  <button
                    onClick={() => { setGatepassFile(null); setGatepassPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-400 flex items-center justify-center"
                  >
                    <XCircle size={10} className="text-white" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <div className="border border-dashed border-gray-200 rounded-lg p-3 hover:border-gray-300 hover:bg-gray-50 transition-all text-center">
                    <Upload className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                    <span className="text-sm text-gray-500">Click to upload</span>
                  </div>
                  <input type="file" accept="image/*" ref={fileRef} onChange={e => handleFileChange(e.target.files?.[0] || null)} className="hidden" />
                </label>
              )}
            </>
          )}
        </div>
      </div>

      {/* Save Button */}
      {!isSaved && (
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-gray-400 hover:bg-gray-450 disabled:opacity-40 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          {loading ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
          ) : (
            <><Plus size={14} /> Save Driver Details</>
          )}
        </button>
      )}

      {/* Saved success bar */}
      {isSaved && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
          <CheckCircle size={13} className="text-emerald-500 flex-shrink-0" />
          <span className="text-md font-medium text-emerald-600 dark:text-emerald-400">Driver details saved successfully</span>
        </div>
      )}
    </div>
  );
}

// ─── Vehicle Execution Card ───────────────────────────────────────────────────
function VehicleExecutionCard({ vehicle, vehicleIndex, order, onRefresh ,vehicleTypes }) {
  const [open, setOpen] = useState(false);
  const [activeDriverTab, setActiveDriverTab] = useState(0);
  const [toggling, setToggling] = useState(false);


 

  const getVehicleTypeName = (vehicleTypeId) => {
    if (!vehicleTypeId || !vehicleTypes) return "";
    const v = vehicleTypes.find((vt) => vt._id === vehicleTypeId);
    return v?.typeName || vehicleTypeId;
  };

  const vehicleEntries = (order.onRoadExecutionArray || []).filter(
    (e) => e.vehicleIndex === vehicleIndex
  );

  const quantity = vehicle.quantity || 1;
  const savedCount = vehicleEntries.length;
  const allDriversSaved = savedCount >= quantity;
  const isVehicleOnRoad = vehicleEntries.some((e) => e.onRoadStatus === 1);

  const handleDriverSaved = async () => {
    await onRefresh();
  };


  const handleVehicleToggle = async () => {
    if (!allDriversSaved || isVehicleOnRoad) return;
    setToggling(true);
    try {
      const token = getToken();
      for (const entry of vehicleEntries) {
        await axios.patch(
          `${API_BASE}admin/pipeline/${order._id}/onroad-status/${entry._id}`,
          { onRoadStatus: 1 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      toast.success(`${quantity} vehicle${quantity > 1 ? "s" : ""} marked On Road!`);
      onRefresh();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to update status");
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className={`rounded-xl border overflow-hidden transition-all ${
      isVehicleOnRoad
        ? "border-emerald-200 dark:border-emerald-800"
        : "border-gray-200 dark:border-gray-700"
    } bg-white dark:bg-gray-900 shadow-sm hover:shadow-md`}>

      {/* ── Card Header ── */}
      <div
        className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
        onClick={() => setOpen(!open)}
      >
        {/* Vehicle number badge - image style */}
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
          isVehicleOnRoad
            ? "bg-emerald-500"
            : allDriversSaved
            ? "bg-blue-500"
            : "bg-gray-400"
        }`}>
          V{vehicleIndex + 1}
        </div>

        {/* Vehicle info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {getVehicleTypeName(vehicle.vehicleType)}
            </p>
            
            <span className="text-[15px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 font-medium">
              {vehicle.campaignType || "—"}
            </span>
            {isVehicleOnRoad && (
              <span className="text-[14px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-semibold border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
                On Road
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400 flex-wrap">
            <span className="flex text-sm items-center gap-1">
              <Clock size={16} />
              {fmtDate(vehicle.fromDate)} → {fmtDate(vehicle.toDate)}
            </span>
            <span className=" text-sm">· {vehicle.totalDays}d ·</span>
            <span className="flex text-sm items-center gap-1">
              <Truck size={16} />
              {quantity} {quantity === 1 ? "vehicle" : "vehicles"}
            </span>
          </div>
          {vehicle.campaignName && (
            <p className="text-base text-gray-400 mt-0.5">{vehicle.campaignName}</p>
          )}
        </div>

        {/* Right side - amount style like image + drivers count */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
            allDriversSaved
              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
              : savedCount > 0
              ? "bg-orange-50 text-orange-500 dark:bg-orange-900/20 dark:text-orange-400"
              : "bg-gray-100 text-gray-400 dark:bg-gray-800"
          }`}>
            {savedCount}/{quantity} drivers
          </span>
          {open
            ? <ChevronUp size={14} className="text-gray-300" />
            : <ChevronDown size={14} className="text-gray-300" />
          }
        </div>
      </div>

      {/* ── Expanded Section ── */}
      {open && (
        <div className="border-t border-gray-100 dark:border-gray-800">

          {/* ── Driver Tabs ── */}
          <div className="flex border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 px-4 overflow-x-auto gap-0">
            {Array.from({ length: quantity }).map((_, i) => {
              const saved = !!vehicleEntries[i]?._id;
              const isActive = activeDriverTab === i;
              return (
                <button
                  key={i}
                  onClick={() => setActiveDriverTab(i)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-base font-semibold border-b-2 transition-all whitespace-nowrap flex-shrink-0 ${
                    isActive
                      ? "border-gray-800 text-gray-800 dark:border-gray-200 dark:text-gray-200 bg-white dark:bg-gray-900"
                      : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  }`}
                >
                  Driver {i + 1}
                  {saved ? (
                    <CheckCircle size={11} className="text-emerald-500 flex-shrink-0" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* ── Active Driver Form ── */}
          <div className="p-4">
            <DriverForm
              key={`${vehicleIndex}-${activeDriverTab}`}
              vehicleIndex={vehicleIndex}
              slotIndex={activeDriverTab}
              orderId={order._id}
              existingEntry={vehicleEntries[activeDriverTab] || null}
              onSaved={handleDriverSaved}
            />
          </div>

          {/* ── On Road Toggle ── */}
          <div className="px-4 pb-4">
            {allDriversSaved ? (
              <div className="flex items-center gap-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3">
                <div className="flex-1">
                  <p className="text-md font-semibold text-gray-700 dark:text-gray-300">On Road Status</p>
                  <p className="text-md text-gray-400 mt-0.5">
                    {isVehicleOnRoad
                      ? `${quantity} vehicle${quantity > 1 ? "s" : ""} currently on road`
                      : `Mark ${quantity} vehicle${quantity > 1 ? "s" : ""} as on road`}
                  </p>
                </div>

              
                <button
                  type="button"
                  onClick={handleVehicleToggle}
                  disabled={toggling || isVehicleOnRoad}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 disabled:cursor-not-allowed flex-shrink-0 ${
                    isVehicleOnRoad
                      ? "bg-emerald-500"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                    isVehicleOnRoad ? "translate-x-6" : "translate-x-1"
                  }`} />
                </button>

                <span className={`text-sm font-semibold min-w-[60px] ${
                  isVehicleOnRoad
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-gray-400"
                }`}>
                  {toggling ? (
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : isVehicleOnRoad ? "On Road" : "Off Road"}
                </span>
              </div>
            ) : savedCount > 0 ? (
              
              <div className="flex items-center gap-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 opacity-40">
                <div className="flex-1">
                  <p className="text-md font-semibold text-gray-500">On Road Status</p>
                  <p className="text-md text-gray-400 mt-0.5">
                    {quantity - savedCount} more driver{quantity - savedCount > 1 ? "s" : ""} needed
                  </p>
                </div>
                <button disabled className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 dark:bg-gray-600 cursor-not-allowed flex-shrink-0">
                  <span className="inline-block h-4 w-4 translate-x-1 transform rounded-full bg-white shadow-md" />
                </button>
                <span className="text-sm text-gray-400 min-w-[60px]">Locked</span>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}


export default function ProjectExecutionTab({ order, onRefresh }) {
  const vehicles = order.bookingItems || [];
  const allEntries = order.onRoadExecutionArray || [];
  const totalOnRoad = allEntries.filter((e) => e.onRoadStatus === 1).length;
  const totalVehicles = vehicles.reduce((sum, v) => sum + (v.quantity || 1), 0);

    const { vehicleTypes, fetchVehicleTypes } = useVehicle();

     useEffect(() => {
        fetchVehicleTypes()
    }, [])

  if (vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <Truck className="w-9 h-9 text-gray-300" />
        </div>
        <p className="text-sm font-semibold text-gray-400">No vehicles found</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Project Execution</h3>
          <p className="text-base text-gray-400 mt-0.5">
            {vehicles.length} booking item{vehicles.length > 1 ? "s" : ""} · {totalVehicles} total vehicles
          </p>
        </div>
        {totalOnRoad > 0 && (
          <span className="text-sm font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
            {totalOnRoad} On Road
          </span>
        )}
      </div>

     
      {vehicles.map((vehicle, idx) => (
        
        <VehicleExecutionCard
          key={idx}
          vehicle={vehicle}
          vehicleIndex={idx}
          order={order}
          onRefresh={onRefresh}
          vehicleTypes={vehicleTypes}
        />

        
      ))}
    </div>
  );
}
