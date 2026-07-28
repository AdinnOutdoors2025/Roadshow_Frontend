# Progress Log

## 2026-07-22

**Completed:**
- Generated repo-root `CLAUDE.md` via `/init` — documents tech stack, folder structure, architecture, auth model, API conventions, business rules, and endpoint reference for the whole codebase.
- Changed the vehicle-card "Add Vehicle" button on `roadshow/CampaignRequest` from white to red (`#E4002B`, hover `#B8001F`) in `page.css`.
- Changed the "Add More Vehicle" button on the same page from grey/black to blue/white (`#0057D9`, hover `#0046AD`) in `page.tsx` + `page.css`, after presenting the change as a git-style red/green diff for review.
- Established and saved a persistent workflow preference: propose edits before writing them, shown as diffs on request.

**Pending:**
- Visual confirmation of both button color changes in a running dev server.

---

**Completed (later same day):**
- Added a "Review Your Order & Confirm" popup on `CampaignRequest` Submit (Contact Details, Selected Vehicles, Pricing Summary, Edit Details / Send Request), reusing the existing `Modal`/`useModal`.
- Carousel prev/next arrows now disable at each scroll end; vehicle quantity +/− buttons disable at min (1) and max (`vehicle.availableVehicles`).
- Selected vehicles now sort to the front of the carousel, with a plain CSS/JS FLIP animation so cards slide instead of jumping.
- Fixed a real bug in `AuthContext.tsx`: mismatched `localStorage` keys were silently breaking session restore on every page refresh.
- Added 2-hour session expiry and 30-minute idle auto-logout (with toast message) to `AuthContext.tsx`.
- Fixed a login-popup race condition where the popup could open on refresh even with a valid session, via a new `authLoading` flag.

**Pending:**
- Live-test everything above in the browser (dev server not run this session).
## 2026-07-23
- Order Creation: added final vehicle-availability re-check at Submit (was only checked when adding a vehicle to the form) + surfaced the failure as `toast.error` instead of `alert`.
- Found and fixed a root-cause bug: backend `.env` work-window hours were stored as `"HH:mm"` strings but parsed with `Number()` (→ `NaN`), silently corrupting all campaign-hour math — fixed via proper `parseTimeToDecimalHour`/`istWallClock` rewrite, mirrored on the frontend for Vehicle History.
- Wired the previously-orphaned `LogHoursModal.tsx` ("Mark Absent" / Log Daily Hours) into the Campaign Calculator's Daily Timeline — it existed in code but was never rendered anywhere before this session.
- Built a role-gated FOC (Free-of-Cost extension) approval flow reusing the existing Client Closure system: super admin creates+approves instantly, any other staff submits a pending request needing super-admin approval. Applied to both "Mark Absent → Extend +1 Day" and Compensation's "Extra Campaign Days".
- Found and fixed the root cause of "FOC created but Client Closure tab shows nothing": `CampaignCalculatorTab` was never given the parent's `onRefresh`, so mutations only refreshed its own local state, leaving the shared `order` object (read by other tabs) stale.
- Widened the Client Closure tab's visibility condition (was stage-gated only) to also show whenever any FOC request exists on the order, regardless of pipeline stage — per explicit user decision that FOC requests must NOT move the pipeline stage.
- Fixed a kanban card-click bug where a pending FOC always forced the "Client Closure" tab open even for cards clicked from the "Vehicle Unavailable" column, hiding that column's own dedicated tab.
- Added "no stage move" guards for the virtual "Vehicle Unavailable" kanban column — both drag-and-drop and the modal's "Move to Client Closure" button.
- Fully reworked `CompensationModal.tsx`: conditional UI for "this date only" vs "split across a range" × hours/days type, added a modal scroll fix, and fixed two `DatePicker` bugs (popup clipped by a 2-col grid inside a scrollable modal; empty year dropdown when `maxDate` was left undefined for a future-dated range).
- Daily Timeline: added `combinedRunningHoursToday` (old + replacement vehicle running hours summed) and a `compensationStatus` per day/vehicle (applied / not-applied / this-date / split, with the matching date range), then redesigned the vehicle card's cost section into a proper "Price Breakdown" list (label-left/amount-right, bold Day Total) matching the Order Creation card's visual style.
- Verified throughout: `tsc --noEmit` stayed at the same 4 pre-existing, unrelated errors; backend controller/model reloaded clean via `node -e "require(...)"` after every change.

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
- Per-day Estimated (Campaign Calculator) breakdown on the Daily Timeline tab (vehicle-wise + day-total) — plan accepted 2026-07-23, not yet implemented.
- Live smoke-testing of the Mark Absent → FOC flow (both admin-instant and staff-pending-then-approved paths), the Compensation modal's new scope/type combinations, and the Vehicle Unavailable no-move guards.
- Live smoke-testing of the 2026-07-22 handover/PO-document flows (not yet confirmed working end-to-end beyond the bugs already caught).
- See `docs/todo.md` for the open business-logic findings not yet actioned.
