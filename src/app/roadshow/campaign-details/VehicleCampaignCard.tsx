/* eslint-disable */
// @ts-nocheck
"use client";

/* -------------------------------------------------------------------------- */
/*                      ONE VEHICLE'S CAMPAIGN DETAILS CARD                   */
/* -------------------------------------------------------------------------- */
/*  Every selected vehicle gets one of these. It carries the vehicle's own     */
/*  identity (image, name, per-day rental, dates, quantity) at the top and     */
/*  the campaign form beneath it, so a customer configuring five vehicles      */
/*  always knows which one they are looking at.                               */
/*                                                                            */
/*  Dates are NOT re-implemented here — the button opens the same shared       */
/*  DatePicker the CampaignRequest page uses, writing back to the same cart    */
/*  entry, so each vehicle keeps its own campaign dates exactly as before.     */

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeftRight,
  CalendarDays,
  ChevronDown,
  Minus,
  Plus,
  Users,
} from "lucide-react";

import { FALLBACK_VEHICLE_IMAGE } from "@/lib/roadshowVehicles";
import { formatDate } from "@/app/utils/currency";
import { formatMoney } from "@/lib/roadshowPricing";
import CampaignMediaUpload from "./CampaignMediaUpload";

export const PROMOTER_TYPE_OPTIONS = [
  "Brand Promotion",
  "Election Campaign",
  "Other",
];

export const PROMOTER_GENDER_OPTIONS = ["Male", "Female", "Other"];

