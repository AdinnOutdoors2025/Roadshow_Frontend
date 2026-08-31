"use client";

import { usePathname, useRouter } from "next/navigation";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
  type CSSProperties,
  type SyntheticEvent,
} from "react";
import { scrollToSection } from "@/components/Client/Reusable_Components/scrollToSection";

/*
 * ============================================================
 * GLOBAL LOADER ADJUSTMENTS — edit these constants only.
 * ============================================================
 *
 * Exactly two modes, two videos, never shared:
 *   MAIN — hard refresh / initial page load only. Opaque MP4,
 *          solid black background, no label.
 *   MINI — navigation to a different page and explicitly wrapped async work.
 *          Transparent WebM, dim overlay, small size + label.
 */
const ENABLE_GLOBAL_LOADER = true;

const MAIN_VIDEO_URL =
  "/images/assets/Rdsw_Web_images/loader.mp4?v=1";
const MINI_VIDEO_URL = "/images/loader_transparent.webm?v=7";

/* Main: how long the MP4 stays up after the real page load
   completes, and the hard failure-safe if load never fires. */
const MAIN_MIN_VISIBLE_MS = 2500;
const MAIN_MAX_WAIT_MS = 10000;

/* Mini: how long it stays up once shown, and — for a link/route
   click specifically — how long it shows BEFORE the actual
   navigation/scroll is triggered underneath it. */
const MINI_MIN_VISIBLE_MS = 700;
const MINI_NAVIGATION_DELAY_MS = 1200;

/* Shared fade-out duration for both modes. */
const FADE_MS = 350;

/* Video box width ceilings (see MAIN_VIDEO_STYLE / MINI sizing
   below for how each mode actually uses these). */
const MAIN_MAX_WIDTH_PX = 900;
const MINI_MAX_WIDTH_PX = 400;

/* Auxiliary timings not called out above but still needed for
   correct behaviour — kept small/conservative on purpose. */
const SHOW_DELAY_MS = 60;
const MINI_MAX_WAIT_MS = MAIN_MAX_WAIT_MS;

const MAIN_BACKGROUND_COLOR = "#000000";
const MINI_BACKGROUND_COLOR = "rgba(0, 0, 0, 0.72)";

/*
 * Module-scoped client guard:
 * - A real browser load/reload creates a fresh JavaScript runtime, so MAIN runs.
 * - App Router navigation keeps the runtime, so a component remount cannot
 *   incorrectly start MAIN again after MINI has handled the route change.
 *
 * This is intentionally set in an effect (not during render), which keeps the
 * server and first client render identical and remains safe in React StrictMode.
 */
let hasMountedGlobalLoaderOnClient = false;

type LoaderMode = "main" | "mini";

const SHOW_EVENT = "roadshow-loader:show";
const HIDE_EVENT = "roadshow-loader:hide";
const NAVIGATE_EVENT = "roadshow-loader:navigate";

/* Only real links are detected automatically. Ordinary buttons and
   same-page controls never show the loader. */
