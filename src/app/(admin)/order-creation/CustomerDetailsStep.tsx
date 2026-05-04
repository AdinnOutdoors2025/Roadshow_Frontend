"use client";

import React, { useState } from "react";
import { CustomerFormData } from "./AdminOrderForm";
import FormField, { inputClass } from "../../../components/reusableFormField";

interface Props {
  data: CustomerFormData;
  onChange: (d: Partial<CustomerFormData>) => void;
  onNext: () => void;
}

export default function CustomerDetailsStep({ data, onChange, onNext }: Props) {
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerFormData, string>>>({});

  const validate = () => {
    const e: Partial<Record<keyof CustomerFormData, string>> = {};
    if (!data.name.trim()) e.name = "Customer name is required";
    if (!data.phone.trim()) e.phone = "Phone number is required";
    else if (!/^[6-9]\d{9}$/.test(data.phone.trim())) e.phone = "Enter a valid 10-digit mobile number";
    if (!data.address.trim()) e.address = "Address is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const set = (field: keyof CustomerFormData, val: string) => {
    onChange({ [field]: val });
    setErrors((p) => ({ ...p, [field]: undefined }));
  };

  return (
    <div className="space-y-5">
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Stage 1 · Customer Basic Details</h3>
    
      </div>

      <FormField label="Customer Name" error={errors.name} required>
        <input type="text" value={data.name} onChange={(e) => set("name", e.target.value)} placeholder="Enter full name" className={inputClass(!!errors.name)} />
      </FormField>

      <FormField label="Phone Number" error={errors.phone} required>
        <input type="tel" value={data.phone} onChange={(e) => set("phone", e.target.value)} placeholder="e.g. 9876543210" className={inputClass(!!errors.phone)} />
      </FormField>

      <FormField label="Address" error={errors.address} required>
        <textarea value={data.address} onChange={(e) => set("address", e.target.value)} placeholder="Enter full address" rows={3} className={inputClass(!!errors.address) + " resize-none"} />
      </FormField>

      <FormField label="Email (Optional)">
        <input type="email" value={data.email || ""} onChange={(e) => set("email", e.target.value)} placeholder="customer@example.com" className={inputClass(false)} />
      </FormField>

      <div className="flex justify-end pt-2">
        <button onClick={() => { if (validate()) onNext(); }} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
          Next
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}