export default function VehicleCampaignCard({
  index,
  vehicle,
  pricing,
  details,
  media,
  campaignTypes,
  languageOptions,
  errors,
  showApplyToAll,
  appliedToAll,
  /* True only on the card the shared details were copied FROM. The checkbox
     reads checked on every card while they are shared; this just changes the
     wording so the other cards explain where their values came from. */
  isApplySource,
  onApplyToAllChange,
  onDetailsChange,
  onMediaChange,
  onEditDates,
  onEditPromoterDates,
  onQuantityChange,
  onChangeVehicle,
}) {
  const [languageOpen, setLanguageOpen] = useState(false);
  const languageRef = useRef<HTMLDivElement>(null);

  /* Close the language panel on any outside click — same pattern as the
     admin modal's langDropdownRef handler. */
  useEffect(() => {
    if (!languageOpen) return;

    const handleOutside = (event: MouseEvent) => {
      if (
        languageRef.current &&
        !languageRef.current.contains(event.target as Node)
      ) {
        setLanguageOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);

    return () =>
      document.removeEventListener("mousedown", handleOutside);
  }, [languageOpen]);

  const toggleLanguage = (language: string) => {
    const selected = details.promoterLanguage.includes(language)
      ? details.promoterLanguage.filter((item) => item !== language)
      : [...details.promoterLanguage, language];

    onDetailsChange({ promoterLanguage: selected });
  };

  const fieldError = (field: string) => errors?.[field] || "";

  return (
    <article className="rdsw_cdCard">
      {/* ── Vehicle identity ────────────────────────────────────────────── */}
      <header className="rdsw_cdCardHeader">
        <div className="rdsw_cdCardImageWrap">
          <img
            src={vehicle.image || FALLBACK_VEHICLE_IMAGE}
            alt={vehicle.name}
            className="rdsw_cdCardImage"
            onError={(event) => {
              const image = event.currentTarget;

              if (image.src !== FALLBACK_VEHICLE_IMAGE) {
                image.src = FALLBACK_VEHICLE_IMAGE;
              }
            }}
          />

          <span className="rdsw_cdCardIndex">{index + 1}</span>
        </div>

        <div className="rdsw_cdCardHeadInfo">
          <p className="rdsw_cdCardEyebrow">Vehicle {index + 1}</p>

          <h3 className="rdsw_cdCardTitle">{vehicle.name}</h3>

          <p className="rdsw_cdCardRate">
            {formatMoney(pricing.perDayRentalCost)}
            <span> / per day</span>
          </p>
        </div>

        <div className="rdsw_cdCardHeadTotal">
          <span className="rdsw_cdCardHeadTotalLabel">Vehicle Rental</span>

          <strong className="rdsw_cdCardHeadTotalValue">
            {formatMoney(pricing.rentalCost)}
          </strong>

          <span className="rdsw_cdCardHeadTotalNote">
            {pricing.days} {pricing.days === 1 ? "day" : "days"} ×{" "}
            {pricing.quantity}{" "}
            {pricing.quantity === 1 ? "vehicle" : "vehicles"}
          </span>
        </div>
      </header>

      {/* ── Vehicle quantity ──────────────────────────────────────────────
          Editable here as well as on the selection step: having to go back a
          page to change a number you are looking at is the wrong trade. This
          writes to the same cart entry the CampaignRequest page owns, so the
          two stay in sync in both directions.

          Swapping the vehicle ITSELF still belongs to the selection step —
          that is what the link alongside is for. */}
      <section className="rdsw_cdSection">
        <div className="rdsw_cdQtyRow">
          <div className="rdsw_cdQtyCopy">
            <p className="rdsw_cdSectionTitle">Vehicle Quantity</p>

            <p className="rdsw_cdSectionNote">
              How many of this vehicle the campaign needs
            </p>
          </div>

          {/* Stepper and the swap link share the right edge of the row —
              the card is wide on desktop and stacking them left-aligned
              left a column of dead space beside them. */}
          <div className="rdsw_cdQtyActions">
            <div className="rdsw_cdStepper">
              <button
                type="button"
                onClick={() =>
                  onQuantityChange(Math.max(vehicle.quantity - 1, 1))
                }
                disabled={vehicle.quantity <= 1}
                aria-label="Reduce vehicle quantity"
                className="rdsw_cdStepperBtn"
              >
                <Minus size={12} />
              </button>

              <span className="rdsw_cdStepperValue">
                {vehicle.quantity}
              </span>

              <button
                type="button"
                onClick={() => onQuantityChange(vehicle.quantity + 1)}
                aria-label="Increase vehicle quantity"
                className="rdsw_cdStepperBtn"
              >
                <Plus size={12} />
              </button>
            </div>

            <button
              type="button"
              onClick={onChangeVehicle}
              className="rdsw_cdChangeVehicle"
            >
              <ArrowLeftRight size={13} />
              Change vehicle or add another
            </button>
          </div>
        </div>

        {/* Availability stays advisory here, exactly as on the selection
            step — the customer asks for what they need and admin confirms. */}
        {vehicle.quantity > Number(vehicle.availableVehicles || 0) && (
          <p className="rdsw_cdQtyNote">
            {Number(vehicle.availableVehicles || 0)} available right now —
            you can still request this quantity and our team will confirm it.
          </p>
        )}
      </section>

      {/* ── Campaign dates (existing date logic, unchanged) ─────────────── */}
      <section className="rdsw_cdSection">
        <p className="rdsw_cdSectionTitle">Campaign Dates</p>

        <button
          type="button"
          onClick={onEditDates}
          className="rdsw_cdDateButton"
        >
          <CalendarDays size={15} className="shrink-0" />

          <span className="rdsw_cdDateText">
            {formatDate(vehicle.startDate, {
              pattern: "dd MMM yyyy",
              fallback: "Select date",
            })}
            {"  →  "}
            {formatDate(vehicle.endDate, {
              pattern: "dd MMM yyyy",
              fallback: "Select date",
            })}
          </span>

          <span className="rdsw_cdDateEdit">Change</span>
        </button>

        {fieldError("dates") && (
          <p className="rdsw_cdError">{fieldError("dates")}</p>
        )}
      </section>

      {/* ── Promoter requirement ────────────────────────────────────────── */}
      <section className="rdsw_cdSection">
        <div className="rdsw_cdToggleRow">
          <div className="rdsw_cdToggleCopy">
            <p className="rdsw_cdSectionTitle">
              <Users size={13} className="inline-block shrink-0" /> Promoter
              Requirement
            </p>

            <p className="rdsw_cdSectionNote">
              {details.needPromoter
                ? `${formatMoney(pricing.promoterChargePerDay)} per promoter / day`
                : "No promoter — no promoter charge is added"}
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={details.needPromoter}
            aria-label="Promoter needed"
            onClick={() => {
              const needPromoter = !details.needPromoter;

              /* Turning the toggle off clears the promoter fields so a stale
                 quantity can never leak back into pricing if it is re-enabled
                 — promoterCost is derived from these values alone. */
              onDetailsChange(
                needPromoter
                  ? { needPromoter: true, promoterQuantity: 1 }
                  : {
                      needPromoter: false,
                      promoterType: "",
                      otherPromoterType: "",
                      promoterGender: "",
                      promoterLanguage: [],
                      promoterQuantity: 0,
                      promoterFromDate: "",
                      promoterToDate: "",
                    }
              );
            }}
            className={[
              "rdsw_cdToggle",
              details.needPromoter ? "rdsw_cdToggleOn" : "",
            ].join(" ")}
          >
            <span className="rdsw_cdToggleKnob" />
          </button>
        </div>

        {details.needPromoter && (
          <div className="rdsw_cdGrid">
            <label className="rdsw_cdField">
              <span className="rdsw_cdFieldLabel">
                Promoter Type <i>*</i>
              </span>

              <select
                value={details.promoterType}
                onChange={(event) =>
                  onDetailsChange({ promoterType: event.target.value })
                }
                className="rdsw_cdInput"
              >
                <option value="">Select</option>

                {PROMOTER_TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              {fieldError("promoterType") && (
                <p className="rdsw_cdError">{fieldError("promoterType")}</p>
              )}
            </label>

            {details.promoterType === "Other" && (
              <label className="rdsw_cdField">
                <span className="rdsw_cdFieldLabel">
                  Specify Promoter Type <i>*</i>
                </span>

                <input
                  type="text"
                  value={details.otherPromoterType}
                  onChange={(event) =>
                    onDetailsChange({
                      otherPromoterType: event.target.value,
                    })
                  }
                  placeholder="Enter promoter type"
                  className="rdsw_cdInput"
                />

                {fieldError("otherPromoterType") && (
                  <p className="rdsw_cdError">
                    {fieldError("otherPromoterType")}
                  </p>
                )}
              </label>
            )}

            <label className="rdsw_cdField">
              <span className="rdsw_cdFieldLabel">
                Gender <i>*</i>
              </span>

              <select
                value={details.promoterGender}
                onChange={(event) =>
                  onDetailsChange({ promoterGender: event.target.value })
                }
                className="rdsw_cdInput"
              >
                <option value="">Select</option>

                {PROMOTER_GENDER_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              {fieldError("promoterGender") && (
                <p className="rdsw_cdError">
                  {fieldError("promoterGender")}
                </p>
              )}
            </label>

            <div className="rdsw_cdField" ref={languageRef}>
              <span className="rdsw_cdFieldLabel">
                Languages Known <i>*</i>
              </span>

              <button
                type="button"
                onClick={() => setLanguageOpen((open) => !open)}
                className="rdsw_cdInput rdsw_cdLanguageTrigger"
              >
                <span
                  className={
                    details.promoterLanguage.length
                      ? ""
                      : "rdsw_cdPlaceholder"
                  }
                >
                  {details.promoterLanguage.length
                    ? details.promoterLanguage.join(", ")
                    : "Select languages"}
                </span>

                <ChevronDown size={14} className="shrink-0" />
              </button>

              {languageOpen && (
                <div className="rdsw_cdLanguagePanel">
                  {languageOptions.map((language) => (
                    <label
                      key={language}
                      className="rdsw_cdLanguageOption"
                    >
                      <input
                        type="checkbox"
                        checked={details.promoterLanguage.includes(
                          language
                        )}
                        onChange={() => toggleLanguage(language)}
                      />

                      <span>{language}</span>
                    </label>
                  ))}
                </div>
              )}

              {fieldError("promoterLanguage") && (
                <p className="rdsw_cdError">
                  {fieldError("promoterLanguage")}
                </p>
              )}
            </div>

            <div className="rdsw_cdField">
              <span className="rdsw_cdFieldLabel">
                Promoter Quantity <i>*</i>
              </span>

              <div className="rdsw_cdStepper">
                <button
                  type="button"
                  onClick={() =>
                    onDetailsChange({
                      promoterQuantity: Math.max(
                        details.promoterQuantity - 1,
                        1
                      ),
                    })
                  }
                  disabled={details.promoterQuantity <= 1}
                  aria-label="Reduce promoter quantity"
                  className="rdsw_cdStepperBtn"
                >
                  <Minus size={12} />
                </button>

                <span className="rdsw_cdStepperValue">
                  {details.promoterQuantity}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    onDetailsChange({
                      promoterQuantity: details.promoterQuantity + 1,
                    })
                  }
                  aria-label="Increase promoter quantity"
                  className="rdsw_cdStepperBtn"
                >
                  <Plus size={12} />
                </button>
              </div>

              {fieldError("promoterQuantity") && (
                <p className="rdsw_cdError">
                  {fieldError("promoterQuantity")}
                </p>
              )}
            </div>

            <label
              className="rdsw_cdField"
              style={{ gridColumn: "1 / -1" }}
            >
              <span className="rdsw_cdFieldLabel">
                Promoter Dates <i>*</i>
              </span>

              <button
                type="button"
                onClick={onEditPromoterDates}
                disabled={!vehicle.startDate || !vehicle.endDate}
                className="rdsw_cdDateButton"
                title={
                  !vehicle.startDate || !vehicle.endDate
                    ? "Select campaign dates first"
                    : undefined
                }
              >
                <CalendarDays size={15} className="shrink-0" />

                <span className="rdsw_cdDateText">
                  {formatDate(details.promoterFromDate, {
                    pattern: "dd MMM yyyy",
                    fallback: "Select date",
                  })}
                  {"  →  "}
                  {formatDate(details.promoterToDate, {
                    pattern: "dd MMM yyyy",
                    fallback: "Select date",
                  })}
                </span>

                <span className="rdsw_cdDateEdit">Change</span>
              </button>

              {(fieldError("promoterFromDate") ||
                fieldError("promoterToDate")) && (
                <p className="rdsw_cdError">
                  {fieldError("promoterFromDate") ||
                    fieldError("promoterToDate")}
                </p>
              )}
            </label>

            {/* Selected Promoter Days — shown below all Promoter Requirement
                fields, driven by the same promoterDays the pricing uses, so
                this number and the promoter cost below can never disagree. */}
            <p className="rdsw_cdSectionNote" style={{ gridColumn: "1 / -1" }}>
              Selected Promoter Days: <strong>{pricing.promoterDays}</strong>
              {pricing.promoterCost > 0 && (
                <>
                  {" "}
                  · {pricing.promoterDays}D ×{" "}
                  {formatMoney(pricing.promoterChargePerDay)} ×{" "}
                  {pricing.promoterQuantity} ={" "}
                  <strong>{formatMoney(pricing.promoterCost)}</strong>
                </>
              )}
            </p>
          </div>
        )}
      </section>

      {/* ── Campaign details ────────────────────────────────────────────── */}
      <section className="rdsw_cdSection">
        <p className="rdsw_cdSectionTitle">Campaign Details</p>

        <div className="rdsw_cdGrid">
          <label className="rdsw_cdField">
            <span className="rdsw_cdFieldLabel">
              Campaign Type <i>*</i>
            </span>

            <select
              value={details.campaignType}
              onChange={(event) =>
                onDetailsChange({ campaignType: event.target.value })
              }
              className="rdsw_cdInput"
            >
              <option value="">Select</option>

              {campaignTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}

              <option value="Others">Others</option>
            </select>

            {fieldError("campaignType") && (
              <p className="rdsw_cdError">{fieldError("campaignType")}</p>
            )}
          </label>

          {details.campaignType === "Others" && (
            <label className="rdsw_cdField">
              <span className="rdsw_cdFieldLabel">
                Specify Campaign Type <i>*</i>
              </span>

              <input
                type="text"
                value={details.otherCampaignType}
                onChange={(event) =>
                  onDetailsChange({
                    otherCampaignType: event.target.value,
                  })
                }
                placeholder="Eg. KFC Campaign"
                className="rdsw_cdInput"
              />

              {fieldError("otherCampaignType") && (
                <p className="rdsw_cdError">
                  {fieldError("otherCampaignType")}
                </p>
              )}
            </label>
          )}

          <label className="rdsw_cdField">
            <span className="rdsw_cdFieldLabel">
              Campaign Name <i>*</i>
            </span>

            <input
              type="text"
              value={details.campaignName}
              onChange={(event) =>
                onDetailsChange({ campaignName: event.target.value })
              }
              placeholder="Enter campaign name"
              className="rdsw_cdInput"
            />

            {fieldError("campaignName") && (
              <p className="rdsw_cdError">{fieldError("campaignName")}</p>
            )}
          </label>

          <label className="rdsw_cdField">
            <span className="rdsw_cdFieldLabel">
              Campaign Location <i>*</i>
            </span>

            <input
              type="text"
              value={details.campaignLocation}
              onChange={(event) =>
                onDetailsChange({
                  campaignLocation: event.target.value,
                })
              }
              placeholder="Where should this campaign run?"
              className="rdsw_cdInput"
            />

            {fieldError("campaignLocation") && (
              <p className="rdsw_cdError">
                {fieldError("campaignLocation")}
              </p>
            )}
          </label>
        </div>
      </section>

      {/* ── Campaign media ──────────────────────────────────────────────── */}
      <section className="rdsw_cdSection">
        <p className="rdsw_cdSectionTitle">Campaign Media</p>

        <div className="rdsw_cdMediaGrid">
          <CampaignMediaUpload
            kind="image"
            label="Campaign Images"
            files={media.images}
            onChange={(images) => onMediaChange({ ...media, images })}
          />

          <CampaignMediaUpload
            kind="video"
            label="Campaign Videos (optional)"
            files={media.videos}
            onChange={(videos) => onMediaChange({ ...media, videos })}
          />
        </div>
      </section>

      {/* ── Apply to all ────────────────────────────────────────────────── */}
      {showApplyToAll && (
        <label className="rdsw_cdApplyAll">
          <input
            type="checkbox"
            checked={appliedToAll}
            onChange={(event) =>
              onApplyToAllChange(event.target.checked)
            }
          />

          <span>
            Apply these campaign details to all selected vehicles
            <em>
              {appliedToAll && !isApplySource
                ? "These values are shared with the other vehicles. Changing anything on this card unlinks it and leaves the rest as they are."
                : "Copies campaign type, name, dates, location, media and promoter details across. Each vehicle stays editable afterwards."}
            </em>
          </span>
        </label>
      )}
    </article>
  );
}
