// "use client";
// import React, { useState, useEffect, useRef } from "react";
// import { toast, ToastContainer } from "react-toastify";
// import Label from "@/components/form/Label";
// import Input from "@/components/form/input/InputField";
// import Select from "@/components/form/Select";
// import { ChevronDownIcon, PlusIcon } from "@/icons";
// import { baseUrl } from "../../../../../BaseUrl";
// import { NotebookPen, Trash2, Calendar, Upload, X, Eye } from "lucide-react";
// import SelectInput from "@/components/form/form-elements/SelectInputs";
// import ComponentCard from "@/components/common/ComponentCard";
// import PageBreadcrumb from "@/components/common/PageBreadCrumb";
// import TruckImg from '../../../../(admin)/images/truck-regular_img.png'
// const VEHICLE_MODELS = [
//   {
//     id: "3-side-led",
//     name: "3 Side LED Vehicle",
//     summary: {
//       customizedType: "Non-Customized",
//       screenType: "LED Only",
//       numberOfScreens: 3,
//       screenSize: "18 x 7 ft",
//       backScreenSize: "7 x 7 ft",
//       basePrice: "₹27,500 / Day",
//       resolution: "1080 x 520 px",
//       audioOutput: "1500 W",
//     },
//   },
//   {
//     id: "2-side-led",
//     name: "2 Side LED Vehicle",
//     summary: {
//       customizedType: "Standard",
//       screenType: "LED Only",
//       numberOfScreens: 2,
//       screenSize: "15 x 6 ft",
//       backScreenSize: "6 x 6 ft",
//       basePrice: "₹22,000 / Day",
//       resolution: "960 x 480 px",
//       audioOutput: "1200 W",
//     },
//   },
//   {
//     id: "front-led",
//     name: "Front LED + Back LED",
//     summary: {
//       customizedType: "Customized",
//       screenType: "LED + Fixed",
//       numberOfScreens: 2,
//       screenSize: "20 x 8 ft",
//       backScreenSize: "8 x 8 ft",
//       basePrice: "₹35,000 / Day",
//       resolution: "1280 x 720 px",
//       audioOutput: "2000 W",
//     },
//   },
// ];
// const vehicleOptions = VEHICLE_MODELS.map(model => ({
//   value: model.id,
//   label: model.name,
// }));

// // ─── Status Badge ─────────────────────────────────────────────────────────────
// const StatusBadge = ({ status }) => {
//   const styles = {
//     Available:
//       "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
//     Unavailable:
//       "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
//   };
//   return (
//     <span
//       className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.Available
//         }`}
//     >
//       {status}
//     </span>
//   );
// };

// export default function Vehicle_Inventory() {
//   return (
//     <div className="p-2 mx-0 max-w-(--breakpoint-2xl) md:p-0">
//       {/* Count section  */}
//       <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-around' }}>
//         <div style={{ display: 'flex', justifyContent: 'space-around', background: 'white', borderRadius: '5px', gap: '15px', padding: '20px 25px' }}>
//           <div>
//             <div style={{ padding: '15px', background: '#afcdf3', borderRadius: '5px', }}>
//               <i className="fa-solid fa-truck" style={{ fontSize: '25px', color: "#123c70" }}></i>
//             </div>
//           </div>
//           <div>
//             <div>Total Vehicles</div>
//             <div style={{ fontSize: '30px', fontWeight: '600' }}>24</div>
//             <div>All Onboarded Vehicles</div>
//           </div>
//         </div>

//         <div style={{ display: 'flex', justifyContent: 'space-around', background: 'white', borderRadius: '5px', gap: '15px', padding: '20px 25px' }}>
//           <div>
//             <div style={{ padding: '15px', background: '#b8fdcd', borderRadius: '5px' }}>
//               <i class="fa-regular fa-circle-check" style={{ fontSize: '25px', color: '#15653c' }}></i>         </div>
//           </div>
//           <div>
//             <div>Available</div>
//             <div style={{ fontSize: '30px', fontWeight: '600' }}>12</div>
//             <div style={{ color: '#15653c' }}>50.00% of total</div>
//           </div>
//         </div>

//         <div style={{ display: 'flex', justifyContent: 'space-around', background: 'white', borderRadius: '5px', gap: '15px', padding: '20px 25px' }}>
//           <div>
//             <div style={{ padding: '15px', background: 'rgb(243, 228, 215)', borderRadius: '5px' }}>
//               <i class="fa-regular fa-circle-play" style={{ color: "rgb(230, 161, 99)", fontSize: '25px' }}></i>
//             </div>
//           </div>
//           <div>
//             <div>Running (In Use) </div>
//             <div style={{ fontSize: '30px', fontWeight: '600' }}>5</div>
//             <div style={{ color: "rgb(230, 161, 99)" }}>20.83% of total</div>
//           </div>
//         </div>

