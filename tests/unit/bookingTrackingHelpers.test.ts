// QA-02 Unit Testing (client scope) — src/app/roadshow/my-bookings/[bookingId]/page.tsx
// Tracking-page progress %, "last updated" relative time, and future-day gating.

import { describe, it, expect } from "vitest";
import {
  getCampaignProgress,
  relativeTime,
  isFutureCampaignDay,
} from "@/app/roadshow/my-bookings/[bookingId]/page";

describe("getCampaignProgress ([bookingId] detail page)", () => {
  it("returns 0 for a cancelled booking regardless of onRoad data", () => {
    expect(getCampaignProgress({ isCancelled: true, onRoad: { day: 2, totalDays: 4 } })).toBe(0);
  });

  it("returns 100 once the journey stage is 'completed'", () => {
    expect(getCampaignProgress({ journeyStage: { key: "completed" } })).toBe(100);
  });

  it("returns null before on-road with no completed/cancelled state", () => {
    expect(getCampaignProgress({ journeyStage: { key: "confirmed" }, onRoad: null })).toBeNull();
  });

  it("computes and clamps a percentage from onRoad.day/totalDays", () => {
    expect(getCampaignProgress({ onRoad: { day: 3, totalDays: 4 } })).toBe(75);
    expect(getCampaignProgress({ onRoad: { day: 99, totalDays: 4 } })).toBe(100);
    expect(getCampaignProgress({ onRoad: { day: -1, totalDays: 4 } })).toBe(0);
  });
});

describe("relativeTime", () => {
  it("returns a no-update placeholder for missing/invalid input", () => {
    expect(relativeTime(null)).toBe("No update yet");
    expect(relativeTime("not-a-date")).toBe("No update yet");
  });

  it("reports 'just now' inside the 45-second threshold", () => {
    expect(relativeTime(new Date(Date.now() - 10_000).toISOString())).toBe("Updated just now");
  });

  it("reports minutes ago between 45s and 60min", () => {
    expect(relativeTime(new Date(Date.now() - 5 * 60_000).toISOString())).toBe("Updated 5 minutes ago");
  });

  it("reports hours ago between 1h and 24h", () => {
    expect(relativeTime(new Date(Date.now() - 3 * 3_600_000).toISOString())).toBe("Updated 3 hours ago");
  });

  it("falls back to an absolute date/time beyond 24h", () => {
    const result = relativeTime(new Date(Date.now() - 48 * 3_600_000).toISOString());
    expect(result).not.toMatch(/ago|just now/);
  });
});

describe("isFutureCampaignDay", () => {
  it("returns false for a missing value", () => {
    expect(isFutureCampaignDay(null)).toBe(false);
  });

  it("returns false for a clearly past date", () => {
    expect(isFutureCampaignDay("2020-01-01")).toBe(false);
  });

  it("returns true for a clearly future date", () => {
    expect(isFutureCampaignDay("2099-01-01")).toBe(true);
  });
});
