
"use client";

import React, { useState, useRef } from "react";

import { CustomerFormData, CustomerSelection, GstDetail } from "./AdminOrderForm";
import FormField, { inputClass } from "../../../components/reusableFormField";
import { HiOutlineUser, HiOutlineOfficeBuilding } from "react-icons/hi";
import { designations } from "../../utils/collection.json";
import API_BASE from "../../../../baseurl";
import GstVerifyPanel from "../../../components/gst/GstVerifyPanel";
import { GstBusiness, normalizeGst } from "../../../lib/gst";

const toTitleCase = (str: string) => str.replace(/\b\w/g, (c) => c.toUpperCase());
const capitalizeFirstOnly = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

interface Props {
  data: CustomerFormData;
  customerSelection: CustomerSelection;
  onChange: (d: Partial<CustomerFormData>) => void;
  onCustomerChange: (d: Partial<CustomerSelection>) => void;
  onNext: () => void;
  customerCategory: "individual" | "organization";
  onCategoryChange: (cat: "individual" | "organization") => void;
  gstDetails: GstDetail[];
  gstVerified: boolean;
  onGstVerified: (detail: GstDetail) => void;
  onGstVerifiedChange: (val: boolean) => void;
  onGstDetailsReset: () => void;
  selectedClientOrder: any | null;
  onSelectClientOrder: (co: any | null) => void;
  editingOrder?:any
}



type FormErrors = Partial<
  Record<
    | keyof CustomerFormData
    | "companyName"
    | "clientName"
    | "designation"
    | "gstNumber"
    | "panNumber",
    string
  >
>;

