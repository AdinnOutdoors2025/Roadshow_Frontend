//CORRECTED CODE FOR REGISTER NUMBER DUPLICATE CHECK AND MEDIA & DESCRIPTION LOCAL ADINN-SPACE ADDED BASED ON THE ENV 
//Completed Status Maintain
/* eslint-disable */
// @ts-nocheck

"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { ChevronDownIcon, PlusIcon } from "@/icons";
import Switch from "@/components/form/switch/Switch";
import axios from "axios";
import { baseUrl } from "../../../../../BaseUrl";
import { NotebookPen, Trash2, Calendar, Upload, X, Eye } from "lucide-react";

// ─── Validation Helpers ───────────────────────────────────────────────────────
const validateYear = (year) => {
  if (!year) return true;
  const currentYear = new Date().getFullYear();
  const yearNum = parseInt(year);
  if (isNaN(yearNum)) return false;
  return yearNum <= currentYear && yearNum >= 1900;
};

const validateNumber = (value, allowDecimal = false) => {
  if (!value || value === "") return true;
  if (allowDecimal) {
    return /^\d*\.?\d*$/.test(value);
  }
  return /^\d*$/.test(value);
};

const validatePhoneNumber = (phone) => {
  if (!phone || phone === "") return true;
  return /^\d{10}$/.test(phone);
};

// ─── Helper: Convert backend file path to accessible URL ─────────────────────
const normalizeMediaUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const match = url.replace(/\\/g, "/").match(/public\/uploads\/.+/);
  if (match) {
    return `${baseUrl}/${match[0]}`;
  }
  if (url.startsWith("/")) {
    return `${baseUrl}${url}`;
  }
  return url;
};

// ─── Radio Button Group Component ───────────────────────────────────────────
const RadioGroup = ({ label, options, value, onChange, required = false }) => {
  return (
    <div>
      <Label className="mb-2 block">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="flex gap-4">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="radio"
              name={label}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

// ─── Inline Textarea ───────────────────────────────────────────────────────────
const Textarea = ({
  rows = 3,
  placeholder,
  value,
  onChange,
  className = "",
  disabled = false,
}) => (
  <textarea
    rows={rows}
    className={`w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white disabled:bg-gray-100 disabled:cursor-not-allowed dark:disabled:bg-gray-800 ${className}`}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    disabled={disabled}
  />
);

// ─── Date Input with Calendar Icon ───────────────────────────────────────────
const DateInput = ({
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
}) => {
  return (
    <div className="relative">
      <Input
        type="date"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`${disabled ? "bg-gray-100 dark:bg-gray-800" : ""} pr-10`}
      />
      <span className="absolute text-gray-400 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-500">
        <Calendar size={16} />
      </span>
      {required && value && (
        <span className="absolute text-green-500 right-3 top-1/2 -translate-y-1/2">
          ✓
        </span>
      )}
    </div>
  );
};

// ─── Image/Video Preview Component with URL support ─────────────────────────
const MediaPreviewCard = ({
  label,
  file,
  previewUrl,
  existingUrl,
  onUpload,
  onRemove,
  icon,
  accept,
}) => {
  const [showPreview, setShowPreview] = useState(false);

  const normalizedExistingUrl = normalizeMediaUrl(existingUrl);
  const displayUrl = previewUrl || normalizedExistingUrl;

  const getPreviewContent = () => {
    if (displayUrl) {
      if (accept === "video/*") {
        return (
          <video
            src={displayUrl}
            className="w-full h-32 object-cover rounded-lg"
            controls={showPreview}
          />
        );
      } else {
        return (
          <img
            src={displayUrl}
            alt={label}
            className="w-full h-32 object-cover rounded-lg"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const parent = e.currentTarget.parentElement;
              if (parent && !parent.querySelector(".img-fallback")) {
                const fallback = document.createElement("div");
                fallback.className =
                  "img-fallback w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 text-sm";
                fallback.innerText = "Preview unavailable";
                parent.appendChild(fallback);
              }
            }}
          />
        );
      }
    }
    return (
      <div className="w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
        <span className="text-4xl">{icon}</span>
      </div>
    );
  };

  const hasMedia = !!(file || normalizedExistingUrl);

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-200">
      <div className="relative group">
        <div className="mb-3">{getPreviewContent()}</div>

        {file && (
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 truncate">
            {file.name}
          </div>
        )}

        <div className="flex gap-2 justify-center mt-3 flex-wrap">
          <label className="cursor-pointer">
            <span className="inline-flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors">
              <Upload size={12} />
              {hasMedia ? "Change" : "Upload"}
            </span>
            <input
              type="file"
              className="hidden"
              accept={accept}
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) {
                  onUpload(selectedFile);
                }
                e.target.value = "";
              }}
            />
          </label>

          {hasMedia && (
            <>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="inline-flex items-center gap-1 text-xs bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                <Eye size={12} />
                {showPreview ? "Hide" : "Preview"}
              </button>

              <button
                type="button"
                onClick={onRemove}
                className="inline-flex items-center gap-1 text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                <X size={12} />
                Remove
              </button>
            </>
          )}
        </div>
      </div>
      <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-2">
        {label}
      </p>
    </div>
  );
};

