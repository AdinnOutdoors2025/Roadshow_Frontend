"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function GlobalSmoothScroll() {
  useEffect(() => {
    console.log("✅ Lenis smooth scroll mounted");

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      smoothWheel: true,

      // Extreme values only for testing
      duration: 1.1,
wheelMultiplier: 1,

      easing: (t: number) => 1 - Math.pow(1 - t, 4),

      touchMultiplier: 1,
      syncTouch: false,
      anchors: true,
    });

    const handleScroll = (event: {
      animatedScroll: number;
      targetScroll: number;
      velocity: number;
    }) => {
      console.log("Lenis scrolling:", {
        current: event.animatedScroll,
        target: event.targetScroll,
        velocity: event.velocity,
      });

      ScrollTrigger.update();
    };

    lenis.on("scroll", handleScroll);

    const updateLenis = (time: number) => {
      lenis.raf(time * 500);
    };

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    return () => {
      console.log("❌ Lenis smooth scroll destroyed");

      lenis.off("scroll", handleScroll);
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
    };
  }, []);

  return null;
}