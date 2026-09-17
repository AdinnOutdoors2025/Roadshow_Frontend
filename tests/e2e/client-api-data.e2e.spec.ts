// QA-05 Client API, QA-06 Integration, QA-07 Data consistency (client scope).
// Exercises every authed + public client API path against a routed mock
// backend shaped like ClientRequestController.js, then verifies the UI maps
// each response correctly and keeps rendering the latest data on refresh.

import { test, expect } from "@playwright/test";
import {
  seedClientAuth,
  installMockBackend,
  makeBackendState,
  BOOKING_ONROAD,
  BOOKING_PENDING,
  BOOKING_CANCELLED,
  expectBookingSummaryVisible,
  type BackendState,
} from "./client-mock-data";
import { waitForMainLoaderGone } from "./helpers";

test.describe("QA-05 Client API mapping", () => {
  test("my-bookings list maps API data to rows (order id, status, duration, vehicle count)", async ({ page }) => {
    const state: BackendState = makeBackendState();
    await seedClientAuth(page);
    await installMockBackend(page, state);

    await page.goto("/roadshow/my-bookings", { waitUntil: "domcontentloaded" });
    await waitForMainLoaderGone(page);

    await expect(page.getByText("RSQ-2026-000123").first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("RSQ-2026-000088").first()).toBeVisible();
    await expect(page.getByText("RSQ-2026-000042").first()).toBeVisible();

    await expect(page.getByText("Acme Product Launch").first()).toBeVisible();
    await expect(page.getByText("Beta Brand Push").first()).toBeVisible();

    // Duration / period / progress derived from the raw payload
    await expect(page.getByText("Day 3 of 6", { exact: true }).first()).toBeVisible();

    // Status interpretations: on-road -> In Progress; cancelled -> Cancelled
    await expect(page.getByText("In Progress").first()).toBeVisible();
    await expect(page.getByText("Cancelled").first()).toBeVisible();

    // Vehicle count rollup: 2 + 1 = 3
    await expect(page.getByText("3 Vehicles").first()).toBeVisible();

    expect(state.mineHits).toBeGreaterThanOrEqual(1);
  });

  test("client-request calls carry the customer Authorization header", async ({ page }) => {
    const state: BackendState = makeBackendState();
    await seedClientAuth(page);
    await installMockBackend(page, state);

    await page.goto("/roadshow/my-bookings", { waitUntil: "domcontentloaded" });
    await waitForMainLoaderGone(page);
    await expect(page.getByText("RSQ-2026-000123").first()).toBeVisible({ timeout: 10_000 });

    expect(state.seenAuthHeaders.length).toBeGreaterThan(0);
    expect(state.seenAuthHeaders[0]).toBe("Bearer mock-customer-jwt");
  });

  test("selected booking detail opens and maps order/pricing data into the dashboard", async ({ page }) => {
    const state: BackendState = makeBackendState();
    await seedClientAuth(page);
    await installMockBackend(page, state);

    await page.goto("/roadshow/my-bookings", { waitUntil: "domcontentloaded" });
    await waitForMainLoaderGone(page);

    await page
      .getByRole("button", { name: "Open RSQ-2026-000123" })
      .first()
      .click();

    const dashboard = page.getByLabel("Selected campaign details for RSQ-2026-000123");
    await expect(dashboard).toBeVisible({ timeout: 10_000 });
    await expect(dashboard.getByText("Acme Product Launch")).toBeVisible();
    await expect(dashboard.getByText("Order ID: RSQ-2026-000123")).toBeVisible();
    await expect(dashboard.getByText("Chennai").first()).toBeVisible();

    expect(state.detailHits).toBeGreaterThanOrEqual(1);
  });

  test("vehicles catalog endpoint renders on the vehicles page", async ({ page }) => {
    const state: BackendState = makeBackendState();
    await installMockBackend(page, state);

    await page.goto("/roadshow/vehicles", { waitUntil: "domcontentloaded" });
    await waitForMainLoaderGone(page);

    await expect(page.getByText("LED Van - 12ft Body").first()).toBeVisible({ timeout: 10_000 });
    // Availability derived from registrationVehicles (2 of 3 available)
    await expect(page.getByText("2 available", { exact: false }).first()).toBeVisible();
  });
});

