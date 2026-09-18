/* eslint-disable */
// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Flag,
  Image as ImageIcon,
  LoaderCircle,
  MapPin,
  MapPinned,
  Navigation,
  RefreshCw,
  Route,
  ShieldCheck,
  Truck,
  Users,
  Zap,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { fetchAllRoadshowVehicles } from "@/lib/roadshowVehicles";

import { useCampaignTracking } from "../useCampaignTracking";
import { useLiveLocation } from "../[bookingId]/useLiveLocation";
import { useRouteTrack } from "../[bookingId]/useRouteTrack";
import { useDrivingSummary } from "../[bookingId]/useDrivingSummary";
import DrivingSummaryPanel from "../[bookingId]/DrivingSummaryPanel";
import DrivingHistoryTable from "../[bookingId]/DrivingHistoryTable";
import VehicleHistoryPanel from "../[bookingId]/VehicleHistoryPanel";
import DayWiseReportTable from "../[bookingId]/DayWiseReportTable";
import PhotosGallery from "../[bookingId]/PhotosGallery";
import HeroBanner from "../[bookingId]/HeroBanner";
import StatsCards, { type StatCardData } from "../[bookingId]/StatsCards";
import VehicleListPanel from "../[bookingId]/VehicleListPanel";
import AnalyticsRow, {
  type UtilizationDay,
} from "../[bookingId]/AnalyticsRow";
import {
  JOURNEY_STAGE_COPY,
  type JourneyStageKey,
} from "../journeyStageCopy";

import "../journeyTracking.css";
import "./trackingPage.css";

const VEHICLE_IMAGE = "/images/assets/full_side_LED_edited-1_new.png";

const TRACKING_STAGE_ORDER: JourneyStageKey[] = [
  "submitted",
  "confirmed",
  "prepared",
  "onRoad",
  "completed",
  "cancelled",
];

function normalizeRegNumber(value?: string | null) {
  return String(value || "")
    .replace(/\s+/g, "")
    .toUpperCase();
}

function todayIndiaDateKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function toIndiaDateKey(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatShortDate(value?: string | null) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function relativeTime(value?: string | null) {
  if (!value) return "No update yet";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "No update yet";

  const diffMs = Date.now() - date.getTime();
  const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));

  if (diffSeconds < 45) return "Updated just now";

  const minutes = Math.floor(diffSeconds / 60);

  if (minutes < 60) {
    return `Updated ${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `Updated ${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }

  return formatDateTime(value);
}

/* "2345 → 7852" when a slot's vehicle has been replaced (registrationChain
   has more than one link), otherwise just the current registration. */
function formatVehicleChain(vehicle?: {
  registrationNumber?: string | null;
  registrationChain?: string[];
  wasReplaced?: boolean;
}) {
  if (!vehicle) return "Registration unavailable";

  if (vehicle.wasReplaced && vehicle.registrationChain?.length) {
    return vehicle.registrationChain.join(" → ");
  }

  return vehicle.registrationNumber || "Registration unavailable";
}

function statusClass(status?: string) {
  const key = String(status || "Unknown").toLowerCase();

  if (key === "moving") return "RST_State--moving";
  if (key === "parked") return "RST_State--parked";
  if (key === "idle") return "RST_State--idle";

  return "RST_State--unknown";
}

/* Picks an icon/tone for a Recent Activity row purely from its existing
   label text (no new data) — matches the colored-icon activity feed style
   without needing the backend to send a category field. */
function activityVisual(label?: string) {
  const text = String(label || "").toLowerCase();

  if (text.includes("complet")) return { Icon: CheckCircle2, tone: "green" };

  if (text.includes("maintenance") || text.includes("unavailable")) {
    return { Icon: Zap, tone: "orange" };
  }

  if (
    text.includes("reach") ||
    text.includes("checkpoint") ||
    text.includes("location")
  ) {
    return { Icon: MapPin, tone: "blue" };
  }

  if (
    text.includes("vehicle") ||
    text.includes("start") ||
    text.includes("assign") ||
    text.includes("road")
  ) {
    return { Icon: Truck, tone: "red" };
  }

  if (
    text.includes("submit") ||
    text.includes("request") ||
    text.includes("book")
  ) {
    return { Icon: ShieldCheck, tone: "purple" };
  }

  return { Icon: Clock3, tone: "grey" };
}

/* Kept exported even though the on-page day-timeline that used to call
   this was replaced by DayWiseReportTable (which derives "upcoming" from
   the backend's own row.status instead) — tests/unit/bookingTrackingHelpers
   still covers this pure helper directly. */
export function isFutureCampaignDay(value?: string | null) {
  if (!value) return false;

  const dayKey = String(value).slice(0, 10);
  const todayKey = todayIndiaDateKey();

  return Boolean(dayKey && dayKey > todayKey);
}

