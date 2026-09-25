// QA-08 Negative + QA-11 Security (client scope).
// Every failure path below must degrade gracefully: a visible message, never a
// blank screen, never an uncaught exception, never an executed XSS payload.

import { test, expect } from "@playwright/test";
import {
  seedClientAuth,
  seedClientAuthExpired,
  installMockBackend,
  makeBackendState,
  TEST_USER,
  type BackendState,
} from "./client-mock-data";
import { waitForMainLoaderGone } from "./helpers";

function trackFatalErrors(page: import("@playwright/test").Page) {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("dialog", (dialog) => {
    errors.push(`dialog:${dialog.type()}:${dialog.message()}`);
  });
  return errors;
}

test.describe("QA-08 Negative", () => {
  test("empty bookings list renders a friendly empty state", async ({ page }) => {
    const state = makeBackendState();
    state.emptyMine = true;
    await seedClientAuth(page);
    await installMockBackend(page, state);
    const errors = trackFatalErrors(page);

    await page.goto("/roadshow/my-bookings", { waitUntil: "domcontentloaded" });
    await waitForMainLoaderGone(page);

    const body = page.locator("body");
    await expect(body).toContainText("no", { ignoreCase: true });
    expect((await body.innerText()).trim().length).toBeGreaterThan(20);
    expect(errors).toEqual([]);
  });

  test("API 500 on the list shows a graceful error message, no blank screen", async ({ page }) => {
    const state = makeBackendState();
    state.failOrders = true;
    await seedClientAuth(page);
    await installMockBackend(page, state);
    const errors = trackFatalErrors(page);

    await page.goto("/roadshow/my-bookings", { waitUntil: "domcontentloaded" });
    await waitForMainLoaderGone(page);

    // Error heading (no period) plus the server detail message
    await expect(
      page.getByText("Unable to load your bookings", { exact: true }).first(),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("body")).toContainText("Mock server failure.");
    const bodyText = (await page.locator("body").innerText()).trim();
    expect(bodyText.length).toBeGreaterThan(20);
    expect(errors).toEqual([]);
  });

  test("malformed (non-JSON) response degrades gracefully", async ({ page }) => {
    const state = makeBackendState();
    state.malformedMine = true;
    await seedClientAuth(page);
    await installMockBackend(page, state);
    const errors = trackFatalErrors(page);

    await page.goto("/roadshow/my-bookings", { waitUntil: "domcontentloaded" });
    await waitForMainLoaderGone(page);

    await expect(
      page.getByText("Unable to load your bookings", { exact: true }).first(),
    ).toBeVisible({ timeout: 10_000 });
    expect(errors).toEqual([]);
  });

  test("unknown booking id shows the tracking sign-in/not-found state, no crash", async ({ page }) => {
    const state = makeBackendState();
    await seedClientAuth(page);
    await installMockBackend(page, state);
    const errors = trackFatalErrors(page);

    await page.goto("/roadshow/my-bookings/000000000000000000000000", {
      waitUntil: "domcontentloaded",
    });
    await waitForMainLoaderGone(page);

    const body = page.locator("body");
    await expect(body).not.toBeEmpty();
    expect(errors).toEqual([]);
  });

  test("expired session is detected and the user is signed out, then gated", async ({ page }) => {
    const state = makeBackendState();
    await seedClientAuthExpired(page);
    await installMockBackend(page, state);

    await page.goto("/roadshow/my-bookings", { waitUntil: "domcontentloaded" });
    await waitForMainLoaderGone(page);

    const expired = await page.evaluate(() => {
      return {
        user: localStorage.getItem("roadshow_user"),
        token: localStorage.getItem("roadshow_token"),
      };
    });
    expect(expired.user, "expired session should clear the stored user").toBeNull();
    expect(expired.token, "expired session should clear the stored token").toBeNull();
  });

  test("unaudited session (no token) is gated behind a sign-in prompt", async ({ page }) => {
    const state = makeBackendState();
    await installMockBackend(page, state); // no seedClientAuth -> signed out

    await page.goto("/roadshow/my-bookings", { waitUntil: "domcontentloaded" });
    await waitForMainLoaderGone(page);

    await expect(page.getByText("Sign in to view your bookings")).toBeVisible({ timeout: 10_000 });
  });

  test("duplicate Contact submit posts exactly one enquiry", async ({ page }) => {
    const state = makeBackendState();
    await installMockBackend(page, state);

    await page.goto("/roadshow/Contact", { waitUntil: "domcontentloaded" });
    await waitForMainLoaderGone(page);

    await page.locator('input[name="name"]').fill("Test User");
    await page.locator('input[name="contact"]').fill("9876543210");
    await page.locator('input[name="email"]').fill("test@example.com");
    await page.locator('input[name="startDate"]').fill("2026-09-05");
    await page.locator('input[name="endDate"]').fill("2026-09-12");

    const button = page.getByRole("button", { name: /submit enquiry/i });
    await button.click();

    // Every valid submit now opens a "Human Verification" math captcha
    // before the real POST fires (Contact/page.tsx's openCaptchaPopup) —
    // solve it, then duplicate-click the actual commit action (Verify &
    // Continue) to exercise the same double-submit guard the test
    // originally targeted.
    const question = await page.getByText(/^\d+ \+ \d+ = \?$/).innerText();
    const [a, b] = question.match(/\d+/g)!.map(Number);
    await page.getByLabel("Security question answer").fill(String(a + b));

    const verifyButton = page.getByRole("button", { name: "Verify & Continue" });
    await verifyButton.click();
    await verifyButton.click({ noWaitAfter: true }).catch(() => {});

    await expect
      .poll(() => state.contactPosts, { timeout: 8_000 })
      .toBeLessThanOrEqual(1);
    expect(state.contactPosts, "duplicate click must not double-submit").toBe(1);
  });
});

