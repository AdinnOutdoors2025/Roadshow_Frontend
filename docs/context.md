# Project Context

_Last updated: 2026-09-03_

## Status as of 2026-09-03

Cross-repo bugfix + feature session (frontend `karthi-claude` + backend `karthi-claude`). Full detail in `progress.md`'s 2026-09-03 entry; short version:

- Fixed the booking-summary PDF loader race, a duplicate campaign-request mail bug (now guarded by `Order.campaignMailSent`), and admin-edited booking dates not syncing to the client-facing tracking view.
- Separated PO-document local storage from Vehicle Onboarding's (`PO_DOCUMENT_LOCAL_PATH` vs `LOCAL_UPLOAD_PATH`), no migration of existing files.
- Added order-creation SMS (Nettyfish, Adinn Outdoors DLT template with order ID) to admin- and customer-created orders, for both admin and customer — deliberately kept fully separate from the existing OTP SMS flow after an early draft accidentally conflated them.
- Fixed the Contact page's mail image showing "not available" (missing schema fields silently dropped by Mongoose, plus a PHP-side fix identified but **not yet applied** — must be done by the user, see `todo.md`).
- Fixed the Contact page's toast being hidden behind the Navbar — root cause was a transformed ancestor (`GlobalSmoothScroll`'s `#smooth-content`) breaking `position: fixed`, same trap `Navbar` already avoids by portaling to `document.body`. Toaster relocated to root layout via `ContactToastProvider`/`GlobalToastGate`.
- Fixed Next.js dev-overlay noise on the "already submitted today" (409) case by using early `return` instead of `throw` for that expected outcome.
- See `todo.md`'s "Carried forward from 2026-09-03 session" for what's still outstanding (PHP fix, mail-image asset deploy + swap-back, dedup mismatch, mail-failure UX inconsistency).

## Status as of 2026-08-27 (docs reconciliation)

This file (plus `progress.md`/`todo.md`) went stale for about a month — everything below this section was last true as of 2026-07-22/23. In the meantime this became an **active multi-contributor repo**: commits since 07-23 come from `vignesh`, `karthika`, `Arun Prasath`, and `SathishKumar Dhanasekaran`, merged through feature branches (`vignesh_claude`, `karthi-claude`, `arun_claude`) into `collab_June_2026` (frontend) / `collab_backend` (backend). Do not assume solo-dev context for this repo going forward — check `git log` / recent authors before assuming a file's current shape.

**Frontend** (`Roadshow_Frontend`, ~90 commits 07-23→08-27) and **Backend** (`roadshow_Backend`, ~50 commits) both moved in lockstep on the same features (paired commits, same day, matching messages), touching:

- **Campaign Calculator / Operation Handling**: daily timeline summary, running-hours math, extra-charges, timeline-hours redesign, handler reassign/overview, "onroad vehicle only" filtering for timeline/calculator (2026-08-23).
- **Invoice generation**: built, reworked, discount added, then partially removed from Sales Handling, then rebuilt again — iterated heavily across the month (see individual commits if you need the exact current state of invoice logic).
- **RTO calculation**: added, removed ("Order RTO Calculation remove", 08-12; "invoice rto calculation removes", 08-14 backend), then reintroduced ("rto chages implement", 08-25) — history is back-and-forth. Confirmed via grep that RTO logic is still present in `order-creation/{VehicleListStep,print,orderdetails,VehicleFormModal,OrderSummaryStep}.tsx` as of today — **re-confirm current intended RTO behavior with the user before changing it**, don't trust either the "removed" or "added" commit message in isolation.
- **Order creation**: campaign-location field, vehicle-type name/id handling fixes, date-conflict handling, vehicle list/summary vehicle-type display fix (08-26).
- **Package management + vehicle inventory**: `package-management/*` module now exists (page/FormModal/DeleteModal); onroad available/unavailable vehicles split into separate handling (08-25).
- **Sales Handling**: notification tab added (`VehicleAvailabilityNotificationTab.tsx`, confirmed present), project-code creation flow, role-permission changes, PO/invoice work.
- **Public site** (`roadshow/*`, `components/Client/*`): full home page revamp, My Bookings pages, Thank You page, campaign details + order creation flow for customers, GPS tracking page (rebuilt UI + Vamosys history API), Terms & Conditions, agency login, email PDF generation, and — as of today (08-27) — vehicle Flex/LED specs split into a separate tab in the public `VehicleSpecModal`.
- **Auth/infra**: CORS config changes, baseurl updates (multiple rounds), client-auth model changes, role-permission redesign, admin login/profile page redesign (08-24).
- **Confirmed still NOT implemented**: the per-day "Estimated (Campaign Calculator)" breakdown on the Daily Timeline tab — grepped, no `estimatedTotalAmount`/`perDayEstimate` code found. Still an open item (see `todo.md`).
- **QA note**: `.qa/status/20260812-user-auth.json` records the "User Authentication" module as QA-`BLOCKED` (an external git reset was reported to have wiped its source/test files mid-run on 08-12). Checked today — `src/app/user-auth/*` equivalents, `src/app/utils/userAuth.tsx`, `vitest.config.ts`, `playwright.config.ts` all exist on disk now, so this looks resolved, but the status JSON itself was never updated — flag to the user if a fresh `[MODULE]` QA gate is needed on this.

