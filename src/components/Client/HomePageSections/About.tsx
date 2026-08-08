"use client";

import { useEffect, useRef } from "react";
import {
  Award,
  MapPin,
  Megaphone,
  Paintbrush,
  Route as RouteIcon,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
const aboutBg = "/images/assets/Rdsw_Web_images/abou-img.webp";

const features = [
  {
    title: "End-to-end campaign coordination",
    desc: "From planning to execution, we handle everything with precision.",
    icon: UsersRound,
  },
  {
    title: "RTO certified roadshow vehicles",
    desc: "Fully compliant, safe & road-ready vehicles for seamless campaigns.",
    icon: ShieldCheck,
  },
  {
    title: "Live GPS execution monitoring",
    desc: "Real-time tracking and live updates for complete transparency.",
    icon: MapPin,
  },
  {
    title: "Custom branding & route planning",
    desc: "Eye-catching branding and optimized routes for maximum visibility.",
    icon: Paintbrush,
  },
];

const stats = [
  {
    value: "10000+",
    label: "Successful Campaigns delivered across South India.",
    icon: Megaphone,
  },
  {
    value: "25+",
    label: "Years of expertise in planning and executing impactful roadshows.",
    icon: Award,
  },
  {
    value: "6",
    label: "States of active route coverage.",
    icon: RouteIcon,
  },
];

export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const vehicleImgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const image = vehicleImgRef.current;

    if (!section || !image) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) return;

    let frameId = 0;

    const updateVehicle = () => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const rawProgress =
        (viewportHeight - rect.top) / (viewportHeight + rect.height);

      const focus = Math.max(0, Math.min(1, rawProgress * 1.6));
      const isMobile = window.innerWidth < 1024;

      if (isMobile) {
        /*
          Mobile background animation:
          Same desktop feel - vehicle starts lower and smaller,
          then zooms forward and moves upward while scrolling.
        */
        const scale = 0.58 + focus * 1.12;
        const translateY = 190 - focus * 300;

        image.style.transform = `
          translate3d(0, ${translateY}px, 0)
          scale(${scale})
        `;
        image.style.opacity = "1";
        return;
      }

      const scale = 0.62 + focus * 1.05;
      const translateY = 150 - focus * 240;

      image.style.transform = `
        translate3d(0, ${translateY}px, 0)
        scale(${scale})
      `;
      image.style.opacity = "1";
    };

    const handleScroll = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(updateVehicle);
    };

    updateVehicle();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      style={{
        backgroundImage: `url(${aboutBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      className="
        relative
        isolate
        overflow-hidden
        pt-14
        pb-12
        sm:pt-16
        sm:pb-14
        md:pt-20
        md:pb-16
        lg:py-0
        RdswNew_AboutSection
      "
    >
      {/* DARK BALANCE */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-[1]
          bg-[linear-gradient(90deg,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.72)_22%,rgba(0,0,0,0.42)_45%,rgba(0,0,0,0.42)_55%,rgba(0,0,0,0.72)_78%,rgba(0,0,0,0.88)_100%)]
        "
      />

      {/* MOBILE READABILITY */}
      <div className="pointer-events-none absolute inset-0 z-[2] bg-black/48 lg:hidden" />

      {/* TOP MERGE */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-[420px] bg-[linear-gradient(180deg,#000000_0%,rgba(0,0,0,0.96)_20%,rgba(0,0,0,0.78)_45%,rgba(0,0,0,0.36)_75%,rgba(0,0,0,0)_100%)] RdswNew_AboutTopMerge" />

      {/* CENTER SOFT BLEND */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[4] h-[560px] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.58)_0%,rgba(0,0,0,0.38)_34%,rgba(0,0,0,0.16)_64%,rgba(0,0,0,0)_86%)] RdswNew_AboutSoftBlend" />

      {/* VEHICLE CENTER BACKGROUND ON MOBILE / CENTER COLUMN ON DESKTOP */}
      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[54%]
          z-10
          flex
          h-[520px]
          w-[520px]
          -translate-x-1/2
          -translate-y-1/2
          items-center
          justify-center
          overflow-visible
          perspective-[1400px]
          sm:h-[620px]
          sm:w-[620px]
          md:h-[700px]
          md:w-[700px]
          lg:hidden
        "
      >
        <img
          ref={vehicleImgRef}
          src="/images/assets/Rdsw_Web_images/straight_view.png"
          alt=""
          aria-hidden="true"
          className="
            relative
            z-10
            h-auto
            w-[125%]
            max-w-[620px]
            origin-center
            object-contain
            opacity-100
            select-none
            will-change-transform
            sm:max-w-[720px]
            md:max-w-[820px]
          "
          style={{
            transform: "translate3d(0, 190px, 0) scale(0.58)",
            opacity: 1,
          }}
          draggable={false}
        />
      </div>

      <div
        className="
          relative
          z-20
          mx-auto
          w-full
          max-w-[1680px]
          px-4
          sm:px-6
          md:px-8
          lg:px-12
          xl:px-22
          2xl:px-16
        "
      >
        <div
          className="
            relative
            grid
            gap-7
            lg:min-h-[760px]
            lg:grid-cols-[31%_39%_30%]
            lg:items-center
            lg:gap-6
            xl:gap-8
          "
        >
          {/* DESKTOP VEHICLE */}
          <div
            className="
              pointer-events-none
              relative
              hidden
              h-[680px]
              items-center
              justify-center
              overflow-visible
              perspective-[1400px]
              lg:col-start-2
              lg:row-start-1
              lg:flex
            "
          >
            <img
              src="/images/assets/Rdsw_Web_images/straight_view.png"
              alt=""
              aria-hidden="true"
              className="
                relative
                z-10
                h-auto
                w-[220%]
                max-w-[1600px]
                origin-center
                object-contain
                opacity-100
                select-none
                will-change-transform
              "
              style={{
                transform: "translate3d(0, 150px, 0) scale(0.62)",
                opacity: 1,
              }}
              ref={(node) => {
                if (window.innerWidth >= 1024) {
                  vehicleImgRef.current = node;
                }
              }}
              draggable={false}
            />
          </div>

          {/* LEFT CONTENT */}
          <div className="relative z-20 lg:col-start-1 lg:row-start-1">
            <h2
              className="
                max-w-[320px]
                font-display
                text-[30px]
                font-semibold
                leading-[1.05]
                tracking-[-0.055em]
                text-white
                sm:max-w-[420px]
                sm:text-[42px]
                md:text-[48px]
                lg:mt-6
                lg:max-w-[520px]
                lg:text-[56px]
              "
            >
              Turn Every Road Into Your Stage
            </h2>

            <p
              className="
                mt-5
                max-w-[330px]
                text-[13px]
                leading-6
                text-white/72
                sm:max-w-[420px]
                sm:text-[15px]
                md:text-[17px]
                md:leading-7
                lg:max-w-[390px]
              "
            >
              We bring your brand to life on the move. Strategic, striking and
              everywhere your audience is.
            </p>

            {/* MOBILE EQUAL CARDS */}
            <div
              className="
                mt-7
                grid
                grid-cols-2
                items-stretch
                gap-3
                sm:gap-4
                lg:hidden
              "
            >
              {/* LEFT FEATURE CARD */}
              <div
                className="
                  relative
                  h-full
                  rounded-[22px]
                  bg-black/24
                  p-3
                  pr-2
                  backdrop-blur-[2px]
                "
              >
                <div className="absolute left-[27px] top-[28px] bottom-[28px] border-l border-dotted border-white/20" />

                <div className="relative flex flex-col gap-3">
                  {features.map((item) => (
                    <div key={item.title} className="relative flex gap-2.5">
                      <div
                        className="
                          relative
                          z-10
                          grid
                          size-8
                          shrink-0
                          place-items-center
                          rounded-full
                          border
                          border-white/14
                          bg-white/12
                          text-white
                          backdrop-blur-md
                        "
                      >
                        <item.icon className="size-4" strokeWidth={1.8} />
                      </div>

                      <div className="min-w-0 pt-0.5">
                        <h3
                          className="
                            text-[10.5px]
                            font-semibold
                            leading-[1.35]
                            tracking-[-0.01em]
                            text-white
                            sm:text-[11.5px]
                          "
                        >
                          {item.title}
                        </h3>

                        <p
                          className="
                            mt-1
                            text-[9.5px]
                            leading-[1.55]
                            text-white/68
                            sm:text-[10.5px]
                          "
                        >
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT STATS CARD */}
              <div
                className="
                  relative
                  h-full
                  rounded-[22px]
                  bg-black/24
                  p-3
                  pr-2
                  backdrop-blur-[2px]
                "
              >
                <div className="absolute left-[27px] top-[28px] bottom-[28px] border-l border-dotted border-white/20" />

                <div className="relative flex flex-col gap-3">
                  {stats.map((item) => (
                    <div key={item.value} className="relative flex gap-2.5">
                      <div
                        className="
                          relative
                          z-10
                          grid
                          size-8
                          shrink-0
                          place-items-center
                          rounded-full
                          border
                          border-white/14
                          bg-white/12
                          text-white
                          backdrop-blur-md
                        "
                      >
                        <item.icon className="size-4" strokeWidth={1.7} />
                      </div>

                      <div className="min-w-0 pt-0.5">
                        <div
                          className="
                            font-display
                            text-[22px]
                            font-semibold
                            leading-[0.95]
                            tracking-[-0.055em]
                            text-white
                            sm:text-[25px]
                          "
                        >
                          {item.value}
                        </div>

                        <div className="mt-1.5 h-[2px] w-7 rounded-full bg-white/65" />

                        <p
                          className="
                            mt-1.5
                            text-[9.5px]
                            leading-[1.55]
                            text-white/68
                            sm:text-[10.5px]
                          "
                        >
                          {item.label}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* DESKTOP FEATURES */}
            <div
              className="
                relative
                mt-9
                hidden
                max-w-[430px]
                flex-col
                gap-5
                lg:flex
              "
            >
              <div className="absolute left-[22px] top-[24px] bottom-[24px] border-l border-dotted border-white/22" />

              {features.map((item) => (
                <div
                  key={item.title}
                  className="relative flex items-start gap-4"
                >
                  <div
                    className="
                      relative
                      z-10
                      grid
                      size-11
                      shrink-0
                      place-items-center
                      rounded-full
                      border
                      border-white/14
                      bg-white/12
                      text-white
                      backdrop-blur-md
                    "
                  >
                    <item.icon className="size-5" strokeWidth={1.8} />
                  </div>

                  <div>
                    <h3
                      className="
                        text-[16px]
                        font-semibold
                        leading-5
                        tracking-[-0.01em]
                        text-white
                      "
                    >
                      {item.title}
                    </h3>

                    <p
                      className="
                        mt-1.5
                        max-w-[310px]
                        text-[14px]
                        leading-6
                        text-white/64
                      "
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DESKTOP RIGHT STATS */}
          <div
            className="
              relative
              z-20
              hidden
              flex-col
              gap-9
              border-l
              border-white/12
              pl-8
              lg:col-start-3
              lg:row-start-1
              lg:flex
              lg:h-[58%]
              lg:justify-between
              xl:pl-10
            "
          >
            {stats.map((item) => (
              <div key={item.value} className="flex items-center gap-5">
                <div
                  className="
                    grid
                    size-16
                    shrink-0
                    place-items-center
                    rounded-full
                    border
                    border-white/14
                    bg-white/12
                    text-white
                    backdrop-blur-md
                  "
                >
                  <item.icon className="size-8" strokeWidth={1.7} />
                </div>

                <div>
                  <div
                    className="
                      font-display
                      text-[64px]
                      font-semibold
                      leading-[0.9]
                      tracking-[-0.055em]
                      text-white
                    "
                  >
                    {item.value}
                  </div>

                  <div className="mt-3 h-[3px] w-12 rounded-full bg-white/65" />

                  <p
                    className="
                      mt-3
                      max-w-[240px]
                      text-[16px]
                      leading-6
                      text-white/68
                    "
                  >
                    {item.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}