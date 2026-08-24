/* eslint-disable */
// @ts-nocheck
"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "./HomePageSection1.css";

import SplitHeading from "@/components/motion/SplitHeading";
import RevealText from "@/components/motion/RevealText";
import { useScrollReveal } from "@/components/motion/useScrollReveal";
import { playPopIn } from "@/components/motion/playPopIn";

import {
  DISTANCE,
  DURATION,
  STAGGER,
} from "@/components/motion/motionTokens";

import RoadshowProcessSection from "./RoadshowProcessSection";
import HomePageSection2 from "./HomePageSection2";

import {
  ButtonHover as ViewAllClientsButton,
} from "../Reusable_Components/ButtonHover";

import {
  HOME_VEHICLES_SECTION_ID,
  scrollToSection,
} from "../Reusable_Components/scrollToSection";

import VehicleListing from "@/components/Client/VehicleListing/VehicleListing";

import {
  About as RoadshowWebsiteAboutSection,
} from "./About";

import {
  Process as RoadshowWebsiteStreetVisibilitySection,
} from "./Process";

import ImpactCtaBanner from "./ImpactCtaBanner";

/* =========================================================
   INLINE SVG ICONS
========================================================= */

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      width="18"
      height="18"
      fill="none"
      aria-hidden="true"
      className="block shrink-0"
    >
      <path
        d="M10 4V16"
        stroke="#111111"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M4 10H16"
        stroke="#111111"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      width="16"
      height="16"
      fill="none"
      aria-hidden="true"
      className="block shrink-0"
    >
      <path
        d="M12.5 4.5L7 10L12.5 15.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      width="16"
      height="16"
      fill="none"
      aria-hidden="true"
      className="block shrink-0"
    >
      <path
        d="M7.5 4.5L13 10L7.5 15.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* =========================================================
   OFFERS
========================================================= */

const cities = [
  {
    name: "Chennai",
    icon: "./images/assets/Offers_Chennai.png",
  },
  {
    name: "Madurai",
    icon: "./images/assets/Offers_Madurai.png",
  },
  {
    name: "Coimbatore",
    icon: "./images/assets/Offers_Cbe.png",
  },
  {
    name: "Thrissur",
    icon: "./images/assets/Offers_Thrissur.png",
  },
  {
    name: "Kollam",
    icon: "./images/assets/Offers_Kollam.png",
  },
  {
    name: "Bengaluru",
    icon: "./images/assets/Offers_Bglr.png",
  },
  {
    name: "Theni",
    icon: "./images/assets/Offers_Theni.png",
  },
  {
    name: "Vellore",
    icon: "./images/assets/Offers_Vellore.png",
  },
];

const marqueeItems = [
  ...cities,
  ...cities,
  ...cities,
];

/* =========================================================
   WHY ADINN ROADSHOWS

   collapsedWidth
   = closed capsule width

   expandedWidth
   = opened capsule width
========================================================= */

const whyAdinnWorksBest = [
  {
    name: "GPS Support",
    description:
      "Live location tracking for vehicles with route visibility and movement updates throughout the campaign.",
    image: "/images/assets/Why_Adinn_Roadshows/gps.png",
    collapsedWidth: 219,
    expandedWidth: 400,
  },

  {
    name: "RTO Certified",
    description:
      "Fully approved vehicles complying with road regulations for smooth and hassle-free campaign execution.",
    image: "/images/assets/Why_Adinn_Roadshows/rto.png",
    collapsedWidth: 227,
    expandedWidth: 400,
  },

  {
    name: "One-Stop Solution",
    description:
      "From planning to execution, everything is managed in one place for a roadshow campaign.",
    image: "/images/assets/Why_Adinn_Roadshows/one_stop.png",
    collapsedWidth: 270,
    expandedWidth: 410,
  },

  {
    name: "High-Traffic Route Planning",
    description:
      "Strategic route planning focuses on high-visibility and high-traffic locations to maximize campaign reach.",
    image:
      "/images/assets/Why_Adinn_Roadshows/High_Traffic_Route_Planning.png",
    collapsedWidth: 360,
    expandedWidth: 470,
  },

  {
    name: "Professional Execution",
    description:
      "Experienced on-ground teams handle vehicle movement, branding and campaign execution with proper coordination.",
    image:
      "/images/assets/Why_Adinn_Roadshows/Professional_Execution.png",
    collapsedWidth: 335,
    expandedWidth: 440,
  },

  {
    name: "24/7 Support",
    description:
      "Dedicated team available anytime to monitor, coordinate, and assist throughout the campaign.",
    image: "/images/assets/Why_Adinn_Roadshows/time.png",
    collapsedWidth: 215,
    expandedWidth: 400,
  },
];

/* =========================================================
   CLIENTS
========================================================= */