This reconciliation is commit-message-level (git log across both repos), spot-checked with a handful of greps — not a full line-by-line code re-audit. Treat specifics above as a starting map, not verified business-logic truth; re-read the actual file before making claims about exact current behavior.

## Historical status (as of 2026-07-22/23 — superseded by the above, kept for record)

## Current project status

Roadshow Admin frontend repo is stable and under active feature/bugfix work on the public `roadshow/CampaignRequest` page and its auth context. No build/lint/test run was performed this session — changes were reviewed as diffs and applied incrementally, file by file.

## Completed tasks (this session)

1. **"Review Your Order & Confirm" popup** — Submit on `CampaignRequest` no longer saves immediately. It now validates the form (`handleReviewSubmit`) and opens a review modal (reusing the existing `Modal` / `useModal` from `src/components/ui/modal`) showing Contact Details, Selected Vehicles, and a Pricing Summary. "Edit Details" closes the modal; "Send Request" (`handleConfirmSend`) runs the original save logic (sessionStorage payload + success toast) and then closes the modal. Company Name row was intentionally **left out** — `clientDetails` has no `companyName` field anywhere in the form.
2. **Carousel prev/next buttons disable at the ends** — new `canScrollLeft`/`canScrollRight` state, driven by a `scroll`/`resize`-listening effect on `productScrollerRef`, wired to `disabled` on the nav buttons; matching `:disabled` styles added to `.rdsw_crfProdDetailsNavigationButton` in `page.css`.
3. **Vehicle quantity +/− buttons disable at limits** — "−" disables at quantity 1 (already the floor via `Math.max(...,1)`, now visible); "+" disables once quantity reaches `vehicle.availableVehicles` (confirmed as the correct cap via user decision).
4. **Selected vehicles float to the front of the carousel** — new `sortedVehicles` memo (selected first, stable order otherwise) replaces the raw `vehicles` list in the card map, combined with a plain-CSS/JS **FLIP animation** (`cardNodesRef` + `cardPositionsRef` + a `useLayoutEffect`) so cards slide (320ms ease) into their new position instead of jumping. No new dependency added (framer-motion was considered and declined).
5. **Fixed a real refresh/session bug in `AuthContext.tsx`** — `loginUser` was writing to `localStorage["roadshow_user"/"roadshow_token"]` while the mount effect and `logoutUser` read/cleared plain `"user"/"token"`. This silently broke session restore on every refresh. Fixed to consistent `roadshow_user`/`roadshow_token`/`roadshow_session_expiry` keys.
6. **Added session expiry + idle auto-logout to `AuthContext.tsx`** — login session now expires after `NEXT_PUBLIC_SESSION_DURATION_MINUTES` (default **120 min / 2 hours**, per user decision); an idle timer logs the user out and shows `"You've been logged out due to inactivity."` after `NEXT_PUBLIC_IDLE_TIMEOUT_MINUTES` of no mouse/keyboard/scroll/touch activity (default **30 min**, per user decision).
7. **Fixed a login-popup race condition** — `AuthProvider` (parent) restores the session from localStorage in a `useEffect`, but `CampaignRequestPage` (child, deeper in the tree) fired its own "prompt login if no user" effect first on mount, before the restore had run — so the login popup opened even for an already-valid session (form fields would still populate correctly a moment later, which is what made it confusing). Fixed by adding an `authLoading` flag to `AuthContext` (`true` until the restore check completes) and having `CampaignRequestPage`'s prompt effect bail out while `authLoading` is true.

## Pending tasks

