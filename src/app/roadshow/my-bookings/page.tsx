/* eslint-disable */
// @ts-nocheck
"use client";

import {
  type ButtonHTMLAttributes,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { ScrollSmoother } from "gsap/ScrollSmoother";

import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Hourglass,
  XCircle,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Download,
  LoaderCircle,
  UserRound,
  Building2,
  Phone,
  Mail,
  Headphones,
  Truck,
  Calendar,
  Timer,
  IndianRupee,
  MapPin,
  MapPinned,
  Circle,
  Trash2,
  X,
  Send,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";

import "./page.css";
import "./journeyTracking.css";

import { baseUrl } from "../../../BaseUrl";
import { useAuth } from "@/context/AuthContext";
import { clientAuthHeaders } from "@/lib/roadshowAuthToken";
import { downloadBookingSummaryPdf } from "@/lib/bookingSummaryPdf";

import { JOURNEY_STAGE_COPY, type JourneyStageKey } from "./journeyStageCopy";

/* =========================================================
   VEHICLE IMAGE
========================================================= */

const VEHICLE_IMAGE =
  "/images/assets/full_side_LED_edited-1_new.png";

/* =========================================================
   TYPES
========================================================= */

type BookingStatus =
  | "Pending"
  | "In Progress"
  | "Confirmed"
  | "Cancelled";

type StatusFilter = "All" | BookingStatus;

type SortMode =
  | "newest"
  | "oldest"
  | "highest"
  | "lowest";

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "highest", label: "Highest amount" },
  { value: "lowest", label: "Lowest amount" },
];

type Vehicle = {
  name: string;
  /* Representative photo for the booked vehicle TYPE, not the exact
     named vehicle — see vehicleTypeImage on ClientRequestVehicleRaw. */
  image: string | null;
  startDate: string;
  endDate: string;
  duration: string;
  quantity: number;
  ratePerDay: number;
  total: number;
  campaignType: string;
  campaignLocation: string;
};

type JourneyStage = { index: number; key: string };

type OnRoadDay = { day: number; totalDays: number };

/* Mirrors buildSteps() in the backend's Utils/clientJourneyStages.js —
   completedAt is null when the backend has no logged timestamp for that
   milestone yet, never a guessed date. */
type JourneyStep = {
  key: string;
  label: string;
  status: "done" | "current" | "upcoming";
  completedAt: string | null;
};

type Booking = {
  id: string;
  mongoId: string;

  status: BookingStatus;

  journeyStage: JourneyStage;
  steps: JourneyStep[];
  isCancelled: boolean;
  vehicleUnavailable: boolean;
  onRoad: OnRoadDay | null;

  requestedOn: string;
  requestedAt: string;

  startDate: string;
  endDate: string;
  duration: string;

  vehicleTypes: number;
  vehicleCount: number;

  subtotal: number;
  gstAmount: number;
  estimatedTotal: number;

  campaignName: string;
  campaignType: string;
  promoterLabel: string;
  location: string;
  route: string;

  customer: {
    name: string;
    company: string;
    phone: string;
    email: string;
  };

  vehicles: Vehicle[];
};

type ClientRequestVehicleRaw = {
  vehicleName?: string;

  vehicleType?:
  | {
    name?: string;
  }
  | string
  | null;

  /* Best-effort photo for the booked vehicle's TYPE — see
     attachVehicleTypeImages in ClientRequestController.js. null when no
     onboarded vehicle of that type has a front-view photo yet. */
  vehicleTypeImage?: string | null;

  quantity?: number;

  fromDate?: string;
  toDate?: string;

  totalDays?: number;

  pricePerDay?: number;
  lineTotal?: number;

  campaignName?: string;
  campaignType?: string;
  campaignLocation?: string;

  needPromoter?: boolean;
  promoterType?: string;
  promoterGender?: string;
};

type ClientRequestRaw = {
  _id: string;

  clientOrderId?: string;

  status?: number;

  createdAt?: string;

  subtotal?: number;
  gstAmount?: number;
  estimatedTotal?: number;

  name?: string;
  companyName?: string;
  phone?: string;
  email?: string;

  campaignType?: string;
  location?: string;
  route?: string;

  vehicleTypes?: ClientRequestVehicleRaw[];

  /* Additive fields from the linked Order's real pipeline — see
     getMyClientRequests/getClientRequestById in ClientRequestController.js. */
  journeyStage?: JourneyStage;
  steps?: JourneyStep[];
  isCancelled?: boolean;
  vehicleUnavailable?: boolean;
  onRoad?: OnRoadDay | null;
};

/* =========================================================
   UI CONFIG
========================================================= */

type StatusConfig = {
  label: string;
  shortLabel: string;
  className: string;
  icon: LucideIcon;
};

const STATUS_CONFIG: Record<BookingStatus, StatusConfig> = {
  Pending: {
    label: "Request Submitted",
    shortLabel: "Pending",
    className: "RS_Status--submitted",
    icon: Hourglass,
  },

  Confirmed: {
    label: "Confirmed",
    shortLabel: "Confirmed",
    className: "RS_Status--confirmed",
    icon: CheckCircle2,
  },

  "In Progress": {
    label: "In Progress",
    shortLabel: "In Progress",
    className: "RS_Status--progress",
    icon: Clock3,
  },

  Cancelled: {
    label: "Cancelled",
    shortLabel: "Cancelled",
    className: "RS_Status--cancelled",
    icon: XCircle,
  },
};

/* =========================================================
   HELPERS
========================================================= */

function formatINR(value: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatBookingDate(value?: string) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatStageDate(value?: string | null) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function formatBookingDateTime(value?: string) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/*
  Backend mapping:

  0 = pending / request submitted
  1 = in progress
  2 = confirmed/completed backend state

  Cancelled remains local-only until a cancellation API exists.
*/

function mapRequestStatus(status?: number): BookingStatus {
  switch (Number(status ?? 0)) {
    case 1:
      return "In Progress";

    case 2:
      return "Confirmed";

    default:
      return "Pending";
  }
}

/*
  The per-row badge (getBookingStatusLabel) already reads the real pipeline
  stage from journeyStage.key. The stat tiles must bucket bookings from the
  same source, or "Order Confirmed" rows can show under a "Confirmed" count
  of 0 whenever the legacy numeric `status` field lags the pipeline. onRoad/
  confirmed/prepared/completed/submitted are the only stage keys the backend
  emits (see journeyStageCopy.ts) — mapRequestStatus is kept only as a
  fallback for an unrecognized/missing stage key.
*/
function mapJourneyStageToStatus(
  journeyStageKey: string | undefined,
  onRoad: OnRoadDay | null | undefined,
  fallbackStatus?: number,
): BookingStatus {
  if (onRoad) return "In Progress";

  switch (journeyStageKey) {
    case "onRoad":
      return "In Progress";

    case "confirmed":
    case "prepared":
    case "completed":
      return "Confirmed";

    case "submitted":
      return "Pending";

    default:
      return mapRequestStatus(fallbackStatus);
  }
}

function mapClientRequestToBooking(
  request: ClientRequestRaw,
): Booking {
  const vehicleTypes = Array.isArray(request.vehicleTypes)
    ? request.vehicleTypes
    : [];

  const firstVehicle = vehicleTypes[0];

  const promoterLabel = firstVehicle?.needPromoter
    ? [firstVehicle.promoterType, firstVehicle.promoterGender]
      .filter(Boolean)
      .join(" · ") || "Promoter requested"
    : "No promoter";

  const vehicleCount = vehicleTypes.reduce(
    (sum, vehicle) => sum + Number(vehicle.quantity || 0),
    0,
  );

  const campaignType =
    firstVehicle?.campaignType ||
    request.campaignType ||
    "Roadshow Campaign";

  const location =
    firstVehicle?.campaignLocation ||
    request.location ||
    "-";

  return {
    id: request.clientOrderId || request._id,

    mongoId: request._id,

    status: request.isCancelled
      ? "Cancelled"
      : mapJourneyStageToStatus(
        request.journeyStage?.key,
        request.onRoad,
        request.status,
      ),

    journeyStage:
      request.journeyStage || { index: 0, key: "submitted" },

    steps: Array.isArray(request.steps) ? request.steps : [],

    isCancelled: Boolean(request.isCancelled),
    vehicleUnavailable: Boolean(request.vehicleUnavailable),
    onRoad: request.onRoad || null,

    requestedOn: formatBookingDateTime(request.createdAt),
    requestedAt: request.createdAt || "",

    startDate: formatBookingDate(firstVehicle?.fromDate),
    endDate: formatBookingDate(firstVehicle?.toDate),

    duration: firstVehicle?.totalDays
      ? `${firstVehicle.totalDays} ${firstVehicle.totalDays === 1 ? "Day" : "Days"
      }`
      : "-",

    vehicleTypes: vehicleTypes.length,
    vehicleCount,

    subtotal: Number(request.subtotal || 0),
    gstAmount: Number(request.gstAmount || 0),
    estimatedTotal: Number(request.estimatedTotal || 0),

    campaignName:
      firstVehicle?.campaignName ||
      campaignType ||
      "Roadshow Campaign",

    campaignType,
    promoterLabel,
    location,
    route: request.route || "",

    customer: {
      name: request.name || "-",
      company: request.companyName || "-",
      phone: request.phone || "-",
      email: request.email || "-",
    },

    vehicles: vehicleTypes.map((vehicle) => ({
      name:
        vehicle.vehicleName ||
        (typeof vehicle.vehicleType === "object"
          ? vehicle.vehicleType?.name
          : typeof vehicle.vehicleType === "string"
            ? vehicle.vehicleType
            : undefined) ||
        "Roadshow Vehicle",

      image: vehicle.vehicleTypeImage || null,

      startDate: formatBookingDate(vehicle.fromDate),
      endDate: formatBookingDate(vehicle.toDate),

      duration: vehicle.totalDays
        ? `${vehicle.totalDays} ${vehicle.totalDays === 1 ? "Day" : "Days"
        }`
        : "-",

      quantity: Number(vehicle.quantity || 0),
      ratePerDay: Number(vehicle.pricePerDay || 0),
      total: Number(vehicle.lineTotal || 0),

      campaignType: vehicle.campaignType || campaignType,
      campaignLocation: vehicle.campaignLocation || location,
    })),
  };
}

/* =========================================================
   BUTTON
========================================================= */

type BubbleButtonVariant =
  | "white"
  | "light"
  | "dark"
  | "danger";

type BubbleButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  children: ReactNode;
  variant?: BubbleButtonVariant;
};

