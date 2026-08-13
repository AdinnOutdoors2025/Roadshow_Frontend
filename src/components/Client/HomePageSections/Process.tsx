"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  BarChart3,
  FilePenLine,
  MapPinned,
  Megaphone,
  Truck,
} from "lucide-react";
import { Reveal } from "./Reveal";

const steps = [
  {
    title: "Share Campaign Requirement",
    desc: "Tell us your brand goal, target city and timeline.",
    icon: FilePenLine,
    tone: "blue",
  },
  {
    title: "Choose Vehicle & Coverage",
    desc: "Select the right format and city routes.",
    icon: Truck,
    tone: "green",
  },
  {
    title: "Plan Route, Branding, Schedule",
    desc: "We design routes, creatives and timing.",
    icon: MapPinned,
    tone: "orange",
  },
  {
    title: "Launch Roadshow Campaign",
    desc: "On-ground team executes with precision.",
    icon: Megaphone,
    tone: "purple",
  },
  {
    title: "Track Campaign Execution",
    desc: "Live GPS, location updates and reporting.",
    icon: BarChart3,
    tone: "green",
  },
] as const;

const toneStyles = {
  blue: {
    iconBg: "bg-[#EAF1FF]",
    iconText: "text-[#2F6BFF]",
  },
  green: {
    iconBg: "bg-[#EAF8EE]",
    iconText: "text-[#31A852]",
  },
  orange: {
    iconBg: "bg-[#FFF0E8]",
    iconText: "text-[#F05A28]",
  },
  purple: {
    iconBg: "bg-[#F1EAFE]",
    iconText: "text-[#7B55D9]",
  },
} as const;

type ProcessCardProps = {
  step: (typeof steps)[number];
  index: number;
  progress: MotionValue<number>;
  isMobile: boolean;
};

function ProcessCard({ step, index, progress, isMobile }: ProcessCardProps) {
  const Icon = step.icon;
  const tone = toneStyles[step.tone];

  const start = index * 0.09;
  const end = start + 0.42;

  const desktopX = useTransform(progress, [start, end], [150, 0]);
  const desktopY = useTransform(progress, [start, end], [70, 0]);
  const desktopOpacity = useTransform(progress, [start, end], [0, 1]);
  const desktopScale = useTransform(progress, [start, end], [0.97, 1]);

  return (
    <motion.article
      initial={isMobile ? { x: -36 } : false}
whileInView={isMobile ? { x: 0 } : undefined}
viewport={
  isMobile
    ? {
        once: true,
        amount: 0.42,
        margin: "0px 0px -70px 0px",
      }
    : undefined
}
transition={
  isMobile
    ? {
        type: "spring",
        stiffness: 65,
        damping: 22,
        mass: 0.9,
        delay: index * 0.035,
      }
    : undefined
}
      style={
        isMobile
          ? {
              opacity: 1,
              scale: 1,
              filter: "none",
            }
          : {
              x: desktopX,
              y: desktopY,
              opacity: desktopOpacity,
              scale: desktopScale,
              filter: "none",
            }
      }
      className="relative flex min-h-[220px] w-full min-w-0 flex-col last:col-span-2 md:last:col-span-1 overflow-hidden rounded-[22px] bg-white px-4 py-5 shadow-[0_16px_50px_rgba(0,0,0,0.04)] will-change-transform sm:min-h-[240px] sm:px-5 sm:py-6 md:min-h-[255px] md:rounded-[22px] md:px-5 md:py-6 lg:min-h-[290px] lg:rounded-[26px] lg:px-7 lg:py-8 xl:min-h-[310px] xl:px-8 xl:py-9"
    >
      <div
        className={`
          grid
          size-[46px]
          shrink-0
          place-items-center
          rounded-full

          sm:size-[54px]
          md:size-[56px]
          lg:size-[68px]
          xl:size-[74px]

          ${tone.iconBg}
          ${tone.iconText}
        `}
      >
        <Icon
          className="
            size-[23px]
            sm:size-[27px]
            md:size-7
            lg:size-8
            xl:size-9
          "
          strokeWidth={1.25}
        />
      </div>

      <h3
        className="
          mt-5
          w-full
          min-w-0
          font-display
          text-[18px]
          font-semibold
          leading-[1.14]
          tracking-[-0.04em]
          text-[#071426]

          sm:text-[20px]

          md:mt-8
          md:text-[18px]
          md:leading-[1.18]

          lg:mt-10
          lg:text-[22px]

          xl:mt-12
          xl:text-[25px]
        "
      >
        {step.title}
      </h3>

      <p
        className="
          mt-2
          w-full
          min-w-0
          text-[13px]
          leading-[1.45]
          text-[#4D5563]

          sm:text-[14px]

          md:mt-3
          md:text-[13px]
          md:leading-6

          lg:mt-4
          lg:text-[15px]
          lg:leading-7

          xl:text-[16px]
        "
      >
        {step.desc}
      </p>
    </motion.article>
  );
}

export function Process() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 767);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 85%", "end 25%"],
  });

  return (
    <section
      ref={sectionRef}
      id="process"
      className="
        relative
        overflow-hidden
        bg-transparent
        py-16
        md:py-24
        lg:py-28
      "
    >
      {/* <div
        className="
          relative
          z-10
          w-full
          px-4
          sm:px-6
          md:px-8
          lg:px-14
          xl:px-16
        "
      >
        {isMobile ? (
          <motion.h2
            initial={{ y: 18 }}
            whileInView={{ y: 0 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              max-w-5xl
              font-display
              text-[26px]
              font-semibold
              leading-[1.05]
              tracking-[-0.055em]
              text-[#071426]
              sm:text-[28px]
            "
          >
            From campaign idea to street-level visibility
          </motion.h2>
        ) : (
          <Reveal delay={1}>
            <h2
              className="
                max-w-5xl
                font-display
                text-[28px]
                font-semibold
                leading-[1.05]
                tracking-[-0.055em]
                text-[#071426]
                md:text-[32px]
                lg:text-[34px]
              "
            >
              From campaign idea to street-level visibility
            </h2>
          </Reveal>
        )}

        <div className="mt-9 grid grid-cols-2 gap-3 md:mt-12 md:grid-cols-3 md:gap-4 lg:grid-cols-5 lg:gap-5 xl:mt-16 xl:gap-6">
          {steps.map((step, index) => (
            <ProcessCard
              key={step.title}
              step={step}
              index={index}
              progress={scrollYProgress}
              isMobile={isMobile}
            />
          ))}
        </div>
      </div> */}
    </section>
  );
}