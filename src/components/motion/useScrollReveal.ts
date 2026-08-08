"use client";

import { useEffect, type RefObject } from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import {
  DISTANCE,
  DURATION,
  STAGGER,
  type RevealDirection,
} from "./motionTokens";

interface ScrollRevealOptions {
  /* Descendants to animate. Omit to animate the container itself. */
  selector?: string;
  direction?: RevealDirection;
  distance?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
  /* Scale to grow from. Pair with a `back` ease for a pop. */
  scaleFrom?: number;
  /* GSAP ease string. Defaults to a plain ease-out. */
  ease?: string;
  /* "start" plays children in DOM order; "center" radiates outward from the
     middle of the group, which suits things laid out around a focal point. */
  staggerFrom?: "start" | "center" | "end" | "edges" | "random";
  /* Where the trigger sits when it fires, in ScrollTrigger's syntax.
     "top 85%" = the element's top reaching 85% down the viewport. */
  start?: string;
  /* Re-run whenever these change — needed when the elements are rendered from
     data that arrives after mount (an API-loaded list, for example). */
  deps?: unknown[];
}

/* Scroll-reveal driven by GSAP ScrollTrigger rather than IntersectionObserver.

   This is deliberate, not a preference. The public site scrolls via GSAP
   ScrollSmoother, which translates #smooth-content instead of scrolling it and
   clips everything to a fixed, viewport-sized #smooth-wrapper. Reveals built on
   IntersectionObserver (framer-motion's `whileInView`, and anything else using
   IO) do not reliably fire under that setup — the observer's notion of "in the
   viewport" and the smoother's notion of it disagree. ScrollTrigger reads the
   smoother's own scroll position, so it always agrees.

   Elements are animated in place: nothing is wrapped, so flex gaps, grid
   placement and :first-child rules in the existing stylesheets are untouched. */
export function useScrollReveal(
  containerRef: RefObject<HTMLElement | null>,
  {
    selector,
    direction = "up",
    distance = DISTANCE.base,
    duration = DURATION.base,
    delay = 0,
    stagger = STAGGER.base,
    scaleFrom,
    ease = "power3.out",
    staggerFrom = "start",
    start = "top 85%",
    deps = [],
  }: ScrollRevealOptions = {}
) {
  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    if (
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
    ) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const targets: Element[] = selector
      ? Array.from(
          container.querySelectorAll(selector)
        )
      : [container];

    if (!targets.length) return;

    const fromVars: gsap.TweenVars = { opacity: 0 };

    if (direction === "up") fromVars.y = distance;
    if (direction === "down") fromVars.y = -distance;
    if (direction === "left") fromVars.x = distance;
    if (direction === "right") fromVars.x = -distance;

    if (scaleFrom !== undefined) {
      fromVars.scale = scaleFrom;
    }

    /* Hold any CSS animation on the targets still while they reveal. An
       element that is already drifting (the client bubbles have an idle bob)
       never visibly comes to rest — it arrives and immediately slides again,
       so the settle reads as unsteady. Paused rather than cancelled, so it
       keeps its place in the cycle and resuming does not jump. A no-op on
       targets that have no animation. */
    const elements = targets.filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement
    );

    elements.forEach((element) => {
      element.style.animationPlayState = "paused";
    });

    const resumeCssAnimation = () => {
      elements.forEach((element) => {
        element.style.animationPlayState = "";
      });
    };

    /* gsap.context scopes and, on revert(), cleans up every tween and
       ScrollTrigger created inside it — important on a route change, or the
       triggers pile up and start firing against a stale DOM. */
    const context = gsap.context(() => {
      gsap.from(targets, {
        ...fromVars,
        onComplete: resumeCssAnimation,
        onInterrupt: resumeCssAnimation,
        duration,
        delay,
        stagger: { each: stagger, from: staggerFrom },
        ease,
        /* clearProps hands the element back to the stylesheet once it lands,
           so hover transforms and CSS transitions are not left overridden by
           GSAP's inline styles. */
        clearProps: "opacity,transform",
        scrollTrigger: {
          trigger: container,
          start,
          once: true,
        },
      });
    }, container);

    return () => {
      /* If the component unmounts before the trigger fires, the tween never
         runs its onComplete — restore here so the drift is not left paused. */
      resumeCssAnimation();
      context.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    containerRef,
    selector,
    direction,
    distance,
    duration,
    delay,
    stagger,
    scaleFrom,
    ease,
    staggerFrom,
    start,
    ...deps,
  ]);
}