const ourClients = [
  {
    name: "Philips",
    logo:
      "./images/assets/Client-logos/Philips.png",
    w: 140,
  },

  {
    name: "Hero",
    logo:
      "./images/assets/Client-logos/Hero.png",
    w: 150,
  },

  {
    name: "Airtel",
    logo:
      "./images/assets/Client-logos/Airtel.png",
    w: 210,
  },

  {
    name: "Kellogg's",
    logo:
      "./images/assets/RS_Client_kelloggs_logo.png",
    w: 175,
  },

  {
    name: "ACC",
    logo:
      "./images/assets/Client-logos/ACC.png",
    w: 170,
  },

  {
    name: "Bajaj",
    logo:
      "./images/assets/Client-logos/Bajaj.png",
    w: 250,
  },

  {
    name: "Domino's",
    logo:
      "./images/assets/Client-logos/Dominos.png",
    w: 260,
  },

  {
    name: "Thangamayil Jewellery",
    logo:
      "./images/assets/Client-logos/Thangamayil_Jewellery.png",
    w: 230,
  },

  {
    name: "Casagrand",
    logo:
      "./images/assets/Client-logos/Casagrand.png",
    w: 270,
  },

  {
    name: "GRT Jewellers",
    logo:
      "./images/assets/Client-logos/GRT_Jewellers.png",
    w: 300,
  },

  {
    name: "Ambuja Cement",
    logo:
      "./images/assets/Client-logos/Ambuja_Cement.png",
    w: 110,
  },

  {
    name: "Dalmia Cement",
    logo:
      "./images/assets/Client-logos/Dalmia_Cement.png",
    w: 151,
  },

  {
    name: "DRA Homes",
    logo:
      "./images/assets/Client-logos/DRA_Homes.png",
    w: 160,
  },

  {
    name: "G Square",
    logo:
      "./images/assets/Client-logos/G_Square.png",
    w: 180,
  },

  {
    name: "Havells",
    logo:
      "./images/assets/Client-logos/Havells.png",
    w: 400,
  },

  {
    name: "Impex",
    logo:
      "./images/assets/Client-logos/Impex.png",
    w: 250,
  },

  {
    name: "ITC",
    logo:
      "./images/assets/Client-logos/ITC.png",
    w: 280,
  },

  {
    name: "KFC",
    logo:
      "./images/assets/Client-logos/KFC.png",
    w: 220,
  },

  {
    name: "Lalithaa Jewellery",
    logo:
      "./images/assets/Client-logos/Lalithaa_Jewellery.png",
    w: 300,
  },

  {
    name: "Maruti Suzuki",
    logo:
      "./images/assets/Client-logos/Maruti_Suzuki.png",
    w: 200,
  },

  {
    name: "Milky Mist",
    logo:
      "./images/assets/Client-logos/Milky_Mist.png",
    w: 145,
  },

  {
    name: "Nippon Paint",
    logo:
      "./images/assets/Client-logos/Nippon_Paint.png",
    w: 170,
  },

  {
    name: "Poorvika",
    logo:
      "./images/assets/Client-logos/Poorvika.png",
    w: 290,
  },

  {
    name: "Royal Enfield",
    logo:
      "./images/assets/Client-logos/Royal_Enfield.png",
    w: 250,
  },

  {
    name: "Sree Kumaran Thangamaligai",
    logo:
      "./images/assets/Client-logos/Sree_Kumaran_Thangamaligai.png",
    w: 300,
  },

  {
    name: "The Chennai Mobiles",
    logo:
      "./images/assets/Client-logos/The_Chennai_Mobiles.png",
    w: 230,
  },

  {
    name: "TVS",
    logo:
      "./images/assets/Client-logos/TVS.png",
    w: 220,
  },
];

const CLIENT_BUBBLE_SLOTS = 15;

type WhyExitDirection =
  | "exit-left"
  | "exit-right";

/*
 * Existing CSS animation duration.
 *
 * This timer ONLY cleans the old image.
 * It DOES NOT disable the carousel.
 */
