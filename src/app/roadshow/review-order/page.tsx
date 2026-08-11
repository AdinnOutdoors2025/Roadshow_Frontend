/* eslint-disable */
// @ts-nocheck
"use client";

/* -------------------------------------------------------------------------- */
/*                          REVIEW ORDER  (step 3 of 3)                       */
/* -------------------------------------------------------------------------- */
/*  Last stop before the request is placed: everything the customer entered,   */
/*  read back to them, plus the full pricing breakdown.                        */
/*                                                                            */
/*  Nothing is re-entered here and nothing is re-derived — the cart supplies   */
/*  vehicles/dates/quantities, the campaign draft supplies the campaign copy,  */
/*  and roadshowPricing.ts supplies every number, so the totals shown here     */
/*  are the exact totals submitted.                                            */
/*                                                                            */
/*  Submission goes to the SAME endpoint the old review modal used             */
/*  (POST client-requests). It is sent as multipart only because campaign      */
/*  media now rides along; the JSON body itself is unchanged apart from        */
/*  additive fields, so an older client posting plain JSON still works.        */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  CalendarDays,
  ChevronLeft,
  ImageIcon,
  LoaderCircle,
  MapPin,
  Send,
  TriangleAlert,
  User,
  Users,
  Video,
} from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "@/context/AuthContext";
import {
  FALLBACK_VEHICLE_IMAGE,
  fetchAllRoadshowVehicles,
} from "@/lib/roadshowVehicles";
import { clearCart, readCart } from "@/lib/roadshowCart";
import {
  clearCampaignDraft,
  emptyCampaignDetails,
  getMedia,
  hasPendingMedia,
  readCampaignDraft,
  reconcileDraftWithVehicles,
} from "@/lib/roadshowCampaignDraft";
import {
  formatMoney,
  priceOrder,
  priceVehicleLine,
} from "@/lib/roadshowPricing";
import {
  formatDate,
  formatDateForApi,
  parseStoredDate,
  toSafeNumber,
} from "@/app/utils/currency";
import { GST_Percentage } from "@/BaseUrl";
import {
  formatPhone,
  resolveCampaignType,
  resolvePromoterType,
  submitClientRequest,
} from "@/lib/roadshowRequestSubmit";

import "./page.css";

