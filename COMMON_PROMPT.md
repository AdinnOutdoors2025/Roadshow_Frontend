# Module Completion QA — Common Prompt

This file is a reusable, stack-agnostic policy for gating feature/module completion behind a QA workflow. It's designed to be copied verbatim into any other project's `CLAUDE.md` (or an equivalent instructions file) to reproduce the same behavior there.

## Core rule

```
Do not run QA after every prompt.
Do not run QA after every file edit.
Do not run QA for incomplete features.
Only execute module QA when a [MODULE] task is actually ready for completion.
```

The full QA workflow (Smoke, Functional, Regression, Regex/Input Validation, API, Security, Performance) is a **module completion gate**, not an every-turn hook. It must never run:

- after every prompt
- after every code change
- after every file edit
- while a module is still being developed
- for small bug fixes, CSS/UI tweaks, refactors, renames, typo fixes, debugging a single error, or documentation changes

It runs exactly once a logical module/feature is fully implemented and is about to be marked complete.

## Naming convention

Track module-level work with a task subject beginning:

```
[MODULE] <Module Name>
```

Examples: `[MODULE] Authentication`, `[MODULE] Booking`, `[MODULE] Notification Center`, `[MODULE] Dashboard`, `[MODULE] Payment`.

Anything without this prefix is normal work (bug fix, UI correction, refactor, partial implementation, research) and is never subject to the module QA gate.

## Workflow

```
[MODULE] <Name>
        ↓
Implementation
        ↓
Module implementation finished
        ↓
Invoke module-qa agent
        ↓
Smoke → Functional → Regression → Regex/Input Validation → API → Security → Performance
        ↓
Generate missing tests (in the project's OWN detected test framework — never hard-code Jest or any specific runner)
        ↓
Execute tests
        ↓
Generate report (.qa/reports/<task-id>-<module-slug>.md)
        ↓
Generate status JSON (.qa/status/<task-id>.json)
        ↓
   PASS? ──NO──→ keep module open → fix module-caused defects → re-run affected tests
                 → re-run Smoke + Regression → update report/status → re-check
   PASS? ──YES─→ allow module completion
```

## Result semantics

Each of the seven categories gets exactly one status: `PASS`, `FAIL`, `BLOCKED`, `NOT_APPLICABLE`.

- Overall `PASS` only when every category is `PASS` or `NOT_APPLICABLE`.
- One applicable `FAIL` → overall `FAIL`.
- Missing environment/credentials/tooling that blocks testing → `BLOCKED` for that category and overall. Never convert `BLOCKED` into `PASS`.
- Never fabricate a test result. A PASS must be backed by something actually run or read.

## Stack neutrality

Never hard-code a specific test framework. Detect what's already installed and prefer it (Jest, Vitest, Playwright, Cypress, Supertest, Node's built-in test runner, pytest, unittest, JUnit, xUnit/NUnit/MSTest, PHPUnit/Pest, Go test, Cargo test, or anything else). Do not install a new test framework unless the project genuinely has none, and even then only with the maintainer's explicit permission.

## Enforcement

A `TaskCompleted` hook checks, for any task whose subject starts with `[MODULE]`, that `.qa/status/<task-id>.json` exists, matches the task id and exact subject, references an existing report, and has `overall: PASS` with every required category `PASS` or `NOT_APPLICABLE`. Tasks without the `[MODULE]` prefix pass through untouched.
