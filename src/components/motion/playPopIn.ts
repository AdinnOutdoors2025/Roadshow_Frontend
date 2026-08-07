"use client";

import gsap from "gsap";

import { DURATION, STAGGER } from "./motionTokens";

/* Plays the "pop in from the centre outward" reveal on demand.

   Same motion the client orbit uses on scroll, extracted so a user action can
   replay it — swapping which logos sit in the bubbles should look like the
   group re-forming, not like the images silently changing underneath.

   Kept as an imperative call rather than a hook because it fires in response to
   an event, not a render. */
export function playPopIn(
  targets: Element[] | NodeListOf<Element>
) {
  const list = Array.from(targets);

  if (!list.length) return;

  if (
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
  ) {
    return;
  }

  gsap.fromTo(
    list,
    { scale: 0.5, opacity: 0 },
    {
      scale: 1,
      opacity: 1,
      duration: DURATION.slow,
      ease: "back.out(1.7)",
      stagger: { each: STAGGER.tight, from: "center" },
      /* Hand the bubbles back to the stylesheet so the :hover z-index and any
         future CSS transitions are not left overridden by inline styles. */
      clearProps: "opacity,transform",
    }
  );
}
