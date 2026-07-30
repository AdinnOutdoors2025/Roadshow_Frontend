# Campaign Calculator — Business Logic & Skill Reference

This file is the single source of truth for how the Operation Handling → Campaign Calculator module actually works. Read this before making any changes; when the user gives a correction, update this file too so it never drifts from the real code.

## 1. What it is

Campaign Calculator is a day-by-day billing + running-hours dashboard for an order's `onRoad` stage. For every calendar day between a vehicle-type slot's `fromDate` and `toDate` (plus any granted extension days), it shows:
- how much each vehicle-type slot cost that day (Price Breakdown)
- how many hours each driver/vehicle ran, had issues, was unavailable, or was replaced
- whether that day's downtime loss has been compensated (FOC / campaignCompensationArray), and how

Frontend: `src/app/admin/operation-handling/CampaignCalculatorTab.tsx` (main tab), `CompensationModal.tsx` (add compensation), `LogHoursModal.tsx` (Mark Absent / Log Daily Hours), `PoolWindowModal.tsx` (extra KM/hour pool).
Backend: `roadshowbackend/roadshow_Backend/controllers/Adminordercontroller/Adminordercontroller.js`, function `getCampaignCalculator` (~line 3555).

## 2. Core data model (all on the `Order` document)

- **`bookingItems[]`** — one entry per vehicle-type slot: `perDayRentalCost`, `driverCharges`, `promoterChargePerDay`, `rtoCharges`, `extraKmCost`/`extraHourCost` (purchased pool, flat one-time fee), `fromDate`/`toDate`, `quantity`.
- **`onRoadExecutionArray[]`** — driver/vehicle entries per slot (`vehicleIndex`, `entryId`, `entryStatus: active|removed`, `vehicleRegistrationNumber`, `driverName`).
- **`dailyHoursLogArray[]`** — one row per entry per day, created via Log Daily Hours / Mark Absent: `runningHours`, `absentHours`, `campaignHours`, `billingMode: full|partial|absent`, `isAbsentDay`, `absentDayResolution: extend|close`.
- **`onRoadIssues[]`** — issue reports per entry (`reportedAt`, `resolvedAt`, `status: open|resolved`) — used only for the frontend's live display timeline, not billing.
- **`onRoadUnavailableHistory[]`** — replacement/unavailability events per entry (used for both display and, since this session's fix, downtime totals).
- **`campaignCompensationArray[]`** — actual granted compensation: `compensationType: hours|days`, `compensationValue`, `vehicleIndex`, `entryId` (null = campaign-level), `fromDate`/`toDate`.
- **`campaignClosureArray[]`** — FOC (Free-of-Cost) requests/approvals: `type: "foc"`, `status: pending|approved`, `focPurpose: absent-day|compensation-hours|compensation-days`, `compensationVehicleIndex`, `compensationEntryId`, `compensationHoursValue`, `compensationDaysValue`, `focHistory[]`, `focChatMessages[]`, `isAdminCreated`.

## 3. Daily billing calculation (backend `getCampaignCalculator`, per vehicle-type per day)

```
baseDailyRate       = perDayRentalCost + driverCharges
dailyVehicleAmount   = activeCount * baseDailyRate                     // flat — NOT affected by billingMode
compensationToday    = Σ over activeEntries: baseDailyRate * entry.absentHours / entry.campaignHours
                        // applies regardless of billingMode (full/partial) — driven purely by
                        // whatever absentHours the staff's logged start/end time produced
rtoAppliedToday       = rtoCharges (only on first campaign day), scaled by avgBillingFactor
promoterAmountToday   = promoterCost share for today, scaled by avgBillingFactor
extraKmPoolFeeToday / extraHourPoolFeeToday = purchased pool flat fee (first day only)
extraKmCost / extraHourCost = overage billed on the day it was logged

avgBillingFactor (only scales RTO + Promoter, NOT Rental):
  full    -> 1
  partial -> runningHours / expectedCampaignHours   (e.g. 6h/8h = 0.75)
  absent  -> 0
  (averaged across all activeEntries in the slot for that day)

itemDayTotal = dailyVehicleAmount + extraKmCost + extraHourCost + rtoAppliedToday
             + promoterAmountToday - compensationToday
```

**Key gotcha confirmed this session:** "Bill this day as Full/Partial" (billingMode) only changes the RTO/Promoter scaling factor. It does NOT proportionally reduce the Rental+Driver line — that line is always flat `activeCount * baseDailyRate`. The only thing that reduces Rental for a given day is `compensationToday`, which is driven entirely by `absentHours` (= campaignHours − runningHours) on that entry's `dailyHoursLogArray` row, independent of billingMode.

## 4. Two parallel running/issue/unavailable calculations — don't confuse them

- **Billing-side (backend, authoritative for money):** `dailyHoursLogArray` entry — staff manually types Start Time/End Time in Log Daily Hours; `runningHours`/`absentHours` are derived from that exact submitted window and stored. This is what `compensationToday` uses.
- **Display-side (frontend, `CampaignCalculatorTab.tsx`, purely visual):** an event-derived timeline built from `onRoadIssues` + `onRoadUnavailableHistory` timestamps, clipped to "now" for the current in-progress day. This produces the "Xh run / Yh issue / Zh unavailable" numbers shown on each entry card and in "Combined Running Today".

**These two do not feed each other.** If a driver has a real mid-shift issue logged in `onRoadIssues`, that time is NOT automatically subtracted from the `dailyHoursLogArray` entry unless the staff manually re-enters a shorter running window / larger absentHours when submitting Log Daily Hours. So a staff member who logs "04:30–12:30, full 8h" without accounting for a 1h issue in between will show "1h issue" in the UI but get zero billing deduction for it, because the stored `runningHours=8, absentHours=0` is what compensation math reads. This is a known, currently-unaddressed gap — not a bug in the arithmetic, but a manual-accuracy dependency worth flagging if the business wants auto-deduction later.

## 5. `downtimeHoursToday` — fixed this session

Originally `issueHoursToday`/`unavailableHoursToday` only summed `activeEntries`, ignoring `releasedToday` (an old vehicle replaced partway through the day). This meant a replaced vehicle's pre-replacement downtime silently vanished from the loss total, even though `combinedRunningHoursToday` correctly included its running hours. Fixed by summing `[...activeEntries, ...releasedToday]` for both issue and unavailable hours, matching how running hours already worked. `compensationStatus.lossHours` reads this same fixed value, so no separate fix was needed there.

## 6. FOC (Free-of-Cost) approval system

Three `focPurpose` types, all going through the same approval rule:

| focPurpose | Raised from | What gets deferred until approval |
|---|---|---|
| `absent-day` | Mark Absent → "Extend Campaign +1 Day" | the campaign end-date extension itself |
| `compensation-hours` | Compensation modal, hours type | `campaignCompensationArray` grant (hours) |
| `compensation-days` | Compensation modal, "Extra Campaign Days" | `campaignCompensationArray` grant (days) + schedule extension |

**Role gating rule (applies to all three):** `Number(req.user.isAdmin) === 1` (super admin) → `campaignClosureArray` entry created with `status: "approved"` immediately, and the real grant/extension is applied in the same request. Anyone else → entry created with `status: "pending"`; the grant is NOT applied yet. A super admin must later call `approveFocEntry`, which reads `focPurpose`/`compensationVehicleIndex`/`compensationEntryId`/`compensationHoursValue`/`compensationDaysValue` off the pending entry and applies the deferred grant at that point.

**Explicit business rule:** FOC requests/approvals must NEVER move `pipelineStatus`. The order stays in whatever stage it was in (e.g. `onRoad`); only the Client Closure tab's visibility is widened to show whenever any `campaignClosureArray` entry with `type: "foc"` exists, regardless of stage.

Key functions: `submitCampaignClosure` (~2024), `approveFocEntry` (~2200), `createAndApproveFocEntry` (~2307, super-admin-only manual shortcut, no `focPurpose`), `addDailyHoursLog` (~2853, creates `absent-day` FOC on Mark Absent extend), `addCampaignCompensation` (~3077, creates `compensation-hours`/`compensation-days` FOC).

## 7. Compensation Status — 3 states shown per vehicle/day in the Daily Timeline

Computed in `getCampaignCalculator`, exposed as `vehicles[].compensationStatus`:
- `state: "none"` — loss exists (`downtimeHoursToday > 0`), no compensation request at all. Amber banner + "Add Compensation" button.
- `state: "pending"` — a matching FOC request exists (`campaignClosureArray`, `focPurpose` compensation-hours/days, `status: "pending"`) covering this date, not yet approved. Sky-blue banner: "Requested, waiting for admin approval".
- `state: "approved"` — a matching `campaignCompensationArray` grant covers this date. Green banner: "Compensated (this date only)" or "(split across X → Y, Nh/day)" depending on whether `fromDate === toDate`.

Matching logic: same `vehicleIndex`, date falls within `fromDate`/`toDate`, and if the grant/request has an `entryId` it must match one of today's active/released entries (campaign-level grants with `entryId: null` apply to every entry in the slot).

## 8. Compensation Modal — 3 input flows (`CompensationModal.tsx`)

- **"This date only"** — always `compensationType: "hours"`, applies once to the day the modal was opened from (`detectedLossDate`).
- **"Split across a date range" + hours** — per-day extra-hours value, spread across an admin-chosen From→To range starting from that day.
- **"Split across a date range" + days ("Extra Campaign Days")** — no manual value entry; day count is derived as `toDate − campaignEndDate`. From Date is locked to the campaign end date.

All three now go through the FOC role-gate (as of this session's hours-FOC work) — "this date only" hours requests from non-super-admins also become pending FOC entries, not instant grants.

**Hours input UX (this session):** Hours/Minutes are two separate number inputs (not one decimal field), left blank by default (not auto-filled from the detected loss, so whoever applies it must type the real value after reading the "loss detected" banner). Reason auto-suggests text from whatever Hours/Minutes are typed, live-updating, but stops auto-updating the moment the admin/staff manually edits the Reason box themselves.

## 9. File map

| Concern | File |
|---|---|
| Daily Timeline tab, Price Breakdown, compensation/status banners | `src/app/admin/operation-handling/CampaignCalculatorTab.tsx` |
| Add Campaign Compensation modal | `src/app/admin/operation-handling/CompensationModal.tsx` |
| Mark Absent / Log Daily Hours modal | `src/app/admin/operation-handling/LogHoursModal.tsx` |
| Extra KM/Hour pool window | `src/app/admin/operation-handling/PoolWindowModal.tsx` |
| Client Closure tab, FOC History cards | `src/app/admin/operation-handling/ClientClosureTab.tsx`, `ClientClosureTabsecond.tsx` |
| Order Details modal shell, tab visibility rules | `src/app/admin/operation-handling/DetailsModel.tsx` |
| Kanban board, card-click tab routing, stage-move guards | `src/app/admin/operation-handling/page.tsx` |
| All backend billing/FOC logic | `roadshowbackend/roadshow_Backend/controllers/Adminordercontroller/Adminordercontroller.js` — `getCampaignCalculator` (~3555), `addDailyHoursLog` (~2853), `addCampaignCompensation` (~3077), `approveFocEntry` (~2200), `createAndApproveFocEntry` (~2307), `submitCampaignClosure` (~2024) |
| Schema | `roadshowbackend/roadshow_Backend/Models/AdminorderModel/Adminorder.js` — `campaignClosureSchema` (~474) |

## 10. Confirmed-but-not-yet-fixed gaps (revisit only if user raises them again)

- Issue/unavailable hours (`onRoadIssues`/`onRoadUnavailableHistory`) don't auto-feed into `dailyHoursLogArray.absentHours` — staff must manually account for real downtime when submitting Log Daily Hours, or billing won't reflect it.
- `compensationHours` (a campaign-compensation "hours" grant, distinct from `compensationToday`'s absentHours-based deduction) is purely informational in some code paths — double-check before wiring it into any new deduction logic that it can't double-count against an absent day's billing.
- Per-day "Estimated (Campaign Calculator)" breakdown (Estimated vs Actual vs Diff, vehicle-wise + day total) — accepted plan, not yet implemented.

## 11. Extra KM/Hours — per-entry resolution (fixed this session)

`extraKmDetailsArray` records are added per vehicle-type slot (`vehicleIndex`) AND per specific vehicle/driver entry (`entryId`, null = campaign-level). For a given day, the same slot can have overlapping records from **more than one vehicle registration** (e.g. two vehicles both booked under the same vehicle-type, each logging their own Extra KM/Hours for an overlapping date range).

**Old (buggy) behavior:** both the pool-balance calc (`extraKmBalanceByVehicle`, ~line 3706) and the actual per-day billing (`vehicles[].extraDetailsToday`, ~line 3899) filtered `extraKmDetailsArray` by `vehicleIndex` only, then picked a single "winner" (latest `addedAt`) across ALL matching records for that day — silently dropping any other vehicle's overlapping Extra KM/Hours entry from both the balance-used total and that day's billed cost.

**Fix (revised):** `resolveEffectiveExtraKmRecords(slotRecords)` (helper, ~line 3268) groups ALL of a slot's records by `entryId` (`"campaign"` bucket for `entryId: null`) and — **regardless of date range** — keeps only the single most-recently-added (`addedAt`) record per entryId. This is a full-replacement semantic, not a per-day overlap pick: adding Extra KM/Hours a second time for the same vehicle completely supersedes the first record for that vehicle, even for days the old record covered but the new one doesn't (e.g. old record 29→30 Jul, new record 29→29 Jul only — 30 Jul then has ZERO extra KM/Hours for that vehicle; it does NOT fall back to the old record's 30 Jul value). Different vehicles (different `entryId`) are never affected by each other's records and are always summed together for a shared day.

Precomputed once per vehicle-type slot (`effectiveExtraKmRecordsByVehicle`, built before the day loop in `getCampaignCalculator`, and inline per-vehicle in `extraKmBalanceByVehicle`), then each day just filters that slot's already-resolved effective records by date overlap. Applied in both usage sites (`extraKmBalanceByVehicle` loop ~line 3731 and `vehicles[].extraDetailsToday` loop ~line 3924). `extraDetailsToday` can contain more than one entry per day per vehicle-type slot (one per active vehicle) — frontend (`CampaignCalculatorTab.tsx` ~line 1226) already `.map()`s over it as an array, so no frontend change was needed.
