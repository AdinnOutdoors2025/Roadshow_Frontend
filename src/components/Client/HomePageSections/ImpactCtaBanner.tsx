/* eslint-disable */
// @ts-nocheck
"use client";

import React, {
  useLayoutEffect,
  useRef,
} from "react";

import Image from "next/image";
import Link from "next/link";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  HEADER_SCROLL_END_EVENT,
  HEADER_SCROLL_START_EVENT,
  type HeaderScrollEventDetail,
} from "../Reusable_Components/scrollToSection";

/* =========================================================
   TYPES
========================================================= */

type ImpactCtaBannerProps = {
  ctaHref?: string;
};

type BleedCtaProps = {
  href: string;
  label: string;
};

const HERO_VEHICLE_IMAGE = "/images/assets/full_side_LED_edited-1_new.png";

/* =========================================================
   DESKTOP SETTINGS
========================================================= */

const INITIAL_VEHICLE_SCALE = 1.18;

const LEFT_VEHICLE_SCALE = 1.82;

const LEFT_X_PERCENT = -45;

const LEFT_Y_PERCENT = -4;

const DESKTOP_SCROLL_LENGTH = 2.15;

/* =========================================================
   HEADER SETTINGS
========================================================= */

const RESPONSIVE_HEADER_GAP = 20;

const MOBILE_HEADER_FALLBACK = 72;

const TABLET_HEADER_FALLBACK = 80;

/* =========================================================
   MOBILE SETTINGS
========================================================= */

const MOBILE_VEHICLE_X = 0;

const MOBILE_VEHICLE_Y = 15;

const MOBILE_VEHICLE_SCALE = 1.08;

const MOBILE_SCRUB = 1;

/* =========================================================
   TABLET SETTINGS
========================================================= */

/*
 * INITIAL:
 * vehicle stays centered.
 *
 * AFTER SCROLL:
 * vehicle moves left.
 */
const TABLET_VEHICLE_X = -27;

const TABLET_VEHICLE_Y = 0;

const TABLET_VEHICLE_SCALE = 1.08;

/*
 * Higher = smoother/slower response.
 */
const TABLET_SCRUB = 1.2;

/* =========================================================
   RESPONSIVE STICKY STORY DISTANCE

   IMPORTANT:

   This controls only HOW LONG the sticky animation lasts.

   It does NOT change:
   - visible banner height
   - vehicle size
   - typography
   - existing internal spacing
========================================================= */

const MOBILE_STICKY_DISTANCE = 1.45;

const TABLET_STICKY_DISTANCE = 1.55;

/* =========================================================
   STICKY HEADER DETECTION
========================================================= */

function getStickyHeaderBottom(
  fallbackHeight: number,
) {
  if (typeof window === "undefined") {
    return fallbackHeight;
  }

  const selectors = [
    "[data-site-header]",
    "header",
    "#header",
    ".site-header",
    ".main-header",
    ".navbar",
  ];

  for (const selector of selectors) {
    const element =
      document.querySelector<HTMLElement>(
        selector,
      );

    if (!element) {
      continue;
    }

    const styles =
      window.getComputedStyle(element);

    const rect =
      element.getBoundingClientRect();

    if (
      rect.height <= 0 ||
      styles.display === "none" ||
      styles.visibility === "hidden"
    ) {
      continue;
    }

    const isSticky =
      styles.position === "fixed" ||
      styles.position === "sticky";

    if (!isSticky) {
      continue;
    }

    return Math.max(
      fallbackHeight,
      Math.ceil(rect.bottom),
    );
  }

  return fallbackHeight;
}

/* =========================================================
   CTA
========================================================= */

