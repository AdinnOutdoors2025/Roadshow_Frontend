/* -------------------------------------------------------------------------- */
/*                    SHARED VEHICLE SPECIFICATION GROUPING                    */
/* -------------------------------------------------------------------------- */
/*  Extracted from the old vehicle-listing spec popup so the Vehicle Details    */
/*  page can render the same field-by-field breakdown inline. Every value      */
/*  shown here comes from data the backend already returns — techSpecs and     */
/*  registrationVehicles on the vehicle group, and the matched package for      */
/*  the commercials. Rows with no stored value are dropped rather than         */
/*  rendered blank, so a partly onboarded vehicle degrades to a shorter list    */
/*  instead of a wall of dashes.                                               */
/*                                                                              */
/*  NOTE: minimum booking duration is deliberately absent. It is collected in   */
/*  admin onboarding (pricing.minBookingDuration) but that `pricing` block is   */
/*  never included in the createVehicle payload, so the backend never stores    */
/*  it. Add it to the payload + schema first, then add a row here.              */

import type { RoadshowVehicle } from "@/lib/roadshowVehicles";
import { formatCurrency } from "@/app/utils/currency";

export type SpecRow = {
  label: string;
  value: string;
  soldOut?: boolean;
};

export type SpecGroup = {
  title: string;
  rows: SpecRow[];
};

const text = (value: unknown): string => String(value ?? "").trim();

/* "1200" + "nits" -> "1200 nits"; blank stays blank so the row is dropped */
const withUnit = (value: unknown, unit: string): string => {
  const raw = text(value);
  if (!raw) return "";
  return `${raw} ${unit}`;
};

const money = (value: unknown): string => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return "";
  return formatCurrency(amount);
};

const dimension = (width: unknown, height: unknown): string => {
  const w = text(width);
  const h = text(height);
  if (!w || !h) return "";
  return `${w} × ${h} ft`;
};

const resolution = (width: unknown, height: unknown): string => {
  const w = text(width);
  const h = text(height);
  if (!w || !h) return "";
  return `${w} × ${h} px`;
};

/* A vehicle gets the hybrid two-tab (LED / Flex Branding) treatment when its
   saved Screen Type is the selectable "Hybrid", or the legacy "Flex + LED"
   value old records saved before that option was renamed. */
export const HYBRID_SCREEN_TYPE = "Hybrid";
const LEGACY_FLEX_LED_SCREEN_TYPE = "Flex + LED";
export const isHybridScreenType = (screenType: string): boolean =>
  screenType === HYBRID_SCREEN_TYPE || screenType === LEGACY_FLEX_LED_SCREEN_TYPE;

/* Flex Height/Width only ever exist on a hybrid vehicle (see
   Vehicle_Onboarding/page.tsx techSpecs.flexHeight/flexWidth), same "ft"
   unit as every other onboarding screen dimension. Missing values are
   dropped, not shown as blank rows. */
export const buildFlexRows = (specs: RoadshowVehicle["techSpecs"]): SpecRow[] =>
  [
    { label: "Screen Type", value: HYBRID_SCREEN_TYPE },
    { label: "Flex Height", value: withUnit(specs?.flexHeight, "ft") },
    { label: "Flex Width", value: withUnit(specs?.flexWidth, "ft") },
  ].filter((row) => row.value);

/* Distinct, non-empty values across every registration of this vehicle */
const uniqueFrom = (
  registrations: RoadshowVehicle["registrationVehicles"],
  pick: (registration: RoadshowVehicle["registrationVehicles"][number]) => unknown
): string[] =>
  Array.from(new Set(registrations.map((registration) => text(pick(registration))).filter(Boolean)));

