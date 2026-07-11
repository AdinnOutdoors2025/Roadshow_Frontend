
"use client";

import React, { useState, useRef } from "react";

import { CustomerFormData, CustomerSelection, GstDetail } from "./AdminOrderForm";
import FormField, { inputClass } from "../../../components/reusableFormField";
import { HiOutlineUser, HiOutlineOfficeBuilding } from "react-icons/hi";
import { designations } from "../../utils/collection.json";
import API_BASE from "../../../../baseurl";

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
}



type FormErrors = Partial<
  Record<
    | keyof CustomerFormData
    | "companyName"
    | "clientName"
    | "designation"
    | "gstNumber",
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

}: Props) {
  const [errors, setErrors] = useState<FormErrors>({});
  const [globalError, setGlobalError] = useState("");
  const [gstVerifying, setGstVerifying] = useState(false);
  const [gstStatus, setGstStatus] = useState<"idle" | "success" | "error">("idle");
  const [gstMessage, setGstMessage] = useState("");
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

  const handleGstVerify = async () => {
    const gst = data.gstNumber?.trim();
    if (!gst) {
      setErrors((p) => ({ ...p, gstNumber: "GST number required to verify" }));
      return;
    }
    if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst)) {
      setErrors((p) => ({ ...p, gstNumber: "Enter a valid GST number first" }));
      return;
    }

    setGstVerifying(true);
    setGstStatus("idle");
    setGstMessage("");

    try {
      const res = await fetch(`${API_BASE}gstdetails/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gst_number: gst }),
      });
      const data2 = await res.json();

      if (!res.ok) throw new Error(data2.message || "Verification failed");

      // Company name auto-fill
      onChange({ companyName: data2.data.business_name });

      onGstVerified({
        gstDetailId: data2.data.gstDetailId,
        gst_number: data2.data.gst_number,
        business_name: data2.data.business_name,
      });

      setGstStatus("success");
      setGstMessage("GST verified successfully");
      onGstVerifiedChange(true);
    } catch (err: any) {
      setGstStatus("error");
      setGstMessage(err.message || "GST verification failed");
      onGstVerifiedChange(false);
    } finally {
      setGstVerifying(false);
    }
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
    if (!data.designation?.trim()) e.designation = "Designation is required";
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

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Client Order Request <span className="text-gray-400 font-normal">(Optional)</span>
        </label>
        <select
          value={selectedClientOrder?._id || ""}
          onChange={(e) => handleClientOrderSelect(e.target.value)}
          className={inputClass(false)}
        >
          <option value="">-- Select Client Order --</option>
          {clientOrders.map((co) => (
            <option key={co._id} value={co._id}>
              {co.clientOrderId}
            </option>
          ))}
        </select>
        {selectedClientOrder && (
          <p className="mt-1.5 text-xs text-blue-600">
            Client Order selected — Customer Type locked to Individual
          </p>
        )}
      </div>

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
                set("name", lettersOnly);
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
              onChange={(e) => set("email", e.target.value)}
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
              onChange={(e) => set("address", e.target.value)}
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

          <FormField label="GST Number" error={errors.gstNumber} required>
            <div className="flex gap-2">
              <input
                type="text"
                value={data.gstNumber || ""}
                onChange={(e) => {
                  set("gstNumber", e.target.value.toUpperCase());
                  setGstStatus("idle");
                  setGstMessage("");
                  onGstVerifiedChange(false);
                  onGstDetailsReset();

                }}
                placeholder="e.g. 22AAAAA0000A1Z5"
                maxLength={15}
                className={inputClass(!!errors.gstNumber) + " flex-1"}
              />
              <button
                type="button"
                onClick={handleGstVerify}
                disabled={gstVerifying}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {gstVerifying ? (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : null}
                {gstVerifying ? "Verifying..." : "Verify"}
              </button>
            </div>


            {gstStatus === "success" && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-green-600">
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {gstMessage}
              </p>
            )}
            {gstStatus === "error" && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {gstMessage}
              </p>
            )}
          </FormField>


          <FormField label="Company Name" error={errors.companyName} required>
            <input
              type="text"
              value={data.companyName || ""}
              onChange={(e) => set("companyName", e.target.value)}
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
                set("clientName", lettersOnly);
              }}
              placeholder="Enter client name"
              className={inputClass(!!errors.clientName)}
            />
          </FormField>

          <FormField label="Designation" error={errors.designation} required>
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
              onChange={(e) => set("email", e.target.value)}
              placeholder="company@example.com"
              className={inputClass(!!errors.email)}
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
