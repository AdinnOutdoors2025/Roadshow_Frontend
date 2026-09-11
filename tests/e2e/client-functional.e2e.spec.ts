// QA-04 Functional Testing (client scope) — navigation and Contact-form
// validation. Does not attempt a full valid submission (the date fields are
// a custom calendar widget, not typeable inputs) or any flow that would hit
// a real backend — see QA-04 report for what's covered vs. deferred.
//
// IMPORTANT: every interaction here waits for the main splash loader
// (GlobalRoadshowLoader) to unmount first — see helpers.ts. Clicking before
// then can silently no-op because the loader overlay is still covering the
// page; this was root-caused during this QA pass (see QA-04 report).

import { test, expect } from "@playwright/test";
import { waitForMainLoaderGone } from "./helpers";

test.describe("Navigation", () => {
  test("Contact nav link routes from Home to /roadshow/Contact", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await waitForMainLoaderGone(page);

    await page.getByRole("link", { name: "Contact Us", exact: true }).first().click();
    await expect(page).toHaveURL(/\/roadshow\/Contact$/, { timeout: 10_000 });
  });
});

test.describe("Contact form validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/roadshow/Contact", { waitUntil: "domcontentloaded" });
    await waitForMainLoaderGone(page);
  });

  test("submitting an empty form shows a required-field error, no crash", async ({ page }) => {
    await page.getByRole("button", { name: /submit enquiry/i }).click();
    await expect(page.getByText("Please enter your name.")).toBeVisible({ timeout: 5000 });
  });

  test("an invalid contact number is rejected with a specific message", async ({ page }) => {
    await page.locator('input[name="name"]').fill("Test User");
    await page.locator('input[name="contact"]').fill("123"); // too short
    await page.getByRole("button", { name: /submit enquiry/i }).click();
    await expect(page.getByText("Please enter a valid contact number.")).toBeVisible({ timeout: 5000 });
  });

  test("an invalid email is rejected with a specific message", async ({ page }) => {
    await page.locator('input[name="name"]').fill("Test User");
    await page.locator('input[name="contact"]').fill("9876543210");
    await page.locator('input[name="email"]').fill("not-an-email");
    await page.getByRole("button", { name: /submit enquiry/i }).click();
    await expect(page.getByText("Please enter a valid email address.")).toBeVisible({ timeout: 5000 });
  });

  test("missing campaign dates are rejected once name/contact/email are valid", async ({ page }) => {
    await page.locator('input[name="name"]').fill("Test User");
    await page.locator('input[name="contact"]').fill("9876543210");
    await page.locator('input[name="email"]').fill("test@example.com");
    await page.getByRole("button", { name: /submit enquiry/i }).click();
    await expect(page.getByText("Please select a campaign start date.")).toBeVisible({ timeout: 5000 });
  });

  test("respects the maxLength cap on the name field (regression: FIELD_LIMITS)", async ({ page }) => {
    const longName = "A".repeat(200);
    await page.locator('input[name="name"]').fill(longName);
    const value = await page.locator('input[name="name"]').inputValue();
    expect(value.length).toBeLessThan(200);
  });
});
