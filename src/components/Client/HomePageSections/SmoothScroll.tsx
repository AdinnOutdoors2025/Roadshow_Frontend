"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";

import { registerLenis } from "@/lib/smoothScrollControl";

export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    /* Published so useScrollLock can freeze the page behind an open popup.
       Lenis drives scrolling from its own wheel/touch listeners, so
       `overflow: hidden` alone never stops it. */
    registerLenis(lenis);

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      registerLenis(null);
      lenis.destroy();
    };
  }, []);
  return <>{children}</>;
}
