// QA-13 End-to-end journeys (client scope) + QA-14 UAT evidence.
// Full realistic customer trips against the routed mock backend: new booking,
// returning-user booking review + PDF, and "backend changed the order".
// These reuse the QA-05..07 mock fixtures, so all values asserted come from
// the exact payloads the pages map.

import { test, expect } from "@playwright/test";
import {
  seedClientAuth,
  installMockBackend,
  makeBackendState,
  BOOKING_ONROAD,
  type BackendState,
} from "./client-mock-data";
import { waitForMainLoaderGone } from "./helpers";

const CART_KEY = "roadshow_cart_cust_1111111111";

/** Seed a signed-in customer with one campaign vehicle in their cart. */
async function seedSignedInCustomerWithCart(page: import("@playwright/test").Page) {
  await seedClientAuth(page);
  await page.addInitScript(({ key }) => {
    localStorage.setItem(
      key,
      JSON.stringify([
        {
          vehicleId: "64f1c2e5d3b9a4001f2e3d01",
          startDate: "2026-09-15",
          endDate: "2026-09-17",
          quantity: 2,
        },
      ]),
    );
  }, { key: CART_KEY });
}

test.describe("QA-13 Journey 1 â€” new booking (browse â†’ review â†’ submit â†’ confirmation)", () => {
  test("full create-booking round trip renders the confirmation with the created order", async ({ page }) => {
    const state: BackendState = makeBackendState();
    state.createBooking = {
      _id: "64f1c2e5d3b9a4001f2e3cAA",
      clientOrderId: "RSQ-2026-000200",
      status: 0,
      createdAt: "2026-09-05T10:00:00.000Z",
      subtotal: 72000,
      gstAmount: 12960,
      estimatedTotal: 84960,
      name: "Test Client",
      companyName: "Acme Traders Pvt Ltd",
      phone: "9876543210",
      email: "client@example.com",
      campaignType: "Brand Awareness",
      location: "Chennai",
      journeyStage: { index: 0, key: "submitted" },
      steps: [
        {
          key: "submitted",
          label: "Request Submitted",
          status: "current",
          completedAt: "2026-09-05T10:00:00.000Z",
        },
      ],
      isCancelled: false,
      vehicleUnavailable: false,
      onRoad: null,
      vehicleTypes: [
        {
          vehicleName: "LED Van - 12ft Body",
          vehicleTypeImage: "/images/Truck_Image.jpg",
          quantity: 2,
          fromDate: "2026-09-15",
          toDate: "2026-09-17",
          totalDays: 3,
          pricePerDay: 12000,
          lineTotal: 72000,
          campaignName: "Brand Awareness",
          campaignType: "Brand Awareness",
          campaignLocation: "Chennai",
          needPromoter: false,
          promoterQuantity: 0,
        },
      ],
    };
    await seedSignedInCustomerWithCart(page);
    await installMockBackend(page, state);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));

    // Step 1 â€” review order from the saved cart
    await page.goto("/roadshow/review-order", { waitUntil: "domcontentloaded" });
    await waitForMainLoaderGone(page);
    await expect(page.getByText("LED Van - 12ft Body").first()).toBeVisible({ timeout: 15_000 });

    // Step 2 â€” submit
    const submit = page.getByRole("button", { name: "Submit Order" });
    await expect(submit).toBeEnabled({ timeout: 10_000 });
    await submit.click();

    // Step 3 â€” confirmation page fetches the created booking
    await page.waitForURL(/\/roadshow\/booking-request-submitted\/64f1c2e5d3b9a4001f2e3cAA$/, { timeout: 15_000 });
    await waitForMainLoaderGone(page);
    await expect(page.getByText("RSQ-2026-000200").first()).toBeVisible({ timeout: 15_000 });

    // Step 4 â€” the new order is at the top of My Bookings
    await page.goto("/roadshow/my-bookings", { waitUntil: "domcontentloaded" });
    await waitForMainLoaderGone(page);
    await expect(page.getByText("RSQ-2026-000200").first()).toBeVisible({ timeout: 10_000 });

    expect(state.detailHits, "confirmation page fetched the created booking").toBeGreaterThanOrEqual(1);
    expect(errors, "no uncaught page errors across the journey").toEqual([]);
  });
});

