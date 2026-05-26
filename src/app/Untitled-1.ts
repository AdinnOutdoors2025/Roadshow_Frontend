"use client";

import React, { useState, useEffect, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ChevronDown, Search, Save, CheckCircle, XCircle, Edit3 } from "lucide-react";

// Assuming these components exist in your project
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

// ------------------------------------------------
// Mock Data
// ------------------------------------------------

// Vehicle Models & their static summary
const VEHICLE_MODELS = [
  {
    id: "3-side-led",
    name: "3 Side LED Vehicle",
    summary: {
      customizedType: "Non-Customized",
      screenType: "LED Only",
      numberOfScreens: 3,
      screenSize: "18 x 7 ft",
      backScreenSize: "7 x 7 ft",
      basePrice: "₹27,500 / Day",
      resolution: "1080 x 520 px",
      audioOutput: "1500 W",
    },
  },
  {
    id: "2-side-led",
    name: "2 Side LED Vehicle",
    summary: {
      customizedType: "Standard",
      screenType: "LED Only",
      numberOfScreens: 2,
      screenSize: "15 x 6 ft",
      backScreenSize: "6 x 6 ft",
      basePrice: "₹22,000 / Day",
      resolution: "960 x 480 px",
      audioOutput: "1200 W",
    },
  },
  {
    id: "front-led",
    name: "Front LED + Back LED",
    summary: {
      customizedType: "Customized",
      screenType: "LED + Fixed",
      numberOfScreens: 2,
      screenSize: "20 x 8 ft",
      backScreenSize: "8 x 8 ft",
      basePrice: "₹35,000 / Day",
      resolution: "1280 x 720 px",
      audioOutput: "2000 W",
    },
  },
];

// All vehicles data (each linked to a model by modelId)
const ALL_VEHICLES = [
  {
    id: "veh1",
    registrationNumber: "TN 58 BQ 9556",
    vehicleId: "1205620111",
    city: "Chennai",
    modelId: "3-side-led",
    modelConfig: "3 Side LED",
    ledScreenSize: "18 x 7 ft",
    gps: "Enabled",
    status: "Available",
    remarks: "Ready for booking",
    lastUpdated: "17 May 2026 10:15 AM",
  },
  {
    id: "veh2",
    registrationNumber: "TN 58 BH 5459",
    vehicleId: "1205620156",
    city: "Chennai",
    modelId: "3-side-led",
    modelConfig: "3 Side LED",
    ledScreenSize: "18 x 7 ft",
    gps: "Enabled",
    status: "On Road",
    remarks: "Campaign in progress",
    lastUpdated: "17 May 2026 09:42 AM",
  },
  {
    id: "veh3",
    registrationNumber: "TN 58 BF 4167",
    vehicleId: "1205628159",
    city: "Madurai",
    modelId: "3-side-led",
    modelConfig: "3 Side LED",
    ledScreenSize: "18 x 7 ft",
    gps: "Enabled",
    status: "Under Maintenance",
    remarks: "Screen panel service",
    lastUpdated: "17 May 2026 08:30 AM",
  },
  {
    id: "veh4",
    registrationNumber: "TN 58 BK 3049",
    vehicleId: "1205630220",
    city: "Coimbatore",
    modelId: "3-side-led",
    modelConfig: "3 Side LED",
    ledScreenSize: "18 x 7 ft",
    gps: "Enabled",
    status: "Unavailable",
    remarks: "Not operational",
    lastUpdated: "16 May 2026 06:18 PM",
  },
  {
    id: "veh5",
    registrationNumber: "TN 09 AZ 7788",
    vehicleId: "1205630445",
    city: "Chennai",
    modelId: "3-side-led",
    modelConfig: "3 Side LED",
    ledScreenSize: "23 x 8 ft",
    gps: "Enabled",
    status: "Waiting for Branding",
    remarks: "Branding in progress",
    lastUpdated: "16 May 2026 04:05 PM",
  },
  {
    id: "veh6",
    registrationNumber: "TN 14 CR 2211",
    vehicleId: "1205630777",
    city: "Madurai",
    modelId: "3-side-led",
    modelConfig: "3 Side LED",
    ledScreenSize: "18 x 7 ft",
    gps: "Enabled",
    status: "Customization Pending",
    remarks: "Accessories pending",
    lastUpdated: "16 May 2026 11:28 AM",
  },
  {
    id: "veh7",
    registrationNumber: "TN 22 AB 1234",
    vehicleId: "1205630888",
    city: "Chennai",
    modelId: "2-side-led",
    modelConfig: "2 Side LED",
    ledScreenSize: "15 x 6 ft",
    gps: "Enabled",
    status: "Available",
    remarks: "Ready for booking",
    lastUpdated: "17 May 2026 09:00 AM",
  },
  {
    id: "veh8",
    registrationNumber: "TN 45 CD 5678",
    vehicleId: "1205630999",
    city: "Coimbatore",
    modelId: "front-led",
    modelConfig: "Front LED + Back LED",
    ledScreenSize: "20 x 8 ft",
    gps: "Enabled",
    status: "Booked",
    remarks: "Booked for event",
    lastUpdated: "16 May 2026 02:00 PM",
  },
];

