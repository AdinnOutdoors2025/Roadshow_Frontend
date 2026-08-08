"use client";

import Link from "next/link";

import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import AnimatedContent from "../Animations/AnimatedContent";
import CountUp from "../Animations/CountUp";

/* =========================================================
   TYPES
========================================================= */

type ImpactStat = {
  id: number;
  value: number;
  suffix: string;
  label: string;
  description: string;
  separator?: string;
};

type VehicleFormat = {
  id: number;
  label: string;
  image: string;
};

/* =========================================================
   DATA
========================================================= */

const impactStats: ImpactStat[] = [
  {
    id: 1,
    value: 10000,
    suffix: "+",
    label: "Successful Campaigns",
    description: "Campaigns executed across India",
    separator: ",",
  },
  {
    id: 2,
    value: 250,
    suffix: "+",
    label: "Roadshow Vehicles",
    description: "Modern fleet for every marketing need",
  },
  {
    id: 3,
    value: 20,
    suffix: "L+",
    label: "Daily Impressions",
    description: "Real people. Real reach. Every single day.",
  },
];

/* Vertical step per card, so the four vehicles sit along a line that rises to
   the right instead of a flat row — the same direction the background curves
   travel. Written out as literal class strings, not built from the index:
   Tailwind only generates a class it can actually see in the source. Applied
   from lg up, where the four are on one row; below that they wrap to a 2-up
   grid and a staircase would just read as broken alignment. */
const slantOffsets = [
  "lg:mt-[54px]",
  "lg:mt-[36px]",
  "lg:mt-[18px]",
  "lg:mt-0",
];

/* Perspective: a row of parked trucks does not read as four equal cut-outs —
   the nearest one is largest and sits lowest, and each one behind it is
   smaller and higher up. Pairing these shrinking heights with the rising
   offsets above puts the tops AND the bottoms of the four on two parallel
   slanted lines, which is what sells the depth.

   Uniform up to lg on purpose: below that the cards wrap to a 2-up grid with
   no slant, and four different sizes with nothing to line them up on just
   looks like a mistake. */
const vehicleSizes = [
  "h-28 sm:h-32 lg:h-44 xl:h-52",
  "h-28 sm:h-32 lg:h-40 xl:h-47",
  "h-28 sm:h-32 lg:h-36 xl:h-42",
  "h-28 sm:h-32 lg:h-32 xl:h-38",
];

/* The four formats shown beside the numbers. Images are the ones already in
   public/images/assets — swap a path here to change a card, nothing else has
   to move. Filenames contain spaces and brackets on purpose: they are the
   assets as delivered, and renaming them would break every other reference. */
const vehicleFormats: VehicleFormat[] = [
  {
    id: 1,
    label: "2 Sided Van",
    image: "/images/assets/HomeBanner_MainPageFinal.png",
  },
  {
    id: 2,
    label: "3 Sided Van",
    image: "/images/assets/tata ultra - 2.png",
  },
  {
    id: 3,
    label: "19ft LED Truck",
    image: "/images/assets/full side LED edited (1)_NEW.png",
  },
  {
    id: 4,
    label: "Single Side Van",
    image: "/images/assets/single side edited (1)_NEW.png",
  },
];

/* =========================================================
   PROPS
========================================================= */

type ImpactCtaBannerProps = {
  ctaHref?: string;
};

/* =========================================================
   COMPONENT
========================================================= */

