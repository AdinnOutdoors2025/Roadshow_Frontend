# QA-04 — Functional Testing Report (Client/Public Site Only)

Testing Stage: Functional Testing
Date: 2026-09-07
Scope: Navigation and Contact-form validation via Playwright against `npm run dev`, no live backend. Vehicle-selection/campaign-details/review-order/booking-submission flows are **not** exercised end-to-end this stage — see "Deferred" below for why.

## Total Test Cases: 6 (new, in `tests/e2e/client-functional.e2e.spec.ts`)
Passed: 6
Failed: 0 (2 initially failed during authoring, both root-caused and fixed — see below)
Blocked: 0
Fixed: 2
Retested: 18/18 (full `tests/e2e/` suite: 6 functional + 12 smoke, rerun together)

## Issues Found & Fixed

### 1. Test bug: wrong nav-link accessible name
**Test Case**: Click the "Contact" nav link from Home, expect navigation to `/roadshow/Contact`.
**Expected**: Link matches on accessible name "Contact".
**Actual**: Timeout — no link named exactly "Contact" exists; the real link (in the footer/header contact CTA) is named "Contact Us".
**Severity**: Low (test-only, not an app defect).
**Root Cause**: Incorrect assumption about the nav link's text when writing the test.
**File**: [tests/e2e/client-functional.e2e.spec.ts](../tests/e2e/client-functional.e2e.spec.ts)
**Fix**: Changed the locator to `getByRole("link", { name: "Contact Us", exact: true })`.
**Retest**: Passes.
**Regression**: None — test-only change.

### 2. Flaky clicks in the first ~2.5s after any client-route navigation (root-caused, not fixed — by design)
**Test Case**: Submit the Contact form (empty, or with invalid fields) shortly after page load.
**Expected**: Client-side validation toast appears.
**Actual**: Intermittently no toast at all — `handleSubmit` never appeared to run (confirmed via temporary instrumentation: `console.log` inside `handleSubmit` didn't fire on a "failed" click, but calling `form.requestSubmit()` directly always worked).
**Root Cause**: **Not a bug.** `GlobalRoadshowLoader.tsx` defines `MAIN_MIN_VISIBLE_MS = 2500` — the splash/loader overlay is guaranteed to cover the page for at least 2.5s on every first navigation in a session (which every fresh Playwright browser context is), and genuinely intercepts pointer input until it unmounts. A fixed `waitForTimeout(1000)` in the test was clicking through the loader. This is intentional loader behavior (matches the codebase's own documented pattern, `MAIN_LOADER_DONE_EVENT`) — not touched, per the "don't change loaders" rule.
**File**: `src/components/GlobalRoadshowLoader.tsx` (read-only, not modified) / test files (fixed).
**Fix**: Added [tests/e2e/helpers.ts](../tests/e2e/helpers.ts) — `waitForMainLoaderGone(page)` polls for `[data-roadshow-loader-mode]` to leave the DOM instead of a fixed sleep, and both `client-functional.e2e.spec.ts` and `client-smoke.e2e.spec.ts` now use it before any interaction/assertion.
**Retest**: 5/5 clean runs after the fix (previously 0/5 at 1000ms wait, 4/5 at a fixed 2500ms wait — the polling wait is what made it fully reliable, since fixed sleeps can't account for a slower CI machine or a slightly longer fade-out).
**Regression**: None — test-only change. **Note for the wider team**: a real user who tries to interact within the first ~2.5s of landing on the site (e.g., double-tapping, or Tab+Enter immediately) would see the same "click doesn't register" behavior the loader intentionally causes. That's expected given the loader's purpose, but flagging it here in case the 2.5s minimum is worth revisiting for accessibility (a keyboard/switch-device user has no visual cue that input is being ignored) — **not changed**, since it's explicitly protected UI behavior; raising for product/design awareness only.

## What was tested (all passing)
- **Navigation**: Home → Contact via the "Contact Us" link resolves to `/roadshow/Contact`.
- **Contact form validation** (`validateForm()` in `Contact/page.tsx`, matching the regexes already unit-tested in QA-02):
  - Empty submit → "Please enter your name."
  - Name filled, invalid contact (`"123"`) → "Please enter a valid contact number."
  - Valid name/contact, invalid email → "Please enter a valid email address."
  - Valid name/contact/email, no dates → "Please select a campaign start date."
  - `maxLength` on the name field caps input length client-side (FIELD_LIMITS regression guard).

## Deferred (not tested this stage — documented, not silently skipped)
- **Campaign Request / campaign-details / review-order full flow** (vehicle selection → dates → promoter → submit): the campaign date fields use a native `<input type="date">` behind a custom button trigger in Contact's own form, but CampaignRequest/campaign-details use a bespoke calendar widget (`@/components/calendar/calendar_reusable/calender`) that isn't reliably drivable via simple `fill()`. Automating it safely needs its own investigation pass rather than guessed selectors.
- **Real booking submission**: `src/BaseUrl.tsx`'s `baseUrl` is hardcoded to `http://localhost:3001`, which has no server running in this environment — any full "Submit" action fails at the network layer (by design of this test environment, not a defect; see QA-01/QA-08 for the graceful-failure angle). No local backend was started to test a real success path, since the backend repo's own `.env` points at a live, shared MongoDB cluster (per QA-01's addendum) — starting it would risk writing to production data. This is a hard blocker for true end-to-end functional testing in this environment, not something fixable from the frontend repo alone.
- **My Bookings / Tracking / PDF functional interactions** requiring real booking data: blocked for the same backend-availability reason. Covered at the smoke level (QA-03: pages load, no blank/crash state) and at the unit level (QA-02: status/progress/date logic tested directly).

## Regression Result
Full `tests/e2e/` suite (18 tests: 6 functional + 12 smoke) passes cleanly together. No app source code was changed this stage (only the two debug `console.log` lines temporarily added to `Contact/page.tsx` during root-cause investigation were added and then fully reverted — confirmed via diff before finishing).

## Final Status: **PASS** (with two real, non-blocking findings documented above; core client-side functional booking/tracking flows remain blocked on backend availability, not on any code defect found)
