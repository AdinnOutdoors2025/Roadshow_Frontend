/* eslint-disable */
// @ts-nocheck
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { VehicleConfig, AdditionalCharge } from "./AdminOrderForm";
import { PricingPreview, getPackagesForOrder } from "../../utils/Adminorderapi";
import FormField, { inputClass } from "../../../components/reusableFormField";
import { HiOutlinePlus, HiOutlineTrash } from "react-icons/hi2";
import { IoMdClose } from "react-icons/io";
import API_BASE from "../../../../baseurl";
import DatePicker from "@/components/form/date-picker";
import { languages } from "../../utils/collection.json";
import CitySelect from "./cityselect";
import { toast, Toaster } from "react-hot-toast";
import { checkVehicleAvailability } from "../../utils/Adminorderapi";

interface PackageOption {
  _id: string;
  vehicleType: string | { _id: string; typeName: string };
  vehicleModel: string;
  perDayRentalCost: number;
  driverCharges: number;
  rtoCharges: number;
  brandingCost: number;
  dailyKmLimit: number;
  additionalHourCharges: number;
  promoterAvailable: boolean;
  promoterChargePerDay: number;
  isActive: boolean;
  perKmCharge: number
  dailyKmcharges: number
}

interface Props {
  editing: VehicleConfig | null;
  onSave: (v: VehicleConfig) => void;
  onClose: () => void;
  selectedClientOrder?: any;
}


