// import PageBreadcrumb from "@/components/common/PageBreadCrumb";
// import CheckboxComponents from "@/components/form/form-elements/CheckboxComponents";
// import DefaultInputs from "@/components/form/form-elements/DefaultInputs";
// import DropzoneComponent from "@/components/form/form-elements/DropZone";
// import FileInputExample from "@/components/form/form-elements/FileInputExample";
// import InputGroup from "@/components/form/form-elements/InputGroup";
// import InputStates from "@/components/form/form-elements/InputStates";
// import RadioButtons from "@/components/form/form-elements/RadioButtons";
// import SelectInputs from "@/components/form/form-elements/SelectInputs";
// import TextAreaInput from "@/components/form/form-elements/TextAreaInput";
// import ToggleSwitch from "@/components/form/form-elements/ToggleSwitch";
// import { Metadata } from "next";
// import React from "react";
// import Label from '../../../../../components/form/Label';
// import Input from '../../../../../components/form/input/InputField';
// import ComponentCard from '../../../../../components/common/ComponentCard';
// import Select from '../../../../../components/form/form-elements/SelectInputs';
// // import { ChevronDownIcon, EyeCloseIcon, EyeIcon, TimeIcon } from '../../../icons';

// export const metadata: Metadata = {
//   title: "Onboarding",
//   description:
//     "Roadshow Vehicle Onboarding",
// };

// export default function FormElements() {

//    const cityOptions = [
//     { value: "Chennai", label: "Chennai" },
//     { value: "Madurai", label: "Madurai" },
//     { value: "Coimbatore", label: "Development" },
//   ];
//   const handleCitySelectChange = (value: string) => {
//     console.log("Selected value:", value);
//   };
//   return (
//     <div>
//       <PageBreadcrumb pageTitle="Vehicle Onboarding Management" />
//       <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
//         <div className="space-y-6">
//           <ComponentCard title="1. Basic Information">
//             <div>
//               <div className="vehicleInfoMain" style={{ display: 'flex', justifyContent: 'space-around' }}>
//                 <div>
//                   <Label>Vehicle ID</Label>
//                   <Input type="text" placeholder="VH-2S-001" />
//                 </div>
//                 <div>
//                   <Label>Vehicle Name / Code </Label>
//                   <Input type="text" placeholder="Single-side LED vehicles" />
//                 </div>

//                 <div>
//                   <Label>Registeration Number</Label>
//                   <Input type="text" placeholder="TN 01 AB 3456" />
//                 </div>

//                 <div>
//                   <Label>Select Input</Label>
//                   <div className="relative">
//                     <Select
//                       cityOptions={cityOptions}
//                       placeholder="Select an option"
//                       onChange={handleCitySelectChange}
//                       className="dark:bg-dark-900"
//                     />
//                     <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                       <ChevronDownIcon />
//                     </span>
//                   </div>
//                 </div>

