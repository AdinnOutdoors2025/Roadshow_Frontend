# QA-07 — Client Data Consistency Testing Report

Scope: `tests/e2e/client-api-data.e2e.spec.ts`, `test.describe("QA-07 Data consistency")`.
See `QA-MASTER-STATUS.md` for the P0 baseUrl/production-exposure finding this report depends on.

## Total Test Cases: 3
- "booking detail values match the API payload exactly" — failed under parallel load,
  **passed** serially (dev-server contention, not a defect).
- "view-summary renders a PDF blob from the API payload" — **failed consistently**, both
  parallel and serial (30s timeout, stuck on "Preparing your summary...").
- "cancelled booking renders its terminal status" — passed.

## Real finding: PDF generation hang on `/roadshow/view-summary/[id]`
`src/lib/bookingSummaryPdf.ts` (html2canvas + jsPDF, dynamically imported) never resolves
within 30s for this fixture; the page shows an indefinite spinner with **no timeout or error
fallback** in `src/app/roadshow/view-summary/[id]/page.tsx` — `loading` only clears once the
async IIFE's `finally` runs, which never happens if `getBookingSummaryPdfBlobUrl` hangs.

**Root cause status: UNCONFIRMED, not yet fixed (by user decision — see QA-MASTER-STATUS.md).**
Two candidate causes, not yet distinguished:
1. `html2canvas({ scale: 2, ... })` is genuinely slow/CPU-bound for this document on this
   machine (there's a pre-existing local note in `Hero.tsx` about this dev machine "hanging"
   under heavy client-side rendering — a 3D-GLB performance flag, same symptom class).
2. **More likely**, given the P0 finding: `view-summary/[id]/page.tsx` fetches
   `client-requests/:id` via `baseUrl` (production, not the mock) — the initial `fetch` may
   itself be slow/CORS-blocked/mismatched against a nonexistent-in-production test ID, which
   would explain the hang independently of html2canvas.

This needs re-testing in a safe (mock-reachable) environment before attributing it to either
cause — don't fix blind. Either way, the **missing timeout/error-fallback around PDF
generation is a real, independent UX gap** worth fixing regardless of root cause: a real user
whose PDF generation stalls for any reason (slow device, large campaign, network hiccup) sees
an infinite spinner with no retry or error message.

## Changes Made
None (business-logic file, confirmed with user to document-only this cycle).

## Regression Result
N/A.

## Final Status: **FAIL** (confirmed reproducible defect: no timeout/fallback on PDF generation) — needs root-cause isolation in a safe environment, then a scoped fix (add a timeout that surfaces an error + retry instead of an infinite spinner).
