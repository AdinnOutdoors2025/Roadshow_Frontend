// QA-02 Unit Testing (client scope) — src/app/roadshow/Contact/page.tsx
// Email/phone patterns used by the Contact form's validateForm().

import { describe, it, expect } from "vitest";
import { EMAIL_PATTERN, CONTACT_PATTERN } from "@/app/roadshow/Contact/page";

describe("EMAIL_PATTERN", () => {
  it.each([
    "user@example.com",
    "first.last@sub.domain.co.in",
  ])("accepts a valid email: %s", (email) => {
    expect(EMAIL_PATTERN.test(email)).toBe(true);
  });

  it.each([
    "",
    "not-an-email",
    "user@",
    "@example.com",
    "user example@example.com",
  ])("rejects an invalid email: %s", (email) => {
    expect(EMAIL_PATTERN.test(email)).toBe(false);
  });
});

describe("CONTACT_PATTERN", () => {
  it("accepts an 8-digit number (lower boundary)", () => {
    expect(CONTACT_PATTERN.test("12345678")).toBe(true);
  });

  it("accepts a 15-character number with separators (upper boundary)", () => {
    expect(CONTACT_PATTERN.test("+91 (123) 456-7")).toBe(true);
  });

  it("rejects a number shorter than 8 characters", () => {
    expect(CONTACT_PATTERN.test("1234567")).toBe(false);
  });

  it("rejects a number longer than 15 characters", () => {
    expect(CONTACT_PATTERN.test("1234567890123456")).toBe(false);
  });

  it("rejects letters or symbols outside the allowed set", () => {
    expect(CONTACT_PATTERN.test("12345abc")).toBe(false);
    expect(CONTACT_PATTERN.test("1234567#")).toBe(false);
  });
});
