"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

import {
  DISTANCE,
  DURATION,
  EASE_OUT,
  VIEWPORT,
  offsetFor,
  type RevealDirection,
} from "./motionTokens";

interface RevealProps {
  children: ReactNode;
  /* Which way the element travels INTO place. "up" starts it below. */
  direction?: RevealDirection;
  delay?: number;
  distance?: number;
  duration?: number;
  /* false replays the reveal every time the element re-enters the viewport.
     Leave it true for anything on a long scrolling page. */
  once?: boolean;
  /* Fraction of the element that must be visible before it fires. */
  amount?: number;
  className?: string;
  style?: CSSProperties;
}

/* Wraps its children in a div that fades and slides in on scroll.

   Use this where an extra wrapper is harmless. Where it is NOT — a flex row
   whose gap depends on its direct children, a grid with explicit placement,
   anything targeted by :first-child — convert the existing element to a
   `motion.*` element and spread `fadeIn()` from motionTokens onto it instead,
   so the DOM shape is unchanged. */
export default function Reveal({
  children,
  direction = "up",
  delay = 0,
  distance = DISTANCE.base,
  duration = DURATION.base,
  once = VIEWPORT.once,
  amount = VIEWPORT.amount,
  className,
  style,
}: RevealProps) {
  const prefersReducedMotion = useReducedMotion();

  /* Reduced motion keeps the fade but drops the travel — the content still
     announces itself without anything sliding around the screen. */
  const offset = prefersReducedMotion
    ? { x: 0, y: 0 }
    : offsetFor(direction, distance);

  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount }}
      transition={{
        duration: prefersReducedMotion
          ? DURATION.fast
          : duration,
        delay,
        ease: EASE_OUT,
      }}
    >
      {children}
    </motion.div>
  );
}
