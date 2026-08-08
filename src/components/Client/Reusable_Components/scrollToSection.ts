"use client";

import { ScrollSmoother } from "gsap/ScrollSmoother";

/* The homepage section that the navbar "Vehicle" link targets.
   Kept here (not inline) so the navbar and HomePageSection1 can never
   drift apart on the id string. Must match the id on the
   .RS_OurRdwMainSection wrapper in HomePageSection1.tsx. */
export const HOME_VEHICLES_SECTION_ID = "our-roadshow-vehicles";

/* Clearance for the fixed glass header (12px top offset + 78px pill),
   so the section heading is never parked underneath it. */
const HEADER_OFFSET = 110;

type ScrollOptions = {
  /* Jump with no easing — used when the motion would be unwanted
     (prefers-reduced-motion) or redundant. */
  instant?: boolean;
};

/* Scrolls the page to a section by id.

   GlobalSmoothScroll runs ScrollSmoother on the homepage, which transforms
   #smooth-content rather than scrolling the window — the browser's own hash
   jump and element.scrollIntoView() both compute against a scrollport whose
   scrollTop is permanently 0 and end up nowhere near the target. So: hand the
   job to the smoother when one is alive, and fall back to a plain window
   scroll (with the same header offset) on pages that render outside it or
   when reduced motion has disabled it.

   Returns false when the section is not on the current page, so callers can
   let normal routing happen instead. */
export const scrollToSection = (
  sectionId: string,
  { instant = false }: ScrollOptions = {},
): boolean => {
  if (typeof window === "undefined") return false;

  const target = document.getElementById(sectionId);
  if (!target) return false;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const smooth = !instant && !prefersReducedMotion;

  const smoother = ScrollSmoother.get?.();

  if (smoother) {
    /* "top 110px" = align the section's top 110px below the viewport top,
       i.e. just clear of the floating header. */
    smoother.scrollTo(target, smooth, `top ${HEADER_OFFSET}px`);
    return true;
  }

  const top =
    target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;

  window.scrollTo({
    top: Math.max(0, top),
    behavior: smooth ? "smooth" : "auto",
  });

  return true;
};
