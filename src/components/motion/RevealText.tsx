"use client";

import {
  useEffect,
  useRef,
  type ElementType,
  type ReactNode,
} from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { DURATION } from "./motionTokens";

/* - wipe : uncovers left-to-right via clip-path. The only safe choice for
            gradient text (see below), and the most "designed" looking.
   - rise : travels up into place.
   - pop  : scales up with a little overshoot.
   - blur : focuses in from a blur. */
export type RevealEffect =
  | "wipe"
  | "rise"
  | "pop"
  | "blur";

interface RevealTextProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  effect?: RevealEffect;
  delay?: number;
  duration?: number;
  start?: string;
}

/* Scroll reveal for a single element that leaves its innerHTML alone.

   This exists specifically because SplitText cannot be used on gradient text.
   Headings like .RS_OurRdwHeadingContent2 and .RS_VFRHeading paint themselves
   with `background: linear-gradient` + `background-clip: text` +
   `-webkit-text-fill-color: transparent`. The gradient belongs to that one
   element; splitting the text moves the glyphs into freshly created child
   wrappers which inherit the transparent fill but NOT the background, so the
   words lose their colour.

   Animating only transform / opacity / clip-path on the element itself keeps
   the gradient exactly as authored. */
export default function RevealText({
  children,
  className,
  as: Tag = "div",
  effect = "wipe",
  delay = 0,
  duration = DURATION.slow,
  start = "top 85%",
}: RevealTextProps) {
  const elementRef = useRef<HTMLElement | null>(
    null
  );

  useEffect(() => {
    const element = elementRef.current;

    if (!element) return;

    if (
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
    ) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const fromVars: gsap.TweenVars = {
      opacity: 0,
    };

    let ease = "power3.out";

    switch (effect) {
      case "wipe":
        /* Fully clipped from the right, then opened up. Opacity stays at 1 so
           the gradient is never faded — the wipe alone does the reveal. */
        fromVars.opacity = 1;
        fromVars.clipPath =
          "inset(0 100% 0 0)";
        fromVars.y = 12;
        ease = "power4.out";
        break;

      case "rise":
        fromVars.y = 40;
        break;

      case "pop":
        fromVars.scale = 0.8;
        ease = "back.out(1.6)";
        break;

      case "blur":
        fromVars.filter = "blur(14px)";
        fromVars.y = 16;
        break;
    }

    const context = gsap.context(() => {
      gsap.from(element, {
        ...fromVars,
        duration,
        delay,
        ease,
        /* Hand the element back to the stylesheet once it lands, so no inline
           clip-path or transform is left sitting on a gradient heading. */
        clearProps:
          "opacity,transform,clipPath,filter",
        scrollTrigger: {
          trigger: element,
          start,
          once: true,
        },
      });
    }, element);

    return () => context.revert();
  }, [effect, delay, duration, start]);

  return (
    <Tag ref={elementRef} className={className}>
      {children}
    </Tag>
  );
}
