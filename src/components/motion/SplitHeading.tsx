"use client";

import {
  useEffect,
  useRef,
  type ElementType,
  type ReactNode,
} from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

import { DURATION, STAGGER } from "./motionTokens";

type SplitType = "words" | "chars" | "lines";

interface SplitHeadingProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  delay?: number;
  stagger?: number;
  /* "words" is the safe default. "chars" suits short headings but multiplies
     the node count, so avoid it on long copy. */
  type?: SplitType;
}

/* Reveals a heading one word (or character) at a time, each sliding up from
   behind a mask.

   Everything happens after mount and is fully reverted on unmount, so the
   server-rendered markup is the plain heading — no layout shift, and the text
   stays selectable and readable to screen readers if JS never runs. */
export default function SplitHeading({
  children,
  className,
  as: Tag = "div",
  delay = 0,
  stagger = STAGGER.tight,
  type = "words",
}: SplitHeadingProps) {
  const containerRef = useRef<HTMLElement | null>(
    null
  );

  useEffect(() => {
    const element = containerRef.current;

    if (!element) return;

    if (
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
    ) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger, SplitText);

    let split: SplitText | null = null;

    const context = gsap.context(() => {
      /* SplitText rewrites the element's innerHTML. If anything about this
         heading trips it up, leave the text exactly as authored rather than
         risk shipping a mangled headline. */
      try {
        split = new SplitText(element, {
          type,
          /* Wraps each part in an overflow:hidden box so the slide reads as
             the word rising from behind the line, not just moving up. */
          mask: type,
        });
      } catch {
        return;
      }

      const targets =
        type === "chars"
          ? split.chars
          : type === "lines"
            ? split.lines
            : split.words;

      if (!targets || !targets.length) return;

      gsap.from(targets, {
        yPercent: 115,
        opacity: 0,
        duration: DURATION.slow,
        ease: "power3.out",
        stagger,
        delay,
        scrollTrigger: {
          trigger: element,
          start: "top 85%",
          once: true,
        },
      });
    }, element);

    return () => {
      /* context.revert() kills the tween and its ScrollTrigger; the explicit
         split.revert() puts the original markup back. */
      context.revert();
      split?.revert();
    };
  }, [delay, stagger, type]);

  return (
    <Tag ref={containerRef} className={className}>
      {children}
    </Tag>
  );
}
