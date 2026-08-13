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

const HERO_VEHICLE_IMAGE = "/images/assets/full_side_LED_edited-1_new.png";

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

  const mobileVehicleRef =
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

    const mobileVehicle =
      mobileVehicleRef.current;

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
      !frameThree
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
       TABLET + MOBILE
    ===================================================== */

    mm.add(
      "(max-width: 1023px)",
      () => {
        if (!mobileVehicle) {
          return;
        }

        const ctx =
          gsap.context(() => {
            const mobileItems =
              gsap.utils.toArray<HTMLElement>(
                "[data-mobile-reveal]",
                section,
              );

            if (reduceMotion) {
              gsap.set(
                [
                  mobileVehicle,
                  ...mobileItems,
                ],
                {
                  autoAlpha: 1,
                  x: 0,
                  y: 0,
                  scale: 1,
                },
              );

              return;
            }

            gsap.set(
              mobileItems,
              {
                autoAlpha: 0,
                y: 30,
                force3D: true,
              },
            );

            gsap.set(
              mobileVehicle,
              {
                autoAlpha: 0,
                y: 24,
                scale: 0.96,
                force3D: true,
              },
            );

            const mobileTimeline =
              gsap.timeline({
                scrollTrigger: {
                  trigger:
                    section,

                  start:
                    "top 80%",

                  once:
                    true,
                },
              });

            mobileTimeline.to(
              mobileItems,
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.62,
                stagger: 0.07,
                ease: "power3.out",
              },
            );

            mobileTimeline.to(
              mobileVehicle,
              {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 0.82,
                ease: "power3.out",
              },
              "-=0.42",
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
              Powerful roadshow{" "}

              <span
                className="
                  font-serif
                  italic
                  font-normal
                  text-[#969088]
                "
              >
                advertising
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
              to{" "}

              <span
                className="
                  font-serif
                  italic
                  font-normal
                "
              >
                amplify
              </span>{" "}

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
          TABLET + MOBILE
      ===================================================== */}

      <div
        className="
          relative
          overflow-hidden
          bg-[#f8f8f6]
          px-5
          py-16
          sm:px-8
          sm:py-20
          md:px-10
          lg:hidden
        "
      >
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            bg-[radial-gradient(circle_at_50%_32%,rgba(255,255,255,1)_0%,rgba(255,255,255,0.76)_38%,rgba(248,248,246,0)_76%)]
          "
        />

        {/* Centered mobile roadshow word */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            bottom-[-3vw]
            left-1/2
            w-max
            -translate-x-1/2
            select-none
            whitespace-nowrap
            text-center
            font-serif
            text-[22vw]
            italic
            leading-none
            text-black/[0.025]
          "
        >
          roadshow
        </div>

        <div
          className="
            relative
            z-10
            mx-auto
            grid
            max-w-[960px]
            grid-cols-1
            gap-12
            md:grid-cols-2
            md:items-center
          "
        >
          {/* Content first */}
          <div
            data-mobile-reveal
            className="
              order-1
              md:order-2
            "
          >
            <div
              className="
                font-sans
                text-[clamp(68px,17vw,94px)]
                font-normal
                leading-[0.8]
                tracking-[-0.07em]
                text-[#111111]
              "
            >
              250+
            </div>

            <h2
              className="
                mt-6
                font-sans
                text-[clamp(34px,8vw,43px)]
                font-medium
                leading-none
                tracking-[-0.045em]
                text-[#111111]
              "
            >
              Roadshow Vehicles
            </h2>

            {/* <p
              className="
                mt-4
                max-w-[390px]
                font-sans
                text-[16px]
                leading-7
                text-black/48
              "
            >
              Modern fleet for every marketing need.
            </p> */}

            <BleedCta
              href={ctaHref}
              label="Explore Vehicles"
            />
          </div>

          {/* Vehicle */}
          <div
            className="
              order-2
              md:order-1
            "
          >
            <div
              ref={mobileVehicleRef}
              className="
                relative
                mx-auto
                w-full
                max-w-[650px]
                transform-gpu
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
                  (max-width: 767px) 92vw,
                  50vw
                "
                className="
                  relative
                  z-10
                  block
                  h-auto
                  w-full
                  select-none
                  object-contain
                  drop-shadow-[0_24px_24px_rgba(0,0,0,0.14)]
                "
              />

              <div
                aria-hidden="true"
                className="
                  absolute
                  bottom-[2%]
                  left-[14%]
                  right-[8%]
                  h-[8%]
                  rounded-[50%]
                  bg-black/[0.14]
                  blur-[24px]
                "
              />
            </div>
          </div>

          {/* Second metric */}
          <div
            data-mobile-reveal
            className="
              order-3
              border-t
              border-black/[0.08]
              pt-10
              md:col-span-2
            "
          >
            <div
              className="
                font-sans
                text-[58px]
                font-normal
                leading-[0.8]
                tracking-[-0.065em]
                text-[#111111]
              "
            >
              20L+
            </div>

            <h3
              className="
                mt-5
                font-sans
                text-[28px]
                font-medium
                tracking-[-0.04em]
                text-[#111111]
              "
            >
              Daily Impressions
            </h3>

            <p
              className="
                mt-3
                max-w-[320px]
                font-sans
                text-[15px]
                leading-6
                text-black/45
              "
            >
              Real people. Real reach. Every single day.
            </p>

            <BleedCta
              href={ctaHref}
              label="Plan Your Roadshow"
            />
          </div>
        </div>
      </div>
    </section>
  );
}