// Module QA — [MODULE] User Authentication (task 20260812-user-auth)
// Category: Regex / Input Validation
// Covers src/app/user-auth/validators.ts: EMAIL_REGEX, USERNAME_REGEX,
// MIN_PASSWORD_LENGTH, isValidEmail, isValidUsername, isValidPassword,
// passwordsMatch. Pure functions — no mocking required.

import { describe, it, expect } from "vitest";
import {
  EMAIL_REGEX,
  USERNAME_REGEX,
  MIN_PASSWORD_LENGTH,
  isValidEmail,
  isValidUsername,
  isValidPassword,
  passwordsMatch,
} from "@/app/user-auth/validators";

describe("MIN_PASSWORD_LENGTH", () => {
  it("is 6, matching the documented business rule", () => {
    expect(MIN_PASSWORD_LENGTH).toBe(6);
  });
});

describe("isValidEmail / EMAIL_REGEX", () => {
  it.each([
    "user@example.com",
    "first.last@example.co.in",
    "user+tag@example.com",
    "u@e.co",
  ])("accepts valid email %s", (email) => {
    expect(isValidEmail(email)).toBe(true);
  });

  it.each([
    "",
    "   ",
    "plainaddress",
    "@missinglocal.com",
    "missingdomain@",
    "missing@domain",
    "spaces in@email.com",
    "trailing@dot.",
    "double@@at.com",
  ])("rejects invalid email %j", (email) => {
    expect(isValidEmail(email)).toBe(false);
  });

  it("trims surrounding whitespace before testing", () => {
    expect(isValidEmail("  user@example.com  ")).toBe(true);
  });

  it("rejects null/undefined-shaped input gracefully when coerced to string", () => {
    // isValidEmail's declared type is string; guard the runtime behavior for
    // callers that pass through unchecked form values.
    expect(() => isValidEmail("" as string)).not.toThrow();
  });

  it("does not catastrophically backtrack on a long adversarial input", () => {
    const evil = "a".repeat(50000) + "@" + "b".repeat(50000);
    const start = Date.now();
    EMAIL_REGEX.test(evil);
    expect(Date.now() - start).toBeLessThan(1000);
  });

  it("handles unicode characters in the local part without throwing", () => {
    expect(() => isValidEmail("üser@example.com")).not.toThrow();
  });
});

describe("isValidUsername / USERNAME_REGEX", () => {
  it.each(["user", "User_Name1", "abcd", "a".repeat(20), "user_123"])(
    "accepts valid username %s",
    (username) => {
      expect(isValidUsername(username)).toBe(true);
    },
  );

  it.each([
    "",
    "abc", // 3 chars, below the 4-char minimum
    "a".repeat(21), // 21 chars, above the 20-char maximum
    "user name", // whitespace inside is not trimmed away, only edges are
    "user-name", // hyphen not allowed
    "user!name", // special char not allowed
    "üsername", // non-ASCII not allowed
  ])("rejects invalid username %j", (username) => {
    expect(isValidUsername(username)).toBe(false);
  });

  it("boundary: exactly 4 chars passes, 3 chars fails", () => {
    expect(isValidUsername("abcd")).toBe(true);
    expect(isValidUsername("abc")).toBe(false);
  });

  it("boundary: exactly 20 chars passes, 21 chars fails", () => {
    expect(isValidUsername("a".repeat(20))).toBe(true);
    expect(isValidUsername("a".repeat(21))).toBe(false);
  });

  it("trims surrounding whitespace before testing length/pattern", () => {
    expect(isValidUsername("  abcd  ")).toBe(true);
  });

  it("is anchored (^...$) so it cannot be satisfied by a valid substring inside invalid input", () => {
    expect(USERNAME_REGEX.test("!!!!abcd!!!!")).toBe(false);
    expect(isValidUsername("!!!!abcd!!!!")).toBe(false);
  });
});

describe("isValidPassword", () => {
  it.each(["123456", "abcdef", "P@ssw0rd!", "a".repeat(200)])(
    "accepts password of length >= %s.length",
    (password) => {
      expect(isValidPassword(password)).toBe(true);
    },
  );

  it.each(["", "1", "12345"])("rejects password shorter than MIN_PASSWORD_LENGTH: %j", (password) => {
    expect(isValidPassword(password)).toBe(false);
  });

  it("boundary: exactly MIN_PASSWORD_LENGTH chars passes, one less fails", () => {
    expect(isValidPassword("a".repeat(MIN_PASSWORD_LENGTH))).toBe(true);
    expect(isValidPassword("a".repeat(MIN_PASSWORD_LENGTH - 1))).toBe(false);
  });

  it("does not trim whitespace-only passwords (whitespace counts toward length)", () => {
    expect(isValidPassword("      ")).toBe(true); // 6 spaces, meets length rule as written
  });

  it("guards against non-string input at runtime", () => {
    // @ts-expect-error intentionally passing a non-string to verify the typeof guard
    expect(isValidPassword(undefined)).toBe(false);
    // @ts-expect-error intentionally passing a non-string to verify the typeof guard
    expect(isValidPassword(null)).toBe(false);
  });
});

describe("passwordsMatch", () => {
  it("returns true for identical passwords", () => {
    expect(passwordsMatch("Secret123", "Secret123")).toBe(true);
  });

  it("returns false for differing passwords", () => {
    expect(passwordsMatch("Secret123", "secret123")).toBe(false);
  });

  it("is case-sensitive and whitespace-sensitive", () => {
    expect(passwordsMatch("Secret123", "Secret123 ")).toBe(false);
  });

  it("treats two empty strings as matching (caller must separately reject empty passwords)", () => {
    expect(passwordsMatch("", "")).toBe(true);
  });
});
