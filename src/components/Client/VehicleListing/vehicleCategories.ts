/* -------------------------------------------------------------------------- */
/*                      ROADSHOW VEHICLE CATEGORY GROUPING                     */
/* -------------------------------------------------------------------------- */
/*  Vehicles are segregated by the screen type captured during onboarding      */
/*  (techSpecs.screenType), whose allowed values live in                       */
/*  src/app/admin/AdminSelectOptions.json -> screenTypeOptions.                */
/*  "Hybrid" is the stored value saved by onboarding; legacy records saved      */
/*  as "Flex + LED" (before that option was renamed) still map to the Hybrid    */
/*  tab so existing vehicles need no re-entry. Both are presented to customers  */
/*  as "Hybrid"; the stored value is never rewritten, only relabelled.          */

import type { RoadshowVehicle } from "@/lib/roadshowVehicles";

export const ALL_CATEGORY_ID = "all";

export type VehicleCategory = {
  id: string;
  /* Customer-facing tab name */
  label: string;
  /* Values of techSpecs.screenType that belong in this tab */
  screenTypes: string[];
  blurb: string;
};

export const VEHICLE_CATEGORIES: VehicleCategory[] = [
  {
    id: "led",
    label: "LED",
    screenTypes: ["LED Only"],
    blurb:
      "Full LED walls for high-impact, motion-led campaigns that stay bright after dark.",
  },
  {
    id: "flex",
    label: "Flex",
    screenTypes: ["Flex Only"],
    blurb:
      "Printed flex panels — the most cost-effective way to cover long routes.",
  },
  {
    id: "hybrid",
    label: "Hybrid",
    screenTypes: ["Hybrid", "Flex + LED"],
    blurb:
      "Flex and LED on one vehicle: static branding plus a live screen for video.",
  },
];

/* Anything whose screenType is blank or unrecognised — shown under "All"
   so a vehicle can never disappear from the listing just because its
   screen type was left empty during onboarding. */
export const UNCATEGORISED_ID = "other";

const normalize = (value: unknown): string =>
  String(value ?? "")
    .trim()
    .toLowerCase();

export const screenTypeOf = (
  vehicle: RoadshowVehicle
): string => String(vehicle?.techSpecs?.screenType ?? "").trim();

/* Which tab a vehicle belongs to, or UNCATEGORISED_ID when its screen
   type is missing or is a value the tabs above don't cover */
export const categoryIdOf = (
  vehicle: RoadshowVehicle
): string => {
  const screenType = normalize(screenTypeOf(vehicle));

  if (!screenType) return UNCATEGORISED_ID;

  const matched = VEHICLE_CATEGORIES.find((category) =>
    category.screenTypes.some(
      (value) => normalize(value) === screenType
    )
  );

  return matched?.id ?? UNCATEGORISED_ID;
};

/* Customer-facing name for a vehicle's screen type — "Hybrid" (and legacy
   "Flex + LED") reads as "Hybrid", anything unrecognised keeps its stored
   wording */
export const categoryLabelOf = (
  vehicle: RoadshowVehicle
): string => {
  const categoryId = categoryIdOf(vehicle);

  if (categoryId === UNCATEGORISED_ID) {
    return screenTypeOf(vehicle) || "Roadshow Vehicle";
  }

  return (
    VEHICLE_CATEGORIES.find(
      (category) => category.id === categoryId
    )?.label ?? "Roadshow Vehicle"
  );
};

export const filterByCategory = (
  vehicles: RoadshowVehicle[],
  categoryId: string
): RoadshowVehicle[] => {
  if (categoryId === ALL_CATEGORY_ID) return vehicles;

  return vehicles.filter(
    (vehicle) => categoryIdOf(vehicle) === categoryId
  );
};

/* Per-tab counts, so an empty category can be hidden rather than
   opened onto an empty grid */
export const countByCategory = (
  vehicles: RoadshowVehicle[]
): Record<string, number> => {
  const counts: Record<string, number> = {
    [ALL_CATEGORY_ID]: vehicles.length,
  };

  vehicles.forEach((vehicle) => {
    const categoryId = categoryIdOf(vehicle);

    counts[categoryId] = (counts[categoryId] || 0) + 1;
  });

  return counts;
};