function BleedCta({
  href,
  label,
}: BleedCtaProps) {
  return (
    <Link
      href={href}
      className="
        inline-flex
        items-center
        justify-center

        !h-[42px]
        !min-h-[42px]

        w-fit

        rounded-full
        border-0

        bg-[#e8e8e8]

        !px-5

        font-sans
        !text-[11px]
        font-semibold

        leading-none
        tracking-[-0.01em]

        text-[#1f1f1f]

        no-underline

        shadow-[0_8px_22px_rgba(0,0,0,0.05)]

        sm:!h-[44px]
        sm:!min-h-[44px]
        sm:!px-6
        sm:!text-[12px]

        lg:!h-[56px]
        lg:!min-h-[56px]
        lg:!px-9
        lg:!text-[15px]

        lg:transition-transform
        lg:duration-300
        lg:hover:-translate-y-[2px]
      "
    >
      {label}
    </Link>
  );
}

/* =========================================================
   COMPONENT
========================================================= */

export default function ImpactCtaBanner({
  ctaHref = "/roadshow/Contact",
}: ImpactCtaBannerProps) {
  /* =======================================================
     ROOT
  ======================================================= */

  const sectionRef =
    useRef<HTMLElement | null>(null);

  /* =======================================================
     DESKTOP
  ======================================================= */

  const stageRef =
    useRef<HTMLDivElement | null>(null);

  const introRef =
    useRef<HTMLDivElement | null>(null);

  const desktopVehicleRef =
    useRef<HTMLDivElement | null>(null);

  const frameTwoRef =
    useRef<HTMLDivElement | null>(null);

  const frameThreeRef =
    useRef<HTMLDivElement | null>(null);

  /* =======================================================
     RESPONSIVE

     responsiveStoryRef:
     the GSAP pin's trigger/parent — this is where GSAP
     inserts its pin-spacer to reserve scroll distance.

     responsiveStageRef:
     the actual visible banner, pinned via GSAP ScrollTrigger.
  ======================================================= */

  const responsiveStoryRef =
    useRef<HTMLDivElement | null>(null);

  const responsiveStageRef =
    useRef<HTMLDivElement | null>(null);

  const responsiveIntroRef =
    useRef<HTMLDivElement | null>(null);

  const responsiveVehicleRef =
    useRef<HTMLDivElement | null>(null);

  const responsiveFrameTwoRef =
    useRef<HTMLDivElement | null>(null);

  const responsiveFrameThreeRef =
    useRef<HTMLDivElement | null>(null);

  /* =======================================================
     GSAP
  ======================================================= */

  useLayoutEffect(() => {
    const section =
      sectionRef.current;

    const stage =
      stageRef.current;

    const intro =
      introRef.current;

    const desktopVehicle =
      desktopVehicleRef.current;

    const frameTwo =
      frameTwoRef.current;

    const frameThree =
      frameThreeRef.current;

    const responsiveStory =
      responsiveStoryRef.current;

    const responsiveStage =
      responsiveStageRef.current;

    const responsiveIntro =
      responsiveIntroRef.current;

    const responsiveVehicle =
      responsiveVehicleRef.current;

    const responsiveFrameTwo =
      responsiveFrameTwoRef.current;

    const responsiveFrameThree =
      responsiveFrameThreeRef.current;

    if (
      !section ||
      !stage ||
      !intro ||
      !desktopVehicle ||
      !frameTwo ||
      !frameThree ||
      !responsiveStory ||
      !responsiveStage ||
      !responsiveIntro ||
      !responsiveVehicle ||
      !responsiveFrameTwo ||
      !responsiveFrameThree
    ) {
      return;
    }

    gsap.registerPlugin(
      ScrollTrigger,
    );

    const reduceMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

    const mm =
      gsap.matchMedia();

    /* During header-controlled navigation only, stop this pinned story from
       scrubbing/holding the trip to Home, Why Adinn, or Vehicles. Normal
       wheel and touch scrolling are unchanged after the short trip ends. */
    const headerNavigationTriggers =
      new Set<ScrollTrigger>();

    const handleHeaderScrollStart = (event: Event) => {
      const customEvent =
        event as CustomEvent<HeaderScrollEventDetail>;

      const progress =
        customEvent.detail?.direction === "up" ? 0 : 1;

      headerNavigationTriggers.forEach((trigger) => {
        trigger.getTween?.()?.kill();
        trigger.animation?.progress(progress);
        trigger.disable(false, false);
      });
    };

    const handleHeaderScrollEnd = () => {
      headerNavigationTriggers.forEach((trigger) => {
        trigger.enable(false, true);
      });

      ScrollTrigger.refresh();
    };

    window.addEventListener(
      HEADER_SCROLL_START_EVENT,
      handleHeaderScrollStart,
    );

    window.addEventListener(
      HEADER_SCROLL_END_EVENT,
      handleHeaderScrollEnd,
    );

    /* =====================================================
       DESKTOP
       KEEP EXISTING DESKTOP PINNED EXPERIENCE
    ===================================================== */

    mm.add(
      "(min-width: 1024px)",
      () => {
        let desktopScrollTrigger: ScrollTrigger | null = null;

        const ctx =
          gsap.context(() => {
            const introItems =
              gsap.utils.toArray<HTMLElement>(
                "[data-intro-reveal]",
                intro,
              );

            const frameTwoItems =
              gsap.utils.toArray<HTMLElement>(
                "[data-frame-two-reveal]",
                frameTwo,
              );

            const frameThreeItems =
              gsap.utils.toArray<HTMLElement>(
                "[data-frame-three-reveal]",
                frameThree,
              );

            /* =============================================
               RESET
            ============================================= */

            gsap.set(
              [
                desktopVehicle,
                ...introItems,
                ...frameTwoItems,
                ...frameThreeItems,
              ],
              {
                force3D: true,
              },
            );

            gsap.set(
              desktopVehicle,
              {
                xPercent: 0,

                yPercent: 0,

                scale:
                  INITIAL_VEHICLE_SCALE,

                transformOrigin:
                  "50% 54%",
              },
            );

            gsap.set(
              introItems,
              {
                yPercent: 0,

                autoAlpha: 1,
              },
            );

            gsap.set(
              frameTwo,
              {
                autoAlpha: 0,
              },
            );

            gsap.set(
              frameThree,
              {
                autoAlpha: 0,
              },
            );

            gsap.set(
              frameTwoItems,
              {
                yPercent: 118,

                autoAlpha: 1,
              },
            );

            gsap.set(
              frameThreeItems,
              {
                yPercent: 118,

                autoAlpha: 1,
              },
            );

            /* =============================================
               REDUCED MOTION
            ============================================= */

            if (reduceMotion) {
              gsap.set(
                intro,
                {
                  autoAlpha: 0,
                },
              );

              gsap.set(
                frameTwo,
                {
                  autoAlpha: 1,
                },
              );

              gsap.set(
                frameTwoItems,
                {
                  yPercent: 0,
                },
              );

              return;
            }

            /* =============================================
               DESKTOP TIMELINE
            ============================================= */

            const desktopTimeline =
              gsap.timeline({
                scrollTrigger: {
                  trigger:
                    section,

                  start:
                    "top top",

                  end: () =>
                    `+=${
                      window.innerHeight *
                      DESKTOP_SCROLL_LENGTH
                    }`,

                  pin:
                    stage,

                  pinSpacing:
                    true,

                  scrub: 1.05,

                  anticipatePin:
                    1,

                  invalidateOnRefresh:
                    true,
                },
              });

            desktopScrollTrigger =
              desktopTimeline.scrollTrigger ?? null;

            if (desktopScrollTrigger) {
              headerNavigationTriggers.add(
                desktopScrollTrigger,
              );
            }

            /* =============================================
               INTRO OUT
            ============================================= */

            desktopTimeline.to(
              introItems,
              {
                yPercent:
                  -118,

                autoAlpha:
                  0,

                duration:
                  0.4,

                stagger:
                  0.03,

                ease:
                  "power2.in",
              },
              0.08,
            );

            /* =============================================
               VEHICLE MOVE
            ============================================= */

            desktopTimeline.to(
              desktopVehicle,
              {
                xPercent:
                  LEFT_X_PERCENT,

                yPercent:
                  LEFT_Y_PERCENT,

                scale:
                  LEFT_VEHICLE_SCALE,

                duration:
                  1.08,

                ease:
                  "none",
              },
              0,
            );

            /* =============================================
               FRAME TWO
            ============================================= */

            desktopTimeline.set(
              frameTwo,
              {
                autoAlpha:
                  1,
              },
              0.47,
            );

            desktopTimeline.to(
              frameTwoItems,
              {
                yPercent:
                  0,

                duration:
                  0.55,

                stagger:
                  0.06,

                ease:
                  "power3.out",
              },
              0.49,
            );

            desktopTimeline.to(
              {},
              {
                duration:
                  0.24,
              },
            );

            /* =============================================
               FRAME TWO OUT
            ============================================= */

            desktopTimeline.to(
              frameTwoItems,
              {
                yPercent:
                  -118,

                duration:
                  0.44,

                stagger:
                  0.03,

                ease:
                  "power3.in",
              },
            );

            desktopTimeline.set(
              frameTwo,
              {
                autoAlpha:
                  0,
              },
            );

            /* =============================================
               FRAME THREE
            ============================================= */

            desktopTimeline.set(
              frameThree,
              {
                autoAlpha:
                  1,
              },
            );

            desktopTimeline.to(
              frameThreeItems,
              {
                yPercent:
                  0,

                duration:
                  0.54,

                stagger:
                  0.06,

                ease:
                  "power3.out",
              },
            );

            desktopTimeline.to(
              {},
              {
                duration:
                  0.32,
              },
            );
          }, section);

        return () => {
          if (desktopScrollTrigger) {
            headerNavigationTriggers.delete(
              desktopScrollTrigger,
            );
          }

          ctx.revert();
        };
      },
    );

    /* =====================================================
       MOBILE + TABLET

       IMPORTANT ARCHITECTURE (V17):

       Uses a real GSAP ScrollTrigger pin on responsiveStage,
       the same mechanism as the desktop stage above.

       V16 used CSS position: sticky here instead. That does
       not work on this page: GSAP ScrollSmoother moves
       #smooth-content with a transform rather than native
       scrolling, so a sticky element's nearest scrollport
       (#smooth-wrapper) never reports a scroll offset and the
       element silently behaves as static — see the note in
       GlobalSmoothScroll.tsx. That is what let the next
       section render behind/inside the Roadshow section while
       scrolling. GSAP's pin is ScrollSmoother-aware, so it
       positions responsiveStage correctly.

       pinSpacing reserves exactly the scroll distance the
       animation needs (getStoryDistance()) — same distance
       V16 used to size responsiveStory manually — so there is
       still no extra height and no artificial gap.

       This is what gives:

       pinned banner
       ↓
       animation
       ↓
       next section reaches banner bottom
       ↓
       next section PUSHES banner upward
    ===================================================== */

    mm.add(
      {
        mobile:
          "(max-width: 639px)",

        tablet:
          "(min-width: 640px) and (max-width: 1023px)",
      },

      (context) => {
        let responsiveScrollTrigger: ScrollTrigger | null = null;

        const isMobile =
          Boolean(
            context.conditions?.mobile,
          );

        /* =================================================
           STICKY TOP
        ================================================= */

        const getStickyTop =
          () => {
            const fallback =
              isMobile
                ? MOBILE_HEADER_FALLBACK
                : TABLET_HEADER_FALLBACK;

            return (
              getStickyHeaderBottom(
                fallback,
              ) +
              RESPONSIVE_HEADER_GAP
            );
          };

        /* =================================================
           STORY DISTANCE

           This is the invisible SCROLL RANGE the GSAP pin
           needs (used as its ScrollTrigger `end` value).

           It is not padding/margin inside the visible
           Roadshow card.
        ================================================= */

        const getStoryDistance =
          () => {
            const stageHeight =
              responsiveStage.offsetHeight;

            const multiplier =
              isMobile
                ? MOBILE_STICKY_DISTANCE
                : TABLET_STICKY_DISTANCE;

            return Math.max(
              stageHeight * multiplier,
              isMobile
                ? 620
                : 680,
            );
          };

        /* =================================================
           SYNC RESPONSIVE STAGE HEIGHT

           Keeps the visible banner's own height correct for
           the current viewport before the GSAP pin below
           measures it. The pin's own pinSpacing then reserves
           the extra scroll distance automatically; when the
           pin releases, the next section in normal flow
           physically pushes this stage upward.
        ================================================= */

        const updateResponsiveStory =
          () => {
            const stickyTop =
              getStickyTop();

            /*
             * KEEP EXISTING MOBILE HEIGHT BEHAVIOR.
             *
             * Tablet continues to use the current Tailwind
             * clamp height from the JSX below.
             */
            if (isMobile) {
              const availableHeight =
                Math.max(
                  500,

                  window.innerHeight -
                    stickyTop,
                );

              responsiveStage.style.height =
                `${availableHeight}px`;

              responsiveStage.style.minHeight =
                `${availableHeight}px`;

              responsiveStage.style.maxHeight =
                `${availableHeight}px`;
            } else {
              responsiveStage.style.removeProperty(
                "height",
              );

              responsiveStage.style.removeProperty(
                "min-height",
              );

              responsiveStage.style.removeProperty(
                "max-height",
              );
            }
          };

        updateResponsiveStory();

        ScrollTrigger.addEventListener(
          "refreshInit",
          updateResponsiveStory,
        );

        const ctx =
          gsap.context(() => {
            const responsiveIntroItems =
              gsap.utils.toArray<HTMLElement>(
                "[data-responsive-intro-reveal]",
                responsiveIntro,
              );

            const responsiveFrameTwoItems =
              gsap.utils.toArray<HTMLElement>(
                "[data-responsive-frame-two-reveal]",
                responsiveFrameTwo,
              );

            const responsiveFrameThreeItems =
              gsap.utils.toArray<HTMLElement>(
                "[data-responsive-frame-three-reveal]",
                responsiveFrameThree,
              );

            /* =============================================
               GPU
            ============================================= */

            gsap.set(
              [
                responsiveVehicle,
                ...responsiveIntroItems,
                ...responsiveFrameTwoItems,
                ...responsiveFrameThreeItems,
              ],
              {
                force3D: true,
              },
            );

            /* =============================================
               INITIAL VEHICLE

               KEEP CENTERED.
            ============================================= */

            gsap.set(
              responsiveVehicle,
              {
                xPercent: 0,

                yPercent: 0,

                scale: 1,

                transformOrigin:
                  "50% 54%",
              },
            );

            /* =============================================
               INTRO INITIAL
            ============================================= */

            gsap.set(
              responsiveIntroItems,
              {
                yPercent: 0,

                autoAlpha: 1,
              },
            );

            /* =============================================
               FRAME TWO INITIAL
            ============================================= */

            gsap.set(
              responsiveFrameTwo,
              {
                autoAlpha: 0,
              },
            );

            gsap.set(
              responsiveFrameTwoItems,
              {
                yPercent: 118,

                autoAlpha: 0,
              },
            );

            /* =============================================
               FRAME THREE INITIAL
            ============================================= */

            gsap.set(
              responsiveFrameThree,
              {
                autoAlpha: 0,
              },
            );

            gsap.set(
              responsiveFrameThreeItems,
              {
                yPercent: 118,

                autoAlpha: 0,
              },
            );

            /* =============================================
               REDUCED MOTION
            ============================================= */

            if (reduceMotion) {
              gsap.set(
                responsiveIntro,
                {
                  autoAlpha: 0,
                },
              );

              gsap.set(
                responsiveVehicle,
                {
                  xPercent:
                    isMobile
                      ? MOBILE_VEHICLE_X
                      : TABLET_VEHICLE_X,

                  yPercent:
                    isMobile
                      ? MOBILE_VEHICLE_Y
                      : TABLET_VEHICLE_Y,

                  scale:
                    isMobile
                      ? MOBILE_VEHICLE_SCALE
                      : TABLET_VEHICLE_SCALE,
                },
              );

              gsap.set(
                responsiveFrameThree,
                {
                  autoAlpha: 1,
                },
              );

              gsap.set(
                responsiveFrameThreeItems,
                {
                  yPercent: 0,

                  autoAlpha: 1,
                },
              );

              return;
            }

            /* =============================================
               RESPONSIVE TIMELINE

               IMPORTANT:

               Uses a real GSAP ScrollTrigger pin on
               responsiveStage (same mechanism as the desktop
               stage above), NOT CSS position: sticky.

               CSS sticky cannot work on this page: it sits
               inside GSAP ScrollSmoother's #smooth-content,
               which is moved with a transform instead of
               native scrolling, so a sticky element's
               scrollport never reports any scroll offset and
               it silently behaves as static (see the note in
               GlobalSmoothScroll.tsx). GSAP's own pin is
               ScrollSmoother-aware and positions the element
               correctly instead.
            ============================================= */

            const responsiveTimeline =
              gsap.timeline({
                scrollTrigger: {
                  trigger:
                    responsiveStory,

                  start: () =>
                    `top top+=${getStickyTop()}`,

                  end: () =>
                    `+=${
                      getStoryDistance()
                    }`,

                  pin:
                    responsiveStage,

                  pinSpacing:
                    true,

                  anticipatePin:
                    1,

                  scrub:
                    isMobile
                      ? MOBILE_SCRUB
                      : TABLET_SCRUB,

                  invalidateOnRefresh:
                    true,
                },
              });

            responsiveScrollTrigger =
              responsiveTimeline.scrollTrigger ?? null;

            if (responsiveScrollTrigger) {
              headerNavigationTriggers.add(
                responsiveScrollTrigger,
              );
            }

            /* =============================================
               INITIAL HOLD
            ============================================= */

            responsiveTimeline.to(
              {},
              {
                duration:
                  isMobile
                    ? 0.14
                    : 0.24,
              },
            );

            /* =============================================
               INTRO OUT
            ============================================= */

            responsiveTimeline.to(
              responsiveIntroItems,
              {
                yPercent:
                  -112,

                autoAlpha:
                  0,

                duration:
                  isMobile
                    ? 0.42
                    : 0.58,

                stagger:
                  isMobile
                    ? 0.035
                    : 0.05,

                ease:
                  "power2.inOut",
              },
            );

            /* =============================================
               VEHICLE MOVE

               INITIAL = CENTER
               AFTER SCROLL = LEFT
            ============================================= */

            responsiveTimeline.to(
              responsiveVehicle,
              {
                xPercent:
                  isMobile
                    ? MOBILE_VEHICLE_X
                    : TABLET_VEHICLE_X,

                yPercent:
                  isMobile
                    ? MOBILE_VEHICLE_Y
                    : TABLET_VEHICLE_Y,

                scale:
                  isMobile
                    ? MOBILE_VEHICLE_SCALE
                    : TABLET_VEHICLE_SCALE,

                duration:
                  isMobile
                    ? 0.9
                    : 1.08,

                ease:
                  "power1.inOut",
              },
              "<-0.3",
            );

            /* =============================================
               FRAME TWO ON
            ============================================= */

            responsiveTimeline.set(
              responsiveFrameTwo,
              {
                autoAlpha: 1,
              },
            );

            responsiveTimeline.to(
              responsiveFrameTwoItems,
              {
                yPercent: 0,

                autoAlpha: 1,

                duration:
                  isMobile
                    ? 0.5
                    : 0.62,

                stagger:
                  isMobile
                    ? 0.045
                    : 0.055,

                ease:
                  "power3.out",
              },
            );

            /* =============================================
               FRAME TWO HOLD
            ============================================= */

            responsiveTimeline.to(
              {},
              {
                duration:
                  isMobile
                    ? 0.22
                    : 0.38,
              },
            );

            /* =============================================
               FRAME TWO OUT
            ============================================= */

            responsiveTimeline.to(
              responsiveFrameTwoItems,
              {
                yPercent:
                  -112,

                autoAlpha:
                  0,

                duration:
                  isMobile
                    ? 0.4
                    : 0.5,

                stagger:
                  isMobile
                    ? 0.025
                    : 0.04,

                ease:
                  "power2.in",
              },
            );

            responsiveTimeline.set(
              responsiveFrameTwo,
              {
                autoAlpha: 0,
              },
            );

            /* =============================================
               FRAME THREE ON
            ============================================= */

            responsiveTimeline.set(
              responsiveFrameThree,
              {
                autoAlpha: 1,
              },
            );

            responsiveTimeline.to(
              responsiveFrameThreeItems,
              {
                yPercent: 0,

                autoAlpha: 1,

                duration:
                  isMobile
                    ? 0.5
                    : 0.62,

                stagger:
                  isMobile
                    ? 0.045
                    : 0.055,

                ease:
                  "power3.out",
              },
            );

            /* =============================================
               FINAL HOLD

               20L+ stays fully visible before the sticky
               wrapper reaches its end.

               THEN the following section reaches this
               stage and pushes the Roadshow stage upward.
            ============================================= */

            responsiveTimeline.to(
              {},
              {
                duration:
                  isMobile
                    ? 0.32
                    : 0.52,
              },
            );
          }, responsiveStory);

        /* =================================================
           RESIZE
        ================================================= */

        const handleResize =
          () => {
            updateResponsiveStory();

            ScrollTrigger.refresh();
          };

        window.addEventListener(
          "resize",
          handleResize,
        );

        const refreshFrame =
          window.requestAnimationFrame(
            () => {
              updateResponsiveStory();

              ScrollTrigger.refresh();
            },
          );

        /* =================================================
           CLEANUP
        ================================================= */

        return () => {
          if (responsiveScrollTrigger) {
            headerNavigationTriggers.delete(
              responsiveScrollTrigger,
            );
          }

          window.cancelAnimationFrame(
            refreshFrame,
          );

          window.removeEventListener(
            "resize",
            handleResize,
          );

          ScrollTrigger.removeEventListener(
            "refreshInit",
            updateResponsiveStory,
          );

          responsiveStage.style.removeProperty(
            "height",
          );

          responsiveStage.style.removeProperty(
            "min-height",
          );

          responsiveStage.style.removeProperty(
            "max-height",
          );

          ctx.revert();
        };
      },
    );

    /* =====================================================
       COMPLETE CLEANUP
    ===================================================== */

    return () => {
      window.removeEventListener(
        HEADER_SCROLL_START_EVENT,
        handleHeaderScrollStart,
      );

      window.removeEventListener(
        HEADER_SCROLL_END_EVENT,
        handleHeaderScrollEnd,
      );

      mm.revert();
      headerNavigationTriggers.clear();
    };
  }, []);

  /* =======================================================
     JSX
  ======================================================= */

  return (
    <section
      ref={sectionRef}
      data-responsive-scroll="GSAP_PIN_PUSH_V17"
      className="
        relative

        !m-0
        !mb-0

        !p-0
        !pb-0

        w-full

        bg-[#f8f8f6]
      "
    >
      {/* ===================================================
          DESKTOP STAGE
      =================================================== */}

      <div
        ref={stageRef}
        className="
          relative

          hidden

          h-[100svh]

          min-h-[760px]

          w-full

          overflow-hidden

          bg-[#f8f8f6]

          lg:block
        "
      >
        {/* =================================================
            BACKGROUND
        ================================================= */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none

            absolute

            inset-0

            bg-[radial-gradient(circle_at_50%_43%,rgba(255,255,255,1)_0%,rgba(255,255,255,0.82)_34%,rgba(248,248,246,0)_76%)]
          "
        />

        {/* =================================================
            ROADSHOW WATERMARK
        ================================================= */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none

            absolute

            bottom-[-4vw]

            left-[48%]

            z-[2]

            w-max

            -translate-x-1/2
          "
        >
          <span
            className="
              block

              select-none

              whitespace-nowrap

              text-center

              font-serif

              text-[22vw]

              font-normal

              italic

              leading-none

              tracking-[-0.055em]

              text-black/[0.032]
            "
          >
            roadshows
          </span>
        </div>

        {/* =================================================
            DESKTOP INTRO
        ================================================= */}

        <div
          ref={introRef}
          className="
            pointer-events-none

            absolute

            left-1/2

            top-[clamp(135px,14vh,165px)]

            z-30

            w-[min(900px,76vw)]

            -translate-x-1/2

            text-center
          "
        >
          <div
            className="
              overflow-hidden
            "
          >
            <p
              data-intro-reveal
              className="
                m-0

                transform-gpu

                will-change-transform

                font-sans

                text-[clamp(32px,3.6vw,58px)]

                font-normal

                leading-[0.98]

                tracking-[-0.05em]

                text-[#a2a19e]
              "
            >
              <span
                className="
                  font-serif

                  font-normal

                  italic

                  text-[#969088]
                "
              >
                Powerful roadshow advertising
              </span>
            </p>
          </div>

          <div
            className="
              mt-1

              overflow-hidden
            "
          >
            <h2
              data-intro-reveal
              className="
                mx-auto

                max-w-[820px]

                transform-gpu

                will-change-transform

                font-sans

                text-[clamp(38px,4.3vw,68px)]

                font-medium

                leading-[0.98]

                tracking-[-0.058em]

                text-[#111111]
              "
            >
              to amplify your brand

              <br />

              where it matters most
            </h2>
          </div>
        </div>

        {/* =================================================
            DESKTOP VEHICLE
        ================================================= */}

        <div
          className="
            pointer-events-none

            absolute

            left-1/2

            top-[53%]

            z-20

            w-[min(780px,43vw)]

            -translate-x-1/2
            -translate-y-1/2
          "
        >
          <div
            ref={desktopVehicleRef}
            className="
              relative

              w-full

              transform-gpu

              backface-hidden

              will-change-transform
            "
          >
            <Image
              src={HERO_VEHICLE_IMAGE}
              alt="Adinn roadshow advertising vehicle"
              width={1200}
              height={720}
              priority
              draggable={false}
              sizes="43vw"
              className="
                relative

                z-[2]

                block

                h-auto

                w-full

                select-none

                object-contain

                drop-shadow-[0_28px_24px_rgba(0,0,0,0.15)]
              "
            />

            <div
              aria-hidden="true"
              className="
                absolute

                bottom-[1%]

                left-[13%]

                right-[8%]

                z-[1]

                h-[7%]

                rounded-[50%]

                bg-black/20

                blur-[25px]
              "
            />
          </div>
        </div>

        {/* =================================================
            DESKTOP CONTENT
        ================================================= */}

        <div
          className="
            absolute

            left-[61%]

            top-1/2

            z-40

            h-[430px]

            w-[31%]

            min-w-[390px]

            max-w-[500px]

            -translate-y-1/2

            overflow-hidden

            xl:left-[61.5%]

            2xl:left-[62%]
          "
        >
          {/* ===============================================
              FRAME TWO
          =============================================== */}

          <div
            ref={frameTwoRef}
            className="
              invisible

              absolute

              inset-0

              flex

              flex-col

              justify-center

              opacity-0
            "
          >
            <div
              className="
                overflow-hidden
              "
            >
              <div
                data-frame-two-reveal
                className="
                  transform-gpu

                  will-change-transform

                  font-sans

                  text-[clamp(82px,6.5vw,116px)]

                  font-normal

                  leading-[0.8]

                  tracking-[-0.07em]

                  text-[#111111]
                "
              >
                250+
              </div>
            </div>

            <div
              className="
                mt-7

                overflow-hidden
              "
            >
              <h3
                data-frame-two-reveal
                className="
                  transform-gpu

                  will-change-transform

                  font-sans

                  text-[clamp(34px,2.7vw,47px)]

                  font-medium

                  leading-[0.98]

                  tracking-[-0.046em]

                  text-[#111111]
                "
              >
                Roadshow Vehicles
              </h3>
            </div>

            <div
              className="
                mt-5

                overflow-hidden

                pb-3
              "
            >
              <div
                data-frame-two-reveal
                className="
                  transform-gpu

                  will-change-transform
                "
              >
                <BleedCta
                  href={ctaHref}
                  label="Explore Vehicles"
                />
              </div>
            </div>
          </div>

          {/* ===============================================
              FRAME THREE
          =============================================== */}

          <div
            ref={frameThreeRef}
            className="
              invisible

              absolute

              inset-0

              flex

              flex-col

              justify-center

              opacity-0
            "
          >
            <div
              className="
                overflow-hidden
              "
            >
              <div
                data-frame-three-reveal
                className="
                  transform-gpu

                  will-change-transform

                  font-sans

                  text-[clamp(82px,6.5vw,116px)]

                  font-normal

                  leading-[0.8]

                  tracking-[-0.07em]

                  text-[#111111]
                "
              >
                20L+
              </div>
            </div>

            <div
              className="
                mt-7

                overflow-hidden
              "
            >
              <h3
                data-frame-three-reveal
                className="
                  transform-gpu

                  will-change-transform

                  font-sans

                  text-[clamp(34px,2.7vw,47px)]

                  font-medium

                  leading-[0.98]

                  tracking-[-0.046em]

                  text-[#111111]
                "
              >
                Daily Impressions
              </h3>
            </div>

            <div
              className="
                mt-5

                overflow-hidden

                pb-3
              "
            >
              <div
                data-frame-three-reveal
                className="
                  transform-gpu

                  will-change-transform
                "
              >
                <BleedCta
                  href={ctaHref}
                  label="Plan Your Roadshow"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================
          RESPONSIVE PIN STORY

          Wraps the pinned responsive stage. GSAP inserts its
          own pin-spacer here at runtime to reserve the scroll
          distance the animation needs — do NOT put
          overflow-hidden/auto/scroll on this wrapper, it can
          clip that spacer and the pinned content.
      =================================================== */}

      <div
        ref={responsiveStoryRef}
        className="
          relative

          !m-0
          !mb-0

          !p-0
          !pb-0

          w-full

          overflow-visible

          bg-[#f8f8f6]

          lg:hidden
        "
      >
        {/* =================================================
            MOBILE + TABLET PINNED STAGE

            IMPORTANT:

            Pinned via GSAP ScrollTrigger (see the
            scrollTrigger config above), matching the desktop
            stage's own pin mechanism — NOT CSS position:
            sticky, which cannot work inside GSAP
            ScrollSmoother (see GlobalSmoothScroll.tsx).

            The pin engages once this stage's top reaches
            the sticky header's bottom + 20px, and releases
            when the animation's scroll distance is used up,
            at which point the next section in normal flow
            pushes this stage upward.
        ================================================= */}

        <div
          ref={responsiveStageRef}
          className="
            relative

            z-[30]

            !m-0
            !mb-0

            !p-0
            !pb-0

            w-full

            overflow-hidden

            bg-[#f8f8f6]

            !h-[calc(100svh-92px)]
            !min-h-[500px]

            sm:!h-[clamp(420px,58svh,520px)]
            sm:!min-h-[420px]
            sm:!max-h-[520px]
          "
        >
          {/* ===============================================
              RESPONSIVE BACKGROUND
          =============================================== */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none

              absolute

              inset-0

              bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,1)_0%,rgba(255,255,255,0.85)_38%,rgba(248,248,246,0)_78%)]
            "
          />

          {/* ===============================================
              ROADSHOW WATERMARK
          =============================================== */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none

              absolute

              !bottom-[-3vw]

              left-1/2

              z-[2]

              w-max

              -translate-x-1/2

              sm:!bottom-[-2vw]
            "
          >
            <span
              className="
                block

                select-none

                whitespace-nowrap

                text-center

                font-serif

                text-[22vw]

                font-normal

                italic

                leading-none

                tracking-[-0.055em]

                text-black/[0.028]

                sm:!text-[17vw]
              "
            >
              roadshows
            </span>
          </div>

          {/* ===============================================
              RESPONSIVE INTRO
          =============================================== */}

          <div
            ref={responsiveIntroRef}
            className="
              pointer-events-none

              absolute

              left-1/2

              !top-[5%]

              z-30

              !w-[calc(100%-40px)]

              max-w-[700px]

              -translate-x-1/2

              text-center

              sm:!top-[7%]

              sm:!w-[76%]
            "
          >
            <div
              className="
                overflow-hidden

                pb-1
              "
            >
              <p
                data-responsive-intro-reveal
                className="
                  m-0

                  transform-gpu

                  will-change-transform

                  font-sans

                  !text-[clamp(16px,5vw,19px)]

                  font-normal

                  leading-[1.02]

                  tracking-[-0.045em]

                  text-[#a2a19e]

                  sm:!text-[clamp(19px,2.6vw,25px)]
                "
              >
                <span
                  className="
                    font-serif

                    font-normal

                    italic

                    text-[#969088]
                  "
                >
                  Powerful roadshow advertising
                </span>
              </p>
            </div>

            <div
              className="
                mt-1

                overflow-hidden

                pb-2
              "
            >
              <h2
                data-responsive-intro-reveal
                className="
                  mx-auto

                  max-w-[680px]

                  transform-gpu

                  will-change-transform

                  text-balance

                  font-sans

                  !text-[clamp(24px,7.6vw,30px)]

                  font-medium

                  leading-[0.98]

                  tracking-[-0.052em]

                  text-[#111111]

                  sm:!text-[clamp(28px,3.7vw,37px)]
                "
              >
                to amplify your brand

                <br />

                where it matters most
              </h2>
            </div>
          </div>

          {/* ===============================================
              RESPONSIVE VEHICLE

              SAME SIZE / POSITION STRUCTURE.
          =============================================== */}

          <div
            className="
              pointer-events-none

              absolute

              left-1/2

              !top-[40%]

              z-20

              !w-[160vw]

              max-w-none

              -translate-x-1/2
              -translate-y-1/2

              sm:!left-1/2

              sm:!top-[52%]

              sm:!w-[min(620px,64vw)]
            "
          >
            <div
              ref={responsiveVehicleRef}
              className="
                relative

                w-full

                transform-gpu

                backface-hidden

                will-change-transform
              "
            >
              <Image
                src={HERO_VEHICLE_IMAGE}
                alt="Adinn roadshow advertising vehicle"
                width={1200}
                height={720}
                priority
                draggable={false}
                sizes="
                  (max-width:639px) 160vw,
                  (max-width:1023px) 64vw,
                  43vw
                "
                className="
                  relative

                  z-[2]

                  block

                  !h-auto
                  !w-full

                  max-w-none

                  select-none

                  object-contain

                  drop-shadow-[0_20px_18px_rgba(0,0,0,0.15)]
                "
                onLoad={() => {
                  window.requestAnimationFrame(
                    () => {
                      ScrollTrigger.refresh();
                    },
                  );
                }}
              />

              <div
                aria-hidden="true"
                className="
                  absolute

                  bottom-[1%]

                  left-[13%]

                  right-[8%]

                  z-[1]

                  h-[7%]

                  rounded-[50%]

                  bg-black/[0.15]

                  blur-[20px]
                "
              />
            </div>
          </div>

          {/* ===============================================
              RESPONSIVE CONTENT VIEWPORT

              SAME EXISTING STRUCTURE.
          =============================================== */}

          <div
            aria-live="polite"
            className="
              absolute

              left-5
              right-5

              !top-[6%]

              z-40

              !h-[250px]

              overflow-hidden

              sm:!left-[61%]
              sm:!right-auto

              sm:!top-[49%]

              sm:!h-[260px]

              sm:!w-[36%]

              sm:!min-w-[230px]
              sm:!max-w-[340px]

              sm:-translate-y-1/2
            "
          >
            {/* =============================================
                FRAME TWO
            ============================================= */}

            <div
              ref={responsiveFrameTwoRef}
              className="
                invisible

                absolute

                inset-0

                flex

                flex-col

                justify-start

                opacity-0

                sm:justify-center
              "
            >
              {/* ===========================================
                  250+
              =========================================== */}

              <div
                className="
                  overflow-hidden

                  !pb-3
                "
              >
                <div
                  data-responsive-frame-two-reveal
                  className="
                    transform-gpu

                    will-change-transform

                    font-sans

                    !text-[clamp(48px,14.5vw,62px)]

                    font-normal

                    leading-[0.86]

                    tracking-[-0.065em]

                    text-[#111111]

                    sm:!text-[clamp(52px,6.6vw,68px)]
                  "
                >
                  250+
                </div>
              </div>

              {/* ===========================================
                  ROADSHOW VEHICLES
              =========================================== */}

              <div
                className="
                  !mt-3

                  overflow-hidden

                  !pb-2
                "
              >
                <h3
                  data-responsive-frame-two-reveal
                  className="
                    transform-gpu

                    will-change-transform

                    whitespace-nowrap

                    font-sans

                    !text-[clamp(23px,7vw,29px)]

                    font-medium

                    leading-[1.05]

                    tracking-[-0.045em]

                    text-[#111111]

                    sm:!text-[clamp(22px,2.8vw,29px)]
                  "
                >
                  Roadshow Vehicles
                </h3>
              </div>

              {/* ===========================================
                  BUTTON
              =========================================== */}

              <div
                className="
                  !mt-4

                  overflow-hidden

                  !pb-4
                "
              >
                <div
                  data-responsive-frame-two-reveal
                  className="
                    transform-gpu

                    will-change-transform
                  "
                >
                  <BleedCta
                    href={ctaHref}
                    label="Explore Vehicles"
                  />
                </div>
              </div>
            </div>

            {/* =============================================
                FRAME THREE
            ============================================= */}

            <div
              ref={responsiveFrameThreeRef}
              className="
                invisible

                absolute

                inset-0

                flex

                flex-col

                justify-start

                opacity-0

                sm:justify-center
              "
            >
              {/* ===========================================
                  20L+
              =========================================== */}

              <div
                className="
                  overflow-hidden

                  !pb-3
                "
              >
                <div
                  data-responsive-frame-three-reveal
                  className="
                    transform-gpu

                    will-change-transform

                    font-sans

                    !text-[clamp(48px,14.5vw,62px)]

                    font-normal

                    leading-[0.86]

                    tracking-[-0.065em]

                    text-[#111111]

                    sm:!text-[clamp(52px,6.6vw,68px)]
                  "
                >
                  20L+
                </div>
              </div>

              {/* ===========================================
                  DAILY IMPRESSIONS
              =========================================== */}

              <div
                className="
                  !mt-3

                  overflow-hidden

                  !pb-2
                "
              >
                <h3
                  data-responsive-frame-three-reveal
                  className="
                    transform-gpu

                    will-change-transform

                    whitespace-nowrap

                    font-sans

                    !text-[clamp(23px,7vw,29px)]

                    font-medium

                    leading-[1.05]

                    tracking-[-0.045em]

                    text-[#111111]

                    sm:!text-[clamp(22px,2.8vw,29px)]
                  "
                >
                  Daily Impressions
                </h3>
              </div>

              {/* ===========================================
                  BUTTON
              =========================================== */}

              <div
                className="
                  !mt-4

                  overflow-hidden

                  !pb-4
                "
              >
                <div
                  data-responsive-frame-three-reveal
                  className="
                    transform-gpu

                    will-change-transform
                  "
                >
                  <BleedCta
                    href={ctaHref}
                    label="Plan Your Roadshow"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}