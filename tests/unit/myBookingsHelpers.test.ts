// QA-02 Unit Testing (client scope) — src/app/roadshow/my-bookings/page.tsx
// Status/progress/vehicle-expansion mapping shown on the My Bookings dashboard.

import { describe, it, expect } from "vitest";
import {
  mapRequestStatus,
  mapJourneyStageToStatus,
  getBookingStatusLabel,
  getCampaignProgress,
  getExpandedVehicles,
} from "@/app/roadshow/my-bookings/page";

describe("mapRequestStatus (legacy numeric fallback)", () => {
  it.each([
    [0, "Pending"],
    [undefined, "Pending"],
    [1, "In Progress"],
    [2, "Confirmed"],
    [99, "Pending"], // unknown numeric code defaults to Pending
  ])("maps status %s to %s", (input, expected) => {
    expect(mapRequestStatus(input as number | undefined)).toBe(expected);
  });
});

describe("mapJourneyStageToStatus", () => {
  it("treats any onRoad object as In Progress regardless of journey stage", () => {
    expect(mapJourneyStageToStatus("confirmed", { day: 1, totalDays: 5 }, 0)).toBe("In Progress");
  });

  it.each([
    ["onRoad", "In Progress"],
    ["confirmed", "Confirmed"],
    ["prepared", "Confirmed"],
    ["completed", "Confirmed"],
    ["submitted", "Pending"],
  ])("maps journey stage '%s' to '%s' when there is no onRoad object", (stage, expected) => {
    expect(mapJourneyStageToStatus(stage, null, 0)).toBe(expected);
  });

  it("falls back to the legacy numeric status when the stage key is unrecognized", () => {
    expect(mapJourneyStageToStatus(undefined, null, 2)).toBe("Confirmed");
  });
});

function makeBooking(overrides: any = {}) {
  return {
    status: "Pending",
    journeyStage: { key: "submitted", index: 0 },
    onRoad: null,
    isCancelled: false,
    vehicleCount: 1,
    vehicles: [{ name: "LED Van", image: "/img.jpg", quantity: 1 }],
    ...overrides,
  };
}

describe("getBookingStatusLabel", () => {
  it("prefers the real pipeline stage label over the legacy status label", () => {
    const booking = makeBooking({ journeyStage: { key: "onRoad", index: 3 }, status: "Pending" });
    expect(getBookingStatusLabel(booking)).toBe("On Road");
  });

  it("falls back to the legacy status label when the stage key is unrecognized", () => {
    const booking = makeBooking({ journeyStage: { key: "unknownStage", index: 0 }, status: "Confirmed" });
    expect(getBookingStatusLabel(booking)).toBe("Confirmed");
  });
});

describe("getCampaignProgress", () => {
  it("returns null before the campaign goes on-road (no stage-based percentage)", () => {
    expect(getCampaignProgress(makeBooking({ onRoad: null }))).toBeNull();
  });

  it("computes a percentage from day/totalDays once on-road", () => {
    expect(getCampaignProgress(makeBooking({ onRoad: { day: 2, totalDays: 4 } }))).toBe(50);
  });

  it("clamps day to totalDays so progress never exceeds 100", () => {
    expect(getCampaignProgress(makeBooking({ onRoad: { day: 10, totalDays: 4 } }))).toBe(100);
  });

  it("clamps a negative day to 0", () => {
    expect(getCampaignProgress(makeBooking({ onRoad: { day: -3, totalDays: 4 } }))).toBe(0);
  });
});

describe("getExpandedVehicles", () => {
  it("expands a quantity > 1 vehicle into individually numbered rows", () => {
    const booking = makeBooking({
      vehicleCount: 3,
      vehicles: [{ name: "LED Van", image: "/img.jpg", quantity: 3 }],
    });
    const rows = getExpandedVehicles(booking);
    expect(rows).toHaveLength(3);
    expect(rows.map((r: any) => r.label)).toEqual(["Vehicle 01", "Vehicle 02", "Vehicle 03"]);
  });

  it("uses the plain 'Vehicle' label when there is only one vehicle total", () => {
    const booking = makeBooking({ vehicleCount: 1, vehicles: [{ name: "LED Van", image: null, quantity: 1 }] });
    expect(getExpandedVehicles(booking)[0].label).toBe("Vehicle");
  });

  it("treats a missing/zero quantity as 1", () => {
    const booking = makeBooking({ vehicles: [{ name: "LED Van", image: null, quantity: 0 }] });
    expect(getExpandedVehicles(booking)).toHaveLength(1);
  });
});