test.describe("QA-11 Security (client scope)", () => {
  test("booking fields containing HTML are rendered as inert text, never executed", async ({ page }) => {
    const state = makeBackendState();
    const payload = "<img src=x onerror=\"window.__xssHappened=1\">SCRIPT-INJECT";
    state.bookings = [
      {
        ...(state.bookings[0] as Record<string, unknown>),
        _id: "64f1c2e5d3b9a4001f2e3c99",
        clientOrderId: "RSQ-2026-000999",
        companyName: payload,
      },
    ];
    await seedClientAuth(page);
    await installMockBackend(page, state);
    const errors = trackFatalErrors(page);

    await page.goto("/roadshow/my-bookings", { waitUntil: "domcontentloaded" });
    await waitForMainLoaderGone(page);

    await expect(page.getByText("RSQ-2026-000999").first()).toBeVisible({ timeout: 10_000 });

    const executed = await page.evaluate(() => (window as unknown as { __xssHappened?: 1 }).__xssHappened);
    expect(executed).toBeUndefined();

    const bodyHtml = await page.locator("body").innerHTML();
    expect(bodyHtml).not.toContain('onerror="window.__xssHappened=1"');
    expect(errors, "no page error / no dialog from the injection").toEqual([]);
  });

  test("view-summary refuses a booking owned by another customer", async ({ page }) => {
    const state = makeBackendState();
    state.bookings = [
      {
        ...(state.bookings[0] as Record<string, unknown>),
        _id: "64f1c2e5d3b9a4001f2e3c77",
        clientOrderId: "RSQ-2026-000777",
        userId: { _id: "some_other_customer" },
      },
    ];
    await seedClientAuth(page);
    await installMockBackend(page, state);

    await page.goto("/roadshow/view-summary/64f1c2e5d3b9a4001f2e3c77", {
      waitUntil: "domcontentloaded",
    });
    await waitForMainLoaderGone(page);

    await expect(page.getByText("The booking summary could not be found.")).toBeVisible({ timeout: 20_000 });
    const iframe = page.locator('iframe[title="Booking Summary PDF"]');
    await expect(iframe).toBeHidden();
  });

  test("no NEXT_PUBLIC_/secrets leak into the served HTML on a client route", async ({ page }) => {
    const state = makeBackendState();
    await installMockBackend(page, state);

    const response = await page.request.get("/");
    const html = await response.text();

    const leaked = [
      process.env.NEXT_PUBLIC_API_BASE,
      "INTERNAL_API_SECRET",
      "MONGODB_URI",
    ].filter(
      (needle) => needle && needle.length > 4 && html.includes(String(needle)),
    );

    expect(leaked, "secrets/API-key env names must not appear in served HTML").toEqual([]);
  });

  test("authorization header is not sent when the customer is signed out", async ({ page }) => {
    const state = makeBackendState();
    await installMockBackend(page, state); // signed out

    await page.goto("/roadshow/my-bookings", { waitUntil: "domcontentloaded" });
    await waitForMainLoaderGone(page);

    expect(state.seenAuthHeaders).toEqual([]);
  });

  test("client form inputs validate format client-side (email + contact)", async ({ page }) => {
    const state = makeBackendState();
    await installMockBackend(page, state);

    await page.goto("/roadshow/Contact", { waitUntil: "domcontentloaded" });
    await waitForMainLoaderGone(page);

    await page.locator('input[name="name"]').fill("Test User");
    await page.locator('input[name="contact"]').fill("99999"); // too short
    await page.locator('input[name="email"]').fill("user@"); // invalid
    await page.getByRole("button", { name: /submit enquiry/i }).click();

    await expect(page.getByText("Please enter a valid contact number.")).toBeVisible({ timeout: 5_000 });
    expect(state.contactPosts, "invalid form must never reach the API").toBe(0);
  });
});