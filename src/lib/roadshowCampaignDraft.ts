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

/** One vehicle's own campaign dates, as stored in the cart. */
export type CampaignDateRange = {
  startDate: string | null;
  endDate: string | null;
};

export type CampaignDraft = {
  vehicles: Record<string, VehicleCampaignDetails>;
  /* Which vehicle's details were last copied across, for the checkbox state */
  appliedToAllFrom: string | null;

  /* ── What each vehicle had before "apply to all" was ticked ────────────
     Unticking used to only drop the link and leave the copies behind, so a
     customer who ticked the box to look at it could never get their own
     typing back. These two hold every OTHER vehicle's details and dates as
     they were the moment it was ticked, and unticking puts them back
     exactly. Both are null whenever the box is clear. */
  appliedSnapshot: Record<string, VehicleCampaignDetails> | null;
  appliedDates: Record<string, CampaignDateRange> | null;
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
  appliedSnapshot: null,
  appliedDates: null,
});

/** Reads back a persisted snapshot, or null when there is not a usable one. */
const normalizeSnapshot = (
  value: unknown
): Record<string, VehicleCampaignDetails> | null => {
  if (!value || typeof value !== "object") return null;

  const source = value as Record<string, unknown>;
  const snapshot: Record<string, VehicleCampaignDetails> = {};

  Object.keys(source).forEach((vehicleId) => {
    snapshot[vehicleId] = normalizeDetails(vehicleId, source[vehicleId]);
  });

  return Object.keys(snapshot).length ? snapshot : null;
};

const normalizeDates = (
  value: unknown
): Record<string, CampaignDateRange> | null => {
  if (!value || typeof value !== "object") return null;

  const source = value as Record<string, unknown>;
  const dates: Record<string, CampaignDateRange> = {};

  Object.keys(source).forEach((vehicleId) => {
    const range = source[vehicleId] as Record<string, unknown> | null;

    if (!range || typeof range !== "object") return;

    dates[vehicleId] = {
      startDate: range.startDate ? String(range.startDate) : null,
      endDate: range.endDate ? String(range.endDate) : null,
    };
  });

  return Object.keys(dates).length ? dates : null;
};

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

    const appliedToAllFrom =
      typeof parsed.appliedToAllFrom === "string"
        ? parsed.appliedToAllFrom
        : null;

    return {
      vehicles,
      appliedToAllFrom,
      /* Only meaningful while the box is ticked — a snapshot without a
         source vehicle has nothing to be restored by. */
      appliedSnapshot: appliedToAllFrom
        ? normalizeSnapshot(parsed.appliedSnapshot)
        : null,
      appliedDates: appliedToAllFrom
        ? normalizeDates(parsed.appliedDates)
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

  const appliedToAllFrom =
    draft.appliedToAllFrom && keep.has(draft.appliedToAllFrom)
      ? draft.appliedToAllFrom
      : null;

  /* Snapshot entries for vehicles that have since left the cart are dropped
     with them, so a later restore cannot resurrect a removed vehicle. */
  const pruneByKey = <T>(
    source: Record<string, T> | null
  ): Record<string, T> | null => {
    if (!appliedToAllFrom || !source) return null;

    const pruned: Record<string, T> = {};

    keep.forEach((vehicleId) => {
      if (source[vehicleId]) pruned[vehicleId] = source[vehicleId];
    });

    return Object.keys(pruned).length ? pruned : null;
  };

  return {
    vehicles,
    appliedToAllFrom,
    appliedSnapshot: pruneByKey(draft.appliedSnapshot),
    appliedDates: pruneByKey(draft.appliedDates),
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
  vehicleIds: string[],
  /* Each vehicle's current dates, snapshotted alongside the details so
     unticking gives those back too. Dates live in the cart, not here. */
  currentDates: Record<string, CampaignDateRange> = {}
): CampaignDraft => {
  const source = draft.vehicles[sourceVehicleId];

  if (!source) return draft;

  const vehicles: Record<string, VehicleCampaignDetails> = {
    ...draft.vehicles,
  };

  /* Taken BEFORE anything is overwritten — this is what unticking restores */
  const appliedSnapshot: Record<string, VehicleCampaignDetails> = {};
  const appliedDates: Record<string, CampaignDateRange> = {};

  vehicleIds.forEach((vehicleId) => {
    const id = String(vehicleId);

    if (id === String(sourceVehicleId)) return;

    appliedSnapshot[id] = draft.vehicles[id] || emptyCampaignDetails(id);

    appliedDates[id] = currentDates[id] || {
      startDate: null,
      endDate: null,
    };

    vehicles[id] = {
      ...source,
      vehicleId: id,
      /* Fresh arrays so a later edit on one card cannot mutate another's */
      promoterLanguage: [...source.promoterLanguage],
      campaignImages: [...source.campaignImages],
      campaignVideos: [...source.campaignVideos],
    };
  });

  return {
    ...draft,
    vehicles,
    appliedToAllFrom: String(sourceVehicleId),
    appliedSnapshot,
    appliedDates,
  };
};

/**
 * Undoes applyDetailsToAll — every vehicle other than the source gets back
 * the details it had before the box was ticked.
 *
 * The source vehicle keeps what it has: those are the customer's own values,
 * typed on that card, and were never a copy of anything.
 *
 * With no snapshot to work from (a draft saved before this existed) the
 * details are left exactly as they are and only the link is dropped, which
 * is precisely the old behaviour — never worse than it was.
 */
export const restoreDetailsFromSnapshot = (
  draft: CampaignDraft
): CampaignDraft => {
  const cleared = {
    ...draft,
    appliedToAllFrom: null,
    appliedSnapshot: null,
    appliedDates: null,
  };

  if (!draft.appliedSnapshot) return cleared;

  const vehicles: Record<string, VehicleCampaignDetails> = {
    ...draft.vehicles,
  };

  Object.keys(draft.appliedSnapshot).forEach((vehicleId) => {
    /* Never resurrect a vehicle that is no longer in the draft */
    if (!vehicles[vehicleId]) return;

    vehicles[vehicleId] = draft.appliedSnapshot![vehicleId];
  });

  return { ...cleared, vehicles };
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

/* Which customer the files currently in mediaStore belong to.
   The store is keyed by vehicleId alone, so without this a second customer
   signing in on the same tab would inherit the first one's uploads for any
   vehicle they both happen to have in their cart. */
let mediaOwnerKey: string | null = null;

/**
 * Hands the media store to a customer, discarding the previous one's files.
 *
 * A no-op on the first call and on every call for the same customer, so
 * moving between Campaign Details and Review Order — which remounts both
 * pages — keeps the files that were just picked. Only an actual customer
 * change clears them.
 */
export const ensureMediaOwner = (userId?: string | null): void => {
  const key = String(userId ?? "").trim() || GUEST_DRAFT_KEY;

  if (mediaOwnerKey === key) return;

  if (mediaOwnerKey !== null) clearAllMedia();

  mediaOwnerKey = key;
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
