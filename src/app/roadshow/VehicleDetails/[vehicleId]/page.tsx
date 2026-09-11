/* eslint-disable */
// @ts-nocheck
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  useParams,
  useRouter,
} from "next/navigation";
import toast from "react-hot-toast";

import DatePicker from "@/components/calendar/calendar_reusable/calender";
import { ButtonHover as VehicleDetailsBookNowBtn } from "@/components/Client/Reusable_Components/ButtonHover";
import '../../../../components/Client/HomePageSections/HomePageSection1.css';
import {
  formatCurrency,
  formatDateForApi,
  formatDateRange,
} from "@/app/utils/currency";
import { useAuth } from "@/context/AuthContext";
import { useScrollLock } from "@/hooks/useScrollLock";
import {
  FALLBACK_VEHICLE_IMAGE,
  fetchRoadshowVehicleById,
  type RoadshowVehicle,
} from "@/lib/roadshowVehicles";
import { addToCart } from "@/lib/roadshowCart";
import {
  buildFlexRows,
  buildSpecGroups,
  isHybridScreenType,
} from "@/lib/vehicleSpecGroups";

/* P4 / P6 display-version descriptions (techSpecs.displayVersion) */
const DISPLAY_VERSION_DESC: Record<string, string> = {
  P4: "P4 · 4mm ",
  P6: "P6 · 6mm ",
};

/* Appends a unit only when the backend value is a bare number,
   so a value that already carries its unit is never doubled. */
const withUnit = (value: any, unit: string): string => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  return /^[\d.]+$/.test(raw) ? `${raw} ${unit}` : raw;
};

type BookingReadyPopupProps = {
  open: boolean;
  userName?: string;
  vehicleName: string;
  checkIn: Date | null;
  checkOut: Date | null;
  onClose: () => void;
  onContinue: () => void;
  continuing?: boolean;
};

