/* eslint-disable */
// @ts-nocheck
"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

import gsap from "gsap";

/* =========================================================
   TYPES
========================================================= */

type ProcessStep = {
  id: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
};

/* =========================================================
   CONSTANTS
========================================================= */

const PROCESS_IMAGE_VERSION = "20260820-01";
const DEFAULT_ACTIVE_INDEX = 0;
const DESKTOP_MEDIA_QUERY = "(min-width: 1024px)";

/* =========================================================
   PROCESS DATA
========================================================= */

const PROCESS_STEPS: ProcessStep[] = [
  {
    id: "requirement",
    title: "Share Campaign Requirement",
    description: "Tell us your brand goal, target city and timeline.",
    image: "/images/process/requirement.jpg",
    imageAlt: "Roadshow campaign requirement discussion",
  },
  {
    id: "vehicle",
    title: "Choose Vehicle & Coverage",
    description: "Select the right format and city routes.",
    image: "/images/process/vehicle.jpg",
    imageAlt: "Roadshow vehicle and coverage selection",
  },
  {
    id: "planning",
    title: "Plan Route, Branding, Schedule",
    description: "We design routes, creatives and timing.",
    image: "/images/process/planning.jpg",
    imageAlt: "Roadshow route branding and schedule planning",
  },
  {
    id: "launch",
    title: "Launch Roadshow Campaign",
    description: "On-ground team executes with precision.",
    image: "/images/process/launch.jpg",
    imageAlt: "Roadshow campaign execution",
  },
  {
    id: "tracking",
    title: "Track Campaign Execution",
    description: "Live GPS, location updates and reporting.",
    image: "/images/process/tracking.jpg",
    imageAlt: "Roadshow live GPS campaign tracking",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function getProcessImage(image: string) {
  return `${image}?v=${PROCESS_IMAGE_VERSION}`;
}

function getStepNumber(index: number) {
  return String(index + 1).padStart(2, "0");
}

function isDesktopViewport() {
  if (typeof window === "undefined") return false;
  return window.matchMedia(DESKTOP_MEDIA_QUERY).matches;
}

/* =========================================================
   CHEVRON
========================================================= */

function Chevron() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-[18px] w-[18px]"
      aria-hidden="true"
    >
      <path
        d="M6.5 14.5L12 9L17.5 14.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function RoadshowProcessSection() {
  const [activeIndex, setActiveIndex] =
    useState<number>(DEFAULT_ACTIVE_INDEX);

  const sectionRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const processListRef = useRef<HTMLDivElement | null>(null);
  const mobileVisualRef = useRef<HTMLDivElement | null>(null);
  const desktopVisualRef = useRef<HTMLDivElement | null>(null);

  const previewRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mobileImageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const desktopImageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const chevronRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* =======================================================
     SECTION ENTER ANIMATION

     Works on mobile, tablet and desktop when the section
     enters the viewport. No ScrollTrigger dependency needed.
  ======================================================= */

  useLayoutEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const revealTargets = [
      headingRef.current,
      mobileVisualRef.current,
      processListRef.current,
      desktopVisualRef.current,
    ].filter((element): element is HTMLElement => Boolean(element));

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      gsap.set(revealTargets, {
        autoAlpha: 1,
        y: 0,
        clearProps: "transform",
      });

      return;
    }

    gsap.set(revealTargets, {
      autoAlpha: 0,
      y: 24,
    });

    let revealTween: gsap.core.Tween | null = null;
    let observer: IntersectionObserver | null = null;
    let hasRevealed = false;

    const revealSection = () => {
      if (hasRevealed) return;

      hasRevealed = true;

      revealTween = gsap.to(revealTargets, {
        autoAlpha: 1,
        y: 0,
        duration: 0.72,
        stagger: 0.11,
        ease: "power3.out",
        overwrite: "auto",
      });

      observer?.disconnect();
    };

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            revealSection();
          }
        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -8% 0px",
        }
      );

      observer.observe(section);
    } else {
      revealSection();
    }

    return () => {
      observer?.disconnect();
      revealTween?.kill();

      gsap.set(revealTargets, {
        clearProps: "opacity,visibility,transform",
      });
    };
  }, []);

  /* =======================================================
     ACTIVE STEP ANIMATIONS

     - Mobile/tablet large image changes on click.
     - Desktop preview and large image retain GSAP motion.
     - Chevron motion works on every breakpoint.
  ======================================================= */

  useLayoutEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      const mainDuration = reduceMotion ? 0 : 0.58;
      const hideDuration = reduceMotion ? 0 : 0.34;

      /* =========================================
         MOBILE / TABLET LARGE IMAGE
      ========================================= */

      mobileImageRefs.current.forEach((image, index) => {
        if (!image) return;

        gsap.killTweensOf(image);

        if (index === activeIndex) {
          gsap.to(image, {
            autoAlpha: 1,
            scale: 1,
            x: 0,
            duration: mainDuration,
            ease: "power3.out",
            overwrite: "auto",
          });
        } else {
          gsap.to(image, {
            autoAlpha: 0,
            scale: 1.025,
            x: 12,
            duration: hideDuration,
            ease: "power2.out",
            overwrite: "auto",
          });
        }
      });

      /* =========================================
         DESKTOP SMALL PREVIEW IMAGE
      ========================================= */

      previewRefs.current.forEach((preview, index) => {
        if (!preview) return;

        gsap.killTweensOf(preview);

        if (index === activeIndex) {
          gsap.to(preview, {
            autoAlpha: 1,
            x: 0,
            yPercent: -50,
            scale: 1,
            rotation: 4,
            duration: mainDuration,
            ease: "power3.out",
            overwrite: "auto",
          });
        } else {
          gsap.to(preview, {
            autoAlpha: 0,
            x: 14,
            yPercent: -50,
            scale: 0.96,
            rotation: 0,
            duration: hideDuration,
            ease: "power2.out",
            overwrite: "auto",
          });
        }
      });

      /* =========================================
         DESKTOP LARGE RIGHT IMAGE
      ========================================= */

      desktopImageRefs.current.forEach((image, index) => {
        if (!image) return;

        gsap.killTweensOf(image);

        if (index === activeIndex) {
          gsap.to(image, {
            autoAlpha: 1,
            scale: 1,
            x: 0,
            rotation: 0,
            duration: mainDuration,
            ease: "power3.out",
            overwrite: "auto",
          });
        } else {
          gsap.to(image, {
            autoAlpha: 0,
            scale: 1.025,
            x: 5,
            rotation: 0.4,
            duration: hideDuration,
            ease: "power2.out",
            overwrite: "auto",
          });
        }
      });

      /* =========================================
         CHEVRON
      ========================================= */

      chevronRefs.current.forEach((chevron, index) => {
        if (!chevron) return;

        gsap.killTweensOf(chevron);

        gsap.to(chevron, {
          rotation: index === activeIndex ? 180 : 0,
          y: index === activeIndex ? -1 : 0,
          duration: reduceMotion ? 0 : 0.42,
          ease: "power3.out",
          overwrite: "auto",
        });
      });
    }, section);

    return () => {
      ctx.revert();
    };
  }, [activeIndex]);

  /* =======================================================
     DESKTOP HOVER ONLY

     Mobile and tablet never change through hover, even when
     a mouse or pen is connected. They remain click-only.
  ======================================================= */

  const handlePointerEnter = (
    event: PointerEvent<HTMLButtonElement>,
    index: number
  ) => {
    if (!isDesktopViewport()) return;

    if (
      event.pointerType === "mouse" ||
      event.pointerType === "pen"
    ) {
      setActiveIndex(index);
    }
  };

  const handleMouseLeave = () => {
    if (isDesktopViewport()) {
      setActiveIndex(DEFAULT_ACTIVE_INDEX);
    }
  };

  /* =======================================================
     KEYBOARD ACCESSIBILITY
  ======================================================= */

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();

      setActiveIndex(
        index === PROCESS_STEPS.length - 1 ? 0 : index + 1
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      setActiveIndex(
        index === 0 ? PROCESS_STEPS.length - 1 : index - 1
      );
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setActiveIndex(index);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="roadshow-process"
      className="
        w-full
        overflow-hidden
        bg-white

        px-5
        py-12

        min-[375px]:px-6

        sm:px-7
        sm:py-14

        md:px-10
        md:py-16

        lg:px-14
        lg:py-24

        xl:px-20
        xl:py-28
      "
    >
      <div
        className="
          mx-auto
          grid
          w-full
          max-w-[1400px]
          grid-cols-1

          lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]
          lg:items-center
          lg:gap-16

          xl:grid-cols-[minmax(0,1.3fr)_minmax(360px,0.7fr)]
          xl:gap-24
        "
        onMouseLeave={handleMouseLeave}
      >
        {/* =================================================
            LEFT CONTENT
        ================================================= */}

        <div className="min-w-0">
          {/* ===============================================
              RESPONSIVE HEADING

              320px: 38px
              375px+: 42px
              430px+: 44px
              Tablet: 50px / 52px
              Desktop: existing 58px / 64px
          =============================================== */}

          <h2
            ref={headingRef}
            className="
              mb-6
              font-normal
              text-[38px]
              leading-[0.98]
              tracking-[-0.045em]
              text-[#111111]

              min-[375px]:text-[42px]
              min-[430px]:text-[44px]

              sm:mb-7
              sm:text-[50px]

              md:mb-8
              md:text-[52px]

              lg:mb-16
              lg:text-[58px]

              xl:text-[64px]
            "
          >
            {/* Mobile and tablet: intentional three-line title */}
            <span className="block lg:hidden">How the roadshow </span>
            
            <span className="block text-[#b5121b] lg:hidden">
              roadshow Works
            </span>

            {/* Desktop: preserve the existing title layout */}
            <span className="hidden lg:block">
              How the roadshow
            </span>
            <span className="hidden text-[#b5121b] lg:block">
              Works
            </span>
          </h2>

          {/* ===============================================
              MOBILE / TABLET ACTIVE IMAGE

              Placed next to the related interaction instead
              of below the complete five-step list.
          =============================================== */}

          <div
            ref={mobileVisualRef}
            className="mb-3 w-full lg:hidden sm:mb-4 md:mb-5"
            aria-live="polite"
          >
            <div
              className="
                relative
                aspect-[16/10]
                w-full
                overflow-hidden
                rounded-[20px]
                bg-[#eeeeec]

                sm:rounded-[22px]
                md:aspect-[16/9]
                md:rounded-[24px]
              "
            >
              {PROCESS_STEPS.map((step, index) => {
                const active = index === activeIndex;
                const imageSrc = getProcessImage(step.image);

                return (
                  <div
                    key={`${step.id}-${PROCESS_IMAGE_VERSION}-mobile`}
                    ref={(element) => {
                      mobileImageRefs.current[index] = element;
                    }}
                    aria-hidden={!active}
                    className="absolute inset-0 opacity-0 will-change-[transform,opacity]"
                  >
                    <img
                      src={imageSrc}
                      alt={active ? step.imageAlt : ""}
                      loading={
                        index === DEFAULT_ACTIVE_INDEX ? "eager" : "lazy"
                      }
                      fetchPriority={
                        index === DEFAULT_ACTIVE_INDEX ? "high" : "auto"
                      }
                      decoding="async"
                      draggable={false}
                      className="block h-full w-full object-cover object-center"
                    />
                  </div>
                );
              })}

              {/* Current step indicator from the approved UI */}
              <div
                className="
                  absolute
                  bottom-3
                  left-3
                  z-10
                  flex
                  items-baseline
                  gap-1
                  rounded-full
                  border
                  border-white/25
                  bg-black/70
                  px-3
                  py-1.5
                  text-white
                  shadow-[0_8px_24px_rgba(0,0,0,0.16)]
                  backdrop-blur-sm

                  sm:bottom-4
                  sm:left-4
                  sm:px-4
                  sm:py-2
                "
                aria-hidden="true"
              >
                <span className="text-[15px] font-medium leading-none sm:text-[17px]">
                  {getStepNumber(activeIndex)}
                </span>
                <span className="text-[13px] leading-none text-white/65 sm:text-[15px]">
                  / {getStepNumber(PROCESS_STEPS.length - 1)}
                </span>
              </div>
            </div>
          </div>

          {/* ===============================================
              PROCESS LIST
          =============================================== */}

          <div
            ref={processListRef}
            className="border-[#ddddda] lg:border-t"
          >
            {PROCESS_STEPS.map((step, index) => {
              const active = activeIndex === index;
              const imageSrc = getProcessImage(step.image);

              return (
                <button
                  key={step.id}
                  type="button"
                  aria-pressed={active}
                  onPointerEnter={(event) =>
                    handlePointerEnter(event, index)
                  }
                  onFocus={() => setActiveIndex(index)}
                  onClick={() => setActiveIndex(index)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  className="
                    group
                    relative
                    block
                    w-full
                    cursor-pointer
                    border-b
                    border-[#ddddda]
                    py-5
                    text-left
                    outline-none

                    sm:py-6
                    md:py-6

                    lg:min-h-[112px]
                    lg:py-7

                    focus-visible:outline
                    focus-visible:outline-1
                    focus-visible:outline-offset-4
                    focus-visible:outline-[#222222]
                  "
                >
                  <div
                    className="
                      relative
                      grid
                      grid-cols-[42px_minmax(0,1fr)_24px]
                      items-start
                      gap-x-3

                      min-[375px]:grid-cols-[46px_minmax(0,1fr)_26px]
                      min-[375px]:gap-x-4

                      sm:grid-cols-[52px_minmax(0,1fr)_28px]
                      sm:gap-x-5

                      lg:flex
                      lg:min-h-[54px]
                      lg:items-center
                      lg:pr-[175px]

                      xl:pr-[205px]
                    "
                  >
                    {/* Mobile / tablet step number */}
                    <span
                      aria-hidden="true"
                      className={`
                        pt-0.5
                        text-[24px]
                        font-normal
                        leading-none
                        tracking-[-0.035em]
                        transition-colors
                        duration-300

                        min-[375px]:text-[26px]
                        sm:text-[28px]
                        md:text-[30px]

                        lg:hidden

                        ${active ? "text-[#b5121b]" : "text-[#1b1b1b]"}
                      `}
                    >
                      {getStepNumber(index)}
                    </span>

                    {/* Text */}
                    <div className="min-w-0 lg:flex-1">
                      <h3
                        className="
                          max-w-[480px]
                          text-[17px]
                          font-medium
                          leading-[1.22]
                          tracking-[-0.025em]
                          text-[#1b1b1b]

                          min-[375px]:text-[18px]
                          sm:text-[20px]
                          md:text-[21px]

                          lg:text-[24px]
                          lg:leading-[1.18]
                        "
                      >
                        {step.title}
                      </h3>

                      <p
                        className={`
                          mt-1.5
                          max-w-[470px]
                          text-[13px]
                          leading-[1.55]
                          transition-colors
                          duration-300

                          min-[375px]:text-[13.5px]
                          sm:mt-2
                          sm:text-[14px]
                          md:text-[15px]

                          lg:max-w-[450px]
                          lg:text-[14px]

                          ${active ? "text-[#555555]" : "text-[#888888]"}
                        `}
                      >
                        {step.description}
                      </p>
                    </div>

                    {/* Desktop active preview - unchanged behavior */}
                    <div
                      ref={(element) => {
                        previewRefs.current[index] = element;
                      }}
                      aria-hidden="true"
                      className="
                        pointer-events-none
                        absolute
                        right-9
                        top-1/2
                        hidden
                        aspect-[3/4]
                        h-[76px]
                        origin-center
                        overflow-hidden
                        rounded-[10px]
                        bg-[#eeeeec]
                        opacity-0
                        will-change-[transform,opacity]

                        lg:block
                        xl:h-[80px]
                      "
                    >
                      <img
                        key={`${step.id}-${PROCESS_IMAGE_VERSION}-preview`}
                        src={imageSrc}
                        alt=""
                        loading={index === 0 ? "eager" : "lazy"}
                        decoding="async"
                        draggable={false}
                        className="block h-full w-full object-contain object-center"
                      />
                    </div>

                    {/* Chevron */}
                    <div
                      className="
                        col-start-3
                        row-start-1
                        flex
                        h-7
                        w-6
                        items-center
                        justify-end
                        self-start
                        text-[#454545]

                        lg:absolute
                        lg:right-0
                        lg:top-1/2
                        lg:h-6
                        lg:w-6
                        lg:-translate-y-1/2
                        lg:items-center
                        lg:justify-center
                        lg:self-auto
                      "
                    >
                      <div
                        ref={(element) => {
                          chevronRefs.current[index] = element;
                        }}
                        className="flex items-center justify-center will-change-transform"
                      >
                        <Chevron />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* =================================================
            DESKTOP LARGE RIGHT IMAGE

            Hidden below 1024px. Mobile/tablet use the large
            visual placed between the heading and step list.
        ================================================= */}

        <div
          ref={desktopVisualRef}
          className="hidden w-full items-center justify-end lg:flex"
          aria-live="polite"
        >
          <div
            className="
              relative
              aspect-[3/4]
              w-full
              max-w-[340px]
              rotate-[4deg]
              overflow-hidden
              rounded-[20px]
              bg-[#eeeeec]

              xl:max-w-[365px]
            "
          >
            {PROCESS_STEPS.map((step, index) => {
              const active = index === activeIndex;
              const imageSrc = getProcessImage(step.image);

              return (
                <div
                  key={`${step.id}-${PROCESS_IMAGE_VERSION}-desktop`}
                  ref={(element) => {
                    desktopImageRefs.current[index] = element;
                  }}
                  aria-hidden={!active}
                  className="absolute inset-0 opacity-0 will-change-[transform,opacity]"
                >
                  <img
                    src={imageSrc}
                    alt={active ? step.imageAlt : ""}
                    loading={
                      index === DEFAULT_ACTIVE_INDEX ? "eager" : "lazy"
                    }
                    fetchPriority={
                      index === DEFAULT_ACTIVE_INDEX ? "high" : "auto"
                    }
                    decoding="async"
                    draggable={false}
                    className="block h-full w-full object-contain object-center"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}