
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
import AttendanceSummaryCard from "./AttendanceSummaryCard";
import OrderReportPDF from "./OrderReportPDF";

// ─── Helpers ──────────────────────────────────────────────────────────────────
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



function VehicleExecutionCard({ vehicle, vehicleIndex, order, onRefresh, vehicleTypes, gpsData, gpsLoading, onRefreshGps }) {
  const [open, setOpen] = useState(false);
  const [activeDriverTab, setActiveDriverTab] = useState(0);
  const [toggling, setToggling] = useState(false);
  const issueRef = useRef(null);
  const [activeIssueEntryId, setActiveIssueEntryId] = useState<string | null>(null);
  const [routeTrackId, setRouteTrackId] = useState<string | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [kmPage, setKmPage] = useState(0);
  const [liveTab, setLiveTab] = useState<"status" | "history">("status");

  const fetchRouteTrackId = async (vehicleRegNo: string) => {
    setRouteLoading(true);
    try {
      const res = await axios.get("https://api.vamosys.com/getVehicleExp", {
        params: {
          vehicleId: vehicleRegNo,
          fcode: "VAM",
          days: 30,
          mailId: "vignesh032rk@gmail.com",
          phone: "919003935122",
          userId: "ADINN12",
        },
      });



      const trackId =
        res.data


      if (trackId) {
        setRouteTrackId(trackId);
      } else {
        toast.error("Track ID not found");
      }
    } catch (err) {
      console.error("Route API error:", err);
      toast.error("Failed to fetch route");
    } finally {
      setRouteLoading(false);
    }
  };


  const vehicleIssues = (order.onRoadIssues || []).filter(
    (iss) => iss.vehicleIndex === vehicleIndex
  );
  const openIssues = vehicleIssues.filter((iss) => iss.status === "open");
  const resolvedIssues = vehicleIssues.filter((iss) => iss.status === "resolved");


  const vehicles = (order.bookingItems || [])
    .map((item, originalIdx) => ({ item, originalIdx }))
    .filter(({ item, originalIdx }) => {
      const entries = (order.onRoadExecutionArray || [])
        .filter(e => e.vehicleIndex === originalIdx);
      return entries.some(e => e.onRoadStatus === 1);
    });
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
    (e) => e.vehicleIndex === vehicleIndex
  );

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
        {/* V badge */}
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${isVehicleOnRoad ? "bg-emerald-500" : allDriversSaved ? "bg-blue-500" : "bg-gray-400"
          }`}>
          V{vehicleIndex + 1}
        </div>

        {/* Info */}
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

        {/* Right */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className={`text-sm font-bold px-2 py-0.5 rounded-full border ${driverBadgeClass}`}>
            {savedCount}/{quantity} drivers
          </span>
          {open
            ? <ChevronUp size={14} className="text-gray-300" />
            : <ChevronDown size={14} className="text-gray-300" />}
        </div>
      </div>

      {/* ── Expanded Section ── */}
      {open && (
        <div className="border-t border-gray-100 dark:border-gray-800">

          {/* ── Campaign Header ── */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center gap-4 p-4">
              {/* Logo */}
              <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
                <Truck size={24} className="text-white" />
              </div>

              {/* Name & client */}
              <div className="flex-shrink-0">
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{campaignName}</p>
                <p className="text-sm text-gray-400 mt-0.5">{clientName}</p>
              </div>

              {/* Divider */}
              <div className="w-px h-10 bg-gray-100 dark:bg-gray-800 flex-shrink-0" />

              {/* Meta grid */}
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


                <div className="flex items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRefreshGps();
                    }}
                    disabled={gpsLoading}
                    className="flex items-center text-[13px] gap-2 px-3 py-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all disabled:opacity-50"
                  >
                    {gpsLoading ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Refreshing...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw size={13} />
                        <span>Refresh</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            </div>
          </div>

          {/* ── Stats Row ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">


            <StatCard
              icon={Truck}
              iconBg="bg-blue-50 dark:bg-blue-900/20"
              iconColor="text-blue-500"
              label="Vehicles live"
              value={`${liveCount} / ${quantity}`}
              sub={<><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{Math.round((liveCount / quantity) * 100) || 0}% Active</>}
              subColor="text-emerald-600 dark:text-emerald-400"
            />

            <StatCard
              icon={Activity}
              iconBg="bg-emerald-50 dark:bg-emerald-900/20"
              iconColor="text-emerald-500"
              label="Route covered"
              value="68%"
              sub={<><TrendingUp size={11} /> Today's progress</>}
              subColor="text-emerald-600 dark:text-emerald-400"
            />



            <StatCard
              icon={AlertTriangle}
              iconBg="bg-red-50 dark:bg-red-900/20"
              iconColor="text-red-500"
              label="Open issues"
              value={<span className="text-red-500">{openIssues.length}</span>}
              // sub={<span className="text-blue-500 cursor-pointer">View issues</span>}
              sub={
                <span
                  className="text-blue-500 cursor-pointer"
                  onClick={() => issueRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                >
                  View issues
                </span>
              }
            />


            {/* <StatCard
              icon={Navigation}
              label="KM covered"
              value={`${totalKm.toFixed(1)} km`}
              sub={
                <div className="flex flex-col gap-0.5 max-h-[52px] overflow-y-auto w-full">
                  {vehicleEntries.map((e, i) => {
                    const gps = gpsData.find(g => g.vehicleId === e.vehicleRegistrationNumber);
                    return (
                      <span key={i} className="text-xs text-gray-400">
                        V{i + 1}: {(gps?.distanceCovered || 0).toFixed(1)}km
                      </span>
                    );
                  })}
                </div>
              }
            /> */}

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3.5 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-50 dark:bg-gray-800">
                  <Navigation size={15} className="text-gray-500" />
                </div>
                <span className="text-md text-gray-400">KM covered</span>
              </div>

              <div className="text-xl font-semibold text-gray-800 dark:text-gray-100 leading-tight">
                {totalKm.toFixed(1)} km
              </div>

              {/* Carousel Row */}
              <div className="flex items-center gap-2">
                {/* Left Arrow */}
                <button
                  onClick={() => setKmPage(p => Math.max(0, p - 1))}
                  disabled={kmPage === 0}
                  className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-gray-200 disabled:opacity-30 transition-all flex-shrink-0"
                >
                  <ChevronDown size={12} className="rotate-90" />
                </button>

                {/* Vehicle KM display */}
                <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                  {vehicleEntries.slice(kmPage * 2, kmPage * 2 + 2).map((e, i) => {
                    const gps = gpsData.find(g => g.vehicleId === e.vehicleRegistrationNumber);
                    const actualIdx = kmPage * 2 + i;
                    return (
                      <span key={actualIdx} className="text-xs text-gray-400 truncate">
                        V{actualIdx + 1}: {(gps?.distanceCovered || 0).toFixed(1)}km
                      </span>
                    );
                  })}
                </div>

                {/* Right Arrow */}
                <button
                  onClick={() => setKmPage(p => Math.min(Math.ceil(vehicleEntries.length / 2) - 1, p + 1))}
                  disabled={kmPage >= Math.ceil(vehicleEntries.length / 2) - 1}
                  className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-gray-200 disabled:opacity-30 transition-all flex-shrink-0"
                >
                  <ChevronDown size={12} className="-rotate-90" />
                </button>
              </div>

              {/* Dot indicators */}
              {vehicleEntries.length > 2 && (
                <div className="flex items-center justify-center gap-1">
                  {Array.from({ length: Math.ceil(vehicleEntries.length / 2) }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-full transition-all ${i === kmPage ? "w-3 h-1.5 bg-blue-400" : "w-1.5 h-1.5 bg-gray-200 dark:bg-gray-700"}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>


          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100">
                  Live vehicle status ({vehicleEntries.length}/{quantity} drivers)
                </h3>
                {/* {vehicleEntries.filter(e => e.onRoadStatus === 1).length > 0 && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                    {vehicleEntries.filter(e => e.onRoadStatus === 1).length} On Road
                  </span>
                )} */}
              </div>
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
                  <button
                    onClick={() => setLiveTab("status")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${liveTab === "status" ? "bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    Vehicle Status
                  </button>
                  <button
                    onClick={() => setLiveTab("history")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${liveTab === "history" ? "bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    Driver History
                  </button>
                </div>
                {vehicleEntries.filter(e => e.onRoadStatus === 1).length > 0 && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                    {vehicleEntries.filter(e => e.onRoadStatus === 1).length} On Road
                  </span>
                )}
              </div>


              <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[520px] overflow-y-auto">
                {liveTab === "status" ? (
                  <>
                    {vehicleEntries.map((entry, idx) => (
                      <LiveVehicleRow
                        key={entry._id || idx}
                        entry={entry}
                        index={idx}
                        order={order}
                        onRefresh={onRefresh}
                        vehicle={vehicle}
                        gpsData={gpsData}
                        onTrackIdFetched={(regNo) => fetchRouteTrackId(regNo)}
                        correctVehicleIndex={vehicleIndex}
                        forceOpen={activeIssueEntryId === entry.vehicleRegistrationNumber}
                        onForceOpenHandled={() => setActiveIssueEntryId(null)}
                      />
                    ))}
                    {vehicleEntries.length === 0 && (
                      <div className="p-6 text-center text-gray-400 text-sm">
                        No drivers assigned.
                      </div>
                    )}
                  </>
                ) : (
                  <DriverHistoryPanel
                    vehicleEntries={vehicleEntries}
                    driverHistory={order.onRoadDriverHistory || []}
                    vehicleIndex={vehicleIndex}
                  />
                )}
              </div>
            </div>


            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">

              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100">
                  Today's route progress
                </h3>

              </div>

              Flow Summary:

              <div className="border-b border-gray-100 dark:border-gray-800 relative overflow-hidden"
                style={{ height: "280px" }}>
                {routeLoading ? (

                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    <Loader2 size={24} className="animate-spin text-blue-400" />
                    <p className="text-xs text-gray-400">Loading route map...</p>
                  </div>
                ) : routeTrackId ? (

                  <iframe
                    key={routeTrackId}
                    src={`https://gpsvts.vamosys.com/gps/public/track?vehicleId=${routeTrackId}&maps=track&userID=ADINN12`}
                    className="w-full h-full border-0"
                    title="Live Route Map"
                    allowFullScreen
                  />
                ) : (
                  // Default placeholder
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gray-50 dark:bg-gray-800">
                    <div className="absolute inset-0 opacity-5">
                      <svg width="100%" height="100%">
                        <defs>
                          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                      </svg>
                    </div>
                    <Navigation size={28} className="text-gray-300 relative z-10" />

                  </div>
                )}
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {[
                  { label: "Anna Nagar", time: "09:00 AM – 10:30 AM", status: "completed" },
                  { label: "T Nagar", time: "10:45 AM – 01:00 PM", status: "inprogress" },
                  { label: "Velachery", time: "02:00 PM – 03:30 PM", status: "pending" },
                  { label: "Adyar", time: "04:00 PM – 06:00 PM", status: "pending" },
                ].map((stop, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${stop.status === "completed" ? "bg-blue-500" :
                      stop.status === "inprogress" ? "bg-amber-400" : "bg-gray-300"
                      }`}>
                      <span className="text-xs text-white font-semibold">{i + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{stop.label}</p>
                      <p className="text-xs text-gray-400">{stop.time}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${stop.status === "completed"
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                      : stop.status === "inprogress"
                        ? "bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                        : "bg-gray-100 text-gray-400 border border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                      }`}>
                      {stop.status === "completed" ? "Completed" : stop.status === "inprogress" ? "In progress" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Col 3: Timeline ── */}
            {/* <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Timeline / activity feed</h3>
                <button className="text-xs text-blue-500 hover:underline">View all</button>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {[
                  { icon: Truck, bg: "bg-blue-50 dark:bg-blue-900/20", color: "text-blue-500", text: "Vehicle 01 started route from depot", time: "10:05 AM" },
                  { icon: MapPin, bg: "bg-emerald-50 dark:bg-emerald-900/20", color: "text-emerald-500", text: "Anna Nagar route completed", time: "10:30 AM" },
                  { icon: Activity, bg: "bg-purple-50 dark:bg-purple-900/20", color: "text-purple-500", text: "T Nagar route 50% completed", time: "11:20 AM" },
                  { icon: Camera, bg: "bg-amber-50 dark:bg-amber-900/20", color: "text-amber-500", text: "14 photos uploaded by field team", time: "12:10 PM" },
                  { icon: AlertTriangle, bg: "bg-red-50 dark:bg-red-900/20", color: "text-red-500", text: "Vehicle 03 GPS offline issue reported", time: "01:30 PM" },
                  { icon: Users, bg: "bg-amber-50 dark:bg-amber-900/20", color: "text-amber-500", text: "Issue assigned to operations team", time: "01:45 PM" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 px-4 py-3 items-start">
                    <div className={`w-7 h-7 rounded-full ${item.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <item.icon size={13} className={item.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{item.text}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div> */}
          </div>


          {/* ── Bottom Row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div ref={issueRef} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100">
                  Issue / escalation
                </h3>
                <div className="flex items-center gap-2">
                  {openIssues.length > 0 && (
                    <span className="text-sm font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-200">
                      {openIssues.length} open
                    </span>
                  )}
                  <span className="text-sm text-gray-400">{vehicleIssues.length} total</span>
                </div>
              </div>

              <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
                {vehicleIssues.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">No issues reported</p>
                )}


                {[...vehicleIssues].reverse().map((iss) => (
                  <IssueHistoryCard
                    key={iss._id}
                    iss={iss}
                    onOpenModal={() => setActiveIssueEntryId(iss.vehicleRegNo)}
                  />
                ))}
              </div>
            </div>

            <AttendanceSummaryCard vehicleEntries={vehicleEntries} order={order} vehicleIndex={vehicleIndex} />
          </div>

        </div>
      )}

    </div>




  );
}


function DriverHistoryPanel({ vehicleEntries, driverHistory, vehicleIndex }) {
  const [activeVehicleTab, setActiveVehicleTab] = useState(0);

  const fmtDt = (s) => {
    if (!s) return "—";
    return new Date(s).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };


  const activeEntry = vehicleEntries[activeVehicleTab];

  const filteredHistory = driverHistory.filter(h => {
    if (h.vehicleIndex !== vehicleIndex) return false;
    if (!activeEntry) return false;

    // updated history la changed reg no match or current reg no match
    return (
      h.vehicleRegistrationNumber === activeEntry.vehicleRegistrationNumber ||
      (h.changedFields?.vehicleRegistrationNumber?.old === activeEntry.vehicleRegistrationNumber) ||
      (h.changedFields?.vehicleRegistrationNumber?.new === activeEntry.vehicleRegistrationNumber)
    );
  });

  return (
    <div>

      {vehicleEntries.length > 1 && (
        <div className="flex gap-1 px-3 pt-3 pb-0 border-b border-gray-100 dark:border-gray-800 overflow-x-auto">
          {vehicleEntries.map((entry, i) => (
            <button
              key={entry._id || i}
              onClick={() => setActiveVehicleTab(i)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap flex-shrink-0 ${activeVehicleTab === i
                ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
            >
              <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white" style={{ fontSize: "9px" }}>
                V{i + 1}
              </div>
              <span className="font-mono text-xs">{entry.vehicleRegistrationNumber || `Vehicle ${i + 1}`}</span>
            </button>
          ))}
        </div>
      )}

      {/* Active entry info */}
      {activeEntry && (
        <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            V{activeVehicleTab + 1}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{activeEntry.driverName || "—"}</p>
            <p className="text-xs text-gray-400 font-mono">{activeEntry.vehicleRegistrationNumber} · {activeEntry.driverPhone}</p>
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${activeEntry.onRoadStatus === 1
            ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
            : "bg-gray-100 text-gray-400"
            }`}>
            {activeEntry.onRoadStatus === 1 ? "On Road" : "Off Road"}
          </span>
        </div>
      )}

      {/* History list */}
      <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[380px] overflow-y-auto">
        {filteredHistory.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">
            No history for this vehicle
          </div>
        ) : (
          [...filteredHistory].reverse().map((h, i) => (
            <div key={h._id || i} className="p-4 flex gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ${h.action === "created" ? "bg-blue-500" : "bg-amber-500"}`}>
                {h.action === "created" ? <Plus size={14} /> : <RefreshCw size={13} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${h.action === "created" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"}`}>
                    {h.action === "created" ? "Driver added" : "Driver updated"}
                  </span>
                  <span className="text-xs text-gray-400">{fmtDt(h.changedAt)}</span>
                </div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{h.driverName}</p>
                <p className="text-xs text-gray-500">{h.driverPhone} · <span className="font-mono">{h.vehicleRegistrationNumber}</span></p>
                <p className="text-xs text-gray-400 mt-0.5">By {h.changedBy}</p>
                {h.action === "updated" && h.changedFields && Object.keys(h.changedFields).length > 0 && (
                  <div className="mt-1.5 space-y-0.5 pt-1.5 border-t border-gray-100 dark:border-gray-800">
                    {Object.entries(h.changedFields).map(([field, val]: any) => (
                      <p key={field} className="text-xs text-gray-500">
                        <span className="font-medium capitalize">{field}:</span>{" "}
                        <span className="line-through text-red-400">{val.old}</span>{" → "}
                        <span className="text-emerald-600 font-medium">{val.new}</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function IssueHistoryCard({ iss, onOpenModal }) {
  const [showResolved, setShowResolved] = useState(false);

  return (
    <div
      className={`rounded-xl border p-3 ${iss.status === "open"
        ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10"
        : "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/10"
        }`}


    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <p
          className={`text-sm font-semibold  ${iss.status === "open"
            ? "text-red-700 dark:text-red-400"
            : "text-emerald-700 dark:text-emerald-400"
            }`}

        >
          {iss.driverName} — {iss.vehicleRegNo}
        </p>
        <span
          className={`text-xs font-semibold cursor-pointer px-2 py-0.5 rounded-full flex-shrink-0 ${iss.status === "open"
            ? "bg-amber-100 text-amber-700"
            : "bg-emerald-100 text-emerald-700"
            }`}

          onClick={onOpenModal}
        >
          {iss.status === "open" ? "Open" : "Resolved"}
        </span>
      </div>

      {/* Issue description */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
        <span className="font-medium">Issue:</span> {iss.issueDescription}
      </p>

      {/* Issue photo */}
      {iss.issuePhoto && (
        <a href={getImageUrl(iss.issuePhoto)} target="_blank" rel="noreferrer">
          <img
            src={getImageUrl(iss.issuePhoto)}
            className="w-14 h-12 rounded-lg object-cover border mb-1 hover:opacity-80"
            alt="issue"
          />
        </a>
      )}

      <p className="text-sm text-gray-400">
        Reported by {iss.reportedBy} · {fmtDatetime(iss.reportedAt)}
      </p>

      {/* Resolved section — toggle button */}
      {iss.status === "resolved" && (
        <div className="mt-2">
          <button
            onClick={() => setShowResolved(!showResolved)}
            className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:underline"
          >
            <CheckCircle size={13} />
            {showResolved ? "Hide resolution" : "View resolution"}
          </button>

          {showResolved && (
            <div className="mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-800">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <span className="font-medium">Resolution:</span>{" "}
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
              <p className="text-xs text-gray-400 mt-0.5">
                Resolved by {iss.resolvedBy} · {fmtDatetime(iss.resolvedAt)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, iconBg, iconColor, label, value, sub, subColor }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3.5 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon size={15} className={iconColor} />
        </div>
        <span className="text-md text-gray-400">{label}</span>
      </div>
      <div className="text-xl font-semibold text-gray-800 dark:text-gray-100 leading-tight">{value}</div>
      {sub && (
        <div className={`text-sm flex items-center gap-1 flex-wrap overflow-x-auto scrollbar-hide max-h-[48px] overflow-y-auto ${subColor || "text-gray-400"}`}>{sub}</div>
      )}
    </div>
  );
}




export default function OnRoadTab({ order, onRefresh, vehicleTypes }) {

  const [gpsData, setGpsData] = useState<any[]>([]);
  const [gpsLoading, setGpsLoading] = useState(false);
  const hasFetched = useRef(false);


  const fetchGpsData = async () => {
    setGpsLoading(true);
    try {
      const { data } = await axios.get(
        "http://api.vamosys.com/apiMobile/getVehicleLocations",
        {
          params: {
            apiKey: "76b6bf01d4b3aa5768a5ee7f4707360f",
            userId: "ADINN12",
            groupId: "ADINN12",
          },
        }
      );
      const locations = data?.[0]?.vehicleLocations ?? [];
      setGpsData(locations);
    } catch (error) {
      console.error("GPS API Error:", error);
      setGpsData([]);
    } finally {
      setGpsLoading(false);
    }
  };



  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchGpsData();
  }, []);


  const vehicles = (order.bookingItems || [])
    .map((item, originalIdx) => ({ item, originalIdx }))
    .filter(({ item, originalIdx }) => {
      const entries = (order.onRoadExecutionArray || [])
        .filter(e => e.vehicleIndex === originalIdx);
      return entries.some(e => e.onRoadStatus === 1);
    });


  const allEntries = order.onRoadExecutionArray || [];
  const totalOnRoad = allEntries.filter((e) => e.onRoadStatus === 1).length;
  const totalVehicles = vehicles.reduce((sum, v) => sum + (v.quantity || 1), 0);
  const totalDriversSaved = allEntries.length;



  // Campaign info from order
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



      {/* ── Project Execution (Vehicle Cards with Driver Forms) ── */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100">On Road</h3>
            <p className="text-sm text-gray-400 mt-0.5">
              {vehicles.length} booking item{vehicles.length > 1 ? "s" : ""} · {totalVehicles} total vehicles
            </p>

          </div>

          <span>
            <OrderReportPDF
              order={order}
              vehicleTypes={vehicleTypes}
              gpsData={[]}
            /></span>

          {totalOnRoad > 0 && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
              {totalOnRoad} On Road
            </span>
          )}



        </div> */}

        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          {/* Left side */}
          <div>
            <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100">
              On Road
            </h3>
            <p className="text-sm text-gray-400 mt-0.5">
              {vehicles.length} booking item{vehicles.length > 1 ? "s" : ""} · {totalVehicles} total vehicles
            </p>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <span>
              <OrderReportPDF
                order={order}
                vehicleTypes={vehicleTypes}
                gpsData={[]}
              />
            </span>

            {totalOnRoad > 0 && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
                {totalOnRoad} On Road
              </span>
            )}
          </div>
        </div>

        <div className="p-4 space-y-3">
          {vehicles.map(({ item: vehicle, originalIdx }) => (
            <VehicleExecutionCard
              key={originalIdx}
              vehicle={vehicle}
              vehicleIndex={originalIdx}
              order={order}
              onRefresh={onRefresh}
              vehicleTypes={vehicleTypes}
              gpsData={gpsData}
              gpsLoading={gpsLoading}
              onRefreshGps={fetchGpsData}
            />
          ))}
        </div>
      </div>

    </div>
  );
}

