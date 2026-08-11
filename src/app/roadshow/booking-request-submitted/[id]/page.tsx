/* eslint-disable */
// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, LoaderCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { baseUrl } from "../../../../BaseUrl";
import Image from "next/image";
import './page.css';

type VehicleTypeValue =
  | string
  | {
    _id?: string;
    name?: string;
  }
  | null;

type ClientRequestVehicle = {
  vehicleId?: string;
  vehicleType?: VehicleTypeValue;
  vehicleName?: string;
  quantity: number;
  fromDate: string;
  toDate: string;
  totalDays?: number;

  /* Campaign fields captured by the Campaign Details step. Every one is
     optional — a request placed before that step existed simply has none
     of them, and each block below renders only when its data is present. */
  campaignType?: string;
  campaignName?: string;
  campaignLocation?: string;
  pricePerDay?: number;
  lineTotal?: number;
  rentalCost?: number;
  needPromoter?: boolean;
  promoterType?: string;
  promoterGender?: string;
  promoterLanguage?: string[];
  promoterQuantity?: number;
  promoterCost?: number;
  campaignImages?: string[];
  campaignVideos?: string[];
};

type ClientRequest = {
  _id: string;
  clientOrderId: string;
  name: string;
  email?: string;
  phone: string;
  campaignType?: string;
  location?: string;
  route?: string;
  addOns?: string[];
  vehicleTypes: ClientRequestVehicle[];

  /* Billing identity — populated only for GST-verified agencies */
  customerCategory?: "individual" | "organization";
  gstNumber?: string;
  companyName?: string;
  panNumber?: string;

  /* Totals as stored by the endpoint */
  subtotal?: number;
  gstPercentage?: number;
  gstAmount?: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  promoterTotal?: number;
  estimatedTotal?: number;

  status?: number;
  createdAt?: string;
};

/* 0 / 1 / 2 as defined on the ClientRequestOrder schema */
const STATUS_LABELS: Record<number, string> = {
  0: "Request Submitted",
  1: "In Progress",
  2: "Converted to Order",
};

/** "₹1,25,000.00" — matches the Review Order breakdown the customer just saw. */
const formatMoney = (value?: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const formatDateTime = (value?: string) => {
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
};

const formatDate = (value?: string) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatPhone = (value?: string) => {
  const digits = String(value || "").replace(/\D/g, "");

  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }

  return value || "—";
};

const getVehicleName = (vehicle: ClientRequestVehicle) => {
  if (
    vehicle.vehicleType &&
    typeof vehicle.vehicleType === "object" &&
    vehicle.vehicleType.name
  ) {
    return vehicle.vehicleType.name;
  }

  return vehicle.vehicleName || "Roadshow Vehicle";
};

