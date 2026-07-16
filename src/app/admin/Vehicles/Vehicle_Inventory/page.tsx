// //PERFECT CODE FOR MULTIPLE / SINGLE SELECT SAVE WITH REMARKS MODAL (REQUIRED / OPTIONAL) + STATUS BADGES 

// /* eslint-disable */
// // @ts-nocheck

// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import {
//   Truck, CheckCircle2, PlayCircle, Calendar, Settings, Search, Trash2, Wrench, Save, X,
// } from "lucide-react";
// import { baseUrl } from "../../../../../BaseUrl";
// import AdminSelectOptionsData from "../../AdminSelectOptions.json";
// import Switch from "@/components/form/switch/Switch";

// const formatDate = (dateString) => {
//   if (!dateString) return "N/A";
//   return new Date(dateString).toLocaleString("en-IN", {
//     day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
//   });
// };

// const STATUS_PRIORITY = AdminSelectOptionsData?.statusPriority || {
//   "Waiting for Status": 0, "Available": 1, "Unavailable": 2,
//   "Booked": 3, "Maintenance": 4, "Damaged": 5,
// };

// const REMARKS_REQUIRED = AdminSelectOptionsData?.remarksRequiredStatuses || ["Unavailable", "Maintenance", "Damaged"];
// const REMARKS_OPTIONAL = AdminSelectOptionsData?.remarksOptionalStatuses || ["Booked"];

// const StatusBadge = ({ status }) => {
//   const styles = {
//     "Waiting for Status":    "bg-yellow-100 text-yellow-700 border border-yellow-200",
//     Available:               "bg-green-100 text-green-700 border border-green-200",
//     Running:                 "bg-orange-100 text-orange-700 border border-orange-200",
//     "On Road":               "bg-orange-100 text-orange-700 border border-orange-200",
//     Allotted:                "bg-red-100 text-red-700 border border-red-200",
//     Booked:                  "bg-red-100 text-red-700 border border-red-200",
//     "Under Maintenance":     "bg-yellow-100 text-yellow-700 border border-yellow-200",
//     Maintenance:             "bg-yellow-100 text-yellow-700 border border-yellow-200",
//     Unavailable:             "bg-red-100 text-red-700 border border-red-200",
//     Damaged:                 "bg-red-200 text-red-800 border border-red-300",
//     "Waiting for Branding":  "bg-yellow-100 text-amber-700 border border-yellow-200",
//     "Customization Pending": "bg-yellow-100 text-amber-700 border border-yellow-200",
//   };
//   return (
//     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${styles[status] || "bg-gray-100 text-gray-600"}`}>
//       {status}
//     </span>
//   );
// };

// // ── FIXED RemarksModal: separate select + textarea states ──────────────────────
// const RemarksModal = ({ isOpen, onClose, onConfirm, status, vehicleLabel, isBulk = false }) => {
//   const [selectedRemark, setSelectedRemark] = useState("");
//   const [customRemark, setCustomRemark]     = useState("");
//   const isRequired = REMARKS_REQUIRED.includes(status);
//   const isOptional = REMARKS_OPTIONAL.includes(status);

//   useEffect(() => {
//     if (isOpen) { setSelectedRemark(""); setCustomRemark(""); }
//   }, [isOpen]);

//   if (!isOpen) return null;

//   const finalRemarks = customRemark.trim() || selectedRemark;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
//       <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md mx-4 shadow-2xl">
//         <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
//           <h3 className="text-base font-semibold text-gray-900 dark:text-white">
//             Status Change{isBulk ? " (Bulk)" : ""} → <StatusBadge status={status} />
//           </h3>
//           <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
//         </div>
//         <div className="p-5">
//           {vehicleLabel && !isBulk && (
//             <p className="text-sm text-gray-500 mb-3">Vehicle: <span className="font-mono font-semibold text-blue-600">{vehicleLabel}</span></p>
//           )}
//           {isBulk && (
//             <p className="text-sm text-gray-500 mb-3">Applying to all selected vehicles.</p>
//           )}
//           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//             Remarks {isRequired ? <span className="text-red-500">*</span> : <span className="text-gray-400">(optional)</span>}
//           </label>
//           <select
//             value={selectedRemark}
//             onChange={e => { setSelectedRemark(e.target.value); setCustomRemark(""); }}
//             className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 py-2 px-3 text-sm mb-2 focus:border-blue-500 focus:outline-none"
//           >
//             <option value="">Select reason...</option>
//             {AdminSelectOptionsData.remarks.map(r => (
//               <option key={r} value={r}>{r}</option>
//             ))}
//           </select>
//           <textarea
//             rows={2}
//             className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none"
//             placeholder="Or type a custom reason..."
//             value={customRemark}
//             onChange={e => { setCustomRemark(e.target.value); setSelectedRemark(""); }}
//           />
//           {isRequired && !finalRemarks && (
//             <p className="text-xs text-red-500 mt-1">Remarks are required for this status.</p>
//           )}
//         </div>
//         <div className="flex justify-end gap-3 p-5 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-xl">
//           <button type="button" onClick={onClose}
//             className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100">
//             Cancel
//           </button>
//           <button
//             type="button"
//             disabled={isRequired && !finalRemarks}
//             onClick={() => { if (isRequired && !finalRemarks) return; onConfirm(finalRemarks); }}
//             className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
//             Confirm
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const FALLBACK_IMG = "/images/Truck_Image.jpg";

// export default function VehicleInventory() {

//   const [vehicleTypes, setVehicleTypes]     = useState([]);
//   const [selectedTypeId, setSelectedTypeId] = useState("all"); // ← default "all"
//   const [vehicles, setVehicles]             = useState([]);
//   const [allVehicles, setAllVehicles]       = useState([]);
//   const [loading, setLoading]               = useState(false);
//   const [loadingAll, setLoadingAll]         = useState(false);

//   const [searchQuery, setSearchQuery]       = useState("");
//   const [cityFilter, setCityFilter]         = useState("all");
//   const [statusFilter, setStatusFilter]     = useState("all");

//   const [editingRows, setEditingRows]       = useState({});

//   const [selectedRows, setSelectedRows]     = useState(new Set());
//   const [bulkStatus, setBulkStatus]         = useState("");
//   const [bulkCity, setBulkCity]             = useState("");
//   const [isBulkApplying, setIsBulkApplying] = useState(false);

//   const [remarksModal, setRemarksModal]     = useState({
//     open: false, status: "", vehicleId: null, isBulk: false,
//   });

//   const [currentPage, setCurrentPage]       = useState(1);
//   const [rowsPerPage, setRowsPerPage]       = useState(6);

//   const [carouselIndex, setCarouselIndex]   = useState(0);
//   const modelsPerPage = 3;

//   const cityOptions   = AdminSelectOptionsData?.cities        || [];
//   const statusOptions = AdminSelectOptionsData?.statusOptions || [];

//   // ── FIXED stats ──────────────────────────────────────────────────────────────
//   const totalVehicles  = allVehicles.length;
//   const availableCount = allVehicles.filter(v => v.status === "Available").length;
//   const bookedCount    = allVehicles.filter(v => v.status === "Booked").length;
//   // Everything that is NOT Available and NOT Booked
//   const otherCount     = allVehicles.filter(v => !["Available", "Booked"].includes(v.status)).length;

//   const uniqueCities = ["all", ...new Set(vehicles.map(v => v.city).filter(Boolean))];

//   const filteredVehicles = vehicles.filter(vehicle => {
//     const q = searchQuery.toLowerCase().trim();
//     const matchesSearch = !q || [
//       vehicle.registrationNumber, vehicle.vehicleId, vehicle.status,
//       vehicle.remarks, vehicle.city, vehicle.modelName,
//     ].some(field => (field || "").toLowerCase().includes(q));
//     const matchesCity   = cityFilter === "all" || vehicle.city === cityFilter;
//     const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter;
//     return matchesSearch && matchesCity && matchesStatus;
//   });

//   const totalPages       = Math.ceil(filteredVehicles.length / rowsPerPage);
//   const indexOfLastItem  = currentPage * rowsPerPage;
//   const indexOfFirstItem = indexOfLastItem - rowsPerPage;
//   const currentVehicles  = filteredVehicles.slice(indexOfFirstItem, indexOfLastItem);
//   const allPageIds       = currentVehicles.map(v => v.id);

//   useEffect(() => { setCurrentPage(1); }, [searchQuery, cityFilter, statusFilter, rowsPerPage, selectedTypeId]);
//   useEffect(() => { setSelectedRows(new Set()); }, [currentPage, selectedTypeId]);

//   const flattenVehicles = (groups) => {
//     const flat = [];
//     groups.forEach(group => {
//       const groupId       = group._id;
//       const vehicleTypeId = group.basicInfo?.vehicleType;
//       const modelName     = group.basicInfo?.vehicleName || "Unknown Model";
//       const techSpecs     = group.techSpecs  || {};
//       const mediaFiles    = group.mediaFiles || {};
//       if (group.registrationVehicles?.length) {
//         group.registrationVehicles.forEach(reg => {
//           const screenSize = techSpecs.leftRightScreenWidth && techSpecs.leftRightScreenHeight
//             ? `${techSpecs.leftRightScreenWidth} x ${techSpecs.leftRightScreenHeight} ft`
//             : techSpecs.numberOfScreens ? `${techSpecs.numberOfScreens} Side LED` : "N/A";
//           flat.push({
//             id: `${groupId}_${reg.registrationNumber}`,
//             groupId,
//             registrationNumber: reg.registrationNumber,
//             vehicleId:          reg.vehicleId,
//             city:               reg.city || "",
//             modelConfig:        reg.modelConfig || techSpecs.screenType || "3 Side LED",
//             screenSize,
//             gpsStatus:          reg.gpsEnabled ? "Active" : "Inactive",
//             status:             reg.statusAvailability?.currentStatus || "Waiting for Status",
//             remarks:            reg.statusAvailability?.remarks || "",
//             lastUpdated:        formatDate(reg.updatedAt || group.updatedAt),
//             modelName, techSpecs, mediaFiles,
//             mainImage:          mediaFiles.frontViewImage || FALLBACK_IMG,
//             rawReg:             reg,
//             vehicleTypeId,
//           });
//         });
//       }
//     });
//     return flat;
//   };

//   // ── FIXED fetchAllVehicles & fetchVehiclesByType ──────────────────────────
//   const fetchAllVehicles = async () => {
//     setLoadingAll(true);
//     try {
//       const res  = await fetch(`${baseUrl}/api/getNewVehicles`);
//       const data = await res.json();
//       if (data.success) setAllVehicles(flattenVehicles(data.data));
//       else toast.error(data.message || "Failed to fetch all vehicles");
//     } catch (err) {
//       console.error(err);
//       toast.error("Error loading all vehicles");
//     } finally {
//       setLoadingAll(false);
//     }
//   };

//   const fetchVehicleTypes = async () => {
//     try {
//       const res  = await fetch(`${baseUrl}/api/vehicle-types`);
//       const data = await res.json();
//       if (data.success) setVehicleTypes(data.data || []);
//       else toast.error("Failed to load vehicle types");
//     } catch (err) {
//       console.error(err);
//       toast.error("Error loading vehicle types");
//     }
//   };

//   // ── FIXED: handles "all" typeId ───────────────────────────────────────────
//   const fetchVehiclesByType = async (typeId) => {
//     setLoading(true);
//     try {
//       const url = (!typeId || typeId === "all")
//         ? `${baseUrl}/api/getNewVehicles`
//         : `${baseUrl}/api/getNewVehicles?vehicleType=${typeId}`;
//       const res  = await fetch(url);
//       const data = await res.json();
//       if (data.success) setVehicles(flattenVehicles(data.data));
//       else { toast.error(data.message || "Failed to fetch vehicles"); setVehicles([]); }
//     } catch (err) {
//       console.error(err);
//       toast.error("Error loading vehicles");
//       setVehicles([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateRegistrationVehicleRaw = async (groupId, registrationNumber, updatePayload) => {
//     try {
//       const cleanReg = registrationNumber.replace(/\s/g, "");
//       const url = `${baseUrl}/api/updateRegistrationVehicle/${groupId}/${encodeURIComponent(cleanReg)}`;
//       const res = await fetch(url, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(updatePayload),
//       });
//       const data = await res.json();
//       return data.success;
//     } catch (err) {
//       console.error(err);
//       return false;
//     }
//   };

//   const updateRegistrationVehicle = async (groupId, registrationNumber, updatePayload) => {
//     const ok = await updateRegistrationVehicleRaw(groupId, registrationNumber, updatePayload);
//     if (ok) {
//       await fetchVehiclesByType(selectedTypeId);
//       await fetchAllVehicles();
//       return true;
//     } else {
//       toast.error("Update failed");
//       return false;
//     }
//   };

//   const deleteRegistrationVehicle = async (groupId, registrationNumber) => {
//     try {
//       const cleanReg = registrationNumber.replace(/\s/g, "");
//       const res  = await fetch(
//         `${baseUrl}/api/deleteRegistrationVehicle/${groupId}/${encodeURIComponent(cleanReg)}`,
//         { method: "DELETE" }
//       );
//       const data = await res.json();
//       if (data.success) {
//         toast.success("Vehicle deleted successfully");
//         await fetchVehiclesByType(selectedTypeId);
//         await fetchAllVehicles();
//         return true;
//       } else { toast.error(data.message || "Deletion failed"); return false; }
//     } catch (err) {
//       console.error(err);
//       toast.error("Error deleting vehicle");
//       return false;
//     }
//   };

