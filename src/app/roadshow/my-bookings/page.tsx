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
import { ScrollSmoother } from "gsap/ScrollSmoother";
import "./page.css";

import { baseUrl } from "../../../BaseUrl";
import { useAuth } from "@/context/AuthContext";

/* =========================================================
   UPDATE VEHICLE IMAGE PATH HERE
========================================================= */

const VEHICLE_IMAGE =
  "/images/assets/full side LED edited (1)_NEW.png";

/* =========================================================
   TYPES
========================================================= */

type BookingStatus =
  | "Pending"
  | "Confirmed"
  | "Ongoing"
  | "Completed"
  | "Cancelled";

type StatusFilter = "All" | BookingStatus;

type SortMode =
  | "newest"
  | "oldest"
  | "highest"
  | "lowest";

type Vehicle = {
  name: string;
  startDate: string;
  endDate: string;
  duration: string;
  quantity: number;
  ratePerDay: number;
  total: number;
};

type Booking = {
  id: string;
  status: BookingStatus;
  requestedOn: string;
  requestedAt: string;
  startDate: string;
  endDate: string;
  duration: string;
  vehicleTypes: number;
  vehicleCount: number;
  estimatedTotal: number;

  customer: {
    name: string;
    company: string;
    phone: string;
    email: string;
  };

  vehicles: Vehicle[];
};

type IconName =
  | "search"
  | "filter"
  | "calendar"
  | "clock"
  | "vehicle"
  | "chevronRight"
  | "close"
  | "download"
  | "trash"
  | "user"
  | "company"
  | "phone"
  | "mail"
  | "support"
  | "send"
  | "arrowLeft"
  | "arrowRight";

/* =========================================================
   FILLED ICONS
========================================================= */

function FilledIcon({
  name,
  size = 18,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const paths: Record<IconName, string> = {
    search:
      "M10.5 3a7.5 7.5 0 1 0 4.67 13.37l4.23 4.23 1.42-1.42-4.23-4.23A7.5 7.5 0 0 0 10.5 3Zm0 2a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11Z",

    filter:
      "M3.2 4h17.6a1.2 1.2 0 0 1 .92 1.97L15 13.8v5.1a1.2 1.2 0 0 1-.66 1.07l-3.2 1.6A1.2 1.2 0 0 1 9.4 20.5v-6.7L2.28 5.97A1.2 1.2 0 0 1 3.2 4Z",

    calendar:
      "M7 2h2v2h6V2h2v2h2a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2V2Zm12 8H5v9h14v-9Z",

    clock:
      "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 5v4.59l3.2 3.2-1.41 1.42L11 12.41V7h2Z",

    vehicle:
      "M5 4h11a3 3 0 0 1 3 3v2h1a2 2 0 0 1 2 2v6h-2.17a3 3 0 0 1-5.66 0H9.83a3 3 0 0 1-5.66 0H2V7a3 3 0 0 1 3-3Zm0 2a1 1 0 0 0-1 1v5h13V7a1 1 0 0 0-1-1H5Zm2 9.5A1.5 1.5 0 1 0 7 18.5a1.5 1.5 0 0 0 0-3Zm10 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z",

    chevronRight:
      "M9 5.5 15.5 12 9 18.5l1.5 1.5 8-8-8-8L9 5.5Z",

    close:
      "m6.7 5.3 5.3 5.3 5.3-5.3 1.4 1.4-5.3 5.3 5.3 5.3-1.4 1.4-5.3-5.3-5.3 5.3-1.4-1.4 5.3-5.3-5.3-5.3 1.4-1.4Z",

    download:
      "M11 3h2v9.17l3.59-3.58L18 10l-6 6-6-6 1.41-1.41L11 12.17V3Zm-6 15h14v3H5v-3Z",

    trash:
      "M8 3h8l1 2h4v2H3V5h4l1-2Zm-2 6h12l-1 12H7L6 9Zm3 2v7h2v-7H9Zm4 0v7h2v-7h-2Z",

    user:
      "M12 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 12c5.33 0 8 2.67 8 6v2H4v-2c0-3.33 2.67-6 8-6Z",

    company:
      "M4 3h10v18H4V3Zm12 6h4v12h-4V9ZM7 6v2h2V6H7Zm0 4v2h2v-2H7Zm0 4v2h2v-2H7Zm4-8v2h2V6h-2Zm0 4v2h2v-2h-2Zm0 4v2h2v-2h-2Z",

    phone:
      "M6.6 2.7 9.2 7l-2.1 2.1c1.2 2.5 3.2 4.5 5.7 5.7l2.1-2.1 4.4 2.6c.5.3.8.9.6 1.5l-.7 3c-.2.7-.8 1.2-1.5 1.2C9.6 21 3 14.4 3 6.3c0-.7.5-1.3 1.2-1.5l3-.7c.6-.2 1.2.1 1.5.6Z",

    mail:
      "M3 5h18v14H3V5Zm2 2v.3l7 4.7 7-4.7V7H5Zm14 10V9.7l-7 4.7-7-4.7V17h14Z",

    support:
      "M12 2a9 9 0 0 0-9 9v7a3 3 0 0 0 3 3h3v-8H5v-2a7 7 0 1 1 14 0v2h-4v8h3a3 3 0 0 0 3-3v-7a9 9 0 0 0-9-9Z",

    send:
      "M2.5 3.5 22 12 2.5 20.5 5 13l10-1-10-1-2.5-7.5Z",

    arrowLeft:
      "M14.5 5 7.5 12l7 7 1.5-1.5-5.5-5.5 5.5-5.5L14.5 5Z",

    arrowRight:
      "M9.5 5 16.5 12l-7 7L8 17.5l5.5-5.5L8 6.5 9.5 5Z",
  };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="currentColor"
    >
      <path d={paths[name]} />
    </svg>
  );
}

/* =========================================================
   UI CONFIGURATION
========================================================= */

const tabs: StatusFilter[] = [
  "All",
  "Pending",
  "Confirmed",
  "Ongoing",
  "Completed",
  "Cancelled",
];

const statusStyles: Record<
  BookingStatus,
  {
    badge: string;
    label: string;
    dot: string;
  }