export default function CustomerDetailsStep({
  data,
  customerSelection,
  onChange,
  onCustomerChange,
  onNext,
  customerCategory,
  onCategoryChange,
  gstDetails,
  gstVerified,
  onGstVerifiedChange,
  onGstVerified,
  onGstDetailsReset,
  selectedClientOrder,
  onSelectClientOrder,
  editingOrder

}: Props) {
  const [errors, setErrors] = useState<FormErrors>({});
  const [globalError, setGlobalError] = useState("");
  const [, setGstStatus] = useState<"idle" | "success" | "error">("idle");
  const [, setGstMessage] = useState("");
  const [clientOrders, setClientOrders] = useState<any[]>([]);


  React.useEffect(() => {
    fetch(`${API_BASE}client-requests`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data)) {
          setClientOrders(d.data.filter((c: any) => c.status === 0 || c.status === 1));
        }
      })
      .catch(() => { });
  }, []);

  // const handleClientOrderSelect = (id: string) => {
  //   if (!id) {
  //     onSelectClientOrder(null);
  //     return;
  //   }
  //   const co = clientOrders.find((c) => c._id === id);
  //   if (!co) return;
  //   onSelectClientOrder(co);
  //   onCategoryChange("individual");
  //   onChange({ name: co.name, email: co.email, phone: co.phone });
  //   setErrors({});
  // };


  const handleClientOrderSelect = (id: string) => {
    if (!id) {
      onSelectClientOrder(null);
      onCategoryChange("individual");
      onChange({
        name: "",
        phone: "",
        email: "",
        address: "",
        companyName: "",
        clientName: "",
        designation: "",
        gstNumber: "",
        panNumber: "",
      });
      onGstDetailsReset();
      onGstVerifiedChange(true);
      setGstStatus("idle");
      setGstMessage("");
      setErrors({});
      return;
    }
    const co = clientOrders.find((c) => c._id === id);
    if (!co) return;
    onSelectClientOrder(co);
    if (customerCategory === "organization") {
      onChange({ clientName: co.name, email: co.email, phone: co.phone });
    } else {
      onChange({ name: co.name, email: co.email, phone: co.phone });
    }
    setErrors({});
  };

  /**
   * The already-verified record for the GST number currently in the form.
   * Rendering this straight from `gstDetails` means an order that arrived
   * pre-verified (agency booking, or an order being edited) shows the green
   * card immediately instead of asking the admin to verify again.
   */
  const verifiedBusiness: GstBusiness | null = React.useMemo(() => {
    const current = normalizeGst(data.gstNumber || "");
    if (!current) return null;

    const match = (gstDetails || []).find(
      (g) => normalizeGst(g.gst_number) === current
    );
    return (match as GstBusiness) || null;
  }, [data.gstNumber, gstDetails]);

  /** Verification succeeded — auto-fill everything the admin would have typed. */
  const handlePanelVerified = (business: GstBusiness) => {
    onChange({
      companyName: business.business_name,
      panNumber: business.business_pan || "",
      address: business.business_address || "",
    });

    setErrors((p) => ({
      ...p,
      gstNumber: undefined,
      panNumber: undefined,
      address: undefined,
    }));

    onGstVerified(business);

    setGstStatus("success");
    setGstMessage("GST verified successfully");
    onGstVerifiedChange(true);
  };

  const set = (field: keyof CustomerFormData, val: string) => {
    onChange({ [field]: val });
    setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const handlePhoneChange = (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 10);
    onChange({ phone: cleaned });
    setErrors((p) => ({ ...p, phone: undefined }));
  };


  // const handleCategorySwitch = (cat: "individual" | "organization") => {
  //   if (cat === customerCategory) return;
  //   onCategoryChange(cat);
  //   setErrors({});
  //   setGlobalError("");
  //   setGstStatus("idle");
  //   setGstMessage("");
  //   onGstVerifiedChange(true);
  //   onCustomerChange({ customer: null, type: "" });
  // };


  const handleCategorySwitch = (cat: "individual" | "organization") => {
    if (cat === customerCategory) return;
    onCategoryChange(cat);
    setErrors({});
    setGlobalError("");
    setGstStatus("idle");
    setGstMessage("");
    onGstVerifiedChange(true);
    onCustomerChange({ customer: null, type: "" });

    if (selectedClientOrder) {
      if (cat === "organization") {
        onChange({
          clientName: selectedClientOrder.name,
          email: selectedClientOrder.email,
          phone: selectedClientOrder.phone,
        });
      } else {
        onChange({
          name: selectedClientOrder.name,
          email: selectedClientOrder.email,
          phone: selectedClientOrder.phone,
        });
      }
    }
  };


  const validateIndividual = (): boolean => {
    const e: FormErrors = {};
    if (!data.name?.trim()) e.name = "Customer name is required";
    if (!data.phone?.trim()) e.phone = "Phone number is required";
    else if (!/^[6-9]\d{9}$/.test(data.phone.trim()))
      e.phone = "Enter a valid 10-digit mobile number";
    if (!data.email?.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()))
      e.email = "Enter a valid email address";
    // if (!data.address?.trim()) e.address = "Address is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };






  const validateOrganization = (): boolean => {
    const e: FormErrors = {};
    if (!data.companyName?.trim()) e.companyName = "Company name is required";
    if (!data.clientName?.trim()) e.clientName = "Client name is required";
    if (!data.phone?.trim()) e.phone = "Phone number is required";
    else if (!/^[6-9]\d{9}$/.test(data.phone.trim()))
      e.phone = "Enter a valid 10-digit mobile number";
    if (!data.email?.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()))
      e.email = "Enter a valid email address";
    if (!data.gstNumber?.trim()) e.gstNumber = "GST number is required";
    else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(data.gstNumber.trim()))
      e.gstNumber = "Enter a valid GST number (e.g. 22AAAAA0000A1Z5)";
    else if (!gstVerified) e.gstNumber = "Please verify the GST number";
    if (!data.panNumber?.trim()) e.panNumber = "PAN number will be auto-filled after GST verification";
    setErrors(e);
    return Object.keys(e).length === 0;
  };





  const handleNext = () => {
    setGlobalError("");
    const valid =
      customerCategory === "individual"
        ? validateIndividual()
        : validateOrganization();
    if (!valid) return;

    let customerPayload;

    if (selectedClientOrder) {
      // Use client order data
      customerPayload = {
        name: selectedClientOrder.name,
        phone: selectedClientOrder.phone,
        email: selectedClientOrder.email,
        address: data.address || "",
      };
    } else {
      customerPayload = customerCategory === "individual"
        ? {
          name: data.name,
          phone: data.phone,
          email: data.email,
          address: data.address,
        }
        : {
          name: data.clientName,
          phone: data.phone,
          email: data.email,
        };
    }

    onCustomerChange({
      customer: { ...customerPayload } as any,
      type: "existing",
    });

    onNext();
  };

  return (
    <div className="space-y-5">
  {/* {!editingOrder && 
      <div>
      
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Client Order Request <span className="text-gray-400 font-normal"></span>
        </label>
        
        <select
          value={selectedClientOrder?._id || ""}
          onChange={(e) => handleClientOrderSelect(e.target.value)}
          className={inputClass(false)}
        >
          <option value="">-- Select Client Order --</option>
          {clientOrders.map((co) => (
            <option key={co._id} value={co._id}>
              {co.clientOrderId} — {co.name}
            </option>
          ))}
        </select>
        {selectedClientOrder && (
          <p className="mt-1.5 text-xs text-blue-600">
            Client Order selected 
          </p>
        )}
      </div>
      } */}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Select Customer Type <span className="text-red-500">*</span>
        </label>

        <div className="grid grid-cols-2 gap-3">
          {(["individual", "organization"] as const).map((cat) => {
            const isActive = customerCategory === cat;
            const Icon =
              cat === "individual" ? HiOutlineUser : HiOutlineOfficeBuilding;

            return (
              <button
                key={cat}
                type="button"
                // disabled={!!selectedClientOrder}
                onClick={() => handleCategorySwitch(cat)}
                className={`rounded-xl border-2 px-4 py-4 text-sm font-medium transition-all text-left
                
                  ${isActive
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                  }`}
              >
                <div
                  className={`h-3.5 w-3.5 rounded-full border-2 mb-2 transition-all ${isActive ? "border-blue-500 bg-blue-500" : "border-gray-300"
                    }`}
                />
                <div className="flex items-center gap-1.5">
                  <Icon className="h-4 w-4" />
                  <p className="font-semibold">
                    {cat === "individual" ? "Individual" : "Organization"}
                  </p>
                </div>
                <p className="text-xs mt-1 opacity-70">
                  {cat === "individual"
                    ? "Personal customer account"
                    : "Company or business account"}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Individual Fields ── */}
      {/* {customerCategory === "individual" && (
        <div className={`space-y-4`} >
          <FormField label="Customer Name" error={errors.name} required>
            <input
              type="text"
              value={data.name || ""}
              onChange={(e) => {
                const lettersOnly = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                set("name", lettersOnly);
              }}
              placeholder="Enter full name"
              className={inputClass(!!errors.name)}
            />
          </FormField>

          <FormField label="Email" error={errors.email} required>
            <input
              type="email"
              value={data.email || ""}
              onChange={(e) => set("email", e.target.value)}
              placeholder="customer@example.com"
              className={inputClass(!!errors.email)}
            />
          </FormField>



          <FormField label="Phone Number" error={errors.phone} required>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
                +91
              </span>
              <input
                type="tel"
                value={data.phone || ""}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="e.g. 9876543210"
                className={inputClass(!!errors.phone) + " rounded-l-none"}
              />
            </div>
          </FormField>

          <FormField label="Address" error={errors.address}>
            <textarea
              value={data.address || ""}
              onChange={(e) => set("address", e.target.value)}
              placeholder="Enter full address"
              rows={3}
              className={inputClass(!!errors.address) + " resize-none"}
            />
          </FormField>
        </div>
      )} */}

      {customerCategory === "individual" && (
        <div className={`space-y-4`} >
          <FormField
            label="Customer Name"
            error={errors.name}
          // required={!selectedClientOrder} 
          >
            <input
              type="text"
              value={data.name || ""}
              onChange={(e) => {
                const lettersOnly = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                set("name", toTitleCase(lettersOnly));
              }}
              placeholder="Enter full name"
              className={inputClass(!!errors.name)}
            // disabled={!!selectedClientOrder}
            />
          </FormField>

          <FormField
            label="Email"
            error={errors.email}
          // required={!selectedClientOrder}
          >
            <input
              type="email"
              value={data.email || ""}
              onChange={(e) => set("email", capitalizeFirstOnly(e.target.value))}
              placeholder="customer@example.com"
              className={inputClass(!!errors.email)}
            // disabled={!!selectedClientOrder}
            />
          </FormField>

          <FormField
            label="Phone Number"
            error={errors.phone}
          // required={!selectedClientOrder}
          >
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
                +91
              </span>
              <input
                type="tel"
                value={data.phone || ""}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="e.g. 9876543210"
                className={inputClass(!!errors.phone) + " rounded-l-none"}
              // disabled={!!selectedClientOrder}
              />
            </div>
          </FormField>

          <FormField label="Address" error={errors.address} required={false}>
            <textarea
              value={data.address || ""}
              onChange={(e) => set("address", toTitleCase(e.target.value))}
              placeholder="Enter full address"
              rows={3}
              className={inputClass(!!errors.address) + " resize-none"}
            // disabled={!!selectedClientOrder}
            />
          </FormField>
        </div>
      )}




      {customerCategory === "organization" && (
        <div className="space-y-4">

          {/* Shared panel — same component the public agency signup uses, so a
              GST already verified there is restored from cache without a
              second API call and the admin just clicks Next. */}
          <GstVerifyPanel
            value={data.gstNumber || ""}
            business={verifiedBusiness}
            onChange={(gst) => {
              set("gstNumber", gst);
              setGstMessage("");
            }}
            onVerified={handlePanelVerified}
            onCleared={() => {
              set("panNumber", "");
              setGstStatus("idle");
              setGstMessage("");
              onGstVerifiedChange(false);
              onGstDetailsReset();
            }}
            helperText="Company name, PAN and address are filled in automatically."
          />

          {errors.gstNumber && (
            <p className="-mt-1 text-xs text-red-500">{errors.gstNumber}</p>
          )}

          <FormField label="PAN Number" error={errors.panNumber} required>
            <input
              type="text"
              value={data.panNumber || ""}
              readOnly
              placeholder="Auto-filled after GST verification"
              className={inputClass(!!errors.panNumber) + " bg-gray-50 dark:bg-gray-800 cursor-not-allowed"}
            />
          </FormField>

        


          <FormField label="Company Name" error={errors.companyName} required>
            <input
              type="text"
              value={data.companyName || ""}
              onChange={(e) => set("companyName", toTitleCase(e.target.value))}
              placeholder="Company Name"
              className={inputClass(!!errors.companyName)}
            />
          </FormField>

          <FormField label="Client Name" error={errors.clientName} required>
            <input
              type="text"
              value={data.clientName || ""}
              onChange={(e) => {
                const lettersOnly = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                set("clientName", toTitleCase(lettersOnly));
              }}
              placeholder="Enter client name"
              className={inputClass(!!errors.clientName)}
            />
          </FormField>

          <FormField label="Designation" error={errors.designation}>
            <select
              value={data.designation || ""}
              onChange={(e) => set("designation", e.target.value)}
              className={inputClass(!!errors.designation)}
            >
              <option value="">Select designation</option>
              {designations.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </FormField>



          <FormField label="Phone Number" error={errors.phone} required>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
                +91
              </span>
              <input
                type="tel"
                value={data.phone || ""}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="e.g. 9876543210"
                className={inputClass(!!errors.phone) + " rounded-l-none"}
              />
            </div>
          </FormField>

          <FormField label="Email" error={errors.email} required>
            <input
              type="email"
              value={data.email || ""}
              onChange={(e) => set("email", capitalizeFirstOnly(e.target.value))}
              placeholder="company@example.com"
              className={inputClass(!!errors.email)}
            />
          </FormField>

           <FormField label="Address" error={errors.address} required={false}>
            <textarea
              value={data.address || ""}
              onChange={(e) => set("address", toTitleCase(e.target.value))}
              placeholder="Enter full address"
              rows={3}
              className={inputClass(!!errors.address) + " resize-none"}
            />
          </FormField>

        </div>
      )}

       
      {globalError && (
        <p className="text-xs text-red-500">{globalError}</p>
      )}

      {/* ── Next Button ── */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleNext}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Next
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
