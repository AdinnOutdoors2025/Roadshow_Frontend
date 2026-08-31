"use client";

import { usePathname, useRouter } from "next/navigation";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";
import { createPortal } from "react-dom";
import { scrollToSection } from "@/components/Client/Reusable_Components/scrollToSection";

/*
 * ============================================================
 * ONLY EDIT THIS SETTINGS BLOCK
 * ============================================================
 *
 * Search "MAIN LOADER ADJUSTMENTS" to change the full-refresh
 * loader. Search "MINI LOADER ADJUSTMENTS" to change the loader
 * used for internal links, sections, buttons and API actions.
 */
const LOADER_SETTINGS = {
  enabled: true,
  videoUrl: "/images/loader_transparent.webm?v=7",

  /* MAIN LOADER ADJUSTMENTS: browser open / full refresh only. */
  main: {
    label: "Loading Roadshow...",
    backgroundColor: "#000000",
    minimumVisibleMs: 1200,
    maximumWaitMs: 12000,
    fadeMs: 450,
    size: {
      mobileWidthVw: 88,
      maximumWidthPx: 620,
      aspectRatio: "1 / 1",
    },
  },

  /*
   * MINI LOADER ADJUSTMENTS: internal navigation and actions.
   * These preserve your current timeScale and sizeScale values.
   */
  mini: {
    /*
     * MINI TIME ADJUSTMENT: change only this value.
     * 0.3 means 4000ms × 0.3 = 1200ms before navigation.
     * Slow routes can remain visible longer until the real page
     * is ready, but never shorter than this configured duration.
     */
    timeScale: 0.2,
    sizeScale: 2.3,
    backgroundColor: "rgba(0, 0, 0, 0.72)",
    baseTiming: {
      navigationVisibleMs: 4000,
      actionVisibleMs: 1200,
      minimumVisibleMs: 700,
      fadeMs: 300,
      showDelayMs: 60,
      maximumWaitMs: 10000,
    },
    baseSize: {
      mobileWidthVw: 38,
      maximumWidthPx: 180,
      aspectRatio: "1 / 1",
    },
  },
} as const;

type LoaderMode = "main" | "mini";

const TIME_SCALE = Math.max(
  0.1,
  LOADER_SETTINGS.mini.timeScale,
);
const SIZE_SCALE = Math.max(
  0.1,
  LOADER_SETTINGS.mini.sizeScale,
);

const ENABLE_GLOBAL_LOADER = LOADER_SETTINGS.enabled;
const VIDEO_URL = LOADER_SETTINGS.videoUrl;

const NAVIGATION_VISIBLE_MS = Math.round(
  LOADER_SETTINGS.mini.baseTiming.navigationVisibleMs *
    TIME_SCALE,
);
const ACTION_VISIBLE_MS = Math.round(
  LOADER_SETTINGS.mini.baseTiming.actionVisibleMs *
    TIME_SCALE,
);
const MINIMUM_VISIBLE_MS = Math.round(
  LOADER_SETTINGS.mini.baseTiming.minimumVisibleMs * TIME_SCALE,
);
const FADE_MS = Math.round(
  LOADER_SETTINGS.mini.baseTiming.fadeMs * TIME_SCALE,
);
const SHOW_DELAY_MS = Math.round(
  LOADER_SETTINGS.mini.baseTiming.showDelayMs * TIME_SCALE,
);
const MAXIMUM_WAIT_MS =
  LOADER_SETTINGS.mini.baseTiming.maximumWaitMs;

const MINI_LOADER_WIDTH = `min(${
  LOADER_SETTINGS.mini.baseSize.mobileWidthVw * SIZE_SCALE
}vw, ${
  LOADER_SETTINGS.mini.baseSize.maximumWidthPx * SIZE_SCALE
}px, calc(100vw - 32px))`;

const MINI_LOADER_ASPECT_RATIO =
  LOADER_SETTINGS.mini.baseSize.aspectRatio;

const MAIN_LOADER_WIDTH = `min(${LOADER_SETTINGS.main.size.mobileWidthVw}vw, ${LOADER_SETTINGS.main.size.maximumWidthPx}px, calc(100vw - 32px))`;

const MAIN_LOADER_ASPECT_RATIO =
  LOADER_SETTINGS.main.size.aspectRatio;

