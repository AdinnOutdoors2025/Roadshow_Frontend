"use client";

import {
  useLayoutEffect,
  useRef,
} from "react";

import Image from "next/image";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { ButtonHover } from "../Reusable_Components/ButtonHover";

type ImpactCtaBannerProps = {
  ctaHref?: string;
};

type BleedCtaProps = {
  href: string;
  label: string;
};

const HERO_VEHICLE_IMAGE =
  "/images/assets/full side LED edited (1)_NEW.png";

/* =========================================================
   EASY DESKTOP TUNING
========================================================= */

const INITIAL_VEHICLE_SCALE = 1.18;
const LEFT_VEHICLE_SCALE = 1.82;
const LEFT_X_PERCENT = -45;
const LEFT_Y_PERCENT = -4;
const SCROLL_LENGTH = 2.15;

/* =========================================================
   BLEED CTA
========================================================= */

function BleedCta({
  href,
  label,
}: BleedCtaProps) {
  return (
    <ButtonHover
      href={href}
      label={label}
      className="
        inline-flex
        h-[56px]
        min-h-[56px]
        w-fit
        items-center
        justify-center
        rounded-full
        border-0
        bg-[#e8e8e8]
        px-9
        font-sans
        text-[15px]
        font-semibold
        leading-none
        tracking-[-0.01em]
        text-[#1f1f1f]
        shadow-[0_10px_28px_rgba(0,0,0,0.045)]
        max-[640px]:h-[52px]
        max-[640px]:min-h-[52px]
        max-[640px]:px-7
        max-[640px]:text-[14px]
      "
    />
  );
}

/* =========================================================
   COMPONENT
========================================================= */

export default function ImpactCtaBanner({
  ctaHref = "/roadshow/Contact",
}: ImpactCtaBannerProps) {
  const sectionRef =
    useRef<HTMLElement | null>(null);

  const stageRef =
    useRef<HTMLDivElement | null>(null);

  const introRef =
    useRef<HTMLDivElement | null>(null);

  const desktopVehicleRef =
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

  const frameTwoRef =
    useRef<HTMLDivElement | null>(null);

  const frameThreeRef =
    useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const section =
      sectionRef.current;

    const stage =
      stageRef.current;

    const intro =
      introRef.current;

    const desktopVehicle =
      desktopVehicleRef.current;

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

    const frameTwo =
      frameTwoRef.current;

    const frameThree =
      frameThreeRef.current;

    if (
      !section ||
      !stage ||
      !intro ||
      !desktopVehicle ||
      !frameTwo ||
      !frameThree ||
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

    /* =====================================================
       DESKTOP SCROLL STORY
    ===================================================== */

    mm.add(
      "(min-width: 1024px)",
      () => {
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

            if (reduceMotion) {
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

            const timeline =
              gsap.timeline({
                scrollTrigger: {
                  trigger:
                    section,

                  start:
                    "top top",

                  end: () =>
                    `+=${
                      window.innerHeight *
                      SCROLL_LENGTH
                    }`,

                  pin:
                    stage,

                  pinSpacing:
                    true,

                  scrub: 1.05,

                  anticipatePin: 1,

                  invalidateOnRefresh:
                    false,
                },
              });

            /* =================================================
               FRAME 01 -> FRAME 02
            ================================================= */

            timeline.to(
              introItems,
              {
                yPercent: -118,
                autoAlpha: 0,
                duration: 0.4,
                stagger: 0.03,
                ease: "power2.in",
              },
              0.08,
            );

            /*
             * ONE smooth vehicle tween:
             * center -> left
             * scale 1.18 -> 1.82
             * slightly upward
             */
            timeline.to(
              desktopVehicle,
              {
                xPercent:
                  LEFT_X_PERCENT,

                yPercent:
                  LEFT_Y_PERCENT,

                scale:
                  LEFT_VEHICLE_SCALE,

                duration: 1.08,

                ease: "none",
              },
              0,
            );

            timeline.set(
              frameTwo,
              {
                autoAlpha: 1,
              },
              0.47,
            );

            timeline.to(
              frameTwoItems,
              {
                yPercent: 0,
                duration: 0.55,
                stagger: 0.06,
                ease: "power3.out",
              },
              0.49,
            );

            timeline.to(
              {},
              {
                duration: 0.24,
              },
            );

            /* =================================================
               FRAME 02 -> FRAME 03
            ================================================= */

            timeline.to(
              frameTwoItems,
              {
                yPercent: -118,
                duration: 0.44,
                stagger: 0.03,
                ease: "power3.in",
              },
            );

            timeline.set(
              frameTwo,
              {
                autoAlpha: 0,
              },
            );

            timeline.set(
              frameThree,
              {
                autoAlpha: 1,
              },
            );

            timeline.to(
              frameThreeItems,
              {
                yPercent: 0,
                duration: 0.54,
                stagger: 0.06,
                ease: "power3.out",
              },
            );

            timeline.to(
              {},
              {
                duration: 0.32,
              },
            );
          }, section);

        return () => {
          ctx.revert();
        };
      },
    );

    /* =====================================================
       TABLET + MOBILE PINNED SCROLL STORY

       This is intentionally separate from the desktop
       timeline above. The desktop design and animation
       values remain completely unchanged.
    ===================================================== */

    mm.add(
      {
        mobile:
          "(max-width: 639px)",

        tablet:
          "(min-width: 640px) and (max-width: 1023px)",
      },
      (context) => {
        const isMobile =
          Boolean(
            context.conditions?.mobile,
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

            gsap.set(
              responsiveIntroItems,
              {
                yPercent: 0,
                autoAlpha: 1,
              },
            );

            gsap.set(
              responsiveFrameTwo,
              {
                autoAlpha: 0,
              },
            );

            gsap.set(
              responsiveFrameThree,
              {
                autoAlpha: 0,
              },
            );

            gsap.set(
              responsiveFrameTwoItems,
              {
                yPercent: 118,
                autoAlpha: 1,
              },
            );

            gsap.set(
              responsiveFrameThreeItems,
              {
                yPercent: 118,
                autoAlpha: 1,
              },
            );

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
                    isMobile ? 0 : -36,

                  yPercent:
                    isMobile ? 20 : 2,

                  scale:
                    isMobile ? 1.08 : 1.4,
                },
              );

              gsap.set(
                responsiveFrameTwo,
                {
                  autoAlpha: 1,
                },
              );

              gsap.set(
                responsiveFrameTwoItems,
                {
                  yPercent: 0,
                },
              );

              return;
            }

            const responsiveTimeline =
              gsap.timeline({
                scrollTrigger: {
                  trigger:
                    section,

                  start:
                    "top top",

                  end: () =>
                    `+=${
                      window.innerHeight *
                      (isMobile
                        ? 2.45
                        : 2.25)
                    }`,

                  pin:
                    responsiveStage,

                  pinSpacing:
                    true,

                  scrub:
                    isMobile
                      ? 0.82
                      : 0.95,

                  anticipatePin: 1,

                  invalidateOnRefresh:
                    true,
                },
              });

            /* =============================================
               RESPONSIVE FRAME 01 -> FRAME 02
            ============================================= */

            responsiveTimeline.to(
              responsiveIntroItems,
              {
                yPercent: -118,
                autoAlpha: 0,
                duration: 0.4,
                stagger: 0.03,
                ease: "power2.in",
              },
              0.08,
            );

            responsiveTimeline.to(
              responsiveVehicle,
              {
                xPercent:
                  isMobile ? 0 : -36,

                yPercent:
                  isMobile ? 20 : 2,

                scale:
                  isMobile ? 1.08 : 1.4,

                duration: 1.08,

                ease: "none",
              },
              0,
            );

            responsiveTimeline.set(
              responsiveFrameTwo,
              {
                autoAlpha: 1,
              },
              0.47,
            );

            responsiveTimeline.to(
              responsiveFrameTwoItems,
              {
                yPercent: 0,
                duration: 0.55,
                stagger: 0.06,
                ease: "power3.out",
              },
              0.49,
            );

            responsiveTimeline.to(
              {},
              {
                duration: 0.24,
              },
            );

            /* =============================================
               RESPONSIVE FRAME 02 -> FRAME 03
            ============================================= */

            responsiveTimeline.to(
              responsiveFrameTwoItems,
              {
                yPercent: -118,
                duration: 0.44,
                stagger: 0.03,
                ease: "power3.in",
              },
            );

            responsiveTimeline.set(
              responsiveFrameTwo,
              {
                autoAlpha: 0,
              },
            );

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
                duration: 0.54,
                stagger: 0.06,
                ease: "power3.out",
              },
            );

            responsiveTimeline.to(
              {},
              {
                duration: 0.32,
              },
            );
          }, section);

        return () => {
          ctx.revert();
        };
      },
    );

    return () => {
      mm.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      data-responsive-scroll="MOBILE_TABLET_SCROLL_V2_SPACING"
      className="
        relative
        w-full
        bg-[#f8f8f6]
      "
    >
      {/* =====================================================
          DESKTOP PINNED STAGE
      ===================================================== */}

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
        {/* Background */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            bg-[radial-gradient(circle_at_50%_43%,rgba(255,255,255,1)_0%,rgba(255,255,255,0.82)_34%,rgba(248,248,246,0)_76%)]
          "
        />

        {/* ===================================================
            STATIC ROADSHOW TYPOGRAPHY

            text-[22vw] = requested size.
            bottom-[-11vw] = moves it farther DOWN.
            left-1/2 + -translate-x-1/2 = exact center.

            No GSAP ref, so it never moves with vehicle.
        =================================================== */}

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
      italic
      font-normal
      leading-none
      tracking-[-0.055em]
      text-black/[0.032]
    "
  >
    roadshow
  </span>
</div>

        {/* ===================================================
            FRAME 01 INTRO
        =================================================== */}

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
          <div className="overflow-hidden">
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
                  italic
                  font-normal
                  text-[#969088]
                "
              >
                Powerful roadshow advertising
              </span>
            </p>
          </div>

          <div className="mt-1 overflow-hidden">
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
              to amplify{" "}

            

              your brand

              <br />

              where it matters most
            </h2>
          </div>
        </div>

        {/* ===================================================
            DESKTOP VEHICLE

            top-[53%] moves vehicle UP from the old ~58%.

            w-[min(780px,43vw)] + scale 1.82 keeps it large
            without forcing the image too far outside the page.
        =================================================== */}

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

        {/* ===================================================
            RIGHT-SIDE CONTENT

            Moved left from ~64-66% to ~61-62%.
            This reduces the empty center gap.
        =================================================== */}

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
          {/* =================================================
              FRAME 02
          ================================================= */}

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
            <div className="overflow-hidden">
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

            <div className="mt-7 overflow-hidden">
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

            <div className="mt-5 overflow-hidden">
              {/* <p
                data-frame-two-reveal
                className="
                  max-w-[390px]
                  transform-gpu
                  will-change-transform
                  font-sans
                  text-[17px]
                  font-normal
                  leading-[1.55]
                  tracking-[-0.01em]
                  text-black/48
                "
              >
                Modern fleet for every marketing need.
              </p> */}
            </div>

            <div className="overflow-hidden pb-3">
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

          {/* =================================================
              FRAME 03
          ================================================= */}

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
            <div className="overflow-hidden">
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

            <div className="mt-7 overflow-hidden">
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

            <div className="mt-5 overflow-hidden">
              {/* <p
                data-frame-three-reveal
                className="
                  max-w-[390px]
                  transform-gpu
                  will-change-transform
                  font-sans
                  text-[17px]
                  font-normal
                  leading-[1.55]
                  tracking-[-0.01em]
                  text-black/48
                "
              >
                Real people. Real reach. Every single day.
              </p> */}
            </div>

            <div className="overflow-hidden pb-3">
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

      {/* =====================================================
          TABLET + MOBILE PINNED STAGE

          Mobile and tablet now follow the same three-state
          storytelling logic as desktop, but their layouts are
          specifically composed for narrow screens.

          IMPORTANT:
          This is separate markup. It does not change any
          desktop design, position, sizing or animation value.
      ===================================================== */}

      <div
  ref={responsiveStageRef}
  className="
    relative
    h-[calc(100svh_-_110px)]
    min-h-[560px]
    w-full
    overflow-hidden
    bg-[#f8f8f6]
    sm:h-[100svh]
    sm:min-h-[600px]
    lg:hidden
  "
>
        {/* Responsive background */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            bg-[radial-gradient(circle_at_50%_34%,rgba(255,255,255,1)_0%,rgba(255,255,255,0.78)_38%,rgba(248,248,246,0)_76%)]
          "
        />

        {/* Static responsive roadshow typography */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            bottom-[38%]
            left-1/2
            z-[2]
            w-max
            -translate-x-1/2
            sm:bottom-[-2vw]
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
              sm:text-[21vw]
            "
          >
            roadshow
          </span>
        </div>

        {/* ================================================
            RESPONSIVE FRAME 01 INTRO
        ================================================ */}

        <div
          ref={responsiveIntroRef}
          className="
            pointer-events-none
            absolute
            left-1/2
            top-[8%]
            z-30
            w-[calc(100%_-_40px)]
            max-w-[700px]
            -translate-x-1/2
            text-center
            sm:top-[11%]
            sm:w-[82%]
          "
        >
          <div className="overflow-hidden pb-1">
            <p
              data-responsive-intro-reveal
              className="
                m-0
                transform-gpu
                will-change-transform
                font-sans
                text-[clamp(16px,5.1vw,19px)]
                font-normal
                leading-[1.02]
                tracking-[-0.045em]
                text-[#a2a19e]
                sm:text-[clamp(24px,3.8vw,34px)]
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

          <div className="mt-1 overflow-hidden pb-2">
            <h2
              data-responsive-intro-reveal
              className="
                mx-auto
                max-w-[680px]
                transform-gpu
                will-change-transform
                text-balance
                font-sans
                text-[clamp(24px,7.8vw,30px)]
                font-medium
                leading-[0.98]
                tracking-[-0.056em]
                text-[#111111]
                sm:text-[clamp(36px,5.4vw,48px)]
              "
            >
              to amplify your brand

              <br />

              where it matters most
            </h2>
          </div>
        </div>

        {/* ================================================
            RESPONSIVE VEHICLE

            The outer wrapper owns static centering.
            GSAP animates only the inner element, preventing
            a transform conflict with Tailwind centering.
        ================================================ */}

        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-[38%]
            z-20
            w-[165vw]
            max-w-none
            -translate-x-1/2
            -translate-y-1/2
            sm:top-[56%]
            sm:w-[min(760px,86vw)]
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
                (max-width: 639px) 165vw,
                (max-width: 1023px) 86vw,
                43vw
              "
              className="
                relative
                z-[2]
                block
                h-auto
                w-full
                max-w-none
                select-none
                object-contain
                drop-shadow-[0_24px_22px_rgba(0,0,0,0.15)]
              "
              onLoad={() => {
                ScrollTrigger.refresh();
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
                bg-black/[0.17]
                blur-[22px]
              "
            />
          </div>
        </div>

        {/* ================================================
            RESPONSIVE CONTENT VIEWPORT

            Mobile: content occupies the upper area.
            Tablet: content moves to the right side while
            the animated vehicle moves to the left.
        ================================================ */}

        <div
          aria-live="polite"
          className="
            absolute
            left-5
            right-5
            top-[8%]
            z-40
            h-[260px]
            overflow-hidden
            sm:left-[58%]
            sm:right-auto
            sm:top-1/2
            sm:h-[380px]
            sm:w-[38%]
            sm:min-w-[245px]
            sm:max-w-[360px]
            sm:-translate-y-1/2
          "
        >
          {/* =============================================
              RESPONSIVE FRAME 02
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
            <div className="overflow-hidden pb-2">
              <div
                data-responsive-frame-two-reveal
                className="
                  transform-gpu
                  will-change-transform
                  font-sans
                  text-[clamp(50px,15.5vw,64px)]
                  font-normal
                  leading-[0.8]
                  tracking-[-0.07em]
                  text-[#111111]
                  sm:text-[clamp(76px,10vw,102px)]
                "
              >
                250+
              </div>
            </div>

            <div className="mt-4 overflow-hidden pb-1 sm:mt-6">
              <h3
                data-responsive-frame-two-reveal
                className="
                  transform-gpu
                  will-change-transform
                  text-balance
                  font-sans
                  text-[clamp(24px,7.5vw,31px)]
                  font-medium
                  leading-[1.02]
                  tracking-[-0.046em]
                  text-[#111111]
                  sm:text-[clamp(34px,4.6vw,43px)]
                "
              >
                Roadshow Vehicles
              </h3>
            </div>

            <div className="mt-3 overflow-hidden pb-3 sm:mt-5">
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
              RESPONSIVE FRAME 03
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
            <div className="overflow-hidden pb-2">
              <div
                data-responsive-frame-three-reveal
                className="
                  transform-gpu
                  will-change-transform
                  font-sans
                  text-[clamp(50px,15.5vw,64px)]
                  font-normal
                  leading-[0.8]
                  tracking-[-0.07em]
                  text-[#111111]
                  sm:text-[clamp(76px,10vw,102px)]
                "
              >
                20L+
              </div>
            </div>

            <div className="mt-4 overflow-hidden pb-1 sm:mt-6">
              <h3
                data-responsive-frame-three-reveal
                className="
                  transform-gpu
                  will-change-transform
                  text-balance
                  font-sans
                  text-[clamp(24px,7.5vw,31px)]
                  font-medium
                  leading-[1.02]
                  tracking-[-0.046em]
                  text-[#111111]
                  sm:text-[clamp(34px,4.6vw,43px)]
                "
              >
                Daily Impressions
              </h3>
            </div>

            <div className="mt-3 overflow-hidden pb-3 sm:mt-5">
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
    </section>
  );
}