//   useEffect(() => { fetchVehicleTypes(); fetchAllVehicles(); }, []);
//   useEffect(() => { fetchVehiclesByType(selectedTypeId); }, [selectedTypeId]);

//   const handleEditField = (vehicleId, field, value) => {
//     setEditingRows(prev => ({
//       ...prev,
//       [vehicleId]: { ...prev[vehicleId], [field]: value },
//     }));
//   };

//   const handleStatusChange = (vehicleId, newStatus) => {
//     const needsRemarks = REMARKS_REQUIRED.includes(newStatus) || REMARKS_OPTIONAL.includes(newStatus);
//     if (needsRemarks && newStatus !== "Available") {
//       setEditingRows(prev => ({
//         ...prev,
//         [vehicleId]: { ...prev[vehicleId], status: newStatus, remarks: "" },
//       }));
//       setRemarksModal({ open: true, status: newStatus, vehicleId, isBulk: false });
//     } else {
//       setEditingRows(prev => ({
//         ...prev,
//         [vehicleId]: { ...prev[vehicleId], status: newStatus, remarks: "" },
//       }));
//     }
//   };

//   const handleRemarksConfirm = (remarks) => {
//     const { vehicleId, isBulk, status } = remarksModal;
//     if (isBulk) {
//       pendingBulkRemarksRef.current = remarks;
//       setRemarksModal({ open: false, status: "", vehicleId: null, isBulk: false });
//       executeBulkApply(bulkStatus, bulkCity, remarks);
//     } else {
//       // ── KEY FIX: update remarks in editingRows after modal confirm ──
//       setEditingRows(prev => ({
//         ...prev,
//         [vehicleId]: { ...prev[vehicleId], remarks },
//       }));
//       setRemarksModal({ open: false, status: "", vehicleId: null, isBulk: false });
//     }
//   };

//   const pendingBulkRemarksRef = useRef("");

//   const handleSaveRow = async (vehicle) => {
//     const updatedFields = editingRows[vehicle.id];
//     if (!updatedFields) return;
//     const newStatus  = updatedFields.status  !== undefined ? updatedFields.status  : vehicle.status;
//     const remarks    = updatedFields.remarks !== undefined ? updatedFields.remarks : vehicle.remarks;
//     const isReqRemarks = REMARKS_REQUIRED.includes(newStatus);
//     if (isReqRemarks && !remarks) {
//       toast.error("Please add remarks before saving.");
//       return;
//     }
//     const payload = {};
//     if (updatedFields.city      !== undefined) payload.city          = updatedFields.city;
//     if (updatedFields.gpsStatus !== undefined) payload.gpsEnabled    = updatedFields.gpsStatus === "Active";
//     if (updatedFields.status    !== undefined) {
//       payload.currentStatus  = updatedFields.status;
//       payload.statusPriority = STATUS_PRIORITY[updatedFields.status] ?? 0;
//     }
//     if (updatedFields.remarks !== undefined) payload.remarks = updatedFields.remarks;
//     const success = await updateRegistrationVehicle(vehicle.groupId, vehicle.registrationNumber, payload);
//     if (success) {
//       setEditingRows(prev => { const s = { ...prev }; delete s[vehicle.id]; return s; });
//       toast.success("Vehicle updated successfully!");
//     }
//   };

//   const handleSetMaintenance = async (vehicle) => {
//     const payload = { currentStatus: "Under Maintenance", statusPriority: STATUS_PRIORITY["Maintenance"] ?? 4, remarks: vehicle.remarks || "Moved to maintenance" };
//     const success = await updateRegistrationVehicle(vehicle.groupId, vehicle.registrationNumber, payload);
//     if (success) toast.info("Vehicle moved to maintenance.");
//   };

//   const handleDeleteVehicle = async (vehicle) => {
//     if (window.confirm(`Are you sure you want to delete vehicle ${vehicle.registrationNumber}?`)) {
//       await deleteRegistrationVehicle(vehicle.groupId, vehicle.registrationNumber);
//     }
//   };

//   const isAllPageSelected = allPageIds.length > 0 && allPageIds.every(id => selectedRows.has(id));
//   const isIndeterminate   = selectedRows.size > 0 && !isAllPageSelected;

//   const handleSelectAll = () => {
//     if (isAllPageSelected) {
//       setSelectedRows(prev => { const next = new Set(prev); allPageIds.forEach(id => next.delete(id)); return next; });
//     } else {
//       setSelectedRows(prev => { const next = new Set(prev); allPageIds.forEach(id => next.add(id)); return next; });
//     }
//   };

//   const handleSelectRow = (id) => {
//     setSelectedRows(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
//   };

//   const handleClearSelection = () => { setSelectedRows(new Set()); setBulkStatus(""); setBulkCity(""); };

//   const handleApplyToSelected = async () => {
//     if (selectedRows.size === 0) { toast.warning("No vehicles selected"); return; }
//     if (!bulkStatus && !bulkCity) { toast.warning("Select a status or city to apply"); return; }
//     const needsRemarks = bulkStatus && (REMARKS_REQUIRED.includes(bulkStatus) || REMARKS_OPTIONAL.includes(bulkStatus));
//     if (needsRemarks && bulkStatus !== "Available") {
//       setRemarksModal({ open: true, status: bulkStatus, vehicleId: null, isBulk: true });
//       return;
//     }
//     await executeBulkApply(bulkStatus, bulkCity, "");
//   };

//   const executeBulkApply = async (status, city, remarks) => {
//     setIsBulkApplying(true);
//     const selectedVehicles = vehicles.filter(v => selectedRows.has(v.id));
//     let successCount = 0;
//     for (const vehicle of selectedVehicles) {
//       const payload = {};
//       if (status) {
//         payload.currentStatus  = status;
//         payload.statusPriority = STATUS_PRIORITY[status] ?? 0;
//       }
//       if (city)    payload.city    = city;
//       if (remarks) payload.remarks = remarks;
//       else if (status === "Available") payload.remarks = "";
//       const ok = await updateRegistrationVehicleRaw(vehicle.groupId, vehicle.registrationNumber, payload);
//       if (ok) successCount++;
//     }
//     await fetchVehiclesByType(selectedTypeId);
//     await fetchAllVehicles();
//     toast.success(`${successCount}/${selectedVehicles.length} vehicles updated`);
//     setSelectedRows(new Set());
//     setBulkStatus("");
//     setBulkCity("");
//     setIsBulkApplying(false);
//   };

//   const goToPage = (page) => { if (page >= 1 && page <= totalPages) setCurrentPage(page); };
//   const handleRowsPerPageChange = (e) => { setRowsPerPage(parseInt(e.target.value)); setCurrentPage(1); };

//   const getPageNumbers = () => {
//     const pageNumbers = [];
//     const maxPagesToShow = 5;
//     if (totalPages <= maxPagesToShow) {
//       for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
//     } else {
//       if (currentPage <= 3) {
//         for (let i = 1; i <= 4; i++) pageNumbers.push(i);
//         pageNumbers.push("..."); pageNumbers.push(totalPages);
//       } else if (currentPage >= totalPages - 2) {
//         pageNumbers.push(1); pageNumbers.push("...");
//         for (let i = totalPages - 3; i <= totalPages; i++) pageNumbers.push(i);
//       } else {
//         pageNumbers.push(1); pageNumbers.push("...");
//         for (let i = currentPage - 1; i <= currentPage + 1; i++) pageNumbers.push(i);
//         pageNumbers.push("..."); pageNumbers.push(totalPages);
//       }
//     }
//     return pageNumbers;
//   };

//   const totalModelGroups = Math.ceil(vehicleTypes.length / modelsPerPage);
//   const visibleModels    = vehicleTypes.slice(carouselIndex * modelsPerPage, (carouselIndex + 1) * modelsPerPage);
//   const nextCarousel = () => { if (carouselIndex + 1 < totalModelGroups) setCarouselIndex(carouselIndex + 1); };
//   const prevCarousel = () => { if (carouselIndex - 1 >= 0) setCarouselIndex(carouselIndex - 1); };

//   return (
//     <div className="min-h-screen bg-gray-50 px-1 md:px-0 lg:px-0 py-0 p-1 mx-0 my-0 max-w-none md:p-0">
//       <ToastContainer position="top-right" autoClose={3000} />

//       <RemarksModal
//         isOpen={remarksModal.open}
//         onClose={() => setRemarksModal({ open: false, status: "", vehicleId: null, isBulk: false })}
//         onConfirm={handleRemarksConfirm}
//         status={remarksModal.status}
//         vehicleLabel={remarksModal.vehicleId
//           ? vehicles.find(v => v.id === remarksModal.vehicleId)?.registrationNumber
//           : null}
//         isBulk={remarksModal.isBulk}
//       />

//       <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
//         <span className="font-medium">Inventory</span>
//         <span>/</span>
//         <span className="text-gray-900">Vehicle Availability</span>
//       </div>

//       {/* ── Stats Cards ── */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//         <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
//           <div className="p-3 bg-blue-100 rounded-lg"><Truck className="w-6 h-6 text-blue-700" /></div>
//           <div>
//             <p className="text-sm text-gray-500">Total Vehicles</p>
//             <p className="text-2xl font-bold">{totalVehicles}</p>
//             <p className="text-xs text-gray-400">All Onboarded Vehicles</p>
//           </div>
//         </div>
//         <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
//           <div className="p-3 bg-green-100 rounded-lg"><CheckCircle2 className="w-6 h-6 text-green-700" /></div>
//           <div>
//             <p className="text-sm text-gray-500">Available</p>
//             <p className="text-2xl font-bold">{availableCount}</p>
//             <p className="text-xs text-green-600">{totalVehicles ? ((availableCount / totalVehicles) * 100).toFixed(2) : 0}% of total</p>
//           </div>
//         </div>
//         {/* ── FIXED: Other/Inactive instead of just Unavailable ── */}
//         <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
//           <div className="p-3 bg-orange-100 rounded-lg"><PlayCircle className="w-6 h-6 text-orange-600" /></div>
//           <div>
//             <p className="text-sm text-gray-500">Other / Inactive</p>
//             <p className="text-2xl font-bold">{otherCount}</p>
//             <p className="text-xs text-orange-600">{totalVehicles ? ((otherCount / totalVehicles) * 100).toFixed(2) : 0}% of total</p>
//           </div>
//         </div>
//         <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
//           <div className="p-3 bg-red-100 rounded-lg"><Calendar className="w-6 h-6 text-red-600" /></div>
//           <div>
//             <p className="text-sm text-gray-500">Booked</p>
//             <p className="text-2xl font-bold">{bookedCount}</p>
//             <p className="text-xs text-red-600">{totalVehicles ? ((bookedCount / totalVehicles) * 100).toFixed(2) : 0}% of total</p>
//           </div>
//         </div>
//       </div>

//       {/* ── Filter Section ── */}
//       <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
//         <h3 className="font-semibold text-gray-800 mb-4">Filter Inventory</h3>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Model / Type</label>
//             <select
//               value={selectedTypeId}
//               onChange={e => setSelectedTypeId(e.target.value)}
//               className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none"
//             >
//               {/* ── FIXED: All Models option ── */}
//               <option value="all">All Models</option>
//               {vehicleTypes.map(type => (
//                 <option key={type._id} value={type._id}>{type.typeName}</option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
//             <select
//               value={statusFilter}
//               onChange={e => setStatusFilter(e.target.value)}
//               className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm focus:border-blue-500 focus:outline-none"
//             >
//               <option value="all">All Status</option>
//               {statusOptions.map(s => (
//                 <option key={s} value={s}>{s}</option>
//               ))}
//             </select>
//           </div>
//           <div className="lg:col-span-2">
//             <label className="block text-sm font-medium text-gray-700 mb-1">Search vehicles</label>
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Search by reg no, vehicle ID, status, city, remarks..."
//                 value={searchQuery}
//                 onChange={e => setSearchQuery(e.target.value)}
//                 className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
//               />
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//             </div>
//           </div>
//           <div style={{ textAlign: "center", alignContent: "center" }}>
//             <button
//               type="button"
//               onClick={() => { setSearchQuery(""); setCityFilter("all"); setStatusFilter("all"); }}
//               className="text-sm text-blue-600 hover:underline"
//             >
//               Reset
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* ── Main Table + Quick Guidance ── */}
//       <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
//         <div className="xl:col-span-9 mb-6">
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//             <div className="p-6 border-b border-gray-100">
//               <h3 className="text-lg font-semibold text-gray-800">Mapped Vehicle Model Summary</h3>
//               <p className="text-sm text-gray-500 mt-1">
//                 Update GPS, location, status and remarks inline. Bulk-select vehicles to apply changes to multiple at once.
//               </p>
//               <div className="flex flex-wrap items-center gap-3 mt-4">
//                 <label className="flex items-center gap-2 cursor-pointer select-none">
//                   <input type="checkbox" checked={isAllPageSelected}
//                     ref={el => { if (el) el.indeterminate = isIndeterminate; }}
//                     onChange={handleSelectAll} className="w-4 h-4 accent-red-500 cursor-pointer" />
//                   <span className="text-sm text-gray-600">
//                     {selectedRows.size > 0 ? `${selectedRows.size} selected` : "0 selected"}
//                   </span>
//                 </label>
//                 <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value)}
//                   className="rounded-lg border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-sm focus:border-blue-500 focus:outline-none">
//                   <option value="">Set Status</option>
//                   {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
//                 </select>
//                 <select value={bulkCity} onChange={e => setBulkCity(e.target.value)}
//                   className="rounded-lg border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-sm focus:border-blue-500 focus:outline-none">
//                   <option value="">Set City</option>
//                   {cityOptions.length > 0
//                     ? cityOptions.map(c => { const val = typeof c === "string" ? c : c.value || c.name || c; return <option key={val} value={val}>{val}</option>; })
//                     : uniqueCities.filter(c => c !== "all").map(c => <option key={c} value={c}>{c}</option>)
//                   }
//                 </select>
//                 <button onClick={handleApplyToSelected}
//                   disabled={isBulkApplying || selectedRows.size === 0}
//                   className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${selectedRows.size > 0 ? "bg-red-500 text-white hover:bg-red-600" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}>
//                   {isBulkApplying ? "Applying..." : "Apply to Selected"}
//                 </button>
//                 {selectedRows.size > 0 && (
//                   <button onClick={handleClearSelection} className="ml-auto text-sm text-blue-600 hover:underline flex items-center gap-1">
//                     <X size={14} /> Clear Selection
//                   </button>
//                 )}
//               </div>
//             </div>

