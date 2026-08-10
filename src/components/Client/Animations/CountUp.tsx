/*eslint-disable*/
//@ts-nocheck
"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useInView,
  useReducedMotion,
} from "framer-motion";

interface CountUpProps {
  from?: number;
  to: number;

  /**
   * Animation duration in seconds.
   *
   * Example:
   * duration={2.2}
   */
  duration?: number;

  /**
   * Delay before animation starts in seconds.
   */
  delay?: number;

  /**
   * Example:
   * separator=","
   *
   * 10000 becomes 10,000
   */
  separator?: string;

  /**
   * Number of decimal places.
   *
   * Example:
   * decimals={1}
   *
   * 20 becomes 20.0
   */
  decimals?: number;

  className?: string;

  /**
   * Animate only the first time it enters the viewport.
   */
  once?: boolean;

  prefix?: string;
  suffix?: string;
}

/* =========================================================
   Get decimal places automatically
========================================================= */

const getDecimalPlaces = (
  value: number
): number => {
  if (Number.isInteger(value)) {
    return 0;
  }

  const valueString = value.toString();

  if (valueString.includes(".")) {
    return valueString.split(".")[1]?.length ?? 0;
  }

  return 0;
};

/* =========================================================
   Add custom thousands separator
========================================================= */

const formatWithSeparator = (
  value: number,
  decimals: number,
  separator: string
): string => {
  const fixedValue = value.toFixed(decimals);

  if (!separator) {
    return fixedValue;
  }

  const parts = fixedValue.split(".");

  const integerPart = parts[0];
  const decimalPart = parts[1];

  const formattedInteger =
    integerPart.replace(
      /\B(?=(\d{3})+(?!\d))/g,
      separator
    );

  if (decimalPart !== undefined) {
    return `${formattedInteger}.${decimalPart}`;
  }

  return formattedInteger;
};

/* =========================================================
   Ease Out Cubic

   Starts quickly and slows near the final value.
========================================================= */

const easeOutCubic = (progress: number) => {
  return 1 - Math.pow(1 - progress, 3);
};

/* =========================================================
   COMPONENT
========================================================= */

const CountUp = ({
  from = 0,
  to,

  duration = 2,
  delay = 0,

  separator = "",
  decimals,

  className = "",
  once = true,

  prefix = "",
  suffix = "",
}: CountUpProps) => {
  const countRef =
    useRef<HTMLSpanElement | null>(null);

  const animationFrameRef =
    useRef<number | null>(null);

  const timeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  const hasAnimatedRef = useRef(false);

  const isInView = useInView(countRef, {
    amount: 0.3,
    once,
  });

  const shouldReduceMotion =
    useReducedMotion();

  const decimalPlaces = useMemo(() => {
    if (decimals !== undefined) {
      return decimals;
    }

    return Math.max(
      getDecimalPlaces(from),
      getDecimalPlaces(to)
    );
  }, [decimals, from, to]);

  const [currentValue, setCurrentValue] =
    useState(from);

  useEffect(() => {
    if (!isInView) {
      return;
    }

    /*
     * Don't replay if once=true.
     */
    if (
      once &&
      hasAnimatedRef.current
    ) {
      return;
    }

    /*
     * Accessibility:
     * immediately show final value.
     */
    if (shouldReduceMotion) {
      setCurrentValue(to);
      hasAnimatedRef.current = true;
      return;
    }

    setCurrentValue(from);

    const startAnimation = () => {
      const startTime = performance.now();

      hasAnimatedRef.current = true;

      const animate = (
        currentTime: number
      ) => {
        const elapsed =
          currentTime - startTime;

        const durationMilliseconds =
          Math.max(duration * 1000, 1);

        const progress = Math.min(
          elapsed / durationMilliseconds,
          1
        );

        const easedProgress =
          easeOutCubic(progress);

        const nextValue =
          from +
          (to - from) * easedProgress;

        setCurrentValue(nextValue);

        if (progress < 1) {
          animationFrameRef.current =
            requestAnimationFrame(animate);
        } else {
          /*
           * Make sure final value
           * is mathematically exact.
           */
          setCurrentValue(to);
        }
      };

      animationFrameRef.current =
        requestAnimationFrame(animate);
    };

    if (delay > 0) {
      timeoutRef.current = setTimeout(
        startAnimation,
        delay * 1000
      );
    } else {
      startAnimation();
    }

    return () => {
      if (
        animationFrameRef.current !== null
      ) {
        cancelAnimationFrame(
          animationFrameRef.current
        );
      }

      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    isInView,
    from,
    to,
    duration,
    delay,
    once,
    shouldReduceMotion,
  ]);

  const formattedValue =
    formatWithSeparator(
      currentValue,
      decimalPlaces,
      separator
    );

  return (
    <span
      ref={countRef}
      className={className}
    >
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
};

export default CountUp;