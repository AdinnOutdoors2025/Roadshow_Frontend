"use client";

import gsap from "gsap";

import { DURATION, STAGGER } from "./motionTokens";

/* Plays the "pop in from the centre outward" reveal on demand.

   Same motion the client orbit uses on scroll, extracted so a user action can
   replay it — swapping which logos sit in the bubbles should look like the
   group re-forming, not like the images silently changing underneath.

   Kept as an imperative call rather than a hook because it fires in response to
   an event, not a render. */
interface PopInOptions {
  /* Distance in px the elements travel upward as they appear. 0 pops them in
     place; a small positive value makes them drift up into position. */
  rise?: number;
  /* Scale to grow from. Close to 1 reads as a settle; far from 1 reads as a
     pop, and past about 0.7 it starts to look like a snap however soft the
     easing is. */
  scaleFrom?: number;
  /* GSAP ease. Default is a plain ease-out with NO overshoot: an overshoot
     sends the element past its resting size and back, which is exactly what
     reads as the animation "snapping" at the end. */
  ease?: string;
  duration?: number;
}

export function playPopIn(
  targets: Element[] | NodeListOf<Element>,
  {
    rise = 0,
    scaleFrom = 0.86,
    ease = "power3.out",
    duration = DURATION.slow,
  }: PopInOptions = {}
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

  /* Hold the idle drift still for the duration of the reveal. The two motions
     are on different properties so they compose rather than conflict, but a
     bubble that is still bobbing as it lands never visibly comes to rest — it
     arrives and immediately slides again, which reads as the settle being
     unsteady. Paused, not cancelled: the animation keeps its position in the
     cycle, so resuming does not jump. */
  const elements = list.filter(
    (element): element is HTMLElement =>
      element instanceof HTMLElement
  );

  elements.forEach((element) => {
    element.style.animationPlayState = "paused";
  });

  const resumeDrift = () => {
    elements.forEach((element) => {
      element.style.animationPlayState = "";
    });
  };

  gsap.fromTo(
    list,
    { scale: scaleFrom, opacity: 0, y: rise },
    {
      scale: 1,
      opacity: 1,
      y: 0,
      duration,
      ease,
      stagger: { each: STAGGER.tight, from: "center" },
      onComplete: resumeDrift,
      onInterrupt: resumeDrift,
      /* GSAP writes `y` into `transform`, which the idle-drift animation does
         NOT use — that runs on the independent `translate` property — so the
         two compose instead of overwriting each other and a bubble keeps
         bobbing while it rises into place.

         clearProps hands the bubbles back to the stylesheet afterwards, so the
         :hover z-index and any future CSS transitions are not left overridden
         by inline styles. */
      clearProps: "opacity,transform",
    }
  );
}