//             <div className="overflow-x-auto max-h-[480px]">
//               <table className="w-full text-sm">
//                 <thead className="bg-gray-50 border-b sticky top-0 z-10">
//                   <tr>
//                     <th className="px-3 py-3 text-left">
//                       <input type="checkbox" checked={isAllPageSelected}
//                         ref={el => { if (el) el.indeterminate = isIndeterminate; }}
//                         onChange={handleSelectAll} className="w-4 h-4 accent-red-500 cursor-pointer" />
//                     </th>
//                     <th className="px-3 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Registration Number ↕</th>
//                     <th className="px-3 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Vehicle ID ↕</th>
//                     <th className="px-3 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">City / Current Location</th>
//                     <th className="px-3 py-3 text-left font-semibold text-gray-600">GPS</th>
//                     <th className="px-3 py-3 text-left font-semibold text-gray-600">Status</th>
//                     <th className="px-3 py-3 text-left font-semibold text-gray-600">Remarks</th>
//                     <th className="px-3 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Last Updated</th>
//                     <th className="px-3 py-3 text-center font-semibold text-gray-600 whitespace-nowrap">Save Row</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100">
//                   {loading ? (
//                     <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-500">Loading vehicles...</td></tr>
//                   ) : currentVehicles.length === 0 ? (
//                     <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-500">No vehicles match the filters.</td></tr>
//                   ) : (
//                     currentVehicles.map(vehicle => {
//                       const isEditing  = editingRows[vehicle.id] || {};
//                       const isSelected = selectedRows.has(vehicle.id);
//                       const currentStatus  = isEditing.status  !== undefined ? isEditing.status  : vehicle.status;
//                       const currentRemarks = isEditing.remarks !== undefined ? isEditing.remarks : vehicle.remarks;
//                       return (
//                         <tr key={vehicle.id} className={`hover:bg-gray-50 transition align-middle ${isSelected ? "bg-red-50" : ""}`}>
//                           <td className="px-3 py-3">
//                             <input type="checkbox" checked={isSelected} onChange={() => handleSelectRow(vehicle.id)} className="w-4 h-4 accent-red-500 cursor-pointer" />
//                           </td>
//                           <td className="px-3 py-3">
//                             <div className="flex items-center gap-2">
//                               <img src={vehicle.mainImage} alt="vehicle"
//                                 className="w-12 h-12 rounded-lg object-cover border border-gray-200 flex-shrink-0"
//                                 onError={e => { e.target.onerror = null; e.target.src = FALLBACK_IMG; }} />
//                               <div>
//                                 <div className="font-semibold text-blue-700 text-xs whitespace-nowrap">{vehicle.registrationNumber}</div>
//                                 <div className="text-xs text-gray-400 mt-0.5">{vehicle.modelName}</div>
//                               </div>
//                             </div>
//                           </td>
//                           <td className="px-3 py-3 text-gray-600 text-xs">{vehicle.vehicleId}</td>
//                           <td className="px-2 py-3">
//                             <select value={isEditing.city !== undefined ? isEditing.city : vehicle.city}
//                               onChange={e => handleEditField(vehicle.id, "city", e.target.value)}
//                               className="h-9 w-full border border-gray-200 rounded-lg px-2 text-xs focus:border-blue-500 focus:outline-none bg-white">
//                               {vehicle.city && <option value={vehicle.city}>{vehicle.city}</option>}
//                               {cityOptions.length > 0
//                                 ? cityOptions.map(c => { const val = typeof c === "string" ? c : c.value || c.name || c; if (val === vehicle.city) return null; return <option key={val} value={val}>{val}</option>; })
//                                 : uniqueCities.filter(c => c !== "all" && c !== vehicle.city).map(c => <option key={c} value={c}>{c}</option>)
//                               }
//                             </select>
//                           </td>
//                           <td className="px-2 py-3">
//                             <Switch
//                               checked={isEditing.gpsStatus !== undefined ? isEditing.gpsStatus === "Active" : vehicle.gpsStatus === "Active"}
//                               onChange={checked => handleEditField(vehicle.id, "gpsStatus", checked ? "Active" : "Inactive")}
//                               className={`${(isEditing.gpsStatus !== undefined ? isEditing.gpsStatus : vehicle.gpsStatus) === "Active" ? "bg-green-500" : "bg-gray-400"} relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
//                             />
//                           </td>
//                           <td className="px-2 py-3 min-w-[170px]">
//                             <select value={currentStatus} onChange={e => handleStatusChange(vehicle.id, e.target.value)}
//                               className="h-9 w-full border border-gray-200 rounded-lg px-2 text-xs focus:border-blue-500 focus:outline-none bg-white">
//                               {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
//                             </select>
//                             <div className="mt-1"><StatusBadge status={currentStatus} /></div>
//                           </td>
//                           <td className="px-2 py-3 min-w-[130px]">
//                             <input type="text" value={currentRemarks}
//                               onChange={e => handleEditField(vehicle.id, "remarks", e.target.value)}
//                               placeholder={REMARKS_REQUIRED.includes(currentStatus) ? "Required..." : "Optional..."}
//                               className={`w-full border rounded px-2 py-1 text-xs focus:border-blue-400 ${REMARKS_REQUIRED.includes(currentStatus) && !currentRemarks ? "border-red-300 bg-red-50" : "border-gray-200"}`}
//                             />
//                             {REMARKS_REQUIRED.includes(currentStatus) && !currentRemarks && (
//                               <p className="text-xs text-red-500 mt-0.5">Required</p>
//                             )}
//                           </td>
//                           <td className="px-2 py-3 text-gray-500 text-xs whitespace-nowrap">{vehicle.lastUpdated}</td>
//                           <td className="px-3 py-4">
//                             <div className="flex justify-center gap-2">
//                               <button onClick={() => handleSaveRow(vehicle)}
//                                 className="w-9 h-9 rounded-lg border border-red-200 bg-red-50 flex items-center justify-center hover:bg-red-100" title="Save Changes">
//                                 <Save size={16} className="text-red-600" />
//                               </button>
//                             </div>
//                           </td>
//                         </tr>
//                       );
//                     })
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-5 border-t border-gray-100">
//               <div className="text-sm text-gray-600">
//                 Showing {filteredVehicles.length > 0 ? indexOfFirstItem + 1 : 0} –{" "}
//                 {Math.min(indexOfLastItem, filteredVehicles.length)} of {filteredVehicles.length} vehicles
//               </div>
//               <div className="flex gap-1 items-center">
//                 <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}
//                   className={`px-2 py-1 rounded ${currentPage === 1 ? "text-gray-300 cursor-not-allowed bg-gray-100 w-9 h-9 rounded-lg" : "w-9 h-9 rounded-lg text-gray-700 bg-gray-100"}`}>&lt;</button>
//                 {getPageNumbers().map((page, idx) => (
//                   <button key={idx} onClick={() => typeof page === "number" && goToPage(page)}
//                     className={`px-2 py-1 rounded ${currentPage === page ? "w-9 h-9 rounded-lg bg-red-500 text-white flex items-center justify-center" : "w-9 h-9 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
//                     disabled={typeof page !== "number"}>{page}</button>
//                 ))}
//                 <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}
//                   className={`px-2 py-1 rounded ${currentPage === totalPages || totalPages === 0 ? "text-gray-300 cursor-not-allowed w-9 h-9 rounded-lg bg-gray-100" : "text-gray-700 hover:bg-gray-100 w-9 h-9 rounded-lg bg-gray-100"}`}>&gt;</button>
//               </div>
//               <select value={rowsPerPage} onChange={handleRowsPerPageChange}
//                 className="border border-gray-300 rounded px-2 py-1 text-sm focus:border-blue-500 focus:outline-none">
//                 <option value={6}>6 per page</option>
//                 <option value={10}>10 per page</option>
//                 <option value={20}>20 per page</option>
//                 <option value={50}>50 per page</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-5 mb-6 flex flex-col justify-between">
//           <div className="flex justify-between">
//             <div>Quick Guidance</div>
//             <div className="w-[30px] h-[30px] bg-[rgb(237,163,163)] rounded-full text-center flex items-center justify-center">
//               <i className="fa-regular fa-lightbulb" style={{ color: "rgb(237, 7, 7)" }}></i>
//             </div>
//           </div>
//           <div className="flex gap-2.5">
//             <div>
//               <div className="h-[120px]">
//                 <div className="w-[30px] h-[30px] bg-[rgb(237,163,163)] rounded-full text-center leading-[30px]">1</div>
//                 <div className="flex justify-center"><div className="h-[70px] border-r-2 border-dashed border-gray-400 my-2"></div></div>
//               </div>
//               <div className="h-[130px]">
//                 <div className="w-[30px] h-[30px] bg-[rgb(237,163,163)] rounded-full text-center leading-[30px]">2</div>
//                 <div className="flex justify-center"><div className="h-[70px] border-r-2 border-dashed border-gray-400 my-2"></div></div>
//               </div>
//               <div className="h-[130px]">
//                 <div className="w-[30px] h-[30px] bg-[rgb(237,163,163)] rounded-full text-center leading-[30px]">3</div>
//               </div>
//             </div>
//             <div>
//               <div className="h-[120px]">
//                 <div className="font-semibold text-base">Select a vehicle model once</div>
//                 <div className="text-sm my-2">Pick the model / type from the dropdown above.</div>
//               </div>
//               <div className="h-[130px]">
//                 <div className="font-semibold text-base/5">All mapped vehicles loaded automatically</div>
//                 <div className="text-sm my-2">All vehicles linked to the selected model are listed for easy management.</div>
//               </div>
//               <div className="h-[130px]">
//                 <div className="font-semibold text-base/5">Update GPS status, location, status, remarks and save</div>
//                 <div className="text-sm my-2">Edit the required fields and click Save Row or use bulk actions to update multiple vehicles.</div>
//               </div>
//             </div>
//           </div>
//           <div className="flex gap-2.5 border border-green-500 bg-[#aef6bb] justify-center p-1.5 items-center rounded-md mt-4 flex-end">
//             <div><CheckCircle2 className="w-6 h-6 text-green-700" /></div>
//             <div className="text-green-700">
//               <div>One model. All vehicles.</div>
//               <div>Update everything in one place.</div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ── Inventory Summary by Model ── */}
//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
//         <div className="lg:col-span-9 bg-white rounded-xl shadow-sm p-5 mb-6">
//           <div className="font-semibold mb-4 flex justify-between items-center">
//             <span>Inventory Summary by Model</span>
//             {vehicleTypes.length > modelsPerPage && (
//               <div className="flex gap-2">
//                 <button onClick={prevCarousel} disabled={carouselIndex === 0}
//                   className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-30">‹</button>
//                 <button onClick={nextCarousel} disabled={carouselIndex + 1 >= totalModelGroups}
//                   className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-30">›</button>
//               </div>
//             )}
//           </div>
//           <div className="flex justify-around gap-4 overflow-hidden">
//             {visibleModels.map(type => {
//               const typeVehicles = allVehicles.filter(v => v.vehicleTypeId === type._id);
//               const total   = typeVehicles.length;
//               const avail   = typeVehicles.filter(v => v.status === "Available").length;
//               const unAvail = typeVehicles.filter(v => v.status === "Unavailable").length;
//               const booked  = typeVehicles.filter(v => v.status === "Booked").length;
//               const waiting = typeVehicles.filter(v => v.status === "Waiting for Status").length;
//               const typeImg = typeVehicles[0]?.mainImage || FALLBACK_IMG;
//               return (
//                 <div key={type._id} className="flex gap-5 pr-2.5 min-w-[200px]">
//                   <div className="text-center justify-center">
//                     <img src={typeImg} className="w-[60px] h-[60px] rounded-lg object-cover" alt="truck"
//                       onError={e => { e.target.onerror = null; e.target.src = FALLBACK_IMG; }} />
//                     <div>Total</div>
//                     <div className="font-semibold text-xl">{total}</div>
//                   </div>
//                   <div>
//                     <div className="font-medium">{type.typeName}</div>
//                     <div className="text-sm text-gray-500">Counts</div>
//                     <div>
//                       <div className="flex justify-between gap-2.5"><div><span><i className="fa-solid fa-circle" style={{ color: "#9ca3af", fontSize: "10px" }}></i></span> Waiting</div><div>{waiting}</div></div>
//                       <div className="flex justify-between gap-2.5"><div><span><i className="fa-solid fa-circle" style={{ color: "#22c55e", fontSize: "10px" }}></i></span> Available</div><div>{avail}</div></div>
//                       <div className="flex justify-between gap-2.5"><div><span><i className="fa-solid fa-circle" style={{ color: "#f97316", fontSize: "10px" }}></i></span> Unavailable</div><div>{unAvail}</div></div>
//                       <div className="flex justify-between gap-2.5"><div><span><i className="fa-solid fa-circle" style={{ color: "#ef4444", fontSize: "10px" }}></i></span> Booked</div><div>{booked}</div></div>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//         <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-5 mb-6">
//           <div className="font-semibold">Status Legend</div>
//           <div className="flex flex-col gap-2 mt-2">
//             <div className="flex justify-between"><div><span><i className="fa-solid fa-circle" style={{ color: "#9ca3af", fontSize: "10px" }}></i></span> Waiting for Status</div><div>Newly onboarded</div></div>
//             <div className="flex justify-between"><div><span><i className="fa-solid fa-circle" style={{ color: "#22c55e", fontSize: "10px" }}></i></span> Available</div><div>Ready to book</div></div>
//             <div className="flex justify-between"><div><span><i className="fa-solid fa-circle" style={{ color: "#f97316", fontSize: "10px" }}></i></span> Running</div><div>Currently running campaign</div></div>
//             <div className="flex justify-between"><div><span><i className="fa-solid fa-circle" style={{ color: "#ef4444", fontSize: "10px" }}></i></span> Allotted</div><div>Booked but not started</div></div>
//             <div className="flex justify-between"><div><span><i className="fa-solid fa-circle" style={{ color: "#eab308", fontSize: "10px" }}></i></span> Maintenance</div><div>Not available</div></div>
//           </div>
//         </div>
//       </div>

