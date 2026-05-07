

"use client";

import React, { useEffect, useState } from "react";
import { Package } from "./page";
import { IoMdClose } from "react-icons/io";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";
import API_BASE from '../../../../baseurl';
import { inputClass, selectClass } from "./../../../components/reusableFormField";
import FormField from "../../../components/reusableFormField";


const DEFAULT_VEHICLE_TYPES = ["Customizable Vehicle", "Non-Customizable Vehicle"];
const DEFAULT_VEHICLE_MODELS = ["LED Van", "LED Truck", "Mini Promotion Vehicle", "Campaign Bus"];

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
  perKmCharge: 0,
  isActive: true,
  inactiveReason: "",
};


function formatAmount(value: number | string): string {
  const num = typeof value === "string" ? value.replace(/,/g, "") : String(value);
  if (!num || isNaN(Number(num))) return "";
  return Number(num).toLocaleString("en-IN");
}

function parseAmount(value: string): number {
  return Number(value.replace(/,/g, "")) || 0;
}

export default function PackageFormModal({ editingPackage, onSuccess, onClose }: Props) {
  const [form, setForm] = useState<Package>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof Package, string>>>({});


  const [vehicleTypes, setVehicleTypes] = useState<string[]>(DEFAULT_VEHICLE_TYPES);
  const [vehicleModels, setVehicleModels] = useState<string[]>(DEFAULT_VEHICLE_MODELS);


  const [newVehicleType, setNewVehicleType] = useState("");
  const [newVehicleModel, setNewVehicleModel] = useState("");


  const [existingPackageWarning, setExistingPackageWarning] = useState<string | null>(null);
  const [checkingExistence, setCheckingExistence] = useState(false);

  useEffect(() => {
    fetchVehicleOptions();
  }, []);

  const fetchVehicleOptions = async () => {
    try {
      const res = await fetch(`${API_BASE}packages/vehicle-options`);
      if (!res.ok) return;
      const data = await res.json();
      const { types, models } = data.data;


      const mergedTypes = Array.from(new Set([...DEFAULT_VEHICLE_TYPES, ...types]));
      const mergedModels = Array.from(new Set([...DEFAULT_VEHICLE_MODELS, ...models]));
      setVehicleTypes(mergedTypes);
      setVehicleModels(mergedModels);
    } catch {

    }
  };

  useEffect(() => {
    if (editingPackage) {
      setForm(editingPackage);
      setExistingPackageWarning(null);
    } else {
      setForm(defaultForm);
      setExistingPackageWarning(null);
    }
    setErrors({});
    setNewVehicleType("");
    setNewVehicleModel("");
  }, [editingPackage]);

  const isEdit = !!editingPackage;


  const checkExistingCombination = async (type: string, model: string) => {
    const finalType = type === "__new__" ? newVehicleType.trim() : type;
    const finalModel = model === "__new__" ? newVehicleModel.trim() : model;

    if (!finalType || !finalModel || isEdit) {
      setExistingPackageWarning(null);
      return;
    }

    try {
      setCheckingExistence(true);
      const res = await fetch(`${API_BASE}packages/check-exists?vehicleType=${encodeURIComponent(finalType)}&vehicleModel=${encodeURIComponent(finalModel)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.data.exists) {
          setExistingPackageWarning(
            `A package with vehicle type "${finalType}" and model "${finalModel}" already exists. Adding will update the existing record instead of creating a new one.`
          );
        } else {
          setExistingPackageWarning(null);
        }
      }
    } catch {
      setExistingPackageWarning(null);
    } finally {
      setCheckingExistence(false);
    }
  };

  const handleChange = (field: keyof Package, value: any) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };


      if (field === "vehicleType" || field === "vehicleModel") {
        const typeToCheck = field === "vehicleType" ? value : prev.vehicleType;
        const modelToCheck = field === "vehicleModel" ? value : prev.vehicleModel;


        setTimeout(() => {
          checkExistingCombination(
            field === "vehicleType" ? value : typeToCheck,
            field === "vehicleModel" ? value : modelToCheck
          );
        }, 100);
      }

      return updated;
    });

    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };


  const handleAmountChange = (field: keyof Package, raw: string) => {
    const cleaned = raw.replace(/,/g, "");
    if (cleaned === "" || /^\d*$/.test(cleaned)) {
      handleChange(field, cleaned === "" ? 0 : Number(cleaned));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof Package, string>> = {};
    const finalType = form.vehicleType === "__new__" ? newVehicleType.trim() : form.vehicleType;
    const finalModel = form.vehicleModel === "__new__" ? newVehicleModel.trim() : form.vehicleModel;
    const finalReason = form.inactiveReason?.trim() || "";

    if (!form.isActive && !finalReason) {
      newErrors.inactiveReason = "Inactive reason is required";
    }
    if (!finalType) newErrors.vehicleType = "Vehicle type is required";
    if (!finalModel) newErrors.vehicleModel = "Vehicle model is required";
    if (!form.perDayRentalCost || form.perDayRentalCost <= 0) newErrors.perDayRentalCost = "Enter a valid cost";
    if (!form.dailyKmLimit || form.dailyKmLimit <= 0) newErrors.dailyKmLimit = "Enter a valid KM limit";
    if (!form.additionalHourCharges || form.additionalHourCharges <= 0) newErrors.additionalHourCharges = "Enter valid charges";
    if (form.promoterAvailable && (!form.promoterChargePerDay || form.promoterChargePerDay <= 0)) {
      newErrors.promoterChargePerDay = "Enter promoter charge per day";
    }
    if (!form.driverCharges || form.driverCharges <= 0) newErrors.driverCharges = "Enter driver charges";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const finalType = form.vehicleType === "__new__" ? newVehicleType.trim() : form.vehicleType;
    const finalModel = form.vehicleModel === "__new__" ? newVehicleModel.trim() : form.vehicleModel;

    const payload = {
      vehicleType: finalType,
      vehicleModel: finalModel,
      perDayRentalCost: Number(form.perDayRentalCost),
      dailyKmLimit: Number(form.dailyKmLimit),
      additionalHourCharges: Number(form.additionalHourCharges),
      endUserCustomizationPermission: form.endUserCustomizationPermission,
      promoterAvailable: form.promoterAvailable,
      promoterChargePerDay: form.promoterAvailable ? Number(form.promoterChargePerDay) : 0,
      driverCharges: Number(form.driverCharges),
      rtoCharges: Number(form.rtoCharges),
      perKmCharge: Number(form.perKmCharge),
      isActive: form.isActive,
      inactiveReason: form.isActive ? "" : (form.inactiveReason || ""),
    };

    try {
      setLoading(true);

      if (isEdit) {

        const url = `${API_BASE}packages/${editingPackage._id}`;
        const res = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData?.message || "Failed to update package");
        }
      } else {

        const url = `${API_BASE}packages/add`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData?.message || "Failed to save package");
        }
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-2xl max-h-[70vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            {isEdit ? "Edit Package" : "Add New Package"}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-colors dark:hover:bg-gray-800 dark:hover:text-gray-200"
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
                {vehicleTypes.map((t) => <option key={t} value={t}>{t}</option>)}

              </select>

            </FormField>

            <FormField label="Vehicle Model" error={errors.vehicleModel} required>
              <select
                value={form.vehicleModel}
                onChange={(e) => handleChange("vehicleModel", e.target.value)}
                className={selectClass(!!errors.vehicleModel)}
              >
                <option value="">Select vehicle model</option>
                {vehicleModels.map((m) => <option key={m} value={m}>{m}</option>)}

              </select>

            </FormField>
          </div>


          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Per Day Rental Cost (₹)" error={errors.perDayRentalCost} required>
              <input
                type="text"
                value={form.perDayRentalCost ? formatAmount(form.perDayRentalCost) : ""}
                onChange={(e) => handleAmountChange("perDayRentalCost", e.target.value)}
                placeholder="e.g. 5,000"
                className={inputClass(!!errors.perDayRentalCost)}
              />
            </FormField>

            <FormField label="Daily KM Limit" error={errors.dailyKmLimit} required>
              <input
                type="text"
                value={form.dailyKmLimit ? formatAmount(form.dailyKmLimit) : ""}
                onChange={(e) => handleAmountChange("dailyKmLimit", e.target.value)}
                placeholder="e.g. 100"
                className={inputClass(!!errors.dailyKmLimit)}
              />
            </FormField>
          </div>

         

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Additional Hour Charges (₹)" error={errors.additionalHourCharges} required>
              <input
                type="text"
                value={form.additionalHourCharges ? formatAmount(form.additionalHourCharges) : ""}
                onChange={(e) => handleAmountChange("additionalHourCharges", e.target.value)}
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
                  type="text"
                  value={form.promoterChargePerDay ? formatAmount(form.promoterChargePerDay) : ""}
                  onChange={(e) => handleAmountChange("promoterChargePerDay", e.target.value)}
                  placeholder="e.g. 1,000"
                  className={inputClass(!!errors.promoterChargePerDay)}
                />
              </FormField>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Driver Charges (₹)" error={errors.driverCharges}>
              <input
                type="text"
                value={form.driverCharges ? formatAmount(form.driverCharges) : ""}
                onChange={(e) => handleAmountChange("driverCharges", e.target.value)}
                placeholder="e.g. 800"
                className={inputClass(!!errors.driverCharges)}
              />
            </FormField>

            <FormField label="RTO Charges (₹)">
              <input
                type="text"
                value={form.rtoCharges ? formatAmount(form.rtoCharges) : ""}
                onChange={(e) => handleAmountChange("rtoCharges", e.target.value)}
                placeholder="e.g. 500"
                className={inputClass(false)}
              />
            </FormField>
          </div>

           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Per KM Charge (₹)">
              <input
                type="text"
                value={form.perKmCharge ? formatAmount(form.perKmCharge) : ""}
                onChange={(e) => handleAmountChange("perKmCharge", e.target.value)}
                placeholder="e.g. 12"
                className={inputClass(false)}
              />
            </FormField>
          </div>

          <div className="flex items-center justify-start gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</p>
            <button
              type="button"
              onClick={() => handleChange("isActive", !form.isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${form.isActive ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${form.isActive ? "translate-x-6" : "translate-x-1"
                  }`}
              />
            </button>
            <span className={`text-sm font-medium ${form.isActive ? "text-green-600" : "text-red-500"}`}>
              {form.isActive ? "Active" : "Inactive"}
            </span>
          </div>


          {!form.isActive && (
            <FormField label="Reason for Inactive" required error={errors.inactiveReason}>
              <textarea
                value={form.inactiveReason || ""}
                onChange={(e) => handleChange("inactiveReason", e.target.value)}
                placeholder="Enter reason for marking this package inactive..."
                rows={3}
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors resize-none
                  border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                  dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500`}
              />
            </FormField>
          )}
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
            {isEdit ? "Update Package" : existingPackageWarning ? "Update Existing Package" : "Add Package"}
          </button>
        </div>
      </div>
    </div>
  );
}