//         <div style={{ display: 'flex', justifyContent: 'space-around', background: 'white', borderRadius: '5px', gap: '15px', padding: '20px 25px' }}>
//           <div>
//             <div style={{ padding: '15px', background: 'rgb(255, 206, 206)', borderRadius: '5px' }}>
//               <i class="fa-regular fa-calendar-days" style={{ color: "rgb(240, 7, 7)", fontSize: "25px" }}></i>                  </div>
//           </div>
//           <div>
//             <div>Allotted (Booked) </div>
//             <div style={{ fontSize: '30px', fontWeight: '600' }}>4</div>
//             <div style={{ color: 'rgba(240, 7, 7, 1.00)' }}>16.67% of total</div>
//           </div>
//         </div>

//         <div style={{ display: 'flex', justifyContent: 'space-around', background: 'white', borderRadius: '5px', gap: '15px', padding: '20px 25px' }}>
//           <div>
//             <div style={{ padding: '15px', background: 'rgb(255, 206, 206)', borderRadius: '5px' }}>
//               <i class="fa-solid fa-gears" style={{ color: ' rgb(242, 206, 18)' }}></i>
//             </div>
//             <div>
//               <div>Under Maintenance</div>
//               <div style={{ fontSize: '30px', fontWeight: '600' }}>3</div>
//               <div style={{ color: 'rgba(240, 7, 7, 1.00)' }}>12.50% of total</div>
//             </div>
//           </div>

//         </div>
//       </div>
//     </div>
//   )
// }








"use client";

import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Truck,
  CheckCircle2,
  PlayCircle,
  Calendar,
  Settings,
  Search,
  ChevronDown,
  NotebookPen,
  Trash2,
  Wrench,
  Save,
  X,
  Eye,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Vehicle Model Definitions
// ─────────────────────────────────────────────────────────────────────────────
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