function BubbleButton({
  children,
  variant = "white",
  className = "",
  disabled,

  onMouseEnter,
  onMouseMove,
  onMouseLeave,
  onFocus,
  onBlur,

  ...buttonProps
}: BubbleButtonProps) {
  const [bubbleStyle, setBubbleStyle] =
    useState<CSSProperties>({
      width: 0,
      height: 0,
      left: 0,
      top: 0,
      opacity: 0,
      transform: "scale(0)",
    });

  function showBubble(
    event: ReactMouseEvent<HTMLButtonElement>,
  ) {
    if (disabled) return;

    const rect =
      event.currentTarget.getBoundingClientRect();

    const size = Math.hypot(rect.width, rect.height) * 2;

    setBubbleStyle({
      width: size,
      height: size,

      left: event.clientX - rect.left - size / 2,

      top: event.clientY - rect.top - size / 2,

      opacity: 1,

      transform: "scale(1)",
    });
  }

  function showCenterBubble(button: HTMLButtonElement) {
    if (disabled) return;

    const rect = button.getBoundingClientRect();

    const size = Math.hypot(rect.width, rect.height) * 2;

    setBubbleStyle({
      width: size,
      height: size,

      left: rect.width / 2 - size / 2,

      top: rect.height / 2 - size / 2,

      opacity: 1,

      transform: "scale(1)",
    });
  }

  function hideBubble() {
    setBubbleStyle((current) => ({
      ...current,

      opacity: 0,

      transform: "scale(0)",
    }));
  }

  return (
    <button
      {...buttonProps}
      type={buttonProps.type ?? "button"}
      disabled={disabled}
      className={`RS_ActionButton RS_ActionButton--${variant} ${className}`}
      onMouseEnter={(event) => {
        showBubble(event);
        onMouseEnter?.(event);
      }}
      onMouseMove={(event) => {
        showBubble(event);
        onMouseMove?.(event);
      }}
      onMouseLeave={(event) => {
        hideBubble();
        onMouseLeave?.(event);
      }}
      onFocus={(event) => {
        showCenterBubble(event.currentTarget);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        hideBubble();
        onBlur?.(event);
      }}
    >
      <span
        aria-hidden="true"
        className="RS_ActionButtonBubble"
        style={bubbleStyle}
      />

      <span className="RS_ActionButtonContent">
        {children}
      </span>
    </button>
  );
}

/* =========================================================
   DASHBOARD HELPERS
========================================================= */

function getStageMeta(booking: Booking) {
  return (
    JOURNEY_STAGE_COPY[
    booking.journeyStage.key as JourneyStageKey
    ] || null
  );
}

function getBookingStatusLabel(booking: Booking) {
  const stageMeta = getStageMeta(booking);

  return (
    stageMeta?.label ||
    STATUS_CONFIG[booking.status].label
  );
}

function getCampaignProgress(booking: Booking): number | null {
  if (booking.onRoad?.totalDays) {
    const day = Math.max(
      0,
      Math.min(
        booking.onRoad.day,
        booking.onRoad.totalDays,
      ),
    );

    return Math.round(
      (day / booking.onRoad.totalDays) * 100,
    );
  }

  // Before the campaign goes On Road there is no execution percentage to
  // show — surfacing a stage-based percentage here is what caused the
  // pre-campaign 20%/30%/40%/50% that then appeared to "drop" once real
  // execution began. Callers should fall back to the status label instead.
  return null;
}

function canTrackCampaign(booking: Booking) {
  return Boolean(
    booking.onRoad ||
    booking.isCancelled ||
    Number(booking.journeyStage.index || 0) > 0,
  );
}

function getExpandedVehicles(booking: Booking) {
  const items: Array<{ label: string; name: string; image: string | null }> =
    [];

  booking.vehicles.forEach((vehicle) => {
    const quantity = Math.max(1, Number(vehicle.quantity || 1));

    for (let index = 0; index < quantity; index += 1) {
      items.push({
        label:
          booking.vehicleCount > 1
            ? `Vehicle ${String(items.length + 1).padStart(2, "0")}`
            : "Vehicle",
        name: vehicle.name,
        image: vehicle.image,
      });
    }
  });

  return items;
}

/* =========================================================
   STAT ITEM
========================================================= */

