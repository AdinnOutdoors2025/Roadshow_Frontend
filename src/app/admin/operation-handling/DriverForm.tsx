

/* eslint-disable */
// @ts-nocheck
"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Truck, User, Phone, Car, Upload, Eye,
  Plus, History, XCircle, AlertCircle,
  CheckCircle, Clock, ChevronDown, ChevronUp,
  ToggleLeft, ToggleRight,
} from "lucide-react";
import API_BASE from "../../../../baseurl";
import { getToken } from "../../utils/auth";
import { useVehicle } from '../../../context/vehicletypecontext';

interface Order {
  _id: string;
  orderId: string;
  name: string;
  bookingItems: any[];
  onRoadExecutionArray?: any[];
  pipelineStatus: string;
  handlerName?: string;
}

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




export default function DriverForm({
  vehicleIndex,
  slotIndex,
  orderId,
  existingEntry,
  onSaved,
}: {
  vehicleIndex: number;
  slotIndex: number;
  orderId: string;
  existingEntry?: any;
  onSaved: () => void;
}) {
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
    <div className={`rounded-xl border-2 p-4 space-y-3 transition-all ${
      isSaved
        ? "border-teal-200 bg-teal-50/20 dark:bg-teal-900/10 dark:border-teal-800"
        : "border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20"
    }`}>
     
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
            isSaved ? "bg-teal-500" : "bg-gray-400"
          }`}>
            {slotIndex + 1}
          </div>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Driver {slotIndex + 1}
          </span>
          {isSaved && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 flex items-center gap-1">
              <CheckCircle size={9} /> Saved
            </span>
          )}
        </div>
        {isSaved && (
          <span className="text-xs text-gray-400">{fmtDatetime(existingEntry?.uploadedAt)}</span>
        )}
      </div>

   
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Driver Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={driverName}
              onChange={e => setDriverName(e.target.value)}
              disabled={isSaved}
              className={`w-full border rounded-lg pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all ${
                errors.driverName ? "border-red-400" : "border-gray-200 dark:border-gray-600"
              }`}
              placeholder="Enter driver name"
            />
          </div>
          {errors.driverName && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              {errors.driverName}
            </p>
          )}
        </div>

      
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Driver Phone <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">+91</span>
            <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="tel"
              value={driverPhone}
              onChange={e => setDriverPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              disabled={isSaved}
              maxLength={10}
              className={`w-full border rounded-lg pl-10 pr-9 py-2 text-sm bg-white dark:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all ${
                errors.driverPhone ? "border-red-400" : "border-gray-200 dark:border-gray-600"
              }`}
              placeholder="9876543210"
            />
          </div>
          {errors.driverPhone && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              {errors.driverPhone}
            </p>
          )}
        </div>

    
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Vehicle Reg. No <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={regNo}
              onChange={e => setRegNo(e.target.value.toUpperCase())}
              disabled={isSaved}
              className={`w-full border rounded-lg pl-9 pr-3 py-2 text-sm uppercase bg-white dark:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all ${
                errors.regNo ? "border-red-400" : "border-gray-200 dark:border-gray-600"
              }`}
              placeholder="TN01AB1234"
            />
          </div>
          {errors.regNo && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              {errors.regNo}
            </p>
          )}
        </div>

   
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Gatepass Photo <span className="text-gray-400 text-[10px]">(Optional)</span>
          </label>
          {isSaved && existingEntry?.gatepassPhoto ? (
            <a
              href={
                existingEntry.gatepassPhoto.startsWith("http")
                  ? existingEntry.gatepassPhoto
                  : `http://localhost:3001${existingEntry.gatepassPhoto}`
              }
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-green-200 bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100 transition-all"
            >
              <Eye size={12} /> View Gatepass
            </a>
          ) : isSaved ? (
            <div className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-xs text-gray-400 bg-gray-50 dark:bg-gray-800">
              No photo uploaded
            </div>
          ) : (
            <>
              {gatepassPreview ? (
                <div className="relative">
                  <img
                    src={gatepassPreview}
                    alt="Gatepass"
                    className="w-full h-20 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={() => {
                      setGatepassFile(null);
                      setGatepassPreview(null);
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center"
                  >
                    <XCircle size={10} className="text-white" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <div className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg p-3 hover:border-teal-400 transition-colors text-center">
                    <Upload className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                    <span className="text-xs text-gray-500">Click to upload</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileRef}
                    onChange={e => handleFileChange(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              )}
            </>
          )}
        </div>
      </div>

      
      {!isSaved && (
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Plus size={14} /> Save Driver Details
            </>
          )}
        </button>
      )}

      
      {isSaved && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800">
          <CheckCircle size={14} className="text-teal-500 flex-shrink-0" />
          <span className="text-sm font-medium text-teal-700 dark:text-teal-400">
            Driver details saved successfully
          </span>
        </div>
      )}
    </div>
  );
}