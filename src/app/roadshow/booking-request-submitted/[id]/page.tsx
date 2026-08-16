/* eslint-disable */
// @ts-nocheck
"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Calendar,
  Check,
  CalendarPlus,
  ClipboardList,
  Copy,
  Download,
  IndianRupee,
  LoaderCircle,
  Megaphone,
  Truck,
} from "lucide-react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import { baseUrl } from "../../../../BaseUrl";
import { useAuth } from "@/context/AuthContext";
import { clientAuthHeaders } from "@/lib/roadshowAuthToken";
import { useScrollReveal } from "@/components/motion/useScrollReveal";

import {
  downloadBookingSummaryPdf,
} from "@/lib/bookingSummaryPdf";

import "./page.css";

/* =========================================================
   TYPES
========================================================= */

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

  customerCategory?:
    | "individual"
    | "organization";

  gstNumber?: string;

  companyName?: string;

  panNumber?: string;

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

  userId?:
    | string
    | {
        _id?: string;
      }
    | null;
};

type DownloadStatus =
  | "idle"
  | "loading"
  | "success"
  | "error";

/* =========================================================
   HELPERS
========================================================= */

const ownerIdOf = (
  request: ClientRequest | null,
): string => {
  const owner = request?.userId;

  if (!owner) return "";

  return typeof owner === "object"
    ? String(owner._id || "")
    : String(owner);
};

const STATUS_LABELS: Record<
  number,
  string
> = {
  0: "Request Submitted",
  1: "In Progress",
  2: "Converted to Order",
};

const formatMoney = (
  value?: number,
) =>
  new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  ).format(Number(value) || 0);

const formatDateTime = (
  value?: string,
) => {
  if (!value) return "—";

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
};

const formatDate = (
  value?: string,
) => {
  if (!value) return "—";

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(date);
};

const formatPhone = (
  value?: string,
) => {
  const digits = String(
    value || "",
  ).replace(/\D/g, "");

  if (digits.length === 10) {
    return `+91 ${digits.slice(
      0,
      5,
    )} ${digits.slice(5)}`;
  }

  return value || "—";
};

const getVehicleName = (
  vehicle: ClientRequestVehicle,
) => {
  if (
    vehicle.vehicleType &&
    typeof vehicle.vehicleType ===
      "object" &&
    vehicle.vehicleType.name
  ) {
    return vehicle.vehicleType.name;
  }

  return (
    vehicle.vehicleName ||
    "Roadshow Vehicle"
  );
};

/* =========================================================
   PAGE
========================================================= */

