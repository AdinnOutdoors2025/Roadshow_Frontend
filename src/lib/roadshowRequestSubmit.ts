/* eslint-disable */
// @ts-nocheck

/* -------------------------------------------------------------------------- */
/*                     SUBMIT A PUBLIC CAMPAIGN REQUEST                       */
/* -------------------------------------------------------------------------- */
/*  One implementation of "turn the cart + campaign draft + pricing into a     */
/*  client-request and POST it", shared by the Review popup on the Campaign    */
/*  Details page and the standalone /roadshow/review-order route. Both send    */
/*  byte-identical payloads because there is only one builder.                 */
/*                                                                            */
/*  Endpoint is unchanged: POST client-requests. It goes as multipart only     */
/*  because campaign media rides along — the JSON body itself travels in the   */
/*  `payload` field and the controller falls back to req.body when it is       */
/*  absent, so nothing about the existing contract moved.                      */

import { baseUrl } from "@/BaseUrl";
import { clientAuthHeaders } from "@/lib/roadshowAuthToken";

/** "Others" campaign types and "Other" promoter types resolve to what was typed. */
export const resolveCampaignType = (details) =>
  details.campaignType === "Others"
    ? details.otherCampaignType.trim() || "Others"
    : details.campaignType;

export const resolvePromoterType = (details) =>
  details.promoterType === "Other"
    ? details.otherPromoterType.trim() || "Other"
    : details.promoterType;

export const formatPhone = (value) => {
  const digits = String(value || "").replace(/\D/g, "");

  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }

  return value || "—";
};

/**
 * Builds the request body.
 *
 * `rows` are the priced lines produced on the page: { vehicle, details,
 * pricing, media }. `formatDateForApi` is passed in rather than imported so
 * this module stays free of date-library choices at the call site.
 */
export const buildClientRequestPayload = ({
  user,
  isAgency,
  agencyBusiness,
  rows,
  pricing,
  formatDateForApi,
}) => {
  const firstDetails = rows[0]?.details;

  /* The existing top-level campaignType/location are still populated — from
     the first vehicle — so the admin client-request listing and my-bookings
     keep rendering exactly what they render today. */
  return {
    name: String(user?.name || "").trim(),

    email: String(user?.email || "").trim().toLowerCase(),

    phone: String(user?.phone || "").replace(/\D/g, ""),

    userId: user?._id,

    customerCategory: isAgency ? "organization" : "individual",

    ...(agencyBusiness
      ? {
          gstNumber: agencyBusiness.gst_number,
          gstDetailId: user?.gstDetailId,
          companyName: agencyBusiness.business_name,
          panNumber: agencyBusiness.business_pan || "",
          address: agencyBusiness.business_address || "",
        }
      : {}),

    campaignType: firstDetails
      ? resolveCampaignType(firstDetails) || "Roadshow Campaign"
      : "Roadshow Campaign",

    location: firstDetails?.campaignLocation || "",

    /* No longer collected on the public site — the field stays in the
       payload at its existing default so the contract is unchanged. */
    route: "",

    addOns: [],

    vehicleTypes: rows.map(({ vehicle, details, pricing: line }) => ({
      /* ── Fields the endpoint already stores ─────────────────────────── */
      vehicleId: vehicle.id,
      vehicleType: vehicle.vehicleTypeId || vehicle.id,
      vehicleName: vehicle.name,

      /* The package this vehicle was priced from. The request itself does
         not need it, but the Order the backend raises alongside does —
         every rate on a booking item (rental, RTO, per-km, hourly, KM
         limit) is read from the package server-side rather than trusted
         from here, exactly as admin order creation does it. */
      packageId: vehicle.packageDetails?._id || "",
      vehicleModel: vehicle.packageDetails?.vehicleModel || "",

      quantity: line.quantity,
      campaignLocation: details.campaignLocation.trim(),
      fromDate: formatDateForApi(vehicle.startDate),
      toDate: formatDateForApi(vehicle.endDate),
      pricePerDay: line.perDayRentalCost,
      lineTotal: line.lineTotal,

      /* ── Additive campaign fields ───────────────────────────────────── */
      campaignType: resolveCampaignType(details),
      otherCampaignType: details.otherCampaignType.trim(),
      campaignName: details.campaignName.trim(),

      needPromoter: details.needPromoter,
      promoterType: resolvePromoterType(details),
      otherPromoterType: details.otherPromoterType.trim(),
      promoterGender: details.promoterGender,
      promoterLanguage: details.promoterLanguage,
      promoterQuantity: line.promoterQuantity,
      promoterFromDate: details.promoterFromDate || "",
      promoterToDate: details.promoterToDate || "",
      promoterDays: line.promoterDays,
      promoterChargePerDay: line.promoterChargePerDay,
      promoterCost: line.promoterCost,

      rentalCost: line.rentalCost,
      rtoCost: line.rtoCost,
      brandingCost: line.brandingCost,
    })),

    subtotal: pricing.subtotal,
    gstPercentage: pricing.gstPercentage,
    gstAmount: pricing.gstAmount,
    estimatedTotal: pricing.grandTotal,

    /* ── Additive tax split ─────────────────────────────────────────────── */
    promoterTotal: pricing.promoterTotal,
    cgstAmount: pricing.cgstAmount,
    sgstAmount: pricing.sgstAmount,
    igstAmount: pricing.igstAmount,
  };
};

/**
 * Posts the request and returns the created record.
 *
 * Throws an Error carrying a display-ready message on any failure, so the
 * caller only has to toast it.
 */
export const submitClientRequest = async ({
  user,
  isAgency,
  agencyBusiness,
  rows,
  pricing,
  formatDateForApi,
}) => {
  const payload = buildClientRequestPayload({
    user,
    isAgency,
    agencyBusiness,
    rows,
    pricing,
    formatDateForApi,
  });

  const formData = new FormData();

  /* One JSON blob plus indexed files — the same shape admin order creation
     uses (`campaignImages_<i>` / `campaignVideos_<i>`). */
  formData.append("payload", JSON.stringify(payload));

  rows.forEach((row, index) => {
    row.media.images.forEach((file) => {
      formData.append(`campaignImages_${index}`, file);
    });

    row.media.videos.forEach((file) => {
      formData.append(`campaignVideos_${index}`, file);
    });
  });

  /* POST client-requests is customer-authenticated now — the backend takes
     the owner from this token rather than from the payload's userId, so a
     booking can only ever be filed against the customer who is signed in.
     No Content-Type here on purpose: fetch sets the multipart boundary. */
  const response = await fetch(`${baseUrl}/client-requests`, {
    method: "POST",
    headers: clientAuthHeaders(),
    body: formData,
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.success || !result?.data?._id) {
    const error = new Error(
      result?.message || "Unable to submit the campaign request."
    );

    /* Lets the caller tell "the session is no longer valid" (401) apart
       from any other failure, without matching on the message text —
       backend copy can change without breaking this. */
    (error as any).status = response.status;

    throw error;
  }

  return result.data;
};
