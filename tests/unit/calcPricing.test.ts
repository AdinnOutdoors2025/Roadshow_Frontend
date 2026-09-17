// QA-02 Unit Testing — src/app/admin/order-creation/VehicleFormModal.tsx
// calcPricing: rental/promoter/RTO/branding cost math and the discount-cap
// business rule (order-line discounts capped at NEXT_PUBLIC_MAX_DISCOUNT_PERCENT,
// default 15%). Highest-priority calculation per CLAUDE.md business rules.

import { describe, it, expect, afterEach } from "vitest";
import { calcPricing } from "@/app/admin/order-creation/VehicleFormModal";

const basePkg = {
  _id: "pkg1",
  vehicleType: "t1",
  vehicleModel: "Model X",
  perDayRentalCost: 1000,
  driverCharges: 200,
  rtoCharges: 500,
  brandingCost: 300,
  dailyKmLimit: 100,
  additionalHourCharges: 50,
  promoterAvailable: true,
  promoterChargePerDay: 1000,
  isActive: true,
  perKmCharge: 10,
  dailyKmcharges: 10,
};

const origEnv = { ...process.env };
afterEach(() => {
  process.env = { ...origEnv };
});

describe("calcPricing — guard clauses", () => {
  it("returns null when fromDate/toDate are missing", () => {
    expect(calcPricing(basePkg as any, "", "2026-07-25", 1, false, 0, 0, 0, [], 0, 0)).toBeNull();
  });

  it("returns null when quantity < 1", () => {
    expect(
      calcPricing(basePkg as any, "2026-07-21", "2026-07-25", 0, false, 0, 0, 0, [], 0, 0)
    ).toBeNull();
  });

  it("returns null when fromDate is not before toDate", () => {
    expect(
      calcPricing(basePkg as any, "2026-07-25", "2026-07-21", 1, false, 0, 0, 0, [], 0, 0)
    ).toBeNull();
  });
});

describe("calcPricing — day count and rental cost", () => {
  it("counts an inclusive campaign day range and applies extraDays", () => {
    // 2026-07-21 .. 2026-07-25 = 5 base days + 2 extra = 7 total days
    const r = calcPricing(basePkg as any, "2026-07-21", "2026-07-25", 2, false, 0, 2, 0, [], 0, 0)!;
    expect(r.totalDays).toBe(7);
    expect(r.rentalCost).toBe(1000 * 7 * 2); // perDayRentalCost * totalDays * quantity
    expect(r.driverCost).toBe(200 * 7 * 2);
  });
});

describe("calcPricing — promoter cost", () => {
  it("is 0 when needPromoter is false", () => {
    const r = calcPricing(basePkg as any, "2026-07-21", "2026-07-25", 1, false, 0, 0, 0, [], 3, 0)!;
    expect(r.promoterCost).toBe(0);
  });

  it("uses the default promoter charge (₹1000/day) and full campaign days when no promoter date range is set", () => {
    const r = calcPricing(basePkg as any, "2026-07-21", "2026-07-25", 1, true, 0, 0, 0, [], 2, 0)!;
    // 5 total days * 1000 default charge * 2 promoters
    expect(r.promoterDays).toBe(5);
    expect(r.promoterCost).toBe(5 * 1000 * 2);
  });

  it("prices promoter cost only for the promoter's own date sub-range when provided", () => {
    const r = calcPricing(
      basePkg as any,
      "2026-07-21",
      "2026-07-25", // 5-day campaign
      1,
      true,
      0,
      0,
      0,
      [],
      1,
      0,
      "2026-07-22",
      "2026-07-23" // 2-day promoter sub-range
    )!;
    expect(r.promoterDays).toBe(2);
    expect(r.promoterCost).toBe(2 * 1000 * 1);
  });

  it("respects a custom NEXT_PUBLIC_DEFAULT_PROMOTER_CHARGE", () => {
    process.env.NEXT_PUBLIC_DEFAULT_PROMOTER_CHARGE = "1500";
    const r = calcPricing(basePkg as any, "2026-07-21", "2026-07-21", 1, true, 0, 0, 0, [], 1, 0)!;
    expect(r.promoterCost).toBe(1500);
  });
});