const CLICKABLE_SELECTOR = "a[href]";

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

  /* Build internals and raw media files are not pages — never
     gate a direct link to them behind the navigation loader. */
  if (
    url.pathname.startsWith("/_next") ||
    /\.(mp4|webm)$/i.test(url.pathname)
  ) {
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

export default function GlobalRoadshowLoader() {
  const pathname = usePathname();
  const router = useRouter();
  const isAdminPage = pathname.startsWith("/admin");
  const [showInitialMainLoader] = useState(
    () =>
      ENABLE_GLOBAL_LOADER &&
      !isAdminPage &&
      (typeof window === "undefined" ||
        !hasMountedGlobalLoaderOnClient),
  );

  useEffect(() => {
    hasMountedGlobalLoaderOnClient = true;
  }, []);

  /*
   * MINI loader visual state. Entirely independent of the MAIN
   * loader below — mini's own requestCountRef never influences
   * whether/when the main overlay closes, and vice versa.
   */
  const [rendered, setRendered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [label, setLabel] = useState("Loading...");
  const [isRoutePending, beginRouteTransition] =
    useTransition();

  const requestCountRef = useRef(0);
  const shownAtRef = useRef(0);
  const visibleRef = useRef(false);
  const renderedRef = useRef(false);
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

  /*
   * MAIN loader visual state. Present in the server-rendered
   * page (so a hard refresh starts on solid black) and closed
   * through its own idempotent completion path — never through
   * mini's requestCountRef — so mini traffic during the initial
   * load can never keep it stuck.
   */
  const [mainRendered, setMainRendered] = useState(
    showInitialMainLoader,
  );
  const [mainVisible, setMainVisible] = useState(
    showInitialMainLoader,
  );

  const mainRenderedRef = useRef(showInitialMainLoader);
  const mainVisibleRef = useRef(showInitialMainLoader);
  const mainShownAtRef = useRef(0);
  const mainHideTimerRef = useRef<number | null>(null);
  const mainUnmountTimerRef = useRef<number | null>(null);

  /* Idempotent completion latch: guarantees completeMainLoader's
     fade/unmount timers are scheduled at most once no matter how
     many of load/readyState/maximumWaitMs/video-error fire. */
  const initialLoadFinishedRef = useRef(
    !showInitialMainLoader,
  );
  /* Populated by the MAIN loader lifecycle effect below; called
     from handleMainVideoError so a failed Loader.mp4 can close
     the loader immediately instead of leaving it stuck. */
  const finishInitialLoadRef = useRef<() => void>(() => {});

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

      if (!renderedRef.current) {
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

      const visibleTime = Math.max(
        0,
        performance.now() - shownAtRef.current,
      );
      const remainingTime = Math.max(
        0,
        MINI_MIN_VISIBLE_MS - visibleTime,
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

          flushAfterHiddenCallbacks();
        }, FADE_MS);
      }, remainingTime);
    },
    [clearTimer, flushAfterHiddenCallbacks],
  );

  const closeLoaderImmediately = useCallback(() => {
    clearTimer(showTimerRef);
    clearTimer(hideTimerRef);
    clearTimer(unmountTimerRef);
    clearTimer(routeFallbackTimerRef);
    clearTimer(mainHideTimerRef);
    clearTimer(mainUnmountTimerRef);

    actionTimersRef.current.forEach((timer) => {
      window.clearTimeout(timer);
    });
    actionTimersRef.current.clear();
    afterHiddenCallbacksRef.current.clear();

    requestCountRef.current = 0;
    shownAtRef.current = 0;
    visibleRef.current = false;
    renderedRef.current = false;
    navigationPendingRef.current = false;
    pendingRouteTransitionRef.current = null;

    initialLoadFinishedRef.current = true;
    mainVisibleRef.current = false;
    mainRenderedRef.current = false;

    setVisible(false);
    setRendered(false);
    setLabel("Loading...");
    setMainVisible(false);
    setMainRendered(false);
  }, [clearTimer]);

  /*
   * MAIN loader completion — entirely self-contained. Does NOT
   * go through requestCountRef/stopLoader (mini's shared
   * counter), so mini traffic during the initial load (an auth
   * check, a toast gate mount, a click) can never keep this
   * stuck: nothing but this function's own idempotent guard
   * decides when the main overlay fades and unmounts. Never
   * waits for the looping MP4 itself to finish.
   */
  const completeMainLoader = useCallback(() => {
    if (initialLoadFinishedRef.current) return;
    initialLoadFinishedRef.current = true;

    if (!mainVisibleRef.current) {
      mainRenderedRef.current = false;
      setMainRendered(false);
      return;
    }

    const visibleTime = Math.max(
      0,
      performance.now() - mainShownAtRef.current,
    );
    const remainingTime = Math.max(
      0,
      MAIN_MIN_VISIBLE_MS - visibleTime,
    );

    clearTimer(mainHideTimerRef);

    mainHideTimerRef.current = window.setTimeout(() => {
      mainHideTimerRef.current = null;
      mainVisibleRef.current = false;
      setMainVisible(false);

      clearTimer(mainUnmountTimerRef);

      mainUnmountTimerRef.current = window.setTimeout(() => {
        mainUnmountTimerRef.current = null;
        mainRenderedRef.current = false;
        setMainRendered(false);
      }, FADE_MS);
    }, remainingTime);
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

    mainShownAtRef.current = performance.now();

    finishInitialLoadRef.current = completeMainLoader;

    let finishTimer: number | null = null;

    const queueFinish = () => {
      if (finishTimer !== null) return;

      finishTimer = window.setTimeout(
        completeMainLoader,
        0,
      );
    };

    const maximumTimer = window.setTimeout(
      completeMainLoader,
      MAIN_MAX_WAIT_MS,
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
  }, [isAdminPage, completeMainLoader]);

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
   * 2. Run the MINI loader for MINI_NAVIGATION_DELAY_MS.
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
      visibleDuration = MINI_NAVIGATION_DELAY_MS,
    ) => {
      if (navigationPendingRef.current) return;

      navigationPendingRef.current = true;
      startLoader(navigationLabel);

      const safeVisibleDuration = Math.min(
        Math.max(0, visibleDuration),
        MINI_MAX_WAIT_MS,
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
          MINI_MAX_WAIT_MS,
        );
      }, SHOW_DELAY_MS + safeVisibleDuration);

      actionTimersRef.current.add(timer);
    },
    [beginRouteTransition, finishRouteTransition, startLoader],
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

  /* Preload the mini (navigation/action) video once. The main
     video needs no separate preload — it is already rendered
     directly in the initial tree with preload="auto" from the
     very first paint on a hard refresh. */
  useEffect(() => {
    if (!ENABLE_GLOBAL_LOADER || isAdminPage) return;

    const video = document.createElement("video");

    video.src = MINI_VIDEO_URL;
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

      if (!anchor) return;

      if (!isPlainPrimaryClick(event)) return;

      const action = classifyAnchor(anchor);

      if (action.kind === "ignore") return;

      event.preventDefault();

      const navigationLabel =
        clickable.getAttribute("data-loader-label") ||
        "Loading...";

      if (action.kind === "scroll-top") {
        scrollToTopAfterLoader();
        return;
      }

      if (action.kind === "section") {
        const currentPathWithSearch =
          `${window.location.pathname}` +
          `${window.location.search}`;

        if (action.pathWithSearch === currentPathWithSearch) {
          scrollToHashAfterLoader(action.hash);
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
      /* mini's own counter — the main loader never touches it, so
         there is no shared-slot to protect here any more. */
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
    runRouteTransition,
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
      clearTimer(mainHideTimerRef);
      clearTimer(mainUnmountTimerRef);

      actionTimersRef.current.forEach((timer) => {
        window.clearTimeout(timer);
      });
      actionTimersRef.current.clear();
      afterHiddenCallbacksRef.current.clear();
      navigationPendingRef.current = false;
      pendingRouteTransitionRef.current = null;
      requestCountRef.current = 0;
      /* Idempotent guard: blocks any queued completion path
         (load event, maximumWaitMs timer, video onError) from
         calling setState after this component has unmounted. */
      initialLoadFinishedRef.current = true;
    };
  }, [clearTimer]);

  /* If the main Loader.mp4 fails (network error, unsupported
     format, missing file), close the loader safely instead of
     leaving a blank/stuck black overlay on the visitor. */
  const handleMainVideoError = useCallback(
    (event: SyntheticEvent<HTMLVideoElement>) => {
      console.error(
        "Roadshow main loader video failed to load:",
        event.currentTarget.error,
      );

      if (mainRenderedRef.current) {
        finishInitialLoadRef.current();
      }
    },
    [],
  );

  const loaderMode: LoaderMode = mainRendered
    ? "main"
    : "mini";

  if (
    !ENABLE_GLOBAL_LOADER ||
    (!rendered && !mainRendered) ||
    isAdminPage
  ) {
    return null;
  }

  const isMain = loaderMode === "main";
  const activeVideoUrl = isMain
    ? MAIN_VIDEO_URL
    : MINI_VIDEO_URL;
  const activeVisible = isMain ? mainVisible : visible;
  const activeBackgroundColor = isMain
    ? MAIN_BACKGROUND_COLOR
    : MINI_BACKGROUND_COLOR;

  /*
   * Critical positioning/sizing is inline on purpose: the MAIN
   * loader must render correctly on a hard refresh even if
   * Tailwind's stylesheet hasn't finished loading/applying yet,
   * and this is also what prevents the raw/unstyled-video flash
   * this component previously had. Tailwind classes are kept
   * only for the mini label's non-critical text styling below.
   */
  const overlayStyle: CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100vw",
    height: "100vh",
    zIndex: 2147483647,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    padding: "0 16px",
    boxSizing: "border-box",
    backgroundColor: activeVisible
      ? activeBackgroundColor
      : "rgba(0, 0, 0, 0)",
    opacity: activeVisible ? 1 : 0,
    pointerEvents: activeVisible ? "auto" : "none",
    transition: [
      `opacity ${FADE_MS}ms ease`,
      `background-color ${FADE_MS}ms ease`,
    ].join(", "),
  };

  const boxStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    maxWidth: "100%",
    opacity: activeVisible ? 1 : 0,
    transform: activeVisible
      ? "translateY(0) scale(1)"
      : "translateY(10px) scale(0.96)",
    transition: [
      `opacity ${FADE_MS}ms ease`,
      `transform ${FADE_MS}ms cubic-bezier(0.22,1,0.36,1)`,
    ].join(", "),
  };

  /* MAIN: sized by width + a viewport-height cap, never forced
     into a square crop — object-fit:contain shows the whole MP4
     regardless of its native aspect ratio. MINI: unchanged square
     frame + fixed width ceiling, matching its existing look. */
  const videoStyle: CSSProperties = isMain
    ? {
        display: "block",
        width: `min(90vw, ${MAIN_MAX_WIDTH_PX}px)`,
        maxWidth: "100%",
        maxHeight: "85dvh",
        height: "auto",
        objectFit: "contain",
        background: "transparent",
      }
    : {
        display: "block",
        width: `min(87vw, ${MINI_MAX_WIDTH_PX}px, calc(100vw - 32px))`,
        aspectRatio: "1 / 1",
        maxWidth: "100%",
        objectFit: "contain",
        background: "transparent",
      };

  const loaderOverlay = (
    <div
      data-roadshow-loader-mode={loaderMode}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
      style={overlayStyle}
    >
      {isMain && (
        <style>{`
          html,
          body {
            overflow: hidden !important;
            overscroll-behavior: none !important;
          }
        `}</style>
      )}

      <div
        data-roadshow-loader-box="true"
        style={boxStyle}
      >
        <video
          key={activeVideoUrl}
          data-roadshow-loader-video="true"
          src={activeVideoUrl}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          controls={false}
          disablePictureInPicture
          aria-hidden="true"
          style={videoStyle}
          onError={handleMainVideoError}
        />

        {!isMain && (
          <p className="-mt-3 text-center text-sm font-semibold text-white">
            {label}
          </p>
        )}
      </div>
    </div>
  );

  /*
   * Render directly where the component is mounted in the root layout.
   * The overlay is already fixed to the viewport with the maximum z-index,
   * so a portal is unnecessary. Keeping one render container also prevents
   * the video from remounting/restarting once during hydration.
   */
  return loaderOverlay;
}