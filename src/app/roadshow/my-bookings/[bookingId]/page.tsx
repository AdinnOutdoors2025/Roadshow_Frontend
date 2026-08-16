"use client";

import { useEffect, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Calendar,
  MapPin,
  Truck,
  AlertTriangle,
  Loader2,
  Route as RouteIcon,
  Users,
  Activity as ActivityIcon,
  Gauge,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

import "../journeyTracking.css";
import "./trackingPage.css";

import { JOURNEY_STAGE_COPY, type JourneyStageKey } from "../journeyStageCopy";
import { useCampaignTracking } from "../useCampaignTracking";
import JourneyTimeline from "../JourneyTimeline";
import { useLiveLocation } from "./useLiveLocation";
import LiveTrackingMap from "./LiveTrackingMap";
import { useRouteTrack } from "./useRouteTrack";
import RouteTrackMap from "./RouteTrackMap";
import DayWiseReportTable from "./DayWiseReportTable";
import PhotosGallery from "./PhotosGallery";
import { useDrivingSummary } from "./useDrivingSummary";
import DrivingSummaryPanel from "./DrivingSummaryPanel";

function formatDate(value: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatActivityDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function timeAgo(value: string | null) {
  if (!value) return "";

  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "just now";
  if (minutes === 1) return "1 min ago";
  if (minutes < 60) return `${minutes} mins ago`;

  const hours = Math.floor(minutes / 60);
  return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
}

export default function CampaignTrackingPage() {
  const params = useParams<{ bookingId: string }>();
  const bookingId = params.bookingId;
  const router = useRouter();

  const { user, token, authLoading, openAuth } = useAuth();

  const { data, loading, error } = useCampaignTracking(bookingId, token);

  const stageKey = (data?.journeyStage.key ?? "submitted") as JourneyStageKey;
  const stageMeta = JOURNEY_STAGE_COPY[stageKey];
  const StageIcon = stageMeta.icon;
  const isOnRoad = stageKey === "onRoad" && !data?.isCancelled;

  const { vehicles: liveVehicles } = useLiveLocation(bookingId, token, isOnRoad);
  const { vehicles: routeTrackVehicles } = useRouteTrack(bookingId, token, isOnRoad);
  const { vehicles: drivingSummaryVehicles } = useDrivingSummary(
    bookingId,
    token,
    isOnRoad,
  );

  const todayRow = useMemo(() => {
    if (!data) return null;
    return data.dayWiseReport.find((row) => row.status === "ongoing") || null;
  }, [data]);

  /* The Vamosys embed (speedometer + animated route) is the primary map —
     the Leaflet dot-map only renders as a fallback when no track id came
     back, so the two never show at once. */
  const hasRouteTrack = routeTrackVehicles.some((vehicle) => vehicle.trackId);

  /* Paired-column scrolling — same pattern as CampaignRequest/page.tsx.
     Each column is sticky with a `top` derived from its own height: a
     column shorter than the viewport pins as soon as it reaches the
     navbar and waits there; a column taller than the viewport scrolls
     through its own content first and only pins once its bottom edge
     reaches the bottom of the viewport. Net effect: the shorter side
     finishes and holds, the taller side keeps scrolling, and once both
     are exhausted the page scrolls on as one — no internal scrollbars,
     nothing clipped at the bottom. Recomputed on resize/content-height
     change via ResizeObserver. */
  const leftColumnRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const leftColumn = leftColumnRef.current;
    const rightColumn = rightColumnRef.current;

    if (!leftColumn || !rightColumn) return;

    const TOP_GAP = 96;
    const BOTTOM_GAP = 24;
    const DESKTOP_MIN_WIDTH = 900;

    const applyStickyOffsets = () => {
      const columns = [leftColumn, rightColumn];

      if (window.innerWidth < DESKTOP_MIN_WIDTH) {
        columns.forEach((column) => {
          column.style.position = "";
          column.style.top = "";
        });

        return;
      }

      columns.forEach((column) => {
        const height = column.offsetHeight;
        const viewportHeight = window.innerHeight;

        const overflowsViewport =
          height + TOP_GAP + BOTTOM_GAP > viewportHeight;

        const top = overflowsViewport
          ? viewportHeight - height - BOTTOM_GAP
          : TOP_GAP;

        column.style.position = "sticky";
        column.style.top = `${top}px`;
      });
    };

    applyStickyOffsets();

    const resizeObserver = new ResizeObserver(applyStickyOffsets);

    resizeObserver.observe(leftColumn);
    resizeObserver.observe(rightColumn);

    window.addEventListener("resize", applyStickyOffsets);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", applyStickyOffsets);
    };
  }, [data, isOnRoad]);

  if (authLoading) {
    return (
      <div className="RS_TrackingPageRoot">
        <div className="RS_TrackingPageLoading">
          <Loader2 size={26} className="RS_SpinIcon" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="RS_TrackingPageRoot">
        <div className="RS_TrackingPageState">
          <strong>Sign in to view this campaign</strong>
          <button type="button" onClick={() => openAuth("login")}>
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="RS_TrackingPageRoot">
      <button
        type="button"
        className="RS_TrackingBreadcrumb"
        onClick={() => router.push("/roadshow/my-bookings")}
      >
        <ChevronLeft size={16} strokeWidth={2} />
        My Bookings
        {data && <span> &nbsp;›&nbsp; {data.clientOrderId}</span>}
      </button>

      {loading && !data && (
        <div className="RS_TrackingPageLoading">
          <Loader2 size={26} className="RS_SpinIcon" />
          <span>Loading campaign status…</span>
        </div>
      )}

      {error && !data && (
        <div className="RS_TrackingPageState RS_TrackingPageState--error">
          <AlertTriangle size={24} strokeWidth={1.7} />
          <span>{error}</span>
        </div>
      )}

      {data && (
        <>
          <header className="RS_TrackingPageHeader">
            <div>
              <h1>{data.bookingSummary.campaignName || data.clientOrderId}</h1>

              <div className="RS_TrackingStageRow">
                <span className={`RS_StageBadge ${stageMeta.className}`}>
                  <StageIcon size={14} strokeWidth={2.1} />
                  {stageMeta.label}
                </span>

                {data.onRoad && (
                  <span className="RS_DayBadge">
                    Day {data.onRoad.day} of {data.onRoad.totalDays}
                  </span>
                )}

                {data.vehicleUnavailable && (
                  <span className="RS_UnavailableBadge">
                    Vehicle temporarily unavailable
                  </span>
                )}
              </div>
            </div>
          </header>

          {data.vehicleUnavailable && (
            <div className="RS_UnavailableBanner">
              <AlertTriangle size={17} strokeWidth={1.8} />
              <span>
                Your vehicle is temporarily unavailable — our team is
                resolving this and your campaign will continue shortly.
              </span>
            </div>
          )}

          <p className="RS_StageMeaning">{stageMeta.whatThisMeans}</p>

          {stageMeta.whatsNext && (
            <div className="RS_WhatsNext">
              <span>NEXT</span>
              <strong>{stageMeta.whatsNext}</strong>
            </div>
          )}

          {/* QUICK OVERVIEW */}
          <div className="RS_TrackingQuickStats">
            <div>
              <Calendar size={18} strokeWidth={1.7} />
              <span>
                <small>Campaign Dates</small>
                <strong>
                  {formatDate(data.bookingSummary.startDate)} →{" "}
                  {formatDate(data.bookingSummary.endDate)}
                </strong>
              </span>
            </div>

            <div>
              <MapPin size={18} strokeWidth={1.7} />
              <span>
                <small>Location</small>
                <strong>{data.bookingSummary.location || "-"}</strong>
              </span>
            </div>

            <div>
              <Truck size={18} strokeWidth={1.7} />
              <span>
                <small>Vehicles</small>
                <strong>
                  {data.bookingSummary.vehicleCount}{" "}
                  {data.bookingSummary.vehicleCount === 1 ? "Vehicle" : "Vehicles"}
                </strong>
              </span>
            </div>
          </div>

          <div className="RS_TrackingPageGrid">
            <div className="RS_TrackingPageColumn" ref={leftColumnRef}>
              {/* PROGRESS TIMELINE */}
              <section className="RS_TrackingSection">
                <h3>Campaign Progress</h3>
                <JourneyTimeline steps={data.steps} />
              </section>

              {/* TODAY'S SUMMARY */}
              {isOnRoad && (
                <section className="RS_TrackingSection">
                  <h3>Today&apos;s Summary</h3>

                  {todayRow ? (
                    <div className="RS_TodaySummaryGrid">
                      <div>
                        <RouteIcon size={16} strokeWidth={1.8} />
                        <span>
                          <small>Route</small>
                          <strong>{todayRow.routeNote || "-"}</strong>
                        </span>
                      </div>
                      <div>
                        <Gauge size={16} strokeWidth={1.8} />
                        <span>
                          <small>Distance</small>
                          <strong>{todayRow.distanceCoveredKm} km</strong>
                        </span>
                      </div>
                      <div>
                        <ActivityIcon size={16} strokeWidth={1.8} />
                        <span>
                          <small>Activations</small>
                          <strong>{todayRow.activationsCount}</strong>
                        </span>
                      </div>
                      <div>
                        <Users size={16} strokeWidth={1.8} />
                        <span>
                          <small>People Engaged</small>
                          <strong>{todayRow.peopleEngaged}</strong>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="RS_NotReportedYet">
                      Not yet reported for today.
                    </p>
                  )}
                </section>
              )}

              {/* ACTIVITY */}
              {data.activity.length > 0 && (
                <section className="RS_TrackingSection">
                  <h3>Activity</h3>

                  <ul className="RS_ActivityList">
                    {data.activity
                      .slice()
                      .reverse()
                      .map((entry, index) => (
                        <li key={`${entry.label}-${index}`}>
                          <span className="RS_ActivityLabel">{entry.label}</span>
                          <span className="RS_ActivityDate">
                            {formatActivityDate(entry.at)}
                          </span>
                        </li>
                      ))}
                  </ul>
                </section>
              )}
            </div>

            <div className="RS_TrackingPageColumn" ref={rightColumnRef}>
              {/* LIVE TRACKING */}
              <section className="RS_TrackingSection">
                <h3>Live Tracking</h3>

                {isOnRoad ? (
                  liveVehicles.length > 0 ? (
                    <>
                      <div className="RS_LiveVehicleList">
                        {liveVehicles.map((vehicle) => (
                          <div key={vehicle.registrationNumber} className="RS_LiveVehicleCard">
                            <div className="RS_LiveVehicleIcon">
                              <Truck size={18} strokeWidth={1.7} />
                            </div>

                            <div className="RS_LiveVehicleMain">
                              <div className="RS_LiveVehicleTopRow">
                                <strong>{vehicle.registrationNumber}</strong>
                                <span
                                  className={`RS_VehicleStatusPill RS_VehicleStatusPill--${vehicle.status.toLowerCase()}`}
                                >
                                  {vehicle.status}
                                </span>
                              </div>

                              <span className="RS_LiveAddress">
                                {vehicle.address || "Location unavailable"}
                              </span>

                              <div className="RS_LiveVehicleBottomRow">
                                <span
                                  className={`RS_LiveIndicator ${
                                    vehicle.isStale ? "RS_LiveIndicator--stale" : "RS_LiveIndicator--live"
                                  }`}
                                >
                                  {vehicle.isStale ? "DELAYED" : "● LIVE"}
                                </span>
                                <span className="RS_LiveKmCovered">
                                  {vehicle.distanceCoveredKm} km covered
                                </span>
                              </div>

                              <span className="RS_LiveUpdatedAt">
                                {vehicle.isStale
                                  ? `Last GPS update: ${timeAgo(vehicle.lastUpdatedAt)}`
                                  : `Updated ${timeAgo(vehicle.lastUpdatedAt)}`}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {hasRouteTrack ? (
                        <RouteTrackMap vehicles={routeTrackVehicles} />
                      ) : (
                        <LiveTrackingMap vehicles={liveVehicles} />
                      )}

                      <DrivingSummaryPanel vehicles={drivingSummaryVehicles} />
                    </>
                  ) : (
                    <div className="RS_LiveTrackingPlaceholder">
                      Location temporarily unavailable for this vehicle.
                    </div>
                  )
                ) : (
                  <div className="RS_LiveTrackingPlaceholder">
                    {data.isCancelled
                      ? "This booking was cancelled."
                      : "Live tracking becomes available when your campaign goes On Road."}
                  </div>
                )}
              </section>

              {/* DAY WISE REPORT */}
              {data.dayWiseReport.length > 0 && (
                <section className="RS_TrackingSection">
                  <h3>Day Wise Report</h3>
                  <DayWiseReportTable rows={data.dayWiseReport} />
                </section>
              )}

              {/* PHOTOS */}
              {data.photos.length > 0 && (
                <section className="RS_TrackingSection">
                  <h3>Photos &amp; Proof</h3>
                  <PhotosGallery photos={data.photos} />
                </section>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