//       <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
//         <div className="flex flex-wrap gap-4 items-center">
//           <div className="font-semibold">Status Legend</div>
//           <div className="rounded px-2 py-1 bg-gray-50 text-gray-700 border border-gray-100"><i className="fa-solid fa-circle" style={{ color: "#9ca3af", fontSize: "10px" }}></i> Waiting for Status</div>
//           <div className="rounded px-2 py-1 bg-green-50 text-green-700 border border-green-100"><i className="fa-solid fa-circle" style={{ color: "#22c55e", fontSize: "10px" }}></i> Available</div>
//           <div className="rounded px-2 py-1 bg-orange-50 text-orange-700 border border-orange-100"><i className="fa-solid fa-circle" style={{ color: "#f97316", fontSize: "10px" }}></i> Running</div>
//           <div className="rounded px-2 py-1 bg-red-50 text-red-700 border border-red-100"><i className="fa-solid fa-circle" style={{ color: "#ef4444", fontSize: "10px" }}></i> Allotted</div>
//           <div className="rounded px-2 py-1 bg-yellow-50 text-yellow-700 border border-yellow-100"><i className="fa-solid fa-circle" style={{ color: "#eab308", fontSize: "10px" }}></i> Maintenance</div>
//           <div className="rounded px-2 py-1 bg-blue-50 text-blue-700 border border-blue-100"><i className="fa-solid fa-circle" style={{ color: "#3b82f6", fontSize: "10px" }}></i> On Road</div>
//           <div className="rounded px-2 py-1 bg-red-50 text-red-700 border border-red-100"><i className="fa-solid fa-circle" style={{ color: "#dc2626", fontSize: "10px" }}></i> Unavailable</div>
//           <div className="rounded px-2 py-1 bg-yellow-50 text-yellow-700 border border-yellow-100"><i className="fa-solid fa-circle" style={{ color: "#f59e0b", fontSize: "10px" }}></i> Waiting for Branding</div>
//           <div className="rounded px-2 py-1 bg-yellow-50 text-yellow-700 border border-yellow-100"><i className="fa-solid fa-circle" style={{ color: "#f59e0b", fontSize: "10px" }}></i> Customization Pending</div>
//         </div>
//       </div>
//     </div>
//   );
// }





//CHANGES 23/05/2026 - PERFECTLY WORKS BULK GPS SAVE AND STATE CITY CHANGE
//ALL ARE CHANGED BASED ON THE REQUIREMNETS STATUS LEGEND CAROUSEL, FILTER FOR ABOVE STATISTICS BASED ETC...
/* eslint-disable */
// @ts-nocheck

"use client";

import React, { useState, useEffect, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Truck, CheckCircle2, PlayCircle, Calendar, Settings, Search, Trash2, Wrench, Save, X, Wifi, WifiOff,
} from "lucide-react";
import { baseUrl } from "../../../../BaseUrl";
import AdminSelectOptionsData from "../../AdminSelectOptions.json";
import { useAuthGuard } from "../../../utils/useAuthGuard";
import OrderDatePicker from "@/app/utils/OrderDatePicker";

