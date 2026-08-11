/* -------------------------------------------------------------------------- */
/*                     ROADSHOW CAMPAIGN DRAFT (client-side)                  */
/* -------------------------------------------------------------------------- */
/*  Carries the Campaign Details step between /roadshow/campaign-details and   */
/*  /roadshow/review-order. Modelled on roadshowCart.ts: same per-customer     */
/*  namespacing, same guest bucket, same change event — so a draft started     */
/*  signed out follows the customer into their own bucket on login and two     */
/*  people sharing a browser never see each other's campaign copy.             */
/*                                                                            */
/*  Vehicles, dates and quantities are NOT duplicated here. They stay in       */
/*  roadshowCart.ts, which the CampaignRequest page already owns — this store  */
/*  only holds the campaign fields, keyed by vehicleId. Anything removed from  */
/*  the cart is dropped from the draft the next time it is read.               */
/*                                                                            */
/*  MEDIA: File objects cannot survive JSON.stringify, so the files themselves */
/*  live in a module-level Map for the lifetime of the tab, and only their     */
/*  names/sizes are persisted. A hard refresh therefore keeps every campaign   */
/*  field and the file LIST, but loses the bytes — hasPendingMedia() lets the  */
/*  review page say so plainly instead of silently submitting without them.    */

export const CAMPAIGN_DRAFT_KEY_PREFIX = "roadshow_campaign_draft_";
export const GUEST_DRAFT_KEY = "guest";

/* Fired whenever the draft changes, matching CART_UPDATED_EVENT's role —
   the native `storage` event only reaches other tabs. */
export const CAMPAIGN_DRAFT_UPDATED_EVENT = "roadshow-campaign-draft-updated";

export type CampaignMediaMeta = {
  name: string;
  size: number;
  type: string;
};

export type VehicleCampaignDetails = {
  vehicleId: string;

  campaignType: string;
  /* Only meaningful when campaignType === "Other" */
  otherCampaignType: string;
  campaignName: string;
  campaignLocation: string;

  needPromoter: boolean;
  promoterType: string;
  /* Only meaningful when promoterType === "Other" */
  otherPromoterType: string;
  promoterGender: string;
  promoterLanguage: string[];
  promoterQuantity: number;

  /* Names/sizes only — the File objects live in the media store below. */
  campaignImages: CampaignMediaMeta[];
  campaignVideos: CampaignMediaMeta[];
};

export type CampaignDraft = {
  vehicles: Record<string, VehicleCampaignDetails>;
  /* Which vehicle's details were last copied across, for the checkbox state */
  appliedToAllFrom: string | null;
};

const isBrowser = (): boolean => typeof window !== "undefined";

const announceDraftChange = (): void => {
  if (!isBrowser()) return;

  window.dispatchEvent(new Event(CAMPAIGN_DRAFT_UPDATED_EVENT));
};

export const draftKeyFor = (userId?: string | null): string => {
  const id = String(userId ?? "").trim();

  return `${CAMPAIGN_DRAFT_KEY_PREFIX}${id || GUEST_DRAFT_KEY}`;
};

export const emptyCampaignDetails = (
  vehicleId: string
): VehicleCampaignDetails => ({
  vehicleId: String(vehicleId),
  campaignType: "",
  otherCampaignType: "",
  campaignName: "",
  campaignLocation: "",
  needPromoter: false,
  promoterType: "",
  otherPromoterType: "",
  promoterGender: "",
  promoterLanguage: [],
  promoterQuantity: 0,
  campaignImages: [],
  campaignVideos: [],
});

const normalizeMediaMeta = (value: unknown): CampaignMediaMeta | null => {
  if (!value || typeof value !== "object") return null;

  const source = value as Record<string, unknown>;
  const name = String(source.name ?? "").trim();

  if (!name) return null;

  return {
    name,
    size: Math.max(Number(source.size) || 0, 0),
    type: String(source.type ?? ""),
  };
};

