# Project Context

## Current Project
Roadshow Campaign Management System — Next.js 16 (App Router) admin dashboard + public site, backed by a separate Express/MongoDB API at `F:\roadshowbackend\roadshow_Backend`.

## Current Status
Just finished a large multi-turn session hardening **Operation Handling → Campaign Calculator** (Order Creation vehicle-availability re-check was also closed out at the start of this session). Core theme: driver shift-window correctness, Mark Absent / FOC (Free-of-Cost extension) approval flow, Compensation modal redesign, and Daily Timeline data completeness (combined running hours, compensation status, full price breakdown).

## Completed Tasks (this session)

### Order Creation
- Final vehicle-availability re-check added at Submit time (`createAdminOrder`, backend) — previously only checked when adding a vehicle to the form, so a second order could double-book the same vehicle in the gap between form-add and submit.
- Submit error surfaced via `toast.error` (was a raw `alert`).

### Driver Shift Window / Campaign Hours (root-cause bug fix)
- Backend `.env` (`DEFAULT_WORK_START_HOUR`/`DEFAULT_WORK_END_HOUR`) was stored as `"HH:mm"` strings but parsed with `Number()` → `NaN`, silently corrupting all work-window/campaign-hour math. Fixed via `parseTimeToDecimalHour` + rewritten `istWallClock` (fractional-hour, multi-day rollover aware).
- Same fix mirrored on the frontend (`CampaignCalculatorTab.tsx`) for the Vehicle History section's event-derived running/issue/unavailable hours (`overlapWithShiftHours`, `shiftWindowForDay`).
- Shift default now **11:00–19:00** (both `.env` files) — settled after starting at 18:30–02:30 then briefly at 10:00–18:00; current live values are `NEXT_PUBLIC_DEFAULT_LOGIN_TIME=10:00` / `NEXT_PUBLIC_DEFAULT_LOGOUT_TIME=18:00` and backend `DEFAULT_WORK_START_HOUR=10:00` / `DEFAULT_WORK_END_HOUR=18:00` (edited outside the assistant session — treat as current source of truth, don't revert).

### Mark Absent → FOC (Free-of-Cost Extension) Flow
- Wired the previously-orphaned `LogHoursModal.tsx` into `CampaignCalculatorTab.tsx` Daily Timeline (a "Mark Absent" button per vehicle entry existed in code but was never imported/rendered anywhere before this session).
- `NEXT_PUBLIC_ABSENT_THRESHOLD_HOURS=4` (frontend `.env`) — downtime (issue+unavailable) crossing this threshold **visually suggests** Mark Absent (amber pulse), never auto-marks.
- `LogHoursModal`: Driver/Vehicle + Date fields now pre-filled and **disabled** to the exact entry/day the button was clicked from (`lockedEntryId`/`lockedDate` props). Fixed a midnight-rollover bug (`end <= start` treated as next-day instead of erroring) — currently dormant since shift is same-day, kept as a guard.
- **Role-gated FOC approval rule** (reused/extended the existing Client Closure FOC system — `campaignClosureArray`, `approveFocEntry`, `createAndApproveFocEntry`): super admin → instant create+approve; any other staff → pending request, must be approved by a super admin. Applies to:
  - Mark Absent → "Extend Campaign +1 Day" (`addDailyHoursLog`, `focPurpose: "absent-day"`).
  - Compensation modal's "Extra Campaign Days" (`addCampaignCompensation`, `focPurpose: "compensation-days"`) — the actual `campaignCompensationArray` grant is deferred until `approveFocEntry` fires (schema fields: `focPurpose`, `compensationVehicleIndex`, `compensationEntryId`, `compensationDaysValue`).
- **Root-cause fix for "FOC created but Client Closure tab shows nothing"**: `DetailsModel.tsx` never passed the parent `onRefresh` down into `CampaignCalculatorTab`, so `LogHoursModal`/`CompensationModal` success only refreshed the tab's own local calculator data — the shared `order` object read by `OnRoadTab`/`ClientClosureTab` stayed stale. Fixed via a `refreshAll()` wrapper (`fetchCalculator()` + `fetchHistory()` + parent `onRefresh()`).
- **Client Closure tab visibility**: the tab only appeared once `pipelineStatus === "clientClosure"`. Since FOC requests raised from the Campaign Calculator deliberately do **not** move the pipeline stage (explicit user decision — see Decisions Taken), the tab-list condition in `DetailsModel.tsx` was widened to also show whenever `campaignClosureArray` has any `type === "foc"` entry, regardless of stage.
- **Kanban card-click tab priority bug**: `page.tsx`'s `onCardClick` always forced the "Client Closure" tab open whenever `orderHasPendingFoc(order)` was true — even for a card opened from the "Vehicle Unavailable" column, hiding its own dedicated tab. Fixed so `vehicleUnavailable`/`clientClosure` columns always open their own tab first; FOC-redirect only applies to `onRoad`/generic columns.

### Vehicle Unavailable — no stage-move allowed
- "Vehicle Unavailable" is a **virtual kanban column** (`page.tsx` `fetchPipeline`: `onRoadOrders.filter(order => order.onRoadExecutionArray.some(e => e.unavailableStatus === true))`) — not a real `pipelineStatus` value.
- `onDrop` (page.tsx) now blocks any drag-and-drop move away from that column with a toast.
- `DetailsModel.tsx`'s "Move to Client Closure" button is now hidden (`nextLabel = undefined`) whenever the order has any currently-unavailable vehicle entry, matching the same rule inside the modal.

### Compensation Modal (`CompensationModal.tsx`) — full rework
- **"This date only"**: Compensation Type buttons + From/To pickers hidden; label simplified to "Hours"; applies once to the exact day the modal was opened from (`detectedLossDate`/`detectedLossHours` props, pre-filled from that day's downtime).
- **"Split across a date range" + Extra Working Hours**: From Date = the opened day (disabled), To Date selectable up to campaign end.
- **"Split across a date range" + Extra Campaign Days**: manual value input hidden; From Date = campaign end date (disabled); To Date selectable, day-count auto-derived (`To − campaign end`); Save routes through the FOC role-gated flow above.
- Modal now scrolls (`max-h-[85vh]` + `overflow-y-auto`, header/save button fixed) — was previously unscrollable and content got cut off.
- **Bug fixed**: From/To Date pickers were side-by-side in a 2-col grid inside a narrow modal — the calendar popup (260px) couldn't fit and got clipped by the modal's scroll container. Fixed by stacking them vertically.
- **Bug fixed**: `DatePicker`'s shared component falls back to an 18–100-year-old birthdate range whenever `maxDate` is left `undefined` (designed for DOB fields) — for the "extend campaign" To Date, `minDate` was already 2026 (past that ~2008 fallback cutoff), silently emptying the year dropdown (`minAllowedYear > maxAllowedYear`). Fixed by always passing an explicit `maxDate` (`campaign end date + 180 days`) instead of `undefined`.

### Daily Timeline — data completeness + redesign
- Backend (`getCampaignCalculator`) now returns, per day per vehicle-type slot:
  - `combinedRunningHoursToday` — old (released/replaced) + new (active) entries' running hours summed (e.g. old vehicle ran 2h before replacement, new vehicle ran 4h after → combined 6h).
  - `compensationStatus` — `{ hasLoss, lossHours, applied, scope: "this-date"|"split"|"none", dateFrom, dateTo, valuePerDay }`, computed by matching `campaignCompensationArray` "hours" grants covering that day (campaign-level or entry-specific).
- Frontend vehicle card (Daily Timeline) now shows:
  - "Combined Running Today: Xh" strip with the day's loss (downtime) hours noted.
  - A clear Compensation Status banner — green "✅ Compensated (this date only / split across A→B, Xh/day)" or amber "⚠️ Not compensated yet" with a one-click "Add Compensation" shortcut.
  - A redesigned **"Price Breakdown"** section (replacing the old compact chip grid) styled like the Order Creation card's price-breakdown pattern: label-left/amount-right line items (Rental+Driver, Promoter, RTO, Extra KM/Hours Pool, Extra KM/Hours Overage, Compensation/Absent deduction) → bold **Day Total** row.
- **Explicitly deferred / not yet done**: a true per-day "Estimated (Campaign Calculator)" breakdown (Estimated vs Actual vs Diff, split both by vehicle and as a day total) on the Daily Timeline tab — this needs backend to compute/store a proportional per-day estimate (`estimatedTotalAmount ÷ totalScheduledDays`) per vehicle and add it to each day/vehicle object; plan was accepted by the user but not yet implemented as of end of session.

## Important Business Rules
- **Compensation vs Absent are NOT mutually exclusive in the money math today** — investigated and confirmed `compensationHours` (campaignCompensationArray "hours" grants) is currently purely informational/reporting, never wired into any billing deduction, so there's no actual double-benefit risk to guard against yet. If compensation hours are ever wired into billing, revisit this.
- **FOC approval rule** (applies to both Mark Absent → Extend +1 Day, and Compensation → Extra Campaign Days): super admin (`req.user.isAdmin === 1`) creates+approves instantly; any other staff can only submit a pending request that a super admin must approve (`approveFocEntry`) before the actual campaign extension / compensation-days grant takes effect.
- **FOC requests do NOT move `pipelineStatus`** — explicit user decision (tried auto-moving `onRoad → clientClosure` once, user reverted it). Order stays in its real stage; FOC visibility is via the "Waiting for FOC" badge + a conditionally-shown "Client Closure" tab, not a stage transition.
- **"Vehicle Unavailable" kanban column is virtual** (computed from `onRoadExecutionArray[].unavailableStatus`, not a `pipelineStatus` enum value) — cards there cannot be stage-moved from anywhere (kanban drag or the modal's move button) until the vehicle is resolved/replaced.
- Extra KM/Hours purchased pool is billed as a flat one-time fee on the vehicle's first campaign day — it does not offset on-road-logged Extra KM/Hours usage (every logged record bills in full, separately). Not changed this session, just relied upon.
- `NEXT_PUBLIC_*` env vars are baked in at Next.js build/dev-server start — changing them needs a dev-server restart, not just hot reload. Backend `.env` changes need a `nodemon` process restart.

## Decisions Taken
- Driver shift-window default landed at **10:00–18:00** (both `.env` files) after iterating through 18:30–02:30 and 11:00–19:00 — the `.env` files were edited directly by the user/linter outside the assistant's tool calls; treat current file contents as authoritative, do not revert.
- FOC create/approve reuses the **existing** Client Closure system (`campaignClosureArray`, `approveFocEntry`, `createAndApproveFocEntry`) rather than building a parallel approval mechanism — extended via `focPurpose`/`compensationVehicleIndex`/`compensationEntryId`/`compensationDaysValue` fields instead of a new schema.
- Explicitly chose **not** to touch the absent-day compensation billing formula (the earlier "4 days campaign calculated only 3 days amount" ambiguity) after two rounds of clarification stayed ambiguous — financial-risk area, left untouched pending a concrete example from the user.
- FOC requests must not silently move pipeline stage — reverted that behavior once implemented, per explicit user correction.

## Files Modified (this session)
Backend (`F:\roadshowbackend\roadshow_Backend`):
- `controllers/Adminordercontroller/Adminordercontroller.js` (vehicle-availability re-check, shift-window parsing fix, `addDailyHoursLog` FOC wiring, `addCampaignCompensation` FOC wiring, `approveFocEntry` deferred-grant application, `getCampaignCalculator` combined-running/compensation-status fields)
- `Models/AdminorderModel/Adminorder.js` (`campaignClosureSchema`: `focPurpose`, `compensationVehicleIndex`, `compensationEntryId`, `compensationDaysValue`)
- `.env` (shift window — now user-edited to `10:00`/`18:00`, see Decisions Taken)

Frontend (`f:\roadshowfrontend\Roadshow_Frontend`):
- `src/app/admin/order-creation/AdminOrderForm.tsx` (toast.error on submit failure)
- `src/app/admin/operation-handling/CampaignCalculatorTab.tsx` (shift-window helpers, Mark Absent wiring, Daily Timeline labels, combined-running/compensation-status UI, Price Breakdown redesign)
- `src/app/admin/operation-handling/LogHoursModal.tsx` (locked entry/date, midnight-rollover guard)
- `src/app/admin/operation-handling/CompensationModal.tsx` (full rework — single/split/hours/days conditional UI, scroll, date-picker fixes)
- `src/app/admin/operation-handling/OnRoadTab.tsx` (Unavailable + FOC status badges)
- `src/app/admin/operation-handling/DetailsModel.tsx` (parent `onRefresh` passed to CampaignCalculatorTab, Client Closure tab condition widened, Vehicle Unavailable move-button hidden)
- `src/app/admin/operation-handling/page.tsx` (card-click tab priority fix, block drag-move out of Vehicle Unavailable column)
- `.env` (shift window + `NEXT_PUBLIC_ABSENT_THRESHOLD_HOURS` — now user-edited to `10:00`/`18:00`, see Decisions Taken)

## Known Issues / Gotchas Hit This Session
- `DatePicker` (`src/app/utils/datepicker.tsx`) silently produces an empty year dropdown if `maxDate` is left `undefined` and `minDate` is later than its birthdate-range fallback (~18-100 years old) — always pass an explicit `maxDate` for any non-birthdate use of this component.
- A modal's own `overflow-y-auto` scroll container will clip a same-row sibling `DatePicker`'s absolutely-positioned popup if the row is split into narrow grid columns — stack date pickers vertically instead of side-by-side inside scrollable modals.
- Passing a child tab component `order` without also passing the parent's `onRefresh` silently desyncs it from sibling tabs after any mutation — always pass both.
- Backend uses `nodemon` — model/controller/route changes need an actual process restart, not just a file save.

## Next Session TODO
- Implement the deferred **per-day Estimated (Campaign Calculator) breakdown** on the Daily Timeline tab (vehicle-wise + day-total), plan already accepted by the user — see `docs/todo.md`.
- No live end-to-end smoke test confirmed yet for: Mark Absent → FOC extend (both admin-instant and staff-pending-then-approved paths), Compensation modal's three new scope/type combinations, or the Vehicle Unavailable no-move guards.
- Check `docs/todo.md` for older unresolved business-logic findings (GST/pricing calculation duplication, negotiated-discount clamping, etc.) not touched this session.
