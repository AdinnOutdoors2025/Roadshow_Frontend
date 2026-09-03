
/* eslint-disable */
// @ts-nocheck
"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Truck, User, Phone, Car, Upload, Eye, Download,
  Plus, XCircle, AlertCircle, CheckCircle,
  Clock, ChevronDown, ChevronUp, MapPin,
  Wifi, WifiOff, Camera, Video, TrendingUp,
  Users, AlertTriangle, Navigation, Activity,
  FileText, Shield,
  RefreshCw,
  Loader2,
} from "lucide-react";
import API_BASE from "../../../../baseurl";
import FilePreviewModal from "@/components/ui/FilePreviewModal";
import { getToken } from "../../utils/auth";
import { useVehicle } from "../../../context/vehicletypecontext";
import LiveVehicleRow from "./LiveVehicleRow";
import VehicleUnavailableRow from "./VehicleUnavailableRow";


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
  const [preview, setPreview] = useState<{ url: string; label: string } | null>(null);


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
      return entries.some(e => e.unavailableStatus === true);
    });


  const allEntries = order.onRoadExecutionArray || [];
  const totalOnRoad = allEntries.filter((e) => e.onRoadStatus === 1 && !e.unavailableStatus && e.entryStatus !== "removed").length;
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
            {vehicle.campaignType?.trim() && (
              <span className="text-[15px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 font-medium">
                {vehicle.campaignType}
              </span>
            )}
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
          {vehicle.campaignName?.trim() && (
            <p className="text-md text-gray-400 mt-0.5">{vehicle.campaignName}</p>
          )}
        </div>


        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className="text-sm font-bold px-2 py-0.5 rounded-full border bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
            {unavailableCount} unavailable
          </span>
          {open
            ? <ChevronUp size={14} className="text-gray-300" />
            : <ChevronDown size={14} className="text-gray-300" />}
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
                {campaignName?.trim() && (
                  <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{campaignName}</p>
                )}
                {clientName?.trim() && (
                  <p className="text-sm text-gray-400 mt-0.5">{clientName}</p>
                )}
              </div>

              <div className="w-px h-10 bg-gray-100 dark:bg-gray-800 flex-shrink-0" />


              <div className="flex gap-6 flex-wrap flex-1 min-w-0">
                {campaignType?.trim() && (
                  <div>
                    <p className="text-sm text-gray-400">Campaign type</p>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-0.5">{campaignType}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-400">Start date</p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-0.5">{fmtDate(startDate)}</p>
                  <p className="text-sm text-gray-400">End · {fmtDate(endDate)}</p>
                </div>
                {city?.trim() && (
                  <div>
                    <p className="text-sm text-gray-400">City</p>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-0.5">{city}</p>
                  </div>
                )}

                {state?.trim() && (
                  <div>
                    <p className="text-sm text-gray-400">State</p>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-0.5">{state}</p>
                  </div>
                )}

              </div>
            </div>
          </div>


          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">



            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100">
                  Unavailable vehicle status ({unavailableCount} unavailable)
                </h3>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[520px] overflow-y-auto">
                {vehicleEntries.map((entry, idx) => (
                  <VehicleUnavailableRow
                    key={entry._id || idx}
                    entry={entry}
                    index={idx}
                    order={order}
                    onRefresh={onRefresh}
                    vehicle={vehicle}
                    vehicleTypes={vehicleTypes}
                    gpsData={gpsData}
                    correctVehicleIndex={vehicleIndex}
                    forceOpen={activeIssueEntryId === entry.vehicleRegistrationNumber}
                    onForceOpenHandled={() => setActiveIssueEntryId(null)}
                  />
                ))}
                {vehicleEntries.length === 0 && (
                  <div className="p-6 text-center text-gray-400 text-sm">
                    No unavailable vehicles.
                  </div>
                )}
              </div>
            </div>


            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100">
                  Unavailable History
                </h3>
                <span className="text-xs text-gray-400">
                  {(order.onRoadUnavailableHistory || []).filter(h => h.vehicleIndex === vehicleIndex).length} records
                </span>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[400px] overflow-y-auto p-3 space-y-3">
                {(order.onRoadUnavailableHistory || [])
                  .filter(h => h.vehicleIndex === vehicleIndex)
                  .slice()
                  .reverse()
                  .map((h, i) => (
                    <div
                      key={h._id || i}
                      className={`rounded-xl border p-3 ${h.status === "unavailable"
                        ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10"
                        : "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/10"
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                          {h.eventType === "replaced" ? "Vehicle Replaced" : `${h.driverName} — ${h.vehicleRegNo}`}
                        </p>
                        <div className="flex items-center gap-1.5">
                          {h.eventType === "replaced" ? (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                              Replaced
                            </span>
                          ) : (
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${h.status === "unavailable"
                              ? "bg-red-100 text-red-600"
                              : "bg-emerald-100 text-emerald-600"
                              }`}>
                              {h.status === "unavailable" ? "Unavailable" : "Available"}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <span className="font-medium">Reason:</span> {h.reason}
                      </p>

                      {h.photo && (
                        <div className="flex items-start gap-2 mt-1">
                          <button
                            type="button"
                            onClick={() => setPreview({ url: getImageUrl(h.photo) })}
                            className="flex-shrink-0"
                          >
                            <img
                              src={getImageUrl(h.photo)}
                              className="w-14 h-12 rounded-lg object-cover border mb-1 hover:opacity-80"
                              alt="unavailable"
                            />
                          </button>
                          <a
                            href={getImageUrl(h.photo)}
                            download
                            target="_blank"
                            rel="noreferrer"
                            title="Download"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-green-500 hover:bg-green-50 transition-all"
                          >
                            <Download size={14} />
                          </a>
                        </div>
                      )}

                      <p className="text-sm text-gray-400">
                        Reported by {h.reportedBy} · {fmtDatetime(h.reportedAt)}
                      </p>


                      {h.eventType === "replaced" && (
                        <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-800/50 grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-sm text-gray-400">Old Vehicle</p>
                            <p className="text-sm font-mono font-semibold text-gray-700 dark:text-gray-300">{h.vehicleRegNo}</p>
                            <p className="text-sm text-gray-500">{h.driverName} · {h.driverPhone}</p>
                          </div>
                          <div>
                            <p className="text-sm text-amber-600 dark:text-amber-400">Replacement Vehicle</p>
                            <p className="text-sm font-mono font-semibold text-gray-700 dark:text-gray-300">{h.replacementVehicleRegNo}</p>
                            <p className="text-sm text-gray-500">{h.replacementDriverName} · {h.replacementDriverPhone}</p>
                          </div>
                        </div>
                      )}

                      {h.status === "available" && h.resolvedBy && (
                        <div className="mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-800 space-y-1">
                          {h.resolveDescription && (
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Resolution:</span> {h.resolveDescription}
                            </p>
                          )}
                          {h.resolvePhoto && (
                            <div className="flex items-start gap-2 mt-1">
                              <button
                                type="button"
                                onClick={() => setPreview({ url: getImageUrl(h.resolvePhoto), label: "Resolution Photo" })}
                                className="flex-shrink-0"
                              >
                                <img
                                  src={getImageUrl(h.resolvePhoto)}
                                  className="w-14 h-12 rounded-lg object-cover border border-emerald-200 hover:opacity-80"
                                  alt="resolve"
                                />
                              </button>
                              <a
                                href={getImageUrl(h.resolvePhoto)}
                                download
                                target="_blank"
                                rel="noreferrer"
                                title="Download"
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-green-500 hover:bg-green-50 transition-all"
                              >
                                <Download size={14} />
                              </a>
                            </div>
                          )}
                          <p className="text-xs text-gray-400">
                            Available by {h.resolvedBy} · {fmtDatetime(h.resolvedAt)}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                {(order.onRoadUnavailableHistory || []).filter(h => h.vehicleIndex === vehicleIndex).length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">No unavailable history</p>
                )}
              </div>
            </div>
          </div>


        </div>
      )}

      {preview && (
        <FilePreviewModal
          url={preview.url}
          label={preview.label}
          onClose={() => setPreview(null)}
        />
      )}

    </div>




  );
}




export default function VehicleUnavailable({ order, onRefresh, vehicleTypes }) {

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
      return entries.some(e => e.unavailableStatus === true);
    });


  const allEntries = order.onRoadExecutionArray || [];
  const totalOnRoad = allEntries.filter((e) => e.onRoadStatus === 1 && !e.unavailableStatus && e.entryStatus !== "removed").length;
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
            <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100">Vehicle Unavailable</h3>
            <p className="text-sm text-gray-400 mt-0.5">
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