const normalizeDetails = (
  vehicleId: string,
  value: unknown
): VehicleCampaignDetails => {
  const base = emptyCampaignDetails(vehicleId);

  if (!value || typeof value !== "object") return base;

  const source = value as Record<string, unknown>;

  return {
    ...base,
    campaignType: String(source.campaignType ?? ""),
    otherCampaignType: String(source.otherCampaignType ?? ""),
    campaignName: String(source.campaignName ?? ""),
    campaignLocation: String(source.campaignLocation ?? ""),
    needPromoter: Boolean(source.needPromoter),
    promoterType: String(source.promoterType ?? ""),
    otherPromoterType: String(source.otherPromoterType ?? ""),
    promoterGender: String(source.promoterGender ?? ""),
    promoterLanguage: Array.isArray(source.promoterLanguage)
      ? source.promoterLanguage
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean)
      : [],
    promoterQuantity: Math.max(Number(source.promoterQuantity) || 0, 0),
    campaignImages: Array.isArray(source.campaignImages)
      ? (source.campaignImages
          .map(normalizeMediaMeta)
          .filter(Boolean) as CampaignMediaMeta[])
      : [],
    campaignVideos: Array.isArray(source.campaignVideos)
      ? (source.campaignVideos
          .map(normalizeMediaMeta)
          .filter(Boolean) as CampaignMediaMeta[])
      : [],
  };
};

export const emptyDraft = (): CampaignDraft => ({
  vehicles: {},
  appliedToAllFrom: null,
});

/** Reads a customer's saved campaign draft. Never throws. */
export const readCampaignDraft = (
  userId?: string | null
): CampaignDraft => {
  if (!isBrowser()) return emptyDraft();

  const storageKey = draftKeyFor(userId);

  try {
    const raw = window.localStorage.getItem(storageKey);

    if (!raw) return emptyDraft();

    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object") return emptyDraft();

    const rawVehicles =
      parsed.vehicles && typeof parsed.vehicles === "object"
        ? (parsed.vehicles as Record<string, unknown>)
        : {};

    const vehicles: Record<string, VehicleCampaignDetails> = {};

    Object.keys(rawVehicles).forEach((vehicleId) => {
      vehicles[vehicleId] = normalizeDetails(
        vehicleId,
        rawVehicles[vehicleId]
      );
    });

    return {
      vehicles,
      appliedToAllFrom:
        typeof parsed.appliedToAllFrom === "string"
          ? parsed.appliedToAllFrom
          : null,
    };
  } catch {
    window.localStorage.removeItem(storageKey);

    return emptyDraft();
  }
};

export const writeCampaignDraft = (
  userId: string | null | undefined,
  draft: CampaignDraft
): void => {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(
      draftKeyFor(userId),
      JSON.stringify(draft)
    );
  } catch {
    /* Storage full or blocked — the in-memory draft still works */
  }

  announceDraftChange();
};

/**
 * Drops campaign details for vehicles no longer in the cart, and seeds an
 * empty entry for any newly added vehicle, so the two stores cannot drift.
 */
export const reconcileDraftWithVehicles = (
  draft: CampaignDraft,
  vehicleIds: string[]
): CampaignDraft => {
  const keep = new Set(vehicleIds.map(String));

  const vehicles: Record<string, VehicleCampaignDetails> = {};

  keep.forEach((vehicleId) => {
    vehicles[vehicleId] =
      draft.vehicles[vehicleId] || emptyCampaignDetails(vehicleId);
  });

  return {
    vehicles,
    appliedToAllFrom:
      draft.appliedToAllFrom && keep.has(draft.appliedToAllFrom)
        ? draft.appliedToAllFrom
        : null,
  };
};

/**
 * Copies the campaign fields of one vehicle onto every other vehicle.
 *
 * Only campaign information travels — vehicleId stays each row's own, and
 * nothing vehicle-specific (dates, quantity, rate, the vehicle itself) is
 * touched, since none of that lives in this store.
 */