const vehicleOptions = [
  { value: "all", label: "All Models" },
  ...VEHICLE_MODELS.map((model) => ({ value: model.id, label: model.name })),
];

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Generate Mock Vehicles (24 total with exact status distribution)
// ─────────────────────────────────────────────────────────────────────────────
const generateMockVehicles = () => {
  const statuses = [
    "Available",
    "Available",
    "Available",
    "Available",
    "Available",
    "Available",
    "Available",
    "Available",
    "Available",
    "Available",
    "Available",
    "Available", // 12 Available
    "Running",
    "Running",
    "Running",
    "Running",
    "Running", // 5 Running
    "Allotted",
    "Allotted",
    "Allotted",
    "Allotted", // 4 Allotted
    "Under Maintenance",
    "Under Maintenance",
    "Under Maintenance", // 3 Maintenance
  ];

  const cities = [
    "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad",
    "Pune", "Ahmedabad", "Jaipur", "Lucknow",
  ];
  const modelIds = ["3-side-led", "2-side-led", "front-led"];
  const gpsOptions = ["Active", "Inactive"];

  const vehicles = [];
  for (let i = 1; i <= 24; i++) {
    const status = statuses[i - 1];
    const modelId = modelIds[Math.floor(Math.random() * modelIds.length)];
    const modelName = VEHICLE_MODELS.find((m) => m.id === modelId)?.name || "3 Side LED Vehicle";
    vehicles.push({
      id: i,
      registrationNumber: `HR${26 + i}-AB-${1234 + i}`,
      vehicleId: i <= 12 ? `VH-0S-${String(i).padStart(3, "0")}` : `VH-${Math.floor(Math.random() * 3) + 1}S-${String(i).padStart(3, "0")}`,
      city: cities[i % cities.length],
      modelId: modelId,
      modelName: modelName,
      gpsStatus: gpsOptions[i % 2],
      status: status,
      remarks: `Remarks ${i}`,
      lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    });
  }
  return vehicles;
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const styles = {
    Available: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    Running: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    Allotted: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    "Under Maintenance": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
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

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function VehicleInventory() {
  // State for vehicles and filters
  const [vehicles, setVehicles] = useState(generateMockVehicles());
  const [selectedModelId, setSelectedModelId] = useState("3-side-led");
  const [searchRegNo, setSearchRegNo] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [zoneFilter, setZoneFilter] = useState("all");

  // Editable row states (for inline editing)
  const [editingRows, setEditingRows] = useState({});

  // Derived stats from full vehicle list (unfiltered)
  const totalVehicles = vehicles.length;
  const availableCount = vehicles.filter((v) => v.status === "Available").length;
  const runningCount = vehicles.filter((v) => v.status === "Running").length;
  const allottedCount = vehicles.filter((v) => v.status === "Allotted").length;
  const maintenanceCount = vehicles.filter((v) => v.status === "Under Maintenance").length;

  // Filtered vehicles for table display
  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesModel = selectedModelId === "all" || vehicle.modelId === selectedModelId;
    const matchesSearch = vehicle.registrationNumber.toLowerCase().includes(searchRegNo.toLowerCase());
    const matchesCity = cityFilter === "all" || vehicle.city === cityFilter;
    const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter;
    // Zone filter mock (just demo)
    const matchesZone = zoneFilter === "all" || (zoneFilter === "A" && vehicle.city === "Mumbai") || (zoneFilter === "B" && vehicle.city === "Delhi");
    return matchesModel && matchesSearch && matchesCity && matchesStatus && matchesZone;
  });

  // Selected model summary data
  const selectedModel = VEHICLE_MODELS.find((m) => m.id === selectedModelId) || VEHICLE_MODELS[0];

  // Handlers for inline editing
  const handleEditField = (vehicleId, field, value) => {
    setEditingRows((prev) => ({
      ...prev,
      [vehicleId]: {
        ...prev[vehicleId],
        [field]: value,
      },
    }));
  };

  const handleSaveRow = (vehicleId) => {
    const updatedFields = editingRows[vehicleId];
    if (!updatedFields) return;

    setVehicles((prevVehicles) =>
      prevVehicles.map((v) =>
        v.id === vehicleId
          ? {
            ...v,
            city: updatedFields.city !== undefined ? updatedFields.city : v.city,
            gpsStatus: updatedFields.gpsStatus !== undefined ? updatedFields.gpsStatus : v.gpsStatus,
            status: updatedFields.status !== undefined ? updatedFields.status : v.status,
            remarks: updatedFields.remarks !== undefined ? updatedFields.remarks : v.remarks,
            lastUpdated: new Date().toLocaleDateString(),
          }
          : v
      )
    );
    setEditingRows((prev) => {
      const newState = { ...prev };
      delete newState[vehicleId];
      return newState;
    });
    toast.success("Vehicle details updated successfully!");
  };

  const handleDeleteVehicle = (vehicleId, regNumber) => {
    if (window.confirm(`Are you sure you want to delete vehicle ${regNumber}?`)) {
      setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
      toast.success("Vehicle deleted successfully!");
    }
  };

  const handleMaintenance = (vehicleId) => {
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === vehicleId
          ? { ...v, status: "Under Maintenance", lastUpdated: new Date().toLocaleDateString() }
          : v
      )
    );
    toast.info("Vehicle moved to maintenance.");
  };

  // Unique cities for filter dropdown
  const uniqueCities = ["all", ...new Set(vehicles.map((v) => v.city))];

  return (
    <div className="min-h-screen mx-2 bg-gray-50 p-4 md:p-0">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
        <span className="font-medium">Inventory</span>
        <span>/</span>
        <span className="text-gray-900">Vehicle Availability</span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {/* Total Vehicles */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Truck className="w-6 h-6 text-blue-700" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Vehicles</p>
            <p className="text-2xl font-bold">{totalVehicles}</p>
            <p className="text-xs text-gray-400">All Onboarded Vehicles</p>
          </div>
        </div>
        {/* Available */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <CheckCircle2 className="w-6 h-6 text-green-700" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Available</p>
            <p className="text-2xl font-bold">{availableCount}</p>
            <p className="text-xs text-green-600">{((availableCount / totalVehicles) * 100).toFixed(2)}% of total</p>
          </div>
        </div>
        {/* Running */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
          <div className="p-3 bg-orange-100 rounded-lg">
            <PlayCircle className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Running (In Use)</p>
            <p className="text-2xl font-bold">{runningCount}</p>
            <p className="text-xs text-orange-600">{((runningCount / totalVehicles) * 100).toFixed(2)}% of total</p>
          </div>
        </div>
        {/* Allotted */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
          <div className="p-3 bg-red-100 rounded-lg">
            <Calendar className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Allotted (Booked)</p>
            <p className="text-2xl font-bold">{allottedCount}</p>
            <p className="text-xs text-red-600">{((allottedCount / totalVehicles) * 100).toFixed(2)}% of total</p>
          </div>
        </div>
        {/* Under Maintenance */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
          <div className="p-3 bg-yellow-100 rounded-lg">
            <Settings className="w-6 h-6 text-yellow-700" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Under Maintenance</p>
            <p className="text-2xl font-bold">{maintenanceCount}</p>
            <p className="text-xs text-yellow-700">{((maintenanceCount / totalVehicles) * 100).toFixed(2)}% of total</p>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      {/* <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <h3 className="font-semibold text-gray-800 mb-4">Filter Inventory</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Model / Type</label>
            <div className="relative">
              <select
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {vehicleOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City / Location</label>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm focus:border-blue-500 focus:outline-none"
            >
              {uniqueCities.map((city) => (
                <option key={city} value={city}>
                  {city === "all" ? "All Cities" : city}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Operating Zone</label>
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Zones</option>
              <option value="A">Zone A</option>
              <option value="B">Zone B</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="Available">Available</option>
              <option value="Running">Running</option>
              <option value="Allotted">Allotted</option>
              <option value="Under Maintenance">Under Maintenance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search by Reg. Number</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search reg no..."
                value={searchRegNo}
                onChange={(e) => setSearchRegNo(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div> */}


      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Mapped Vehicle Table */}

        <div className="lg:col-span-9">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b">
              <h3 className="font-semibold text-gray-800">Mapped Vehicle Model Summary</h3>
              <p className="text-sm text-gray-500 mt-1">Vehicle registration number, LED size and model details are auto-loaded. Update GPS, location, status and remarks inline.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-500 text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left">Vehicle ID</th>
                    <th className="px-4 py-3 text-left">Vehicle Details</th>
                    <th className="px-4 py-3 text-left">City / Current Location</th>
                    <th className="px-4 py-3 text-left">Model Config</th>
                    <th className="px-4 py-3 text-left">GPS</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Remarks</th>
                    <th className="px-4 py-3 text-left">Last Updated</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredVehicles.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                        No vehicles match the filters.
                      </td>
                    </tr>
                  ) : (
                    filteredVehicles.map((vehicle) => {
                      const isEditing = editingRows[vehicle.id] || {};
                      return (
                        <tr key={vehicle.id} className="hover:bg-gray-50 transition">
                          <td className="px-4 py-3 text-gray-600">{vehicle.vehicleId}</td>

                          <td className="px-4 py-3 font-mono font-semibold text-blue-700">
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <div>
                                <img src='/images/Truck_Image.jpg' style={{ width: '60px', height: '60px' }}></img>
                              </div>
                              <div>
                                <div> {vehicle.registrationNumber} </div>
                                <div>3-Side LED</div>
                                <div>17 FT</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={isEditing.city !== undefined ? isEditing.city : vehicle.city}
                              onChange={(e) => handleEditField(vehicle.id, "city", e.target.value)}
                              className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:border-blue-400 focus:outline-none"
                            />
                          </td>
                          <td className="px-4 py-3 text-gray-700">{vehicle.modelName}</td>
                          <td className="px-4 py-3">
                            <select
                              value={isEditing.gpsStatus !== undefined ? isEditing.gpsStatus : vehicle.gpsStatus}
                              onChange={(e) => handleEditField(vehicle.id, "gpsStatus", e.target.value)}
                              className="border border-gray-200 rounded px-2 py-1 text-sm focus:border-blue-400"
                            >
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={isEditing.status !== undefined ? isEditing.status : vehicle.status}
                              onChange={(e) => handleEditField(vehicle.id, "status", e.target.value)}
                              className="border border-gray-200 rounded px-2 py-1 text-sm focus:border-blue-400"
                            >
                              <option value="Available">Available</option>
                              <option value="Running">Running</option>
                              <option value="Allotted">Allotted</option>
                              <option value="Under Maintenance">Under Maintenance</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={isEditing.remarks !== undefined ? isEditing.remarks : vehicle.remarks}
                              onChange={(e) => handleEditField(vehicle.id, "remarks", e.target.value)}
                              className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:border-blue-400"
                            />
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{vehicle.lastUpdated}</td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleSaveRow(vehicle.id)}
                                className="text-green-600 hover:text-green-800 p-1"
                                title="Save Changes"
                              >
                                <Save size={16} />
                              </button>
                              <button
                                onClick={() => handleMaintenance(vehicle.id)}
                                className="text-yellow-600 hover:text-yellow-800 p-1"
                                title="Set Maintenance"
                              >
                                <Wrench size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteVehicle(vehicle.id, vehicle.registrationNumber)}
                                className="text-red-500 hover:text-red-700 p-1"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* QUICK GUIDANCE  */}
        <div className="lg:col-span-3">
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div>Quick Guidance</div>
            <div style={{ width: '30px', height: '30px', background: ' rgb(237, 163, 163)', borderRadius: '50%' }}><i class="fa-regular fa-lightbulb" style={{ color: 'rgb(237, 7, 7)' }}></i></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div>

              <div></div>
              <div></div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}