const MAIN_MINIMUM_VISIBLE_MS =
  LOADER_SETTINGS.main.minimumVisibleMs;
const MAIN_MAXIMUM_WAIT_MS =
  LOADER_SETTINGS.main.maximumWaitMs;
const MAIN_FADE_MS = LOADER_SETTINGS.main.fadeMs;

const subscribeToHydration = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

const SHOW_EVENT = "roadshow-loader:show";
const HIDE_EVENT = "roadshow-loader:hide";
const NAVIGATE_EVENT = "roadshow-loader:navigate";

/*
 * Real links are automatic. Non-link controls must explicitly use
 * data-loader="true". Visual controls such as tabs, filters,
 * accordions, sliders and map zoom buttons should not use it.
 */
const CLICKABLE_SELECTOR = "a[href], [data-loader='true']";

interface LoaderEventDetail {
  label?: string;
}

interface NavigateEventDetail {
  navigate: () => void;
  label?: string;
}

interface PendingRouteTransition {
  fromPathname: string;
  destinationPathname?: string;
}

export function showRoadshowLoader(
  label = "Loading...",
) {
  if (!ENABLE_GLOBAL_LOADER) return;
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<LoaderEventDetail>(SHOW_EVENT, {
      detail: { label },
    }),
  );
}

export function hideRoadshowLoader() {
  if (!ENABLE_GLOBAL_LOADER) return;
  if (typeof window === "undefined") return;

  window.dispatchEvent(new Event(HIDE_EVENT));
}

export async function withRoadshowLoader<T>(
  operation: () => Promise<T>,
  label = "Loading...",
): Promise<T> {
  showRoadshowLoader(label);

  try {
    return await operation();
  } finally {
    hideRoadshowLoader();
  }
}

/*
 * Use this for a button that navigates with router.push,
 * router.replace or window.location instead of a real <a href>.
 * The callback is deliberately called only after the loader has
 * completed and fully faded out.
 */
export function navigateAfterRoadshowLoader(
  navigate: () => void,
  label = "Loading...",
): void {
  if (!ENABLE_GLOBAL_LOADER || typeof window === "undefined") {
    navigate();
    return;
  }

  window.dispatchEvent(
    new CustomEvent<NavigateEventDetail>(NAVIGATE_EVENT, {
      detail: { navigate, label },
    }),
  );
}

function isFormControlDisabled(element: Element) {
  return (
    (element instanceof HTMLButtonElement ||
      element instanceof HTMLInputElement ||
      element instanceof HTMLFieldSetElement) &&
    element.disabled
  );
}