//               </div>
//             </div>
//             {/* <DefaultInputs />
//           <SelectInputs />
//           <TextAreaInput />
//           <InputStates /> */}
//           </ComponentCard>
//         </div>
//         <div className="space-y-6">
//           <InputGroup />
//           <FileInputExample />
//           <CheckboxComponents />
//           <RadioButtons />
//           <ToggleSwitch />
//           <DropzoneComponent />
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import React, { useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { ChevronDownIcon } from "@/icons";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function VehicleOnboardingForm() {
  const [basicInfo, setBasicInfo] = useState({
    customizedType: "",
    vehicleId: "VH-2S-001",
    vehicleName: "",
    registrationNumber: "",
    city: "",
    permitType: "",
    vehicleType: "",
    modelConfig: "",
    gpsEnabled: "",
    ownershipType: "",
    manufacturingYear: "",
    status: "Active",
  });

  const [techSpecs, setTechSpecs] = useState({
    screenType: "LED Only",
    numberOfScreens: "",
    screenSizeWidth: "",
    screenSizeHeight: "",
    resolution: "",
    brightness: "",
    displayVersion: "",
    supportedFormats: "",
    audioSystem: "",
    soundQuality: "",
    generatorCapacity: "",
    visibilityVersion: "",
    additionalFeatures: "",
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
    // Manufacturing Year ,   Last Service Date , Next Service Due Date , Insurance Expiry Date , Pollution Certificate Expiry

  });

  const cityOptions = [
    { value: "Chennai", label: "Chennai" },
    { value: "Madurai", label: "Madurai" },
    { value: "Coimbatore", label: "Coimbatore" },
  ];
  const permitOptions = [
    { value: "Local", label: "Local" },
    { value: "State", label: "State" },
    { value: "National", label: "Coimbatore" },
  ];

  const vehicleTypeOptions = [
    { value: "LED Truck", label: "LED Truck" },
    { value: "LED Van", label: "LED Van" },
    { value: "LED Bus", label: "LED Bus" },
  ];

  const modelOptions = [
    { value: "Standard", label: "Standard" },
    { value: "Premium", label: "Premium" },
    { value: "Deluxe", label: "Deluxe" },
  ];

  const yesNoOptions = [
    { value: "Yes", label: "Yes" },
    { value: "No", label: "No" },
  ];

  const ownershipOptions = [
    { value: "Owned", label: "Owned" },
    { value: "Leased", label: "Leased" },
    { value: "Rented", label: "Rented" },
  ];
  const customizedVehiclesOptions = [
    { value: "Customized", label: "Customized" },
    { value: "Non-Customized", label: "Non-Customized" },
  ];

  const screenTypeOptions = [
    { value: "LED Only", label: "LED Only" },
    { value: "Flex Only", label: "Flex Only" },
    { value: "Flex + LED", label: "Flex + LED" },
  ];

  const resolutionOptions = [
    { value: "1920x1080", label: "1920x1080 (Full HD)" },
    { value: "1280x720", label: "1280x720 (HD)" },
    { value: "960x540", label: "960x540" },
  ];

  const audioSystemOptions = [
    { value: "Basic", label: "Basic" },
    { value: "Premium", label: "Premium" },
    { value: "Professional", label: "Professional" },
  ];

  const soundQualityOptions = [
    { value: "Standard", label: "Standard" },
    { value: "High", label: "High" },
    { value: "Studio", label: "Studio" },
  ];

  const fuelTypeOptions = [
    { value: "Petrol", label: "Petrol" },
    { value: "Diesel", label: "Diesel" },
    { value: "CNG", label: "CNG" },
    { value: "Electric", label: "Electric" },
  ];

  const basePriceTypeOptions = [
    { value: "Per Day", label: "Per Day" },
    { value: "Per Hour", label: "Per Hour" },
    { value: "Per KM", label: "Per KM" },
  ];

  const statusOptions = [
    { value: "Available", label: "Available" },
    { value: "Booked", label: "Booked" },
    { value: "Maintenance", label: "Maintenance" },
    { value: "Off-Road", label: "Off-Road" },
  ];

  // Fixed: Direct handlers instead of generic function
  const handleBasicInfoChange = (field: string) => (value: string) => {
    setBasicInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleTechSpecsChange = (field: string) => (value: string) => {
    setTechSpecs((prev) => ({ ...prev, [field]: value }));
  };

  const handleVehicleDetailsChange = (field: string) => (value: string) => {
    setVehicleDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handlePricingChange = (field: string) => (value: string) => {
    setPricing((prev) => ({ ...prev, [field]: value }));
  };

  const handleDriverDetailsChange = (field: string) => (value: string) => {
    setDriverDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleStatusAvailabilityChange = (field: string) => (value: string) => {
    setStatusAvailability((prev) => ({ ...prev, [field]: value }));
  };

  const handleMaintenanceInfoChange = (field: string) => (value: string) => {
    setMaintenanceInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (setter: any, field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setter((prev: any) => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Vehicle Onboarding Management" />
      <div className="space-y-6">
        {/* Section 1: Basic Information */}
        <ComponentCard title="1. Basic Information">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label>Customized Type <span style={{ color: 'red' }}>*</span></Label>
              <div className="relative">
                <Select
                  options={customizedVehiclesOptions}
                  placeholder="Select"
                  onChange={handleBasicInfoChange("customizedType")}
                  className="dark:bg-dark-900"
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>

            <div>
              <Label>Vehicle ID <span style={{ color: 'red' }}>*</span></Label>
              <Input
                type="text" value={basicInfo.vehicleId}
                onChange={handleInputChange(setBasicInfo, "vehicleId")}
                placeholder="VH-2S-001"
              />
              {/* <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Auto generated
              </p> */}
            </div>

            <div>
              <Label>Vehicle Type <span style={{ color: 'red' }}>*</span></Label>
              <div className="relative">
                <Select
                  options={vehicleTypeOptions}
                  placeholder="Select Type"
                  onChange={handleBasicInfoChange("vehicleType")}
                  className="dark:bg-dark-900"
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>

            <div>
              <Label>Vehicle Name / Code <span style={{ color: 'red' }}>*</span></Label>
              <Input
                type="text"
                value={basicInfo.vehicleName}
                onChange={handleInputChange(setBasicInfo, "vehicleName")}
                placeholder="e.g. Single-side LED vehicles"
              />
            </div>
            <div>
              <Label>Registration Number <span style={{ color: 'red' }}>*</span></Label>
              <Input
                type="text"
                value={basicInfo.registrationNumber}
                onChange={handleInputChange(setBasicInfo, "registrationNumber")}
                placeholder="TN 01 AB 1234"
              />
            </div>
            <div>
              <Label>City / Operating Location <span style={{ color: 'red' }}>*</span></Label>
              <div className="relative">
                <Select
                  options={cityOptions}
                  placeholder="Select City"
                  onChange={handleBasicInfoChange("city")}
                  className="dark:bg-dark-900"
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>





            <div>
              <Label>Permit Type <span style={{ color: 'red' }}>*</span></Label>
              <div className="relative">
                <Select
                  options={permitOptions}
                  placeholder="Select Permit"
                  onChange={handleBasicInfoChange("permitType")}
                  className="dark:bg-dark-900"
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>


            <div>
              <Label>Model / Configuration <span style={{ color: 'red' }}>*</span></Label>
              <div className="relative">
                <Select
                  options={modelOptions}
                  placeholder="Select Model"
                  onChange={handleBasicInfoChange("modelConfig")}
                  className="dark:bg-dark-900"
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>
            <div>
              <Label>GPS Enabled <span style={{ color: 'red' }}>*</span></Label>
              <div className="relative">
                <Select
                  options={yesNoOptions}
                  placeholder="Select"
                  onChange={handleBasicInfoChange("gpsEnabled")}
                  className="dark:bg-dark-900"
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>
            <div>
              <Label>Ownership Type <span style={{ color: 'red' }}>*</span></Label>
              <div className="relative">
                <Select
                  options={ownershipOptions}
                  placeholder="Select"
                  onChange={handleBasicInfoChange("ownershipType")}
                  className="dark:bg-dark-900"
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>

            <div>
              <Label>Fuel Type <span style={{ color: 'red' }}>*</span></Label>
              <div className="relative">
                <Select
                  options={fuelTypeOptions}
                  placeholder="Select"
                  onChange={handleVehicleDetailsChange("fuelType")}
                  className="dark:bg-dark-900"
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>


            <div>
              <Label>Manufacturing / Vendor</Label>
              <Input
                type="text"
                placeholder="Enter manufacturer name"
              />
            </div>
            <div>
              <Label>Manufacturing Year</Label>
              <Input
                type="text"
                placeholder="e.g. 2023"
              />
            </div>

            <div>
              <Label>Status <span style={{ color: 'red' }}>*</span></Label>
              <div className="relative">
                <Select
                  options={[
                    { value: "Active", label: "Active" },
                    { value: "Inactive", label: "Inactive" },
                  ]}
                  placeholder="Active"
                  className="dark:bg-dark-900"
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>
          </div>
        </ComponentCard>

        {/* Section 2: Display & Technical Specifications */}
        <ComponentCard title="2. Display & Technical Specifications">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label>Screen Type <span style={{ color: 'red' }}>*</span></Label>
              <div className="relative">
                <Select
                  options={screenTypeOptions}
                  placeholder="LED Only"
                  onChange={handleTechSpecsChange("screenType")}
                  className="dark:bg-dark-900"
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>
            <div>
              <Label>Number of Screens <span style={{ color: 'red' }}>*</span></Label>
              <Input
                type="text"
                placeholder="Select"
                onChange={handleInputChange(setTechSpecs, "numberOfScreens")}
              />
            </div>
            <div>
              <Label>Screen Size (per side)</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Width (ft)"
                  className="flex-1"
                  onChange={handleInputChange(setTechSpecs, "screenSizeWidth")}
                />
                <Input
                  type="text"
                  placeholder="Height (ft)"
                  className="flex-1"
                  onChange={handleInputChange(setTechSpecs, "screenSizeHeight")}
                />
              </div>
            </div>
            <div>
              <Label>Resolution (Pixel Pitch)</Label>
              <div className="relative">
                <Select
                  options={resolutionOptions}
                  placeholder="Select"
                  onChange={handleTechSpecsChange("resolution")}
                  className="dark:bg-dark-900"
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>
            <div>
              <Label>Brightness (Nits)</Label>
              <Input
                type="text"
                placeholder="e.g. 5500"
                onChange={handleInputChange(setTechSpecs, "brightness")}
              />
            </div>
            <div>
              <Label>Display Version / Controller</Label>
              <Input
                type="text"
                placeholder="e.g. NovaStar A8s"
                onChange={handleInputChange(setTechSpecs, "displayVersion")}
              />
            </div>
            <div>
              <Label>Supported Formats</Label>
              <Input
                type="text"
                placeholder="e.g. MP4, JPG, PNG"
                onChange={handleInputChange(setTechSpecs, "supportedFormats")}
              />
            </div>
            <div>
              <Label>Audio System</Label>
              <div className="relative">
                <Select
                  options={audioSystemOptions}
                  placeholder="Select"
                  onChange={handleTechSpecsChange("audioSystem")}
                  className="dark:bg-dark-900"
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
                  options={soundQualityOptions}
                  placeholder="Select"
                  onChange={handleTechSpecsChange("soundQuality")}
                  className="dark:bg-dark-900"
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>
            <div>
              <Label>Generator Capactiy</Label>
              <Input
                type="text"
                placeholder="e.g. 1000Watts"
                onChange={handleInputChange(setTechSpecs, "generatorCapacity")}
              />
            </div>
            <div>
              <Label>Visibility Version</Label>
              <Input
                type="text"
                placeholder="e.g. P4, P6"
                onChange={handleInputChange(setTechSpecs, "visibilityVersion")}
              />
            </div>
            <div>
              <Label>Additional Features</Label>
              <Input
                type="text"
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
              <Label>Base Price Type <span style={{ color: 'red' }}>*</span></Label>
              <div className="relative">
                <Select
                  options={basePriceTypeOptions}
                  placeholder="Per Day"
                  onChange={handlePricingChange("basePriceType")}
                  className="dark:bg-dark-900"
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>
            <div>
              <Label>Base Cost Per Day (₹) <span style={{ color: 'red' }}>*</span></Label>
              <Input
                type="text"
                placeholder="e.g. 15,000"
                onChange={handleInputChange(setPricing, "costPerDay")}
              />
            </div>

            <div>
              <Label>Average KM Per Day <span style={{ color: 'red' }}>*</span></Label>
              <Input
                type="text"
                placeholder="e.g. 60"
                onChange={handleInputChange(setVehicleDetails, "avgKmPerDay")}
              />
            </div>

            <div>
              <Label>Extra  Charges (₹ / Km) <span style={{ color: 'red' }}>*</span></Label>
              <Input
                type="text"
                placeholder="e.g. 12"
                onChange={handleInputChange(setVehicleDetails, "extraKmPrice")}
              />
            </div>


            <div>
              <Label>Average Booking Hours <span style={{ color: 'red' }}>*</span></Label>
              <Input
                type="text"
                placeholder="e.g. 8"
                onChange={handleInputChange(setVehicleDetails, "avgBookingHrs")}
              />
            </div>

            <div>
              <Label>Extra  Charges (₹ / hr) <span style={{ color: 'red' }}>*</span></Label>
              <Input
                type="text"
                placeholder="e.g. 500"
                onChange={handleInputChange(setVehicleDetails, "extraHrPrice")}
              />
            </div>

            <div>
              <Label>RTO Charges (₹) </Label>
              <Input
                type="text"
                placeholder="e.g. 10,000"
                onChange={handleInputChange(setVehicleDetails, "rtoCharges")}
              />
            </div>

            <div>
              <Label>Fuel Efficiency (km/l)</Label>
              <Input
                type="text"
                placeholder="e.g. 6.5"
                onChange={handleInputChange(setVehicleDetails, "fuelEfficiency")}
              />
            </div>
            <div>
              <Label>Minimum Booking Duration</Label>
              <Input
                type="text"
                placeholder="e.g. 4 hrs"
                onChange={handleInputChange(setPricing, "minBookingDuration")}
              />
            </div>
            <div>
              <Label>Overtime Charges (₹ / hr)</Label>
              <Input
                type="text"
                placeholder="e.g. 500"
                onChange={handleInputChange(setPricing, "overtimeCharges")}
              />
            </div>
            <div>
              <Label>Waiting Charges (₹ / hr)</Label>
              <Input
                type="text"
                placeholder="e.g. 300"
                onChange={handleInputChange(setPricing, "waitingCharges")}
              />
            </div>

          </div>
        </ComponentCard>

        {/* Section 4: Media & Description */}
        <ComponentCard title="4. Media & Description">
          {/* <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"> </div> */}
          {/* Upload Images Section */}
          <div className="mt-2">
            <Label>Upload Images <span style={{ color: 'red' }}>*</span></Label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center dark:border-gray-600">
                <div className="mb-2 text-sm font-medium">Front View</div>
                <button className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300">
                  Upload
                </button>
              </div>
              <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center dark:border-gray-600">
                <div className="mb-2 text-sm font-medium">Left Side View</div>
                <button className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300">
                  Upload
                </button>
              </div>
              <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center dark:border-gray-600">
                <div className="mb-2 text-sm font-medium">Right Side View</div>
                <button className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300">
                  Upload
                </button>
              </div>
              <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center dark:border-gray-600">
                <div className="mb-2 text-sm font-medium">Rear View</div>
                <button className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300">
                  Upload
                </button>
              </div>
              <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center dark:border-gray-600">
                <div className="mb-2 text-sm font-medium">Interior / Other</div>
                <button className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300">
                  Upload
                </button>
              </div>
              <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center dark:border-gray-600">
                <div className="mb-2 text-sm font-medium">Demo Video</div>
                <button className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300">
                  Upload
                </button>
              </div>
            </div>
          </div>
          <div >
            <Label>Vehicle Description <span style={{ color: 'red' }}>*</span></Label>
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
            {/* <div>
              <Label>Manufacturing Year </Label>
              <Input
                type="date"
                onChange={handleInputChange(setMaintenanceInfo, "manufacturingYr")}
              />
            </div> */}
            <div>
              <Label>Manufacturing Year</Label>
              <Input
                type="text"
                placeholder="e.g. 2023"
              />
            </div>
            <div>
              <Label>Last Service Date</Label>
              <Input
                type="date"
                onChange={handleInputChange(setMaintenanceInfo, "lastServiceDate")}
              />
            </div>
            <div>
              <Label>Insurance Expiry Date </Label>
              <Input
                type="date"
                onChange={handleInputChange(setMaintenanceInfo, "insuranceExpiryDate")}
              />
            </div>
            <div>
              <Label>Pollution Certificate Expiry Date</Label>
              <Input
                type="date"
                onChange={handleInputChange(setMaintenanceInfo, "pollutionCertificateExpiryDate")}
              />
            </div>

          </div>
        </ComponentCard>


        {/* Section 6: Driver Details */}
        <ComponentCard title="6. Driver Details">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label>Driver Name</Label>
              <Input
                type="text"
                placeholder="Enter driver name"
                onChange={handleInputChange(setDriverDetails, "driverName")}
              />
            </div>
            <div>
              <Label>Driver Phone</Label>
              <Input
                type="text"
                placeholder="Enter phone number"
                onChange={handleInputChange(setDriverDetails, "driverPhone")}
              />
            </div>
            <div>
              <Label>Backup Driver (Optional)</Label>
              <Input
                type="text"
                placeholder="Enter backup driver name"
                onChange={handleInputChange(setDriverDetails, "backupDriver")}
              />
            </div>
            <div>
              <Label>Backup Driver Phone</Label>
              <Input
                type="text"
                placeholder="Enter phone number"
                onChange={handleInputChange(setDriverDetails, "backupDriverPhone")}
              />
            </div>
          </div>
        </ComponentCard>

        {/* Section 7: Status & Availability */}
        <ComponentCard title="7. Status & Availability">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label>Current Status <span style={{ color: 'red' }}>*</span></Label>
              <div className="relative">
                <Select
                  options={statusOptions}
                  placeholder="Select status"
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
              <Input
                type="date"
                onChange={handleInputChange(setStatusAvailability, "availableFrom")}
              />
            </div>
            <div className="lg:col-span-2">
              <Label>Remarks</Label>
              <Input
                type="text"
                placeholder="Enter remarks (optional)"
                onChange={handleInputChange(setStatusAvailability, "remarks")}
              />
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
                    onChange={() =>
                      setMaintenanceInfo((prev) => ({ ...prev, maintenanceStatus: "No" }))
                    }
                    className="h-4 w-4"
                  />
                  <span>No</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="maintenanceStatus"
                    value="Yes"
                    checked={maintenanceInfo.maintenanceStatus === "Yes"}
                    onChange={() =>
                      setMaintenanceInfo((prev) => ({ ...prev, maintenanceStatus: "Yes" }))
                    }
                    className="h-4 w-4"
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
                className={maintenanceInfo.maintenanceStatus === "No" ? "opacity-50" : ""}
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
                className={maintenanceInfo.maintenanceStatus === "No" ? "opacity-50" : ""}
              />
            </div>
          </div>
        </ComponentCard>

        {/* Form Actions */}
        <div className="flex justify-center gap-10">
          <button className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
            Cancel
          </button>
          <button className="rounded-lg bg-brand-600 px-6 py-2 text-sm font-medium text-white hover:bg-brand-700">
            Save Vehicle
          </button>
        </div>
      </div>
    </div>
  );
}