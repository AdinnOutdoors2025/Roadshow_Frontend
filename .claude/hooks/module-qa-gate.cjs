#!/usr/bin/env node
"use strict";

/**
 * TaskCompleted gate: blocks completion of any [MODULE] task unless
 * .qa/status/<task-id>.json exists and reports overall PASS with every
 * required category PASS or NOT_APPLICABLE. Non-[MODULE] tasks pass through
 * untouched. See COMMON_PROMPT.md / CLAUDE.md "Mandatory Module Completion QA".
 */

const fs = require("fs");
const path = require("path");

const MODULE_PREFIX = "[MODULE]";
const REQUIRED_CATEGORIES = [
  "smoke",
  "functional",
  "regression",
  "regex",
  "api",
  "security",
  "performance",
];
const ALLOWED_CATEGORY_VALUES = new Set(["PASS", "FAIL", "BLOCKED", "NOT_APPLICABLE"]);

function readStdin() {
  try {
    return fs.readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function allow() {
  process.exit(0);
}

function block(reason) {
  process.stderr.write(`[module-qa-gate] ${reason}\n`);
  process.exit(2);
}

function findRepoRoot(startDir) {
  let dir = startDir;
  for (;;) {
    if (fs.existsSync(path.join(dir, ".git"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return startDir;
    dir = parent;
  }
}

function main() {
  const raw = readStdin();
  if (!raw.trim()) {
    // No payload at all — nothing to gate on, let the harness proceed.
    return allow();
  }

  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    // Malformed hook input isn't this hook's problem to enforce against.
    return allow();
  }

  const taskId = input.task_id ?? input.taskId ?? input.id;
  const taskSubject =
    input.task_subject ?? input.taskSubject ?? input.subject ?? input.title ?? "";

  if (typeof taskSubject !== "string" || !taskSubject.startsWith(MODULE_PREFIX)) {
    // Not a [MODULE] task — normal tasks are never gated.
    return allow();
  }

  if (taskId === undefined || taskId === null || taskId === "") {
    return block(
      `Task subject "${taskSubject}" starts with ${MODULE_PREFIX} but no task_id was provided in hook input — cannot locate a QA status file. Run the module-qa subagent and produce .qa/status/<task-id>.json before completing this task.`
    );
  }

  const repoRoot = findRepoRoot(__dirname);
  const statusPath = path.join(repoRoot, ".qa", "status", `${taskId}.json`);

  if (!fs.existsSync(statusPath)) {
    return block(
      `Module task "${taskSubject}" (id ${taskId}) has no QA status file at .qa/status/${taskId}.json. Invoke the module-qa subagent and let it complete before marking this module done.`
    );
  }

  let status;
  try {
    status = JSON.parse(fs.readFileSync(statusPath, "utf8"));
  } catch (err) {
    return block(
      `Module task "${taskSubject}" (id ${taskId}): QA status file at ${statusPath} is not valid JSON (${err.message}). Re-run module-qa to regenerate it.`
    );
  }

  if (String(status.taskId) !== String(taskId)) {
    return block(
      `Module task "${taskSubject}" (id ${taskId}): QA status file taskId "${status.taskId}" does not match this task's id "${taskId}". Refusing to trust a mismatched status file.`
    );
  }

  if (status.taskSubject !== taskSubject) {
    return block(
      `Module task "${taskSubject}" (id ${taskId}): QA status file taskSubject "${status.taskSubject}" does not exactly match this task's subject "${taskSubject}". Re-run module-qa against the current task subject.`
    );
  }

  if (!status.reportPath || !fs.existsSync(path.join(repoRoot, status.reportPath))) {
    return block(
      `Module task "${taskSubject}" (id ${taskId}): QA status file references a report at "${status.reportPath}" that does not exist. Re-run module-qa to regenerate the report.`
    );
  }

  const categories = status.categories || {};
  const missing = REQUIRED_CATEGORIES.filter((c) => !(c in categories));
  if (missing.length > 0) {
    return block(
      `Module task "${taskSubject}" (id ${taskId}): QA status is missing required categories: ${missing.join(", ")}.`
    );
  }

  const invalid = REQUIRED_CATEGORIES.filter(
    (c) => !ALLOWED_CATEGORY_VALUES.has(categories[c])
  );
  if (invalid.length > 0) {
    return block(
      `Module task "${taskSubject}" (id ${taskId}): QA status has invalid category values for: ${invalid
        .map((c) => `${c}=${categories[c]}`)
        .join(", ")}.`
    );
  }

  const failedOrBlocked = REQUIRED_CATEGORIES.filter(
    (c) => categories[c] === "FAIL" || categories[c] === "BLOCKED"
  );
  if (failedOrBlocked.length > 0) {
    return block(
      `Module task "${taskSubject}" (id ${taskId}): the following QA categories are not passing: ${failedOrBlocked
        .map((c) => `${c}=${categories[c]}`)
        .join(", ")}. See ${status.reportPath}. Fix the module-caused failures and re-run module-qa before completing this task.`
    );
  }

  if (status.overall !== "PASS") {
    return block(
      `Module task "${taskSubject}" (id ${taskId}): overall QA status is "${status.overall}", not PASS. See ${status.reportPath}.`
    );
  }

  return allow();
}

main();
