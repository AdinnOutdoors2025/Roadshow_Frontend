"use client";

import { useEffect, useMemo, useState } from "react";

/* =========================================================
   UPDATE VEHICLE IMAGE PATH HERE

   The image must be inside your public folder.
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

type SortMode = "newest" | "oldest" | "highest" | "lowest";

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
   No stroke icons are used.
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
   SAMPLE JSON DATA
   Replace this with your API response later.
========================================================= */

const bookingData: Booking[] = [
  {
    id: "RD-20260716-024",
    status: "Pending",
    requestedOn: "16 Jul 2026, 11:30 AM",
    requestedAt: "2026-07-16T11:30:00",
    startDate: "20 Jul 2026",
    endDate: "29 Jul 2026",
    duration: "10 Days",
    vehicleTypes: 2,
    vehicleCount: 3,
    estimatedTotal: 750000,
    customer: {
      name: "Kishore",
      company: "ABC Company",
      phone: "+91 98765 43210",
      email: "example@email.com",
    },
    vehicles: [
      {
        name: "19 Feet Single Side LED Van",
        startDate: "20 Jul 2026",
        endDate: "29 Jul 2026",
        duration: "10 Days",
        quantity: 2,
        ratePerDay: 25000,
        total: 500000,
      },
      {
        name: "22 Feet Double Side LED Van",
        startDate: "20 Jul 2026",
        endDate: "29 Jul 2026",
        duration: "10 Days",
        quantity: 1,
        ratePerDay: 25000,
        total: 250000,
      },
    ],
  },
  {
    id: "RD-20260710-018",
    status: "Confirmed",
    requestedOn: "10 Jul 2026, 03:15 PM",
    requestedAt: "2026-07-10T15:15:00",
    startDate: "15 Jul 2026",
    endDate: "24 Jul 2026",
    duration: "10 Days",
    vehicleTypes: 1,
    vehicleCount: 1,
    estimatedTotal: 250000,
    customer: {
      name: "Arun Kumar",
      company: "Skyline Enterprises",
      phone: "+91 98765 12345",
      email: "arun@skyline.com",
    },
    vehicles: [
      {
        name: "19 Feet Single Side LED Van",
        startDate: "15 Jul 2026",
        endDate: "24 Jul 2026",
        duration: "10 Days",
        quantity: 1,
        ratePerDay: 25000,
        total: 250000,
      },
    ],
  },
  {
    id: "RD-20260705-012",
    status: "Ongoing",
    requestedOn: "05 Jul 2026, 10:45 AM",
    requestedAt: "2026-07-05T10:45:00",
    startDate: "12 Jul 2026",
    endDate: "22 Jul 2026",
    duration: "10 Days",
    vehicleTypes: 3,
    vehicleCount: 5,
    estimatedTotal: 1120000,
    customer: {
      name: "Pradeep",
      company: "Bright Media",
      phone: "+91 98765 22222",
      email: "pradeep@brightmedia.com",
    },
    vehicles: [
      {
        name: "19 Feet Single Side LED Van",
        startDate: "12 Jul 2026",
        endDate: "22 Jul 2026",
        duration: "10 Days",
        quantity: 2,
        ratePerDay: 25000,
        total: 500000,
      },
      {
        name: "22 Feet Double Side LED Van",
        startDate: "12 Jul 2026",
        endDate: "22 Jul 2026",
        duration: "10 Days",
        quantity: 2,
        ratePerDay: 26000,
        total: 520000,
      },
      {
        name: "Tata Ace LED Van",
        startDate: "12 Jul 2026",
        endDate: "22 Jul 2026",
        duration: "10 Days",
        quantity: 1,
        ratePerDay: 10000,
        total: 100000,
      },
    ],
  },
  {
    id: "RD-20260701-010",
    status: "Pending",
    requestedOn: "01 Jul 2026, 09:20 AM",
    requestedAt: "2026-07-01T09:20:00",
    startDate: "10 Jul 2026",
    endDate: "16 Jul 2026",
    duration: "7 Days",
    vehicleTypes: 1,
    vehicleCount: 2,
    estimatedTotal: 350000,
    customer: {
      name: "Ramesh",
      company: "Ramesh Agencies",
      phone: "+91 98765 33333",
      email: "ramesh@email.com",
    },
    vehicles: [
      {
        name: "19 Feet Single Side LED Van",
        startDate: "10 Jul 2026",
        endDate: "16 Jul 2026",
        duration: "7 Days",
        quantity: 2,
        ratePerDay: 25000,
        total: 350000,
      },
    ],
  },
  {
    id: "RD-20260628-009",
    status: "Pending",
    requestedOn: "28 Jun 2026, 04:30 PM",
    requestedAt: "2026-06-28T16:30:00",
    startDate: "05 Jul 2026",
    endDate: "11 Jul 2026",
    duration: "7 Days",
    vehicleTypes: 1,
    vehicleCount: 1,
    estimatedTotal: 175000,
    customer: {
      name: "Surya",
      company: "Surya Marketing",
      phone: "+91 98765 44444",
      email: "surya@email.com",
    },
    vehicles: [
      {
        name: "19 Feet Single Side LED Van",
        startDate: "05 Jul 2026",
        endDate: "11 Jul 2026",
        duration: "7 Days",
        quantity: 1,
        ratePerDay: 25000,
        total: 175000,
      },
    ],
  },
  {
    id: "RD-20260625-008",
    status: "Confirmed",
    requestedOn: "25 Jun 2026, 02:10 PM",
    requestedAt: "2026-06-25T14:10:00",
    startDate: "02 Jul 2026",
    endDate: "08 Jul 2026",
    duration: "7 Days",
    vehicleTypes: 1,
    vehicleCount: 1,
    estimatedTotal: 175000,
    customer: {
      name: "Vignesh",
      company: "Vignesh Traders",
      phone: "+91 98765 55555",
      email: "vignesh@email.com",
    },
    vehicles: [
      {
        name: "19 Feet Single Side LED Van",
        startDate: "02 Jul 2026",
        endDate: "08 Jul 2026",
        duration: "7 Days",
        quantity: 1,
        ratePerDay: 25000,
        total: 175000,
      },
    ],
  },
  {
    id: "RD-20260622-007",
    status: "Confirmed",
    requestedOn: "22 Jun 2026, 01:40 PM",
    requestedAt: "2026-06-22T13:40:00",
    startDate: "28 Jun 2026",
    endDate: "04 Jul 2026",
    duration: "7 Days",
    vehicleTypes: 1,
    vehicleCount: 2,
    estimatedTotal: 350000,
    customer: {
      name: "Naveen",
      company: "Naveen Solutions",
      phone: "+91 98765 66666",
      email: "naveen@email.com",
    },
    vehicles: [
      {
        name: "19 Feet Single Side LED Van",
        startDate: "28 Jun 2026",
        endDate: "04 Jul 2026",
        duration: "7 Days",
        quantity: 2,
        ratePerDay: 25000,
        total: 350000,
      },
    ],
  },
  {
    id: "RD-20260620-006",
    status: "Confirmed",
    requestedOn: "20 Jun 2026, 11:10 AM",
    requestedAt: "2026-06-20T11:10:00",
    startDate: "26 Jun 2026",
    endDate: "02 Jul 2026",
    duration: "7 Days",
    vehicleTypes: 1,
    vehicleCount: 1,
    estimatedTotal: 175000,
    customer: {
      name: "Ajay",
      company: "AJ Enterprises",
      phone: "+91 98765 77777",
      email: "ajay@email.com",
    },
    vehicles: [
      {
        name: "19 Feet Single Side LED Van",
        startDate: "26 Jun 2026",
        endDate: "02 Jul 2026",
        duration: "7 Days",
        quantity: 1,
        ratePerDay: 25000,
        total: 175000,
      },
    ],
  },
  {
    id: "RD-20260618-005",
    status: "Ongoing",
    requestedOn: "18 Jun 2026, 05:20 PM",
    requestedAt: "2026-06-18T17:20:00",
    startDate: "22 Jun 2026",
    endDate: "01 Jul 2026",
    duration: "10 Days",
    vehicleTypes: 2,
    vehicleCount: 3,
    estimatedTotal: 720000,
    customer: {
      name: "Sathish",
      company: "Sathish Media",
      phone: "+91 98765 88888",
      email: "sathish@email.com",
    },
    vehicles: [
      {
        name: "19 Feet Single Side LED Van",
        startDate: "22 Jun 2026",
        endDate: "01 Jul 2026",
        duration: "10 Days",
        quantity: 2,
        ratePerDay: 25000,
        total: 500000,
      },
      {
        name: "Tata Ace LED Van",
        startDate: "22 Jun 2026",
        endDate: "01 Jul 2026",
        duration: "10 Days",
        quantity: 1,
        ratePerDay: 22000,
        total: 220000,
      },
    ],
  },
  {
    id: "RD-20260615-004",
    status: "Completed",
    requestedOn: "15 Jun 2026, 12:00 PM",
    requestedAt: "2026-06-15T12:00:00",
    startDate: "18 Jun 2026",
    endDate: "24 Jun 2026",
    duration: "7 Days",
    vehicleTypes: 1,
    vehicleCount: 1,
    estimatedTotal: 175000,
    customer: {
      name: "Dinesh",
      company: "Dinesh Groups",
      phone: "+91 98765 99999",
      email: "dinesh@email.com",
    },
    vehicles: [
      {
        name: "19 Feet Single Side LED Van",
        startDate: "18 Jun 2026",
        endDate: "24 Jun 2026",
        duration: "7 Days",
        quantity: 1,
        ratePerDay: 25000,
        total: 175000,
      },
    ],
  },
  {
    id: "RD-20260612-003",
    status: "Completed",
    requestedOn: "12 Jun 2026, 03:30 PM",
    requestedAt: "2026-06-12T15:30:00",
    startDate: "15 Jun 2026",
    endDate: "21 Jun 2026",
    duration: "7 Days",
    vehicleTypes: 1,
    vehicleCount: 2,
    estimatedTotal: 350000,
    customer: {
      name: "Manoj",
      company: "Manoj Promotions",
      phone: "+91 98765 10101",
      email: "manoj@email.com",
    },
    vehicles: [
      {
        name: "19 Feet Single Side LED Van",
        startDate: "15 Jun 2026",
        endDate: "21 Jun 2026",
        duration: "7 Days",
        quantity: 2,
        ratePerDay: 25000,
        total: 350000,
      },
    ],
  },
  {
    id: "RD-20260610-002",
    status: "Cancelled",
    requestedOn: "10 Jun 2026, 10:00 AM",
    requestedAt: "2026-06-10T10:00:00",
    startDate: "14 Jun 2026",
    endDate: "20 Jun 2026",
    duration: "7 Days",
    vehicleTypes: 1,
    vehicleCount: 1,
    estimatedTotal: 175000,
    customer: {
      name: "Karthick",
      company: "Karthick Advertising",
      phone: "+91 98765 12121",
      email: "karthick@email.com",
    },
    vehicles: [
      {
        name: "19 Feet Single Side LED Van",
        startDate: "14 Jun 2026",
        endDate: "20 Jun 2026",
        duration: "7 Days",
        quantity: 1,
        ratePerDay: 25000,
        total: 175000,
      },
    ],
  },
];

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
    badge: "bg-[#FFF1E5] text-[#E87522]",
    label: "Pending Confirmation",
    dot: "bg-[#F28A36]",
  },
  Confirmed: {
    badge: "bg-[#EAF8ED] text-[#24883A]",
    label: "Booking Confirmed",
    dot: "bg-[#35A34D]",
  },
  Ongoing: {
    badge: "bg-[#EAF2FF] text-[#246CC8]",
    label: "Campaign Ongoing",
    dot: "bg-[#3A7BD5]",
  },
  Completed: {
    badge: "bg-[#EEEEF1] text-[#555B65]",
    label: "Campaign Completed",
    dot: "bg-[#777D87]",
  },
  Cancelled: {
    badge: "bg-[#FFEAEA] text-[#E33B43]",
    label: "Request Cancelled",
    dot: "bg-[#ED4C54]",
  },
};

