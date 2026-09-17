import type { Page } from "@playwright/test";

/**
 * The main splash loader (GlobalRoadshowLoader.tsx) is guaranteed visible
 * for MAIN_MIN_VISIBLE_MS (2500ms) on first load and blocks page interaction
 * until it unmounts — clicking the page before then can silently no-op (the
 * click lands on the loader overlay, not the underlying page). Every fresh
 * Playwright context sees this "first load" behavior. Wait for the overlay
 * to be removed from the DOM before interacting, instead of a fixed sleep.
 */
export async function waitForMainLoaderGone(page: Page, timeout = 8000) {
  await page
    .waitForFunction(() => !document.querySelector("[data-roadshow-loader-mode]"), { timeout })
    .catch(() => {
      // If the loader never mounted at all (e.g. a non-first navigation),
      // there's nothing to wait for — don't fail the test over it.
    });
}
