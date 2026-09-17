// QA-02 Unit Testing — src/app/utils/currency.tsx
// Pure formatting/date helpers used across order pricing, sales-handling and
// booking history. No mocking required.

import { describe, it, expect } from "vitest";
import {
  toSafeNumber,
  formatCurrency,
  toSafeDate,
  formatDate,
  formatDateRange,
  formatDateForApi,
  getInclusiveDayCount,
} from "@/app/utils/currency";

describe("toSafeNumber", () => {
  it.each([
    [25000, 25000],
    ["25000", 25000],
    ["25,000", 25000],
    ["₹25,000", 25000],
    ["₹ 1,23,456.50", 123456.5],
  ])("parses %j -> %j", (input, expected) => {
    expect(toSafeNumber(input)).toBe(expected);
  });

  it.each([null, undefined, "", "abc", "₹-", NaN])(
    "falls back to 0 for invalid input %j",
    (input) => {
      expect(toSafeNumber(input)).toBe(0);
    }
  );

  it("preserves negative numbers (discounts/adjustments)", () => {
    expect(toSafeNumber("-500")).toBe(-500);
  });
});

describe("formatCurrency", () => {
  it("formats a number as INR by default", () => {
    expect(formatCurrency(25000)).toBe("₹25,000");
  });

  it("formats a numeric string with separators/symbol", () => {
    expect(formatCurrency("1234567")).toContain("12,34,567");
  });

  it("treats invalid input as 0", () => {
    expect(formatCurrency("not-a-number")).toBe("₹0");
  });
});

describe("toSafeDate", () => {
  it("returns null for invalid/empty input", () => {
    expect(toSafeDate(null)).toBeNull();
    expect(toSafeDate(undefined)).toBeNull();
    expect(toSafeDate("")).toBeNull();
    expect(toSafeDate("not-a-date")).toBeNull();
  });

  it("parses a date-only ISO string without UTC day-shifting", () => {
    const d = toSafeDate("2026-07-21");
    expect(d).not.toBeNull();
    expect(d!.getFullYear()).toBe(2026);
    expect(d!.getMonth()).toBe(6); // July
    expect(d!.getDate()).toBe(21);
  });

  it("passes through a valid Date instance", () => {
    const src = new Date(2026, 0, 1);
    const d = toSafeDate(src);
    expect(d!.getTime()).toBe(src.getTime());
  });
});

describe("formatDate / formatDateForApi", () => {
  it("formats to dd/MM/yyyy by default", () => {
    expect(formatDate("2026-07-21")).toBe("21/07/2026");
  });

  it("formats to yyyy-MM-dd for the API", () => {
    expect(formatDateForApi("2026-07-21")).toBe("2026-07-21");
  });

  it("returns the fallback for invalid dates", () => {
    expect(formatDate("garbage", { fallback: "—" })).toBe("—");
  });
});

describe("formatDateRange", () => {
  it("joins two valid dates with the default separator", () => {
    expect(formatDateRange("2026-07-21", "2026-07-25")).toBe(
      "21/07/2026 - 25/07/2026"
    );
  });

  it("returns the fallback if either side is invalid", () => {
    expect(formatDateRange("2026-07-21", "", { fallback: "N/A" })).toBe(
      "N/A"
    );
  });
});

describe("getInclusiveDayCount (campaign day count)", () => {
  it("counts the same start/end date as 1 day", () => {
    expect(getInclusiveDayCount("2026-07-21", "2026-07-21")).toBe(1);
  });

  it("counts a 5-day campaign inclusively", () => {
    expect(getInclusiveDayCount("2026-07-21", "2026-07-25")).toBe(5);
  });

  it("returns 0 when either date is missing/invalid", () => {
    expect(getInclusiveDayCount(null, "2026-07-25")).toBe(0);
    expect(getInclusiveDayCount("2026-07-25", undefined)).toBe(0);
  });

  it("never returns a negative count when end precedes start", () => {
    expect(getInclusiveDayCount("2026-07-25", "2026-07-21")).toBe(0);
  });
});