export default function BookingRequestSubmittedPage() {
  const params =
    useParams<{
      id: string;
    }>();

  const router =
    useRouter();

  const requestMongoId =
    Array.isArray(params?.id)
      ? params.id[0]
      : params?.id;

  const {
    user,
    authLoading,
  } = useAuth();

  const [
    request,
    setRequest,
  ] =
    useState<ClientRequest | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  /* =========================================================
     DOWNLOAD STATES
  ========================================================= */

  const [
    downloadStatus,
    setDownloadStatus,
  ] =
    useState<DownloadStatus>(
      "idle",
    );

  const [
    downloadError,
    setDownloadError,
  ] =
    useState("");

  const [
    copied,
    setCopied,
  ] =
    useState(false);

  const downloadButtonRef =
    useRef<HTMLButtonElement>(
      null,
    );

  const downloadFeedbackTimerRef =
    useRef<number | null>(
      null,
    );

  /* =========================================================
     OWNER / AUTH GATE
  ========================================================= */

  useEffect(() => {
    if (authLoading) return;

    if (user) return;

    setRequest(null);

    setError(
      "Please sign in to view this booking request.",
    );

    setLoading(false);

    try {
      sessionStorage.removeItem(
        "roadshow_last_client_request",
      );
    } catch {
      // Storage unavailable.
    }
  }, [
    user,
    authLoading,
  ]);

  /* =========================================================
     FETCH REQUEST
  ========================================================= */

  useEffect(() => {
    if (authLoading) return;

    if (!user) return;

    if (!requestMongoId) {
      setError(
        "Booking request ID is missing.",
      );

      setLoading(false);

      return;
    }

    let active = true;

    const loadRequest =
      async () => {
        try {
          setLoading(true);

          setError("");

          const response =
            await fetch(
              `${baseUrl}/client-requests/${requestMongoId}`,
              {
                method: "GET",

                cache:
                  "no-store",

                headers:
                  clientAuthHeaders(),
              },
            );

          const result =
            await response
              .json()
              .catch(
                () => null,
              );

          if (
            !response.ok ||
            !result?.success ||
            !result?.data
          ) {
            throw new Error(
              result?.message ||
                "Unable to load the booking request.",
            );
          }

          const ownerId =
            ownerIdOf(
              result.data,
            );

          if (
            ownerId &&
            ownerId !==
              String(
                user._id,
              )
          ) {
            throw new Error(
              "The booking request could not be found.",
            );
          }

          if (active) {
            setRequest(
              result.data,
            );
          }
        } catch (
          fetchError
        ) {
          const fallback =
            sessionStorage.getItem(
              "roadshow_last_client_request",
            );

          if (fallback) {
            try {
              const parsed =
                JSON.parse(
                  fallback,
                ) as ClientRequest;

              const fallbackOwnerId =
                ownerIdOf(
                  parsed,
                );

              if (
                parsed?._id ===
                  requestMongoId &&
                (!fallbackOwnerId ||
                  fallbackOwnerId ===
                    String(
                      user._id,
                    ))
              ) {
                if (
                  active
                ) {
                  setRequest(
                    parsed,
                  );
                }

                return;
              }
            } catch {
              // Ignore invalid
              // fallback data.
            }
          }

          if (active) {
            setError(
              fetchError instanceof
                Error
                ? fetchError.message
                : "Unable to load the booking request.",
            );
          }
        } finally {
          if (active) {
            setLoading(
              false,
            );
          }
        }
      };

    loadRequest();

    return () => {
      active = false;
    };
  }, [
    requestMongoId,
    user,
    authLoading,
  ]);

  /* =========================================================
     CLEANUP TIMERS
  ========================================================= */

  useEffect(() => {
    return () => {
      if (
        downloadFeedbackTimerRef.current
      ) {
        window.clearTimeout(
          downloadFeedbackTimerRef.current,
        );
      }
    };
  }, []);

  /* =========================================================
     BOOKING SUMMARY DATA
  ========================================================= */

  const vehicleSummary =
    useMemo(() => {
      if (
        !request
          ?.vehicleTypes
          ?.length
      ) {
        return "—";
      }

      return request.vehicleTypes
        .map(
          (
            vehicle,
          ) => {
            const quantity =
              Math.max(
                Number(
                  vehicle.quantity ||
                    1,
                ),
                1,
              );

            const name =
              getVehicleName(
                vehicle,
              );

            return quantity >
              1
              ? `${quantity} × ${name}`
              : name;
          },
        )
        .join(", ");
    }, [request]);

  const totalVehicleCount =
    useMemo(() => {
      if (
        !request
          ?.vehicleTypes
          ?.length
      ) {
        return 0;
      }

      return request.vehicleTypes.reduce(
        (
          sum,
          vehicle,
        ) =>
          sum +
          Math.max(
            Number(
              vehicle.quantity ||
                1,
            ),
            1,
          ),
        0,
      );
    }, [request]);

  const durationLines =
    useMemo(() => {
      if (
        !request
          ?.vehicleTypes
          ?.length
      ) {
        return ["—"];
      }

      const first =
        request
          .vehicleTypes[0];

      const sameDates =
        request.vehicleTypes.every(
          (
            vehicle,
          ) =>
            String(
              vehicle.fromDate,
            ) ===
              String(
                first.fromDate,
              ) &&
            String(
              vehicle.toDate,
            ) ===
              String(
                first.toDate,
              ),
        );

      if (sameDates) {
        return [
          `${formatDate(
            first.fromDate,
          )} → ${formatDate(
            first.toDate,
          )}`,
        ];
      }

      return request.vehicleTypes.map(
        (
          vehicle,
        ) =>
          `${getVehicleName(
            vehicle,
          )}: ${formatDate(
            vehicle.fromDate,
          )} → ${formatDate(
            vehicle.toDate,
          )}`,
      );
    }, [request]);

  const campaignSummary =
    useMemo(() => {
      const campaignVehicle =
        request?.vehicleTypes?.find(
          (
            vehicle,
          ) =>
            vehicle.campaignName ||
            vehicle.campaignType,
        );

      return {
        title:
          campaignVehicle?.campaignName ||
          campaignVehicle?.campaignType ||
          request?.campaignType ||
          "Roadshow Campaign",

        sub:
          campaignVehicle?.campaignName &&
          campaignVehicle?.campaignType
            ? campaignVehicle.campaignType
            : request?.location ||
              "",
      };
    }, [request]);

  const durationDaysLabel =
    useMemo(() => {
      const days =
        request
          ?.vehicleTypes?.[0]
          ?.totalDays;

      return days
        ? `(${days} Day${
            days === 1
              ? ""
              : "s"
          })`
        : "";
    }, [request]);

  const taxLabel =
    request?.cgstAmount ||
    request?.sgstAmount
      ? "GST"
      : request?.igstAmount
        ? "IGST"
        : "GST";

  const taxAmount =
    (request?.cgstAmount ||
      0) +
      (request?.sgstAmount ||
        0) ||
    request?.igstAmount ||
    request?.gstAmount ||
    0;

  /* =========================================================
     COPY REQUEST ID
  ========================================================= */

  const handleCopyRequestId =
    async () => {
      if (
        !request?.clientOrderId
      ) {
        return;
      }

      try {
        await navigator.clipboard.writeText(
          request.clientOrderId,
        );

        setCopied(true);

        window.setTimeout(
          () =>
            setCopied(
              false,
            ),
          1600,
        );
      } catch {
        // Clipboard unavailable.
      }
    };

  /* =========================================================
     PLAN ANOTHER CAMPAIGN
  ========================================================= */

  const handlePlanAnotherCampaign =
    () => {
      sessionStorage.removeItem(
        "roadshow_booking_draft",
      );

      sessionStorage.removeItem(
        "roadshow_campaign_payload",
      );

      sessionStorage.removeItem(
        "roadshow_last_client_request",
      );

      router.push(
        "/#our-roadshow-vehicles",
      );
    };

  /* =========================================================
     DOWNLOAD NOTE -> SCROLL TO ACTIONS
  ========================================================= */

  const handleSummaryNoteClick =
    () => {
      /*
        Clicking the Booking Summary hint only smooth-scrolls
        to the action button section. No highlight/orbit/focus
        animation is triggered.
      */
      buttonsRef.current?.scrollIntoView(
        {
          behavior:
            "smooth",
          block:
            "center",
          inline:
            "nearest",
        },
      );
    };

  /* =========================================================
     DOWNLOAD PDF WITH LOADING STATE
  ========================================================= */

  const handleDownloadSummary =
    async () => {
      if (
        !request ||
        downloadStatus ===
          "loading"
      ) {
        return;
      }

      if (
        downloadFeedbackTimerRef.current
      ) {
        window.clearTimeout(
          downloadFeedbackTimerRef.current,
        );
      }

      setDownloadError("");

      setDownloadStatus(
        "loading",
      );

      try {
        /*
          downloadBookingSummaryPdf already contains
          your existing PDF-generation logic.

          Awaiting it here preserves that functionality
          while giving the UI a proper loading state.
        */
        await Promise.resolve(
          downloadBookingSummaryPdf(
            request,
          ),
        );

        setDownloadStatus(
          "success",
        );

        downloadFeedbackTimerRef.current =
          window.setTimeout(
            () => {
              setDownloadStatus(
                "idle",
              );
            },
            1800,
          );
      } catch (
        pdfError
      ) {
        console.error(
          pdfError,
        );

        setDownloadStatus(
          "error",
        );

        setDownloadError(
          pdfError instanceof
            Error
            ? pdfError.message
            : "Unable to generate the booking summary PDF. Please try again.",
        );

        downloadFeedbackTimerRef.current =
          window.setTimeout(
            () => {
              setDownloadStatus(
                "idle",
              );
            },
            4500,
          );
      }
    };

  /* =========================================================
     SCROLL REVEAL
  ========================================================= */

  const iconRef =
    useRef<HTMLDivElement>(
      null,
    );

  const headerRef =
    useRef<HTMLDivElement>(
      null,
    );

  const requestIdRef =
    useRef<HTMLDivElement>(
      null,
    );

  const summaryCardRef =
    useRef<HTMLDivElement>(
      null,
    );

  const nextStepsRef =
    useRef<HTMLDivElement>(
      null,
    );

  const buttonsRef =
    useRef<HTMLDivElement>(
      null,
    );

  useScrollReveal(
    iconRef,
    {
      direction: "up",
      distance: 18,
      duration: 0.7,
      delay: 0,
      start: "top 95%",
    },
  );

  useScrollReveal(
    headerRef,
    {
      direction: "up",
      distance: 16,
      duration: 0.6,
      delay: 0.08,
      start: "top 95%",
    },
  );

  useScrollReveal(
    requestIdRef,
    {
      direction: "up",
      distance: 14,
      duration: 0.55,
      delay: 0.14,
      start: "top 95%",
    },
  );

  useScrollReveal(
    summaryCardRef,
    {
      direction: "up",
      distance: 24,
      duration: 0.7,
      delay: 0.02,
      start: "top 90%",
    },
  );

  useScrollReveal(
    nextStepsRef,
    {
      direction: "up",
      distance: 22,
      duration: 0.65,
      delay: 0.06,
      start: "top 90%",
    },
  );

  useScrollReveal(
    buttonsRef,
    {
      direction: "up",
      distance: 18,
      duration: 0.55,
      delay: 0.08,
      start: "top 92%",
    },
  );

  /* =========================================================
     LOADING SCREEN
  ========================================================= */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-4 font-['Outfit'] text-[#171719]">
        <div className="RS_PageLoadingState">
          <span className="RS_PageLoadingSpinner">
            <LoaderCircle />
          </span>

          <div>
            <p className="RS_PageLoadingTitle">
              Loading booking request
            </p>

            <p className="RS_PageLoadingText">
              Preparing your booking confirmation...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     ERROR SCREEN
  ========================================================= */

  if (
    error ||
    !request
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-4 font-['Outfit'] text-[#171719]">
        <section className="w-full max-w-[560px] rounded-[28px] border border-[#eeeeee] bg-white p-7 text-center shadow-[-5px_4px_30px_rgba(0,0,0,0.08)] sm:p-10">
          <h1 className="text-[26px] font-normal">
            Unable to open
            booking request
          </h1>

          <p className="mt-3 text-[15px] leading-6 text-[#787878]">
            {error ||
              "The booking request could not be found."}
          </p>

          <button
            type="button"
            onClick={
              handlePlanAnotherCampaign
            }
            className="mt-7 h-14 w-full rounded-[10px] bg-[#d2d2d7] text-[17px] font-normal text-black transition hover:bg-[#c3c3c9]"
          >
            Plan Another
            Campaign
          </button>
        </section>
      </main>
    );
  }

  const statusLabel =
    STATUS_LABELS[
      Number(
        request.status ??
          0,
      )
    ] ||
    "Request Submitted";

  /* =========================================================
     DOWNLOAD BUTTON CONTENT
  ========================================================= */

  const downloading =
    downloadStatus ===
    "loading";

  const downloadSuccess =
    downloadStatus ===
    "success";

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main className="RS_ThankYouRoot min-h-screen bg-white px-4 pb-12 pt-10 font-['Outfit'] text-black sm:px-6 sm:pb-16 sm:pt-14 lg:px-8 lg:pb-20 lg:pt-16">
      <section className="booking_reqThankPgMain RS_ThankYouShell mx-auto flex w-full max-w-[1200px] flex-col items-center">

        {/* =================================================
            SUCCESS ICON
        ================================================= */}

        <div
          ref={iconRef}
          className="RS_ThankYouIconWrap relative flex items-center justify-center"
        >
          <span
            className="RS_ThankYouRing RS_ThankYouRing--outer"
            aria-hidden="true"
          />

          <span
            className="RS_ThankYouRing RS_ThankYouRing--inner"
            aria-hidden="true"
          />

          <span
            className="RS_ThankYouDot RS_ThankYouDot--1"
            aria-hidden="true"
          />

          <span
            className="RS_ThankYouDot RS_ThankYouDot--2"
            aria-hidden="true"
          />

          <span
            className="RS_ThankYouDiamond RS_ThankYouDiamond--1"
            aria-hidden="true"
          />

          <span
            className="RS_ThankYouDiamond RS_ThankYouDiamond--2"
            aria-hidden="true"
          />

          <span
            className="RS_ThankYouDot RS_ThankYouDot--3"
            aria-hidden="true"
          />

          <div className="RS_ThankYouIconCircle flex h-[110px] w-[110px] items-center justify-center rounded-full bg-[linear-gradient(155deg,#2FBE63_0%,#1C8C46_100%)] sm:h-[150px] sm:w-[150px] lg:h-[172px] lg:w-[172px]">
            <Check
              aria-hidden="true"
              className="RS_ThankYouCheck h-[46px] w-[46px] text-white sm:h-[62px] sm:w-[62px] lg:h-[72px] lg:w-[72px]"
              strokeWidth={
                3
              }
            />
          </div>
        </div>

        {/* =================================================
            HEADING
        ================================================= */}

        <header
          ref={headerRef}
          className="mt-3 text-center lg:mt-1"
        >
          <h1 className="RS_ThankYouHeading text-[30px] font-normal leading-none sm:text-[36px] lg:text-[42px]">
            Thank You!
          </h1>

          <p className="RS_ThankYouDesc mx-auto mt-3 max-w-[560px] text-[14px] font-normal leading-[1.5] text-[#787878] sm:text-[16px] lg:text-[18px]">
            Your Vehicle Booking
            Request has been
            Submitted Successfully.

            <br className="hidden sm:block" />

            Our Team will Contact
            You Shortly.
          </p>
        </header>

        {/* =================================================
            REQUEST ID
        ================================================= */}

        <div
          ref={requestIdRef}
          className="mt-6 flex flex-wrap items-center justify-center gap-3"
        >
          <div className="RS_RequestIdPill inline-flex items-center gap-3 rounded-full border border-[#e3e3e3] bg-white px-5 py-3 shadow-[0_6px_20px_rgba(31,31,38,0.06)]">
            <span className="RS_ReqIdLabel text-[13px] font-normal text-[#787878] sm:text-[14px]">
              Request ID:
            </span>

            <span className="RS_ReqIdValue text-[14px] font-semibold text-black sm:text-[16px]">
              {
                request.clientOrderId
              }
            </span>

            <button
              type="button"
              onClick={
                handleCopyRequestId
              }
              aria-label="Copy request ID"
              className="RS_CopyButton grid h-7 w-7 place-items-center rounded-full text-[#787878] transition hover:bg-[#f1f1f4] hover:text-black"
            >
              {copied ? (
                <Check
                  size={
                    15
                  }
                  className="text-[#1f9254]"
                />
              ) : (
                <Copy
                  size={
                    15
                  }
                />
              )}
            </button>
          </div>

          <span className="RS_StatusChip inline-flex items-center gap-2 rounded-full bg-[#f1f1f4] px-4 py-2 text-[12px] font-medium text-[#4c4c53] sm:text-[13px]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1f9254]" />

            {
              statusLabel
            }
          </span>
        </div>

        {/* =================================================
            BOOKING SUMMARY
        ================================================= */}

        <section
          ref={
            summaryCardRef
          }
          className="RS_SummaryCard mt-8 w-full rounded-[28px] border border-[#eeeeee] bg-white px-5 py-6 shadow-[0_14px_45px_rgba(31,31,38,0.06)] sm:px-7 sm:py-7 lg:mt-9 lg:rounded-[32px] lg:px-9 lg:py-8"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#f1f1f4] text-[#303035]">
              <ClipboardList
                size={
                  17
                }
              />
            </span>

            <h2 className="RS_CardTitle text-[16px] font-medium text-black sm:text-[18px]">
              Booking Summary
            </h2>
          </div>

          <div className="RS_SummaryGrid mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">

            {/* DURATION */}

            <div className="RS_SummaryTile flex items-start gap-3">
              <span className="RS_SummaryTileIcon grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f1f1f4] text-[#4c4c53]">
                <Calendar
                  size={
                    17
                  }
                />
              </span>

              <div className="min-w-0">
                <p className="RS_TileLabel text-[12px] font-medium text-[#8a8a92]">
                  Duration
                </p>

                {durationLines.map(
                  (
                    line,
                    index,
                  ) => (
                    <p
                      key={
                        index
                      }
                      className="RS_TileValue mt-1 text-[13px] font-semibold leading-5 text-[#202024]"
                    >
                      {
                        line
                      }
                    </p>
                  ),
                )}

                {durationDaysLabel ? (
                  <p className="RS_TileSub mt-0.5 text-[12px] text-[#8a8a92]">
                    {
                      durationDaysLabel
                    }
                  </p>
                ) : null}
              </div>
            </div>

            {/* VEHICLES */}

            <div className="RS_SummaryTile flex items-start gap-3">
              <span className="RS_SummaryTileIcon grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f1f1f4] text-[#4c4c53]">
                <Truck
                  size={
                    17
                  }
                />
              </span>

              <div className="min-w-0">
                <p className="RS_TileLabel text-[12px] font-medium text-[#8a8a92]">
                  Vehicles
                </p>

                <p className="RS_TileValue mt-1 text-[13px] font-semibold text-[#202024]">
                  {
                    totalVehicleCount
                  }{" "}
                  Vehicle
                  {totalVehicleCount ===
                  1
                    ? ""
                    : "s"}
                </p>

                <p
                  className="RS_TileSub mt-0.5 truncate text-[12px] text-[#8a8a92]"
                  title={
                    vehicleSummary
                  }
                >
                  {
                    vehicleSummary
                  }
                </p>
              </div>
            </div>

            {/* CAMPAIGN */}

            <div className="RS_SummaryTile flex items-start gap-3">
              <span className="RS_SummaryTileIcon grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f1f1f4] text-[#4c4c53]">
                <Megaphone
                  size={
                    17
                  }
                />
              </span>

              <div className="min-w-0">
                <p className="RS_TileLabel text-[12px] font-medium text-[#8a8a92]">
                  Campaign
                </p>

                <p className="RS_TileValue mt-1 break-words text-[13px] font-semibold text-[#202024]">
                  {
                    campaignSummary.title
                  }
                </p>

                {campaignSummary.sub ? (
                  <p
                    className="RS_TileSub mt-0.5 truncate text-[12px] text-[#8a8a92]"
                    title={
                      campaignSummary.sub
                    }
                  >
                    {
                      campaignSummary.sub
                    }
                  </p>
                ) : null}
              </div>
            </div>

            {/* TOTAL */}

            <div className="RS_SummaryTile flex items-start gap-3">
              <span className="RS_SummaryTileIcon grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f1f1f4] text-[#4c4c53]">
                <IndianRupee
                  size={
                    17
                  }
                />
              </span>

              <div className="min-w-0">
                <p className="RS_TileLabel text-[12px] font-medium text-[#8a8a92]">
                  Estimated Total
                </p>

                <p className="RS_TileValue mt-1 text-[15px] font-semibold text-[#D70000]">
                  {formatMoney(
                    request.estimatedTotal,
                  )}
                </p>

                {request.estimatedTotal ? (
                  <p className="RS_TileSub mt-0.5 text-[12px] text-[#8a8a92]">
                    Taxable{" "}
                    {formatMoney(
                      request.subtotal,
                    )}{" "}
                    +{" "}
                    {
                      taxLabel
                    }{" "}
                    {formatMoney(
                      taxAmount,
                    )}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          {/* =================================================
              CLICKABLE DOWNLOAD NOTE
          ================================================= */}

          <button
            type="button"
            onClick={
              handleSummaryNoteClick
            }
            className="RS_SummaryDownloadHint mt-6"
          >
            <span className="RS_SummaryDownloadHintIcon">
              <Download
                size={
                  15
                }
              />
            </span>

            <span>
              Need vehicle-wise
              pricing, GST and
              campaign details?

              <strong>
                {" "}
                Go to Download
                Summary
              </strong>
            </span>

            <span className="RS_SummaryDownloadHintArrow">
              ↓
            </span>
          </button>
        </section>

        {/* =================================================
            WHAT HAPPENS NEXT
        ================================================= */}

        <section
          ref={
            nextStepsRef
          }
          className="RS_NextStepsCard mt-5 w-full rounded-[28px] border border-[#eeeeee] bg-white px-5 py-6 shadow-[0_14px_45px_rgba(31,31,38,0.06)] sm:px-7 sm:py-7 lg:rounded-[32px] lg:px-9 lg:py-8"
        >
          <h2 className="RS_CardTitle text-[16px] font-medium text-black sm:text-[18px]">
            What Happens Next?
          </h2>

          <div className="RS_NextStepsRow mt-6 flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-0">
            {[
              {
                title:
                  "Request Submitted",

                body:
                  "Your booking request is logged against the Request ID above and routed to our operations team for review.",
              },

              {
                title:
                  "In Progress",

                body:
                  "We verify vehicle availability for your dates, confirm campaign details and pricing, and reach out on your registered phone or email.",
              },

              {
                title:
                  "Converted to Order",

                body:
                  "Once confirmed, your request becomes a confirmed booking order — you'll get the final schedule and invoice details.",
              },
            ].map(
              (
                step,
                index,
                steps,
              ) => {
                const isCurrentStep =
                  Number(
                    request.status ??
                      0,
                  ) ===
                  index;

                return (
                  <div
                    key={
                      step.title
                    }
                    className="RS_NextStep flex flex-1 items-start gap-3 sm:flex-col sm:items-start sm:gap-0"
                  >
                    <div className="RS_NextStepHeadRow flex items-center sm:w-full">
                      <span
                        className={`RS_NextStepNumber grid h-8 w-8 shrink-0 place-items-center rounded-full text-[13px] font-semibold ${
                          isCurrentStep
                            ? "bg-[#1C8C46] text-white"
                            : "bg-[#f1f1f4] text-[#202024]"
                        }`}
                      >
                        {
                          index +
                          1
                        }
                      </span>

                      {index <
                      steps.length -
                        1 ? (
                        <span
                          className="RS_NextStepConnector hidden flex-1 sm:block"
                          aria-hidden="true"
                        />
                      ) : null}
                    </div>

                    <div className="sm:mt-3 sm:pr-6">
                      <p className="RS_StepTitle text-[14px] font-semibold text-black">
                        {
                          step.title
                        }

                        {isCurrentStep ? (
                          <span className="ml-2 text-[11px] font-medium text-[#1C8C46]">
                            (current)
                          </span>
                        ) : null}
                      </p>

                      <p className="RS_StepBody mt-1 max-w-[220px] text-[12.5px] leading-[1.5] text-[#787878]">
                        {
                          step.body
                        }
                      </p>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </section>

        {/* =================================================
            BOOKING UPDATE NOTE
        ================================================= */}

        <p className="mt-6 max-w-[640px] text-center text-[13px] leading-[1.5] text-[#787878] sm:text-[14px]">
          Booking updates will
          be sent to{" "}
          {request.email ||
            "your registered email"}{" "}
          and{" "}
          {formatPhone(
            request.phone,
          )}
          .
        </p>

        {/* =================================================
            ACTION BUTTONS
        ================================================= */}

        <div
          ref={
            buttonsRef
          }
          className="RS_ThankYouActions mt-6 grid w-full grid-cols-1 gap-3 sm:grid-cols-3"
        >
          {/* VIEW BOOKINGS */}

          <button
            type="button"
            onClick={() =>
              router.push(
                "/roadshow/my-bookings",
              )
            }
            className="RS_ActionButton RS_ActionButton--dark flex h-[56px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#1a1a1c] px-4 text-[14px] font-medium text-white transition duration-200 hover:bg-[#d70000] focus:outline-none focus:ring-2 focus:ring-black/20 sm:text-[15px]"
          >
            <ClipboardList
              size={
                17
              }
            />

            View My Bookings
          </button>

          {/* DOWNLOAD SUMMARY */}

          <div
            className={`RS_DownloadActionWrap ${
              downloading
                ? "RS_DownloadActionWrap--loading"
                : ""
            }`}
          >
            <button
              ref={
                downloadButtonRef
              }
              type="button"
              disabled={
                downloading
              }
              aria-busy={
                downloading
              }
              onClick={
                handleDownloadSummary
              }
              className="RS_ActionButton RS_ActionButton--download flex h-[56px] w-full items-center justify-center gap-2 rounded-[10px] px-4 text-[14px] font-medium text-white focus:outline-none sm:text-[15px]"
            >
              {downloading ? (
                <>
                  <LoaderCircle
                    size={
                      18
                    }
                    className="RS_DownloadSpinner"
                  />

                  Preparing PDF...
                </>
              ) : downloadSuccess ? (
                <>
                  <Check
                    size={
                      18
                    }
                  />

                  Downloaded
                </>
              ) : (
                <>
                  <Download
                    size={
                      17
                    }
                  />

                  Download Summary
                </>
              )}
            </button>
          </div>

          {/* PLAN ANOTHER CAMPAIGN */}

          <button
            type="button"
            onClick={
              handlePlanAnotherCampaign
            }
            className="RS_ActionButton RS_ActionButton--plan flex h-[56px] w-full items-center justify-center gap-2 rounded-[10px] border border-[#e3e3e3] bg-white px-4 text-[14px] font-medium text-black focus:outline-none focus:ring-2 focus:ring-black/20 sm:text-[15px]"
          >
            <CalendarPlus
              size={
                17
              }
            />

            Plan Another Campaign
          </button>
        </div>

        {/* =================================================
            DOWNLOAD STATUS MESSAGE
        ================================================= */}

        <div
          className="RS_DownloadStatusArea"
          aria-live="polite"
          aria-atomic="true"
        >
          {downloading ? (
            <p className="RS_DownloadStatus RS_DownloadStatus--loading">
              <LoaderCircle
                size={
                  14
                }
                className="RS_DownloadSpinner"
              />

              Generating your
              booking summary.
              Please wait...
            </p>
          ) : downloadSuccess ? (
            <p className="RS_DownloadStatus RS_DownloadStatus--success">
              <Check
                size={
                  14
                }
              />

              Booking summary
              downloaded
              successfully.
            </p>
          ) : downloadStatus ===
              "error" &&
              
            downloadError ? (
            <p className="RS_DownloadStatus RS_DownloadStatus--error">
              {
                downloadError
              }
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}