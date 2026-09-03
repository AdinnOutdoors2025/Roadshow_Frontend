# TODO

## Carried forward from 2026-09-03 session

- [ ] **PHP-side fix required from the user**: `index_rdsw_Campaign.php` (`roadshow_contact_page` mail case) needs `$vehicleImageUrl = trim((string)($data['vehicleImageUrl'] ?? ''));` added right after the existing `$mailLogoUrl` line — that file isn't accessible from this repo, so it can't be applied here. Until this lands, the Contact page's mail template shows "vehicle image is not available" even though the frontend/backend now send `vehicleImageUrl` correctly.
- [ ] Once the compressed `/images/assets/mail/*.jpg` assets are pushed/deployed to Netlify, swap `selectedVehicleImageUrl` on `roadshow/Contact/page.tsx` from `selectedService.image` back to `selectedService.mailImage` (currently reverted because those assets 404 on live Netlify — not deployed yet).
- [ ] Phone-number dedup normalization mismatch in `enquiryDedup.js`: lookup normalizes to last-10-digits but the raw/untrimmed phone is what's actually saved, so a resubmission with differently-formatted phone (e.g. `+91 xxx` vs `91xxx`) won't be caught as a duplicate. Low severity, flagged not fixed.
- [ ] Inconsistent mail-failure UX: `ContactEnquiry.js` shows an error toast if the mail send fails; `NewsletterController.js` always shows success regardless. Worth reconciling if it causes confusion.
- [ ] Order Images / Sales-order-uploads still share a flat, non-env-driven `public/uploads` path (unlike the newly-separated PO document / Vehicle Onboarding paths) — bigger change across a large operations-pipeline surface, deliberately deferred.
- [ ] Confirm which git branch Netlify actually deploys from — never resolved this session (moot while no push happens, but will matter once the mail-image swap-back above is ready to ship).

## Reconciliation notes (2026-08-27)

Docs were stale for ~1 month (last touched 2026-07-23); a month of multi-contributor commits landed in between. See `docs/progress.md`'s 2026-08-27 entry and `docs/context.md`'s "Status as of 2026-08-27" section for the full theme breakdown. This pass did **not** re-verify every item below against current code — most entries under "Open"/"Backlog"/"Verification Still Needed" predate that gap and may already be resolved by the intervening work (e.g. items touching Campaign Calculator, invoice, handover, or order-creation vehicle-availability — all areas with heavy commit activity since). Re-check before acting on an old item rather than assuming it's still outstanding.

**Confirmed still open** (spot-checked today):
- [ ] Per-day "Estimated (Campaign Calculator)" breakdown on Daily Timeline tab — still not implemented (no `estimatedTotalAmount`/`perDayEstimate` in `operation-handling/*`).

**Needs a fresh decision, not a code check** — RTO calculation has been added/removed/re-added at least 3 times across both repos this month (see progress.md). Current code still has RTO logic in `order-creation/{VehicleListStep,print,orderdetails,VehicleFormModal,OrderSummaryStep}.tsx`, but given the churn, confirm the *intended* current behavior with the user before modifying anything RTO-related.

**New item surfaced from commit history** (not yet actioned, worth confirming with user):
- [ ] "CTA banner creation pending" was explicitly called out in a commit message (`d8c8362`, 2026-08-08, home page revamp) — confirm whether this was completed in a later commit or is still outstanding.

## Open

- [ ] Verify both `roadshow/CampaignRequest` button color changes ("Add Vehicle" → red, "Add More Vehicle" → blue) render correctly in the browser (dev server not run this session).
- [ ] Confirm the "Vehicle added" (selected) state still looks right next to the new red unselected button state.
- [ ] Live-test the "Review Your Order & Confirm" popup, carousel disable-at-ends, quantity disable-at-limits, and selected-vehicle reorder/FLIP animation on `CampaignRequest`.
- [ ] Refresh the page while logged in to confirm the login popup no longer appears (race-condition fix), and confirm session survives a refresh within 2 hours.
- [ ] Leave the page idle 30 minutes to confirm the "logged out due to inactivity" toast fires.
- [ ] If Company Name is wanted in the review popup, add a real `companyName` field to the form first (currently omitted — no field exists).
- [ ] Double-check `page.css`'s externally-modified state doesn't conflict with the new `:disabled` nav-button rule.

## Backlog / carried-forward known issues

- [ ] `admin/Vehicles/Vehicle_Onboarding/page.tsx` and `sales-handling/page.tsx` are multi-thousand-line files with commented-out legacy code — candidates for cleanup if ever revisited (read fully before touching).
- [ ] No test runner is configured in the repo — needed before any automated tests can be added.
- [ ] API path prefixing (`api/...` vs bare) is inconsistent across the backend — not actionable from this repo, just something to keep matching per-endpoint.
## Next Up (accepted plan, not yet implemented)
- [ ] **Per-day Estimated (Campaign Calculator) breakdown** on the Daily Timeline tab — split by vehicle and as a day total (Estimated vs Actual vs Diff), same visual pattern as the Overview tab's campaign-total CompareRow. Needs backend to compute a proportional per-day estimate (`estimatedTotalAmount ÷ totalScheduledDays`) per vehicle and add it to each day/vehicle object in `getCampaignCalculator`.