function BookingReadyPopup({
  open,
  userName,
  vehicleName,
  checkIn,
  checkOut,
  onClose,
  onContinue,
  continuing = false,
}: BookingReadyPopupProps) {
  const [mounted] = useState(
    () => typeof document !== "undefined"
  );

  useScrollLock(open);

  useEffect(() => {
    if (!open) return;

    const closeWithEscape = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener(
      "keydown",
      closeWithEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        closeWithEscape
      );
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-9999 flex overflow-y-auto bg-black/35 px-4 py-6 backdrop-blur-[1px]"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !continuing
        ) {
          onClose();
        }
      }}
    >
      <section className="relative w-full max-w-110 m-auto rounded-[28px] bg-white p-7 text-center shadow-[0_28px_80px_rgba(0,0,0,0.24)] sm:p-9">
        <button
          type="button"
          onClick={onClose}
          disabled={continuing}
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-[#f2f2f2] text-[20px] text-black disabled:cursor-not-allowed disabled:opacity-40"
        >
          ×
        </button>

        <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-full bg-[#fce8e8]">
          <div className="flex h-13 w-13 items-center justify-center rounded-full bg-[#d70000] text-white">
            ✓
          </div>
        </div>

        <h2 className="mt-6 text-[25px] font-bold text-black">
          Hi{userName ? ` ${userName}` : ""}, you are ready to book!
        </h2>

        <p className="mt-3 text-[15px] leading-[1.6] text-[#666666]">
          Continue to enter your campaign details and add more vehicles.
        </p>

        <div className="mt-5 rounded-2xl bg-[#f7f7f7] px-4 py-3">
          <p className="font-semibold">
            {vehicleName}
          </p>

          <p className="mt-1 text-[13px] text-[#666666]">
            {formatDateRange(
              checkIn,
              checkOut,
              {
                pattern: "dd MMM yyyy",
                fallback:
                  "Dates not selected",
              }
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={onContinue}
          disabled={continuing}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-black px-7 py-3.5 text-[14px] font-semibold text-white transition hover:bg-[#d70000] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {continuing && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}

          {continuing ? "Redirecting..." : "Continue Booking"}
        </button>
      </section>
    </div>,
    document.body,
  );
}

export default function VehicleDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const vehicleId = String(
    params?.vehicleId || ""
  );

  const {
    user,
    openAuth,
    open: authModalOpen,
  } = useAuth();

  const [vehicle, setVehicle] =
    useState<RoadshowVehicle | null>(null);

  const [loadingVehicle, setLoadingVehicle] =
    useState(true);

  const [vehicleError, setVehicleError] =
    useState("");

  const [currentImageIndex, setCurrentImageIndex] =
    useState(0);

  const [checkIn, setCheckIn] =
    useState<Date | null>(null);

  const [checkOut, setCheckOut] =
    useState<Date | null>(null);

  const [checkingLogin, setCheckingLogin] =
    useState(false);

  const [waitingForLogin, setWaitingForLogin] =
    useState(false);

  const [bookingReadyOpen, setBookingReadyOpen] =
    useState(false);

  const [redirectingToCampaign, setRedirectingToCampaign] =
    useState(false);

  /* Only meaningful when the vehicle is hybrid — see isHybrid below. Reset
     to LED whenever a different vehicle loads, same as the old spec popup. */
  const [activeSpecTab, setActiveSpecTab] =
    useState<"led" | "flex">("led");

  const loginModalOpenedRef = useRef(false);

  const leftColumnRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);

  const loadVehicle = useCallback(async () => {
    if (!vehicleId) {
      setVehicleError(
        "Vehicle ID is missing in the URL."
      );

      setLoadingVehicle(false);
      return;
    }

    try {
      setLoadingVehicle(true);
      setVehicleError("");

      const selectedVehicle =
        await fetchRoadshowVehicleById(vehicleId);

      setVehicle(selectedVehicle);
    } catch (error) {
      console.error(error);

      setVehicleError(
        error instanceof Error
          ? error.message
          : "Unable to load vehicle."
      );
    } finally {
      setLoadingVehicle(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    loadVehicle();
  }, [loadVehicle]);

  useEffect(() => {
    setActiveSpecTab("led");
  }, [vehicle?.id]);

  /* Paired-column scrolling — same technique as CampaignRequest's form/
     summary columns. Each column is sticky with a `top` derived from its
     own measured height:

       - Column SHORTER than the viewport -> top = TOP_GAP. It pins as soon
         as it reaches the navbar and then waits, so the image doesn't leave
         a block of dead whitespace while the details column scrolls on.

       - Column TALLER than the viewport -> top = viewport - height - gap,
         which is negative. Sticky then lets the column scroll all the way
         through its own content first and only pins once its bottom edge
         reaches the bottom of the viewport.

     Net effect: whichever column is taller keeps scrolling while the
     shorter one holds in place, and once both are exhausted (or neither
     overflows the viewport — e.g. a short description with few specs) the
     page just scrolls on as one, with no separate inner scrollbar. */
  useEffect(() => {
    const leftColumn = leftColumnRef.current;
    const rightColumn = rightColumnRef.current;

    if (!leftColumn || !rightColumn) return;

    const TOP_GAP = 96;
    const BOTTOM_GAP = 24;
    const DESKTOP_MIN_WIDTH = 1024;

    const applyStickyOffsets = () => {
      const columns = [leftColumn, rightColumn];

      /* Below lg the grid is a single column and the page just scrolls. */
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

        const overflowsViewport = height + TOP_GAP + BOTTOM_GAP > viewportHeight;

        const top = overflowsViewport ? viewportHeight - height - BOTTOM_GAP : TOP_GAP;

        column.style.position = "sticky";
        column.style.top = `${top}px`;
      });
    };

    applyStickyOffsets();

    /* Setting position/top does not change offsetHeight, so observing the
       same elements we write to cannot feed back into itself. */
    const resizeObserver = new ResizeObserver(applyStickyOffsets);

    resizeObserver.observe(leftColumn);
    resizeObserver.observe(rightColumn);

    window.addEventListener("resize", applyStickyOffsets);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", applyStickyOffsets);
    };
  }, [vehicle]);

  useEffect(() => {
    if (!waitingForLogin) return;

    if (authModalOpen) {
      loginModalOpenedRef.current = true;
      return;
    }

    if (!loginModalOpenedRef.current) return;

    loginModalOpenedRef.current = false;
    setWaitingForLogin(false);

    if (user) {
      // toast.success(
      //   "Login successful. Continue booking."
      // );

      setBookingReadyOpen(true);
    }
  }, [
    authModalOpen,
    user,
    waitingForLogin,
  ]);

  const productFeatures = useMemo(() => {
    const specs = vehicle?.techSpecs || {};

    const versionKey = String(specs?.displayVersion || "")
      .trim()
      .toUpperCase();

    const screenSize =
      specs?.leftRightScreenWidth && specs?.leftRightScreenHeight
        ? `${specs.leftRightScreenWidth} × ${specs.leftRightScreenHeight} ft`
        : "";

    const gpsEnabled = (vehicle?.registrationVehicles || []).some(
      (reg: any) => reg?.gpsEnabled
    );

    return [
      {
        icon: "/images/assets/detail_page/Visibility.svg",
        title: "Visibility",
        desc:
          DISPLAY_VERSION_DESC[versionKey] ||
          versionKey ||
          "High road visibility",
        width: 38,
        height: 38,
      },
      {
        icon: "/images/assets/detail_page/Brightness.svg",
        title: "Brightness",
        desc:
          withUnit(specs?.brightness, "nits") || "Day & Night",
        width: 58,
        height: 58,
      },
      {
        icon: "/images/assets/detail_page/Display.svg",
        title: "Display",
        desc: specs?.numberOfScreens
          ? [withUnit(specs.numberOfScreens, "Screens"), screenSize]
              .filter(Boolean)
              .join(" · ")
          : "LED Coverage",
        width: 38,
        height: 38,
      },
      {
        icon: "/images/assets/detail_page/Audio.svg",
        title: "Audio",
        desc:
          withUnit(specs?.audioOutput, "W") ||
          "Clear Audio System",
        width: 38,
        height: 38,
      },
      {
        icon: "/images/assets/detail_page/Power.svg",
        title: "Power Backup ",
        desc:
          withUnit(specs?.generatorCapacity, "KVA") ||
          "Backup Available",
        width: 40,
        height: 40,
      },
      {
        icon: "/images/assets/detail_page/Setup.svg",
        title: "Setup",
        desc:
          specs?.screenType || "Quick Setup",
        width: 40,
        height: 40,
      },
      {
        icon: "/images/assets/detail_page/Coverage.svg",
        title: "Availability",
        desc:
          vehicle?.availableVehicles > 0
            ? `${vehicle.availableVehicles} available`
            : "Confirm availability",
        width: 58,
        height: 58,
      },
      {
        icon: "/images/assets/detail_page/Mobility.svg",
        title: "GPS Tracking",
        desc: gpsEnabled ? "Live GPS Enabled" : "On-the-go Reach",
        width: 78,
        height: 78,
      },
    ];
  }, [vehicle]);

  const specGroups = useMemo(
    () => (vehicle ? buildSpecGroups(vehicle) : []),
    [vehicle]
  );

  /* Saved Screen Type only — never Vehicle Type, title, or category. */
  const isHybridVehicle = isHybridScreenType(
    String(vehicle?.techSpecs?.screenType || "").trim()
  );

  const flexRows = useMemo(
    () => (isHybridVehicle ? buildFlexRows(vehicle?.techSpecs) : []),
    [isHybridVehicle, vehicle]
  );

  const handleBookNow = () => {
    if (!vehicle || checkingLogin) return;

    if (!checkIn || !checkOut) {
      toast.error(
        "Please select start date and end date."
      );
      return;
    }

    if (checkOut < checkIn) {
      toast.error(
        "End date cannot be before start date."
      );
      return;
    }

    setCheckingLogin(true);

    window.setTimeout(() => {
      setCheckingLogin(false);

      if (user) {
        setBookingReadyOpen(true);
        return;
      }

      setWaitingForLogin(true);

      toast.error(
        "Please login before proceeding."
      );

      openAuth("login");
    }, 300);
  };

  const handleContinueBooking = () => {
    if (
      !vehicle ||
      !checkIn ||
      !checkOut ||
      redirectingToCampaign
    ) {
      return;
    }

    setRedirectingToCampaign(true);

    sessionStorage.setItem(
      "roadshow_booking_draft",
      JSON.stringify({
        vehicleId: vehicle.id,
        startDate:
          formatDateForApi(checkIn),
        endDate:
          formatDateForApi(checkOut),
        quantity: 1,
      })
    );

    /* Keep this customer's cart in sync so earlier picks are not replaced */
    addToCart(user?._id, {
      vehicleId: String(vehicle.id),
      startDate: formatDateForApi(checkIn),
      endDate: formatDateForApi(checkOut),
      quantity: 1,
    });

    router.push("/roadshow/CampaignRequest");
  };

  if (loadingVehicle) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-white">
        <div className="flex items-center gap-3">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-black/25 border-t-black" />
          Loading vehicle details...
        </div>
      </main>
    );
  }

  if (vehicleError || !vehicle) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center bg-white px-4 text-center">
        <h1 className="text-[25px] font-bold">
          Vehicle unavailable
        </h1>

        <p className="mt-2 text-[#666666]">
          {vehicleError}
        </p>

        <button
          type="button"
          onClick={() => router.back()}
          className="mt-5 rounded-full bg-black px-6 py-3 text-white"
        >
          Go Back
        </button>
      </main>
    );
  }

  const images =
    vehicle.images?.length > 0
      ? vehicle.images
      : [vehicle.image];

  return (
    <>
      <main className="min-h-screen bg-white text-black">
        <section className="mx-auto grid max-w-355 grid-cols-1 gap-20 px-4 pb-14 pt-32 lg:grid-cols-[1.12fr_0.88fr] lg:items-start">
          {/* Paired-column scrolling (see the applyStickyOffsets effect
              above): sticky position/top are set from JS, not a static
              lg:sticky lg:top-*, because the correct offset depends on this
              column's own measured height vs. the taller right column —
              same technique as CampaignRequest's form/summary columns. */}
          <div ref={leftColumnRef}>
            <h1 className="mb-5 text-[25px] font-bold">
              {vehicle.name}
            </h1>

            <div className="relative flex min-h-140 items-center justify-center overflow-hidden rounded-[34px] bg-[#f5f4f7] py-6">
              <img
                src={images[currentImageIndex]}
                alt={vehicle.name}
                className="h-full w-full max-w-187.5 object-cover object-center"
                onError={(event) => {
                  event.currentTarget.src =
                    FALLBACK_VEHICLE_IMAGE;
                }}
              />

              {images.length > 1 && (
                <div className="absolute bottom-9 left-1/2 flex -translate-x-1/2 gap-3 rounded-full border border-[#C5C4C6] bg-white/70 px-4 py-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentImageIndex(
                        (previous) =>
                          previous === 0
                            ? images.length - 1
                            : previous - 1
                      )
                    }
                  >
                    <Image
                      src="/images/assets/detail_page/left.svg"
                      alt="Previous"
                      width={50}
                      height={50}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentImageIndex(
                        (previous) =>
                          previous ===
                            images.length - 1
                            ? 0
                            : previous + 1
                      )
                    }
                  >
                    <Image
                      src="/images/assets/detail_page/right.svg"
                      alt="Next"
                      width={50}
                      height={50}
                    />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div ref={rightColumnRef} className="pt-14">
            <h2 className="text-[30px] font-bold">
              {vehicle.rate > 0 ? (
                <>
                  {formatCurrency(
                    vehicle.rate
                  )}{" "}
                  <span className="text-[14px]">
                    Per Day
                  </span>
                </>
              ) : (
                "Contact for price"
              )}
            </h2>

            <h3 className="mt-4 text-[24px] font-bold text-[#d70000]">
              Product Details
            </h3>

            <p className="mt-2 max-w-135 text-[16px] leading-[1.45]">
              {vehicle.description}
            </p>

            <div className="mt-9 grid grid-cols-2 gap-8 sm:grid-cols-4">
              {productFeatures.map((feature) => (
                <div
                  key={feature.title}
                  className="text-center"
                >
                  <Image
                    src={feature.icon}
                    alt={feature.title}
                    width={feature.width}
                    height={feature.height}
                    className="mx-auto mb-3" style={{ height: '50%' }}
                  />

                  <h4 className="text-[16px] font-medium">
                    {feature.title}
                  </h4>

                  <p className="mt-1 text-[13px] text-[#666666]">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Full field-by-field spec breakdown — this used to live in a
                separate "View Details" popup opened from the vehicle listing
                card; it now renders directly here instead. */}
            {(specGroups.length > 0 || isHybridVehicle) && (
              <div className="mt-9">
                <h3 className="mb-4 text-[24px] font-bold text-[#d70000]">
                  Specifications
                </h3>

                {isHybridVehicle && (
                  <div className="mb-5 flex gap-2 border-b border-[#e5e5e5]">
                    <button
                      type="button"
                      onClick={() => setActiveSpecTab("led")}
                      className={`px-4 py-2 text-[14px] font-semibold ${
                        activeSpecTab === "led"
                          ? "border-b-2 border-[#d70000] text-[#d70000]"
                          : "text-[#666666]"
                      }`}
                    >
                      LED
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveSpecTab("flex")}
                      className={`px-4 py-2 text-[14px] font-semibold ${
                        activeSpecTab === "flex"
                          ? "border-b-2 border-[#d70000] text-[#d70000]"
                          : "text-[#666666]"
                      }`}
                    >
                      Flex Branding
                    </button>
                  </div>
                )}

                {isHybridVehicle && activeSpecTab === "flex" ? (
                  flexRows.length === 0 ? (
                    <p className="text-[13px] text-[#666666]">
                      Flex branding dimensions for this vehicle are being
                      updated. Please contact us for the full spec sheet.
                    </p>
                  ) : (
                    <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                      {flexRows.map((row) => (
                        <div
                          key={row.label}
                          className="flex items-center justify-between border-b border-[#f0f0f0] pb-2 text-[13px]"
                        >
                          <dt className="text-[#666666]">{row.label}</dt>
                          <dd className="font-semibold">{row.value}</dd>
                        </div>
                      ))}
                    </dl>
                  )
                ) : (
                  specGroups.map((group) => (
                    <div key={group.title} className="mb-6">
                      <h4 className="mb-2 text-[16px] font-bold">
                        {group.title}
                      </h4>

                      <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                        {group.rows.map((row) => (
                          <div
                            key={row.label}
                            className="flex items-center justify-between border-b border-[#f0f0f0] pb-2 text-[13px]"
                          >
                            <dt className="text-[#666666]">{row.label}</dt>
                            <dd
                              className={`font-semibold ${
                                row.soldOut ? "text-[#d70000]" : ""
                              }`}
                            >
                              {row.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="mt-9">
              <h3 className="mb-2 text-[20px] font-bold text-[#d70000]">
                Select Available Dates
              </h3>

              <DatePicker
                checkIn={checkIn}
                checkOut={checkOut}
                setCheckIn={setCheckIn}
                setCheckOut={setCheckOut}
                popupMode="dialog"
              />

              {/* <button
                type="button"
                onClick={handleBookNow}
                disabled={checkingLogin}
                className="mt-6 flex min-w-33.75 items-center justify-center gap-2 rounded-full bg-black px-7 py-3 text-[13px] font-semibold text-white transition hover:bg-[#d70000] disabled:opacity-60"
              >
                {checkingLogin && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}

                {checkingLogin
                  ? "Checking..."
                  : "Book Now"}
              </button> */}
              <VehicleDetailsBookNowBtn
                type="button"
                label="Book Now"
                loadingLabel="Checking..."
                loading={checkingLogin}
                disabled={checkingLogin}
                ariaLabel="Book this vehicle"
                onClick={handleBookNow}
                className="RS_VehicleButton mt-6 flex min-w-33.75 items-center justify-center gap-2 rounded-full bg-black px-7 py-3 text-[13px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>
        </section>
      </main>

      <BookingReadyPopup
        open={bookingReadyOpen}
        userName={user?.name}
        vehicleName={vehicle.name}
        checkIn={checkIn}
        checkOut={checkOut}
        onClose={() =>
          setBookingReadyOpen(false)
        }
        onContinue={handleContinueBooking}
        continuing={redirectingToCampaign}
      />
    </>
  );
}
