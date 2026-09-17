// QA-02 Unit Testing (client scope) — src/app/roadshow/campaign-details/page.tsx
// getVehicleErrors is the single source of truth for "is this vehicle's
// campaign form complete" (rail ticks, Next-Vehicle guard, final Review check).

import { describe, it, expect } from "vitest";
import { getVehicleErrors } from "@/app/roadshow/campaign-details/page";

const validVehicle = { startDate: "2026-02-10", endDate: "2026-02-12" };

const validDetails = () => ({
  campaignType: "Product Launch",
  otherCampaignType: "",
  campaignName: "Spring Launch",
  campaignLocation: "Chennai",
  needPromoter: false,
  promoterType: "",
  otherPromoterType: "",
  promoterGender: "",
  promoterLanguage: [] as string[],
  promoterQuantity: 0,
  promoterFromDate: "",
  promoterToDate: "",
});

describe("getVehicleErrors", () => {
  it("returns no errors for a fully valid vehicle with no promoter", () => {
    expect(getVehicleErrors(validVehicle, validDetails())).toEqual({});
  });

  it("flags missing campaign dates", () => {
    const errors = getVehicleErrors({ startDate: "", endDate: "" }, validDetails());
    expect(errors.dates).toBeDefined();
  });

  it("flags an end date before the start date", () => {
    const errors = getVehicleErrors({ startDate: "2026-02-12", endDate: "2026-02-10" }, validDetails());
    expect(errors.dates).toMatch(/before/);
  });

  it("requires otherCampaignType when campaignType is 'Others'", () => {
    const details = { ...validDetails(), campaignType: "Others", otherCampaignType: "" };
    expect(getVehicleErrors(validVehicle, details).otherCampaignType).toBeDefined();
  });

  it("does not require otherCampaignType once it is filled in", () => {
    const details = { ...validDetails(), campaignType: "Others", otherCampaignType: "Product Demo" };
    expect(getVehicleErrors(validVehicle, details).otherCampaignType).toBeUndefined();
  });

  it("requires promoter fields only when needPromoter is true", () => {
    const withoutPromoter = getVehicleErrors(validVehicle, { ...validDetails(), needPromoter: false });
    expect(withoutPromoter.promoterType).toBeUndefined();

    const withPromoter = getVehicleErrors(validVehicle, { ...validDetails(), needPromoter: true });
    expect(withPromoter.promoterType).toBeDefined();
    expect(withPromoter.promoterGender).toBeDefined();
    expect(withPromoter.promoterLanguage).toBeDefined();
    expect(withPromoter.promoterQuantity).toBeDefined();
    expect(withPromoter.promoterFromDate).toBeDefined();
    expect(withPromoter.promoterToDate).toBeDefined();
  });

  it("flags a promoter end date before the promoter start date", () => {
    const details = {
      ...validDetails(),
      needPromoter: true,
      promoterType: "Anchor",
      promoterGender: "Female",
      promoterLanguage: ["Tamil"],
      promoterQuantity: 1,
      promoterFromDate: "2026-02-11",
      promoterToDate: "2026-02-10",
    };
    expect(getVehicleErrors(validVehicle, details).promoterToDate).toMatch(/before start date/);
  });

  it("flags promoter dates that fall outside the vehicle's campaign period", () => {
    const details = {
      ...validDetails(),
      needPromoter: true,
      promoterType: "Anchor",
      promoterGender: "Female",
      promoterLanguage: ["Tamil"],
      promoterQuantity: 1,
      promoterFromDate: "2026-02-01", // before campaign start (02-10)
      promoterToDate: "2026-02-11",
    };
    expect(getVehicleErrors(validVehicle, details).promoterFromDate).toMatch(/within the campaign period/);
  });

  it("accepts promoter dates equal to the campaign's own start/end boundary", () => {
    const details = {
      ...validDetails(),
      needPromoter: true,
      promoterType: "Anchor",
      promoterGender: "Female",
      promoterLanguage: ["Tamil"],
      promoterQuantity: 1,
      promoterFromDate: "2026-02-10",
      promoterToDate: "2026-02-12",
    };
    const errors = getVehicleErrors(validVehicle, details);
    expect(errors.promoterFromDate).toBeUndefined();
    expect(errors.promoterToDate).toBeUndefined();
  });
});
