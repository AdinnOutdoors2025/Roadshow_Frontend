# QA-13 — End-to-End Journey Testing Report

Scope: `tests/e2e/client-e2e-journeys.e2e.spec.ts` — 3 realistic customer journeys.
See `QA-MASTER-STATUS.md` for the P0 baseUrl/production-exposure finding.

## Journeys
1. **New booking** (browse → review → submit → confirmation): failed under parallel load
   (dev-server contention, `page.waitForURL` timeout), **passed** serially. Submits a real
   POST to `client-requests` through `baseUrl` — per the P0 finding, this likely hit
   **production**, not the mock. If it succeeded, **a real test booking request may exist in
   the live database** (needs backend-side confirmation, not something checkable from this
   repo).
2. **Returning user** (my-bookings → dashboard → tracking → live vehicles → PDF download):
   **fails consistently**, blocked by the same PDF-generation hang documented in QA-07/QA-12.
3. **Backend edits the order, client shows it**: not run this cycle (stopped further execution
   after the P0 discovery, per user decision).

## QA-14 UAT walkthrough evidence
`test.describe("QA-14 UAT walkthrough evidence")` in the same file: not run this cycle for the
same reason.

## Changes Made
None to app or test code in this file this cycle.

## Regression Result
N/A — blocked.

## Final Status: **PARTIAL / BLOCKED** — Journey 1 mechanically works but its evidence (and possibly its side effects) are compromised by the P0 baseUrl issue; Journey 2 has a real unresolved defect (QA-07); Journey 3 and QA-14 not yet executed this cycle.
