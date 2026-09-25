# QA Master Status — Client/Public Site

Last updated: 2026-09-18
Scope: `/`, `/roadshow/*` only. `/admin/*` untouched.

## 🔴 P0 blocker (read this first)

`src/BaseUrl.tsx` (`baseUrl`, `IS_LIVE = true`, committed 2026-09-16) is hardcoded to the
**live production backend** (`https://roadshow-backend.onrender.com`) — a separate constant
from the documented `NEXT_PUBLIC_API_BASE`/`baseurl.js`. It is imported by 11 client files:
Contact, CampaignRequest, my-bookings (+ its tracking/live-location/route/vehicle-history
hooks), view-summary, booking-request-submitted, WhatsAppFloatButton.

The e2e mock backend (`tests/e2e/client-mock-data.ts`) only intercepts `localhost:3001`.
Since `baseUrl` now points elsewhere, **every fetch from those 11 files bypasses the mock
and hits the live production API for real** — GETs return whatever production actually has
(not the test fixtures), and POSTs (Contact enquiry, booking creation) are real writes.

QA-04 (2026-09-07) correctly documented `baseUrl` as `http://localhost:3001` (no server
running, safe) — that was true then. It changed 9 days later; nothing re-flagged it.
Test files under `tests/e2e/` were authored 2026-09-11 (before the change), so their
original authoring intent (safe, mocked) is sound — the drift happened after.

**Action taken this cycle:** stopped all further Playwright execution against this `baseUrl`
per explicit user decision. Vehicle-catalog-only endpoints (`api/getNewVehicles`,
`api/vehicle-types`, `packages/`, `admin/campaign-types`) go through `NEXT_PUBLIC_API_BASE`
instead and **were** genuinely mocked/safe — those results stand.

**Not yet done (needs owner decision, not a frontend-only fix):** confirm with the backend
team whether test data landed in production (search for `contact-enquiry` documents with
`userName: "Test User"` / `test@example.com`, or `client-requests` created 2026-09-17/18
around this QA cycle's run times), and decide the fix (env-driven `BaseUrl.tsx`, or point it
at `NEXT_PUBLIC_API_BASE`, or give the e2e mock a way to intercept the live host during
test runs). Flagging only — no source change made without a separate decision.

## Stage status

```
Development       VALID     — QA-01, re-validity reconfirmed, unaffected by the baseUrl issue
Unit Testing       VALID     — QA-02, 77 tests, pure-function/no-network scope
Smoke Testing      VALID     — QA-03, predates the baseUrl change (2026-09-05), safe at the time
Functional         VALID     — QA-04, predates the baseUrl change, safe at the time
API                PARTIAL   — QA-05: vehicle-catalog checks VALID; booking/contact-dependent checks INVALID (hit prod)
Integration        PARTIAL   — QA-06: written correctly, evidence INVALID (hit prod), needs safe rerun
Database/Data      PARTIAL   — QA-07: same as above; PDF-hang finding needs re-verification in a safe env
Negative           PARTIAL   — QA-08: 1 test fixed (captcha handling), evidence INVALID pending safe rerun
UI/Responsive      PARTIAL   — QA-09: 2 stale locators fixed and source-verified; full evidence needs safe rerun
Regression         PENDING   — blocked on the P0 fix; can't trust a regression pass while baseUrl is live
Security           PARTIAL   — QA-11: XSS/ownership tests exist but ran against live data, not the seeded fixture
Performance         PARTIAL   — QA-12: dev-server parallel-run flakiness confirmed (not a bug); PDF-hang needs re-test isolated from the baseUrl issue
E2E                PARTIAL   — QA-13: Journey 1 passes serially; Journey 2 blocked by the same PDF issue; all evidence needs a safe rerun
UAT                PENDING   — depends on E2E stage above
QA Sign-off        BLOCKED   — see QA-15
Production         NOT READY — see QA-16
```

## Summary vs. prior cycle

- **Previously validated (accepted, not re-run):** Development, Unit, Smoke, Functional.
- **Previously partial (test files existed, never reported):** API, Integration, Data, Negative,
  Responsive, Security, Performance, E2E.
- **Newly tested this cycle:** ran the full `tests/e2e/` suite (82 tests) twice (parallel, then
  serial to isolate flakiness) and found the baseUrl issue mid-investigation.
- **Issues fixed:** 2 stale Playwright locators (`tests/e2e/client-responsive.e2e.spec.ts`),
  1 test not handling the new Contact-form captcha (`tests/e2e/client-negative-security.e2e.spec.ts`).
  All test-file-only, source-verified against current `Navbar.tsx`/`Contact/page.tsx` — no app code touched.
- **Issues found, not fixed (need an owner decision):**
  1. **P0** — `BaseUrl.tsx` hardcoded to production, silently defeats the e2e mock (see above).
  2. `/roadshow/view-summary/[id]` PDF generation hangs past 30s with no timeout/error fallback —
     confirmed twice, but root cause is now confounded by #1 (may be html2canvas perf, may be a
     slow/CORS-blocked call to production instead of the mock) — needs re-test in a safe env.
- **Issues remaining:** both items above, plus a full safe rerun of stages 5–9, 11–14 once #1 is resolved.
