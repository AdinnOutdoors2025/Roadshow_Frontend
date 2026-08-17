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
  Radio,
  Route,
  ShieldCheck,
  Sparkles,
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
  }).format(date);
}

function relativeTime(value?: string | null) {
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

function statusClass(status?: string) {
  const key = String(status || "Unknown").toLowerCase();

  if (key === "moving") return "RST_State--moving";
  if (key === "parked") return "RST_State--parked";
  if (key === "idle") return "RST_State--idle";

  return "RST_State--unknown";
}

function reportStatusLabel(status?: string) {
  switch (status) {
    case "completed":
      return "Completed";
    case "ongoing":
      return "Ongoing";
    case "upcoming":
      return "Upcoming";
    default:
      return "Not reported";
  }
}

function reportStatusClass(status?: string) {
  return `RST_ReportStatus--${status || "not_reported"}`;
}

function getCampaignProgress(data: any) {
  if (data?.isCancelled) return 0;

  if (data?.journeyStage?.key === "completed") return 100;

  if (data?.onRoad?.totalDays) {
    const total = Math.max(1, Number(data.onRoad.totalDays || 1));
    const day = Math.max(0, Math.min(Number(data.onRoad.day || 0), total));
    return Math.round((day / total) * 100);
  }

  const currentIndex = TRACKING_STAGE_ORDER.indexOf(
    data?.journeyStage?.key as JourneyStageKey,
  );

  if (currentIndex <= 0) return currentIndex === 0 ? 10 : 0;

  const campaignStages = TRACKING_STAGE_ORDER.filter(
    (key) => key !== "cancelled",
  );
  const stageIndex = campaignStages.indexOf(
    data?.journeyStage?.key as JourneyStageKey,
  );

  if (stageIndex < 0) return 0;

  return Math.round((stageIndex / (campaignStages.length - 1)) * 100);
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
}: {
  mongoId: string;
  token: string | null;
}) {
  const router = useRouter();

  const { data, loading, error } = useCampaignTracking(mongoId, token);

  const onRoadEnabled = Boolean(
    data &&
      !data.isCancelled &&
      data.journeyStage?.key === "onRoad",
  );

  const {
    vehicles: liveVehicles,
    loading: liveLoading,
    error: liveError,
  } = useLiveLocation(mongoId, token, onRoadEnabled);

  const { vehicles: routeVehicles } = useRouteTrack(
    mongoId,
    token,
    onRoadEnabled,
  );

  const { vehicles: drivingSummaryVehicles } = useDrivingSummary(
    mongoId,
    token,
    onRoadEnabled,
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

  useEffect(() => {
    if (!liveVehicles.length) {
      setSelectedVehicleReg("");
      return;
    }

    setSelectedVehicleReg((current) => {
      if (
        current &&
        liveVehicles.some(
          (vehicle) => vehicle.registrationNumber === current,
        )
      ) {
        return current;
      }

      return liveVehicles[0].registrationNumber;
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

        <section className="RST_Hero">
          <div className="RST_HeroIdentity">
            <div className="RST_HeroVehicle">
              <img
                src={resolveVehicleImage(
                  selectedLiveVehicle?.registrationNumber ||
                    liveVehicles[0]?.registrationNumber,
                )}
                alt="Campaign vehicle"
              />
            </div>

            <div className="RST_HeroCopy">
              <div className="RST_HeroBadges">
                {stageMeta && (
                  <span
                    className={`RS_StageBadge ${stageMeta.className}`}
                  >
                    {StageIcon && <StageIcon size={14} />}
                    {stageMeta.label}
                  </span>
                )}

                {data.onRoad && (
                  <span className="RS_DayBadge">
                    Day {data.onRoad.day} of {data.onRoad.totalDays}
                  </span>
                )}
              </div>

              <h1>{summary.campaignName}</h1>

              <div className="RST_HeroMeta">
                <span>
                  <ShieldCheck size={15} />
                  {data.clientOrderId}
                </span>

                <span>
                  <MapPin size={15} />
                  {summary.location || "Location not available"}
                </span>

                <span>
                  <Truck size={15} />
                  {summary.vehicleCount}{" "}
                  {summary.vehicleCount === 1 ? "Vehicle" : "Vehicles"}
                </span>
              </div>
            </div>
          </div>

          <div className="RST_HeroPeriod">
            <span className="RST_HeroPeriodIcon">
              <CalendarDays size={18} />
            </span>
            <div>
              <span>Campaign Period</span>
              <strong>
                {formatDate(summary.startDate)} – {formatDate(summary.endDate)}
              </strong>
              <small>
                {summary.totalDays
                  ? `${summary.totalDays} ${
                      summary.totalDays === 1 ? "Day" : "Days"
                    }`
                  : "Duration not available"}
              </small>
            </div>
          </div>
        </section>

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
            <section className="RST_LiveShell">
              <div className="RST_LiveSidebar">
                <div className="RST_SectionHeading RST_SectionHeading--compact">
                  <div>
                    <span>VEHICLES</span>
                    <h2>Live vehicles</h2>
                  </div>

                  <span className="RST_LiveBadge">
                    <i /> LIVE
                  </span>
                </div>

                {liveLoading && !liveVehicles.length ? (
                  <div className="RST_MiniLoading">
                    <LoaderCircle className="RST_Spin" size={20} />
                    Loading live vehicles...
                  </div>
                ) : liveVehicles.length ? (
                  <div className="RST_VehicleList">
                    {liveVehicles.map((vehicle, index) => {
                      const selected =
                        vehicle.registrationNumber ===
                        selectedLiveVehicle?.registrationNumber;

                      return (
                        <button
                          key={vehicle.registrationNumber || index}
                          type="button"
                          className={`RST_VehicleCard ${
                            selected ? "RST_VehicleCard--active" : ""
                          }`}
                          onClick={() =>
                            setSelectedVehicleReg(
                              vehicle.registrationNumber,
                            )
                          }
                        >
                          <span className="RST_VehicleThumb">
                            <img
                              src={resolveVehicleImage(
                                vehicle.registrationNumber,
                              )}
                              alt=""
                            />
                          </span>

                          <span className="RST_VehicleCopy">
                            <strong>
                              Vehicle {String(index + 1).padStart(2, "0")}
                            </strong>
                            <small>
                              {vehicle.registrationNumber ||
                                "Registration unavailable"}
                            </small>
                            <span
                              className={`RST_VehicleState ${statusClass(
                                vehicle.status,
                              )}`}
                            >
                              {vehicle.isStale
                                ? "GPS delayed"
                                : vehicle.status}
                            </span>
                          </span>

                          <span className="RST_VehicleKm">
                            <small>KM covered</small>
                            <strong>
                              {Number(
                                vehicle.distanceCoveredKm || 0,
                              ).toFixed(2)}{" "}
                              km
                            </strong>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="RST_EmptyMini">
                    <Radio size={22} />
                    <strong>No live vehicle returned yet</strong>
                    <p>
                      Tracking will appear automatically when the GPS feed
                      becomes available.
                    </p>
                  </div>
                )}

                {liveError && (
                  <div className="RST_InlineError">{liveError}</div>
                )}
              </div>

              <div className="RST_MapCard">
                <div className="RST_MapHeader">
                  <div>
                    <span>TODAY&apos;S ROUTE</span>
                    <h2>
                      {selectedLiveVehicle
                        ? selectedLiveVehicle.registrationNumber
                        : "Live route"}
                    </h2>
                  </div>

                  {selectedLiveVehicle && (
                    <span
                      className={`RST_VehicleState ${statusClass(
                        selectedLiveVehicle.status,
                      )}`}
                    >
                      {selectedLiveVehicle.isStale
                        ? "Location delayed"
                        : selectedLiveVehicle.status}
                    </span>
                  )}
                </div>

                <div className="RST_Map">
                  {selectedTrack?.trackId ? (
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
                      {selectedLiveVehicle?.address ||
                        "Location not available yet"}
                    </strong>
                  </div>

                  <div>
                    <span>Last update</span>
                    <strong>
                      {relativeTime(selectedLiveVehicle?.lastUpdatedAt)}
                    </strong>
                  </div>

                  <div>
                    <span>Speed</span>
                    <strong>
                      {selectedLiveVehicle
                        ? `${Number(
                            selectedLiveVehicle.speedKmh || 0,
                          ).toFixed(0)} km/h`
                        : "—"}
                    </strong>
                  </div>
                </div>
              </div>

              <aside className="RST_TodayCard">
                <div className="RST_SectionHeading RST_SectionHeading--compact">
                  <div>
                    <span>TODAY&apos;S SNAPSHOT</span>
                    <h2>Campaign performance</h2>
                  </div>
                </div>

                <div className="RST_SnapshotMetrics">
                  <div className="RST_TodayMetric">
                    <span className="RST_MetricIcon RST_MetricIcon--green">
                      <Route size={18} />
                    </span>
                    <div>
                      <small>Distance covered</small>
                      <strong>
                        {selectedDay
                          ? `${Number(
                              selectedDay.distanceCoveredKm || 0,
                            ).toFixed(2)} km`
                          : selectedLiveVehicle
                            ? `${Number(
                                selectedLiveVehicle.distanceCoveredKm || 0,
                              ).toFixed(2)} km`
                            : "—"}
                      </strong>
                    </div>
                  </div>

                  <div className="RST_TodayMetric">
                    <span className="RST_MetricIcon RST_MetricIcon--orange">
                      <Sparkles size={18} />
                    </span>
                    <div>
                      <small>Activations</small>
                      <strong>{selectedDay?.activationsCount || 0}</strong>
                    </div>
                  </div>

                  <div className="RST_TodayMetric">
                    <span className="RST_MetricIcon RST_MetricIcon--purple">
                      <Users size={18} />
                    </span>
                    <div>
                      <small>People engaged</small>
                      <strong>{selectedDay?.peopleEngaged || 0}</strong>
                    </div>
                  </div>

                  <div className="RST_TodayMetric">
                    <span className="RST_MetricIcon RST_MetricIcon--blue">
                      <CheckCircle2 size={18} />
                    </span>
                    <div>
                      <small>Leads collected</small>
                      <strong>{selectedDay?.leadsCollected || 0}</strong>
                    </div>
                  </div>
                </div>

                <div className="RST_CurrentVehicleStrip">
                  <div>
                    <small>Current speed</small>
                    <strong>
                      {selectedLiveVehicle
                        ? `${Number(
                            selectedLiveVehicle.speedKmh || 0,
                          ).toFixed(0)} km/h`
                        : "—"}
                    </strong>
                  </div>

                  <div>
                    <small>Movement</small>
                    <strong>{selectedLiveVehicle?.status || "—"}</strong>
                  </div>

                  <div>
                    <small>GPS</small>
                    <strong>
                      {selectedLiveVehicle?.isStale
                        ? "Delayed"
                        : selectedLiveVehicle
                          ? "Live"
                          : "—"}
                    </strong>
                  </div>
                </div>
              </aside>
            </section>

            {drivingSummaryVehicles.some(
              (vehicle) => vehicle.drivingSummary,
            ) && (
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

                <DrivingSummaryPanel
                  vehicles={drivingSummaryVehicles}
                />
              </section>
            )}
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
                  : data.journeyStage?.key === "completed"
                    ? "This campaign has been completed"
                    : "Live GPS becomes available when the campaign goes On Road"}
              </h2>

              <p>
                Campaign journey, reports and activity history remain available
                below. A live map is shown only when the backend reports the
                campaign as On Road.
              </p>
            </div>
          </section>
        )}

        <section className="RST_ReportSection">
          <div className="RST_SectionHeading">
            <div>
              <span>DAY-WISE REPORT</span>
              <h2>Campaign performance by day</h2>
            </div>

            <small>
              Only information returned by the campaign reporting API is shown.
            </small>
          </div>

          {dayRows.length ? (
            <div className="RST_ReportLayout">
              <div className="RST_DayTabs">
                {dayRows.map((row, index) => (
                  <button
                    key={`${row.day}-${index}`}
                    type="button"
                    className={
                      selectedDayIndex === index
                        ? "RST_DayTab RST_DayTab--active"
                        : "RST_DayTab"
                    }
                    onClick={() => setSelectedDayIndex(index)}
                  >
                    <span>
                      <strong>{row.day}</strong>
                      <small>{reportStatusLabel(row.status)}</small>
                    </span>

                    <em className={reportStatusClass(row.status)} />
                  </button>
                ))}
              </div>

              {selectedDay && (
                <div className="RST_DayDetail">
                  <div className="RST_DayDetailHeader">
                    <div>
                      <span>Selected report</span>
                      <h3>{selectedDay.day}</h3>
                    </div>

                    <span
                      className={`RST_ReportStatus ${reportStatusClass(
                        selectedDay.status,
                      )}`}
                    >
                      {reportStatusLabel(selectedDay.status)}
                    </span>
                  </div>

                  <div className="RST_ReportMetrics">
                    <div className="RST_ReportMetric RST_ReportMetric--blue">
                      <span className="RST_ReportMetricIcon">
                        <Route size={18} />
                      </span>
                      <span>
                        <small>Distance covered</small>
                        <strong>
                          {Number(
                            selectedDay.distanceCoveredKm || 0,
                          ).toFixed(2)}{" "}
                          km
                        </strong>
                      </span>
                    </div>

                    <div className="RST_ReportMetric RST_ReportMetric--green">
                      <span className="RST_ReportMetricIcon">
                        <Sparkles size={18} />
                      </span>
                      <span>
                        <small>Activations</small>
                        <strong>
                          {selectedDay.activationsCount || 0}
                        </strong>
                      </span>
                    </div>

                    <div className="RST_ReportMetric RST_ReportMetric--teal">
                      <span className="RST_ReportMetricIcon">
                        <CheckCircle2 size={18} />
                      </span>
                      <span>
                        <small>Leads collected</small>
                        <strong>
                          {selectedDay.leadsCollected || 0}
                        </strong>
                      </span>
                    </div>

                    <div className="RST_ReportMetric RST_ReportMetric--purple">
                      <span className="RST_ReportMetricIcon">
                        <Users size={18} />
                      </span>
                      <span>
                        <small>People engaged</small>
                        <strong>
                          {selectedDay.peopleEngaged || 0}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="RST_RouteNote">
                    <MapPin size={18} />
                    <div>
                      <span>Route / campaign note</span>
                      <strong>
                        {selectedDay.routeNote ||
                          "No route note has been reported for this day."}
                      </strong>
                    </div>
                  </div>

                  {selectedDay.isAbsentDay && (
                    <div className="RST_Absent">
                      This day is marked as an absent / non-running campaign day.
                    </div>
                  )}

                  {selectedDay.photos?.length > 0 && (
                    <div className="RST_ReportPhotosWrap">
                      <div className="RST_ReportPhotosLabel">
                        <ImageIcon size={15} />
                        Photos from this day
                      </div>

                      <div className="RST_DayPhotos">
                        {selectedDay.photos
                          .slice(0, 6)
                          .map((url, index) => (
                            <a
                              key={`${url}-${index}`}
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <img
                                src={url}
                                alt={`Campaign proof ${index + 1}`}
                              />
                            </a>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="RST_EmptyReport">
              <CalendarDays size={27} />
              <strong>No day-wise report has been submitted yet</strong>
              <p>
                Reports will appear here automatically when they are available.
              </p>
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
                {data.activity.slice(0, 8).map((item, index) => (
                  <li key={`${item.label}-${item.at}-${index}`}>
                    <span className="RST_ActivityDot" />
                    <div>
                      <strong>{item.label}</strong>
                      <small>{formatDateTime(item.at)}</small>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="RST_EmptyMini">
                <Clock3 size={22} />
                <strong>No campaign activity yet</strong>
              </div>
            )}
          </div>

          <div className="RST_ProgressCard">
            <div className="RST_SectionHeading RST_SectionHeading--compact">
              <div>
                <span>CAMPAIGN PROGRESS</span>
                <h2>Overall completion</h2>
              </div>
            </div>

            <div className="RST_ProgressBody">
              <div
                className="RST_ProgressRing"
                style={{ "--rst-progress": `${campaignProgress * 3.6}deg` } as any}
              >
                <div>
                  <strong>{campaignProgress}%</strong>
                  <small>Completed</small>
                </div>
              </div>

              <div className="RST_ProgressStats">
                <div>
                  <span>Total Days</span>
                  <strong>{summary.totalDays || "—"}</strong>
                </div>
                <div>
                  <span>Days Completed</span>
                  <strong>
                    {data.onRoad?.day
                      ? Math.max(0, data.onRoad.day)
                      : data.journeyStage?.key === "completed"
                        ? summary.totalDays || "—"
                        : 0}
                  </strong>
                </div>
                <div>
                  <span>Days Remaining</span>
                  <strong>
                    {data.onRoad?.totalDays
                      ? Math.max(
                          0,
                          data.onRoad.totalDays - data.onRoad.day,
                        )
                      : data.journeyStage?.key === "completed"
                        ? 0
                        : summary.totalDays || "—"}
                  </strong>
                </div>
              </div>
            </div>

            {selectedDay?.routeNote && (
              <div className="RST_ProgressRoute">
                <MapPin size={16} />
                <span>{selectedDay.routeNote}</span>
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
              <div className="RST_PhotoGrid">
                {data.photos.slice(0, 6).map((photo, index) => (
                  <a
                    key={`${photo.url}-${index}`}
                    href={photo.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      src={photo.url}
                      alt={`${photo.day || "Campaign"} photo ${index + 1}`}
                    />
                    <span>{photo.day || "Campaign"}</span>
                  </a>
                ))}
              </div>
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

  return <TrackingPageContent mongoId={mongoId} token={token} />;
}
