// Module QA — [MODULE] User Authentication (task 20260812-user-auth)
// Category: Smoke (real browser, real Next.js dev server, no live backend
// call is made — these checks only exercise client-side routing/guard
// behavior and static page rendering).

import { test, expect } from "@playwright/test";

test.describe("user-auth module smoke", () => {
  // Forced serial within this file only (does not touch the shared
  // playwright.config.ts, which otherwise runs fullyParallel across several
  // workers). Observed flake: with multiple workers hitting a cold Next dev
  // server concurrently, on-demand route compilation for /user-auth/* can
  // serialize inside the dev server and delay a response past the point
  // where a subsequent click races a still-updating DOM, intermittently
  // causing "element not found" on the very next assertion. Serial execution
  // eliminated the flake in repeated local runs; see the QA report.
  test.describe.configure({ mode: "serial" });

  test("unauthenticated visit to /user-auth/dashboard redirects to /user-auth/signin", async ({ page }) => {
    await page.goto("/user-auth/dashboard");
    await page.waitForURL("**/user-auth/signin");
    expect(page.url()).toContain("/user-auth/signin");
  });

  test("unauthenticated visit to /user-auth/admin-panel redirects to /user-auth/signin", async ({ page }) => {
    await page.goto("/user-auth/admin-panel");
    await page.waitForURL("**/user-auth/signin");
    expect(page.url()).toContain("/user-auth/signin");
  });

  test("/user-auth/signin renders the sign-in form", async ({ page }) => {
    await page.goto("/user-auth/signin");
    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
    await expect(page.getByPlaceholder(/username or email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/enter your password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("/user-auth/signup renders the sign-up form", async ({ page }) => {
    await page.goto("/user-auth/signup");
    await expect(page.getByRole("heading", { name: "Create Account" })).toBeVisible();
    await expect(page.getByPlaceholder(/enter your username/i)).toBeVisible();
    await expect(page.getByPlaceholder(/enter your email/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign up/i })).toBeVisible();
  });

  test("sign-in form shows a client-side validation error without any backend call", async ({ page }) => {
    // Block all network calls to the API base so a false-positive "success"
    // is impossible — if the app tried to reach a live backend, this test
    // would hang/fail rather than silently passing against real data.
    await page.route("**/admin", (route) => route.abort());

    await page.goto("/user-auth/signin");
    // Wait for client-side hydration to finish before clicking: Next.js SSRs
    // the button markup immediately, but the onClick/onSubmit handler is
    // only wired up once React hydrates, which — especially on Next dev's
    // first on-demand compile of a route — can lag behind the DOM being
    // "visible". Without this, Playwright's actionability check is satisfied
    // (element is visible) and the click is a no-op click on dead markup.
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByText(/all fields are required/i)).toBeVisible();
  });

  test("sign-up form shows a client-side validation error (password mismatch) without any backend call", async ({ page }) => {
    await page.route("**/register-admin", (route) => route.abort());

    await page.goto("/user-auth/signup");
    await page.waitForLoadState("networkidle"); // see hydration note above
    await page.getByPlaceholder(/enter your username/i).fill("validuser1");
    await page.getByPlaceholder(/enter your email/i).fill("valid@example.com");
    await page.getByPlaceholder(/min 6 chars/i).fill("secret1");
    await page.getByPlaceholder(/re-enter your password/i).fill("different1");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: /sign up/i }).click();

    await expect(page.getByText(/do not match/i)).toBeVisible();
  });

  test("navigating between signin and signup via the footer links works", async ({ page }) => {
    await page.goto("/user-auth/signin");
    await page.getByRole("link", { name: /sign up/i }).click();
    await page.waitForURL("**/user-auth/signup");
    await expect(page.getByRole("heading", { name: "Create Account" })).toBeVisible();

    await page.getByRole("link", { name: /sign in/i }).click();
    await page.waitForURL("**/user-auth/signin");
    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  });
});
