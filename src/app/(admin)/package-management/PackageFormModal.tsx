"use client";

import React, { useEffect, useState } from "react";
import { Package } from "./page";
import { IoMdClose } from "react-icons/io";
import API_BASE from '../../../../baseurl';
import { inputClass, selectClass} from "./../../../components/reusableFormField";
import FormField from "../../../components/reusableFormField";

const VEHICLE_TYPES = ["Customizable Vehicle", "Non-Customizable Vehicle"];
const VEHICLE_MODELS = ["LED Van", "LED Truck", "Mini Promotion Vehicle", "Campaign Bus"];

interface Props {
  editingPackage: Package | null;
  onSuccess: () => void;
  onClose: () => void;
}



const defaultForm: Package = {
  vehicleType: "",
  vehicleModel: "",
  perDayRentalCost: 0,
  dailyKmLimit: 0,
  additionalHourCharges: 0,
  endUserCustomizationPermission: true,
  promoterAvailable: false,
  promoterChargePerDay: 0,
  driverCharges: 0,
  rtoCharges: 0,
  isActive: true,
};

export default function PackageFormModal({ editingPackage, onSuccess, onClose }: Props) {
  const [form, setForm] = useState<Package>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof Package, string>>>({});

 

  useEffect(() => {
    if (editingPackage) {
      setForm(editingPackage);
    } else {
      setForm(defaultForm);
    }
    setErrors({});
  }, [editingPackage]);

  const isEdit = !!editingPackage;

  const handleChange = (field: keyof Package, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };



  const validate = (): boolean => {
  const newErrors: Partial<Record<keyof Package, string>> = {};
  
  if (!form.vehicleType) newErrors.vehicleType = "Vehicle type is required";
  if (!form.vehicleModel) newErrors.vehicleModel = "Vehicle model is required";
  if (!form.perDayRentalCost || form.perDayRentalCost <= 0) newErrors.perDayRentalCost = "Enter a valid cost";
  if (!form.dailyKmLimit || form.dailyKmLimit <= 0) newErrors.dailyKmLimit = "Enter a valid KM limit";

   if (!form.additionalHourCharges || form.additionalHourCharges <= 0) newErrors.additionalHourCharges = "Enter a valid Charges";
  
  
  if (form.promoterAvailable && (!form.promoterChargePerDay || form.promoterChargePerDay <= 0)) {
    newErrors.promoterChargePerDay = "Enter promoter charge per day";
  }
  
   if (!form.driverCharges || form.driverCharges <= 0) newErrors.driverCharges = "Enter a Driver Charges";
    if (!form.rtoCharges || form.rtoCharges <= 0) newErrors.rtoCharges = "Enter a valid RTO Charges";
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload = {
      vehicleType: form.vehicleType,
      vehicleModel: form.vehicleModel,
      perDayRentalCost: Number(form.perDayRentalCost),
      dailyKmLimit: Number(form.dailyKmLimit),
      additionalHourCharges: Number(form.additionalHourCharges),
      endUserCustomizationPermission: form.endUserCustomizationPermission,
      promoterAvailable: form.promoterAvailable,
      promoterChargePerDay: form.promoterAvailable ? Number(form.promoterChargePerDay) : 0,
      driverCharges: Number(form.driverCharges),
      rtoCharges: Number(form.rtoCharges),
      isActive: form.isActive,
    };

    try {
      setLoading(true);
      const url = isEdit ? `${API_BASE}packages/${editingPackage._id}` : `${API_BASE}packages/add`;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || "Failed to save package");
      }
      onSuccess();
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

 
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50  p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-2xl max-h-[70vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
      
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            {isEdit ? "Edit Package" : "Add New Package"}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 bg-gray-100 text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <IoMdClose />
          </button>
        </div>

      
        <div className="px-6 py-5 space-y-5">
        
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Vehicle Type" error={errors.vehicleType} required>
              <select
                value={form.vehicleType}
                onChange={(e) => handleChange("vehicleType", e.target.value)}
                className={selectClass(!!errors.vehicleType)}
              >
                <option value="">Select vehicle type</option>
                {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormField>

            <FormField label="Vehicle Model" error={errors.vehicleModel} required>
              <select
                value={form.vehicleModel}
                onChange={(e) => handleChange("vehicleModel", e.target.value)}
                className={selectClass(!!errors.vehicleModel)}
              >
                <option value="">Select vehicle model</option>
                {VEHICLE_MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </FormField>
          </div>

        
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Per Day Rental Cost (₹)" error={errors.perDayRentalCost} required>
              <input
                type="number"
                min={0}
                value={form.perDayRentalCost || ""}
                onChange={(e) => handleChange("perDayRentalCost", e.target.value)}
                placeholder="e.g. 5000"
                className={inputClass(!!errors.perDayRentalCost)}
              />
            </FormField>

            <FormField label="Daily KM Limit" error={errors.dailyKmLimit} required>
              <input
                type="number"
                min={0}
                value={form.dailyKmLimit || ""}
                onChange={(e) => handleChange("dailyKmLimit", e.target.value)}
                placeholder="e.g. 100"
                className={inputClass(!!errors.dailyKmLimit)}
              />
            </FormField>
          </div>

        
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Additional Hour Charges (₹)" error={errors.additionalHourCharges} required>
              <input
                type="number"
                min={0}
                value={form.additionalHourCharges || ""}
                onChange={(e) => handleChange("additionalHourCharges", e.target.value)}
                placeholder="e.g. 300"
                className={inputClass(!!errors.additionalHourCharges)}
              />
            </FormField>

            <FormField label="End User Customization Permission">
              <select
                value={form.endUserCustomizationPermission ? "yes" : "no"}
                onChange={(e) => handleChange("endUserCustomizationPermission", e.target.value === "yes")}
                className={selectClass(false)}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </FormField>
          </div>

         
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Promoter Available">
              <select
                value={form.promoterAvailable ? "yes" : "no"}
                onChange={(e) => handleChange("promoterAvailable", e.target.value === "yes")}
                className={selectClass(false)}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </FormField>

            {form.promoterAvailable && (
              <FormField label="Promoter Charge Per Day (₹)" error={errors.promoterChargePerDay} required>
                <input
                  type="number"
                  min={0}
                  value={form.promoterChargePerDay || ""}
                  onChange={(e) => handleChange("promoterChargePerDay", e.target.value)}
                  placeholder="e.g. 1000"
                  className={inputClass(!!errors.promoterChargePerDay)}
                />
              </FormField>
            )}
          </div>

        
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Driver Charges (₹)" error={errors.driverCharges}>
              <input
                type="number"
                min={0}
                value={form.driverCharges || ""}
                onChange={(e) => handleChange("driverCharges", e.target.value)}
                placeholder="e.g. 800"
                className={inputClass(!!errors.driverCharges)}
              />
            </FormField>

            <FormField label="RTO Charges (₹)" error={errors.rtoCharges}>
              <input
                type="number"
                min={0}
                value={form.rtoCharges || ""}
                onChange={(e) => handleChange("rtoCharges", e.target.value)}
                placeholder="e.g. 500"
                className={inputClass(!!errors.rtoCharges)}
              />
            </FormField>
          </div>

        
        <div className="flex items-center justify-start gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3  py-3 dark:border-gray-700 dark:bg-gray-800">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</p>
            
            </div>
            <button
              type="button"
              onClick={() => handleChange("isActive", !form.isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                form.isActive ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                  form.isActive ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className={`ml-3 text-sm font-medium ${form.isActive ? "text-green-600" : "text-gray-400"}`}>
              {form.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

   
        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-gray-100 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {loading && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {isEdit ? "Update Package" : "Add Package"}
          </button>
        </div>
      </div>
    </div>
  );
}
