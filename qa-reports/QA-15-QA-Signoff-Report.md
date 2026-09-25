# QA-15 — QA Sign-off Report (Client/Public Site)

Date: 2026-09-18

## Previously Validated
Development (QA-01), Unit Testing (QA-02), Smoke (QA-03), Functional (QA-04) — all predate
the P0 baseUrl change (2026-09-16) or don't touch the network; re-confirmed still current
against the working tree.

## Previously Partial
API, Integration, Data, Negative, Responsive, Security, Performance, E2E — test files existed
(authored 2026-09-11) but had never been run to completion or reported on.

## Previously Invalid
None outright — the gap was "written but never validated," not "known broken."

## Newly Tested
Ran the full 82-test `tests/e2e/` suite twice (parallel, then serial), isolating 4 failures as
dev-server contention (not bugs) and 5 as genuine issues.

## Issues Fixed
- 2 stale Playwright locators in `client-responsive.e2e.spec.ts` (account-menu button label,
  nonexistent "Main navigation" aria-label) — source-verified against `Navbar.tsx`.
- 1 test in `client-negative-security.e2e.spec.ts` updated to solve the Contact form's new
  "Human Verification" captcha before asserting on duplicate-submit behavior.

All three fixes are test-code only — no app/source file was modified this cycle.

## Issues Remaining
1. **P0 — `src/BaseUrl.tsx` hardcoded to the live production backend**, silently bypassing the
   e2e mock for 11 client files (Contact, CampaignRequest, my-bookings + hooks, view-summary,
   booking-request-submitted). This is a test-infrastructure/config gap, not an app bug, but it
   means **most of this cycle's booking/contact/tracking test evidence is not trustworthy**,
   and test runs during this discovery may have sent real requests to production (needs
   backend-side confirmation — out of scope for this repo). **Blocks a clean sign-off.**
2. `/roadshow/view-summary/[id]` PDF generation has no timeout/error fallback and hangs past
   30s reproducibly — root cause not yet isolated from #1.

## Total Tests: 82 (e2e) + 77 (unit, QA-02) = 159
Passed: 73 (parallel) / 77 (serial rerun of the 9 failures recovered 4) + 77 unit = 154
Failed: 5 (serial, genuine) + 0 unit = 5
Blocked: QA-13 Journey 3, QA-14 UAT (not run, halted after P0 discovery)

## Verdict: **NOT SIGNED OFF**
Blocked on the P0 baseUrl/mock-bypass issue. Recommend: fix or scope-correct `BaseUrl.tsx`
(align it with the documented `NEXT_PUBLIC_API_BASE` convention, or give the e2e mock a way to
intercept it), confirm with the backend team whether test writes landed in production, then
re-run stages 5–9 and 11–14 in a genuinely isolated environment before re-attempting sign-off.