// ─── Stepper Header ─────────────────────────────────────────────────────────
const StepperHeader = ({ steps, currentStep, onStepClick, canAccessStep6, stepCompletionStatus }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-6 px-6 py-4 overflow-x-auto">
      <div className="flex items-center min-w-max gap-0">
        {steps.map((step, idx) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;
          const isDisabled = step.number === 5 && !canAccessStep6;

          return (
            <React.Fragment key={step.number}>
              <button
                type="button"
                onClick={() => !isDisabled && onStepClick(step.number)}
                className="flex items-center gap-2 group focus:outline-none"
                disabled={isDisabled}
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all duration-200 flex-shrink-0 ${stepCompletionStatus[step.number] || (currentStep > step.number)
                    ? "bg-green-600 text-white"  // Completed steps show green
                    : isActive
                      ? "bg-blue-600 text-white ring-4 ring-blue-100"  // Current step shows blue
                      : isDisabled
                        ? "bg-gray-300 text-gray-400 cursor-not-allowed dark:bg-gray-700"
                        : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                    }`}
                >
                  {(stepCompletionStatus[step.number] || (currentStep > step.number)) ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`text-sm font-medium whitespace-nowrap transition-colors ${isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : (stepCompletionStatus[step.number] || (currentStep > step.number))
                      ? "text-green-600 dark:text-green-400"
                      : isDisabled
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                >
                  {step.title}
                </span>
              </button>
              {idx < steps.length - 1 && (
                <div className="flex items-center mx-2 flex-shrink-0">
                  <div
                    className={`h-0.5 w-10 rounded transition-colors duration-300 ${currentStep > step.number
                      ? "bg-blue-400"
                      : "bg-gray-200 dark:bg-gray-700"
                      }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// ─── Section Card Header ────────────────────────────────────────────
const SectionHeader = ({ number, title, icon }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-600 text-white text-sm font-bold shadow-md">
      {number}
    </div>
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
        {icon && <span className="mr-2">{icon}</span>}
        {title}
      </h2>
    </div>
  </div>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styles = {
    Available:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    Unavailable:
      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.Available
        }`}
    >
      {status}
    </span>
  );
};

// ─── Validation helpers ───────────────────────────────────────────────────────
const isValidRegistrationNumber = (regNumber) => {
  if (!regNumber || regNumber.trim() === "") return false;
  const clean = regNumber.replace(/\s/g, "");
  if (clean.length !== 10) return false;
  return /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/.test(clean);
};

const formatRegistrationNumber = (regNumber) => {
  if (!regNumber) return "";
  const clean = regNumber.replace(/\s/g, "").toUpperCase();
  if (clean.length !== 10) return regNumber;
  return `${clean.slice(0, 2)} ${clean.slice(2, 4)} ${clean.slice(
    4,
    6
  )} ${clean.slice(6, 10)}`;
};

const unformatRegistrationNumber = (regNumber) => {
  if (!regNumber) return "";
  return regNumber.replace(/\s/g, "").toUpperCase();
};

// ─── Step validation rules ────────────────────────────────────────────────────
const validateStep = (step, { commonInfo, vehicles, techSpecs, vehicleDescription }) => {
  const errors = {};

  if (step === 1) {
    if (!commonInfo.vehicleType) errors.vehicleType = "Vehicle Type is required";
    if (vehicles.length === 0)
      errors.vehicles = "At least one vehicle is required";
  }

  if (step === 2) {
    if (!techSpecs.screenType) errors.screenType = "Screen Type is required";
    if (!techSpecs.numberOfScreens)
      errors.numberOfScreens = "Number of Screens is required";

    // Updated validation for new field structure
    if (!techSpecs.leftRightScreenWidth || !techSpecs.leftRightScreenHeight)
      errors.leftRightScreenSize = "Left/Right Screen size (Width & Height) is required";

    if (!techSpecs.leftRightResolutionWidth || !techSpecs.leftRightResolutionHeight)
      errors.leftRightResolution = "Left/Right Resolution (Width & Height) is required";

    if (!techSpecs.audioOutput) errors.audioOutput = "Audio Output is required";
    if (!techSpecs.generatorCapacity)
      errors.generatorCapacity = "Generator Capacity is required";
    if (!techSpecs.displayVersion)
      errors.displayVersion = "Display Version is required";
    if (!techSpecs.soundQuality)
      errors.soundQuality = "Sound Quality is required";
  }

  // if (step === 3) {
  //   if (!pricing.costPerDay) errors.costPerDay = "Base Cost Per Day is required";
  //   if (!pricing.avgKmPerDay) errors.avgKmPerDay = "Average KM Per Day is required";
  //   if (!pricing.extraKmPrice) errors.extraKmPrice = "Extra KM Price is required";
  //   if (!pricing.avgBookingHrs)
  //     errors.avgBookingHrs = "Average Booking Hours is required";
  //   if (!pricing.extraHrPrice) errors.extraHrPrice = "Extra Hour Price is required";
  //   if (!pricing.rtoCharges) errors.rtoCharges = "RTO Charges is required";
  //   if (!pricing.minBookingDuration)
  //     errors.minBookingDuration = "Minimum Booking Duration is required";
  // }

  if (step === 3) {
    if (!vehicleDescription) errors.vehicleDescription = "Vehicle Description is required";
  }

  return errors;
};

// ─── Vehicle Type Management Modal ───────────────────────────────────────────
const VehicleTypeModal = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  editingType,
  vehicleTypes,
  setEditingType,
}) => {
  const [typeName, setTypeName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (editingType) {
      setTypeName(editingType.typeName);
      setShowAddForm(true);
    } else {
      setTypeName("");
    }
  }, [editingType, isOpen]);

  const handleSubmit = async () => {
    if (!typeName.trim()) {
      toast.error("Please enter vehicle type name", {
        position: "bottom-right",
        autoClose: 3000,
      });
      return;
    }
    setLoading(true);
    try {
      if (editingType) {
        await onUpdate(editingType._id, typeName);
        setEditingType(null);
      } else {
        await onSave(typeName);
      }
      setTypeName("");
      setShowAddForm(false);
      onClose();
    } catch (error) {
      console.error("Error saving vehicle type:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to permanently delete this vehicle type?"
      )
    ) {
      setLoading(true);
      try {
        await onDelete(id);
        onClose();
      } catch (error) {
        console.error("Error deleting vehicle type:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="bg-white rounded-xl w-full max-w-2xl mx-4 my-8 dark:bg-gray-800 shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            📋 Manage Vehicle Types
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 mb-4 text-blue-600 hover:text-blue-700"
          >
            <PlusIcon className="w-4 h-4" />
            Add New Vehicle Type
          </button>

          {showAddForm && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <Label>Vehicle Type Name</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="text"
                  placeholder="e.g., Standard, Premium, Deluxe"
                  value={typeName}
                  onChange={(e) => setTypeName(e.target.value)}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {loading ? "Saving..." : editingType ? "Update" : "Add"}
                </button>
              </div>
            </div>
          )}

          <div className="mt-4">
            <Label>Existing Vehicle Types</Label>
            <div className="mt-2 space-y-2 max-h-80 overflow-y-auto">
              {vehicleTypes.map((type) => (
                <div
                  key={type._id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                >
                  <span className="text-gray-800 dark:text-white">
                    {type.typeName}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingType(type);
                        setTypeName(type.typeName);
                        setShowAddForm(true);
                      }}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <NotebookPen size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(type._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Add Vehicle Modal ─────────────────────────────────────────────────────────
const AddVehicleModal = ({
  isOpen,
  onClose,
  onSave,
  editingVehicle,
  existingRegNumbers,
  onCheckDuplicate,
  vehicleTypes,
}) => {
  const [formData, setFormData] = useState({
    registrationNumber: "",
    vehicleId: "",
    city: "",
    permitType: "",
    modelConfig: "",
    ownershipType: "",
    fuelType: "",
    manufacturingYear: "",
    gpsEnabled: true,
    activeStatus: true,
    currentStatus: "Available",
    availableFrom: "",
    remarks: "",
    driverName: "",
    driverPhone: "",
    backupDriver: "",
    backupDriverPhone: "",
    driverCharges: "",
    lastServiceDate: "",
    insuranceExpiryDate: "",
    pollutionExpiryDate: "",
  });

  const [registrationError, setRegistrationError] = useState("");
  const [yearError, setYearError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isGeneratingId, setIsGeneratingId] = useState(false);
  const [cityFilter, setCityFilter] = useState("");
  const [customCities, setCustomCities] = useState([]);

  const generateVehicleIdFromBackend = async () => {
    setIsGeneratingId(true);
    try {
      const response = await axios.get(`${baseUrl}/api/generate-vehicle-id`);
      if (response.data.success) {
        return response.data.vehicleId;
      }
    } catch (error) {
      console.error("Error generating vehicle ID:", error);
      const now = new Date();
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = String(now.getFullYear()).slice(-2);
      const random = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
      return `${day}${month}${year}${random}`;
    } finally {
      setIsGeneratingId(false);
    }
  };

  useEffect(() => {
    if (!editingVehicle && isOpen) {
      const generateId = async () => {
        const newVehicleId = await generateVehicleIdFromBackend();
        setFormData((prev) => ({ ...prev, vehicleId: newVehicleId }));
      };
      generateId();
    }
  }, [isOpen, editingVehicle]);

  useEffect(() => {
    if (editingVehicle) {
      setFormData({
        registrationNumber:
          formatRegistrationNumber(editingVehicle.registrationNumber) || "",
        vehicleId: editingVehicle.vehicleId || "",
        city: editingVehicle.city || "",
        permitType: editingVehicle.permitType || "",
        modelConfig: editingVehicle.modelConfig || "",
        ownershipType: editingVehicle.ownershipType || "",
        fuelType: editingVehicle.fuelType || "",
        manufacturingYear: editingVehicle.manufacturingYear || "",
        gpsEnabled:
          editingVehicle.gpsEnabled !== undefined
            ? editingVehicle.gpsEnabled
            : true,
        activeStatus:
          editingVehicle.activeStatus !== undefined
            ? editingVehicle.activeStatus
            : true,
        currentStatus: editingVehicle.currentStatus || "Available",
        availableFrom: editingVehicle.availableFrom || "",
        remarks: editingVehicle.remarks || "",
        driverName: editingVehicle.driverName || "",
        driverPhone: editingVehicle.driverPhone || "",
        backupDriver: editingVehicle.backupDriver || "",
        backupDriverPhone: editingVehicle.backupDriverPhone || "",
        driverCharges: editingVehicle.driverCharges
          ? String(editingVehicle.driverCharges)
          : "",
        lastServiceDate: editingVehicle.lastServiceDate || "",
        insuranceExpiryDate: editingVehicle.insuranceExpiryDate || "",
        pollutionExpiryDate: editingVehicle.pollutionExpiryDate || "",
      });
    } else if (!editingVehicle && isOpen) {
      setFormData((prev) => ({
        ...prev,
        registrationNumber: "",
        city: "",
        permitType: "",
        modelConfig: "",
        ownershipType: "",
        fuelType: "",
        manufacturingYear: "",
        gpsEnabled: true,
        activeStatus: true,
        currentStatus: "Available",
        availableFrom: "",
        remarks: "",
        driverName: "",
        driverPhone: "",
        backupDriver: "",
        backupDriverPhone: "",
        driverCharges: "",
        lastServiceDate: "",
        insuranceExpiryDate: "",
        pollutionExpiryDate: "",
      }));
    }
    setRegistrationError("");
    setYearError("");
    setPhoneError("");
  }, [editingVehicle, isOpen]);

  const handleYearChange = (value) => {
    const currentYear = new Date().getFullYear();
    if (value !== "" && !/^\d*$/.test(value)) return;
    if (value && parseInt(value) > currentYear) {
      setYearError(`Year cannot exceed ${currentYear}`);
    } else if (value && parseInt(value) < 1900 && value.length === 4) {
      setYearError("Year must be 1900 or later");
    } else {
      setYearError("");
    }
    setFormData((prev) => ({ ...prev, manufacturingYear: value }));
  };

  const handlePhoneChange = (field, value) => {
    if (value !== "" && !/^\d*$/.test(value)) return;
    if (value.length > 10) return;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "driverPhone") {
      if (value && value.length === 10) {
        setPhoneError("");
      } else if (value && value.length > 0 && value.length !== 10) {
        setPhoneError("Phone number must be 10 digits");
      } else {
        setPhoneError("");
      }
    }
  };
  const checkDuplicateRealTime = useCallback(
    async (value) => {
      const cleanValue = unformatRegistrationNumber(value);
      console.log("Real-time check for:", cleanValue);

      if (cleanValue.length === 10 && isValidRegistrationNumber(value)) {
        setIsCheckingDuplicate(true);
        try {
          // This will now check across ALL vehicle types
          const isDuplicate = await onCheckDuplicate(
            cleanValue,
            editingVehicle?.registrationNumber
          );
          if (isDuplicate && !editingVehicle) {
            setRegistrationError("This registration number already exists");
          } else {
            setRegistrationError("");
          }
        } catch (error) {
          console.error("Duplicate check error:", error);
        } finally {
          setIsCheckingDuplicate(false);
        }
      } else {
        setRegistrationError("");
      }
    },
    [editingVehicle, onCheckDuplicate]
  );

  const handleRegNumberChange = (value) => {
    let cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    let validated = "";
    let pos = 0;
    for (let i = 0; i < cleaned.length && pos < 10; i++) {
      const char = cleaned[i];
      if (pos < 2 && /[A-Z]/.test(char)) {
        validated += char;
        pos++;
      } else if (pos >= 2 && pos < 4 && /[0-9]/.test(char)) {
        validated += char;
        pos++;
      } else if (pos >= 4 && pos < 6 && /[A-Z]/.test(char)) {
        validated += char;
        pos++;
      } else if (pos >= 6 && pos < 10 && /[0-9]/.test(char)) {
        validated += char;
        pos++;
      }
    }
    let formatted = validated.slice(0, 2);
    if (validated.length > 2) formatted += " " + validated.slice(2, 4);
    if (validated.length > 4) formatted += " " + validated.slice(4, 6);
    if (validated.length > 6) formatted += " " + validated.slice(6, 10);

    setFormData((prev) => ({ ...prev, registrationNumber: formatted }));

    const clean = unformatRegistrationNumber(formatted);
    if (clean.length === 10 && isValidRegistrationNumber(formatted)) {
      checkDuplicateRealTime(formatted);
    } else if (clean.length > 0 && clean.length < 10) {
      setRegistrationError(`Need ${10 - clean.length} more character(s)`);
    } else if (clean.length === 10 && !isValidRegistrationNumber(formatted)) {
      setRegistrationError("Invalid format. Use: XX NN XX NNNN");
    } else {
      setRegistrationError("");
    }
  };

  // FIX 6: handleAddCity — inline city list to avoid referencing selectOptions before declaration
  const handleAddCity = () => {
    if (!cityFilter.trim()) return;
    const baseCities = [
      "Chennai", "Madurai", "Coimbatore", "Bangalore",
      "Hyderabad", "Mumbai", "Delhi", "Kolkata",
    ];
    const alreadyExists =
      baseCities.includes(cityFilter) ||
      customCities.some((c) => c.value === cityFilter);
    if (!alreadyExists) {
      setCustomCities((prev) => [
        ...prev,
        { value: cityFilter, label: cityFilter },
      ]);
    }
    setFormData((prev) => ({ ...prev, city: cityFilter }));
    setCityFilter("");
  };

  const selectOptions = {
    cityOptions: [
      { value: "Chennai", label: "Chennai" },
      { value: "Madurai", label: "Madurai" },
      { value: "Coimbatore", label: "Coimbatore" },
      { value: "Bangalore", label: "Bangalore" },
      { value: "Hyderabad", label: "Hyderabad" },
      { value: "Mumbai", label: "Mumbai" },
      { value: "Delhi", label: "Delhi" },
      { value: "Kolkata", label: "Kolkata" },
      ...customCities,
    ],
    permitOptions: [
      { value: "Local", label: "Local" },
      { value: "State", label: "State" },
      { value: "National", label: "National" },
    ],
    modelOptions: [
      { value: "Standard", label: "Standard" },
      { value: "Premium", label: "Premium" },
      { value: "Deluxe", label: "Deluxe" },
    ],
    ownershipOptions: [
      { value: "Owned", label: "Owned" },
      { value: "Leased", label: "Leased" },
      { value: "Rented", label: "Rented" },
    ],
    fuelTypeOptions: [
      { value: "Petrol", label: "Petrol" },
      { value: "Diesel", label: "Diesel" },
      { value: "CNG", label: "CNG" },
      { value: "Electric", label: "Electric" },
    ],
    currentStatusOptions: [
      { value: "Available", label: "Available" },
      { value: "Unavailable", label: "Unavailable" },
    ],
  };

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const cleanReg = unformatRegistrationNumber(formData.registrationNumber);
    if (
      !cleanReg ||
      cleanReg.length !== 10 ||
      !isValidRegistrationNumber(formData.registrationNumber)
    ) {
      toast.error("Please enter a valid registration number", {
        position: "bottom-right",
        autoClose: 3000,
      });
      return;
    }
    if (!formData.city) {
      toast.error("City is required", {
        position: "bottom-right",
        autoClose: 3000,
      });
      return;
    }
    if (!formData.fuelType) {
      toast.error("Fuel Type is required", {
        position: "bottom-right",
        autoClose: 3000,
      });
      return;
    }

    if (formData.manufacturingYear) {
      const currentYear = new Date().getFullYear();
      const yearNum = parseInt(formData.manufacturingYear);
      if (isNaN(yearNum) || yearNum > currentYear || yearNum < 1900) {
        toast.error(`Manufacturing year must be between 1900 and ${currentYear}`, {
          position: "bottom-right",
          autoClose: 3000,
        });
        return;
      }
    }

    if (formData.driverPhone && formData.driverPhone.length !== 10) {
      toast.error("Driver phone number must be 10 digits", {
        position: "bottom-right",
        autoClose: 3000,
      });
      return;
    }

    if (
      formData.backupDriverPhone &&
      formData.backupDriverPhone.length !== 10 &&
      formData.backupDriverPhone.length > 0
    ) {
      toast.error("Backup driver phone number must be 10 digits", {
        position: "bottom-right",
        autoClose: 3000,
      });
      return;
    }

    if (
      formData.currentStatus === "Unavailable" &&
      !formData.availableFrom
    ) {
      toast.error(
        "Please provide Available From date for Unavailable status", {
        position: "bottom-right",
        autoClose: 3000,
      });
      return;
    }
    if (formData.currentStatus === "Unavailable" && !formData.remarks) {
      toast.error("Please provide remarks for Unavailable status", {
        position: "bottom-right",
        autoClose: 3000,
      });
      return;
    }

    const isDuplicate = await onCheckDuplicate(
      cleanReg,
      editingVehicle?.registrationNumber
    );
    if (isDuplicate && !editingVehicle) {
      toast.error("This registration number already exists", {
        position: "bottom-right",
        autoClose: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      onSave({ ...formData, registrationNumber: cleanReg });
      onClose();
    } catch (error) {
      console.error("Error saving vehicle:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const showUnavailableFields = formData.currentStatus === "Unavailable";

  return (
    <div
      className="fixed inset-0 z-99999 flex items-center justify-center overflow-y-auto"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="bg-white rounded-xl w-full max-w-4xl mx-4 my-8 dark:bg-gray-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); }}
      >
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            🚚 {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <Label>
                🔢 Registration Number{" "}
                <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type="text"
                  value={formData.registrationNumber}
                  onChange={(e) => handleRegNumberChange(e.target.value)}
                  placeholder="TN 01 AB 1234"
                  maxLength={13}
                  className={registrationError ? "border-red-500" : ""}
                />
                {isCheckingDuplicate && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </span>
                )}
              </div>
              {registrationError && (
                <p className="mt-1 text-xs text-red-500">{registrationError}</p>
              )}
              {!registrationError &&
                formData.registrationNumber &&
                isValidRegistrationNumber(formData.registrationNumber) && (
                  <p className="mt-1 text-xs text-green-500">
                    ✓ Valid registration number
                  </p>
                )}
            </div>

            <div>
              <Label>
                🆔 Vehicle ID <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type="text"
                  value={
                    formData.vehicleId ||
                    (isGeneratingId ? "Generating..." : "")
                  }
                  placeholder="Auto generated"
                  disabled
                  className={`bg-gray-100 dark:bg-gray-800 cursor-not-allowed ${isGeneratingId ? "animate-pulse" : ""
                    }`}
                />
                {isGeneratingId && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-400">
                {formData.vehicleId
                  ? `Vehicle ID: ${formData.vehicleId}`
                  : "Vehicle ID will be auto-generated"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label>
                  🏙️ City / Operating Location{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Select
                    options={selectOptions.cityOptions}
                    placeholder="Select City"
                    value={formData.city}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, city: value }))
                    }
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
                <div className="mt-2 flex gap-2">
                  <Input
                    type="text"
                    placeholder="Add new city"
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="flex-1 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddCity}
                    className="px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <Label>📋 Permit Type </Label>
                <div className="relative">
                  <Select
                    options={selectOptions.permitOptions}
                    placeholder="Select Permit"
                    value={formData.permitType}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, permitType: value }))
                    }
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>

              <div>
                <Label>⚙️ Model / Configuration </Label>
                <div className="relative">
                  <Select
                    options={selectOptions.modelOptions}
                    placeholder="Select Model"
                    value={formData.modelConfig}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, modelConfig: value }))
                    }
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>

              <div>
                <Label>🏢 Ownership Type </Label>
                <div className="relative">
                  <Select
                    options={selectOptions.ownershipOptions}
                    placeholder="Select Ownership"
                    value={formData.ownershipType}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, ownershipType: value }))
                    }
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>

              <div>
                <Label>
                  ⛽ Fuel Type <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Select
                    options={selectOptions.fuelTypeOptions}
                    placeholder="Select Fuel Type"
                    value={formData.fuelType}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, fuelType: value }))
                    }
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>

              <div>
                <Label>
                  📅 Manufacturing Year{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="e.g. 2023"
                  maxLength={4}
                  value={formData.manufacturingYear}
                  onChange={(e) => handleYearChange(e.target.value)}
                  className={yearError ? "border-red-500" : ""}
                />
                {yearError && (
                  <p className="mt-1 text-xs text-red-500">{yearError}</p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  Cannot exceed current year
                </p>
              </div>
            </div>

            <div className="border-t pt-6 mt-2">
              <Label className="text-base font-semibold">
                📌 Status & Availability
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
                <div>
                  <Label>
                    Current Status <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Select
                      options={selectOptions.currentStatusOptions}
                      placeholder="Select status"
                      value={formData.currentStatus}
                      onChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          currentStatus: value,
                          availableFrom: "",
                          remarks: "",
                        }))
                      }
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>

                {showUnavailableFields && (
                  <>
                    <div>
                      <Label>Available From </Label>
                      <DateInput
                        value={formData.availableFrom}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            availableFrom: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>
                        Remarks <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        placeholder="Enter remarks about unavailability..."
                        value={formData.remarks}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            remarks: e.target.value,
                          }))
                        }
                        rows={2}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-6 pt-2">
              <div>
                <Label>
                  📡 GPS Enabled <span className="text-red-500">*</span>
                </Label>
                <Switch
                  label={formData.gpsEnabled ? "Enabled" : "Disabled"}
                  defaultChecked={formData.gpsEnabled}
                  onChange={(checked) =>
                    setFormData((prev) => ({ ...prev, gpsEnabled: checked }))
                  }
                />
              </div>
              <div>
                <Label>
                  ✅ Active Status <span className="text-red-500">*</span>
                </Label>
                <Switch
                  label={formData.activeStatus ? "Active" : "Inactive"}
                  defaultChecked={formData.activeStatus}
                  onChange={(checked) =>
                    setFormData((prev) => ({ ...prev, activeStatus: checked }))
                  }
                />
              </div>
            </div>

            <div className="border-t pt-6 mt-2">
              <Label className="text-base font-semibold">
                👤 Driver Details (Optional){" "}
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
                <div>
                  <Label>Driver Name</Label>
                  <Input
                    placeholder="Enter driver name"
                    value={formData.driverName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        driverName: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Driver Phone</Label>
                  <Input
                    placeholder="Enter 10-digit phone number"
                    maxLength={10}
                    value={formData.driverPhone}
                    onChange={(e) =>
                      handlePhoneChange("driverPhone", e.target.value)
                    }
                    className={
                      phoneError && formData.driverPhone
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {phoneError && formData.driverPhone && (
                    <p className="mt-1 text-xs text-red-500">{phoneError}</p>
                  )}
                </div>
                <div>
                  <Label>Backup Driver (Optional)</Label>
                  <Input
                    placeholder="Enter backup driver name"
                    value={formData.backupDriver}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        backupDriver: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Backup Driver Phone (Optional)</Label>
                  <Input
                    placeholder="Enter 10-digit phone number"
                    maxLength={10}
                    value={formData.backupDriverPhone}
                    onChange={(e) =>
                      handlePhoneChange("backupDriverPhone", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label>Driver Charges (₹) (Optional)</Label>
                  <Input
                    placeholder="e.g. 800"
                    value={formData.driverCharges}
                    onChange={(e) => {
                      if (validateNumber(e.target.value, false)) {
                        setFormData((prev) => ({
                          ...prev,
                          driverCharges: e.target.value,
                        }));
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6 mt-2">
              <Label className="text-base font-semibold">
                🔧 Maintenance Details (Optional){" "}
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
                <div>
                  <Label>Last Service Date</Label>
                  <DateInput
                    value={formData.lastServiceDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        lastServiceDate: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Insurance Expiry Date</Label>
                  <DateInput
                    value={formData.insuranceExpiryDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        insuranceExpiryDate: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Pollution Expiry Date</Label>
                  <DateInput
                    value={formData.pollutionExpiryDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        pollutionExpiryDate: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading
              ? "Saving..."
              : editingVehicle
                ? "Update Vehicle"
                : "Add Vehicle"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Maintenance Modal ───────────────────────────────────────────────────────
const MaintenanceModal = ({ isOpen, onClose, vehicle, onSave }) => {
  const [maintenanceData, setMaintenanceData] = useState({
    lastServiceDate: "",
    insuranceExpiryDate: "",
    pollutionExpiryDate: "",
  });
  const [driverData, setDriverData] = useState({
    driverName: "",
    driverPhone: "",
    backupDriver: "",
    backupDriverPhone: "",
    driverCharges: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setMaintenanceData({
        lastServiceDate: vehicle.lastServiceDate || "",
        insuranceExpiryDate: vehicle.insuranceExpiryDate || "",
        pollutionExpiryDate: vehicle.pollutionExpiryDate || "",
      });
      setDriverData({
        driverName: vehicle.driverName || "",
        driverPhone: vehicle.driverPhone || "",
        backupDriver: vehicle.backupDriver || "",
        backupDriverPhone: vehicle.backupDriverPhone || "",
        driverCharges: vehicle.driverCharges
          ? String(vehicle.driverCharges)
          : "",
      });
    }
  }, [vehicle, isOpen]);

  // FIX 3: null-guard — vehicle may be null when modal triggers
  // const handleSubmit = () => {
  //   if (!vehicle) return;
  //   setLoading(true);
  //   onSave(vehicle.registrationNumber, { ...maintenanceData, ...driverData });
  //   setTimeout(() => {
  //     setLoading(false);
  //     onClose();
  //   }, 500);
  // };
  // const handleSubmit = () => {
  //     if (!vehicle) return;
  //     setLoading(true);
  //     onSave(vehicle.registrationNumber, { ...maintenanceData, ...driverData });
  //     setTimeout(() => {
  //       setLoading(false);
  //       // Bug fix: blur active element so focus doesn't return to form and trigger Enter submit
  //       if (document.activeElement) document.activeElement.blur();
  //       onClose();
  //     }, 500);
  //   };


  const handleSubmit = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!vehicle) return;
    setLoading(true);
    onSave(vehicle.registrationNumber, { ...maintenanceData, ...driverData });
    setTimeout(() => {
      setLoading(false);
      if (document.activeElement) document.activeElement.blur();
      onClose();
    }, 500);
  };
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="bg-white rounded-xl w-full max-w-3xl mx-4 my-8 dark:bg-gray-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); }}
      >
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            🔧 Driver & Maintenance Details:{" "}
            <span className="font-mono text-blue-600">
              {formatRegistrationNumber(vehicle?.registrationNumber)}
            </span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <Label className="text-base font-semibold">👤 Driver Details</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
              <div>
                <Label>Driver Name</Label>
                <Input
                  value={driverData.driverName}
                  onChange={(e) =>
                    setDriverData((prev) => ({
                      ...prev,
                      driverName: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label>Driver Phone</Label>
                <Input
                  value={driverData.driverPhone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setDriverData((prev) => ({ ...prev, driverPhone: val }));
                  }}
                  maxLength={10}
                />
              </div>
              <div>
                <Label>Backup Driver</Label>
                <Input
                  value={driverData.backupDriver}
                  onChange={(e) =>
                    setDriverData((prev) => ({
                      ...prev,
                      backupDriver: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label>Backup Driver Phone</Label>
                <Input
                  value={driverData.backupDriverPhone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setDriverData((prev) => ({
                      ...prev,
                      backupDriverPhone: val,
                    }));
                  }}
                  maxLength={10}
                />
              </div>
              <div>
                <Label>Driver Charges (₹)</Label>
                <Input
                  value={driverData.driverCharges}
                  onChange={(e) => {
                    if (validateNumber(e.target.value, false)) {
                      setDriverData((prev) => ({
                        ...prev,
                        driverCharges: e.target.value,
                      }));
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <Label className="text-base font-semibold">
              🔧 Maintenance Details
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
              <div>
                <Label>Last Service Date</Label>
                <DateInput
                  value={maintenanceData.lastServiceDate}
                  onChange={(e) =>
                    setMaintenanceData((prev) => ({
                      ...prev,
                      lastServiceDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label>Insurance Expiry Date</Label>
                <DateInput
                  value={maintenanceData.insuranceExpiryDate}
                  onChange={(e) =>
                    setMaintenanceData((prev) => ({
                      ...prev,
                      insuranceExpiryDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label>Pollution Certificate Expiry Date</Label>
                <DateInput
                  value={maintenanceData.pollutionExpiryDate}
                  onChange={(e) =>
                    setMaintenanceData((prev) => ({
                      ...prev,
                      pollutionExpiryDate: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            // onClick={handleSubmit}
            onClick={(e) => handleSubmit(e)}
            disabled={loading}
            className="px-5 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            {loading ? "Saving..." : "Save Details"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function VehicleOnboardingForm() {
  const [vehicles, setVehicles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const currentStepRef = useRef(1);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [existingRegNumbersSet, setExistingRegNumbersSet] = useState(new Set());
  const [selectedVehicleTypeData, setSelectedVehicleTypeData] = useState(null);
  const [isLoadingVehicleData, setIsLoadingVehicleData] = useState(false);
  const [currentEditingGroupId, setCurrentEditingGroupId] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [stepErrors, setStepErrors] = useState({});

  // FIX 3: vehicleDescription state — was missing, caused Step 4 textarea to be uncontrolled
  // and the payload to send undefined to the backend
  const [vehicleDescription, setVehicleDescription] = useState("");

  const [commonInfo, setCommonInfo] = useState({
    customizedType: "Non-Customized",
    vehicleType: "",
    vehicleName: "",
  });
  const [techSpecs, setTechSpecs] = useState({
    screenType: "LED Only",
    numberOfScreens: "",
    // Left/Right Screen Size - Separate W & H
    leftRightScreenWidth: "",
    leftRightScreenHeight: "",
    // Back Screen Size - Separate W & H
    backScreenWidth: "",
    backScreenHeight: "",
    // Left/Right Resolution - Separate W & H
    leftRightResolutionWidth: "",
    leftRightResolutionHeight: "",
    // Back Resolution - Separate W & H
    backResolutionWidth: "",
    backResolutionHeight: "",
    audioOutput: "",
    brightness: "",
    displayVersion: "",
    soundQuality: "",
    generatorCapacity: "",
    additionalFeatures: "",
  });

  const [showMoreTech, setShowMoreTech] = useState(false);

  const [pricing, setPricing] = useState({
    basePriceType: "Per Day",
    costPerDay: "",
    avgKmPerDay: "",
    extraKmPrice: "",
    avgBookingHrs: "",
    extraHrPrice: "",
    rtoCharges: "",
    fuelEfficiency: "",
    minBookingDuration: "",
    overtimeCharges: "",
    waitingCharges: "",
  });

  const [mediaFiles, setMediaFiles] = useState({
    frontViewImage: null,
    leftSideImage: null,
    rightSideImage: null,
    rearViewImage: null,
    interiorImage: null,
    demoVideo: null,
  });

  const [mediaPreviews, setMediaPreviews] = useState({
    frontViewImage: null,
    leftSideImage: null,
    rightSideImage: null,
    rearViewImage: null,
    interiorImage: null,
    demoVideo: null,
  });

  const [existingMediaUrls, setExistingMediaUrls] = useState({
    frontViewImage: "",
    leftSideImage: "",
    rightSideImage: "",
    rearViewImage: "",
    interiorImage: "",
    demoVideo: "",
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);

  const [stepCompletionStatus, setStepCompletionStatus] = useState({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent Enter from submitting form on steps 1-5
      if (e.key === 'Enter' && currentStep !== 6) {
        // Allow Enter in textareas
        const activeElement = document.activeElement;
        const isTextarea = activeElement?.tagName === 'TEXTAREA';
        const isSubmitButton = activeElement?.type === 'submit';

        if (!isTextarea && !isSubmitButton) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentStep]);

  useEffect(() => {
    const initializeData = async () => {
      await fetchVehicleTypes();
      await fetchExistingRegNumbers(); // This loads ALL registration numbers
    };
    initializeData();
  }, []);

  // Add this effect to refresh registration numbers after adding/updating vehicles
  useEffect(() => {
    if (!isModalOpen) {
      fetchExistingRegNumbers();
    }
  }, [vehicles.length]); // Refresh when number of vehicles changes

  const saveCurrentStep = async (stepNumber, nextStep = null) => {
    if (!commonInfo.vehicleType && stepNumber !== 1) {
      toast.error("Please select a vehicle type first");
      return false;
    }
    let stepData = {};
    if (stepNumber === 1) {
      stepData = {
        basicInfo: commonInfo,
        registrationVehicles: vehicles.map(v => ({
          registrationNumber: unformatRegistrationNumber(v.registrationNumber),
          vehicleId: v.vehicleId,
          city: v.city,
          modelConfig: v.modelConfig,
          permitType: v.permitType,
          ownershipType: v.ownershipType,
          fuelType: v.fuelType,
          manufacturingYear: v.manufacturingYear,
          gpsEnabled: v.gpsEnabled,
          activeStatus: v.activeStatus,
          statusAvailability: {
            currentStatus: v.currentStatus || "Available",
            availableFrom: v.availableFrom || null,
            remarks: v.remarks || "",
          },
          maintenance: {
            lastServiceDate: v.lastServiceDate || null,
            insuranceExpiryDate: v.insuranceExpiryDate || null,
            pollutionExpiryDate: v.pollutionExpiryDate || null,
          },
          driverDetails: {
            driverName: v.driverName || "",
            driverPhone: v.driverPhone || "",
            backupDriver: v.backupDriver || "",
            backupDriverPhone: v.backupDriverPhone || "",
            driverCharges: Number(v.driverCharges) || 0,
          },
        })),
        totalVehicles: vehicles.length,
      };
    } else if (stepNumber === 2) {
      stepData = { techSpecs };
    } else if (stepNumber === 3) {
      stepData = { vehicleDescription };
    } else if (stepNumber === 4) {
      // stepData = {
      //   registrationVehicles: vehicles.map(v => ({
      //     registrationNumber: unformatRegistrationNumber(v.registrationNumber),
      //     driverDetails: {
      //       driverName: v.driverName || "",
      //       driverPhone: v.driverPhone || "",
      //       backupDriver: v.backupDriver || "",
      //       backupDriverPhone: v.backupDriverPhone || "",
      //       driverCharges: Number(v.driverCharges) || 0,
      //     },
      //     maintenance: {
      //       lastServiceDate: v.lastServiceDate || null,
      //       insuranceExpiryDate: v.insuranceExpiryDate || null,
      //       pollutionExpiryDate: v.pollutionExpiryDate || null,
      //     },
      //   })),
      // };
      stepData = {
        registrationVehicles: vehicles.map(v => ({
          registrationNumber: unformatRegistrationNumber(v.registrationNumber),
          vehicleId: v.vehicleId,
          city: v.city,
          modelConfig: v.modelConfig,
          permitType: v.permitType,
          ownershipType: v.ownershipType,
          fuelType: v.fuelType,
          manufacturingYear: v.manufacturingYear,
          gpsEnabled: v.gpsEnabled,
          activeStatus: v.activeStatus,
          statusAvailability: {
            currentStatus: v.currentStatus || "Available",
            availableFrom: v.availableFrom || null,
            remarks: v.remarks || "",
          },
          driverDetails: {
            driverName: v.driverName || "",
            driverPhone: v.driverPhone || "",
            backupDriver: v.backupDriver || "",
            backupDriverPhone: v.backupDriverPhone || "",
            driverCharges: Number(v.driverCharges) || 0,
          },
          maintenance: {
            lastServiceDate: v.lastServiceDate || null,
            insuranceExpiryDate: v.insuranceExpiryDate || null,
            pollutionExpiryDate: v.pollutionExpiryDate || null,
          },
        })),
      }
    }

    const formData = new FormData();
    formData.append("data", JSON.stringify(stepData));
    if (stepNumber === 3) {
      Object.keys(mediaFiles).forEach(key => {
        if (mediaFiles[key] instanceof File) formData.append(key, mediaFiles[key]);
      });
    }

    try {
      let url = `${baseUrl}/api/updateVehicleStep/${currentEditingGroupId}`;
      if (!currentEditingGroupId && stepNumber === 1) {
        // First time – create group
        const payload = {
          basicInfo: commonInfo,
          registrationVehicles: stepData.registrationVehicles,
          totalVehicles: vehicles.length,
          techSpecs: {},
          vehicleDescription: "",
          mediaFiles: {},
          completedSteps: { step1: true },
        };
        const createRes = await axios.post(`${baseUrl}/api/createVehicle`, payload);
        if (createRes.data.success) {
          setCurrentEditingGroupId(createRes.data.data._id);
          toast.success("Basic info saved", {
            position: "bottom-right",
            autoClose: 3000,
          });
          if (nextStep) setCurrentStep(nextStep);
          return true;
        }
      } else {
        const res = await axios.put(url, { step: stepNumber, stepData, completed: true });
        if (res.data.success) {
          setStepCompletionStatus(prev => ({ ...prev, [stepNumber]: true }));
          if (nextStep) setCurrentStep(nextStep);
          return true;
        }
      }
    } catch (error) {
      console.error("Save step error:", error);
      toast.error("Failed to save step", {
        position: "bottom-right",
        autoClose: 3000,
      });
      return false;
    }
  };


  const handleMediaUpload = (field, file) => {
    if (!file) return;

    const isVideo = field === "demoVideo";
    const maxSize = isVideo ? 10 * 1024 * 1024 : 3 * 1024 * 1024;

    if (file.size > maxSize) {
      toast.error(`File size exceeds ${isVideo ? "10MB" : "3MB"} limit`);
      return;
    }

    const validImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    const validVideoTypes = [
      "video/mp4",
      "video/mov",
      "video/avi",
      "video/mkv",
      "video/webm",
    ];

    if (isVideo && !validVideoTypes.includes(file.type)) {
      toast.error("Please select a valid video file", {
        position: "bottom-right",
        autoClose: 3000,
      });
      return;
    }

    if (!isVideo && !validImageTypes.includes(file.type)) {
      toast.error("Please select a valid image file", {
        position: "bottom-right",
        autoClose: 3000,
      });
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setMediaPreviews((prev) => ({
      ...prev,
      [field]: previewUrl,
    }));

    setMediaFiles((prev) => ({
      ...prev,
      [field]: file,
    }));

    setExistingMediaUrls((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleRemoveMedia = (field) => {
    if (mediaPreviews[field] && mediaPreviews[field].startsWith("blob:")) {
      URL.revokeObjectURL(mediaPreviews[field]);
    }
    setMediaPreviews((prev) => ({ ...prev, [field]: null }));
    setMediaFiles((prev) => ({ ...prev, [field]: null }));
    setExistingMediaUrls((prev) => ({ ...prev, [field]: "" }));
  };

  useEffect(() => {
    return () => {
      Object.values(mediaPreviews).forEach((preview) => {
        if (preview && preview.startsWith("blob:")) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, []);


  const fetchExistingRegNumbers = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/getNewVehicles?page=1&limit=10000`);
      if (response.data.success) {
        const allRegNumbers = new Set();
        response.data.data.forEach((vehicle) => {
          if (vehicle.registrationVehicles) {
            vehicle.registrationVehicles.forEach((rv) => {
              // Always store UNFORMATTED (no spaces) for consistent comparison
              allRegNumbers.add(rv.registrationNumber.replace(/\s/g, "").toUpperCase());
            });
          }
        });
        setExistingRegNumbersSet(allRegNumbers);
      }
    } catch (error) {
      console.error("Error fetching existing registration numbers:", error);
    }
  };

  const checkDuplicateRegistration = async (regNumber, excludeRegNumber = null) => {
    const cleanReg = unformatRegistrationNumber(regNumber); // always strip spaces
    const cleanExclude = excludeRegNumber ? unformatRegistrationNumber(excludeRegNumber) : null;

    // Check within current session's vehicle list
    const localDuplicate = vehicles.some(
      (v) => unformatRegistrationNumber(v.registrationNumber) === cleanReg &&
        unformatRegistrationNumber(v.registrationNumber) !== cleanExclude
    );
    if (localDuplicate) return true;

    // Check against DB (all vehicle types)
    if (existingRegNumbersSet.has(cleanReg) && cleanReg !== cleanExclude) {
      return true;
    }

    return false;
  };



  const fetchVehicleTypes = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/vehicle-types`);
      console.log("VEHICLE TYPE", response);
      console.log("Vehicle types array:", response.data.data);  // 👈 This is what you want

      if (response.data.success) {
        setVehicleTypes(response.data.data);
        const typeNames = response.data.data.map(type => type.typeName);
        console.log("Vehicle type names:", typeNames);
      }
    } catch (error) {
      console.error("Error fetching vehicle types:", error);
    }
  };


  // const fetchVehicleByType = async (typeId) => {
  //   if (!typeId) return;
  //   setIsLoadingVehicleData(true);
  //   try {
  //     const res = await axios.get(`${baseUrl}/api/getVehicleGroupByType/${typeId}`);
  //     if (res.data.success && res.data.data) {
  //       const data = res.data.data;
  //       setSelectedVehicleTypeData(data);
  //       setCurrentEditingGroupId(data._id);
  //       setCommonInfo(data.basicInfo);
  //       setTechSpecs(data.techSpecs);
  //       setVehicleDescription(data.vehicleDescription || "");
  //       setExistingMediaUrls(data.mediaFiles || {});
  //       if (data.registrationVehicles) {
  //         const formatted = data.registrationVehicles.map(rv => ({
  //           registrationNumber: rv.registrationNumber,
  //           vehicleId: rv.vehicleId,
  //           city: rv.city,
  //           permitType: rv.permitType,
  //           modelConfig: rv.modelConfig,
  //           ownershipType: rv.ownershipType,
  //           fuelType: rv.fuelType,
  //           manufacturingYear: rv.manufacturingYear,
  //           gpsEnabled: rv.gpsEnabled,
  //           activeStatus: rv.activeStatus,
  //           currentStatus: rv.statusAvailability?.currentStatus || "Available",
  //           availableFrom: rv.statusAvailability?.availableFrom?.split("T")[0] || "",
  //           remarks: rv.statusAvailability?.remarks || "",
  //           driverName: rv.driverDetails?.driverName || "",
  //           driverPhone: rv.driverDetails?.driverPhone || "",
  //           backupDriver: rv.driverDetails?.backupDriver || "",
  //           backupDriverPhone: rv.driverDetails?.backupDriverPhone || "",
  //           driverCharges: String(rv.driverDetails?.driverCharges || ""),
  //           lastServiceDate: rv.maintenance?.lastServiceDate?.split("T")[0] || "",
  //           insuranceExpiryDate: rv.maintenance?.insuranceExpiryDate?.split("T")[0] || "",
  //           pollutionExpiryDate: rv.maintenance?.pollutionExpiryDate?.split("T")[0] || "",
  //         }));
  //         setVehicles(formatted);
  //       }
  //       const comp = data.completedSteps || {};
  //       setStepCompletionStatus({
  //         1: comp.step1 || false,
  //         2: comp.step2 || false,
  //         3: comp.step3 || false,
  //         4: comp.step4 || false,
  //         5: comp.step5 || false,
  //       });
  //       // Get the type name from vehicleTypes state (already loaded)
  //       const typeName = vehicleTypes.find(t => t._id === data.basicInfo.vehicleType)?.typeName || data.basicInfo.vehicleType;
  //       toast.success(`Loaded ${vehicleData.registrationVehicles?.length || 0} vehicle(s) for " ${typeName} "`, {
  //         position: "bottom-right",
  //         autoClose: 3000,
  //       });
  //     } else {
  //       resetFormForNewVehicleType();
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     resetFormForNewVehicleType();
  //   } finally {
  //     setIsLoadingVehicleData(false);
  //   }
  // };



  const fetchVehicleByType = async (typeId) => {
  if (!typeId) return;
  setIsLoadingVehicleData(true);
  try {
    const res = await axios.get(`${baseUrl}/api/getVehicleGroupByType/${typeId}`);
    if (res.data.success && res.data.data) {
      const data = res.data.data;
      setSelectedVehicleTypeData(data);
      setCurrentEditingGroupId(data._id);
      setCommonInfo(data.basicInfo);
      setTechSpecs(data.techSpecs || {
        screenType: "LED Only",
        numberOfScreens: "",
        leftRightScreenWidth: "",
        leftRightScreenHeight: "",
        backScreenWidth: "",
        backScreenHeight: "",
        leftRightResolutionWidth: "",
        leftRightResolutionHeight: "",
        backResolutionWidth: "",
        backResolutionHeight: "",
        audioOutput: "",
        brightness: "",
        displayVersion: "",
        soundQuality: "",
        generatorCapacity: "",
        additionalFeatures: "",
      });
      setVehicleDescription(data.vehicleDescription || "");
      setExistingMediaUrls(data.mediaFiles || {});

      if (data.registrationVehicles && data.registrationVehicles.length > 0) {
        const formatted = data.registrationVehicles.map(rv => ({
          registrationNumber: rv.registrationNumber,
          vehicleId: rv.vehicleId,
          city: rv.city,
          permitType: rv.permitType,
          modelConfig: rv.modelConfig,
          ownershipType: rv.ownershipType,
          fuelType: rv.fuelType,
          manufacturingYear: rv.manufacturingYear,
          gpsEnabled: rv.gpsEnabled,
          activeStatus: rv.activeStatus,
          currentStatus: rv.statusAvailability?.currentStatus || "Available",
          availableFrom: rv.statusAvailability?.availableFrom?.split("T")[0] || "",
          remarks: rv.statusAvailability?.remarks || "",
          driverName: rv.driverDetails?.driverName || "",
          driverPhone: rv.driverDetails?.driverPhone || "",
          backupDriver: rv.driverDetails?.backupDriver || "",
          backupDriverPhone: rv.driverDetails?.backupDriverPhone || "",
          driverCharges: String(rv.driverDetails?.driverCharges || ""),
          lastServiceDate: rv.maintenance?.lastServiceDate?.split("T")[0] || "",
          insuranceExpiryDate: rv.maintenance?.insuranceExpiryDate?.split("T")[0] || "",
          pollutionExpiryDate: rv.maintenance?.pollutionExpiryDate?.split("T")[0] || "",
        }));
        setVehicles(formatted);
      } else {
        setVehicles([]);
      }

      const comp = data.completedSteps || {};
      setStepCompletionStatus({
        1: comp.step1 || false,
        2: comp.step2 || false,
        3: comp.step3 || false,
        4: comp.step4 || false,
        5: comp.step5 || false,
      });

      const typeName = vehicleTypes.find(t => t._id === data.basicInfo.vehicleType)?.typeName || data.basicInfo.vehicleType;
      toast.success(`Loaded ${data.registrationVehicles?.length || 0} vehicle(s) for "${typeName}"`, {
        position: "bottom-right",
        autoClose: 3000,
      });
    } else {
      resetFormForNewVehicleType();
      toast.info("No existing data found for this vehicle type", { position: "bottom-right", autoClose: 3000 });
    }
  } catch (err) {
    console.error(err);
    resetFormForNewVehicleType();
    toast.error("Error loading vehicle data", { position: "bottom-right", autoClose: 3000 });
  } finally {
    setIsLoadingVehicleData(false);
  }
};


  const createVehicleType = async (typeName) => {
    try {
      const response = await axios.post(`${baseUrl}/api/vehicle-types`, {
        typeName,
      });
      if (response.data.success) {
        toast.success("Vehicle type created successfully", {
          position: "bottom-right",
          autoClose: 3000,
        });
        await fetchVehicleTypes();
        return response.data.data;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating vehicle type", {
        position: "bottom-right",
        autoClose: 3000,
      });
      throw error;
    }
  };

  const updateVehicleType = async (id, typeName) => {
    try {
      const response = await axios.put(`${baseUrl}/api/vehicle-types/${id}`, {
        typeName,
      });
      if (response.data.success) {
        toast.success("Vehicle type updated successfully", {
          position: "bottom-right",
          autoClose: 3000,
        });
        await fetchVehicleTypes();
        return response.data.data;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating vehicle type", {
        position: "bottom-right",
        autoClose: 3000,
      });
      throw error;
    }
  };

  const deleteVehicleType = async (id) => {
    try {
      const response = await axios.delete(
        `${baseUrl}/api/vehicle-types/${id}`
      );
      if (response.data.success) {
        toast.success("Vehicle type deleted successfully", {
          position: "bottom-right",
          autoClose: 3000,
        });
        await fetchVehicleTypes();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting vehicle type", {
        position: "bottom-right",
        autoClose: 3000,
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchVehicleTypes();
    fetchExistingRegNumbers();
  }, []);


  const resetFormForNewVehicleType = () => {
    setVehicles([]);
    setTechSpecs({ /* default as above */ });
    setVehicleDescription("");
    setMediaFiles({ frontViewImage: null, leftSideImage: null, rightSideImage: null, rearViewImage: null, interiorImage: null, demoVideo: null });
    setMediaPreviews({ ...mediaPreviews, frontViewImage: null, leftSideImage: null, rightSideImage: null, rearViewImage: null, interiorImage: null, demoVideo: null });
    setExistingMediaUrls({ frontViewImage: "", leftSideImage: "", rightSideImage: "", rearViewImage: "", interiorImage: "", demoVideo: "" });
    setCurrentEditingGroupId(null);
    setStepCompletionStatus({ 1: false, 2: false, 3: false, 4: false, 5: false });
  };



  useEffect(() => {
    if (commonInfo.vehicleType) {
      // Reset form first before fetching new data
      resetFormForNewVehicleType();
      // Then fetch data for the selected type
      fetchVehicleByType(commonInfo.vehicleType);
    } else {
      // If no vehicle type selected, reset everything
      resetFormForNewVehicleType();
    }
  }, [commonInfo.vehicleType]);

  const steps = [
    { number: 1, title: "Basic Information" },
    { number: 2, title: "Technical Specification" },
    // { number: 3, title: "Pricing & Charges" },
    { number: 3, title: "Media & Description" },
    { number: 4, title: "Drivers & Maintenance" },
    { number: 5, title: "Vehicle Summary" },
  ];

  // const canAccessStep6 = commonInfo.vehicleType && vehicles.length > 0 && pricing.costPerDay;
  // const canAccessStep6 = completedSteps.has(5) || currentStep === 6;
  // Update this line
  const canAccessStep6 = stepCompletionStatus[5] === true;
  // or use this to allow access only if step 5 is completed

  const handleAddVehicle = (vehicleData) => {
    const newVehicle = {
      registrationNumber: vehicleData.registrationNumber,
      vehicleId: vehicleData.vehicleId,
      city: vehicleData.city,
      permitType: vehicleData.permitType,
      modelConfig: vehicleData.modelConfig,
      ownershipType: vehicleData.ownershipType,
      fuelType: vehicleData.fuelType,
      manufacturingYear: vehicleData.manufacturingYear,
      gpsEnabled: vehicleData.gpsEnabled,
      activeStatus: vehicleData.activeStatus,
      currentStatus: vehicleData.currentStatus,
      availableFrom: vehicleData.availableFrom,
      remarks: vehicleData.remarks,
      driverName: vehicleData.driverName,
      driverPhone: vehicleData.driverPhone,
      backupDriver: vehicleData.backupDriver,
      backupDriverPhone: vehicleData.backupDriverPhone,
      driverCharges: vehicleData.driverCharges,
      lastServiceDate: vehicleData.lastServiceDate,
      insuranceExpiryDate: vehicleData.insuranceExpiryDate,
      pollutionExpiryDate: vehicleData.pollutionExpiryDate,
    };

    if (editingVehicle) {
      setVehicles((prev) =>
        prev.map((v) =>
          unformatRegistrationNumber(v.registrationNumber) ===
            unformatRegistrationNumber(editingVehicle.registrationNumber)
            ? newVehicle
            : v
        )
      );
      toast.success("Vehicle updated successfully", {
        position: "bottom-right",
        autoClose: 3000,
      });
    } else {
      const exists = vehicles.some(
        (v) =>
          unformatRegistrationNumber(v.registrationNumber) ===
          vehicleData.registrationNumber
      );
      if (exists) {
        toast.error("Vehicle with this registration number already exists", {
          position: "bottom-right",
          autoClose: 3000,
        });
        return;
      }
      setVehicles((prev) => [...prev, newVehicle]);
      setExistingRegNumbersSet(
        (prev) => new Set([...prev, vehicleData.registrationNumber])
      );
      toast.success("Vehicle added successfully", {
        position: "bottom-right",
        autoClose: 3000,
      });
    }
    setEditingVehicle(null);
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  };

  // FIX 5: normalize both sides when comparing for delete
  const handleDeleteVehicle = (registrationNumber) => {
    if (window.confirm("Are you sure you want to remove this vehicle?")) {
      setVehicles((prev) =>
        prev.filter(
          (v) =>
            unformatRegistrationNumber(v.registrationNumber) !==
            unformatRegistrationNumber(registrationNumber)
        )
      );
      toast.success("Vehicle removed successfully", {
        position: "bottom-right",
        autoClose: 3000,
      });
    }
  };

  const handleSaveMaintenance = (registrationNumber, data) => {
    setVehicles((prev) =>
      prev.map((v) => {
        const vReg = unformatRegistrationNumber(v.registrationNumber);
        const targetReg = unformatRegistrationNumber(registrationNumber);
        if (vReg === targetReg) {
          return {
            ...v,
            driverName: data.driverName ?? v.driverName,
            driverPhone: data.driverPhone ?? v.driverPhone,
            backupDriver: data.backupDriver ?? v.backupDriver,
            backupDriverPhone: data.backupDriverPhone ?? v.backupDriverPhone,
            driverCharges: data.driverCharges ?? v.driverCharges,
            lastServiceDate: data.lastServiceDate ?? v.lastServiceDate,
            insuranceExpiryDate:
              data.insuranceExpiryDate ?? v.insuranceExpiryDate,
            pollutionExpiryDate:
              data.pollutionExpiryDate ?? v.pollutionExpiryDate,
          };
        }
        return v;
      })
    );
    toast.success(
      `Driver & Maintenance details saved for ${formatRegistrationNumber(
        registrationNumber
      )}`, {
      position: "bottom-right",
      autoClose: 3000,
    }
    );
  };


  const handleNextStep = async () => {
    const errors = validateStep(currentStep, { commonInfo, vehicles, techSpecs, vehicleDescription });
    if (Object.keys(errors).length > 0) {
      setStepErrors(errors);
      toast.error(Object.values(errors)[0], {
        position: "bottom-right",
        autoClose: 3000,
      });
      return;
    }
    setStepErrors({});
    const success = await saveCurrentStep(currentStep, currentStep + 1);
    if (!success && currentStep !== 1) return;
    if (currentStep === 1 && !currentEditingGroupId) return; // already moved inside save
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };



  const validateForm = () => {
    const errors = {};
    if (!commonInfo.vehicleType) errors.vehicleType = "Vehicle Type is required";
    if (vehicles.length === 0)
      errors.vehicles = "At least one vehicle is required";
    if (!pricing.costPerDay) errors.costPerDay = "Base Cost is required";

    const currentYear = new Date().getFullYear();
    for (const vehicle of vehicles) {
      if (vehicle.manufacturingYear) {
        const yearNum = parseInt(vehicle.manufacturingYear);
        if (isNaN(yearNum) || yearNum > currentYear) {
          errors.manufacturingYear = `Manufacturing year cannot exceed ${currentYear}`;
          break;
        }
      }
      if (vehicle.driverPhone && vehicle.driverPhone.length !== 10) {
        errors.driverPhone = "Driver phone must be 10 digits";
        break;
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep !== 5) {
      toast.info("Please complete all steps before submitting");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      const payload = {
        basicInfo: commonInfo,
        techSpecs,
        vehicleDescription,
        registrationVehicles: vehicles.map(v => ({
          registrationNumber: unformatRegistrationNumber(v.registrationNumber),
          vehicleId: v.vehicleId,
          city: v.city,
          modelConfig: v.modelConfig,
          permitType: v.permitType,
          ownershipType: v.ownershipType,
          fuelType: v.fuelType,
          manufacturingYear: v.manufacturingYear,
          gpsEnabled: v.gpsEnabled,
          activeStatus: v.activeStatus,
          statusAvailability: {
            currentStatus: v.currentStatus || "Available",
            availableFrom: v.availableFrom || null,
            remarks: v.remarks || "",
          },
          maintenance: {
            lastServiceDate: v.lastServiceDate || null,
            insuranceExpiryDate: v.insuranceExpiryDate || null,
            pollutionExpiryDate: v.pollutionExpiryDate || null,
          },
          driverDetails: {
            driverName: v.driverName || "",
            driverPhone: v.driverPhone || "",
            backupDriver: v.backupDriver || "",
            backupDriverPhone: v.backupDriverPhone || "",
            driverCharges: Number(v.driverCharges) || 0,
          },
        })),
        totalVehicles: vehicles.length,
        completedSteps: { step1: true, step2: true, step3: true, step4: true, step5: true },
        completedOnboarding: true,
      };
      formData.append("data", JSON.stringify(payload));
      Object.keys(mediaFiles).forEach(key => {
        if (mediaFiles[key] instanceof File) formData.append(key, mediaFiles[key]);
      });
      let response;
      if (currentEditingGroupId) {
        response = await axios.put(`${baseUrl}/api/updateVehicle/${currentEditingGroupId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await axios.post(`${baseUrl}/api/createVehicle`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      if (response.data.success) {
        toast.success("Onboarding completed successfully!", {
          position: "bottom-right",
          autoClose: 3000,
        });
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      toast.error("Submission failed", {
        position: "bottom-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };


  const mediaItems = [
    {
      key: "frontViewImage",
      label: "Front View",
      icon: "📸",
      accept: "image/*",
    },
    {
      key: "leftSideImage",
      label: "Left Side View",
      icon: "⬅️",
      accept: "image/*",
    },
    {
      key: "rightSideImage",
      label: "Right Side View",
      icon: "➡️",
      accept: "image/*",
    },
    {
      key: "rearViewImage",
      label: "Rear View",
      icon: "🔭",
      accept: "image/*",
    },
    {
      key: "interiorImage",
      label: "Interior",
      icon: "🖼️",
      accept: "image/*",
    },
    {
      key: "demoVideo",
      label: "Demo Video",
      icon: "🎬",
      accept: "video/*",
    },
  ];

  const getSelectOptions = () => ({
    customizedVehiclesOptions: [
      { value: "Non-Customized", label: "Non-Customized" },
    ],
    vehicleTypeOptions: vehicleTypes.map((vt) => ({
      value: vt._id,
      label: vt.typeName,
    })),
    screenTypeOptions: [
      { value: "LED Only", label: "LED Only" },
      { value: "Flex Only", label: "Flex Only" },
      { value: "Flex + LED", label: "Flex + LED" },
    ],
    soundQualityOptions: [
      { value: "Standard", label: "Standard" },
      { value: "High", label: "High" },
      { value: "Studio", label: "Studio" },
    ],
    // basePriceTypeOptions: [
    //   { value: "Per Day", label: "Per Day" },
    //   { value: "Per Hour", label: "Per Hour" },
    //   { value: "Per KM", label: "Per KM" },
    // ],
    numberOfScreensOptions: [
      { value: "1", label: "1 Screen" },
      { value: "2", label: "2 Screens" },
      { value: "3", label: "3 Screens" },
    ],
    displayVersionOptions: [
      { value: "P2", label: "P2" },
      { value: "P3", label: "P3" },
      { value: "P4", label: "P4" },
      { value: "P5", label: "P5" },
      { value: "P6", label: "P6" },
      { value: "P8", label: "P8" },
      { value: "P10", label: "P10" },
      { value: "NovaStar A8s", label: "NovaStar A8s" },
      { value: "NovaStar VX4S", label: "NovaStar VX4S" },
      { value: "Linsn", label: "Linsn" },
      { value: "ColorLight", label: "ColorLight" },
    ],
  });

  const selectOptions = getSelectOptions();

  const handleInputChange = (setter, field) => (e) => {
    setter((prev) => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ToastContainer position="bottom-right" />

      <div className="px-6 pt-6">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          🏠 Dashboard &gt; Vehicle Management &gt; Onboarding
        </div>
      </div>

      <div className="px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          🚌 Vehicle Onboarding Management
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Add and manage your advertising vehicles with complete details
        </p>
      </div>


      {/* 
      <AddVehicleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingVehicle(null);
        }}
        onSave={handleAddVehicle}
        editingVehicle={editingVehicle}
        existingRegNumbers={vehicles.map((v) => v.registrationNumber)}
        onCheckDuplicate={checkDuplicateRegistration}
        vehicleTypes={vehicleTypes}
      />


      <MaintenanceModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => {
          setIsMaintenanceModalOpen(false);
          setSelectedVehicle(null);
        }}
        vehicle={selectedVehicle}
        onSave={handleSaveMaintenance}
      />

      <VehicleTypeModal
        isOpen={isTypeModalOpen}
        onClose={() => {
          setIsTypeModalOpen(false);
          setEditingType(null);
        }}
        onSave={createVehicleType}
        onUpdate={updateVehicleType}
        onDelete={deleteVehicleType}
        editingType={editingType}
        vehicleTypes={vehicleTypes}
        setEditingType={setEditingType}
      /> */}

      {/* Modals – unchanged */}
      <AddVehicleModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingVehicle(null); }} onSave={handleAddVehicle}
        editingVehicle={editingVehicle} existingRegNumbers={vehicles.map(v => v.registrationNumber)} onCheckDuplicate={checkDuplicateRegistration} vehicleTypes={vehicleTypes} />
      <MaintenanceModal isOpen={isMaintenanceModalOpen} onClose={() => { setIsMaintenanceModalOpen(false); setSelectedVehicle(null); }}
        vehicle={selectedVehicle} onSave={handleSaveMaintenance} />
      <VehicleTypeModal isOpen={isTypeModalOpen} onClose={() => { setIsTypeModalOpen(false); setEditingType(null); }}
        onSave={createVehicleType} onUpdate={updateVehicleType} onDelete={deleteVehicleType} editingType={editingType} vehicleTypes={vehicleTypes} setEditingType={setEditingType} />

      {/* <form
        data-current-step={currentStep}
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const formStep = parseInt(e.currentTarget.getAttribute('data-current-step') || '0');
          if (currentStepRef.current === 6 && formStep === 6) {
            handleSubmit(e);
          }
        }}
      > */}
      <form onSubmit={handleSubmit}>
        <div className="px-6 pb-10">
          <StepperHeader
            steps={steps}
            currentStep={currentStep}


            // onStepClick={(stepNum) => {
            //   const maxAllowed = Math.max(...Array.from(completedSteps), 0) + 1;
            //   if (stepNum <= maxAllowed || stepNum <= currentStep) {
            //     currentStepRef.current = stepNum;
            //     setCurrentStep(stepNum);
            //   }
            // }}
            onStepClick={(num) => { if (num <= currentStep) setCurrentStep(num); }}
            canAccessStep6={canAccessStep6}
            stepCompletionStatus={stepCompletionStatus}

          />

          {isLoadingVehicleData && (
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 text-blue-600">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                Loading vehicle details...
              </div>
            </div>
          )}

          {/* ── STEP 1 ── */}
          {currentStep === 1 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <SectionHeader number={1} title="Basic Information" icon="📋" />
                <button
                  type="button"
                  onClick={() => setIsTypeModalOpen(true)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Manage Vehicle Types
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>
                    ⚙️ Customized <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Select
                      options={selectOptions.customizedVehiclesOptions}
                      placeholder="Select"
                      value={commonInfo.customizedType}
                      onChange={(value) =>
                        setCommonInfo((prev) => ({
                          ...prev,
                          customizedType: value,
                        }))
                      }
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>

                <div>
                  <Label>
                    🚍 Vehicle Type <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Select
                      options={selectOptions.vehicleTypeOptions}
                      placeholder="Select Type"
                      value={commonInfo.vehicleType}
                      onChange={(value) => {
                        setCommonInfo((prev) => ({
                          ...prev,
                          vehicleType: value,
                        }));
                      }}
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                  {/* {(validationErrors.vehicleType ||
                    stepErrors.vehicleType) && (
                      <p className="mt-1 text-xs text-red-500">
                        {validationErrors.vehicleType || stepErrors.vehicleType}
                      </p>
                    )} */}
                  {stepErrors.vehicleType && <p className="text-red-500 text-xs mt-1">{stepErrors.vehicleType}</p>}

                  <p className="mt-1 text-xs text-gray-400">
                    Selecting a vehicle type will auto-fill technical specs,
                    pricing, and existing vehicles if previously configured
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <Label className="text-base font-semibold">
                  🔢 Registration Numbers{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <p className="text-sm text-gray-500 mb-4">
                  Add one or more registration numbers (Format: XX NN XX NNNN)
                </p>

                {vehicles.length > 0 ? (
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left">Reg. Number</th>
                          <th className="px-4 py-3 text-left">Vehicle ID</th>
                          <th className="px-4 py-3 text-left">City</th>
                          <th className="px-4 py-3 text-left">Permit</th>
                          <th className="px-4 py-3 text-left">Fuel</th>
                          <th className="px-4 py-3 text-left">Status</th>
                          <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {vehicles.map((vehicle) => (
                          <tr
                            key={vehicle.registrationNumber}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-4 py-3 font-mono font-semibold text-blue-700">
                              {formatRegistrationNumber(
                                vehicle.registrationNumber
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {vehicle.vehicleId}
                            </td>
                            <td className="px-4 py-3">{vehicle.city}</td>
                            <td className="px-4 py-3">{vehicle.permitType}</td>
                            <td className="px-4 py-3">{vehicle.fuelType}</td>
                            <td className="px-4 py-3">
                              <StatusBadge
                                status={vehicle.currentStatus || "Available"}
                              />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex justify-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => handleEditVehicle(vehicle)}
                                  className="text-blue-500 hover:text-blue-700"
                                  title="Edit"
                                >
                                  <NotebookPen size={16} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedVehicle(vehicle);
                                    setIsMaintenanceModalOpen(true);
                                  }}
                                  className="text-green-500 hover:text-green-700"
                                  title="Maintenance"
                                >
                                  🔧
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteVehicle(
                                      vehicle.registrationNumber
                                    )
                                  }
                                  className="text-red-500 hover:text-red-700"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-10 border-2 border-dashed rounded-lg text-gray-400">
                    <div className="text-4xl mb-2">🚚</div>
                    <p>No vehicles added yet</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Another Vehicle
                </button>
                {/* {(validationErrors.vehicles || stepErrors.vehicles) && (
                  <p className="mt-1 text-xs text-red-500">
                    {validationErrors.vehicles || stepErrors.vehicles}
                  </p>
                )} */}
                {stepErrors.vehicles && <p className="text-red-500 text-xs mt-1">{stepErrors.vehicles}</p>}

              </div>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {currentStep === 2 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <SectionHeader number={2} title="Technical Specifications" icon="🖥️" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label>📺 Screen Type <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Select
                      options={selectOptions.screenTypeOptions}
                      placeholder="LED Only"
                      value={techSpecs.screenType}
                      onChange={(value) =>
                        setTechSpecs((prev) => ({ ...prev, screenType: value }))
                      }
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                  {stepErrors.screenType && (
                    <p className="mt-1 text-xs text-red-500">{stepErrors.screenType}</p>
                  )}
                </div>

                <div>
                  <Label>🔢 Number of Screens <span className="text-red-500">*</span></Label>
                  <RadioGroup
                    options={selectOptions.numberOfScreensOptions}
                    value={techSpecs.numberOfScreens}
                    onChange={(value) =>
                      setTechSpecs((prev) => ({ ...prev, numberOfScreens: value }))
                    }
                  />
                  {stepErrors.numberOfScreens && (
                    <p className="mt-1 text-xs text-red-500">{stepErrors.numberOfScreens}</p>
                  )}
                </div>

                {/* Left/Right Screen Size (ft) - Separate W & H */}
                <div>
                  <Label>Left/Right Screen Size (ft) <span className="text-red-500">*</span></Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="text"
                      value={techSpecs.leftRightScreenWidth}
                      placeholder="Width"
                      className="flex-1"
                      onChange={(e) => {
                        if (validateNumber(e.target.value, true)) {
                          setTechSpecs((prev) => ({ ...prev, leftRightScreenWidth: e.target.value }));
                        }
                      }}
                    />
                    <span className="text-gray-500">x</span>
                    <Input
                      type="text"
                      value={techSpecs.leftRightScreenHeight}
                      placeholder="Height"
                      className="flex-1"
                      onChange={(e) => {
                        if (validateNumber(e.target.value, true)) {
                          setTechSpecs((prev) => ({ ...prev, leftRightScreenHeight: e.target.value }));
                        }
                      }}
                    />
                  </div>
                  {stepErrors.screenSize && (
                    <p className="mt-1 text-xs text-red-500">{stepErrors.screenSize}</p>
                  )}
                </div>

                {/* Back Screen Size (ft) - Separate W & H */}
                <div>
                  <Label>Back Screen Size (ft)</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="text"
                      value={techSpecs.backScreenWidth}
                      placeholder="Width"
                      className="flex-1"
                      onChange={(e) => {
                        if (validateNumber(e.target.value, true)) {
                          setTechSpecs((prev) => ({ ...prev, backScreenWidth: e.target.value }));
                        }
                      }}
                    />
                    <span className="text-gray-500">x</span>
                    <Input
                      type="text"
                      value={techSpecs.backScreenHeight}
                      placeholder="Height"
                      className="flex-1"
                      onChange={(e) => {
                        if (validateNumber(e.target.value, true)) {
                          setTechSpecs((prev) => ({ ...prev, backScreenHeight: e.target.value }));
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Left/Right Resolution (px) - Separate W & H */}
                <div>
                  <Label>Left/Right Resolution (px) <span className="text-red-500">*</span></Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="text"
                      value={techSpecs.leftRightResolutionWidth}
                      placeholder="Width (px)"
                      className="flex-1"
                      onChange={(e) => {
                        if (validateNumber(e.target.value, false)) {
                          setTechSpecs((prev) => ({ ...prev, leftRightResolutionWidth: e.target.value }));
                        }
                      }}
                    />
                    <span className="text-gray-500">x</span>
                    <Input
                      type="text"
                      value={techSpecs.leftRightResolutionHeight}
                      placeholder="Height (px)"
                      className="flex-1"
                      onChange={(e) => {
                        if (validateNumber(e.target.value, false)) {
                          setTechSpecs((prev) => ({ ...prev, leftRightResolutionHeight: e.target.value }));
                        }
                      }}
                    />
                  </div>
                  {stepErrors.resolution && (
                    <p className="mt-1 text-xs text-red-500">{stepErrors.resolution}</p>
                  )}
                </div>

                {/* Back Resolution (px) - Separate W & H */}
                <div>
                  <Label>Back Resolution (px)</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="text"
                      value={techSpecs.backResolutionWidth}
                      placeholder="Width (px)"
                      className="flex-1"
                      onChange={(e) => {
                        if (validateNumber(e.target.value, false)) {
                          setTechSpecs((prev) => ({ ...prev, backResolutionWidth: e.target.value }));
                        }
                      }}
                    />
                    <span className="text-gray-500">x</span>
                    <Input
                      type="text"
                      value={techSpecs.backResolutionHeight}
                      placeholder="Height (px)"
                      className="flex-1"
                      onChange={(e) => {
                        if (validateNumber(e.target.value, false)) {
                          setTechSpecs((prev) => ({ ...prev, backResolutionHeight: e.target.value }));
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Audio Output */}
                <div>
                  <Label>Audio Output <span className="text-red-500">*</span></Label>
                  <Input
                    type="text"
                    value={techSpecs.audioOutput}
                    placeholder="e.g., 600 watts"
                    onChange={(e) => {
                      if (validateNumber(e.target.value, true)) {
                        setTechSpecs((prev) => ({ ...prev, audioOutput: e.target.value }));
                      }
                    }}
                  />
                  {stepErrors.audioOutput && (
                    <p className="mt-1 text-xs text-red-500">{stepErrors.audioOutput}</p>
                  )}
                </div>

                {/* Generator Capacity */}
                <div>
                  <Label>Generator Capacity <span className="text-red-500">*</span></Label>
                  <Input
                    type="text"
                    value={techSpecs.generatorCapacity}
                    placeholder="e.g., 7 KV"
                    onChange={handleInputChange(setTechSpecs, "generatorCapacity")}
                  />
                  {stepErrors.generatorCapacity && (
                    <p className="mt-1 text-xs text-red-500">{stepErrors.generatorCapacity}</p>
                  )}
                </div>

                {/* Display Version */}
                <div>
                  <Label>Display Version / Controller <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Select
                      options={selectOptions.displayVersionOptions}
                      placeholder="Select Display Version"
                      value={techSpecs.displayVersion}
                      onChange={(value) =>
                        setTechSpecs((prev) => ({ ...prev, displayVersion: value }))
                      }
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                  {stepErrors.displayVersion && (
                    <p className="mt-1 text-xs text-red-500">{stepErrors.displayVersion}</p>
                  )}
                </div>

                {/* Brightness */}
                <div>
                  <Label>Brightness (Nits)</Label>
                  <Input
                    type="text"
                    value={techSpecs.brightness}
                    placeholder="e.g. 5500"
                    onChange={(e) => {
                      if (validateNumber(e.target.value, false)) {
                        setTechSpecs((prev) => ({ ...prev, brightness: e.target.value }));
                      }
                    }}
                  />
                </div>

                {/* Sound Quality */}
                <div>
                  <Label>🎚️ Sound Quality <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Select
                      options={selectOptions.soundQualityOptions}
                      placeholder="Select Quality"
                      value={techSpecs.soundQuality}
                      onChange={(value) =>
                        setTechSpecs((prev) => ({ ...prev, soundQuality: value }))
                      }
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                  {stepErrors.soundQuality && (
                    <p className="mt-1 text-xs text-red-500">{stepErrors.soundQuality}</p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowMoreTech(!showMoreTech)}
                className="mt-6 text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
              >
                {showMoreTech ? "▲" : "▼"} Show More Technical Options
              </button>

              {showMoreTech && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mt-6 pt-6 border-t">
                  <div className="md:col-span-2">
                    <Label>✨ Additional Features</Label>
                    <Input
                      placeholder="e.g. Built-in Amplifier, USB, WiFi"
                      value={techSpecs.additionalFeatures}
                      onChange={(e) =>
                        setTechSpecs((prev) => ({ ...prev, additionalFeatures: e.target.value }))
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          )}


          {/* ── STEP 3 ── */}
          {/* {currentStep === 3 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <SectionHeader number={3} title="Pricing & Charges" icon="💰" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>
                    📊 Base Price Type{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Select
                      options={selectOptions.basePriceTypeOptions}
                      placeholder="Per Day"
                      value={pricing.basePriceType}
                      onChange={(value) =>
                        setPricing((prev) => ({
                          ...prev,
                          basePriceType: value,
                        }))
                      }
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>

                <div>
                  <Label>
                    💵 Per Day Cost (₹){" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="e.g. 5000"
                    value={pricing.costPerDay}
                    onChange={(e) => {
                      if (validateNumber(e.target.value, false)) {
                        setPricing((prev) => ({
                          ...prev,
                          costPerDay: e.target.value,
                        }));
                      }
                    }}
                  />
                  {(validationErrors.costPerDay || stepErrors.costPerDay) && (
                    <p className="mt-1 text-xs text-red-500">
                      {validationErrors.costPerDay || stepErrors.costPerDay}
                    </p>
                  )}
                </div>

                <div>
                  <Label>
                    Average KM Per Day{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={pricing.avgKmPerDay}
                    placeholder="e.g. 60"
                    onChange={(e) => {
                      if (validateNumber(e.target.value, false)) {
                        setPricing((prev) => ({
                          ...prev,
                          avgKmPerDay: e.target.value,
                        }));
                      }
                    }}
                  />
                  {stepErrors.avgKmPerDay && (
                    <p className="mt-1 text-xs text-red-500">
                      {stepErrors.avgKmPerDay}
                    </p>
                  )}
                </div>

                <div>
                  <Label>
                    Extra Charges (₹ / Km){" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={pricing.extraKmPrice}
                    placeholder="e.g. 12"
                    onChange={(e) => {
                      if (validateNumber(e.target.value, false)) {
                        setPricing((prev) => ({
                          ...prev,
                          extraKmPrice: e.target.value,
                        }));
                      }
                    }}
                  />
                  {stepErrors.extraKmPrice && (
                    <p className="mt-1 text-xs text-red-500">
                      {stepErrors.extraKmPrice}
                    </p>
                  )}
                </div>

                <div>
                  <Label>
                    Average Booking Hours{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={pricing.avgBookingHrs}
                    placeholder="e.g. 8"
                    onChange={(e) => {
                      if (validateNumber(e.target.value, false)) {
                        setPricing((prev) => ({
                          ...prev,
                          avgBookingHrs: e.target.value,
                        }));
                      }
                    }}
                  />
                  {stepErrors.avgBookingHrs && (
                    <p className="mt-1 text-xs text-red-500">
                      {stepErrors.avgBookingHrs}
                    </p>
                  )}
                </div>

                <div>
                  <Label>
                    Extra Charges (₹ / hr){" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={pricing.extraHrPrice}
                    placeholder="e.g. 500"
                    onChange={(e) => {
                      if (validateNumber(e.target.value, false)) {
                        setPricing((prev) => ({
                          ...prev,
                          extraHrPrice: e.target.value,
                        }));
                      }
                    }}
                  />
                  {stepErrors.extraHrPrice && (
                    <p className="mt-1 text-xs text-red-500">
                      {stepErrors.extraHrPrice}
                    </p>
                  )}
                </div>

                <div>
                  <Label>
                    RTO Charges (₹){" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={pricing.rtoCharges}
                    placeholder="e.g. 10,000"
                    onChange={(e) => {
                      if (validateNumber(e.target.value, false)) {
                        setPricing((prev) => ({
                          ...prev,
                          rtoCharges: e.target.value,
                        }));
                      }
                    }}
                  />
                  {stepErrors.rtoCharges && (
                    <p className="mt-1 text-xs text-red-500">
                      {stepErrors.rtoCharges}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Fuel Efficiency (km/l)</Label>
                  <Input
                    type="text"
                    value={pricing.fuelEfficiency}
                    placeholder="e.g. 6.5"
                    onChange={(e) => {
                      if (validateNumber(e.target.value, true)) {
                        setPricing((prev) => ({
                          ...prev,
                          fuelEfficiency: e.target.value,
                        }));
                      }
                    }}
                  />
                </div>

                <div>
                  <Label>
                    Minimum Booking Duration{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={pricing.minBookingDuration}
                    placeholder="e.g. 4 hrs"
                    onChange={handleInputChange(
                      setPricing,
                      "minBookingDuration"
                    )}
                  />
                  {stepErrors.minBookingDuration && (
                    <p className="mt-1 text-xs text-red-500">
                      {stepErrors.minBookingDuration}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Overtime Charges (₹ / hr)</Label>
                  <Input
                    type="text"
                    value={pricing.overtimeCharges}
                    placeholder="e.g. 500"
                    onChange={(e) => {
                      if (validateNumber(e.target.value, false)) {
                        setPricing((prev) => ({
                          ...prev,
                          overtimeCharges: e.target.value,
                        }));
                      }
                    }}
                  />
                </div>

                <div>
                  <Label>Waiting Charges (₹ / hr)</Label>
                  <Input
                    type="text"
                    value={pricing.waitingCharges}
                    placeholder="e.g. 300"
                    onChange={(e) => {
                      if (validateNumber(e.target.value, false)) {
                        setPricing((prev) => ({
                          ...prev,
                          waitingCharges: e.target.value,
                        }));
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )} */}

          {/* ── STEP 4 ── */}
          {currentStep === 3 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <SectionHeader
                number={3}
                title="Media & Description"
                icon="🎞️"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mediaItems.map(({ key, label, icon, accept }) => (
                  <MediaPreviewCard
                    key={key}
                    label={label}
                    icon={icon}
                    accept={accept}
                    file={mediaFiles[key]}
                    previewUrl={mediaPreviews[key]}
                    existingUrl={existingMediaUrls[key]}
                    onUpload={(file) => handleMediaUpload(key, file)}
                    onRemove={() => handleRemoveMedia(key)}
                  />
                ))}
              </div>

              <div className="mt-6">
                <Label>
                  📝 Vehicle Description{" "}
                  <span className="text-red-500">*</span>
                </Label>
                {/*
                  FIX 3: textarea is now a controlled component bound to the
                  vehicleDescription state. Previously it had no value/onChange
                  so the description was never captured and never sent to the backend.
                */}
                <textarea
                  rows={4}
                  className="w-full mt-1 rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                  placeholder="Enter detailed description about the vehicle..."
                  value={vehicleDescription}
                  onChange={(e) => setVehicleDescription(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* ── STEP 4 ── */}
          {currentStep === 4 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <SectionHeader
                number={4}
                title="Drivers & Maintenance"
                icon="🧑‍✈️"
              />

              {vehicles.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  Please add vehicles in Basic Info section first
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left">Reg. Number</th>
                          <th className="px-4 py-3 text-left">Driver Name</th>
                          <th className="px-4 py-3 text-left">Driver Phone</th>
                          <th className="px-4 py-3 text-left">Last Service</th>
                          <th className="px-4 py-3 text-left">
                            Insurance Expiry
                          </th>
                          <th className="px-4 py-3 text-left">
                            Pollution Expiry
                          </th>
                          <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {vehicles.map((vehicle) => (
                          <tr
                            key={vehicle.registrationNumber}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-4 py-3 font-mono font-semibold text-blue-600">
                              {formatRegistrationNumber(
                                vehicle.registrationNumber
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {vehicle.driverName || "-"}
                            </td>
                            <td className="px-4 py-3">
                              {vehicle.driverPhone || "-"}
                            </td>
                            <td className="px-4 py-3">
                              {vehicle.lastServiceDate || "-"}
                            </td>
                            <td className="px-4 py-3">
                              {vehicle.insuranceExpiryDate || "-"}
                            </td>
                            <td className="px-4 py-3">
                              {vehicle.pollutionExpiryDate || "-"}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedVehicle(vehicle);
                                  setIsMaintenanceModalOpen(true);
                                }}
                                className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                              >
                                Edit Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 5 ── */}
          {currentStep === 5 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <SectionHeader number={5} title="Vehicle Summary" icon="📊" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">🚚 Total Vehicles</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {vehicles.length}
                  </p>
                </div>
                {/* <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">💵 Base Price</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{pricing.costPerDay || 0}
                  </p>
                </div> */}
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-100">
                  <p className="text-sm text-gray-500">🚍 Vehicle Type</p>
                  <p className="text-lg font-semibold text-purple-600">
                    {vehicleTypes.find(
                      (vt) => vt._id === commonInfo.vehicleType
                    )?.typeName || "Not selected"}
                  </p>
                </div>
              </div>

              {vehicles.length > 0 && (
                <div className="mt-6">
                  <Label className="font-semibold">
                    🔢 Vehicles to be onboarded:
                  </Label>
                  <div className="mt-2 space-y-2">
                    {vehicles.map((v, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="w-6 text-gray-400">{idx + 1}.</span>
                        <span className="font-mono font-semibold text-blue-600">
                          {formatRegistrationNumber(v.registrationNumber)}
                        </span>
                        <span className="text-gray-400">—</span>
                        <span className="text-gray-600">{v.city}</span>
                        <span className="text-gray-400">·</span>
                        <span className="text-gray-500">{v.fuelType}</span>
                        <span className="ml-auto">
                          <StatusBadge
                            status={v.currentStatus || "Available"}
                          />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Please review all details before submitting. Click the
                  Submit button below to save all vehicles.
                </p>
              </div>
            </div>
          )}

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mt-6">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Uploading...</span>
                <span className="text-sm text-gray-600">
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* The button section at the bottom - keep as is but ensure submit only on step 6 */}
          <div className="flex justify-between gap-4 mt-8">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              × Cancel
            </button>
            <div className="flex gap-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  // onClick={() => setCurrentStep((prev) => prev - 1)}
                  onClick={() => {
                    const prev = currentStep - 1;
                    currentStepRef.current = prev;
                    setCurrentStep(prev);
                  }}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  ← Previous
                </button>
              )}
              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Save & Next →
                </button>
              ) : (
                // <button
                //   type="submit"
                //   disabled={loading || !stepCompletionStatus[5]}
                //   className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                // >
                //   {loading
                //     ? "Saving..."
                //     : `✅ Submit ${vehicles.length} Vehicle(s)`}
                // </button>
                <button type="submit" disabled={loading || !stepCompletionStatus[4]} className="px-6 py-2.5 bg-green-600 text-white rounded-lg">
                  {loading ? "Submitting..." : `Submit ${vehicles.length} Vehicle(s)`}
                </button>
              )}
            </div>
          </div>
        </div>
      </form>


    </div>
  );
}