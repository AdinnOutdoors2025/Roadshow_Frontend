


// @ts-nocheck
"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Truck, User, Phone, Car, Upload, Eye,
  Plus, XCircle, AlertCircle, CheckCircle,
  Clock, ChevronDown, ChevronUp, MapPin,
  Wifi, WifiOff, Camera, Video, TrendingUp,
  Users, AlertTriangle, Navigation, Activity,
  FileText, Shield,
  RefreshCw,
  Loader2,
} from "lucide-react";
import API_BASE from "../../../../baseurl";
import { getToken } from "../../utils/auth";
import { useVehicle } from "../../../context/vehicletypecontext";
import RegNoHistoryModal from "./RegNoHistoryModal";




export default function LiveVehicleRow({ entry, index, order, onRefresh, vehicle, gpsData, bookingStatusMap, onBookingStatusRefresh, onTrackIdFetched, correctVehicleIndex, forceOpen, onForceOpenHandled, onViewDriverRoute, vehicleTypes }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentPhoto, setCommentPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [updateDriverOpen, setUpdateDriverOpen] = useState(false);
  const [updDriverName, setUpdDriverName] = useState(entry.driverName || "");
  const [updDriverPhone, setUpdDriverPhone] = useState(entry.driverPhone || "");
  const [updRegNo, setUpdRegNo] = useState(entry.vehicleRegistrationNumber || "");
  const [updVehicleDocId, setUpdVehicleDocId] = useState(entry.vehicleDocId || "");
  const [updReason, setUpdReason] = useState("");
  const [updateConfirmOpen, setUpdateConfirmOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [unavailableOpen, setUnavailableOpen] = useState(false);
  const [unavailableReason, setUnavailableReason] = useState("");
  const [unavailablePhoto, setUnavailablePhoto] = useState(null);
  const [unavailableInventoryStatus, setUnavailableInventoryStatus] = useState("Unavailable");
  const [unavailableSubmitting, setUnavailableSubmitting] = useState(false);
  const [regHistoryOpen, setRegHistoryOpen] = useState(false);


  // const handleUpdateDriver = async () => {
  //   if (!updDriverName.trim()) return toast.error("Driver name required");
  //   if (!/^\d{10}$/.test(updDriverPhone)) return toast.error("Enter valid 10-digit phone");
  //   if (!updRegNo.trim()) return toast.error("Reg number required");
  //   if (!updVehicleDocId) return toast.error("Select a vehicle from the list");

  //   setUpdating(true);
  //   try {
  //     const cleanReg = (r) => (r || "").replace(/\s+/g, "").toUpperCase();

  //     const isUnavailable = entry.unavailableStatus === true;

  //     const bs = bookingStatusMap?.[cleanReg(entry.vehicleRegistrationNumber)];
  //     const isBookingValid = !!(
  //       bs &&
  //       bs.currentStatus === "Booked" &&
  //       String(bs.orderId) === String(order._id) &&
  //       bs.orderDisplayId === order.orderId
  //     );
  //     const isBookingMismatch = !isBookingValid;
  //     const oldReg = (entry.vehicleRegistrationNumber || "").trim().toUpperCase().replace(/\s+/g, "");
  //     const regChanged = oldReg && oldReg !== cleanReg;

  //     await axios.patch(
  //       `${API_BASE}admin/pipeline/${order._id}/onroad-driver/${entry._id}`,
  //       {
  //         driverName: updDriverName.trim(),
  //         driverPhone: updDriverPhone.trim(),
  //         vehicleRegistrationNumber: cleanReg,
  //       },
  //       { headers: { Authorization: `Bearer ${getToken()}` } }
  //     );

  //     const normalizeDate = (d) => {
  //       if (!d) return null;
  //       const dt = new Date(d);
  //       const y = dt.getFullYear();
  //       const m = String(dt.getMonth() + 1).padStart(2, "0");
  //       const day = String(dt.getDate()).padStart(2, "0");
  //       return `${y}-${m}-${day}`;
  //     };

  //     // ── NEW: friendly date format for remarks text ──
  //     const fmtDate = (d) => {
  //       if (!d) return "—";
  //       return new Date(d).toLocaleDateString("en-IN", {
  //         day: "2-digit", month: "short", year: "numeric",
  //       });
  //     };

  //     // ── NEW: booked remarks + order references ──
  //     const bookedRemarks = `Booked for Order ${order.orderId} - ${order.name || "Customer"} (${fmtDate(vehicle.fromDate)} to ${fmtDate(vehicle.toDate)})`;

  //     try {

  //       if (regChanged) {
  //         try {
  //           await axios.put(
  //             `${API_BASE}api/updateRegistrationVehicleByRegNo/${oldReg}`,
  //             { currentStatus: "Available" },
  //             { headers: { Authorization: `Bearer ${getToken()}` } }
  //           );
  //         } catch (oldVehicleErr) {
  //           console.error("Failed to release old vehicle:", oldVehicleErr);
  //         }
  //       }


  //       await axios.put(
  //         `${API_BASE}api/updateRegistrationVehicleByRegNo/${cleanReg}`,
  //         {
  //           currentStatus: "Booked",
  //           fromDate: normalizeDate(vehicle.fromDate),
  //           toDate: normalizeDate(vehicle.toDate),
  //           remarks: bookedRemarks,
  //           orderId: order._id,
  //           orderDisplayId: order.orderId || "",
  //         },
  //         { headers: { Authorization: `Bearer ${getToken()}` } }
  //       );
  //     } catch (statusErr) {
  //       toast.error("Driver updated, but vehicle status update failed. Please update manually.");
  //     }

  //     toast.success("Driver details updated!");
  //     setUpdateDriverOpen(false);
  //     onRefresh();
  //     onBookingStatusRefresh?.();
  //   } catch (e) {
  //     toast.error(e?.response?.data?.message || "Failed to update");
  //   } finally {
  //     setUpdating(false);
  //   }
  // };


  const handleUpdateDriver = async () => {
    if (!updDriverName.trim()) return toast.error("Driver name required");
    if (!/^\d{10}$/.test(updDriverPhone)) return toast.error("Enter valid 10-digit phone");
    if (!updRegNo.trim()) return toast.error("Vehicle Reg number required");
    if (!updReason.trim()) return toast.error("Reason for this update is required");
    // if (!updVehicleDocId) return toast.error("Select a vehicle from the list");

    setUpdating(true);
    try {
      const cleanReg = (r) => (r || "").replace(/\s+/g, "").toUpperCase();

      const newReg = cleanReg(updRegNo);             
      const oldReg = cleanReg(entry.vehicleRegistrationNumber); 

      const isUnavailable = entry.unavailableStatus === true;

      const bs = bookingStatusMap?.[oldReg];           
      const isBookingValid = !!(
        bs &&
        bs.currentStatus === "Booked" &&
        String(bs.orderId) === String(order._id) &&
        bs.orderDisplayId === order.orderId
      );
      const isBookingMismatch = !isBookingValid;
      const regChanged = oldReg && oldReg !== newReg; 

      await axios.patch(
        `${API_BASE}admin/pipeline/${order._id}/onroad-driver/${entry._id}`,
        {
          driverName: updDriverName.trim(),
          driverPhone: updDriverPhone.trim(),
          vehicleRegistrationNumber: newReg,
          reason: updReason.trim(),
        },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      const normalizeDate = (d) => {
        if (!d) return null;
        const dt = new Date(d);
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, "0");
        const day = String(dt.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
      };

      const fmtDate = (d) => {
        if (!d) return "—";
        return new Date(d).toLocaleDateString("en-IN", {
          day: "2-digit", month: "short", year: "numeric",
        });
      };

      const bookedRemarks = `Booked for Order ${order.orderId} - ${order.name || "Customer"} (${fmtDate(vehicle.fromDate)} to ${fmtDate(vehicle.toDate)})`;

      try {
        if (regChanged) {
          try {
            await axios.put(
              `${API_BASE}api/updateRegistrationVehicleByRegNo/${oldReg}`,   
              { currentStatus: "Available" },
              { headers: { Authorization: `Bearer ${getToken()}` } }
            );
          } catch (oldVehicleErr) {
            console.error("Failed to release old vehicle:", oldVehicleErr);
          }
        }

        await axios.put(
          `${API_BASE}api/updateRegistrationVehicleByRegNo/${newReg}`,    
          {
            currentStatus: "Booked",
            fromDate: normalizeDate(vehicle.fromDate),
            toDate: normalizeDate(vehicle.toDate),
            remarks: bookedRemarks,
            orderId: order._id,
            orderDisplayId: order.orderId || "",
          },
          { headers: { Authorization: `Bearer ${getToken()}` } }
        );
      } catch (statusErr) {
        toast.error("Driver updated, but vehicle status update failed. Please update manually.");
      }

      toast.success("Driver details updated!");
      setUpdateDriverOpen(false);
      setUpdateConfirmOpen(false);
      setUpdReason("");
      onRefresh();
      onBookingStatusRefresh?.();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to update");
    } finally {
      setUpdating(false);
    }
  };


  const fmtDatetime = (s) => {
    if (!s) return "—";
    return new Date(s).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };


  const getImageUrl = (url) => {
    if (!url) return null;

    if (url.startsWith("http")) return url;

    return `${API_BASE.replace("/api", "")}${url}`;
  };



  useEffect(() => {
    if (forceOpen) {
      setModalOpen(true);
      onForceOpenHandled?.();
    }
  }, [forceOpen]);

  const isOnRoad = entry.onRoadStatus === 1;


  const gpsVehicle = gpsData.find(
    (g) => g.vehicleId === entry.vehicleRegistrationNumber
  );

  const lastSeen = gpsVehicle
    ? new Date(gpsVehicle.lastComunicationTime).toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    })
    : "—";

  const distanceCovered = gpsVehicle?.distanceCovered ?? 0;

  const positionLabel =
    gpsVehicle?.position === "M"
      ? "Moving"
      : gpsVehicle?.position === "P"
      ? "Parking"
      : gpsVehicle?.position === "S"
      ? "Idle"
      : "Unavailable";


  const vehicleIssues = (order.onRoadIssues || []).filter(
    (iss) =>
      iss.vehicleIndex === correctVehicleIndex &&
      iss.vehicleRegNo === entry.vehicleRegistrationNumber
  );
  const openCount = vehicleIssues.filter((i) => i.status === "open").length;




  const routeProgress = entry.routeProgress ?? 0;
  const isUnavailable = entry.unavailableStatus === true;

  // ── NEW: booking mismatch check ──
  const cleanRegForCheck = (r) => (r || "").replace(/\s+/g, "").toUpperCase();
  const bs = bookingStatusMap?.[cleanRegForCheck(entry.vehicleRegistrationNumber)];



  // const handleSubmit = async () => {
  //   if (!commentText.trim()) return toast.error("Issue description required");
  //   setSubmitting(true);
  //   try {
  //     const formData = new FormData();
  //     formData.append("vehicleIndex", correctVehicleIndex);
  //     formData.append("issueDescription", commentText.trim());
  //     formData.append("vehicleRegistrationNumber", entry.vehicleRegistrationNumber);
  //     if (commentPhoto) formData.append("issuePhoto", commentPhoto);

  const handleSubmit = async () => {
    if (!commentText.trim()) return toast.error("Issue description required");
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("vehicleIndex", correctVehicleIndex);
      formData.append("issueDescription", commentText.trim());
      formData.append("vehicleRegistrationNumber", entry.vehicleRegistrationNumber);
      formData.append("entryId", entry._id);
      if (commentPhoto) formData.append("issuePhoto", commentPhoto);

      await axios.post(
        `${API_BASE}admin/pipeline/${order._id}/onroad-issue`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Issue reported!");
      setCommentText("");
      setCommentPhoto(null);
      onRefresh();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to report issue");
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewRoute = async () => {
    if (!entry.vehicleRegistrationNumber) {
      toast.error("Vehicle registration number not found");
      return;
    }

    onTrackIdFetched(entry.vehicleRegistrationNumber);
    onViewDriverRoute?.(entry.vehicleRegistrationNumber);
  };

  const handleMarkUnavailable = async () => {
    if (!unavailableReason.trim()) return toast.error("Reason is required");
    setUnavailableSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("vehicleIndex", correctVehicleIndex);
      formData.append("vehicleRegistrationNumber", entry.vehicleRegistrationNumber);
      formData.append("entryId", entry._id);
      formData.append("reason", unavailableReason.trim());
      formData.append("inventoryStatus", unavailableInventoryStatus);
      if (unavailablePhoto) formData.append("unavailablePhoto", unavailablePhoto);

      await axios.post(
        `${API_BASE}admin/pipeline/${order._id}/onroad-unavailable`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Vehicle marked as unavailable!");
      setUnavailableOpen(false);
      setUnavailableReason("");
      setUnavailablePhoto(null);
      setUnavailableInventoryStatus("Unavailable");
      onRefresh();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to mark unavailable");
    } finally {
      setUnavailableSubmitting(false);
    }
  };




  return (
    <>

      <div
        className={`p-4 border-b border-gray-100 dark:border-gray-800 last:border-0 ${!isOnRoad ? "bg-red-50/30 dark:bg-red-900/5" : ""
          }`}
      >
        <div className="flex gap-4 items-start">


          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className="w-20 h-14 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              {entry.vehicleImage ? (
                <img
                  src={getImageUrl(entry.vehicleImage)}
                  alt="vehicle"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Truck size={28} className="text-gray-400" />
              )}
            </div>
            <button
              type="button"
              onClick={() => setRegHistoryOpen(true)}
              disabled={!entry.vehicleRegistrationNumber}
              className="text-xs font-semibold tracking-wide text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded-md hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-all disabled:cursor-default disabled:hover:bg-gray-100 disabled:hover:text-gray-600"
              title="View full history for this registration number"
            >
              {entry.vehicleRegistrationNumber || "—"}
            </button>
            {isUnavailable && (
              <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-red-100 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 text-center leading-tight">
                <XCircle size={10} />
                Unavailable
              </span>
            )}
            
          </div>


          <div className="flex-1 min-w-0 space-y-2">


            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-md font-semibold text-gray-800 dark:text-gray-100">
                Vehicle {String(index + 1).padStart(2, "0")}
              </span>
              {positionLabel === "Moving" ? (
                <span className="flex items-center gap-1 text-sm font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Moving
                </span>
              ) : positionLabel === "Parking" ? (
                <span className="flex items-center gap-1 text-sm font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                  Parking
                </span>
              ) : positionLabel === "Idle" ? (
                <span className="flex items-center gap-1 text-sm font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
                  Idle
                </span>
              ) : (
                <span className="flex items-center gap-1 text-sm font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">
                  Unavailable
                </span>
              )}
            </div>


            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <MapPin size={14} className="flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {entry.currentLocation || (isOnRoad ? "On Road" : "Last seen: En route")}
              </span>
              {(vehicle.campaignLocation || vehicle.fromLocation || vehicle.toLocation) && (
                <span className="text-sm text-gray-400">
                  — {vehicle.campaignLocation || `${vehicle.fromLocation} → ${vehicle.toLocation}`}
                </span>
              )}
            </div>


            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
              <span className="flex items-center gap-1">
                <User size={13} />
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {entry.driverName || "—"}
                </span>
              </span>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <span className="flex items-center gap-1">
                <Users size={13} />
                <span>
                  {
                    (vehicle.promoterCost === 0
                      ? "No Promoter"
                      : "Promoter Available")}
                </span>
              </span>
            </div>


            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 dark:text-gray-500">Route progress</span>
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {routeProgress}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${routeProgress >= 80
                    ? "bg-emerald-500"
                    : routeProgress >= 40
                      ? "bg-blue-500"
                      : "bg-amber-400"
                    }`}
                  style={{ width: `${routeProgress}%` }}
                />
              </div>
            </div>

            {/* Last update */}
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Last update · {lastSeen}
            </p>
            <span className="text-sm text-gray-500">
              {distanceCovered.toFixed(2)} km covered
            </span>
          </div>

          {/* ── Col 3: GPS + Buttons ── */}
          <div className="flex flex-col items-end gap-2.5 flex-shrink-0">

            {/* GPS status */}
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-gray-400">GPS</span>
              {isOnRoad ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    Live
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-xs font-semibold text-red-500">
                    Offline
                  </span>
                </>
              )}
            </div>


            <div className={`flex flex-col gap-1.5 ${isUnavailable ? "cursor-no-drop" : ""}`}>
              <button
                onClick={handleViewRoute}
                disabled={isUnavailable}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 transition-all whitespace-nowrap ${(isUnavailable) ? "opacity-40 cursor-no-drop pointer-events-none" : "hover:bg-gray-50 dark:hover:bg-gray-700"}`}
              >
                <Navigation size={11} />
                View Route
              </button>

              <button
                onClick={() => !(isUnavailable) && setCallModalOpen(true)}
                disabled={isUnavailable}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 transition-all whitespace-nowrap ${(isUnavailable) ? "opacity-40 cursor-no-drop pointer-events-none" : "hover:bg-gray-50 dark:hover:bg-gray-700"}`}
              >
                <Phone size={11} />
                Call Driver
              </button>


              <button
                onClick={() => !(isUnavailable ) && setModalOpen(true)}
                disabled={isUnavailable}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all whitespace-nowrap ${(isUnavailable) ? "opacity-40 cursor-no-drop pointer-events-none border-gray-200 text-gray-400 bg-gray-50" : openCount > 0
                  ? "border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"
                  : "border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                  }`}
              >
                {openCount > 0 ? (
                  <>
                    <AlertCircle size={11} />
                    Issue Summary
                    <span className="ml-0.5 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                      {openCount}
                    </span>
                  </>
                ) : (
                  <>
                    <Plus size={11} />
                    Add Issues
                  </>
                )}
              </button>

              <button
                disabled={isUnavailable}
                onClick={() => {
                  if (isUnavailable) return;
                  setUpdDriverName(entry.driverName || "");
                  setUpdDriverPhone(entry.driverPhone || "");
                  setUpdRegNo(entry.vehicleRegistrationNumber || "");
                  setUpdVehicleDocId(entry.vehicleDocId || "");
                  setUpdReason("");
                  setUpdateDriverOpen(true);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all whitespace-nowrap ${isUnavailable ? "opacity-40 cursor-no-drop pointer-events-none border-gray-200 text-gray-400 bg-gray-50 dark:bg-gray-800 dark:border-gray-700" : "border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30"}`}
              >
                <User size={11} />
                Update Driver
              </button>

              {isUnavailable ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 whitespace-nowrap">
                  <XCircle size={11} />
                  Unavailable
                </div>
              ) : (
                <button
                  onClick={() => setUnavailableOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all whitespace-nowrap"
                >
                  <AlertTriangle size={11} />
                  Unavailable
                </button>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* ── Issues Modal (unchanged) ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
              <div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  Issues · {entry.driverName}
                </h3>
                <p className="text-sm text-gray-400 mt-0.5">
                  {entry.vehicleRegistrationNumber}
                </p>
              </div>
              <button onClick={() => setModalOpen(false)}>
                <XCircle size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                Add a comment ·{" "}
                <span className="text-orange-500">Issue Report</span>
              </p>
              <textarea
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                rows={3}
                placeholder="Type your issue description here..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <div className="flex items-center justify-between mt-2">
                {commentPhoto ? (
                  <div className="flex items-center gap-2">
                    <img
                      src={URL.createObjectURL(commentPhoto)}
                      className="w-8 h-8 rounded-lg object-cover border border-gray-200"
                      alt="preview"
                    />
                    <span className="text-xs text-gray-500 truncate max-w-[120px]">
                      {commentPhoto.name}
                    </span>
                    <button
                      onClick={() => setCommentPhoto(null)}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      <XCircle size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer hover:bg-gray-50 transition-all">
                    <Upload size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-500">Attach File</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        setCommentPhoto(e.target.files?.[0] || null)
                      }
                    />
                  </label>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !commentText.trim()}
                  className="px-4 py-1.5 rounded-lg bg-gray-700 dark:bg-gray-600 text-white text-xs font-semibold hover:bg-gray-800 disabled:opacity-40 transition-all"
                >
                  {submitting ? "Submitting..." : "Add Issues"}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <p className="text-md font-semibold text-gray-600 dark:text-gray-400 mb-3">
                Issues History
              </p>
              {vehicleIssues.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">
                  No issues reported yet
                </p>
              ) : (
                <div className="space-y-4">
                  {[...vehicleIssues].reverse().map((iss, i) => (
                    <div key={iss._id || i} className="flex gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ${iss.status === "open"
                          ? "bg-orange-500"
                          : "bg-emerald-500"
                          }`}
                      >
                        {(iss.reportedBy || "U")[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {iss.reportedBy}
                          </span>
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded font-medium ${iss.status === "open"
                              ? "bg-orange-100 text-orange-600"
                              : "bg-emerald-100 text-emerald-600"
                              }`}
                          >
                            {iss.status === "open" ? "Open Issue" : "Resolved"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                          {iss.issueDescription}
                        </p>
                        {iss.issuePhoto && (
                          <a
                            href={getImageUrl(iss.issuePhoto)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <img
                              src={getImageUrl(iss.issuePhoto)}
                              className="w-14 h-12 rounded-lg object-cover border mb-1 hover:opacity-80"
                              alt="issue"
                            />
                          </a>
                        )}
                        <p className="text-xs text-gray-400">
                          {fmtDatetime(iss.reportedAt)}
                        </p>
                        {iss.status === "open" && (
                          <ResolveInlineForm
                            iss={iss}
                            order={order}
                            onRefresh={onRefresh}
                          />
                        )}
                        {iss.status === "resolved" && (
                          <div className="mt-2 pl-3 border-l-2 border-emerald-300">
                            <div className="flex items-center gap-2 mb-0.5">
                              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {(iss.resolvedBy || "U")[0].toUpperCase()}
                              </div>
                              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                {iss.resolvedBy}
                              </span>
                              <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-600 font-medium">
                                Resolution
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 ml-8">
                              {iss.resolveDescription}
                            </p>
                            {iss.resolvePhoto && (
                              <a
                                href={getImageUrl(iss.resolvePhoto)}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <img
                                  src={getImageUrl(iss.resolvePhoto)}
                                  className="w-14 h-12 rounded-lg object-cover border border-emerald-200 mt-1 hover:opacity-80"
                                  alt="resolve"
                                />
                              </a>
                            )}
                            <p className="text-xs text-gray-400 ml-8">
                              {fmtDatetime(iss.resolvedAt)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Call Driver Modal ── */}
      {callModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-xs p-6 flex flex-col items-center gap-4">

            {/* Close button */}
            <div className="w-full flex justify-end">
              <button onClick={() => setCallModalOpen(false)}>
                <XCircle size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            {/* Avatar */}
            <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <Phone size={24} className="text-blue-500" />
            </div>

            {/* Driver info */}
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                {entry.driverName || "Driver"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {entry.vehicleRegistrationNumber}
              </p>
            </div>

            {/* Phone number */}
            <div className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-center">
              <p className="text-xs text-gray-400 mb-1">Phone number</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 tracking-wide">
                {entry.driverPhone || "—"}
              </p>
            </div>

            {/* Call button */}
            <a

              href={`tel:${entry.driverPhone}`}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-all"
            >
              <Phone size={15} />
              Call Now
            </a>

            {/* Cancel */}
            <button
              onClick={() => setCallModalOpen(false)}
              className="text-xs text-gray-400 hover:text-gray-600 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}


      {/* ── Update Driver Modal ── */}
      {updateDriverOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Update Driver</h3>
                <p className="text-xs text-gray-400 mt-0.5">{entry.vehicleRegistrationNumber}</p>
              </div>
              <button onClick={() => setUpdateDriverOpen(false)}>
                <XCircle size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Driver Name</label>
                <input
                  type="text"
                  value={updDriverName}
                  onChange={e => setUpdDriverName(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Driver name"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Phone</label>
                <input
                  type="tel"
                  value={updDriverPhone}
                  onChange={e => setUpdDriverPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="9876543210"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Reg. No</label>
                <VehicleRegSelect
                  vehicleTypeId={vehicle.vehicleType}
                  value={updRegNo}
                  onChange={(val, docId) => {
                    setUpdRegNo(val);
                    if (docId) setUpdVehicleDocId(docId);
                  }}
                  disabled={false}
                  hasError={false}
                />
              </div>
            </div>

            <button
              onClick={() => {
                if (!updDriverName.trim()) return toast.error("Driver name required");
                if (!/^\d{10}$/.test(updDriverPhone)) return toast.error("Enter valid 10-digit phone");
                if (!updRegNo.trim()) return toast.error("Vehicle Reg number required");
                setUpdateConfirmOpen(true);
              }}
              disabled={
                updating ||
                (updDriverName.trim() === (entry.driverName || "").trim() &&
                  updDriverPhone.trim() === (entry.driverPhone || "").trim() &&
                  updRegNo.trim().toUpperCase() === (entry.vehicleRegistrationNumber || "").trim().toUpperCase())
              }
              className="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-all disabled:opacity-40"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* ── Update Driver: confirmation + mandatory reason ── */}
      {updateConfirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Confirm Driver Update</h3>
              <button onClick={() => setUpdateConfirmOpen(false)}>
                <XCircle size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10 p-3 text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <p><b>Driver:</b> {entry.driverName || "—"} → {updDriverName}</p>
              <p><b>Phone:</b> {entry.driverPhone || "—"} → {updDriverPhone}</p>
              <p><b>Reg No:</b> {entry.vehicleRegistrationNumber || "—"} → {updRegNo}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Reason for update <span className="text-red-400">*</span>
              </label>
              <textarea
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                rows={3}
                placeholder="Why is this driver/vehicle being updated?"
                value={updReason}
                onChange={(e) => setUpdReason(e.target.value)}
              />
            </div>

            <button
              onClick={handleUpdateDriver}
              disabled={updating || !updReason.trim()}
              className="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-all disabled:opacity-40"
            >
              {updating ? "Updating..." : "Confirm & Save"}
            </button>
          </div>
        </div>
      )}


      {unavailableOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
              <div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  Mark Unavailable · {entry.driverName}
                </h3>
                <p className="text-sm text-gray-400 mt-0.5">
                  {entry.vehicleRegistrationNumber}
                </p>
              </div>
              <button onClick={() => setUnavailableOpen(false)}>
                <XCircle size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <div className="px-5 py-4 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Inventory Status
                </label>
                <div className="flex gap-2">
                  {["Unavailable", "Damaged", "Under Maintenance"].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setUnavailableInventoryStatus(status)}
                      className={`flex-1 px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                        unavailableInventoryStatus === status
                          ? "border-orange-400 bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
                          : "border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Add a comment ·{" "}
                  <span className="text-orange-500">Unavailable Report</span>
                </p>
                <textarea
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
                  rows={3}
                  placeholder="Type your reason here..."
                  value={unavailableReason}
                  onChange={(e) => setUnavailableReason(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                {unavailablePhoto ? (
                  <div className="flex items-center gap-2">
                    <img
                      src={URL.createObjectURL(unavailablePhoto)}
                      className="w-8 h-8 rounded-lg object-cover border border-gray-200"
                      alt="preview"
                    />
                    <span className="text-xs text-gray-500 truncate max-w-[120px]">
                      {unavailablePhoto.name}
                    </span>
                    <button
                      onClick={() => setUnavailablePhoto(null)}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      <XCircle size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer hover:bg-gray-50 transition-all">
                    <Upload size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-500">Attach File (Optional)</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setUnavailablePhoto(e.target.files?.[0] || null)}
                    />
                  </label>
                )}
                <button
                  onClick={handleMarkUnavailable}
                  disabled={unavailableSubmitting || !unavailableReason.trim()}
                  className="px-4 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 disabled:opacity-40 transition-all"
                >
                  {unavailableSubmitting ? "Submitting..." : "Mark Unavailable"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {regHistoryOpen && (
        <RegNoHistoryModal
          order={order}
          regNo={entry.vehicleRegistrationNumber}
          onClose={() => setRegHistoryOpen(false)}
        />
      )}
    </>
  );
}


function VehicleRegSelect({ vehicleTypeId, value, onChange, disabled, hasError }) {
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [fetched, setFetched] = useState(false);
  const wrapperRef = useRef(null);


  useEffect(() => {
    setQuery(value || "");
  }, [value]);


  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
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
          if (
            rv?.statusAvailability?.currentStatus === "Available" &&
            rv.registrationNumber
          ) {
            flat.push({
              _id: rv._id,
              vehicleId: rv.vehicleId,
              registrationNumber: rv.registrationNumber,
              city: rv.city,
              vehicleDescription: doc.vehicleDescription,
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
      <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={handleFocus}
        disabled={disabled}
        className={`w-full border rounded-lg pl-9 pr-3 py-2.5 text-sm uppercase bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all ${hasError ? "border-red-300" : "border-gray-200 dark:border-gray-600"
          }`}
        placeholder="Type or search reg. no (e.g. 3057)"
        autoComplete="off"
      />

      {open && !disabled && (
        <div className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
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
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  {v.registrationNumber}
                </span>
                {v.city && (
                  <span className="text-[11px] text-gray-400 truncate max-w-[110px]">{v.city}</span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}



function ResolveInlineForm({ iss, order, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [desc, setDesc] = useState("");
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleResolve = async () => {
    if (!desc.trim()) return toast.error("Resolution description required");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("resolveDescription", desc.trim());
      if (photo) formData.append("resolvePhoto", photo);

      await axios.patch(
        `${API_BASE}admin/pipeline/${order._id}/onroad-issue/${iss._id}/resolve`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Issue resolved!");
      setShowForm(false);
      setDesc("");
      setPhoto(null);

      onRefresh();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to resolve");
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="mt-1.5 flex items-center gap-1 px-2 py-1 rounded-lg border border-emerald-200 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-all"
      >
        <CheckCircle size={11} /> Mark as Resolved
      </button>
    );
  }

  return (
    <div className="mt-2 pl-3 border-l-2 border-emerald-300 space-y-2">
      <textarea
        className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-2 text-xs bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400"
        rows={2}
        placeholder="How was this resolved?"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />
      {photo ? (
        <div className="flex items-center gap-2">
          <img src={URL.createObjectURL(photo)} className="w-8 h-8 rounded object-cover border" alt="" />
          <span className="text-xs text-gray-500 truncate max-w-[100px]">{photo.name}</span>
          <button onClick={() => setPhoto(null)}><XCircle size={13} className="text-red-400" /></button>
        </div>
      ) : (
        <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-dashed border-emerald-300 bg-white cursor-pointer hover:bg-emerald-50 w-fit">
          <Upload size={11} className="text-emerald-400" />
          <span className="text-xs text-emerald-600">Attach photo</span>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
        </label>
      )}
      <div className="flex gap-2">
        <button onClick={() => setShowForm(false)} className="px-3 py-1 rounded-lg border border-gray-200 text-xs text-gray-500 hover:bg-gray-50">Cancel</button>
        <button
          onClick={handleResolve}
          disabled={loading}
          className="px-3 py-1 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 disabled:opacity-50"
        >
          {loading ? "Resolving..." : "Submit"}
        </button>
      </div>
    </div>
  );
}