// ── Native toggle — fully controlled, no external Switch dependency needed here
const ToggleSwitch = ({ checked, onChange, colorOn = "bg-green-500", colorOff = "bg-gray-300", size = "md" }) => {
  const h = size === "sm" ? "h-4" : "h-5";
  const w = size === "sm" ? "w-8" : "w-9";
  const knob = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  const translate = size === "sm" ? "translate-x-4" : "translate-x-4";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex ${h} ${w} items-center rounded-full transition-colors duration-200 focus:outline-none cursor-pointer ${checked ? colorOn : colorOff}`}
    >
      <span
        className={`inline-block ${knob} rounded-full bg-white shadow transform transition-transform duration-200 ${checked ? translate : "translate-x-0.5"}`}
      />
    </button>
  );
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
};

const STATUS_PRIORITY = AdminSelectOptionsData?.statusPriority || {
  "Waiting for Status": 0, "Available": 1, "Unavailable": 2,
  "Booked": 3, "Maintenance": 4, "Damaged": 5,
};

const REMARKS_REQUIRED = AdminSelectOptionsData?.remarksRequiredStatuses || ["Unavailable", "Maintenance", "Damaged"];
const REMARKS_OPTIONAL = AdminSelectOptionsData?.remarksOptionalStatuses || ["Booked"];
const BOOKED_LOCK_STATUSES = ["Waiting for Status", "Available", "Booked"];

const StatusBadge = ({ status }) => {
  const styles = {
    "Waiting for Status": "bg-yellow-100 text-yellow-700 border border-yellow-200",
    Available: "bg-green-100 text-green-700 border border-green-200",
    Running: "bg-orange-100 text-orange-700 border border-orange-200",
    "On Road": "bg-orange-100 text-orange-700 border border-orange-200",
    Allotted: "bg-red-100 text-red-700 border border-red-200",
    Booked: "bg-red-100 text-red-700 border border-red-200",
    "Under Maintenance": "bg-yellow-100 text-yellow-700 border border-yellow-200",
    Maintenance: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    Unavailable: "bg-red-100 text-red-700 border border-red-200",
    Damaged: "bg-red-200 text-red-800 border border-red-300",
    "Waiting for Branding": "bg-yellow-100 text-amber-700 border border-yellow-200",
    "Customization Pending": "bg-yellow-100 text-amber-700 border border-yellow-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${styles[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
};


const RemarksModal = ({ isOpen, onClose, onConfirm, status, vehicleLabel, isBulk = false, previousRemarks = "", previousStatus = "" }) => {
  const [selectedRemark, setSelectedRemark] = useState("");
  const [customRemark, setCustomRemark] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const isRequired = REMARKS_REQUIRED.includes(status);
  const isOptional = REMARKS_OPTIONAL.includes(status);
  const isBookedStatus = status === "Booked";

  useEffect(() => {
    if (isOpen) {
      setSelectedRemark("");
      setCustomRemark("");
      setFromDate("");
      setToDate("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const finalRemarks = customRemark.trim() || selectedRemark;


  const datesInvalid = isBookedStatus && (!fromDate || !toDate);
  const dateRangeInvalid = isBookedStatus && fromDate && toDate && fromDate >= toDate;
  const canConfirm = !(isRequired && !finalRemarks) && !datesInvalid && !dateRangeInvalid;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md mx-4 shadow-2xl">
        <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Status Change{isBulk ? " (Bulk)" : ""} → <StatusBadge status={status} />
          </h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <div className="p-5">
          {vehicleLabel && !isBulk && (
            <p className="text-sm text-gray-500 mb-3">Vehicle: <span className="font-mono font-semibold text-blue-600">{vehicleLabel}</span></p>
          )}
          {isBulk && (
            <p className="text-sm text-gray-500 mb-3">Applying to all selected vehicles.</p>
          )}

          {previousStatus === "Booked" && ["Unavailable", "Damaged", "Maintenance"].includes(status) && previousRemarks && (
            <div className="mb-3 p-2.5 rounded-lg bg-blue-50 border border-blue-100 animate-pulse">
              <p className="text-xs font-medium text-red-700 mb-0.5">Booking Info</p>
              <p className="text-xs text-red-600">{previousRemarks}</p>
            </div>
          )}



          {isBookedStatus && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Booking Dates <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">From Date</label>
                  <OrderDatePicker
                    value={fromDate}
                    onChange={(val) => { setFromDate(val); if (toDate && val >= toDate) setToDate(""); }}
                    placeholder="From date"
                    maxDate={toDate || undefined}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">To Date</label>
                  <OrderDatePicker
                    value={toDate}
                    onChange={setToDate}
                    placeholder="To date"
                    minDate={fromDate || undefined}
                  />
                </div>
              </div>
              {datesInvalid && (
                <p className="text-xs text-red-500 mt-1">Both from and to dates are required.</p>
              )}
              {dateRangeInvalid && (
                <p className="text-xs text-red-500 mt-1">To date must be after from date.</p>
              )}
            </div>
          )}

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Remarks {isRequired ? <span className="text-red-500">*</span> : <span className="text-gray-400">(optional)</span>}
          </label>
          <select
            value={selectedRemark}
            onChange={e => { setSelectedRemark(e.target.value); setCustomRemark(""); }}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 py-2 px-3 text-sm mb-2 focus:border-blue-500 focus:outline-none"
          >
            <option value="">Select reason...</option>
            {AdminSelectOptionsData.remarks.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <textarea
            rows={2}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="Or type a custom reason..."
            value={customRemark}
            onChange={e => { setCustomRemark(e.target.value); setSelectedRemark(""); }}
          />
          {isRequired && !finalRemarks && (
            <p className="text-xs text-red-500 mt-1">Remarks are required for this status.</p>
          )}
        </div>
        <div className="flex justify-end gap-3 p-5 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-xl">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100">
            Cancel
          </button>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={() => { if (!canConfirm) return; onConfirm(finalRemarks, { fromDate, toDate }); }}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};



const LocationSelector = ({ vehicle, editingRows, handleEditField, locationData }) => {
  // Determine current displayed city (from editingRows or original vehicle)
  const currentCity = editingRows[vehicle.id]?.city !== undefined
    ? editingRows[vehicle.id].city
    : vehicle.city;

  // ── FIX: toggle to show/hide the cascading location editor
  const [showEdit, setShowEdit] = useState(false);

  // Parse current city into state + district (format: "Tamil Nadu, Chennai")
  const parseCity = (cityStr) => {
    if (!cityStr) return { state: "", district: "" };
    const parts = cityStr.split(",").map(s => s.trim());
    return { state: parts[0] || "", district: parts[1] || "" };
  };

  const parsed = parseCity(currentCity);
  const [selectedState, setSelectedState] = useState(parsed.state);
  const [selectedDistrict, setSelectedDistrict] = useState(parsed.district);

  // Derive cities for the selected state from locationData
  const availableDistricts = locationData.find(l => l.state === selectedState)?.cities || [];

  const handleStateChange = (e) => {
    setSelectedState(e.target.value);
    setSelectedDistrict("");
    // Don't update parent yet — wait for district selection
  };

  const handleDistrictChange = (e) => {
    const district = e.target.value;
    setSelectedDistrict(district);
    if (selectedState && district) {
      // Store as "State, District" format
      handleEditField(vehicle.id, "city", `${selectedState}, ${district}`);
    }
  };

  // Reset internal state when toggle is turned off
  const handleToggle = (checked) => {
    setShowEdit(checked);
    if (!checked) {
      // Revert to original vehicle city when toggle is off
      const orig = parseCity(vehicle.city);
      setSelectedState(orig.state);
      setSelectedDistrict(orig.district);
      // Clear city edit from editingRows
      handleEditField(vehicle.id, "city", vehicle.city);
    } else {
      // Pre-fill with current value
      setSelectedState(parsed.state);
      setSelectedDistrict(parsed.district);
    }
  };

  return (
    <div className="min-w-[180px]">
      {/* Always show current location */}
      <div className="text-xs text-gray-700 font-medium mb-1 truncate max-w-[180px]" title={currentCity}>
        {currentCity || <span className="text-gray-400 italic">Not set</span>}
      </div>
      {/* Toggle to reveal cascading selector */}
      <label className="flex items-center gap-1.5 cursor-pointer mb-1">
        <span className="text-xs text-gray-400">Change city?</span>
        <ToggleSwitch
          checked={showEdit}
          onChange={handleToggle}
          colorOn="bg-blue-500"
          colorOff="bg-gray-300"
          size="sm"
        />
      </label>
      {/* Cascading state + district selects — visible only when toggle is on */}
      {showEdit && (
        <div className="flex flex-col gap-1 mt-1">
          <select
            value={selectedState}
            onChange={handleStateChange}
            className="h-8 w-full border border-blue-300 rounded-lg px-2 text-xs focus:border-blue-500 focus:outline-none bg-white"
          >
            <option value="">Select State...</option>
            {locationData.map((l, idx) => (
              <option key={`state-${l.state}-${idx}`} value={l.state}>{l.state}</option>
            ))}
          </select>
          <select
            value={selectedDistrict}
            onChange={handleDistrictChange}
            disabled={!selectedState || availableDistricts.length === 0}
            className="h-8 w-full border border-blue-300 rounded-lg px-2 text-xs focus:border-blue-500 focus:outline-none bg-white disabled:opacity-50"
          >
            <option value="">Select District...</option>
            {availableDistricts.map((d, idx) => (
              <option key={`district-${d}-${idx}`} value={d}>{d}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};


const BulkLocationSelector = ({ locationData, bulkCity, setBulkCity, resetKey }) => {
  const parseCity = (cityStr) => {
    if (!cityStr) return { state: "", district: "" };
    const parts = cityStr.split(",").map(s => s.trim());
    return { state: parts[0] || "", district: parts[1] || "" };
  };

  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [showEdit, setShowEdit] = useState(false);

  // Reset internal state whenever resetKey changes (triggered after bulk apply / clear)
  useEffect(() => {
    setShowEdit(false);
    setSelectedState("");
    setSelectedDistrict("");
  }, [resetKey]);

  const availableDistricts = locationData.find(l => l.state === selectedState)?.cities || [];

  const handleStateChange = (e) => {
    setSelectedState(e.target.value);
    setSelectedDistrict("");
  };

  const handleDistrictChange = (e) => {
    const district = e.target.value;
    setSelectedDistrict(district);
    if (selectedState && district) {
      setBulkCity(`${selectedState}, ${district}`);
    }
  };

  const handleToggle = (checked) => {
    setShowEdit(checked);
    if (!checked) {
      setSelectedState("");
      setSelectedDistrict("");
      setBulkCity("");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label className="flex items-center gap-1.5 cursor-pointer">
        <span className="text-sm text-gray-600">Set City:</span>
        <ToggleSwitch
          checked={showEdit}
          onChange={handleToggle}
          colorOn="bg-blue-500"
          colorOff="bg-gray-300"
          size="sm"
        />
      </label>
      {showEdit && (
        <div className="flex gap-1">
          <select
            value={selectedState}
            onChange={handleStateChange}
            className="h-8 rounded-lg border border-blue-300 px-2 text-xs focus:border-blue-500 focus:outline-none bg-white"
          >
            <option value="">Select State...</option>
            {locationData.map((l, idx) => (
              <option key={`bstate-${l.state}-${idx}`} value={l.state}>{l.state}</option>
            ))}
          </select>
          <select
            value={selectedDistrict}
            onChange={handleDistrictChange}
            disabled={!selectedState || availableDistricts.length === 0}
            className="h-8 rounded-lg border border-blue-300 px-2 text-xs focus:border-blue-500 focus:outline-none bg-white disabled:opacity-50"
          >
            <option value="">Select District...</option>
            {availableDistricts.map((d, idx) => (
              <option key={`bdistrict-${d}-${idx}`} value={d}>{d}</option>
            ))}
          </select>
          {bulkCity && <span className="text-xs text-blue-600 self-center">{bulkCity}</span>}
        </div>
      )}
    </div>
  );
};



const FALLBACK_IMG = "/images/Truck_Image.jpg";

export default function VehicleInventory() {

  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [selectedTypeId, setSelectedTypeId] = useState("all");
  const [vehicles, setVehicles] = useState([]);
  const [allVehicles, setAllVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [editingRows, setEditingRows] = useState({});

  const [selectedRows, setSelectedRows] = useState(new Set());
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkCity, setBulkCity] = useState("");
  // ── FIX: Add bulk GPS state ───────────────────────────────────────────────
  const [bulkGps, setBulkGps] = useState(""); // "" | "Active" | "Inactive"
  const [isBulkApplying, setIsBulkApplying] = useState(false);

  const [remarksModal, setRemarksModal] = useState({
    open: false, status: "", vehicleId: null, isBulk: false, previousRemarks: "", previousStatus: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(6);

  const [carouselIndex, setCarouselIndex] = useState(0);
  const modelsPerPage = 3;

  // ── FIX: Location data from API ──────────────────────────────────────────
  const [locationData, setLocationData] = useState([]); // [{state, cities:[]}]
  const [otherInactiveFilter, setOtherInactiveFilter] = useState(false);
  const [bulkResetKey, setBulkResetKey] = useState(0);

  const statusOptions = AdminSelectOptionsData?.statusOptions || [];
  const [packagesMap, setPackagesMap] = useState({}); // { vehicleTypeId: perDayRentalCost }
  //TO PROTECT THE ROUTE
  useAuthGuard();

  // const totalVehicles  = allVehicles.length;
  // const availableCount = allVehicles.filter(v => v.status === "Available").length;
  // const bookedCount    = allVehicles.filter(v => v.status === "Booked").length;
  // const otherCount     = allVehicles.filter(v => !["Available", "Booked"].includes(v.status)).length;
  // // ── FIX: GPS stats ───────────────────────────────────────────────────────
  // const gpsActiveCount   = allVehicles.filter(v => v.gpsStatus === "Active").length;
  // const gpsInactiveCount = allVehicles.filter(v => v.gpsStatus !== "Active").length;

  //PACKAGES MAP FOR RENTAL COST FOR EACH VEHICLE TYPE IN VEHICLE INVENTORY
  useEffect(() => {
    fetch(`${baseUrl}/packages`)
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data) {
          // Build a map: vehicleTypeId → perDayRentalCost
          // A type may have multiple models; take the first active one or the minimum
          const map = {};
          res.data.forEach(pkg => {
            const typeId = pkg.vehicleType?._id || pkg.vehicleType;
            if (!typeId) return;
            if (!map[typeId] || pkg.perDayRentalCost < map[typeId]) {
              map[typeId] = pkg.perDayRentalCost;
            }
          });
          setPackagesMap(map);
        }
      })
      .catch(() => { });
  }, []);
  // const legendScrollRef = useRef(null);
  // const legendDrag = useRef({ active: false, startX: 0, scrollLeft: 0 });

  // const handleLegendMouseDown = (e) => {
  //   legendDrag.current = {
  //     active: true,
  //     startX: e.pageX - legendScrollRef.current.offsetLeft,
  //     scrollLeft: legendScrollRef.current.scrollLeft,
  //   };
  //   legendScrollRef.current.style.cursor = "grabbing";
  // };

  // const handleLegendMouseMove = (e) => {
  //   if (!legendDrag.current.active) return;
  //   e.preventDefault();
  //   const x = e.pageX - legendScrollRef.current.offsetLeft;
  //   const walk = x - legendDrag.current.startX;
  //   legendScrollRef.current.scrollLeft = legendDrag.current.scrollLeft - walk;
  // };

  // const handleLegendMouseUp = () => {
  //   legendDrag.current.active = false;
  //   if (legendScrollRef.current) legendScrollRef.current.style.cursor = "grab";
  // };

  // const scrollLegend = (dir) => {
  //   legendScrollRef.current?.scrollBy({ left: dir * 220, behavior: "smooth" });
  // };


  const [legendPage, setLegendPage] = useState(0);
  const legendContainerRef = useRef(null);
  const [legendPerPage, setLegendPerPage] = useState(6);

  // Calculate how many pills fit based on container width
  useEffect(() => {
    const calculate = () => {
      if (!legendContainerRef.current) return;
      const containerWidth = legendContainerRef.current.offsetWidth;
      // Each pill ~130px avg + 8px gap, reserve 20px buffer
      const pillWidth = 138;
      const fits = Math.max(1, Math.floor(containerWidth / pillWidth));
      setLegendPerPage(fits);
      setLegendPage(0); // reset to first page on resize
    };
    calculate();
    window.addEventListener("resize", calculate);
    return () => window.removeEventListener("resize", calculate);
  }, []);

  const legendItems = AdminSelectOptionsData.statusLegend;
  const totalLegendPages = Math.ceil(legendItems.length / legendPerPage);
  const visibleLegendItems = legendItems.slice(
    legendPage * legendPerPage,
    legendPage * legendPerPage + legendPerPage
  );
  const canLegendPrev = legendPage > 0;
  const canLegendNext = legendPage + 1 < totalLegendPages;


  // Stats cards reflect the currently selected type (vehicles), not all types
  const totalVehicles = vehicles.length;
  const availableCount = vehicles.filter(v => v.status === "Available").length;
  const bookedCount = vehicles.filter(v => v.status === "Booked").length;
  const otherCount = vehicles.filter(v => !["Available", "Booked"].includes(v.status)).length;
  const gpsActiveCount = vehicles.filter(v => v.gpsStatus === "Active").length;
  const gpsInactiveCount = vehicles.filter(v => v.gpsStatus !== "Active").length;

  // const filteredVehicles = vehicles.filter(vehicle => {
  //   const q = searchQuery.toLowerCase().trim();
  //   const matchesSearch = !q || [
  //     vehicle.registrationNumber, vehicle.vehicleId, vehicle.status,
  //     vehicle.remarks, vehicle.city, vehicle.modelName,
  //   ].some(field => (field || "").toLowerCase().includes(q));
  //   const matchesCity   = cityFilter === "all" || vehicle.city === cityFilter;
  //   const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter;
  //   return matchesSearch && matchesCity && matchesStatus;
  // });


  const filteredVehicles = vehicles.filter(vehicle => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || [
      vehicle.registrationNumber, vehicle.vehicleId, vehicle.status,
      vehicle.remarks, vehicle.city, vehicle.modelName,
    ].some(field => (field || "").toLowerCase().includes(q));
    const matchesCity = cityFilter === "all" || vehicle.city === cityFilter;
    const matchesStatus = otherInactiveFilter
      ? !["Available", "Booked"].includes(vehicle.status)
      : statusFilter === "all" || vehicle.status === statusFilter;
    return matchesSearch && matchesCity && matchesStatus;
  });


  const totalPages = Math.ceil(filteredVehicles.length / rowsPerPage);
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentVehicles = filteredVehicles.slice(indexOfFirstItem, indexOfLastItem);
  const allPageIds = currentVehicles.map(v => v.id);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, cityFilter, statusFilter, rowsPerPage, selectedTypeId, otherInactiveFilter]);
  useEffect(() => { setSelectedRows(new Set()); }, [currentPage, selectedTypeId]);

  const flattenVehicles = (groups) => {
    const flat = [];
    groups.forEach(group => {
      const groupId = group._id;
      const vehicleTypeId = group.basicInfo?.vehicleType;
      const modelName = group.basicInfo?.vehicleName || "Unknown Model";
      const techSpecs = group.techSpecs || {};
      const mediaFiles = group.mediaFiles || {};
      if (group.registrationVehicles?.length) {
        group.registrationVehicles.forEach(reg => {
          const screenSize = techSpecs.leftRightScreenWidth && techSpecs.leftRightScreenHeight
            ? `${techSpecs.leftRightScreenWidth} x ${techSpecs.leftRightScreenHeight} ft`
            : techSpecs.numberOfScreens ? `${techSpecs.numberOfScreens} Side LED` : "N/A";
          flat.push({
            id: `${groupId}_${reg.registrationNumber}`,
            groupId,
            registrationNumber: reg.registrationNumber,
            vehicleId: reg.vehicleId,
            city: reg.city || "",
            modelConfig: reg.modelConfig || techSpecs.screenType || "3 Side LED",
            screenSize,
            // ── FIX: read gpsEnabled boolean directly from reg, convert to string label
            gpsStatus: reg.gpsEnabled === true ? "Active" : "Inactive",
            status: reg.statusAvailability?.currentStatus || "Waiting for Status",
            remarks: reg.statusAvailability?.remarks || "",
            lastUpdated: formatDate(reg.updatedAt || group.updatedAt),
            modelName, techSpecs, mediaFiles,
            mainImage: mediaFiles.frontViewImage || FALLBACK_IMG,
            rawReg: reg,
            vehicleTypeId,
          });
        });
      }
    });
    return flat;
  };

  const fetchAllVehicles = async () => {
    setLoadingAll(true);
    try {
      const res = await fetch(`${baseUrl}/api/getNewVehicles`);
      const data = await res.json();
      if (data.success) setAllVehicles(flattenVehicles(data.data));
      else toast.error(data.message || "Failed to fetch all vehicles", { position: "bottom-right", autoClose: 3000 });
    } catch (err) {
      console.error(err);
      toast.error("Error loading all vehicles", { position: "bottom-right", autoClose: 3000 });
    } finally {
      setLoadingAll(false);
    }
  };

  const fetchVehicleTypes = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/vehicle-types`);
      const data = await res.json();
      if (data.success) setVehicleTypes(data.data || []);
      else toast.error("Failed to load vehicle types", { position: "bottom-right", autoClose: 3000 });
    } catch (err) {
      console.error(err);
      toast.error("Error loading vehicle types", { position: "bottom-right", autoClose: 3000 });
    }
  };

  // Fetch location data — actual API shape:
  // { success, data: { locations: [ { _id, cities: [], "Tamil Nadu": [...], ... } ] } }
  // The single document has state names as dynamic keys; cities:[] is a legacy field to skip.
  const fetchLocationData = async () => {
    try {
      const res = await fetch(`${baseUrl}/locations`);
      const data = await res.json();
      if (data.success && data.data?.locations?.length) {
        const raw = data.data.locations[0]; // single doc with state names as keys
        const SKIP_KEYS = new Set(["_id", "cities", "__v", "createdAt", "updatedAt"]);
        const parsed = Object.entries(raw)
          .filter(([key]) => !SKIP_KEYS.has(key))
          .map(([state, cities]) => ({ state, cities: Array.isArray(cities) ? cities : [] }))
          .sort((a, b) => a.state.localeCompare(b.state));
        setLocationData(parsed);
      }
    } catch (err) {
      console.error("Error loading location data:", err);
    }
  };

  const fetchVehiclesByType = async (typeId) => {
    setLoading(true);
    try {
      const url = (!typeId || typeId === "all")
        ? `${baseUrl}/api/getNewVehicles`
        : `${baseUrl}/api/getNewVehicles?vehicleType=${typeId}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setVehicles(flattenVehicles(data.data));
      else { toast.error(data.message || "Failed to fetch vehicles", { position: "bottom-right", autoClose: 3000 }); setVehicles([]); }
    } catch (err) {
      console.error(err);
      toast.error("Error loading vehicles", { position: "bottom-right", autoClose: 3000 });
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

const updateRegistrationVehicleRaw = async (groupId, registrationNumber, updatePayload) => {
  try {
    const cleanReg = registrationNumber.replace(/\s/g, "");
    const url = `${baseUrl}/api/updateRegistrationVehicle/${groupId}/${encodeURIComponent(cleanReg)}`;
    
    // If status is Unavailable, Maintenance, or Damaged, clear booking fields
    if (updatePayload.currentStatus && 
        ["Unavailable", "Maintenance", "Damaged"].includes(updatePayload.currentStatus)) {
      updatePayload.fromDate = null;
      updatePayload.toDate = null;
      updatePayload.orderId = null;
      updatePayload.orderDisplayId = null;
    }
    
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatePayload),
    });
    const data = await res.json();
    return data.success;
  } catch (err) {
    console.error(err);
    return false;
  }
};

  const updateRegistrationVehicle = async (groupId, registrationNumber, updatePayload) => {
    const ok = await updateRegistrationVehicleRaw(groupId, registrationNumber, updatePayload);
    if (ok) {
      await fetchVehiclesByType(selectedTypeId);
      await fetchAllVehicles();
      return true;
    } else {
      toast.error("Update failed");
      return false;
    }
  };

  const deleteRegistrationVehicle = async (groupId, registrationNumber) => {
    try {
      const cleanReg = registrationNumber.replace(/\s/g, "");
      const res = await fetch(
        `${baseUrl}/api/deleteRegistrationVehicle/${groupId}/${encodeURIComponent(cleanReg)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Vehicle deleted successfully", { position: "bottom-right", autoClose: 3000 });
        await fetchVehiclesByType(selectedTypeId);
        await fetchAllVehicles();
        return true;
      } else { toast.error(data.message || "Deletion failed", { position: "bottom-right", autoClose: 3000 }); return false; }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting vehicle", { position: "bottom-right", autoClose: 3000 });
      return false;
    }
  };

  // ── FIX: Fetch location data on mount alongside other fetches ────────────
  useEffect(() => { fetchVehicleTypes(); fetchAllVehicles(); fetchLocationData(); }, []);
  useEffect(() => { fetchVehiclesByType(selectedTypeId); }, [selectedTypeId]);

  const handleEditField = (vehicleId, field, value) => {
    setEditingRows(prev => ({
      ...prev,
      [vehicleId]: { ...prev[vehicleId], [field]: value },
    }));
  };


  const handleStatusChange = (vehicleId, newStatus) => {
    const needsRemarks = REMARKS_REQUIRED.includes(newStatus) || REMARKS_OPTIONAL.includes(newStatus);
    const vehicle = vehicles.find(v => v.id === vehicleId);
    const oldStatus = vehicle?.status || "";
    if (needsRemarks && newStatus !== "Available") {
      setEditingRows(prev => ({
        ...prev,
        [vehicleId]: { ...prev[vehicleId], status: newStatus, remarks: "" },
      }));
      setRemarksModal({
        open: true,
        status: newStatus,
        vehicleId,
        isBulk: false,
        previousStatus: oldStatus,
        previousRemarks: oldStatus === "Booked" ? (vehicle?.remarks || "") : "",
      });
    } else {
      setEditingRows(prev => ({
        ...prev,
        [vehicleId]: { ...prev[vehicleId], status: newStatus, remarks: "" },
      }));
    }
  };

  const handleRemarksConfirm = (remarks, dates = {}) => {
    const { vehicleId, isBulk, status } = remarksModal;
    if (isBulk) {
      pendingBulkRemarksRef.current = remarks;
      setRemarksModal({ open: false, status: "", vehicleId: null, isBulk: false });
      executeBulkApply(bulkStatus, bulkCity, remarks, dates);
    } else {
      setEditingRows(prev => ({
        ...prev,
        [vehicleId]: {
          ...prev[vehicleId],
          remarks,
          fromDate: dates.fromDate || undefined,
          toDate: dates.toDate || undefined,
        },
      }));
      setRemarksModal({ open: false, status: "", vehicleId: null, isBulk: false });
    }
  };


  const pendingBulkRemarksRef = useRef("");


