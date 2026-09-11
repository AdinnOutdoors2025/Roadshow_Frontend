// QA-02 Unit Testing — src/app/admin/sales-handling/page.tsx
// SALES_STAGES / SALES_STAGE_MAP (pipeline stage order) and validateFileSize
// (upload size limits: image <=5MB, other docs <=10MB per CLAUDE.md).

import { describe, it, expect } from "vitest";
import {
  SALES_STAGES,
  SALES_STAGE_MAP,
  validateFileSize,
} from "@/app/admin/sales-handling/page";

function makeFile(sizeMB: number, type: string): File {
  const bytes = Math.ceil(sizeMB * 1024 * 1024);
  return new File([new Uint8Array(bytes)], "test-file", { type });
}

describe("SALES_STAGES pipeline", () => {
  it("defines the documented stage order ending in closedLost as terminal", () => {
    const keys = SALES_STAGES.map((s: any) => s.key);
    expect(keys).toEqual([
      "enquiry",
      "needAnalysis",
      "proposalPriceQuote",
      "negotiationReview",
      "salesFinalClosedWon",
      "closedLost",
    ]);
  });

  it("SALES_STAGE_MAP looks up each stage by key", () => {
    for (const stage of SALES_STAGES as any[]) {
      expect(SALES_STAGE_MAP[stage.key]).toBe(stage);
    }
  });

  it("has a strictly increasing step for the forward pipeline", () => {
    const steps = (SALES_STAGES as any[])
      .filter((s) => s.key !== "closedLost")
      .map((s) => s.step);
    for (let i = 1; i < steps.length; i++) {
      expect(steps[i]).toBeGreaterThan(steps[i - 1]);
    }
  });
});

describe("validateFileSize", () => {
  it("accepts an image under 5MB", () => {
    expect(validateFileSize(makeFile(4.9, "image/png"))).toBeNull();
  });

  it("rejects an image over 5MB", () => {
    const err = validateFileSize(makeFile(5.1, "image/jpeg"));
    expect(err).toMatch(/exceeds the 5 MB limit/);
  });

  it("accepts a non-image document under 10MB", () => {
    expect(validateFileSize(makeFile(9.9, "application/pdf"))).toBeNull();
  });

  it("rejects a non-image document over 10MB", () => {
    const err = validateFileSize(makeFile(10.1, "application/pdf"));
    expect(err).toMatch(/exceeds the 10 MB limit/);
  });

  it("treats webp as an image (5MB cap, not 10MB)", () => {
    const err = validateFileSize(makeFile(6, "image/webp"));
    expect(err).toMatch(/exceeds the 5 MB limit/);
  });
});
