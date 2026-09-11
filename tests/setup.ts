import "@testing-library/jest-dom/vitest";

// jsdom has no matchMedia implementation; several client pages call
// gsap.registerPlugin(ScrollTrigger) at module load time, which probes it.
// This stub only exists for the test environment — it changes no app code
// or runtime behavior.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }) as unknown as MediaQueryList;
}
