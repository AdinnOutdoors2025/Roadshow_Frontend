import API_BASE from "../../baseurl";

/**
 * Shared GST verification layer.
 *
 * One place that knows how to call `gstdetails/verify` and what the record
 * looks like, so the public signup, the CampaignRequest form and the admin
 * order-creation step all agree on the shape and never re-implement the call.
 */

/** 22AAAAA0000A1Z5 — 2 state digits, 5 PAN letters, 4 digits, letter, entity, Z, checksum */
export const GST_REGEX =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export interface GstBusiness {
  gstDetailId: string;
  gst_number: string;
  business_name: string;
  business_pan?: string;
  business_address?: string;
  business_entity_type?: string;
  business_registration_type?: string;
  business_registration_date?: string;
  business_department_code?: string;
  nature_of_business?: string;
  status?: string;
}

/** Verified businesses keyed by GST number — a re-entered number never re-hits the API. */
const verifiedCache = new Map<string, GstBusiness>();

export const normalizeGst = (value: string): string =>
  (value || "").replace(/\s+/g, "").toUpperCase();

export const isValidGstFormat = (value: string): boolean =>
  GST_REGEX.test(normalizeGst(value));

/** True only when the API explicitly reports an Active registration. */
export const isGstActive = (business: GstBusiness | null): boolean =>
  !!business && (business.status || "").toLowerCase() === "active";

/**
 * True only when the API explicitly reports a NON-Active registration.
 *
 * `gstdetails/verify` currently returns just gstDetailId/gst_number/
 * business_name/business_pan/business_address — no `status` field — so an
 * absent status means "not reported", not "inactive". Blocking on absence
 * would reject every verification. Once the backend projects `status`, this
 * starts enforcing without any frontend change.
 */
export const isGstBlocked = (business: GstBusiness | null): boolean =>
  !!business?.status && business.status.toLowerCase() !== "active";

export const getCachedGst = (gstNumber: string): GstBusiness | undefined =>
  verifiedCache.get(normalizeGst(gstNumber));

export const cacheGst = (business: GstBusiness): void => {
  if (business?.gst_number) {
    verifiedCache.set(normalizeGst(business.gst_number), business);
  }
};

/**
 * Verify a GST number against the backend and return the business record.
 * Throws an Error with a display-ready message on failure.
 */
export async function verifyGst(gstNumber: string): Promise<GstBusiness> {
  const gst = normalizeGst(gstNumber);

  if (!gst) throw new Error("GST number is required");
  if (!GST_REGEX.test(gst)) throw new Error("Enter a valid 15-character GST number");

  const cached = verifiedCache.get(gst);
  if (cached) return cached;

  interface GstResponse {
    success?: boolean;
    message?: string;
    data?: Partial<GstBusiness> & { _id?: string };
  }

  let payload: GstResponse | null = null;

  try {
    const res = await fetch(`${API_BASE}gstdetails/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gst_number: gst }),
    });
    payload = (await res.json().catch(() => null)) as GstResponse | null;

    if (!res.ok) {
      throw new Error(payload?.message || "GST verification failed");
    }
  } catch (err: unknown) {
    // Network/CORS failures surface as TypeError — don't leak that to the user.
    if (err instanceof TypeError) {
      throw new Error("Could not reach the verification service. Please try again.");
    }
    throw err;
  }

  const record = payload?.data;
  if (!record?.gst_number) {
    throw new Error(payload?.message || "No business found for this GST number");
  }

  const business: GstBusiness = {
    gstDetailId: record.gstDetailId || record._id || "",
    gst_number: record.gst_number,
    business_name: record.business_name || "",
    business_pan: record.business_pan || "",
    business_address: record.business_address || "",
    business_entity_type: record.business_entity_type || "",
    business_registration_type: record.business_registration_type || "",
    business_registration_date: record.business_registration_date || "",
    business_department_code: record.business_department_code || "",
    nature_of_business: record.nature_of_business || "",
    status: record.status || "",
  };

  verifiedCache.set(gst, business);
  return business;
}

/** "25 Jul 2023" from an ISO date, or "—" when absent/unparseable. */
export const formatGstDate = (value?: string): string => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
