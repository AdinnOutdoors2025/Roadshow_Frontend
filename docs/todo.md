# TODO

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