export const buildSpecGroups = (vehicle: RoadshowVehicle): SpecGroup[] => {
  const specs = vehicle?.techSpecs || {};
  const pkg = vehicle?.packageDetails || {};

  const registrations = Array.isArray(vehicle?.registrationVehicles) ? vehicle.registrationVehicles : [];

  const screenCount = text(specs?.numberOfScreens);

  /* Onboarding stores shared left/right dimensions for a 3-screen build and
     separate left + right ones for a 2-screen build */
  const screenRows: SpecRow[] = [
    { label: "Screen Type", value: text(specs?.screenType) },
    { label: "Number of Screens", value: screenCount },
    { label: "Display Version", value: text(specs?.displayVersion) },
    { label: "Brightness", value: withUnit(specs?.brightness, "nits") },
    {
      label: "Left & Right Screen",
      value: dimension(specs?.leftRightScreenWidth, specs?.leftRightScreenHeight),
    },
    {
      label: "Left & Right Resolution",
      value: resolution(specs?.leftRightResolutionWidth, specs?.leftRightResolutionHeight),
    },
    { label: "Left Screen", value: dimension(specs?.leftScreenWidth, specs?.leftScreenHeight) },
    {
      label: "Left Resolution",
      value: resolution(specs?.leftResolutionWidth, specs?.leftResolutionHeight),
    },
    { label: "Right Screen", value: dimension(specs?.rightScreenWidth, specs?.rightScreenHeight) },
    {
      label: "Right Resolution",
      value: resolution(specs?.rightResolutionWidth, specs?.rightResolutionHeight),
    },
    { label: "Back Screen", value: dimension(specs?.backScreenWidth, specs?.backScreenHeight) },
    {
      label: "Back Resolution",
      value: resolution(specs?.backResolutionWidth, specs?.backResolutionHeight),
    },
  ];

  const onboardRows: SpecRow[] = [
    { label: "Audio Output", value: withUnit(specs?.audioOutput, "W") },
    { label: "Generator Capacity", value: withUnit(specs?.generatorCapacity, "KVA") },
    { label: "Additional Features", value: text(specs?.additionalFeatures) },
  ];

  const commercialRows: SpecRow[] = [
    { label: "Per Day Rental", value: money(pkg?.perDayRentalCost ?? vehicle?.rate) },
    { label: "RTO Charges", value: money(pkg?.rtoCharges) },
    {
      label: "Daily KM Limit",
      value: withUnit(Number(pkg?.dailyKmLimit) > 0 ? pkg.dailyKmLimit : "", "km / day"),
    },
    {
      label: "Extra KM Charge",
      value: money(pkg?.perKmCharge) ? `${money(pkg.perKmCharge)} / km` : "",
    },
    {
      label: "Additional Hour Charges",
      value: money(pkg?.additionalHourCharges) ? `${money(pkg.additionalHourCharges)} / hr` : "",
    },
    { label: "Driver Charges", value: money(pkg?.driverCharges) },
    {
      label: "Promoter",
      value: pkg?.promoterAvailable
        ? money(pkg?.promoterChargePerDay)
          ? `Available · ${money(pkg.promoterChargePerDay)} / day`
          : "Available on request"
        : "",
    },
    {
      label: "Custom Branding",
      value:
        pkg?.endUserCustomizationPermission === true
          ? "Allowed"
          : pkg?.endUserCustomizationPermission === false
            ? "Not allowed"
            : "",
    },
  ];

  const cities = uniqueFrom(registrations, (registration) => registration?.city);
  const permits = uniqueFrom(registrations, (registration) => registration?.permitType);
  const fuels = uniqueFrom(registrations, (registration) => registration?.fuelType);
  const gpsEnabled = registrations.some((registration) => registration?.gpsEnabled);

  const fleetRows: SpecRow[] = [
    {
      label: "Fleet Size",
      value: vehicle?.totalVehicles
        ? `${vehicle.totalVehicles} vehicle${vehicle.totalVehicles === 1 ? "" : "s"}`
        : "",
    },
    {
      label: "Available Now",
      value: vehicle?.availableVehicles > 0 ? `${vehicle.availableVehicles} ready to book` : "Sold Out",
      soldOut: vehicle?.availableVehicles <= 0,
    },
    { label: "Operating Cities", value: cities.join(", ") },
    { label: "Permit", value: permits.join(", ") },
    { label: "Fuel Type", value: fuels.join(", ") },
    { label: "GPS Tracking", value: gpsEnabled ? "Live tracking available" : "" },
  ];

  return [
    { title: "Display & Screens", rows: screenRows },
    { title: "On-board Systems", rows: onboardRows },
    { title: "Pricing & Charges", rows: commercialRows },
    { title: "Fleet & Coverage", rows: fleetRows },
  ]
    .map((group) => ({ ...group, rows: group.rows.filter((row) => row.value) }))
    .filter((group) => group.rows.length > 0);
};
