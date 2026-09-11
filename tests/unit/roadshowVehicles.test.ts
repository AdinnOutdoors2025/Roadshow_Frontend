// QA-02 Unit Testing (client scope) — src/lib/roadshowVehicles.tsx
// Normalizes raw backend vehicle-group/type/package responses into the
// RoadshowVehicle shape the public vehicle listing + detail pages render.

import { describe, it, expect } from "vitest";
import { buildRoadshowVehicles, FALLBACK_VEHICLE_IMAGE } from "@/lib/roadshowVehicles";

const vehicleType = { _id: "type1", typeName: "Mini Truck" };
const pkg = { vehicleType: "type1", isActive: true, perDayRentalCost: 1200, rtoCharges: 500, brandingCost: 0 };

const baseGroup = {
  _id: "group1",
  basicInfo: { vehicleName: "LED Van", vehicleType: "type1" },
  mediaFiles: { frontViewImage: "/uploads/front.jpg" },
  registrationVehicles: [
    { activeStatus: true, statusAvailability: { currentStatus: "Available" } },
    { activeStatus: true, statusAvailability: { currentStatus: "Booked" } },
    { activeStatus: false, statusAvailability: { currentStatus: "Available" } }, // force-disabled
  ],
};

describe("buildRoadshowVehicles", () => {
  it("returns an empty array for non-array input", () => {
    expect(buildRoadshowVehicles(null as any, [], [])).toEqual([]);
    expect(buildRoadshowVehicles(undefined as any, [], [])).toEqual([]);
  });

  it("normalizes a group, matches its type and active package", () => {
    const [v] = buildRoadshowVehicles([baseGroup], [vehicleType], [pkg]);

    expect(v.id).toBe("group1");
    expect(v.vehicleTypeId).toBe("type1");
    expect(v.vehicleTypeName).toBe("Mini Truck");
    expect(v.name).toBe("LED Van");
    expect(v.rate).toBe(1200);
    expect(v.packageDetails).toBe(pkg);
  });

  it("counts only registrations that are active AND currently Available", () => {
    const [v] = buildRoadshowVehicles([baseGroup], [vehicleType], [pkg]);
    // 1 of 3: one is Booked, one is force-disabled via activeStatus:false
    expect(v.availableVehicles).toBe(1);
    expect(v.totalVehicles).toBe(3);
  });

  it("ignores an inactive package when matching", () => {
    const inactivePkg = { ...pkg, isActive: false };
    const [v] = buildRoadshowVehicles([baseGroup], [vehicleType], [inactivePkg]);
    expect(v.packageDetails).toBeNull();
    expect(v.rate).toBe(0);
  });

  it("falls back to the default image when no media files resolve", () => {
    const group = { ...baseGroup, mediaFiles: {} };
    const [v] = buildRoadshowVehicles([group], [vehicleType], [pkg]);
    expect(v.images).toEqual([FALLBACK_VEHICLE_IMAGE]);
    expect(v.image).toBe(FALLBACK_VEHICLE_IMAGE);
  });

  it("drops a group with no resolvable id", () => {
    const group = { ...baseGroup, _id: undefined, id: undefined };
    const result = buildRoadshowVehicles([group], [vehicleType], [pkg]);
    expect(result).toHaveLength(0);
  });
});
