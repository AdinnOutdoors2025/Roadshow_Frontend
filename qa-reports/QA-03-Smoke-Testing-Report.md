# QA-03 — Smoke Testing Report (Client/Public Site Only)

Testing Stage: Smoke Testing
Date: 2026-09-05
Scope: All 11 discovered client routes (see QA-01 addendum), against `npm run dev` (Turbopack), no live backend seeded — 404s from the dummy backend on dynamic-id routes are expected and excluded from the error check.

## Total Test Cases: 12
Passed: 12
Failed: 0
Blocked: 0
Fixed: 0
Retested: n/a (no fixes needed)

## What was tested
New Playwright suite: [tests/e2e/client-smoke.e2e.spec.ts](../tests/e2e/client-smoke.e2e.spec.ts) (real Chromium, not just an HTTP status check):
- 7 static routes (`/`, CampaignRequest, Contact, vehicles, review-order, campaign-details, my-bookings) load with **zero uncaught `pageerror`s and zero console errors** (hydration-mismatch warnings specifically checked for), after a 1.5s settle window for client-side hydration/animation.
- 4 dynamic routes (`VehicleDetails/[id]`, `booking-request-submitted/[id]`, `my-bookings/[bookingId]`, `view-summary/[id]`) hit with a syntactically-valid but non-existent Mongo-style id — confirmed each renders a non-blank body with no uncaught JS error (i.e. a graceful "not found"/empty state, not a crash).
- Home page navbar (`<nav>`/`<header>`) renders and is visible.

An initial `curl`-only pass (HTTP status codes only) was run first and all 11 routes returned 200, but curl can't see client-side hydration or JS runtime errors on this heavily client-rendered app (loader overlay, GSAP-driven sections) — the Playwright pass above is the real smoke signal for those.

## Issues Found
None.

## Root Cause
N/A

## Changes Made
None to app code. Added the smoke suite itself as a new, reusable regression asset for future stages/regression testing.

## Regression Result
N/A (new tests added, no source changed).

## Final Status: **PASS**
