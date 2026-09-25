# QA-12 — Performance Testing Report

Scope: dev-server load behavior under the e2e suite; PDF-generation latency on view-summary.

## Finding 1: Dev-server parallel-run flakiness (confirmed, not an app defect)
Running the full 82-test e2e suite with Playwright's default `fullyParallel: true` (no
`workers` cap outside CI) against a single Turbopack dev server produced 9 failures, mostly
timeouts. Rerunning the *same 9* tests serially (`--workers=1`) recovered 4 of them
immediately (QA-06 tracking, QA-07 booking-detail, QA-13 Journey 1, QA-09 320px overflow) with
zero code changes — confirming Turbopack cold-compile-on-first-hit contention under many
concurrent workers on this machine, not a functional regression. Recommendation (not applied,
config-only, low risk if the team wants it later): cap `workers` in `playwright.config.ts` for
local (non-CI) runs, or pre-warm routes before the timed suite.

## Finding 2: PDF generation on `/roadshow/view-summary/[id]` — real, unresolved (see QA-07)
Reproducible even serially: "Preparing your summary..." never resolves within 30s. Root cause
is confounded by the P0 baseUrl finding (`QA-MASTER-STATUS.md`) — could be html2canvas
CPU cost, or a slow/blocked fetch to production instead of the mock. Not re-isolated this
cycle per user decision to stop further runs against the live backend. The independently-true
part regardless of root cause: **no timeout or error fallback exists** around PDF generation,
so any slow path (device, network, data size) currently produces an infinite spinner.

## Not measured this cycle
Initial bundle/image/video weight, Lighthouse-style metrics — out of scope for this pass
(existing QA-01 already covers build output size implicitly via a clean production build; no
dedicated performance budget check exists in this repo's tooling).

## Final Status: **PARTIAL** — 1 flakiness cause fully explained (no fix needed), 1 real defect confirmed but root-cause-blocked on the P0 baseUrl fix.
