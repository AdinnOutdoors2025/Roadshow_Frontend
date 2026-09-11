# Client-Site QA Prompt (reusable, low-token)

Act as Senior Frontend QA for the **public/client site only**:
`/`, `/roadshow*`, `/campaign-request`, `/my-bookings*`, `/booking/*`, `/tracking/*`.
Discover exact routes from `src/app/` before testing — don't assume the list above is exhaustive.

**Never touch `/admin/*`** — read-only reference only if a client page calls a shared/admin-owned API.

## Hard constraints (non-negotiable)
- No redesign, no layout/CSS changes beyond the smallest safe fix. **Never touch layout CSS to fix overflow** — find the actual overflowing element.
- No removing/altering: animations, smooth scrolling, loaders, 3D sections, navbar behavior, booking flow, routes.
- Confirm with the user before any Edit/Write — do not silently apply fixes.
- Preserve existing UI byte-for-byte where not the direct cause of a verified bug.
- Client-side validation (discount cap, JWT expiry, etc.) is UX-only, not a security boundary — don't treat its absence as a blocker unless it breaks UX.

## Stage order (skip a stage only if genuinely N/A, and say why)
1. Build/typecheck/lint (client routes only) → reuse/update `qa-reports/QA-01-Development-Report.md` if present, don't recreate from scratch.
2. Unit tests for non-trivial logic only (pricing, dates, validation, status/progress mapping) — check `tests/unit/` first for existing coverage before writing new tests.
3. Smoke: each discovered route loads, no console/hydration errors.
4. Functional: nav, campaign-request form + upload + submit, booking list/detail, tracking, PDF preview/download.
5. Client API calls only (map response → UI, error/empty states).
6. Integration: booking → my-bookings → detail → tracking reflect backend edits on refresh (see CLAUDE.md note on `applyOrderFieldOverrides` read-time overlay — don't expect the ClientRequest doc itself to change).
7. Data consistency: order id, dates, vehicle, pricing/GST/total, status shown to client match API response.
8. Negative: empty/invalid form input, bad file, invalid order id, expired session, API/network failure — must degrade gracefully, no blank screen.
9. Responsive/browser: desktop/tablet/mobile × Chrome/Edge/Firefox — flag overflow issues, don't auto-fix with `overflow-x:hidden`.
10. Regression: re-walk the full client journey after any fix.
11. Security: unauth access to booking/tracking by guessed ID, XSS in form fields, file upload type/size checks, exposed secrets.
12. Performance: initial load, image/video weight, bundle size — no removal of animations/3D to "optimize."
13. E2E: new booking journey; returning-user journey; backend-edit-reflected-on-client journey.
14. UAT pass from a plain user's perspective (clarity, not code).
15. Sign-off table (PASS/FAIL per stage, blockers listed).
16. Production readiness verdict: READY / NOT READY + exact blockers.

## Output
One `QA-<NN>-<Stage>-Report.md` per stage in `qa-reports/`, using the existing report skeleton (Scope / Total-Passed-Failed-Blocked-Fixed-Retested / Issues / Root Cause / Changes Made / Regression Result / Final Status). For each failure: Test Case / Expected / Actual / Severity / Root Cause / File / Fix / Retest / Regression.

Work one stage at a time: **test → report → (confirm) fix → retest → regression → next stage**. Don't pre-load later stages' detail into context; re-read this file's relevant section when you reach it.
