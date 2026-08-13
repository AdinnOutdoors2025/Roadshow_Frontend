"use client";

import Image from "next/image";
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
   PROCESS DATA

   IMPORTANT:
   Your images are inside:

   public/images/process/

   Therefore Next.js paths MUST start with:

   /images/process/
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

const DEFAULT_ACTIVE_INDEX = 0;

/* =========================================================
   CHEVRON
========================================================= */

function Chevron() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-[17px] w-[17px]"
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

  const previewRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const chevronRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* =======================================================
     GSAP

     Only transform + opacity are animated.

     No width.
     No height.
     No padding.
     No grid size.

     This prevents shaking/layout jumping.
  ======================================================= */

  useLayoutEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      const mainDuration = reduceMotion ? 0 : 0.58;
      const hideDuration = reduceMotion ? 0 : 0.36;

      /* =========================================
         SMALL ROW PREVIEW
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
         LARGE RIGHT IMAGE
      ========================================= */

      imageRefs.current.forEach((image, index) => {
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
     DESKTOP HOVER
  ======================================================= */

  const handlePointerEnter = (
    event: PointerEvent<HTMLButtonElement>,
    index: number
  ) => {
    if (
      event.pointerType === "mouse" ||
      event.pointerType === "pen"
    ) {
      setActiveIndex(index);
    }
  };

  /* =======================================================
     KEYBOARD
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
      className="
        w-full
        overflow-hidden
        bg-white

        px-5
        py-14

        sm:px-7
        sm:py-16

        md:px-10
        md:py-20

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
          gap-12

          lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]
          lg:items-center
          lg:gap-16

          xl:grid-cols-[minmax(0,1.3fr)_minmax(360px,0.7fr)]
          xl:gap-24
        "
        onMouseLeave={() =>
          setActiveIndex(DEFAULT_ACTIVE_INDEX)
        }
      >
        {/* ===================================================
            LEFT
        =================================================== */}

        <div className="min-w-0">
          {/* ===============================================
              HEADING
          =============================================== */}

          <h2
            className="
              mb-10
              font-medium
              leading-[0.98]
              tracking-[-0.045em]

              sm:mb-12

              md:mb-14

              lg:mb-16
            "
          >
           <span
  className="
    block
    text-[38px]
    font-normal
    text-[#111111]
    sm:text-[46px]
    md:text-[52px]
    lg:text-[58px]
    xl:text-[64px]
  "
>
  How the roadshow
</span>

            <span
  className="
    block
    text-[38px]
    font-normal
    text-[#b5121b]
    sm:text-[46px]
    md:text-[52px]
    lg:text-[58px]
    xl:text-[64px]
  "
>
Works</span>
          </h2>

          {/* ===============================================
              PROCESS ITEMS
          =============================================== */}

          <div className="border-t border-[#ddddda]">
            {PROCESS_STEPS.map((step, index) => {
              const active = activeIndex === index;

              return (
                <button
                  key={step.id}
                  type="button"
                  aria-current={active ? "step" : undefined}
                  onPointerEnter={(event) =>
                    handlePointerEnter(event, index)
                  }
                  onFocus={() => setActiveIndex(index)}
                  onClick={() => setActiveIndex(index)}
                  onKeyDown={(event) =>
                    handleKeyDown(event, index)
                  }
                  className="
                    group
                    relative
                    block
                    w-full
                    border-b
                    border-[#ddddda]

                    py-5
                    text-left
                    outline-none

                    sm:min-h-[98px]
                    sm:py-6

                    md:min-h-[108px]
                    md:py-7

                    lg:min-h-[112px]

                    focus-visible:outline
                    focus-visible:outline-1
                    focus-visible:outline-offset-4
                    focus-visible:outline-[#222222]
                  "
                >
                  <div
                    className="
                      relative
                      flex
                      min-h-[54px]
                      items-center

                      pr-8

                      sm:pr-[155px]

                      md:pr-[175px]

                      xl:pr-[205px]
                    "
                  >
                    {/* =====================================
                        TEXT
                    ===================================== */}

                    <div className="min-w-0 flex-1">
                      <h3
                        className="
                          max-w-[480px]

                          text-[19px]
                          font-medium
                          leading-[1.18]
                          tracking-[-0.025em]
                          text-[#1b1b1b]

                          sm:text-[21px]

                          md:text-[23px]

                          lg:text-[24px]
                        "
                      >
                        {step.title}
                      </h3>

                      <p
                        className={`
                          mt-2
                          max-w-[450px]

                          text-[13px]
                          leading-[1.55]

                          transition-colors
                          duration-300

                          sm:text-[14px]

                          ${
                            active
                              ? "text-[#555555]"
                              : "text-[#888888]"
                          }
                        `}
                      >
                        {step.description}
                      </p>
                    </div>

                    {/* =====================================
                        SMALL HOVER PREVIEW IMAGE

                        Absolute = does not affect layout.
                    ===================================== */}

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
                        h-[62px]
                        w-[98px]

                        origin-center
                        overflow-hidden
                        rounded-[10px]

                        opacity-0

                        sm:block
                        sm:h-[66px]
                        sm:w-[106px]

                        md:right-10
                        md:h-[72px]
                        md:w-[118px]

                        xl:h-[78px]
                        xl:w-[128px]

                        will-change-[transform,opacity]
                      "
                    >
                      <Image
                        src={step.image}
                        alt=""
                        fill
                        sizes="128px"
                        className="object-cover"
                      />
                    </div>

                    {/* =====================================
                        CHEVRON
                    ===================================== */}

                    <div
                      className="
                        absolute
                        right-0
                        top-1/2

                        flex
                        h-6
                        w-6
                        -translate-y-1/2
                        items-center
                        justify-center

                        text-[#454545]
                      "
                    >
                      <div
                        ref={(element) => {
                          chevronRefs.current[index] = element;
                        }}
                        className="
                          flex
                          items-center
                          justify-center
                          will-change-transform
                        "
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

        {/* ===================================================
            RIGHT IMAGE
        =================================================== */}

        <div
          className="
            flex
            w-full
            items-center
            justify-center

            pt-2

            sm:pt-4

            lg:justify-end
            lg:pt-0
          "
        >
          <div
            className="
              relative

              aspect-[4/5]

              w-[76%]
              max-w-[320px]

              rotate-[4deg]

              overflow-hidden
              rounded-[20px]

              bg-[#eeeeec]

              sm:w-[58%]
              sm:max-w-[350px]

              md:w-[50%]
              md:max-w-[370px]

              lg:w-full
              lg:max-w-[360px]

              xl:max-w-[395px]
            "
          >
            {PROCESS_STEPS.map((step, index) => {
              const active = index === activeIndex;

              return (
                <div
                  key={step.id}
                  ref={(element) => {
                    imageRefs.current[index] = element;
                  }}
                  aria-hidden={!active}
                  className="
                    absolute
                    inset-0

                    opacity-0

                    will-change-[transform,opacity]
                  "
                >
                  <Image
                    src={step.image}
                    alt={active ? step.imageAlt : ""}
                    fill
                    priority={index === DEFAULT_ACTIVE_INDEX}
                    sizes="
                      (max-width: 640px) 76vw,
                      (max-width: 768px) 58vw,
                      (max-width: 1024px) 50vw,
                      395px
                    "
                    className="object-cover"
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