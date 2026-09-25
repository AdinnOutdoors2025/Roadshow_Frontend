# QA-05 — Client API Testing Report

Scope: `tests/e2e/client-api-data.e2e.spec.ts`, `test.describe("QA-05 Client API mapping")`.
See `QA-MASTER-STATUS.md` for the P0 baseUrl/production-exposure finding this report depends on.

## Total Test Cases: 5 (pre-existing, authored 2026-09-11)
Passed (this cycle's runs): 5/5
Trustworthy: **2/5** (vehicle-catalog only)

## What's genuinely valid
- "vehicles catalog endpoint renders on the vehicles page" and the vehicle-types/package
  checks: these hit `api/getNewVehicles`/`api/vehicle-types` via `NEXT_PUBLIC_API_BASE`,
  which **is** routed to `localhost:3001` and **is** intercepted by
  `tests/e2e/client-mock-data.ts`. Assertions match the mock fixtures exactly
  (`VEHICLE_CATALOG_RESPONSE`) — this is real, working evidence.

## What's not trustworthy
- Any assertion in this file that depends on `client-requests`/order data goes through
  `src/BaseUrl.tsx`'s `baseUrl` (production, not `localhost:3001`) — the mock never
  intercepts it. A "pass" here only proves the page didn't crash against whatever
  production actually returned, not that it correctly maps the intended mock payload.

## Changes Made
None to app or test code this stage (fix is a repo-wide env/config decision, see
QA-MASTER-STATUS.md — out of scope for a single test file).

## Regression Result
N/A — blocked on the P0 fix.

## Final Status: **PARTIAL** (vehicle-catalog portion VALID, booking-data portion INVALID pending a safe rerun)