> = {
  Pending: {
    badge: "bg-[#FFF0E8] text-[#B75B22]",
    label: "Pending Confirmation",
    dot: "bg-[#D86C2C]",
  },

  Confirmed: {
    badge: "bg-[#EDF7EF] text-[#357A45]",
    label: "Booking Confirmed",
    dot: "bg-[#4A9459]",
  },

  Ongoing: {
    badge: "bg-[#EDF2FA] text-[#4D6687]",
    label: "Campaign Ongoing",
    dot: "bg-[#647D9F]",
  },

  Completed: {
    badge: "bg-[#EFEFF2] text-[#626269]",
    label: "Campaign Completed",
    dot: "bg-[#7C7C83]",
  },

  Cancelled: {
    badge: "bg-[#FCEBED] text-[#B31C28]",
    label: "Request Cancelled",
    dot: "bg-[#C92936]",
  },
};

function formatINR(value: number) {
  return `₹ ${value.toLocaleString("en-IN")}`;
}

function formatBookingDate(value?: string) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

type ClientRequestVehicleRaw = {
  vehicleName?: string;
  vehicleType?: { name?: string } | string | null;
  quantity?: number;
  fromDate?: string;
  toDate?: string;
  totalDays?: number;
  pricePerDay?: number;
  lineTotal?: number;
};

type ClientRequestRaw = {
  _id: string;
  clientOrderId?: string;
  status?: string;
  createdAt?: string;
  estimatedTotal?: number;
  name?: string;
  companyName?: string;
  phone?: string;
  email?: string;
  vehicleTypes?: ClientRequestVehicleRaw[];
};

/* Maps the backend's client-requests shape onto the Booking type this
   page already renders, so the existing card/modal/filter/PDF UI below
   doesn't need to change. */
function mapClientRequestToBooking(request: ClientRequestRaw): Booking {
  const vehicleTypes = Array.isArray(request.vehicleTypes)
    ? request.vehicleTypes
    : [];

  return {
    id: request.clientOrderId || request._id,
    // TODO: confirm the real status values client-requests returns
    // (set via PATCH client-requests/:id/status) and map them onto
    // BookingStatus instead of defaulting everything to "Pending".
    status: (request.status as BookingStatus) || "Pending",
    requestedOn: formatBookingDate(request.createdAt),
    requestedAt: request.createdAt || "",
    startDate: formatBookingDate(vehicleTypes[0]?.fromDate),
    endDate: formatBookingDate(vehicleTypes[0]?.toDate),
    duration: vehicleTypes[0]?.totalDays
      ? `${vehicleTypes[0].totalDays} Days`
      : "-",
    vehicleTypes: vehicleTypes.length,
    vehicleCount: vehicleTypes.reduce(
      (sum: number, vehicle) => sum + (vehicle.quantity || 0),
      0,
    ),
    estimatedTotal: request.estimatedTotal || 0,

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
          : undefined) ||
        "Roadshow Vehicle",
      startDate: formatBookingDate(vehicle.fromDate),
      endDate: formatBookingDate(vehicle.toDate),
      duration: vehicle.totalDays ? `${vehicle.totalDays} Days` : "-",
      quantity: vehicle.quantity || 0,
      ratePerDay: vehicle.pricePerDay || 0,
      total: vehicle.lineTotal || 0,
    })),
  };
}

/* jsPDF's standard fonts (Helvetica/Times/Courier) use
   WinAnsi encoding and cannot render the ₹ glyph, so the
   PDF summary uses "INR" instead to avoid a broken character. */
function formatINRForPdf(value: number) {
  return `INR ${value.toLocaleString("en-IN")}`;
}

/* =========================================================
   ANIMATED ROADSHOW BUTTON
========================================================= */

type BubbleButtonVariant =
  | "light"
  | "white"
  | "dark"
  | "danger";

type BubbleButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  children: ReactNode;
  variant?: BubbleButtonVariant;
  contentClassName?: string;
};

function BubbleButton({
  children,
  variant = "light",
  className = "",
  contentClassName = "",
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
      transform: "scale(0)",
      opacity: 0,
    });

  function moveBubble(
    event: ReactMouseEvent<HTMLButtonElement>,
  ) {
    if (disabled) return;

    const rect =
      event.currentTarget.getBoundingClientRect();

    const size =
      Math.hypot(rect.width, rect.height) * 2;

    setBubbleStyle({
      width: size,
      height: size,
      left:
        event.clientX -
        rect.left -
        size / 2,
      top:
        event.clientY -
        rect.top -
        size / 2,
      transform: "scale(1)",
      opacity: 1,
    });
  }

  function hideBubble() {
    setBubbleStyle((current) => ({
      ...current,
      transform: "scale(0)",
      opacity: 0,
    }));
  }

  function showBubbleFromCenter(
    button: HTMLButtonElement,
  ) {
    if (disabled) return;

    const rect =
      button.getBoundingClientRect();

    const size =
      Math.hypot(rect.width, rect.height) * 2;

    setBubbleStyle({
      width: size,
      height: size,
      left:
        rect.width / 2 -
        size / 2,
      top:
        rect.height / 2 -
        size / 2,
      transform: "scale(1)",
      opacity: 1,
    });
  }

  return (
    <button
      {...buttonProps}
      type={buttonProps.type ?? "button"}
      disabled={disabled}
      onMouseEnter={(event) => {
        moveBubble(event);
        onMouseEnter?.(event);
      }}
      onMouseMove={(event) => {
        moveBubble(event);
        onMouseMove?.(event);
      }}
      onMouseLeave={(event) => {
        hideBubble();
        onMouseLeave?.(event);
      }}
      onFocus={(event) => {
        showBubbleFromCenter(
          event.currentTarget,
        );
        onFocus?.(event);
      }}
      onBlur={(event) => {
        hideBubble();
        onBlur?.(event);
      }}
      className={`RS_VehicleButton RS_VehicleButton--${variant} ${className}`}
    >
      <span
        aria-hidden="true"
        className="RS_BtnBubble"
        style={bubbleStyle}
      />

      <span
        className={`RS_BtnContent ${contentClassName}`}
      >
        {children}
      </span>
    </button>
  );
}