- Live-test all of the above in the browser (`npm run dev` → `/roadshow/CampaignRequest`): Submit → review popup → Send Request; carousel arrows at both scroll ends; quantity buttons at min (1) and max (`availableVehicles`); adding/removing vehicles to see the FLIP slide; refresh while logged in (popup should no longer appear); idle 30 min to confirm the auto-logout toast.
- `page.css` was modified outside this session (by the user or a linter, per tooling note) — not reverted, not yet diffed against what this session's carousel `:disabled` rule expects. Worth a quick visual check that nothing conflicts.
- No `.env` changes were made — `NEXT_PUBLIC_SESSION_DURATION_MINUTES` / `NEXT_PUBLIC_IDLE_TIMEOUT_MINUTES` are optional overrides; defaults (120 / 30) apply if unset.

## Current architecture

See `CLAUDE.md` for the full reference. Points most relevant to this session:

- `CampaignRequestPage` (`src/app/roadshow/CampaignRequest/page.tsx`) consumes the **legacy `AuthContext`** (`src/context/AuthContext.tsx`, `localStorage`-based) — not the admin cookie/JWT flow, not the OTP customer flow. All auth work this session was scoped to that one context.
- Modal pattern: `src/components/ui/modal` (`Modal` component) + `src/hooks/useModal.ts` (`isOpen`/`openModal`/`closeModal`) — now used by both the review-order popup here and elsewhere in admin.

## Important business rules

- **Sales pipeline** (`sales-handling/page.tsx`): `enquiry → needAnalysis → proposalPriceQuote → negotiationReview → closedWon → projectCodeCreation`, with `closedLost` as a terminal exit.
- **Operations pipeline** (`operation-handling/page.tsx`): `todo → projectExecution → onRoad → vehicleUnavailable → clientClosure → closedWon / closedLost`. Distinct from the sales pipeline.
- **Order pricing**: promoter cost = `NEXT_PUBLIC_DEFAULT_PROMOTER_CHARGE` (default ₹1000) × totalDays × promoterQuantity.
- **Discount cap**: client-side only, `NEXT_PUBLIC_MAX_DISCOUNT_PERCENT` (default 15%).
- **Vehicle availability**: check both `statusAvailability.currentStatus` and `activeStatus`. `availableVehicles` (a count, distinct from `statusAvailability`) is what now caps campaign-request quantity per vehicle.
- **Uploads** (sales-handling): images ≤ 5MB, other documents ≤ 10MB.

## Decisions taken

- **Company Name row**: omitted from the review-order modal — no `companyName` field exists in `clientDetails` today; add a real input first if this is wanted later.
- **Max quantity source**: `vehicle.availableVehicles` from the vehicles API.
- **Session length**: 2 hours (`NEXT_PUBLIC_SESSION_DURATION_MINUTES`, default `"120"`).
- **Idle timeout**: 30 minutes (`NEXT_PUBLIC_IDLE_TIMEOUT_MINUTES`, default `"30"`).
- **Reorder animation**: plain CSS/JS FLIP, no new dependency (framer-motion declined).
- **Confirm-before-edit workflow** (standing, from a prior session): propose changes before writing. This session it evolved further as requested: plain-text diff → GitHub-PR-style Artifact → VS Code diff-editor-style Artifact → finally applying directly and pointing to VS Code's own native Source Control diff/gutter instead of a separate Artifact link, one hunk at a time when asked.

## Files modified

| File | Change |
|---|---|
| `src/app/roadshow/CampaignRequest/page.tsx` | Review-order modal + handlers; carousel scroll-state effect + disabled nav buttons; quantity button disabled states; `sortedVehicles` + FLIP animation refs/effect; `authLoading` consumed in the login-prompt effect |
| `src/app/roadshow/CampaignRequest/page.css` | `:disabled` styles for `.rdsw_crfProdDetailsNavigationButton`; plus out-of-session edits by user/linter (not authored by this session) |
| `src/context/AuthContext.tsx` | Fixed `localStorage` key mismatch; added session expiry, idle auto-logout, `authLoading` flag |

## Known issues (carried forward, not caused by this session)

- `admin/Vehicles/Vehicle_Onboarding/page.tsx` and `sales-handling/page.tsx` are multi-thousand-line monolith files with commented-out legacy blocks — read fully before editing.
- API path prefixing is inconsistent (`api/...` vs bare) — existing backend quirk, not a bug to fix from the frontend.
- No test runner configured in the repo.
- Client-side-only validation (discount cap, promoter charge default, JWT expiry check, quantity cap) — backend enforcement is out of this repo's visibility.

## Next session TODO

- [ ] Run `npm run dev` and manually verify all 7 changes listed under "Completed tasks" at `/roadshow/CampaignRequest`.
- [ ] Confirm `page.css`'s externally-modified state doesn't conflict with the new `:disabled` nav-button rule.
- [ ] If Company Name is actually wanted in the review popup, add a real `companyName` field to `clientDetails` + the left-side form first.
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
