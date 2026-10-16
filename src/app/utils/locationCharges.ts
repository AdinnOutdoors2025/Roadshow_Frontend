/**
 * Frontend mirror of the backend's Utils/locationChargeResolver.js — kept in
 * sync deliberately (same pattern as roadshowPricing.ts mirroring admin's
 * calcPricing). Used by both admin order-creation and the public
 * campaign-details page so RTO/Branding/Promoter charges resolve identically
 * to what the backend will compute when the order/request is saved.
 */

export type LocationCharge = { rtoCharges?: number | null; brandingCost?: number | null };

export type PackageLocationCharges = {
  chennai?: LocationCharge;
  rotn?: LocationCharge;
  kerala?: LocationCharge;
  andhra?: LocationCharge;
  telangana?: LocationCharge;
  karnataka?: LocationCharge;
};

export const LOCATION_BUCKETS = ["chennai", "rotn", "kerala", "andhra", "telangana", "karnataka"] as const;
export type LocationBucket = (typeof LOCATION_BUCKETS)[number];

export const LOCATION_BUCKET_LABELS: Record<LocationBucket, string> = {
  chennai: "Chennai",
  rotn: "ROTN",
  kerala: "Kerala",
  andhra: "Andhra",
  telangana: "Telangana",
  karnataka: "Karnataka",
};

/** The 5 states this feature supports, used only to filter the dynamic Locations list down to "these 5" — not a fixed storage key. */
const TARGET_STATE_NAMES = ["tamil nadu", "kerala", "andhra pradesh", "telangana", "karnataka"];

const normalize = (value?: string | null) => String(value || "").trim().toLowerCase();

export const isTargetState = (state?: string | null): boolean => {
  const n = normalize(state);
  return TARGET_STATE_NAMES.some((target) => n === target || n === target.replace(" pradesh", ""));
};

/** Filters a dynamic list of real state names (e.g. Object.keys(locationData)) down to the 5 this feature supports, preserving their real names. */
export const filterToSupportedStates = (stateNames: string[]): string[] =>
  stateNames.filter((name) => isTargetState(name));

const resolveStateBucketBase = (state?: string | null): "tamilnadu" | "kerala" | "andhra" | "telangana" | "karnataka" | null => {
  const n = normalize(state);
  if (n === "tamil nadu" || n === "tamilnadu") return "tamilnadu";
  if (n === "kerala") return "kerala";
  if (n === "andhra pradesh" || n === "andhra") return "andhra";
  if (n === "telangana") return "telangana";
  if (n === "karnataka") return "karnataka";
  return null;
};

/** 6-bucket key for Package RTO/Branding — Tamil Nadu splits by city (Chennai vs ROTN). */
export const resolveLocationBucket = (state?: string | null, city?: string | null): LocationBucket | null => {
  const base = resolveStateBucketBase(state);
  if (!base) return null;
  if (base !== "tamilnadu") return base;
  return normalize(city) === "chennai" ? "chennai" : "rotn";
};

export const resolveRtoCharge = (
  locationCharges: PackageLocationCharges | undefined | null,
  state?: string | null,
  city?: string | null
): number | null => {
  const bucket = resolveLocationBucket(state, city);
  if (!bucket) return null;
  const value = locationCharges?.[bucket]?.rtoCharges;
  return typeof value === "number" && Number.isFinite(value) ? value : null;
};

export const resolveBrandingCharge = (
  locationCharges: PackageLocationCharges | undefined | null,
  state?: string | null,
  city?: string | null
): number | null => {
  const bucket = resolveLocationBucket(state, city);
  if (!bucket) return null;
  const value = locationCharges?.[bucket]?.brandingCost;
  return typeof value === "number" && Number.isFinite(value) ? value : null;
};

/** `chargesByState` keyed by Promoter row's own `state` string, normalized (trim+lowercase) — no fixed key set. */
export const resolvePromoterCharge = (
  chargesByState: Record<string, number> | undefined | null,
  state?: string | null
): number | null => {
  const key = normalize(state);
  if (!key) return null;
  const value = chargesByState?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
};
