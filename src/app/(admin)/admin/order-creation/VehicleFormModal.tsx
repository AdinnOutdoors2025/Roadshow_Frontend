
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { VehicleConfig, AdditionalCharge } from "./AdminOrderForm";
import { PricingPreview, getPackagesForOrder } from "../../../../utils/Adminorderapi";
import FormField, { inputClass } from "../../../../components/reusableFormField";
import { HiOutlinePlus, HiOutlineTrash } from "react-icons/hi2";
import { IoMdClose } from "react-icons/io";
import API_BASE from "../../../../../baseurl";
import DatePicker from "@/components/form/date-picker";

interface PackageOption {
  _id: string;
  vehicleType: string | { _id: string; typeName: string }; 
  vehicleModel: string;
  perDayRentalCost: number;
  driverCharges: number;
  rtoCharges: number;
  dailyKmLimit: number;
  additionalHourCharges: number;
  promoterAvailable: boolean;
  promoterChargePerDay: number;
  isActive: boolean;
  perKmCharge: number
}

interface Props {
  editing: VehicleConfig | null;
  onSave: (v: VehicleConfig) => void;
  onClose: () => void;
}


const uid = () => Math.random().toString(36).slice(2, 9);

const BOOKING_FOR_OPTIONS = ["Individual Customer", "Agency"];
const PROMOTER_TYPE_OPTIONS = ["Brand Promotion", "Election Campaign", "Other"];


function defaultForm(): Omit<VehicleConfig, "id"> {
  return {
    packageId: "",
    vehicleType: "",
    vehicleModel: "",
    bookingFor: "",
    campaignType: "",
    otherCampaignType: "",
    fromDate: "",
    toDate: "",
    state: "",
    city: "",
    fromLocation: "",
    toLocation: "",
    quantity: 1,
    extraKm: 0,
    extraDays: 0,
    needPromoter: false,
    promoterType: "",
    otherPromoterType: "",
    campaignImages: [],
    campaignVideos: [],
    additionalCharges: [],
    pricing: null,
    gstNumber: "",
    extraHours: 0,
    promoterGender: "",
    promoterLanguage: "",
    promoterQuantity: 0,
  };
}


function calcPricing(
  pkg: PackageOption,
  fromDate: string,
  toDate: string,
  quantity: number,
  needPromoter: boolean,
  extraKm: number,
  extraDays: number,
  extraHours: number,

  additionalCharges: AdditionalCharge[],
  promoterQuantity: number,
): PricingPreview | null {
  if (!fromDate || !toDate || quantity < 1) return null;
  const from = new Date(fromDate);
  const to = new Date(toDate);
  if (from >= to) return null;

  const baseDays = Math.ceil((to.getTime() - from.getTime()) / 86400000);
  const totalDays = baseDays + (extraDays || 0);

  const rentalCost = pkg.perDayRentalCost * totalDays * quantity;
  const driverCost = pkg.driverCharges * totalDays * quantity;

  const promoterCost = needPromoter
    ? (pkg.promoterChargePerDay || 0) * totalDays * promoterQuantity
    : 0;
  const rtoCost = pkg.rtoCharges * quantity;

  const extraKmCost = extraKm > 0 ? pkg.perKmCharge * extraKm : 0;
  const extraHourCost = extraHours > 0 ? pkg.additionalHourCharges * extraHours : 0;


  const additionalAdds = additionalCharges.reduce((acc, c) => {
    const amt = Number(c.amount) || 0;
    return c.mode === "+" ? acc + amt : acc;
  }, 0);

  const subtotal = rentalCost + driverCost + promoterCost + rtoCost + extraKmCost + extraHourCost + additionalAdds;


  const MAX_DISCOUNT_PCT = parseFloat(process.env.NEXT_PUBLIC_MAX_DISCOUNT_PERCENT || "15");

  const maxDiscountAmount = Math.floor(subtotal * (MAX_DISCOUNT_PCT / 100));


  const additionalCuts = additionalCharges.reduce((acc, c) => {
    if (c.mode !== "-") return acc;
    const remaining = Math.max(maxDiscountAmount - acc, 0);
    if (remaining === 0) return acc;

    if (c.reduceType === "percent" && (c.discountPercent || 0) > 0) {
      const requestedAmt = Math.round(subtotal * ((c.discountPercent ?? 0) / 100));
      return acc + Math.min(requestedAmt, remaining);
    }

    const requestedAmt = Number(c.amount) || 0;
    return acc + Math.min(requestedAmt, remaining);
  }, 0);


  const additionalNet = additionalAdds - additionalCuts;
  const totalAmount = Math.max(subtotal - additionalCuts, 0);
  const gstAmount = 0
  const taxableAmount = totalAmount;

  return {
    totalDays,
    perDayRentalCost: pkg.perDayRentalCost,
    driverCharges: pkg.driverCharges,
    promoterChargePerDay: needPromoter ? pkg.promoterChargePerDay : 0,
    rtoCharges: pkg.rtoCharges,
    additionalHourCharges: pkg.additionalHourCharges,
    dailyKmLimit: pkg.dailyKmLimit,
    rentalCost,
    driverCost,
    promoterCost,
    rtoCost,
    extraKmCost,
    extraHourCost,
    subtotal,
    taxableAmount,
    additionalCuts,
    gstAmount,
    totalAmount,
    additionalNet,
  } as any;
}

