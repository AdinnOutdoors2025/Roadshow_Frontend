# Project Context

## Current Project
Roadshow Campaign Management System — Next.js 16 (App Router) admin dashboard + public site, backed by a separate Express/MongoDB API at `F:\roadshowbackend\roadshow_Backend`.

## Current Status
Actively adding business-process features to the Sales Handling and Operation Handling modules: handler handover/reassignment tracking and PO document correction with audit history.

## Completed Tasks (this session)
- **Handler handover/reassignment** (both Sales Handling and Operation Handling):
  - Backend: `handlerAssignmentSchema` in `Models/AdminorderModel/Adminorder.js`, fields `handlerAssignmentHistory`/`originalSalesHandlerName` (sales) and `opsHandlerAssignmentHistory`/`originalHandlerName` (ops).
  - Controllers: `reassignHandler`/`resolveHandlerHandover` (Salesordercontroller.js), `reassignOpsHandler`/`resolveOpsHandlerHandover` (Adminordercontroller.js).
  - Routes: `PATCH /sales/pipeline/:id/reassign-handler`, `PATCH /sales/pipeline/:id/handover/:assignmentId/resolve`, `PATCH /admin/pipeline/:id/reassign-handler`, `PATCH /admin/pipeline/:id/handover/:assignmentId/resolve`.
  - Frontend: Reassign modal + handover history (card-styled, status badges) in `SalesDetailDrawer.tsx` (sidebar) and `OverviewTab.tsx` (operation-handling, own card). Both use the reusable `DatePicker` (`src/app/utils/datepicker.tsx`) for Leave Start/End, with explicit `minDate`/`maxDate` since that component's defaults are age-based (birthdate use case).
- **PO Document correction** (Sales Handling → "PO Document" tab, backed by `closedWonArray`, not `poCommentsArray`):
  - Backend: `poDocumentEditSchema`/`poDocumentEditHistory` field; `updatePODocument` controller edits the latest `closedWonArray.salesPoDocument`, open to any authenticated user (no admin gate), requires a reason, and is **blocked server-side** once `salesPipelineStatus === "projectCodeCreation"` (checked by stage, not just `projectCodeArray.length`, since the array only populates after code is saved).
  - Route: `PATCH /sales/pipeline/:id/po-document`.
  - Frontend: `DocumentsTab` in `SalesDetailDrawer.tsx` shows Edit + Edit History (card-styled, reuses `DocItem` for document preview/download) under the "PO Documents" section; Edit button hidden using the same stage-based `hasProjectCode` check.

## Important Business Rules
- **PO document lock**: correction window closes the moment `salesPipelineStatus` becomes `"projectCodeCreation"` — not when `projectCodeArray` gets its first entry (those happen at different times).
- **Handover model**: reassignment can be `isTemporary` (requires leave start/end dates) or permanent; temporary handovers must be explicitly resolved later (`Return` → reverts to previous handler, `Make Permanent` → stays with new handler). Every reassignment and resolution is logged, never overwritten.
- Env `NEXT_PUBLIC_API_BASE` needs a trailing slash; call sites do `` `${API_BASE}sales/...` `` / `` `${API_BASE}admin/...` `` with no leading slash.
- Backend mount paths: Sales routes under `/sales`, Admin/ops order routes under `/admin` (see `VehicleMain.js`).

## Decisions Taken
- PO document edit is open to **admin and handler both** (not admin-only) — user explicitly requested this after initially asking for admin-only.
- Handler handover UI/backend pattern is deliberately duplicated (not shared) between Sales and Operation Handling because they operate on different order fields (`salesHandlerName` vs `handlerName`) and different pipelines.

## Files Modified (this session)
Backend (`F:\roadshowbackend\roadshow_Backend`):
- `Models/AdminorderModel/Adminorder.js`
- `controllers/Salesordercontroller/Salesordercontroller.js`
- `Routes/Salesorderroutes/salesorderRoutes.js`
- `controllers/Adminordercontroller/Adminordercontroller.js`
- `Routes/AdminorderRoutes/AdminorderRoutes.js`

Frontend (`f:\roadshowfrontend\Roadshow_Frontend`):
- `src/app/admin/sales-handling/SalesDetailDrawer.tsx`
- `src/app/admin/sales-handling/CodeCreationTab.tsx` (reverted an incorrect earlier addition here)
- `src/app/admin/operation-handling/OverviewTab.tsx`
- `src/app/admin/operation-handling/DetailsModel.tsx`

## Known Issues / Gotchas Hit This Session
- A field-placement bug: adding `opsHandlerAssignmentHistory` initially landed inside `salesPipelineLogSchema` (a per-log sub-document) instead of the top-level `orderSchema`, because two identical `handlerName: { type: String, default: "" }` lines exist in the file — always disambiguate with surrounding context before editing schema fields with generic names.
- `getOrdersByPipeline` (ops) uses an explicit `.select(...)` field projection — any new order-level field must be added there too or it silently won't reach the frontend even though it saved to Mongo correctly.
- Backend uses `nodemon` (`npm run dev`) — model/controller/route changes require the process to actually restart; if it doesn't, you get `Cannot read properties of undefined` errors that look like a code bug but are actually a stale schema in memory.

## Next Session TODO
- User has not yet requested further changes; check `docs/todo.md` for anything logged there before assuming this is done.
