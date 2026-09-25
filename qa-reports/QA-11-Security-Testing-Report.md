# QA-11 — Security Testing Report (Client Scope)

Scope: `tests/e2e/client-negative-security.e2e.spec.ts`, `test.describe("QA-11 Security (client scope)")`.
See `QA-MASTER-STATUS.md` for the P0 baseUrl/production-exposure finding.

## Total Test Cases: 5
- Booking fields containing HTML render as inert text, no XSS execution: **passed**.
- `view-summary` refuses a booking owned by another customer: **passed**.
- No `NEXT_PUBLIC_*`/secret env names leak into served HTML: **passed**.
- No Authorization header sent when signed out: **passed**.
- Contact form validates email/contact format client-side before any POST: **passed** (this
  one never reaches `submitEnquiry`, so it's unaffected by the P0 baseUrl issue).

## Trustworthiness caveat
The first two tests seed `state.bookings` locally and expect the page to render *that*
fixture — but `my-bookings`/`view-summary` fetch via `baseUrl` (production, not the mock —
P0 finding). A pass here shows the page didn't execute injected HTML/didn't leak another
customer's real production data to this session, which is still a meaningful (arguably
stronger) security signal than the mock would have given — but it is not proof the client
correctly handles the exact fixture payload the test authors intended.

## No new findings
No XSS, no secret leakage, no cross-customer data exposure, no auth-header leak observed in
this cycle's runs (production or mock). The client-side format validation gate on Contact
(email/contact regex) still correctly blocks invalid submissions before any network call,
independent of the captcha/baseUrl issues affecting the duplicate-submit test (QA-08).

## Changes Made
None.

## Final Status: **PARTIAL** — no security regressions found; full confidence pending a safe rerun per the P0 fix, since 2 of 5 tests currently validate against real (not fixture) data.
