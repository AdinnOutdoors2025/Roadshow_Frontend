"use client";

import React, { useEffect, useState, useCallback } from "react";
import { IoMdClose } from "react-icons/io";
import { VehicleConfig } from "./AdminOrderForm";
import { PackageItem, PricingPreview, getPackages, previewPricing } from "./../../../utils/Adminorderapi";
import FormField, { inputClass, selectClass } from "../../../components/reusableFormField";

// ── Static data ───────────────────────────────────────────────────

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand",
  "West Bengal","Delhi","Jammu & Kashmir","Ladakh","Puducherry","Chandigarh",
];

const CITIES_BY_STATE: Record<string, string[]> = {
  "Tamil Nadu":   ["Chennai","Coimbatore","Madurai","Salem","Tiruchirappalli","Tirunelveli","Erode","Vellore","Thanjavur"],
  "Maharashtra":  ["Mumbai","Pune","Nagpur","Nashik","Aurangabad","Thane","Solapur"],
  "Karnataka":    ["Bengaluru","Mysuru","Hubli","Mangaluru","Belagavi","Kalaburagi"],
  "Telangana":    ["Hyderabad","Warangal","Nizamabad","Karimnagar","Khammam"],
  "Gujarat":      ["Ahmedabad","Surat","Vadodara","Rajkot","Bhavnagar","Jamnagar"],
  "Delhi":        ["New Delhi","Dwarka","Rohini","Shahdara","Janakpuri"],
};

const CAMPAIGN_TYPES  = ["Brand Promotion", "Election Campaign", "Other"];
const PROMOTER_TYPES  = ["Brand Promotion", "Election Campaign", "Other"];
const BOOKING_FOR     = ["Individual Customer", "Agency"];
const VEHICLE_TYPES   = ["Customizable Vehicle", "Non-Customizable Vehicle"];

const LED_SIZES: Record<string, string> = {
  "LED Van":                "10x6 ft",
  "LED Truck":              "14x8 ft",
  "Mini Promotion Vehicle": "6x4 ft",
  "Campaign Bus":           "20x10 ft",
};

function uid() { return Math.random().toString(36).substr(2, 9); }

const defaultForm: VehicleConfig = {
  id: "", packageId: "", vehicleType: "", vehicleModel: "",
  bookingFor: "", campaignType: "", otherCampaignType: "",
  fromDate: "", toDate: "", state: "", city: "",
  fromLocation: "", toLocation: "",
  quantity: 1, needPromoter: false,
  promoterType: "", otherPromoterType: "",
  campaignImages: [], campaignVideos: [],
  pricing: null,
};

// ── Props ──────────────────────────────────────────────────────────

interface Props {
  editing: VehicleConfig | null;
  onSave: (v: VehicleConfig) => void;
  onClose: () => void;
}

// ── Component ──────────────────────────────────────────────────────