function formatINR(value: number) {
  return `₹ ${value.toLocaleString("en-IN")}`;
}

/* =========================================================
   REUSABLE COMPONENTS
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
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#F2F3F5] text-[#555B65]">
        <FilledIcon name={icon} size={16} />
      </div>

      <div className="min-w-0 pt-0.5">
        <p className="text-[10px] font-medium text-[#8A9099]">
          {label}
        </p>

        <p className="mt-1 break-words text-[12px] font-semibold leading-5 text-[#25282D]">
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
      <p className="text-[9px] font-medium text-[#8A9099]">
        {label}
      </p>

      <p className="mt-1 text-[11px] font-semibold text-[#30343A]">
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
  const style = statusStyles[booking.status];

  return (
    <article className="grid overflow-hidden rounded-[22px] bg-white p-3 shadow-[0_12px_40px_rgba(25,31,40,0.07)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(25,31,40,0.1)] md:grid-cols-[210px_minmax(0,1fr)]">
      <div className="relative h-[170px] overflow-hidden rounded-[17px] bg-[#EFEFF1] md:h-full md:min-h-[155px]">
        <img
          src={VEHICLE_IMAGE}
          alt="Roadshow LED vehicle"
          className="h-full w-full object-cover"
        />

        <span
          className={`absolute left-3 top-3 inline-flex items-center gap-2 rounded-full px-3 py-2 text-[11px] font-bold shadow-sm ${style.badge}`}
        >
          <span
            className={`h-2 w-2 rounded-full ${style.dot}`}
          />

          {booking.status}
        </span>
      </div>

      <div className="grid min-w-0 gap-5 px-2 py-4 sm:px-5 xl:grid-cols-[220px_minmax(280px,1fr)_180px_150px] xl:items-center">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#8A9099]">
            Booking ID
          </p>

          <h3 className="mt-1 text-[17px] font-bold text-[#17191D]">
            {booking.id}
          </h3>

          <p className="mt-4 text-[10px] font-medium text-[#8A9099]">
            Requested on
          </p>

          <p className="mt-1 text-[12px] font-medium text-[#4C525B]">
            {booking.requestedOn}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#F3F4F6] text-[#555B65]">
              <FilledIcon name="calendar" size={16} />
            </div>

            <p className="text-[12px] font-semibold text-[#30343A]">
              {booking.startDate}
              <span className="mx-2 text-[#A1A6AE]">–</span>
              {booking.endDate}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#F3F4F6] text-[#555B65]">
              <FilledIcon name="clock" size={16} />
            </div>

            <p className="text-[12px] font-medium text-[#555B65]">
              {booking.duration}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#F3F4F6] text-[#555B65]">
              <FilledIcon name="vehicle" size={17} />
            </div>

            <p className="text-[12px] font-medium text-[#555B65]">
              {booking.vehicleTypes} vehicle{" "}
              {booking.vehicleTypes === 1 ? "type" : "types"}
              <span className="mx-2 text-[#A1A6AE]">•</span>
              {booking.vehicleCount}{" "}
              {booking.vehicleCount === 1 ? "vehicle" : "vehicles"}
            </p>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#8A9099]">
            Estimated Total
          </p>

          <p className="mt-2 text-[21px] font-bold tracking-tight text-[#151619]">
            {formatINR(booking.estimatedTotal)}
          </p>
        </div>

        <button
          type="button"
          onClick={onView}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-[14px] bg-[#111214] px-5 text-[12px] font-bold text-white shadow-[0_8px_20px_rgba(0,0,0,0.16)] transition hover:bg-[#292B2F] active:scale-[0.98]"
        >
          View Details

          <FilledIcon name="chevronRight" size={16} />
        </button>
      </div>
    </article>
  );
}

/* =========================================================
   VEHICLE ROW INSIDE POPUP
========================================================= */

