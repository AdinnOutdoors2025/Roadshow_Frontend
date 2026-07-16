/* eslint-disable */
// @ts-nocheck
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import toast from "react-hot-toast";

import DatePicker from "@/components/calendar/calendar_reusable/calender";
import { useAuth } from "@/context/AuthContext";

type ProductFeature = {
  icon: string;
  title: string;
  desc: string;
  width?: number;
  height?: number;
};

type BookingReadyPopupProps = {
  open: boolean;
  userName?: string;
  checkIn: Date | null;
  checkOut: Date | null;
  onClose: () => void;
  onContinue: () => void;
};

const nineteenft3side: ProductFeature[] = [
  {
    icon: "/images/assets/full side LED edited (1)_NEW.png",
    title: "Visibility",
    desc: "Up to 200m",
  },
];

const productFeatures: ProductFeature[] = [
  {
    icon: "/images/assets/detail_page/Visibility.svg",
    title: "Visibility",
    desc: "Up to 200m",
    width: 38,
    height: 38,
  },
  {
    icon: "/images/assets/detail_page/Brightness.svg",
    title: "Brightness",
    desc: "Day & Night",
    width: 38,
    height: 38,
  },
  {
    icon: "/images/assets/detail_page/Display.svg",
    title: "Display",
    desc: "3-Side Coverage",
    width: 38,
    height: 38,
  },
  {
    icon: "/images/assets/detail_page/Audio.svg",
    title: "Audio",
    desc: "Clear Audio System",
    width: 38,
    height: 38,
  },
  {
    icon: "/images/assets/detail_page/Power.svg",
    title: "Power",
    desc: "Backup Available",
    width: 38,
    height: 38,
  },
  {
    icon: "/images/assets/detail_page/Setup.svg",
    title: "Setup",
    desc: "Quick Setup",
    width: 38,
    height: 38,
  },
  {
    icon: "/images/assets/detail_page/Coverage.svg",
    title: "Coverage",
    desc: "High Traffic Areas",
    width: 38,
    height: 38,
  },
  {
    icon: "/images/assets/detail_page/Mobility.svg",
    title: "Mobility",
    desc: "On-the-go Reach",
    width: 38,
    height: 38,
  },
];
/* BOOKING SUCCESS POPUP */
function BookingReadyPopup({
  open,
  userName,
  checkIn,
  checkOut,
  onClose,
  onContinue,
}: BookingReadyPopupProps) {
  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  const selectedDateText =
    checkIn && checkOut
      ? `${format(checkIn, "dd MMM yyyy")} - ${format(
          checkOut,
          "dd MMM yyyy"
        )}`
      : checkIn
      ? `Starting from ${format(checkIn, "dd MMM yyyy")}`
      : "You can now select your booking dates.";

  const handleOverlayClick = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 px-4 backdrop-blur-[4px]"
      onMouseDown={handleOverlayClick}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-ready-title"
        className="relative w-full max-w-[440px] overflow-hidden rounded-[28px] bg-white p-7 text-center shadow-[0_28px_80px_rgba(0,0,0,0.24)] sm:p-9"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close booking message"
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-[#f2f2f2] text-[20px] text-black transition hover:bg-[#e5e5e5]"
        >
          ×
        </button>

        {/* Success icon */}
        <div className="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#fce8e8]">
          <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#d70000]">
            <svg
              width="25"
              height="25"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M5 12.5L9.2 16.5L19 7"
                stroke="white"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <h2
          id="booking-ready-title"
          className="mt-6 text-[25px] font-bold leading-tight text-black"
        >
          Hi{userName ? ` ${userName}` : ""}, you are ready to book!
        </h2>

        <p className="mx-auto mt-3 max-w-[340px] text-[15px] leading-[1.6] text-[#666666]">
          Your account has been verified successfully. You can now continue
          with your roadshow vehicle booking.
        </p>

        <div className="mt-5 rounded-[16px] bg-[#f7f7f7] px-4 py-3">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#888888]">
            Selected dates
          </p>

          <p className="mt-1 text-[14px] font-semibold text-black">
            {selectedDateText}
          </p>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="mt-6 w-full rounded-full bg-black px-7 py-3.5 text-[14px] font-semibold text-white transition hover:bg-[#d70000]"
        >
          Continue Booking
        </button>
      </section>
    </div>
  );
}
/* VEHICLE DETAILS PAGE */
export default function VehicleDetailsPage() {
  const { user, openAuth, open: authModalOpen } = useAuth();

  // Calendar state
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);

  // Booking authentication states
  const [checkingLogin, setCheckingLogin] = useState(false);
  const [waitingForLogin, setWaitingForLogin] = useState(false);
  const [bookingReadyOpen, setBookingReadyOpen] = useState(false);

  const loginModalOpenedRef = useRef(false);
  const authCheckTimerRef = useRef<ReturnType<
    typeof window.setTimeout
  > | null>(null);

  /*
   * This effect watches the login modal.
   *
   * Flow:
   * 1. User clicks Book Now while logged out.
   * 2. Login modal opens.
   * 3. OTP verification updates AuthContext user.
   * 4. Login modal closes.
   * 5. Booking success popup opens automatically.
   */
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
      toast.dismiss("booking-login-required");

      toast.success("Login successful. You can continue booking.", {
        id: "booking-login-success",
      });

      setBookingReadyOpen(true);
    }
  }, [authModalOpen, user, waitingForLogin]);

  useEffect(() => {
    return () => {
      if (authCheckTimerRef.current) {
        window.clearTimeout(authCheckTimerRef.current);
      }
    };
  }, []);

  const handleBookNow = () => {
    if (checkingLogin) return;

    if (authCheckTimerRef.current) {
      window.clearTimeout(authCheckTimerRef.current);
    }

    setCheckingLogin(true);

    /*
     * A very small delay allows the button to show its checking state.
     * It does not affect the authentication functionality.
     */
    authCheckTimerRef.current = window.setTimeout(() => {
      if (user) {
        // User is already logged in
        setBookingReadyOpen(true);
        setCheckingLogin(false);
        return;
      }

      // User is not logged in
      setWaitingForLogin(true);
      setCheckingLogin(false);

      toast.error("Please log in before proceeding with your booking.", {
        id: "booking-login-required",
        duration: 4000,
      });

      openAuth("login");
    }, 350);
  };

  const handleContinueBooking = () => {
    setBookingReadyOpen(false);

    /*
     * Add the next booking action here.
     *
     * Examples:
     * router.push("/checkout");
     * add vehicle to cart;
     * create booking API request;
     * open customer details form.
     */

    toast.success("Your booking details are ready.", {
      id: "booking-ready",
    });
  };

  return (
    <>
      <main className="min-h-screen bg-white text-black">
        <section className="mx-auto grid max-w-[1420px] grid-cols-1 gap-20 px-4 pb-14 pt-20 lg:grid-cols-[1.12fr_0.88fr] lg:items-start">
          {/* Vehicle Card */}
          <div>
            <h1 className="mb-5 text-[25px] font-bold tracking-tight">
              Tata Ultra 19 Ft - 3 Sided LED
            </h1>

            <div className="relative flex min-h-[560px] items-center justify-center overflow-hidden rounded-[34px] bg-[#f5f4f7] px-0 py-10">
              {nineteenft3side.map((item) => (
                <div
                  key={item.title}
                  className="relative flex aspect-[3/2] w-full max-w-[750px] items-center justify-center overflow-hidden"
                >
                  <Image
                    src={item.icon}
                    alt={item.title}
                    fill
                    className="object-cover object-center"
                  />
                </div>
              ))}

              {/* Carousel Buttons */}
              <div className="absolute bottom-9 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border-[0.5px] border-[#C5C4C6] px-4 py-2">
                <button
                  type="button"
                  className="flex items-center justify-center"
                >
                  <Image
                    src="/images/assets/detail_page/left.svg"
                    alt="Previous vehicle image"
                    width={50}
                    height={50}
                    className="object-contain"
                  />
                </button>

                <button
                  type="button"
                  className="flex items-center justify-center"
                >
                  <Image
                    src="/images/assets/detail_page/right.svg"
                    alt="Next vehicle image"
                    width={50}
                    height={50}
                    className="object-contain"
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="pt-14">
            <h2 className="text-[30px] font-bold tracking-tight">
              ₹ 25,000{" "}
              <span className="text-[14px] font-semibold">Per Day</span>
            </h2>

            <h3 className="mt-4 text-[24px] font-bold text-[#d70000]">
              Product Details
            </h3>

            <p className="mt-2 max-w-[540px] text-[16px] font-regular leading-[1.45] text-black">
              Our Roadshow Vehicles are like a moving stage for your brand.
              With big LED screens, clear sound system, comfortable seating,
              and full branding options, they easily grab attention on the
              road or at any spot.
            </p>

            <div className="mt-9 grid grid-cols-4 gap-x-8 gap-y-8">
              {productFeatures.map((item) => (
                <div key={item.title} className="text-center">
                  <div
                    className="mx-auto mb-3 flex items-center justify-center"
                    style={{
                      width: item.width,
                      height: item.height,
                    }}
                  >
                    <Image
                      src={item.icon}
                      alt={`${item.title} icon`}
                      width={item.width}
                      height={item.height}
                      className="object-contain"
                    />
                  </div>

                  <h4 className="text-[16px] font-mediumn leading-tight text-black">
                    {item.title}
                  </h4>

                  <p className="mt-1 text-[13px] font-medium leading-tight text-[#666666]">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Available Dates */}
            <div className="mt-9">
              <h3 className="mb-2 text-[20px] font-bold text-[#d70000]">
                Available Dates
              </h3>

              <DatePicker
                checkIn={checkIn}
                checkOut={checkOut}
                setCheckIn={setCheckIn}
                setCheckOut={setCheckOut}
              />

              {/* Updated Book Now button */}
              <button
                type="button"
                onClick={handleBookNow}
                disabled={checkingLogin}
                className="mt-6 flex min-w-[125px] items-center justify-center gap-2 rounded-full bg-black px-7 py-3 text-[13px] font-semibold text-white transition hover:bg-[#d70000] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {checkingLogin && (
                  <span
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                  />
                )}

                {checkingLogin ? "Checking..." : "Book Now"}
              </button>
            </div>
          </div>
        </section>

        {/* Product Detail Banner */}
        <section className="mb-20 mt-20 w-full p-0">
          <div className="relative w-full overflow-hidden rounded-none">
            <Image
              src="/images/assets/detail_page/product_detail_page_banner.svg"
              alt="Product detail banner"
              width={1920}
              height={260}
              className="h-auto w-full object-contain"
            />
          </div>
        </section>
      </main>

      {/* Logged-in booking confirmation popup */}
      <BookingReadyPopup
        open={bookingReadyOpen}
        userName={user?.name}
        checkIn={checkIn}
        checkOut={checkOut}
        onClose={() => setBookingReadyOpen(false)}
        onContinue={handleContinueBooking}
      />
    </>
  );
}