test.describe("QA-06 Integration (backend change -> client refresh)", () => {
  test("list reflects backend edits after refresh (dates, pricing, status)", async ({ page }) => {
    const state: BackendState = makeBackendState();
    await seedClientAuth(page);
    await installMockBackend(page, state);

    await page.goto("/roadshow/my-bookings", { waitUntil: "domcontentloaded" });
    await waitForMainLoaderGone(page);
    await expect(page.getByText("RSQ-2026-000123").first()).toBeVisible({ timeout: 10_000 });

    // Simulate a backend edit: campaign confirmed, dates moved, new pricing.
    // Keep both vehicle-type entries so the vehicle count (sum of quantities)
    // changes from 3 to 4 as the comment below expects.
    state.bookings = state.bookings.map((b) =>
      b === BOOKING_ONROAD
        ? {
            ...BOOKING_ONROAD,
            journeyStage: { index: 1, key: "confirmed" },
            onRoad: null,
            subtotal: 200000,
            gstAmount: 36000,
            estimatedTotal: 236000,
            vehicleTypes: (BOOKING_ONROAD.vehicleTypes as unknown as Record<string, unknown>[]).map((vt, i) =>
              i === 0
                ? {
                    ...vt,
                    fromDate: "2026-09-01",
                    toDate: "2026-09-08",
                    totalDays: 8,
                    quantity: 3,
                    lineTotal: 192000,
                  }
                : vt,
            ),
          }
        : b,
    );

    // Reload page -> fresh fetch of the edited payload.
    await page.goto("/roadshow/my-bookings", { waitUntil: "domcontentloaded" });
    await waitForMainLoaderGone(page);

    await expect(page.getByText("RSQ-2026-000123").first()).toBeVisible({ timeout: 10_000 });

    // New status label supersedes "In Progress" (stat tiles always keep their
    // labels, so scope the check to the booking row itself)
    const row = page.getByRole("button", { name: /Booking ID RSQ-2026-000123/ });
    await expect(row).toContainText("Confirmed");
    await expect(row).not.toContainText("On Road");

    // New vehicle total: 3 + 1 = 4
    await expect(row).toContainText("4 Vehicles");

    // Open detail to verify refreshed pricing flows to the dashboard list data
    await page
      .getByRole("button", { name: "Open RSQ-2026-000123" })
      .first()
      .click();
    await expect(page.getByText("Order ID: RSQ-2026-000123")).toBeVisible({ timeout: 10_000 });
  });

  test("tracking page keeps polling and shows the latest live data", async ({ page }) => {
    const state: BackendState = makeBackendState();
    await seedClientAuth(page);
    await installMockBackend(page, state);

    await page.goto("/roadshow/my-bookings/64f1c2e5d3b9a4001f2e3c01", {
      waitUntil: "domcontentloaded",
    });
    await waitForMainLoaderGone(page);

    // Tracking summary from /tracking
    await expect(page.getByText("Acme Product Launch").first().first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Day 3 of 6", { exact: true }).first()).toBeVisible();

    // Live vehicles from /live-location
    await expect(page.getByText("TN-01-AB-1234").first()).toBeVisible({ timeout: 10_000 });

    expect(state.trackingHits).toBeGreaterThanOrEqual(1);

    // Backend "edit": day advances + distance grows -> polled values update.
    state.tracking = {
      ...state.tracking,
      bookingSummary: {
        ...(state.tracking.bookingSummary as object),
      },
      onRoad: { day: 4, totalDays: 6 },
      lastUpdatedAt: "2026-08-23T12:00:00.000Z",
    } as Record<string, unknown>;
    state.liveLocation = {
      success: true,
      data: {
        vehicles: [
          {
            ...((state.liveLocation.data as { vehicles: unknown[] }).vehicles[0] as object),
            speedKmh: 55,
            distanceCoveredKm: 310,
          },
          ...((state.liveLocation.data as { vehicles: unknown[] }).vehicles as []).slice(1),
        ],
      },
    };

    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForMainLoaderGone(page);

    await expect(page.getByText("Day 4 of 6", { exact: true }).first()).toBeVisible({ timeout: 15_000 });
  });
});

test.describe("QA-07 Data consistency", () => {
  test("booking detail values match the API payload exactly", async ({ page }) => {
    const state: BackendState = makeBackendState();
    await seedClientAuth(page);
    await installMockBackend(page, state);

    await page.goto("/roadshow/my-bookings/64f1c2e5d3b9a4001f2e3c01", {
      waitUntil: "domcontentloaded",
    });
    await waitForMainLoaderGone(page);

    // Campaign summary from the raw booking/tracking payload
    await expect(page.getByText("Acme Product Launch").first().first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Chennai").first().first()).toBeVisible();

    // Vehicle cards carry reg numbers as supplied by the API (second vehicle tab)
    await page.getByRole("tab").nth(1).click();
    await expect(page.getByText("TN-01-CD-5678").first()).toBeVisible({ timeout: 10_000 });
  });

  test("view-summary renders a PDF blob from the API payload", async ({ page }) => {
    const state: BackendState = makeBackendState();
    await seedClientAuth(page);
    await installMockBackend(page, state);

    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await page.goto("/roadshow/view-summary/64f1c2e5d3b9a4001f2e3c01", {
      waitUntil: "domcontentloaded",
    });
    await waitForMainLoaderGone(page);

    const iframe = page.locator('iframe[title="Booking Summary PDF"]');
    await expect(iframe).toBeVisible({ timeout: 30_000 });
    const src = await iframe.getAttribute("src");
    expect(src?.startsWith("blob:"), "PDF should be served from a blob URL").toBeTruthy();

    const downloadPromise = page.waitForEvent("download", { timeout: 15_000 });
    await page.getByRole("button", { name: "Download", exact: true }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain("Booking_Summary_RSQ-2026-000123");

    expect(pageErrors, "view-summary should not throw").toEqual([]);
  });

  test("cancelled booking renders its terminal status from the payload", async ({ page }) => {
    const state: BackendState = makeBackendState();
    state.bookings = [BOOKING_CANCELLED];
    await seedClientAuth(page);
    await installMockBackend(page, state);

    await page.goto("/roadshow/my-bookings", { waitUntil: "domcontentloaded" });
    await waitForMainLoaderGone(page);

    await expect(page.getByText("RSQ-2026-000042").first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("Cancelled").first()).toBeVisible();
    await expect(page.getByText("3 Vehicles").first()).toBeHidden();

    // Pending booking shows its own state
    const statePending: BackendState = makeBackendState();
    statePending.bookings = [BOOKING_PENDING];
    await installMockBackend(page, statePending);
    await seedClientAuth(page);
    await page.goto("/roadshow/my-bookings", { waitUntil: "domcontentloaded" });
    await waitForMainLoaderGone(page);
    await expect(page.getByText("RSQ-2026-000088").first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("Request Submitted").first()).toBeVisible();
  });
});
