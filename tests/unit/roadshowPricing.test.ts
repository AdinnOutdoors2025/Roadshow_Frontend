// QA-02 Unit Testing (client scope) — src/lib/roadshowPricing.ts
// Public campaign-flow pricing: mirrors admin's calcPricing() independently,
// so this is the only guard against the two formulas drifting apart.

import { describe, it, expect } from "vitest";
import {
  priceVehicleLine,
  splitGst,
  priceOrder,
  formatMoney,
  DEFAULT_PROMOTER_CHARGE,
} from "@/lib/roadshowPricing";

const baseLine = {
  startDate: "2026-01-10",
  endDate: "2026-01-12", // 3 inclusive days
  quantity: 2,
  rate: 1000,
  packageDetails: { rtoCharges: 500, brandingCost: 300, perDayRentalCost: 800 },
  needPromoter: false,
  promoterQuantity: 0,
};

describe("priceVehicleLine", () => {
  it("computes rental/RTO/branding for a simple line with no promoter", () => {
    const r = priceVehicleLine(baseLine);

    expect(r.days).toBe(3);
    expect(r.quantity).toBe(2);
    expect(r.perDayRentalCost).toBe(1000); // direct rate wins over package rate
    expect(r.rentalCost).toBe(1000 * 3 * 2);
    expect(r.promoterCost).toBe(0);
    expect(r.rtoCost).toBe(500 * 2);
    expect(r.brandingCost).toBe(300 * 2);
    expect(r.lineTotal).toBe(r.rentalCost + r.rtoCost + r.brandingCost);
  });

  it("falls back to package.perDayRentalCost when rate is 0", () => {
    const r = priceVehicleLine({ ...baseLine, rate: 0 });
    expect(r.perDayRentalCost).toBe(800);
  });

  it("floors quantity and enforces a minimum of 1", () => {
    expect(priceVehicleLine({ ...baseLine, quantity: 2.9 }).quantity).toBe(2);
    expect(priceVehicleLine({ ...baseLine, quantity: 0 }).quantity).toBe(1);
    expect(priceVehicleLine({ ...baseLine, quantity: -5 }).quantity).toBe(1);
  });

  it("zeroes the whole promoter line when needPromoter is false, even with a quantity set", () => {
    const r = priceVehicleLine({ ...baseLine, needPromoter: false, promoterQuantity: 3 });
    expect(r.promoterQuantity).toBe(0);
    expect(r.promoterChargePerDay).toBe(0);
    expect(r.promoterCost).toBe(0);
  });

  it("prices the promoter only for the selected promoter date range, not the full campaign", () => {
    const r = priceVehicleLine({
      ...baseLine,
      needPromoter: true,
      promoterQuantity: 2,
      promoterFromDate: "2026-01-10",
      promoterToDate: "2026-01-10", // 1 day, not the 3-day campaign
    });

    expect(r.promoterDays).toBe(1);
    expect(r.promoterChargePerDay).toBe(DEFAULT_PROMOTER_CHARGE);
    expect(r.promoterCost).toBe(DEFAULT_PROMOTER_CHARGE * 1 * 2);
  });

  it("charges no promoter cost when promoter is needed but no promoter dates are set yet", () => {
    const r = priceVehicleLine({ ...baseLine, needPromoter: true, promoterQuantity: 2 });
    expect(r.promoterDays).toBe(0);
    expect(r.promoterCost).toBe(0);
  });

  it("never returns a non-finite lineTotal", () => {
    const r = priceVehicleLine({ ...baseLine, rate: NaN as unknown as number, packageDetails: null });
    expect(Number.isFinite(r.lineTotal)).toBe(true);
  });
});

describe("splitGst", () => {
  it("splits into CGST/SGST for a Tamil Nadu (33) GSTIN", () => {
    const r = splitGst(1800, 18, "33ABCDE1234F1Z5");
    expect(r.isIntraState).toBe(true);
    expect(r.cgstAmount).toBe(900);
    expect(r.sgstAmount).toBe(900);
    expect(r.igstAmount).toBe(0);
    expect(r.cgstPercent).toBe(9);
    expect(r.sgstPercent).toBe(9);
  });

  it("splits into IGST for an out-of-state GSTIN", () => {
    const r = splitGst(1800, 18, "27ABCDE1234F1Z5");
    expect(r.isIntraState).toBe(false);
    expect(r.igstAmount).toBe(1800);
    expect(r.cgstAmount).toBe(0);
    expect(r.sgstAmount).toBe(0);
  });

  it("treats a missing GSTIN (walk-in customer) as intra-state", () => {
    const r = splitGst(1000, 18, undefined);
    expect(r.isIntraState).toBe(true);
    expect(r.cgstAmount).toBe(500);
  });

  it("handles a malformed/short GSTIN without throwing", () => {
    expect(() => splitGst(500, 18, "3")).not.toThrow();
    // "3" is a non-empty, non-"33" prefix, so it's treated as inter-state (IGST) — just like any other out-of-state code.
    expect(splitGst(500, 18, "3").isIntraState).toBe(false);
  });

  it("returns 0 amounts for a 0 GST amount", () => {
    const r = splitGst(0, 18, "33ABCDE1234F1Z5");
    expect(r.cgstAmount).toBe(0);
    expect(r.sgstAmount).toBe(0);
  });
});

describe("priceOrder", () => {
  it("returns all-zero totals for an empty line list", () => {
    const r = priceOrder([], 18, "33ABCDE1234F1Z5");
    expect(r.subtotal).toBe(0);
    expect(r.grandTotal).toBe(0);
    expect(r.additionalCharges).toBe(0);
    expect(r.discount).toBe(0);
  });

  it("rolls up multiple lines and applies GST on the subtotal", () => {
    const line1 = priceVehicleLine(baseLine);
    const line2 = priceVehicleLine({ ...baseLine, quantity: 1, rate: 500 });

    const r = priceOrder([line1, line2], 18, "33ABCDE1234F1Z5");

    expect(r.rentalTotal).toBe(line1.rentalCost + line2.rentalCost);
    expect(r.subtotal).toBe(line1.lineTotal + line2.lineTotal);
    expect(r.taxableAmount).toBe(r.subtotal); // no discount/additional charges on public site
    expect(r.gstAmount).toBeCloseTo(r.subtotal * 0.18);
    expect(r.grandTotal).toBeCloseTo(r.subtotal + r.gstAmount);
  });

  it("never lets taxableAmount go negative", () => {
    const r = priceOrder([], -100, "33ABCDE1234F1Z5");
    expect(r.taxableAmount).toBeGreaterThanOrEqual(0);
  });
});

describe("formatMoney", () => {
  it("formats a number as 2-decimal INR currency", () => {
    expect(formatMoney(125000)).toContain("1,25,000.00");
  });

  it("treats undefined/invalid input as 0", () => {
    expect(formatMoney(undefined)).toContain("0.00");
    expect(formatMoney("not-a-number")).toContain("0.00");
  });

  it("formats a negative amount without throwing", () => {
    expect(() => formatMoney(-500)).not.toThrow();
  });
});