function StatItem({
  icon: Icon,
  label,
  value,
  tone,
  isActive,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  tone: "red" | "green" | "blue" | "orange";
  isActive?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className={`RS_StatItem RS_StatItem--${tone} ${isActive ? "RS_StatItem--active" : ""
        }`}
      onClick={onClick}
    >
      <span className="RS_StatIcon">
        <Icon size={21} strokeWidth={1.8} aria-hidden="true" />
      </span>

      <div className="RS_StatText">
        <span className="RS_StatLabel">{label}</span>
        <strong className="RS_StatValue">{value}</strong>
      </div>
    </button>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function DashboardStatusBadge({ booking }: { booking: Booking }) {
  const stageMeta = getStageMeta(booking);
  const fallback = STATUS_CONFIG[booking.status];

  return (
    <span
      className={`RS_DashboardStatusBadge ${stageMeta?.className || fallback.className
        }`}
    >
      <i aria-hidden="true" />
      {stageMeta?.shortLabel || fallback.shortLabel}
    </span>
  );
}

/* =========================================================
   BOOKING ROW — REFERENCE LIST STYLE
========================================================= */

function BookingRow({
  booking,
  isActive,
  isRevealed,
  onSelect,
}: {
  booking: Booking;
  isActive: boolean;
  isRevealed: boolean;
  onSelect: () => void;
}) {
  const progress = getCampaignProgress(booking);

  return (
    <article
      data-reveal-id={booking.id}
      className={`RS_BookingRow RS_Reveal ${isRevealed ? "RS_IsVisible" : ""
        } ${isActive ? "RS_BookingRow--active" : ""}`}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
    >
      <div className="RS_BookingCell RS_BookingIdentity">
        <span className="RS_BookingCalendarIcon">
          <CalendarDays size={18} strokeWidth={1.8} />
        </span>

        <div className="RS_CellContent">
          <span className="RS_CellLabel">Booking ID</span>
          <strong className="RS_BookingId">{booking.id}</strong>
          <span className="RS_BookingDate">{booking.requestedOn}</span>
        </div>
      </div>

      <div className="RS_BookingCell">
        <span className="RS_CellLabel">Status</span>
        <DashboardStatusBadge booking={booking} />
      </div>

      <div className="RS_BookingCell">
        <span className="RS_CellLabel">Campaign</span>
        <strong className="RS_CellPrimary RS_Ellipsis">
          {booking.campaignName}
        </strong>
        <span className="RS_CellSecondary RS_Ellipsis">
          {booking.campaignType}
        </span>
      </div>

      <div className="RS_BookingCell">
        <span className="RS_CellLabel">Period</span>
        <strong className="RS_CellPrimary RS_RowPeriod">
          {booking.startDate} – {booking.endDate}
        </strong>
        <span className="RS_CellSecondary">
          {booking.onRoad
            ? `Day ${booking.onRoad.day} of ${booking.onRoad.totalDays}`
            : getBookingStatusLabel(booking)}
        </span>
      </div>

      <div className="RS_BookingCell">
        <span className="RS_CellLabel">Vehicles</span>
        <strong className="RS_CellPrimary">
          {booking.vehicleCount} {booking.vehicleCount === 1 ? "Vehicle" : "Vehicles"}
        </strong>
      </div>

      <div className="RS_BookingCell RS_RowProgressCell">
        <span className="RS_CellLabel">Progress</span>
        <strong className="RS_CellPrimary">
          {progress === null ? getBookingStatusLabel(booking) : `${progress}%`}
        </strong>
      </div>

      <button
        type="button"
        className="RS_RowChevron"
        aria-label={`Open ${booking.id}`}
        onClick={(event) => {
          event.stopPropagation();
          onSelect();
        }}
      >
        <ChevronRight size={18} strokeWidth={2} />
      </button>
    </article>
  );
}

// /* =========================================================
//    CAMPAIGN TIMELINE
// ========================================================= */

// function CampaignTimeline({ booking }: { booking: Booking }) {
//   const stages = Object.entries(JOURNEY_STAGE_COPY);

//   if (!stages.length) {
//     return (
//       <div className="RS_TimelineFallback">
//         <strong>{getBookingStatusLabel(booking)}</strong>
//         <span>Campaign progress is updating from the backend.</span>
//       </div>
//     );
//   }

//   const keyIndex = stages.findIndex(
//     ([key]) => key === booking.journeyStage.key,
//   );

//   const currentIndex =
//     keyIndex >= 0
//       ? keyIndex
//       : Math.max(
//           0,
//           Math.min(
//             Number(booking.journeyStage.index || 0),
//             stages.length - 1,
//           ),
//         );

//   return (
//     <div className="RS_TimelineViewport">
//       <div className="RS_Timeline">
//         {stages.map(([key, rawMeta], index) => {
//           const meta = rawMeta as any;
//           const complete = index < currentIndex;
//           const current = index === currentIndex;
//           const StageIcon = meta?.icon;

//           const stepDate = formatStageDate(
//             booking.steps.find((step) => step.key === key)?.completedAt,
//           );

//           return (
//             <div
//               key={key}
//               className={`RS_TimelineStage ${
//                 complete ? "RS_TimelineStage--complete" : ""
//               } ${current ? "RS_TimelineStage--current" : ""}`}
//             >
//               <div className="RS_TimelineRail">
//                 <span className="RS_TimelineNode">
//                   {complete ? (
//                     <Check size={12} strokeWidth={2.8} />
//                   ) : current && StageIcon ? (
//                     <StageIcon size={12} strokeWidth={2.2} />
//                   ) : (
//                     <Circle size={8} strokeWidth={2} />
//                   )}
//                 </span>

//                 {index < stages.length - 1 && (
//                   <span className="RS_TimelineConnector" />
//                 )}
//               </div>

//               <strong>{meta?.label || key}</strong>
//               <small>
//                 {stepDate ||
//                   (complete ? "Completed" : current ? "Current" : "Upcoming")}
//               </small>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }





/* =========================================================
   CAMPAIGN STATUS FLOW
   Backend data remains unchanged.
========================================================= */

function CampaignTimeline({ booking }: { booking: Booking }) {
  const stages = Object.entries(JOURNEY_STAGE_COPY);

  if (!stages.length) {
    return (
      <div className="RS_TimelineFallback">
        <strong>{getBookingStatusLabel(booking)}</strong>
        <span>Campaign progress is updating...</span>
      </div>
    );
  }

  const currentKey = booking.journeyStage?.key;

  const currentIndex = stages.findIndex(
    ([key]) => key === currentKey,
  );

  return (
    <div className="RS_TimelineViewport">
      <div className="RS_Timeline">
        {stages.map(([key, rawMeta], index) => {
          const meta = rawMeta as any;
          const StageIcon = meta?.icon;

          /*
            Prefer actual backend step status.
            Only fallback to journeyStage index if steps
            are not returned by the backend.
          */
          const backendStep = booking.steps?.find(
            (step) => step.key === key,
          );

          let stepStatus:
            | "done"
            | "current"
            | "upcoming" =
            backendStep?.status ||
            (index < currentIndex
              ? "done"
              : index === currentIndex
                ? "current"
                : "upcoming");

          const isDone = stepStatus === "done";
          const isCurrent = stepStatus === "current";
          const isUpcoming = stepStatus === "upcoming";

          const stepDate = formatStageDate(
            backendStep?.completedAt,
          );

          return (
            <div
              key={key}
              className={[
                "RS_TimelineStage",
                isDone && "RS_TimelineStage--complete",
                isCurrent && "RS_TimelineStage--current",
                isUpcoming && "RS_TimelineStage--upcoming",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div className="RS_TimelineRail">
                <span className="RS_TimelineNode">
                  {isDone ? (
                    <Check size={14} strokeWidth={3} />
                  ) : isCurrent && StageIcon ? (
                    <StageIcon
                      size={15}
                      strokeWidth={2.4}
                    />
                  ) : (
                    <Circle size={9} strokeWidth={2.1} />
                  )}
                </span>

                {index < stages.length - 1 && (
                  <span className="RS_TimelineConnector" />
                )}
              </div>

              <div className="RS_TimelineContent">
                <strong>
                  {meta?.label || backendStep?.label || key}
                </strong>

                {isCurrent ? (
                  <span className="RS_TimelineCurrentText">
                    Current
                  </span>
                ) : (
                  <small>
                    {stepDate ||
                      (isDone
                        ? "Completed"
                        : "Upcoming")}
                  </small>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}



/* =========================================================
   LIVE VEHICLES CARD
========================================================= */

function LiveVehiclesCard({
  booking,
  onTrack,
}: {
  booking: Booking;
  onTrack: () => void;
}) {
  const vehicles = getExpandedVehicles(booking);
  const canTrack = canTrackCampaign(booking);

  return (
    <section className="RS_DashboardCard RS_LiveVehiclesCard">
      <div className="RS_CardHeading">
        <h3>Live Vehicles</h3>

        {booking.onRoad ? (
          <span className="RS_LivePill">
            <i /> LIVE
          </span>
        ) : (
          <span className="RS_SoftPill">{getBookingStatusLabel(booking)}</span>
        )}
      </div>

      <div className="RS_LiveVehicleList">
        {vehicles.length ? (
          vehicles.slice(0, 3).map((vehicle, index) => (
            <button
              key={`${vehicle.label}-${index}`}
              type="button"
              className="RS_LiveVehicle"
              onClick={onTrack}
              disabled={!canTrack}
            >
              <span className="RS_LiveVehicleImage">
                <img src={vehicle.image || VEHICLE_IMAGE} alt="" />
              </span>

              <span className="RS_LiveVehicleCopy">
                <strong>{vehicle.label}</strong>
                <small title={vehicle.name}>{vehicle.name}</small>
                <em className={booking.onRoad ? "RS_VehicleActive" : ""}>
                  {booking.vehicleUnavailable
                    ? "Vehicle unavailable"
                    : booking.onRoad
                      ? "Tracking active"
                      : "Tracking not active"}
                </em>
              </span>

              <ChevronRight size={15} />
            </button>
          ))
        ) : (
          <div className="RS_InlineEmpty">
            Vehicle assignment details are not available yet.
          </div>
        )}
      </div>

      {vehicles.length > 3 && (
        <button
          type="button"
          className="RS_TextButton"
          onClick={onTrack}
          disabled={!canTrack}
        >
          View all {vehicles.length} vehicles <ArrowRight size={13} />
        </button>
      )}
    </section>
  );
}

/* =========================================================
   ROUTE / GPS ENTRY CARD
   This is deliberately a visual preview only. Actual GPS stays
   inside the existing tracking route so no fake location is shown.
========================================================= */

function RouteProgressCard({
  booking,
  onTrack,
}: {
  booking: Booking;
  onTrack: () => void;
}) {
  const canTrack = canTrackCampaign(booking);

  return (
    <section className="RS_DashboardCard RS_RouteCard">
      <div className="RS_CardHeading">
        <div>
          <span className="RS_CardEyebrow">
            {booking.onRoad ? "LIVE CAMPAIGN" : "CAMPAIGN ROUTE"}
          </span>
          <h3>
            {booking.onRoad
              ? "Live Route & Movement"
              : "Route & Tracking"}
          </h3>
        </div>

        {booking.onRoad ? (
          <span className="RS_LivePill">
            <i /> LIVE
          </span>
        ) : (
          <span className="RS_SoftPill">
            {canTrack ? "Tracking history" : "Not started"}
          </span>
        )}
      </div>

      <div className="RS_RoutePreview RS_RoutePreview--friendly">
        {/* <div className="RS_RouteGrid" aria-hidden="true" /> */}
        {/* <span className="RS_RouteStart">
          <Circle size={8} strokeWidth={3} />
        </span>
        <span className="RS_RouteEnd">
          <MapPin size={14} strokeWidth={2.2} />
        </span>
        <span className="RS_RouteVehicle">
          <Truck size={15} strokeWidth={2.1} />
        </span>
        <span className="RS_RouteLine" aria-hidden="true" /> */}

        <div className="RS_RouteMessage RS_RouteMessage--friendly">
          <div>
            <strong>
              {booking.onRoad
                ? "Your campaign is currently on road"
                : canTrack
                  ? "Campaign tracking is available"
                  : "Live tracking starts when the campaign goes On Road"}
            </strong>

            <span>
              {booking.onRoad
                ? "Open the full tracking screen for the latest GPS position, vehicle movement and day-wise campaign report."
                : canTrack
                  ? "Open the tracking screen to review the client-safe campaign history available for this order."
                  : "Until then, you can follow the campaign preparation status from the timeline above."}
            </span>
          </div>

          <button
            type="button"
            onClick={onTrack}
            disabled={!canTrack}
          >
            <MapPinned size={14} />
            {canTrack ? "Open Live Tracking" : "Tracking Not Available"}
            {canTrack && <ArrowRight size={13} />}
          </button>
        </div>
      </div>

      <div className="RS_RouteMeta">
        <div>
          <span>Campaign Location</span>
          <strong>{booking.location}</strong>
        </div>

        <div>
          <span>Planned Route</span>
          <strong title={booking.route}>
            {booking.route ||
              (canTrack
                ? "Open tracking for route updates"
                : "Route will appear when available")}
          </strong>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   CAMPAIGN SUMMARY CARD
========================================================= */

function CampaignSummaryCard({ booking }: { booking: Booking }) {
  const progress = getCampaignProgress(booking);

  return (
    <section className="RS_DashboardCard RS_CampaignSummaryCard">
      <div className="RS_CardHeading">
        <h3>Campaign Summary</h3>
        <span className="RS_SoftPill">Current</span>
      </div>

      <div className="RS_ProgressNumber">
        <strong>
          {progress === null ? getBookingStatusLabel(booking) : `${progress}%`}
        </strong>
        <span>Progress</span>
      </div>

      <div className="RS_ProgressBar">
        <span style={{ width: `${progress ?? 0}%` }} />
      </div>

      <div className="RS_SummaryMetrics">
        <div>
          <i className="RS_MetricDot RS_MetricDot--green" />
          <span>
            <small>Status</small>
            <strong>{getBookingStatusLabel(booking)}</strong>
          </span>
        </div>

        <div>
          <i className="RS_MetricDot RS_MetricDot--blue" />
          <span>
            <small>Campaign Day</small>
            <strong>
              {booking.onRoad
                ? `${booking.onRoad.day} of ${booking.onRoad.totalDays}`
                : "Not running"}
            </strong>
          </span>
        </div>

        <div>
          <i className="RS_MetricDot RS_MetricDot--orange" />
          <span>
            <small>Vehicles</small>
            <strong>{booking.vehicleCount}</strong>
          </span>
        </div>

        <div>
          <i className="RS_MetricDot" />
          <span>
            <small>Duration</small>
            <strong>{booking.duration}</strong>
          </span>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   DAY-WISE REPORT — ONLY VALUES PRESENT IN CLIENT DATA
========================================================= */

function DayWiseReport({ booking }: { booking: Booking }) {
  const values = [
    {
      icon: Clock3,
      label: "Campaign Status",
      value: getBookingStatusLabel(booking),
    },
    {
      icon: CalendarDays,
      label: "Campaign Day",
      value: booking.onRoad
        ? `Day ${booking.onRoad.day} of ${booking.onRoad.totalDays}`
        : "-",
    },
    {
      icon: Truck,
      label: "Vehicles",
      value: `${booking.vehicleCount} ${booking.vehicleCount === 1 ? "Vehicle" : "Vehicles"}`,
    },
    {
      icon: Timer,
      label: "Duration",
      value: booking.duration,
    },
    {
      icon: IndianRupee,
      label: "Estimated Total",
      value: formatINR(booking.estimatedTotal),
    },
  ];

  return (
    <section className="RS_DashboardCard RS_DayReport">
      <div className="RS_CardHeading">
        <h3>Day-wise Report{booking.onRoad ? " (Today)" : ""}</h3>
      </div>

      <div className="RS_DayStats">
        {values.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="RS_DayStat">
              <span className="RS_DayStatIcon">
                <Icon size={16} strokeWidth={1.8} />
              </span>
              <span>
                <small>{item.label}</small>
                <strong>{item.value}</strong>
              </span>
            </div>
          );
        })}
      </div>

      <div className="RS_DayMeta">
        <div>
          <MapPin size={14} />
          <span>
            <small>Campaign Location</small>
            <strong>{booking.location}</strong>
          </span>
        </div>

        <div>
          <Calendar size={14} />
          <span>
            <small>Campaign Period</small>
            <strong>{booking.startDate} – {booking.endDate}</strong>
          </span>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   RIGHT CAMPAIGN DASHBOARD
========================================================= */

function CampaignDashboard({
  booking,
  detailLoading,
  detailError,
  onOpenDetails,
  onDownload,
  onTrack,
  isDownloadingSummary,
  isSummaryDownloaded,
  detailPaneRef,
}: {
  booking: Booking;
  detailLoading: boolean;
  detailError: string;
  onOpenDetails: () => void;
  onDownload: () => void;
  onTrack: () => void;
  isDownloadingSummary: boolean;
  isSummaryDownloaded: boolean;
  detailPaneRef?: any;
}) {
  const canTrack = canTrackCampaign(booking);

  return (
    <aside
      ref={detailPaneRef}
      className="RS_TrackingPane"
      aria-label={`Selected campaign details for ${booking.id}`}
    >
      <div className="RS_SelectedCampaignHint">
        <span><CheckCircle2 size={14} /> Selected campaign</span>
        <small>Review the summary here, then open live tracking for full GPS and day-wise reporting.</small>
      </div>

      <header className="RS_TrackingHeader">
        <div className="RS_TrackingIdentity">
          <span className="RS_TrackingThumb">
            <img
              src={booking.vehicles[0]?.image || VEHICLE_IMAGE}
              alt=""
            />
          </span>

          <div className="RS_TrackingTitle">
            <h2>{booking.campaignName}</h2>
            <p>{booking.campaignType}</p>

            <div className="RS_TrackingMeta">
              <span>Order ID: <strong>{booking.id}</strong></span>
              <i />
              <span><Truck size={12} /> {booking.vehicleCount} {booking.vehicleCount === 1 ? "Vehicle" : "Vehicles"}</span>
              <span><MapPin size={12} /> {booking.location}</span>
            </div>
          </div>
        </div>

        <div className="RS_TrackingState">
          <DashboardStatusBadge booking={booking} />
          {booking.onRoad && (
            <strong>Day {booking.onRoad.day} of {booking.onRoad.totalDays}</strong>
          )}
        </div>
      </header>

      {/* <div className="RS_DetailRefreshState">
        {detailLoading ? (
          <span><LoaderCircle size={12} className="RS_DownloadSpinner" /> Refreshing campaign details...</span>
        ) : detailError ? (
          <span className="RS_DetailRefreshError">{detailError}</span>
        ) : (
          <span>Campaign details are synced with your booking API.</span>
        )}
      </div> */}


      <section className="RS_DashboardCard RS_TimelineCard">
        <div className="RS_TimelineCardHeader">
          <div>
            <span className="RS_TimelineEyebrow">
              CAMPAIGN STATUS
            </span>

            <h3>Where your campaign is now</h3>
          </div>

          <div
            className={`RS_TimelineSync ${
              detailLoading ? "RS_TimelineSync--refreshing" : ""
            }`}
          >
            <span
              className={`RS_TimelineSyncDot ${
                detailError ? "RS_TimelineSyncDot--error" : ""
              }`}
            />

            <span>
              {detailError
                ? detailError
                : "Campaign details are synced with your booking API."}
            </span>
          </div>
        </div>

        <CampaignTimeline booking={booking} />
      </section>

      {/* <section className="RS_DashboardCard RS_TimelineCard">
        <CampaignTimeline booking={booking} />
      </section> */}

      <div className="RS_TrackingGrid">
        <LiveVehiclesCard booking={booking} onTrack={onTrack} />
        <RouteProgressCard booking={booking} onTrack={onTrack} />
        <CampaignSummaryCard booking={booking} />
      </div>

      <DayWiseReport booking={booking} />

      <div className="RS_TrackingActions">
        <button type="button" onClick={onOpenDetails}>
          View Details
        </button>

        <button
          type="button"
          onClick={onDownload}
          disabled={isDownloadingSummary}
        >
          {isDownloadingSummary ? (
            <LoaderCircle size={14} className="RS_DownloadSpinner" />
          ) : isSummaryDownloaded ? (
            <CheckCircle2 size={14} />
          ) : (
            <Download size={14} />
          )}
          {isDownloadingSummary
            ? "Preparing PDF..."
            : isSummaryDownloaded
              ? "Downloaded"
              : "Download Summary"}
        </button>

        <button
          type="button"
          className="RS_TrackingPrimaryAction"
          onClick={onTrack}
          disabled={!canTrack}
        >
          <MapPinned size={14} />
          {canTrack ? "Open Live Tracking" : "Tracking Not Available Yet"}
        </button>
      </div>
    </aside>
  );
}

/* =========================================================
   HOW IT WORKS
========================================================= */

function HowItWorks() {
  const steps = [
    {
      icon: CalendarDays,
      title: "Booking List",
      copy: "View all bookings and current status at a glance.",
    },
    {
      icon: Search,
      title: "Booking Details",
      copy: "Check campaign progress, vehicles and key updates.",
    },
    {
      icon: MapPinned,
      title: "Live Tracking",
      copy: "Open the existing tracking console for live GPS data.",
    },
    {
      icon: Clock3,
      title: "Day-wise Report",
      copy: "Review campaign day, duration and client-safe information.",
    },
  ];

  return (
    <section className="RS_HowItWorks">
      <div className="RS_HowIntro">
        <h2>How it works</h2>
        <p>Simple steps to track your roadshow campaigns.</p>
        <MapPinned size={52} />
      </div>

      <div className="RS_HowSteps">
        {steps.map((step, index) => {
          const Icon = step.icon;

          return (
            <div key={step.title} className="RS_HowStep">
              <span className="RS_HowStepNumber">{index + 1}</span>
              <div className="RS_HowPreview"><Icon size={28} strokeWidth={1.5} /></div>
              <strong>{step.title}</strong>
              <p>{step.copy}</p>
              {index < steps.length - 1 && <ArrowRight size={20} className="RS_HowArrow" />}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* =========================================================
   DETAIL ITEM
========================================================= */

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="RS_DetailItem">
      <span className="RS_DetailIcon">
        <Icon
          size={17}
          strokeWidth={1.7}
        />
      </span>

      <div>
        <span className="RS_DetailLabel">{label}</span>

        <strong className="RS_DetailValue">{value}</strong>
      </div>
    </div>
  );
}

/* =========================================================
   VEHICLE ROW MODAL
========================================================= */

function VehicleRow({
  vehicle,
  index,
}: {
  vehicle: Vehicle;
  index: number;
}) {
  return (
    <article className="RS_ModalVehicle">
      <div className="RS_ModalVehicleImage">
        <img
          src={vehicle.image || VEHICLE_IMAGE}
          alt={vehicle.name}
        />
      </div>

      <div className="RS_ModalVehicleMain">
        <div className="RS_ModalVehicleHeading">
          <span>Vehicle {index + 1}</span>

          <h4>{vehicle.name}</h4>
        </div>

        <div className="RS_VehicleDetailsGrid">
          <div>
            <span>Start Date</span>
            <strong>{vehicle.startDate}</strong>
          </div>

          <div>
            <span>End Date</span>
            <strong>{vehicle.endDate}</strong>
          </div>

          <div>
            <span>Duration</span>
            <strong>{vehicle.duration}</strong>
          </div>

          <div>
            <span>Quantity</span>

            <strong>
              {vehicle.quantity}{" "}
              {vehicle.quantity === 1
                ? "Vehicle"
                : "Vehicles"}
            </strong>
          </div>
        </div>
      </div>

      <div className="RS_ModalVehiclePrice">
        <div>
          <span>Rate / Day</span>

          <strong>{formatINR(vehicle.ratePerDay)}</strong>
        </div>

        <div>
          <span>Line Total</span>

          <strong>{formatINR(vehicle.total)}</strong>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   BOOKING DETAILS MODAL
========================================================= */

function BookingModal({
  booking,
  onClose,
  onCancel,
  onViewSummary,
  isDownloadingSummary = false,
  isSummaryDownloaded = false,
}: {
  booking: Booking;
  onClose: () => void;
  onCancel: () => void;
  onViewSummary: () => void;
  isDownloadingSummary?: boolean;
  isSummaryDownloaded?: boolean;
}) {
  const [mounted] = useState(
    () => typeof document !== "undefined",
  );

  const status = STATUS_CONFIG[booking.status];
  const StatusIcon = status.icon;

  useEffect(() => {
    if (typeof window === "undefined") return;

    /*
      Pause the global GSAP smoother while the dialog is open, but do not
      change body position/top. The old position:fixed lock could prevent the
      modal's own flex child from receiving wheel/touch scrolling correctly.
      The page itself is locked with overflow only; RS_ModalBody remains the
      dedicated scroll container.
    */
    const smoother = ScrollSmoother.get();
    smoother?.paused(true);

    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyOverscroll = document.body.style.overscrollBehavior;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousHtmlOverscroll =
      document.documentElement.style.overscrollBehavior;

    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.overscrollBehavior = previousBodyOverscroll;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.documentElement.style.overscrollBehavior =
        previousHtmlOverscroll;

      smoother?.paused(false);

      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  if (
    !mounted ||
    typeof document === "undefined"
  ) {
    return null;
  }

  return createPortal(
    <div
      className="RS_ModalOverlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Booking details for ${booking.id}`}
      onMouseDown={onClose}
    >
      <section
        className="RS_ModalPanel"
        onMouseDown={(event) => event.stopPropagation()}
        onWheel={(event) => event.stopPropagation()}
        onTouchMove={(event) => event.stopPropagation()}
      >
        {/* HEADER */}
        <header className="RS_ModalHeader">
          <div className="RS_ModalHeaderText">
            <div className="RS_ModalTitleRow">
              <div>
                <span className="RS_ModalEyebrow">
                  Booking Details
                </span>

                <h2>{booking.id}</h2>
              </div>

              <span
                className={`RS_StatusBadge ${status.className}`}
              >
                <StatusIcon
                  size={13}
                  strokeWidth={2.1}
                />

                {status.label}
              </span>
            </div>

            <p>
              Requested on {booking.requestedOn}
            </p>
          </div>

          <button
            type="button"
            aria-label="Close booking details"
            className="RS_CloseButton"
            onClick={onClose}
          >
            <X
              size={21}
              strokeWidth={1.8}
            />
          </button>
        </header>

        <div className="RS_ModalBody">
          {/* QUICK DETAILS */}
          <div className="RS_ModalQuickStats">
            <div>
              <Calendar
                size={19}
                strokeWidth={1.7}
              />

              <span>
                <small>Campaign Dates</small>
                <strong>
                  {booking.startDate} → {booking.endDate}
                </strong>
              </span>
            </div>

            <div>
              <Timer
                size={19}
                strokeWidth={1.7}
              />

              <span>
                <small>Duration</small>
                <strong>{booking.duration}</strong>
              </span>
            </div>

            <div>
              <Truck
                size={19}
                strokeWidth={1.7}
              />

              <span>
                <small>Vehicles</small>
                <strong>
                  {booking.vehicleCount}{" "}
                  {booking.vehicleCount === 1
                    ? "Vehicle"
                    : "Vehicles"}
                </strong>
              </span>
            </div>

            <div>
              <IndianRupee
                size={19}
                strokeWidth={1.7}
              />

              <span>
                <small>Estimated Total</small>
                <strong>
                  {formatINR(booking.estimatedTotal)}
                </strong>
              </span>
            </div>
          </div>

          <div className="RS_ModalLayout">
            {/* LEFT */}
            <aside className="RS_ModalSidebar">
              <section className="RS_ModalCard">
                <div className="RS_ModalCardTitle">
                  <UserRound
                    size={19}
                    strokeWidth={1.7}
                  />

                  <h3>Customer Details</h3>
                </div>

                <div className="RS_DetailList">
                  <DetailItem
                    icon={UserRound}
                    label="Name"
                    value={booking.customer.name}
                  />

                  <DetailItem
                    icon={Building2}
                    label="Company"
                    value={booking.customer.company}
                  />

                  <DetailItem
                    icon={Phone}
                    label="Phone Number"
                    value={booking.customer.phone}
                  />

                  <DetailItem
                    icon={Mail}
                    label="Email Address"
                    value={booking.customer.email}
                  />
                </div>
              </section>

              <section className="RS_HelpCard">
                <span className="RS_HelpIcon">
                  <Headphones
                    size={21}
                    strokeWidth={1.8}
                  />
                </span>

                <h3>Need Help?</h3>

                <p>
                  Our support team is ready to assist with
                  your booking.
                </p>

                <a
                  href="/roadshow/Contact"
                  className="RS_SupportLink"
                >
                  <Headphones
                    size={16}
                    strokeWidth={1.8}
                  />

                  Contact Support
                </a>
              </section>
            </aside>

            {/* RIGHT */}
            <div className="RS_ModalMain">
              <section className="RS_ModalCard">
                <div className="RS_ModalCardTitle">
                  <Truck
                    size={20}
                    strokeWidth={1.7}
                  />

                  <div>
                    <h3>Vehicles & Booking Details</h3>

                    <span>
                      {booking.vehicleTypes} vehicle{" "}
                      {booking.vehicleTypes === 1
                        ? "type"
                        : "types"}
                    </span>
                  </div>
                </div>

                <div className="RS_ModalVehicleList">
                  {booking.vehicles.map((vehicle, index) => (
                    <VehicleRow
                      key={`${booking.id}-${vehicle.name}-${index}`}
                      vehicle={vehicle}
                      index={index}
                    />
                  ))}
                </div>
              </section>

              <div className="RS_ModalBottomGrid">
                <section className="RS_ModalCard">
                  <div className="RS_ModalCardTitle">
                    <IndianRupee
                      size={19}
                      strokeWidth={1.7}
                    />

                    <h3>Amount Summary</h3>
                  </div>

                  <div className="RS_AmountSummary">
                    <div>
                      <span>Subtotal</span>

                      <strong>
                        {formatINR(
                          booking.subtotal,
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Taxes & Charges</span>
                      <strong>{formatINR(booking.gstAmount)}</strong>
                    </div>

                    <hr />

                    <div className="RS_GrandTotal">
                      <span>Estimated Total</span>

                      <strong>
                        {formatINR(
                          booking.estimatedTotal,
                        )}
                      </strong>
                    </div>
                  </div>
                </section>

                <section className="RS_ModalCard">
                  <div className="RS_ModalCardTitle">
                    <Send
                      size={19}
                      strokeWidth={1.7}
                    />

                    <h3>What Happens Next?</h3>
                  </div>

                  <div className="RS_NextSteps">
                    <div>
                      <span>1</span>

                      <p>
                        Our team reviews your request and
                        vehicle availability.
                      </p>
                    </div>

                    <div>
                      <span>2</span>

                      <p>
                        We contact you to confirm route and
                        campaign requirements.
                      </p>
                    </div>

                    <div>
                      <span>3</span>

                      <p>
                        Once confirmed, your booking is
                        locked in.
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <footer className="RS_ModalFooter">
          <BubbleButton
            variant="white"
            className="RS_ModalFooterButton"
            onClick={onViewSummary}
            disabled={isDownloadingSummary}
            aria-busy={isDownloadingSummary}
          >
            {isDownloadingSummary ? (
              <LoaderCircle
                size={16}
                strokeWidth={1.8}
                className="RS_DownloadSpinner"
              />
            ) : isSummaryDownloaded ? (
              <CheckCircle2
                size={16}
                strokeWidth={1.8}
              />
            ) : (
              <Download
                size={16}
                strokeWidth={1.8}
              />
            )}

            {isDownloadingSummary
              ? "Preparing PDF..."
              : isSummaryDownloaded
                ? "Downloaded"
                : "Download Summary"}
          </BubbleButton>

          {/* {booking.status !== "Cancelled" &&
            booking.status !== "Confirmed" && (
              <BubbleButton
                variant="danger"
                className="RS_ModalFooterButton"
                onClick={onCancel}
              >
                <Trash2
                  size={16}
                  strokeWidth={1.8}
                />

                Cancel Request
              </BubbleButton>
            )} */}

          <BubbleButton
            variant="dark"
            className="RS_ModalFooterButton"
            onClick={onClose}
          >
            Close
          </BubbleButton>
        </footer>
      </section>
    </div>,
    document.body,
  );
}

/* =========================================================
   OVERALL DASHBOARD LOADING
   One page-level loading state for initial refresh/load.
   No section-specific loading cards are rendered while the booking list
   itself is still being fetched.
========================================================= */

function OverallDashboardLoading() {
  return (
    <section
      className="RS_DashboardOverallLoading"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="RS_OverallLoadingHead">
        <span className="RS_OverallLoadingLogo">
          <LoaderCircle
            size={24}
            strokeWidth={1.8}
            className="RS_DownloadSpinner"
          />
        </span>

        <div>
          <strong>Loading your campaigns</strong>
          <p>
            We&apos;re getting your bookings and latest campaign status.
          </p>
        </div>
      </div>

      <div className="RS_OverallLoadingGrid" aria-hidden="true">
        <div className="RS_OverallLoadingPane">
          <div className="RS_LoadSkeleton RS_LoadSkeleton--title" />
          <div className="RS_LoadSkeleton RS_LoadSkeleton--sub" />

          <div className="RS_LoadingStatRow">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={`loading-stat-${index}`}
                className="RS_LoadingStat"
              >
                <span className="RS_LoadSkeleton RS_LoadSkeleton--circle" />
                <span className="RS_LoadSkeleton RS_LoadSkeleton--line" />
              </div>
            ))}
          </div>

          <div className="RS_LoadSkeleton RS_LoadSkeleton--control" />

          <div className="RS_LoadingRows">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`loading-row-${index}`}
                className="RS_LoadingRow"
              >
                <span className="RS_LoadSkeleton RS_LoadSkeleton--circle" />
                <span className="RS_LoadSkeleton RS_LoadSkeleton--wide" />
                <span className="RS_LoadSkeleton RS_LoadSkeleton--medium" />
                <span className="RS_LoadSkeleton RS_LoadSkeleton--short" />
              </div>
            ))}
          </div>
        </div>

        <div className="RS_OverallLoadingPane RS_OverallLoadingPane--detail">
          <div className="RS_LoadingHeroSkeleton">
            <span className="RS_LoadSkeleton RS_LoadSkeleton--vehicle" />
            <div>
              <span className="RS_LoadSkeleton RS_LoadSkeleton--detailTitle" />
              <span className="RS_LoadSkeleton RS_LoadSkeleton--detailSub" />
            </div>
          </div>

          <div className="RS_LoadSkeleton RS_LoadSkeleton--timeline" />

          <div className="RS_LoadingCards">
            <span className="RS_LoadSkeleton RS_LoadSkeleton--card" />
            <span className="RS_LoadSkeleton RS_LoadSkeleton--card" />
            <span className="RS_LoadSkeleton RS_LoadSkeleton--card" />
          </div>

          <div className="RS_LoadSkeleton RS_LoadSkeleton--report" />
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function MyBookingsPage() {
  const router = useRouter();

  const {
    user,
    token,
    authLoading,
    openAuth,
  } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);

  const [bookingsLoading, setBookingsLoading] =
    useState(true);

  const [bookingsError, setBookingsError] =
    useState("");

  const [activeTab, setActiveTab] =
    useState<StatusFilter>("All");

  const [searchValue, setSearchValue] = useState("");

  const [sortMode, setSortMode] =
    useState<SortMode>("newest");

  const [sortOpen, setSortOpen] = useState(false);

  const sortRef = useRef<HTMLDivElement>(null);

  /* Paired-column refs.
     The Campaign Request page uses measured sticky offsets so the shorter
     column waits while the taller column continues with the page scroll.
     My Bookings now follows the same pattern without creating nested
     scrollbars or touching any booking/tracking API logic. */
  const dashboardShellRef = useRef<HTMLElement | null>(null);

  const bookingsPaneRef = useRef<HTMLDivElement | null>(null);

  const detailPaneRef = useRef<HTMLElement | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  const [
    selectedBookingId,
    setSelectedBookingId,
  ] = useState<string | null>(null);

  const [
    activeBookingId,
    setActiveBookingId,
  ] = useState<string | null>(null);

  /* Tracks which booking rows the scroll-reveal IntersectionObserver has
     already revealed, keyed by booking id. Kept in React state (not just
     an imperative classList.add) because BookingRow's className is
     recomputed from `isActive` on every click — without this, React's
     reconciliation would overwrite the imperatively-added class and the
     row would snap back to its pre-reveal (invisible) state the moment
     a different booking became active. */
  const [revealedBookingIds, setRevealedBookingIds] = useState<Set<string>>(
    new Set(),
  );

  const [detailLoading, setDetailLoading] =
    useState(false);

  const [detailError, setDetailError] =
    useState("");

  const [
    downloadingBookingId,
    setDownloadingBookingId,
  ] = useState<string | null>(null);

  const [
    downloadedBookingId,
    setDownloadedBookingId,
  ] = useState<string | null>(null);

  const downloadFeedbackTimerRef =
    useRef<number | null>(null);

  const PAGE_SIZE = 5;

  /* =========================================================
     LOAD BOOKINGS
  ========================================================= */

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      openAuth("login");
      setBookingsLoading(false);
      return;
    }

    let active = true;

    async function loadBookings() {
      try {
        setBookingsLoading(true);
        setBookingsError("");

        const response = await fetch(
          `${baseUrl}/client-requests/mine`,
          {
            cache: "no-store",

            headers: clientAuthHeaders(token),
          },
        );

        const result = await response
          .json()
          .catch(() => null);

        if (!response.ok || !result?.success) {
          throw new Error(
            result?.message ||
            "Unable to load your bookings.",
          );
        }

        if (!active) return;

        const mappedBookings = (
          (result.data as ClientRequestRaw[]) || []
        ).map(mapClientRequestToBooking);

        setBookings(mappedBookings);

        setActiveBookingId((current) => {
          if (
            current &&
            mappedBookings.some((booking) => booking.id === current)
          ) {
            return current;
          }

          return mappedBookings[0]?.id || null;
        });
      } catch (error) {
        if (!active) return;

        setBookingsError(
          error instanceof Error
            ? error.message
            : "Unable to load your bookings.",
        );
      } finally {
        if (active) {
          setBookingsLoading(false);
        }
      }
    }

    loadBookings();

    return () => {
      active = false;
    };
  }, [
    user,
    token,
    authLoading,
    openAuth,
  ]);

  /* =========================================================
     SORT MENU CLICK OUTSIDE
  ========================================================= */

  useEffect(() => {
    if (!sortOpen) return;

    function handleOutside(event: MouseEvent) {
      if (
        sortRef.current &&
        !sortRef.current.contains(event.target as Node)
      ) {
        setSortOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutside,
      );
    };
  }, [sortOpen]);

  /* =========================================================
     STATUS COUNTS
  ========================================================= */

  const statusCounts = useMemo(() => {
    return {
      All: bookings.length,

      Confirmed: bookings.filter(
        (booking) => booking.status === "Confirmed",
      ).length,

      "In Progress": bookings.filter(
        (booking) => booking.status === "In Progress",
      ).length,

      Pending: bookings.filter(
        (booking) => booking.status === "Pending",
      ).length,

      Cancelled: bookings.filter(
        (booking) => booking.status === "Cancelled",
      ).length,
    };
  }, [bookings]);

  /* =========================================================
     FILTER + SEARCH + SORT
  ========================================================= */

  const filteredBookings = useMemo(() => {
    let result = bookings.filter((booking) => {
      const matchesStatus =
        activeTab === "All" ||
        booking.status === activeTab;

      const query = searchValue
        .trim()
        .toLowerCase();

      const matchesSearch =
        !query ||
        booking.id.toLowerCase().includes(query) ||
        booking.campaignName
          .toLowerCase()
          .includes(query) ||
        booking.location.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });

    switch (sortMode) {
      case "oldest":
        result = [...result].sort(
          (a, b) =>
            new Date(a.requestedAt).getTime() -
            new Date(b.requestedAt).getTime(),
        );

        break;

      case "highest":
        result = [...result].sort(
          (a, b) =>
            b.estimatedTotal - a.estimatedTotal,
        );

        break;

      case "lowest":
        result = [...result].sort(
          (a, b) =>
            a.estimatedTotal - b.estimatedTotal,
        );

        break;

      case "newest":
      default:
        result = [...result].sort(
          (a, b) =>
            new Date(b.requestedAt).getTime() -
            new Date(a.requestedAt).getTime(),
        );

        break;
    }

    return result;
  }, [
    bookings,
    activeTab,
    searchValue,
    sortMode,
  ]);

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBookings.length / PAGE_SIZE),
  );

  const safePage = Math.min(
    currentPage,
    totalPages,
  );

  const visibleBookings = filteredBookings.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const selectedBooking =
    bookings.find(
      (booking) => booking.id === selectedBookingId,
    ) || null;

  const activeBooking =
    bookings.find(
      (booking) => booking.id === activeBookingId,
    ) || null;

  const activeMongoId = activeBooking?.mongoId || null;

  /* =========================================================
     KEEP ACTIVE SELECTION INSIDE CURRENT FILTER RESULT
  ========================================================= */

  useEffect(() => {
    if (filteredBookings.length === 0) {
      setActiveBookingId(null);
      return;
    }

    if (
      !activeBookingId ||
      !filteredBookings.some(
        (booking) => booking.id === activeBookingId,
      )
    ) {
      setActiveBookingId(filteredBookings[0].id);
    }
  }, [filteredBookings, activeBookingId]);

  /* =========================================================
     REFRESH SELECTED BOOKING DETAILS

     Reuses the existing authenticated client-request detail API.
     This updates journeyStage/onRoad/booking fields on the dashboard
     without creating a second manually maintained client status.
  ========================================================= */

  useEffect(() => {
    if (!user || !activeMongoId) {
      setDetailLoading(false);
      setDetailError("");
      return;
    }

    let active = true;
    let firstLoad = true;

    async function refreshActiveBooking() {
      if (firstLoad) {
        setDetailLoading(true);
      }

      setDetailError("");

      try {
        const response = await fetch(
          `${baseUrl}/client-requests/${activeMongoId}`,
          {
            method: "GET",
            cache: "no-store",
            headers: clientAuthHeaders(token),
          },
        );

        const result = await response
          .json()
          .catch(() => null);

        if (
          !response.ok ||
          !result?.success ||
          !result?.data
        ) {
          throw new Error(
            result?.message ||
            "Unable to refresh campaign details.",
          );
        }

        if (!active) return;

        const mapped = mapClientRequestToBooking(result.data);

        setBookings((currentBookings) =>
          currentBookings.map((booking) =>
            booking.mongoId === mapped.mongoId
              ? { ...booking, ...mapped }
              : booking,
          ),
        );
      } catch (error) {
        if (!active) return;

        setDetailError(
          error instanceof Error
            ? error.message
            : "Unable to refresh campaign details.",
        );
      } finally {
        if (active && firstLoad) {
          setDetailLoading(false);
        }

        firstLoad = false;
      }
    }

    refreshActiveBooking();

    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        refreshActiveBooking();
      }
    }, 30000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [user, token, activeMongoId]);

  /* =========================================================
     PAIRED LEFT / RIGHT COLUMN SCROLLING

     This deliberately does NOT rely on CSS position:sticky. The site can
     run inside GSAP ScrollSmoother, which moves a wrapper with transforms;
     native sticky can become unreliable inside a transformed scroll tree.

     Instead we reproduce the Campaign Request behavior with a lightweight
     translateY that follows the real page scroll:

     - shorter pane reaches the navbar and waits there;
     - taller pane keeps travelling through all of its own content;
     - if a pane is taller than the viewport, it is allowed to travel until
       its bottom reaches the viewport bottom before it waits;
     - when both pane heights are effectively equal, neither is translated,
       so both move together;
     - there is no nested scroll container and therefore no pane scrollbar.
  ========================================================= */

  useEffect(() => {
    const shell = dashboardShellRef.current;
    const leftPane = bookingsPaneRef.current;
    const rightPane = detailPaneRef.current;

    if (!shell || !leftPane || !rightPane) return;

    const DESKTOP_MIN_WIDTH = 1366;
    const TOP_GAP = 112;
    const BOTTOM_GAP = 24;
    const SAME_HEIGHT_TOLERANCE = 12;

    let frameId = 0;
    let shellTop = 0;
    let shellHeight = 0;
    let leftHeight = 0;
    let rightHeight = 0;

    const resetPane = (pane: HTMLElement) => {
      pane.style.transform = "";
      pane.style.willChange = "";
      pane.style.zIndex = "";
    };

    const resetAll = () => {
      resetPane(leftPane);
      resetPane(rightPane);
    };

    const calculateTranslate = (paneHeight: number) => {
      const viewportHeight = window.innerHeight;

      const paneOverflowsViewport =
        paneHeight + TOP_GAP + BOTTOM_GAP > viewportHeight;

      /*
        Short pane: hold its top below the navbar.
        Tall pane: do not hold it until its bottom reaches the viewport's
        bottom edge. This is the same negative-top idea used in Campaign
        Request, expressed as a transform so it also works with ScrollSmoother.
      */
      const desiredViewportTop = paneOverflowsViewport
        ? viewportHeight - paneHeight - BOTTOM_GAP
        : TOP_GAP;

      const wanted =
        window.scrollY + desiredViewportTop - shellTop;

      const maximum = Math.max(0, shellHeight - paneHeight);

      return Math.max(0, Math.min(wanted, maximum));
    };

    const apply = () => {
      frameId = 0;

      if (window.innerWidth < DESKTOP_MIN_WIDTH) {
        resetAll();
        return;
      }

      /* Equal content heights should simply move together. */
      if (
        Math.abs(leftHeight - rightHeight) <=
        SAME_HEIGHT_TOLERANCE
      ) {
        leftPane.style.transform = "translate3d(0, 0, 0)";
        rightPane.style.transform = "translate3d(0, 0, 0)";
        return;
      }

      const leftTranslate = calculateTranslate(leftHeight);
      const rightTranslate = calculateTranslate(rightHeight);

      leftPane.style.transform =
        `translate3d(0, ${leftTranslate}px, 0)`;
      rightPane.style.transform =
        `translate3d(0, ${rightTranslate}px, 0)`;
    };

    const requestApply = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(apply);
    };

    const measure = () => {
      if (window.innerWidth < DESKTOP_MIN_WIDTH) {
        resetAll();
        return;
      }

      /* offsetHeight is unaffected by our transforms. */
      leftHeight = leftPane.offsetHeight;
      rightHeight = rightPane.offsetHeight;
      shellHeight = shell.offsetHeight;

      /*
        getBoundingClientRect + scrollY gives the document position both in
        native scrolling and when ScrollSmoother visually translates the
        content wrapper.
      */
      shellTop = shell.getBoundingClientRect().top + window.scrollY;

      leftPane.style.willChange = "transform";
      rightPane.style.willChange = "transform";
      leftPane.style.zIndex = "1";
      rightPane.style.zIndex = "1";

      requestApply();
    };

    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(shell);
    resizeObserver.observe(leftPane);
    resizeObserver.observe(rightPane);

    window.addEventListener("scroll", requestApply, { passive: true });
    window.addEventListener("resize", measure);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      resizeObserver.disconnect();
      window.removeEventListener("scroll", requestApply);
      window.removeEventListener("resize", measure);

      resetAll();
    };
  }, [
    activeBookingId,
    bookingsLoading,
    visibleBookings.length,
    filteredBookings.length,
  ]);

  /* =========================================================
     SCROLL REVEAL
  ========================================================= */

  useEffect(() => {
    if (typeof window === "undefined") return;

    const elements =
      document.querySelectorAll<HTMLElement>(
        ".RS_Reveal",
      );

    function markRevealed(element: HTMLElement) {
      element.classList.add("RS_IsVisible");

      const revealId = element.getAttribute("data-reveal-id");

      if (revealId) {
        setRevealedBookingIds((current) =>
          current.has(revealId)
            ? current
            : new Set(current).add(revealId),
        );
      }
    }

    if (!("IntersectionObserver" in window)) {
      elements.forEach(markRevealed);

      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          markRevealed(entry.target as HTMLElement);

          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.08,

        rootMargin: "0px 0px -30px 0px",
      },
    );

    elements.forEach((element) => {
      if (!element.classList.contains("RS_IsVisible")) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [
    visibleBookings.length,
    activeTab,
    safePage,
    searchValue,
    sortMode,
  ]);

  /* =========================================================
     DOWNLOAD FEEDBACK TIMER CLEANUP
  ========================================================= */

  useEffect(() => {
    return () => {
      if (downloadFeedbackTimerRef.current) {
        window.clearTimeout(downloadFeedbackTimerRef.current);
      }
    };
  }, []);

  /* =========================================================
     HANDLERS
  ========================================================= */

  function handleSelectBooking(bookingId: string) {
    setActiveBookingId(bookingId);

    if (typeof window === "undefined") return;

    /*
      Compact desktop/tablet layout stacks the selected campaign below
      the booking list. Scroll there after an intentional booking click.
      Large desktop keeps the side-by-side dashboard and does not move
      the page unexpectedly.
    */
    if (window.matchMedia("(max-width: 1399px)").matches) {
      window.setTimeout(() => {
        detailPaneRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 90);
    }
  }

  function handleTabChange(tab: StatusFilter) {
    setActiveTab(tab);
    setCurrentPage(1);
  }

  async function handleDownloadSummary(mongoId: string) {
    if (!mongoId || downloadingBookingId) return;

    if (downloadFeedbackTimerRef.current) {
      window.clearTimeout(downloadFeedbackTimerRef.current);
    }

    setDownloadedBookingId(null);
    setDownloadingBookingId(mongoId);

    try {
      /*
        Fetch the complete booking request before generating the PDF.

        The list view only contains mapped/summary booking data, while the
        PDF needs the complete request payload (customer/GST/campaign/
        vehicle pricing details). This keeps the download identical to the
        Thank You page and avoids navigating to /view-summary.
      */
      const response = await fetch(
        `${baseUrl}/client-requests/${mongoId}`,
        {
          method: "GET",
          cache: "no-store",
          headers: clientAuthHeaders(token),
        },
      );

      const result = await response
        .json()
        .catch(() => null);

      if (!response.ok || !result?.success || !result?.data) {
        throw new Error(
          result?.message ||
          "Unable to prepare the booking summary.",
        );
      }

      await Promise.resolve(
        downloadBookingSummaryPdf(result.data),
      );

      setDownloadedBookingId(mongoId);

      downloadFeedbackTimerRef.current =
        window.setTimeout(() => {
          setDownloadedBookingId((current) =>
            current === mongoId ? null : current,
          );
        }, 1800);
    } catch (error) {
      console.error(
        "Unable to download booking summary:",
        error,
      );

      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to generate the booking summary PDF. Please try again.",
      );
    } finally {
      setDownloadingBookingId((current) =>
        current === mongoId ? null : current,
      );
    }
  }

  function handleCancelBooking() {
    if (!selectedBooking) return;

    const shouldCancel = window.confirm(
      `Are you sure you want to cancel ${selectedBooking.id}?`,
    );

    if (!shouldCancel) return;

    /*
      Currently local-only.

      Once your backend cancellation endpoint is available,
      replace this local state update with the API call.
    */

    setBookings((currentBookings) =>
      currentBookings.map((booking) =>
        booking.id === selectedBooking.id
          ? {
            ...booking,
            status: "Cancelled",
            isCancelled: true,
          }
          : booking,
      ),
    );
  }

  /* Initial page refresh/load uses one dashboard-level loading state.
     Background refreshes of the selected booking keep the existing content
     visible and therefore do not flash section-by-section loading messages. */
  const isOverallLoading =
    authLoading || Boolean(user && bookingsLoading);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      <main className="RS_MyBookingsRoot">
        <div className="RS_MyBookingsContainer">
          {isOverallLoading ? (
            <OverallDashboardLoading />
          ) : (
          <section ref={dashboardShellRef} className="RS_DashboardShell">
            {/* =================================================
                LEFT — BOOKINGS LIST
            ================================================= */}

            <div
              ref={bookingsPaneRef}
              className="RS_BookingsPane"
            >
              <header className="RS_PageHeader RS_Reveal">
                <h1>My Bookings</h1>
                <p>View and manage all your vehicle booking requests.</p>
                <div className="RS_PageGuide">
                  <span>1</span> Select a booking
                  <i />
                  <span>2</span> Review campaign status
                  <i />
                  <span>3</span> Open live tracking
                </div>
              </header>

              <section className="RS_StatsPanel RS_Reveal">
                <StatItem
                  icon={CalendarDays}
                  label="Total Bookings"
                  value={statusCounts.All}
                  tone="red"
                  isActive={activeTab === "All"}
                  onClick={() => handleTabChange("All")}
                />
                <StatItem
                  icon={CheckCircle2}
                  label="Confirmed"
                  value={statusCounts.Confirmed}
                  tone="green"
                  isActive={activeTab === "Confirmed"}
                  onClick={() => handleTabChange("Confirmed")}
                />
                <StatItem
                  icon={Clock3}
                  label="In Progress"
                  value={statusCounts["In Progress"]}
                  tone="blue"
                  isActive={activeTab === "In Progress"}
                  onClick={() => handleTabChange("In Progress")}
                />
                <StatItem
                  icon={Hourglass}
                  label="Pending"
                  value={statusCounts.Pending}
                  tone="orange"
                  isActive={activeTab === "Pending"}
                  onClick={() => handleTabChange("Pending")}
                />
                <StatItem
                  icon={XCircle}
                  label="Cancelled"
                  value={statusCounts.Cancelled}
                  tone="red"
                  isActive={activeTab === "Cancelled"}
                  onClick={() => handleTabChange("Cancelled")}
                />
              </section>

              <section className="RS_ControlBar RS_Reveal">
                <label className="RS_SearchField">
                  <Search size={17} strokeWidth={1.8} />
                  <input
                    type="search"
                    value={searchValue}
                    placeholder="Search by Booking ID, Campaign or Location..."
                    onChange={(event) => {
                      setSearchValue(event.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </label>

                <div className="RS_SortWrapper" ref={sortRef}>
                  <button
                    type="button"
                    className="RS_SortButton"
                    onClick={() => setSortOpen((current) => !current)}
                  >
                    <SlidersHorizontal size={15} strokeWidth={1.8} />
                    <span>Sort by</span>
                    <ChevronDown size={14} strokeWidth={1.8} />
                  </button>

                  {sortOpen && (
                    <div className="RS_SortMenu">
                      {SORT_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className={
                            sortMode === option.value
                              ? "RS_SortMenuActive"
                              : ""
                          }
                          onClick={() => {
                            setSortMode(option.value as SortMode);
                            setCurrentPage(1);
                            setSortOpen(false);
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {(activeTab !== "All" ||
                searchValue.trim() ||
                sortMode !== "newest") && (
                <div className="RS_ActiveFilters RS_Reveal">
                  <span className="RS_ActiveFiltersLabel">Filters:</span>

                  {activeTab !== "All" && (
                    <button
                      type="button"
                      className="RS_FilterChip"
                      onClick={() => handleTabChange("All")}
                    >
                      Status: {activeTab}
                      <X size={12} strokeWidth={2.2} />
                    </button>
                  )}

                  {searchValue.trim() && (
                    <button
                      type="button"
                      className="RS_FilterChip"
                      onClick={() => {
                        setSearchValue("");
                        setCurrentPage(1);
                      }}
                    >
                      Search: "{searchValue.trim()}"
                      <X size={12} strokeWidth={2.2} />
                    </button>
                  )}

                  {sortMode !== "newest" && (
                    <button
                      type="button"
                      className="RS_FilterChip"
                      onClick={() => {
                        setSortMode("newest");
                        setCurrentPage(1);
                      }}
                    >
                      Sort:{" "}
                      {
                        SORT_OPTIONS.find(
                          (option) => option.value === sortMode,
                        )?.label
                      }
                      <X size={12} strokeWidth={2.2} />
                    </button>
                  )}

                  <button
                    type="button"
                    className="RS_ClearAllFilters"
                    onClick={() => {
                      handleTabChange("All");
                      setSearchValue("");
                      setSortMode("newest");
                      setActiveBookingId(null);
                    }}
                  >
                    Clear all
                  </button>
                </div>
              )}

              <section className="RS_BookingsArea">
                {!user ? (
                  <div className="RS_StateCard">
                    <UserRound size={28} strokeWidth={1.6} />
                    <strong>Sign in to view your bookings</strong>
                    <p>Your booking history is linked to your registered account.</p>
                    <BubbleButton
                      variant="dark"
                      className="RS_StateButton"
                      onClick={() => openAuth("login")}
                    >
                      Sign In
                    </BubbleButton>
                  </div>
                ) : bookingsError ? (
                  <div className="RS_StateCard">
                    <XCircle size={30} strokeWidth={1.6} />
                    <strong>Unable to load your bookings</strong>
                    <p>{bookingsError}</p>
                  </div>
                ) : visibleBookings.length > 0 ? (
                  <div className="RS_BookingsList">
                    {visibleBookings.map((booking) => (
                      <BookingRow
                        key={booking.id}
                        booking={booking}
                        isActive={activeBookingId === booking.id}
                        isRevealed={revealedBookingIds.has(booking.id)}
                        onSelect={() => handleSelectBooking(booking.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="RS_StateCard RS_Reveal">
                    <Search size={30} strokeWidth={1.5} />
                    <strong>No bookings found</strong>
                    <p>Try changing your search, filter or status selection.</p>

                    {(activeTab !== "All" ||
                      searchValue.trim() ||
                      sortMode !== "newest") && (
                      <BubbleButton
                        variant="dark"
                        className="RS_StateButton"
                        onClick={() => {
                          setActiveTab("All");
                          setSearchValue("");
                          setSortMode("newest");
                          setCurrentPage(1);
                          setActiveBookingId(null);
                        }}
                      >
                        Clear Filters
                      </BubbleButton>
                    )}
                  </div>
                )}
              </section>

              {!bookingsLoading &&
                !bookingsError &&
                user &&
                filteredBookings.length > 0 && (
                  <footer className="RS_Pagination RS_Reveal">
                    <p>
                      Showing{" "}
                      {visibleBookings.length === 0
                        ? 0
                        : (safePage - 1) * PAGE_SIZE + 1}{" "}
                      to{" "}
                      {Math.min(
                        safePage * PAGE_SIZE,
                        filteredBookings.length,
                      )}{" "}
                      of {filteredBookings.length} bookings
                    </p>

                    <div className="RS_PaginationControls">
                      <button
                        type="button"
                        aria-label="Previous page"
                        disabled={safePage === 1}
                        onClick={() =>
                          setCurrentPage((current) =>
                            Math.max(1, current - 1),
                          )
                        }
                      >
                        <ChevronLeft size={16} strokeWidth={1.8} />
                      </button>

                      {Array.from(
                        { length: totalPages },
                        (_, index) => index + 1,
                      ).map((pageNumber) => (
                        <button
                          key={pageNumber}
                          type="button"
                          className={
                            safePage === pageNumber
                              ? "RS_PageActive"
                              : ""
                          }
                          onClick={() => setCurrentPage(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      ))}

                      <button
                        type="button"
                        aria-label="Next page"
                        disabled={safePage === totalPages}
                        onClick={() =>
                          setCurrentPage((current) =>
                            Math.min(totalPages, current + 1),
                          )
                        }
                      >
                        <ChevronRight size={16} strokeWidth={1.8} />
                      </button>
                    </div>
                  </footer>
                )}
            </div>

            {/* =================================================
                RIGHT — SELECTED CAMPAIGN DASHBOARD
            ================================================= */}

            {activeBooking ? (
              <CampaignDashboard
                key={activeBooking.id}
                booking={activeBooking}
                detailPaneRef={detailPaneRef}
                detailLoading={detailLoading}
                detailError={detailError}
                onOpenDetails={() => setSelectedBookingId(activeBooking.id)}
                onDownload={() =>
                  handleDownloadSummary(activeBooking.mongoId)
                }
                onTrack={() =>
                  router.push(
                    `/roadshow/my-bookings/${activeBooking.mongoId}`,
                  )
                }
                isDownloadingSummary={
                  downloadingBookingId === activeBooking.mongoId
                }
                isSummaryDownloaded={
                  downloadedBookingId === activeBooking.mongoId
                }
              />
            ) : (
              <aside ref={detailPaneRef} className="RS_TrackingPane RS_TrackingPane--empty">
                <MapPinned size={34} strokeWidth={1.5} />
                <strong>Select a booking</strong>
                <p>
                  Choose a booking from the list to see campaign progress,
                  vehicles and tracking access.
                </p>
              </aside>
            )}
          </section>
          )}

          {/* <HowItWorks /> */}
        </div>
      </main>

      {/* =====================================================
          EXISTING DETAILS MODAL — FUNCTIONALITY PRESERVED
      ===================================================== */}

      {selectedBooking && (
        <BookingModal
          booking={selectedBooking}
          onClose={() => setSelectedBookingId(null)}
          onCancel={handleCancelBooking}
          onViewSummary={() =>
            handleDownloadSummary(selectedBooking.mongoId)
          }
          isDownloadingSummary={
            downloadingBookingId === selectedBooking.mongoId
          }
          isSummaryDownloaded={
            downloadedBookingId === selectedBooking.mongoId
          }
        />
      )}
    </>
  );
}
