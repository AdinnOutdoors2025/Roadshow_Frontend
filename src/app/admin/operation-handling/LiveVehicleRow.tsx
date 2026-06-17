

/* eslint-disable */
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




export default function LiveVehicleRow({ entry, index, order, onRefresh, vehicle, gpsData, onTrackIdFetched, correctVehicleIndex, forceOpen, onForceOpenHandled }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentPhoto, setCommentPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [callModalOpen, setCallModalOpen] = useState(false);




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

  const isIgnitionOn = gpsVehicle?.ignitionStatus === "ON";
  const distanceCovered = gpsVehicle?.distanceCovered ?? 0;


  const vehicleIssues = (order.onRoadIssues || []).filter(
    (iss) =>
      iss.vehicleIndex === correctVehicleIndex &&
      iss.vehicleRegNo === entry.vehicleRegistrationNumber
  );
  const openCount = vehicleIssues.filter((i) => i.status === "open").length;




  const routeProgress = entry.routeProgress ?? 0;

  const handleSubmit = async () => {
    if (!commentText.trim()) return toast.error("Issue description required");
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("vehicleIndex", correctVehicleIndex);
      formData.append("issueDescription", commentText.trim());
      formData.append("vehicleRegistrationNumber", entry.vehicleRegistrationNumber);
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
            <span className="text-xs font-semibold tracking-wide text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded-md">
              {entry.vehicleRegistrationNumber || "—"}
            </span>
          </div>


          <div className="flex-1 min-w-0 space-y-2">


            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-md font-semibold text-gray-800 dark:text-gray-100">
                Vehicle {String(index + 1).padStart(2, "0")}
              </span>
              {isIgnitionOn ? (
                <span className="flex items-center gap-1 text-sm font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Running
                </span>
              ) : (
                <span className="flex items-center gap-1 text-sm font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">
                  Offline
                </span>
              )}
            </div>


            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <MapPin size={14} className="flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {entry.currentLocation || (isOnRoad ? "On Road" : "Last seen: En route")}
              </span>
              {(vehicle.fromLocation || vehicle.toLocation) && (
                <span className="text-sm text-gray-400">
                  — {vehicle.fromLocation} → {vehicle.toLocation}
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


            <div className="flex flex-col gap-1.5">
              <button
                onClick={handleViewRoute}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all whitespace-nowrap"
              >
                <Navigation size={11} />
                View Route
              </button>

              {/* <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all whitespace-nowrap">
                <Phone size={11} />
                Call Driver
              </button> */}

              <button
                onClick={() => setCallModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all whitespace-nowrap"
              >
                <Phone size={11} />
                Call Driver
              </button>


              <button
                onClick={() => setModalOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all whitespace-nowrap ${openCount > 0
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
    </>
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