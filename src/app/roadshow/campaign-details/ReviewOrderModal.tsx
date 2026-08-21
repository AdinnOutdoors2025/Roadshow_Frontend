/* eslint-disable */
// @ts-nocheck
"use client";

/* -------------------------------------------------------------------------- */
/*                    REVIEW YOUR ROADSHOW BOOKING  (popup)                   */
/* -------------------------------------------------------------------------- */
/*  The review step is a popup over Campaign Details rather than a page of     */
/*  its own: the customer confirms and sends from here, and only a successful  */
/*  send moves them on to the confirmation page.                               */
/*                                                                            */
/*  SCROLLING: the shell is capped at 94vh and the two columns scroll          */
/*  independently on desktop (left detail column, right pricing column), so a  */
/*  short laptop viewport can always reach Send Request. Below 1024px the      */
/*  whole body becomes one scroll container instead — nested scrollers on a    */
/*  narrow screen are how content ends up unreachable.                         */
/*                                                                            */
/*  `data-lenis-prevent` on the overlay is NOT optional. Lenis wraps the whole */
/*  roadshow layout and drives scrolling from its own wheel listener; while it */
/*  is stopped — which useScrollLock does for every open popup — it calls      */
/*  preventDefault() on EVERY wheel event (see lenis.mjs, `if (this.isStopped  */
/*  || this.isLocked) event.preventDefault()`). Without this attribute the     */
/*  columns below are perfectly scrollable and yet nothing can scroll them.    */
/*  Lenis checks the whole composed path, so declaring it once on the overlay  */
/*  covers every scroller inside.                                              */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  CalendarDays,
  ImageIcon,
  Info,
  LoaderCircle,
  MapPin,
  Pencil,
  Receipt,
  Send,
  ShieldCheck,
  Truck,
  TriangleAlert,
  User,
  Users,
  X,
} from "lucide-react";

import { useScrollLock } from "@/hooks/useScrollLock";
import { FALLBACK_VEHICLE_IMAGE } from "@/lib/roadshowVehicles";
import { formatDate, getInclusiveDayCount } from "@/app/utils/currency";
import { formatMoney } from "@/lib/roadshowPricing";
import {
  formatPhone,
  resolveCampaignType,
  resolvePromoterType,
} from "@/lib/roadshowRequestSubmit";
import TermsAndConditionsModal from "@/components/Client/Reusable_Components/TermsAndConditionsModal";

import "./ReviewOrderModal.css";

