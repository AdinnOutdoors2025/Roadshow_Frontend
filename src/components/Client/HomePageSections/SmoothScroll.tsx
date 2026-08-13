"use client";

import {
  useEffect,
  useRef,
  type ReactNode,
} from "react";

import {
  ReactLenis,
  type LenisRef,
} from "lenis/react";

import {
  cancelFrame,
  frame,
} from "framer-motion";

export function SmoothScroll({
  children,
}: {
  children: ReactNode;
}) {
  const lenisRef =
    useRef<LenisRef | null>(null);

  useEffect(() => {
    const update = ({
      timestamp,
    }: {
      timestamp: number;
    }) => {
      lenisRef.current?.lenis?.raf(
        timestamp,
      );
    };

    /*
     * Run Lenis on Framer Motion's
     * animation frame loop.
     *
     * This avoids having:
     *
     * Lenis RAF
     * +
     * Framer Motion RAF
     *
     * running independently.
     */
    frame.update(
      update,
      true,
    );

    return () => {
      cancelFrame(update);
    };
  }, []);

  return (
    <ReactLenis
      ref={lenisRef}
      root
      options={{
        autoRaf: false,

        smoothWheel: true,

        /*
         * Slightly quicker than your old 1.15.
         *
         * This is useful for the vehicle
         * zoom because the scroll doesn't
         * feel too delayed.
         */
        duration: 0.95,

        easing: (t) =>
          Math.min(
            1,
            1.001 -
              Math.pow(
                2,
                -10 * t,
              ),
          ),

        /*
         * Normal wheel strength.
         */
        wheelMultiplier: 1,

        /*
         * Avoid problematic touch inertia.
         */
        syncTouch: false,
      }}
    >
      {children}
    </ReactLenis>
  );
}