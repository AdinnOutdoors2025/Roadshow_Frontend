# TODO

## Open / Not Yet Requested to Fix
Items surfaced during business-logic reviews but not yet actioned — revisit if the user asks for further hardening:

- [ ] `SalesDetailDrawer.tsx` `OverviewTab`: `baseDays` computed from `currentVehicle.toDate/fromDate` before the `currentVehicle` existence guard — crashes on orders with zero booking items.
- [ ] Negotiated discount (`totalNegotiated`) not clamped to `subtotal` — can go negative, no warning shown.
- [ ] GST/pricing calculation duplicated in ~4 places (order-creation, operation-handling Campaign Calculator, and multiple spots in sales-handling) — no shared calculator.
- [ ] Extra-KM/hour billing model diverges between Order Creation (linear) and Campaign Calculator (pooled allowance) — quoted price at order creation won't match actual billed price.
- [ ] No vehicle-availability re-check at final order submit (only checked when adding a vehicle to the form).
- [ ] No duplicate-vehicle/date-range guard in order creation.
- [ ] Several silent `catch {}` / `console.error`-only error paths (staff list fetch, date-conflict fetch) leave the UI looking "empty" instead of "failed."

## Verification Still Needed
- [ ] Smoke-test the full handover flow live (reassign → temporary banner → Return / Make Permanent) in both Sales Handling and Operation Handling.
- [ ] Smoke-test PO document correction end-to-end (edit before Project Code Creation, confirm button disappears after, confirm Edit History shows correct preview).
- [ ] Confirm backend server has been restarted after schema/controller/route changes so they're live.

## Completed This Session
- [x] Handler handover/reassignment (Sales Handling + Operation Handling), full-stack.
- [x] PO document correction with versioned edit history (Sales Handling).
- [x] Fixed schema field misplacement bug (`opsHandlerAssignmentHistory` was inside the wrong sub-schema).
- [x] Fixed `getOrdersByPipeline` `.select()` projection missing the new ops handler fields.
- [x] Fixed PO-edit lock condition to gate on pipeline stage, not just `projectCodeArray` length.
- [x] Design pass: handover history cards + PO edit history cards (with document preview) on both modules, matching styles.
- [x] Swapped native date inputs for the reusable `DatePicker` component in both Reassign modals.
