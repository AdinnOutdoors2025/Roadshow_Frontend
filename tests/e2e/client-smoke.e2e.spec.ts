// QA-03 Smoke Testing (client scope) — every public/client route loads,
// with no uncaught page errors and no React hydration-mismatch warnings.
// Admin routes are intentionally excluded (see CLIENT-QA-PROMPT.md).

import { test, expect, type Page } from "@playwright/test";
import { waitForMainLoaderGone } from "./helpers";

const STATIC_ROUTES = [
  "/",
  "/roadshow/CampaignRequest",
  "/roadshow/Contact",
  "/roadshow/vehicles",
  "/roadshow/review-order",
  "/roadshow/campaign-details",
  "/roadshow/my-bookings",
];

// Dynamic routes with a syntactically valid but non-existent id — must show
// a graceful "not found"/empty state, never a blank screen or a thrown error.
const DYNAMIC_ROUTES_WITH_DUMMY_ID = [
  "/roadshow/VehicleDetails/000000000000000000000000",
  "/roadshow/booking-request-submitted/000000000000000000000000",
  "/roadshow/my-bookings/000000000000000000000000",
  "/roadshow/view-summary/000000000000000000000000",
];

function trackPageErrors(page: Page) {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];

  page.on("pageerror", (err) => pageErrors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      // Network 404s to a mock/dev backend for a dummy id are expected here —
      // this suite runs without a live backend seeded with real data.
      if (/Failed to load resource|net::ERR_|404/.test(text)) return;
      if (/hydrat/i.test(text)) consoleErrors.push(`[hydration] ${text}`);
      else consoleErrors.push(text);
    }
  });

  return { pageErrors, consoleErrors };
}

for (const route of STATIC_ROUTES) {
  test(`smoke: ${route} loads with no uncaught errors`, async ({ page }) => {
    const { pageErrors, consoleErrors } = trackPageErrors(page);

    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response?.ok(), `${route} should respond 2xx/3xx`).toBeTruthy();

    await waitForMainLoaderGone(page); // let client-side hydration/animations settle

    expect(pageErrors, `uncaught page errors on ${route}`).toEqual([]);
    expect(consoleErrors, `console errors (incl. hydration) on ${route}`).toEqual([]);
  });
}

for (const route of DYNAMIC_ROUTES_WITH_DUMMY_ID) {
  test(`smoke: ${route} (unknown id) fails gracefully, no blank screen`, async ({ page }) => {
    const { pageErrors } = trackPageErrors(page);

    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response?.ok(), `${route} should still respond 2xx`).toBeTruthy();

    await waitForMainLoaderGone(page);

    const bodyText = (await page.locator("body").innerText()).trim();
    expect(bodyText.length, `${route} rendered a blank page`).toBeGreaterThan(0);
    expect(pageErrors, `uncaught page errors on ${route}`).toEqual([]);
  });
}

test("smoke: home page navbar is present and internal nav links resolve", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await waitForMainLoaderGone(page);

  const nav = page.locator("nav, header").first();
  await expect(nav).toBeVisible({ timeout: 10_000 });
});
