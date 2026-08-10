/*eslint-disable*/
//@ts-nocheck
"use client";

import {
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import {
  useMemo,
  useRef,
  type ReactNode,
} from "react";

type AnimationDirection = "vertical" | "horizontal";

type CubicBezier = [
  number,
  number,
  number,
  number
];

interface AnimatedContentProps {
  children: ReactNode;
  distance?: number;
  direction?: AnimationDirection;
  reverse?: boolean;
  duration?: number;

  /**
   * Supports:
   * "power3.out"
   * "easeOut"
   * "easeIn"
   * "easeInOut"
   * or your own cubic bezier array
   */
  ease?:
    | "power3.out"
    | "easeOut"
    | "easeIn"
    | "easeInOut"
    | CubicBezier;

  initialOpacity?: number;
  animateOpacity?: boolean;
  scale?: number;
  threshold?: number;
  delay?: number;
  className?: string;
  once?: boolean;
}

const getEase = (
  ease: AnimatedContentProps["ease"]
): CubicBezier => {
  if (Array.isArray(ease)) {
    return ease;
  }

  switch (ease) {
    case "easeIn":
      return [0.42, 0, 1, 1];

    case "easeInOut":
      return [0.42, 0, 0.58, 1];

    case "easeOut":
      return [0, 0, 0.58, 1];

    case "power3.out":
    default:
      return [0.22, 1, 0.36, 1];
  }
};

const AnimatedContent = ({
  children,

  distance = 80,
  direction = "vertical",
  reverse = false,

  duration = 0.8,
  ease = "power3.out",

  initialOpacity = 0,
  animateOpacity = true,

  scale = 1,

  threshold = 0.15,
  delay = 0,

  className = "",
  once = true,
}: AnimatedContentProps) => {
  const elementRef = useRef<HTMLDivElement | null>(null);

  const isInView = useInView(elementRef, {
    amount: threshold,
    once,
  });

  const shouldReduceMotion = useReducedMotion();

  const initialAnimation = useMemo(() => {
    let x = 0;
    let y = 0;

    if (direction === "horizontal") {
      /*
       * reverse = false → comes from left
       * reverse = true  → comes from right
       */
      x = reverse ? distance : -distance;
    } else {
      /*
       * reverse = false → comes from bottom
       * reverse = true  → comes from top
       */
      y = reverse ? -distance : distance;
    }

    return {
      x,
      y,
      scale,
      opacity: animateOpacity ? initialOpacity : 1,
    };
  }, [
    direction,
    reverse,
    distance,
    scale,
    animateOpacity,
    initialOpacity,
  ]);

  const finalAnimation = {
    x: 0,
    y: 0,
    scale: 1,
    opacity: 1,
  };

  /*
   * Respect the user's reduced-motion accessibility setting.
   */
  if (shouldReduceMotion) {
    return (
      <div
        ref={elementRef}
        className={className}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={elementRef}
      className={className}
      initial={initialAnimation}
      animate={
        isInView
          ? finalAnimation
          : initialAnimation
      }
      transition={{
        duration,
        delay,
        ease: getEase(ease),
      }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedContent;