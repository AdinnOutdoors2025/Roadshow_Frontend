

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
  MapPinIcon,
} from "lucide-react";
import { FaLocationDot } from "react-icons/fa6";
import API_BASE from "../../../../baseurl";
import FilePreviewModal from "@/components/ui/FilePreviewModal";
import { getToken } from "../../utils/auth";
import { useVehicle } from "../../../context/vehicletypecontext";
import LiveVehicleRow from "./LiveVehicleRow";
import AttendanceSummaryCard from "./AttendanceSummaryCard";
import OrderReportPDF from "./OrderReportPDF";
import CampaignHistoryPanel from "./CampaignHistoryPanel";
import ExtraKmModal from "./ExtraKmModal";
import ReleaseVehicleModal from "./ReleaseVehicleModal";
import AddVehicleModal from "./AddVehicleModal";


// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (s) => {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

// "Day X of Y" for a campaign's date range, so admin doesn't have to mentally
// count from fromDate/toDate to know how far into the campaign today is.
const getCampaignDayInfo = (from, to) => {
  if (!from || !to) return null;
  const start = new Date(new Date(from).toDateString());
  const end = new Date(new Date(to).toDateString());
  const today = new Date(new Date().toDateString());
  const totalDays = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
  if (today < start) {
    const daysToStart = Math.round((start.getTime() - today.getTime()) / 86400000);
    return { label: `Starts in ${daysToStart}d`, cls: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400" };
  }
  if (today > end) {
    return { label: "Campaign completed", cls: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400" };
  }
  const dayNum = Math.round((today.getTime() - start.getTime()) / 86400000) + 1;
  const daysLeft = totalDays - dayNum;
  const label = daysLeft === 0
    ? `Last day running (Day ${dayNum} of ${totalDays})`
    : `${dayNum}${dayNum === 1 ? "st" : dayNum === 2 ? "nd" : dayNum === 3 ? "rd" : "th"} day running · ${daysLeft} day${daysLeft === 1 ? "" : "s"} left`;
  return { label, cls: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" };
};

const formatINR = (value: string | number) => {
  const num = parseFloat(String(value).replace(/[^0-9.]/g, ""));
  if (isNaN(num) || value === "" || value === undefined) return "";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
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

// Single source of truth for a registration-number's current status tag,
// used across the Issue, Extra KM, Driver History and Campaign History
// panels so chained replacements are never ambiguous.
function getRegStatus(entry, unavailableHistory = []) {
  if (!entry) return { label: "—", cls: "bg-gray-100 text-gray-400 border-gray-200" };
  const wasReplaced = (unavailableHistory || []).some(
    (h) => h.eventType === "replaced" && h.vehicleRegNo === entry.vehicleRegistrationNumber
  );
  if (wasReplaced) {
    return { label: "Replaced", cls: "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800" };
  }
  if (entry.entryStatus === "removed") {
    return { label: "Released", cls: "bg-gray-200 text-gray-600 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600" };
  }
  if (entry.unavailableStatus) {
    return { label: "Unavailable", cls: "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800" };
  }
  if (entry.onRoadStatus === 1) {
    return { label: "On Road", cls: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800" };
  }
  return { label: "Assigned", cls: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800" };
}

function RegStatusBadge({ entry, unavailableHistory = [], className = "" }) {
  const { label, cls } = getRegStatus(entry, unavailableHistory);
  return (
    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border leading-none ${cls} ${className}`}>
      {label}
    </span>
  );
}

function VehicleExecutionCard({ vehicle, vehicleIndex, order, onRefresh, vehicleTypes, driverLocations, isOpen, onToggle }) {
  const [gpsData, setGpsData] = useState([]);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [activeDriverTab, setActiveDriverTab] = useState(0);
  const [toggling, setToggling] = useState(false);
  const issueRef = useRef(null);
  const [activeIssueEntryId, setActiveIssueEntryId] = useState<string | null>(null);
  const [routeTrackId, setRouteTrackId] = useState<string | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeRefreshNonce, setRouteRefreshNonce] = useState(0);
  const [kmPage, setKmPage] = useState(0);
  const [liveTab, setLiveTab] = useState<"status" | "history" | "campaign">("status");
  const [activeExtraKmTab, setActiveExtraKmTab] = useState(0);
  const [activeIssueVehicleTab, setActiveIssueVehicleTab] = useState(0);
  const [selectedVehicleRegNo, setSelectedVehicleRegNo] = useState<string | null>(null);
  const [extraKmModalOpen, setExtraKmModalOpen] = useState(false);
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const [addVehicleModalOpen, setAddVehicleModalOpen] = useState(false);
  const [bookingStatusMap, setBookingStatusMap] = useState({});
  const [bookingStatusLoading, setBookingStatusLoading] = useState(false);
  // one
  const [vehicleAvailTab, setVehicleAvailTab] = useState<"available" | "unavailable">("available");

  // While a refresh (GPS + booking-status) is in flight, the stats/live-status/
  // route/issue/extra-KM sections below would briefly show stale or zeroed-out
  // values — hide them behind a loading state instead until both calls land.
  const isRefreshing = gpsLoading || bookingStatusLoading;
  const RefreshSkeleton = () => (
    <div className="flex items-center justify-center gap-2 py-10 text-gray-400">
      <Loader2 size={18} className="animate-spin" />
      <span className="text-sm">Refreshing vehicle data…</span>
    </div>
  );

  const cleanReg = (r) => (r || "").replace(/\s+/g, "").toUpperCase();

  const fetchBookingStatus = async () => {
    if (!vehicle.vehicleType) return;

    setBookingStatusLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}api/getNewVehicles`, {
        params: { vehicleType: vehicle.vehicleType },
      });

      const docs = data?.data || [];
      const map = {};

      docs.forEach((doc) => {
        (doc.registrationVehicles || []).forEach((rv) => {
          const key = cleanReg(rv.registrationNumber);
          map[key] = {
            currentStatus: rv.statusAvailability?.currentStatus || "",
            orderId: rv.statusAvailability?.orderId || "",
            orderDisplayId: rv.statusAvailability?.orderDisplayId || "",
          };
        });
      });

      setBookingStatusMap(map);
    } catch (err) {
      console.error("Booking status fetch error:", err);
    } finally {
      setBookingStatusLoading(false);
    }
  };

  const fetchRouteTrackId = async (vehicleRegNo: string) => {
    setRouteLoading(true);
    try {
      const res = await axios.get("https://api.vamosys.com/getVehicleExp", {
        params: {
          vehicleId: vehicleRegNo,
          fcode: "VAM",
          days: 30,
          mailId: "vignesh032rk@gmail.com",
          phone: "9345771779",
          userId: "ADINN12",
        },
      });

      const trackId = res.data;

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

  // FOC (Free of Cost) extension requests raised for this vehicle-type slot —
  // e.g. via the Campaign Calculator's Mark Absent → "Extend Campaign +1 Day"
  // flow. Super-admin-created entries land already "approved"; anyone else's
  // request sits "pending" until a super admin approves it.
  const bookingItemForVehicle = (order.bookingItems || [])[vehicleIndex];
  const vehicleFocEntries = (order.campaignClosureArray || []).filter(
    (c) => c.type === "foc" && String(c.bookingItemId) === String(bookingItemForVehicle?._id || "")
  );
  const pendingFoc = vehicleFocEntries.find((c) => c.status === "pending");
  const approvedFoc = [...vehicleFocEntries].reverse().find((c) => c.status === "approved");

  const vehicleIssues = (order.onRoadIssues || []).filter(
    (iss) => iss.vehicleIndex === vehicleIndex
  );
  // A vehicle that's been replaced/marked unavailable is no longer the
  // team's active concern — its still-"open" issue shouldn't keep inflating
  // the "Open issues" stat card / header badge forever. Only count issues
  // against entries that are currently active (not removed, not unavailable).
  const activeEntriesForVehicle = (order.onRoadExecutionArray || []).filter(
    (e) => e.vehicleIndex === vehicleIndex && e.entryStatus !== "removed" && !e.unavailableStatus
  );
  const openIssues = vehicleIssues.filter((iss) => {
    if (iss.status !== "open") return false;
    return activeEntriesForVehicle.some((e) =>
      iss.entryId ? String(iss.entryId) === String(e._id) : iss.vehicleRegNo === e.vehicleRegistrationNumber
    );
  });
  const resolvedIssues = vehicleIssues.filter((iss) => iss.status === "resolved");

  const vehicles = (order.bookingItems || [])
    .map((item, originalIdx) => ({ item, originalIdx }))
    .filter(({ item, originalIdx }) => {
      const entries = (order.onRoadExecutionArray || [])
        .filter(e => e.vehicleIndex === originalIdx);
      return entries.some(e => e.onRoadStatus === 1);
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

  // Active entries — used for Vehicle Status tab, Extra KM add dropdown, new Issue add
  const vehicleEntries = (order.onRoadExecutionArray || []).filter(
    (e) => e.vehicleIndex === vehicleIndex && e.entryStatus !== "removed"
  );

  // two

  // const availableVehicleEntries = vehicleEntries.filter((e) => !e.unavailableStatus);
  // const unavailableVehicleEntries = vehicleEntries.filter((e) => e.unavailableStatus);
  // const displayedVehicleEntries =
  //   vehicleAvailTab === "available" ? availableVehicleEntries : unavailableVehicleEntries;

    const availableVehicleEntries = vehicleEntries.filter((e) => !e.unavailableStatus);
  const unavailableVehicleEntries = vehicleEntries.filter((e) => e.unavailableStatus);

  // No unavailable vehicles left → force back to "available" so the (now hidden)
  // tab switcher doesn't leave the list stuck showing an empty "unavailable" view
  useEffect(() => {
    if (unavailableVehicleEntries.length === 0 && vehicleAvailTab !== "available") {
      setVehicleAvailTab("available");
    }
  }, [unavailableVehicleEntries.length, vehicleAvailTab]);

  const displayedVehicleEntries =
    vehicleAvailTab === "available" ? availableVehicleEntries : unavailableVehicleEntries;

  // Active + available — used for the On-Road live list. Vehicles flagged
  // unavailable move out of On-Road and only show under Vehicle Unavailable.
  const liveStatusEntries = vehicleEntries.filter((e) => !e.unavailableStatus);

  // All entries including removed — used for Driver History / Campaign History (so removed vehicles' history is visible)
  const allVehicleEntriesIncludingRemoved = (order.onRoadExecutionArray || []).filter(
    (e) => e.vehicleIndex === vehicleIndex
  );

  // Only registrations that actually have at least one issue — Issue/Escalation tab list
  const issueVehicleEntries = allVehicleEntriesIncludingRemoved.filter((entry) =>
    (order.onRoadIssues || []).some((iss) =>
      iss.entryId ? String(iss.entryId) === String(entry._id) : iss.vehicleRegNo === entry.vehicleRegistrationNumber
    )
  );

  // Only registrations that actually have at least one Extra KM entry — Extra KM History tab list
  const extraKmVehicleEntries = allVehicleEntriesIncludingRemoved.filter((entry) =>
    (order.extraKmDetailsArray || []).some((e) => {
      if (e.vehicleIndex !== vehicleIndex) return false;
      return e.entryId ? String(e.entryId) === String(entry._id) : e.vehicleRegistrationNumber === entry.vehicleRegistrationNumber;
    })
  );

  const fetchGpsData = async () => {
    setGpsLoading(true);
    try {
      const { data } = await axios.get(
        `${API_BASE}admin/vamosys/vehicle-locations`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      const locations = data?.data?.data?.[0]?.vehicleLocations ?? [];
      setGpsData(locations);
    } catch (error) {
      console.error(`GPS API Error (vehicleIndex ${vehicleIndex}):`, error);
      setGpsData([]);
    } finally {
      setGpsLoading(false);
    }
  };

  const hasFetchedGps = useRef(false);

  useEffect(() => {
    if (isOpen && !hasFetchedGps.current) {
      hasFetchedGps.current = true;
      fetchGpsData();
    }
  }, [isOpen]);

  const activeRegNosKey = vehicleEntries
    .filter(e => e.entryStatus !== "removed")
    .map(e => e.vehicleRegistrationNumber)
    .filter(Boolean)
    .join(",");

  useEffect(() => {
    if (isOpen) {
      fetchBookingStatus();
    }
  }, [isOpen, activeRegNosKey]);

  const totalKm = liveStatusEntries.reduce((sum, e) => {
    const gps = gpsData.find(g => g.vehicleId === e.vehicleRegistrationNumber);
    return sum + (gps?.distanceCovered || 0);
  }, 0);

  const dailyKmLimit = vehicle.dailyKmLimit || 0;
  const routeCoveredPct = dailyKmLimit > 0
    ? Math.min(100, Math.round((totalKm / dailyKmLimit) * 100))
    : 0;

  const quantity = vehicle.quantity || 1;
  const savedCount = liveStatusEntries.length;
  const allDriversSaved = savedCount >= quantity;
  const isVehicleOnRoad = liveStatusEntries.some((e) => e.onRoadStatus === 1);
  const liveCount = liveStatusEntries.filter(e => {
    const gps = gpsData.find(g => g.vehicleId === e.vehicleRegistrationNumber);
    return gps?.ignitionStatus === "ON";
  }).length;

  // ── NEW: valid vehicles count (excludes reg-mismatch entries) ──
  const cleanRegForStats = (r) => (r || "").replace(/\s+/g, "").toUpperCase();
  const isEntryBookingValidForStats = (entry) => {
    const bs = bookingStatusMap?.[cleanRegForStats(entry.vehicleRegistrationNumber)];
    return !!(
      bs &&
      bs.currentStatus === "Booked" &&
      String(bs.orderId) === String(order._id) &&
      bs.orderDisplayId === order.orderId
    );
  };
  const validVehicleCount = vehicleEntries.filter(isEntryBookingValidForStats).length;
  const mismatchVehicleCount = vehicleEntries.length - validVehicleCount;

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
        onClick={onToggle}
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
            {/* {vehicleEntries.some((e) => e.unavailableStatus) && (
              <span className="text-[14px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-semibold border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                Vehicle Unavailable
              </span>
            )} */}
            {pendingFoc && (
              <span className="text-[14px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800">
                FOC — Waiting for Approval
              </span>
            )}
            {!pendingFoc && approvedFoc && (
              <span className="text-[14px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800">
                FOC Approved · +1 Day
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
            {(() => {
              const dayInfo = getCampaignDayInfo(vehicle.fromDate, vehicle.toDate);
              return dayInfo && (
                <span className={`text-[13px] font-semibold px-2 py-0.5 rounded-full ${dayInfo.cls}`}>
                  {dayInfo.label}
                </span>
              );
            })()}
          </div>
          {vehicle.campaignName?.trim() && (
            <p className="text-md text-gray-400 mt-0.5">{vehicle.campaignName}</p>
          )}
        </div>

        {/* Right */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className={`text-sm font-bold px-2 py-0.5 rounded-full border ${driverBadgeClass}`}>
            {savedCount}/{quantity} drivers
          </span>
          {isOpen
            ? <ChevronUp size={14} className="text-gray-300" />
            : <ChevronDown size={14} className="text-gray-300" />}
        </div>
      </div>

      {/* ── Expanded Section ── */}
      {isOpen && (
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
                {campaignName?.trim() && (
                  <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{campaignName}</p>
                )}
                {clientName?.trim() && (
                  <p className="text-sm text-gray-400 mt-0.5">{clientName}</p>
                )}
              </div>

              {/* Divider */}
              <div className="w-px h-10 bg-gray-100 dark:bg-gray-800 flex-shrink-0" />

              {/* Meta grid */}
              <div className="flex gap-6 flex-wrap flex-1 min-w-0">
                {campaignType && (
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
                {city && (
                  <div>
                    <p className="text-sm text-gray-400">City</p>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-0.5">{city}</p>
                  </div>
                )}
                {state && (
                  <div>
                    <p className="text-sm text-gray-400">State</p>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-0.5">{state}</p>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      fetchGpsData();
                      fetchBookingStatus();
                      onRefresh();
                    }}
                    disabled={gpsLoading}
                    className="flex items-center justify-center text-[13px] gap-2 px-3 py-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all disabled:opacity-50 w-[110px] flex-shrink-0"
                  >
                    {gpsLoading ? (
                      <>
                        <Loader2 size={13} className="animate-spin flex-shrink-0" />
                        <span className="whitespace-nowrap">Refreshing</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw size={13} className="flex-shrink-0" />
                        <span className="whitespace-nowrap">Refresh</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExtraKmModalOpen(true);
                    }}
                    className="flex items-center text-[13px] gap-2 px-3 py-1.5 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-all"
                  >
                    <Navigation size={13} />
                    <span>Extra KM</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setReleaseModalOpen(true);
                    }}
                    className="flex items-center text-[13px] gap-2 px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all"
                  >
                    <XCircle size={13} />
                    <span>withdraw vehicle</span>
                  </button>

                  {/* {savedCount < quantity && ( */}
                  {/* <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAddVehicleModalOpen(true);
                      }}
                      className="flex items-center text-[13px] gap-2 px-3 py-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all"
                    >
                      <Plus size={13} />
                      <span>Add Vehicle</span>
                    </button> */}
                  {/* )} */}
                </div>
              </div>
            </div>
          </div>

          {/* ── Stats Row ── */}
          {isRefreshing ? <RefreshSkeleton /> : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
              <StatCard
                icon={Truck}
                iconBg="bg-blue-50 dark:bg-blue-900/20"
                iconColor="text-blue-500"
                label="Vehicles live"
                value={`${liveStatusEntries.length} / ${quantity}`}
                subColor={mismatchVehicleCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}
              />

              <StatCard
                icon={Activity}
                iconBg="bg-emerald-50 dark:bg-emerald-900/20"
                iconColor="text-emerald-500"
                label="Route covered"
                value={`${routeCoveredPct}%`}
                subColor="text-emerald-600 dark:text-emerald-400"
              />

              <StatCard
                icon={AlertTriangle}
                iconBg="bg-red-50 dark:bg-red-900/20"
                iconColor="text-red-500"
                label="Open issues"
                value={<span className="text-red-500">{openIssues.length}</span>}
                sub={
                  <span
                    className="text-blue-500 cursor-pointer"
                    onClick={() => issueRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  >
                    View issues
                  </span>
                }
              />

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
                    {liveStatusEntries.slice(kmPage * 2, kmPage * 2 + 2).map((e, i) => {
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
                    onClick={() => setKmPage(p => Math.min(Math.ceil(liveStatusEntries.length / 2) - 1, p + 1))}
                    disabled={kmPage >= Math.ceil(liveStatusEntries.length / 2) - 1}
                    className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-gray-200 disabled:opacity-30 transition-all flex-shrink-0"
                  >
                    <ChevronDown size={12} className="-rotate-90" />
                  </button>
                </div>

                {/* Dot indicators */}
                {liveStatusEntries.length > 2 && (
                  <div className="flex items-center justify-center gap-1">
                    {Array.from({ length: Math.ceil(liveStatusEntries.length / 2) }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-full transition-all ${i === kmPage ? "w-3 h-1.5 bg-blue-400" : "w-1.5 h-1.5 bg-gray-200 dark:bg-gray-700"}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {isRefreshing ? null : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100">
                    Live vehicle status ({liveStatusEntries.length}/{quantity} drivers)
                  </h3>
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
                    <button
                      onClick={() => setLiveTab("campaign")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${liveTab === "campaign" ? "bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                    >
                      Campaign History
                    </button>
                  </div>
                  {liveStatusEntries.filter(e => e.onRoadStatus === 1).length > 0 && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                      {liveStatusEntries.filter(e => e.onRoadStatus === 1).length} On Road
                    </span>
                  )}
                </div>
              {liveTab === "status" && unavailableVehicleEntries.length > 0 && (
                <div className="flex items-center gap-1 px-4 pt-3 pb-2 border-b border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => setVehicleAvailTab("available")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${vehicleAvailTab === "available"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                          : "text-gray-400 hover:text-gray-600 border border-transparent"
                        }`}
                    >
                      Available Vehicle
                      <span className="text-[10px] font-bold px-1.5 rounded-full bg-white/70 dark:bg-black/20">
                        {availableVehicleEntries.length}
                      </span>
                    </button>
                    <button
                      onClick={() => setVehicleAvailTab("unavailable")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${vehicleAvailTab === "unavailable"
                          ? "bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                          : "text-gray-400 hover:text-gray-600 border border-transparent"
                        }`}
                    >
                      Unavailable Vehicle
                      <span className="text-[10px] font-bold px-1.5 rounded-full bg-white/70 dark:bg-black/20">
                        {unavailableVehicleEntries.length}
                      </span>
                    </button>
                  </div>
                )}

                <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[520px] overflow-y-auto">
                  {liveTab === "status" ? (
                    <>
                      {displayedVehicleEntries.map((entry, idx) => (
                        <LiveVehicleRow
                          key={entry._id || idx}
                          entry={entry}
                          index={idx}
                          order={order}
                          onRefresh={onRefresh}
                          vehicle={vehicle}
                          gpsData={gpsData}
                          bookingStatusMap={bookingStatusMap}
                          onBookingStatusRefresh={fetchBookingStatus}
                          onTrackIdFetched={(regNo) => fetchRouteTrackId(regNo)}
                          correctVehicleIndex={vehicleIndex}
                          forceOpen={activeIssueEntryId === entry.vehicleRegistrationNumber}
                          onForceOpenHandled={() => setActiveIssueEntryId(null)}
                          onViewDriverRoute={(regNo) => setSelectedVehicleRegNo(regNo)}
                          vehicleTypes={vehicleTypes}
                        />
                      ))}
                      {/* {vehicleEntries.length === 0 && (
                      <div className="p-6 text-center text-gray-400 text-sm">
                        No drivers assigned.
                      </div>
                    )} */}

                      {displayedVehicleEntries.length === 0 && (
                        <div className="p-6 text-center text-gray-400 text-sm">
                          {vehicleAvailTab === "available"
                            ? "No available vehicles."
                            : "No unavailable vehicles."}
                        </div>
                      )}

                      {/* ── NEW: Released vehicles summary — always visible, no tab-hunting needed ── */}
                      {allVehicleEntriesIncludingRemoved.filter(e => e.entryStatus === "removed").length > 0 && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/40">
                          <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
                            <XCircle size={13} className="text-red-400" />
                            Released vehicles ({allVehicleEntriesIncludingRemoved.filter(e => e.entryStatus === "removed").length})
                          </p>
                          <div className="space-y-2">
                            {allVehicleEntriesIncludingRemoved
                              .filter(e => e.entryStatus === "removed")
                              .map((e, i) => {
                                const issueIdx = issueVehicleEntries.findIndex(x => x._id === e._id);
                                const extraKmIdx = extraKmVehicleEntries.findIndex(x => x._id === e._id);
                                return (
                                  <button
                                    key={e._id || i}
                                    onClick={() => {
                                      if (issueIdx !== -1) setActiveIssueVehicleTab(issueIdx);
                                      if (extraKmIdx !== -1) setActiveExtraKmTab(extraKmIdx);
                                      issueRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                                    }}
                                    className="w-full text-left rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                                  >
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                          {e.vehicleRegistrationNumber || "—"}
                                        </span>
                                        <span className="text-xs text-gray-500">{e.driverName || "—"}</span>
                                      </div>
                                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                                        Released
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1.5">
                                      By {e.removedBy || "—"} on {fmtDatetime(e.removedAt)}
                                      {e.removalReason ? ` — ${e.removalReason}` : ""}
                                    </p>
                                    <p className="text-xs text-blue-500 mt-1">View issues / extra KM history →</p>
                                  </button>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </>
                  ) : liveTab === "history" ? (
                    <DriverHistoryPanel
                      vehicleEntries={allVehicleEntriesIncludingRemoved}
                      driverHistory={order.onRoadDriverHistory || []}
                      unavailableHistory={order.onRoadUnavailableHistory || []}
                      vehicleIndex={vehicleIndex}
                    />
                  ) : (
                    <CampaignHistoryPanel
                      vehicleEntries={allVehicleEntriesIncludingRemoved}
                      driverHistory={order.onRoadDriverHistory || []}
                      issueHistory={order.onRoadIssues || []}
                      unavailableHistory={order.onRoadUnavailableHistory || []}
                      vehicleIndex={vehicleIndex}
                      campaignFromDate={vehicle.fromDate}
                      campaignToDate={vehicle.toDate}
                    />
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100">
                    Today's route progress
                  </h3>
                  <div className="flex items-center gap-2">
                    {selectedVehicleRegNo && (
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                        {selectedVehicleRegNo}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const regNo = selectedVehicleRegNo || vehicleEntries[0]?.vehicleRegistrationNumber;
                        if (!regNo) return;
                        setRouteRefreshNonce((n) => n + 1);
                        fetchRouteTrackId(regNo);
                      }}
                      disabled={routeLoading}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-all"
                      title="Refresh map"
                    >
                      <RefreshCw size={13} className={routeLoading ? "animate-spin" : ""} />
                    </button>
                  </div>
                </div>

                <div className="border-b border-gray-100 dark:border-gray-800 relative overflow-hidden" style={{ height: "280px" }}>
                  {routeLoading ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                      <Loader2 size={24} className="animate-spin text-blue-400" />
                      <p className="text-xs text-gray-400">Loading route map...</p>
                    </div>
                  ) : routeTrackId ? (
                    <iframe
                      key={`${routeTrackId}-${routeRefreshNonce}`}
                      src={`https://gpsvts.vamosys.com/gps/public/track?vehicleId=${routeTrackId}&maps=track&userID=ADINN12`}
                      className="w-full h-full border-0"
                      title="Live Route Map"
                      allowFullScreen
                    />
                  ) : (
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

                <div className="divide-y-0">
                  {(() => {
                    const regNo = selectedVehicleRegNo || vehicleEntries[0]?.vehicleRegistrationNumber;
                    const locations = driverLocations[regNo] || [];

                    if (locations.length === 0) {
                      return (
                        <div className="p-6 text-center text-gray-400 text-sm">
                          No location history found
                        </div>
                      );
                    }

                    return locations.map((loc, i) => {
                      const isLast = i === locations.length - 1;
                      const status = isLast ? "inprogress" : "completed";
                      const shortAddress = loc.address?.split(",").slice(0, 2).join(", ") || "Unknown";
                      const time = new Date(loc.updatedAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit", minute: "2-digit", hour12: true,
                      });

                      return (
                        <div key={loc._id} className="flex items-start gap-3 px-4 py-3 relative">
                          {/* Left: icon + vertical line */}
                          <div className="flex flex-col items-center flex-shrink-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${status === "completed"
                              ? "bg-emerald-500"
                              : "bg-amber-400"
                              }`}>
                              {status === "completed"
                                ? <FaLocationDot size={15} className="text-white fill-white" />
                                : <Navigation size={15} className="text-white" />
                              }
                            </div>

                            {/* vertical connector — hidden on last item */}
                            {i < locations.length - 1 && (
                              <div className="w-0.5 bg-gray-200 dark:bg-gray-700 flex-1 min-h-[20px] mt-1" />
                            )}
                          </div>

                          {/* Right: text + badge */}
                          <div className="flex-1 min-w-0 flex items-start justify-between gap-2 pt-1">
                            <div className="min-w-0">
                              <p className="text-xs text-gray-400">{time}</p>
                              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">
                                {shortAddress}
                              </p>
                            </div>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${status === "completed"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400"
                              : "bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-400"
                              }`}>
                              {status === "completed" ? "Visited" : "Current"}
                            </span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* ── Bottom Row ── */}
          {isRefreshing ? null : (
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

                {issueVehicleEntries.length > 1 && (
                  <div className="flex gap-1 px-3 pt-3 pb-0 border-b border-gray-100 dark:border-gray-800 overflow-x-auto">
                    {issueVehicleEntries.map((entry, i) => {
                      const entryOpenCount = vehicleIssues.filter(
                        (iss) =>
                          (iss.entryId ? String(iss.entryId) === String(entry._id) : iss.vehicleRegNo === entry.vehicleRegistrationNumber) &&
                          iss.status === "open"
                      ).length;
                      const isReleased = entry.entryStatus === "removed";
                      return (
                        <button
                          key={entry._id || i}
                          onClick={() => setActiveIssueVehicleTab(i)}
                          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap flex-shrink-0 ${activeIssueVehicleTab === i
                            ? "border-red-500 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
                            : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            }`}
                        >
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center text-white ${isReleased ? "bg-gray-400" : "bg-red-500"}`} style={{ fontSize: "9px" }}>
                            V{i + 1}
                          </div>
                          <span className="font-mono text-xs">{entry.vehicleRegistrationNumber || `Vehicle ${i + 1}`}</span>
                          <RegStatusBadge entry={entry} unavailableHistory={order.onRoadUnavailableHistory || []} />
                          {entryOpenCount > 0 && (
                            <span className="ml-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                              {entryOpenCount}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="p-4 space-y-4 max-h-72 overflow-y-auto">
                  {(() => {
                    const activeEntry = issueVehicleEntries[activeIssueVehicleTab];
                    if (!activeEntry) {
                      return (
                        <p className="text-xs text-gray-400 text-center py-4">
                          No issues reported
                        </p>
                      );
                    }

                    const releasedBanner = activeEntry.entryStatus === "removed" ? (
                      <div className="rounded-xl border border-gray-200 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700 p-3">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                          <XCircle size={12} className="text-red-500" />
                          This vehicle was released from the campaign
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          By {activeEntry.removedBy || "—"} on {fmtDatetime(activeEntry.removedAt)}
                          {activeEntry.removalReason ? ` — ${activeEntry.removalReason}` : ""}
                        </p>
                      </div>
                    ) : null;

                    const tabIssues = vehicleIssues.filter((iss) => {
                      if (iss.entryId) return String(iss.entryId) === String(activeEntry._id);
                      return iss.vehicleRegNo === activeEntry.vehicleRegistrationNumber;
                    });

                    if (tabIssues.length === 0) {
                      return (
                        <>
                          {releasedBanner}
                          <p className="text-xs text-gray-400 text-center py-4">
                            No issues reported
                          </p>
                        </>
                      );
                    }

                    const groups = {};
                    tabIssues.forEach((iss) => {
                      const key = iss.vehicleRegNo || "—";
                      if (!groups[key]) groups[key] = [];
                      groups[key].push(iss);
                    });

                    return (
                      <>
                        {releasedBanner}
                        {Object.keys(groups).map((regNo) => {
                          const groupIssues = [...groups[regNo]].reverse();
                          const isCurrentReg = regNo === activeEntry.vehicleRegistrationNumber;
                          const groupOpenCount = groupIssues.filter((i) => i.status === "open").length;

                          return (
                            <div key={regNo} className="space-y-2">
                              <div className="flex items-center justify-between px-1">
                                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${isCurrentReg
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400"
                                  : "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400"
                                  }`}>
                                  {regNo} {isCurrentReg ? "(current)" : "(old)"}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {groupIssues.length} issues{groupOpenCount > 0 ? ` · ${groupOpenCount} open` : ""}
                                </span>
                              </div>

                              {groupIssues.map((iss) => (
                                <IssueHistoryCard
                                  key={iss._id}
                                  iss={iss}
                                  onOpenModal={() => setActiveIssueEntryId(iss.vehicleRegNo)}
                                />
                              ))}
                            </div>
                          );
                        })}
                      </>
                    );
                  })()}
                </div>
              </div>

              <AttendanceSummaryCard vehicleEntries={vehicleEntries} order={order} vehicleIndex={vehicleIndex} />

              {/* ── Extra KM History ── */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100">
                    Extra KM History
                  </h3>
                  <span className="text-sm text-gray-400">
                    {(order.extraKmDetailsArray || []).filter((e) => e.vehicleIndex === vehicleIndex).length} entries
                  </span>
                </div>

                {extraKmVehicleEntries.length > 1 && (
                  <div className="flex gap-1 px-3 pt-3 pb-0 border-b border-gray-100 dark:border-gray-800 overflow-x-auto">
                    {extraKmVehicleEntries.map((entry, i) => {
                      const isReleased = entry.entryStatus === "removed";
                      return (
                        <button
                          key={entry._id || i}
                          onClick={() => setActiveExtraKmTab(i)}
                          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap flex-shrink-0 ${activeExtraKmTab === i
                            ? "border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20"
                            : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            }`}
                        >
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center text-white ${isReleased ? "bg-gray-400" : "bg-orange-500"}`} style={{ fontSize: "9px" }}>
                            V{i + 1}
                          </div>
                          <span className="font-mono text-xs">{entry.vehicleRegistrationNumber || `Vehicle ${i + 1}`}</span>
                          <RegStatusBadge entry={entry} unavailableHistory={order.onRoadUnavailableHistory || []} />
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="p-4 space-y-4 max-h-72 overflow-y-auto">
                  {(() => {
                    const activeEntry = extraKmVehicleEntries[activeExtraKmTab];

                    const entries = (order.extraKmDetailsArray || []).filter((e) => {
                      if (e.vehicleIndex !== vehicleIndex) return false;
                      if (!activeEntry) return false;
                      // entryId irundha adha vachu match pannu (reg no maari irundhalum sariya varum)
                      if (e.entryId) return String(e.entryId) === String(activeEntry._id);
                      // pazhaya entries la entryId illana reg no vachu match pannu
                      return e.vehicleRegistrationNumber === activeEntry.vehicleRegistrationNumber;
                    }).reverse();

                    if (entries.length === 0) {
                      return (
                        <p className="text-xs text-gray-400 text-center py-4">
                          No extra KM records
                        </p>
                      );
                    }

                    const groups = {};
                    entries.forEach((e) => {
                      const key = e.vehicleRegistrationNumber || "—";
                      if (!groups[key]) groups[key] = [];
                      groups[key].push(e);
                    });

                    return Object.keys(groups).map((regNo) => {
                      const groupEntries = [...groups[regNo]].reverse();
                      const isCurrentReg = regNo === activeEntry.vehicleRegistrationNumber;
                      const groupTotalKm = groupEntries.reduce((s, e) => s + (e.extraKm || 0), 0);
                      const groupTotalHrs = groupEntries.reduce((s, e) => s + (e.extraHours || 0), 0);
                      const groupTotalCost = groupEntries.reduce((s, e) => s + (e.totalCost || 0), 0);

                      return (
                        <div key={regNo} className="space-y-2">
                          <div className="flex items-center justify-between px-1">
                            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${isCurrentReg
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400"
                              : "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400"
                              }`}>
                              {regNo} {isCurrentReg ? "(current)" : "(old)"}
                            </span>
                            <span className="text-xs text-gray-400">
                              {groupTotalKm} km · {groupTotalHrs} hrs · {formatINR(groupTotalCost)}
                            </span>
                          </div>

                          {groupEntries.map((e) => (
                            <div
                              key={e._id}
                              className="relative rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow p-3 pl-4 overflow-hidden"
                            >
                              <div className="absolute left-0 top-0 bottom-0 w-1" />

                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div>
                                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                    {e.driverName || "—"}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {e.vehicleRegistrationNumber || "—"}
                                  </p>
                                </div>
                                <span className="text-sm font-bold text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-lg">
                                  {formatINR(e.totalCost)}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-gray-600 dark:text-gray-400 mb-2">
                                <span className="flex items-center gap-1">
                                  <svg className="w-3.5 h-3.5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                  </svg>
                                  Extra KM: <b className="text-gray-800 dark:text-gray-200">{e.extraKm} km</b>
                                </span>
                                <span className="flex items-center gap-1">
                                  <svg className="w-3.5 h-3.5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Extra Hours: <b className="text-gray-800 dark:text-gray-200">{e.extraHours} hrs</b>
                                </span>
                                <span className="pl-4.5">KM cost: {formatINR(e.extraKmCost)}</span>
                                <span className="pl-4.5">Hour cost: {formatINR(e.extraHourCost)}</span>
                              </div>

                              <div className="flex items-center justify-between flex-wrap gap-1.5 pt-2 border-t border-gray-50 dark:border-gray-800">
                                <span className="text-xs font-medium text-gray-500 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                                  {fmtDate(e.fromDate)} → {fmtDate(e.toDate)}
                                </span>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${e.distributionMethod === "split"
                                  ? "bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-900/20 dark:text-fuchsia-400"
                                  : "bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400"
                                  }`}>
                                  {e.distributionMethod === "split" ? "Split" : "Daily"}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {e.addedBy} · {new Date(e.addedAt).toLocaleString("en-IN", {
                                    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                                  })}
                                </span>
                              </div>

                            </div>
                          ))}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {extraKmModalOpen && (
        <ExtraKmModal
          order={order}
          vehicle={vehicle}
          vehicleIndex={vehicleIndex}
          vehicleEntries={liveStatusEntries}
          bookingStatusMap={bookingStatusMap}
          onClose={() => setExtraKmModalOpen(false)}
          onRefresh={onRefresh}
        />
      )}

      {releaseModalOpen && (
        <ReleaseVehicleModal
          order={order}
          vehicleEntries={liveStatusEntries}
          onClose={() => setReleaseModalOpen(false)}
          onRefresh={onRefresh}
        />
      )}

      {addVehicleModalOpen && (
        <AddVehicleModal
          order={order}
          vehicle={vehicle}
          vehicleIndex={vehicleIndex}
          onClose={() => setAddVehicleModalOpen(false)}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
}

// Readable labels for the Driver History old→new diff — any key not listed
// still renders using its raw name, so a future field isn't silently dropped.
const DRIVER_HISTORY_FIELD_LABELS: Record<string, string> = {
  driverName: "Driver Name",
  driverPhone: "Driver Phone",
  driverAlternatePhone: "Alternate Phone",
  vehicleRegistrationNumber: "Vehicle",
};

function DriverHistoryPanel({ vehicleEntries, driverHistory, unavailableHistory = [], vehicleIndex }) {
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

    // entryId irundha adha vachu match pannu (reg no maari irundhalum sariya varum)
    if (h.entryId) return String(h.entryId) === String(activeEntry._id);

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
              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-white ${entry.entryStatus === "removed" ? "bg-red-500" : "bg-blue-500"}`} style={{ fontSize: "9px" }}>
                V{i + 1}
              </div>
              <span className="font-mono text-xs">{entry.vehicleRegistrationNumber || `Vehicle ${i + 1}`}</span>
              <RegStatusBadge entry={entry} unavailableHistory={unavailableHistory} />
            </button>
          ))}
        </div>
      )}

      {/* Active entry info */}
      {activeEntry && (
        <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${activeEntry.entryStatus === "removed" ? "bg-red-500" : "bg-blue-500"}`}>
            V{activeVehicleTab + 1}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{activeEntry.driverName || "—"}</p>
            <p className="text-sm text-gray-400 font-mono">{activeEntry.vehicleRegistrationNumber} · {activeEntry.driverPhone}</p>
          </div>
          <RegStatusBadge entry={activeEntry} unavailableHistory={unavailableHistory} className="!text-xs !px-2 !py-0.5 flex-shrink-0" />
        </div>
      )}

      {/* Released banner — always visible at top when this vehicle was released */}
      {activeEntry?.entryStatus === "removed" && (
        <div className="mx-4 mt-3 rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10 p-3">
          <p className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5">
            <XCircle size={12} />
            This vehicle was released from the campaign
          </p>
          <p className="text-xs text-red-500 dark:text-red-400 mt-1">
            By {activeEntry.removedBy || "—"} on {fmtDt(activeEntry.removedAt)}
            {activeEntry.removalReason ? ` — ${activeEntry.removalReason}` : ""}
          </p>
        </div>
      )}

      {/* History list */}
      <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[380px] overflow-y-auto">
        {filteredHistory.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">
            No history for this vehicle
          </div>
        ) : (
          [...filteredHistory].reverse().map((h, i) => {
            const isCreated = h.action === "created";
            const isRemoved = h.action === "removed";
            const isUpdated = h.action === "updated";

            const iconBg = isCreated
              ? "bg-blue-500"
              : isRemoved
                ? "bg-red-500"
                : "bg-amber-500";

            const badgeClass = isCreated
              ? "bg-blue-50 text-blue-600"
              : isRemoved
                ? "bg-red-50 text-red-600"
                : "bg-amber-50 text-amber-600";

            const badgeLabel = isCreated
              ? "Driver added"
              : isRemoved
                ? "Vehicle released"
                : "Driver updated";

            return (
              <div key={h._id || i} className="p-4 flex gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ${iconBg}`}>
                  {isCreated ? (
                    <Plus size={14} />
                  ) : isRemoved ? (
                    <XCircle size={14} />
                  ) : (
                    <RefreshCw size={13} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-sm font-semibold px-1.5 py-0.5 rounded ${badgeClass}`}>
                      {badgeLabel}
                    </span>
                    <span className="text-sm text-gray-400">{fmtDt(h.changedAt)}</span>
                  </div>
                  <p className="text-md font-semibold text-gray-800 dark:text-gray-100">{h.driverName}</p>
                  <p className="text-sm text-gray-500">{h.driverPhone} · <span className="font-mono">{h.vehicleRegistrationNumber}</span></p>
                  <p className="text-sm text-gray-400 mt-0.5">By {h.changedBy}</p>

                  {isUpdated && h.changedFields && Object.keys(h.changedFields).length > 0 && (
                    <div className="mt-1.5 space-y-0.5 pt-1.5 border-t border-gray-100 dark:border-gray-800">
                      {Object.entries(h.changedFields).map(([field, val]: any) => (
                        <p key={field} className="text-sm text-gray-500">
                          <span className="font-medium">{DRIVER_HISTORY_FIELD_LABELS[field] || field}:</span>{" "}
                          <span className="line-through text-red-400">{val.old || "—"}</span>{" → "}
                          <span className="text-emerald-600 font-medium">{val.new || "—"}</span>
                        </p>
                      ))}
                    </div>
                  )}

                  {isUpdated && (h.reason || h.changedFields?.reason) && (
                    <p className="text-sm text-gray-400 mt-1.5">
                      <span className="font-medium">Reason:</span> {h.reason || h.changedFields.reason}
                    </p>
                  )}

                  {isRemoved && (
                    <div className="mt-1.5 pt-1.5 border-t border-gray-100 dark:border-gray-800">
                      <p className="text-xs text-red-500">
                        Reason: {h.changedFields?.reason?.trim() ? h.changedFields.reason : "—"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function IssueHistoryCard({ iss, onOpenModal }) {
  const [showResolved, setShowResolved] = useState(false);
  const [preview, setPreview] = useState(null);

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
          className={`text-sm font-semibold ${iss.status === "open"
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
        <div className="flex items-start gap-2 mt-1">
          <button
            type="button"
            onClick={() => setPreview({ url: getImageUrl(iss.issuePhoto), label: "Issue Photo" })}
            className="flex-shrink-0"
          >
            <img
              src={getImageUrl(iss.issuePhoto)}
              className="w-14 h-12 rounded-lg object-cover border mb-1 hover:opacity-80"
              alt="issue"
            />
          </button>
          <a
            href={getImageUrl(iss.issuePhoto)}
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
        Reported by {iss.reportedBy} · {fmtDatetime(iss.reportedAt)}
      </p>

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
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Resolution:</span>{" "}
                {iss.resolveDescription}
              </p>
              {iss.resolvePhoto && (
                <div className="flex items-start gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setPreview({ url: getImageUrl(iss.resolvePhoto), label: "Resolution Photo" })}
                    className="flex-shrink-0"
                  >
                    <img
                      src={getImageUrl(iss.resolvePhoto)}
                      className="w-14 h-12 rounded-lg object-cover border border-emerald-200 hover:opacity-80"
                      alt="resolve"
                    />
                  </button>
                  <a
                    href={getImageUrl(iss.resolvePhoto)}
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
              <p className="text-sm text-gray-400 mt-0.5">
                Resolved by {iss.resolvedBy} · {fmtDatetime(iss.resolvedAt)}
              </p>
            </div>
          )}
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
  const hasFetched = useRef(false);
  const [driverLocations, setDriverLocations] = useState<Record<string, any[]>>({});
  const [locLoading, setLocLoading] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const handleToggle = (idx: number) => {
    const willOpen = openIndex !== idx;

    setOpenIndex(willOpen ? idx : null);

    if (willOpen) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          cardRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
      });
    }
  };

  const fetchDriverLocations = async () => {
    setLocLoading(true);
    try {
      const { data } = await axios.get(
        `${API_BASE}api/orders/${order._id}/driver-location`
      );
      setDriverLocations(data.data || {});
    } catch (err) {
      console.error("Driver location fetch error:", err);
    } finally {
      setLocLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchDriverLocations();
  }, []);

  const vehicles = (order.bookingItems || [])
    .map((item, originalIdx) => ({ item, originalIdx }))
    .filter(({ item, originalIdx }) => {
      const entries = (order.onRoadExecutionArray || [])
        .filter(e => e.vehicleIndex === originalIdx);
      return entries.some(e => e.onRoadStatus === 1);
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
            <div
              key={originalIdx}
              ref={(el) => { cardRefs.current[originalIdx] = el; }}
            >
              <VehicleExecutionCard
                vehicle={vehicle}
                vehicleIndex={originalIdx}
                order={order}
                onRefresh={onRefresh}
                vehicleTypes={vehicleTypes}
                driverLocations={driverLocations}
                isOpen={openIndex === originalIdx}
                onToggle={() => handleToggle(originalIdx)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}