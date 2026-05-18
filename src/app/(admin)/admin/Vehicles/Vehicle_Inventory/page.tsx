// "use client";

// import React, { useState, useEffect } from "react";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import {
//     Truck,
//     CheckCircle2,
//     PlayCircle,
//     Calendar,
//     Settings,
//     Search,
//     ChevronDown,
//     NotebookPen,
//     Trash2,
//     Wrench,
//     Save,
//     X,
//     Eye,
// } from "lucide-react";

// // ─────────────────────────────────────────────────────────────────────────────
// // Vehicle Model Definitions
// // ─────────────────────────────────────────────────────────────────────────────
// const VEHICLE_MODELS = [
//     {
//         id: "3-side-led",
//         name: "3 Side LED Vehicle",
//         summary: {
//             customizedType: "Non-Customized",
//             screenType: "LED Only",
//             numberOfScreens: 3,
//             screenSize: "18 x 7 ft",
//             backScreenSize: "7 x 7 ft",
//             basePrice: "₹27,500 / Day",
//             resolution: "1080 x 520 px",
//             audioOutput: "1500 W",
//         },
//     },
//     {
//         id: "2-side-led",
//         name: "2 Side LED Vehicle",
//         summary: {
//             customizedType: "Standard",
//             screenType: "LED Only",
//             numberOfScreens: 2,
//             screenSize: "15 x 6 ft",
//             backScreenSize: "6 x 6 ft",
//             basePrice: "₹22,000 / Day",
//             resolution: "960 x 480 px",
//             audioOutput: "1200 W",
//         },
//     },
//     {
//         id: "front-led",
//         name: "Front LED + Back LED",
//         summary: {
//             customizedType: "Customized",
//             screenType: "LED + Fixed",
//             numberOfScreens: 2,
//             screenSize: "20 x 8 ft",
//             backScreenSize: "8 x 8 ft",
//             basePrice: "₹35,000 / Day",
//             resolution: "1280 x 720 px",
//             audioOutput: "2000 W",
//         },
//     },
// ];

// const vehicleOptions = [
//     { value: "all", label: "All Models" },
//     ...VEHICLE_MODELS.map((model) => ({ value: model.id, label: model.name })),
// ];

// // ─────────────────────────────────────────────────────────────────────────────
// // Helper: Generate Mock Vehicles (24 total with exact status distribution)
// // ─────────────────────────────────────────────────────────────────────────────
// const generateMockVehicles = () => {
//     const statuses = [
//         "Available",
//         "Available",
//         "Available",
//         "Available",
//         "Available",
//         "Available",
//         "Available",
//         "Available",
//         "Available",
//         "Available",
//         "Available",
//         "Available", // 12 Available
//         "Running",
//         "Running",
//         "Running",
//         "Running",
//         "Running", // 5 Running
//         "Allotted",
//         "Allotted",
//         "Allotted",
//         "Allotted", // 4 Allotted
//         "Under Maintenance",
//         "Under Maintenance",
//         "Under Maintenance", // 3 Maintenance
//     ];

//     const cities = [
//         "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad",
//         "Pune", "Ahmedabad", "Jaipur", "Lucknow",
//     ];
//     const modelIds = ["3-side-led", "2-side-led", "front-led"];
//     const gpsOptions = ["Active", "Inactive"];

//     const vehicles = [];
//     for (let i = 1; i <= 24; i++) {
//         const status = statuses[i - 1];
//         const modelId = modelIds[Math.floor(Math.random() * modelIds.length)];
//         const modelName = VEHICLE_MODELS.find((m) => m.id === modelId)?.name || "3 Side LED Vehicle";
//         vehicles.push({
//             id: i,
//             registrationNumber: `HR${26 + i}-AB-${1234 + i}`,
//             vehicleId: i <= 12 ? `VH-0S-${String(i).padStart(3, "0")}` : `VH-${Math.floor(Math.random() * 3) + 1}S-${String(i).padStart(3, "0")}`,
//             city: cities[i % cities.length],
//             modelId: modelId,
//             modelName: modelName,
//             gpsStatus: gpsOptions[i % 2],
//             status: status,
//             remarks: `Remarks ${i}`,
//             lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
//         });
//     }
//     return vehicles;
// };

// // Status Badge Component
// const StatusBadge = ({ status }) => {
//     const styles = {
//         Available: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
//         Running: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
//         Allotted: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
//         "Under Maintenance": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
//     };
//     return (
//         <span
//             className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.Available
//                 }`}
//         >
//             {status}
//         </span>
//     );
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // Main Component
// // ─────────────────────────────────────────────────────────────────────────────
// export default function VehicleInventory() {
//     // State for vehicles and filters
//     const [vehicles, setVehicles] = useState(generateMockVehicles());
//     const [selectedModelId, setSelectedModelId] = useState("3-side-led");
//     const [searchRegNo, setSearchRegNo] = useState("");
//     const [cityFilter, setCityFilter] = useState("all");
//     const [statusFilter, setStatusFilter] = useState("all");
//     const [zoneFilter, setZoneFilter] = useState("all");

//     // Editable row states (for inline editing)
//     const [editingRows, setEditingRows] = useState({});

//     // Derived stats from full vehicle list (unfiltered)
//     const totalVehicles = vehicles.length;
//     const availableCount = vehicles.filter((v) => v.status === "Available").length;
//     const runningCount = vehicles.filter((v) => v.status === "Running").length;
//     const allottedCount = vehicles.filter((v) => v.status === "Allotted").length;
//     const maintenanceCount = vehicles.filter((v) => v.status === "Under Maintenance").length;

//     // Filtered vehicles for table display
//     const filteredVehicles = vehicles.filter((vehicle) => {
//         const matchesModel = selectedModelId === "all" || vehicle.modelId === selectedModelId;
//         const matchesSearch = vehicle.registrationNumber.toLowerCase().includes(searchRegNo.toLowerCase());
//         const matchesCity = cityFilter === "all" || vehicle.city === cityFilter;
//         const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter;
//         // Zone filter mock (just demo)
//         const matchesZone = zoneFilter === "all" || (zoneFilter === "A" && vehicle.city === "Mumbai") || (zoneFilter === "B" && vehicle.city === "Delhi");
//         return matchesModel && matchesSearch && matchesCity && matchesStatus && matchesZone;
//     });

//     // Selected model summary data
//     const selectedModel = VEHICLE_MODELS.find((m) => m.id === selectedModelId) || VEHICLE_MODELS[0];

