

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
import ReplaceVehicleModal from "./ReplaceVehicleModal";




export default function VehicleUnavailableRow({ entry, index, order, onRefresh, vehicle, vehicleTypes, gpsData, correctVehicleIndex, forceOpen, onForceOpenHandled }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [commentPhoto, setCommentPhoto] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [callModalOpen, setCallModalOpen] = useState(false);
    const [updateDriverOpen, setUpdateDriverOpen] = useState(false);
    const [updDriverName, setUpdDriverName] = useState(entry.driverName || "");
    const [updDriverPhone, setUpdDriverPhone] = useState(entry.driverPhone || "");
    const [updRegNo, setUpdRegNo] = useState(entry.vehicleRegistrationNumber || "");
    const [updating, setUpdating] = useState(false);
    const [availableOpen, setAvailableOpen] = useState(false);
    const [availableSubmitting, setAvailableSubmitting] = useState(false);
    const [availableReason, setAvailableReason] = useState("");
    const [availablePhoto, setAvailablePhoto] = useState(null);
    const [replaceOpen, setReplaceOpen] = useState(false);


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


    const handleMarkAvailable = async () => {
        // if (!availableReason.trim()) return toast.error("Resolution reason is required");
        setAvailableSubmitting(true);
        try {
            const unavailableHistory = (order.onRoadUnavailableHistory || [])
                .filter(
                    (h) =>
                        h.vehicleRegNo === entry.vehicleRegistrationNumber &&
                        h.status === "unavailable"
                )
                .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());

            const latestHistory = unavailableHistory[0];
            if (!latestHistory) {
                toast.error("No unavailable history found");
                setAvailableSubmitting(false);
                return;
            }

            const formData = new FormData();
            formData.append("resolveDescription", availableReason.trim());
            if (availablePhoto) formData.append("availablePhoto", availablePhoto);

            await axios.patch(
                `${API_BASE}admin/pipeline/${order._id}/onroad-unavailable/${latestHistory._id}/available`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            toast.success("Vehicle marked as available!");
            setAvailableOpen(false);
            setAvailableReason("");
            setAvailablePhoto(null);
            onRefresh();
        } catch (e) {
            toast.error(e?.response?.data?.message || "Failed to mark available");
        } finally {
            setAvailableSubmitting(false);
        }
    };

    const latestUnavailableHistory = (order.onRoadUnavailableHistory || [])
        .filter(
            (h) =>
                h.vehicleRegNo === entry.vehicleRegistrationNumber &&
                h.status === "unavailable"
        )
        .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())[0];



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
                        {entry.inventoryStatus && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border leading-none ${
                                entry.inventoryStatus === "Damaged"
                                    ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                                    : entry.inventoryStatus === "Under Maintenance"
                                        ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                                        : "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                            }`}>
                                {entry.inventoryStatus}
                            </span>
                        )}
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
                            {latestUnavailableHistory?.eventType === "replaced" && (
                                <span className="flex items-center gap-1 text-sm font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
                                    Replaced by {latestUnavailableHistory.replacementVehicleRegNo}
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


                        <p className="text-sm text-gray-400 dark:text-gray-500">
                            Last update · {lastSeen}
                        </p>
                        <span className="text-sm text-gray-500">
                            {distanceCovered.toFixed(2)} km covered
                        </span>
                    </div>


                    <div className="flex flex-col items-end gap-2.5 flex-shrink-0">


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
                                onClick={() => setCallModalOpen(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all whitespace-nowrap"
                            >
                                <Phone size={11} />
                                Call Driver
                            </button>

                            {entry.entryStatus !== "removed" && latestUnavailableHistory?.eventType !== "replaced" && (
                                <button
                                    onClick={() => setReplaceOpen(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all whitespace-nowrap"
                                >
                                    <RefreshCw size={11} />
                                    Replace Vehicle
                                </button>
                            )}

                        </div>
                    </div>
                </div>
            </div>



            {callModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-xs p-6 flex flex-col items-center gap-4">


                        <div className="w-full flex justify-end">
                            <button onClick={() => setCallModalOpen(false)}>
                                <XCircle size={18} className="text-gray-400 hover:text-gray-600" />
                            </button>
                        </div>


                        <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                            <Phone size={24} className="text-blue-500" />
                        </div>


                        <div className="text-center">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                {entry.driverName || "Driver"}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {entry.vehicleRegistrationNumber}
                            </p>
                        </div>


                        <div className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-center">
                            <p className="text-xs text-gray-400 mb-1">Phone number</p>
                            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 tracking-wide">
                                {entry.driverPhone || "—"}
                            </p>
                        </div>


                        <a

                            href={`tel:${entry.driverPhone}`}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-all"
                        >
                            <Phone size={15} />
                            Call Now
                        </a>


                        <button
                            onClick={() => setCallModalOpen(false)}
                            className="text-xs text-gray-400 hover:text-gray-600 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {availableOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg flex flex-col">
                        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                    Mark Available · {entry.driverName}
                                </h3>
                                <p className="text-sm text-gray-400 mt-0.5">
                                    {entry.vehicleRegistrationNumber}
                                </p>
                            </div>
                            <button onClick={() => setAvailableOpen(false)}>
                                <XCircle size={18} className="text-gray-400 hover:text-gray-600" />
                            </button>
                        </div>

                    
                        <div className="px-5 py-4 flex flex-col gap-4">
                            {latestUnavailableHistory && (
                                <div className="rounded-xl border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/10 p-3">
                                    <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-1">
                                        Unavailable Reason
                                    </p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {latestUnavailableHistory.reason}
                                    </p>
                                    {latestUnavailableHistory.photo && (
                                        <a
                                            href={getImageUrl(latestUnavailableHistory.photo)}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <img
                                                src={getImageUrl(latestUnavailableHistory.photo)}
                                                className="w-14 h-12 rounded-lg object-cover border mt-2 hover:opacity-80"
                                                alt="unavailable"
                                            />
                                        </a>
                                    )}
                                    <p className="text-xs text-gray-400 mt-1">
                                        Reported by {latestUnavailableHistory.reportedBy} ·{" "}
                                        {fmtDatetime(latestUnavailableHistory.reportedAt)}
                                    </p>

                                    {latestUnavailableHistory.eventType === "replaced" && (
                                        <div className="mt-3 pt-3 border-t border-orange-200 dark:border-orange-800/50">
                                            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1.5">
                                                Replacement Vehicle Assigned
                                            </p>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div>
                                                    <p className="text-gray-400">Registration No</p>
                                                    <p className="font-mono font-semibold text-gray-700 dark:text-gray-300">
                                                        {latestUnavailableHistory.replacementVehicleRegNo}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400">Driver</p>
                                                    <p className="font-semibold text-gray-700 dark:text-gray-300">
                                                        {latestUnavailableHistory.replacementDriverName} · {latestUnavailableHistory.replacementDriverPhone}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1.5">
                                                Replaced at {fmtDatetime(latestUnavailableHistory.replacedAt)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                         
                            <div>
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                    Add a comment ·{" "}
                                    <span className="text-emerald-500">Resolution</span>
                                     <span className="text-xs text-gray-400 font-normal ml-1">(Optional)</span>
                                </p>
                                <textarea
                                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-300"
                                    rows={3}
                                    placeholder="Type your resolution reason here..."
                                    value={availableReason}
                                    onChange={(e) => setAvailableReason(e.target.value)}
                                />
                            </div>

                      
                            <div className="flex items-center justify-between">
                                {availablePhoto ? (
                                    <div className="flex items-center gap-2">
                                        <img
                                            src={URL.createObjectURL(availablePhoto)}
                                            className="w-8 h-8 rounded-lg object-cover border border-gray-200"
                                            alt="preview"
                                        />
                                        <span className="text-xs text-gray-500 truncate max-w-[120px]">
                                            {availablePhoto.name}
                                        </span>
                                        <button
                                            onClick={() => setAvailablePhoto(null)}
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
                                            onChange={(e) => setAvailablePhoto(e.target.files?.[0] || null)}
                                        />
                                    </label>
                                )}

                                <button
                                    onClick={handleMarkAvailable}
                                    // disabled={availableSubmitting || !availableReason.trim()}
                                    className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold disabled:opacity-40 transition-all"
                                >
                                    {availableSubmitting ? "Processing..." : "Mark as Available"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {replaceOpen && (
                <ReplaceVehicleModal
                    order={order}
                    vehicle={vehicle}
                    vehicleIndex={correctVehicleIndex}
                    entry={entry}
                    vehicleTypeName={
                        vehicleTypes?.find((vt: any) => vt._id === vehicle?.vehicleType)?.typeName
                    }
                    onClose={() => setReplaceOpen(false)}
                    onRefresh={onRefresh}
                />
            )}

        </>
    );
}