export default function ReviewOrderModal({
  open,
  onClose,
  rows,
  pricing,
  user,
  agencyBusiness,
  mediaMissing,
  submitting,
  onSubmit,
  onEditVehicle,
}) {
  const [termsOpen, setTermsOpen] = useState(false);

  useScrollLock(open);

  /* Escape closes — but never mid-send, or the customer loses sight of a
     request that is already on its way. */
  useEffect(() => {
    if (!open) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) onClose();
    };

    document.addEventListener("keydown", handleKey);

    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose, submitting]);

  if (!open || typeof document === "undefined") return null;

  /* Campaign window across every vehicle — earliest start, latest end */
  const startDates = rows
    .map((row) => row.vehicle.startDate)
    .filter(Boolean);

  const endDates = rows.map((row) => row.vehicle.endDate).filter(Boolean);

  const campaignStart = startDates.length
    ? new Date(Math.min(...startDates.map((date) => date.getTime())))
    : null;

  const campaignEnd = endDates.length
    ? new Date(Math.max(...endDates.map((date) => date.getTime())))
    : null;

  const totalDays = getInclusiveDayCount(campaignStart, campaignEnd);

  const firstDetails = rows[0]?.details;

  return (
    <>
      {createPortal(
    <div
      className="rdsw_rvOverlay"
      role="dialog"
      aria-modal="true"
      aria-label="Review your roadshow booking"
      data-lenis-prevent
    >
      <div
        className="rdsw_rvBackdrop"
        onClick={() => {
          if (!submitting) onClose();
        }}
      />

      <div className="rdsw_rvShell">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <header className="rdsw_rvHeader">
          <div className="rdsw_rvHeaderCopy">
            <h2 className="rdsw_rvTitle">Review Your Roadshow Booking</h2>

            <p className="rdsw_rvSubtitle">
              Please review your details before sending the request
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
            className="rdsw_rvClose"
          >
            <X size={18} />
          </button>
        </header>

        {/* ── Body ────────────────────────────────────────────────────── */}
        <div className="rdsw_rvBody">
          <div className="rdsw_rvLeft">
            {mediaMissing && (
              <div className="rdsw_rvWarning">
                <TriangleAlert size={15} className="shrink-0" />

                <span>
                  Campaign media needs re-attaching — files are held in this
                  tab only and were cleared by a page reload. Close this and
                  add them again, or send without media.
                </span>
              </div>
            )}

            {/* ── Quick facts ──────────────────────────────────────────── */}
            <div className="rdsw_rvFactRow">
              <article className="rdsw_rvFact">
                <span className="rdsw_rvFactIcon rdsw_rvFactIconBlue">
                  <User size={15} />
                </span>

                <div className="rdsw_rvFactBody">
                  <p className="rdsw_rvFactLabel">Contact Person</p>

                  <p className="rdsw_rvFactValue">{user?.name || "—"}</p>

                  <p className="rdsw_rvFactMeta">
                    {formatPhone(user?.phone)}
                  </p>

                  <p className="rdsw_rvFactMeta">{user?.email || "—"}</p>
                </div>
              </article>

              <article className="rdsw_rvFact">
                <span className="rdsw_rvFactIcon rdsw_rvFactIconIndigo">
                  <CalendarDays size={15} />
                </span>

                <div className="rdsw_rvFactBody">
                  <p className="rdsw_rvFactLabel">Campaign Dates</p>

                  <p className="rdsw_rvFactValue">
                    {formatDate(campaignStart, {
                      pattern: "dd MMM yyyy",
                      fallback: "—",
                    })}
                  </p>

                  <p className="rdsw_rvFactMeta" style={{textAlign:'center'}}>to</p>

                  <p className="rdsw_rvFactValue">
                    {formatDate(campaignEnd, {
                      pattern: "dd MMM yyyy",
                      fallback: "—",
                    })}
                  </p>

                  <p className="rdsw_rvFactHighlight" >
                    {totalDays} {totalDays === 1 ? "Day" : "Days"}
                  </p>
                </div>
              </article>

              <article className="rdsw_rvFact">
                <span className="rdsw_rvFactIcon rdsw_rvFactIconGreen">
                  <MapPin size={15} />
                </span>

                <div className="rdsw_rvFactBody">
                  <p className="rdsw_rvFactLabel">Campaign</p>

                  <p className="rdsw_rvFactValue">
                    {firstDetails?.campaignName?.trim() || "—"}
                  </p>

                  <p className="rdsw_rvFactMeta">
                    {firstDetails ? resolveCampaignType(firstDetails) : "—"}
                  </p>

                  <p className="rdsw_rvFactMeta">
                    {firstDetails?.campaignLocation?.trim() || "—"}
                  </p>
                </div>
              </article>

              {agencyBusiness && (
                <article className="rdsw_rvFact">
                  <span className="rdsw_rvFactIcon rdsw_rvFactIconGreen">
                    <ShieldCheck size={15} />
                  </span>

                  <div className="rdsw_rvFactBody">
                    <p className="rdsw_rvFactLabel">
                      Agency · GST Verified
                    </p>

                    <p className="rdsw_rvFactValue">
                      {agencyBusiness.business_name}
                    </p>

                    <p className="rdsw_rvFactMeta rdsw_rvMono">
                      {agencyBusiness.gst_number}
                    </p>

                    <p className="rdsw_rvFactMeta rdsw_rvMono">
                      PAN {agencyBusiness.business_pan || "—"}
                    </p>
                  </div>
                </article>
              )}
            </div>

            {/* ── Selected vehicles ────────────────────────────────────── */}
            <section className="rdsw_rvPanel">
              <div className="rdsw_rvPanelHead">
                <Truck size={17} />

                <h3>Selected Vehicles</h3>

                <span className="rdsw_rvPanelCount">
                  {rows.length} {rows.length === 1 ? "Vehicle" : "Vehicles"}
                </span>
              </div>

              <div className="rdsw_rvVehicleList">
                {rows.map(({ vehicle, details, pricing: line, media }, index) => (
                  <article
                    key={String(vehicle.id)}
                    className="rdsw_rvVehicleCard"
                  >
                    <div className="rdsw_rvVehicleMedia">
                      <span className="rdsw_rvVehicleBadge">
                        Vehicle {index + 1}
                      </span>

                      <img
                        src={vehicle.image || FALLBACK_VEHICLE_IMAGE}
                        alt={vehicle.name}
                        className="rdsw_rvVehicleImage"
                        onError={(event) => {
                          const image = event.currentTarget;

                          if (image.src !== FALLBACK_VEHICLE_IMAGE) {
                            image.src = FALLBACK_VEHICLE_IMAGE;
                          }
                        }}
                      />
                    </div>

                    <div className="rdsw_rvVehicleInfo">
                      <div className="rdsw_rvVehicleTop">
                        <h4 className="rdsw_rvVehicleName">
                          {vehicle.name}
                        </h4>

                        {/* Closes the popup and opens THIS vehicle's step
                            in the form behind it. The values are already in
                            the campaign draft, so the step renders prefilled
                            with no extra fetch or hand-off. */}
                        <button
                          type="button"
                          onClick={() => onEditVehicle(vehicle.id)}
                          disabled={submitting}
                          aria-label={`Edit campaign details for ${vehicle.name}`}
                          className="rdsw_rvVehicleEdit"
                        >
                          <Pencil size={12} />
                          Edit
                        </button>
                      </div>

                      <div className="rdsw_rvVehicleGrid">
                        <div className="rdsw_rvStat">
                          <span>
                            <CalendarDays size={12} /> Start Date
                          </span>

                          <strong>
                            {formatDate(vehicle.startDate, {
                              pattern: "dd MMM yyyy",
                              fallback: "—",
                            })}
                          </strong>
                        </div>

                        <div className="rdsw_rvStat">
                          <span>
                            <CalendarDays size={12} /> End Date
                          </span>

                          <strong>
                            {formatDate(vehicle.endDate, {
                              pattern: "dd MMM yyyy",
                              fallback: "—",
                            })}
                          </strong>
                        </div>

                        <div className="rdsw_rvStat">
                          <span>Duration</span>

                          <strong>
                            {line.days} {line.days === 1 ? "Day" : "Days"}
                          </strong>
                        </div>

                        <div className="rdsw_rvStat">
                          <span>Rate Per Day</span>

                          <strong>
                            {formatMoney(line.perDayRentalCost)}
                          </strong>
                        </div>

                        <div className="rdsw_rvStat">
                          <span>Quantity</span>

                          <strong>
                            {line.quantity}{" "}
                            {line.quantity === 1 ? "Vehicle" : "Vehicles"}
                          </strong>
                        </div>

                        <div className="rdsw_rvStat rdsw_rvStatAmount">
                          <span>Amount</span>

                          <strong>{formatMoney(line.lineTotal)}</strong>
                        </div>
                      </div>

                      <div className="rdsw_rvVehicleMeta">
                        <p>
                          <MapPin size={12} />
                          <span>Campaign</span>
                          {details.campaignName.trim() || "—"} ·{" "}
                          {resolveCampaignType(details) || "—"} ·{" "}
                          {details.campaignLocation.trim() || "—"}
                        </p>

                        {/* Same rule per vehicle: the promoter line only
                            appears when one was actually requested. */}
                        {details.needPromoter && (
                          <p>
                            <Users size={12} />
                            <span>Promoter</span>
                            {resolvePromoterType(details)} ·{" "}
                            {details.promoterGender || "Any"} ·{" "}
                            {details.promoterLanguage.join(", ") || "—"} · Qty{" "}
                            {line.promoterQuantity} ·{" "}
                            {formatMoney(line.promoterCost)}
                          </p>
                        )}

                        <p>
                          <ImageIcon size={12} />
                          <span>Media</span>
                          {media.images.length + media.videos.length === 0
                            ? "No media attached"
                            : [
                                media.images.length
                                  ? `${media.images.length} image${
                                      media.images.length === 1 ? "" : "s"
                                    }`
                                  : "",
                                media.videos.length
                                  ? `${media.videos.length} video${
                                      media.videos.length === 1 ? "" : "s"
                                    }`
                                  : "",
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* ── Notes ────────────────────────────────────────────────── */}
            <div className="rdsw_rvNotes">
              <Info size={16} className="shrink-0" />

              <div>
                <p className="rdsw_rvNotesTitle">Important Notes</p>

                <p className="rdsw_rvNotesBody">
                  The final quotation may vary depending on campaign requirements, branding, fabrication, logistics, permits, and applicable location-based RTO charges. Vehicle availability and final pricing will be confirmed by our team after reviewing your campaign request.
                </p>
              </div>
            </div>
          </div>

          {/* ── Pricing ───────────────────────────────────────────────── */}
          <aside className="rdsw_rvRight">
            <div className="rdsw_rvPricingCard">
              <div className="rdsw_rvPricingHead">
                <span className="rdsw_rvFactIcon rdsw_rvFactIconRed">
                  <Receipt size={15} />
                </span>

                <h3>Pricing Summary</h3>
              </div>

              <div className="rdsw_rvPricingRows">
                {rows.map(({ vehicle, pricing: line }, index) => (
                  <div
                    key={String(vehicle.id)}
                    className="rdsw_rvPricingRow"
                  >
                    <span>Vehicle {index + 1} Total</span>
                    <span>{formatMoney(line.lineTotal)}</span>
                  </div>
                ))}

                <div className="rdsw_rvPricingRow rdsw_rvPricingDivider">
                  <span>Vehicle Rental</span>
                  <span>{formatMoney(pricing.rentalTotal)}</span>
                </div>

                {/* Only charges that actually apply are listed. A column of
                    ₹0.00 rows reads as though something failed to calculate
                    — promoter charges appear when a promoter is requested,
                    and the same rule is applied to every other optional
                    line rather than just that one. */}
                {pricing.promoterTotal > 0 && (
                  <div className="rdsw_rvPricingRow">
                    <span>Promoter Charges</span>
                    <span>{formatMoney(pricing.promoterTotal)}</span>
                  </div>
                )}

                {pricing.additionalCharges + pricing.rtoTotal > 0 && (
                  <div className="rdsw_rvPricingRow">
                    <span>Additional Charges</span>
                    <span>
                      {formatMoney(
                        pricing.additionalCharges + pricing.rtoTotal
                      )}
                    </span>
                  </div>
                )}

                {pricing.discount > 0 && (
                  <div className="rdsw_rvPricingRow">
                    <span>Discount</span>
                    <span>− {formatMoney(pricing.discount)}</span>
                  </div>
                )}

                <div className="rdsw_rvPricingRow rdsw_rvPricingDivider">
                  <span>Taxable Amount</span>
                  <span>{formatMoney(pricing.taxableAmount)}</span>
                </div>

                {pricing.isIntraState ? (
                  <>
                    <div className="rdsw_rvPricingRow">
                      <span>CGST ({pricing.cgstPercent}%)</span>
                      <span>{formatMoney(pricing.cgstAmount)}</span>
                    </div>

                    <div className="rdsw_rvPricingRow">
                      <span>SGST ({pricing.sgstPercent}%)</span>
                      <span>{formatMoney(pricing.sgstAmount)}</span>
                    </div>
                  </>
                ) : (
                  <div className="rdsw_rvPricingRow">
                    <span>IGST ({pricing.igstPercent}%)</span>
                    <span>{formatMoney(pricing.igstAmount)}</span>
                  </div>
                )}
              </div>

              <div className="rdsw_rvTotalRow">
                <span>Estimated Total</span>
                <strong>{formatMoney(pricing.grandTotal)}</strong>
              </div>

              {/* <div className="rdsw_rvCallout rdsw_rvCalloutRed">
                <p className="rdsw_rvCalloutTitle">
                  This is an estimated cost.
                </p>

                <p className="rdsw_rvCalloutBody">
                  The final quotation may vary based on campaign requirements
                  and other applicable charges.
                </p>
              </div> */}

              <div className="rdsw_rvCallout rdsw_rvCalloutGreen">
                <p className="rdsw_rvCalloutTitle">
                  <ShieldCheck size={13} /> Secure &amp; Reliable
                </p>

                <p className="rdsw_rvCalloutBody">
                  Your information is safe with us.
                </p>
              </div>

              <div className="rdsw_rvActions">
                {/* Goes back to the first vehicle's step rather than just
                    dismissing the popup — "Edit Details" that only closes
                    the dialog leaves the customer to find the form again. */}
                <button
                  type="button"
                  onClick={() => onEditVehicle(rows[0]?.vehicle?.id)}
                  disabled={submitting}
                  className="rdsw_rvEditBtn"
                >
                  <Pencil size={15} />
                  Edit Details
                </button>

                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={submitting}
                  className="rdsw_rvSendBtn"
                >
                  {submitting ? (
                    <LoaderCircle size={15} className="animate-spin" />
                  ) : (
                    <Send size={15} />
                  )}

                  {submitting ? "Sending..." : "Send Request"}
                </button>
              </div>

              <p className="rdsw_rvTerms">
                By sending the request, you agree to our{" "}
                <button
                  type="button"
                  className="rdsw_rvTermsLink"
                  onClick={() => setTermsOpen(true)}
                >
                  Terms &amp; Conditions
                </button>
                .
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>,
    document.body
      )}

      <TermsAndConditionsModal
        open={termsOpen}
        onClose={() => setTermsOpen(false)}
      />
    </>
  );
}
