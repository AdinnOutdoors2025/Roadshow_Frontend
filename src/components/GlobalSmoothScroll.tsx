"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

type GlobalSmoothScrollProps = {
  children: ReactNode;
};

/* Routes that opt out of smooth scrolling.

   ScrollSmoother translates #smooth-content instead of scrolling it, which
   makes `position: sticky` impossible anywhere inside: a sticky element's
   nearest scrollport becomes #smooth-wrapper, whose scrollTop is permanently
   0, so it has no offset to react to and silently behaves as static.

   Dense, app-like pages built around sticky columns and sticky action bars
   lose far more from that than they gain from eased scrolling, so they render
   outside the smoother entirely. Note this returns children WITHOUT the
   wrapper divs — leaving them in place would keep #smooth-wrapper's
   `overflow: hidden` (globals.css) as the scrollport and break sticky anyway. */
const SMOOTH_SCROLL_DISABLED_PATHS = [
  "/roadshow/CampaignRequest",

  /* The remaining two steps of the same booking flow. Both are built around
     a sticky summary column and campaign-details also has a sticky action
     bar, so they need the same opt-out for exactly the reason above. */
  "/roadshow/campaign-details",
  "/roadshow/review-order",
];

export default function GlobalSmoothScroll({
  children,
}: GlobalSmoothScrollProps) {
  const pathname = usePathname();

  const smoothScrollDisabled =
    SMOOTH_SCROLL_DISABLED_PATHS.some((path) =>
      pathname?.startsWith(path)
    );

  useEffect(() => {
    if (smoothScrollDisabled) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    let smoother: ReturnType<typeof ScrollSmoother.create> | null =
      null;

    /* Sections fetch their data after mount (HomePageSection1 loads the
       vehicle carousel from the API, images decode later still), so the page
       is taller than it was when ScrollTrigger first measured it. Without a
       refresh, every trigger below the fold fires at the wrong scroll
       position and the smoother's max scroll is short. ScrollTrigger already
       self-refreshes on window resize, but not on content-height changes. */
    let refreshTimerId = 0;
    let lastMeasuredHeight = 0;
    let resizeObserver: ResizeObserver | null = null;

    const scheduleRefresh = () => {
      window.clearTimeout(refreshTimerId);

      refreshTimerId = window.setTimeout(() => {
        const content = document.querySelector<HTMLElement>("#smooth-content");
        const height = content?.offsetHeight ?? 0;

        // Refreshing can itself nudge the height by a sub-pixel amount, which
        // would re-enter this observer forever. Only act on a real change.
        if (height === lastMeasuredHeight) {
          return;
        }

        lastMeasuredHeight = height;
        ScrollTrigger.refresh();
      }, 150);
    };

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
        // Above ~1.4 the catch-up stops reading as "smooth" and starts
        // reading as input lag, so keep this in the 0.7-1.2 band.
        smooth: 1.1,

        // Overall page-scroll speed
        speed: 1.1,

        // Enables data-speed and data-lag attributes
        effects: true,

        // Keep touch scrolling nearly native
        smoothTouch: 0.08,

        /* Helps reduce scroll-thread synchronization jitter.
           Passed as an object, NOT `true`: ScrollSmoother expands `true` to
           `{debounce: true, content: ...}`, which leaves `allowNestedScroll`
           undefined — and the normalizer then swallows wheel/touch events for
           the whole document, so nothing inside a modal, dropdown or any other
           overflow-y:auto container can scroll. `allowNestedScroll: true` lets
           those inner containers consume the event first and only scrolls the
           page once they hit their own end. */
        normalizeScroll: {
          debounce: true,
          allowNestedScroll: true,
        },

        // Reduces mobile resize jumps
        ignoreMobileResize: true,
      });

      ScrollTrigger.refresh();

      const content = document.querySelector<HTMLElement>("#smooth-content");

      if (content) {
        lastMeasuredHeight = content.offsetHeight;
        resizeObserver = new ResizeObserver(scheduleRefresh);
        resizeObserver.observe(content);
      }

      window.addEventListener("load", scheduleRefresh);
    });

    return () => {
      cancelAnimationFrame(frameId);
      window.clearTimeout(refreshTimerId);
      window.removeEventListener("load", scheduleRefresh);
      resizeObserver?.disconnect();
      resizeObserver = null;
      smoother?.kill();
      smoother = null;
    };
  }, [pathname, smoothScrollDisabled]);

  /* Path-derived, so server and client agree on the first render and this
     cannot cause a hydration mismatch. */
  if (smoothScrollDisabled) {
    return <>{children}</>;
  }

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content">{children}</div>
    </div>
  );
}