function isPlainPrimaryClick(event: MouseEvent) {
  return (
    event.button === 0 &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

type AnchorAction =
  | { kind: "ignore" }
  | { kind: "route"; href: string }
  | {
      kind: "section";
      href: string;
      pathWithSearch: string;
      hash: string;
    }
  | { kind: "scroll-top" };

function classifyAnchor(
  anchor: HTMLAnchorElement,
): AnchorAction {
  if (typeof window === "undefined") return { kind: "ignore" };

  const target = anchor.getAttribute("target");
  if (target && target !== "_self") return { kind: "ignore" };
  if (anchor.hasAttribute("download")) return { kind: "ignore" };

  const rawHref = anchor.getAttribute("href") || "";

  if (!rawHref || rawHref === "#") return { kind: "ignore" };
  if (/^(mailto|tel|javascript):/i.test(rawHref)) {
    return { kind: "ignore" };
  }

  let url: URL;

  try {
    url = new URL(rawHref, window.location.href);
  } catch {
    return { kind: "ignore" };
  }

  if (url.origin !== window.location.origin) {
    return { kind: "ignore" };
  }

  const pathWithSearch = `${url.pathname}${url.search}`;
  const currentPathWithSearch =
    `${window.location.pathname}${window.location.search}`;
  const hash = url.hash ? url.hash.slice(1) : "";

  if (hash) {
    return {
      kind: "section",
      href: `${pathWithSearch}#${hash}`,
      pathWithSearch,
      hash,
    };
  }

  if (
    url.pathname === "/" &&
    currentPathWithSearch === "/"
  ) {
    return { kind: "scroll-top" };
  }

  if (pathWithSearch === currentPathWithSearch) {
    return { kind: "ignore" };
  }

  return { kind: "route", href: pathWithSearch };
}

function decodeHash(hash: string) {
  try {
    return decodeURIComponent(hash);
  } catch {
    return hash;
  }
}

function getDestinationPathname(href: string) {
  if (typeof window === "undefined") return undefined;

  try {
    return new URL(href, window.location.href).pathname;
  } catch {
    return undefined;
  }
}

function getActionDuration(element: Element) {
  const customDuration = Number(
    element.getAttribute("data-loader-duration"),
  );

  if (
    Number.isFinite(customDuration) &&
    customDuration >= 0
  ) {
    return Math.min(
      Math.round(customDuration * TIME_SCALE),
      MAXIMUM_WAIT_MS,
    );
  }

  return ACTION_VISIBLE_MS;
}

export default function GlobalRoadshowLoader() {
  const pathname = usePathname();
  const router = useRouter();
  /* /print-summary is a headless-browser-only route (see
     Utils/bookingSummaryPdfRenderer.js) — it must render nothing but the
     booking summary document itself, with no loader overlay ever covering
     it while Puppeteer captures the page. Reuses the same isAdminPage gate
     that already skips chrome for /admin/*. */
  const isAdminPage =
    pathname.startsWith("/admin") || pathname.startsWith("/print-summary");
  const showInitialMainLoader =
    ENABLE_GLOBAL_LOADER && !isAdminPage;

  const portalReady = useSyncExternalStore(
    subscribeToHydration,
    getClientSnapshot,
    getServerSnapshot,
  );
  const [rendered, setRendered] = useState(
    showInitialMainLoader,
  );
  const [visible, setVisible] = useState(
    showInitialMainLoader,
  );
  const [label, setLabel] = useState(
    showInitialMainLoader
      ? LOADER_SETTINGS.main.label
      : "Loading...",
  );
  const [loaderMode, setLoaderMode] =
    useState<LoaderMode>(
      showInitialMainLoader ? "main" : "mini",
    );
  const [isRoutePending, beginRouteTransition] =
    useTransition();

  const requestCountRef = useRef(
    showInitialMainLoader ? 1 : 0,
  );
  const shownAtRef = useRef(0);
  const visibleRef = useRef(showInitialMainLoader);
  const renderedRef = useRef(showInitialMainLoader);
  const loaderModeRef = useRef<LoaderMode>(
    showInitialMainLoader ? "main" : "mini",
  );
  const initialLoadFinishedRef = useRef(
    !showInitialMainLoader,
  );
  const navigationPendingRef = useRef(false);
  const pendingRouteTransitionRef =
    useRef<PendingRouteTransition | null>(null);

  const showTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const unmountTimerRef = useRef<number | null>(null);
  const routeFallbackTimerRef = useRef<number | null>(null);
  const actionTimersRef = useRef<Set<number>>(new Set());
  const afterHiddenCallbacksRef = useRef<Set<() => void>>(
    new Set(),
  );

  const clearTimer = useCallback(
    (timerRef: { current: number | null }) => {
      if (timerRef.current === null) return;

      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    },
    [],
  );

  const flushAfterHiddenCallbacks = useCallback(() => {
    const callbacks = Array.from(
      afterHiddenCallbacksRef.current,
    );

    afterHiddenCallbacksRef.current.clear();

    callbacks.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.error(
          "Roadshow navigation callback failed:",
          error,
        );
      }
    });
  }, []);

  const startLoader = useCallback(
    (nextLabel = "Loading...") => {
      if (!ENABLE_GLOBAL_LOADER || isAdminPage) return;

      requestCountRef.current += 1;
      setLabel(nextLabel);

      clearTimer(hideTimerRef);
      clearTimer(unmountTimerRef);

      if (
        initialLoadFinishedRef.current &&
        loaderModeRef.current === "main" &&
        !visibleRef.current
      ) {
        loaderModeRef.current = "mini";
        setLoaderMode("mini");
      }

      if (!renderedRef.current) {
        loaderModeRef.current = "mini";
        setLoaderMode("mini");
        renderedRef.current = true;
        setRendered(true);
      }

      if (visibleRef.current || showTimerRef.current !== null) {
        return;
      }

      showTimerRef.current = window.setTimeout(() => {
        showTimerRef.current = null;

        if (requestCountRef.current < 1) {
          renderedRef.current = false;
          setRendered(false);
          return;
        }

        shownAtRef.current = performance.now();
        visibleRef.current = true;
        setVisible(true);
      }, SHOW_DELAY_MS);
    },
    [clearTimer, isAdminPage],
  );

  /*
   * afterHidden runs only after opacity reaches zero and the
   * portal content has unmounted. Navigation uses this callback;
   * API loaders can call stopLoader without one.
   */
  const stopLoader = useCallback(
    (afterHidden?: () => void) => {
      if (afterHidden) {
        afterHiddenCallbacksRef.current.add(afterHidden);
      }

      requestCountRef.current = Math.max(
        0,
        requestCountRef.current - 1,
      );

      if (requestCountRef.current > 0) return;

      clearTimer(showTimerRef);

      if (!visibleRef.current) {
        renderedRef.current = false;
        setRendered(false);
        setLabel("Loading...");
        flushAfterHiddenCallbacks();
        return;
      }

      const activeMode = loaderModeRef.current;
      const minimumVisibleTime =
        activeMode === "main"
          ? MAIN_MINIMUM_VISIBLE_MS
          : MINIMUM_VISIBLE_MS;
      const fadeTime =
        activeMode === "main" ? MAIN_FADE_MS : FADE_MS;
      const visibleTime = Math.max(
        0,
        performance.now() - shownAtRef.current,
      );
      const remainingTime = Math.max(
        0,
        minimumVisibleTime - visibleTime,
      );

      clearTimer(hideTimerRef);

      hideTimerRef.current = window.setTimeout(() => {
        hideTimerRef.current = null;
        visibleRef.current = false;
        setVisible(false);

        clearTimer(unmountTimerRef);

        unmountTimerRef.current = window.setTimeout(() => {
          unmountTimerRef.current = null;
          renderedRef.current = false;
          setRendered(false);
          setLabel("Loading...");

          if (activeMode === "main") {
            loaderModeRef.current = "mini";
            setLoaderMode("mini");
          }

          flushAfterHiddenCallbacks();
        }, fadeTime);
      }, remainingTime);
    },
    [clearTimer, flushAfterHiddenCallbacks],
  );

  const closeLoaderImmediately = useCallback(() => {
    clearTimer(showTimerRef);
    clearTimer(hideTimerRef);
    clearTimer(unmountTimerRef);
    clearTimer(routeFallbackTimerRef);

    actionTimersRef.current.forEach((timer) => {
      window.clearTimeout(timer);
    });
    actionTimersRef.current.clear();
    afterHiddenCallbacksRef.current.clear();

    requestCountRef.current = 0;
    shownAtRef.current = 0;
    visibleRef.current = false;
    renderedRef.current = false;
    loaderModeRef.current = "mini";
    navigationPendingRef.current = false;
    pendingRouteTransitionRef.current = null;

    setVisible(false);
    setRendered(false);
    setLabel("Loading...");
    setLoaderMode("mini");
  }, [clearTimer]);

  /*
   * MAIN loader lifecycle.
   * It is present in the server-rendered page, so a hard refresh
   * starts on solid black. It finishes only after the browser's
   * real load event, while still respecting the configured
   * minimum display time and maximum safety timeout.
   */
  useEffect(() => {
    if (
      !ENABLE_GLOBAL_LOADER ||
      isAdminPage ||
      initialLoadFinishedRef.current
    ) {
      return;
    }

    shownAtRef.current = performance.now();

    let finishTimer: number | null = null;

    const finishInitialLoad = () => {
      if (initialLoadFinishedRef.current) return;

      initialLoadFinishedRef.current = true;
      stopLoader();
    };

    const queueFinish = () => {
      if (finishTimer !== null) return;

      finishTimer = window.setTimeout(
        finishInitialLoad,
        0,
      );
    };

    const maximumTimer = window.setTimeout(
      finishInitialLoad,
      MAIN_MAXIMUM_WAIT_MS,
    );

    if (document.readyState === "complete") {
      queueFinish();
    } else {
      window.addEventListener("load", queueFinish, {
        once: true,
      });
    }

    return () => {
      window.removeEventListener("load", queueFinish);
      window.clearTimeout(maximumTimer);

      if (finishTimer !== null) {
        window.clearTimeout(finishTimer);
      }
    };
  }, [isAdminPage, stopLoader]);

  const scrollToTopAfterLoader = useCallback(() => {
    const smoother = ScrollSmoother.get?.();

    if (smoother) {
      smoother.scrollTo(0, false, "top top");
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }

    window.history.pushState(null, "", "/");
    window.dispatchEvent(new Event("hashchange"));
  }, []);

  const scrollToHashAfterLoader = useCallback(
    (rawHash: string) => {
      const hash = decodeHash(rawHash);
      const target = document.getElementById(hash);

      if (target) {
        scrollToSection(hash, { instant: true });
      }

      const newUrl =
        `${window.location.pathname}` +
        `${window.location.search}#${rawHash}`;

      window.history.pushState(null, "", newUrl);
      window.dispatchEvent(new Event("hashchange"));
    },
    [],
  );

  /* Same-page section and scroll actions keep the old order. */
  const runBeforeNavigation = useCallback(
    (
      navigationLabel: string,
      navigate: () => void,
      visibleDuration = NAVIGATION_VISIBLE_MS,
    ) => {
      if (navigationPendingRef.current) return;

      navigationPendingRef.current = true;
      startLoader(navigationLabel);

      const safeVisibleDuration = Math.min(
        Math.max(0, visibleDuration),
        MAXIMUM_WAIT_MS,
      );

      const timer = window.setTimeout(() => {
        actionTimersRef.current.delete(timer);

        stopLoader(() => {
          navigationPendingRef.current = false;
          navigate();
        });
      }, SHOW_DELAY_MS + safeVisibleDuration);

      actionTimersRef.current.add(timer);
    },
    [startLoader, stopLoader],
  );

  const finishRouteTransition = useCallback(() => {
    if (!pendingRouteTransitionRef.current) return;

    pendingRouteTransitionRef.current = null;
    clearTimer(routeFallbackTimerRef);

    stopLoader(() => {
      navigationPendingRef.current = false;
    });
  }, [clearTimer, stopLoader]);

  /*
   * Route order:
   * 1. Keep showing the current page.
   * 2. Run the MINI loader for the configured minimum time.
   * 3. Start router navigation behind the overlay.
   * 4. Wait until Next.js commits the destination page.
   * 5. Fade the MINI loader out.
   *
   * This keeps route-level loading.tsx/fallback UI hidden and
   * prevents the ordinary Contact-page loader from flashing.
   */
  const runRouteTransition = useCallback(
    (
      navigationLabel: string,
      navigate: () => void,
      destinationPathname?: string,
      visibleDuration = NAVIGATION_VISIBLE_MS,
    ) => {
      if (navigationPendingRef.current) return;

      navigationPendingRef.current = true;
      startLoader(navigationLabel);

      const safeVisibleDuration = Math.min(
        Math.max(0, visibleDuration),
        MAXIMUM_WAIT_MS,
      );

      const timer = window.setTimeout(() => {
        actionTimersRef.current.delete(timer);

        pendingRouteTransitionRef.current = {
          fromPathname: window.location.pathname,
          destinationPathname,
        };

        try {
          beginRouteTransition(() => {
            navigate();
          });
        } catch (error) {
          console.error("Roadshow route navigation failed:", error);
          finishRouteTransition();
          return;
        }

        routeFallbackTimerRef.current = window.setTimeout(
          finishRouteTransition,
          MAXIMUM_WAIT_MS,
        );
      }, SHOW_DELAY_MS + safeVisibleDuration);

      actionTimersRef.current.add(timer);
    },
    [beginRouteTransition, finishRouteTransition, startLoader],
  );

  const runTimedActionLoader = useCallback(
    (clickable: Element) => {
      const actionLabel =
        clickable.getAttribute("data-loader-label") ||
        "Loading...";
      const duration = getActionDuration(clickable);

      startLoader(actionLabel);

      const timer = window.setTimeout(() => {
        actionTimersRef.current.delete(timer);
        stopLoader();
      }, SHOW_DELAY_MS + duration);

      actionTimersRef.current.add(timer);
    },
    [startLoader, stopLoader],
  );

  /* Hide only after the destination route has rendered a frame. */
  useEffect(() => {
    const pending = pendingRouteTransitionRef.current;

    if (!pending || isRoutePending) return;

    const currentPathname = pathname.toLowerCase();
    const destinationPathname =
      pending.destinationPathname?.toLowerCase();
    const routeCommitted = destinationPathname
      ? currentPathname === destinationPathname
      : currentPathname !== pending.fromPathname.toLowerCase();

    if (!routeCommitted) return;

    let firstFrame = 0;
    let secondFrame = 0;

    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(
        finishRouteTransition,
      );
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [finishRouteTransition, isRoutePending, pathname]);

  /* Preload the one global video once. */
  useEffect(() => {
    if (!ENABLE_GLOBAL_LOADER || isAdminPage) return;

    const video = document.createElement("video");

    video.src = VIDEO_URL;
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.load();

    return () => {
      video.removeAttribute("src");
      video.load();
    };
  }, [isAdminPage]);

  useEffect(() => {
    if (!ENABLE_GLOBAL_LOADER || isAdminPage) {
      const timer = window.setTimeout(
        closeLoaderImmediately,
        0,
      );

      return () => window.clearTimeout(timer);
    }

    const handleClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;

      const clickable = event.target.closest(
        CLICKABLE_SELECTOR,
      );

      if (!clickable) return;
      if (clickable.closest("[data-loader='false']")) return;
      if (clickable.getAttribute("aria-disabled") === "true") {
        return;
      }
      if (isFormControlDisabled(clickable)) return;

      const anchor = clickable.closest(
        "a[href]",
      ) as HTMLAnchorElement | null;

      if (!anchor) {
        runTimedActionLoader(clickable);
        return;
      }

      if (!isPlainPrimaryClick(event)) return;

      const action = classifyAnchor(anchor);

      if (action.kind === "ignore") return;

      event.preventDefault();

      const navigationLabel =
        clickable.getAttribute("data-loader-label") ||
        "Loading...";

      if (action.kind === "scroll-top") {
        runBeforeNavigation(
          navigationLabel,
          scrollToTopAfterLoader,
        );
        return;
      }

      if (action.kind === "section") {
        const currentPathWithSearch =
          `${window.location.pathname}` +
          `${window.location.search}`;

        if (action.pathWithSearch === currentPathWithSearch) {
          runBeforeNavigation(navigationLabel, () => {
            scrollToHashAfterLoader(action.hash);
          });
          return;
        }

        try {
          router.prefetch(action.pathWithSearch);
        } catch {
          // Prefetch is only an optimization.
        }

        runRouteTransition(
          navigationLabel,
          () => router.push(action.href),
          getDestinationPathname(action.href),
        );
        return;
      }

      try {
        router.prefetch(action.href);
      } catch {
        // Prefetch is only an optimization.
      }

      runRouteTransition(
        navigationLabel,
        () => router.push(action.href),
        getDestinationPathname(action.href),
      );
    };

    const handleShow = (event: Event) => {
      const customEvent =
        event as CustomEvent<LoaderEventDetail>;

      startLoader(
        customEvent.detail?.label || "Loading...",
      );
    };

    const handleHide = () => {
      /*
       * A child can finish an API call before its matching show
       * event was observed during hydration. Never let that early
       * hide event cancel the one protected MAIN-loader request.
       */
      if (
        !initialLoadFinishedRef.current &&
        requestCountRef.current <= 1
      ) {
        return;
      }

      stopLoader();
    };

    const handleNavigate = (event: Event) => {
      const customEvent =
        event as CustomEvent<NavigateEventDetail>;
      const { navigate, label: navigationLabel } =
        customEvent.detail || {};

      if (typeof navigate !== "function") return;

      runRouteTransition(
        navigationLabel || "Loading...",
        navigate,
      );
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!visibleRef.current) return;

      const activeElement =
        document.activeElement as HTMLElement | null;
      const activeTag =
        (activeElement?.tagName || "").toLowerCase();

      if (
        activeTag === "input" ||
        activeTag === "textarea" ||
        activeElement?.isContentEditable
      ) {
        return;
      }

      const scrollKeys = [
        " ",
        "PageUp",
        "PageDown",
        "Home",
        "End",
        "ArrowUp",
        "ArrowDown",
      ];

      if (scrollKeys.includes(event.key)) {
        event.preventDefault();
      }
    };

    const handlePopState = () => {
      closeLoaderImmediately();
    };

    document.addEventListener("click", handleClick, true);
    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener(SHOW_EVENT, handleShow);
    window.addEventListener(HIDE_EVENT, handleHide);
    window.addEventListener(NAVIGATE_EVENT, handleNavigate);

    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener(SHOW_EVENT, handleShow);
      window.removeEventListener(HIDE_EVENT, handleHide);
      window.removeEventListener(NAVIGATE_EVENT, handleNavigate);
    };
  }, [
    closeLoaderImmediately,
    isAdminPage,
    router,
    runBeforeNavigation,
    runRouteTransition,
    runTimedActionLoader,
    scrollToHashAfterLoader,
    scrollToTopAfterLoader,
    startLoader,
    stopLoader,
  ]);

  useEffect(() => {
    return () => {
      clearTimer(showTimerRef);
      clearTimer(hideTimerRef);
      clearTimer(unmountTimerRef);
      clearTimer(routeFallbackTimerRef);

      actionTimersRef.current.forEach((timer) => {
        window.clearTimeout(timer);
      });
      actionTimersRef.current.clear();
      afterHiddenCallbacksRef.current.clear();
      navigationPendingRef.current = false;
      pendingRouteTransitionRef.current = null;
      requestCountRef.current = 0;
    };
  }, [clearTimer]);

  if (
    !ENABLE_GLOBAL_LOADER ||
    !rendered ||
    isAdminPage
  ) {
    return null;
  }

  const activeFadeMs =
    loaderMode === "main" ? MAIN_FADE_MS : FADE_MS;
  const activeLoaderWidth =
    loaderMode === "main"
      ? MAIN_LOADER_WIDTH
      : MINI_LOADER_WIDTH;
  const activeAspectRatio =
    loaderMode === "main"
      ? MAIN_LOADER_ASPECT_RATIO
      : MINI_LOADER_ASPECT_RATIO;
  const activeBackgroundColor =
    loaderMode === "main"
      ? LOADER_SETTINGS.main.backgroundColor
      : LOADER_SETTINGS.mini.backgroundColor;

  const loaderOverlay = (
    <div
      data-roadshow-loader-mode={loaderMode}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
      className="fixed inset-0 z-[2147483647] flex items-center justify-center overflow-hidden px-4"
      style={{
        backgroundColor: visible
          ? activeBackgroundColor
          : "rgba(0, 0, 0, 0)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: [
          `opacity ${activeFadeMs}ms ease`,
          `background-color ${activeFadeMs}ms ease`,
        ].join(", "),
      }}
    >
      <style>{`
        [data-roadshow-loader-box="true"] {
          width: ${activeLoaderWidth} !important;
          min-width: ${activeLoaderWidth} !important;
          max-width: ${activeLoaderWidth} !important;
        }

        [data-roadshow-loader-frame="true"] {
          width: ${activeLoaderWidth} !important;
          min-width: ${activeLoaderWidth} !important;
          max-width: ${activeLoaderWidth} !important;
          aspect-ratio: ${activeAspectRatio} !important;
        }

        [data-roadshow-loader-video="true"] {
          display: block !important;
          width: 100% !important;
          height: 100% !important;
          min-width: 0 !important;
          max-width: 100% !important;
          min-height: 0 !important;
          max-height: 100% !important;
          object-fit: contain !important;
          background: transparent !important;
        }
      `}</style>

      <div
        data-roadshow-loader-box="true"
        className="flex flex-col items-center bg-transparent"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible
            ? "translateY(0) scale(1)"
            : "translateY(10px) scale(0.96)",
          transition: [
            `opacity ${activeFadeMs}ms ease`,
            `transform ${activeFadeMs}ms cubic-bezier(0.22,1,0.36,1)`,
          ].join(", "),
        }}
      >
        <div
          data-roadshow-loader-frame="true"
          className="overflow-hidden bg-transparent"
        >
          <video
            data-roadshow-loader-video="true"
            src={VIDEO_URL}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            controls={false}
            disablePictureInPicture
            aria-hidden="true"
          />
        </div>

        <p
          className={`text-center font-semibold text-white ${
            loaderMode === "main"
              ? "-mt-5 text-base sm:text-lg"
              : "-mt-3 text-sm"
          }`}
        >
          {label}
        </p>
      </div>
    </div>
  );

  if (!portalReady || typeof document === "undefined") {
    return loaderOverlay;
  }

  return createPortal(loaderOverlay, document.body);
}