//     // Handlers for inline editing
//     const handleEditField = (vehicleId, field, value) => {
//         setEditingRows((prev) => ({
//             ...prev,
//             [vehicleId]: {
//                 ...prev[vehicleId],
//                 [field]: value,
//             },
//         }));
//     };

//     const handleSaveRow = (vehicleId) => {
//         const updatedFields = editingRows[vehicleId];
//         if (!updatedFields) return;

//         setVehicles((prevVehicles) =>
//             prevVehicles.map((v) =>
//                 v.id === vehicleId
//                     ? {
//                         ...v,
//                         city: updatedFields.city !== undefined ? updatedFields.city : v.city,
//                         gpsStatus: updatedFields.gpsStatus !== undefined ? updatedFields.gpsStatus : v.gpsStatus,
//                         status: updatedFields.status !== undefined ? updatedFields.status : v.status,
//                         remarks: updatedFields.remarks !== undefined ? updatedFields.remarks : v.remarks,
//                         lastUpdated: new Date().toLocaleDateString(),
//                     }
//                     : v
//             )
//         );
//         setEditingRows((prev) => {
//             const newState = { ...prev };
//             delete newState[vehicleId];
//             return newState;
//         });
//         toast.success("Vehicle details updated successfully!");
//     };

//     const handleDeleteVehicle = (vehicleId, regNumber) => {
//         if (window.confirm(`Are you sure you want to delete vehicle ${regNumber}?`)) {
//             setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
//             toast.success("Vehicle deleted successfully!");
//         }
//     };

//     const handleMaintenance = (vehicleId) => {
//         setVehicles((prev) =>
//             prev.map((v) =>
//                 v.id === vehicleId
//                     ? { ...v, status: "Under Maintenance", lastUpdated: new Date().toLocaleDateString() }
//                     : v
//             )
//         );
//         toast.info("Vehicle moved to maintenance.");
//     };

//     // Unique cities for filter dropdown
//     const uniqueCities = ["all", ...new Set(vehicles.map((v) => v.city))];

//     return (
//         <div className="min-h-screen mx-2 bg-gray-50 p-4 md:p-0">
//             <ToastContainer position="top-right" autoClose={3000} />

//             {/* Breadcrumb */}
//             <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
//                 <span className="font-medium">Inventory</span>
//                 <span>/</span>
//                 <span className="text-gray-900">Vehicle Availability</span>
//             </div>

//             {/* Stats Cards */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
//                 {/* Total Vehicles */}
//                 <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
//                     <div className="p-3 bg-blue-100 rounded-lg">
//                         <Truck className="w-6 h-6 text-blue-700" />
//                     </div>
//                     <div>
//                         <p className="text-sm text-gray-500">Total Vehicles</p>
//                         <p className="text-2xl font-bold">{totalVehicles}</p>
//                         <p className="text-xs text-gray-400">All Onboarded Vehicles</p>
//                     </div>
//                 </div>
//                 {/* Available */}
//                 <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
//                     <div className="p-3 bg-green-100 rounded-lg">
//                         <CheckCircle2 className="w-6 h-6 text-green-700" />
//                     </div>
//                     <div>
//                         <p className="text-sm text-gray-500">Available</p>
//                         <p className="text-2xl font-bold">{availableCount}</p>
//                         <p className="text-xs text-green-600">{((availableCount / totalVehicles) * 100).toFixed(2)}% of total</p>
//                     </div>
//                 </div>
//                 {/* Running */}
//                 <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
//                     <div className="p-3 bg-orange-100 rounded-lg">
//                         <PlayCircle className="w-6 h-6 text-orange-600" />
//                     </div>
//                     <div>
//                         <p className="text-sm text-gray-500">Running (In Use)</p>
//                         <p className="text-2xl font-bold">{runningCount}</p>
//                         <p className="text-xs text-orange-600">{((runningCount / totalVehicles) * 100).toFixed(2)}% of total</p>
//                     </div>
//                 </div>
//                 {/* Allotted */}
//                 <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
//                     <div className="p-3 bg-red-100 rounded-lg">
//                         <Calendar className="w-6 h-6 text-red-600" />
//                     </div>
//                     <div>
//                         <p className="text-sm text-gray-500">Allotted (Booked)</p>
//                         <p className="text-2xl font-bold">{allottedCount}</p>
//                         <p className="text-xs text-red-600">{((allottedCount / totalVehicles) * 100).toFixed(2)}% of total</p>
//                     </div>
//                 </div>
//                 {/* Under Maintenance */}
//                 <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
//                     <div className="p-3 bg-yellow-100 rounded-lg">
//                         <Settings className="w-6 h-6 text-yellow-700" />
//                     </div>
//                     <div>
//                         <p className="text-sm text-gray-500">Under Maintenance</p>
//                         <p className="text-2xl font-bold">{maintenanceCount}</p>
//                         <p className="text-xs text-yellow-700">{((maintenanceCount / totalVehicles) * 100).toFixed(2)}% of total</p>
//                     </div>
//                 </div>
//             </div>

//             {/* Filter Section */}
//             <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
//                 <h3 className="font-semibold text-gray-800 mb-4">Filter Inventory</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Model / Type</label>
//                         <div className="relative">
//                             <select
//                                 value={selectedModelId}
//                                 onChange={(e) => setSelectedModelId(e.target.value)}
//                                 className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
//                             >
//                                 {vehicleOptions.map((opt) => (
//                                     <option key={opt.value} value={opt.value}>
//                                         {opt.label}
//                                     </option>
//                                 ))}
//                             </select>
//                             <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
//                         </div>
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">City / Location</label>
//                         <select
//                             value={cityFilter}
//                             onChange={(e) => setCityFilter(e.target.value)}
//                             className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm focus:border-blue-500 focus:outline-none"
//                         >
//                             {uniqueCities.map((city) => (
//                                 <option key={city} value={city}>
//                                     {city === "all" ? "All Cities" : city}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Operating Zone</label>
//                         <select
//                             value={zoneFilter}
//                             onChange={(e) => setZoneFilter(e.target.value)}
//                             className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm focus:border-blue-500 focus:outline-none"
//                         >
//                             <option value="all">All Zones</option>
//                             <option value="A">Zone A</option>
//                             <option value="B">Zone B</option>
//                         </select>
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
//                         <select
//                             value={statusFilter}
//                             onChange={(e) => setStatusFilter(e.target.value)}
//                             className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm focus:border-blue-500 focus:outline-none"
//                         >
//                             <option value="all">All Status</option>
//                             <option value="Available">Available</option>
//                             <option value="Running">Running</option>
//                             <option value="Allotted">Allotted</option>
//                             <option value="Under Maintenance">Under Maintenance</option>
//                         </select>
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Search vehicles </label>
//                         <div className="relative">
//                             <input
//                                 type="text"
//                                 placeholder="Search vehicles..."
//                                 value={searchRegNo}
//                                 onChange={(e) => setSearchRegNo(e.target.value)}
//                                 className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
//                             />
//                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                         </div>
//                     </div>
//                     <div>Apply Filters</div>
//                     <div> Reset</div>
//                 </div>
//             </div>