export default function VehicleFormModal({ editing, onSave, onClose }: Props) {
  const [form, setForm]       = useState<VehicleConfig>(defaultForm);
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [imgNames, setImgNames] = useState<string[]>([]);
  const [vidNames, setVidNames] = useState<string[]>([]);

  // Package API
  const [packages, setPackages]     = useState<PackageItem[]>([]);
  const [pkgLoading, setPkgLoading] = useState(false);
  const [pkgError, setPkgError]     = useState("");

  // Pricing API
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingError, setPricingError]     = useState("");

  // ── Init ──
  useEffect(() => {
    if (editing) { setForm(editing); setImgNames(editing.campaignImages.map((f) => f.name)); setVidNames(editing.campaignVideos.map((f) => f.name)); }
    else { setForm({ ...defaultForm, id: uid() }); setImgNames([]); setVidNames([]); }
    setErrors({});
    setPricingError("");
  }, [editing]);

  // ── Fetch packages when vehicleType changes ──
  useEffect(() => {
    if (!form.vehicleType) { setPackages([]); return; }
    (async () => {
      try {
        setPkgLoading(true);
        setPkgError("");
        const { packages } = await getPackages({ vehicleType: form.vehicleType });
        setPackages(packages);
      } catch (e: any) {
        setPkgError(e.message);
      } finally {
        setPkgLoading(false);
      }
    })();
  }, [form.vehicleType]);

  // ── Auto-fetch pricing whenever key fields change ──
  const fetchPricing = useCallback(async (current: VehicleConfig) => {
    const { packageId, fromDate, toDate, quantity, needPromoter } = current;
    if (!packageId || !fromDate || !toDate || !quantity || quantity < 1) return;
    if (new Date(fromDate) >= new Date(toDate)) return;
    try {
      setPricingLoading(true);
      setPricingError("");
      const { pricing } = await previewPricing({ packageId, fromDate, toDate, quantity, needPromoter });
      setForm((p) => ({ ...p, pricing }));
    } catch (e: any) {
      setPricingError(e.message);
    } finally {
      setPricingLoading(false);
    }
  }, []);

  // ── Set field helper ──
  const set = (field: keyof VehicleConfig, value: any) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };

      // When vehicleModel changes, find package and auto-set packageId
      if (field === "vehicleModel") {
        const matched = packages.find((p) => p.vehicleModel === value);
        if (matched) updated.packageId = matched._id;
        else updated.packageId = "";
        updated.pricing = null;
      }

      // When vehicleType changes, reset model & package
      if (field === "vehicleType") {
        updated.vehicleModel = "";
        updated.packageId = "";
        updated.pricing = null;
      }

      // When state changes, reset city
      if (field === "state") updated.city = "";

      // Trigger pricing fetch for pricing-affecting fields
      if (["packageId", "fromDate", "toDate", "quantity", "needPromoter"].includes(field as string)) {
        setTimeout(() => fetchPricing(updated), 0);
      }

      return updated;
    });
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  // ── Validate ──
  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.bookingFor)   e.bookingFor   = "Required";
    if (!form.campaignType) e.campaignType = "Required";
    if (form.campaignType === "Other" && !form.otherCampaignType) e.otherCampaignType = "Required";
    if (!form.fromDate)     e.fromDate     = "Required";
    if (!form.toDate)       e.toDate       = "Required";
    if (form.fromDate && form.toDate && form.fromDate >= form.toDate) e.toDate = "To date must be after from date";
    if (!form.state)        e.state        = "Required";
    if (!form.city)         e.city         = "Required";
    if (!form.fromLocation) e.fromLocation = "Required";
    if (!form.toLocation)   e.toLocation   = "Required";
    if (!form.vehicleType)  e.vehicleType  = "Required";
    if (!form.vehicleModel) e.vehicleModel = "Required";
    if (!form.quantity || form.quantity < 1) e.quantity = "Min 1";
    if (form.needPromoter && !form.promoterType) e.promoterType = "Required";
    if (form.needPromoter && form.promoterType === "Other" && !form.otherPromoterType) e.otherPromoterType = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (!form.pricing) { setPricingError("Pricing-ஐ calculate பண்ண dates, vehicle, quantity check பண்ணுங்க"); return; }
    onSave(form);
  };

  const cities = CITIES_BY_STATE[form.state] || [];
  const selectedPackage = packages.find((p) => p._id === form.packageId);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">{editing ? "Edit Vehicle" : "Add Vehicle"}</h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
            <IoMdClose />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">

          {/* Basic Info */}
          <section>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Basic Info</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Booking For" error={errors.bookingFor} required>
                <select value={form.bookingFor} onChange={(e) => set("bookingFor", e.target.value)} className={selectClass(!!errors.bookingFor)}>
                  <option value="">Select</option>
                  {BOOKING_FOR.map((b) => <option key={b}>{b}</option>)}
                </select>
              </FormField>
              <FormField label="Campaign Type" error={errors.campaignType} required>
                <select value={form.campaignType} onChange={(e) => set("campaignType", e.target.value)} className={selectClass(!!errors.campaignType)}>
                  <option value="">Select</option>
                  {CAMPAIGN_TYPES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </FormField>
              {form.campaignType === "Other" && (
                <FormField label="Specify Campaign Type" error={errors.otherCampaignType} required>
                  <input type="text" value={form.otherCampaignType} onChange={(e) => set("otherCampaignType", e.target.value)} placeholder="Enter campaign type" className={inputClass(!!errors.otherCampaignType)} />
                </FormField>
              )}
            </div>
          </section>

          {/* Campaign Duration */}
          <section>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Campaign Duration</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="From Date" error={errors.fromDate} required>
                <input type="date" value={form.fromDate} onChange={(e) => set("fromDate", e.target.value)} className={inputClass(!!errors.fromDate)} />
              </FormField>
              <FormField label="To Date" error={errors.toDate} required>
                <input type="date" value={form.toDate} min={form.fromDate} onChange={(e) => set("toDate", e.target.value)} className={inputClass(!!errors.toDate)} />
              </FormField>
            </div>
            {form.fromDate && form.toDate && form.fromDate < form.toDate && (
              <p className="mt-1 text-xs text-blue-600 font-medium">
                {Math.ceil((new Date(form.toDate).getTime() - new Date(form.fromDate).getTime()) / 86400000)} day(s) campaign
              </p>
            )}
          </section>

          {/* Location — State/City first, then from/to */}
          <section>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Location Details</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="State" error={errors.state} required>
                <select value={form.state} onChange={(e) => set("state", e.target.value)} className={selectClass(!!errors.state)}>
                  <option value="">Select State</option>
                  {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </FormField>
              <FormField label="City" error={errors.city} required>
                <select value={form.city} onChange={(e) => set("city", e.target.value)} disabled={!form.state} className={selectClass(!!errors.city)}>
                  <option value="">Select City</option>
                  {cities.map((c) => <option key={c}>{c}</option>)}
                </select>
              </FormField>
              <FormField label="From Location" error={errors.fromLocation} required>
                <input type="text" value={form.fromLocation} onChange={(e) => set("fromLocation", e.target.value)} placeholder="Campaign start location" disabled={!form.city} className={inputClass(!!errors.fromLocation)} />
              </FormField>
              <FormField label="To Location" error={errors.toLocation} required>
                <input type="text" value={form.toLocation} onChange={(e) => set("toLocation", e.target.value)} placeholder="Campaign destination" disabled={!form.city} className={inputClass(!!errors.toLocation)} />
              </FormField>
            </div>
          </section>

          {/* Vehicle Selection — fetches packages from API */}
          <section>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Vehicle Selection</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Vehicle Type" error={errors.vehicleType} required>
                <select value={form.vehicleType} onChange={(e) => set("vehicleType", e.target.value)} className={selectClass(!!errors.vehicleType)}>
                  <option value="">Select</option>
                  {VEHICLE_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </FormField>
              <FormField label="Vehicle Model" error={errors.vehicleModel} required>
                <select value={form.vehicleModel} onChange={(e) => set("vehicleModel", e.target.value)} disabled={!form.vehicleType || pkgLoading} className={selectClass(!!errors.vehicleModel)}>
                  <option value="">
                    {pkgLoading ? "Loading..." : !form.vehicleType ? "Select vehicle type first" : "Select model"}
                  </option>
                  {packages.map((p) => <option key={p._id} value={p.vehicleModel}>{p.vehicleModel}</option>)}
                </select>
              </FormField>
              {pkgError && <p className="col-span-2 text-xs text-red-500">{pkgError}</p>}

              {/* LED Screen Size — auto from model */}
              {form.vehicleModel && LED_SIZES[form.vehicleModel] && (
                <FormField label="LED Screen Size">
                  <input type="text" value={LED_SIZES[form.vehicleModel]} readOnly className={inputClass(false) + " bg-gray-50 cursor-not-allowed dark:bg-gray-800"} />
                </FormField>
              )}

              <FormField label="Quantity" error={errors.quantity} required>
                <input type="number" min={1} value={form.quantity} onChange={(e) => set("quantity", parseInt(e.target.value) || 1)} className={inputClass(!!errors.quantity)} />
              </FormField>
            </div>

            {/* Package pricing info (read-only display) */}
            {selectedPackage && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: "Rental/day", val: `₹${selectedPackage.perDayRentalCost}` },
                  { label: "Driver/day",  val: `₹${selectedPackage.driverCharges}` },
                  { label: "RTO",         val: `₹${selectedPackage.rtoCharges}` },
                  { label: "KM Limit",   val: `${selectedPackage.dailyKmLimit} km` },
                ].map(({ label, val }) => (
                  <div key={label} className="rounded-lg bg-blue-50 dark:bg-blue-900/20 px-3 py-2 text-center">
                    <p className="text-[10px] text-gray-400 uppercase">{label}</p>
                    <p className="text-sm font-bold text-blue-700 dark:text-blue-300">{val}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Promoter */}
          <section>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Promoter Requirement</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Need Promoter">
                <select
                  value={form.needPromoter ? "yes" : "no"}
                  onChange={(e) => set("needPromoter", e.target.value === "yes")}
                  disabled={selectedPackage && !selectedPackage.promoterAvailable}
                  className={selectClass(false)}
                >
                  <option value="no">No</option>
                  {(!selectedPackage || selectedPackage.promoterAvailable) && <option value="yes">Yes</option>}
                </select>
                {selectedPackage && !selectedPackage.promoterAvailable && (
                  <p className="text-xs text-amber-500 mt-1">இந்த package-ல் promoter available இல்ல</p>
                )}
              </FormField>
              {form.needPromoter && (
                <FormField label="Promoter Type" error={errors.promoterType} required>
                  <select value={form.promoterType} onChange={(e) => set("promoterType", e.target.value)} className={selectClass(!!errors.promoterType)}>
                    <option value="">Select</option>
                    {PROMOTER_TYPES.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </FormField>
              )}
              {form.needPromoter && form.promoterType === "Other" && (
                <FormField label="Specify Promoter Type" error={errors.otherPromoterType} required>
                  <input type="text" value={form.otherPromoterType} onChange={(e) => set("otherPromoterType", e.target.value)} placeholder="Describe promoter type" className={inputClass(!!errors.otherPromoterType)} />
                </FormField>
              )}
            </div>
          </section>

          {/* Media Upload */}
          <section>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Media Upload (Optional)</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Campaign Images (JPG/PNG)">
                <label className={inputClass(false) + " cursor-pointer flex items-center gap-2 text-gray-400 hover:text-blue-500 transition-colors"}>
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span className="text-xs truncate">{imgNames.length > 0 ? `${imgNames.length} file(s) selected` : "Upload images"}</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { const f = Array.from(e.target.files || []); set("campaignImages", f); setImgNames(f.map((x) => x.name)); }} />
                </label>
              </FormField>
              <FormField label="Campaign Videos (MP4)">
                <label className={inputClass(false) + " cursor-pointer flex items-center gap-2 text-gray-400 hover:text-blue-500 transition-colors"}>
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.893L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  <span className="text-xs truncate">{vidNames.length > 0 ? `${vidNames.length} file(s) selected` : "Upload videos"}</span>
                  <input type="file" accept="video/*" multiple className="hidden" onChange={(e) => { const f = Array.from(e.target.files || []); set("campaignVideos", f); setVidNames(f.map((x) => x.name)); }} />
                </label>
              </FormField>
            </div>
          </section>

          {/* Pricing Preview — backend calculated */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Pricing Summary (Backend Calculated)</p>
              {pricingLoading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />}
            </div>

            {pricingError && <p className="text-xs text-red-500 mb-2">{pricingError}</p>}

            {form.pricing ? (
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-900/10 p-4 space-y-1.5">
                {[
                  { label: `Rental (${form.pricing.totalDays}d × ₹${form.pricing.perDayRentalCost} × qty ${form.quantity})`, val: form.pricing.rentalCost },
                  { label: `Driver (${form.pricing.totalDays}d × ₹${form.pricing.driverCharges})`, val: form.pricing.driverCost },
                  ...(form.needPromoter ? [{ label: `Promoter (${form.pricing.totalDays}d × ₹${form.pricing.promoterChargePerDay})`, val: form.pricing.promoterCost }] : []),
                  { label: "RTO Charges", val: form.pricing.rtoCost },
                ].map(({ label, val }) => (
                  <div key={label} className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                    <span>{label}</span><span>₹{val.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 border-t border-blue-100 dark:border-blue-900/30 pt-1.5">
                  <span>Subtotal</span><span>₹{form.pricing.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                  <span>GST (18%)</span><span>₹{form.pricing.gstAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 dark:text-white border-t border-blue-100 dark:border-blue-900/30 pt-1.5">
                  <span>Vehicle Total</span><span>₹{form.pricing.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-4 text-center text-xs text-gray-400">
                Vehicle type, model, dates, quantity select  pricing auto-calculate 
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-gray-100 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
          <button onClick={onClose} className="rounded-lg border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            Cancel
          </button>
          <button onClick={handleSave} disabled={pricingLoading} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition-colors">
            {editing ? "Update Vehicle" : "Add Vehicle"}
          </button>
        </div>
      </div>
    </div>
  );
}
