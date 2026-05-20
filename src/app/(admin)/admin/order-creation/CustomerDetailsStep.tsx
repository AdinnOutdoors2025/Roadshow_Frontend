
"use client";

import React, { useState } from "react";
import { CustomerFormData, CustomerSelection } from "./AdminOrderForm";
import FormField, { inputClass } from "../../../../components/reusableFormField";
import { HiOutlineUser, HiOutlineOfficeBuilding } from "react-icons/hi";
import { designations } from "../../../../utils/collection.json";



interface Props {
  data: CustomerFormData;
  customerSelection: CustomerSelection;
  onChange: (d: Partial<CustomerFormData>) => void;
  onCustomerChange: (d: Partial<CustomerSelection>) => void;
  onNext: () => void;
  customerCategory: "individual" | "organization";
  onCategoryChange: (cat: "individual" | "organization") => void;
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
}: Props) {
  const [errors, setErrors] = useState<FormErrors>({});
  const [globalError, setGlobalError] = useState("");


  const set = (field: keyof CustomerFormData, val: string) => {
    onChange({ [field]: val });
    setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const handlePhoneChange = (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 10);
    onChange({ phone: cleaned });
    setErrors((p) => ({ ...p, phone: undefined }));
  };

  const handleCategorySwitch = (cat: "individual" | "organization") => {

     if (cat === customerCategory) return;
    onCategoryChange(cat);
    setErrors({});
    setGlobalError("");
    onChange({
      name: "",
      phone: "",
      address: "",
      email: "",
      companyName: "",
      clientName: "",
      designation: "",
      gstNumber: "",
    });
    onCustomerChange({ customer: null, type: "" });
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
    else if (
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
        data.gstNumber.trim()
      )
    )
      e.gstNumber = "Enter a valid GST number (e.g. 22AAAAA0000A1Z5)";
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

    const customerPayload =
      customerCategory === "individual"
        ? {
            name: data.name,
            phone: data.phone,
            address: data.address,
            email: data.email,
          }
        : {
            name: data.clientName,
            phone: data.phone,
            email: data.email,
          };

    onCustomerChange({
      customer: { ...customerPayload } as any,
      type: "existing",
    });

    onNext();
  };

  return (
    <div className="space-y-5">

      {/* ── Individual / Organization Card Buttons ── */}
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
                onClick={() => handleCategorySwitch(cat)}
                className={`rounded-xl border-2 px-4 py-4 text-sm font-medium transition-all text-left
                  ${
                    isActive
                      ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                  }`}
              >
                <div
                  className={`h-3.5 w-3.5 rounded-full border-2 mb-2 transition-all ${
                    isActive ? "border-blue-500 bg-blue-500" : "border-gray-300"
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
      {customerCategory === "individual" && (
        <div className="space-y-4">
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
            <input
              type="tel"
              value={data.phone || ""}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="e.g. 9876543210"
              className={inputClass(!!errors.phone)}
            />
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
      )}

      {/* ── Organization Fields ── */}
      {customerCategory === "organization" && (
        <div className="space-y-4">
          <FormField label="Company Name" error={errors.companyName} required>
            <input
              type="text"
              value={data.companyName || ""}
              onChange={(e) => set("companyName", e.target.value)}
              placeholder="Enter company name"
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
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Phone Number" error={errors.phone} required>
            <input
              type="tel"
              value={data.phone || ""}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="e.g. 9876543210"
              className={inputClass(!!errors.phone)}
            />
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

          <FormField label="GST Number" error={errors.gstNumber} required>
            <input
              type="text"
              value={data.gstNumber || ""}
              onChange={(e) => set("gstNumber", e.target.value.toUpperCase())}
              placeholder="e.g. 22AAAAA0000A1Z5"
              maxLength={15}
              className={inputClass(!!errors.gstNumber)}
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