//             {/* Mapped Vehicle Table */}
//             <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

//                 <div className="lg:col-span-9">
//                     <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//                         <div className="p-5 border-b">
//                             <h3 className="font-semibold text-gray-800">Mapped Vehicle Model Summary</h3>
//                             <p className="text-sm text-gray-500 mt-1">Vehicle registration number, LED size and model details are auto-loaded. Update GPS, location, status and remarks inline.</p>
//                         </div>
//                         <div className="overflow-x-auto" style={{ height: '400px' }}>
//                             <table className="w-400 text-sm">
//                                 <thead className="bg-gray-50 border-b">
//                                     <tr>
//                                         <th className="px-2 py-3 text-left">Vehicle ID</th>
//                                         <th className="px-2 py-3 text-left">Vehicle Details</th>
//                                         <th className="px-2 py-3 text-left">City / Current Location</th>
//                                         <th className="px-2 py-3 text-left">Model Config</th>
//                                         <th className="px-2 py-3 text-left">GPS</th>
//                                         <th className="px-2 py-3 text-left">Status</th>
//                                         <th className="px-2 py-3 text-left">Remarks</th>
//                                         <th className="px-2 py-3 text-left">Last Updated</th>
//                                         <th className="px-2 py-3 text-center">Actions</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="divide-y">
//                                     {filteredVehicles.length === 0 ? (
//                                         <tr>
//                                             <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
//                                                 No vehicles match the filters.
//                                             </td>
//                                         </tr>
//                                     ) : (
//                                         filteredVehicles.map((vehicle) => {
//                                             const isEditing = editingRows[vehicle.id] || {};
//                                             return (
//                                                 <tr key={vehicle.id} className="hover:bg-gray-50 transition">
//                                                     <td className="px-2 py-3 text-gray-600">{vehicle.vehicleId}</td>

//                                                     <td className="px-2 py-3 font-mono font-semibold text-blue-700">
//                                                         <div style={{ display: 'flex', gap: '10px' }}>
//                                                             <div>
//                                                                 <img src='/images/Truck_Image.jpg' style={{ width: '60px', height: '60px' }}></img>
//                                                             </div>
//                                                             <div>
//                                                                 <div> {vehicle.registrationNumber} </div>
//                                                                 <div>3-Side LED</div>
//                                                                 <div>17 FT</div>
//                                                             </div>
//                                                         </div>
//                                                     </td>
//                                                     <td className="px-2 py-3">
//                                                         <input
//                                                             type="text"
//                                                             value={isEditing.city !== undefined ? isEditing.city : vehicle.city}
//                                                             onChange={(e) => handleEditField(vehicle.id, "city", e.target.value)}
//                                                             className=" border border-gray-200 rounded px-2 py-1 text-sm focus:border-blue-400 focus:outline-none"
//                                                         />
//                                                     </td>
//                                                     <td className="px-2 py-3 text-gray-700">{vehicle.modelName}</td>
//                                                     <td className="px-2 py-3">
//                                                         <select
//                                                             value={isEditing.gpsStatus !== undefined ? isEditing.gpsStatus : vehicle.gpsStatus}
//                                                             onChange={(e) => handleEditField(vehicle.id, "gpsStatus", e.target.value)}
//                                                             className="border border-gray-200 rounded px-2 py-1 text-sm focus:border-blue-400"
//                                                         >
//                                                             <option value="Active">Active</option>
//                                                             <option value="Inactive">Inactive</option>
//                                                         </select>
//                                                     </td>
//                                                     <td className="px-2 py-3">
//                                                         <select
//                                                             value={isEditing.status !== undefined ? isEditing.status : vehicle.status}
//                                                             onChange={(e) => handleEditField(vehicle.id, "status", e.target.value)}
//                                                             className="border border-gray-200 rounded px-2 py-1 text-sm focus:border-blue-400"
//                                                         >
//                                                             <option value="Available">Available</option>
//                                                             <option value="Running">Running</option>
//                                                             <option value="Allotted">Allotted</option>
//                                                             <option value="Under Maintenance">Under Maintenance</option>
//                                                         </select>
//                                                     </td>
//                                                     <td className="px-2 py-3">
//                                                         <input
//                                                             type="text"
//                                                             value={isEditing.remarks !== undefined ? isEditing.remarks : vehicle.remarks}
//                                                             onChange={(e) => handleEditField(vehicle.id, "remarks", e.target.value)}
//                                                             className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:border-blue-400"
//                                                         />
//                                                     </td>
//                                                     <td className="px-2 py-3 text-gray-500 text-xs">{vehicle.lastUpdated}</td>
//                                                     <td className="px-2 py-3 text-center">
//                                                         <div className="flex justify-center gap-2">
//                                                             <button
//                                                                 onClick={() => handleSaveRow(vehicle.id)}
//                                                                 className="text-green-600 hover:text-green-800 p-1"
//                                                                 title="Save Changes"
//                                                             >
//                                                                 <Save size={16} />
//                                                             </button>
//                                                             <button
//                                                                 onClick={() => handleMaintenance(vehicle.id)}
//                                                                 className="text-yellow-600 hover:text-yellow-800 p-1"
//                                                                 title="Set Maintenance"
//                                                             >
//                                                                 <Wrench size={16} />
//                                                             </button>
//                                                             <button
//                                                                 onClick={() => handleDeleteVehicle(vehicle.id, vehicle.registrationNumber)}
//                                                                 className="text-red-500 hover:text-red-700 p-1"
//                                                                 title="Delete"
//                                                             >
//                                                                 <Trash2 size={16} />
//                                                             </button>
//                                                         </div>
//                                                     </td>
//                                                 </tr>
//                                             );
//                                         })
//                                     )}
//                                 </tbody>
//                             </table>
//                         </div>
//                         {/* PAGINATION  */}
//                         <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//                             <div>Showing 1-6 of 124 vehicles</div>
//                             <div style={{ display: 'flex', gap: '5px' }}>
//                                 <div> &lt; </div>
//                                 <div> 1 </div>
//                                 <div> 2 </div>
//                                 <div> &gt; </div>
//                             </div>
//                             <select>
//                                 <option>Select</option>
//                                 <option value='6 per page'> 6 per page</option>
//                             </select>
//                         </div>


