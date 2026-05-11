/* eslint-disable */
// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { ChevronDownIcon, PlusIcon } from "@/icons";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Switch from "@/components/form/switch/Switch";
import axios from "axios";

export default function VehicleOnboardingForm() {
  const [vehicleCount, setVehicleCount] = useState(1);
  const [registrationNumbers, setRegistrationNumbers] = useState([""]);
  const [registrationErrors, setRegistrationErrors] = useState({});
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Media files state
  const [mediaFiles, setMediaFiles] = useState({
    frontViewImage: null,
    leftSideImage: null,
    rightSideImage: null,
    rearViewImage: null,
    interiorImage: null,
    demoVideo: null,
  });

  const [basicInfo, setBasicInfo] = useState({
    customizedType: "",
    vehicleId: "",
    vehicleName: "",
    city: "",
    permitType: "",
    vehicleType: "",
    modelConfig: "",
    gpsEnabled: true,
    ownershipType: "",
    manufacturingYear: "",
    status: true,
  });

  const [techSpecs, setTechSpecs] = useState({
    screenType: "LED Only",
    numberOfScreens: "",
    screenSizeWidth: "",
    screenSizeHeight: "",
    backScreenWidth: "",
    backScreenHeight: "",
    resolution: "",
    backResolution: "",
    brightness: "",
    displayVersion: "",
    supportedFormats: "",
    audioSystem: "",
    soundQuality: "",
    generatorCapacity: "",
    visibilityVersion: "",
    additionalFeatures: "",
    videoFormat: "",
    videoSize: "",
    backVideoSize: "",
    audioOutput: "",
  });

  const [vehicleDetails, setVehicleDetails] = useState({
    fuelType: "",
    avgKmPerDay: "",
    extraKmPrice: "",
    avgBookingHrs: "",
    extraHrPrice: "",
    rtoCharges: "",
    fuelEfficiency: "",
    vehicleDescription: "",
  });

  const [pricing, setPricing] = useState({
    basePriceType: "Per Day",
    costPerDay: "",
    kmCost: "",
    overtimeCharges: "",
    waitingCharges: "",
    minBookingDuration: "",
  });

  const [driverDetails, setDriverDetails] = useState({
    driverName: "",
    driverPhone: "",
    backupDriver: "",
    backupDriverPhone: "",
  });

  const [statusAvailability, setStatusAvailability] = useState({
    currentStatus: "",
    availableFrom: "",
    remarks: "",
  });

  const [maintenanceInfo, setMaintenanceInfo] = useState({
    maintenanceStatus: "No",
    expectedReadyDate: "",
    maintenanceNotes: "",
    manufacturingYr: "",
    lastServiceDate: "",
    nextServiceDueDate: "",
    insuranceExpiryDate: "",
    pollutionCertificateExpiryDate: "",
  });

  // Function to format registration number
  const formatRegistrationNumber = (value) => {
    // Remove all spaces and convert to uppercase
    let cleaned = value.toUpperCase().replace(/\s/g, '');
    
    // Remove any invalid characters (only letters and numbers)
    cleaned = cleaned.replace(/[^A-Z0-9]/g, '');
    
    // Format: TN01AB1234 -> TN 01 AB 1234
    let formatted = '';
    
    if (cleaned.length >= 2) {
      formatted += cleaned.substring(0, 2); // State code (TN)
      if (cleaned.length >= 4) {
        formatted += ' ' + cleaned.substring(2, 4); // District code (01)
        if (cleaned.length >= 6) {
          formatted += ' ' + cleaned.substring(4, 6); // Series (AB)
          if (cleaned.length >= 10) {
            formatted += ' ' + cleaned.substring(6, 10); // Number (1234)
          } else if (cleaned.length > 6) {
            formatted += ' ' + cleaned.substring(6);
          }
        } else if (cleaned.length > 4) {
          formatted += ' ' + cleaned.substring(4);
        }
      } else if (cleaned.length > 2) {
        formatted += ' ' + cleaned.substring(2);
      }
    } else {
      formatted = cleaned;
    }
    
    return formatted.trim();
  };

  // Validate registration number
  const validateRegistrationNumber = (regNumber) => {
    if (!regNumber || regNumber.trim() === '') {
      return { isValid: false, error: 'Registration number is required' };
    }
    
    // Pattern: TN 01 AB 1234 (2 letters, 2 numbers, 2 letters, 4 numbers)
    const pattern = /^[A-Z]{2}\s\d{2}\s[A-Z]{2}\s\d{4}$/;
    
    if (pattern.test(regNumber)) {
      return { isValid: true, error: null };
    }
    
    return { 
      isValid: false, 
      error: 'Invalid format. Use: TN 01 AB 1234 (2 letters, 2 numbers, 2 letters, 4 numbers)' 
    };
  };

  // Handle registration number change with formatting
  const handleRegNumberChange = (index, value) => {
    const formattedValue = formatRegistrationNumber(value);
    const newRegNumbers = [...registrationNumbers];
    newRegNumbers[index] = formattedValue;
    setRegistrationNumbers(newRegNumbers);
    
    // Validate and show/hide error
    const validation = validateRegistrationNumber(formattedValue);
    if (!validation.isValid && formattedValue.trim() !== '') {
      setRegistrationErrors(prev => ({ ...prev, [index]: validation.error }));
    } else {
      setRegistrationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[index];
        return newErrors;
      });
    }
    
    // Update vehicle count if needed
    if (newRegNumbers.length !== vehicleCount) {
      setVehicleCount(newRegNumbers.length);
    }
  };

  // Handle vehicle count change
  const handleVehicleCountChange = (e) => {
    const count = parseInt(e.target.value) || 1;
    setVehicleCount(count);

    const newRegNumbers = [...registrationNumbers];
    if (count > registrationNumbers.length) {
      for (let i = registrationNumbers.length; i < count; i++) {
        newRegNumbers.push("");
      }
    } else {
      newRegNumbers.splice(count);
      // Remove errors for removed indices
      setRegistrationErrors(prev => {
        const newErrors = { ...prev };
        for (let i = count; i < prev.length; i++) {
          delete newErrors[i];
        }
        return newErrors;
      });
    }
    setRegistrationNumbers(newRegNumbers);
  };

  const addRegNumberField = () => {
    setRegistrationNumbers([...registrationNumbers, ""]);
    setVehicleCount(registrationNumbers.length + 1);
  };

  const removeRegNumberField = (index) => {
    const newRegNumbers = registrationNumbers.filter((_, i) => i !== index);
    setRegistrationNumbers(newRegNumbers);
    setVehicleCount(newRegNumbers.length);
    // Remove error for deleted index
    setRegistrationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[index];
      // Re-index errors
      const reindexedErrors = {};
      Object.keys(newErrors).forEach(key => {
        const numKey = parseInt(key);
        if (numKey > index) {
          reindexedErrors[numKey - 1] = newErrors[key];
        } else {
          reindexedErrors[numKey] = newErrors[key];
        }
      });
      return reindexedErrors;
    });
  };

  // Media file handlers
  const handleMediaFileChange = (field, file) => {
    if (file) {
      setMediaFiles(prev => ({ ...prev, [field]: file }));
    }
  };

  // Form handlers
  const handleGpsSwitchChange = (checked) => {
    setBasicInfo((prev) => ({ ...prev, gpsEnabled: checked }));
  };

  const handleStatusSwitchChange = (checked) => {
    setBasicInfo((prev) => ({ ...prev, status: checked }));
  };

  const handleBasicInfoChange = (field) => (value) => {
    setBasicInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleTechSpecsChange = (field) => (value) => {
    setTechSpecs((prev) => ({ ...prev, [field]: value }));
  };

  const handleVehicleDetailsChange = (field) => (value) => {
    setVehicleDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handlePricingChange = (field) => (value) => {
    setPricing((prev) => ({ ...prev, [field]: value }));
  };

  const handleDriverDetailsChange = (field) => (value) => {
    setDriverDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleStatusAvailabilityChange = (field) => (value) => {
    setStatusAvailability((prev) => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (setter, field) => (e) => {
    setter((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // Vehicle Type Templates with updated specs including back screen dimensions
  const vehicleTemplates = {
    "Standard 3 Side LED": {
      screenType: "Flex + LED",
      numberOfScreens: "3",
      screenSizeWidth: "14",
      screenSizeHeight: "7",
      backScreenWidth: "7",
      backScreenHeight: "7",
      resolution: "1040x520",
      backResolution: "480x520",
      videoFormat: "MP4",
      videoSize: "1040x520 px",
      backVideoSize: "480x520 px",
      audioOutput: "600 watts",
      generatorCapacity: "7 KVA",
      supportedFormats: "MP4, JPG, PNG",
      additionalFeatures: "Left & Right + Back screens",
    },
    "Single Side LED 17ft": {
      screenType: "LED Only",
      numberOfScreens: "1",
      screenSizeWidth: "17",
      screenSizeHeight: "8",
      backScreenWidth: "",
      backScreenHeight: "",
      resolution: "1080x720",
      backResolution: "",
      videoFormat: "MP4",
      videoSize: "1080x720 px",
      backVideoSize: "",
      audioOutput: "600 watts",
      generatorCapacity: "10 KV",
      soundQuality: "High",
      additionalFeatures: "Theatre-grade sound system",
    },
    "L Shape Dual LED": {
      screenType: "Flex + LED",
      numberOfScreens: "2",
      screenSizeWidth: "9",
      screenSizeHeight: "6.5",
      backScreenWidth: "5",
      backScreenHeight: "6.5",
      resolution: "416x288",
      backResolution: "256x288",
      videoFormat: "MP4",
      videoSize: "416x288 px",
      backVideoSize: "256x288 px",
      audioOutput: "600 watts",
      generatorCapacity: "7 KVA",
      additionalFeatures: "L-shaped configuration, supports separate videos",
    },
    "Premium 2 Sided LED": {
      screenType: "LED Only",
      numberOfScreens: "2",
      screenSizeWidth: "18",
      screenSizeHeight: "7",
      backScreenWidth: "7",
      backScreenHeight: "7",
      resolution: "1080x520",
      backResolution: "480x520",
      videoFormat: "MP4",
      videoSize: "1080x520 px",
      backVideoSize: "480x520 px",
      audioOutput: "600 watts",
      generatorCapacity: "7 KVA",
      additionalFeatures: "Left & Right screens + Back screen",
    },
  };

  // Load template when vehicle type changes
  useEffect(() => {
    if (selectedTemplate && vehicleTemplates[selectedTemplate]) {
      const template = vehicleTemplates[selectedTemplate];
      setTechSpecs((prev) => ({
        ...prev,
        screenType: template.screenType || prev.screenType,
        numberOfScreens: template.numberOfScreens || prev.numberOfScreens,
        screenSizeWidth: template.screenSizeWidth || prev.screenSizeWidth,
        screenSizeHeight: template.screenSizeHeight || prev.screenSizeHeight,
        backScreenWidth: template.backScreenWidth || prev.backScreenWidth,
        backScreenHeight: template.backScreenHeight || prev.backScreenHeight,
        resolution: template.resolution || prev.resolution,
        backResolution: template.backResolution || prev.backResolution,
        videoFormat: template.videoFormat || prev.videoFormat,
        videoSize: template.videoSize || prev.videoSize,
        backVideoSize: template.backVideoSize || prev.backVideoSize,
        audioOutput: template.audioOutput || prev.audioOutput,
        generatorCapacity: template.generatorCapacity || prev.generatorCapacity,
        supportedFormats: template.supportedFormats || prev.supportedFormats,
        soundQuality: template.soundQuality || prev.soundQuality,
        additionalFeatures: template.additionalFeatures || prev.additionalFeatures,
      }));
    }
  }, [selectedTemplate]);

  // Submit form with file upload
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all registration numbers
    let hasError = false;
    const newErrors = {};
    
    registrationNumbers.forEach((regNum, index) => {
      if (!regNum || regNum.trim() === '') {
        newErrors[index] = 'Registration number is required';
        hasError = true;
      } else {
        const validation = validateRegistrationNumber(regNum);
        if (!validation.isValid) {
          newErrors[index] = validation.error;
          hasError = true;
        }
      }
    });
    
    setRegistrationErrors(newErrors);
    
    if (hasError) {
      alert('Please fix the registration number errors before submitting.');
      return;
    }
    
    setLoading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();

      // Basic Info
      Object.keys(basicInfo).forEach(key => {
        if (basicInfo[key] !== undefined && basicInfo[key] !== '') {
          formData.append(key, basicInfo[key]);
        }
      });

      // Registration Numbers
      const validRegNumbers = registrationNumbers.filter(regNum => regNum && regNum.trim());
      validRegNumbers.forEach(regNum => {
        formData.append("vehicleNumber", regNum);
      });

      formData.append("vehicleCount", vehicleCount);
      formData.append("selectedTemplate", selectedTemplate);

      // Tech Specs
      Object.keys(techSpecs).forEach(key => {
        if (techSpecs[key] && techSpecs[key] !== '') {
          formData.append(key, techSpecs[key]);
        }
      });

      // Vehicle Details
      Object.keys(vehicleDetails).forEach(key => {
        if (vehicleDetails[key] && vehicleDetails[key] !== '') {
          formData.append(key, vehicleDetails[key]);
        }
      });

      // Pricing
      Object.keys(pricing).forEach(key => {
        if (pricing[key] && pricing[key] !== '') {
          formData.append(key, pricing[key]);
        }
      });

      // Driver Details
      Object.keys(driverDetails).forEach(key => {
        if (driverDetails[key] && driverDetails[key] !== '') {
          formData.append(key, driverDetails[key]);
        }
      });

      // Status Availability
      Object.keys(statusAvailability).forEach(key => {
        if (statusAvailability[key] && statusAvailability[key] !== '') {
          formData.append(key, statusAvailability[key]);
        }
      });

      // Maintenance Info
      Object.keys(maintenanceInfo).forEach(key => {
        if (maintenanceInfo[key] && maintenanceInfo[key] !== '') {
          formData.append(key, maintenanceInfo[key]);
        }
      });

      // Media Files
      if (mediaFiles.frontViewImage) {
        formData.append("frontViewImage", mediaFiles.frontViewImage);
      }
      if (mediaFiles.leftSideImage) {
        formData.append("leftSideImage", mediaFiles.leftSideImage);
      }
      if (mediaFiles.rightSideImage) {
        formData.append("rightSideImage", mediaFiles.rightSideImage);
      }
      if (mediaFiles.rearViewImage) {
        formData.append("rearViewImage", mediaFiles.rearViewImage);
      }
      if (mediaFiles.interiorImage) {
        formData.append("interiorImage", mediaFiles.interiorImage);
      }
      if (mediaFiles.demoVideo) {
        formData.append("demoVideo", mediaFiles.demoVideo);
      }

      const response = await axios.post("http://localhost:3001/api/createVehicle", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      if (response.data.success) {
        alert(`Successfully created ${vehicleCount} vehicle(s)!`);
        // Reset form
        setBasicInfo({
          customizedType: "",
          vehicleId: "",
          vehicleName: "",
          city: "",
          permitType: "",
          vehicleType: "",
          modelConfig: "",
          gpsEnabled: true,
          ownershipType: "",
          manufacturingYear: "",
          status: true,
        });
        setRegistrationNumbers([""]);
        setVehicleCount(1);
        setRegistrationErrors({});
        setMediaFiles({
          frontViewImage: null,
          leftSideImage: null,
          rightSideImage: null,
          rearViewImage: null,
          interiorImage: null,
          demoVideo: null,
        });
        setSelectedTemplate("");
        setTechSpecs({
          screenType: "LED Only",
          numberOfScreens: "",
          screenSizeWidth: "",
          screenSizeHeight: "",
          backScreenWidth: "",
          backScreenHeight: "",
          resolution: "",
          backResolution: "",
          brightness: "",
          displayVersion: "",
          supportedFormats: "",
          audioSystem: "",
          soundQuality: "",
          generatorCapacity: "",
          visibilityVersion: "",
          additionalFeatures: "",
          videoFormat: "",
          videoSize: "",
          backVideoSize: "",
          audioOutput: "",
        });
        setVehicleDetails({
          fuelType: "",
          avgKmPerDay: "",
          extraKmPrice: "",
          avgBookingHrs: "",
          extraHrPrice: "",
          rtoCharges: "",
          fuelEfficiency: "",
          vehicleDescription: "",
        });
        setPricing({
          basePriceType: "Per Day",
          costPerDay: "",
          kmCost: "",
          overtimeCharges: "",
          waitingCharges: "",
          minBookingDuration: "",
        });
        setDriverDetails({
          driverName: "",
          driverPhone: "",
          backupDriver: "",
          backupDriverPhone: "",
        });
        setStatusAvailability({
          currentStatus: "",
          availableFrom: "",
          remarks: "",
        });
        setMaintenanceInfo({
          maintenanceStatus: "No",
          expectedReadyDate: "",
          maintenanceNotes: "",
          manufacturingYr: "",
          lastServiceDate: "",
          nextServiceDueDate: "",
          insuranceExpiryDate: "",
          pollutionCertificateExpiryDate: "",
        });
      }
    } catch (error) {
      console.error("Error saving vehicle:", error);
      alert(error.response?.data?.message || "Error saving vehicle. Please try again.");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const selectOptions = {
    cityOptions: [
      { value: "Chennai", label: "Chennai" },
      { value: "Madurai", label: "Madurai" },
      { value: "Coimbatore", label: "Coimbatore" },
    ],
    permitOptions: [
      { value: "Local", label: "Local" },
      { value: "State", label: "State" },
      { value: "National", label: "National" },
    ],
    vehicleTypeOptions: [
      { value: "Standard 3 Side LED", label: "Standard 3 Side LED" },
      { value: "Single Side LED 17ft", label: "Single Side LED 17ft" },
      { value: "L Shape Dual LED", label: "L Shape Dual LED" },
      { value: "Premium 2 Sided LED", label: "Premium 2 Sided LED" },
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
    customizedVehiclesOptions: [
      { value: "Customized", label: "Customized" },
      { value: "Non-Customized", label: "Non-Customized" },
    ],
    screenTypeOptions: [
      { value: "LED Only", label: "LED Only" },
      { value: "Flex Only", label: "Flex Only" },
      { value: "Flex + LED", label: "Flex + LED" },
    ],
    audioSystemOptions: [
      { value: "Basic", label: "Basic" },
      { value: "Premium", label: "Premium" },
      { value: "Professional", label: "Professional" },
    ],
    soundQualityOptions: [
      { value: "Standard", label: "Standard" },
      { value: "High", label: "High" },
      { value: "Studio", label: "Studio" },
    ],
    fuelTypeOptions: [
      { value: "Petrol", label: "Petrol" },
      { value: "Diesel", label: "Diesel" },
      { value: "CNG", label: "CNG" },
      { value: "Electric", label: "Electric" },
    ],
    basePriceTypeOptions: [
      { value: "Per Day", label: "Per Day" },
      { value: "Per Hour", label: "Per Hour" },
      { value: "Per KM", label: "Per KM" },
    ],
    statusOptions: [
      { value: "Available", label: "Available" },
      { value: "Booked", label: "Booked" },
      { value: "Maintenance", label: "Maintenance" },
      { value: "Off-Road", label: "Off-Road" },
    ],
  };

  // File input component with preview
  const FileUploadField = ({ label, fieldName, accept }) => (
    <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center dark:border-gray-600">
      <div className="mb-2 text-sm font-medium">{label}</div>
      <input
        type="file"
        id={fieldName}
        accept={accept}
        onChange={(e) => handleMediaFileChange(fieldName, e.target.files[0])}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => document.getElementById(fieldName).click()}
        className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
      >
        {mediaFiles[fieldName] ? mediaFiles[fieldName].name : "Choose File"}
      </button>
      {mediaFiles[fieldName] && (
        <p className="mt-1 text-xs text-green-600">✓ File selected</p>
      )}
    </div>
  );

  // Registration Number Input Component
  const RegistrationNumberInput = ({ value, onChange, onRemove, showRemove, index, error }) => (
    <div>
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(index, e.target.value)}
            placeholder={`Vehicle ${index + 1} Registration Number (e.g., TN 01 AB 1234)`}
            className={`flex-1 ${error ? 'border-red-500 focus:border-red-500' : ''}`}
          />
        </div>
        {showRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="px-3 py-2 text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
      {value && !error && (
        <p className="mt-1 text-xs text-green-500">✓ Valid format</p>
      )}
    </div>
  );

  return (
    <div>
      <PageBreadcrumb pageTitle="Vehicle Onboarding Management" />
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Section 1: Basic Information */}
          <ComponentCard title="1. Basic Information">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label>Customized Type <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Select
                    options={selectOptions.customizedVehiclesOptions}
                    placeholder="Select"
                    onChange={handleBasicInfoChange("customizedType")}
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>

              <div>
                <Label>Vehicle ID</Label>
                <Input
                  type="text"
                  value={basicInfo.vehicleId}
                  onChange={handleInputChange(setBasicInfo, "vehicleId")}
                  placeholder="Auto generated"
                />
              </div>

              <div>
                <Label>Vehicle Type <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Select
                    options={selectOptions.vehicleTypeOptions}
                    placeholder="Select Type"
                    onChange={(value) => {
                      handleBasicInfoChange("vehicleType")(value);
                      setSelectedTemplate(value);
                    }}
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>

              <div>
                <Label>Vehicle Name / Code <span className="text-red-500">*</span></Label>
                <Input
                  type="text"
                  value={basicInfo.vehicleName}
                  onChange={handleInputChange(setBasicInfo, "vehicleName")}
                  placeholder="e.g. Single-side LED vehicles"
                />
              </div>

              <div>
                <Label>Number of Vehicles <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={vehicleCount}
                  onChange={handleVehicleCountChange}
                  placeholder="Enter count"
                />
              </div>

              <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                <Label>Registration Numbers <span className="text-red-500">*</span></Label>
                <div className="space-y-2">
                  {registrationNumbers.map((regNum, index) => (
                    <RegistrationNumberInput
                      key={index}
                      index={index}
                      value={regNum}
                      onChange={handleRegNumberChange}
                      onRemove={removeRegNumberField}
                      showRemove={registrationNumbers.length > 1}
                      error={registrationErrors[index]}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={addRegNumberField}
                    className="flex items-center gap-2 text-brand-600 hover:text-brand-700"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add Another Vehicle
                  </button>
                </div>
              </div>

              <div>
                <Label>City / Operating Location <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Select
                    options={selectOptions.cityOptions}
                    placeholder="Select City"
                    onChange={handleBasicInfoChange("city")}
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>

              <div>
                <Label>Permit Type <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Select
                    options={selectOptions.permitOptions}
                    placeholder="Select Permit"
                    onChange={handleBasicInfoChange("permitType")}
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>

              <div>
                <Label>Model / Configuration <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Select
                    options={selectOptions.modelOptions}
                    placeholder="Select Model"
                    onChange={handleBasicInfoChange("modelConfig")}
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>

              <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                <div className="flex gap-6">
                  <div>
                    <Label>GPS Enabled <span className="text-red-500">*</span></Label>
                    <Switch
                      label={basicInfo.gpsEnabled ? "Enabled" : "Disabled"}
                      defaultChecked={basicInfo.gpsEnabled}
                      onChange={handleGpsSwitchChange}
                    />
                  </div>
                  <div>
                    <Label>Status <span className="text-red-500">*</span></Label>
                    <Switch
                      label={basicInfo.status ? "Active" : "Inactive"}
                      defaultChecked={basicInfo.status}
                      onChange={handleStatusSwitchChange}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Ownership Type <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Select
                    options={selectOptions.ownershipOptions}
                    placeholder="Select"
                    onChange={handleBasicInfoChange("ownershipType")}
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>

              <div>
                <Label>Fuel Type <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Select
                    options={selectOptions.fuelTypeOptions}
                    placeholder="Select"
                    onChange={handleVehicleDetailsChange("fuelType")}
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>

              <div>
                <Label>Manufacturing / Vendor</Label>
                <Input type="text" placeholder="Enter manufacturer name" />
              </div>

              <div>
                <Label>Manufacturing Year</Label>
                <Input
                  type="text"
                  placeholder="e.g. 2023"
                  onChange={handleInputChange(setBasicInfo, "manufacturingYear")}
                />
              </div>
            </div>
          </ComponentCard>

          {/* Section 2: Display & Technical Specifications */}
          <ComponentCard title="2. Display & Technical Specifications">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label>Screen Type <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Select
                    options={selectOptions.screenTypeOptions}
                    placeholder="LED Only"
                    value={techSpecs.screenType}
                    onChange={handleTechSpecsChange("screenType")}
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>

              <div>
                <Label>Number of Screens <span className="text-red-500">*</span></Label>
                <Input
                  type="text"
                  value={techSpecs.numberOfScreens}
                  onChange={handleInputChange(setTechSpecs, "numberOfScreens")}
                  placeholder="Number of screens"
                />
              </div>

              <div>
                <Label>Left/Right Screen Size</Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={techSpecs.screenSizeWidth}
                    placeholder="Width (ft)"
                    className="flex-1"
                    onChange={handleInputChange(setTechSpecs, "screenSizeWidth")}
                  />
                  <Input
                    type="text"
                    value={techSpecs.screenSizeHeight}
                    placeholder="Height (ft)"
                    className="flex-1"
                    onChange={handleInputChange(setTechSpecs, "screenSizeHeight")}
                  />
                </div>
              </div>

              <div>
                <Label>Back Screen Size</Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={techSpecs.backScreenWidth}
                    placeholder="Width (ft)"
                    className="flex-1"
                    onChange={handleInputChange(setTechSpecs, "backScreenWidth")}
                  />
                  <Input
                    type="text"
                    value={techSpecs.backScreenHeight}
                    placeholder="Height (ft)"
                    className="flex-1"
                    onChange={handleInputChange(setTechSpecs, "backScreenHeight")}
                  />
                </div>
              </div>

              <div>
                <Label>Front Resolution</Label>
                <Input
                  type="text"
                  value={techSpecs.resolution}
                  placeholder="e.g., 1920x1080"
                  onChange={handleInputChange(setTechSpecs, "resolution")}
                />
              </div>

              <div>
                <Label>Back Resolution</Label>
                <Input
                  type="text"
                  value={techSpecs.backResolution}
                  placeholder="e.g., 480x520"
                  onChange={handleInputChange(setTechSpecs, "backResolution")}
                />
              </div>

              <div>
                <Label>Video Format</Label>
                <Input
                  type="text"
                  value={techSpecs.videoFormat}
                  placeholder="e.g., MP4"
                  onChange={handleInputChange(setTechSpecs, "videoFormat")}
                />
              </div>

              <div>
                <Label>Front Video Size</Label>
                <Input
                  type="text"
                  value={techSpecs.videoSize}
                  placeholder="e.g., 1920x1080 px"
                  onChange={handleInputChange(setTechSpecs, "videoSize")}
                />
              </div>

              <div>
                <Label>Back Video Size</Label>
                <Input
                  type="text"
                  value={techSpecs.backVideoSize}
                  placeholder="e.g., 480x520 px"
                  onChange={handleInputChange(setTechSpecs, "backVideoSize")}
                />
              </div>

              <div>
                <Label>Audio Output</Label>
                <Input
                  type="text"
                  value={techSpecs.audioOutput}
                  placeholder="e.g., 600 watts"
                  onChange={handleInputChange(setTechSpecs, "audioOutput")}
                />
              </div>

              <div>
                <Label>Generator Capacity</Label>
                <Input
                  type="text"
                  value={techSpecs.generatorCapacity}
                  placeholder="e.g., 7 KV"
                  onChange={handleInputChange(setTechSpecs, "generatorCapacity")}
                />
              </div>

              <div>
                <Label>Brightness (Nits)</Label>
                <Input
                  type="text"
                  value={techSpecs.brightness}
                  placeholder="e.g. 5500"
                  onChange={handleInputChange(setTechSpecs, "brightness")}
                />
              </div>

              <div>
                <Label>Display Version / Controller</Label>
                <Input
                  type="text"
                  value={techSpecs.displayVersion}
                  placeholder="e.g. NovaStar A8s"
                  onChange={handleInputChange(setTechSpecs, "displayVersion")}
                />
              </div>

              <div>
                <Label>Supported Formats</Label>
                <Input
                  type="text"
                  value={techSpecs.supportedFormats}
                  placeholder="e.g. MP4, JPG, PNG"
                  onChange={handleInputChange(setTechSpecs, "supportedFormats")}
                />
              </div>

              <div>
                <Label>Audio System</Label>
                <div className="relative">
                  <Select
                    options={selectOptions.audioSystemOptions}
                    placeholder="Select"
                    value={techSpecs.audioSystem}
                    onChange={handleTechSpecsChange("audioSystem")}
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>

              <div>
                <Label>Sound Quality</Label>
                <div className="relative">
                  <Select
                    options={selectOptions.soundQualityOptions}
                    placeholder="Select"
                    value={techSpecs.soundQuality}
                    onChange={handleTechSpecsChange("soundQuality")}
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>

              <div className="lg:col-span-4">
                <Label>Additional Features</Label>
                <Input
                  type="text"
                  value={techSpecs.additionalFeatures}
                  placeholder="e.g. Built-in Amplifier, USB, WiFi"
                  onChange={handleInputChange(setTechSpecs, "additionalFeatures")}
                />
              </div>
            </div>
          </ComponentCard>

          {/* Section 3: Pricing & Charges */}
          <ComponentCard title="3. Pricing & Charges">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label>Base Price Type <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Select
                    options={selectOptions.basePriceTypeOptions}
                    placeholder="Per Day"
                    value={pricing.basePriceType}
                    onChange={handlePricingChange("basePriceType")}
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>

              <div>
                <Label>Base Cost Per Day (₹) <span className="text-red-500">*</span></Label>
                <Input
                  type="text"
                  value={pricing.costPerDay}
                  placeholder="e.g. 15,000"
                  onChange={handleInputChange(setPricing, "costPerDay")}
                />
              </div>

              <div>
                <Label>Average KM Per Day <span className="text-red-500">*</span></Label>
                <Input
                  type="text"
                  value={vehicleDetails.avgKmPerDay}
                  placeholder="e.g. 60"
                  onChange={handleInputChange(setVehicleDetails, "avgKmPerDay")}
                />
              </div>

              <div>
                <Label>Extra Charges (₹ / Km) <span className="text-red-500">*</span></Label>
                <Input
                  type="text"
                  value={vehicleDetails.extraKmPrice}
                  placeholder="e.g. 12"
                  onChange={handleInputChange(setVehicleDetails, "extraKmPrice")}
                />
              </div>

              <div>
                <Label>Average Booking Hours <span className="text-red-500">*</span></Label>
                <Input
                  type="text"
                  value={vehicleDetails.avgBookingHrs}
                  placeholder="e.g. 8"
                  onChange={handleInputChange(setVehicleDetails, "avgBookingHrs")}
                />
              </div>

              <div>
                <Label>Extra Charges (₹ / hr) <span className="text-red-500">*</span></Label>
                <Input
                  type="text"
                  value={vehicleDetails.extraHrPrice}
                  placeholder="e.g. 500"
                  onChange={handleInputChange(setVehicleDetails, "extraHrPrice")}
                />
              </div>

              <div>
                <Label>RTO Charges (₹)</Label>
                <Input
                  type="text"
                  value={vehicleDetails.rtoCharges}
                  placeholder="e.g. 10,000"
                  onChange={handleInputChange(setVehicleDetails, "rtoCharges")}
                />
              </div>

              <div>
                <Label>Fuel Efficiency (km/l)</Label>
                <Input
                  type="text"
                  value={vehicleDetails.fuelEfficiency}
                  placeholder="e.g. 6.5"
                  onChange={handleInputChange(setVehicleDetails, "fuelEfficiency")}
                />
              </div>

              <div>
                <Label>Minimum Booking Duration</Label>
                <Input
                  type="text"
                  value={pricing.minBookingDuration}
                  placeholder="e.g. 4 hrs"
                  onChange={handleInputChange(setPricing, "minBookingDuration")}
                />
              </div>

              <div>
                <Label>Overtime Charges (₹ / hr)</Label>
                <Input
                  type="text"
                  value={pricing.overtimeCharges}
                  placeholder="e.g. 500"
                  onChange={handleInputChange(setPricing, "overtimeCharges")}
                />
              </div>

              <div>
                <Label>Waiting Charges (₹ / hr)</Label>
                <Input
                  type="text"
                  value={pricing.waitingCharges}
                  placeholder="e.g. 300"
                  onChange={handleInputChange(setPricing, "waitingCharges")}
                />
              </div>
            </div>
          </ComponentCard>

          {/* Section 4: Media & Description */}
          <ComponentCard title="4. Media & Description">
            <div className="mt-2">
              <Label>Upload Images & Videos <span className="text-red-500">*</span></Label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <FileUploadField label="Front View" fieldName="frontViewImage" accept="image/*" />
                <FileUploadField label="Left Side View" fieldName="leftSideImage" accept="image/*" />
                <FileUploadField label="Right Side View" fieldName="rightSideImage" accept="image/*" />
                <FileUploadField label="Rear View" fieldName="rearViewImage" accept="image/*" />
                <FileUploadField label="Interior / Other" fieldName="interiorImage" accept="image/*" />
                <FileUploadField label="Demo Video" fieldName="demoVideo" accept="video/*" />
              </div>
            </div>
            <div className="mt-4">
              <Label>Vehicle Description <span className="text-red-500">*</span></Label>
              <textarea
                rows={3}
                className="w-full rounded-lg border border-gray-300 bg-transparent p-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-dark-900 dark:text-white"
                placeholder="Enter description about the vehicle..."
                value={vehicleDetails.vehicleDescription}
                onChange={handleInputChange(setVehicleDetails, "vehicleDescription")}
              />
            </div>
          </ComponentCard>

          {/* Section 5: Maintenance & Lifecycle */}
          <ComponentCard title="5. Maintenance & Lifecycle">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label>Manufacturing Year</Label>
                <Input type="text" placeholder="e.g. 2023" />
              </div>
              <div>
                <Label>Last Service Date</Label>
                <Input type="date" onChange={handleInputChange(setMaintenanceInfo, "lastServiceDate")} />
              </div>
              <div>
                <Label>Insurance Expiry Date</Label>
                <Input type="date" onChange={handleInputChange(setMaintenanceInfo, "insuranceExpiryDate")} />
              </div>
              <div>
                <Label>Pollution Certificate Expiry Date</Label>
                <Input type="date" onChange={handleInputChange(setMaintenanceInfo, "pollutionCertificateExpiryDate")} />
              </div>
            </div>
          </ComponentCard>

          {/* Section 6: Driver Details */}
          <ComponentCard title="6. Driver Details">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label>Driver Name</Label>
                <Input type="text" placeholder="Enter driver name" onChange={handleInputChange(setDriverDetails, "driverName")} />
              </div>
              <div>
                <Label>Driver Phone</Label>
                <Input type="text" placeholder="Enter phone number" onChange={handleInputChange(setDriverDetails, "driverPhone")} />
              </div>
              <div>
                <Label>Backup Driver (Optional)</Label>
                <Input type="text" placeholder="Enter backup driver name" onChange={handleInputChange(setDriverDetails, "backupDriver")} />
              </div>
              <div>
                <Label>Backup Driver Phone</Label>
                <Input type="text" placeholder="Enter phone number" onChange={handleInputChange(setDriverDetails, "backupDriverPhone")} />
              </div>
            </div>
          </ComponentCard>

          {/* Section 7: Status & Availability */}
          <ComponentCard title="7. Status & Availability">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label>Current Status <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Select
                    options={selectOptions.statusOptions}
                    placeholder="Select status"
                    value={statusAvailability.currentStatus}
                    onChange={handleStatusAvailabilityChange("currentStatus")}
                    className="dark:bg-dark-900"
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>

              <div>
                <Label>Available From</Label>
                <Input type="date" onChange={handleInputChange(setStatusAvailability, "availableFrom")} />
              </div>
              <div className="lg:col-span-2">
                <Label>Remarks</Label>
                <Input type="text" placeholder="Enter remarks (optional)" onChange={handleInputChange(setStatusAvailability, "remarks")} />
              </div>
            </div>
          </ComponentCard>

          {/* Section 8: Maintenance Information */}
          <ComponentCard title="8. Maintenance Information">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label>Maintenance Status</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="maintenanceStatus"
                      value="No"
                      checked={maintenanceInfo.maintenanceStatus === "No"}
                      onChange={() => setMaintenanceInfo((prev) => ({ ...prev, maintenanceStatus: "No" }))}
                    />
                    <span>No</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="maintenanceStatus"
                      value="Yes"
                      checked={maintenanceInfo.maintenanceStatus === "Yes"}
                      onChange={() => setMaintenanceInfo((prev) => ({ ...prev, maintenanceStatus: "Yes" }))}
                    />
                    <span>Yes</span>
                  </label>
                </div>
              </div>
              <div>
                <Label>Expected Ready Date</Label>
                <Input
                  type="date"
                  value={maintenanceInfo.expectedReadyDate}
                  onChange={handleInputChange(setMaintenanceInfo, "expectedReadyDate")}
                  disabled={maintenanceInfo.maintenanceStatus === "No"}
                />
              </div>
              <div className="lg:col-span-2">
                <Label>Maintenance Notes</Label>
                <Input
                  type="text"
                  placeholder="Enter maintenance notes (if any)"
                  value={maintenanceInfo.maintenanceNotes}
                  onChange={handleInputChange(setMaintenanceInfo, "maintenanceNotes")}
                  disabled={maintenanceInfo.maintenanceStatus === "No"}
                />
              </div>
            </div>
          </ComponentCard>

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div
                className="bg-brand-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-center gap-10">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-brand-600 px-6 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : `Save ${vehicleCount} Vehicle(s)`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}





























/* eslint-disable */
// @ts-nocheck

"use client";

import React, { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";

// ─── Inline Label ────────────────────────────────────────────────────────────
const Label = ({ children, className = "" }) => (
  <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${className}`}>
    {children}
  </label>
);

// ─── Inline Input ────────────────────────────────────────────────────────────
const Input = ({
  type = "text",
  id,
  name,
  placeholder,
  defaultValue,
  value,
  onChange,
  onKeyDown,
  onPaste,
  className = "",
  min,
  max,
  step,
  maxLength,
  inputMode,
  disabled = false,
  success = false,
  error = false,
  hint,
}) => {
  let inputClasses = `h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${className}`;

  if (disabled) {
    inputClasses += ` text-gray-500 border-gray-300 cursor-not-allowed bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
  } else if (error) {
    inputClasses += ` text-red-800 border-red-500 focus:ring-red-500/20 dark:text-red-400 dark:border-red-500`;
  } else if (success) {
    inputClasses += ` text-green-600 border-green-400 focus:ring-green-500/20 dark:text-green-400 dark:border-green-500`;
  } else {
    inputClasses += ` bg-white text-gray-800 border-gray-300 focus:border-blue-400 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90`;
  }

  // For date inputs: make the full field clickable to open the picker
  const dateStyle =
    type === "date" || type === "time"
      ? { colorScheme: "light" }
      : {};

  return (
    <div className="relative">
      <input
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        defaultValue={value !== undefined ? undefined : defaultValue}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        min={min}
        max={max}
        step={step}
        maxLength={maxLength}
        inputMode={inputMode}
        disabled={disabled}
        className={inputClasses}
        style={dateStyle}
        // For date fields, clicking anywhere opens the picker
        onClick={
          (type === "date" || type === "time") && !disabled
            ? (e) => e.currentTarget.showPicker?.()
            : undefined
        }
      />
      {hint && (
        <p
          className={`mt-1.5 text-xs ${
            error ? "text-red-500" : success ? "text-green-500" : "text-gray-500"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

// ─── Inline Select ───────────────────────────────────────────────────────────
const Select = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  defaultValue = "",
  value,
}) => {
  const [selectedValue, setSelectedValue] = useState(
    value !== undefined ? value : defaultValue
  );

  useEffect(() => {
    if (value !== undefined) setSelectedValue(value);
  }, [value]);

  const handleChange = (e) => {
    const v = e.target.value;
    setSelectedValue(v);
    onChange?.(v);
  };

  return (
    <select
      className={`h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pr-10 text-sm bg-white shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 ${
        selectedValue ? "text-gray-800 dark:text-white/90" : "text-gray-400 dark:text-gray-400"
      } ${className}`}
      value={selectedValue}
      onChange={handleChange}
    >
      <option value="" disabled className="text-gray-400">
        {placeholder}
      </option>
      {options.map((option) => (
        <option key={option.value} value={option.value} className="text-gray-800 dark:bg-gray-900">
          {option.label}
        </option>
      ))}
    </select>
  );
};

// ─── Switch ───────────────────────────────────────────────────────────────────
const Switch = ({ label, defaultChecked = false, onChange }) => {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center gap-3 mt-1">
      <button
        type="button"
        onClick={() => {
          const next = !checked;
          setChecked(next);
          onChange?.(next);
        }}
        className={`relative inline-flex h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none ${
          checked ? "bg-blue-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 mt-0.5 ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
    </div>
  );
};

// ─── Stepper Header (pill style like the screenshot) ─────────────────────────
const StepperHeader = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-6 px-6 py-4 overflow-x-auto">
      <div className="flex items-center min-w-max gap-0">
        {steps.map((step, idx) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;
          return (
            <React.Fragment key={step.number}>
              <button
                type="button"
                onClick={() => onStepClick(step.number)}
                className="flex items-center gap-2 group focus:outline-none"
              >
                {/* Circle */}
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all duration-200 flex-shrink-0 ${
                    isCompleted
                      ? "bg-blue-600 text-white"
                      : isActive
                      ? "bg-blue-600 text-white ring-4 ring-blue-100"
                      : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                {/* Label */}
                <span
                  className={`text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : isCompleted
                      ? "text-blue-500 dark:text-blue-400"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {step.title}
                </span>
              </button>
              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div className="flex items-center mx-2 flex-shrink-0">
                  <div
                    className={`h-0.5 w-8 rounded transition-colors duration-300 ${
                      currentStep > step.number ? "bg-blue-400" : "bg-gray-200 dark:bg-gray-700"
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

// ─── Section Card Header (numbered badge + title) ────────────────────────────
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

// ─── ChevronDown Icon ─────────────────────────────────────────────────────────
const ChevronDownIcon = ({ className = "" }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

// ─── Plus Icon ────────────────────────────────────────────────────────────────
const PlusIcon = ({ className = "" }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

// ─── Validation helpers ───────────────────────────────────────────────────────
const isValidRegistrationNumber = (regNumber) => {
  if (!regNumber || regNumber.trim() === "") return false;
  const clean = regNumber.replace(/\s/g, "");
  if (clean.length !== 10) return false;
  return /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/.test(clean);
};

// ─── Add Vehicle Modal ────────────────────────────────────────────────────────
const AddVehicleModal = ({ isOpen, onClose, onSave, editingVehicle }) => {
  const [formData, setFormData] = useState({
    registrationNumber: "",
    city: "",
    permitType: "",
    modelConfig: "",
    ownershipType: "",
    fuelType: "",
    manufacturingYear: "",
    gpsEnabled: true,
    status: true,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingVehicle) {
      setFormData({
        registrationNumber: editingVehicle.registrationNumber || "",
        city: editingVehicle.city || "",
        permitType: editingVehicle.permitType || "",
        modelConfig: editingVehicle.modelConfig || "",
        ownershipType: editingVehicle.ownershipType || "",
        fuelType: editingVehicle.fuelType || "",
        manufacturingYear: editingVehicle.manufacturingYear || "",
        gpsEnabled: editingVehicle.gpsEnabled !== undefined ? editingVehicle.gpsEnabled : true,
        status: editingVehicle.status !== undefined ? editingVehicle.status : true,
      });
    } else {
      setFormData({
        registrationNumber: "",
        city: "",
        permitType: "",
        modelConfig: "",
        ownershipType: "",
        fuelType: "",
        manufacturingYear: "",
        gpsEnabled: true,
        status: true,
      });
    }
    setErrors({});
  }, [editingVehicle, isOpen]);

  const handleRegNumberChange = (value) => {
    let cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    let validated = "";
    let pos = 0;
    for (let i = 0; i < cleaned.length && pos < 10; i++) {
      const char = cleaned[i];
      if (pos < 2 && /[A-Z]/.test(char)) { validated += char; pos++; }
      else if (pos >= 2 && pos < 4 && /[0-9]/.test(char)) { validated += char; pos++; }
      else if (pos >= 4 && pos < 6 && /[A-Z]/.test(char)) { validated += char; pos++; }
      else if (pos >= 6 && pos < 10 && /[0-9]/.test(char)) { validated += char; pos++; }
    }
    let formatted = validated.slice(0, 2);
    if (validated.length > 2) formatted += " " + validated.slice(2, 4);
    if (validated.length > 4) formatted += " " + validated.slice(4, 6);
    if (validated.length > 6) formatted += " " + validated.slice(6, 10);
    setFormData((prev) => ({ ...prev, registrationNumber: formatted }));
    const clean = formatted.replace(/\s/g, "");
    if (clean.length > 0 && clean.length < 10) {
      setErrors((prev) => ({ ...prev, registrationNumber: `Need ${10 - clean.length} more character(s)` }));
    } else if (clean.length === 10 && !isValidRegistrationNumber(formatted)) {
      setErrors((prev) => ({ ...prev, registrationNumber: "Invalid format. Use: XX NN XX NNNN" }));
    } else {
      setErrors((prev) => ({ ...prev, registrationNumber: "" }));
    }
  };

  const handleSubmit = async () => {
    const cleanReg = formData.registrationNumber.replace(/\s/g, "");
    if (!cleanReg || cleanReg.length !== 10 || !isValidRegistrationNumber(formData.registrationNumber)) {
      toast.error("Please enter a valid registration number");
      return;
    }
    if (!formData.city) { toast.error("City is required"); return; }
    if (!formData.permitType) { toast.error("Permit Type is required"); return; }
    if (!formData.modelConfig) { toast.error("Model Configuration is required"); return; }
    if (!formData.ownershipType) { toast.error("Ownership Type is required"); return; }
    if (!formData.fuelType) { toast.error("Fuel Type is required"); return; }
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

  const selectOptions = {
    cityOptions: [
      { value: "Chennai", label: "Chennai" },
      { value: "Madurai", label: "Madurai" },
      { value: "Coimbatore", label: "Coimbatore" },
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
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="bg-white rounded-xl w-full max-w-4xl mx-4 my-8 dark:bg-gray-800 shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            🚗 {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="space-y-6">
            {/* Registration Number */}
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <Label>
                🔢 Registration Number <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                value={formData.registrationNumber}
                onChange={(e) => handleRegNumberChange(e.target.value)}
                placeholder="TN 01 AB 1234"
                maxLength={13}
                className={errors.registrationNumber ? "border-red-500" : ""}
              />
              {errors.registrationNumber && (
                <p className="mt-1 text-xs text-red-500">{errors.registrationNumber}</p>
              )}
              {!errors.registrationNumber &&
                formData.registrationNumber &&
                isValidRegistrationNumber(formData.registrationNumber) && (
                  <p className="mt-1 text-xs text-green-500">✓ Valid registration number</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label>🏙️ City / Operating Location <span className="text-red-500">*</span></Label>
                <div className="relative mt-1">
                  <Select
                    options={selectOptions.cityOptions}
                    placeholder="Select City"
                    value={formData.city}
                    onChange={(value) => setFormData((prev) => ({ ...prev, city: value }))}
                  />
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <Label>📋 Permit Type <span className="text-red-500">*</span></Label>
                <div className="relative mt-1">
                  <Select
                    options={selectOptions.permitOptions}
                    placeholder="Select Permit"
                    value={formData.permitType}
                    onChange={(value) => setFormData((prev) => ({ ...prev, permitType: value }))}
                  />
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <Label>⚙️ Model / Configuration <span className="text-red-500">*</span></Label>
                <div className="relative mt-1">
                  <Select
                    options={selectOptions.modelOptions}
                    placeholder="Select Model"
                    value={formData.modelConfig}
                    onChange={(value) => setFormData((prev) => ({ ...prev, modelConfig: value }))}
                  />
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <Label>🏢 Ownership Type <span className="text-red-500">*</span></Label>
                <div className="relative mt-1">
                  <Select
                    options={selectOptions.ownershipOptions}
                    placeholder="Select Ownership"
                    value={formData.ownershipType}
                    onChange={(value) => setFormData((prev) => ({ ...prev, ownershipType: value }))}
                  />
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <Label>⛽ Fuel Type <span className="text-red-500">*</span></Label>
                <div className="relative mt-1">
                  <Select
                    options={selectOptions.fuelTypeOptions}
                    placeholder="Select Fuel Type"
                    value={formData.fuelType}
                    onChange={(value) => setFormData((prev) => ({ ...prev, fuelType: value }))}
                  />
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <Label>📅 Manufacturing Year</Label>
                <Input
                  type="text"
                  placeholder="e.g. 2023"
                  maxLength={4}
                  value={formData.manufacturingYear}
                  onChange={(e) => {
                    if (/^\d*$/.test(e.target.value)) {
                      setFormData((prev) => ({ ...prev, manufacturingYear: e.target.value }));
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex gap-6 pt-2">
              <div>
                <Label>📡 GPS Enabled</Label>
                <Switch
                  label={formData.gpsEnabled ? "Enabled" : "Disabled"}
                  defaultChecked={formData.gpsEnabled}
                  onChange={(checked) => setFormData((prev) => ({ ...prev, gpsEnabled: checked }))}
                />
              </div>
              <div>
                <Label>✅ Status</Label>
                <Switch
                  label={formData.status ? "Active" : "Inactive"}
                  defaultChecked={formData.status}
                  onChange={(checked) => setFormData((prev) => ({ ...prev, status: checked }))}
                />
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
            {loading ? "Saving..." : editingVehicle ? "Update Vehicle" : "Add Vehicle"}
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
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);

  const [commonInfo, setCommonInfo] = useState({
    customizedType: "Customized",
    vehicleName: "",
    vehicleType: "",
  });

  const [techSpecs, setTechSpecs] = useState({
    screenType: "LED Only",
    numberOfScreens: "",
    screenSizeWidth: "",
    screenSizeHeight: "",
    backScreenSizeWidth: "",
    backScreenSizeHeight: "",
    resolution: "",
    brightness: "",
    displayVersion: "",
    supportedFormats: "",
    audioSystem: "",
    soundQuality: "",
    generatorCapacity: "",
    additionalFeatures: "",
    videoFormat: "",
    videoSize: "",
    backVideoSize: "",
    audioOutput: "",
  });

  const [showMoreTech, setShowMoreTech] = useState(false);

  const [pricing, setPricing] = useState({
    basePriceType: "Per Day",
    costPerDay: "",
    kmCost: "",
    overtimeCharges: "",
    waitingCharges: "",
    minBookingDuration: "",
  });

  const [driverDetails, setDriverDetails] = useState({
    driverName: "",
    driverPhone: "",
    backupDriver: "",
    backupDriverPhone: "",
  });

  const [maintenanceInfo, setMaintenanceInfo] = useState({
    manufacturingYear: "",
    lastServiceDate: "",
    nextServiceDueDate: "",
    insuranceExpiryDate: "",
    pollutionCertificateExpiryDate: "",
    maintenanceStatus: "No",
    expectedReadyDate: "",
    maintenanceNotes: "",
  });

  const [mediaFiles, setMediaFiles] = useState({
    frontViewImage: null,
    leftSideImage: null,
    rightSideImage: null,
    rearViewImage: null,
    interiorImage: null,
    demoVideo: null,
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);

  const [stats, setStats] = useState({
    totalVehicles: 1248,
    monthlyGrowth: 12,
  });

  const getSelectOptions = () => ({
    customizedVehiclesOptions: [
      { value: "Customized", label: "Customized" },
      { value: "Non-Customized", label: "Non-Customized" },
    ],
    vehicleTypeOptions: vehicleTypes.map((vt) => ({ value: vt._id, label: vt.typeName })),
    screenTypeOptions: [
      { value: "LED Only", label: "LED Only" },
      { value: "Flex Only", label: "Flex Only" },
      { value: "Flex + LED", label: "Flex + LED" },
    ],
    audioSystemOptions: [
      { value: "Basic", label: "Basic" },
      { value: "Premium", label: "Premium" },
      { value: "Professional", label: "Professional" },
    ],
    soundQualityOptions: [
      { value: "Standard", label: "Standard" },
      { value: "High", label: "High" },
      { value: "Studio", label: "Studio" },
    ],
    basePriceTypeOptions: [
      { value: "Per Day", label: "Per Day" },
      { value: "Per Hour", label: "Per Hour" },
      { value: "Per KM", label: "Per KM" },
    ],
  });

  const selectOptions = getSelectOptions();

  const steps = [
    { number: 1, title: "Basic Info" },
    { number: 2, title: "Technical Specs" },
    { number: 3, title: "Pricing & Charges" },
    { number: 4, title: "Media & Description" },
    { number: 5, title: "Lifecycle" },
    { number: 6, title: "Drivers" },
    { number: 7, title: "Stats" },
  ];

  const handleAddVehicle = (vehicleData) => {
    if (editingVehicle) {
      setVehicles((prev) =>
        prev.map((v) =>
          v.registrationNumber === editingVehicle.registrationNumber ? vehicleData : v
        )
      );
      toast.success("Vehicle updated successfully");
    } else {
      const exists = vehicles.some((v) => v.registrationNumber === vehicleData.registrationNumber);
      if (exists) {
        toast.error("Vehicle with this registration number already exists");
        return;
      }
      setVehicles((prev) => [...prev, vehicleData]);
      toast.success("Vehicle added successfully");
    }
    setEditingVehicle(null);
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleDeleteVehicle = (registrationNumber) => {
    if (window.confirm("Are you sure you want to remove this vehicle?")) {
      setVehicles((prev) => prev.filter((v) => v.registrationNumber !== registrationNumber));
      toast.success("Vehicle removed successfully");
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!commonInfo.vehicleName) errors.vehicleName = "Vehicle Name is required";
    if (!commonInfo.vehicleType) errors.vehicleType = "Vehicle Type is required";
    if (vehicles.length === 0) errors.vehicles = "At least one vehicle is required";
    if (!pricing.costPerDay) errors.costPerDay = "Base Cost is required";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the validation errors before submitting");
      return;
    }
    setLoading(true);
    setUploadProgress(0);
    try {
      // Simulate upload for demo — replace with real axios call
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((r) => setTimeout(r, 80));
        setUploadProgress(i);
      }
      toast.success(`Successfully submitted ${vehicles.length} vehicle(s)!`);
      setVehicles([]);
      setCommonInfo({ customizedType: "Customized", vehicleName: "", vehicleType: "" });
      setCurrentStep(1);
      setUploadProgress(0);
    } catch (error) {
      toast.error("Error saving vehicle");
    } finally {
      setLoading(false);
    }
  };

  // ── Media upload labels with emoji icons ───────────────────────────────────
  const mediaLabels = [
    { key: "frontViewImage", label: "Front View", icon: "📸" },
    { key: "leftSideImage", label: "Left Side View", icon: "⬅️" },
    { key: "rightSideImage", label: "Right Side View", icon: "➡️" },
    { key: "rearViewImage", label: "Rear View", icon: "🔭" },
    { key: "interiorImage", label: "Interior", icon: "🖼️" },
    { key: "demoVideo", label: "Demo Video", icon: "🎬" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Toaster position="top-right" />

      {/* Breadcrumb */}
      <div className="px-6 pt-6">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          🏠 Dashboard &gt; Vehicle Management &gt; Onboarding
        </div>
      </div>

      {/* Page Header */}
      <div className="px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          🚌 Vehicle Onboarding Management
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Add and manage your advertising vehicles with complete details
        </p>
      </div>

      {/* Stats Card */}
      <div className="px-6 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-blue-100">Total Vehicles</p>
              <p className="text-3xl font-bold">{stats.totalVehicles.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-green-300">+{stats.monthlyGrowth} this month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      <AddVehicleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingVehicle(null);
        }}
        onSave={handleAddVehicle}
        editingVehicle={editingVehicle}
      />

      <form onSubmit={handleSubmit}>
        <div className="px-6 pb-10">
          {/* ── STEPPER HEADER ── */}
          <StepperHeader
            steps={steps}
            currentStep={currentStep}
            onStepClick={setCurrentStep}
          />

          {/* ── STEP 1: Basic Information ── */}
          {currentStep === 1 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <SectionHeader number={1} title="Basic Information" icon="📋" />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <Label>⚙️ Customized Type</Label>
                  <div className="relative mt-1">
                    <Select
                      options={selectOptions.customizedVehiclesOptions}
                      placeholder="Select"
                      value={commonInfo.customizedType}
                      onChange={(value) => setCommonInfo((prev) => ({ ...prev, customizedType: value }))}
                    />
                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <Label>🆔 Vehicle ID</Label>
                  <Input
                    type="text"
                    value="Auto generated"
                    disabled
                    className="bg-gray-100 dark:bg-gray-700"
                  />
                </div>

                <div>
                  <Label>
                    🚍 Vehicle Type <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-1">
                    {isLoadingTypes ? (
                      <div className="w-full p-2 border rounded-lg bg-gray-100 text-gray-500 text-sm">
                        Loading vehicle types...
                      </div>
                    ) : (
                      <Select
                        options={selectOptions.vehicleTypeOptions}
                        placeholder="Select Type"
                        value={commonInfo.vehicleType}
                        onChange={(value) =>
                          setCommonInfo((prev) => ({ ...prev, vehicleType: value }))
                        }
                      />
                    )}
                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                  {validationErrors.vehicleType && (
                    <p className="mt-1 text-xs text-red-500">{validationErrors.vehicleType}</p>
                  )}
                </div>
              </div>

              {/* Vehicles / Registration Numbers */}
              <div className="mt-8">
                <Label className="text-base font-semibold">
                  🔢 Registration Numbers <span className="text-red-500">*</span>
                </Label>
                <p className="text-sm text-gray-500 mb-4">
                  Add one or more registration numbers (Format: XX NN XX NNNN)
                </p>

                {vehicles.length > 0 ? (
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">
                            Registration Number
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">
                            City
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">
                            Permit Type
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">
                            Fuel Type
                          </th>
                          <th className="px-4 py-3 text-center font-medium text-gray-600 dark:text-gray-300">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {vehicles.map((vehicle) => (
                          <tr
                            key={vehicle.registrationNumber}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <td className="px-4 py-3 font-mono font-semibold text-blue-700">
                              {vehicle.registrationNumber}
                            </td>
                            <td className="px-4 py-3">{vehicle.city}</td>
                            <td className="px-4 py-3">{vehicle.permitType}</td>
                            <td className="px-4 py-3">{vehicle.fuelType}</td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex justify-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => handleEditVehicle(vehicle)}
                                  className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteVehicle(vehicle.registrationNumber)
                                  }
                                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                                >
                                  🗑️ Delete
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
                    <div className="text-4xl mb-2">🚗</div>
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
                {validationErrors.vehicles && (
                  <p className="mt-1 text-xs text-red-500">{validationErrors.vehicles}</p>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 2: Technical Specifications ── */}
          {currentStep === 2 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <SectionHeader number={2} title="Display & Technical Specifications" icon="🖥️" />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div>
                  <Label>📺 Screen Type</Label>
                  <div className="relative mt-1">
                    <Select
                      options={selectOptions.screenTypeOptions}
                      placeholder="LED Only"
                      value={techSpecs.screenType}
                      onChange={(value) =>
                        setTechSpecs((prev) => ({ ...prev, screenType: value }))
                      }
                    />
                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <Label>🔢 Number of Screens</Label>
                  <Input
                    type="text"
                    placeholder="e.g. 2"
                    value={techSpecs.numberOfScreens}
                    onChange={(e) =>
                      setTechSpecs((prev) => ({ ...prev, numberOfScreens: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <Label>📐 Left/Right Screen Size</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="Width (ft)"
                      value={techSpecs.screenSizeWidth}
                      onChange={(e) =>
                        setTechSpecs((prev) => ({ ...prev, screenSizeWidth: e.target.value }))
                      }
                    />
                    <span className="flex items-center text-gray-400 font-bold">×</span>
                    <Input
                      placeholder="Height (ft)"
                      value={techSpecs.screenSizeHeight}
                      onChange={(e) =>
                        setTechSpecs((prev) => ({ ...prev, screenSizeHeight: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label>📐 Back Screen Size</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="Width (ft)"
                      value={techSpecs.backScreenSizeWidth}
                      onChange={(e) =>
                        setTechSpecs((prev) => ({ ...prev, backScreenSizeWidth: e.target.value }))
                      }
                    />
                    <span className="flex items-center text-gray-400 font-bold">×</span>
                    <Input
                      placeholder="Height (ft)"
                      value={techSpecs.backScreenSizeHeight}
                      onChange={(e) =>
                        setTechSpecs((prev) => ({
                          ...prev,
                          backScreenSizeHeight: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label>🖥️ Resolution</Label>
                  <Input
                    placeholder="e.g. 1920x1080"
                    value={techSpecs.resolution}
                    onChange={(e) =>
                      setTechSpecs((prev) => ({ ...prev, resolution: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <Label>💡 Brightness (Nits)</Label>
                  <Input
                    placeholder="e.g. 5500"
                    value={techSpecs.brightness}
                    onChange={(e) =>
                      setTechSpecs((prev) => ({ ...prev, brightness: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <Label>🔖 Display Version</Label>
                  <Input
                    placeholder="e.g. NovaStar A8s"
                    value={techSpecs.displayVersion}
                    onChange={(e) =>
                      setTechSpecs((prev) => ({ ...prev, displayVersion: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <Label>📁 Supported Formats</Label>
                  <Input
                    placeholder="e.g. MP4, JPG, PNG"
                    value={techSpecs.supportedFormats}
                    onChange={(e) =>
                      setTechSpecs((prev) => ({ ...prev, supportedFormats: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <Label>🔊 Audio System</Label>
                  <div className="relative mt-1">
                    <Select
                      options={selectOptions.audioSystemOptions}
                      placeholder="Select System"
                      value={techSpecs.audioSystem}
                      onChange={(value) =>
                        setTechSpecs((prev) => ({ ...prev, audioSystem: value }))
                      }
                    />
                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <Label>🎚️ Sound Quality</Label>
                  <div className="relative mt-1">
                    <Select
                      options={selectOptions.soundQualityOptions}
                      placeholder="Select Quality"
                      value={techSpecs.soundQuality}
                      onChange={(value) =>
                        setTechSpecs((prev) => ({ ...prev, soundQuality: value }))
                      }
                    />
                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <Label>⚡ Generator Capacity</Label>
                  <Input
                    placeholder="e.g. 7 KV"
                    value={techSpecs.generatorCapacity}
                    onChange={(e) =>
                      setTechSpecs((prev) => ({ ...prev, generatorCapacity: e.target.value }))
                    }
                  />
                </div>

                <div className="lg:col-span-4">
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

              <button
                type="button"
                onClick={() => setShowMoreTech(!showMoreTech)}
                className="mt-6 text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
              >
                {showMoreTech ? "▲" : "▼"} Show More Technical Options
              </button>

              {showMoreTech && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-6 pt-6 border-t">
                  <div>
                    <Label>🎬 Video Format</Label>
                    <Input
                      placeholder="e.g. MP4"
                      value={techSpecs.videoFormat}
                      onChange={(e) =>
                        setTechSpecs((prev) => ({ ...prev, videoFormat: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <Label>📏 Front Video Size</Label>
                    <Input
                      placeholder="e.g. 1920x1080 px"
                      value={techSpecs.videoSize}
                      onChange={(e) =>
                        setTechSpecs((prev) => ({ ...prev, videoSize: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <Label>📏 Back Video Size</Label>
                    <Input
                      placeholder="e.g. 480x520 px"
                      value={techSpecs.backVideoSize}
                      onChange={(e) =>
                        setTechSpecs((prev) => ({ ...prev, backVideoSize: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <Label>🔉 Audio Output</Label>
                    <Input
                      placeholder="e.g. 600 watts"
                      value={techSpecs.audioOutput}
                      onChange={(e) =>
                        setTechSpecs((prev) => ({ ...prev, audioOutput: e.target.value }))
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3: Pricing & Charges ── */}
          {currentStep === 3 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <SectionHeader number={3} title="Pricing & Charges" icon="💰" />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <Label>📊 Base Price Type</Label>
                  <div className="relative mt-1">
                    <Select
                      options={selectOptions.basePriceTypeOptions}
                      placeholder="Per Day"
                      value={pricing.basePriceType}
                      onChange={(value) =>
                        setPricing((prev) => ({ ...prev, basePriceType: value }))
                      }
                    />
                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <Label>
                    💵 Per Day Rental Cost (₹) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="e.g. 5000"
                    value={pricing.costPerDay}
                    onChange={(e) => setPricing((prev) => ({ ...prev, costPerDay: e.target.value }))}
                  />
                  {validationErrors.costPerDay && (
                    <p className="mt-1 text-xs text-red-500">{validationErrors.costPerDay}</p>
                  )}
                </div>

                <div>
                  <Label>⏰ Additional Hour Charges (₹)</Label>
                  <Input
                    type="text"
                    placeholder="e.g. 300"
                    value={pricing.overtimeCharges}
                    onChange={(e) =>
                      setPricing((prev) => ({ ...prev, overtimeCharges: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <Label>🛣️ Daily KM Limit</Label>
                  <Input placeholder="e.g. 100" />
                </div>

                <div>
                  <Label>🚗 Extra KM Charges (₹)</Label>
                  <Input placeholder="e.g. 15" />
                </div>

                <div>
                  <Label>⌚ Waiting Charges (₹/hr)</Label>
                  <Input placeholder="e.g. 200" />
                </div>

                <div>
                  <Label>📝 RTO Charges (₹)</Label>
                  <Input placeholder="e.g. 500" />
                </div>

                <div>
                  <Label>📅 Min Booking Duration</Label>
                  <Input placeholder="e.g. 4 hours" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t">
                <div>
                  <Label>🧑 Promoter Available</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="promoter" value="yes" /> <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="promoter" value="no" defaultChecked /> <span>No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <Label>🎨 End User Customization Permission</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="customization" value="yes" defaultChecked />{" "}
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="customization" value="no" /> <span>No</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 4: Media & Description ── */}
          {currentStep === 4 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <SectionHeader number={4} title="Media & Description" icon="🎞️" />

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {mediaLabels.map(({ key, label, icon }) => (
                  <div
                    key={key}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
                  >
                    <div className="text-3xl mb-2">{icon}</div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
                      {label}
                    </p>
                    <label className="cursor-pointer">
                      <span className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 px-3 py-1.5 rounded transition-colors">
                        Upload
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept={key === "demoVideo" ? "video/*" : "image/*"}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setMediaFiles((prev) => ({ ...prev, [key]: file }));
                            toast.success(`${label} uploaded!`);
                          }
                        }}
                      />
                    </label>
                    {mediaFiles[key] && (
                      <p className="mt-1 text-xs text-green-500 truncate">✓ {mediaFiles[key].name}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <Label>📝 Vehicle Description</Label>
                <textarea
                  rows={4}
                  className="w-full mt-1 rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                  placeholder="Enter detailed description about the vehicle..."
                />
              </div>
            </div>
          )}

          {/* ── STEP 5: Lifecycle ── */}
          {currentStep === 5 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <SectionHeader number={5} title="Maintenance & Lifecycle" icon="🔧" />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <Label>🏭 Manufacturing Year</Label>
                  <Input
                    type="date"
                    value={maintenanceInfo.manufacturingYear}
                    onChange={(e) =>
                      setMaintenanceInfo((prev) => ({
                        ...prev,
                        manufacturingYear: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>🔩 Last Service Date</Label>
                  <Input
                    type="date"
                    value={maintenanceInfo.lastServiceDate}
                    onChange={(e) =>
                      setMaintenanceInfo((prev) => ({
                        ...prev,
                        lastServiceDate: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>📅 Next Service Due Date</Label>
                  <Input
                    type="date"
                    value={maintenanceInfo.nextServiceDueDate}
                    onChange={(e) =>
                      setMaintenanceInfo((prev) => ({
                        ...prev,
                        nextServiceDueDate: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>🛡️ Insurance Expiry Date</Label>
                  <Input
                    type="date"
                    value={maintenanceInfo.insuranceExpiryDate}
                    onChange={(e) =>
                      setMaintenanceInfo((prev) => ({
                        ...prev,
                        insuranceExpiryDate: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>🌫️ Pollution Certificate Expiry Date</Label>
                  <Input
                    type="date"
                    value={maintenanceInfo.pollutionCertificateExpiryDate}
                    onChange={(e) =>
                      setMaintenanceInfo((prev) => ({
                        ...prev,
                        pollutionCertificateExpiryDate: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <Label>🔧 Maintenance Status</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="maintenance"
                      value="No"
                      checked={maintenanceInfo.maintenanceStatus === "No"}
                      onChange={() =>
                        setMaintenanceInfo((prev) => ({ ...prev, maintenanceStatus: "No" }))
                      }
                    />
                    <span>No</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="maintenance"
                      value="Yes"
                      checked={maintenanceInfo.maintenanceStatus === "Yes"}
                      onChange={() =>
                        setMaintenanceInfo((prev) => ({ ...prev, maintenanceStatus: "Yes" }))
                      }
                    />
                    <span>Yes</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <Label>📅 Expected Ready Date</Label>
                  <Input
                    type="date"
                    disabled={maintenanceInfo.maintenanceStatus === "No"}
                    value={maintenanceInfo.expectedReadyDate}
                    onChange={(e) =>
                      setMaintenanceInfo((prev) => ({
                        ...prev,
                        expectedReadyDate: e.target.value,
                      }))
                    }
                    className={
                      maintenanceInfo.maintenanceStatus === "No" ? "bg-gray-100" : ""
                    }
                  />
                </div>
                <div>
                  <Label>📝 Maintenance Notes</Label>
                  <Input
                    placeholder="Enter maintenance notes"
                    disabled={maintenanceInfo.maintenanceStatus === "No"}
                    value={maintenanceInfo.maintenanceNotes}
                    onChange={(e) =>
                      setMaintenanceInfo((prev) => ({
                        ...prev,
                        maintenanceNotes: e.target.value,
                      }))
                    }
                    className={
                      maintenanceInfo.maintenanceStatus === "No" ? "bg-gray-100" : ""
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 6: Drivers ── */}
          {currentStep === 6 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <SectionHeader number={6} title="Driver Details" icon="🧑‍✈️" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>👤 Driver Name</Label>
                  <Input
                    placeholder="Enter driver name"
                    value={driverDetails.driverName}
                    onChange={(e) =>
                      setDriverDetails((prev) => ({ ...prev, driverName: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>📱 Driver Phone</Label>
                  <Input
                    placeholder="Enter 10-digit phone number"
                    maxLength={10}
                    value={driverDetails.driverPhone}
                    onChange={(e) =>
                      setDriverDetails((prev) => ({ ...prev, driverPhone: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>👥 Backup Driver</Label>
                  <Input
                    placeholder="Enter backup driver name"
                    value={driverDetails.backupDriver}
                    onChange={(e) =>
                      setDriverDetails((prev) => ({ ...prev, backupDriver: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>📱 Backup Driver Phone</Label>
                  <Input
                    placeholder="Enter 10-digit phone number"
                    maxLength={10}
                    value={driverDetails.backupDriverPhone}
                    onChange={(e) =>
                      setDriverDetails((prev) => ({
                        ...prev,
                        backupDriverPhone: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <Label>💵 Driver Charges (₹)</Label>
                <Input placeholder="e.g. 800" className="mt-1 w-full md:w-1/3" />
              </div>
            </div>
          )}

          {/* ── STEP 7: Stats Summary ── */}
          {currentStep === 7 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <SectionHeader number={7} title="Vehicle Summary" icon="📊" />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100">
                  <p className="text-sm text-gray-500">🚗 Total Vehicles to Add</p>
                  <p className="text-2xl font-bold text-blue-600">{vehicles.length}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-100">
                  <p className="text-sm text-gray-500">💵 Base Price</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{pricing.costPerDay || 0}
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-100">
                  <p className="text-sm text-gray-500">🚍 Vehicle Type</p>
                  <p className="text-lg font-semibold text-purple-600">
                    {commonInfo.vehicleType || "Not selected"}
                  </p>
                </div>
              </div>

              {vehicles.length > 0 && (
                <div className="mt-6">
                  <Label className="font-semibold">🔢 Vehicles to be onboarded:</Label>
                  <div className="mt-2 space-y-2">
                    {vehicles.map((v, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <span className="w-6 text-gray-400">{idx + 1}.</span>
                        <span className="font-mono font-semibold text-blue-600">
                          {v.registrationNumber}
                        </span>
                        <span className="text-gray-400">—</span>
                        <span className="text-gray-600">{v.city}</span>
                        <span className="text-gray-400">·</span>
                        <span className="text-gray-500">{v.fuelType}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mt-6">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Uploading...</span>
                <span className="text-sm text-gray-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-4 mt-8">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
            >
              × Cancel
            </button>
            <div className="flex gap-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
                >
                  ← Previous
                </button>
              )}
              {currentStep < 7 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev + 1)}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Save & Next →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium"
                >
                  {loading ? "Saving..." : `✅ Submit ${vehicles.length} Vehicle(s)`}
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}


          // {/* Section 7: Status & Availability */}
          // <ComponentCard title="7. Status & Availability">
          //   <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          //     <div>
          //       <Label>Current Status</Label>
          //       <div className="relative">
          //         <Select
          //           options={selectOptions.statusOptions}
          //           placeholder="Select status"
          //           value={statusAvailability.currentStatus}
          //           onChange={handleStatusAvailabilityChange("currentStatus")}
          //         />
          //         <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          //           <ChevronDownIcon />
          //         </span>
          //       </div>
          //     </div>
          //     <div>
          //       <Label>Available From</Label>
          //       <Input 
          //         type="date" 
          //         value={statusAvailability.availableFrom}
          //         onChange={(e) => setStatusAvailability(prev => ({ ...prev, availableFrom: e.target.value }))}
          //         disabled={statusAvailability.currentStatus !== "Available"}
          //         className={statusAvailability.currentStatus !== "Available" ? "bg-gray-100 cursor-not-allowed" : ""}
          //       />
          //     </div>
          //     <div className="lg:col-span-2">
          //       <Label>Remarks</Label>
          //       <Input 
          //         type="text" 
          //         placeholder="Enter remarks" 
          //         value={statusAvailability.remarks}
          //         onChange={(e) => setStatusAvailability(prev => ({ ...prev, remarks: e.target.value }))}
          //         disabled={statusAvailability.currentStatus !== "Available"}
          //         className={statusAvailability.currentStatus !== "Available" ? "bg-gray-100 cursor-not-allowed" : ""}
          //       />
          //     </div>
          //   </div>
          // </ComponentCard>

Add this fields status and availability -> 
Status expect available means other booked maintenance then only ask available from date and remarks...and status again every register number inactive means get input like reason for inactive and that will be showed in table strucutre in basic info section...and give the add vehicle type operation add and edit delete like that..how to achieve it...

In maintenance and lifecycle on each vehicle get the Manufacturing Year, Last Service Date, Insurance Expiry Date, Pollution Certificate Expiry Date
Show vehicle number and their details and another vehicle if they add then show their details get in pop up and show in table like structure how to achieve it..