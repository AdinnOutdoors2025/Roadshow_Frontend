import { defineConfig, devices } from "@playwright/test";

// Playwright owns browser-driven smoke/e2e flows: **/*.e2e.spec.ts under
// tests/module-qa/**. Unit/functional/regex/API-shaped tests live in
// *.test.ts(x) / *.spec.ts(x) and run under Vitest instead — see vitest.config.ts.
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.e2e.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
