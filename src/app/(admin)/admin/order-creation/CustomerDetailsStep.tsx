
"use client";

import React, { useState, useRef } from "react";
import { CustomerFormData, CustomerSelection } from "./AdminOrderForm";
import FormField, { inputClass } from "../../../../components/reusableFormField";
import { Customer, createCustomer, searchCustomers } from "../../../../utils/Adminorderapi";

interface Props {
  data: CustomerFormData;
  customerSelection: CustomerSelection
  onChange: (d: Partial<CustomerFormData>) => void;
  onCustomerChange: (d: Partial<CustomerSelection>) => void;
  onNext: () => void;

}

type PhoneStatus = "idle" | "checking" | "found" | "not_found" | "creating" | "created" | "error";

export default function CustomerDetailsStep({ data, customerSelection, onChange, onCustomerChange, onNext }: Props) {
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerFormData | "email", string>>>({});
  const [phoneStatus, setPhoneStatus] = useState<PhoneStatus>("idle");
  const [phoneError, setPhoneError] = useState("");
  const [globalError, setGlobalError] = useState("");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const selectedType = customerSelection.type;

console.log("customerSelection",customerSelection)
  const selectType = (t: "existing" | "new") => {
    onCustomerChange({ type: t, customer: null });
    setErrors({});
    setGlobalError("");
    setPhoneError("");
    setPhoneStatus("idle");
  };

  const handlePhoneChange = (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 10);
    onChange({ phone: cleaned });
    setErrors((p) => ({ ...p, phone: undefined }));
  };

  const set = (field: keyof CustomerFormData, val: string) => {
    onChange({ [field]: val });
    setErrors((p) => ({ ...p, [field]: undefined }));
  };




  const validateFields = () => {
    const e: Partial<Record<keyof CustomerFormData, string>> = {};
    if (!data.phone.trim()) e.phone = "Phone number is required";
    else if (!/^[6-9]\d{9}$/.test(data.phone.trim())) e.phone = "Enter a valid 10-digit mobile number";
    if (!data.name.trim()) e.name = "Customer name is required";
    if (!data.address.trim()) e.address = "Address is required";


    // if (data.email && data.email.trim()) {
    //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //   if (!emailRegex.test(data.email.trim())) {
    //     e.email = "Please enter a valid email address";
    //   }
    // }

    if (!data.email || !data.email.trim()) {
      e.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email.trim())) {
        e.email = "Please enter a valid email address";
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = async () => {
    setGlobalError("");


    if (!validateFields()) return;


    if (!selectedType) {
      setGlobalError("Please select 'Existing Customer' or 'New Customer' at the bottom.");
      return;
    }

    if (customerSelection.customer) {
      onNext();
      return;
    }


    if (selectedType === "existing") {

      const existCustomer = {

        name: data.name,
        phone: data.phone,
        address: data.address,
        email: data.email || "",
      };
      onCustomerChange({
        customer: { ...existCustomer, customerType: 0 } as any,
        type: "existing"
      });
      onNext();
      return;
    }


    if (selectedType === "new") {
      try {
        setPhoneStatus("creating");
        const { customer, alreadyExists } = await createCustomer({
          name: data.name,
          phone: data.phone,
          address: data.address,
          email: data.email,
        });

        if (alreadyExists) {
        
          onCustomerChange({ customer: { ...customer, customerType: 0 } as any, type: "existing" });
          setPhoneStatus("found");
        } else {
          onCustomerChange({ customer: { ...customer, customerType: 1 } as any, type: "new" });
          setPhoneStatus("created");
        }
        onNext();
      } catch (e: any) {
        setPhoneStatus("error");
        setGlobalError(e.message || "Failed to create customer");
      }
      return;
    }

    onNext();
  };

  return (
    <div className="space-y-5">



      <div className="space-y-4">

        <FormField label="Customer Name" error={errors.name} required>
          <input
            type="text"
            value={data.name}
            onChange={(e) => {
              const lettersOnly = e.target.value.replace(/[^a-zA-Z\s]/g, "");
              set("name", lettersOnly);
            }}
            placeholder="Enter full name"
            className={inputClass(!!errors.name)}
          />
        </FormField>

        <FormField label="Phone Number" error={errors.phone} required>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="e.g. 9876543210"
            className={inputClass(!!errors.phone)}
          />
        </FormField>

        <FormField label="Address" error={errors.address} required>
          <textarea
            value={data.address}
            onChange={(e) => set("address", e.target.value)}
            placeholder="Enter full address"
            rows={3}
            className={inputClass(!!errors.address) + " resize-none"}
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
      </div>


      <div className="border-t border-gray-200 dark:border-gray-700 pt-5 mt-5">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Select Customer Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(["existing", "new"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => selectType(t)}
              className={`rounded-xl border-2 px-4 py-4 text-sm font-medium transition-all text-left
                ${selectedType === t
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                }`}
            >
              <div className={`h-3.5 w-3.5 rounded-full border-2 mb-2 transition-all ${selectedType === t ? "border-blue-500 bg-blue-500" : "border-gray-300"}`} />
              <p className="font-semibold">{t === "existing" ? "Existing Customer" : "New Customer"}</p>
              <p className="text-xs mt-1 opacity-70">
                {t === "existing" ? "Phone number already registered" : "Create new customer account"}
              </p>
            </button>
          ))}
        </div>
        {!selectedType && globalError === "Please select 'Existing Customer' or 'New Customer' at the bottom." && (
          <p className="mt-2 text-xs text-red-500">{globalError}</p>
        )}
      </div>


      {phoneStatus === "checking" && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
          Checking phone number...
        </div>
      )}

      {phoneStatus === "found" && customerSelection.customer && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2 dark:bg-green-900/20 dark:border-green-800">
          <svg className="h-4 w-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-xs font-medium text-green-700 dark:text-green-400">
              Existing customer found:{" "}
              <span className="font-bold">{customerSelection.customer.name}</span>
            </p>
            <p className="text-[10px] text-green-600 dark:text-green-500">
              ID: {customerSelection.customer._id?.slice(-8)}
            </p>
          </div>
        </div>
      )}

      {phoneStatus === "created" && customerSelection.customer && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2 dark:bg-green-900/20 dark:border-green-800">
          <svg className="h-4 w-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs font-medium text-green-700 dark:text-green-400">
            Customer created! ID:{" "}
            <span className="font-mono">{customerSelection.customer._id?.slice(-8)}</span>
          </p>
        </div>
      )}

      {phoneStatus === "error" && phoneError && !globalError && (
        <p className="text-xs text-red-500">{phoneError}</p>
      )}


      {globalError && globalError !== "Please select 'Existing Customer' or 'New Customer' at the bottom." && (
        <p className="text-xs text-red-500">{globalError}</p>
      )}


      <div className="flex justify-end pt-2">
        <button
          onClick={handleNext}
          disabled={phoneStatus === "checking" || phoneStatus === "creating"}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          {(phoneStatus === "checking" || phoneStatus === "creating") && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          )}
          Next
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}