describe("calcPricing — one-time RTO/branding and extras", () => {
  it("applies RTO and branding once per vehicle quantity regardless of day count", () => {
    const r = calcPricing(basePkg as any, "2026-07-21", "2026-07-25", 3, false, 0, 0, 0, [], 0, 0)!;
    expect(r.rtoCost).toBe(500 * 3);
    expect(r.brandingCost).toBe(300 * 3);
  });

  it("only charges extra km/hour cost when the respective extra is > 0", () => {
    const withExtras = calcPricing(basePkg as any, "2026-07-21", "2026-07-25", 1, false, 10, 0, 2, [], 0, 0)!;
    expect(withExtras.extraKmCost).toBe(10 * 10);
    expect(withExtras.extraHourCost).toBe(2 * 50);

    const noExtras = calcPricing(basePkg as any, "2026-07-21", "2026-07-25", 1, false, 0, 0, 0, [], 0, 0)!;
    expect(noExtras.extraKmCost).toBe(0);
    expect(noExtras.extraHourCost).toBe(0);
  });
});

describe("calcPricing — discount cap enforcement (business rule)", () => {
  it("applies a flat '+' additional charge fully to the subtotal", () => {
    const r = calcPricing(
      basePkg as any,
      "2026-07-21",
      "2026-07-21", // 1 day, quantity 1: subtotal = 1000 rental + 500 rto + 300 branding = 1800
      1,
      false,
      0,
      0,
      0,
      [{ mode: "+", amount: 200 } as any],
      0,
      0
    )!;
    expect(r.subtotal).toBe(2000); // 1800 + 200
    expect(r.additionalNet).toBe(200);
  });

  it("caps a flat '-' discount at the default 15% of subtotal", () => {
    // subtotal = 1800; 15% cap = floor(1800*0.15) = 270; requested discount 1000 far exceeds cap
    const r = calcPricing(
      basePkg as any,
      "2026-07-21",
      "2026-07-21",
      1,
      false,
      0,
      0,
      0,
      [{ mode: "-", amount: 1000 } as any],
      0,
      0
    )!;
    expect(r.additionalCuts).toBe(270);
    expect(r.totalAmount).toBe(1800 - 270);
  });

  it("caps a percent-based '-' discount at the max discount amount too", () => {
    // requesting a 50% percent discount should still be clamped to the 15% cap (270)
    const r = calcPricing(
      basePkg as any,
      "2026-07-21",
      "2026-07-21",
      1,
      false,
      0,
      0,
      0,
      [{ mode: "-", reduceType: "percent", discountPercent: 50 } as any],
      0,
      0
    )!;
    expect(r.additionalCuts).toBe(270);
  });

  it("sums multiple '-' entries but never exceeds the cap in total", () => {
    const r = calcPricing(
      basePkg as any,
      "2026-07-21",
      "2026-07-21",
      1,
      false,
      0,
      0,
      0,
      [
        { mode: "-", amount: 200 } as any,
        { mode: "-", amount: 200 } as any,
      ],
      0,
      0
    )!;
    // 200 + 200 = 400 requested, but cap is 270
    expect(r.additionalCuts).toBe(270);
  });

  it("respects a custom NEXT_PUBLIC_MAX_DISCOUNT_PERCENT", () => {
    process.env.NEXT_PUBLIC_MAX_DISCOUNT_PERCENT = "50";
    const r = calcPricing(
      basePkg as any,
      "2026-07-21",
      "2026-07-21",
      1,
      false,
      0,
      0,
      0,
      [{ mode: "-", amount: 1000 } as any],
      0,
      0
    )!;
    // cap now floor(1800*0.5) = 900
    expect(r.additionalCuts).toBe(900);
    expect(r.totalAmount).toBe(1800 - 900);
  });

  it("never lets totalAmount go negative", () => {
    const r = calcPricing(
      basePkg as any,
      "2026-07-21",
      "2026-07-21",
      1,
      false,
      0,
      0,
      0,
      [{ mode: "-", amount: 999999 } as any],
      0,
      0
    )!;
    expect(r.totalAmount).toBeGreaterThanOrEqual(0);
  });
});