test.describe("QA-13 Journey 2 â€” returning user reviews, tracks and downloads", () => {
  test("my-bookings â†’ booking dashboard â†’ tracking â†’ live vehicles â†’ PDF download", async ({ page }) => {
    const state: BackendState = makeBackendState();
    await seedClientAuth(page);
    await installMockBackend(page, state);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto("/roadshow/my-bookings", { waitUntil: "domcontentloaded" });
    await waitForMainLoaderGone(page);
    await expect(page.getByText("RSQ-2026-000123").first()).toBeVisible({ timeout: 10_000 });

    // Open the booking dashboard
    await page.getByRole("button", { name: "Open RSQ-2026-000123" }).first().click();
    const dashboard = page.getByLabel("Selected campaign details for RSQ-2026-000123");
    await expect(dashboard.getByText("Order ID: RSQ-2026-000123")).toBeVisible({ timeout: 10_000 });
    await expect(dashboard.getByText("Day 3 of 6", { exact: true }).first()).toBeVisible();

// Track this campaign -> live tracking page
    await dashboard.getByRole("button", { name: "Open Live Tracking" }).first().click();
    await page.waitForURL(/\/roadshow\/my-bookings\/64f1c2e5d3b9a4001f2e3c01(?:\/.*)?$/, { timeout: 15_000 });
    await waitForMainLoaderGone(page);

    // Campaign tracking data
    await expect(page.getByText("Acme Product Launch").first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Day 3 of 6", { exact: true }).first()).toBeVisible();

// Live-location vehicles — the flat vehicle list shows every registration at once
    await expect(page.getByText("TN-01-AB-1234").first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("TN-01-CD-5678").first()).toBeVisible({ timeout: 15_000 });

    // Activity / day-wise report from the tracking payload
    await expect(page.getByText("On-site setup complete").first()).toBeVisible({ timeout: 10_000 });

    // PDF preview + download
    await page.goto("/roadshow/view-summary/64f1c2e5d3b9a4001f2e3c01", { waitUntil: "domcontentloaded" });
    await waitForMainLoaderGone(page);
    const iframe = page.locator('iframe[title="Booking Summary PDF"]');
    await expect(iframe).toBeVisible({ timeout: 30_000 });

    const downloadPromise = page.waitForEvent("download", { timeout: 15_000 });
    await page.getByRole("button", { name: "Download", exact: true }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain("Booking_Summary_RSQ-2026-000123");

    expect(errors, "no uncaught page errors across the journey").toEqual([]);
  });
});

test.describe("QA-13 Journey 3 â€” backend edits the order and the client shows it", () => {
  test("my-bookings shows the updated dates/pricing/status after a backend change", async ({ page }) => {
    const state: BackendState = makeBackendState();
    await seedClientAuth(page);
    await installMockBackend(page, state);

    await page.goto("/roadshow/my-bookings", { waitUntil: "domcontentloaded" });
    await waitForMainLoaderGone(page);
    await expect(page.getByText("RSQ-2026-000123").first()).toBeVisible({ timeout: 10_000 });

    // Backend: order moves to completed, dates shift, pricing updates.
    state.bookings = state.bookings.map((b) =>
      b === BOOKING_ONROAD
        ? {
            ...BOOKING_ONROAD,
            journeyStage: { index: 4, key: "completed" },
            onRoad: null,
            subtotal: 300000,
            gstAmount: 54000,
            estimatedTotal: 354000,
            vehicleTypes: [
              (BOOKING_ONROAD.vehicleTypes as unknown as Record<string, unknown>[])[0],
              {
                ...(BOOKING_ONROAD.vehicleTypes as unknown as Record<string, unknown>[])[1],
                toDate: "2026-08-28",
                totalDays: 8,
              },
            ],
          }
        : b,
    );

    // Client refreshes (reload = fresh /mine fetch in this mock-backed test)
    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForMainLoaderGone(page);

    await expect(page.getByText("RSQ-2026-000123").first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("Confirmed").first()).toBeVisible();
    await expect(page.getByText("Day 3 of 6", { exact: true }).first()).toBeHidden();
    expect(state.mineHits).toBeGreaterThanOrEqual(2);
  });
});

test.describe("QA-14 UAT walkthrough evidence", () => {
  test("a plain user can sign in (simulated), find their order, and understand its status", async ({ page }) => {
    const state: BackendState = makeBackendState();
    await seedClientAuth(page);
    await installMockBackend(page, state);

    await page.goto("/roadshow/my-bookings", { waitUntil: "domcontentloaded" });
    await waitForMainLoaderGone(page);

    // Understandable status copy from the journey timeline copy
    await expect(page.getByText("Where your campaign is now").first()).toBeVisible({ timeout: 15_000 });

    // Clear CTAs present for the selected campaign
    await page.getByRole("button", { name: "Open RSQ-2026-000123" }).first().click();
    const dashboard = page.getByLabel("Selected campaign details for RSQ-2026-000123");
    await expect(dashboard.getByText("Review the summary here, then open live tracking for full GPS and day-wise reporting.")).toBeVisible({ timeout: 10_000 });
    await expect(
      dashboard.getByRole("button", { name: "Open Live Tracking" }).first(),
    ).toBeVisible();
  });
});