## Verification Still Needed
- [ ] Smoke-test Mark Absent → "Extend Campaign +1 Day" as both a super admin (instant create+approve) and a regular staff account (pending request → super admin approves in Client Closure → day actually extends).
- [ ] Smoke-test Compensation modal's three flows: "This date only", "Split + Extra Working Hours", "Split + Extra Campaign Days" (including the staff-pending / admin-approval path for days).
- [ ] Smoke-test that a Vehicle Unavailable kanban card truly cannot be moved (drag-and-drop, and the modal's move button) until the vehicle is resolved/replaced.
- [ ] Smoke-test the Client Closure tab now appears (and shows the right FOC card/status) for an order still in On Road stage once a FOC request exists.
- [ ] Confirm both dev servers were restarted after this session's `.env` and controller/model changes so everything is live (backend `nodemon`, frontend `NEXT_PUBLIC_*` vars are build-time).
- [ ] Smoke-test the full handover flow live (reassign → temporary banner → Return / Make Permanent) in both Sales Handling and Operation Handling (carried over from 2026-07-22, not yet confirmed).
- [ ] Smoke-test PO document correction end-to-end (carried over from 2026-07-22, not yet confirmed).

## Open / Not Yet Requested to Fix
Items surfaced during business-logic reviews but not yet actioned — revisit if the user asks for further hardening:

- [ ] `SalesDetailDrawer.tsx` `OverviewTab`: `baseDays` computed from `currentVehicle.toDate/fromDate` before the `currentVehicle` existence guard — crashes on orders with zero booking items.
- [ ] Negotiated discount (`totalNegotiated`) not clamped to `subtotal` — can go negative, no warning shown.
- [ ] GST/pricing calculation duplicated in ~4 places (order-creation, operation-handling Campaign Calculator, and multiple spots in sales-handling) — no shared calculator.
- [ ] Extra-KM/hour billing model diverges between Order Creation (linear) and Campaign Calculator (pooled allowance) — quoted price at order creation won't match actual billed price.
- [ ] No duplicate-vehicle/date-range guard in order creation.
- [ ] Several silent `catch {}` / `console.error`-only error paths (staff list fetch, date-conflict fetch) leave the UI looking "empty" instead of "failed."
- [ ] The "4 days campaign calculated only 3 days amount" absent-day compensation billing-math question remains unresolved — user's clarification answers were ambiguous across two rounds; do not touch the compensation/billing formula without a concrete confirmed example (screenshot with exact expected vs actual amounts).
- [ ] `compensationHours` (campaignCompensationArray "hours" grants) is currently purely informational and never wired into any billing deduction — confirmed intentional-for-now, but if it's ever wired into billing, double-check it can't double-apply alongside an Absent day's zero/partial billing.

## Completed This Session (2026-07-23)
- [x] Order Creation: final vehicle-availability re-check at Submit + `toast.error` on failure.
- [x] Root-cause fix for `.env` `"HH:mm"` string / `Number()` NaN bug corrupting campaign-hour math (backend + frontend).
- [x] Wired the orphaned `LogHoursModal.tsx` (Mark Absent) into Campaign Calculator's Daily Timeline, with a 4h downtime auto-suggest threshold.
- [x] Role-gated FOC (Free-of-Cost extension) approval flow for both Mark Absent → Extend +1 Day and Compensation → Extra Campaign Days.
- [x] Fixed stale-`order`-object bug so FOC actions from Campaign Calculator actually show up in Client Closure.
- [x] Client Closure tab now shows whenever a FOC request exists, not only when `pipelineStatus === "clientClosure"`.
- [x] Fixed kanban card-click tab-priority bug (Vehicle Unavailable column was being overridden by the FOC redirect).
- [x] Vehicle Unavailable column: blocked stage-move via drag-and-drop and the modal's move button.
- [x] Full `CompensationModal.tsx` rework (this-date/split × hours/days conditional UI, scroll fix, two `DatePicker` bugs fixed).
- [x] Daily Timeline: combined running hours (old+replacement), compensation status banner, redesigned Price Breakdown section.

## Completed Earlier (2026-07-22)
- [x] Handler handover/reassignment (Sales Handling + Operation Handling), full-stack.
- [x] PO document correction with versioned edit history (Sales Handling).
- [x] Fixed schema field misplacement bug (`opsHandlerAssignmentHistory` was inside the wrong sub-schema).
- [x] Fixed `getOrdersByPipeline` `.select()` projection missing the new ops handler fields.
- [x] Fixed PO-edit lock condition to gate on pipeline stage, not just `projectCodeArray` length.
- [x] Design pass: handover history cards + PO edit history cards (with document preview) on both modules, matching styles.
- [x] Swapped native date inputs for the reusable `DatePicker` component in both Reassign modals.