export default function ReviewOrderPage() {
  const router = useRouter();
  const { user, openAuth, authLoading, isAgency } = useAuth();

  const agencyBusiness = isAgency ? user?.business || null : null;

  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [draft, setDraft] = useState(() => ({
    vehicles: {},
    appliedToAllFrom: null,
  }));
  const [mediaMissing, setMediaMissing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const authPromptedRef = useRef(false);
  const hydratedRef = useRef(false);

  /* ── Auth gate ─────────────────────────────────────────────────────── */
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      if (!authPromptedRef.current) {
        authPromptedRef.current = true;

        toast.error("Please login to continue booking.", {
          id: "review-order-login-required",
        });

        openAuth("login");
      }

      return;
    }

    authPromptedRef.current = false;
  }, [user, authLoading, openAuth]);

  /* ── Rebuild the order from cart + draft ───────────────────────────── */
  useEffect(() => {
    if (authLoading) return;
    if (hydratedRef.current) return;

    let componentMounted = true;

    const loadOrder = async () => {
      try {
        const apiVehicles = await fetchAllRoadshowVehicles();

        if (!componentMounted) return;

        const savedCart = readCart(user?._id);

        const restored = savedCart
          .map((item) => {
            const matched = (apiVehicles || []).find(
              (vehicle) => String(vehicle.id) === String(item.vehicleId)
            );

            if (!matched) return null;

            const directRate = toSafeNumber(matched.rate);
            const packageRate = toSafeNumber(
              matched.packageDetails?.perDayRentalCost
            );

            return {
              ...matched,
              rate: directRate > 0 ? directRate : packageRate,
              startDate: parseStoredDate(item.startDate),
              endDate: parseStoredDate(item.endDate),
              quantity: Math.max(Number(item.quantity || 1), 1),
            };
          })
          .filter(Boolean);

        if (!restored.length) {
          toast.error("Select at least one campaign vehicle first.");
          router.replace("/roadshow/CampaignRequest");
          return;
        }

        const reconciled = reconcileDraftWithVehicles(
          readCampaignDraft(user?._id),
          restored.map((vehicle) => String(vehicle.id))
        );

        hydratedRef.current = true;

        setSelectedVehicles(restored);
        setDraft(reconciled);

        /* Files live only in memory — a refresh between the two pages keeps
           the campaign copy but loses the bytes. Say so rather than quietly
           submitting a request with no media attached. */
        setMediaMissing(hasPendingMedia(reconciled));
      } catch (error) {
        console.error("Review order loading error:", error);

        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load your order."
        );
      } finally {
        if (componentMounted) setLoading(false);
      }
    };

    loadOrder();

    return () => {
      componentMounted = false;
    };
  }, [user, authLoading, router]);

  /* ── Pricing ───────────────────────────────────────────────────────── */
  const rows = useMemo(() => {
    return selectedVehicles.map((vehicle) => {
      const id = String(vehicle.id);
      const details = draft.vehicles[id] || emptyCampaignDetails(id);

      const pricing = priceVehicleLine({
        startDate: vehicle.startDate,
        endDate: vehicle.endDate,
        quantity: vehicle.quantity,
        rate: vehicle.rate,
        packageDetails: vehicle.packageDetails,
        needPromoter: details.needPromoter,
        promoterQuantity: details.promoterQuantity,
      });

      return { vehicle, details, pricing, media: getMedia(id) };
    });
  }, [selectedVehicles, draft]);

  const pricing = useMemo(
    () =>
      priceOrder(
        rows.map((row) => row.pricing),
        parseFloat(GST_Percentage),
        agencyBusiness?.gst_number
      ),
    [rows, agencyBusiness]
  );

  /* ── Submit ────────────────────────────────────────────────────────── */
  const handleSubmit = useCallback(async () => {
    if (submitting) return;

    if (!user?._id) {
      toast.error("Please login to submit your campaign request.");
      openAuth("login");
      return;
    }

    try {
      setSubmitting(true);

      /* Payload building and the POST live in roadshowRequestSubmit.ts, so
         this route and the review popup on Campaign Details send byte-
         identical requests from one implementation. */
      const created = await submitClientRequest({
        user,
        isAgency,
        agencyBusiness,
        rows,
        pricing,
        formatDateForApi,
      });

      sessionStorage.setItem(
        "roadshow_last_client_request",
        JSON.stringify(created)
      );

      /* The request is placed — neither the cart nor the draft is needed */
      clearCart(user?._id);
      clearCampaignDraft(user?._id);
      hydratedRef.current = false;

      toast.success("Booking request submitted successfully.");

      router.push(
        `/roadshow/booking-request-submitted/${created._id}`
      );
    } catch (error) {
      console.error("Campaign request error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to submit the campaign request."
      );
    } finally {
      setSubmitting(false);
    }
  }, [
    submitting,
    user,
    isAgency,
    agencyBusiness,
    rows,
    pricing,
    openAuth,
    router,
  ]);

  if (loading) {
    return (
      <main className="rdsw_roLoading">
        <LoaderCircle className="h-5 w-5 animate-spin" />
        Loading your order...
      </main>
    );
  }

  return (
    <main className="rdsw_roPage">
      <section className="rdsw_roShell">
        {/* ── Stepper ─────────────────────────────────────────────────── */}
        <header className="rdsw_roPageHeader">
          <ol className="rdsw_roSteps">
            <li className="rdsw_roStep rdsw_roStepDone">
              <span>1</span>Customer &amp; Vehicles
            </li>

            <li className="rdsw_roStep rdsw_roStepDone">
              <span>2</span>Campaign Details
            </li>

            <li className="rdsw_roStep rdsw_roStepActive">
              <span>3</span>Review Order
            </li>
          </ol>

          <h1 className="rdsw_roPageTitle">Review Your Order</h1>

          <p className="rdsw_roPageSubtitle">
            Confirm everything below before sending your booking request.
          </p>
        </header>

        {mediaMissing && (
          <div className="rdsw_roWarning">
            <TriangleAlert size={16} className="shrink-0" />

            <span>
              Campaign media needs re-attaching — files are held in this tab
              only and were cleared by a page reload. Go back to Campaign
              Details to add them again, or submit without media.
            </span>
          </div>
        )}

        <div className="rdsw_roLayout">
          <div className="rdsw_roMain">
            {/* ── Customer details ─────────────────────────────────────── */}
            <section className="rdsw_roSection">
              <div className="rdsw_roSectionHead">
                <User size={15} />
                <h2>Customer Details</h2>
              </div>

              <div className="rdsw_roDetailGrid">
                <div className="rdsw_roDetail">
                  <span>Name</span>
                  <strong>{user?.name || "—"}</strong>
                </div>

                <div className="rdsw_roDetail">
                  <span>Email</span>
                  <strong>{user?.email || "—"}</strong>
                </div>

                <div className="rdsw_roDetail">
                  <span>Phone</span>
                  <strong>{formatPhone(user?.phone)}</strong>
                </div>
              </div>
            </section>

            {/* ── Agency identity ──────────────────────────────────────── */}
            {agencyBusiness && (
              <section className="rdsw_roSection">
                <div className="rdsw_roSectionHead">
                  <Building2 size={15} />
                  <h2>Agency Details</h2>

                  <span className="rdsw_roVerifiedBadge">GST Verified</span>
                </div>

                <div className="rdsw_roDetailGrid">
                  <div className="rdsw_roDetail">
                    <span>GST Number</span>
                    <strong className="rdsw_roMono">
                      {agencyBusiness.gst_number}
                    </strong>
                  </div>

                  <div className="rdsw_roDetail">
                    <span>Company Name</span>
                    <strong>{agencyBusiness.business_name}</strong>
                  </div>

                  <div className="rdsw_roDetail">
                    <span>PAN</span>
                    <strong className="rdsw_roMono">
                      {agencyBusiness.business_pan || "—"}
                    </strong>
                  </div>
                </div>
              </section>
            )}

            {/* ── Per-vehicle campaign details ─────────────────────────── */}
            <section className="rdsw_roSection">
              <div className="rdsw_roSectionHead">
                <CalendarDays size={15} />
                <h2>
                  Campaign Details ({rows.length}{" "}
                  {rows.length === 1 ? "Vehicle" : "Vehicles"})
                </h2>
              </div>

              <div className="rdsw_roVehicleList">
                {rows.map(({ vehicle, details, pricing: line, media }, index) => (
                  <article
                    key={String(vehicle.id)}
                    className="rdsw_roVehicleCard"
                  >
                    <header className="rdsw_roVehicleHead">
                      <img
                        src={vehicle.image || FALLBACK_VEHICLE_IMAGE}
                        alt={vehicle.name}
                        className="rdsw_roVehicleImage"
                        onError={(event) => {
                          const image = event.currentTarget;

                          if (image.src !== FALLBACK_VEHICLE_IMAGE) {
                            image.src = FALLBACK_VEHICLE_IMAGE;
                          }
                        }}
                      />

                      <div className="rdsw_roVehicleHeadInfo">
                        <p className="rdsw_roVehicleEyebrow">
                          Vehicle {index + 1}
                        </p>

                        <h3 className="rdsw_roVehicleName">
                          {vehicle.name}
                        </h3>

                        <p className="rdsw_roVehicleMeta">
                          {formatMoney(line.perDayRentalCost)} / day ·{" "}
                          {line.quantity}{" "}
                          {line.quantity === 1 ? "vehicle" : "vehicles"} ·{" "}
                          {line.days} {line.days === 1 ? "day" : "days"}
                        </p>
                      </div>

                      <div className="rdsw_roVehicleTotal">
                        <span>Line Total</span>
                        <strong>{formatMoney(line.lineTotal)}</strong>
                      </div>
                    </header>

                    <div className="rdsw_roVehicleBody">
                      <div className="rdsw_roDetail">
                        <span>Campaign</span>
                        <strong>
                          {details.campaignName.trim() || "—"}
                        </strong>
                      </div>

                      <div className="rdsw_roDetail">
                        <span>Campaign Type</span>
                        <strong>
                          {resolveCampaignType(details) || "—"}
                        </strong>
                      </div>

                      <div className="rdsw_roDetail">
                        <span>
                          <CalendarDays size={11} /> Campaign Dates
                        </span>
                        <strong>
                          {formatDate(vehicle.startDate, {
                            pattern: "dd MMM yyyy",
                            fallback: "—",
                          })}{" "}
                          →{" "}
                          {formatDate(vehicle.endDate, {
                            pattern: "dd MMM yyyy",
                            fallback: "—",
                          })}
                        </strong>
                      </div>

                      <div className="rdsw_roDetail">
                        <span>
                          <MapPin size={11} /> Campaign Location
                        </span>
                        <strong>
                          {details.campaignLocation.trim() || "—"}
                        </strong>
                      </div>

                      {/* Promoter block appears only when one was requested */}
                      {details.needPromoter && (
                        <>
                          <div className="rdsw_roDetail">
                            <span>
                              <Users size={11} /> Promoter
                            </span>
                            <strong>
                              {resolvePromoterType(details)} ·{" "}
                              {details.promoterGender || "Any"} ·{" "}
                              {details.promoterLanguage.join(", ") || "—"} ·
                              Qty {line.promoterQuantity}
                            </strong>
                          </div>

                          <div className="rdsw_roDetail">
                            <span>Promoter Charges</span>
                            <strong>
                              {formatMoney(line.promoterCost)}
                            </strong>
                          </div>
                        </>
                      )}

                      <div className="rdsw_roDetail rdsw_roDetailWide">
                        <span>
                          <ImageIcon size={11} /> Campaign Media
                        </span>

                        <strong>
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
                        </strong>

                        {media.images.length + media.videos.length > 0 && (
                          <ul className="rdsw_roMediaNames">
                            {media.images.map((file, position) => (
                              <li key={`image-${position}`}>
                                <ImageIcon size={11} />
                                {file.name}
                              </li>
                            ))}

                            {media.videos.map((file, position) => (
                              <li key={`video-${position}`}>
                                <Video size={11} />
                                {file.name}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          {/* ── Pricing breakdown ──────────────────────────────────────── */}
          <aside className="rdsw_roSummary">
            <div className="rdsw_roSummaryCard">
              <h2 className="rdsw_roSummaryTitle">Pricing Breakdown</h2>

              <div className="rdsw_roSummaryRows">
                <div className="rdsw_roSummaryRow">
                  <span>Vehicle Rental</span>
                  <span>{formatMoney(pricing.rentalTotal)}</span>
                </div>

                {/* Optional charges are listed only when they apply — same
                    rule as the review popup, so the two never disagree. */}
                {pricing.promoterTotal > 0 && (
                  <div className="rdsw_roSummaryRow">
                    <span>Promoter Charges</span>
                    <span>{formatMoney(pricing.promoterTotal)}</span>
                  </div>
                )}

                {pricing.additionalCharges + pricing.rtoTotal > 0 && (
                  <div className="rdsw_roSummaryRow">
                    <span>Additional Charges</span>
                    <span>
                      {formatMoney(
                        pricing.additionalCharges + pricing.rtoTotal
                      )}
                    </span>
                  </div>
                )}

                {pricing.discount > 0 && (
                  <div className="rdsw_roSummaryRow">
                    <span>Discount</span>
                    <span>− {formatMoney(pricing.discount)}</span>
                  </div>
                )}

                <div className="rdsw_roSummaryRow rdsw_roSummaryDivider">
                  <span>Taxable Amount</span>
                  <span>{formatMoney(pricing.taxableAmount)}</span>
                </div>

                {pricing.isIntraState ? (
                  <>
                    <div className="rdsw_roSummaryRow">
                      <span>CGST {pricing.cgstPercent}%</span>
                      <span>{formatMoney(pricing.cgstAmount)}</span>
                    </div>

                    <div className="rdsw_roSummaryRow">
                      <span>SGST {pricing.sgstPercent}%</span>
                      <span>{formatMoney(pricing.sgstAmount)}</span>
                    </div>
                  </>
                ) : (
                  <div className="rdsw_roSummaryRow">
                    <span>IGST {pricing.igstPercent}%</span>
                    <span>{formatMoney(pricing.igstAmount)}</span>
                  </div>
                )}

                <div className="rdsw_roSummaryRow rdsw_roSummaryTotalRow">
                  <span>Grand Total</span>
                  <strong>{formatMoney(pricing.grandTotal)}</strong>
                </div>
              </div>

              <p className="rdsw_roSummaryNote">
                Note: This is an estimated cost. The final quotation may vary
                based on campaign requirements, branding, fabrication,
                logistics, and other applicable charges.
              </p>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="rdsw_roSubmitButton"
              >
                {submitting ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}

                {submitting ? "Submitting..." : "Submit Order"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/roadshow/campaign-details")}
                disabled={submitting}
                className="rdsw_roEditButton"
              >
                <ChevronLeft size={15} />
                Edit Campaign Details
              </button>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
