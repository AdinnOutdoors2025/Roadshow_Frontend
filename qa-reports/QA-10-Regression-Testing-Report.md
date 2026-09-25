# QA-10 — Regression Testing Report

Scope: full client-site regression re-walk after this cycle's fixes.

## Status: BLOCKED

A meaningful regression pass requires trustworthy stage results to regress against. With the
P0 finding (`QA-MASTER-STATUS.md`) — `src/BaseUrl.tsx` silently bypassing the e2e mock and
hitting the live production backend — stages 5–8, 11, 13, 14 are not currently trustworthy,
so there is nothing solid yet to confirm "still works" against for those flows.

## What was safely regression-checked this cycle
- QA-01–04 (build/typecheck/lint, unit tests, smoke, functional) were re-validated as still
  current against the working tree (no client-code changes since their original pass except
  the 3 test-file fixes below, which don't touch app source).
- The 3 test-file fixes (`client-responsive.e2e.spec.ts` ×2, `client-negative-security.e2e.spec.ts` ×1)
  were individually reran serially post-fix; 2 now pass cleanly, 1 (captcha) surfaced the P0
  issue instead of a test bug — see QA-08.
- No app/source files were modified this cycle, so there is nothing new to regress in the
  traditional sense — the changes are all test-code.

## Final Status: **PENDING** — re-run once the P0 baseUrl issue is resolved; nothing to regress from app changes this cycle since none were made.
