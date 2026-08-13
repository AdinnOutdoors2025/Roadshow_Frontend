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
  CalendarDays,
  CheckCircle2,
  Clock3,
  Hourglass,
  XCircle,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Download,
  UserRound,
  Building2,
  Phone,
  Mail,
  Headphones,
  Truck,
  Calendar,
  Timer,
  IndianRupee,
  Trash2,
  X,
  Send,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";

import "./page.css";

import { baseUrl } from "../../../BaseUrl";
import { useAuth } from "@/context/AuthContext";
import { clientAuthHeaders } from "@/lib/roadshowAuthToken";

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
  mongoId: string;

  status: BookingStatus;

  requestedOn: string;
  requestedAt: string;

  startDate: string;
  endDate: string;
  duration: string;

  vehicleTypes: number;
  vehicleCount: number;

  estimatedTotal: number;

  campaignName: string;
  promoterLabel: string;
  location: string;

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

  quantity?: number;

  fromDate?: string;
  toDate?: string;

  totalDays?: number;

  pricePerDay?: number;
  lineTotal?: number;

  campaignName?: string;
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

  estimatedTotal?: number;

  name?: string;
  companyName?: string;
  phone?: string;
  email?: string;

  vehicleTypes?: ClientRequestVehicleRaw[];
};

/* =========================================================
   UI CONFIG
========================================================= */

