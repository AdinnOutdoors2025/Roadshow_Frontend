# Business Rules

Living document of business rules discovered/introduced during development. Update as new rules are clarified or changed — don't let this drift from what the code actually enforces.

## Sales Handling

- **PO Document correction**: any admin or handler can correct the PO document on an order while it is in (or before) the `closedWon` stage. The moment the order's `salesPipelineStatus` becomes `projectCodeCreation`, no further corrections are allowed — enforced both client-side (button hidden) and server-side (API rejects). Every correction requires a reason and is versioned (old + new document, editor, timestamp) in `poDocumentEditHistory` — never silently overwritten.
- **Handler handover/reassignment**:
  - Reassignment can be temporary (e.g. handler on leave — requires leave start/end dates) or permanent.
  - A temporary handover must later be resolved: either "Return" (order goes back to the previous handler) or "Make Permanent" (stays with the new handler) — a manager decision, not automatic.
  - Full history is kept (`handlerAssignmentHistory`) — every reassignment and resolution is a new entry, nothing is overwritten.
- Discount % is clamped to `NEXT_PUBLIC_MAX_DISCOUNT_PERCENT` (env-driven business rule constant).
- Closed-Won → Closed-Lost reversal is allowed but should be treated as a high-impact action (a previously "won" deal, implying a PO/invoice, being reversed).

## Operation Handling

- **Ops handler handover**: identical mechanism to Sales handover, but against the ops pipeline's `handlerName` field (kept fully separate from `salesHandlerName`/`handlerAssignmentHistory` since they're different pipelines on the same order document).
- Kanban pipeline stages: `todo → projectExecution → onRoad → vehicleUnavailable → clientClosure → closedWon/closedLost`.
- GST is calculated at 18% (`Math.floor(taxable * 0.18)`) — currently duplicated in multiple places (Sales Handling tabs, Campaign Calculator) rather than a single shared calculator; a known consistency risk flagged during the business-improvement review, not yet fixed.

## Cross-Cutting

- Extra-KM/hour billing model differs between Order Creation (linear per-unit rate) and Operation Handling's Campaign Calculator (pooled allowance + overage) — flagged as a real pricing-consistency risk, not yet reconciled.

## Order creation (added 2026-09-03)

- **Campaign-request mail is sent at most once per order**: `Order.campaignMailSent` guards `sendCampaignRequestMail` (`Utils/campaignMailer.js`) — a later action on the same order (e.g. uploading a PO document after initial submission) must not trigger a second mail. Any new call site that might re-trigger this mail should go through the same shared function, not a direct duplicate call.
- **Order creation sends an SMS** (Nettyfish, DLT-compliant Adinn Outdoors template carrying the order ID) to both the admin (`ADMIN_SMS_NUMBERS`, comma-separated) and the customer, on both admin-created orders (`Adminordercontroller.js`) and customer/agency-submitted requests (`ClientRequestController.js`). SMS send failures are non-fatal — never block order creation. `SMS_MODE` env var controls local (log-only) vs `production` (actually sends) — defaults to local if unset.
- **OTP SMS is a separate, independent flow** from order-creation SMS — different template ID, different phone-formatting logic, different message text. Do not route OTP through the order-SMS utility (`Utils/orderSms.js`) or vice versa; they were deliberately kept apart per explicit decision after an earlier attempt conflated them.
- **Local file-storage paths are separated by module**, each on its own env var, not shared: Vehicle Onboarding images under `LOCAL_UPLOAD_PATH` (`public/uploads`), PO documents under `PO_DOCUMENT_LOCAL_PATH` (`public/po_doc_uploads`, its own top-level folder, added 2026-09-03). Existing files are not migrated when a new path is introduced — only new uploads use the new path.
