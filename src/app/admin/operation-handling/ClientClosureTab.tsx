

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
import LiveVehicleRow from "./LiveVehicleRow";
import VehicleUnavailableRow from "./VehicleUnavailableRow";
import ClientClosureTabSecond from "./ClientClosureTabsecond";


const fmtDate = (s) => {
    if (!s) return "—";
    return new Date(s).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
    });
};

const fmtDatetime = (s) => {
    if (!s) return "—";
    return new Date(s).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
};

const fmtTime = (s) => {
    if (!s) return "—";
    return new Date(s).toLocaleTimeString("en-IN", {
        hour: "2-digit", minute: "2-digit",
    });
};



const getImageUrl = (url) => {
    if (!url) return null;

    if (url.startsWith("http")) return url;

    return `${API_BASE.replace("/api", "")}${url}`;
};



function VehicleExecutionCard({ vehicle, vehicleIndex, order, onRefresh, vehicleTypes, gpsData, gpsLoading, isAdmin ,autoOpenFoc }) {
    // const [open, setOpen] = useState(false);
     const [open, setOpen] = useState(autoOpenFoc ?? false);
    const [activeDriverTab, setActiveDriverTab] = useState(0);
    const [toggling, setToggling] = useState(false);
    const issueRef = useRef(null);
    const [activeIssueEntryId, setActiveIssueEntryId] = useState<string | null>(null);
    const [routeTrackId, setRouteTrackId] = useState<string | null>(null);
    const [routeLoading, setRouteLoading] = useState(false);
    const [kmPage, setKmPage] = useState(0);
    const [liveTab, setLiveTab] = useState<"status" | "history">("status");
    console.log("vehicle", vehicle)

    const vehicleIssues = (order.onRoadIssues || []).filter(
        (iss) => iss.vehicleIndex === vehicleIndex
    );
    const openIssues = vehicleIssues.filter((iss) => iss.status === "open");
    const resolvedIssues = vehicleIssues.filter((iss) => iss.status === "resolved");


    const vehicles = (order.bookingItems || [])
        .map((item, originalIdx) => ({ item, originalIdx }));


    const allEntries = order.onRoadExecutionArray || [];
    const totalOnRoad = allEntries.filter((e) => e.onRoadStatus === 1).length;
    const totalVehicles = vehicles.reduce((sum, v) => sum + (v.quantity || 1), 0);
    const totalDriversSaved = allEntries.length;




    const campaignName = vehicle.campaignName;
    const clientName = order.name;
    const startDate = vehicle.fromDate;
    const endDate = vehicle.toDate;
    const campaignType = vehicle.campaignType;
    const city = vehicle.city || vehicle.state;
    const state = vehicle.state;



    const getVehicleTypeName = (vehicleTypeId) => {
        if (!vehicleTypeId || !vehicleTypes) return "Vehicle";
        const v = vehicleTypes.find((vt) => vt._id === vehicleTypeId);
        return v?.typeName || "Vehicle";
    };

    const vehicleEntries = (order.onRoadExecutionArray || []).filter(
        (e) => e.vehicleIndex === vehicleIndex && e.unavailableStatus === true
    );

    const unavailableCount = vehicleEntries.length;
    const totalUnavailable = (order.onRoadExecutionArray || []).filter(
        e => e.vehicleIndex === vehicleIndex
    ).length;

    const totalKm = vehicleEntries.reduce((sum, e) => {
        const gps = gpsData.find(g => g.vehicleId === e.vehicleRegistrationNumber);
        return sum + (gps?.distanceCovered || 0);
    }, 0);

    const quantity = vehicle.quantity || 1;
    const savedCount = vehicleEntries.length;
    const allDriversSaved = savedCount >= quantity;
    const isVehicleOnRoad = vehicleEntries.some((e) => e.onRoadStatus === 1);
    const liveCount = vehicleEntries.filter(e => {
        const gps = gpsData.find(g => g.vehicleId === e.vehicleRegistrationNumber);
        return gps?.ignitionStatus === "ON";
    }).length;


    const driverBadgeClass = allDriversSaved
        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
        : savedCount > 0
            ? "bg-orange-50 text-orange-500 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800"
            : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 border-gray-200 dark:border-gray-700";

    return (
        <div className={`rounded-xl border overflow-hidden transition-all shadow-sm hover:shadow-md ${isVehicleOnRoad
            ? "border-emerald-200 dark:border-emerald-800"
            : "border-gray-200 dark:border-gray-700"
            } bg-white dark:bg-gray-900`}>


            <div
                className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
                onClick={() => setOpen(!open)}
            >

                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${isVehicleOnRoad ? "bg-emerald-500" : allDriversSaved ? "bg-blue-500" : "bg-gray-400"
                    }`}>
                    V{vehicleIndex + 1}
                </div>


                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                            {getVehicleTypeName(vehicle.vehicleType)}
                        </p>
                        <span className="text-[15px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 font-medium">
                            {vehicle.campaignType || "—"}
                        </span>

                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1 text-sm text-gray-400">
                            <Clock size={14} />
                            {fmtDate(vehicle.fromDate)} → {fmtDate(vehicle.toDate)}
                        </span>
                        <span className="text-sm text-gray-300">·</span>
                        <span className="text-sm text-gray-400">{vehicle.totalDays}d</span>
                        <span className="text-sm text-gray-300">·</span>
                        <span className="flex items-center gap-1 text-sm text-gray-400">
                            <Truck size={14} />
                            {quantity} {quantity === 1 ? "vehicle" : "vehicles"}
                        </span>
                    </div>
                    {vehicle.campaignName && (
                        <p className="text-md text-gray-400 mt-0.5">{vehicle.campaignName}</p>
                    )}
                </div>



            </div>


            {open && (
                <div className="border-t border-gray-100 dark:border-gray-800">


                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                        <div className="flex items-center gap-4 p-4">

                            <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
                                <Truck size={24} className="text-white" />
                            </div>

                            <div className="flex-shrink-0">
                                <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{campaignName}</p>
                                <p className="text-sm text-gray-400 mt-0.5">{clientName}</p>
                            </div>

                            <div className="w-px h-10 bg-gray-100 dark:bg-gray-800 flex-shrink-0" />


                            <div className="flex gap-6 flex-wrap flex-1 min-w-0">
                                <div>
                                    <p className="text-sm text-gray-400">Campaign type</p>
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-0.5">{campaignType}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Start date</p>
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-0.5">{fmtDate(startDate)}</p>
                                    <p className="text-sm text-gray-400">End · {fmtDate(endDate)}</p>
                                </div>
                                <div>

                                    <p className="text-sm text-gray-400">City</p>
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-0.5">{city}</p>

                                    {/* <p className="text-xs text-gray-400">Vehicles · {totalVehicles}</p> */}
                                </div>


                                <div>
                                    <p className="text-sm text-gray-400">State</p>
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-0.5">{state}</p>
                                </div>

                            </div>
                        </div>
                    </div>


                    <div>


                        {/* <ClientClosureTabSecond order={order} onRefresh={onRefresh} bookingItemId={String(vehicle._id)} /> */}
                        <ClientClosureTabSecond order={order} onRefresh={onRefresh} bookingItemId={vehicle._id?.toString?.() ?? String(vehicle._id)} isAdmin={isAdmin}  autoOpenFoc={autoOpenFoc} />

                    </div>


                </div>
            )}

        </div>




    );
}




export default function ClientClosureTab({ order, onRefresh, vehicleTypes, isAdmin }) {

    const [gpsData, setGpsData] = useState<any[]>([]);
    const [gpsLoading, setGpsLoading] = useState(false);
    const hasFetched = useRef(false);



    const vehicles = (order.bookingItems || [])
        .map((item, originalIdx) => ({ item, originalIdx }));


            const pendingFocEntry = (order.campaignClosureArray || []).find(
        (c) => c.type === "foc" && (c.status === "pending" || !c.status)
    );
    const pendingFocBookingItemId = pendingFocEntry?.bookingItemId?.$oid
        || pendingFocEntry?.bookingItemId?.toString?.()
        || String(pendingFocEntry?.bookingItemId ?? "");




    const allEntries = order.onRoadExecutionArray || [];
    const totalOnRoad = allEntries.filter((e) => e.onRoadStatus === 1).length;
    const totalVehicles = vehicles.reduce((sum, v) => sum + (v.quantity || 1), 0);
    const totalDriversSaved = allEntries.length;



    const campaignName = order.campaignName || order.bookingItems?.[0]?.campaignName || "Campaign";
    const clientName = order.clientName || order.client?.name || "—";
    const startDate = order.startDate || order.bookingItems?.[0]?.fromDate;
    const endDate = order.endDate || order.bookingItems?.[0]?.toDate;
    const campaignType = order.campaignType || order.bookingItems?.[0]?.campaignType || "—";
    const city = order.city || order.district || "—";
    const managerName = order.assignedTo?.name || order.managerName || "—";

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
        <div className="p-4 space-y-4">




            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                    <div>
                        <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100">Client Closure</h3>
                        <p className="text-sm text-gray-400 mt-0.5">
                            {vehicles.length} booking item{vehicles.length > 1 ? "s" : ""} · {totalVehicles} total vehicles
                        </p>
                    </div>

                </div>
                <div className="p-4 space-y-3">



                    {vehicles.map(({ item: vehicle, originalIdx }) => {
                        const vehicleIdStr = vehicle._id?.$oid
                            || vehicle._id?.toString?.()
                            || String(vehicle._id ?? "");

                        const autoOpenFoc =
                            isAdmin === 1 &&              
                            pendingFocBookingItemId !== "" &&
                            vehicleIdStr === pendingFocBookingItemId;

                        return (
                            <VehicleExecutionCard
                                key={originalIdx}
                                vehicle={vehicle}
                                vehicleIndex={originalIdx}
                                order={order}
                                onRefresh={onRefresh}
                                vehicleTypes={vehicleTypes}
                                gpsData={gpsData}
                                gpsLoading={gpsLoading}
                                isAdmin={isAdmin}
                                autoOpenFoc={autoOpenFoc}
                            />
                        );
                    })}
                </div>
            </div>

        </div>
    );
}