const handleSaveRow = async (vehicle) => {
  const updatedFields = editingRows[vehicle.id];
  if (!updatedFields) return;
  const newStatus = updatedFields.status !== undefined ? updatedFields.status : vehicle.status;
  const remarks = updatedFields.remarks !== undefined ? updatedFields.remarks : vehicle.remarks;
  const isReqRemarks = REMARKS_REQUIRED.includes(newStatus);
  if (isReqRemarks && !remarks) {
    toast.error("Please add remarks before saving.", { position: "bottom-right", autoClose: 3000 });
    return;
  }
  const payload = {};
  if (updatedFields.city !== undefined) payload.city = updatedFields.city;
  if (updatedFields.gpsStatus !== undefined) payload.gpsEnabled = updatedFields.gpsStatus === "Active";
  if (updatedFields.status !== undefined) {
    payload.currentStatus = updatedFields.status;
    payload.statusPriority = STATUS_PRIORITY[updatedFields.status] ?? 0;
    
   
    if (["Unavailable", "Maintenance", "Damaged"].includes(updatedFields.status)) {
      payload.fromDate = null;
      payload.toDate = null;
      payload.orderId = null;
      payload.orderDisplayId = null;
    }
  }
  if (updatedFields.remarks !== undefined) payload.remarks = updatedFields.remarks;

  if (updatedFields.fromDate !== undefined) payload.fromDate = updatedFields.fromDate;
  if (updatedFields.toDate !== undefined) payload.toDate = updatedFields.toDate;

  const success = await updateRegistrationVehicle(vehicle.groupId, vehicle.registrationNumber, payload);
  if (success) {
    setEditingRows(prev => { const s = { ...prev }; delete s[vehicle.id]; return s; });
    toast.success("Vehicle updated successfully!", { position: "bottom-right", autoClose: 3000 });
  }
};

  const handleDeleteVehicle = async (vehicle) => {
    if (window.confirm(`Are you sure you want to delete vehicle ${vehicle.registrationNumber}?`)) {
      await deleteRegistrationVehicle(vehicle.groupId, vehicle.registrationNumber);
    }
  };

  const isAllPageSelected = allPageIds.length > 0 && allPageIds.every(id => selectedRows.has(id));
  const isIndeterminate = selectedRows.size > 0 && !isAllPageSelected;

  const handleSelectAll = () => {
    if (isAllPageSelected) {
      setSelectedRows(prev => { const next = new Set(prev); allPageIds.forEach(id => next.delete(id)); return next; });
    } else {
      setSelectedRows(prev => { const next = new Set(prev); allPageIds.forEach(id => next.add(id)); return next; });
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };
  const handleClearSelection = () => {
    setSelectedRows(new Set());
    setBulkStatus("");
    setBulkCity("");
    setBulkGps("");
    setBulkResetKey(k => k + 1); // triggers BulkLocationSelector reset
  };

  const handleApplyToSelected = async () => {
    if (selectedRows.size === 0) { toast.warning("No vehicles selected", { position: "bottom-right", autoClose: 3000 }); return; }
    // ── FIX: include bulkGps in the "something selected" check
    if (!bulkStatus && !bulkCity && !bulkGps) { toast.warning("Select a status, city, or GPS to apply", { position: "bottom-right", autoClose: 3000 }); return; }
    const needsRemarks = bulkStatus && (REMARKS_REQUIRED.includes(bulkStatus) || REMARKS_OPTIONAL.includes(bulkStatus));
    if (needsRemarks && bulkStatus !== "Available") {
      setRemarksModal({ open: true, status: bulkStatus, vehicleId: null, isBulk: true });
      return;
    }
    await executeBulkApply(bulkStatus, bulkCity, "");
  };

  // ── FIX: executeBulkApply now also handles GPS ───────────────────────────

const executeBulkApply = async (status, city, remarks, dates = {}) => {
  setIsBulkApplying(true);
  const selectedVehicles = vehicles.filter(v => selectedRows.has(v.id));
  let successCount = 0;
  for (const vehicle of selectedVehicles) {
    const payload = {};
    if (status) {
      payload.currentStatus = status;
      payload.statusPriority = STATUS_PRIORITY[status] ?? 0;
      
      // Clear booking fields for these statuses
      if (["Unavailable", "Maintenance", "Damaged"].includes(status)) {
        payload.fromDate = null;
        payload.toDate = null;
        payload.orderId = null;
        payload.orderDisplayId = null;
      }
    }
    if (city) payload.city = city;
    if (remarks) payload.remarks = remarks;
    else if (status === "Available") payload.remarks = "";
    if (bulkGps) payload.gpsEnabled = bulkGps === "Active";

    if (status === "Booked" && dates.fromDate) payload.fromDate = dates.fromDate;
    if (status === "Booked" && dates.toDate) payload.toDate = dates.toDate;

    const ok = await updateRegistrationVehicleRaw(vehicle.groupId, vehicle.registrationNumber, payload);
    if (ok) successCount++;
  }
  await fetchVehiclesByType(selectedTypeId);
  await fetchAllVehicles();
  toast.success(`${successCount}/${selectedVehicles.length} vehicles updated`, { position: "bottom-right", autoClose: 3000 });
  setSelectedRows(new Set());
  setBulkStatus("");
  setBulkCity("");
  setBulkGps("");
  setIsBulkApplying(false);
  setBulkResetKey(k => k + 1);
};

  const goToPage = (page) => { if (page >= 1 && page <= totalPages) setCurrentPage(page); };
  const handleRowsPerPageChange = (e) => { setRowsPerPage(parseInt(e.target.value)); setCurrentPage(1); };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pageNumbers.push(i);
        pageNumbers.push("..."); pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1); pageNumbers.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pageNumbers.push(i);
      } else {
        pageNumbers.push(1); pageNumbers.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pageNumbers.push(i);
        pageNumbers.push("..."); pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  };

  const totalModelGroups = Math.ceil(vehicleTypes.length / modelsPerPage);
  const visibleModels = vehicleTypes.slice(carouselIndex * modelsPerPage, (carouselIndex + 1) * modelsPerPage);
  const nextCarousel = () => { if (carouselIndex + 1 < totalModelGroups) setCarouselIndex(carouselIndex + 1); };
  const prevCarousel = () => { if (carouselIndex - 1 >= 0) setCarouselIndex(carouselIndex - 1); };

  return (
    <div className="min-h-screen bg-gray-50 px-1 md:px-0 lg:px-0 py-0 p-1 mx-0 my-0 max-w-none md:p-0">
      <ToastContainer position="bottom-right" autoClose={3000} />

      <RemarksModal
        isOpen={remarksModal.open}
        onClose={() => setRemarksModal({ open: false, status: "", vehicleId: null, isBulk: false, previousRemarks: "", previousStatus: "" })}
        onConfirm={handleRemarksConfirm}
        status={remarksModal.status}
        vehicleLabel={remarksModal.vehicleId
          ? vehicles.find(v => v.id === remarksModal.vehicleId)?.registrationNumber
          : null}
        isBulk={remarksModal.isBulk}
        previousRemarks={remarksModal.previousRemarks}
        previousStatus={remarksModal.previousStatus}
      />

      <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
        <span className="font-medium">Inventory</span>
        <span>/</span>
        <span className="text-gray-900">Vehicle Availability</span>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg"><Truck className="w-6 h-6 text-blue-700" /></div>
          <div>
            <p className="text-sm text-gray-500">Total Vehicles</p>
            <p className="text-2xl font-bold">{totalVehicles}</p>
            <p className="text-xs text-gray-400">All Onboarded Vehicles</p>
          </div>
        </div>
        {/* <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg"><CheckCircle2 className="w-6 h-6 text-green-700" /></div>
          <div>
            <p className="text-sm text-gray-500">Available</p> */}
        <div
          onClick={() => { setStatusFilter(statusFilter === "Available" ? "all" : "Available"); setOtherInactiveFilter(false); }}
          className={`bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 cursor-pointer transition border-2 ${statusFilter === "Available" ? "border-green-500 bg-green-50" : "border-transparent"}`}
        >
          <div className="p-3 bg-green-100 rounded-lg"><CheckCircle2 className="w-6 h-6 text-green-700" /></div>
          <div>
            <p className="text-sm text-gray-500">Available</p>
            <p className="text-2xl font-bold">{availableCount}</p>
            <p className="text-xs text-green-600">{totalVehicles ? ((availableCount / totalVehicles) * 100).toFixed(2) : 0}% of total</p>
          </div>
        </div>
        {/* <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
          <div className="p-3 bg-orange-100 rounded-lg"><PlayCircle className="w-6 h-6 text-orange-600" /></div>
          <div>
            <p className="text-sm text-gray-500">Other / Inactive</p> */}
        <div
          onClick={() => {
            setOtherInactiveFilter(prev => !prev);
            setStatusFilter("all"); // clear normal status filter when toggling this
          }}
          className={`bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 cursor-pointer transition border-2 ${otherInactiveFilter ? "border-orange-500 bg-orange-50" : "border-transparent"}`}
        >
          <div className="p-3 bg-orange-100 rounded-lg"><PlayCircle className="w-6 h-6 text-orange-600" /></div>
          <div>
            <p className="text-sm text-gray-500">Other / Inactive</p>
            <p className="text-2xl font-bold">{otherCount}</p>
            <p className="text-xs text-orange-600">{totalVehicles ? ((otherCount / totalVehicles) * 100).toFixed(2) : 0}% of total</p>
          </div>
        </div>
        {/* <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
          <div className="p-3 bg-red-100 rounded-lg"><Calendar className="w-6 h-6 text-red-600" /></div>
          <div>
            <p className="text-sm text-gray-500">Booked</p> */}
        <div
          onClick={() => { setStatusFilter(statusFilter === "Booked" ? "all" : "Booked"); setOtherInactiveFilter(false); }}
          className={`bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 cursor-pointer transition border-2 ${statusFilter === "Booked" ? "border-red-500 bg-red-50" : "border-transparent"}`}
        >
          <div className="p-3 bg-red-100 rounded-lg"><Calendar className="w-6 h-6 text-red-600" /></div>
          <div>
            <p className="text-sm text-gray-500">Booked</p>
            <p className="text-2xl font-bold">{bookedCount}</p>
            <p className="text-xs text-red-600">{totalVehicles ? ((bookedCount / totalVehicles) * 100).toFixed(2) : 0}% of total</p>
          </div>
        </div>
      </div>

      {/* ── Filter Section ── */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <h3 className="font-semibold text-gray-800 mb-4">Filter Inventory</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Model / Type</label>
            <select
              value={selectedTypeId}
              onChange={e => setSelectedTypeId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Models</option>
              {vehicleTypes.map(type => (
                <option key={type._id} value={type._id}>{type.typeName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Status</option>
              {statusOptions.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search vehicles</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by reg no, vehicle ID, status, city, remarks..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
          <div style={{ textAlign: "center", alignContent: "center" }}>
            <button
              type="button"
              // onClick={() => { setSearchQuery(""); setCityFilter("all"); setStatusFilter("all"); }}
              onClick={() => { setSearchQuery(""); setCityFilter("all"); setStatusFilter("all"); setSelectedTypeId("all"); setOtherInactiveFilter(false); }}
              className="text-sm text-blue-600 hover:underline"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Table + Quick Guidance ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        <div className="xl:col-span-9 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Mapped Vehicle Model Summary</h3>
              <p className="text-sm text-gray-500 mt-1">
                Update GPS, location, status and remarks inline. Bulk-select vehicles to apply changes to multiple at once.
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={isAllPageSelected}
                    ref={el => { if (el) el.indeterminate = isIndeterminate; }}
                    onChange={handleSelectAll} className="w-4 h-4 accent-red-500 cursor-pointer" />
                  <span className="text-sm text-gray-600">
                    {selectedRows.size > 0 ? `${selectedRows.size} selected` : "0 selected"}
                  </span>
                </label>
                <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-sm focus:border-blue-500 focus:outline-none">
                  <option value="">Set Status</option>
                  {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {/* ── FIX: Bulk GPS select ─────────────────────────────────────── */}
                {/* <select value={bulkGps} onChange={e => setBulkGps(e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-sm focus:border-blue-500 focus:outline-none">
                  <option value="">Set GPS</option>
                  <option value="Active">GPS Enable</option>
                  <option value="Inactive">GPS Disable</option>
                </select> */}



                {/* Bulk GPS toggle */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 bg-white">
                  <span className="text-sm text-gray-600">GPS:</span>
                  <ToggleSwitch
                    checked={bulkGps === "Active"}
                    // onChange={checked => setBulkGps(checked ? "Active" : checked === false && bulkGps === "Active" ? "Inactive" : "")}
                    onChange={checked => {
                      if (bulkGps === "") setBulkGps("Active");
                      else if (bulkGps === "Active") setBulkGps("Inactive");
                      else setBulkGps("");
                    }}
                    colorOn="bg-green-500"
                    colorOff="bg-gray-300"
                    size="sm"
                  />
                  <span className={`text-xs font-medium ${bulkGps === "Active" ? "text-green-600" : bulkGps === "Inactive" ? "text-red-400" : "text-gray-400"}`}>
                    {bulkGps === "Active" ? "Enable" : bulkGps === "Inactive" ? "Disable" : "—"}
                  </span>
                  {bulkGps && (
                    <button type="button" onClick={() => setBulkGps("")} className="text-gray-400 hover:text-gray-600 text-xs leading-none ml-1">×</button>
                  )}
                </div>

                {/* Bulk City cascading selector */}
                <BulkLocationSelector
                  locationData={locationData}
                  bulkCity={bulkCity}
                  setBulkCity={setBulkCity}
                  resetKey={bulkResetKey}

                />


                <button onClick={handleApplyToSelected}
                  disabled={isBulkApplying || selectedRows.size === 0}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${selectedRows.size > 0 ? "bg-red-500 text-white hover:bg-red-600" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}>
                  {isBulkApplying ? "Applying..." : "Apply to Selected"}
                </button>
                {selectedRows.size > 0 && (
                  <button onClick={handleClearSelection} className="ml-auto text-sm text-blue-600 hover:underline flex items-center gap-1">
                    <X size={14} /> Clear Selection
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto max-h-[480px]">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-3 text-left">
                      <input type="checkbox" checked={isAllPageSelected}
                        ref={el => { if (el) el.indeterminate = isIndeterminate; }}
                        onChange={handleSelectAll} className="w-4 h-4 accent-red-500 cursor-pointer" />
                    </th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Registration Number ↕</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Vehicle ID ↕</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">City / Current Location</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-600">GPS</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-600">Status</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-600">Remarks</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Last Updated</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-600 whitespace-nowrap">Save Row</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-500">Loading vehicles...</td></tr>
                  ) : currentVehicles.length === 0 ? (
                    <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-500">No vehicles match the filters.</td></tr>
                  ) : (
                    currentVehicles.map(vehicle => {
                      const isEditing = editingRows[vehicle.id] || {};
                      const isSelected = selectedRows.has(vehicle.id);
                      const currentStatus = isEditing.status !== undefined ? isEditing.status : vehicle.status;
                      const currentRemarks = isEditing.remarks !== undefined ? isEditing.remarks : vehicle.remarks;
                      // ── FIX: GPS checked state reads from editingRows OR vehicle.gpsStatus ──
                      const currentGps = isEditing.gpsStatus !== undefined ? isEditing.gpsStatus : vehicle.gpsStatus;
                      const isGpsActive = currentGps === "Active";
                      return (
                        <tr key={vehicle.id} className={`hover:bg-gray-50 transition align-middle ${isSelected ? "bg-red-50" : ""}`}>
                          <td className="px-3 py-3">
                            <input type="checkbox" checked={isSelected} onChange={() => handleSelectRow(vehicle.id)} className="w-4 h-4 accent-red-500 cursor-pointer" />
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <img src={vehicle.mainImage} alt="vehicle"
                                className="w-12 h-12 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                                onError={e => { e.target.onerror = null; e.target.src = FALLBACK_IMG; }} />
                              <div>
                                <div className="font-semibold text-blue-700 text-xs whitespace-nowrap">{vehicle.registrationNumber}</div>
                                <div className="text-xs text-gray-400 mt-0.5">{vehicle.modelName}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-gray-600 text-xs">{vehicle.vehicleId}</td>

                          {/* ── FIX: Replaced plain select with LocationSelector component ── */}
                          <td className="px-2 py-3">
                            <LocationSelector
                              vehicle={vehicle}
                              editingRows={editingRows}
                              handleEditField={handleEditField}
                              locationData={locationData}
                            />
                          </td>

                          {/* GPS — fully controlled native toggle */}
                          <td className="px-2 py-3">
                            <div className="flex flex-col items-start gap-1">
                              <ToggleSwitch
                                checked={isGpsActive}
                                onChange={checked => handleEditField(vehicle.id, "gpsStatus", checked ? "Active" : "Inactive")}
                                colorOn="bg-green-500"
                                colorOff="bg-gray-300"
                              />
                              <span className={`text-xs font-medium ${isGpsActive ? "text-green-600" : "text-gray-400"}`}>
                                {isGpsActive ? "On" : "Off"}
                              </span>
                            </div>
                          </td>

                          <td className="px-2 py-3 min-w-[170px]">
                            <select value={currentStatus} onChange={e => handleStatusChange(vehicle.id, e.target.value)}
                              className="h-9 w-full border border-gray-200 rounded-lg px-2 text-xs focus:border-blue-500 focus:outline-none bg-white">
                              {statusOptions.map(s => (
                                <option
                                  key={s}
                                  value={s}
                                  disabled={currentStatus === "Booked" && BOOKED_LOCK_STATUSES.includes(s)}
                                >
                                  {s}
                                </option>
                              ))}
                            </select>
                            <div className="mt-1"><StatusBadge status={currentStatus} /></div>
                          </td>
                          <td className="px-2 py-3 min-w-[130px]">
                            <input type="text" value={currentRemarks}
                              onChange={e => handleEditField(vehicle.id, "remarks", e.target.value)}
                              placeholder={REMARKS_REQUIRED.includes(currentStatus) ? "Required..." : "Optional..."}
                              className={`w-full border rounded px-2 py-1 text-xs focus:border-blue-400 ${REMARKS_REQUIRED.includes(currentStatus) && !currentRemarks ? "border-red-300 bg-red-50" : "border-gray-200"}`}
                            />
                            {REMARKS_REQUIRED.includes(currentStatus) && !currentRemarks && (
                              <p className="text-xs text-red-500 mt-0.5">Required</p>
                            )}
                          </td>
                          <td className="px-2 py-3 text-gray-500 text-xs whitespace-nowrap">{vehicle.lastUpdated}</td>
                          <td className="px-3 py-4">
                            <div className="flex justify-center gap-2">
                              <button onClick={() => handleSaveRow(vehicle)}
                                className="w-9 h-9 rounded-lg border border-red-200 bg-red-50 flex items-center justify-center hover:bg-red-100" title="Save Changes">
                                <Save size={16} className="text-red-600" />
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

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-5 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                Showing {filteredVehicles.length > 0 ? indexOfFirstItem + 1 : 0} –{" "}
                {Math.min(indexOfLastItem, filteredVehicles.length)} of {filteredVehicles.length} vehicles
              </div>
              <div className="flex gap-1 items-center">
                <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}
                  className={`px-2 py-1 rounded ${currentPage === 1 ? "text-gray-300 cursor-not-allowed bg-gray-100 w-9 h-9 rounded-lg" : "w-9 h-9 rounded-lg text-gray-700 bg-gray-100"}`}>&lt;</button>
                {getPageNumbers().map((page, idx) => (
                  <button key={idx} onClick={() => typeof page === "number" && goToPage(page)}
                    className={`px-2 py-1 rounded ${currentPage === page ? "w-9 h-9 rounded-lg bg-red-500 text-white flex items-center justify-center" : "w-9 h-9 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                    disabled={typeof page !== "number"}>{page}</button>
                ))}
                <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}
                  className={`px-2 py-1 rounded ${currentPage === totalPages || totalPages === 0 ? "text-gray-300 cursor-not-allowed w-9 h-9 rounded-lg bg-gray-100" : "text-gray-700 hover:bg-gray-100 w-9 h-9 rounded-lg bg-gray-100"}`}>&gt;</button>
              </div>
              <select value={rowsPerPage} onChange={handleRowsPerPageChange}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:border-blue-500 focus:outline-none">
                <option value={6}>6 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-5 mb-6 flex flex-col justify-between">
          <div className="flex justify-between">
            <div>Quick Guidance</div>
            <div className="w-[30px] h-[30px] bg-[rgb(237,163,163)] rounded-full text-center flex items-center justify-center">
              <i className="fa-regular fa-lightbulb" style={{ color: "rgb(237, 7, 7)" }}></i>
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
            <div><CheckCircle2 className="w-6 h-6 text-green-700" /></div>
            <div className="text-green-700">
              <div>One model. All vehicles.</div>
              <div>Update everything in one place.</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Inventory Summary by Model ── */}
      {/* ── Inventory Summary by Model ── */}
      {/* ── Inventory Summary by Model ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-12 bg-white rounded-xl shadow-sm p-5 mb-6">
          <div className="font-semibold mb-4 flex justify-between items-center">
            <span>Inventory Summary by Model</span>
            {vehicleTypes.length > modelsPerPage && (
              <div className="flex gap-2">
                <button onClick={prevCarousel} disabled={carouselIndex === 0}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-30">‹</button>
                <button onClick={nextCarousel} disabled={carouselIndex + 1 >= totalModelGroups}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-30">›</button>
              </div>
            )}
          </div>

          <div className="flex justify-around gap-4 overflow-hidden">
            {visibleModels.map(type => {
              const typeVehicles = allVehicles.filter(v => v.vehicleTypeId === type._id);
              const total = typeVehicles.length;

              // Named counts
              const avail = typeVehicles.filter(v => v.status === "Available").length;
              const booked = typeVehicles.filter(v => v.status === "Booked").length;

              // Everything except Available and Booked → Others
              const others = typeVehicles.filter(
                v => v.status !== "Available" && v.status !== "Booked"
              ).length;

              // Breakdown of "others" for tooltip — group by status
              const otherBreakdown = typeVehicles
                .filter(v => v.status !== "Available" && v.status !== "Booked")
                .reduce((acc, v) => {
                  const s = v.status || "Unknown";
                  acc[s] = (acc[s] || 0) + 1;
                  return acc;
                }, {});

              const gpsOn = typeVehicles.filter(v => v.gpsStatus === "Active").length;
              const gpsOff = typeVehicles.filter(v => v.gpsStatus !== "Active").length;
              const typeImg = typeVehicles[0]?.mainImage || FALLBACK_IMG;
              const perDay = packagesMap[type._id?.toString()];

              return (
                <div key={type._id} className="flex gap-5 pr-2.5 min-w-[250px]">
                  {/* Left: image + total */}
                  <div className="text-center">
                    <img
                      src={typeImg}
                      className="w-[60px] h-[60px] rounded-lg object-cover"
                      alt="vehicle"
                      onError={e => { e.target.onerror = null; e.target.src = FALLBACK_IMG; }}
                    />
                    <div className="text-xs text-gray-500 mt-1">Total</div>
                    <div className="font-semibold text-xl">{total}</div>
                  </div>

                  {/* Right: name + cost + counts */}
                  <div className="flex-1">
                    <div className="font-medium text-sm leading-tight">{type.typeName}</div>

                    {/* Per-day cost */}
                    {perDay !== undefined ? (
                      <div className="text-xs font-semibold text-green-700 bg-green-50 border border-green-100
                                rounded px-2 py-0.5 inline-block mt-0.5 mb-1.5">
                        ₹{perDay.toLocaleString("en-IN")}/day
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400 mb-1.5">No package</div>
                    )}

                    <div className="text-xs text-gray-400 mb-0.5">Counts</div>

                    {/* Available */}
                    <div className="flex justify-between gap-2.5 text-sm">
                      <div className="flex items-center gap-1">
                        <i className="fa-solid fa-circle" style={{ color: "#22c55e", fontSize: "9px" }} />
                        Available
                      </div>
                      <div className="font-medium">{avail}</div>
                    </div>

                    {/* Booked */}
                    <div className="flex justify-between gap-2.5 text-sm">
                      <div className="flex items-center gap-1">
                        <i className="fa-solid fa-circle" style={{ color: "#ef4444", fontSize: "9px" }} />
                        Booked
                      </div>
                      <div className="font-medium">{booked}</div>
                    </div>

                    {/* Others — with hover tooltip showing breakdown */}
                    <div className="flex justify-between gap-2.5 text-sm relative group">
                      <div className="flex items-center gap-1">
                        <i className="fa-solid fa-circle" style={{ color: "#9ca3af", fontSize: "9px" }} />
                        <span className="cursor-help ">Others</span>
                      </div>
                      <div className="font-medium text-gray-500">{others}</div>

                      {/* Breakdown tooltip — only shows if others > 0 */}
                      {others > 0 && (
                        <div className="absolute bottom-full left-0 mb-1.5 z-20 hidden group-hover:block
                                  bg-white border border-gray-200 rounded-lg shadow-lg p-2.5 min-w-[160px]">
                          <div className="text-xs font-semibold text-gray-600 mb-1.5">Other statuses</div>
                          {Object.entries(otherBreakdown).map(([status, count]) => {
                            const STATUS_COLORS = {
                              "Waiting for Status": "#9ca3af",
                              "Maintenance": "#eab308",
                              "Running": "#f97316",
                              "Allotted": "#ef4444",
                              "On Road": "#3b82f6",
                              "Unavailable": "#dc2626",
                              "Waiting for Branding": "#f59e0b",
                              "Customization Pending": "#d97706",
                              "Damaged": "#7f1d1d",
                            };
                            return (
                              <div key={status} className="flex justify-between items-center gap-3 text-xs py-0.5">
                                <div className="flex items-center gap-1">
                                  <i className="fa-solid fa-circle"
                                    style={{ color: STATUS_COLORS[status] || "#9ca3af", fontSize: "8px" }} />
                                  <span className="text-gray-700">{status}</span>
                                </div>
                                <span className="font-medium text-gray-800">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* GPS divider */}
                    <div className="flex justify-between gap-2.5 text-sm mt-1 pt-1 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        <Wifi className="inline w-3 h-3 text-green-500" /> GPS On
                      </div>
                      <div className="text-green-600 font-medium">{gpsOn}</div>
                    </div>
                    <div className="flex justify-between gap-2.5 text-sm">
                      <div className="flex items-center gap-1">
                        <WifiOff className="inline w-3 h-3 text-gray-400" /> GPS Off
                      </div>
                      <div className="text-gray-400">{gpsOff}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Status Legend right card ── */}
        {/* <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-5 mb-6">
    <div className="font-semibold text-sm mb-2">Status Legend</div>
    <div className="flex flex-col gap-1.5 text-xs">
      {[
        { color: "#9ca3af", label: "Waiting for Status",    desc: "Newly onboarded"        },
        { color: "#22c55e", label: "Available",             desc: "Ready to book"           },
        { color: "#f97316", label: "Running",               desc: "Running campaign"        },
        { color: "#ef4444", label: "Allotted",              desc: "Booked, not started"     },
        { color: "#eab308", label: "Maintenance",           desc: "Not available"           },
        { color: "#3b82f6", label: "On Road",               desc: "In transit"              },
        { color: "#dc2626", label: "Unavailable",           desc: "Marked unavailable"      },
        { color: "#f59e0b", label: "Waiting for Branding",  desc: "Pending branding"        },
        { color: "#d97706", label: "Customization Pending", desc: "Pending customization"   },
        { color: "#7f1d1d", label: "Damaged",               desc: "Out of service"          },
      ].map(({ color, label, desc }) => (
        <div key={label} className="flex justify-between items-center gap-1">
          <div className="flex items-center gap-1">
            <i className="fa-solid fa-circle" style={{ color, fontSize: "8px" }} />
            <span className="text-gray-700">{label}</span>
          </div>
          <span className="text-gray-400 text-right">{desc}</span>
        </div>
      ))}
      <div className="mt-1.5 pt-1.5 border-t border-gray-100 font-semibold">GPS</div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1"><Wifi className="w-3 h-3 text-green-500" /> GPS On</div>
        <div className="text-green-600">Tracking active</div>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1"><WifiOff className="w-3 h-3 text-gray-400" /> GPS Off</div>
        <div className="text-gray-400">No tracking</div>
      </div>
    </div>
  </div> */}
      </div>

      {/* <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="font-semibold">Status Legend</div>
          <div className="rounded px-2 py-1 bg-gray-50 text-gray-700 border border-gray-100"><i className="fa-solid fa-circle" style={{ color: "#9ca3af", fontSize: "10px" }}></i> Waiting for Status</div>
          <div className="rounded px-2 py-1 bg-green-50 text-green-700 border border-green-100"><i className="fa-solid fa-circle" style={{ color: "#22c55e", fontSize: "10px" }}></i> Available</div>
          <div className="rounded px-2 py-1 bg-orange-50 text-orange-700 border border-orange-100"><i className="fa-solid fa-circle" style={{ color: "#f97316", fontSize: "10px" }}></i> Running</div>
          <div className="rounded px-2 py-1 bg-red-50 text-red-700 border border-red-100"><i className="fa-solid fa-circle" style={{ color: "#ef4444", fontSize: "10px" }}></i> Allotted</div>
          <div className="rounded px-2 py-1 bg-yellow-50 text-yellow-700 border border-yellow-100"><i className="fa-solid fa-circle" style={{ color: "#eab308", fontSize: "10px" }}></i> Maintenance</div>
          <div className="rounded px-2 py-1 bg-blue-50 text-blue-700 border border-blue-100"><i className="fa-solid fa-circle" style={{ color: "#3b82f6", fontSize: "10px" }}></i> On Road</div>
          <div className="rounded px-2 py-1 bg-red-50 text-red-700 border border-red-100"><i className="fa-solid fa-circle" style={{ color: "#dc2626", fontSize: "10px" }}></i> Unavailable</div>
          <div className="rounded px-2 py-1 bg-yellow-50 text-yellow-700 border border-yellow-100"><i className="fa-solid fa-circle" style={{ color: "#f59e0b", fontSize: "10px" }}></i> Waiting for Branding</div>
          <div className="rounded px-2 py-1 bg-yellow-50 text-yellow-700 border border-yellow-100"><i className="fa-solid fa-circle" style={{ color: "#f59e0b", fontSize: "10px" }}></i> Customization Pending</div>
        </div>
      </div> */}
      {/* ── Status Legend – Scrollable Carousel ── */}
      {/* <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
  <div className="flex items-center gap-3">
    <div className="font-semibold whitespace-nowrap">Status Legend</div>
    <div
      className="flex gap-2 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing select-none"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      onMouseDown={(e) => {
        const el = e.currentTarget;
        el.isDragging = true;
        el.startX = e.pageX - el.offsetLeft;
        el.scrollLeft0 = el.scrollLeft;
      }}
      onMouseMove={(e) => {
        const el = e.currentTarget;
        if (!el.isDragging) return;
        e.preventDefault();
        const x = e.pageX - el.offsetLeft;
        el.scrollLeft = el.scrollLeft0 - (x - el.startX);
      }}
      onMouseUp={(e) => { e.currentTarget.isDragging = false; }}
      onMouseLeave={(e) => { e.currentTarget.isDragging = false; }}
    >
      {[
        { label: "Waiting for Status", color: "#9ca3af", bg: "bg-gray-50",   text: "text-gray-700",   border: "border-gray-100"  },
        { label: "Available",          color: "#22c55e", bg: "bg-green-50",  text: "text-green-700",  border: "border-green-100" },
        { label: "Running",            color: "#f97316", bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-100"},
        { label: "Allotted",           color: "#ef4444", bg: "bg-red-50",    text: "text-red-700",    border: "border-red-100"   },
        { label: "Maintenance",        color: "#eab308", bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-100"},
        { label: "On Road",            color: "#3b82f6", bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-100"  },
        { label: "Unavailable",        color: "#dc2626", bg: "bg-red-50",    text: "text-red-700",    border: "border-red-100"   },
        { label: "Waiting for Branding",   color: "#f59e0b", bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-100"},
        { label: "Customization Pending",  color: "#f59e0b", bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-100"},
        
      ].map(({ label, color, bg, text, border }) => (
        <div key={label}
          className={`rounded px-2 py-1 ${bg} ${text} border ${border} whitespace-nowrap text-sm flex items-center gap-1`}>
          <i className="fa-solid fa-circle" style={{ color, fontSize: "9px" }} />
          {label}
        </div>
      ))}
    </div>
  </div>
</div> */}

      {/* ── Status Legend ── */}
      {/* ── Status Legend – Proper fit-based carousel ── */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <div className="flex items-center gap-3">

          <div className="font-semibold whitespace-nowrap flex-shrink-0">Status Legend</div>

          {/* Left arrow — only shown when needed */}
          <button
            onClick={() => setLegendPage(p => Math.max(0, p - 1))}
            disabled={!canLegendPrev}
            className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200
                 disabled:opacity-30 disabled:cursor-default flex items-center
                 justify-center flex-shrink-0 text-sm transition-opacity"
          >‹</button>

          {/* Pills container — measured for auto-fit */}
          <div
            ref={legendContainerRef}
            className="flex flex-1 gap-2  overflow-hidden" style={{ justifyContent: 'space-around' }}
          >
            {visibleLegendItems.map(({ label, color, bg, text, border }) => (
              <div
                key={label}
                className={`rounded px-2 py-1 ${bg} ${text} border ${border}
                      whitespace-nowrap text-sm flex items-center gap-1 flex-shrink-0`}
              >
                <i className="fa-solid fa-circle" style={{ color, fontSize: "10px" }} />
                {label}
              </div>
            ))}
          </div>

          {/* Page indicator + right arrow */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {totalLegendPages > 1 && (
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {legendPage + 1} / {totalLegendPages}
              </span>
            )}
            <button
              onClick={() => setLegendPage(p => Math.min(totalLegendPages - 1, p + 1))}
              disabled={!canLegendNext}
              className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200
                   disabled:opacity-30 disabled:cursor-default flex items-center
                   justify-center flex-shrink-0 text-sm transition-opacity"
            >›</button>
          </div>

        </div>

        {/* Dot indicators — only when more than 1 page */}
        {totalLegendPages > 1 && (
          <div className="flex gap-1.5 mt-2.5 justify-center">
            {Array.from({ length: totalLegendPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setLegendPage(i)}
                className={`rounded-full transition-all ${i === legendPage
                  ? "w-4 h-1.5 bg-gray-500"
                  : "w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400"
                  }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}