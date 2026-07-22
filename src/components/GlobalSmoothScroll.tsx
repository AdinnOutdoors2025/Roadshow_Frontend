"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

type GlobalSmoothScrollProps = {
  children: ReactNode;
};

export default function GlobalSmoothScroll({
  children,
}: GlobalSmoothScrollProps) {
  const pathname = usePathname();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    let smoother: ReturnType<typeof ScrollSmoother.create> | null =
      null;

    const frameId = requestAnimationFrame(() => {
      // Prevent duplicate instances during Next.js development
      ScrollSmoother.get()?.kill();

      smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",

        // Catch-up duration:
        // 0.7 = quicker
        // 0.85 = premium and balanced
        // 1.1 = softer but slower
        smooth: 1.85,

        // Overall page-scroll speed
        speed: 1.1,

        // Enables data-speed and data-lag attributes
        effects: true,

        // Keep touch scrolling nearly native
        smoothTouch: 0.08,

        // Helps reduce scroll-thread synchronization jitter
        normalizeScroll: true,

        // Reduces mobile resize jumps
        ignoreMobileResize: true,
      });

      ScrollTrigger.refresh();
    });

    return () => {
      cancelAnimationFrame(frameId);
      smoother?.kill();
      smoother = null;
    };
  }, [pathname]);

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content">{children}</div>
    </div>
  );
}