//                     </div>
//                 </div>
//                 {/* QUICK GUIDANCE  */}
//                 <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-5 mb-6">
//                     <div style={{ display: 'flex', justifyContent: 'space-around' }}>
//                         <div>Quick Guidance</div>
//                         <div style={{ width: '30px', height: '30px', background: ' rgb(237, 163, 163)', borderRadius: '50%', textAlign: 'center', alignContent: 'center' }}><i class="fa-regular fa-lightbulb" style={{ color: 'rgb(237, 7, 7)' }}></i></div>
//                     </div>
//                     <div style={{ display: 'flex', gap: '10px' }}>
//                         <div>

//                             <div style={{ height: '90px' }}>
//                                 <div style={{ width: '30px', height: '30px', background: ' rgb(237, 163, 163)', borderRadius: '50%', textAlign: 'center', alignContent: 'center' }}> 1 </div>
//                                 <div style={{ height: '30px', width: '2px', borderRight: '2px dashed gray', alignContent: 'center', alignItems: 'center', textAlign: 'center', margin: '5px auto' }}></div>
//                             </div>
//                             <div style={{ height: '100px' }}>
//                                 <div style={{ width: '30px', height: '30px', background: ' rgb(237, 163, 163)', borderRadius: '50%', textAlign: 'center', alignContent: 'center' }}> 2</div>
//                                 <div style={{ height: '50px', width: '2px', borderRight: '2px dashed gray', alignContent: 'center', alignItems: 'center', textAlign: 'center', margin: '5px auto' }}></div>
//                             </div>
//                             <div style={{ height: '100px' }}>
//                                 <div style={{ width: '30px', height: '30px', background: ' rgb(237, 163, 163)', borderRadius: '50%', textAlign: 'center', alignContent: 'center' }}> 3</div>
//                                 <div style={{ height: '50px', width: '2px', borderRight: '2px dashed gray', alignContent: 'center', alignItems: 'center', textAlign: 'center', margin: '5px auto' }}></div>
//                             </div>
//                         </div>
//                         <div>
//                             <div style={{ height: '90px' }}>
//                                 <div style={{ fontWeight: '600', fontSize: '14px' }}>Select a vehicle model once</div>
//                                 <div style={{ fontSize: '13px' }}>Pick the model / type from the dropdown above.</div>
//                             </div>
//                             <div>
//                                 <div style={{ fontWeight: '600', fontSize: '14px' }}>All mapped vehicles loaded automatically</div>
//                                 <div style={{ fontSize: '13px' }}>All vehicles linked to the selected model are listed for easy management.</div>
//                             </div>
//                             <div>
//                                 <div style={{ fontWeight: '600', fontSize: '14px' }}>Update GPS status,  location, status, remarks and save </div>
//                                 <div style={{ fontSize: '13px' }}>Edit the required fields and click Save Row or use bulk actions to update multiple vehicles.</div>
//                             </div>

//                         </div>
//                     </div>

//                     <div style={{ display: 'flex', gap: '10px', border: '1px solid green', background: '#aef6bb', justifyContent: 'center', padding: '5px 5px', alignItems: 'center', borderRadius: '5px' }}>
//                         <div>
//                             <CheckCircle2 className="w-6 h-6 text-green-700" />
//                         </div>
//                         <div style={{ color: 'green' }}>
//                             <div>One model. All vehicles.</div>
//                             <div>Update everything in one place.</div>
//                         </div>
//                     </div>
//                 </div>

//             </div>


//             {/* INVENTORY SUMMARY BY MODEL  */}
//             <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 ">
//                 <div className="lg:col-span-8 bg-white rounded-xl shadow-sm p-5 mb-6">
//                     <div style={{ display: 'flex', justifyContent: 'space-around' }}>
//                         {/* 1 model */}
//                         <div style={{ display: 'flex', gap: '10px', borderRight: '1px solid gray', paddingRight: '10px', fontSize: '12px' }}>
//                             <div>
//                                 <img src='/images/Truck_Image.jpg' style={{ width: '60px', height: '60px' }}></img>
//                                 <div>Total</div>
//                                 <div style={{ fontWeight: '600', fontSize: '20px' }}> 9</div>
//                             </div>
//                             <div>
//                                 <div>3-Sided LED</div>
//                                 <div>Total</div>
//                                 <div >
//                                     <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
//                                         <div><span><i className="fa-solid fa-circle" style={{ color: 'rgba(94, 240, 9, 0.7)', fontSize: '10px' }}></i></span> Available</div>
//                                         <div>4</div>
//                                     </div>
//                                     <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
//                                         <div><span><i className="fa-solid fa-circle" style={{ color: 'rgb(157, 165, 38)', fontSize: '10px' }}></i></span> Running</div>
//                                         <div>2</div>
//                                     </div>
//                                     <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
//                                         <div><span><i className="fa-solid fa-circle" style={{ color: 'rgb(237, 7, 7)', fontSize: '10px' }}></i></span> Allotted</div>
//                                         <div>2</div>
//                                     </div>
//                                     <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
//                                         <div><span><i className="fa-solid fa-circle" style={{ color: 'rgb(237, 191, 7)', fontSize: '10px' }}></i></span> Maintenance</div>
//                                         <div>1</div>
//                                     </div>
//                                 </div>
//                             </div>

//                         </div>
//                         {/* 2 model */}

//                         <div style={{ display: 'flex', gap: '10px', borderRight: '1px solid gray', paddingRight: '10px', fontSize: '12px' }}>
//                             <div>
//                                 <img src='/images/Truck_Image.jpg' style={{ width: '60px', height: '60px' }}></img>
//                                 <div>Total</div>
//                                 <div style={{ fontWeight: '600', fontSize: '20px' }}> 9</div>
//                             </div>
//                             <div>
//                                 <div>3-Sided LED</div>
//                                 <div>Total</div>
//                                 <div >
//                                     <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
//                                         <div><span><i className="fa-solid fa-circle" style={{ color: 'rgba(94, 240, 9, 0.7)', fontSize: '10px' }}></i></span> Available</div>
//                                         <div>4</div>
//                                     </div>
//                                     <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
//                                         <div><span><i className="fa-solid fa-circle" style={{ color: 'rgb(157, 165, 38)', fontSize: '10px' }}></i></span> Running</div>
//                                         <div>2</div>
//                                     </div>
//                                     <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
//                                         <div><span><i className="fa-solid fa-circle" style={{ color: 'rgb(237, 7, 7)', fontSize: '10px' }}></i></span> Allotted</div>
//                                         <div>2</div>
//                                     </div>
//                                     <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
//                                         <div><span><i className="fa-solid fa-circle" style={{ color: 'rgb(237, 191, 7)', fontSize: '10px' }}></i></span> Maintenance</div>
//                                         <div>1</div>
//                                     </div>
//                                 </div>
//                             </div>

