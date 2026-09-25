# QA-06 — Integration Testing Report

Scope: `tests/e2e/client-api-data.e2e.spec.ts`, `test.describe("QA-06 Integration (backend change -> client refresh)")`.
Tests the CLAUDE.md-documented read-time overlay behavior (`applyOrderFieldOverrides`):
admin edits an Order and the client should see it reflected on next fetch, without the
ClientRequest doc itself changing.
See `QA-MASTER-STATUS.md` for the P0 baseUrl/production-exposure finding this report depends on.

## Total Test Cases: 2
- "list reflects backend edits after refresh" — passed in this cycle's runs.
- "tracking page keeps polling and shows the latest live data" — failed under parallel load,
  **passed** when rerun serially (confirmed dev-server/Turbopack cold-compile contention, not
  an app defect — see QA-12).

## Trustworthiness
Both tests seed `state.bookings`/`state.tracking` via `installMockBackend`, but since
`my-bookings`/tracking pages fetch through `baseUrl` (production, not `localhost:3001` — see
QA-MASTER-STATUS.md P0), the mock is never actually consulted. The "backend edit" these tests
simulate by mutating local `state` never reaches the page at all; a pass only shows the page
rendered *something* without crashing, not that the read-time-overlay behavior itself works.

## Changes Made
None. This stage's actual intent (verify client refresh reflects backend edits) has not yet
been genuinely exercised.

## Regression Result
N/A — blocked on the P0 fix.

## Final Status: **PARTIAL / INVALID** — needs a safe rerun once `baseUrl` is fixed or mocked correctly.
