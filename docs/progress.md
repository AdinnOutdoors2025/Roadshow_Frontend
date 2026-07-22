# Progress Log

## 2026-07-22
- Explained Campaign Calculator's Estimated vs Actual variance table (Extra KM/Hours overage vs Rental savings) to help the user understand a real invoice discrepancy.
- Ran full business-logic audits (via subagents) of Order Creation and Sales Handling flows — found: silent discount clamping, no vehicle-availability re-check at submit, no duplicate-vehicle guard, pricing-model divergence between order-creation and operation-handling, a crash risk in `SalesDetailDrawer` on zero-booking-item orders, unclamped negotiated discounts, and several silent error catches.
- Produced a full business-improvement plan (missing workflows, new features, approval flows, dashboards) across Sales Handling / Order Creation / Operation Handling, then a second round covering handler handover, PO document versioning, and cross-cutting audit/governance needs (Tanglish request).
- Implemented, full-stack:
  - **Handler handover/reassignment** for both Sales Handling and Operation Handling — temporary/permanent reassignment, resolve (Return/Make Permanent), full audit history, reusable `DatePicker` for leave dates.
  - **PO Document correction** for Sales Handling's "PO Document" tab — open to admin + handler, versioned edit history with document preview, locked once the order reaches Project Code Creation (fixed twice: once to correct the underlying array being edited/gate location, once to gate on pipeline stage rather than array length).
- Fixed two backend bugs found during live testing:
  - Schema field misplacement (`opsHandlerAssignmentHistory` inserted into the wrong sub-schema due to a duplicate field-name match).
  - Missing field in `getOrdersByPipeline`'s `.select()` projection, which silently stripped the new fields from API responses.
- Redesigned Handover History and PO Edit History UI (card layout, status badges, document preview) and unified the design/date-picker usage between Sales Handling and Operation Handling.

## Pending
- Live smoke-testing of both flows by the user (not yet confirmed working end-to-end beyond the bugs already caught).
- See `docs/todo.md` for the open business-logic findings not yet actioned.