const FILTER_TABS: StatusFilter[] = [
  "All",
  "Confirmed",
  "In Progress",
  "Pending",
  "Cancelled",
];

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

  return {
    id: request.clientOrderId || request._id,

    mongoId: request._id,

    status: mapRequestStatus(request.status),

    requestedOn: formatBookingDateTime(request.createdAt),
    requestedAt: request.createdAt || "",

    startDate: formatBookingDate(firstVehicle?.fromDate),
    endDate: formatBookingDate(firstVehicle?.toDate),

    duration: firstVehicle?.totalDays
      ? `${firstVehicle.totalDays} ${
          firstVehicle.totalDays === 1 ? "Day" : "Days"
        }`
      : "-",

    vehicleTypes: vehicleTypes.length,

    vehicleCount,

    estimatedTotal: Number(request.estimatedTotal || 0),

    campaignName:
      firstVehicle?.campaignName || "Roadshow Campaign",

    promoterLabel,

    location: firstVehicle?.campaignLocation || "-",

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

      duration: vehicle.totalDays
        ? `${vehicle.totalDays} ${
            vehicle.totalDays === 1 ? "Day" : "Days"
          }`
        : "-",

      quantity: Number(vehicle.quantity || 0),

      ratePerDay: Number(vehicle.pricePerDay || 0),

      total: Number(vehicle.lineTotal || 0),
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
   STAT ITEM
========================================================= */

function StatItem({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <div className="RS_StatItem">
      <span className="RS_StatIcon">
        <Icon
          size={23}
          strokeWidth={1.7}
          aria-hidden="true"
        />
      </span>

      <div className="RS_StatText">
        <span className="RS_StatLabel">{label}</span>

        <strong className="RS_StatValue">{value}</strong>
      </div>
    </div>
  );
}

/* =========================================================
   BOOKING ROW
========================================================= */

function BookingRow({
  booking,
  onView,
  onViewSummary,
}: {
  booking: Booking;
  onView: () => void;
  onViewSummary: () => void;
}) {
  const status = STATUS_CONFIG[booking.status];
  const StatusIcon = status.icon;

  return (
    <article className="RS_BookingRow RS_Reveal">
      {/* BOOKING ID */}
      <div className="RS_BookingCell RS_BookingIdentity">
        <div className="RS_BookingCalendarIcon">
          <CalendarDays
            size={20}
            strokeWidth={1.7}
          />
        </div>

        <div className="RS_CellContent">
          <span className="RS_CellLabel">Booking ID</span>

          <strong className="RS_BookingId">
            {booking.id}
          </strong>

          <span className="RS_BookingDate">
            {booking.requestedOn}
          </span>
        </div>
      </div>

      {/* STATUS */}
      <div className="RS_BookingCell">
        <span className="RS_CellLabel">Status</span>

        <span
          className={`RS_StatusBadge ${status.className}`}
        >
          <StatusIcon
            size={13}
            strokeWidth={2.2}
          />

          {status.label}
        </span>
      </div>

      {/* CAMPAIGN */}
      <div className="RS_BookingCell">
        <span className="RS_CellLabel">Campaign</span>

        <strong className="RS_CellPrimary RS_Ellipsis">
          {booking.campaignName}
        </strong>

        <span className="RS_CellSecondary RS_Ellipsis">
          Promoter: {booking.promoterLabel}
        </span>
      </div>

      {/* DATES */}
      <div className="RS_BookingCell">
        <span className="RS_CellLabel">Dates</span>

        <strong className="RS_CellPrimary RS_DateRange">
          <span>{booking.startDate}</span>

          <span className="RS_DateArrow">→</span>

          <span>{booking.endDate}</span>
        </strong>

        <span className="RS_CellSecondary">
          {booking.vehicleCount}{" "}
          {booking.vehicleCount === 1
            ? "Vehicle"
            : "Vehicles"}
        </span>
      </div>

      {/* TOTAL */}
      <div className="RS_BookingCell RS_AmountCell">
        <span className="RS_CellLabel">Total Amount</span>

        <strong className="RS_BookingAmount">
          {formatINR(booking.estimatedTotal)}
        </strong>
      </div>

      {/* ACTIONS */}
      <div className="RS_RowActions">
        <BubbleButton
          onClick={onView}
          variant="white"
          className="RS_RowAction"
        >
          <span>View Details</span>

          <ChevronRight
            size={16}
            strokeWidth={1.8}
          />
        </BubbleButton>

        <BubbleButton
          onClick={onViewSummary}
          variant="white"
          className="RS_RowAction"
        >
          <span>Download Summary</span>

          <Download
            size={15}
            strokeWidth={1.8}
          />
        </BubbleButton>
      </div>
    </article>
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
          src={VEHICLE_IMAGE}
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
}: {
  booking: Booking;
  onClose: () => void;
  onCancel: () => void;
  onViewSummary: () => void;
}) {
  const [mounted] = useState(
    () => typeof document !== "undefined",
  );

  const status = STATUS_CONFIG[booking.status];
  const StatusIcon = status.icon;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const scrollY = window.scrollY;

    const smoother = ScrollSmoother.get();

    smoother?.paused(true);

    const previousBodyPosition =
      document.body.style.position;

    const previousBodyTop =
      document.body.style.top;

    const previousBodyWidth =
      document.body.style.width;

    const previousBodyOverflow =
      document.body.style.overflow;

    const previousHtmlOverflow =
      document.documentElement.style.overflow;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    document.documentElement.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      smoother?.paused(false);

      document.body.style.position =
        previousBodyPosition;

      document.body.style.top = previousBodyTop;

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
      className="RS_ModalOverlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Booking details for ${booking.id}`}
      onMouseDown={onClose}
    >
      <section
        className="RS_ModalPanel"
        onMouseDown={(event) => event.stopPropagation()}
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
                          booking.estimatedTotal,
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Taxes & Charges</span>
                      <strong>₹0.00</strong>
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
          >
            <Download
              size={16}
              strokeWidth={1.8}
            />

            Download Summary
          </BubbleButton>

          {booking.status !== "Cancelled" &&
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
            )}

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

  const [currentPage, setCurrentPage] = useState(1);

  const [
    selectedBookingId,
    setSelectedBookingId,
  ] = useState<string | null>(null);

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

  /* =========================================================
     SCROLL REVEAL
  ========================================================= */

  useEffect(() => {
    if (typeof window === "undefined") return;

    const elements =
      document.querySelectorAll<HTMLElement>(
        ".RS_Reveal",
      );

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) =>
        element.classList.add("RS_IsVisible"),
      );

      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("RS_IsVisible");

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
  ]);

  /* =========================================================
     HANDLERS
  ========================================================= */

  function handleTabChange(tab: StatusFilter) {
    setActiveTab(tab);
    setCurrentPage(1);
  }

  function goToViewSummary(mongoId: string) {
    router.push(
      `/roadshow/view-summary/${mongoId}`,
    );
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
            }
          : booking,
      ),
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      <main className="RS_MyBookingsRoot">
        <div className="RS_MyBookingsContainer">
          {/* =================================================
              HEADER
          ================================================= */}

          <header className="RS_PageHeader RS_Reveal">
            <h1>My Bookings</h1>

            <p>
              View and manage all your vehicle booking
              requests.
            </p>
          </header>

          {/* =================================================
              STATS
          ================================================= */}

          <section className="RS_StatsPanel RS_Reveal">
            <StatItem
              icon={CalendarDays}
              label="Total Bookings"
              value={statusCounts.All}
            />

            <StatItem
              icon={CheckCircle2}
              label="Confirmed"
              value={statusCounts.Confirmed}
            />

            <StatItem
              icon={Clock3}
              label="In Progress"
              value={statusCounts["In Progress"]}
            />

            <StatItem
              icon={Hourglass}
              label="Pending"
              value={statusCounts.Pending}
            />

            <StatItem
              icon={XCircle}
              label="Cancelled"
              value={statusCounts.Cancelled}
            />
          </section>

          {/* =================================================
              FILTER / SEARCH / SORT
          ================================================= */}

          <section className="RS_ControlBar RS_Reveal">
            <label className="RS_SearchField">
              <Search
                size={19}
                strokeWidth={1.8}
              />

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

            <div className="RS_StatusTabsViewport">
              <div className="RS_StatusTabs">
                {FILTER_TABS.map((tab) => {
                  const isActive = activeTab === tab;

                  const icon =
                    tab === "All"
                      ? null
                      : STATUS_CONFIG[tab].icon;

                  const TabIcon = icon;

                  return (
                    <button
                      key={tab}
                      type="button"
                      className={`RS_FilterTab ${
                        isActive
                          ? "RS_FilterTab--active"
                          : ""
                      }`}
                      onClick={() =>
                        handleTabChange(tab)
                      }
                    >
                      {TabIcon && (
                        <TabIcon
                          size={15}
                          strokeWidth={1.8}
                        />
                      )}

                      <span>{tab}</span>

                      <small>
                        {statusCounts[tab]}
                      </small>
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className="RS_SortWrapper"
              ref={sortRef}
            >
              <button
                type="button"
                className="RS_SortButton"
                onClick={() =>
                  setSortOpen((current) => !current)
                }
              >
                <SlidersHorizontal
                  size={16}
                  strokeWidth={1.8}
                />

                <span>Sort by</span>

                <ChevronDown
                  size={15}
                  strokeWidth={1.8}
                />
              </button>

              {sortOpen && (
                <div className="RS_SortMenu">
                  {[
                    {
                      value: "newest",
                      label: "Newest first",
                    },

                    {
                      value: "oldest",
                      label: "Oldest first",
                    },

                    {
                      value: "highest",
                      label: "Highest amount",
                    },

                    {
                      value: "lowest",
                      label: "Lowest amount",
                    },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={
                        sortMode === option.value
                          ? "RS_SortMenuActive"
                          : ""
                      }
                      onClick={() => {
                        setSortMode(
                          option.value as SortMode,
                        );

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

          {/* =================================================
              BOOKINGS
          ================================================= */}

          <section className="RS_BookingsArea">
            {authLoading ||
            (user && bookingsLoading) ? (
              <div className="RS_StateCard">
                <div className="RS_LoadingRing" />

                <strong>
                  Loading your bookings...
                </strong>

                <p>
                  Please wait while we fetch your booking
                  requests.
                </p>
              </div>
            ) : !user ? (
              <div className="RS_StateCard">
                <UserRound
                  size={28}
                  strokeWidth={1.6}
                />

                <strong>
                  Sign in to view your bookings
                </strong>

                <p>
                  Your booking history is linked to your
                  registered account.
                </p>

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
                <XCircle
                  size={30}
                  strokeWidth={1.6}
                />

                <strong>
                  Unable to load your bookings
                </strong>

                <p>{bookingsError}</p>
              </div>
            ) : visibleBookings.length > 0 ? (
              <div className="RS_BookingsList">
                {visibleBookings.map((booking) => (
                  <BookingRow
                    key={booking.id}
                    booking={booking}
                    onView={() =>
                      setSelectedBookingId(booking.id)
                    }
                    onViewSummary={() =>
                      goToViewSummary(booking.mongoId)
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="RS_StateCard RS_Reveal">
                <Search
                  size={30}
                  strokeWidth={1.5}
                />

                <strong>No bookings found</strong>

                <p>
                  Try changing your search, filter or
                  status selection.
                </p>

                {(activeTab !== "All" ||
                  searchValue.trim()) && (
                  <BubbleButton
                    variant="dark"
                    className="RS_StateButton"
                    onClick={() => {
                      setActiveTab("All");

                      setSearchValue("");

                      setCurrentPage(1);
                    }}
                  >
                    Clear Filters
                  </BubbleButton>
                )}
              </div>
            )}
          </section>

          {/* =================================================
              PAGINATION
          ================================================= */}

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
                    <ChevronLeft
                      size={17}
                      strokeWidth={1.8}
                    />
                  </button>

                  {Array.from(
                    {
                      length: totalPages,
                    },
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
                      onClick={() =>
                        setCurrentPage(pageNumber)
                      }
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
                        Math.min(
                          totalPages,
                          current + 1,
                        ),
                      )
                    }
                  >
                    <ChevronRight
                      size={17}
                      strokeWidth={1.8}
                    />
                  </button>
                </div>
              </footer>
            )}
        </div>
      </main>

      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      {selectedBooking && (
        <BookingModal
          booking={selectedBooking}
          onClose={() =>
            setSelectedBookingId(null)
          }
          onCancel={handleCancelBooking}
          onViewSummary={() =>
            goToViewSummary(
              selectedBooking.mongoId,
            )
          }
        />
      )}
    </>
  );
}