const ImpactCtaBanner = ({
  ctaHref = "/contact",
}: ImpactCtaBannerProps) => {
  /* The vehicles breathe with a slow float. Switched off entirely — not just
     shortened — when the visitor has asked for reduced motion, since this is
     decoration that never stops. */
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      className="
        relative
        w-full
        overflow-hidden
        bg-[#f8f8fa]
      "
    >
      {/* =====================================================
          VERY SUBTLE BACKGROUND GRAPHIC
      ===================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          overflow-hidden
        "
      >
        <svg
          viewBox="0 0 1600 500"
          preserveAspectRatio="none"
          className="
            absolute
            bottom-0
            left-0
            h-full
            w-full
            opacity-[0.45]
          "
        >
          <path
            d="
              M-100 390
              C190 330 330 430 620 350
              C920 265 1090 160 1370 155
              C1480 150 1570 170 1700 220
            "
            fill="none"
            stroke="#7057C3"
            strokeOpacity="0.07"
            strokeWidth="1"
          />

          <path
            d="
              M-100 410
              C190 350 340 450 630 370
              C930 285 1100 180 1380 175
              C1490 170 1580 190 1700 240
            "
            fill="none"
            stroke="#7057C3"
            strokeOpacity="0.05"
            strokeWidth="1"
          />

          <path
            d="
              M-100 430
              C190 370 350 470 640 390
              C940 305 1110 200 1390 195
              C1500 190 1590 210 1700 260
            "
            fill="none"
            stroke="#7057C3"
            strokeOpacity="0.035"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* =====================================================
          CONTAINER
      ===================================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          w-full
          max-w-[1720px]

          px-5
          py-14

          sm:px-8
          sm:py-16

          md:px-10

          lg:px-12
          lg:py-20

          xl:px-16
          xl:py-24

          2xl:px-20
          2xl:py-28
        "
      >
        {/* ===================================================
            TOP SECTION
        =================================================== */}

        <AnimatedContent
          distance={45}
          direction="vertical"
          duration={0.8}
          initialOpacity={0}
          animateOpacity
          threshold={0.15}
        >
          <div
            className="
              flex
              flex-col
              gap-8

              border-b
              border-black/[0.09]

              pb-10

              md:flex-row
              md:items-end
              md:justify-between

              lg:pb-12
            "
          >
            {/* LEFT */}

            <div className="max-w-[760px]">
              <div
                className="
                  mb-4
                  flex
                  items-center
                  gap-3
                "
              >
                <span
                  className="
                    h-[1px]
                    w-8
                    bg-[#7057C3]
                  "
                />

                <span
                  className="
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-[0.22em]
                    text-[#7057C3]

                    sm:text-xs
                  "
                >
                  Our Impact
                </span>
              </div>

              <h2
                className="
                  max-w-[760px]

                  text-[34px]
                  font-medium
                  leading-[1.08]
                  tracking-[-0.045em]
                  text-[#111111]

                  sm:text-[42px]

                  md:text-[48px]

                  lg:text-[52px]

                  xl:text-[58px]

                  2xl:text-[64px]
                "
              >
                Campaigns that move
                <span className="text-[#7057C3]">
                  {" "}
                  brands forward.
                </span>
              </h2>
            </div>

            {/* RIGHT */}

            <div
              className="
                max-w-[440px]

                md:pb-1

                lg:max-w-[470px]
              "
            >
              <p
                className="
                  text-[14px]
                  font-normal
                  leading-6
                  text-black/55

                  sm:text-[15px]
                  sm:leading-7

                  xl:text-base
                "
              >
                From local market activations to large-scale
                roadshow campaigns, we help brands build
                visibility where their audience actually is.
              </p>

              <Link
                href={ctaHref}
                className="
                  group

                  mt-6

                  inline-flex
                  items-center
                  gap-3

                  text-[13px]
                  font-semibold
                  text-[#111111]

                  transition-colors
                  duration-300

                  hover:text-[#7057C3]

                  sm:text-sm
                "
              >
                Plan your roadshow

                <span
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center

                    rounded-full

                    border
                    border-black/[0.14]

                    transition-all
                    duration-300

                    group-hover:border-[#7057C3]
                    group-hover:bg-[#7057C3]
                    group-hover:text-white
                  "
                >
                  <ArrowRight
                    className="
                      h-3.5
                      w-3.5

                      transition-transform
                      duration-300

                      group-hover:translate-x-[2px]
                    "
                  />
                </span>
              </Link>
            </div>
          </div>
        </AnimatedContent>

        {/* ===================================================
            IMPACT BAND

            One horizontal strip: the three headline numbers on
            the left, the four vehicle formats on the right,
            separated by hairline rules. They only sit side by
            side from lg upwards — below that the numbers keep
            the full width and the vehicles drop to a 2-up grid,
            which is the only way four trucks stay legible on a
            phone.
        =================================================== */}

        <div
          className="
            grid
            grid-cols-1

            pt-10

            lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]
            lg:pt-14
          "
        >
          {/* -------------------------------------------------
              STATISTICS
          ------------------------------------------------- */}

          <div
            className="
              grid
              grid-cols-1

              sm:grid-cols-3
            "
          >
            {impactStats.map((stat, index) => (
              <AnimatedContent
                key={stat.id}
                distance={40}
                direction="vertical"
                duration={0.75}
                delay={0.05 + index * 0.1}
                initialOpacity={0}
                animateOpacity
                threshold={0.15}
                className="w-full"
              >
                <div
                  className={`
                    h-full

                    py-7

                    sm:px-6
                    sm:py-2

                    lg:px-8

                    ${
                      index === 0
                        ? "sm:pl-0"
                        : `
                          border-t
                          border-black/[0.08]

                          sm:border-t-0
                          sm:border-l
                        `
                    }
                  `}
                >
                  <div
                    className="
                      flex
                      items-baseline
                      whitespace-nowrap

                      font-semibold
                      leading-none
                      tracking-[-0.055em]

                      text-[#5b3fd6]
                    "
                  >
                    <CountUp
                      from={0}
                      to={stat.value}
                      separator={stat.separator ?? ""}
                      duration={2}
                      delay={0.2 + index * 0.12}
                      className="
                        text-[40px]

                        sm:text-[38px]

                        lg:text-[46px]

                        xl:text-[54px]

                        2xl:text-[60px]
                      "
                    />

                    <span
                      className="
                        text-[32px]

                        sm:text-[30px]

                        lg:text-[36px]

                        xl:text-[42px]

                        2xl:text-[46px]
                      "
                    >
                      {stat.suffix}
                    </span>
                  </div>

                  <h3
                    className="
                      mt-3

                      text-[14px]
                      font-semibold
                      tracking-[-0.015em]
                      text-[#111111]

                      lg:text-[15px]

                      xl:text-base
                    "
                  >
                    {stat.label}
                  </h3>

                  <p
                    className="
                      mt-2

                      max-w-[210px]

                      text-[12px]
                      font-normal
                      leading-5
                      text-black/45

                      xl:text-[13px]
                    "
                  >
                    {stat.description}
                  </p>
                </div>
              </AnimatedContent>
            ))}
          </div>

          {/* -------------------------------------------------
              VEHICLE FORMATS
          ------------------------------------------------- */}

          {/* No rules anywhere in here: the vehicles read as one line of
              traffic, and a divider between each would chop it into four
              boxes. Spacing alone separates them from the numbers. */}
          <div
            className="
              mt-10

              grid
              grid-cols-2

              pt-2

              md:grid-cols-4

              lg:mt-0
              lg:pt-0
            "
          >
            {vehicleFormats.map((vehicle, index) => (
              <AnimatedContent
                key={vehicle.id}
                distance={40}
                direction="vertical"
                duration={0.75}
                delay={0.35 + index * 0.1}
                initialOpacity={0}
                animateOpacity
                threshold={0.15}
                className="w-full"
              >
                <div
                  className={`
                    group

                    flex
                    h-full
                    flex-col
                    items-center

                    px-3
                    py-6

                    sm:px-5

                    lg:py-2

                    ${index === 0 ? "lg:pl-8" : ""}

                    ${slantOffsets[index] ?? ""}
                  `}
                >
                  {/* Index and name share one line — the number reads as a
                      label on the name rather than a heading above it. */}
                  <div
                    className="
                      flex
                      items-baseline
                      justify-center
                      gap-2
                    "
                  >
                    <span
                      className="
                        text-[12px]
                        font-semibold
                        tracking-[0.02em]
                        text-[#5b3fd6]

                        lg:text-[13px]
                      "
                    >
                      0{index + 1}
                    </span>

                    <h3
                      className="
                        text-center

                        text-[13px]
                        font-semibold
                        tracking-[-0.015em]
                        text-[#111111]

                        transition-colors
                        duration-300

                        group-hover:text-[#5b3fd6]

                        lg:text-[14px]

                        xl:text-[15px]
                      "
                    >
                      {vehicle.label}
                    </h3>
                  </div>

                  {/* Accent grows out from the centre on hover — with the
                      dividers gone this is the only edge in the strip, so it
                      stays subtle. */}
                  <span
                    aria-hidden="true"
                    className="
                      mt-2

                      h-[2px]
                      w-0

                      rounded-full
                      bg-[#5b3fd6]

                      transition-all
                      duration-500

                      group-hover:w-7
                    "
                  />

                  <motion.img
                    src={vehicle.image}
                    alt={vehicle.label}
                    loading="lazy"
                    className={`
                      mt-4

                      w-full

                      object-contain

                      ${vehicleSizes[index] ?? "h-28 sm:h-32 lg:h-36"}
                    `}
                    animate={
                      shouldReduceMotion
                        ? undefined
                        : { y: [0, -6, 0] }
                    }
                    transition={
                      shouldReduceMotion
                        ? undefined
                        : {
                            duration: 4.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            /* Offset per card so the four never bob in
                               lockstep, which reads as a glitch. */
                            delay: index * 0.4,
                          }
                    }
                    whileHover={
                      shouldReduceMotion
                        ? undefined
                        : { scale: 1.06 }
                    }
                  />
                </div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImpactCtaBanner;