//                         </div>
//                         {/* 3 model */}

//                         <div style={{ display: 'flex', gap: '10px', borderRight: '1px solid gray', paddingRight: '10px', fontSize: '12px' }}>
//                             <div>
//                                 <img src='/images/Truck_Image.jpg' style={{ width: '60px', height: '60px' }}></img>
//                                 <div>Total</div>
//                                 <div style={{ fontWeight: '600', fontSize: '20px' }}> 9</div>
//                             </div>
//                             <div>
//                                 <div>3-Sided LED</div>
//                                 <div>Total</div>
//                                 <div >
//                                     <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
//                                         <div><span><i className="fa-solid fa-circle" style={{ color: 'rgba(94, 240, 9, 0.7)', fontSize: '10px' }}></i></span> Available</div>
//                                         <div>4</div>
//                                     </div>
//                                     <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
//                                         <div><span><i className="fa-solid fa-circle" style={{ color: 'rgb(157, 165, 38)', fontSize: '10px' }}></i></span> Running</div>
//                                         <div>2</div>
//                                     </div>
//                                     <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
//                                         <div><span><i className="fa-solid fa-circle" style={{ color: 'rgb(237, 7, 7)', fontSize: '10px' }}></i></span> Allotted</div>
//                                         <div>2</div>
//                                     </div>
//                                     <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
//                                         <div><span><i className="fa-solid fa-circle" style={{ color: 'rgb(237, 191, 7)', fontSize: '10px' }}></i></span> Maintenance</div>
//                                         <div>1</div>
//                                     </div>
//                                 </div>
//                             </div>

//                         </div>

//                     </div>
//                 </div>
//                 <div className="lg:col-span-4 bg-white rounded-xl shadow-sm p-5 mb-6">
//                     <div style={{ fontWeight: "600" }}>Status Legend</div>
//                     <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', fontSize: '10px' }}>
//                         <div><span><i className="fa-solid fa-circle" style={{ color: 'rgba(94, 240, 9, 0.7)', fontSize: '10px' }}></i></span> Available</div>
//                         <div>Ready to book</div>
//                     </div>

//                     <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', fontSize: '10px' }}>
//                         <div><span><i className="fa-solid fa-circle" style={{ color: 'rgb(157, 165, 38)', fontSize: '10px' }}></i></span> Running</div>
//                         <div>Currently running campaign</div>
//                     </div>

//                     <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', fontSize: '10px' }}>
//                         <div><span><i className="fa-solid fa-circle" style={{ color: 'rgb(237, 7, 7)', fontSize: '10px' }}></i></span> Allotted</div>
//                         <div>Booked but not started</div>
//                     </div>

//                     <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', fontSize: '10px' }}>
//                         <div><span><i className="fa-solid fa-circle" style={{ color: 'rgb(237, 191, 7)', fontSize: '10px' }}></i></span> Maintenance</div>
//                         <div>Not available</div>
//                     </div>
//                 </div>
//             </div>

//             {/* STATUS LEGEND  */}
//             <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
//                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
//                     <div style={{ fontWeight: "600" }}>Status Legend</div>
//                     <div style={{ borderRadius: '5px', padding: '2px 5px', background: '#c4f19e', }}><span><i className="fa-solid fa-circle" style={{ color: 'rgba(94, 240, 9, 0.7)', fontSize: '10px' }}></i></span> Available</div>
//                     <div style={{ borderRadius: '5px', padding: '2px 5px' }}><span><i className="fa-solid fa-circle" style={{ color: 'rgb(157, 165, 38)', fontSize: '10px' }}></i></span> Running</div>
//                     <div style={{ borderRadius: '5px', padding: '2px 5px' }}><span><i className="fa-solid fa-circle" style={{ color: 'rgb(237, 7, 7)', fontSize: '10px' }}></i></span> Allotted</div>
//                     <div style={{ borderRadius: '5px', padding: '2px 5px' }}><span><i className="fa-solid fa-circle" style={{ color: 'rgb(237, 191, 7)', fontSize: '10px' }}></i></span> Maintenance</div>
//                     <div style={{ borderRadius: '5px', padding: '2px 5px' }}><span><i className="fa-solid fa-circle" style={{ color: 'rgb(237, 191, 7)', fontSize: '10px' }}></i></span> On Road</div>
//                     <div style={{ borderRadius: '5px', padding: '2px 5px' }}><span><i className="fa-solid fa-circle" style={{ color: 'rgb(237, 191, 7)', fontSize: '10px' }}></i></span> Unavailable</div>
//                     <div style={{ borderRadius: '5px', padding: '2px 5px' }}><span><i className="fa-solid fa-circle" style={{ color: 'rgb(237, 191, 7)', fontSize: '10px' }}></i></span> Waiting for Branding</div>
//                     <div style={{ borderRadius: '5px', padding: '2px 5px' }}><span><i className="fa-solid fa-circle" style={{ color: 'rgb(237, 191, 7)', fontSize: '10px' }}></i></span> Customization Pending</div>