export function getCampaignProgress(data: any): number | null {
  if (data?.isCancelled) return 0;

  if (data?.journeyStage?.key === "completed") return 100;

  if (data?.onRoad?.totalDays) {
    const total = Math.max(1, Number(data.onRoad.totalDays || 1));
    const day = Math.max(0, Math.min(Number(data.onRoad.day || 0), total));
    return Math.round((day / total) * 100);
  }

  // Before On Road there is no execution percentage yet — showing a
  // stage-based percentage here caused the pre-campaign 20%/30%/40%/50%
  // that then appeared to "drop" once real execution began.
  return null;
}

function CampaignStatusStrip({
  steps,
  currentKey,
  isCancelled,
}: {
  steps: any[];
  currentKey?: string;
  isCancelled?: boolean;
}) {
  const stepMap = new Map(
    (Array.isArray(steps) ? steps : []).map((step) => [step.key, step]),
  );

  return (
    <div className="RST_StatusViewport" aria-label="Campaign status timeline">
      <ol className="RST_StatusStrip">
        {TRACKING_STAGE_ORDER.map((key, index) => {
          const backendStep = stepMap.get(key);
          const meta = JOURNEY_STAGE_COPY[key];
          const Icon = meta?.icon;

          let state = backendStep?.status || "upcoming";

          if (key === currentKey) state = "current";

          if (key === "cancelled" && !isCancelled && currentKey !== "cancelled") {
            state = backendStep?.status === "done" ? "done" : "upcoming";
          }

          const completedDate = formatShortDate(backendStep?.completedAt);
          const detail = completedDate
            ? completedDate
            : state === "current"
              ? "Current"
              : state === "done"
                ? "Completed"
                : "Upcoming";

          return (
            <li
              key={key}
              className={`RST_StatusStep RST_StatusStep--${state} ${
                key === "cancelled" ? "RST_StatusStep--cancelled" : ""
              }`}
            >
              <div className="RST_StatusRail">
                <span className="RST_StatusNode">
                  {Icon ? <Icon size={15} strokeWidth={2.25} /> : null}
                </span>

                {index < TRACKING_STAGE_ORDER.length - 1 && (
                  <span className="RST_StatusConnector" />
                )}
              </div>

              <div className="RST_StatusCopy">
                <strong>{meta?.label || backendStep?.label || key}</strong>
                <small>{detail}</small>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function TrackingPageContent({
  mongoId,
  token,
  userName,
}: {
  mongoId: string;
  token: string | null;
  userName: string;
}) {
  const router = useRouter();

  const { data, loading, error } = useCampaignTracking(mongoId, token);

  const campaignStartKey = toIndiaDateKey(data?.bookingSummary?.startDate);
  const campaignNotYetStarted = Boolean(
    campaignStartKey && todayIndiaDateKey() < campaignStartKey,
  );

  const onRoadEnabled = Boolean(
    data &&
      !data.isCancelled &&
      data.journeyStage?.key === "onRoad" &&
      !campaignNotYetStarted,
  );

  const {
    vehicles: rawLiveVehicles,
    loading: liveLoading,
    refreshing: liveRefreshing,
    error: liveError,
    refreshedAt: liveRefreshedAt,
    refresh: refreshLiveLocation,
  } = useLiveLocation(mongoId, token, onRoadEnabled);

  /* Every "pending" (not-yet-assigned) slot comes back from the backend
     with registrationNumber: null — fine for display (everything branches
     on `.pending` first), but a booking line with more than one pending
     slot (e.g. quantity 2, neither assigned yet) would otherwise share
     that same null key, so selecting/tracking one card can't tell it
     apart from its sibling. Give each one a unique synthetic id instead;
     it's never shown, only used to select/compare vehicles. */
  const liveVehicles = useMemo(
    () =>
      rawLiveVehicles.map((vehicle, index) => ({
        ...vehicle,
        registrationNumber:
          vehicle.registrationNumber ||
          `pending-${vehicle.vehicleIndex ?? "x"}-${index}`,
      })),
    [rawLiveVehicles],
  );

  const {
    vehicles: routeVehicles,
    refreshing: routeRefreshing,
    refresh: refreshRouteTrack,
  } = useRouteTrack(mongoId, token, onRoadEnabled);

  const mapRefreshing = liveRefreshing || routeRefreshing;

  function refreshMap() {
    void refreshLiveLocation();
    void refreshRouteTrack();
  }

  const historyDays = useMemo(() => {
    const from = data?.bookingSummary?.startDate;
    const to = data?.bookingSummary?.endDate;

    if (!from || !to) return [];

    const fromKey = new Date(from).toISOString().slice(0, 10);
    const toKey = new Date(to).toISOString().slice(0, 10);

    if (
      Number.isNaN(new Date(fromKey).getTime()) ||
      Number.isNaN(new Date(toKey).getTime())
    ) {
      return [];
    }

    const days: string[] = [];
    let cur = fromKey;

    while (cur <= toKey) {
      days.push(cur);
      const d = new Date(`${cur}T00:00:00.000Z`);
      d.setUTCDate(d.getUTCDate() + 1);
      cur = d.toISOString().slice(0, 10);
    }

    return days;
  }, [data?.bookingSummary?.startDate, data?.bookingSummary?.endDate]);

  const [selectedHistoryDay, setSelectedHistoryDay] = useState("");

  useEffect(() => {
    if (!historyDays.length) {
      setSelectedHistoryDay("");
      return;
    }

    setSelectedHistoryDay((current) => {
      if (current && historyDays.includes(current)) return current;

      const todayKey = new Date().toISOString().slice(0, 10);
      const lastElapsed = [...historyDays]
        .reverse()
        .find((day) => day <= todayKey);

      return lastElapsed || historyDays[historyDays.length - 1];
    });
  }, [historyDays]);

  const {
    vehicles: drivingSummaryVehicles,
    loading: drivingSummaryLoading,
  } = useDrivingSummary(
    mongoId,
    token,
    onRoadEnabled,
    selectedHistoryDay || undefined,
  );

  const [selectedVehicleReg, setSelectedVehicleReg] = useState("");
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [vehicleImageMap, setVehicleImageMap] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    let active = true;

    fetchAllRoadshowVehicles()
      .then((vehicles) => {
        if (!active) return;

        const map: Record<string, string> = {};

        vehicles.forEach((vehicle) => {
          (vehicle.registrationVehicles || []).forEach((reg: any) => {
            const regKey = normalizeRegNumber(reg?.registrationNumber);

            if (regKey && vehicle.image) {
              map[regKey] = vehicle.image;
            }
          });
        });

        setVehicleImageMap(map);
      })
      .catch(() => {
        // Best-effort only. Existing generic fallback remains available.
      });

    return () => {
      active = false;
    };
  }, []);

  function resolveVehicleImage(registrationNumber?: string | null) {
    const key = normalizeRegNumber(registrationNumber);
    return (key && vehicleImageMap[key]) || VEHICLE_IMAGE;
  }

  /* Auto-selects a sensible default vehicle out of the whole flat list —
     prefers one that's actually trackable (live) over merely unavailable,
     and prefers either of those over a "pending" placeholder (which has no
     registration/GPS data at all, so selecting it first would leave the
     map with nothing to show even when a sibling vehicle is live). */
  useEffect(() => {
    if (!liveVehicles.length) {
      setSelectedVehicleReg("");
      return;
    }

    setSelectedVehicleReg((current) => {
      const currentVehicle = liveVehicles.find(
        (vehicle) => vehicle.registrationNumber === current,
      );

      if (currentVehicle && !currentVehicle.unavailable && !currentVehicle.pending) {
        return current;
      }

      const firstAvailable = liveVehicles.find(
        (vehicle) => !vehicle.unavailable && !vehicle.pending,
      );
      const firstUnavailable = liveVehicles.find(
        (vehicle) => vehicle.unavailable,
      );

      return (
        firstAvailable || firstUnavailable || liveVehicles[0]
      ).registrationNumber;
    });
  }, [liveVehicles]);

  const selectedLiveVehicle = useMemo(
    () =>
      liveVehicles.find(
        (vehicle) =>
          vehicle.registrationNumber === selectedVehicleReg,
      ) || liveVehicles[0] || null,
    [liveVehicles, selectedVehicleReg],
  );

  const selectedTrack = useMemo(
    () =>
      routeVehicles.find(
        (vehicle) =>
          vehicle.registrationNumber ===
          selectedLiveVehicle?.registrationNumber,
      ) ||
      routeVehicles.find((vehicle) => vehicle.trackId) ||
      null,
    [routeVehicles, selectedLiveVehicle],
  );

  /* Real GPS trip distance for the selected vehicle/day — the day-wise
     report's distanceCoveredKm (used below as a fallback) depends on a
     manually-submitted report that isn't reliably populated in the backend,
     so this is the source of truth for "how far did today's vehicle go". */
  const selectedDrivingSummary = useMemo(
    () =>
      drivingSummaryVehicles.find(
        (vehicle) =>
          vehicle.registrationNumber ===
          selectedLiveVehicle?.registrationNumber,
      )?.drivingSummary || null,
    [drivingSummaryVehicles, selectedLiveVehicle],
  );

  const dayRows = data?.dayWiseReport || [];

  useEffect(() => {
    if (!dayRows.length) {
      setSelectedDayIndex(0);
      return;
    }

    const ongoingIndex = dayRows.findIndex(
      (row) => row.status === "ongoing",
    );

    const completedIndex = dayRows
      .map((row, index) => ({ row, index }))
      .filter(({ row }) => row.status === "completed")
      .at(-1)?.index;

    setSelectedDayIndex(
      ongoingIndex >= 0
        ? ongoingIndex
        : completedIndex ?? 0,
    );
  }, [data?.lastUpdatedAt, dayRows.length]);

  const selectedDay =
    dayRows[selectedDayIndex] || dayRows[0] || null;

  /* Booking-scoped KPI/analytics numbers — every value below is derived
     from data already returned by useCampaignTracking (dayRows/summary),
     no extra fetches. This intentionally does NOT mirror the reference
     dashboard's fleet-wide numbers (total vehicles across all bookings,
     active campaigns across all clients, etc.) — those aggregates don't
     exist on this single-booking tracking API and this task explicitly
     rules out inventing them or adding a new endpoint for them. */
  const activeOnRoadCount = useMemo(
    () => liveVehicles.filter((v) => !v.pending && !v.unavailable).length,
    [liveVehicles],
  );

  const totalDistanceKm = useMemo(
    () =>
      dayRows.reduce((sum, row) => sum + Number(row.distanceCoveredKm || 0), 0),
    [dayRows],
  );

  const daysRun = useMemo(
    () =>
      dayRows.filter(
        (row) =>
          Number(row.distanceCoveredKm || 0) > 0 ||
          row.status === "completed" ||
          row.status === "ongoing",
      ).length,
    [dayRows],
  );

  const utilizationDays: UtilizationDay[] = useMemo(() => {
    const todayKey = todayIndiaDateKey();

    return dayRows.map((row) => ({
      key: row.day,
      label: formatShortDate(row.day) || row.day,
      km: Number(row.distanceCoveredKm || 0),
      isToday: row.day === todayKey,
      isFuture: row.day > todayKey,
    }));
  }, [dayRows]);

  const stageMeta = data
    ? JOURNEY_STAGE_COPY[
        data.journeyStage?.key as JourneyStageKey
      ]
    : null;

  const StageIcon = stageMeta?.icon;
  const campaignProgress = getCampaignProgress(data);

  if (loading && !data) {
    return (
      <main className="RST_Root">
        <div className="RST_StateScreen">
          <LoaderCircle className="RST_Spin" size={36} />
          <strong>Loading your campaign...</strong>
          <p>
            We&apos;re getting the latest campaign status and client-safe
            tracking information.
          </p>
        </div>
      </main>
    );
  }

  if (error && !data) {
    return (
      <main className="RST_Root">
        <div className="RST_StateScreen">
          <MapPinned size={36} />
          <strong>Campaign tracking is unavailable</strong>
          <p>{error}</p>
          <button
            type="button"
            onClick={() => router.push("/roadshow/my-bookings")}
          >
            <ArrowLeft size={16} />
            Back to My Bookings
          </button>
        </div>
      </main>
    );
  }

  if (!data) return null;

  const summary = data.bookingSummary;

  const coveragePercent = summary.totalDays
    ? Math.round((daysRun / summary.totalDays) * 100)
    : 0;

  const statCards: StatCardData[] = [
    {
      key: "vehicles",
      icon: Truck,
      tone: "red",
      label: "Vehicles in this Booking",
      value: String(summary.vehicleCount || 0),
    },
    {
      key: "onroad",
      icon: MapPin,
      tone: "blue",
      label: "Active on Road",
      value: String(activeOnRoadCount),
    },
    {
      key: "days",
      icon: CalendarDays,
      tone: "green",
      label: "Campaign Days",
      value: String(summary.totalDays || 0),
    },
    {
      key: "distance",
      icon: Route,
      tone: "purple",
      label: "Distance Covered",
      value: `${totalDistanceKm.toFixed(1)} km`,
    },
  ];

  const heroVehicleImage = resolveVehicleImage(
    selectedLiveVehicle?.registrationNumber || liveVehicles[0]?.registrationNumber,
  );

  const heroPeriodLabel = `${formatDate(summary.startDate)} – ${formatDate(summary.endDate)}`;
  const heroPeriodDaysLabel = summary.totalDays
    ? `${summary.totalDays} ${summary.totalDays === 1 ? "Day" : "Days"}`
    : "Duration not available";
  const heroDayLabel = data.onRoad
    ? `Day ${data.onRoad.day} of ${data.onRoad.totalDays}`
    : null;

  return (
    <main className="RST_Root">
      <div className="RST_Container">
        <header className="RST_Topbar">
          <button
            type="button"
            className="RST_Back"
            onClick={() => router.push("/roadshow/my-bookings")}
          >
            <ArrowLeft size={18} />
            <span>My Bookings</span>
          </button>

          <div className="RST_Sync">
            <span className="RST_SyncDot" />
            <span>
              Auto-updating
              <small>{relativeTime(data.lastUpdatedAt)}</small>
            </span>
          </div>
        </header>

        <HeroBanner
          userName={userName}
          campaignName={summary.campaignName}
          clientOrderId={data.clientOrderId}
          location={summary.location}
          vehicleCount={summary.vehicleCount}
          stageLabel={stageMeta?.label}
          StageIcon={StageIcon}
          stageClassName={stageMeta?.className}
          dayLabel={heroDayLabel}
          vehicleImage={heroVehicleImage}
          periodLabel={heroPeriodLabel}
          periodDaysLabel={heroPeriodDaysLabel}
        />

        <StatsCards stats={statCards} />

        {data.vehicleUnavailable && (
          <section className="RST_Notice RST_Notice--warning">
            <Truck size={18} />
            <div>
              <strong>Vehicle availability update</strong>
              <p>
                A campaign vehicle is temporarily unavailable. The campaign
                status below remains the current client-facing source of truth.
              </p>
            </div>
          </section>
        )}

        <section className="RST_JourneyCard">
          <div className="RST_JourneyHead">
            <div>
              <span className="RST_Eyebrow">CAMPAIGN JOURNEY</span>
              <h2>Where your campaign is now</h2>
            </div>

            {stageMeta && (
              <div className="RST_CurrentMeaning">
                <strong>{stageMeta.label}</strong>
                <small>{stageMeta.whatThisMeans}</small>
              </div>
            )}
          </div>

          <CampaignStatusStrip
            steps={data.steps || []}
            currentKey={data.journeyStage?.key}
            isCancelled={data.isCancelled}
          />

          {stageMeta?.whatsNext && (
            <div className="RST_NextStep">
              <span>Next</span>
              <strong>{stageMeta.whatsNext}</strong>
            </div>
          )}
        </section>

        {onRoadEnabled ? (
          <>
            <section className="RST_LiveTrackingGrid">

              <div className="RST_MapCard">
                <div className="RST_MapHeader">
                  <div>
                    <span>TODAY&apos;S ROUTE</span>
                    <h2>
                      {selectedLiveVehicle?.pending
                        ? selectedLiveVehicle.vehicleName || "Live route"
                        : selectedLiveVehicle
                          ? selectedLiveVehicle.registrationNumber
                          : "Live route"}
                    </h2>
                  </div>

                  <div className="RST_MapHeaderActions">
                    <button
                      type="button"
                      className="RST_MapRefresh"
                      onClick={refreshMap}
                      disabled={mapRefreshing}
                      aria-label="Refresh live map"
                      title="Refresh live map"
                    >
                      <RefreshCw
                        size={15}
                        className={mapRefreshing ? "RST_Spin" : ""}
                      />
                      <span>{mapRefreshing ? "Refreshing" : "Refresh"}</span>
                    </button>

                    {selectedLiveVehicle && (
                    <span
                      className={`RST_VehicleState ${
                        selectedLiveVehicle.pending
                          ? "RST_VehicleState--pending"
                          : selectedLiveVehicle.unavailable
                            ? "RST_VehicleState--unavailable"
                            : statusClass(selectedLiveVehicle.status)
                      }`}
                    >
                      {selectedLiveVehicle.pending
                        ? "Awaiting assignment"
                        : selectedLiveVehicle.unavailable
                          ? "Unavailable"
                          : selectedLiveVehicle.isStale
                            ? "Location delayed"
                            : selectedLiveVehicle.status}
                    </span>
                    )}
                  </div>
                </div>

                <div className="RST_Map">
                  {selectedLiveVehicle?.pending ? (
                    <div className="RST_MapFallback RST_MapFallback--info">
                      <span className="RST_MapFallbackIcon">
                        <Truck size={23} />
                      </span>

                      <strong className="RST_MapFallbackTitle">
                        Vehicle not yet assigned
                      </strong>

                      <p className="RST_MapFallbackText">
                        {selectedLiveVehicle.message ||
                          "A driver and vehicle haven't been assigned to this booking yet. Tracking will appear here automatically once they are."}
                      </p>
                    </div>
                  ) : selectedLiveVehicle?.unavailable ? (
                    <div className="RST_MapFallback RST_MapFallback--warning">
                      <span className="RST_MapFallbackIcon RST_MapFallbackIcon--warning">
                        <Truck size={23} />
                      </span>

                      <strong className="RST_MapFallbackTitle">
                        Vehicle unavailable
                      </strong>

                      <p className="RST_MapFallbackText">
                        This vehicle is temporarily unavailable and isn&apos;t
                        being GPS-tracked right now.
                      </p>
                    </div>
                  ) : selectedTrack?.trackId ? (
                    <iframe
                      key={selectedTrack.trackId}
                      src={`https://gpsvts.vamosys.com/gps/public/track?vehicleId=${encodeURIComponent(
                        selectedTrack.trackId,
                      )}&maps=track&userID=ADINN12`}
                      title="Live campaign route"
                      loading="lazy"
                      allowFullScreen
                    />
                  ) : (
                    <div className="RST_MapFallback RST_MapFallback--info">
                      <span className="RST_MapFallbackIcon">
                        <Navigation size={23} />
                      </span>

                      <strong className="RST_MapFallbackTitle">
                        {selectedLiveVehicle?.address ||
                          "Live route is preparing"}
                      </strong>

                      <p className="RST_MapFallbackText">
                        {selectedLiveVehicle
                          ? "A dedicated route track is not linked yet. The latest GPS status is shown below."
                          : "The map will appear automatically when a route track is returned."}
                      </p>

                      {selectedLiveVehicle && (
                        <div className="RST_MapFallbackStats">
                          <div>
                            <small>Coordinates</small>
                            <strong>
                              {selectedLiveVehicle.latitude},{" "}
                              {selectedLiveVehicle.longitude}
                            </strong>
                          </div>

                          <div>
                            <small>Speed</small>
                            <strong>
                              {Number(
                                selectedLiveVehicle.speedKmh || 0,
                              ).toFixed(0)}{" "}
                              km/h
                            </strong>
                          </div>

                          <div>
                            <small>Status</small>
                            <strong>{selectedLiveVehicle.status}</strong>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="RST_MapFooter">
                  <div>
                    <span>Latest location</span>
                    <strong>
                      {selectedLiveVehicle?.pending
                        ? "Not yet assigned"
                        : selectedLiveVehicle?.unavailable
                          ? "Not tracked"
                          : selectedLiveVehicle?.address ||
                            "Location not available yet"}
                    </strong>
                  </div>

                  <div>
                    <span>Last update</span>
                    <strong>
                      {selectedLiveVehicle?.pending ||
                      selectedLiveVehicle?.unavailable
                        ? "—"
                        : relativeTime(liveRefreshedAt)}
                    </strong>
                  </div>

                  <div>
                    <span>Speed</span>
                    <strong>
                      {selectedLiveVehicle &&
                      !selectedLiveVehicle.unavailable &&
                      !selectedLiveVehicle.pending
                        ? `${Number(
                            selectedLiveVehicle.speedKmh || 0,
                          ).toFixed(0)} km/h`
                        : "—"}
                    </strong>
                  </div>
                </div>

                <div className="RST_MapLegend">
                  <span>
                    <i className="RST_State--moving" />
                    Moving
                  </span>
                  <span>
                    <i className="RST_State--idle" />
                    Idle
                  </span>
                  <span>
                    <i className="RST_State--parked" />
                    Parked
                  </span>
                  <span>
                    <i className="RST_VehicleState--unavailable" />
                    Unavailable
                  </span>
                </div>
              </div>

              <div className="RST_LiveRightCol">
                <div className="RST_LiveSidebar">
                  <div className="RST_SectionHeading RST_SectionHeading--compact">
                    <div>
                      <span>VEHICLES</span>
                      <h2>Vehicles on Road ({liveVehicles.length})</h2>
                    </div>

                    <span className="RST_LiveHeaderMeta">
                      {data.onRoad?.totalDays ? (
                        <span className="RST_LiveDayChip">
                          Day {data.onRoad.day} of {data.onRoad.totalDays}
                        </span>
                      ) : null}

                      <span className="RST_LiveBadge">
                        <i /> LIVE
                      </span>
                    </span>
                  </div>

                  <VehicleListPanel
                    vehicles={liveVehicles}
                    selectedReg={selectedVehicleReg}
                    onSelect={setSelectedVehicleReg}
                    resolveVehicleImage={resolveVehicleImage}
                    statusClass={statusClass}
                    formatVehicleChain={formatVehicleChain}
                    loading={liveLoading}
                  />

                  {liveError && (
                    <div className="RST_InlineError">{liveError}</div>
                  )}
                </div>

              <aside className="RST_TodayCard">
                <div className="RST_SectionHeading RST_SectionHeading--compact">
                  <div>
                    <span>LIVE CAMPAIGN SNAPSHOT</span>
                    <h2>Available performance data</h2>
                  </div>
                </div>

                <div className="RST_SnapshotMetrics">
                  {(selectedDrivingSummary?.tripDistanceKm != null ||
                    selectedDay?.distanceCoveredKm != null ||
                    (selectedLiveVehicle &&
                      !selectedLiveVehicle.unavailable &&
                      selectedLiveVehicle.distanceCoveredKm != null)) && (
                    <div className="RST_TodayMetric">
                      <span className="RST_MetricIcon RST_MetricIcon--green">
                        <Route size={18} />
                      </span>
                      <div>
                        <small>Distance covered</small>
                        <strong>
                          {selectedDrivingSummary?.tripDistanceKm != null
                            ? `${Number(selectedDrivingSummary.tripDistanceKm).toFixed(2)} km`
                            : selectedDay?.distanceCoveredKm != null
                              ? `${Number(selectedDay.distanceCoveredKm).toFixed(2)} km`
                              : `${Number(selectedLiveVehicle?.distanceCoveredKm).toFixed(2)} km`}
                        </strong>
                      </div>
                    </div>
                  )}

                  {/* {selectedDay?.activationsCount != null && (
                    <div className="RST_TodayMetric">
                      <span className="RST_MetricIcon RST_MetricIcon--orange">
                        <Sparkles size={18} />
                      </span>
                      <div>
                        <small>Activations</small>
                        <strong>{Number(selectedDay.activationsCount)}</strong>
                      </div>
                    </div>
                  )} */}

                  {selectedDay?.peopleEngaged != null && (
                    <div className="RST_TodayMetric">
                      <span className="RST_MetricIcon RST_MetricIcon--purple">
                        <Users size={18} />
                      </span>
                      <div>
                        <small>People engaged</small>
                        <strong>{Number(selectedDay.peopleEngaged)}</strong>
                      </div>
                    </div>
                  )}

                  {/* {selectedDay?.leadsCollected != null && (
                    <div className="RST_TodayMetric">
                      <span className="RST_MetricIcon RST_MetricIcon--blue">
                        <CheckCircle2 size={18} />
                      </span>
                      <div>
                        <small>Leads collected</small>
                        <strong>{Number(selectedDay.leadsCollected)}</strong>
                      </div>
                    </div>
                  )} */}

                  {selectedDay?.distanceCoveredKm == null &&
                    selectedDay?.activationsCount == null &&
                    selectedDay?.peopleEngaged == null &&
                    selectedDay?.leadsCollected == null &&
                    (!selectedLiveVehicle ||
                      selectedLiveVehicle.unavailable ||
                      selectedLiveVehicle.distanceCoveredKm == null) && (
                      <div className="RST_PerformanceEmpty">
                        <strong>No performance report submitted yet</strong>
                        <span>
                          This panel will show only values actually returned by
                          the campaign reporting or live GPS APIs.
                        </span>
                      </div>
                    )}
                </div>

                {selectedLiveVehicle && !selectedLiveVehicle.pending && (
                  <div className="RST_CurrentVehicleStrip">
                    {!selectedLiveVehicle.unavailable &&
                      selectedLiveVehicle.speedKmh != null && (
                        <div>
                          <small>Current speed</small>
                          <strong>
                            {`${Number(selectedLiveVehicle.speedKmh).toFixed(0)} km/h`}
                          </strong>
                        </div>
                      )}

                    {selectedLiveVehicle.status && (
                      <div>
                        <small>Movement</small>
                        <strong>
                          {selectedLiveVehicle.unavailable
                            ? "Unavailable"
                            : selectedLiveVehicle.status}
                        </strong>
                      </div>
                    )}

                    <div>
                      <small>GPS</small>
                      <strong>
                        {selectedLiveVehicle.unavailable
                          ? "Not tracked"
                          : selectedLiveVehicle.isStale
                            ? "Delayed"
                            : "Live"}
                      </strong>
                    </div>
                  </div>
                )}
              </aside>
              </div>
            </section>

            {(drivingSummaryVehicles.some(
              (vehicle) => vehicle.drivingSummary,
            ) ||
              historyDays.length > 0) && (
              <section className="RST_DrivingSection">
                <div className="RST_SectionHeading">
                  <div>
                    <span>RUNNING STATUS</span>
                    <h2>Today&apos;s driving details</h2>
                  </div>

                  <small>
                    Start location, end location, 24-hour movement, distance
                    and speed for each active campaign vehicle.
                  </small>
                </div>

                {drivingSummaryLoading &&
                !drivingSummaryVehicles.some(
                  (vehicle) => vehicle.drivingSummary,
                ) ? (
                  <div className="RST_MiniLoading">
                    <LoaderCircle className="RST_Spin" size={20} />
                    Loading driving details...
                  </div>
                ) : (
                  <DrivingSummaryPanel
                    vehicles={drivingSummaryVehicles}
                    day={selectedHistoryDay}
                  />
                )}

                {historyDays.length > 0 && (
                  <DrivingHistoryTable
                    vehicles={drivingSummaryVehicles}
                    days={historyDays}
                    selectedDay={selectedHistoryDay}
                    onSelectDay={setSelectedHistoryDay}
                    loading={drivingSummaryLoading}
                  />
                )}
              </section>
            )}

            <VehicleHistoryPanel
              mongoId={mongoId}
              token={token}
              enabled={onRoadEnabled}
              /* Pending slots have no real registration number — they
                 only exist so the carousel/tabs can show "awaiting
                 assignment". This panel queries real Vamosys GPS history
                 by registration number, so a pending slot's synthetic id
                 (e.g. "pending-0-0") must never reach it: it isn't a real
                 vehicle, and sending it as a filter would 400 against the
                 backend ("vehicle not assigned to this booking"). */
              vehicles={liveVehicles
                .filter((vehicle) => !vehicle.pending)
                .map((vehicle) => ({
                  registrationNumber: vehicle.registrationNumber,
                  unavailable: vehicle.unavailable,
                }))}
              selectedVehicle={
                selectedLiveVehicle && !selectedLiveVehicle.pending
                  ? selectedLiveVehicle.registrationNumber
                  : undefined
              }
            />
          </>
        ) : (
          <section className="RST_TrackingLocked">
            <span className="RST_TrackingLockedIcon">
              <MapPinned size={28} />
            </span>

            <div>
              <span>LIVE TRACKING</span>
              <h2>
                {data.isCancelled
                  ? "Tracking is not active for this cancelled campaign"
                  : campaignNotYetStarted
                    ? "Your campaign hasn't started yet"
                    : data.journeyStage?.key === "completed"
                      ? "This campaign has been completed"
                      : "Live GPS becomes available when the campaign goes On Road"}
              </h2>

              <p>
                {campaignNotYetStarted
                  ? `Live GPS tracking and vehicle history will unlock on ${formatDate(
                      summary.startDate,
                    )}, when the campaign begins. Campaign journey and status remain available below.`
                  : "Campaign journey, reports and activity history remain available below. A live map is shown only when the backend reports the campaign as On Road."}
              </p>
            </div>
          </section>
        )}

        <AnalyticsRow
          performance={{
            percent: campaignProgress,
            statusLabel: stageMeta?.label || "Preparing",
            totalDays: summary.totalDays || "—",
            completedDays: data.onRoad?.day
              ? Math.max(0, data.onRoad.day)
              : data.journeyStage?.key === "completed"
                ? summary.totalDays || "—"
                : 0,
            remainingDays: data.onRoad?.totalDays
              ? Math.max(0, data.onRoad.totalDays - data.onRoad.day)
              : data.journeyStage?.key === "completed"
                ? 0
                : summary.totalDays || "—",
          }}
          utilizationDays={utilizationDays}
          coverage={{
            totalKm: totalDistanceKm,
            daysRun,
            totalDays: summary.totalDays || "—",
            location: summary.location,
            percent: coveragePercent,
          }}
        />

        <section className="RST_ReportSection">
          <div className="RST_SectionHeading">
            <div>
              <span>CAMPAIGN SCHEDULE</span>
              <h2>Day-wise campaign schedule</h2>
            </div>

            <small>
              Every day of this campaign, with distance, activations, leads
              and people engaged as reported.
            </small>
          </div>

          {dayRows.length ? (
            <DayWiseReportTable rows={dayRows} />
          ) : (
            <div className="RST_EmptyReport">
              <CalendarDays size={30} />
              <strong>No day-wise report has been submitted yet</strong>
              <p>Reports will appear here automatically when they are available.</p>
            </div>
          )}
        </section>

        <section className="RST_BottomGrid">
          <div className="RST_ActivityCard">
            <div className="RST_SectionHeading RST_SectionHeading--compact">
              <div>
                <span>RECENT UPDATES</span>
                <h2>Campaign activity</h2>
              </div>
            </div>

            {data.activity?.length ? (
              <ol className="RST_Activity">
                {data.activity.slice(0, 8).map((item, index) => {
                  const { Icon: ActivityIcon, tone } = activityVisual(
                    item.label,
                  );

                  return (
                    <li key={`${item.label}-${item.at}-${index}`}>
                      <span
                        className={`RST_ActivityIcon RST_ActivityIcon--${tone}`}
                      >
                        <ActivityIcon size={15} />
                      </span>
                      <div className="RST_ActivityBody">
                        <strong>{item.label}</strong>
                      </div>
                      <small className="RST_ActivityTime">
                        {formatDateTime(item.at)}
                      </small>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <div className="RST_EmptyMini">
                <Clock3 size={22} />
                <strong>No campaign activity yet</strong>
              </div>
            )}
          </div>

          <div className="RST_PhotoCard">
            <div className="RST_SectionHeading RST_SectionHeading--compact">
              <div>
                <span>CAMPAIGN PROOF</span>
                <h2>Photos</h2>
              </div>
            </div>

            {data.photos?.length ? (
              <PhotosGallery photos={data.photos} />
            ) : (
              <div className="RST_EmptyMini">
                <ImageIcon size={22} />
                <strong>No campaign photos available yet</strong>
              </div>
            )}
          </div>
        </section>

        <footer className="RST_Footer">
          <button
            type="button"
            onClick={() => router.push("/roadshow/my-bookings")}
          >
            <ArrowLeft size={16} />
            Back to My Bookings
          </button>

          <span>
            <Flag size={15} />
            Campaign information updates automatically while this page is open.
          </span>
        </footer>
      </div>
    </main>
  );
}

export default function CampaignTrackingPage() {
  const params = useParams<{
    bookingId?: string;
    mongoId?: string;
    id?: string;
  }>();

  const rawMongoId =
    params?.bookingId ?? params?.mongoId ?? params?.id ?? "";

  const mongoId = Array.isArray(rawMongoId)
    ? rawMongoId[0]
    : rawMongoId;

  const { user, token, authLoading, openAuth } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      openAuth("login");
    }
  }, [authLoading, user, openAuth]);

  if (authLoading || !user) {
    return (
      <main className="RST_Root">
        <div className="RST_StateScreen">
          <LoaderCircle className="RST_Spin" size={36} />
          <strong>
            {authLoading
              ? "Checking your account..."
              : "Sign in to view campaign tracking"}
          </strong>
          <p>
            Campaign GPS and reports are available only to the booking owner.
          </p>
        </div>
      </main>
    );
  }

  if (!mongoId) {
    return (
      <main className="RST_Root">
        <div className="RST_StateScreen">
          <MapPinned size={36} />
          <strong>Booking ID is missing</strong>
        </div>
      </main>
    );
  }

  return (
    <TrackingPageContent
      mongoId={mongoId}
      token={token}
      userName={user?.name || ""}
    />
  );
}
