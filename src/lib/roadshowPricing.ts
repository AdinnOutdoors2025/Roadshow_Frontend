/* -------------------------------------------------------------------------- */
/*                        ROADSHOW PUBLIC ORDER PRICING                       */
/* -------------------------------------------------------------------------- */
/*  The public campaign flow prices a booking the same way admin order         */
/*  creation does, so a request that reaches the back office does not          */
/*  re-price itself the moment staff open it.                                  */
/*                                                                            */
/*  The formulas below are a deliberate mirror of calcPricing() in             */
/*  src/app/admin/order-creation/VehicleFormModal.tsx — rental, promoter and   */
/*  RTO are computed identically, from the same env constants. That file is    */
/*  NOT imported: it is a "use client" admin module carrying the whole modal,  */
/*  and importing it here would drag admin code into the public bundle. Any    */
/*  change to admin's calcPricing must be mirrored here on purpose.            */
/*                                                                            */
/*  Two lines admin has that the public site cannot produce — additional       */
/*  charges and discount — are always 0 here. There is no public entry point   */
/*  for them; they stay in the shape so Review Order can render the same rows  */
/*  admin does, and so admin can fill them in later without the numbers        */
/*  shifting meaning.                                                         */

import {
  getInclusiveDayCount,
  toSafeNumber,
  type DateValue,
} from "@/app/utils/currency";

/** Per-promoter, per-day charge — same env var admin's calcPricing reads. */
export const DEFAULT_PROMOTER_CHARGE = parseFloat(
  process.env.NEXT_PUBLIC_DEFAULT_PROMOTER_CHARGE || "1000"
);

/**
 * Seller's GST state code. Adinn bills from Tamil Nadu (33), so a customer
 * GSTIN starting with 33 is an intra-state supply (CGST + SGST) and anything
 * else is inter-state (IGST).
 */
export const SELLER_GST_STATE_CODE = "33";

export type PromoterRequirement = {
  needPromoter: boolean;
  promoterQuantity: number;
};

export type PricedVehicleInput = {
  startDate: DateValue;
  endDate: DateValue;
  quantity: number;
  /** Per-day rental. Falls back to packageDetails.perDayRentalCost. */
  rate: number;
  /** The matched package, used for rtoCharges/brandingCost. */
  packageDetails?: { rtoCharges?: number; brandingCost?: number; perDayRentalCost?: number } | null;
} & PromoterRequirement;

export type PricedVehicle = {
  days: number;
  quantity: number;
  perDayRentalCost: number;
  rentalCost: number;
  promoterChargePerDay: number;
  promoterQuantity: number;
  promoterCost: number;
  rtoCharges: number;
  rtoCost: number;
  brandingCost: number;
  /** rentalCost + promoterCost + rtoCost + brandingCost */
  lineTotal: number;
};

export type TaxSplit = {
  /** true when the supply is intra-state (CGST + SGST) */
  isIntraState: boolean;
  cgstPercent: number;
  sgstPercent: number;
  igstPercent: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
};

export type OrderPricing = {
  rentalTotal: number;
  promoterTotal: number;
  rtoTotal: number;
  /** rental + promoter + rto */
  subtotal: number;
  /** Always 0 on the public site — no entry point exists. */
  additionalCharges: number;
  /** Always 0 on the public site — admin applies discounts later. */
  discount: number;
  /** subtotal + additionalCharges − discount */
  taxableAmount: number;
  gstPercentage: number;
  gstAmount: number;
  grandTotal: number;
} & TaxSplit;

/**
 * Prices one vehicle line.
 *
 * Day count is inclusive (21 Jul → 21 Jul = 1 day), matching
 * getInclusiveDayCount used across the public site. Admin's calcPricing
 * arrives at the same inclusive count via `ceil(diff) + 1`.
 */