// Status options (from legend)
const STATUS_OPTIONS = [
  "Available",
  "Booked",
  "On Road",
  "Under Maintenance",
  "Unavailable",
  "Waiting for Branding",
  "Customization Pending",
];

// City options
const CITY_OPTIONS = ["Chennai", "Madurai", "Coimbatore", "Salem", "Tiruchirappalli"];

// Helper: format current date/time for lastUpdated
const getCurrentDateTime = () => {
  return new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// ------------------------------------------------
// Main Component
// ------------------------------------------------
export default function VehicleInventory() {
  // State for selected model
  const [selectedModelId, setSelectedModelId] = useState("3-side-led");
  const selectedModel = VEHICLE_MODELS.find((m) => m.id === selectedModelId)!;

  // State for vehicles list (mutable)
  const [vehicles, setVehicles] = useState(ALL_VEHICLES);

  // Filter states: search by registration number & city filter
  const [searchRegNo, setSearchRegNo] = useState("");
  const [filterCity, setFilterCity] = useState("");

  // Selected rows for bulk actions
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Bulk action states
  const [bulkStatus, setBulkStatus] = useState(STATUS_OPTIONS[0]);
  const [bulkCity, setBulkCity] = useState(CITY_OPTIONS[0]);

  // Get vehicles for the selected model
  const modelVehicles = vehicles.filter((v) => v.modelId === selectedModelId);

  // Apply filters (search + city)
  const filteredVehicles = modelVehicles.filter((v) => {
    const matchesRegNo = v.registrationNumber
      .toLowerCase()
      .includes(searchRegNo.toLowerCase());
    const matchesCity = filterCity === "" || v.city === filterCity;
    return matchesRegNo && matchesCity;
  });

  // Update selectAll when selection changes
  useEffect(() => {
    if (selectAll && filteredVehicles.length > 0) {
      setSelectedVehicleIds(filteredVehicles.map((v) => v.id));
    } else if (!selectAll) {
      setSelectedVehicleIds([]);
    }
  }, [selectAll, filteredVehicles]);

  // When filtered list changes, adjust selectAll state
  useEffect(() => {
    const allFilteredIds = filteredVehicles.map((v) => v.id);
    const allSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedVehicleIds.includes(id));
    setSelectAll(allSelected);
  }, [filteredVehicles, selectedVehicleIds]);

  // Handlers for row updates
  const handleRowChange = (
    vehicleId: string,
    field: "city" | "status" | "remarks",
    value: string
  ) => {
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === vehicleId ? { ...v, [field]: value } : v
      )
    );
  };

  const handleSaveRow = (vehicleId: string) => {
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === vehicleId
          ? { ...v, lastUpdated: getCurrentDateTime() }
          : v
      )
    );
    toast.success(`Vehicle ${vehicleId.slice(0, 6)}... saved successfully!`);
  };

  // Bulk handlers
  const handleSetStatusForSelected = () => {
    if (selectedVehicleIds.length === 0) {
      toast.warn("No vehicles selected.");
      return;
    }
    setVehicles((prev) =>
      prev.map((v) =>
        selectedVehicleIds.includes(v.id)
          ? { ...v, status: bulkStatus, lastUpdated: getCurrentDateTime() }
          : v
      )
    );
    toast.success(`Status updated to "${bulkStatus}" for ${selectedVehicleIds.length} vehicle(s).`);
    setSelectedVehicleIds([]);
    setSelectAll(false);
  };

  const handleSetCityForSelected = () => {
    if (selectedVehicleIds.length === 0) {
      toast.warn("No vehicles selected.");
      return;
    }
    setVehicles((prev) =>
      prev.map((v) =>
        selectedVehicleIds.includes(v.id)
          ? { ...v, city: bulkCity, lastUpdated: getCurrentDateTime() }
          : v
      )
    );
    toast.success(`City updated to "${bulkCity}" for ${selectedVehicleIds.length} vehicle(s).`);
    setSelectedVehicleIds([]);
    setSelectAll(false);
  };

  const handleApplyToSelected = () => {
    if (selectedVehicleIds.length === 0) {
      toast.warn("No vehicles selected.");
      return;
    }
    // Simulate API call & update timestamps
    setVehicles((prev) =>
      prev.map((v) =>
        selectedVehicleIds.includes(v.id)
          ? { ...v, lastUpdated: getCurrentDateTime() }
          : v
      )
    );
    toast.success(`Applied bulk action to ${selectedVehicleIds.length} vehicle(s).`);
    setSelectedVehicleIds([]);
    setSelectAll(false);
  };

  const handleSaveAllUpdates = () => {
    setVehicles((prev) =>
      prev.map((v) =>
        v.modelId === selectedModelId
          ? { ...v, lastUpdated: getCurrentDateTime() }
          : v
      )
    );
    toast.success(`All ${modelVehicles.length} vehicles updated successfully.`);
  };

  // Toggle individual checkbox
  const toggleSelectVehicle = (vehicleId: string) => {
    setSelectedVehicleIds((prev) =>
      prev.includes(vehicleId)
        ? prev.filter((id) => id !== vehicleId)
        : [...prev, vehicleId]
    );
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <PageBreadcrumb pageTitle="Inventory / Vehicle Availability" />

      <div className="space-y-6">
        {/* -------------------- Model Selection & Search / Filters -------------------- */}
        <ComponentCard title="Select Vehicle Model & Filters">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Vehicle Model / Type <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Select
                  options={VEHICLE_MODELS.map((m) => ({ value: m.id, label: m.name }))}
                  value={selectedModelId}
                  onChange={(val) => {
                    setSelectedModelId(val);
                    setSearchRegNo("");
                    setFilterCity("");
                    setSelectedVehicleIds([]);
                    setSelectAll(false);
                  }}
                  placeholder="Select Model"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </span>
              </div>
            </div>
            <div>
              <Label>Search by Registration Number</Label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search reg no..."
                  value={searchRegNo}
                  onChange={(e) => setSearchRegNo(e.target.value)}
                  className="pl-9"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
            <div>
              <Label>Filter by City</Label>
              <div className="relative">
                <Select
                  options={[{ value: "", label: "All Cities" }, ...CITY_OPTIONS.map(c => ({ value: c, label: c }))]}
                  value={filterCity}
                  onChange={(val) => setFilterCity(val)}
                  placeholder="All Cities"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </span>
              </div>
            </div>
            <div className="flex items-end">
              <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg w-full flex justify-between items-center">
                <span className="font-medium">{filteredVehicles.length} Vehicles Mapped</span>
                <button
                  onClick={handleSaveAllUpdates}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save All Updates
                </button>
              </div>
            </div>
          </div>
        </ComponentCard>

        {/* -------------------- Read-only Summary Table -------------------- */}
        <ComponentCard title="Selected Vehicle Model Summary (Read-only)">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr className="border-b">
                  <th className="text-left p-2">Customized Type</th>
                  <th className="text-left p-2">Screen Type</th>
                  <th className="text-left p-2"># Screens</th>
                  <th className="text-left p-2">Screen Size</th>
                  <th className="text-left p-2">Back Screen Size</th>
                  <th className="text-left p-2">Base Price</th>
                  <th className="text-left p-2">Resolution</th>
                  <th className="text-left p-2">Audio Output</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">{selectedModel.summary.customizedType}</td>
                  <td className="p-2">{selectedModel.summary.screenType}</td>
                  <td className="p-2">{selectedModel.summary.numberOfScreens}</td>
                  <td className="p-2">{selectedModel.summary.screenSize}</td>
                  <td className="p-2">{selectedModel.summary.backScreenSize}</td>
                  <td className="p-2">{selectedModel.summary.basePrice}</td>
                  <td className="p-2">{selectedModel.summary.resolution}</td>
                  <td className="p-2">{selectedModel.summary.audioOutput}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </ComponentCard>

        {/* -------------------- Bulk Actions Bar -------------------- */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={(e) => setSelectAll(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm font-medium">{selectedVehicleIds.length} selected</span>
          </div>
          <div className="h-6 w-px bg-gray-300"></div>
          <div className="flex gap-2 items-center">
            <Select
              options={STATUS_OPTIONS.map(s => ({ value: s, label: s }))}
              value={bulkStatus}
              onChange={(val) => setBulkStatus(val)}
              className="w-40"
            />
            <button
              onClick={handleSetStatusForSelected}
              className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-md text-sm hover:bg-indigo-200"
            >
              Set Status
            </button>
          </div>
          <div className="flex gap-2 items-center">
            <Select
              options={CITY_OPTIONS.map(c => ({ value: c, label: c }))}
              value={bulkCity}
              onChange={(val) => setBulkCity(val)}
              className="w-40"
            />
            <button
              onClick={handleSetCityForSelected}
              className="px-3 py-1.5 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200"
            >
              Set City
            </button>
          </div>
          <button
            onClick={handleApplyToSelected}
            className="px-4 py-1.5 bg-gray-700 text-white rounded-md text-sm hover:bg-gray-800"
          >
            Apply to Selected
          </button>
        </div>

        {/* -------------------- Vehicles Table -------------------- */}
        <ComponentCard title="Mapped Vehicles Under Selected Model">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                <tr className="border-b">
                  <th className="p-3 text-left w-10">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={(e) => setSelectAll(e.target.checked)}
                      className="w-4 h-4"
                    />
                  </th>
                  <th className="p-3 text-left">Registration Number</th>
                  <th className="p-3 text-left">Vehicle ID</th>
                  <th className="p-3 text-left">City / Location</th>
                  <th className="p-3 text-left">Model Config</th>
                  <th className="p-3 text-left">LED Screen Size</th>
                  <th className="p-3 text-left">GPS</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Remarks</th>
                  <th className="p-3 text-left">Last Updated</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.length === 0 && (
                  <tr>
                    <td colSpan={11} className="text-center p-8 text-gray-500">
                      No vehicles found for this model & filters.
                    </td>
                  </tr>
                )}
                {filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedVehicleIds.includes(vehicle.id)}
                        onChange={() => toggleSelectVehicle(vehicle.id)}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="p-3 font-medium">{vehicle.registrationNumber}</td>
                    <td className="p-3">{vehicle.vehicleId}</td>
                    <td className="p-3">
                      <div className="relative w-36">
                        <Select
                          options={CITY_OPTIONS.map(c => ({ value: c, label: c }))}
                          value={vehicle.city}
                          onChange={(val) => handleRowChange(vehicle.id, "city", val)}
                          className="w-full"
                        />
                      </div>
                    </td>
                    <td className="p-3">{vehicle.modelConfig}</td>
                    <td className="p-3">{vehicle.ledScreenSize}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-3 h-3" /> {vehicle.gps}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="relative w-40">
                        <Select
                          options={STATUS_OPTIONS.map(s => ({ value: s, label: s }))}
                          value={vehicle.status}
                          onChange={(val) => handleRowChange(vehicle.id, "status", val)}
                          className="w-full"
                        />
                      </div>
                    </td>
                    <td className="p-3">
                      <Input
                        type="text"
                        value={vehicle.remarks}
                        onChange={(e) => handleRowChange(vehicle.id, "remarks", e.target.value)}
                        className="w-40"
                        placeholder="Remarks"
                      />
                    </td>
                    <td className="p-3 text-xs text-gray-500">{vehicle.lastUpdated}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleSaveRow(vehicle.id)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-md text-xs hover:bg-blue-600 flex items-center gap-1"
                      >
                        <Save className="w-3 h-3" /> Save
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ComponentCard>

        {/* -------------------- Quick Guidance & Legend -------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ComponentCard title="Quick Guidance">
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <p>1️⃣ <strong>Select a vehicle model once</strong><br />Pick the model/type from the dropdown above.</p>
              <p>2️⃣ <strong>All mapped vehicles load automatically</strong><br />All vehicles linked to the selected model are listed for easy management.</p>
              <p>3️⃣ <strong>Update location, status, remarks and save</strong><br />Edit the required fields and click Save Row or use bulk actions to update multiple vehicles.</p>
              <p>4️⃣ <strong>One model. All vehicles. Update everything in one place.</strong></p>
            </div>
          </ComponentCard>

          <ComponentCard title="Status Legend">
            <div className="grid grid-cols-2 gap-2 text-sm">
              {STATUS_OPTIONS.map((status) => (
                <div key={status} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    status === "Available" ? "bg-green-500" :
                    status === "Booked" ? "bg-red-500" :
                    status === "On Road" ? "bg-blue-500" :
                    status === "Under Maintenance" ? "bg-yellow-500" :
                    status === "Unavailable" ? "bg-gray-500" :
                    status === "Waiting for Branding" ? "bg-purple-500" :
                    "bg-orange-500"
                  }`}></div>
                  <span>{status}</span>
                </div>
              ))}
            </div>
          </ComponentCard>
        </div>
      </div>
    </>
  );
}