//                 </div>
//             </div>
//         </div>
//     );
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

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(6);

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

    // Pagination calculations
    const totalPages = Math.ceil(filteredVehicles.length / rowsPerPage);
    const indexOfLastItem = currentPage * rowsPerPage;
    const indexOfFirstItem = indexOfLastItem - rowsPerPage;
    const currentVehicles = filteredVehicles.slice(indexOfFirstItem, indexOfLastItem);

    // Reset page when filters or rowsPerPage change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedModelId, searchRegNo, cityFilter, statusFilter, zoneFilter, rowsPerPage]);

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleRowsPerPageChange = (e) => {
        setRowsPerPage(parseInt(e.target.value));
        setCurrentPage(1);
    };

    // Generate page numbers with ellipsis for many pages
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;
        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pageNumbers.push(i);
                pageNumbers.push('...');
                pageNumbers.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pageNumbers.push(1);
                pageNumbers.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pageNumbers.push(i);
            } else {
                pageNumbers.push(1);
                pageNumbers.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pageNumbers.push(i);
                pageNumbers.push('...');
                pageNumbers.push(totalPages);
            }
        }
        return pageNumbers;
    };

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
        <div className="min-h-screen bg-gray-50 px-1 md:px-0 lg:px-0 py-0 p-1 p-0 mx-0 my-0 max-w-none md:p-0 ">
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
            <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
                <h3 className="font-semibold text-gray-800 mb-4">Filter Inventory</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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
                            {/* <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" /> */}
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search vehicles </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search vehicles..."
                                value={searchRegNo}
                                onChange={(e) => setSearchRegNo(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                    </div>
                    <div style={{textAlign:'center',alignContent:'center'}}>Apply Filters</div>
                    <div style={{textAlign:'center',alignContent:'center'}}> Reset</div>
                </div>
            </div>

            {/* Mapped Vehicle Table */}
            {/* <div className="grid grid-cols-1 lg:grid-cols-12 gap-4"> */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
                {/* <div className="lg:col-span-9 mb-4">
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden"> */}

                <div className="xl:col-span-9 mb-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ">
                        {/* <div className="p-5 border-b">
                            <h3 className="font-semibold text-gray-800">Mapped Vehicle Model Summary</h3>
                            <p className="text-sm text-gray-500 mt-1">Vehicle registration number, LED size and model details are auto-loaded. Update GPS, location, status and remarks inline.</p>
                        </div> */}

                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Mapped Vehicle Model Summary
                            </h3>

                            <p className="text-sm text-gray-500 mt-1">
                                Vehicle registration number, LED size and model details are auto-loaded.
                                Update GPS, location, status and remarks inline.
                            </p>
                        </div>
                        {/* <div className="overflow-x-auto h-[400px]"> */}
                        <div className="overflow-x-auto max-h-[400px]">
                            {/* <table className="w-full text-sm"> */}
                            <table className="w-full table-fixed text-sm px-3 h-[400px]">

                                <thead className="bg-gray-50 border-b sticky top-0 z-10 px-2">
                                    <tr>

                                        <th className=" px-3 py-4 text-left font-semibold text-gray-600">
                                            Vehicle ID
                                        </th>

                                        <th className="px-3 py-4 text-left font-semibold text-gray-600">
                                            Vehicle Details
                                        </th>

                                        <th className=" px-3 py-4 text-left font-semibold text-gray-600">
                                            City / Location
                                        </th>

                                        {/* <th className="w-[130px] px-3 py-4 text-left font-semibold text-gray-600">
                                            Model
                                        </th> */}

                                        <th className=" px-3 py-4 text-left font-semibold text-gray-600">
                                            GPS
                                        </th>

                                        <th className=" px-3 py-4 text-left font-semibold text-gray-600">
                                            Status
                                        </th>

                                        <th className=" px-3 py-4 text-left font-semibold text-gray-600">
                                            Remarks
                                        </th>

                                        <th className=" px-3 py-4 text-left font-semibold text-gray-600">
                                            Updated
                                        </th>

                                        <th className=" px-3 py-4 text-center font-semibold text-gray-600">
                                            Actions
                                        </th>

                                    </tr>
                                </thead>

                                {/* <tbody className="divide-y"> */}
                                <tbody className="divide-y divide-gray-100">

                                    {currentVehicles.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                                                No vehicles match the filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        currentVehicles.map((vehicle) => {
                                            const isEditing = editingRows[vehicle.id] || {};
                                            return (
                                                // <tr key={vehicle.id} className="hover:bg-gray-50 transition">
                                                <tr className="hover:bg-gray-50 transition align-middle">
                                                    <td className="px-2 py-3 text-gray-600">{vehicle.vehicleId}</td>
                                                   

                                                    <td className="px-3 py-4">
                                                        <div className="flex items-center gap-3">

                                                            {/* <img
                                                                src="/images/Truck_Image.jpg"
                                                                alt="truck"
                                                                className="w-14 h-14 rounded-xl object-cover border border-gray-200"
                                                            /> */}

                                                            <div>
                                                                <div className="font-semibold text-blue-700">
                                                                    TN 58 BQ 9556
                                                                </div>

                                                                {/* <div className="text-xs text-gray-500 mt-1">
                                                                    3-Side LED
                                                                </div>

                                                                <div className="text-xs text-gray-500">
                                                                    17 FT
                                                                </div> */}
                                                            </div>

                                                        </div>
                                                    </td>
                                                    <td className="px-2 py-3">
                                                        {/* <input
                                                            type="text"
                                                            value={isEditing.city !== undefined ? isEditing.city : vehicle.city}
                                                            onChange={(e) => handleEditField(vehicle.id, "city", e.target.value)}
                                                            className="border border-gray-200 rounded px-2 py-1 text-sm focus:border-blue-400 focus:outline-none"
                                                        /> */}
                                                        <input
                                                            type="text"
                                                            className="h-10 w-full border border-gray-200 rounded-lg px-3 text-sm focus:border-blue-500 focus:outline-none"
                                                        />
                                                    </td>
                                                    {/* <td className="px-2 py-3 text-gray-700">{vehicle.modelName}</td> */}
                                                    <td className="px-2 py-3">
                                                        <select
                                                            value={isEditing.gpsStatus !== undefined ? isEditing.gpsStatus : vehicle.gpsStatus}
                                                            onChange={(e) => handleEditField(vehicle.id, "gpsStatus", e.target.value)}
                                                            className="border border-gray-200 rounded px-2 py-1 text-sm focus:border-blue-400"
                                                        >
                                                            <option value="Active">Active</option>
                                                            <option value="Inactive">Inactive</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-2 py-3">
                                                        <select
                                                            value={isEditing.status !== undefined ? isEditing.status : vehicle.status}
                                                            onChange={(e) => handleEditField(vehicle.id, "status", e.target.value)}
                                                            // className="border border-gray-200 rounded px-2 py-1 text-sm focus:border-blue-400"
                                                            className="h-10 w-full border border-gray-200 rounded-lg px-3 text-sm focus:border-blue-500 focus:outline-none bg-white"
                                                        >
                                                            <option value="Available">Available</option>
                                                            <option value="Running">Running</option>
                                                            <option value="Allotted">Allotted</option>
                                                            <option value="Under Maintenance">Under Maintenance</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-2 py-3">
                                                        <input
                                                            type="text"
                                                            value={isEditing.remarks !== undefined ? isEditing.remarks : vehicle.remarks}
                                                            onChange={(e) => handleEditField(vehicle.id, "remarks", e.target.value)}
                                                            className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:border-blue-400"
                                                        />
                                                    </td>
                                                    <td className="px-2 py-3 text-gray-500 text-xs">{vehicle.lastUpdated}</td>
                                                    {/* <td className="px-2 py-3 text-center">
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
                                                    </td> */}

                                                    <td className="px-3 py-4">

                                                        <div className="flex justify-center gap-2">

                                                            <button className="w-9 h-9 rounded-lg border border-green-200 bg-green-50 flex items-center justify-center hover:bg-green-100">
                                                                <Save size={16} className="text-green-700" />
                                                            </button>

                                                            <button className="w-9 h-9 rounded-lg border border-yellow-200 bg-yellow-50 flex items-center justify-center hover:bg-yellow-100">
                                                                <Wrench size={16} className="text-yellow-700" />
                                                            </button>

                                                            <button className="w-9 h-9 rounded-lg border border-red-200 bg-red-50 flex items-center justify-center hover:bg-red-100">
                                                                <Trash2 size={16} className="text-red-700" />
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
                        {/* Pagination Controls */}
                        {/* <div className="flex justify-between items-center p-4 border-t"> */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-5 border-t border-gray-100">
                            <div className="text-sm text-gray-600">
                                Showing {filteredVehicles.length > 0 ? indexOfFirstItem + 1 : 0} - {Math.min(indexOfLastItem, filteredVehicles.length)} of {filteredVehicles.length} vehicles
                            </div>
                            <div className="flex gap-1 items-center">
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`px-2 py-1 rounded ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed bg-gray-100 w-9 h-9 rounded-lg' : 'w-9 h-9 rounded-lg text-gray-700 bg-gray-100'}`}
                                >
                                    &lt;
                                </button>
                                {getPageNumbers().map((page, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => typeof page === 'number' && goToPage(page)}
                                        className={`px-2 py-1 rounded ${currentPage === page ? 'w-9 h-9 rounded-lg bg-red-500 text-white flex items-center justify-center' : 'w-9 h-9 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                        disabled={typeof page !== 'number'}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className={`px-2 py-1 rounded ${currentPage === totalPages || totalPages === 0 ? 'text-gray-300 cursor-not-allowed w-9 h-9 rounded-lg bg-gray-100' : 'text-gray-700 hover:bg-gray-100 w-9 h-9 rounded-lg bg-gray-100 bg-gray-100'}`}
                                >
                                    &gt;
                                </button>
                            </div>
                            <select
                                value={rowsPerPage}
                                onChange={handleRowsPerPageChange}
                                className="border border-gray-300 rounded px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                            >
                                <option value={6}>6 per page</option>
                                <option value={10}>10 per page</option>
                                <option value={20}>20 per page</option>
                                <option value={50}>50 per page</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* QUICK GUIDANCE */}
                <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-5 mb-6 flex flex-col justify-between" >
                    <div className="flex justify-between">
                        <div>Quick Guidance</div>
                        <div className="w-[30px] h-[30px] bg-[rgb(237,163,163)] rounded-full text-center flex items-center justify-center">
                            <i className="fa-regular fa-lightbulb" style={{ color: 'rgb(237, 7, 7)' }}></i>
                        </div>
                    </div>
                    <div className="flex gap-2.5">
                        <div>
                            <div className="h-[120px]">
                                <div className="w-[30px] h-[30px] bg-[rgb(237,163,163)] rounded-full text-center leading-[30px]">1</div>
                                <div className="flex justify-center"><div className="h-[70px] border-r-2 border-dashed border-gray-400 my-2"></div></div>
                            </div>
                            <div className="h-[130px]">
                                <div className="w-[30px] h-[30px] bg-[rgb(237,163,163)] rounded-full text-center leading-[30px]">2</div>
                                <div className="flex justify-center"><div className="h-[70px] border-r-2 border-dashed border-gray-400 my-2"></div></div>
                            </div>
                            <div className="h-[130px]">
                                <div className="w-[30px] h-[30px] bg-[rgb(237,163,163)] rounded-full text-center leading-[30px]">3</div>
                                {/* <div className="flex justify-center"><div className="h-[70px] border-r-2 border-dashed border-gray-400 my-2"></div></div> */}
                            </div>
                        </div>
                        <div>
                            <div className="h-[120px]">
                                <div className="font-semibold text-base">Select a vehicle model once</div>
                                <div className="text-sm my-2">Pick the model / type from the dropdown above.</div>
                            </div>
                            <div className="h-[130px]">
                                <div className="font-semibold text-base/5">All mapped vehicles loaded automatically</div>
                                <div className="text-sm my-2">All vehicles linked to the selected model are listed for easy management.</div>
                            </div>
                            <div className="h-[130px]">
                                <div className="font-semibold text-base/5">Update GPS status, location, status, remarks and save</div>
                                <div className="text-sm my-2">Edit the required fields and click Save Row or use bulk actions to update multiple vehicles.</div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2.5 border border-green-500 bg-[#aef6bb] justify-center p-1.5 items-center rounded-md mt-4 flex-end">
                        <div>
                            <CheckCircle2 className="w-6 h-6 text-green-700" />
                        </div>
                        <div className="text-green-700">
                            <div>One model. All vehicles.</div>
                            <div>Update everything in one place.</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* INVENTORY SUMMARY BY MODEL */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-8 bg-white rounded-xl shadow-sm p-5 mb-6">
                    <div className="font-semibold mb-4">Inventory Summary by Model</div>
                    <div className="flex justify-around">
                        {/* Model 1 */}
                        <div className="flex gap-5  pr-2.5 ">
                            <div className="text-center  justify-center">
                                <img src='/images/Truck_Image.jpg' className="w-[60px] h-[60px]" alt="truck" />
                                <div>Total</div>
                                <div className="font-semibold text-xl">9</div>
                            </div>
                            <div>
                                <div>3-Sided LED</div>
                                <div>Total</div>
                                <div>
                                    <div className="flex justify-between gap-2.5">
                                        <div><span><i className="fa-solid fa-circle" style={{ color: 'rgba(94, 240, 9, 0.7)', fontSize: '10px' }}></i></span> Available</div>
                                        <div>4</div>
                                    </div>
                                    <div className="flex justify-between gap-2.5">
                                        <div><span><i className="fa-solid fa-circle" style={{ color: 'rgb(157, 165, 38)', fontSize: '10px' }}></i></span> Running</div>
                                        <div>2</div>
                                    </div>
                                    <div className="flex justify-between gap-2.5">
                                        <div><span><i className="fa-solid fa-circle" style={{ color: 'rgb(237, 7, 7)', fontSize: '10px' }}></i></span> Allotted</div>
                                        <div>2</div>
                                    </div>
                                    <div className="flex justify-between gap-2.5">
                                        <div><span><i className="fa-solid fa-circle" style={{ color: 'rgb(237, 191, 7)', fontSize: '10px' }}></i></span> Maintenance</div>
                                        <div>1</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center"><div className=" border-r-2 border-solid border-gray-400 "></div></div>

                        {/* Model 2 */}
                        <div className="flex gap-5  pr-2.5 ">
                            <div className="text-center  justify-center">
                                <img src='/images/Truck_Image.jpg' className="w-[60px] h-[60px]" alt="truck" />
                                <div>Total</div>
                                <div className="font-semibold text-xl">9</div>
                            </div>
                            <div>
                                <div>3-Sided LED</div>
                                <div>Total</div>
                                <div>
                                    <div className="flex justify-between gap-2.5">
                                        <div><span><i className="fa-solid fa-circle" style={{ color: 'rgba(94, 240, 9, 0.7)', fontSize: '10px' }}></i></span> Available</div>
                                        <div>4</div>
                                    </div>
                                    <div className="flex justify-between gap-2.5">
                                        <div><span><i className="fa-solid fa-circle" style={{ color: 'rgb(157, 165, 38)', fontSize: '10px' }}></i></span> Running</div>
                                        <div>2</div>
                                    </div>
                                    <div className="flex justify-between gap-2.5">
                                        <div><span><i className="fa-solid fa-circle" style={{ color: 'rgb(237, 7, 7)', fontSize: '10px' }}></i></span> Allotted</div>
                                        <div>2</div>
                                    </div>
                                    <div className="flex justify-between gap-2.5">
                                        <div><span><i className="fa-solid fa-circle" style={{ color: 'rgb(237, 191, 7)', fontSize: '10px' }}></i></span> Maintenance</div>
                                        <div>1</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center"><div className=" border-r-2 border-solid border-gray-400 "></div></div>

                        {/* Model 3 */}
                        <div className="flex gap-5  pr-2.5 ">
                            <div className="text-center  justify-center">
                                <img src='/images/Truck_Image.jpg' className="w-[60px] h-[60px]" alt="truck" />
                                <div>Total</div>
                                <div className="font-semibold text-xl">9</div>
                            </div>
                            <div>
                                <div>3-Sided LED</div>
                                <div>Total</div>
                                <div>
                                    <div className="flex justify-between gap-2.5">
                                        <div><span><i className="fa-solid fa-circle" style={{ color: 'rgba(94, 240, 9, 0.7)', fontSize: '10px' }}></i></span> Available</div>
                                        <div>4</div>
                                    </div>
                                    <div className="flex justify-between gap-2.5">
                                        <div><span><i className="fa-solid fa-circle" style={{ color: 'rgb(157, 165, 38)', fontSize: '10px' }}></i></span> Running</div>
                                        <div>2</div>
                                    </div>
                                    <div className="flex justify-between gap-2.5">
                                        <div><span><i className="fa-solid fa-circle" style={{ color: 'rgb(237, 7, 7)', fontSize: '10px' }}></i></span> Allotted</div>
                                        <div>2</div>
                                    </div>
                                    <div className="flex justify-between gap-2.5">
                                        <div><span><i className="fa-solid fa-circle" style={{ color: 'rgb(237, 191, 7)', fontSize: '10px' }}></i></span> Maintenance</div>
                                        <div>1</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-4 bg-white rounded-xl shadow-sm p-5 mb-6">
                    <div className="font-semibold">Status Legend</div>
                    <div className="flex justify-between gap-2.5  mt-2">
                        <div><span><i className="fa-solid fa-circle" style={{ color: 'rgba(94, 240, 9, 0.7)', fontSize: '10px' }}></i></span> Available</div>
                        <div>Ready to book</div>
                    </div>
                    <div className="flex justify-between gap-2.5  mt-1">
                        <div><span><i className="fa-solid fa-circle" style={{ color: 'rgb(157, 165, 38)', fontSize: '10px' }}></i></span> Running</div>
                        <div>Currently running campaign</div>
                    </div>
                    <div className="flex justify-between gap-2.5  mt-1">
                        <div><span><i className="fa-solid fa-circle" style={{ color: 'rgb(237, 7, 7)', fontSize: '10px' }}></i></span> Allotted</div>
                        <div>Booked but not started</div>
                    </div>
                    <div className="flex justify-between gap-2.5   mt-1">
                        <div><span><i className="fa-solid fa-circle" style={{ color: 'rgb(237, 191, 7)', fontSize: '10px' }}></i></span> Maintenance</div>
                        <div>Not available</div>
                    </div>
                </div>
            </div>


            {/* STATUS LEGEND (full row) */}
            <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
                <div className="flex justify-between  flex-wrap gap-2">
                    <div className="font-semibold">Status Legend</div>
                    <div className="rounded px-1.5 py-0.5 bg-green-50 text-green-700 border border-green-100"
                    ><span><i className="fa-solid fa-circle" style={{ color: 'rgba(94, 240, 9, 0.7)', fontSize: '10px' }}></i></span> Available</div>
                    <div className="rounded px-1.5 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-100"><span><i className="fa-solid fa-circle" style={{ color: 'rgb(157, 165, 38)', fontSize: '10px' }}></i></span> Running</div>
                    <div className="rounded px-1.5 py-0.5 bg-red-50 text-red-700 border border-red-100"><span><i className="fa-solid fa-circle" style={{ color: 'rgb(237, 7, 7)', fontSize: '10px' }}></i></span> Allotted</div>
                    <div className="rounded px-1.5 py-0.5 bg-orange-50 text-orange-700 border border-orange-100"><span><i className="fa-solid fa-circle" style={{ color: 'rgb(237, 191, 7)', fontSize: '10px' }}></i></span> Maintenance</div>
                    <div className="rounded px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100"><span><i className="fa-solid fa-circle" style={{ color: 'rgb(237, 191, 7)', fontSize: '10px' }}></i></span> On Road</div>
                    <div className="rounded px-1.5 py-0.5 bg-red-50 text-red-700 border border-red-100"><span><i className="fa-solid fa-circle" style={{ color: 'rgb(237, 191, 7)', fontSize: '10px' }}></i></span> Unavailable</div>
                    <div className="rounded px-1.5 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-100"><span><i className="fa-solid fa-circle" style={{ color: 'rgb(237, 191, 7)', fontSize: '10px' }}></i></span> Waiting for Branding</div>
                    <div className="rounded px-1.5 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-100"><span><i className="fa-solid fa-circle" style={{ color: 'rgb(237, 191, 7)', fontSize: '10px' }}></i></span> Customization Pending</div>
                </div>
            </div>
        </div>
    );
}