/* =========================================================
   SMALL REUSABLE DETAILS
========================================================= */

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#EFEFF2] text-[#5E5E66]">
        <FilledIcon
          name={icon}
          size={16}
        />
      </div>

      <div className="min-w-0 pt-0.5">
        <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#8A8A92]">
          {label}
        </p>

        <p className="mt-1 break-words text-[13px] font-semibold leading-5 text-[#202024]">
          {value}
        </p>
      </div>
    </div>
  );
}

function VehicleSmallDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-[0.04em] text-[#8A8A92]">
        {label}
      </p>

      <p className="mt-1 text-[12px] font-semibold text-[#303035]">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   BOOKING CARD
========================================================= */

function BookingCard({
  booking,
  onView,
}: {
  booking: Booking;
  onView: () => void;
}) {
  const style =
    statusStyles[booking.status];

  return (
    <article className="RS_BookingCard grid overflow-hidden rounded-[28px] bg-white/95 p-3 shadow-[0_14px_45px_rgba(31,31,38,0.055)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_55px_rgba(31,31,38,0.085)] md:grid-cols-[210px_minmax(0,1fr)]">
      <div className="RS_BookingCardMedia relative h-[170px] overflow-hidden rounded-[20px] bg-[#EFEFF2] md:h-full md:min-h-[155px]">
        <img
          src={VEHICLE_IMAGE}
          alt="Roadshow LED vehicle"
          className="RS_BookingCardImage h-full w-full object-cover"
        />

        <span
          className={`RS_StatusBadge absolute left-3 top-3 inline-flex items-center gap-2 rounded-full px-3 py-2 text-[11px] font-semibold shadow-sm ${style.badge}`}
        >
          <span
            className={`h-2 w-2 rounded-full ${style.dot}`}
          />

          {booking.status}
        </span>
      </div>

      <div className="RS_BookingCardBody grid min-w-0 gap-5 px-2 py-4 sm:px-5 md:grid-cols-2 md:gap-x-8 md:gap-y-6 xl:grid-cols-[220px_minmax(280px,1fr)_180px_150px] xl:items-center xl:gap-5">
        <div>
          <p className="RS_BookingLabel text-[10px] font-medium uppercase tracking-[0.08em] text-[#8A8A92]">
            Booking ID
          </p>

          <h3 className="RS_BookingId mt-1 text-[19px] font-semibold tracking-tight text-[#17191D]">
            {booking.id}
          </h3>

          <p className="RS_BookingLabel mt-4 text-[10px] font-medium text-[#8A8A92]">
            Requested on
          </p>

          <p className="RS_BookingRequested mt-1 text-[12px] font-medium text-[#616168]">
            {booking.requestedOn}
          </p>
        </div>

        <div className="RS_BookingMeta grid gap-3 sm:grid-cols-3 xl:grid-cols-1 xl:justify-self-end">
          <div className="flex items-center gap-3">
            <div className="RS_BookingMetaIcon grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#EFEFF2] text-[#616168]">
              <FilledIcon
                name="calendar"
                size={16}
              />
            </div>

            <p className="RS_BookingMetaText text-[12px] font-semibold text-[#303035]">
              {booking.startDate}

              <span className="mx-2 text-[#A6A6AD]">
                –
              </span>

              {booking.endDate}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="RS_BookingMetaIcon grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#EFEFF2] text-[#616168]">
              <FilledIcon
                name="clock"
                size={16}
              />
            </div>

            <p className="RS_BookingMetaText text-[12px] font-medium text-[#616168]">
              {booking.duration}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="RS_BookingMetaIcon grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#EFEFF2] text-[#616168]">
              <FilledIcon
                name="vehicle"
                size={17}
              />
            </div>

            <p className="RS_BookingMetaText text-[12px] font-medium text-[#616168]">
              {booking.vehicleTypes} vehicle{" "}
              {booking.vehicleTypes === 1
                ? "type"
                : "types"}

              <span className="mx-2 text-[#A6A6AD]">
                •
              </span>

              {booking.vehicleCount}{" "}
              {booking.vehicleCount === 1
                ? "vehicle"
                : "vehicles"}
            </p>
          </div>
        </div>

        <div>
          <p className="RS_BookingLabel text-[10px] font-medium uppercase tracking-[0.08em] text-[#8A8A92]">
            Estimated Total
          </p>

          <p className="RS_BookingAmount mt-2 text-[21px] font-semibold tracking-tight text-[#B20D19]">
            {formatINR(
              booking.estimatedTotal,
            )}
          </p>
        </div>

        <BubbleButton
          onClick={onView}
          variant="light"
          className="RS_ViewDetailsButton h-12 w-full px-5 text-[12px] font-semibold shadow-[0_4px_16px_rgba(31,31,38,0.06)]"
        >
          View Details

          <FilledIcon
            name="chevronRight"
            size={16}
          />
        </BubbleButton>
      </div>
    </article>
  );
}

/* =========================================================
   VEHICLE ROW INSIDE MODAL
========================================================= */

function VehicleRow({
  vehicle,
}: {
  vehicle: Vehicle;
}) {
  return (
    <div className="RS_VehicleRow grid gap-4 rounded-[22px] bg-[#F1F1F4] p-3 sm:p-4 lg:grid-cols-[110px_minmax(0,1fr)_190px] lg:items-center">
      <div className="RS_VehicleRowMedia h-[100px] overflow-hidden rounded-[18px] bg-[#EDEDF0] lg:h-[82px]">
        <img
          src={VEHICLE_IMAGE}
          alt={vehicle.name}
          className="RS_VehicleRowImage h-full w-full object-cover"
        />
      </div>

      <div className="min-w-0">
        <h4 className="text-[13px] font-semibold text-[#202024]">
          {vehicle.name}
        </h4>

        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
          <VehicleSmallDetail
            label="Start Date"
            value={vehicle.startDate}
          />

          <VehicleSmallDetail
            label="End Date"
            value={vehicle.endDate}
          />

          <VehicleSmallDetail
            label="Duration"
            value={vehicle.duration}
          />

          <VehicleSmallDetail
            label="Quantity"
            value={`${vehicle.quantity} ${
              vehicle.quantity === 1
                ? "Vehicle"
                : "Vehicles"
            }`}
          />
        </div>
      </div>

      <div className="RS_VehicleRowPrice rounded-[18px] bg-white p-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[10px] font-medium text-[#8A8A92]">
            Rate / Day
          </span>

          <span className="text-[12px] font-semibold text-[#4F4F55]">
            {formatINR(
              vehicle.ratePerDay,
            )}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <span className="text-[10px] font-medium text-[#8A8A92]">
            Total
          </span>

          <span className="text-[14px] font-semibold text-[#111114]">
            {formatINR(vehicle.total)}
          </span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   BOOKING DETAILS MODAL
========================================================= */

function BookingModal({
  booking,
  onClose,
  onCancel,
  onDownload,
}: {
  booking: Booking;
  onClose: () => void;
  onCancel: () => void;
  onDownload: () => void;
}) {
  const style =
    statusStyles[booking.status];

  const [mounted] = useState(
    () =>
      typeof document !== "undefined",
  );

  useEffect(() => {
    const scrollY = window.scrollY;

    // ScrollSmoother drives page scroll itself (see GlobalSmoothScroll.tsx),
    // so it has to be paused directly — the body-position lock below only
    // covers native scroll, which isn't what's moving the background here.
    const smoother = ScrollSmoother.get();
    smoother?.paused(true);

    const previousBodyPosition =
      document.body.style.position;

    const previousBodyTop =
      document.body.style.top;

    const previousBodyLeft =
      document.body.style.left;

    const previousBodyWidth =
      document.body.style.width;

    const previousBodyOverflow =
      document.body.style.overflow;

    const previousHtmlOverflow =
      document.documentElement.style
        .overflow;

    document.body.style.position =
      "fixed";

    document.body.style.top =
      `-${scrollY}px`;

    document.body.style.left = "0";
    document.body.style.width =
      "100%";

    document.body.style.overflow =
      "hidden";

    document.documentElement.style.overflow =
      "hidden";

    function handleEscape(
      event: KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      smoother?.paused(false);

      document.body.style.position =
        previousBodyPosition;

      document.body.style.top =
        previousBodyTop;

      document.body.style.left =
        previousBodyLeft;

      document.body.style.width =
        previousBodyWidth;

      document.body.style.overflow =
        previousBodyOverflow;

      document.documentElement.style.overflow =
        previousHtmlOverflow;

      window.scrollTo(0, scrollY);

      window.removeEventListener(
        "keydown",
        handleEscape,
      );
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
      role="dialog"
      aria-modal="true"
      aria-label={`Booking details for ${booking.id}`}
      onClick={onClose}
      className="RS_MyBookingsModal RS_MyBookingsModalOverlay fixed inset-0 z-[9999] grid place-items-center bg-black/40 p-4 backdrop-blur-[8px] sm:p-6"
    >
      <div
        onClick={(event) =>
          event.stopPropagation()
        }
        className="RS_BookingModalPanel max-h-[calc(100dvh-2rem)] w-full max-w-[1180px] overflow-y-auto overscroll-contain rounded-[30px] bg-[#F5F5F7] shadow-[0_35px_100px_rgba(0,0,0,0.22)]"
      >
        <div className="RS_BookingModalHeader sticky top-0 z-20 bg-[#F5F5F7]/88 px-4 pb-4 pt-3 backdrop-blur-2xl sm:px-7 sm:pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-[18px] font-bold text-[#19191D] sm:text-[21px]">
                  Booking ID:{" "}
                  {booking.id}
                </h2>

                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-[10px] font-semibold ${style.badge}`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${style.dot}`}
                  />

                  {style.label}
                </span>
              </div>

              <p className="mt-2 text-[11px] font-medium text-[#76767E]">
                Requested on{" "}
                {booking.requestedOn}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close booking details"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-[#353A42] shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition hover:bg-[#ECECEF] active:scale-95"
            >
              <FilledIcon
                name="close"
                size={18}
              />
            </button>
          </div>
        </div>

        <div className="RS_BookingModalContent px-4 pb-6 sm:px-7 sm:pb-8">
          <div className="RS_BookingModalGrid grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="RS_BookingCustomerColumn space-y-4">
              <div className="rounded-[26px] bg-white p-5 shadow-[0_10px_35px_rgba(22,27,34,0.05)]">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-[#ECECEF] text-[#40454D]">
                    <FilledIcon
                      name="user"
                      size={18}
                    />
                  </div>

                  <h3 className="text-[15px] font-semibold text-[#17171A]">
                    Customer Details
                  </h3>
                </div>

                <div className="mt-6 space-y-5">
                  <DetailItem
                    icon="user"
                    label="Name"
                    value={
                      booking.customer.name
                    }
                  />

                  <DetailItem
                    icon="company"
                    label="Company Name"
                    value={
                      booking.customer.company
                    }
                  />

                  <DetailItem
                    icon="phone"
                    label="Phone Number"
                    value={
                      booking.customer.phone
                    }
                  />

                  <DetailItem
                    icon="mail"
                    label="Email Address"
                    value={
                      booking.customer.email
                    }
                  />
                </div>
              </div>

              <div className="rounded-[26px] bg-[#111114] p-5 text-white shadow-[0_14px_40px_rgba(0,0,0,0.14)]">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-white/12">
                    <FilledIcon
                      name="support"
                      size={19}
                    />
                  </div>

                  <h3 className="text-[14px] font-semibold">
                    Need Help?
                  </h3>
                </div>

                <p className="mt-4 text-[11px] leading-5 text-white/65">
                  Our support team is
                  ready to assist you
                  with your booking.
                </p>

                <a
                  href="/contact"
                  className="RS_VehicleButton RS_VehicleButton--white mt-5 h-11 w-full text-[12px] font-semibold"
                >
                  <span
                    aria-hidden="true"
                    className="RS_BtnBubble RS_BtnBubble--static"
                  />

                  <span className="RS_BtnContent">
                    Contact Support
                  </span>
                </a>
              </div>
            </aside>

            <div className="RS_BookingDetailsColumn space-y-4">
              <div className="rounded-[26px] bg-white p-4 shadow-[0_10px_35px_rgba(22,27,34,0.05)] sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-[#ECECEF] text-[#40454D]">
                    <FilledIcon
                      name="vehicle"
                      size={19}
                    />
                  </div>

                  <h3 className="text-[15px] font-semibold text-[#17171A]">
                    Vehicles &amp;
                    Booking Details
                  </h3>
                </div>

                <div className="mt-5 space-y-3">
                  {booking.vehicles.map(
                    (
                      vehicle,
                      index,
                    ) => (
                      <VehicleRow
                        key={`${booking.id}-${vehicle.name}-${index}`}
                        vehicle={vehicle}
                      />
                    ),
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[26px] bg-white p-5 shadow-[0_10px_35px_rgba(22,27,34,0.05)]">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-[#ECECEF] text-[#40454D]">
                      <FilledIcon
                        name="vehicle"
                        size={18}
                      />
                    </div>

                    <h3 className="text-[15px] font-semibold text-[#17171A]">
                      Amount Summary
                    </h3>
                  </div>

                  <div className="mt-6 space-y-4 text-[12px] text-[#555B64]">
                    <div className="flex items-center justify-between gap-4">
                      <span>
                        Subtotal
                      </span>

                      <span className="font-semibold text-[#303035]">
                        {formatINR(
                          booking.estimatedTotal,
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span>
                        Taxes &amp;
                        Charges
                      </span>

                      <span className="font-semibold text-[#303035]">
                        ₹ 0
                      </span>
                    </div>

                    <div className="h-px bg-[#EDEDF0]" />

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[13px] font-semibold text-[#19191D]">
                        Estimated Total
                      </span>

                      <span className="text-[16px] font-bold text-[#B20D19]">
                        {formatINR(
                          booking.estimatedTotal,
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-[26px] bg-white p-5 shadow-[0_10px_35px_rgba(22,27,34,0.05)]">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-[#ECECEF] text-[#40454D]">
                      <FilledIcon
                        name="send"
                        size={18}
                      />
                    </div>

                    <h3 className="text-[15px] font-semibold text-[#17171A]">
                      What Happens Next?
                    </h3>
                  </div>

                  <p className="mt-5 text-[12px] leading-6 text-[#6A6A72]">
                    Our team will contact
                    you soon to confirm
                    vehicle availability,
                    campaign requirements,
                    route details and the
                    final booking amount.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="RS_BookingModalActions mt-5 grid gap-3 sm:flex sm:flex-wrap sm:justify-end">
            <BubbleButton
              onClick={onDownload}
              variant="light"
              className="h-12 px-5 text-[12px] font-semibold"
            >
              <FilledIcon
                name="download"
                size={17}
              />

              Download Summary
            </BubbleButton>

            {booking.status !==
              "Cancelled" &&
              booking.status !==
                "Completed" && (
                <BubbleButton
                  onClick={onCancel}
                  variant="danger"
                  className="h-12 px-5 text-[12px] font-semibold"
                >
                  <FilledIcon
                    name="trash"
                    size={17}
                  />

                  Cancel Request
                </BubbleButton>
              )}

            <BubbleButton
              onClick={onClose}
              variant="white"
              className="h-12 px-7 text-[12px] font-semibold shadow-sm"
            >
              Close
            </BubbleButton>

            <a
              href="/contact"
              className="RS_VehicleButton RS_VehicleButton--light h-12 px-7 text-[12px] font-semibold"
            >
              <span
                aria-hidden="true"
                className="RS_BtnBubble RS_BtnBubble--static"
              />

              <span className="RS_BtnContent">
                <FilledIcon
                  name="support"
                  size={17}
                />

                Contact Us
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function MyBookingsPage() {
  const { user, authLoading, openAuth } = useAuth();

  const [bookings, setBookings] =
    useState<Booking[]>([]);

  const [bookingsLoading, setBookingsLoading] =
    useState(true);

  const [bookingsError, setBookingsError] =
    useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      openAuth("login");
      return;
    }

    let active = true;

    (async () => {
      try {
        setBookingsLoading(true);
        setBookingsError("");

        const response = await fetch(
          `${baseUrl}/client-requests`,
          { cache: "no-store" },
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

        // client-requests is a staff-facing listing endpoint with no
        // documented customer-scoped filter, so this filters by the
        // logged-in user's phone on the client as an interim measure.
        // Needs a real scoped backend endpoint before shipping.
        const mine = ((result.data as ClientRequestRaw[]) || []).filter(
          (request) => request.phone === user.phone,
        );

        if (active) {
          setBookings(mine.map(mapClientRequestToBooking));
        }
      } catch (error) {
        if (active) {
          setBookingsError(
            error instanceof Error
              ? error.message
              : "Unable to load your bookings.",
          );
        }
      } finally {
        if (active) setBookingsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [user, authLoading, openAuth]);

  const [activeTab, setActiveTab] =
    useState<StatusFilter>("All");

  const tabButtonRefs = useRef<
    Partial<
      Record<
        StatusFilter,
        HTMLButtonElement | null
      >
    >
  >({});

  const [
    activeTabPillRect,
    setActiveTabPillRect,
  ] = useState<{
    left: number;
    width: number;
  } | null>(null);

  useEffect(() => {
    function updateActiveTabPill() {
      const activeButton =
        tabButtonRefs.current[
          activeTab
        ];

      if (!activeButton) return;

      setActiveTabPillRect({
        left: activeButton.offsetLeft,
        width:
          activeButton.offsetWidth,
      });
    }

    updateActiveTabPill();

    window.addEventListener(
      "resize",
      updateActiveTabPill,
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateActiveTabPill,
      );
    };
  }, [activeTab]);

  const [searchValue, setSearchValue] =
    useState("");

  const [sortMode, setSortMode] =
    useState<SortMode>("newest");

  const [filterOpen, setFilterOpen] =
    useState(false);

  const filterRef =
    useRef<HTMLDivElement>(null);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [
    selectedBookingId,
    setSelectedBookingId,
  ] = useState<string | null>(null);

  const pageSize = 3;

  useEffect(() => {
    if (!filterOpen) return;

    function handleClickOutside(
      event: MouseEvent,
    ) {
      if (
        filterRef.current &&
        !filterRef.current.contains(
          event.target as Node,
        )
      ) {
        setFilterOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, [filterOpen]);

  const statusCounts = useMemo(() => {
    return {
      All: bookings.length,

      Pending: bookings.filter(
        (booking) =>
          booking.status ===
          "Pending",
      ).length,

      Confirmed: bookings.filter(
        (booking) =>
          booking.status ===
          "Confirmed",
      ).length,

      Ongoing: bookings.filter(
        (booking) =>
          booking.status ===
          "Ongoing",
      ).length,

      Completed: bookings.filter(
        (booking) =>
          booking.status ===
          "Completed",
      ).length,

      Cancelled: bookings.filter(
        (booking) =>
          booking.status ===
          "Cancelled",
      ).length,
    };
  }, [bookings]);

  const filteredBookings =
    useMemo(() => {
      let result = bookings.filter(
        (booking) => {
          const statusMatches =
            activeTab === "All" ||
            booking.status ===
              activeTab;

          const searchMatches =
            booking.id
              .toLowerCase()
              .includes(
                searchValue
                  .trim()
                  .toLowerCase(),
              );

          return (
            statusMatches &&
            searchMatches
          );
        },
      );

      if (sortMode === "newest") {
        result = [...result].sort(
          (a, b) =>
            new Date(
              b.requestedAt,
            ).getTime() -
            new Date(
              a.requestedAt,
            ).getTime(),
        );
      }

      if (sortMode === "oldest") {
        result = [...result].sort(
          (a, b) =>
            new Date(
              a.requestedAt,
            ).getTime() -
            new Date(
              b.requestedAt,
            ).getTime(),
        );
      }

      if (sortMode === "highest") {
        result = [...result].sort(
          (a, b) =>
            b.estimatedTotal -
            a.estimatedTotal,
        );
      }

      if (sortMode === "lowest") {
        result = [...result].sort(
          (a, b) =>
            a.estimatedTotal -
            b.estimatedTotal,
        );
      }

      return result;
    }, [
      activeTab,
      bookings,
      searchValue,
      sortMode,
    ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredBookings.length /
        pageSize,
    ),
  );

  const safePage = Math.min(
    currentPage,
    totalPages,
  );

  const visibleBookings =
    filteredBookings.slice(
      (safePage - 1) * pageSize,
      safePage * pageSize,
    );

  const selectedBooking =
    bookings.find(
      (booking) =>
        booking.id ===
        selectedBookingId,
    ) ?? null;

  function handleTabChange(
    tab: StatusFilter,
  ) {
    setActiveTab(tab);
    setCurrentPage(1);
  }

  function handleCancelBooking() {
    if (!selectedBooking) return;

    const shouldCancel =
      window.confirm(
        `Are you sure you want to cancel ${selectedBooking.id}?`,
      );

    if (!shouldCancel) return;

    setBookings(
      (currentBookings) =>
        currentBookings.map(
          (booking) =>
            booking.id ===
            selectedBooking.id
              ? {
                  ...booking,
                  status:
                    "Cancelled",
                }
              : booking,
        ),
    );
  }

  async function handleDownloadSummary() {
    if (!selectedBooking) return;

    const booking = selectedBooking;
    const style =
      statusStyles[booking.status];

    const { default: JsPDF } =
      await import("jspdf");

    const doc = new JsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const pageWidth =
      doc.internal.pageSize.getWidth();

    const pageHeight =
      doc.internal.pageSize.getHeight();

    const marginX = 48;
    const marginBottom = 56;
    const contentWidth =
      pageWidth - marginX * 2;

    let y = 56;

    function newPageIfNeeded(
      needed: number,
    ) {
      if (
        y + needed >
        pageHeight - marginBottom
      ) {
        doc.addPage();
        y = 56;
      }
    }

    function drawSectionTitle(
      title: string,
    ) {
      newPageIfNeeded(30);

      doc.setFont(
        "helvetica",
        "bold",
      );
      doc.setFontSize(12);
      doc.setTextColor(17, 17, 20);
      doc.text(
        title.toUpperCase(),
        marginX,
        y,
      );

      y += 6;

      doc.setDrawColor(
        225,
        225,
        230,
      );
      doc.setLineWidth(1);
      doc.line(
        marginX,
        y,
        marginX + contentWidth,
        y,
      );

      y += 18;
    }

    function drawRow(
      label: string,
      value: string,
    ) {
      newPageIfNeeded(18);

      doc.setFont(
        "helvetica",
        "normal",
      );
      doc.setFontSize(9.5);
      doc.setTextColor(
        120,
        120,
        128,
      );
      doc.text(label, marginX, y);

      doc.setFont(
        "helvetica",
        "bold",
      );
      doc.setFontSize(10.5);
      doc.setTextColor(25, 25, 29);
      doc.text(
        value,
        marginX + contentWidth,
        y,
        { align: "right" },
      );

      y += 18;
    }

    function drawSeparator() {
      newPageIfNeeded(14);

      doc.setDrawColor(
        237,
        237,
        240,
      );
      doc.setLineWidth(0.75);
      doc.line(
        marginX,
        y,
        marginX + contentWidth,
        y,
      );

      y += 14;
    }

    doc.setFont(
      "helvetica",
      "bold",
    );
    doc.setFontSize(18);
    doc.setTextColor(17, 17, 20);
    doc.text(
      "Booking Summary",
      marginX,
      y,
    );

    y += 22;

    doc.setFont(
      "helvetica",
      "normal",
    );
    doc.setFontSize(10);
    doc.setTextColor(
      110,
      110,
      118,
    );
    doc.text(
      `Booking ID: ${booking.id}`,
      marginX,
      y,
    );

    y += 26;

    drawSectionTitle(
      "Booking Details",
    );
    drawRow("Booking ID", booking.id);
    drawRow("Status", style.label);
    drawRow(
      "Requested On",
      booking.requestedOn,
    );

    y += 8;

    drawSectionTitle(
      "Customer Details",
    );
    drawRow(
      "Name",
      booking.customer.name,
    );
    drawRow(
      "Company Name",
      booking.customer.company,
    );
    drawRow(
      "Phone Number",
      booking.customer.phone,
    );
    drawRow(
      "Email Address",
      booking.customer.email,
    );

    y += 8;

    drawSectionTitle(
      "Vehicles & Booking Details",
    );

    booking.vehicles.forEach(
      (vehicle, index) => {
        newPageIfNeeded(130);

        doc.setFont(
          "helvetica",
          "bold",
        );
        doc.setFontSize(11);
        doc.setTextColor(
          17,
          17,
          20,
        );
        doc.text(
          `${index + 1}. ${vehicle.name}`,
          marginX,
          y,
        );

        y += 18;

        drawRow(
          "Start Date",
          vehicle.startDate,
        );
        drawRow(
          "End Date",
          vehicle.endDate,
        );
        drawRow(
          "Duration",
          vehicle.duration,
        );
        drawRow(
          "Quantity",
          `${vehicle.quantity} ${
            vehicle.quantity === 1
              ? "Vehicle"
              : "Vehicles"
          }`,
        );
        drawRow(
          "Rate / Day",
          formatINRForPdf(
            vehicle.ratePerDay,
          ),
        );
        drawRow(
          "Vehicle Total",
          formatINRForPdf(
            vehicle.total,
          ),
        );

        if (
          index <
          booking.vehicles.length - 1
        ) {
          y += 4;
          drawSeparator();
        } else {
          y += 8;
        }
      },
    );

    drawSectionTitle(
      "Amount Summary",
    );
    drawRow(
      "Subtotal",
      formatINRForPdf(
        booking.estimatedTotal,
      ),
    );
    drawRow(
      "Taxes & Charges",
      formatINRForPdf(0),
    );
    drawSeparator();

    newPageIfNeeded(24);

    doc.setFont(
      "helvetica",
      "bold",
    );
    doc.setFontSize(12.5);
    doc.setTextColor(17, 17, 20);
    doc.text(
      "Estimated Total",
      marginX,
      y,
    );
    doc.text(
      formatINRForPdf(
        booking.estimatedTotal,
      ),
      marginX + contentWidth,
      y,
      { align: "right" },
    );

    y += 24;

    doc.save(
      `${booking.id}-booking-summary.pdf`,
    );
  }

  return (
    <>
      <main className="RS_MyBookingsRoot min-h-screen bg-[#ffffff] px-4 pb-12 pt-[130px] text-[#111114] sm:px-6 sm:pt-[140px] lg:px-8 lg:pt-[150px]">
        <div className="RS_MyBookingsContainer mx-auto max-w-[1440px]">
          <div className="RS_MyBookingsHeader flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="RS_PageTitle text-[34px] font-medium tracking-[-0.045em] text-[#0F0F12] sm:text-[40px]">
                My Bookings
              </h1>

              <p className="mt-2 text-[14px] font-normal leading-6 text-[#6D6D75]">
                View and manage your
                roadshow booking
                requests.
              </p>
            </div>

            <div className="RS_BookingToolbar flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <label className="RS_SearchBox flex h-12 min-w-0 flex-1 items-center gap-3 rounded-full bg-white/90 px-5 shadow-[0_10px_30px_rgba(31,31,38,0.055)] backdrop-blur-xl lg:w-[320px]">
                <FilledIcon
                  name="search"
                  size={18}
                  className="shrink-0 text-[#66666D]"
                />

                <input
                  value={searchValue}
                  onChange={(event) => {
                    setSearchValue(
                      event.target.value,
                    );

                    setCurrentPage(1);
                  }}
                  placeholder="Search by Booking ID..."
                  className="RS_SearchInput min-w-0 flex-1 bg-transparent text-[12px] font-medium text-[#252529] outline-none placeholder:text-[#A6A6AD]"
                />
              </label>

              <div
                className="RS_FilterWrap relative"
                ref={filterRef}
              >
                <BubbleButton
                  onClick={() =>
                    setFilterOpen(
                      (current) =>
                        !current,
                    )
                  }
                  variant="white"
                  className="RS_FilterButton h-12 w-full px-5 text-[12px] font-semibold shadow-[0_10px_30px_rgba(31,31,38,0.055)] sm:w-[150px]"
                >
                  <FilledIcon
                    name="filter"
                    size={17}
                  />

                  Filters
                </BubbleButton>

                {filterOpen && (
                  <div className="RS_FilterMenu absolute right-0 top-[56px] z-40 w-full min-w-[210px] rounded-[20px] bg-white p-2 shadow-[0_18px_55px_rgba(0,0,0,0.16)]">
                    {[
                      {
                        value:
                          "newest",
                        label:
                          "Newest first",
                      },
                      {
                        value:
                          "oldest",
                        label:
                          "Oldest first",
                      },
                      {
                        value:
                          "highest",
                        label:
                          "Highest amount",
                      },
                      {
                        value:
                          "lowest",
                        label:
                          "Lowest amount",
                      },
                    ].map(
                      (option) => (
                        <button
                          key={
                            option.value
                          }
                          type="button"
                          onClick={() => {
                            setSortMode(
                              option.value as SortMode,
                            );

                            setCurrentPage(
                              1,
                            );

                            setFilterOpen(
                              false,
                            );
                          }}
                          className={`block w-full rounded-full px-4 py-3 text-left text-[12px] font-semibold transition ${
                            sortMode ===
                            option.value
                              ? "bg-[#ECECEF] text-[#17171A]"
                              : "text-[#555B64] hover:bg-[#F1F1F4]"
                          }`}
                        >
                          {
                            option.label
                          }
                        </button>
                      ),
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="RS_BookingTabsViewport mt-8 overflow-x-auto pb-2">
            <div className="RS_BookingTabs relative flex min-w-max gap-1.5 rounded-full bg-[#EDEDF0] p-1.5">
              {activeTabPillRect && (
                <span
                  aria-hidden="true"
                  className="RS_ActiveTabPill pointer-events-none absolute z-0 rounded-full bg-white"
                  style={{
                    top: "50%",
                    height: "calc(100% - 12px)",
                    left: activeTabPillRect.left,
                    width:
                      activeTabPillRect.width,
                    transform:
                      "translateY(-50%)",
                    transition:
                      "left 320ms cubic-bezier(0.22, 1, 0.36, 1), width 320ms cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                />
              )}

              {tabs.map((tab) => {
                const countBg =
                  tab === "All"
                    ? "bg-[#E2E2E6]"
                    : statusStyles[
                        tab
                      ].badge.split(
                        " ",
                      )[0];

                return (
                  <button
                    key={tab}
                    ref={(element) => {
                      tabButtonRefs.current[
                        tab
                      ] = element;
                    }}
                    type="button"
                    onClick={() =>
                      handleTabChange(
                        tab,
                      )
                    }
                    className="RS_TabButton relative z-10 flex h-11 min-w-[140px] items-center justify-center gap-3 rounded-full bg-transparent px-5 text-[12px] font-normal text-black transition active:scale-[0.98]"
                  >
                    <span>{tab}</span>

                    <span
                      className={`RS_TabCount grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-[10px] font-normal text-black ${countBg}`}
                    >
                      {
                        statusCounts[
                          tab
                        ]
                      }
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="RS_BookingsList mt-5 space-y-4">
            {authLoading || (user && bookingsLoading) ? (
              <div className="rounded-[28px] bg-white px-6 py-20 text-center shadow-[0_12px_40px_rgba(25,31,40,0.06)]">
                <p className="text-[13px] font-medium text-[#777D87]">
                  Loading your bookings…
                </p>
              </div>
            ) : !user ? (
              <div className="rounded-[28px] bg-white px-6 py-20 text-center shadow-[0_12px_40px_rgba(25,31,40,0.06)]">
                <p className="text-[14px] font-semibold text-[#303035]">
                  Please sign in to view your bookings
                </p>

                <BubbleButton
                  onClick={() => openAuth("login")}
                  variant="light"
                  className="mx-auto mt-6 h-11 px-6 text-[12px] font-semibold"
                >
                  Sign In
                </BubbleButton>
              </div>
            ) : bookingsError ? (
              <div className="rounded-[28px] bg-white px-6 py-20 text-center shadow-[0_12px_40px_rgba(25,31,40,0.06)]">
                <p className="text-[14px] font-semibold text-[#B31C28]">
                  {bookingsError}
                </p>
              </div>
            ) : visibleBookings.length >
            0 ? (
              visibleBookings.map(
                (booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onView={() =>
                      setSelectedBookingId(
                        booking.id,
                      )
                    }
                  />
                ),
              )
            ) : (
              <div className="rounded-[28px] bg-white px-6 py-20 text-center shadow-[0_12px_40px_rgba(25,31,40,0.06)]">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#ECECEF] text-[#777D87]">
                  <FilledIcon
                    name="search"
                    size={23}
                  />
                </div>

                <p className="mt-4 text-[14px] font-semibold text-[#303035]">
                  No bookings found
                </p>

                <p className="mt-2 text-[12px] text-[#777D87]">
                  Try changing the
                  search or selected
                  status.
                </p>

                {(activeTab !==
                  "All" ||
                  searchValue.trim() !==
                    "") && (
                  <BubbleButton
                    onClick={() => {
                      setActiveTab(
                        "All",
                      );

                      setSearchValue(
                        "",
                      );

                      setCurrentPage(
                        1,
                      );
                    }}
                    variant="light"
                    className="mx-auto mt-6 h-11 px-6 text-[12px] font-semibold"
                  >
                    Clear filters
                  </BubbleButton>
                )}
              </div>
            )}
          </div>

          <div className="RS_BookingPagination mt-6 flex flex-col gap-4 text-[11px] font-medium text-[#6D6D75] sm:flex-row sm:items-center sm:justify-between">
            <p className="RS_BookingResultsText">
              Showing{" "}
              {visibleBookings.length ===
              0
                ? 0
                : (safePage - 1) *
                    pageSize +
                  1}{" "}
              to{" "}
              {Math.min(
                safePage *
                  pageSize,
                filteredBookings.length,
              )}{" "}
              of{" "}
              {
                filteredBookings.length
              }{" "}
              bookings
            </p>

            <div className="RS_PaginationControls flex flex-wrap items-center justify-center gap-2 sm:justify-end">
              <button
                type="button"
                aria-label="Previous page"
                disabled={
                  safePage === 1
                }
                onClick={() =>
                  setCurrentPage(
                    (current) =>
                      Math.max(
                        1,
                        current - 1,
                      ),
                  )
                }
                className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#4F4F55] shadow-sm transition hover:bg-[#ECECEF] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FilledIcon
                  name="arrowLeft"
                  size={16}
                />
              </button>

              <div className="flex items-center gap-1 rounded-full bg-[#ECECEF] p-1">
                {Array.from(
                  {
                    length:
                      totalPages,
                  },
                  (_, index) =>
                    index + 1,
                ).map(
                  (pageNumber) => (
                    <button
                      key={
                        pageNumber
                      }
                      type="button"
                      onClick={() =>
                        setCurrentPage(
                          pageNumber,
                        )
                      }
                      className={`grid h-8 min-w-8 place-items-center rounded-full px-3 text-[11px] font-semibold transition active:scale-95 ${
                        safePage ===
                        pageNumber
                          ? "bg-white text-[#111114] shadow-[0_4px_12px_rgba(25,31,40,0.1)]"
                          : "bg-transparent text-[#72727A] hover:text-[#111114]"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ),
                )}
              </div>

              <button
                type="button"
                aria-label="Next page"
                disabled={
                  safePage ===
                  totalPages
                }
                onClick={() =>
                  setCurrentPage(
                    (current) =>
                      Math.min(
                        totalPages,
                        current + 1,
                      ),
                  )
                }
                className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#4F4F55] shadow-sm transition hover:bg-[#ECECEF] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FilledIcon
                  name="arrowRight"
                  size={16}
                />
              </button>
            </div>
          </div>
        </div>
      </main>



      {selectedBooking && (
        <BookingModal
          booking={selectedBooking}
          onClose={() =>
            setSelectedBookingId(
              null,
            )
          }
          onCancel={
            handleCancelBooking
          }
          onDownload={
            handleDownloadSummary
          }
        />
      )}
    </>
  );
} 
