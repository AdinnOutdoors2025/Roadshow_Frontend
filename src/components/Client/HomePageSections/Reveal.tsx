"use client";

import { useRef, type ReactNode } from "react";

import { useScrollReveal } from "@/components/motion/useScrollReveal";

/* Scroll reveal for the sections ported from adinnroadshows.com.

   This was originally a framer-motion component using `whileInView`. That works
   on the source site but not here: the public site scrolls via GSAP
   ScrollSmoother, which translates #smooth-content instead of scrolling it and
   clips everything to a fixed, viewport-sized wrapper. framer's `whileInView`
   is built on IntersectionObserver, whose notion of "in the viewport" then
   disagrees with the smoother's — so the reveal either fired the moment the
   page loaded or never fired at all, and the sections appeared with no motion.

   ScrollTrigger reads the smoother's own scroll position, so it always agrees.

   The public API is unchanged (children / delay / className) so GPSTracking,
   About and Process keep working without edits. `delay` stays an INDEX, not
   seconds — callers pass 1, 2, 3, 4 to order items within a block. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const elementRef = useRef<HTMLDivElement>(null);

  useScrollReveal(elementRef, {
    direction: "up",
    /* Matches the original variants: y 28 -> 0 over 0.9s, staggered by 0.08s
       per index, so the ported sections keep the timing they were designed
       with. */
    distance: 28,
    duration: 0.9,
    delay: delay * 0.08,
    /* Slightly later than the default so a block does not start animating
       while it is still mostly below the fold. */
    start: "top 88%",
  });

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
}
