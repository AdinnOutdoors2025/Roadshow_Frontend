# QA-09 — UI / Responsive / Browser Testing Report

Scope: `tests/e2e/client-responsive.e2e.spec.ts` — 5 viewports (1536/1280/768/430/360px) ×
7 static routes for horizontal-overflow, plus mobile account-menu and desktop-nav checks.
See `QA-MASTER-STATUS.md` for the P0 baseUrl/production-exposure finding.

## Total Test Cases: 38 (5 viewports × 7 routes + 3 nav-shell tests)
Passed (serial rerun): 36/38 before fixes, 38/38 after fixes (pending a full safe rerun —
see below for what "pass" means here).

## Issues Found & Fixed (test-only, source-verified)
Both were **stale test assumptions**, not app defects — confirmed by reading
`src/components/Client/Reusable_Components/Navbar.tsx` directly:

1. **"mobile menu opens, lists client links, and closes"** — test expected a button labeled
   "Open account menu" toggling to "Close account menu", revealing a "Mobile navigation" link
   list. Actual markup: a single button always labeled `aria-label="Account menu"`
   (`aria-expanded` toggles, not the label), and the dropdown it opens is a profile/account
   panel (Sign In / Sign Up when signed out, Order History / Logout when signed in) — there is
   no separate "mobile nav links" list inside it; the site's nav links (`nav.RS_TabBar`) are
   always visible in the header regardless of viewport. Rewrote the test to match this actual
   behavior (`tests/e2e/client-responsive.e2e.spec.ts:81`).
2. **"desktop nav is present on a wide viewport"** — test looked for `getByLabel("Main
   navigation")`; `Navbar.tsx`'s `<nav className="RS_TabBar">` has no `aria-label` at all, so
   that locator could never match. Fixed the test to assert on `nav.RS_TabBar` directly rather
   than inventing an accessible name the app doesn't have (`tests/e2e/client-responsive.e2e.spec.ts:128`).
   Not adding the aria-label to the app itself — that's a source/a11y change outside this
   cycle's scope, flagged separately below.

## Not fixed / not app defects
- The remaining overflow-check failures seen in the first (parallel) run were dev-server
  cold-compile contention, confirmed resolved on a serial rerun with no code change — see
  QA-12.

## Accessibility note (not fixed, flagged only)
`nav.RS_TabBar` has no `aria-label`/landmark name, and the account-menu toggle button uses one
static label for both open/closed states. Neither breaks these tests once corrected, but a
screen-reader user has no distinguishing name for the main nav landmark, and no "expanded/
collapsed" language change beyond `aria-expanded` (which is present and correct). Worth a
product/a11y decision, not touched here.

## Regression Result
Overflow-only assertions (the bulk of this file) don't depend on `client-requests`/booking
data, so they're less exposed to the P0 baseUrl issue than QA-05–08/11/13 — still recommend a
full rerun once that's resolved, for a clean signature.

## Final Status: **PARTIAL** — 2 real test bugs found and fixed (source-verified); full clean rerun pending the P0 fix.