export const priceVehicleLine = (
  vehicle: PricedVehicleInput
): PricedVehicle => {
  const days = getInclusiveDayCount(vehicle.startDate, vehicle.endDate);

  const quantity = Math.max(
    Math.floor(toSafeNumber(vehicle.quantity)),
    1
  );

  const directRate = toSafeNumber(vehicle.rate);
  const packageRate = toSafeNumber(vehicle.packageDetails?.perDayRentalCost);

  const perDayRentalCost = directRate > 0 ? directRate : packageRate;

  const rentalCost = perDayRentalCost * days * quantity;

  const promoterQuantity = vehicle.needPromoter
    ? Math.max(Math.floor(toSafeNumber(vehicle.promoterQuantity)), 0)
    : 0;

  /* Promoter charge mirrors admin: flat env rate × days × promoter count.
     The toggle being off zeroes the whole line, not just the quantity. */
  const promoterChargePerDay = vehicle.needPromoter
    ? DEFAULT_PROMOTER_CHARGE
    : 0;

  const promoterCost = promoterChargePerDay * days * promoterQuantity;

  // RTO is a one-time flat charge per vehicle, from the matched package.
  const rtoCharges = toSafeNumber(vehicle.packageDetails?.rtoCharges);
  const rtoCost = rtoCharges * quantity;

  // Branding Cost — only ever set on a Hybrid vehicle's package.
  const brandingCost = toSafeNumber(vehicle.packageDetails?.brandingCost) * quantity;

  const lineTotal = rentalCost + promoterCost + rtoCost + brandingCost;

  return {
    days,
    quantity,
    perDayRentalCost,
    rentalCost,
    promoterChargePerDay,
    promoterQuantity,
    promoterCost,
    rtoCharges,
    rtoCost,
    brandingCost,
    lineTotal: Number.isFinite(lineTotal) ? lineTotal : 0,
  };
};

/**
 * Splits a GST amount into CGST/SGST or IGST from the customer's GSTIN.
 *
 * The TOTAL never changes — only how it is presented. A customer with no
 * GSTIN (an individual) is treated as intra-state, which is what a
 * walk-in Tamil Nadu booking is.
 */
export const splitGst = (
  gstAmount: number,
  gstPercentage: number,
  gstNumber?: string | null
): TaxSplit => {
  const stateCode = String(gstNumber || "").trim().slice(0, 2);

  const isIntraState =
    !stateCode || stateCode === SELLER_GST_STATE_CODE;

  const safeGstAmount = toSafeNumber(gstAmount);
  const safeGstPercent = toSafeNumber(gstPercentage);

  if (isIntraState) {
    const half = safeGstAmount / 2;

    return {
      isIntraState: true,
      cgstPercent: safeGstPercent / 2,
      sgstPercent: safeGstPercent / 2,
      igstPercent: 0,
      cgstAmount: half,
      sgstAmount: half,
      igstAmount: 0,
    };
  }

  return {
    isIntraState: false,
    cgstPercent: 0,
    sgstPercent: 0,
    igstPercent: safeGstPercent,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: safeGstAmount,
  };
};

/**
 * Rolls priced lines up into the order totals shown on Review Order.
 *
 * gstAmount stays `taxable × gstPercentage / 100` — byte-identical to the
 * formula the CampaignRequest review modal has always used. Only the
 * CGST/SGST/IGST presentation is new.
 */
export const priceOrder = (
  lines: PricedVehicle[],
  gstPercentage: number,
  gstNumber?: string | null
): OrderPricing => {
  const rentalTotal = lines.reduce(
    (total, line) => total + toSafeNumber(line.rentalCost),
    0
  );

  const promoterTotal = lines.reduce(
    (total, line) => total + toSafeNumber(line.promoterCost),
    0
  );

  const rtoTotal = lines.reduce(
    (total, line) => total + toSafeNumber(line.rtoCost),
    0
  );

  const subtotal = rentalTotal + promoterTotal + rtoTotal;

  /* No public entry point for either — kept so Review Order can show the
     same rows admin does and admin can fill them in without a shape change. */
  const additionalCharges = 0;
  const discount = 0;

  const taxableAmount = Math.max(
    subtotal + additionalCharges - discount,
    0
  );

  const safeGstPercent = toSafeNumber(gstPercentage);
  const gstAmount = taxableAmount * (safeGstPercent / 100);
  const grandTotal = taxableAmount + gstAmount;

  return {
    rentalTotal,
    promoterTotal,
    rtoTotal,
    subtotal,
    additionalCharges,
    discount,
    taxableAmount,
    gstPercentage: safeGstPercent,
    gstAmount,
    grandTotal,
    ...splitGst(gstAmount, safeGstPercent, gstNumber),
  };
};

/**
 * "₹1,25,000.00" — the two-decimal presentation Review Order and the
 * confirmation page use. formatCurrency's own default is 0 decimals, which
 * the vehicle carousel and cart rely on, so this does not change it.
 */
export const formatMoney = (amount: unknown): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(toSafeNumber(amount));
