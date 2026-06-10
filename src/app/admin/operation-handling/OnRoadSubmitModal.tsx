

import React, { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { X, Truck, Camera, Image, Trash2, AlertCircle, Upload, User, Phone, Car, FileImage, Eye, XCircle } from "lucide-react";
import API_BASE from "../../../../baseurl";
import { getToken } from "../../utils/auth";

interface OnRoadSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  onSuccess: () => void;
}

interface FileWithPreview {
  file: File;
  preview: string;
}

export default function OnRoadSubmitModal({ isOpen, onClose, orderId, onSuccess }: OnRoadSubmitModalProps) {
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [driverAlternatePhone, setDriverAlternatePhone] = useState("");
  const [vehicleRegNo, setVehicleRegNo] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, FileWithPreview | null>>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewLabel, setPreviewLabel] = useState<string>("");

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const fileFields = [
    { key: "gatepassPhoto", label: "Gatepass Photo", icon: FileImage, required: false  },
    { key: "vehicleFrontPhoto", label: "Vehicle Front Photo", icon: Camera, required: false },
    { key: "vehicleBackPhoto", label: "Vehicle Back Photo", icon: Camera, required: false },
    { key: "vehicleLeftPhoto", label: "Vehicle Left Photo", icon: Camera, required: false },
    { key: "vehicleRightPhoto", label: "Vehicle Right Photo", icon: Camera, required: false },
  ];

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const limited = cleaned.slice(0, 10);
    return limited;
  };

  const handlePhoneChange = (value: string, setter: (val: string) => void) => {
    const formatted = formatPhoneNumber(value);
    setter(formatted);
  };

  const handleFileChange = (key: string, file: File | null) => {
    if (file) {
   
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validImageTypes.includes(file.type)) {
        toast.error("Only image files (JPEG, PNG, GIF, WEBP) are allowed");
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("File size should be less than 5MB");
        return;
      }

   
      const preview = URL.createObjectURL(file);

      if (selectedFiles[key]?.preview) {
        URL.revokeObjectURL(selectedFiles[key]!.preview);
      }

      setSelectedFiles((prev) => ({ ...prev, [key]: { file, preview } }));
    } else {
      if (selectedFiles[key]?.preview) {
        URL.revokeObjectURL(selectedFiles[key]!.preview);
      }
      setSelectedFiles((prev) => ({ ...prev, [key]: null }));
    }
  };

  const removeFile = (key: string) => {
    if (selectedFiles[key]?.preview) {
      URL.revokeObjectURL(selectedFiles[key]!.preview);
    }
    setSelectedFiles((prev) => ({ ...prev, [key]: null }));
    if (fileInputRefs.current[key]) {
      fileInputRefs.current[key]!.value = "";
    }
  };

  const showPreview = (key: string, label: string) => {
    const fileData = selectedFiles[key];
    if (fileData?.preview) {
      setPreviewImage(fileData.preview);
      setPreviewLabel(label);
    }
  };

  const closePreview = () => {
    if (previewImage) {
      setPreviewImage(null);
      setPreviewLabel("");
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!driverName.trim()) errs.driverName = "Driver name is required";
    // if (!selectedFiles["gatepassPhoto"]) errs.gatepassPhoto = "Gatepass photo is required";
    if (!driverPhone.trim()) {
      errs.driverPhone = "Driver phone number is required";
    } else if (driverPhone.length !== 10) {
      errs.driverPhone = "Driver phone number must be exactly 10 digits";
    }

    if (driverAlternatePhone && driverAlternatePhone.length !== 10) {
      errs.driverAlternatePhone = "Alternate phone number must be exactly 10 digits";
    }

    if (!vehicleRegNo.trim()) errs.vehicleRegNo = "Vehicle registration number is required";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const token = getToken();
      const formData = new FormData();

     
      formData.append("driverName", driverName.trim());
      formData.append("driverPhone", `${driverPhone.trim()}`);
      formData.append("driverAlternatePhone", driverAlternatePhone ? `${driverAlternatePhone.trim()}` : "");
      formData.append("vehicleRegistrationNumber", vehicleRegNo.trim().toUpperCase());

    
      Object.entries(selectedFiles).forEach(([key, fileData]) => {
        if (fileData?.file) {
          formData.append(key, fileData.file);
        }
      });

      const response = await axios.post(
        `${API_BASE}admin/pipeline/${orderId}/onroad-details`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("On Road details submitted successfully!");
      onSuccess();
      onClose();

      // Cleanup all preview URLs
      Object.values(selectedFiles).forEach(fileData => {
        if (fileData?.preview) {
          URL.revokeObjectURL(fileData.preview);
        }
      });
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 rounded-t-2xl p-6 z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">On Road Details</h2>
                <p className="text-sm text-blue-100 mt-0.5">Fill driver and vehicle details to proceed</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
         
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Driver Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Driver Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      className={`w-full border rounded-xl pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 text-sm transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.driverName ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600"
                        }`}
                      placeholder="Enter driver full name"
                    />
                  </div>
                  {errors.driverName && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      {errors.driverName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Driver Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">+91</span>
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={driverPhone}
                      onChange={(e) => handlePhoneChange(e.target.value, setDriverPhone)}
                      maxLength={10}
                      className={`w-full border rounded-xl pl-12 pr-10 py-2.5 bg-white dark:bg-gray-800 text-sm transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.driverPhone ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600"
                        }`}
                      placeholder="9876543210"
                    />
                  </div>
                  {errors.driverPhone && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      {errors.driverPhone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Driver Alternate Phone <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">+91</span>
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={driverAlternatePhone}
                      onChange={(e) => handlePhoneChange(e.target.value, setDriverAlternatePhone)}
                      maxLength={10}
                      className={`w-full border rounded-xl pl-12 pr-10 py-2.5 bg-white dark:bg-gray-800 text-sm transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.driverAlternatePhone ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600"
                        }`}
                      placeholder="9876543210"
                    />
                  </div>
                  {errors.driverAlternatePhone && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      {errors.driverAlternatePhone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Vehicle Registration Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={vehicleRegNo}
                      onChange={(e) => setVehicleRegNo(e.target.value.toUpperCase())}
                      className={`w-full border rounded-xl pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 text-sm uppercase transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.vehicleRegNo ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600"
                        }`}
                      placeholder="TN01AB1234"
                    />
                  </div>
                  {errors.vehicleRegNo && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.vehicleRegNo}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* File Uploads Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Vehicle Photos</h3>
                <span className="text-xs text-gray-500">(Optional)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fileFields.map(({ key, label, icon: Icon, required }) => (
                  <div key={key} className={`border rounded-xl p-3 bg-gray-50 dark:bg-gray-800/50 transition-colors hover:border-gray-300 dark:hover:border-gray-600 ${errors[key] ? "border-red-400 dark:border-red-500" : "border-gray-200 dark:border-gray-700"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                    </div>

                    {selectedFiles[key] ? (
                      <div className="space-y-2">
                        <div className="relative group">
                          <img
                            src={selectedFiles[key]?.preview}
                            alt={label}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                            <button
                              onClick={() => showPreview(key, label)}
                              className="p-1.5 bg-white rounded-full hover:bg-gray-100 transition-colors"
                              title="Preview"
                            >
                              <Eye className="w-4 h-4 text-gray-700" />
                            </button>
                            <button
                              onClick={() => removeFile(key)}
                              className="p-1.5 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                              title="Remove"
                            >
                              <Trash2 className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Image className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                              {selectedFiles[key]?.file.name}
                            </span>
                            <span className="text-xs text-gray-400 flex-shrink-0">
                              ({(selectedFiles[key]?.file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Upload className="w-5 h-5 text-gray-400" />
                            <span className="text-xs text-gray-500">Click to upload image</span>
                            <span className="text-xs text-gray-400">JPEG, PNG, GIF up to 5MB</span>
                          </div>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          ref={(el) => { fileInputRefs.current[key] = el; }}
                          onChange={(e) => handleFileChange(key, e.target.files?.[0] || null)}
                          className="hidden"
                        />
                      </label>
                    )}
                    {errors[key] && (
                      <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors[key]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 text-white text-sm font-medium transition-all duration-200 shadow-lg shadow-blue-500/25"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </div>
                ) : (
                  "Submit & Move to On Road"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

    
      {previewImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={closePreview}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <button
              onClick={closePreview}
              className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
            {previewLabel && (
              <div className="absolute -top-12 left-0 text-white text-sm font-medium">
                {previewLabel}
              </div>
            )}
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}