const WHY_IMAGE_ANIMATION_MS = 1500;

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function HomePageSection1() {
  /* =======================================================
     VEHICLES
  ======================================================= */

  const [
    vehiclesReady,
    setVehiclesReady,
  ] = useState(false);

  /* =======================================================
     WHY ADINN STATE
  ======================================================= */

  const [
    activeWhyIndex,
    setActiveWhyIndex,
  ] = useState<number>(0);

  const [
    whyExitIndex,
    setWhyExitIndex,
  ] = useState<number | null>(null);

  const [
    whyExitDirection,
    setWhyExitDirection,
  ] =
    useState<WhyExitDirection>(
      "exit-left",
    );

  const [
    whyEnterFromLeft,
    setWhyEnterFromLeft,
  ] = useState(false);

  const [
    isWhyFirstRender,
    setIsWhyFirstRender,
  ] = useState(true);

  /*
   * No isWhyAnimating lock.
   *
   * This is important.
   * Previous / Next remains clickable while
   * the current vehicle is moving.
   */
  const whyAnimationTimerRef =
    useRef<
      ReturnType<typeof setTimeout> | null
    >(null);

  /* =======================================================
     REFERENCES
  ======================================================= */

  const clientsOrbitRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const whyListRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  /* =======================================================
     CLIENT PAGES
  ======================================================= */

  const CLIENT_PAGE_COUNT =
    Math.max(
      1,
      Math.ceil(
        ourClients.length /
          CLIENT_BUBBLE_SLOTS,
      ),
    );

  const [
    clientPage,
    setClientPage,
  ] = useState(0);

  const visibleClients =
    useMemo(() => {
      if (!ourClients.length) {
        return [];
      }

      return Array.from(
        {
          length:
            CLIENT_BUBBLE_SLOTS,
        },
        (_unused, slot) => {
          const index =
            (
              clientPage *
                CLIENT_BUBBLE_SLOTS +
              slot
            ) %
            ourClients.length;

          return {
            ...ourClients[index],
            slot,
          };
        },
      );
    }, [clientPage]);

  const showMoreClients = () => {
    if (!ourClients.length) {
      return;
    }

    setClientPage(
      (current) =>
        (current + 1) %
        CLIENT_PAGE_COUNT,
    );
  };

  /* =======================================================
     CLIENT POP ANIMATION
  ======================================================= */

  const hasSwappedClientsRef =
    useRef(false);

  useEffect(() => {
    if (
      !hasSwappedClientsRef.current
    ) {
      hasSwappedClientsRef.current =
        true;

      return;
    }

    const orbit =
      clientsOrbitRef.current;

    if (!orbit) {
      return;
    }

    playPopIn(
      orbit.querySelectorAll(
        ".RS_ClientBubble",
      ),
      {
        rise: 26,
        scaleFrom: 0.9,
        duration: 0.95,
      },
    );
  }, [clientPage]);

  useScrollReveal(
    clientsOrbitRef,
    {
      selector:
        ".RS_ClientBubble",

      direction: "up",

      distance:
        DISTANCE.sm,

      scaleFrom: 0.9,

      ease:
        "power3.out",

      staggerFrom:
        "center",

      stagger:
        STAGGER.tight,

      duration:
        DURATION.slow,
    },
  );

  useScrollReveal(
    whyListRef,
    {
      selector:
        ".RS_WhyAdRSItem",

      direction:
        "right",

      distance:
        DISTANCE.base,

      stagger:
        STAGGER.base,
    },
  );

  /* =======================================================
     OFFERS BADGE ANIMATION
  ======================================================= */

  useEffect(() => {
    const gradients = [
      {
        a: "#00FFEB",
        b: "#0099FF",
      },

      {
        a: "#9038F5",
        b: "#21378F",
      },

      {
        a: "#DF0B0B",
        b: "#330000",
      },
    ];

    const stopTop =
      document.getElementById(
        "badgeStopTop",
      );

    const stopBottom =
      document.getElementById(
        "badgeStopBot",
      );

    if (
      !stopTop ||
      !stopBottom
    ) {
      return;
    }

    const hexToRgb = (
      hex: string,
    ) => [
      parseInt(
        hex.slice(1, 3),
        16,
      ),

      parseInt(
        hex.slice(3, 5),
        16,
      ),

      parseInt(
        hex.slice(5, 7),
        16,
      ),
    ];

    const interpolate = (
      start: number,
      end: number,
      progress: number,
    ) =>
      Math.round(
        start +
          (end - start) *
            progress,
      );

    const rgbToHex = (
      red: number,
      green: number,
      blue: number,
    ) =>
      `#${[
        red,
        green,
        blue,
      ]
        .map((value) =>
          value
            .toString(16)
            .padStart(
              2,
              "0",
            ),
        )
        .join("")}`;

    const mixColors = (
      firstColor: string,
      secondColor: string,
      progress: number,
    ) => {
      const [
        red1,
        green1,
        blue1,
      ] =
        hexToRgb(firstColor);

      const [
        red2,
        green2,
        blue2,
      ] =
        hexToRgb(secondColor);

      return rgbToHex(
        interpolate(
          red1,
          red2,
          progress,
        ),

        interpolate(
          green1,
          green2,
          progress,
        ),

        interpolate(
          blue1,
          blue2,
          progress,
        ),
      );
    };

    const stepDuration =
      1000;

    let startTime:
      | number
      | null = null;

    let animationFrame =
      0;

    const animateGradient = (
      timestamp: number,
    ) => {
      if (
        startTime === null
      ) {
        startTime =
          timestamp;
      }

      const elapsed =
        (timestamp -
          startTime) %
        (stepDuration *
          gradients.length);

      const currentIndex =
        Math.floor(
          elapsed /
            stepDuration,
        );

      const progress =
        (elapsed %
          stepDuration) /
        stepDuration;

      const easedProgress =
        progress < 0.5
          ? 2 *
            progress *
            progress
          : -1 +
            (4 -
              2 *
                progress) *
              progress;

      const currentGradient =
        gradients[
          currentIndex
        ];

      const nextGradient =
        gradients[
          (currentIndex + 1) %
            gradients.length
        ];

      stopTop.setAttribute(
        "stop-color",
        mixColors(
          currentGradient.a,
          nextGradient.a,
          easedProgress,
        ),
      );

      stopBottom.setAttribute(
        "stop-color",
        mixColors(
          currentGradient.b,
          nextGradient.b,
          easedProgress,
        ),
      );

      animationFrame =
        requestAnimationFrame(
          animateGradient,
        );
    };

    animationFrame =
      requestAnimationFrame(
        animateGradient,
      );

    return () => {
      cancelAnimationFrame(
        animationFrame,
      );
    };
  }, []);

  /* =======================================================
     VEHICLE HASH SCROLL
  ======================================================= */

  useEffect(() => {
    if (!vehiclesReady) {
      return;
    }

    if (
      window.location.hash !==
      `#${HOME_VEHICLES_SECTION_ID}`
    ) {
      return;
    }

    const timerId =
      window.setTimeout(
        () => {
          scrollToSection(
            HOME_VEHICLES_SECTION_ID,
          );
        },
        250,
      );

    return () =>
      window.clearTimeout(
        timerId,
      );
  }, [vehiclesReady]);

  /* =======================================================
     CLEAN TIMER
  ======================================================= */

  useEffect(() => {
    return () => {
      if (
        whyAnimationTimerRef.current
      ) {
        clearTimeout(
          whyAnimationTimerRef.current,
        );
      }
    };
  }, []);

  /* =======================================================
     WHY ADINN IMAGE CLEANUP

     IMPORTANT:
     This does NOT lock navigation.
  ======================================================= */

  const finishWhyImageAnimation =
    () => {
      if (
        whyAnimationTimerRef.current
      ) {
        clearTimeout(
          whyAnimationTimerRef.current,
        );
      }

      whyAnimationTimerRef.current =
        setTimeout(() => {
          setWhyExitIndex(
            null,
          );
        }, WHY_IMAGE_ANIMATION_MS);
    };

  /* =======================================================
     WHY ADINN TRANSITION

     No animation lock.

     User can press:
     Next
     Next
     Next

     without waiting for the image to settle.
  ======================================================= */

  const triggerWhyTransition = (
    nextIndex: number,
    direction:
      | "forward"
      | "backward",
  ) => {
    if (
      !whyAdinnWorksBest.length
    ) {
      return;
    }

    if (
      nextIndex ===
      activeWhyIndex
    ) {
      return;
    }

    setIsWhyFirstRender(
      false,
    );

    /*
     * Current image becomes
     * the outgoing image.
     */
    if (
      activeWhyIndex >= 0
    ) {
      setWhyExitIndex(
        activeWhyIndex,
      );

      setWhyExitDirection(
        direction ===
          "forward"
          ? "exit-left"
          : "exit-right",
      );
    } else {
      setWhyExitIndex(
        null,
      );
    }

    /*
     * Determines which side
     * the next image enters from.
     */
    setWhyEnterFromLeft(
      direction ===
        "backward",
    );

    /*
     * Immediately activate
     * the next slide.
     */
    setActiveWhyIndex(
      nextIndex,
    );

    /*
     * Timer only removes the
     * previous image afterwards.
     */
    finishWhyImageAnimation();
  };

  /* =======================================================
     CONTINUOUS PREVIOUS

     GPS <- 24/7
  ======================================================= */

  const handleWhyPrevious =
    () => {
      if (
        whyAdinnWorksBest.length <=
        1
      ) {
        return;
      }

      /*
       * If closed,
       * open the last item.
       */
      if (
        activeWhyIndex < 0
      ) {
        triggerWhyTransition(
          whyAdinnWorksBest.length -
            1,
          "backward",
        );

        return;
      }

      const previousIndex =
        (
          activeWhyIndex -
          1 +
          whyAdinnWorksBest.length
        ) %
        whyAdinnWorksBest.length;

      triggerWhyTransition(
        previousIndex,
        "backward",
      );
    };

  /* =======================================================
     CONTINUOUS NEXT

     24/7 -> GPS
  ======================================================= */

  const handleWhyNext =
    () => {
      if (
        whyAdinnWorksBest.length <=
        1
      ) {
        return;
      }

      /*
       * If everything is closed,
       * open GPS.
       */
      if (
        activeWhyIndex < 0
      ) {
        triggerWhyTransition(
          0,
          "forward",
        );

        return;
      }

      const nextIndex =
        (activeWhyIndex +
          1) %
        whyAdinnWorksBest.length;

      triggerWhyTransition(
        nextIndex,
        "forward",
      );
    };

  /* =======================================================
     CAPSULE CLICK
  ======================================================= */

  const handleWhyItemClick = (
    index: number,
  ) => {
    /*
     * Clicking the currently
     * opened capsule closes it.
     */
    if (
      index ===
      activeWhyIndex
    ) {
      setIsWhyFirstRender(
        false,
      );

      setWhyExitIndex(
        activeWhyIndex,
      );

      setWhyExitDirection(
        "exit-left",
      );

      setActiveWhyIndex(
        -1,
      );

      finishWhyImageAnimation();

      return;
    }

    /*
     * Clicking another capsule
     * changes immediately.
     *
     * No need to wait for
     * existing animation.
     */
    const direction =
      activeWhyIndex < 0 ||
      index >
        activeWhyIndex
        ? "forward"
        : "backward";

    triggerWhyTransition(
      index,
      direction,
    );
  };

  /* =======================================================
     IMAGE CLASS
  ======================================================= */

  const getWhyImageClass = (
    index: number,
  ) => {
    if (
      index ===
      whyExitIndex
    ) {
      return whyExitDirection;
    }

    if (
      index ===
      activeWhyIndex
    ) {
      if (
        isWhyFirstRender
      ) {
        return "enter-from-right";
      }

      return whyEnterFromLeft
        ? "enter-from-left"
        : "enter-from-right";
    }

    return "";
  };

  /* =========================================================
     JSX
  ========================================================= */

  return (
    <>
      {/* =====================================================
          OFFERS
      ===================================================== */}

      <section className="OffersSection flex">
        <div className="OffersHeadingMain flex items-center justify-center gap-4">
          <div className="OffersHeading">
            Offers
          </div>

          <div className="OffersHeadImgContainer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="68"
              height="68"
              viewBox="0 0 68 68"
              fill="none"
              className="OffersBadgeText"
            >
              <path
                d="M66.5567 30.2726L64.0219 26.5066C63.8046 26.0721 63.7322 25.6375 63.7322 25.1306L64.0219 20.5679C64.1668 17.9607 62.7907 15.5708 60.4732 14.412L56.4175 12.3842C55.983 12.1669 55.6933 11.8772 55.476 11.4427L53.3758 7.24214C52.217 4.92461 49.7546 3.54858 47.2198 3.69342L42.6572 3.98312C42.2227 3.98312 41.7157 3.91069 41.3536 3.621L37.4428 1.0862C35.2701 -0.362251 32.518 -0.362251 30.2729 1.0862L26.5069 3.621C26 3.83827 25.5654 3.91069 25.0585 3.91069L20.4958 3.621C17.8886 3.54858 15.4987 4.92461 14.2675 7.24214L12.2396 11.2978C12.0224 11.7324 11.7327 12.022 11.2981 12.2393L7.24245 14.2672C4.92493 15.4259 3.54889 17.8883 3.69374 20.4231L3.98343 24.9857C3.98343 25.4203 3.91101 25.9272 3.62132 26.2893L1.08652 30.2002C-0.361938 32.3728 -0.361938 35.1973 1.08652 37.37L3.62132 41.136C3.83858 41.643 3.91101 42.0775 3.91101 42.5845L3.62132 47.1471C3.54889 49.7543 4.92493 52.1443 7.24245 53.3754L11.2981 55.4033C11.7327 55.6206 12.0224 55.9827 12.2396 56.3448L14.2675 60.4005C15.4262 62.718 17.8886 64.094 20.4234 63.9492L24.986 63.6595C25.4206 63.6595 25.9275 63.7319 26.2896 64.0216L30.0556 66.484C31.142 67.2082 32.3732 67.5703 33.6043 67.5703C34.8355 67.5703 36.0667 67.2082 37.1531 66.484L40.919 63.9492C41.2812 63.7319 41.7881 63.5871 42.2227 63.5871L46.7853 63.8768C49.3925 64.0216 51.7825 62.6456 52.9412 60.328L54.9691 56.2724C55.1863 55.8378 55.476 55.5481 55.9106 55.3309L59.9662 53.303C62.2838 52.1443 63.6598 49.6819 63.515 47.1471L63.3701 42.6569C63.3701 42.2223 63.4425 41.7154 63.7322 41.3533L66.1946 37.5149C68.0052 35.1973 68.0052 32.3728 66.5567 30.2726Z"
                fill="url(#badgeGrad)"
              />

              <defs>
                <linearGradient
                  id="badgeGrad"
                  x1="33.8009"
                  y1="0"
                  x2="33.8009"
                  y2="67.5703"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop
                    id="badgeStopTop"
                    stopColor="#00FFEB"
                  />

                  <stop
                    id="badgeStopBot"
                    offset="1"
                    stopColor="#0099FF"
                  />
                </linearGradient>
              </defs>
            </svg>

            <span className="OffersBadgeContent">
              %
            </span>
          </div>
        </div>

        <div className="OffersStrip">
          <div className="OffersMarquee">
            {marqueeItems.map(
              (
                city,
                index,
              ) => (
                <div
                  key={`${city.name}-${index}`}
                  className="OffersPill"
                >
                  <img
                    src={
                      city.icon
                    }
                    alt={
                      city.name
                    }
                    className="OffersPillIcon"
                  />

                  <span className="OffersPillName">
                    {
                      city.name
                    }
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          CTA
      ===================================================== */}

      <ImpactCtaBanner
        ctaHref="/roadshow/Contact"
      />

      {/* =====================================================
          ABOUT
      ===================================================== */}

      <RoadshowWebsiteAboutSection />

      {/* =====================================================
          STREET VISIBILITY
      ===================================================== */}

      <RoadshowWebsiteStreetVisibilitySection />

      {/* =====================================================
    VEHICLES
===================================================== */}

<div
  id="our-roadshow-vehicles"
  className="
    RS_OurRdwMainSection
    w-full
    bg-[#f5f5f7]

    px-5
    pt-[70px]

    sm:px-8
    sm:pt-[80px]

    md:px-12
    md:pt-[90px]

    lg:px-20
    lg:pt-[110px]
  "
>
  <VehicleListing
    layout="carousel"
    reveal
    onLoaded={() => {
      setVehiclesReady(true);
    }}
    heading={
      <div className="RS_OurRdwHeading">
        <SplitHeading className="RS_OurRdwHeadingContent1">
          Our Roadshow
        </SplitHeading>

        <RevealText
          className="
            RS_OurRdwHeadingContent1
            RS_OurRdwHeadingContent2
          "
          effect="wipe"
          delay={0.18}
        >
          Vehicles
        </RevealText>
      </div>
    }
  />
</div>

      {/* =====================================================
          WHY ADINN ROADSHOWS
      ===================================================== */}

      <div className="mx-auto px-30 RS_WhyAdRSSectionWrap RS_WhyAdRSFigmaUI">
        <div className="RS_OurRdwHeading">
          <RoadshowProcessSection />

          <RevealText
            className="RS_OurRdwHeadingContent1"
            effect="blur"
          >
            Why Adinn Roadshows
          </RevealText>

          <RevealText
            className="RS_OurRdwHeadingContent1 RS_OurRdwHeadingContent2"
            effect="wipe"
            delay={
              0.18
            }
          >
            Works Best
          </RevealText>
        </div>

        {/* =================================================
            FIGMA UI ONLY

            IMPORTANT:
            - Vehicle animation logic is untouched.
            - Vehicle enter/exit classes are untouched.
            - Carousel handlers/timing are untouched.
            - Only the pill UI and spacing are styled here.
        ================================================= */}

        <style>{`
          .RS_WhyAdRSFigmaUI .RS_WhyAdRSMain {
            background: #eeedf0 !important;
            border-radius: 70px !important;
          }

          .RS_WhyAdRSFigmaUI .RS_WhyAdRS_Left,
          .RS_WhyAdRSFigmaUI .RS_WhyAdRSList {
            background: transparent !important;
          }

          .RS_WhyAdRSFigmaUI .RS_WhyAdRSNavRow {
            gap: 13px !important;
            margin-bottom: 20px !important;
          }

          .RS_WhyAdRSFigmaUI .RS_WhyAdRSNavButton {
            width: 26px !important;
            height: 26px !important;
            min-width: 26px !important;
            min-height: 26px !important;
            padding: 0 !important;
            border: 0 !important;
            border-radius: 50% !important;
            background: #e2e2e6 !important;
            color: #7f8086 !important;
            box-shadow: none !important;
          }

          .RS_WhyAdRSFigmaUI .RS_WhyAdRSNavButton svg {
            width: 15px !important;
            height: 15px !important;
          }

          .RS_WhyAdRSFigmaUI .RS_WhyAdRSList {
            gap: 20px !important;
          }

          .RS_WhyAdRSFigmaUI .RS_WhyAdRSItem {
            height: 70px !important;
            min-height: 70px !important;
            padding: 0 !important;
            border: 0 !important;
            border-radius: 40px !important;
            background: #d7d7de !important;
            box-shadow: none !important;
            overflow: hidden !important;
            text-align: left !important;
            will-change: width, height;
            transition:
              width 760ms cubic-bezier(0.22, 1, 0.36, 1),
              height 760ms cubic-bezier(0.22, 1, 0.36, 1),
              min-height 760ms cubic-bezier(0.22, 1, 0.36, 1),
              border-radius 620ms cubic-bezier(0.22, 1, 0.36, 1) !important;
          }

          .RS_WhyAdRSFigmaUI .RS_WhyAdRSItem.active {
            height: 140px !important;
            min-height: 140px !important;
            border-radius: 40px !important;
          }

          .RS_WhyAdRSFigmaUI .RS_WhyAdRS_ItemInner {
            width: 100% !important;
            height: 100% !important;
            padding: 12px 18px 12px 12px !important;
            display: flex !important;
            align-items: flex-start !important;
            gap: 12px !important;
            box-sizing: border-box !important;
          }

          .RS_WhyAdRSFigmaUI .RS_WhyAdRSContentIcon {
            width: 45px !important;
            height: 45px !important;
            min-width: 45px !important;
            min-height: 45px !important;
            flex: 0 0 45px !important;
            margin: 0 !important;
            border-radius: 50% !important;
            background: #ffffff !important;
            display: grid !important;
            place-items: center !important;
            transform: scale(1);
            transform-origin: center;
            transition:
              transform 720ms cubic-bezier(0.22, 1, 0.36, 1) !important;
          }

          .RS_WhyAdRSFigmaUI
          .RS_WhyAdRSItem.active
          .RS_WhyAdRSContentIcon {
            transform: scale(0.82);
          }

          .RS_WhyAdRSFigmaUI .RS_WhyAdRSContentIcon svg {
            width: 22px !important;
            height: 22px !important;
            transform: rotate(0deg);
            transform-origin: center;
            transition:
              transform 720ms cubic-bezier(0.22, 1, 0.36, 1) !important;
          }

          .RS_WhyAdRSFigmaUI
          .RS_WhyAdRSItem.active
          .RS_WhyAdRSContentIcon svg {
            transform: rotate(45deg);
          }

          .RS_WhyAdRSFigmaUI .RS_WhyAdRS_ItemText {
            min-width: 0 !important;
            padding-top: 5px !important;
            display: flex !important;
            flex: 1 1 auto !important;
            flex-direction: column !important;
            align-items: flex-start !important;
          }

          .RS_WhyAdRSFigmaUI .RS_WhyAdRS_ItemName {
            margin: 0 !important;
            padding: 0 !important;
            font-family: "Outfit", sans-serif !important;
            font-size: 22px !important;
            font-weight: 500 !important;
            line-height: 28px !important;
            letter-spacing: 0 !important;
            color: #000000 !important;
          }

          .RS_WhyAdRSFigmaUI .RS_WhyAdRS_CollapseWrapper {
            display: grid !important;
            grid-template-rows: 0fr;
            width: 100% !important;
            max-width: 340px !important;
            margin-top: 0 !important;
            opacity: 0 !important;
            overflow: hidden !important;
            transform: translateY(-4px);
            transition:
              grid-template-rows 760ms cubic-bezier(0.22, 1, 0.36, 1),
              margin-top 760ms cubic-bezier(0.22, 1, 0.36, 1),
              opacity 480ms ease,
              transform 760ms cubic-bezier(0.22, 1, 0.36, 1) !important;
          }

          .RS_WhyAdRSFigmaUI .RS_WhyAdRS_CollapseWrapper.open {
            grid-template-rows: 1fr;
            margin-top: 8px !important;
            opacity: 1 !important;
            transform: translateY(0);
          }

          .RS_WhyAdRSFigmaUI .RS_WhyAdRS_ItemDesc {
            display: block !important;
            min-height: 0 !important;
            overflow: hidden !important;
            width: 100% !important;
            max-width: 340px !important;
            margin: 0 !important;
            padding: 0 !important;
            font-family: "Outfit", sans-serif !important;
            font-size: 18px !important;
            font-weight: 400 !important;
            line-height: 23px !important;
            letter-spacing: 0 !important;
            color: #000000 !important;
            white-space: normal !important;
          }

          @media (min-width: 1024px) {
            .RS_WhyAdRSFigmaUI .RS_WhyAdRS_Right {
              translate: 20px 0;
            }
          }

          /* =================================================
             TABLET: KEEP THE SAME DESKTOP 2-COLUMN COMPOSITION
             - Left pills are reduced
             - Vehicle stays on the RIGHT
             - Desktop and mobile are untouched
          ================================================= */

          @media (min-width: 768px) and (max-width: 1023px) {
            .RS_WhyAdRSFigmaUI {
              padding-left: 24px !important;
              padding-right: 24px !important;
            }

            .RS_WhyAdRSFigmaUI .RS_WhyAdRSMain {
              /* TABLET ONLY:
                 Keep the card compact, remove the wasted top space,
                 and give the complete 6-item list enough usable height. */
              min-height: 430px !important;
              height: auto !important;
              padding: 14px 24px 60px 24px !important;
              border-radius: 44px !important;

              display: grid !important;
              grid-template-columns: minmax(0, 42%) minmax(0, 58%) !important;
              column-gap: 18px !important;
              align-items: center !important;

              overflow: hidden !important;
              box-sizing: border-box !important;
            }

            .RS_WhyAdRSFigmaUI .RS_WhyAdRS_Left {
              width: 100% !important;
              min-width: 0 !important;
              max-width: none !important;
              padding: 0 !important;
              margin: 0 !important;

              /* Move the complete left stack upward instead of
                 leaving unused space above it. */
              align-self: start !important;
              transform: translateY(-22px) !important;

              position: relative !important;
              z-index: 4 !important;
            }

            .RS_WhyAdRSFigmaUI .RS_WhyAdRSNavRow {
              gap: 8px !important;
              margin-bottom: 9px !important;
            }

            .RS_WhyAdRSFigmaUI .RS_WhyAdRSNavButton {
              width: 22px !important;
              height: 22px !important;
              min-width: 22px !important;
              min-height: 22px !important;
            }

            .RS_WhyAdRSFigmaUI .RS_WhyAdRSNavButton svg {
              width: 12px !important;
              height: 12px !important;
            }

            .RS_WhyAdRSFigmaUI .RS_WhyAdRSList {
              width: 100% !important;
              gap: 8px !important;
              align-items: flex-start !important;
            }

            /* CLOSED TABLET PILLS:
               Hug only icon + text + 10px right padding.
               This intentionally overrides the inline desktop width. */
            .RS_WhyAdRSFigmaUI .RS_WhyAdRSItem:not(.active) {
              display: inline-flex !important;
              width: max-content !important;
              min-width: 0 !important;
              max-width: max-content !important;
              align-self: flex-start !important;
              flex: 0 0 auto !important;

              height: 44px !important;
              min-height: 44px !important;
              border-radius: 26px !important;
            }

            /* ACTIVE pill still needs room for the description. */
            .RS_WhyAdRSFigmaUI .RS_WhyAdRSItem.active {
              width: 285px !important;
              min-width: 0 !important;
              max-width: 100% !important;
              align-self: flex-start !important;

              height: 96px !important;
              min-height: 96px !important;
              border-radius: 26px !important;
            }

            .RS_WhyAdRSFigmaUI .RS_WhyAdRSItem:not(.active) .RS_WhyAdRS_ItemInner {
              width: max-content !important;
              min-width: 0 !important;
              flex: 0 0 auto !important;

              /* LEFT 7px / RIGHT EXACTLY 10px */
              padding: 7px 10px 7px 7px !important;
              gap: 7px !important;
              align-items: center !important;
            }

            .RS_WhyAdRSFigmaUI .RS_WhyAdRSItem:not(.active) .RS_WhyAdRS_ItemText {
              width: auto !important;
              min-width: 0 !important;
              flex: 0 0 auto !important;
              padding-top: 0 !important;
              align-self: center !important;
              justify-content: center !important;
            }

            .RS_WhyAdRSFigmaUI .RS_WhyAdRSItem:not(.active) .RS_WhyAdRS_ItemName {
              display: block !important;
              width: max-content !important;
              max-width: none !important;
            }

            .RS_WhyAdRSFigmaUI .RS_WhyAdRSItem.active .RS_WhyAdRS_ItemInner {
              width: 100% !important;
              padding: 6px 10px 6px 7px !important;
              gap: 7px !important;
              align-items: flex-start !important;
            }

            .RS_WhyAdRSFigmaUI .RS_WhyAdRSContentIcon {
              width: 30px !important;
              height: 30px !important;
              min-width: 30px !important;
              min-height: 30px !important;
              flex: 0 0 30px !important;
            }

            .RS_WhyAdRSFigmaUI .RS_WhyAdRSContentIcon svg {
              width: 15px !important;
              height: 15px !important;
            }

            .RS_WhyAdRSFigmaUI .RS_WhyAdRSItem.active .RS_WhyAdRS_ItemText {
              padding-top: 1px !important;
            }

            .RS_WhyAdRSFigmaUI .RS_WhyAdRS_ItemName {
              font-size: 14px !important;
              line-height: 18px !important;
              font-weight: 500 !important;
              white-space: nowrap !important;
            }

            .RS_WhyAdRSFigmaUI .RS_WhyAdRS_CollapseWrapper {
              max-width: 235px !important;
            }

            .RS_WhyAdRSFigmaUI .RS_WhyAdRS_CollapseWrapper.open {
              margin-top: 3px !important;
            }

            .RS_WhyAdRSFigmaUI .RS_WhyAdRS_ItemDesc {
              max-width: 235px !important;
              font-size: 11px !important;
              line-height: 13px !important;
            }

            .RS_WhyAdRSFigmaUI .RS_WhyAdRS_Right {
              position: relative !important;
              width: 100% !important;
              min-width: 0 !important;
              height: 100% !important;
              min-height: 398px !important;

              margin: 0 !important;
              padding: 0 !important;
              translate: 0 25px !important;
              align-self: stretch !important;
              overflow: visible !important;
              z-index: 2 !important;
            }

            .RS_WhyAdRSFigmaUI .RS_WhyAdRS_ImageLayer {
              position: absolute !important;
              inset: 0 !important;
              width: 100% !important;
              height: 100% !important;

              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
            }

            .RS_WhyAdRSFigmaUI .RS_WhyAdRS_ImageLayer img {
              display: block !important;
              width: 118% !important;
              max-width: 540px !important;
              height: auto !important;
              max-height: 96% !important;
              object-fit: contain !important;
              transform-origin: center center !important;
            }
          }

          /* =================================================
             MOBILE: KEEP THE EXISTING MOBILE COMPOSITION
          ================================================= */

          @media (max-width: 767px) {
            .RS_WhyAdRSFigmaUI .RS_WhyAdRSMain {
              border-radius: 44px !important;
            }

            .RS_WhyAdRSFigmaUI .RS_WhyAdRS_ItemName {
              font-size: 20px !important;
              line-height: 26px !important;
            }

            .RS_WhyAdRSFigmaUI .RS_WhyAdRS_ItemDesc {
              font-size: 17px !important;
              line-height: 22px !important;
            }
          }
        `}</style>

        {/* =================================================
            IMPORTANT

            minHeight + paddingBottom gives the six-item
            layout proper bottom breathing space.

            This avoids needing to edit the CSS file.
        ================================================= */}

        <div
          className="RS_WhyAdRSMain"
          style={{
            minHeight:
              "900px",

            paddingBottom:
              "80px",
          }}
        >
          {/* ===============================================
              LEFT SIDE
          =============================================== */}

          <div className="RS_WhyAdRS_Left">
            {/* =============================================
                CONTINUOUS CAROUSEL CONTROLS
            ============================================= */}

            <div className="RS_WhyAdRSNavRow">
              <button
                type="button"
                className="RS_WhyAdRSNavButton"
                onClick={
                  handleWhyPrevious
                }
                disabled={
                  whyAdinnWorksBest.length <=
                  1
                }
                aria-label="Previous feature"
              >
                <ArrowLeftIcon />
              </button>

              <button
                type="button"
                className="RS_WhyAdRSNavButton"
                onClick={
                  handleWhyNext
                }
                disabled={
                  whyAdinnWorksBest.length <=
                  1
                }
                aria-label="Next feature"
              >
                <ArrowRightIcon />
              </button>
            </div>

            {/* =============================================
                FEATURE LIST
            ============================================= */}

            <div
              className="RS_WhyAdRSList"
              ref={
                whyListRef
              }
            >
              {whyAdinnWorksBest.map(
                (
                  feature,
                  index,
                ) => {
                  const isActive =
                    activeWhyIndex ===
                    index;

                  /*
                   * Force the exact width inline.
                   *
                   * This prevents the long
                   * High-Traffic Route Planning
                   * label from being cropped.
                   */
                  const itemWidth =
                    isActive
                      ? feature.expandedWidth
                      : feature.collapsedWidth;

                  return (
                    <button
                      key={
                        feature.name
                      }
                      type="button"
                      className={`RS_WhyAdRSItem ${
                        isActive
                          ? "active"
                          : ""
                      }`}
                      style={
                        {
                          "--collapsed-width": `${feature.collapsedWidth}px`,

                          width: `${itemWidth}px`,

                          maxWidth:
                            "100%",
                        } as React.CSSProperties
                      }
                      onClick={() =>
                        handleWhyItemClick(
                          index,
                        )
                      }
                      aria-expanded={
                        isActive
                      }
                      aria-controls={`why-adinn-description-${index}`}
                    >
                      <span className="RS_WhyAdRS_ItemInner">
                        {/* ==============================
                            PLUS ICON
                        ============================== */}

                        <span
                          className="RS_WhyAdRSContentIcon"
                          aria-hidden="true"
                        >
                          <PlusIcon />
                        </span>

                        {/* ==============================
                            TEXT
                        ============================== */}

                        <span className="RS_WhyAdRS_ItemText">
                          <span
                            className="RS_WhyAdRS_ItemName"
                            style={{
                              whiteSpace:
                                "nowrap",

                              textOverflow:
                                "clip",
                            }}
                          >
                            {
                              feature.name
                            }
                          </span>

                          <span
                            id={`why-adinn-description-${index}`}
                            className={`RS_WhyAdRS_CollapseWrapper ${
                              isActive
                                ? "open"
                                : ""
                            }`}
                          >
                            <span className="RS_WhyAdRS_ItemDesc">
                              {
                                feature.description
                              }
                            </span>
                          </span>
                        </span>
                      </span>
                    </button>
                  );
                },
              )}
            </div>
          </div>

          {/* ===============================================
              RIGHT VEHICLE
          =============================================== */}

          <div
            className="RS_WhyAdRS_Right"
            aria-live="polite"
          >
            {/*
             * Keep a roadshow vehicle visible after all pills
             * are closed. This does not touch the existing
             * enter / exit animation logic.
             */}
            {activeWhyIndex < 0 &&
              whyExitIndex === null &&
              whyAdinnWorksBest[0] && (
                <div className="RS_WhyAdRS_ImageLayer enter-from-right">
                  <img
                    src={whyAdinnWorksBest[0].image}
                    alt="Roadshow vehicle"
                    draggable={false}
                  />
                </div>
              )}

            {whyAdinnWorksBest.map(
              (
                feature,
                index,
              ) => (
                <div
                  key={`${feature.name}-vehicle`}
                  className={`RS_WhyAdRS_ImageLayer ${getWhyImageClass(
                    index,
                  )}`}
                >
                  <img
                    src={
                      feature.image
                    }
                    alt={`${feature.name} roadshow vehicle`}
                    draggable={
                      false
                    }
                  />
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          CLIENTS
      ===================================================== */}

      <div className="mx-auto px-30 RS_ClientsSectionWrap">
        <div className="RS_ClientsSection">
          <div className="RS_OurRdwHeading">
            <SplitHeading
              className="RS_OurRdwHeadingContent1"
              type="chars"
            >
              Some of Our
            </SplitHeading>

            <RevealText
              className="RS_OurRdwHeadingContent1 RS_OurRdwHeadingContent2"
              effect="wipe"
              delay={
                0.25
              }
            >
              Clients
            </RevealText>
          </div>

          <div
            className="RS_ClientsOrbitArea"
            ref={
              clientsOrbitRef
            }
          >
            <div className="RS_ClientCenterBubble">
              <span>
                Clients
              </span>
            </div>

            {visibleClients.map(
              (
                client,
              ) => (
                <div
                  key={
                    client.slot
                  }
                  className={`RS_ClientBubble RS_Bubble_${client.slot}`}
                >
                  <img
                    src={
                      client.logo
                    }
                    alt={
                      client.name
                    }
                    className="RS_ClientLogo"
                    style={
                      {
                        "--rs-logo-w": `${client.w}px`,
                      } as React.CSSProperties
                    }
                  />
                </div>
              ),
            )}
          </div>

          <div className="RS_ClientsBtnRow">
            <ViewAllClientsButton
              label="Explore More Brands"
              className="RS_ViewAllClientsBtn"
              onClick={
                showMoreClients
              }
              disabled={
                ourClients.length <=
                1
              }
            />
          </div>
        </div>
      </div>

      {/* =====================================================
          NEXT SECTIONS
      ===================================================== */}

      <HomePageSection2 />
    </>
  );
}