function VehicleRow({ vehicle }: { vehicle: Vehicle }) {
  return (
    <div className="grid gap-4 rounded-[18px] bg-[#F7F8FA] p-3 sm:p-4 lg:grid-cols-[110px_minmax(0,1fr)_190px] lg:items-center">
      <div className="h-[100px] overflow-hidden rounded-[14px] bg-[#ECEEF1] lg:h-[82px]">
        <img
          src={VEHICLE_IMAGE}
          alt={vehicle.name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="min-w-0">
        <h4 className="text-[13px] font-bold text-[#23262A]">
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
              vehicle.quantity === 1 ? "Vehicle" : "Vehicles"
            }`}
          />
        </div>
      </div>

      <div className="rounded-[14px] bg-white p-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[10px] font-medium text-[#8A9099]">
            Rate / Day
          </span>

          <span className="text-[12px] font-semibold text-[#454A52]">
            {formatINR(vehicle.ratePerDay)}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <span className="text-[10px] font-medium text-[#8A9099]">
            Total
          </span>

          <span className="text-[14px] font-bold text-[#E5232A]">
            {formatINR(vehicle.total)}
          </span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   POPUP MODAL
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
  const style = statusStyles[booking.status];

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Booking details for ${booking.id}`}
      onClick={onClose}
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 backdrop-blur-[3px] sm:items-center sm:p-6"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="max-h-[94vh] w-full overflow-y-auto rounded-t-[30px] bg-[#F8F8F9] shadow-[0_-20px_60px_rgba(0,0,0,0.22)] sm:max-w-[1180px] sm:rounded-[30px] sm:shadow-[0_30px_90px_rgba(0,0,0,0.26)]"
      >
        <div className="sticky top-0 z-20 bg-[#F8F8F9]/95 px-4 pb-4 pt-3 backdrop-blur-xl sm:px-7 sm:pt-6">
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#D7D9DD] sm:hidden" />

          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-[18px] font-bold text-[#202226] sm:text-[21px]">
                  Booking ID: {booking.id}
                </h2>

                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-[10px] font-bold ${style.badge}`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${style.dot}`}
                  />

                  {style.label}
                </span>
              </div>

              <p className="mt-2 text-[11px] font-medium text-[#737983]">
                Requested on {booking.requestedOn}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close booking details"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[#353A42] shadow-sm transition hover:bg-[#ECEEF1] active:scale-95"
            >
              <FilledIcon name="close" size={17} />
            </button>
          </div>
        </div>

        <div className="px-4 pb-6 sm:px-7 sm:pb-8">
          <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="space-y-4">
              <div className="rounded-[22px] bg-white p-5 shadow-[0_10px_35px_rgba(22,27,34,0.05)]">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-[13px] bg-[#F1F2F4] text-[#40454D]">
                    <FilledIcon name="user" size={18} />
                  </div>

                  <h3 className="text-[14px] font-bold text-[#202226]">
                    Customer Details
                  </h3>
                </div>

                <div className="mt-6 space-y-5">
                  <DetailItem
                    icon="user"
                    label="Name"
                    value={booking.customer.name}
                  />

                  <DetailItem
                    icon="company"
                    label="Company Name"
                    value={booking.customer.company}
                  />

                  <DetailItem
                    icon="phone"
                    label="Phone Number"
                    value={booking.customer.phone}
                  />

                  <DetailItem
                    icon="mail"
                    label="Email Address"
                    value={booking.customer.email}
                  />
                </div>
              </div>

              <div className="rounded-[22px] bg-[#17181B] p-5 text-white shadow-[0_14px_40px_rgba(0,0,0,0.14)]">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-[13px] bg-white/12">
                    <FilledIcon name="support" size={19} />
                  </div>

                  <h3 className="text-[14px] font-bold">
                    Need Help?
                  </h3>
                </div>

                <p className="mt-4 text-[11px] leading-5 text-white/65">
                  Our support team is ready to assist you with your
                  booking.
                </p>

                <a
                  href="/contact"
                  className="mt-5 flex h-11 w-full items-center justify-center rounded-[13px] bg-white text-[12px] font-bold text-[#17181B] transition hover:bg-[#F0F1F3] active:scale-[0.98]"
                >
                  Contact Support
                </a>
              </div>
            </aside>

            <div className="space-y-4">
              <div className="rounded-[22px] bg-white p-4 shadow-[0_10px_35px_rgba(22,27,34,0.05)] sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-[13px] bg-[#F1F2F4] text-[#40454D]">
                    <FilledIcon name="vehicle" size={19} />
                  </div>

                  <h3 className="text-[14px] font-bold text-[#202226]">
                    Vehicles &amp; Booking Details
                  </h3>
                </div>

                <div className="mt-5 space-y-3">
                  {booking.vehicles.map((vehicle, index) => (
                    <VehicleRow
                      key={`${booking.id}-${vehicle.name}-${index}`}
                      vehicle={vehicle}
                    />
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[22px] bg-white p-5 shadow-[0_10px_35px_rgba(22,27,34,0.05)]">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-[13px] bg-[#F1F2F4] text-[#40454D]">
                      <FilledIcon name="vehicle" size={18} />
                    </div>

                    <h3 className="text-[14px] font-bold text-[#202226]">
                      Amount Summary
                    </h3>
                  </div>

                  <div className="mt-6 space-y-4 text-[12px] text-[#555B64]">
                    <div className="flex items-center justify-between gap-4">
                      <span>Subtotal</span>

                      <span className="font-semibold text-[#30343A]">
                        {formatINR(booking.estimatedTotal)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span>Taxes &amp; Charges</span>

                      <span className="font-semibold text-[#30343A]">
                        ₹ 0
                      </span>
                    </div>

                    <div className="h-px bg-[#ECEEF1]" />

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[13px] font-bold text-[#202226]">
                        Estimated Total
                      </span>

                      <span className="text-[16px] font-bold text-[#E5232A]">
                        {formatINR(booking.estimatedTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-[22px] bg-white p-5 shadow-[0_10px_35px_rgba(22,27,34,0.05)]">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-[13px] bg-[#F1F2F4] text-[#40454D]">
                      <FilledIcon name="send" size={18} />
                    </div>

                    <h3 className="text-[14px] font-bold text-[#202226]">
                      What Happens Next?
                    </h3>
                  </div>

                  <p className="mt-5 text-[12px] leading-6 text-[#626872]">
                    Our team will contact you soon to confirm vehicle
                    availability, campaign requirements, route details
                    and the final booking amount.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:flex sm:flex-wrap sm:justify-end">
            <button
              type="button"
              onClick={onDownload}
              className="flex h-12 items-center justify-center gap-3 rounded-[14px] bg-[#EDEEF1] px-5 text-[12px] font-bold text-[#30343A] transition hover:bg-[#E2E4E8] active:scale-[0.98]"
            >
              <FilledIcon name="download" size={17} />

              Download Summary
            </button>

            {booking.status !== "Cancelled" &&
              booking.status !== "Completed" && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex h-12 items-center justify-center gap-3 rounded-[14px] bg-[#FFE9EA] px-5 text-[12px] font-bold text-[#D9343C] transition hover:bg-[#FFDCDD] active:scale-[0.98]"
                >
                  <FilledIcon name="trash" size={17} />

                  Cancel Request
                </button>
              )}

            <button
              type="button"
              onClick={onClose}
              className="h-12 rounded-[14px] bg-white px-7 text-[12px] font-bold text-[#30343A] shadow-sm transition hover:bg-[#ECEEF1] active:scale-[0.98]"
            >
              Close
            </button>

            <a
              href="/contact"
              className="flex h-12 items-center justify-center gap-3 rounded-[14px] bg-[#111214] px-7 text-[12px] font-bold text-white shadow-[0_8px_20px_rgba(0,0,0,0.16)] transition hover:bg-[#292B2F] active:scale-[0.98]"
            >
              <FilledIcon name="support" size={17} />

              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function MyBookingsPage() {
  const [bookings, setBookings] =
    useState<Booking[]>(bookingData);

  const [activeTab, setActiveTab] =
    useState<StatusFilter>("All");

  const [searchValue, setSearchValue] = useState("");

  const [sortMode, setSortMode] =
    useState<SortMode>("newest");

  const [filterOpen, setFilterOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const [selectedBookingId, setSelectedBookingId] =
    useState<string | null>(null);

  const pageSize = 3;

  const statusCounts = useMemo(() => {
    return {
      All: bookings.length,
      Pending: bookings.filter(
        (booking) => booking.status === "Pending",
      ).length,
      Confirmed: bookings.filter(
        (booking) => booking.status === "Confirmed",
      ).length,
      Ongoing: bookings.filter(
        (booking) => booking.status === "Ongoing",
      ).length,
      Completed: bookings.filter(
        (booking) => booking.status === "Completed",
      ).length,
      Cancelled: bookings.filter(
        (booking) => booking.status === "Cancelled",
      ).length,
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    let result = bookings.filter((booking) => {
      const statusMatches =
        activeTab === "All" || booking.status === activeTab;

      const searchMatches = booking.id
        .toLowerCase()
        .includes(searchValue.trim().toLowerCase());

      return statusMatches && searchMatches;
    });

    if (sortMode === "newest") {
      result = [...result].sort(
        (a, b) =>
          new Date(b.requestedAt).getTime() -
          new Date(a.requestedAt).getTime(),
      );
    }

    if (sortMode === "oldest") {
      result = [...result].sort(
        (a, b) =>
          new Date(a.requestedAt).getTime() -
          new Date(b.requestedAt).getTime(),
      );
    }

    if (sortMode === "highest") {
      result = [...result].sort(
        (a, b) => b.estimatedTotal - a.estimatedTotal,
      );
    }

    if (sortMode === "lowest") {
      result = [...result].sort(
        (a, b) => a.estimatedTotal - b.estimatedTotal,
      );
    }

    return result;
  }, [activeTab, bookings, searchValue, sortMode]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBookings.length / pageSize),
  );

  const safePage = Math.min(currentPage, totalPages);

  const visibleBookings = filteredBookings.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const selectedBooking =
    bookings.find(
      (booking) => booking.id === selectedBookingId,
    ) ?? null;

  function handleTabChange(tab: StatusFilter) {
    setActiveTab(tab);
    setCurrentPage(1);
  }

  function handleCancelBooking() {
    if (!selectedBooking) return;

    const shouldCancel = window.confirm(
      `Are you sure you want to cancel ${selectedBooking.id}?`,
    );

    if (!shouldCancel) return;

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

  function handleDownloadSummary() {
    if (!selectedBooking) return;

    const jsonContent = JSON.stringify(
      selectedBooking,
      null,
      2,
    );

    const blob = new Blob([jsonContent], {
      type: "application/json",
    });

    const downloadUrl = URL.createObjectURL(blob);

    const downloadLink = document.createElement("a");

    downloadLink.href = downloadUrl;
    downloadLink.download = `${selectedBooking.id}-summary.json`;

    document.body.appendChild(downloadLink);

    downloadLink.click();
    downloadLink.remove();

    URL.revokeObjectURL(downloadUrl);
  }

  return (
    <>
      <main className="min-h-screen bg-[#F7F7F8] px-4 pb-12 pt-[130px] text-[#17181B] sm:px-6 sm:pt-[140px] lg:px-8 lg:pt-[150px]">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-[30px] font-bold tracking-[-0.04em] text-[#151515] sm:text-[34px]">
                My Bookings
              </h1>

              <p className="mt-2 text-[13px] font-medium text-[#666C75]">
                View and manage your roadshow booking requests.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <label className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-[14px] bg-white px-4 shadow-[0_8px_25px_rgba(25,31,40,0.05)] lg:w-[320px]">
                <FilledIcon
                  name="search"
                  size={18}
                  className="shrink-0 text-[#6D737C]"
                />

                <input
                  value={searchValue}
                  onChange={(event) => {
                    setSearchValue(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by Booking ID..."
                  className="min-w-0 flex-1 bg-transparent text-[12px] font-medium text-[#25282E] outline-none placeholder:text-[#A1A6AE]"
                />
              </label>

              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setFilterOpen((current) => !current)
                  }
                  className="flex h-12 w-full items-center justify-center gap-3 rounded-[14px] bg-white px-5 text-[12px] font-bold text-[#2A2D32] shadow-[0_8px_25px_rgba(25,31,40,0.05)] transition hover:bg-[#EEEEF1] active:scale-[0.98] sm:w-[150px]"
                >
                  <FilledIcon name="filter" size={17} />

                  Filters
                </button>

                {filterOpen && (
                  <div className="absolute right-0 top-[56px] z-40 w-full min-w-[210px] rounded-[16px] bg-white p-2 shadow-[0_18px_55px_rgba(0,0,0,0.16)]">
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
                        onClick={() => {
                          setSortMode(
                            option.value as SortMode,
                          );
                          setCurrentPage(1);
                          setFilterOpen(false);
                        }}
                        className={`block w-full rounded-[11px] px-4 py-3 text-left text-[12px] font-semibold transition ${
                          sortMode === option.value
                            ? "bg-[#17181B] text-white"
                            : "text-[#555B64] hover:bg-[#F2F3F5]"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 overflow-x-auto pb-2">
            <div className="flex min-w-max gap-3">
              {tabs.map((tab) => {
                const active = activeTab === tab;

                const inactiveCountStyle =
                  tab === "All"
                    ? "bg-[#E7E8EB] text-[#555B65]"
                    : statusStyles[tab].badge;

                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => handleTabChange(tab)}
                    className={`flex h-12 min-w-[150px] items-center justify-center gap-4 rounded-[14px] px-5 text-[12px] font-bold transition active:scale-[0.98] ${
                      active
                        ? "bg-[#111214] text-white shadow-[0_8px_22px_rgba(0,0,0,0.18)]"
                        : "bg-white text-[#272A2F] shadow-[0_8px_25px_rgba(25,31,40,0.04)] hover:bg-[#EEEEF1]"
                    }`}
                  >
                    <span>{tab}</span>

                    <span
                      className={`grid h-6 min-w-6 place-items-center rounded-lg px-1.5 text-[10px] font-bold ${
                        active
                          ? "bg-white/15 text-white"
                          : inactiveCountStyle
                      }`}
                    >
                      {statusCounts[tab]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {visibleBookings.length > 0 ? (
              visibleBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onView={() =>
                    setSelectedBookingId(booking.id)
                  }
                />
              ))
            ) : (
              <div className="rounded-[24px] bg-white px-6 py-20 text-center shadow-[0_12px_40px_rgba(25,31,40,0.06)]">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#F1F2F4] text-[#777D87]">
                  <FilledIcon name="search" size={23} />
                </div>

                <p className="mt-4 text-[14px] font-bold text-[#30343A]">
                  No bookings found
                </p>

                <p className="mt-2 text-[12px] text-[#777D87]">
                  Try changing the search or selected status.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-4 text-[11px] font-medium text-[#666C75] sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing{" "}
              {visibleBookings.length === 0
                ? 0
                : (safePage - 1) * pageSize + 1}{" "}
              to{" "}
              {Math.min(
                safePage * pageSize,
                filteredBookings.length,
              )}{" "}
              of {filteredBookings.length} bookings
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous page"
                disabled={safePage === 1}
                onClick={() =>
                  setCurrentPage((current) =>
                    Math.max(1, current - 1),
                  )
                }
                className="grid h-10 w-10 place-items-center rounded-[12px] bg-white text-[#454A52] shadow-sm transition hover:bg-[#EDEEF1] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FilledIcon name="arrowLeft" size={16} />
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
                  onClick={() =>
                    setCurrentPage(pageNumber)
                  }
                  className={`grid h-10 min-w-10 place-items-center rounded-[12px] px-3 text-[11px] font-bold transition active:scale-95 ${
                    safePage === pageNumber
                      ? "bg-[#111214] text-white shadow-[0_6px_16px_rgba(0,0,0,0.16)]"
                      : "bg-white text-[#454A52] shadow-sm hover:bg-[#EDEEF1]"
                  }`}
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
                className="grid h-10 w-10 place-items-center rounded-[12px] bg-white text-[#454A52] shadow-sm transition hover:bg-[#EDEEF1] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FilledIcon name="arrowRight" size={16} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {selectedBooking && (
        <BookingModal
          booking={selectedBooking}
          onClose={() => setSelectedBookingId(null)}
          onCancel={handleCancelBooking}
          onDownload={handleDownloadSummary}
        />
      )}
    </>
  );
}