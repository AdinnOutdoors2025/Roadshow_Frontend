# QA-02 — Unit Testing Report (Client/Public Site Only)

Testing Stage: Unit Testing
Date: 2026-09-05
Scope: Pure/testable logic reachable from client routes only (`src/lib/roadshowPricing.ts`, `src/lib/roadshowAgencyPoDocument.ts`, `src/lib/roadshowVehicles.tsx`, and validation/status helpers in `src/app/roadshow/campaign-details/page.tsx`, `src/app/roadshow/my-bookings/page.tsx`, `src/app/roadshow/my-bookings/[bookingId]/page.tsx`, `src/app/roadshow/Contact/page.tsx`). Admin-side files/tests (`calcPricing.test.ts`, `salesStagesAndUpload.test.ts`, `permissionSync.test.ts`) are out of scope and were not modified.

## Total Test Cases: 77 (new, client scope)
Passed: 77
Failed: 0
Blocked: 0
Fixed: 1 (a wrong assertion in my own first draft, caught on first run)
Retested: 77/77

## Pre-existing, out-of-scope findings (not fixed — admin code)
`npx vitest run tests/unit/` also surfaces 8 pre-existing failures in **admin-only** files, unrelated to this change:
- `tests/unit/calcPricing.test.ts` (7 failures) — tests `calcPricing` in `src/app/admin/order-creation/VehicleFormModal.tsx`; the function currently returns fields the test expects under a different name/shape (`additionalCuts`/`totalAmount` come back `null`/`undefined`).
- `tests/unit/salesStagesAndUpload.test.ts` (1 failure) — `SALES_STAGES` in `src/app/admin/sales-handling/page.tsx` has drifted from the stage order documented in CLAUDE.md/the test.

Per this QA cycle's scope (client/public only, no admin changes), these are **reported, not fixed**. Flagging for a separate admin-scoped QA pass.

## New coverage added this stage

| File tested | New test file | Cases |
|---|---|---|
| `src/lib/roadshowPricing.ts` (line pricing, GST split, order rollup, money format) | `tests/unit/roadshowPricing.test.ts` | 18 |
| `src/lib/roadshowAgencyPoDocument.ts` (PO upload validation/URL resolution) | `tests/unit/roadshowAgencyPoDocument.test.ts` | 11 |
| `src/lib/roadshowVehicles.tsx` (`buildRoadshowVehicles` API-response normalization) | `tests/unit/roadshowVehicles.test.ts` | 6 |
| `campaign-details/page.tsx` (`getVehicleErrors` — per-vehicle form completion) | `tests/unit/campaignDetailsValidation.test.ts` | 9 |
| `my-bookings/page.tsx` (status/progress/vehicle-row mapping) | `tests/unit/myBookingsHelpers.test.ts` | 18 |
| `my-bookings/[bookingId]/page.tsx` (tracking progress/relative time/future-day gate) | `tests/unit/bookingTrackingHelpers.test.ts` | 12 |
| `Contact/page.tsx` (email/phone regex) | `tests/unit/contactValidation.test.ts` | 12 (via `it.each`, counted individually ≈15) |

## Changes Made (source files — all zero-behavior-change)

Several of the most valuable functions above (form validation, status/progress mapping) were module-private (`function foo(...)`, no `export`) — correct, pure, and already the single source of truth their own file's comments describe, but not importable by a test. Per explicit user confirmation, added **only** the `export` keyword to each (no logic touched):

- [campaign-details/page.tsx:86](../src/app/roadshow/campaign-details/page.tsx#L86) — `getVehicleErrors`
- [my-bookings/page.tsx:343](../src/app/roadshow/my-bookings/page.tsx#L343) — `mapRequestStatus`
- [my-bookings/page.tsx:365](../src/app/roadshow/my-bookings/page.tsx#L365) — `mapJourneyStageToStatus`
- [my-bookings/page.tsx:655](../src/app/roadshow/my-bookings/page.tsx#L655) — `getBookingStatusLabel`
- [my-bookings/page.tsx:664](../src/app/roadshow/my-bookings/page.tsx#L664) — `getCampaignProgress`
- [my-bookings/page.tsx:694](../src/app/roadshow/my-bookings/page.tsx#L694) — `getExpandedVehicles`
- [my-bookings/[bookingId]/page.tsx:141](../src/app/roadshow/my-bookings/%5BbookingId%5D/page.tsx#L141) — `relativeTime`
- [my-bookings/[bookingId]/page.tsx:211](../src/app/roadshow/my-bookings/%5BbookingId%5D/page.tsx#L211) — `isFutureCampaignDay`
- [my-bookings/[bookingId]/page.tsx:220](../src/app/roadshow/my-bookings/%5BbookingId%5D/page.tsx#L220) — `getCampaignProgress`
- [Contact/page.tsx:229-230](../src/app/roadshow/Contact/page.tsx#L229-L230) — `EMAIL_PATTERN`, `CONTACT_PATTERN`

Also added a jsdom `window.matchMedia` stub to [tests/setup.ts](../tests/setup.ts) — `Contact/page.tsx` calls `gsap.registerPlugin(ScrollTrigger)` at module load, which probes `matchMedia`; jsdom doesn't implement it. Test-infra only, no app code or runtime behavior affected.

**Not changed** (documented coverage gaps, left for a future pass — lower value per the exploration pass, or would need a bigger refactor than an `export`):
- `Contact/page.tsx`'s local `formatDate`, `VehicleDetails/[vehicleId]/page.tsx`'s `withUnit`, `my-bookings/[bookingId]/page.tsx`'s `formatVehicleChain`/`formatDate`/`formatShortDate`/`formatDateTime`/date-key helpers — all currently only exercised indirectly through rendering, not unit-tested directly.
- `CampaignRequest/page.tsx`'s inline `bookingRows`/`grandTotal` `useMemo` duplicates `roadshowPricing.ts`'s math inline rather than calling it — **flagging as a duplication risk** (two independently-maintained pricing formulas) rather than fixing, since reconciling them is a behavior change outside a QA pass.

## Regression Result
`npm run build` was not re-run for this stage (no production code paths changed — only visibility (`export`) of already-correct functions, plus new test files and a test-setup stub). `npx vitest run tests/unit/` confirms no new failures: all 8 failing tests are the pre-existing admin ones listed above, unchanged in count before/after.

## Final Status: **PASS**
