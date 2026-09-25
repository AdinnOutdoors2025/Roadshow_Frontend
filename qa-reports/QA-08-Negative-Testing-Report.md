# QA-08 — Negative Testing Report

Scope: `tests/e2e/client-negative-security.e2e.spec.ts`, `test.describe("QA-08 Negative")`.
See `QA-MASTER-STATUS.md` for the P0 baseUrl/production-exposure finding this report depends on.

## Total Test Cases: 5
- API 500 on bookings list → graceful error, no blank screen: **passed**.
- Malformed (non-JSON) response → graceful degrade: **passed**.
- Unknown booking id → no crash: **passed**.
- Expired session → signed out + gated: **passed**.
- Unauthenticated → sign-in prompt: **passed**.
- Duplicate Contact submit → exactly one enquiry posted: **failed**, then **fixed as a test**,
  still failing (see below).

## Issue Found & Fixed (test-only)
**Test bug**: the test predated the Contact form's "Human Verification" math-captcha gate
(`openCaptchaPopup()` in `src/app/roadshow/Contact/page.tsx`, added after 2026-09-07) — every
valid submit now opens that dialog before any POST fires. The old test clicked "Submit
enquiry" twice and expected a POST guard; with the captcha in the way, `state.contactPosts`
never left 0 because no POST was ever attempted.
**Fix**: updated the test to solve the captcha (parse the "`N + M = ?`" question, fill the
answer, click "Verify & Continue") before checking the duplicate-click guard, and moved the
duplicate-click assertion to the actual commit action (Verify & Continue is the real trigger
now, not the initial Submit click). File: `tests/e2e/client-negative-security.e2e.spec.ts:122`.
Source-verified against `Contact/page.tsx`'s `handleSubmit`/`openCaptchaPopup`/
`handleCaptchaVerification` — captcha logic, labels, and button text confirmed by reading the
component, not guessed.

## Why it's still red after the fix
Root-caused via debug instrumentation (added, verified, then reverted — no app code touched):
the captcha solves correctly and the dialog closes, but `state.contactPosts` never increments
— because `Contact/page.tsx` posts through `baseUrl` (production, not `localhost:3001`), so
the mock's `/contact-enquiry` handler is never hit. **This is exactly how the P0 finding in
QA-MASTER-STATUS.md was discovered** — the debug run confirmed a real network round-trip was
happening outside the mock. This means earlier test executions of this same test (if any, post
2026-09-16) likely sent real fake enquiries to the live production `contact-enquiry` endpoint.

## Regression Result
The other 5 tests in this file are unaffected by the captcha and remain valid at the
smoke/graceful-degradation level, though their underlying data still isn't provably from the
mock (same P0 caveat).

## Final Status: **PARTIAL** — test fix is correct and source-verified; full pass blocked on the P0 baseUrl fix, not on remaining test-code issues.
