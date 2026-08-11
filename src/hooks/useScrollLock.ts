"use client";

import { useEffect } from "react";
import { ScrollSmoother } from "gsap/ScrollSmoother";

import { getLenis } from "@/lib/smoothScrollControl";

/* The app scrolls via GSAP ScrollSmoother (see GlobalSmoothScroll.tsx),
   which drives scrolling itself from wheel/touch listeners rather than
   native browser scroll — so `overflow: hidden` on body/html alone does
   not stop the background from moving behind an open popup. Pausing the
   smoother is what actually stops it; the overflow rules below are a
   fallback for when ScrollSmoother isn't running (prefers-reduced-motion
   skips creating it in GlobalSmoothScroll). */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const smoother = ScrollSmoother.get();
    smoother?.paused(true);

    /* Lenis wraps the whole roadshow layout and runs independently of
       ScrollSmoother — on routes where the smoother is disabled entirely
       (see SMOOTH_SCROLL_DISABLED_PATHS, e.g. /roadshow/CampaignRequest)
       it is the ONLY thing scrolling the page, so pausing the smoother
       alone leaves the background moving behind the popup. */
    const lenis = getLenis();
    lenis?.stop();

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      smoother?.paused(false);
      lenis?.start();
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [active]);
}
