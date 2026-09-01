"use client";

import { ScrollSmoother } from "gsap/ScrollSmoother";

export const HOME_VEHICLES_SECTION_ID = "our-roadshow-vehicles";

/* Clearance for the fixed glass header. */
const HEADER_OFFSET = 110;

/* Must be slightly longer than GlobalSmoothScroll's `smooth: 1.1`. */
const HEADER_SCROLL_RELEASE_MS = 1400;

export const HEADER_SCROLL_START_EVENT =
  "roadshow:header-scroll-start";
export const HEADER_SCROLL_END_EVENT =
  "roadshow:header-scroll-end";

export type HeaderScrollDirection = "up" | "down";

export interface HeaderScrollEventDetail {
  direction: HeaderScrollDirection;
}

type ScrollOptions = {
  instant?: boolean;
  headerNavigation?: boolean;
};

let releaseTimer: number | null = null;

function startHeaderScroll(direction: HeaderScrollDirection) {
  if (releaseTimer !== null) {
    window.clearTimeout(releaseTimer);
  }

  window.dispatchEvent(
    new CustomEvent<HeaderScrollEventDetail>(
      HEADER_SCROLL_START_EVENT,
      { detail: { direction } },
    ),
  );

  releaseTimer = window.setTimeout(() => {
    releaseTimer = null;
    window.dispatchEvent(new Event(HEADER_SCROLL_END_EVENT));
  }, HEADER_SCROLL_RELEASE_MS);
}

function getWindowScrollTop() {
  return window.scrollY || document.documentElement.scrollTop || 0;
}

export const scrollToPageTop = (
  { instant = false, headerNavigation = false }: ScrollOptions = {},
): void => {
  if (typeof window === "undefined") return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const smooth = !instant && !prefersReducedMotion;
  const smoother = ScrollSmoother.get?.();

  if (smooth && headerNavigation) {
    startHeaderScroll("up");
  }

  if (smoother) {
    smoother.scrollTo(0, smooth, "top top");
    return;
  }

  window.scrollTo({
    top: 0,
    behavior: smooth ? "smooth" : "auto",
  });
};

export const scrollToSection = (
  sectionId: string,
  {
    instant = false,
    headerNavigation = false,
  }: ScrollOptions = {},
): boolean => {
  if (typeof window === "undefined") return false;

  const target = document.getElementById(sectionId);
  if (!target) return false;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const smooth = !instant && !prefersReducedMotion;
  const smoother = ScrollSmoother.get?.();

  const fallbackTargetTop = Math.max(
    0,
    target.getBoundingClientRect().top +
      getWindowScrollTop() -
      HEADER_OFFSET,
  );

  const currentTop = smoother
    ? smoother.scrollTop()
    : getWindowScrollTop();

  const destinationTop = smoother
    ? smoother.offset(target, `top ${HEADER_OFFSET}px`)
    : fallbackTargetTop;

  if (smooth && headerNavigation) {
    startHeaderScroll(
      destinationTop >= currentTop ? "down" : "up",
    );
  }

  if (smoother) {
    smoother.scrollTo(
      target,
      smooth,
      `top ${HEADER_OFFSET}px`,
    );
    return true;
  }

  window.scrollTo({
    top: fallbackTargetTop,
    behavior: smooth ? "smooth" : "auto",
  });

  return true;
};