export const applyDetailsToAll = (
  draft: CampaignDraft,
  sourceVehicleId: string,
  vehicleIds: string[]
): CampaignDraft => {
  const source = draft.vehicles[sourceVehicleId];

  if (!source) return draft;

  const vehicles: Record<string, VehicleCampaignDetails> = {
    ...draft.vehicles,
  };

  vehicleIds.forEach((vehicleId) => {
    const id = String(vehicleId);

    if (id === String(sourceVehicleId)) return;

    vehicles[id] = {
      ...source,
      vehicleId: id,
      /* Fresh arrays so a later edit on one card cannot mutate another's */
      promoterLanguage: [...source.promoterLanguage],
      campaignImages: [...source.campaignImages],
      campaignVideos: [...source.campaignVideos],
    };
  });

  return { ...draft, vehicles, appliedToAllFrom: String(sourceVehicleId) };
};

export const clearCampaignDraft = (userId?: string | null): void => {
  if (!isBrowser()) return;

  try {
    window.localStorage.removeItem(draftKeyFor(userId));
  } catch {
    /* ignore */
  }

  clearAllMedia();
  announceDraftChange();
};

/* -------------------------------------------------------------------------- */
/*                          CAMPAIGN MEDIA (in-memory)                        */
/* -------------------------------------------------------------------------- */
/*  File objects are not serialisable, so they live here for the lifetime of   */
/*  the tab. Object URLs are tracked alongside them and revoked on removal,    */
/*  otherwise every re-pick would leak a blob for the rest of the session.     */

export type CampaignMediaBucket = {
  images: File[];
  videos: File[];
};

const mediaStore = new Map<string, CampaignMediaBucket>();
const previewUrls = new Map<File, string>();

export const getMedia = (vehicleId: string): CampaignMediaBucket => {
  return (
    mediaStore.get(String(vehicleId)) || { images: [], videos: [] }
  );
};

export const setMedia = (
  vehicleId: string,
  bucket: CampaignMediaBucket
): void => {
  mediaStore.set(String(vehicleId), {
    images: [...bucket.images],
    videos: [...bucket.videos],
  });
};

/** Copies one vehicle's files onto the others — the media half of apply-to-all. */
export const copyMediaToAll = (
  sourceVehicleId: string,
  vehicleIds: string[]
): void => {
  const source = getMedia(sourceVehicleId);

  vehicleIds.forEach((vehicleId) => {
    const id = String(vehicleId);

    if (id === String(sourceVehicleId)) return;

    /* The same File object in several buckets is fine — File is immutable,
       and FormData reads it independently for each vehicle it is appended to. */
    setMedia(id, {
      images: [...source.images],
      videos: [...source.videos],
    });
  });
};

/** A stable object URL per File, created once and revoked on clear. */
export const getPreviewUrl = (file: File): string => {
  const existing = previewUrls.get(file);

  if (existing) return existing;

  const url = URL.createObjectURL(file);

  previewUrls.set(file, url);

  return url;
};

export const revokePreviewUrl = (file: File): void => {
  const url = previewUrls.get(file);

  if (!url) return;

  URL.revokeObjectURL(url);
  previewUrls.delete(file);
};

export const clearAllMedia = (): void => {
  previewUrls.forEach((url) => URL.revokeObjectURL(url));
  previewUrls.clear();
  mediaStore.clear();
};

/**
 * True when the draft says files were attached but the in-memory store has
 * lost them — i.e. the tab was refreshed between Campaign Details and Review
 * Order. Lets the review page ask for a re-attach instead of quietly
 * submitting a request with no media.
 */
export const hasPendingMedia = (draft: CampaignDraft): boolean => {
  return Object.values(draft.vehicles).some((details) => {
    const expected =
      details.campaignImages.length + details.campaignVideos.length;

    if (expected === 0) return false;

    const bucket = getMedia(details.vehicleId);

    return bucket.images.length + bucket.videos.length < expected;
  });
};

/** Media metadata for persisting, derived from the live File list. */
export const toMediaMeta = (files: File[]): CampaignMediaMeta[] =>
  files.map((file) => ({
    name: file.name,
    size: file.size,
    type: file.type,
  }));
