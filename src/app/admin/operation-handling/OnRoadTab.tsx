
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



function VehicleExecutionCard({ vehicle, vehicleIndex, order, onRefresh, vehicleTypes ,gpsData, gpsLoading, onRefreshGps  }) {
  const [open, setOpen] = useState(false);
  const [activeDriverTab, setActiveDriverTab] = useState(0);
  const [toggling, setToggling] = useState(false);
  // const [gpsData, setGpsData] = useState<any[]>([]);
  // const [gpsLoading, setGpsLoading] = useState(false);
  const [routeTrackId, setRouteTrackId] = useState<string | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);

  console.log("vehicle", vehicle)


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

      console.log("Route API response:", res.data);

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


  // const fetchGpsData = async () => {
  //   setGpsLoading(true);

  //   try {
  //     const { data } = await axios.get(
  //       "http://api.vamosys.com/apiMobile/getVehicleLocations",
  //       {
  //         params: {
  //           apiKey: "76b6bf01d4b3aa5768a5ee7f4707360f",
  //           userId: "ADINN12",
  //           groupId: "ADINN12",
  //         },
  //       }
  //     );

  //     const locations = data?.[0]?.vehicleLocations ?? [];

  //     console.log("Vehicle Locations:", locations);

  //     setGpsData(locations);
  //   } catch (error) {
  //     console.error("GPS API Error:", error);
  //     setGpsData([]);
  //   } finally {
  //     setGpsLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchGpsData();
  // }, []);



  const vehicleIssues = (order.onRoadIssues || []).filter(
    (iss) => iss.vehicleIndex === vehicleIndex
  );
  const openIssues = vehicleIssues.filter((iss) => iss.status === "open");
  const resolvedIssues = vehicleIssues.filter((iss) => iss.status === "resolved");



  console.log("vehicle", vehicle)
  // const vehicles = order.bookingItems || [];


  // const vehicles = (order.bookingItems || []).filter((_, idx) => {
  //   const entries = (order.onRoadExecutionArray || []).filter(e => e.vehicleIndex === idx);
  //   return entries.some(e => e.onRoadStatus === 1);
  // });

  // vehicles array-ஐ இப்படி மாத்துங்க:
  const vehicles = (order.bookingItems || [])
    .map((item, originalIdx) => ({ item, originalIdx }))  // original index save
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
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {getVehicleTypeName(vehicle.vehicleType)}
            </p>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 font-medium">
              {vehicle.campaignType || "—"}
            </span>
            {isVehicleOnRoad && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-semibold border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
                On Road
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Clock size={12} />
              {fmtDate(vehicle.fromDate)} → {fmtDate(vehicle.toDate)}
            </span>
            <span className="text-xs text-gray-300">·</span>
            <span className="text-xs text-gray-400">{vehicle.totalDays}d</span>
            <span className="text-xs text-gray-300">·</span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Truck size={12} />
              {quantity} {quantity === 1 ? "vehicle" : "vehicles"}
            </span>
          </div>
          {vehicle.campaignName && (
            <p className="text-xs text-gray-400 mt-0.5">{vehicle.campaignName}</p>
          )}
        </div>

        {/* Right */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${driverBadgeClass}`}>
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
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{campaignName}</p>
                <p className="text-xs text-gray-400 mt-0.5">{clientName}</p>
              </div>

              {/* Divider */}
              <div className="w-px h-10 bg-gray-100 dark:bg-gray-800 flex-shrink-0" />

              {/* Meta grid */}
              <div className="flex gap-6 flex-wrap flex-1 min-w-0">
                <div>
                  <p className="text-xs text-gray-400">Campaign type</p>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-0.5">{campaignType}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Start date</p>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-0.5">{fmtDate(startDate)}</p>
                  <p className="text-xs text-gray-400">End · {fmtDate(endDate)}</p>
                </div>
                <div>

                  <p className="text-xs text-gray-400">City</p>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-0.5">{city}</p>

                  {/* <p className="text-xs text-gray-400">Vehicles · {totalVehicles}</p> */}
                </div>


                <div>
                  <p className="text-xs text-gray-400">State</p>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-0.5">{state}</p>
                </div>


                <div className="flex items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRefreshGps();
                    }}
                    disabled={gpsLoading}
                    className="flex items-center text-[12px] gap-2 px-3 py-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all disabled:opacity-50"
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
              sub={<span className="text-blue-500 cursor-pointer">View issues</span>}
            />


            <StatCard
              icon={Navigation}
              label="KM covered"
              value={`${totalKm.toFixed(1)} km`}
              sub={
                <>
                  {vehicleEntries.map((e, i) => {
                    const gps = gpsData.find(g => g.vehicleId === e.vehicleRegistrationNumber);
                    return (
                      <span key={i}>V{i + 1}: {(gps?.distanceCovered || 0).toFixed(1)}km</span>
                    );
                  })}
                </>
              }
            />
          </div>


          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">



            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  Live vehicle status ({vehicleEntries.length}/{quantity} drivers)
                </h3>
                {vehicleEntries.filter(e => e.onRoadStatus === 1).length > 0 && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                    {vehicleEntries.filter(e => e.onRoadStatus === 1).length} On Road
                  </span>
                )}
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-800">
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
                  />
                ))}
                {vehicleEntries.length === 0 && (
                  <div className="p-6 text-center text-gray-400 text-sm">
                    No drivers assigned. Please add driver details below.
                  </div>
                )}
              </div>
            </div>


            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              {/* <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Today's route progress</h3>
                <button className="text-xs text-blue-500 hover:underline">View route map</button>
              </div> */}

              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  Today's route progress
                </h3>
                {/* <div className="flex items-center gap-2">
                  {routeTrackId && (
                    <button
                      onClick={() => {
                        const firstEntry = vehicleEntries[0];
                        if (firstEntry?.vehicleRegistrationNumber) {
                          fetchRouteTrackId(firstEntry.vehicleRegistrationNumber);
                        }
                      }}
                      disabled={routeLoading}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                      title="Refresh map"
                    >
                      {routeLoading
                        ? <Loader2 size={13} className="animate-spin text-gray-400" />
                        : <RefreshCw size={13} className="text-gray-400" />}
                    </button>
                  )}
                </div> */}
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
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  Issue / escalation
                </h3>
                <div className="flex items-center gap-2">
                  {openIssues.length > 0 && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-200">
                      {openIssues.length} open
                    </span>
                  )}
                  <span className="text-xs text-gray-400">{vehicleIssues.length} total</span>
                </div>
              </div>

              <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
                {vehicleIssues.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">No issues reported</p>
                )}
                {[...vehicleIssues].reverse().map((iss) => (
                  <div
                    key={iss._id}
                    className={`rounded-xl border p-3 ${iss.status === "open"
                      ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10"
                      : "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/10"
                      }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className={`text-xs font-semibold ${iss.status === "open" ? "text-red-700 dark:text-red-400" : "text-emerald-700 dark:text-emerald-400"}`}>
                        {iss.driverName} — {iss.vehicleRegNo}
                      </p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${iss.status === "open"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                        }`}>
                        {iss.status === "open" ? "Open" : "Resolved"}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span className="font-medium">Issue:</span> {iss.issueDescription}
                    </p>

                    {/* Issue photo */}
                    {iss.issuePhoto && (
                      <a href={getImageUrl(iss.issuePhoto)} target="_blank" rel="noreferrer">
                        <img
                          src={getImageUrl(iss.issuePhoto)} className="w-14 h-12 rounded-lg object-cover border mb-1 hover:opacity-80" alt="issue" />
                      </a>
                    )}

                    <p className="text-xs text-gray-400">
                      Reported by {iss.reportedBy} · {fmtDatetime(iss.reportedAt)}
                    </p>

                    {/* Resolved section */}
                    {iss.status === "resolved" && (
                      <div className="mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-800">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Resolution:</span> {iss.resolveDescription}
                        </p>
                        {iss.resolvePhoto && (
                          <a href={getImageUrl(iss.resolvePhoto)} target="_blank" rel="noreferrer" className="ml-8 inline-block">
                            <img
                              src={getImageUrl(iss.resolvePhoto)} className="w-14 h-12 rounded-lg object-cover border border-emerald-200 mt-1 hover:opacity-80" alt="resolve" />
                          </a>
                        )}
                        <p className="text-xs text-gray-400 mt-0.5">
                          Resolved by {iss.resolvedBy} · {fmtDatetime(iss.resolvedAt)}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

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
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <div className="text-xl font-semibold text-gray-800 dark:text-gray-100 leading-tight">{value}</div>
      {sub && (
        <div className={`text-xs flex items-center gap-1 ${subColor || "text-gray-400"}`}>{sub}</div>
      )}
    </div>
  );
}




function LiveVehicleRow({ entry, index, order, onRefresh, vehicle, gpsData, onTrackIdFetched, correctVehicleIndex }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentPhoto, setCommentPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [callModalOpen, setCallModalOpen] = useState(false);

  console.log("entry", entry)

  console.log("vehicle", vehicle)

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
      iss.vehicleIndex === entry.vehicleIndex &&
      iss.vehicleRegNo === entry.vehicleRegistrationNumber
  );
  const openCount = vehicleIssues.filter((i) => i.status === "open").length;

  // Last updated "X mins ago" helper
  const timeAgo = (dateStr) => {
    if (!dateStr) return "—";
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
    if (diff < 1) return "just now";
    if (diff < 60) return `${diff} min${diff > 1 ? "s" : ""} ago`;
    const hrs = Math.floor(diff / 60);
    return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  };

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
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                Vehicle {String(index + 1).padStart(2, "0")}
              </span>
              {isIgnitionOn ? (
                <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Running
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">
                  Offline
                </span>
              )}
            </div>


            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <MapPin size={11} className="flex-shrink-0" />
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {entry.currentLocation || (isOnRoad ? "On Road" : "Last seen: En route")}
              </span>
              {(vehicle.fromLocation || vehicle.toLocation) && (
                <span className="text-gray-400">
                  — {vehicle.fromLocation} → {vehicle.toLocation}
                </span>
              )}
            </div>


            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
              <span className="flex items-center gap-1">
                <User size={11} />
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {entry.driverName || "—"}
                </span>
              </span>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <span className="flex items-center gap-1">
                <Users size={11} />
                <span>
                  {
                    (vehicle.promoterCost === 0
                      ? "No Promoter"
                      : "Promoter Available")}
                </span>
              </span>
            </div>


            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
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
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Last update · {lastSeen}
            </p>
            <span className="text-xs text-gray-500">
              {distanceCovered.toFixed(2)} km covered
            </span>
          </div>

          {/* ── Col 3: GPS + Buttons ── */}
          <div className="flex flex-col items-end gap-2.5 flex-shrink-0">

            {/* GPS status */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400">GPS</span>
              {isOnRoad ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
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
                    Resolve Issue
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
                <p className="text-xs text-gray-400 mt-0.5">
                  {entry.vehicleRegistrationNumber}
                </p>
              </div>
              <button onClick={() => setModalOpen(false)}>
                <XCircle size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
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
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3">
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
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
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
                        <p className="text-xs text-gray-700 dark:text-gray-300 mb-1">
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
                              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                {iss.resolvedBy}
                              </span>
                              <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-600 font-medium">
                                Resolution
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 ml-8">
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



export default function OnRoadTab({ order, onRefresh ,vehicleTypes }) {

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

  // useEffect(() => {
  //   fetchGpsData();
  // }, []);

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

  // const { vehicleTypes, fetchVehicleTypes } = useVehicle();

  // useEffect(() => {
  //   fetchVehicleTypes();
  // }, []);

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
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">On Road</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {vehicles.length} booking item{vehicles.length > 1 ? "s" : ""} · {totalVehicles} total vehicles
            </p>
          </div>
          {totalOnRoad > 0 && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
              {totalOnRoad} On Road
            </span>
          )}
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