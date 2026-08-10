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