const uid = () => Math.random().toString(36).slice(2, 9);
const toTitleCase = (str: string) => str.replace(/\b\w/g, (c) => c.toUpperCase());


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
    campaignLocation: "",
    quantity: 1,
    extraKm: 0,
    extraDays: 0,
    needPromoter: false,
    promoterFromDate: "",
    promoterToDate: "",
    promoterType: "",
    otherPromoterType: "",
    campaignImages: [],
    campaignVideos: [],
    additionalCharges: [],
    pricing: null,
    gstNumber: "",
    extraHours: 0,
    promoterGender: "",
    promoterLanguage: [],
    promoterQuantity: 0,
    dailyKmcharges: 0,
    campaignName: "",
    existingImages: [],
    existingVideos: [],

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
  dailyKmcharges: number,
  promoterFromDate?: string,
  promoterToDate?: string,
): PricingPreview | null {


  if (!fromDate || !toDate || quantity < 1) return null;
  const from = new Date(fromDate);
  const to = new Date(toDate);
  if (from >= to) return null;

  const baseDays = Math.ceil((to.getTime() - from.getTime()) / 86400000) + 1;
  const totalDays = baseDays + (extraDays || 0);

  const rentalCost = pkg.perDayRentalCost * totalDays * quantity;
  const driverCost = pkg.driverCharges * totalDays * quantity;

  const DEFAULT_PROMOTER_CHARGE = parseFloat(
    process.env.NEXT_PUBLIC_DEFAULT_PROMOTER_CHARGE || "1000"
  );

  // const promoterCost = needPromoter
  //   ? (pkg.promoterChargePerDay || 0) * totalDays * promoterQuantity
  //   : 0;

  // Promoter is priced only for the days actually selected (Promoter
  // From/To, inclusive) — falls back to the full campaign totalDays when
  // no promoter date range is set yet (keeps older saved orders working).
  let promoterDays = totalDays;
  if (promoterFromDate && promoterToDate) {
    const pFrom = new Date(promoterFromDate);
    const pTo = new Date(promoterToDate);
    if (pFrom <= pTo) {
      promoterDays = Math.ceil((pTo.getTime() - pFrom.getTime()) / 86400000) + 1;
    }
  }

  const promoterCost = needPromoter
    ? DEFAULT_PROMOTER_CHARGE * promoterDays * promoterQuantity
    : 0;


  // RTO is a one-time flat charge per vehicle-type slot (from the selected
  // package), applied once regardless of totalDays — mirrors how the
  // backend's Campaign Calculator applies it on the campaign's first day.
  const rtoCost = (pkg.rtoCharges || 0) * quantity;

  // Branding Cost — only ever set on a Hybrid vehicle's package; same
  // one-time-per-vehicle-slot pattern as RTO.
  const brandingCost = (pkg.brandingCost || 0) * quantity;

  const extraKmCost = extraKm > 0 ? pkg.perKmCharge * extraKm : 0;
  const extraHourCost = extraHours > 0 ? pkg.additionalHourCharges * extraHours : 0;


  const additionalAdds = additionalCharges.reduce((acc, c) => {
    const amt = Number(c.amount) || 0;
    return c.mode === "+" ? acc + amt : acc;
  }, 0);

  const subtotal = rentalCost + promoterCost + rtoCost + brandingCost + extraKmCost + extraHourCost + additionalAdds;


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
    // promoterChargePerDay: needPromoter ? pkg.promoterChargePerDay : 0,
    promoterChargePerDay: needPromoter ? DEFAULT_PROMOTER_CHARGE : 0,
    promoterDays,
    rtoCharges: pkg.rtoCharges,
    brandingCost,
    additionalHourCharges: pkg.additionalHourCharges,
    dailyKmLimit: pkg.dailyKmLimit,
    dailyKmcharges: pkg.perKmCharge || dailyKmcharges || 0,
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



export default function VehicleFormModal({ editing, onSave, onClose, selectedClientOrder }: Props) {
  const [form, setForm] = useState<VehicleConfig>(editing ?? { id: uid(), ...defaultForm() });
  const [selectedPackage, setSelectedPackage] = useState<PackageOption | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [packageslist, setPackageslist] = useState<PackageOption[]>([]);
  const [campaignTypes, setCampaignTypes] = useState<{ _id: string, name: string }[]>([]);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);


  const [editablePackage, setEditablePackage] = useState<Record<string, string>>({});
  const [savingPkg, setSavingPkg] = useState(false);
  const [pkgSaved, setPkgSaved] = useState(false);
  const [changedKeys, setChangedKeys] = useState<string[]>([]);
  const [locationData, setLocationData] = useState<Record<string, string[]>>({});
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<any>([]);
  const [addCityModalOpen, setAddCityModalOpen] = useState(false);
  const [newCityName, setNewCityName] = useState("");
  const [addCityLoading, setAddCityLoading] = useState(false);
  const [addCityError, setAddCityError] = useState("");



  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  console.log("selectedClientOrder", selectedClientOrder)


  const IMAGE_MAX_MB = 5;
  const VIDEO_MAX_MB = 50;

  const validateFileSize = (file: File): string | null => {
    const isVideo = file.type.startsWith("video/");
    const fileMB = file.size / (1024 * 1024);
    if (isVideo && fileMB > VIDEO_MAX_MB)
      return `Video upload only 50 MB allowed. "${file.name}" is ${fileMB.toFixed(2)} MB`;
    if (!isVideo && fileMB > IMAGE_MAX_MB)
      return `Image upload only 5 MB allowed. "${file.name}" is ${fileMB.toFixed(2)} MB`;
    return null;
  };



  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);


  const PROMOTER_GENDER_OPTIONS = ["Male", "Female", "Other"];
  // const PROMOTER_LANGUAGE_OPTIONS = ["Tamil", "English", "Telugu", "Hindi", "Kannada", "Malayalam"];

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


  // useEffect(() => {
  //   if (selectedPackage) {
  //     setEditablePackage({
  //       perDayRentalCost: String(selectedPackage.perDayRentalCost),
  //       driverCharges: String(selectedPackage.driverCharges),
  //       rtoCharges: String(selectedPackage.rtoCharges),
  //       dailyKmLimit: String(selectedPackage.dailyKmLimit),
  //       additionalHourCharges: String(selectedPackage.additionalHourCharges),
  //       promoterChargePerDay: String(selectedPackage.promoterChargePerDay),
  //       perKmCharge: String(selectedPackage.perKmCharge || 0),
  //     });
  //     setPkgSaved(false);
  //     setChangedKeys([]);
  //   }
  // }, [selectedPackage?._id]);


  useEffect(() => {
    if (selectedPackage) {
      const DEFAULT_PROMOTER_CHARGE = process.env.NEXT_PUBLIC_DEFAULT_PROMOTER_CHARGE || "1000";
      setEditablePackage({
        perDayRentalCost: String(selectedPackage.perDayRentalCost),
        driverCharges: String(selectedPackage.driverCharges),
        rtoCharges: String(selectedPackage.rtoCharges),
        dailyKmLimit: String(selectedPackage.dailyKmLimit),
        additionalHourCharges: String(selectedPackage.additionalHourCharges),
        promoterChargePerDay: DEFAULT_PROMOTER_CHARGE,   // ← selectedPackage.promoterChargePerDay ku badhilaa
        perKmCharge: String(selectedPackage.perKmCharge || 0),
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
      form.promoterQuantity,
      mergedPkg.perKmCharge || 0,
      form.promoterFromDate,
      form.promoterToDate,
    );
    setForm(f => ({ ...f, pricing: p }));
  }, [selectedPackage, editablePackage, form.fromDate, form.toDate,
    form.quantity, form.needPromoter, form.extraKm, form.extraDays, form.additionalCharges, form.promoterQuantity,
    form.promoterFromDate, form.promoterToDate]);


  const VEHICLE_TYPES = ["Non-Customizable Vehicle", "Customizable Vehicle"];
  const filteredModels = packageslist.filter((p) => p.vehicleType);




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


      const activePackages = data.data.filter((pkg: any) => pkg.isActive === true);
      setPackageslist(activePackages);

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

  // Client Request → Order: when the selected client request has exactly one
  // vehicle type, auto-fill the model/dates/location/quantity so the admin
  // doesn't have to retype what the customer already requested.
  useEffect(() => {
    if (editing || !selectedClientOrder || packageslist.length === 0) return;
    const vtList = selectedClientOrder.vehicleTypes || [];
    if (vtList.length !== 1) return;

    const vt = vtList[0];
    const vtId = typeof vt.vehicleType === "object" ? vt.vehicleType?._id : vt.vehicleType;
    const pkg = packageslist.find((p) => {
      const pId = typeof p.vehicleType === "object" ? (p.vehicleType as any)?._id : p.vehicleType;
      return pId === vtId;
    });

    setForm((f) => ({
      ...f,
      packageId: pkg ? pkg._id : f.packageId,
      vehicleModel: pkg
        ? (typeof pkg.vehicleType === "object" ? (pkg.vehicleType as any)?.typeName : "") || f.vehicleModel
        : f.vehicleModel,
      vehicleType: vtId || f.vehicleType,
      fromDate: vt.fromDate ? String(vt.fromDate).slice(0, 10) : f.fromDate,
      toDate: vt.toDate ? String(vt.toDate).slice(0, 10) : f.toDate,
      campaignLocation: vt.campaignLocation || f.campaignLocation,
      quantity: vt.quantity || f.quantity,
    }));
    if (pkg) setSelectedPackage(pkg);
  }, [selectedClientOrder, packageslist, editing]);


  const handleAddCity = async () => {
    if (!newCityName.trim()) {
      setAddCityError("City name is required");
      return;
    }
    if (!form.state) {
      setAddCityError("Please select a state first");
      return;
    }

    setAddCityLoading(true);
    setAddCityError("");

    try {
      const res = await fetch(`${API_BASE}locations/${encodeURIComponent(form.state)}/cities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: newCityName.trim() }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to add city");

      // Update local locationData so it appears immediately
      setLocationData(prev => ({
        ...prev,
        [form.state]: [...(prev[form.state] || []), newCityName.trim()],
      }));

      // Update cityOptions so dropdown shows the new city
      setCityOptions(prev => [...prev, newCityName.trim()]);


      set("city", newCityName.trim());

      setNewCityName("");
      setAddCityModalOpen(false);
    } catch (err: any) {
      setAddCityError(err.message || "Something went wrong");
    } finally {
      setAddCityLoading(false);
    }
  };


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
      form.promoterQuantity,
      selectedPackage.perKmCharge || 0,
      form.promoterFromDate,
      form.promoterToDate,
    );
    setForm((f) => ({ ...f, pricing: p }));
  }, [selectedPackage, form.fromDate, form.toDate, form.quantity, form.needPromoter, form.extraKm, form.extraDays, form.extraHours, form.additionalCharges, form.promoterQuantity,
    form.promoterFromDate, form.promoterToDate]);

  const set = useCallback(<K extends keyof VehicleConfig>(key: K, val: VehicleConfig[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => { const n = { ...e }; delete n[key as string]; return n; });
  }, []);

  // If the campaign From/To dates change such that the already-selected
  // promoter dates fall outside the new window, clear them — a stale
  // promoter date range shouldn't silently stay pinned to the old campaign.
  useEffect(() => {
    if (!form.needPromoter || !form.fromDate || !form.toDate) return;
    const campFrom = new Date(form.fromDate);
    const campTo = new Date(form.toDate);
    const pFrom = form.promoterFromDate ? new Date(form.promoterFromDate) : null;
    const pTo = form.promoterToDate ? new Date(form.promoterToDate) : null;
    const fromInvalid = pFrom && (pFrom < campFrom || pFrom > campTo);
    const toInvalid = pTo && (pTo < campFrom || pTo > campTo);
    if (fromInvalid || toInvalid) {
      setForm((f) => ({ ...f, promoterFromDate: "", promoterToDate: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.fromDate, form.toDate]);


  const handleVehicleTypeChange = async (type: string) => {
    setForm((f) => ({ ...f, vehicleType: type, vehicleModel: "", packageId: "" }));
    setSelectedPackage(null);


  };


  const handleVehicleModelChange = (modelId: string) => {
    const pkg = packageslist.find((p) => p._id === modelId) || null;
    setSelectedPackage(pkg);


    const vehicleModelName =
      typeof pkg?.vehicleType === "object" && pkg?.vehicleType !== null
        ? (pkg.vehicleType as any).typeName ?? ""
        : pkg?.vehicleType ?? "";

    const vehicleTypeId =
      typeof pkg?.vehicleType === "object" && pkg?.vehicleType !== null
        ? (pkg.vehicleType as any)._id ?? ""
        : typeof pkg?.vehicleType === "string"
          ? pkg.vehicleType
          : "";

    setForm((f) => ({
      ...f,
      packageId: modelId,
      vehicleModel: vehicleModelName,
      vehicleType: vehicleTypeId,
    }));
  };

  function formatDate(d: string) {
    if (!d) return "—";
    return new Date(d).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }


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
    // if (!form.vehicleType) e.vehicleType = "Select vehicle type";
    if (!form.packageId) e.vehicleModel = "Select vehicle model";
    // if (!form.bookingFor) e.bookingFor = "Select booking for";

    if (form.campaignType === "Other" && !form.otherCampaignType) e.otherCampaignType = "Required";

    if (!form.fromDate) e.fromDate = "Select start date";
    if (!form.toDate) e.toDate = "Select end date";
    if (form.fromDate && form.toDate && new Date(form.fromDate) >= new Date(form.toDate))
      e.toDate = "End date must be after start date";
    if (!form.campaignLocation.trim()) e.campaignLocation = "Enter campaign location";

    if (!form.quantity || form.quantity < 1) {
      e.quantity = "Please add valid quantity (minimum 1)";
    }
    if (form.needPromoter && !form.promoterType) e.promoterType = "Select promoter type";
    if (form.needPromoter && form.promoterType === "Other" && !form.otherPromoterType) e.otherPromoterType = "Required";
    if (form.needPromoter && !form.promoterGender) e.promoterGender = "Select gender";
    // if (form.needPromoter && !form.promoterLanguage) e.promoterLanguage = "Select language";
    if (form.needPromoter && form.promoterLanguage.length === 0) e.promoterLanguage = "Select language";
    if (form.needPromoter && (!form.promoterQuantity || form.promoterQuantity < 1))
      e.promoterQuantity = "Enter valid quantity";
    if (form.needPromoter) {
      if (!form.promoterFromDate) e.promoterFromDate = "Select promoter start date";
      if (!form.promoterToDate) e.promoterToDate = "Select promoter end date";
      if (form.promoterFromDate && form.promoterToDate && new Date(form.promoterFromDate) > new Date(form.promoterToDate)) {
        e.promoterToDate = "Promoter end date cannot be before start date";
      }
      if (form.promoterFromDate && form.fromDate && form.toDate &&
        (new Date(form.promoterFromDate) < new Date(form.fromDate) || new Date(form.promoterFromDate) > new Date(form.toDate))) {
        e.promoterFromDate = "Promoter start date must be within the campaign period";
      }
      if (form.promoterToDate && form.fromDate && form.toDate &&
        (new Date(form.promoterToDate) < new Date(form.fromDate) || new Date(form.promoterToDate) > new Date(form.toDate))) {
        e.promoterToDate = "Promoter end date must be within the campaign period";
      }
    }
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


      const vehicleTypeId =
        typeof selectedPackage.vehicleType === "object"
          ? selectedPackage.vehicleType._id
          : selectedPackage.vehicleType;

      const res = await fetch(`${API_BASE}packages/${selectedPackage._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...numericPayload,
          vehicleType: vehicleTypeId,
          vehicleModel: selectedPackage.vehicleModel,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      const summary = changedKeys
        .map(k => `${FIELD_LABELS[k]}: ₹${selectedPackage[k as keyof PackageOption]} → ₹${editablePackage[k]}`)
        .join("\n");

      setSelectedPackage(prev => prev ? { ...prev, ...numericPayload } : prev);
      setPkgSaved(true);
      setChangedKeys([]);

      if (summary) alert(` Package updated!\n\n${summary}`);

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
          "state", "city", "campaignLocation", "quantity",
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


    const vehicleTypeId =
      typeof selectedPackage?.vehicleType === "object"
        ? selectedPackage.vehicleType._id
        : selectedPackage?.vehicleType;

    console.log("vehicleTypeId", vehicleTypeId)

    if (vehicleTypeId && form.fromDate && form.toDate && form.quantity > 0) {
      try {
        const availability = await checkVehicleAvailability({
          vehicleType: vehicleTypeId,
          quantity: form.quantity,
          fromDate: form.fromDate,
          toDate: form.toDate,
        });

        if (!availability.available) {
          const typeName =
            typeof selectedPackage?.vehicleType === "object"
              ? selectedPackage.vehicleType.typeName
              : form.vehicleModel;

          toast.error(
            `No availability: "${typeName}" has only ${availability.availableCount} vehicle(s) free for ${form.fromDate} to ${form.toDate}, but ${form.quantity} required.`
          );
          return;
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to check vehicle availability");
        return;
      }
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
    // <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-2">
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-2">
      <Toaster position="top-right" />
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

            {/* {selectedClientOrder && (
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 dark:border-indigo-900/30 dark:bg-indigo-900/10 p-4 space-y-2">
                <p className="text-xs font-semibold text-indigo-500">
                  Client Request · {selectedClientOrder.clientOrderId}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(selectedClientOrder.vehicleTypes || []).map((vt: any, idx: number) => {
                    const match = vehicleTypes.find((t: any) => t._id === vt.vehicleType._id);
                    return (
                      <span
                        key={idx}
                        className="rounded-full bg-indigo-100 dark:bg-indigo-900/30 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300"
                      >
                        {match?.typeName || "Unknown Type"} × {vt.quantity}{" "}
                        <span className="text-xs text-gray-500">
                          {formatDate(vt.fromDate)?.slice(0, 10)} → {formatDate(vt.toDate)?.slice(0, 10)}
                          {vt.totalDays ? ` · ${vt.totalDays} days` : ""}
                        </span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )} */}

            {/* {selectedClientOrder && (
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 dark:border-indigo-900/30 dark:bg-indigo-900/10 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-indigo-500 flex items-center gap-1.5">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Client Request · {selectedClientOrder.clientOrderId}
                  </p>
                  <span className="text-[10px] font-medium text-indigo-400 bg-white/60 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full">
                    {(selectedClientOrder.vehicleTypes || []).length} vehicle{(selectedClientOrder.vehicleTypes || []).length > 1 ? "s" : ""}
                  </span>
                </div>

                <div className="flex flex-col gap-2 max-h-[132px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-indigo-200 dark:scrollbar-thumb-indigo-800 scrollbar-track-transparent">
                  {(selectedClientOrder.vehicleTypes || []).map((vt: any, idx: number) => {
                    const match = vehicleTypes.find((t: any) => t._id === vt.vehicleType._id);
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 rounded-lg bg-white/70 dark:bg-indigo-950/30 border border-indigo-100/70 dark:border-indigo-900/30 px-3 py-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="shrink-0 rounded-full bg-indigo-600 text-white text-[10px] font-semibold h-5 w-5 flex items-center justify-center">
                            {vt.quantity}
                          </span>
                          <span className="text-xs font-medium text-indigo-800 dark:text-indigo-300 truncate">
                            {match?.typeName || "Unknown Type"}
                          </span>
                        </div>
                        <span className="shrink-0 text-[11px] text-gray-500 dark:text-gray-400">
                          {formatDate(vt.fromDate)?.slice(0, 10)} → {formatDate(vt.toDate)?.slice(0, 10)}
                          {vt.totalDays ? ` · ${vt.totalDays}d` : ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )} */}
            {selectedClientOrder && (
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 dark:border-indigo-900/30 dark:bg-indigo-900/10 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-indigo-500 flex items-center gap-1.5">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Client Request · {selectedClientOrder.clientOrderId}
                  </p>
                  <span className="text-[10px] font-medium text-indigo-400 bg-white/60 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full">
                    {(selectedClientOrder.vehicleTypes || []).length} vehicle{(selectedClientOrder.vehicleTypes || []).length > 1 ? "s" : ""}
                  </span>
                </div>

                <div className="flex flex-col gap-2 max-h-[132px] overflow-y-auto pr-1">
                  {(selectedClientOrder.vehicleTypes || []).map((vt: any, idx: number) => {
                    const match = vehicleTypes.find((t: any) => t._id === vt.vehicleType._id);
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 rounded-lg bg-white/70 dark:bg-indigo-950/30 border border-indigo-100/70 dark:border-indigo-900/30 px-3 py-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="shrink-0 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                          <span className="text-xs font-medium text-indigo-800 dark:text-indigo-300 truncate">
                            {match?.typeName || "Unknown Type"}
                          </span>
                          <span className="shrink-0 text-[11px] font-semibold text-indigo-500 bg-indigo-100 dark:bg-indigo-900/40 px-1.5 py-0.5 rounded">
                            × {vt.quantity}
                          </span>
                        </div>
                        <span className="shrink-0 text-[11px] text-gray-500 dark:text-gray-400">
                          {formatDate(vt.fromDate)?.slice(0, 10)} → {formatDate(vt.toDate)?.slice(0, 10)}
                          {vt.totalDays ? ` · ${vt.totalDays}d` : ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <>
              <div className="grid grid-cols-2 gap-4">
                {/* <FormField label="Vehicle Type" error={errors.vehicleType} required>
                  <VehicleTypeSelect
                    value={form.vehicleType}
                    onChange={handleVehicleTypeChange}
                    error={errors.vehicleType}
                  />
                </FormField> */}

                <FormField label="Vehicle Model" error={errors.vehicleModel} required>
                  <select
                    value={form.packageId}
                    onChange={(e) => handleVehicleModelChange(e.target.value)}
                    // disabled={!form.vehicleType}
                    className={inputClass(!!errors.vehicleModel)}
                  >
                    <option value="">Select model</option>

                    {filteredModels.map((pkg) => {
                      const label =
                        typeof pkg.vehicleType === "object" && pkg.vehicleType !== null
                          ? pkg.vehicleType.typeName
                          : vehicleTypes.find((t : any) => t._id === pkg.vehicleType)?.typeName ?? pkg.vehicleType;

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
                <div className="grid grid-cols-2 gap-4">

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
                  {/* <FormField label="Extra Days (Optional)" error={errors.extraDays}>
                    <input
                      type="number"
                      min={0}
                      value={form.extraDays || ""}
                      onChange={(e) => set("extraDays", Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="0"
                      className={inputClass(!!errors.extraDays)}
                    />
                  </FormField> */}
                </div>
              )}


           
            </>

          </section>


          <section className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Booking Details</p>

            <div className="grid grid-cols-2 gap-4">
              {/* <div id="field-bookingFor">
                <FormField label="Booking For" error={errors.bookingFor} required>
                  <select value={form.bookingFor} onChange={(e) => set("bookingFor", e.target.value)} className={inputClass(!!errors.bookingFor)}>
                    <option value="">Select</option>
                    {BOOKING_FOR_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </FormField>
              </div> */}




              <div id="field-campaignType">
                <FormField label="Campaign Type" error={errors.campaignType}>
                  <select value={form.campaignType} onChange={(e) => set("campaignType", e.target.value)} className={inputClass(!!errors.campaignType)}>
                    <option value="">Select</option>
                    {campaignTypes.map((ct) => (
                      <option key={ct._id} value={ct.name}>{ct.name}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </FormField>
              </div>


              <div id="field-campaignName">
                <FormField label="Campaign Name" error={errors.campaignName}>
                  <input
                    type="text"
                    value={form.campaignName}
                    onChange={(e) => {
                      const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                      set("campaignName", toTitleCase(onlyLetters));
                    }}
                    placeholder="Enter campaign name"
                    className={inputClass(!!errors.campaignName)}
                  />
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
                {Math.ceil((new Date(form.toDate).getTime() - new Date(form.fromDate).getTime()) / 86400000) + 1} base day(s)
                {form.extraDays > 0 ? ` + ${form.extraDays} extra = ${Math.ceil((new Date(form.toDate).getTime() - new Date(form.fromDate).getTime()) / 86400000) + 1 + form.extraDays} total days` : ""}
              </p>
            )}
          </section>
   {/* {selectedPackage && ( */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 p-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Promoter Requirement</p>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => { set("needPromoter", !form.needPromoter); if (form.needPromoter) { set("promoterType", ""); set("otherPromoterType", ""); set("promoterFromDate", ""); set("promoterToDate", ""); } }}
                    // disabled={!selectedPackage.promoterAvailable}
                    className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${form.needPromoter ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-600"} disabled:opacity-40`}
                  >
                    <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${form.needPromoter ? "translate-x-5" : ""}`} />
                  </button>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {form.needPromoter ? "Promoter needed" : "No promoter"}
                    {/* {!selectedPackage.promoterAvailable && <span className="ml-2 text-xs text-red-400">(Not available for this package)</span>} */}
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

                {/* {form.needPromoter && selectedPackage.promoterAvailable && (
                    <p className="text-[10px] text-gray-400">
                      Promoter charge: {formatINR(selectedPackage.promoterChargePerDay)}/day × days × qty
                    </p>
                  )} */}

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

                    {/* <div id="field-promoterLanguage">
                      <FormField label="Language" error={errors.promoterLanguage} required>
                        <select
                          value={form.promoterLanguage}
                          onChange={(e) => set("promoterLanguage", e.target.value)}
                          className={inputClass(!!errors.promoterLanguage)}
                        >
                          <option value="">Select</option>
                          {languages.map((l) => (
                            <option key={l} value={l}>{l}</option>
                          ))}
                        </select>
                      </FormField>
                    </div> */}



                    <div id="field-promoterLanguage">
                      <FormField label="Language" error={errors.promoterLanguage} required>
                        <div className="relative" ref={langDropdownRef}>


                          <div
                            onClick={() => setLangDropdownOpen((o) => !o)}
                            className={`min-h-[42px] flex flex-wrap gap-1 p-2 rounded-lg border cursor-pointer
          ${errors.promoterLanguage
                                ? "border-red-400 bg-red-50"
                                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                              }`}
                          >
                            {form.promoterLanguage.length === 0 && (
                              <span className="text-gray-400 text-sm self-center pl-1">
                                Select languages
                              </span>
                            )}
                            {form.promoterLanguage.map((lang) => (
                              <span
                                key={lang}
                                className="inline-flex items-center gap-1 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 text-xs font-medium"
                              >
                                {lang}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    set("promoterLanguage", form.promoterLanguage.filter((l) => l !== lang));
                                  }}
                                  className="hover:text-blue-900"
                                >
                                  <IoMdClose className="h-3 w-3" />
                                </button>
                              </span>
                            ))}

                            {/* Arrow icon */}
                            <svg
                              className={`ml-auto self-center w-4 h-4 text-gray-400 shrink-0 transition-transform ${langDropdownOpen ? "rotate-180" : ""}`}
                              viewBox="0 0 20 20" fill="currentColor"
                            >
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>


                          {langDropdownOpen && (
                            <div className="absolute z-50 w-full mt-1 max-h-40 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg">
                              {languages.map((lang) => {
                                const selected = form.promoterLanguage.includes(lang);
                                return (
                                  <label
                                    key={lang}
                                    className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-sm transition-colors
                  ${selected
                                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                                        : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                                      }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selected}
                                      onChange={() => {
                                        if (selected) {
                                          set("promoterLanguage", form.promoterLanguage.filter((l) => l !== lang));
                                        } else {
                                          set("promoterLanguage", [...form.promoterLanguage, lang]);
                                        }
                                      }}
                                      className="accent-blue-600 rounded"
                                    />
                                    {lang}
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
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

                    <div id="wrap-promoterFromDate">
                      <DatePicker
                        id="field-promoterFromDate"
                        label="Promoter From Date"
                        value={form.promoterFromDate}
                        minDate={form.fromDate || undefined}
                        maxDate={form.promoterToDate || form.toDate || undefined}
                        onChange={([date]) => {
                          if (!date) { set("promoterFromDate", ""); return; }
                          const y = date.getFullYear();
                          const m = String(date.getMonth() + 1).padStart(2, "0");
                          const d = String(date.getDate()).padStart(2, "0");
                          set("promoterFromDate", `${y}-${m}-${d}`);
                        }}
                        error={errors.promoterFromDate}
                        placeholder="Promoter From Date"
                        required
                      />
                    </div>

                    <div id="wrap-promoterToDate">
                      <DatePicker
                        id="field-promoterToDate"
                        label="Promoter To Date"
                        value={form.promoterToDate}
                        minDate={form.promoterFromDate || form.fromDate || undefined}
                        maxDate={form.toDate || undefined}
                        onChange={([date]) => {
                          if (!date) { set("promoterToDate", ""); return; }
                          const y = date.getFullYear();
                          const m = String(date.getMonth() + 1).padStart(2, "0");
                          const d = String(date.getDate()).padStart(2, "0");
                          set("promoterToDate", `${y}-${m}-${d}`);
                        }}
                        error={errors.promoterToDate}
                        placeholder="Promoter To Date"
                        required
                      />
                    </div>

                    {form.promoterFromDate && form.promoterToDate && new Date(form.promoterFromDate) <= new Date(form.promoterToDate) && (
                      <p className="text-xs text-blue-500 col-span-2">
                        {Math.ceil((new Date(form.promoterToDate).getTime() - new Date(form.promoterFromDate).getTime()) / 86400000) + 1} promoter day(s) (inclusive)
                      </p>
                    )}
                  </div>
                )}

              </div>
              {/* )} */}

          <section className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Location</p>
            <div className="grid grid-cols-2 gap-4">

              <div id="field-state">
                <FormField label="State" error={errors.state}>
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
                <FormField label="City" error={errors.city}>
                  <CitySelect
                    value={form.city}
                    options={cityOptions}
                    disabled={!form.state}
                    error={errors.city}
                    stateName={form.state}
                    onChange={(city) => set("city", city)}
                    onAddCity={(newCity) => {
                      setLocationData(prev => {
                        const existing = prev[form.state] || [];
                        if (existing.includes(newCity)) return prev;
                        return { ...prev, [form.state]: [...existing, newCity] };
                      });
                      setCityOptions(prev =>
                        prev.includes(newCity) ? prev : [...prev, newCity]
                      );
                      set("city", newCity);
                    }}
                  />
                </FormField>
              </div>


              <div id="field-campaignLocation">
                <FormField label="Campaign Location" error={errors.campaignLocation} required>
                  <input type="text" value={form.campaignLocation} onChange={(e) => set("campaignLocation", toTitleCase(e.target.value))} placeholder="Campaign location" className={inputClass(!!errors.campaignLocation)} />
                </FormField>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Campaign Media</p>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Campaign Images <span className="text-gray-400">(max 5MB)</span>
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
                    const invalid = files.find(f => validateFileSize(f));
                    if (invalid) {
                      toast.error(validateFileSize(invalid)!);
                      e.target.value = "";
                      return;
                    }
                    set("campaignImages", [...form.campaignImages, ...files].slice(0, 10) as any);
                    e.target.value = "";
                  }}
                />
              </label>
              {(form.existingImages || []).length > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400">Existing images</p>
                  <div className="grid grid-cols-6 gap-1.5">
                    {(form.existingImages || []).map((url: string, idx: number) => (
                      <div key={idx} className="relative group rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100"
                        style={{ width: "60px", height: "60px" }}>
                        <img src={url.startsWith("http") ? url : `http://localhost:3001${url}`} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => set("existingImages", (form.existingImages || []).filter((_: any, i: number) => i !== idx) as any)}
                          className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <IoMdClose className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                Campaign Videos <span className="text-gray-400">(max 50MB)</span>
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
                    const invalid = files.find(f => validateFileSize(f));
                    if (invalid) {
                      toast.error(validateFileSize(invalid)!);
                      e.target.value = "";
                      return;
                    }
                    set("campaignVideos", [...form.campaignVideos, ...files].slice(0, 5) as any);
                    e.target.value = "";
                  }}
                />
              </label>
              {(form.existingVideos || []).length > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400">Existing videos</p>
                  <div className="space-y-2">
                    {(form.existingVideos || []).map((url: string, idx: number) => (
                      <div key={idx} className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.882v6.236a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-300 truncate">
                            {url.split("/").pop()}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => set("existingVideos", (form.existingVideos || []).filter((_: any, i: number) => i !== idx) as any)}
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                        >
                          <HiOutlineTrash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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


          {addCityModalOpen && (
            <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/40 rounded-2xl">
              <div className="w-80 rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 shadow-xl p-5 space-y-4">

                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-white">
                    Add City to {form.state}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setAddCityModalOpen(false)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                  >
                    <IoMdClose className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    City Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCityName}
                    onChange={(e) => { setNewCityName(e.target.value); setAddCityError(""); }}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddCity(); }}
                    placeholder="e.g. Coimbatore"
                    className={inputClass(!!addCityError)}
                    autoFocus
                  />
                  {addCityError && (
                    <p className="text-xs text-red-500">{addCityError}</p>
                  )}
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setAddCityModalOpen(false)}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddCity}
                    disabled={addCityLoading}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
                  >
                    {addCityLoading ? "Adding..." : "Add City"}
                  </button>
                </div>

              </div>
            </div>
          )}

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


                const hasRto = p.rtoCost > 0;
                const hasBranding = (p as any).brandingCost > 0;

                const lastRow = hasExtraHours
                  ? "extraHours"
                  : hasExtraKm
                    ? "extraKm"
                    : hasBranding
                      ? "branding"
                      : hasRto
                        ? "rto"
                        : hasPromoter
                          ? "promoter"
                          : "rental";

                const makeCharge = (): AdditionalCharge => ({
                  id: uid(), label: "", mode: "+",
                  amount: 0, reduceType: "amount", discountPercent: 0
                });

                return (
                  <>

                    <SummaryRow
                      label={`Rental (${p.totalDays}D × ${formatINR(selectedPackage.perDayRentalCost)} × Qty ${form.quantity})`}
                      val={p.rentalCost}
                      isLast={lastRow === "rental"}
                      hasCharges={form.additionalCharges.length > 0}
                      onAdd={() => set("additionalCharges", [...form.additionalCharges, makeCharge()])}
                    />
                    {hasPromoter && (
                      <SummaryRow
                        // label={`Promoter (${p.totalDays}D × ${formatINR(selectedPackage.promoterChargePerDay)} × ${form.promoterQuantity} Promoter)`}
                        label={`Promoter (${(p as any).promoterDays ?? p.totalDays}D × ${formatINR(p.promoterChargePerDay)} × ${form.promoterQuantity} Promoter)`}
                        val={p.promoterCost}
                        isLast={lastRow === "promoter"}
                        hasCharges={form.additionalCharges.length > 0}
                        onAdd={() => set("additionalCharges", [...form.additionalCharges, makeCharge()])}
                      />
                    )}
                    {hasRto && (
                      <SummaryRow
                        label="RTO Charges"
                        val={p.rtoCost}
                        isLast={lastRow === "rto"}
                        hasCharges={form.additionalCharges.length > 0}
                        onAdd={() => set("additionalCharges", [...form.additionalCharges, makeCharge()])}
                      />
                    )}
                    {hasBranding && (
                      <SummaryRow
                        label="Branding Cost"
                        val={(p as any).brandingCost}
                        isLast={lastRow === "branding"}
                        hasCharges={form.additionalCharges.length > 0}
                        onAdd={() => set("additionalCharges", [...form.additionalCharges, makeCharge()])}
                      />
                    )}
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
                    onChange={(e) => updateCharge(charge.id, { label: toTitleCase(e.target.value) })}
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

