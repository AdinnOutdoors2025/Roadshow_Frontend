// QA-09 UI / Responsive / Browser testing (client scope).
// Sweeps the client routes across desktop/tablet/mobile viewports and checks
// for page-level horizontal overflow (a real defect), plus verifies the
// navbar / mobile menu / smooth-scroll shell survive on each size.

import { test, expect } from "@playwright/test";
import { installMockBackend, makeBackendState } from "./client-mock-data";
import { waitForMainLoaderGone } from "./helpers";

const VIEWPORTS: { name: string; width: number; height: number }[] = [
  { name: "large-desktop", width: 1536, height: 864 },
  { name: "desktop", width: 1280, height: 800 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile-large", width: 430, height: 932 },
  { name: "mobile-small", width: 360, height: 740 },
];

const STATIC_ROUTES = [
  "/",
  "/roadshow/CampaignRequest",
  "/roadshow/Contact",
  "/roadshow/vehicles",
  "/roadshow/review-order",
  "/roadshow/campaign-details",
  "/roadshow/my-bookings",
];

for (const viewport of VIEWPORTS) {
  test.describe(`viewport ${viewport.name} (${viewport.width}x${viewport.height})`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const route of STATIC_ROUTES) {
      test(`no page-level horizontal overflow on ${route}`, async ({ page }) => {
        const state = makeBackendState();
        await installMockBackend(page, state);

        await page.goto(route, { waitUntil: "domcontentloaded" });
        await waitForMainLoaderGone(page);

        const metrics = await page.evaluate(() => {
          const offenders: string[] = [];
          const viewportWidth = window.innerWidth;

          document.querySelectorAll<HTMLElement>("body *").forEach((el) => {
            const rect = el.getBoundingClientRect();
            if (
              rect.right > viewportWidth + 1 &&
              window.getComputedStyle(el).overflowX !== "hidden" &&
              window.getComputedStyle(el).overflowX !== "auto" &&
              window.getComputedStyle(el).overflowX !== "scroll"
            ) {
              offenders.push(
                `${el.tagName.toLowerCase()}.${String(el.className)
                  .split(" ")
                  .slice(0, 2)
                  .join(".")} right=${Math.round(rect.right)}`,
              );
            }
          });

          return {
            docScroll: document.documentElement.scrollWidth,
            win: window.innerWidth,
            bodyScroll: document.body.scrollWidth,
            offenders: offenders.slice(0, 8),
          };
        });

        expect(
          metrics.docScroll,
          `page-level horizontal overflow on ${route} (${viewport.name}) offenders: ${metrics.offenders.join(", ")}`,
        ).toBeLessThanOrEqual(metrics.win + 1);
      });
    }
  });
}

test.describe("QA-09 navigation shell on mobile", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("mobile menu opens, lists client links, and closes", async ({ page }) => {
    const state = makeBackendState();
    await installMockBackend(page, state);

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await waitForMainLoaderGone(page);

    await page.getByRole("button", { name: "Open account menu" }).click();
    const menu = page.getByLabel("Account menu");
    await expect(menu).toBeVisible({ timeout: 5_000 });

    const mobileNav = menu.getByLabel("Mobile navigation");
    await expect(mobileNav).toBeVisible();

    await page.getByRole("button", { name: "Close account menu" }).click();
    await expect(menu).toBeHidden({ timeout: 5_000 });
  });

  test("home page content is vertically scrollable (smooth-scroll shell intact)", async ({ page }) => {
    const state = makeBackendState();
    await installMockBackend(page, state);

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await waitForMainLoaderGone(page);

    const sizes = await page.evaluate(() => ({
      body: document.body.scrollHeight,
      viewport: window.innerHeight,
    }));

    expect(sizes.body).toBeGreaterThan(sizes.viewport);

    const errs: string[] = [];
    page.on("pageerror", (e) => errs.push(e.message));
    await page.mouse.wheel(0, 1500);
    await page.waitForTimeout(400);
    expect(errs, "scrolling must not throw").toEqual([]);
  });
});

test.describe("QA-09 desktop navigation", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("desktop nav is present on a wide viewport", async ({ page }) => {
    const state = makeBackendState();
    await installMockBackend(page, state);

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await waitForMainLoaderGone(page);

    await expect(page.getByLabel("Main navigation")).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("QA-09 smallest viewport", () => {
  test.use({ viewport: { width: 320, height: 640 } });

  test("content never overflows 320px horizontally", async ({ page }) => {
    const state = makeBackendState();
    await installMockBackend(page, state);

    const routes = ["/roadshow/Contact", "/roadshow/campaign-details", "/roadshow/my-bookings"];
    for (const route of routes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await waitForMainLoaderGone(page);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow, `${route} must not overflow at 320px`).toBeLessThanOrEqual(1);
    }
  });
});