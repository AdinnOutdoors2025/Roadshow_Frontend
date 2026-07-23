# TODO

## Open

- [ ] Verify both `roadshow/CampaignRequest` button color changes ("Add Vehicle" → red, "Add More Vehicle" → blue) render correctly in the browser (dev server not run this session).
- [ ] Confirm the "Vehicle added" (selected) state still looks right next to the new red unselected button state.
- [ ] Live-test the "Review Your Order & Confirm" popup, carousel disable-at-ends, quantity disable-at-limits, and selected-vehicle reorder/FLIP animation on `CampaignRequest`.
- [ ] Refresh the page while logged in to confirm the login popup no longer appears (race-condition fix), and confirm session survives a refresh within 2 hours.
- [ ] Leave the page idle 30 minutes to confirm the "logged out due to inactivity" toast fires.
- [ ] If Company Name is wanted in the review popup, add a real `companyName` field to the form first (currently omitted — no field exists).
- [ ] Double-check `page.css`'s externally-modified state doesn't conflict with the new `:disabled` nav-button rule.

## Backlog / carried-forward known issues

- [ ] `admin/Vehicles/Vehicle_Onboarding/page.tsx` and `sales-handling/page.tsx` are multi-thousand-line files with commented-out legacy code — candidates for cleanup if ever revisited (read fully before touching).
- [ ] No test runner is configured in the repo — needed before any automated tests can be added.
- [ ] API path prefixing (`api/...` vs bare) is inconsistent across the backend — not actionable from this repo, just something to keep matching per-endpoint.