export default function BookingRequestSubmittedPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const requestMongoId = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  const [request, setRequest] = useState<ClientRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!requestMongoId) {
      setError("Booking request ID is missing.");
      setLoading(false);
      return;
    }

    let active = true;

    const loadRequest = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${baseUrl}/client-requests/${requestMongoId}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const result = await response.json().catch(() => null);

        if (!response.ok || !result?.success || !result?.data) {
          throw new Error(
            result?.message || "Unable to load the booking request."
          );
        }

        if (active) {
          setRequest(result.data);
        }
      } catch (fetchError) {
        const fallback = sessionStorage.getItem(
          "roadshow_last_client_request"
        );

        if (fallback) {
          try {
            const parsed = JSON.parse(fallback) as ClientRequest;

            if (parsed?._id === requestMongoId) {
              if (active) setRequest(parsed);
              return;
            }
          } catch {
            // Ignore invalid fallback data and show the API error below.
          }
        }

        if (active) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Unable to load the booking request."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadRequest();

    return () => {
      active = false;
    };
  }, [requestMongoId]);

  const vehicleSummary = useMemo(() => {
    if (!request?.vehicleTypes?.length) return "—";

    return request.vehicleTypes
      .map((vehicle) => {
        const quantity = Math.max(Number(vehicle.quantity || 1), 1);
        const name = getVehicleName(vehicle);

        return quantity > 1 ? `${quantity} × ${name}` : name;
      })
      .join(", ");
  }, [request]);

  const durationLines = useMemo(() => {
    if (!request?.vehicleTypes?.length) return ["—"];

    const first = request.vehicleTypes[0];
    const sameDates = request.vehicleTypes.every(
      (vehicle) =>
        String(vehicle.fromDate) === String(first.fromDate) &&
        String(vehicle.toDate) === String(first.toDate)
    );

    if (sameDates) {
      return [`${formatDate(first.fromDate)} → ${formatDate(first.toDate)}`];
    }

    return request.vehicleTypes.map(
      (vehicle) =>
        `${getVehicleName(vehicle)}: ${formatDate(
          vehicle.fromDate
        )} → ${formatDate(vehicle.toDate)}`
    );
  }, [request]);

  const details = request
    ? [
      {
        label: "Selected Vehicle",
        value: vehicleSummary,
      },
      {
        label: "Duration",
        value: durationLines,
      },
    ]
    : [];

  const handlePlanAnotherCampaign = () => {
    sessionStorage.removeItem("roadshow_booking_draft");
    sessionStorage.removeItem("roadshow_campaign_payload");
    sessionStorage.removeItem("roadshow_last_client_request");

    // Sends the user back home, scrolled to the "Our Roadshow Vehicles" section
    // (id="our-roadshow-vehicles" set in HomePageSection1.tsx).
    router.push("/#our-roadshow-vehicles");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-4 font-['Outfit'] text-[#171719]">
        <div className="flex items-center gap-3 text-[16px] text-[#666666]">
          <LoaderCircle className="h-5 w-5 animate-spin" />
          Loading booking request...
        </div>
      </main>
    );
  }

  if (error || !request) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-4 font-['Outfit'] text-[#171719]">
        <section className="w-full max-w-[560px] rounded-[28px] border border-[#eeeeee] bg-white p-7 text-center shadow-[-5px_4px_30px_rgba(0,0,0,0.08)] sm:p-10">
          <h1 className="text-[26px] font-normal">Unable to open booking request</h1>
          <p className="mt-3 text-[15px] leading-6 text-[#787878]">
            {error || "The booking request could not be found."}
          </p>
          <button
            type="button"
            onClick={handlePlanAnotherCampaign}
            className="mt-7 h-14 w-full rounded-[10px] bg-[#d2d2d7] text-[17px] font-normal text-black transition hover:bg-[#c3c3c9]"
          >
            Plan Another Campaign
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 pb-12 pt-10 font-['Outfit'] text-black sm:px-6 sm:pb-16 sm:pt-14 lg:px-8 lg:pb-20 lg:pt-16">
      <section className="  booking_reqThankPgMain mx-auto flex w-full max-w-[1430px] flex-col items-center">
        <header className=" text-center">
          <h1 className="text-[28px] font-normal leading-none sm:text-[34px] lg:text-[40px]">
            Booking Request Submitted
          </h1>

          <p className="mx-auto mt-3 max-w-[760px] text-[14px] font-normal leading-[1.45] text-[#787878] sm:text-[17px] lg:text-[22px] lg:leading-[1.25]">
            Thank You. Your Vehicle Booking Request has been Received.
            <br className="hidden sm:block" />
            Our Team will Contact You Shortly Using Your Registered Account
            Details.
          </p>
        </header>

        <div className="mt-7 flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[linear-gradient(180deg,#E3000F_0%,#7D0008_100%)] sm:h-[172px] sm:w-[172px] lg:mt-8 lg:h-[170px] lg:w-[170px]">
          {/* <Check
            aria-hidden="true"
            className="h-[64px] w-[64px] text-white sm:h-[80px] sm:w-[80px] lg:h-[96px] lg:w-[96px]"
            strokeWidth={2.6}
          /> */}
          <Image
            src="/images/assets/rdsw_OrderThankyouPgIcon.svg"
            alt=""
            width={90}
            height={90}
            className=""
          />
        </div>

        <div className="mt-4 text-center lg:mt-5">
          <p className="text-[28px] font-normal leading-none sm:text-[34px] lg:text-[40px]">
            Request ID
          </p>
          <p className="mt-2 break-words text-[20px] font-normal leading-tight sm:text-[25px] lg:text-[30px]">
            {request.clientOrderId}
          </p>
        </div>

        <section className="mt-8 w-full rounded-[28px] bg-white px-4 py-6 shadow-[-5px_4px_30px_rgba(0,0,0,0.10)] sm:px-7 sm:py-8 lg:mt-10 lg:rounded-[50px] lg:px-[80px] lg:py-[70px] xl:px-[145px] xl:py-[122px]">
          <div className="mx-auto w-full max-w-[1140px]">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-5">
              {details.map((item) => (
                <article
                  key={item.label}
                  className="min-h-[112px] rounded-[10px] border border-[#e3e3e3] bg-white px-5 py-5 sm:min-h-[118px] lg:min-h-[126px] lg:px-6 lg:py-6"
                >
                  <p className="text-[13px] font-normal leading-none text-black sm:text-[14px] lg:text-[16px]">
                    {item.label}
                  </p>
                  <p className="mt-3 break-words text-[16px] font-normal leading-[1.35] text-black sm:text-[18px] lg:text-[20px]">
                    {Array.isArray(item.value)
                      ? item.value.map((line, i) => (
                        <span key={i} className="block">
                          {line}
                        </span>
                      ))
                      : item.value}
                  </p>
                </article>
              ))}

              {request.route ? (
                <article className="min-h-[112px] rounded-[10px] border border-[#e3e3e3] bg-white px-5 py-5 sm:col-span-2 sm:min-h-[118px] lg:min-h-[126px] lg:px-6 lg:py-6">
                  <p className="text-[13px] font-normal leading-none text-black sm:text-[14px] lg:text-[16px]">
                    Route
                  </p>
                  <p className="mt-3 break-words text-[16px] font-normal leading-[1.35] text-black sm:text-[18px] lg:text-[20px]">
                    {request.route}
                  </p>
                </article>
              ) : null}
            </div>

            {/* ── Booking status & submission ────────────────────────────
                Additive: the endpoint has always returned `status` and
                `createdAt`; this page simply did not show them. */}
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:mt-5 lg:gap-5">
              <article className="min-h-[112px] rounded-[10px] border border-[#e3e3e3] bg-white px-5 py-5 sm:min-h-[118px] lg:min-h-[126px] lg:px-6 lg:py-6">
                <p className="text-[13px] font-normal leading-none text-black sm:text-[14px] lg:text-[16px]">
                  Booking Status
                </p>
                <p className="mt-3 break-words text-[16px] font-normal leading-[1.35] text-black sm:text-[18px] lg:text-[20px]">
                  {STATUS_LABELS[Number(request.status ?? 0)] ||
                    "Request Submitted"}
                </p>
              </article>

              <article className="min-h-[112px] rounded-[10px] border border-[#e3e3e3] bg-white px-5 py-5 sm:min-h-[118px] lg:min-h-[126px] lg:px-6 lg:py-6">
                <p className="text-[13px] font-normal leading-none text-black sm:text-[14px] lg:text-[16px]">
                  Submitted On
                </p>
                <p className="mt-3 break-words text-[16px] font-normal leading-[1.35] text-black sm:text-[18px] lg:text-[20px]">
                  {formatDateTime(request.createdAt)}
                </p>
              </article>
            </div>

            {/* ── Client & GST details ───────────────────────────────────── */}
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:mt-5 lg:gap-5">
              <article className="rounded-[10px] border border-[#e3e3e3] bg-white px-5 py-5 lg:px-6 lg:py-6">
                <p className="text-[13px] font-normal leading-none text-black sm:text-[14px] lg:text-[16px]">
                  Client Details
                </p>

                <p className="mt-3 break-words text-[16px] font-normal leading-[1.45] text-black sm:text-[18px] lg:text-[20px]">
                  <span className="block">{request.name || "—"}</span>
                  <span className="block">{request.email || "—"}</span>
                  <span className="block">{formatPhone(request.phone)}</span>
                </p>
              </article>

              {request.gstNumber ? (
                <article className="rounded-[10px] border border-[#e3e3e3] bg-white px-5 py-5 lg:px-6 lg:py-6">
                  <p className="text-[13px] font-normal leading-none text-black sm:text-[14px] lg:text-[16px]">
                    GST Details
                  </p>

                  <p className="mt-3 break-words text-[16px] font-normal leading-[1.45] text-black sm:text-[18px] lg:text-[20px]">
                    <span className="block">{request.gstNumber}</span>
                    <span className="block">
                      {request.companyName || "—"}
                    </span>
                    <span className="block">
                      PAN {request.panNumber || "—"}
                    </span>
                  </p>
                </article>
              ) : null}
            </div>

            {/* ── Per-vehicle campaign details ───────────────────────────── */}
            {request.vehicleTypes?.length ? (
              <div className="mt-3 grid grid-cols-1 gap-3 lg:mt-5 lg:gap-5">
                {request.vehicleTypes.map((vehicle, index) => (
                  <article
                    key={`${vehicle.vehicleId || index}`}
                    className="rounded-[10px] border border-[#e3e3e3] bg-white px-5 py-5 lg:px-6 lg:py-6"
                  >
                    <p className="text-[13px] font-normal leading-none text-black sm:text-[14px] lg:text-[16px]">
                      Vehicle {index + 1} · {getVehicleName(vehicle)}
                    </p>

                    <div className="mt-3 grid grid-cols-1 gap-2 text-[15px] font-normal leading-[1.45] text-black sm:grid-cols-2 sm:text-[17px] lg:text-[18px]">
                      <span className="block">
                        Quantity: {vehicle.quantity}
                      </span>

                      <span className="block">
                        Dates: {formatDate(vehicle.fromDate)} →{" "}
                        {formatDate(vehicle.toDate)}
                      </span>

                      {vehicle.campaignName ? (
                        <span className="block">
                          Campaign: {vehicle.campaignName}
                        </span>
                      ) : null}

                      {vehicle.campaignType ? (
                        <span className="block">
                          Campaign Type: {vehicle.campaignType}
                        </span>
                      ) : null}

                      {vehicle.campaignLocation ? (
                        <span className="block">
                          Location: {vehicle.campaignLocation}
                        </span>
                      ) : null}

                      {vehicle.needPromoter ? (
                        <span className="block">
                          Promoter: {vehicle.promoterType || "—"}
                          {vehicle.promoterGender
                            ? ` · ${vehicle.promoterGender}`
                            : ""}
                          {vehicle.promoterLanguage?.length
                            ? ` · ${vehicle.promoterLanguage.join(", ")}`
                            : ""}
                          {vehicle.promoterQuantity
                            ? ` · Qty ${vehicle.promoterQuantity}`
                            : ""}
                        </span>
                      ) : null}

                      {vehicle.lineTotal ? (
                        <span className="block">
                          Line Total: {formatMoney(vehicle.lineTotal)}
                        </span>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            ) : null}

            {/* ── Pricing breakdown ──────────────────────────────────────── */}
            {request.estimatedTotal ? (
              <article className="mt-3 rounded-[10px] border border-[#e3e3e3] bg-white px-5 py-5 lg:mt-5 lg:px-6 lg:py-6">
                <p className="text-[13px] font-normal leading-none text-black sm:text-[14px] lg:text-[16px]">
                  Pricing Breakdown
                </p>

                <div className="mt-4 flex flex-col gap-2 text-[15px] font-normal text-black sm:text-[17px] lg:text-[18px]">
                  <div className="flex items-center justify-between gap-4">
                    <span>Taxable Amount</span>
                    <span>{formatMoney(request.subtotal)}</span>
                  </div>

                  {request.promoterTotal ? (
                    <div className="flex items-center justify-between gap-4">
                      <span>Promoter Charges (included)</span>
                      <span>{formatMoney(request.promoterTotal)}</span>
                    </div>
                  ) : null}

                  {/* CGST/SGST when the split was stored, otherwise the flat
                      GST line every earlier request carries. */}
                  {request.cgstAmount || request.sgstAmount ? (
                    <>
                      <div className="flex items-center justify-between gap-4">
                        <span>
                          CGST {(Number(request.gstPercentage) || 0) / 2}%
                        </span>
                        <span>{formatMoney(request.cgstAmount)}</span>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span>
                          SGST {(Number(request.gstPercentage) || 0) / 2}%
                        </span>
                        <span>{formatMoney(request.sgstAmount)}</span>
                      </div>
                    </>
                  ) : request.igstAmount ? (
                    <div className="flex items-center justify-between gap-4">
                      <span>IGST {request.gstPercentage || 0}%</span>
                      <span>{formatMoney(request.igstAmount)}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      <span>GST {request.gstPercentage || 0}%</span>
                      <span>{formatMoney(request.gstAmount)}</span>
                    </div>
                  )}

                  <div className="mt-2 flex items-center justify-between gap-4 border-t border-[#e3e3e3] pt-3 font-medium">
                    <span>Grand Total</span>
                    <span>{formatMoney(request.estimatedTotal)}</span>
                  </div>
                </div>
              </article>
            ) : null}

            <p className="mt-6 text-center text-[14px] font-normal leading-[1.5] text-black sm:text-[16px] lg:mt-7 lg:text-[20px]">
              Booking updates will be sent to {request.email || "your registered email"} and {formatPhone(request.phone)}.
            </p>

            <button
              type="button"
              onClick={handlePlanAnotherCampaign}
              className="mt-6 flex h-[64px] w-full items-center justify-center rounded-[10px] bg-[#d2d2d7] px-5 text-[18px] font-normal text-black transition duration-200 hover:bg-[#c3c3c9] focus:outline-none focus:ring-2 focus:ring-black/20 sm:h-[78px] sm:text-[22px] lg:mt-8 lg:h-[105px] lg:text-[28px]"
            >
              Plan Another Campaign
            </button>

            {/* Secondary actions. Download Summary is deliberately inert and
                labelled as such rather than hidden — it is a known upcoming
                feature, and a disabled control says that more honestly than
                a missing one. */}
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/roadshow/my-bookings?request=${encodeURIComponent(
                      request.clientOrderId
                    )}`
                  )
                }
                className="flex h-[56px] w-full items-center justify-center rounded-[10px] border border-[#1a1a1c] bg-[#1a1a1c] px-4 text-[15px] font-normal text-white transition duration-200 hover:bg-[#d70000] hover:border-[#d70000] focus:outline-none focus:ring-2 focus:ring-black/20 sm:text-[16px]"
              >
                View Booking
              </button>

              <button
                type="button"
                disabled
                title="Downloadable summaries are coming soon"
                className="flex h-[56px] w-full cursor-not-allowed items-center justify-center rounded-[10px] border border-[#e3e3e3] bg-white px-4 text-[15px] font-normal text-[#a0a0a0] sm:text-[16px]"
              >
                Download Summary
              </button>

              <button
                type="button"
                onClick={() => router.push("/roadshow/my-bookings")}
                className="flex h-[56px] w-full items-center justify-center rounded-[10px] border border-[#d2d2d7] bg-white px-4 text-[15px] font-normal text-black transition duration-200 hover:bg-[#f3f3f4] focus:outline-none focus:ring-2 focus:ring-black/20 sm:text-[16px]"
              >
                Back to Orders
              </button>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