function VehicleTypeSelect({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (val: string) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const VEHICLE_TYPES_LOCAL = ["Non-Customizable Vehicle", "Customizable Vehicle"];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={inputClass(!!error) + " flex items-center justify-between w-full text-left"}
      >
        <span className={value ? "text-gray-900 dark:text-white" : "text-gray-400"}>
          {value || "Select type"}
        </span>
        <svg className="w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
          {VEHICLE_TYPES_LOCAL.map((t) => {
            const isDisabled = t === "Customizable Vehicle";
            return (
              <div
                key={t}
                onClick={() => {
                  if (!isDisabled) { onChange(t); setOpen(false); }
                }}
                className={`flex items-center justify-between px-3 py-2.5 text-sm transition-colors
                  ${isDisabled
                    ? "cursor-not-allowed text-gray-400 bg-gray-50 dark:bg-gray-700/50"
                    : "cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-900 dark:text-white"
                  }`}
              >
                <span>{t}</span>
                {isDisabled && (
                  <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}



export default function VehicleFormModal({ editing, onSave, onClose }: Props) {
  const [form, setForm] = useState<VehicleConfig>(editing ?? { id: uid(), ...defaultForm() });
  const [packages, setPackages] = useState<any[]>([]);
  const [loadingPkg, setLoadingPkg] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageOption | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [packageslist, setPackageslist] = useState<PackageOption[]>([]);
  const [campaignTypes, setCampaignTypes] = useState<{ _id: string, name: string }[]>([]);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  console.log("packageslist", packageslist)

  console.log("form", form)

  const [editablePackage, setEditablePackage] = useState<Record<string, string>>({});
  const [savingPkg, setSavingPkg] = useState(false);
  const [pkgSaved, setPkgSaved] = useState(false);
  const [changedKeys, setChangedKeys] = useState<string[]>([]);
  const [locationData, setLocationData] = useState<Record<string, string[]>>({});
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<any>([]);
  console.log("vehicleTypes", vehicleTypes)
  console.log("locationData", locationData)

  const PROMOTER_GENDER_OPTIONS = ["Male", "Female", "Other"];
  const PROMOTER_LANGUAGE_OPTIONS = ["Tamil", "English", "Telugu", "Hindi", "Kannada", "Malayalam"];

  useEffect(() => {
    fetch(`${API_BASE}locations`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data?.locations?.length > 0) {
          const raw = d.data.locations[0];
          const map: Record<string, string[]> = {};

          Object.entries(raw).forEach(([key, value]) => {
            if (key === "_id" || key === "cities" || key === "__v") return;
            if (Array.isArray(value)) {
              map[key] = value as string[];
            }
          });

          setLocationData(map);
        }
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (editing?.state && locationData[editing.state]) {
      setCityOptions(locationData[editing.state]);
    }
  }, [locationData, editing]);

  const handleStateChange = (selectedState: string) => {
    set("state", selectedState);
    set("city", ""); // reset city
    setCityOptions(locationData[selectedState] || []);
  };


  useEffect(() => {
    if (selectedPackage) {
      setEditablePackage({
        perDayRentalCost: String(selectedPackage.perDayRentalCost),
        driverCharges: String(selectedPackage.driverCharges),
        rtoCharges: String(selectedPackage.rtoCharges),
        dailyKmLimit: String(selectedPackage.dailyKmLimit),
        additionalHourCharges: String(selectedPackage.additionalHourCharges),
        promoterChargePerDay: String(selectedPackage.promoterChargePerDay),
      });
      setPkgSaved(false);
      setChangedKeys([]);
    }
  }, [selectedPackage?._id]);


  useEffect(() => {
    if (!selectedPackage) { setForm(f => ({ ...f, pricing: null })); return; }

    const mergedPkg = {
      ...selectedPackage,
      ...Object.fromEntries(
        Object.entries(editablePackage)
          .map(([k, v]) => [k, parseFloat(v) || 0])
      ),
    };

    const p = calcPricing(
      mergedPkg,
      form.fromDate, form.toDate,
      form.quantity, form.needPromoter,
      form.extraKm, form.extraDays,
      form.extraHours,
      form.additionalCharges,
      form.promoterQuantity

    );
    setForm(f => ({ ...f, pricing: p }));
  }, [selectedPackage, editablePackage, form.fromDate, form.toDate,
    form.quantity, form.needPromoter, form.extraKm, form.extraDays, form.additionalCharges, form.promoterQuantity]);


  const VEHICLE_TYPES = ["Non-Customizable Vehicle", "Customizable Vehicle"];
  const filteredModels = packageslist.filter((p) => p.vehicleType);


  console.log("filteredModels", filteredModels)

  const fetchVehicleTypes = async () => {
    try {

      const res = await fetch(`${API_BASE}api/vehicle-types`);
      if (!res.ok) throw new Error("Failed to fetch packages");
      const data = await res.json();
      setVehicleTypes(data.data);

    } catch (err: any) {
      console.log(err)
    }
  };

  useEffect(() => { fetchVehicleTypes(); }, []);


  const fetchPackages = async () => {
    try {

      const res = await fetch(`${API_BASE}packages/`);
      if (!res.ok) throw new Error("Failed to fetch packages");
      const data = await res.json();
      setPackageslist(data.data);

    } catch (err: any) {
      console.log(err)
    }
  };

  useEffect(() => { fetchPackages(); }, []);

  useEffect(() => {
    fetch(`${API_BASE}admin/campaign-types`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setCampaignTypes(d.data.types || []);
        }
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (editing?.packageId && packageslist.length > 0) {
      const match = packageslist.find((p) => p._id === editing.packageId);
      if (match) setSelectedPackage(match);
    }
  }, [packageslist, editing]);


  useEffect(() => {
    if (!selectedPackage) { setForm((f) => ({ ...f, pricing: null })); return; }
    const p = calcPricing(
      selectedPackage,
      form.fromDate,
      form.toDate,
      form.quantity,
      form.needPromoter,
      form.extraKm,
      form.extraDays,
      form.extraHours,
      form.additionalCharges,
      form.promoterQuantity

    );
    setForm((f) => ({ ...f, pricing: p }));
  }, [selectedPackage, form.fromDate, form.toDate, form.quantity, form.needPromoter, form.extraKm, form.extraDays, form.extraHours, form.additionalCharges, form.promoterQuantity]);

  const set = useCallback(<K extends keyof VehicleConfig>(key: K, val: VehicleConfig[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => { const n = { ...e }; delete n[key as string]; return n; });
  }, []);


  const handleVehicleTypeChange = async (type: string) => {
    setForm((f) => ({ ...f, vehicleType: type, vehicleModel: "", packageId: "" }));
    setSelectedPackage(null);

    // if (type) {
    //   setLoadingPkg(true);
    //   try {
    //     const { packages: pkgs } = await getPackagesForOrder({ vehicleType: type });
    //     setPackages(pkgs);
    //   } catch (error) {
    //     console.error("Error while fetching packages:", error);
    //   } finally {
    //     setLoadingPkg(false);
    //   }
    // } else {
    //   setPackages([]);
    // }
  };


  const handleVehicleModelChange = (modelId: string) => {
  const pkg = packageslist.find((p) => p._id === modelId) || null;
  setSelectedPackage(pkg);

 
  const vehicleModelName =
    typeof pkg?.vehicleType === "object" && pkg?.vehicleType !== null
      ? (pkg.vehicleType as any).typeName ?? ""
      : pkg?.vehicleType ?? "";

  setForm((f) => ({
    ...f,
    packageId: modelId,
    vehicleModel: vehicleModelName,  
  }));
};




  const updateCharge = (id: string, updates: Partial<AdditionalCharge>) => {
    set(
      "additionalCharges",
      form.additionalCharges.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const removeCharge = (id: string) => {
    set("additionalCharges", form.additionalCharges.filter((c) => c.id !== id));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (changedKeys.length > 0) {
      e.packageUnsaved = `Package charges updated but not saved. Please click "Update Package" before proceeding.`;
    }
    if (!form.vehicleType) e.vehicleType = "Select vehicle type";
    if (!form.packageId) e.vehicleModel = "Select vehicle model";
    if (!form.bookingFor) e.bookingFor = "Select booking for";

    if (!form.campaignType) e.campaignType = "Select campaign type";

    if (form.campaignType === "Other" && !form.otherCampaignType) e.otherCampaignType = "Required";
    if (form.bookingFor === "Agency") {
      if (!form.gstNumber.trim()) e.gstNumber = "GST number required for Agency";
      else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstNumber))
        e.gstNumber = "Enter valid GST number";
    }

    if (!form.fromDate) e.fromDate = "Select start date";
    if (!form.toDate) e.toDate = "Select end date";
    if (form.fromDate && form.toDate && new Date(form.fromDate) >= new Date(form.toDate))
      e.toDate = "End date must be after start date";
    if (!form.state) e.state = "Select state";
    if (!form.city.trim()) e.city = "Enter city";
    if (!form.fromLocation.trim()) e.fromLocation = "Enter from location";
    if (!form.toLocation.trim()) e.toLocation = "Enter to location";

    if (!form.quantity || form.quantity < 1) {
      e.quantity = "Please add valid quantity (minimum 1)";
    }
    if (form.needPromoter && !form.promoterType) e.promoterType = "Select promoter type";
    if (form.needPromoter && form.promoterType === "Other" && !form.otherPromoterType) e.otherPromoterType = "Required";
    if (form.needPromoter && !form.promoterGender) e.promoterGender = "Select gender";
    if (form.needPromoter && !form.promoterLanguage) e.promoterLanguage = "Select language";
    if (form.needPromoter && (!form.promoterQuantity || form.promoterQuantity < 1))
      e.promoterQuantity = "Enter valid quantity";
    setErrors(e);
    return Object.keys(e).length === 0;
  };


  const FIELD_LABELS: Record<string, string> = {
    perDayRentalCost: "Rental/day",
    driverCharges: "Driver/day",
    rtoCharges: "RTO",
    dailyKmLimit: "KM Limit",
    additionalHourCharges: "Extra hr charge",
    promoterChargePerDay: "Promoter/day",
  };

  const handleSavePackageChanges = async () => {
    if (!selectedPackage) return;


    const emptyFields = Object.entries(editablePackage)
      .filter(([_, v]) => v === "" || v === ".")
      .map(([k]) => FIELD_LABELS[k] || k);

    if (emptyFields.length > 0) {
      alert(`Please fill: ${emptyFields.join(", ")}`);
      return;
    }

    setSavingPkg(true);
    try {
      const numericPayload = Object.fromEntries(
        Object.entries(editablePackage).map(([k, v]) => [k, parseFloat(v)])
      );

      const res = await fetch(`${API_BASE}packages/${selectedPackage._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(numericPayload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");


      const summary = changedKeys
        .map(k => `${FIELD_LABELS[k]}: ₹${selectedPackage[k as keyof PackageOption]} → ₹${editablePackage[k]}`)
        .join("\n");

      setSelectedPackage(prev => prev ? { ...prev, ...numericPayload } : prev);
      setPkgSaved(true);
      setChangedKeys([]);

      if (summary) alert(`✅ Package updated!\n\n${summary}`);

    } catch (err: any) {
      alert(err.message || "Failed to update package");
    } finally {
      setSavingPkg(false);
    }
  };


  const handleSave = async () => {
    if (!validate()) {
      setTimeout(() => {
        const fieldOrder = [
          "vehicleType", "vehicleModel", "bookingFor", "gstNumber",
          "campaignType", "otherCampaignType", "fromDate", "toDate",
          "state", "city", "fromLocation", "toLocation", "quantity",
          "promoterType", "otherPromoterType", "promoterGender",
          "promoterLanguage", "promoterQuantity", "packageUnsaved",
        ];

        const firstErrorKey = fieldOrder.find((key) =>
          document.getElementById(`field-${key}`)
        );

        if (firstErrorKey && scrollContainerRef.current) {
          const el = document.getElementById(`field-${firstErrorKey}`);
          if (el) {
            const container = scrollContainerRef.current;
            const containerTop = container.getBoundingClientRect().top;
            const elTop = el.getBoundingClientRect().top;
            const offset = elTop - containerTop + container.scrollTop - 20;
            container.scrollTo({ top: offset, behavior: "smooth" });
          }
        }
      }, 50);
      return;
    }

    let finalCampaignType = form.campaignType;
    if (form.campaignType === "Other" && form.otherCampaignType.trim()) {
      try {
        const res = await fetch(`${API_BASE}admin/campaign-types`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.otherCampaignType.trim() }),
        });
        const data = await res.json();
        if (data.success) {
          finalCampaignType = data.type.name;
          setCampaignTypes(prev =>
            prev.find(c => c._id === data.type._id)
              ? prev
              : [...prev, data.type]
          );
        }
      } catch (err: any) {
        console.log(err)
      }
    }

    onSave({ ...form, campaignType: finalCampaignType });
  };
  const p = form.pricing;



  const formatINR = (value: string | number) => {
    const num = parseFloat(String(value).replace(/[^0-9.]/g, ""));
    if (isNaN(num) || value === "" || value === undefined) return "";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };


  const formatWithCommas = (value: string | number) => {
    const raw = String(value).replace(/[^0-9]/g, "");
    if (!raw) return "";
    return new Intl.NumberFormat("en-IN").format(Number(raw));
  };
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-2">
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900 overflow-hidden">


        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white">
            {editing ? "Edit Vehicle" : "Add Vehicle"}
          </h3>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
            <IoMdClose />
          </button>
        </div>



        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <section className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Vehicle Selection</p>

            <>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Vehicle Type" error={errors.vehicleType} required>
                  <VehicleTypeSelect
                    value={form.vehicleType}
                    onChange={handleVehicleTypeChange}
                    error={errors.vehicleType}
                  />
                </FormField>

                <FormField label="Vehicle Model" error={errors.vehicleModel} required>
                  <select
                    value={form.packageId}
                    onChange={(e) => handleVehicleModelChange(e.target.value)}
                    disabled={!form.vehicleType}
                    className={inputClass(!!errors.vehicleModel)}
                  >
                    <option value="">Select model</option>

                    {filteredModels.map((pkg) => {
                      const label =
                        typeof pkg.vehicleType === "object" && pkg.vehicleType !== null
                          ? pkg.vehicleType.typeName         
                          : vehicleTypes.find((t) => t._id === pkg.vehicleType)?.typeName ?? pkg.vehicleType;

                      return (
                        <option key={pkg._id} value={pkg._id}>
                          {label || "Unknown"}
                        </option>
                      );
                    })}
                  </select>
                </FormField>
              </div>



              {selectedPackage && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[
                      { label: "Rental/day", key: "perDayRentalCost" },
                      { label: "Driver/day", key: "driverCharges" },
                      { label: "RTO", key: "rtoCharges" },
                      { label: "KM Limit", key: "dailyKmLimit", disabled: false },
                      { label: "Extra hours", key: "additionalHourCharges" },
                      { label: "Promoter/day", key: "promoterChargePerDay", disabled: !selectedPackage.promoterAvailable },
                    ].map(({ label, key, disabled }) => (
                      <div
                        key={key}
                        className={`relative group rounded-lg bg-blue-50 dark:bg-blue-900/20 px-2 py-2 text-center
      ${key === "dailyKmLimit" ? "cursor-not-allowed" : ""}`} >

                        {key === "dailyKmLimit" && (
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-10
        hidden group-hover:flex
        items-center gap-1
        bg-gray-800 text-white text-[10px] rounded-md px-2 py-1 whitespace-nowrap shadow-lg">
                            <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                              <circle cx="12" cy="12" r="10" />
                              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                            </svg>
                            Read only — cannot be edited

                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45" />
                          </div>
                        )}
                        <p className="text-[9px] text-gray-400 uppercase leading-tight mb-1">{label}</p>

                        {disabled ? (
                          <p className="text-xs font-bold text-gray-400">N/A</p>
                        ) : (
                          <>
                            <input
                              type="text"
                              inputMode="numeric"
                              disabled={key === "dailyKmLimit"}
                              value={
                                key === "dailyKmLimit"
                                  ? formatWithCommas(editablePackage[key as keyof typeof editablePackage] as any)
                                  : formatINR(editablePackage[key as keyof typeof editablePackage] as any)
                              }
                              onChange={(e) => {
                                const raw = e.target.value.replace(/[^0-9]/g, "");
                                setEditablePackage(prev => ({ ...prev, [key]: raw }));
                                setPkgSaved(false);

                                const originalVal = String(selectedPackage?.[key as keyof PackageOption] ?? "");
                                setChangedKeys(prev => {
                                  if (raw !== originalVal) {
                                    return prev.includes(key) ? prev : [...prev, key];
                                  } else {
                                    return prev.filter(k => k !== key);
                                  }
                                });
                              }}
                              className={`w-full text-xs font-bold text-center bg-transparent 
    border-b focus:outline-none focus:border-blue-600 transition-colors
    ${changedKeys.includes(key)
                                  ? "border-amber-400 text-amber-600 dark:text-amber-400"
                                  : "border-blue-300 text-blue-700 dark:text-blue-300"}`}
                            />


                          </>
                        )}
                      </div>
                    ))}
                  </div>



                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-gray-400">✏️ Edit charges above to override package defaults</p>
                    <button
                      type="button"
                      disabled={savingPkg || pkgSaved}
                      onClick={handleSavePackageChanges}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors
          ${pkgSaved
                          ? "bg-green-100 text-green-700"
                          : changedKeys.length > 0
                            ? "bg-amber-500 text-white hover:bg-amber-600"
                            : "bg-blue-600 text-white hover:bg-blue-700"}`}
                    >
                      {savingPkg ? "Saving..." : pkgSaved ? "✓ Saved" : changedKeys.length > 0 ? `Update Package (${changedKeys.length})` : "Update Package"}
                    </button>
                  </div>


                  {errors.packageUnsaved && (
                    <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 px-3 py-2">
                      <svg className="h-4 w-4 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                      </svg>
                      <p className="text-xs text-amber-700 dark:text-amber-400">{errors.packageUnsaved}</p>
                    </div>
                  )}
                </div>
              )}


              {selectedPackage && (
                <div className="grid grid-cols-3 gap-4">

                  <FormField label="Extra KM" error={errors.extraKm}>
                    <input
                      type="text"
                      inputMode="numeric"
                      min={0}
                      value={formatWithCommas(form.extraKm || "")}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, "");
                        set("extraKm", raw ? Math.max(0, parseInt(raw)) : 0);
                      }}
                      placeholder="0"
                      className={inputClass(!!errors.extraKm)}
                    />

                  </FormField>

                  <FormField label="Extra Hours (Approximate ) " error={errors.extraHours}>
                    <input
                      type="number" min={0}
                      value={form.extraHours || ""}
                      onChange={(e) => set("extraHours", Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="0"
                      className={inputClass(!!errors.extraHours)}
                    />
                  </FormField>
                  <FormField label="Extra Days (Optional)" error={errors.extraDays}>
                    <input
                      type="number"
                      min={0}
                      value={form.extraDays || ""}
                      onChange={(e) => set("extraDays", Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="0"
                      className={inputClass(!!errors.extraDays)}
                    />
                  </FormField>
                </div>
              )}


              {selectedPackage && (
                <div className="rounded-xl border border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 p-4 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Promoter Requirement</p>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => { set("needPromoter", !form.needPromoter); if (form.needPromoter) { set("promoterType", ""); set("otherPromoterType", ""); } }}
                      disabled={!selectedPackage.promoterAvailable}
                      className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${form.needPromoter ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-600"} disabled:opacity-40`}
                    >
                      <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${form.needPromoter ? "translate-x-5" : ""}`} />
                    </button>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {form.needPromoter ? "Promoter needed" : "No promoter"}
                      {!selectedPackage.promoterAvailable && <span className="ml-2 text-xs text-red-400">(Not available for this package)</span>}
                    </span>
                  </div>

                  {form.needPromoter && (
                    <div className="grid grid-cols-2 gap-4">
                      <div id="field-promoterType">
                        <FormField label="Promoter Type" error={errors.promoterType} required>
                          <select value={form.promoterType} onChange={(e) => set("promoterType", e.target.value)} className={inputClass(!!errors.promoterType)}>
                            <option value="">Select</option>
                            {PROMOTER_TYPE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                          </select>
                        </FormField>
                      </div>



                      {form.promoterType === "Other" && (
                        <FormField label="Specify Type" error={errors.otherPromoterType} required>
                          <input type="text" value={form.otherPromoterType} onChange={(e) => set("otherPromoterType", e.target.value)} className={inputClass(!!errors.otherPromoterType)} />
                        </FormField>
                      )}



                    </div>


                  )}

                  {form.needPromoter && selectedPackage.promoterAvailable && (
                    <p className="text-[10px] text-gray-400">
                      Promoter charge: {formatINR(selectedPackage.promoterChargePerDay)}/day × days × qty
                    </p>
                  )}

                  {form.needPromoter && (
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      {/* Gender */}
                      <div id="field-promoterGender">
                        <FormField label="Gender" error={errors.promoterGender} required>
                          <select
                            value={form.promoterGender}
                            onChange={(e) => set("promoterGender", e.target.value)}
                            className={inputClass(!!errors.promoterGender)}
                          >
                            <option value="">Select</option>
                            {PROMOTER_GENDER_OPTIONS.map((g) => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                        </FormField>
                      </div>

                      <div id="field-promoterLanguage">
                        <FormField label="Language" error={errors.promoterLanguage} required>
                          <select
                            value={form.promoterLanguage}
                            onChange={(e) => set("promoterLanguage", e.target.value)}
                            className={inputClass(!!errors.promoterLanguage)}
                          >
                            <option value="">Select</option>
                            {PROMOTER_LANGUAGE_OPTIONS.map((l) => (
                              <option key={l} value={l}>{l}</option>
                            ))}
                          </select>
                        </FormField>
                      </div>

                      <div id="field-promoterQuantity">
                        <FormField label="Promoter Quantity" error={errors.promoterQuantity} required>
                          <input
                            type="number"
                            min={1}
                            value={form.promoterQuantity || ""}
                            onChange={(e) =>
                              set("promoterQuantity", Math.max(0, parseInt(e.target.value) || 0))
                            }
                            placeholder="Enter quantity"
                            className={inputClass(!!errors.promoterQuantity)}
                          />
                        </FormField>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </>

          </section>


          <section className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Booking Details</p>

            <div className="grid grid-cols-2 gap-4">
              <div id="field-bookingFor">
                <FormField label="Booking For" error={errors.bookingFor} required>
                  <select value={form.bookingFor} onChange={(e) => set("bookingFor", e.target.value)} className={inputClass(!!errors.bookingFor)}>
                    <option value="">Select</option>
                    {BOOKING_FOR_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </FormField>
              </div>

              {form.bookingFor === "Agency" && (
                <div id="field-gstNumber">
                  <FormField label="GST Number" required error={errors.gstNumber}>
                    <input
                      type="text"
                      value={form.gstNumber}
                      onChange={(e) => set("gstNumber", e.target.value.toUpperCase())}
                      placeholder="e.g. 22AAAAA0000A1Z5"
                      maxLength={15}
                      className={inputClass(!!errors.gstNumber)}
                    />
                  </FormField>
                </div>
              )}


              <div id="field-campaignType">
                <FormField label="Campaign Type" error={errors.campaignType} required>
                  <select value={form.campaignType} onChange={(e) => set("campaignType", e.target.value)} className={inputClass(!!errors.campaignType)}>
                    <option value="">Select</option>
                    {campaignTypes.map((ct) => (
                      <option key={ct._id} value={ct.name}>{ct.name}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </FormField>
              </div>
            </div>


            {form.campaignType === "Other" && (
              <FormField label="Specify Campaign" required error={errors.otherCampaignType}>
                <input
                  type="text"
                  value={form.otherCampaignType}
                  onChange={(e) => set("otherCampaignType", e.target.value)}
                  placeholder="Enter campaign type name"
                  className={inputClass(!!errors.otherCampaignType)}
                />
              </FormField>
            )}


            <div id="field-fromDate" className="grid grid-cols-2 gap-4">
              <DatePicker
                id="from-date"
                label="From Date"
                value={form.fromDate}
                minDate={new Date().toLocaleDateString("en-CA")}
                onChange={([date]) => {
                  if (!date) { set("fromDate", ""); return; }
                  const y = date.getFullYear();
                  const m = String(date.getMonth() + 1).padStart(2, "0");
                  const d = String(date.getDate()).padStart(2, "0");
                  set("fromDate", `${y}-${m}-${d}`);
                }}
                error={errors.fromDate}
                placeholder="From Date"
                required
              />

              <DatePicker
                id="field-toDate"
                label="To Date"
                value={form.toDate}
                minDate={form.fromDate || new Date().toLocaleDateString("en-CA")}
                onChange={([date]) => {
                  if (!date) { set("toDate", ""); return; }
                  const y = date.getFullYear();
                  const m = String(date.getMonth() + 1).padStart(2, "0");
                  const d = String(date.getDate()).padStart(2, "0");
                  set("toDate", `${y}-${m}-${d}`);
                }}
                error={errors.toDate}
                required
              />
            </div>

            {form.fromDate && form.toDate && new Date(form.fromDate) < new Date(form.toDate) && (
              <p className="text-xs text-blue-500">
                {Math.ceil((new Date(form.toDate).getTime() - new Date(form.fromDate).getTime()) / 86400000)} base day(s)
                {form.extraDays > 0 ? ` + ${form.extraDays} extra = ${Math.ceil((new Date(form.toDate).getTime() - new Date(form.fromDate).getTime()) / 86400000) + form.extraDays} total days` : ""}
              </p>
            )}
          </section>


          <section className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Location</p>
            <div className="grid grid-cols-2 gap-4">

              <div id="field-state">
                <FormField label="State" error={errors.state} required>
                  <select
                    value={form.state}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className={inputClass(!!errors.state)}
                  >
                    <option value="">Select state</option>
                    {Object.keys(locationData).sort().map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </FormField>
              </div>

              <div id="field-city">
                <FormField label="City" error={errors.city} required>
                  <select
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                    disabled={!form.state}
                    className={inputClass(!!errors.city)}
                  >
                    <option value="">
                      {form.state ? "Select city" : "Select state first"}
                    </option>
                    {cityOptions.map((c, idx) => (
                      <option key={`${c}-${idx}`} value={c}>{c}</option>
                    ))}
                  </select>
                </FormField>
              </div>
              <div id="field-fromLocation">
                <FormField label="From Location" error={errors.fromLocation} required>
                  <input type="text" value={form.fromLocation} onChange={(e) => set("fromLocation", e.target.value)} placeholder="Starting point" className={inputClass(!!errors.fromLocation)} />
                </FormField>
              </div>
              <div id="field-toLocation">
                <FormField label="To Location" error={errors.toLocation} required>
                  <input type="text" value={form.toLocation} onChange={(e) => set("toLocation", e.target.value)} placeholder="Destination" className={inputClass(!!errors.toLocation)} />
                </FormField>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Campaign Media</p>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Campaign Images <span className="text-gray-400">(max 10)</span>
              </label>
              <label className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 py-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors">
                <HiOutlinePlus className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-500">Click to add images</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    set("campaignImages", [...form.campaignImages, ...files].slice(0, 10) as any);
                    e.target.value = "";
                  }}
                />
              </label>
              {form.campaignImages.length > 0 && (
                <div className="grid grid-cols-6 gap-1.5 mt-2">
                  {(form.campaignImages as File[]).map((file, idx) => {
                    const url = URL.createObjectURL(file);
                    return (
                      <div
                        key={idx}
                        className="relative group rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100"
                        style={{ width: "60px", height: "60px" }}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() =>
                            set(
                              "campaignImages",
                              (form.campaignImages as File[]).filter((_, i) => i !== idx) as any
                            )
                          }
                          className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <IoMdClose className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>


            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Campaign Videos <span className="text-gray-400">(max 5)</span>
              </label>
              <label className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 py-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors">
                <HiOutlinePlus className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-500">Click to add videos</span>
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    set("campaignVideos", [...form.campaignVideos, ...files].slice(0, 5) as any);
                    e.target.value = "";
                  }}
                />
              </label>
              {form.campaignVideos.length > 0 && (
                <div className="space-y-2 mt-2">
                  {(form.campaignVideos as File[]).map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                          <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.882v6.236a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-300 truncate">{file.name}</span>
                        <span className="text-[10px] text-gray-400 shrink-0">{(file.size / 1024 / 1024).toFixed(1)}MB</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => set("campaignVideos", (form.campaignVideos as File[]).filter((_, i) => i !== idx) as any)}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                      >
                        <HiOutlineTrash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <div id="field-quantity">
            <FormField label="  Vehicle Quantity" error={errors.quantity} required>
              <input
                type="number"
                min={1}
                value={form.quantity === 0 ? "" : form.quantity}
                onChange={(e) => {
                  const rawValue = e.target.value;
                  if (rawValue === "") {
                    set("quantity", 0);
                  } else {
                    const val = parseInt(rawValue);
                    set("quantity", isNaN(val) ? 0 : val);
                  }
                }}
                className={inputClass(!!errors.quantity) + " w-32"}
                placeholder="Enter quantity"
              />
            </FormField>
          </div>


          {p && selectedPackage && (
            <section className="rounded-xl border border-blue-100 bg-blue-50/60 dark:border-blue-900/30 dark:bg-blue-900/10 p-4 space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-500 mb-3">Pricing Summary</p>




              {(() => {
                const hasExtraHours = form.extraHours > 0;
                const hasExtraKm = form.extraKm > 0;
                const hasPromoter = form.needPromoter;


                const lastRow = hasExtraHours
                  ? "extraHours"
                  : hasExtraKm
                    ? "extraKm"
                    : "rto";

                const makeCharge = (): AdditionalCharge => ({
                  id: uid(), label: "", mode: "+",
                  amount: 0, reduceType: "amount", discountPercent: 0
                });

                return (
                  <>
                    <SummaryRow
                      label={`Rental (${p.totalDays}D × ${formatINR(selectedPackage.perDayRentalCost)} × Qty ${form.quantity})`}
                      val={p.rentalCost}
                      isLast={false}
                      hasCharges={form.additionalCharges.length > 0}
                      onAdd={() => set("additionalCharges", [...form.additionalCharges, makeCharge()])}
                    />
                    <SummaryRow
                      label={`Driver (${p.totalDays}D × ${formatINR(selectedPackage.driverCharges)} × Qty ${form.quantity})`}
                      val={p.driverCost}
                      isLast={false}
                      hasCharges={form.additionalCharges.length > 0}
                      onAdd={() => set("additionalCharges", [...form.additionalCharges, makeCharge()])}
                    />
                    {hasPromoter && (
                      <SummaryRow
                        label={`Promoter (${p.totalDays}D × ${formatINR(selectedPackage.promoterChargePerDay)} × ${form.promoterQuantity} Promoter)`}
                        val={p.promoterCost}
                        isLast={false}
                        hasCharges={form.additionalCharges.length > 0}
                        onAdd={() => set("additionalCharges", [...form.additionalCharges, makeCharge()])}
                      />
                    )}
                    <SummaryRow
                      label="RTO Charges"
                      val={p.rtoCost}
                      isLast={lastRow === "rto"}
                      hasCharges={form.additionalCharges.length > 0}
                      onAdd={() => set("additionalCharges", [...form.additionalCharges, makeCharge()])}
                    />
                    {hasExtraKm && (
                      <SummaryRow
                        label={`Extra KM / K (${form.extraKm.toLocaleString('en-IN')} × ${formatINR(selectedPackage.perKmCharge)})`}
                        val={(p as any).extraKmCost || 0}
                        isLast={lastRow === "extraKm"}
                        hasCharges={form.additionalCharges.length > 0}
                        onAdd={() => set("additionalCharges", [...form.additionalCharges, makeCharge()])}
                      />
                    )}
                    {hasExtraHours && (
                      <SummaryRow
                        label={`Extra Hours / H (${form.extraHours} × ${formatINR(selectedPackage.additionalHourCharges)})`}
                        val={(p as any).extraHourCost || 0}
                        isLast={lastRow === "extraHours"}
                        hasCharges={form.additionalCharges.length > 0}
                        onAdd={() => set("additionalCharges", [...form.additionalCharges, makeCharge()])}
                      />
                    )}
                  </>
                );
              })()}


              {form.additionalCharges.map((charge, idx) => (
                <div key={charge.id} className="flex items-center gap-1.5 pl-2 border-l-2 border-blue-100 dark:border-blue-900/40 w-full min-w-0">



                  <input
                    type="text"
                    value={charge.label}
                    onChange={(e) => updateCharge(charge.id, { label: e.target.value })}
                    placeholder="Label"
                    className="w-36 min-w-0 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300 outline-none focus:border-blue-400"
                  />


                  <select
                    value={charge.mode}
                    onChange={(e) => updateCharge(charge.id, {
                      mode: e.target.value as "+" | "-",
                      reduceType: "amount",
                      discountPercent: 0,
                      amount: 0,
                    })}
                    className={`rounded-lg border px-1.5 py-1.5 text-xs font-bold outline-none shrink-0 hidden sm:block ${charge.mode === "+"
                      ? "border-green-200 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      : "border-red-200 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                      }`}
                  >
                    <option value="+">+ Add</option>
                    {/* <option value="-">- Reduce</option> */}
                  </select>


                  <div className="flex overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0">
                    <select
                      disabled={charge.mode === "+"}
                      value={charge.mode === "-" ? (charge.reduceType ?? "amount") : "amount"}
                      onChange={(e) => updateCharge(charge.id, {
                        reduceType: e.target.value as "amount" | "percent",
                        amount: 0,
                        discountPercent: 0,
                      })}
                      className="bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 px-1 text-xs font-semibold text-gray-600 dark:text-gray-300 outline-none disabled:opacity-40 cursor-pointer"
                    >
                      <option value="amount">₹</option>
                      <option value="percent">%</option>
                    </select>
                    <input

                      min={0}
                      max={charge.mode === "-" && charge.reduceType === "percent" ? 100 : undefined}

                      value={
                        charge.mode === "-" && charge.reduceType === "percent"
                          ? (charge.discountPercent || "")
                          : charge.amount
                            ? new Intl.NumberFormat("en-IN").format(charge.amount)
                            : ""
                      }
                      onChange={(e) => {
                        if (charge.mode === "-" && charge.reduceType === "percent") {
                          const val = parseFloat(e.target.value) || 0;
                          updateCharge(charge.id, { discountPercent: Math.min(100, val) });
                        } else {
                          const raw = e.target.value.replace(/[^0-9]/g, "");
                          updateCharge(charge.id, { amount: raw ? parseInt(raw) : 0 });
                        }
                      }}
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      className="w-24 sm:w-32 bg-transparent px-2 py-1.5 text-xs outline-none min-w-0"
                    />
                  </div>


                  <button
                    type="button"
                    onClick={() => {
                      const newCharge: AdditionalCharge = {
                        id: uid(), label: "", mode: "+",
                        amount: 0, reduceType: "amount", discountPercent: 0
                      };
                      const updated = [...form.additionalCharges];
                      updated.splice(idx + 1, 0, newCharge);
                      set("additionalCharges", updated);
                    }}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 text-blue-500 hover:text-blue-700 transition-colors border border-blue-100"
                    title="Add charge below"
                  >
                    <HiOutlinePlus className="h-3 w-3 stroke-2" />
                  </button>


                  <button
                    type="button"
                    onClick={() => removeCharge(charge.id)}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors border border-red-100"
                    title="Remove"
                  >
                    <HiOutlineTrash className="h-3 w-3" />
                  </button>


                  {/* Right side amount display */}
                  {charge.mode === "+" && charge.amount > 0 && (
                    <span className="ml-auto text-xs font-semibold shrink-0 text-gray-800 dark:text-gray-200">
                      {formatINR(charge.amount)}
                    </span>
                  )}

                </div>
              ))}




              <div className="flex justify-between text-sm font-semibold text-gray-700 dark:text-gray-200 border-t border-blue-200 dark:border-blue-900/30 pt-2 mt-1">
                <span>Subtotal</span>
                <span>{formatINR(p.subtotal)}</span>
              </div>


              {(() => {
                const MAX_PCT = parseFloat(process.env.NEXT_PUBLIC_MAX_DISCOUNT_PERCENT || "15");
                const maxAmt = Math.round((p?.subtotal ?? 0) * (MAX_PCT / 100));
                let usedAmt = 0;

                return form.additionalCharges.filter(c => c.mode === "-" && c.label).map(c => {
                  const isPercent = c.reduceType === "percent" && (c.discountPercent || 0) > 0;
                  let cutAmt: number;
                  let isCapped = false;
                  let capMessage = "";

                  if (isPercent) {
                    const requestedAmt = Math.round((p?.subtotal ?? 0) * ((c.discountPercent ?? 0) / 100));
                    const remaining = Math.max(maxAmt - usedAmt, 0);
                    cutAmt = Math.min(requestedAmt, remaining);
                    if (requestedAmt > remaining) {
                      isCapped = true;
                      const appliedPct = parseFloat(((cutAmt / (p?.subtotal ?? 1)) * 100).toFixed(2));
                      capMessage = `Remaining Balance: ${formatINR(remaining)} (${appliedPct}%) only · ${formatINR(cutAmt)} applied`;
                    }
                  } else {
                    const requested = Number(c.amount) || 0;
                    const remaining = Math.max(maxAmt - usedAmt, 0);
                    cutAmt = Math.min(requested, remaining);
                    if (requested > remaining) {
                      isCapped = true;
                      const appliedPct = parseFloat(((cutAmt / (p?.subtotal ?? 1)) * 100).toFixed(2));
                      capMessage = `Balance:${formatINR(remaining)} (${appliedPct}%) only · ${formatINR(cutAmt)} deducted`;
                    }
                  }
                  usedAmt += cutAmt;

                  return (
                    <div key={c.id} className="space-y-0.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          {c.label}
                          {isPercent && <span className="ml-1 text-xs text-red-400">({Math.min(c.discountPercent ?? 0, MAX_PCT)}%)</span>}
                        </span>
                        <span className="font-medium text-red-500">
                          -{formatINR(cutAmt)}
                        </span>
                      </div>
                      {isCapped && (
                        <div className="flex items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-2 py-1">
                          <svg className="h-3 w-3 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                          </svg>
                          <p className="text-[10px] text-amber-700 dark:text-amber-400">{capMessage}</p>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}


              <div className="border-t border-blue-200 dark:border-blue-900/30 pt-2 mt-2 space-y-1.5">
                {(p as any).additionalCuts > 0 && (
                  <div className="flex justify-between text-sm font-medium text-red-500">
                    <span>Total Discount</span>
                    <span>{formatINR((p as any).additionalCuts)}</span>
                  </div>
                )}

                {(p as any).additionalCuts > 0 && (
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                    <span>Taxable Amount</span>
                    <span>{formatINR((p as any).taxableAmount)}</span>
                  </div>
                )}


                <div className="flex justify-between text-base font-bold">
                  <span>Total (excl. GST)</span>
                  <span>{formatINR(p.totalAmount)}</span>
                </div>

              </div>
            </section>
          )}
        </div>


        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-700 shrink-0 bg-white dark:bg-gray-900">
          <button onClick={onClose} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
            {editing ? "Save Changes" : "Add"}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}



function SummaryRow({ label, val, onAdd, isLast = false, hasCharges = false }: { label: string; val: number; onAdd: () => void; isLast?: boolean; hasCharges?: boolean }) {


  const formatINR = (value: string | number) => {
    const num = parseFloat(String(value).replace(/[^0-9.]/g, ""));
    if (isNaN(num) || value === "" || value === undefined) return "";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="flex items-center gap-2">
        <span className="font-medium text-gray-800 dark:text-gray-200">
          {formatINR(val)}
        </span>
        {isLast && !hasCharges && (
          <button
            type="button"
            onClick={onAdd}
            className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 border border-blue-200 transition-colors"
            title="Add charge"
          >
            <HiOutlinePlus className="h-3 w-3 stroke-2" />
          </button>
        )}

      </span>
    </div>
  );
} 