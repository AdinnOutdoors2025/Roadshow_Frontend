# QA-16 — Production Readiness Report (Client/Public Site)

## Verdict: **NOT READY**

## Exact blockers
1. **`src/BaseUrl.tsx` hardcoded to the live production backend** (`IS_LIVE = true`,
   `https://roadshow-backend.onrender.com`), separate from and undocumented alongside the
   project's actual `NEXT_PUBLIC_API_BASE` convention. This is not itself a user-facing bug —
   the site already runs against production in real deployment — but it means the team has
   **no safe way to test Contact/booking/tracking flows against a mock or staging backend**
   without silently sending real traffic to production. This is a test-infrastructure/process
   risk, not a shipped-feature defect, but it must be resolved before this QA cycle's
   booking/contact/tracking evidence can be trusted for a genuine sign-off.
2. **`/roadshow/view-summary/[id]` PDF generation has no timeout or error fallback.** Confirmed
   reproducible hang past 30s. A real user hitting this path (slow device, slow network, large
   campaign) sees an infinite spinner with no retry/error option. Root cause not yet isolated
   from blocker #1.

## Not blockers (already solid)
- Build/typecheck/lint clean (QA-01).
- 77 unit tests covering pricing, PO-upload validation, vehicle normalization, campaign
  validation, booking status/progress mapping, and tracking-date logic (QA-02).
- All 11 client routes smoke-clean, no console/hydration errors (QA-03).
- Navigation and Contact-form client-side validation functionally correct (QA-04).
- No XSS execution, no cross-customer data leakage, no secret/env leakage in served HTML, no
  stray Authorization header when signed out (QA-11) — observed even against real production
  responses, which is a meaningful signal in its own right.
- No page-level horizontal overflow across 5 viewports × 7 routes once 2 stale test locators
  were corrected (QA-09).
- 9 initial e2e failures triaged down to exactly 2 genuine issues (the two blockers above); the
  other 7 were either dev-server test-run contention (not app bugs) or stale test code (fixed).

## Recommendation
Not a redesign, not a rollback — this is a config/process fix (point `BaseUrl.tsx` at the
documented `NEXT_PUBLIC_API_BASE` pattern, or give test runs an env override) plus one scoped
defensive fix (a timeout + error state around PDF generation). Both are small, targeted
changes; neither requires backend changes. Re-run stages 5–9 and 11–14 once done, then this
can move to READY.
