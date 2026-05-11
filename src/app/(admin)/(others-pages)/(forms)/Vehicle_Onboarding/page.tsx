// //PERFECT CODE FOR STORING IMAGES AND PREVIEWS AND LAST STEP SUBMISSION ALL ARE PERFECT
// /* eslint-disable */
// // @ts-nocheck

// "use client";

// import React, { useState, useEffect, useCallback } from "react";
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import Label from "@/components/form/Label";
// import Input from "@/components/form/input/InputField";
// import Select from "@/components/form/Select";
// import { ChevronDownIcon, PlusIcon } from "@/icons";
// import Switch from "@/components/form/switch/Switch";
// import axios from "axios";
// import { baseUrl } from '../../../../../BaseUrl';
// import { NotebookPen, Trash2, Calendar, Upload, X, Eye } from 'lucide-react';

// // ─── Inline Textarea ───────────────────────────────────────────────────────────
// const Textarea = ({ rows = 3, placeholder, value, onChange, className = "", disabled = false }) => (
//   <textarea
//     rows={rows}
//     className={`w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white disabled:bg-gray-100 disabled:cursor-not-allowed dark:disabled:bg-gray-800 ${className}`}
//     placeholder={placeholder}
//     value={value}
//     onChange={onChange}
//     disabled={disabled}
//   />
// );

// // ─── Date Input with Calendar Icon ───────────────────────────────────────────
// const DateInput = ({ value, onChange, placeholder, disabled = false, required = false }) => {
//   return (
//     <div className="relative">
//       <Input
//         type="date"
//         value={value}
//         onChange={onChange}
//         placeholder={placeholder}
//         disabled={disabled}
//         className={`${disabled ? 'bg-gray-100 dark:bg-gray-800' : ''} pr-10`}
//       />
//       <span className="absolute text-gray-400 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-500">
//         <Calendar size={16} />
//       </span>
//       {required && value && <span className="absolute text-green-500 right-3 top-1/2 -translate-y-1/2">✓</span>}
//     </div>
//   );
// };

// // ─── Image/Video Preview Component ───────────────────────────────────────────
// const MediaPreviewCard = ({ label, file, previewUrl, onUpload, onRemove, icon, accept }) => {
//   const [showPreview, setShowPreview] = useState(false);
  
//   const getPreviewContent = () => {
//     if (previewUrl) {
//       if (accept === "video/*") {
//         return (
//           <video 
//             src={previewUrl} 
//             className="w-full h-32 object-cover rounded-lg"
//             controls={showPreview}
//           />
//         );
//       } else {
//         return (
//           <img 
//             src={previewUrl} 
//             alt={label}
//             className="w-full h-32 object-cover rounded-lg"
//           />
//         );
//       }
//     }
//     return (
//       <div className="w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
//         <span className="text-4xl">{icon}</span>
//       </div>
//     );
//   };

//   return (
//     <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-200">
//       <div className="relative group">
//         {/* Preview */}
//         <div className="mb-3">
//           {getPreviewContent()}
//         </div>
        
//         {/* File Info */}
//         {file && (
//           <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 truncate">
//             {file.name}
//           </div>
//         )}
        
//         {/* Action Buttons */}
//         <div className="flex gap-2 justify-center mt-3">
//           <label className="cursor-pointer">
//             <span className="inline-flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors">
//               <Upload size={12} />
//               Upload
//             </span>
//             <input 
//               type="file" 
//               className="hidden" 
//               accept={accept}
//               onChange={(e) => {
//                 const selectedFile = e.target.files?.[0];
//                 if (selectedFile) {
//                   onUpload(selectedFile);
//                 }
//               }} 
//             />
//           </label>
          
//           {(previewUrl || file) && (
//             <>
//               <button
//                 type="button"
//                 onClick={() => setShowPreview(!showPreview)}
//                 className="inline-flex items-center gap-1 text-xs bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg transition-colors"
//               >
//                 <Eye size={12} />
//                 {showPreview ? "Hide" : "Preview"}
//               </button>
              
//               <button
//                 type="button"
//                 onClick={onRemove}
//                 className="inline-flex items-center gap-1 text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-colors"
//               >
//                 <X size={12} />
//                 Remove
//               </button>
//             </>
//           )}
//         </div>
//       </div>
//       <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-2">{label}</p>
//     </div>
//   );
// };

// // ─── Stepper Header ─────────────────────────────────────────────────────────
// const StepperHeader = ({ steps, currentStep, onStepClick, canAccessStep6 }) => {
//   return (
//     <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-6 px-6 py-4 overflow-x-auto">
//       <div className="flex items-center min-w-max gap-0">
//         {steps.map((step, idx) => {
//           const isCompleted = currentStep > step.number;
//           const isActive = currentStep === step.number;
//           const isDisabled = step.number === 6 && !canAccessStep6;
          
//           return (
//             <React.Fragment key={step.number}>
//               <button
//                 type="button"
//                 onClick={() => !isDisabled && onStepClick(step.number)}
//                 className="flex items-center gap-2 group focus:outline-none"
//                 disabled={isDisabled}
//               >
//                 <div
//                   className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all duration-200 flex-shrink-0 ${
//                     isCompleted
//                       ? "bg-blue-600 text-white"
//                       : isActive
//                       ? "bg-blue-600 text-white ring-4 ring-blue-100"
//                       : isDisabled
//                       ? "bg-gray-300 text-gray-400 cursor-not-allowed dark:bg-gray-700"
//                       : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
//                   }`}
//                 >
//                   {isCompleted ? (
//                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
//                       <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
//                     </svg>
//                   ) : (
//                     step.number
//                   )}
//                 </div>
//                 <span
//                   className={`text-sm font-medium whitespace-nowrap transition-colors ${
//                     isActive
//                       ? "text-blue-600 dark:text-blue-400"
//                       : isCompleted
//                       ? "text-blue-500 dark:text-blue-400"
//                       : isDisabled
//                       ? "text-gray-400 cursor-not-allowed"
//                       : "text-gray-400 dark:text-gray-500"
//                   }`}
//                 >
//                   {step.title}
//                 </span>
//               </button>
//               {idx < steps.length - 1 && (
//                 <div className="flex items-center mx-2 flex-shrink-0">
//                   <div
//                     className={`h-0.5 w-10 rounded transition-colors duration-300 ${
//                       currentStep > step.number ? "bg-blue-400" : "bg-gray-200 dark:bg-gray-700"
//                     }`}
//                   />
//                 </div>
//               )}
//             </React.Fragment>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// // ─── Section Card Header ────────────────────────────────────────────
// const SectionHeader = ({ number, title, icon }) => (
//   <div className="flex items-center gap-3 mb-6">
//     <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-600 text-white text-sm font-bold shadow-md">
//       {number}
//     </div>
//     <div>
//       <h2 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
//         {icon && <span className="mr-2">{icon}</span>}
//         {title}
//       </h2>
//     </div>
//   </div>
// );

// // ─── Status Badge ─────────────────────────────────────────────────────────────
// const StatusBadge = ({ status }) => {
//   const styles = {
//     Available: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
//     Unavailable: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
//   };
//   return (
//     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.Available}`}>
//       {status}
//     </span>
//   );
// };

// // ─── Validation helpers ───────────────────────────────────────────────────────
// const isValidRegistrationNumber = (regNumber) => {
//   if (!regNumber || regNumber.trim() === "") return false;
//   const clean = regNumber.replace(/\s/g, "");
//   if (clean.length !== 10) return false;
//   return /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/.test(clean);
// };

// const formatRegistrationNumber = (regNumber) => {
//   if (!regNumber) return "";
//   const clean = regNumber.replace(/\s/g, "").toUpperCase();
//   if (clean.length !== 10) return regNumber;
//   return `${clean.slice(0,2)} ${clean.slice(2,4)} ${clean.slice(4,6)} ${clean.slice(6,10)}`;
// };

// const unformatRegistrationNumber = (regNumber) => {
//   if (!regNumber) return "";
//   return regNumber.replace(/\s/g, "").toUpperCase();
// };

// // ─── Vehicle Type Management Modal ───────────────────────────────────────────
// const VehicleTypeModal = ({ isOpen, onClose, onSave, onUpdate, onDelete, editingType, vehicleTypes, setEditingType }) => {
//   const [typeName, setTypeName] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showAddForm, setShowAddForm] = useState(false);

//   useEffect(() => {
//     if (editingType) {
//       setTypeName(editingType.typeName);
//       setShowAddForm(true);
//     } else {
//       setTypeName("");
//     }
//   }, [editingType, isOpen]);

//   const handleSubmit = async () => {
//     if (!typeName.trim()) {
//       toast.error("Please enter vehicle type name", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//       return;
//     }
//     setLoading(true);
//     try {
//       if (editingType) {
//         await onUpdate(editingType._id, typeName);
//         setEditingType(null);
//       } else {
//         await onSave(typeName);
//       }
//       setTypeName("");
//       setShowAddForm(false);
//       onClose();
//     } catch (error) {
//       console.error("Error saving vehicle type:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to permanently delete this vehicle type?")) {
//       setLoading(true);
//       try {
//         await onDelete(id);
//         onClose();
//       } catch (error) {
//         console.error("Error deleting vehicle type:", error);
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
//       style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
//     >
//       <div className="bg-white rounded-xl w-full max-w-2xl mx-4 my-8 dark:bg-gray-800 shadow-2xl">
//         <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
//           <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
//             📋 Manage Vehicle Types
//           </h3>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-2xl leading-none"
//           >
//             ×
//           </button>
//         </div>

//         <div className="p-6">
//           <button
//             onClick={() => setShowAddForm(!showAddForm)}
//             className="flex items-center gap-2 mb-4 text-blue-600 hover:text-blue-700"
//           >
//             <PlusIcon className="w-4 h-4" />
//             Add New Vehicle Type
//           </button>

//           {showAddForm && (
//             <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
//               <Label>Vehicle Type Name</Label>
//               <div className="flex gap-2 mt-2">
//                 <Input
//                   type="text"
//                   placeholder="e.g., Standard, Premium, Deluxe"
//                   value={typeName}
//                   onChange={(e) => setTypeName(e.target.value)}
//                   className="flex-1"
//                 />
//                 <button
//                   onClick={handleSubmit}
//                   disabled={loading}
//                   className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                 >
//                   {loading ? "Saving..." : editingType ? "Update" : "Add"}
//                 </button>
//               </div>
//             </div>
//           )}

//           <div className="mt-4">
//             <Label>Existing Vehicle Types</Label>
//             <div className="mt-2 space-y-2 max-h-80 overflow-y-auto">
//               {vehicleTypes.map((type) => (
//                 <div key={type._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
//                   <span className="text-gray-800 dark:text-white">{type.typeName}</span>
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => {
//                         setEditingType(type);
//                         setTypeName(type.typeName);
//                         setShowAddForm(true);
//                       }}
//                       className="text-blue-500 hover:text-blue-700"
//                     >
//                       <NotebookPen size={16} />
//                     </button>
//                     <button
//                       onClick={() => handleDelete(type._id)}
//                       className="text-red-500 hover:text-red-700"
//                     >
//                       <Trash2 size={16} />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ─── Add Vehicle Modal ───────────────────────────────────────────────────────
// const AddVehicleModal = ({ isOpen, onClose, onSave, editingVehicle, existingRegNumbers, onCheckDuplicate }) => {
//   const [formData, setFormData] = useState({
//     registrationNumber: "",
//     vehicleId: "", 
//     city: "",
//     permitType: "",
//     modelConfig: "",
//     ownershipType: "",
//     fuelType: "",
//     manufacturingYear: "",
//     gpsEnabled: true,
//     activeStatus: true,
//     currentStatus: "Available",
//     availableFrom: "",
//     remarks: "",
//     driverName: "",
//     driverPhone: "",
//     backupDriver: "",
//     backupDriverPhone: "",
//     driverCharges: "",
//     lastServiceDate: "",
//     insuranceExpiryDate: "",
//     pollutionExpiryDate: "",
//   });
  
//   const [registrationError, setRegistrationError] = useState("");
//   const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [isGeneratingId, setIsGeneratingId] = useState(false);

//   const generateVehicleIdFromBackend = async () => {
//     setIsGeneratingId(true);
//     try {
//       const response = await axios.get(`${baseUrl}/api/generate-vehicle-id`);
//       if (response.data.success) {
//         return response.data.vehicleId;
//       }
//     } catch (error) {
//       console.error("Error generating vehicle ID:", error);
//       const now = new Date();
//       const day = String(now.getDate()).padStart(2, '0');
//       const month = String(now.getMonth() + 1).padStart(2, '0');
//       const year = String(now.getFullYear()).slice(-2);
//       const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
//       return `${day}${month}${year}${random}`;
//     } finally {
//       setIsGeneratingId(false);
//     }
//   };

//   useEffect(() => {
//     if (!editingVehicle && isOpen) {
//       const generateId = async () => {
//         const newVehicleId = await generateVehicleIdFromBackend();
//         setFormData(prev => ({ ...prev, vehicleId: newVehicleId }));
//       };
//       generateId();
//     }
//   }, [isOpen, editingVehicle]);

//   useEffect(() => {
//     if (editingVehicle) {
//       setFormData({
//         registrationNumber: formatRegistrationNumber(editingVehicle.registrationNumber) || "",
//         vehicleId: editingVehicle.vehicleId || "",
//         city: editingVehicle.city || "",
//         permitType: editingVehicle.permitType || "",
//         modelConfig: editingVehicle.modelConfig || "",
//         ownershipType: editingVehicle.ownershipType || "",
//         fuelType: editingVehicle.fuelType || "",
//         manufacturingYear: editingVehicle.manufacturingYear || "",
//         gpsEnabled: editingVehicle.gpsEnabled !== undefined ? editingVehicle.gpsEnabled : true,
//         activeStatus: editingVehicle.activeStatus !== undefined ? editingVehicle.activeStatus : true,
//         currentStatus: editingVehicle.currentStatus || "Available",
//         availableFrom: editingVehicle.availableFrom || "",
//         remarks: editingVehicle.remarks || "",
//         driverName: editingVehicle.driverName || "",
//         driverPhone: editingVehicle.driverPhone || "",
//         backupDriver: editingVehicle.backupDriver || "",
//         backupDriverPhone: editingVehicle.backupDriverPhone || "",
//         driverCharges: editingVehicle.driverCharges || "",
//         lastServiceDate: editingVehicle.lastServiceDate || "",
//         insuranceExpiryDate: editingVehicle.insuranceExpiryDate || "",
//         pollutionExpiryDate: editingVehicle.pollutionExpiryDate || "",
//       });
//     } else {
//       setFormData({
//         registrationNumber: "",
//         vehicleId: "",
//         city: "",
//         permitType: "",
//         modelConfig: "",
//         ownershipType: "",
//         fuelType: "",
//         manufacturingYear: "",
//         gpsEnabled: true,
//         activeStatus: true,
//         currentStatus: "Available",
//         availableFrom: "",
//         remarks: "",
//         driverName: "",
//         driverPhone: "",
//         backupDriver: "",
//         backupDriverPhone: "",
//         driverCharges: "",
//         lastServiceDate: "",
//         insuranceExpiryDate: "",
//         pollutionExpiryDate: "",
//       });
//     }
//     setRegistrationError("");
//   }, [editingVehicle, isOpen]);

//   const checkDuplicateRealTime = useCallback(async (value) => {
//     const cleanValue = unformatRegistrationNumber(value);
//     if (cleanValue.length === 10 && isValidRegistrationNumber(value)) {
//       setIsCheckingDuplicate(true);
//       try {
//         const isDuplicate = await onCheckDuplicate(cleanValue);
//         if (isDuplicate && !editingVehicle) {
//           setRegistrationError("This registration number already exists");
//         } else {
//           setRegistrationError("");
//         }
//       } catch (error) {
//         console.error("Duplicate check error:", error);
//       } finally {
//         setIsCheckingDuplicate(false);
//       }
//     } else {
//       setRegistrationError("");
//     }
//   }, [editingVehicle, onCheckDuplicate]);

//   const handleRegNumberChange = (value) => {
//     let cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
//     let validated = "";
//     let pos = 0;
//     for (let i = 0; i < cleaned.length && pos < 10; i++) {
//       const char = cleaned[i];
//       if (pos < 2 && /[A-Z]/.test(char)) { validated += char; pos++; }
//       else if (pos >= 2 && pos < 4 && /[0-9]/.test(char)) { validated += char; pos++; }
//       else if (pos >= 4 && pos < 6 && /[A-Z]/.test(char)) { validated += char; pos++; }
//       else if (pos >= 6 && pos < 10 && /[0-9]/.test(char)) { validated += char; pos++; }
//     }
//     let formatted = validated.slice(0, 2);
//     if (validated.length > 2) formatted += " " + validated.slice(2, 4);
//     if (validated.length > 4) formatted += " " + validated.slice(4, 6);
//     if (validated.length > 6) formatted += " " + validated.slice(6, 10);
    
//     setFormData((prev) => ({ ...prev, registrationNumber: formatted }));
    
//     const clean = unformatRegistrationNumber(formatted);
//     if (clean.length === 10 && isValidRegistrationNumber(formatted)) {
//       checkDuplicateRealTime(formatted);
//     } else if (clean.length > 0 && clean.length < 10) {
//       setRegistrationError(`Need ${10 - clean.length} more character(s)`);
//     } else if (clean.length === 10 && !isValidRegistrationNumber(formatted)) {
//       setRegistrationError("Invalid format. Use: XX NN XX NNNN");
//     } else {
//       setRegistrationError("");
//     }
//   };

//   const handleSubmit = async () => {
//     const cleanReg = unformatRegistrationNumber(formData.registrationNumber);
//     if (!cleanReg || cleanReg.length !== 10 || !isValidRegistrationNumber(formData.registrationNumber)) {
//       toast.error("Please enter a valid registration number", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//       return;
//     }
//     if (!formData.city) { toast.error("City is required", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             }); return; }
//     if (!formData.permitType) { toast.error("Permit Type is required", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             }); return; }
//     if (!formData.modelConfig) { toast.error("Model Configuration is required", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             }); return; }
//     if (!formData.ownershipType) { toast.error("Ownership Type is required", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             }); return; }
//     if (!formData.fuelType) { toast.error("Fuel Type is required"); return; }
    
//     if (formData.currentStatus === "Unavailable" && !formData.availableFrom) {
//       toast.error("Please provide Available From date for Unavailable status", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//       return;
//     }
//     if (formData.currentStatus === "Unavailable" && !formData.remarks) {
//       toast.error("Please provide remarks for Unavailable status", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//       return;
//     }
    
//     const isDuplicate = await onCheckDuplicate(cleanReg);
//     if (isDuplicate && !editingVehicle) {
//       toast.error("This registration number already exists", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//       return;
//     }
    
//     setLoading(true);
//     try {
//       onSave({ ...formData, registrationNumber: cleanReg });
//       onClose();
//     } catch (error) {
//       console.error("Error saving vehicle:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   const selectOptions = {
//     cityOptions: [
//       { value: "Chennai", label: "Chennai" },
//       { value: "Madurai", label: "Madurai" },
//       { value: "Coimbatore", label: "Coimbatore" },
//     ],
//     permitOptions: [
//       { value: "Local", label: "Local" },
//       { value: "State", label: "State" },
//       { value: "National", label: "National" },
//     ],
//     modelOptions: [
//       { value: "Standard", label: "Standard" },
//       { value: "Premium", label: "Premium" },
//       { value: "Deluxe", label: "Deluxe" },
//     ],
//     ownershipOptions: [
//       { value: "Owned", label: "Owned" },
//       { value: "Leased", label: "Leased" },
//       { value: "Rented", label: "Rented" },
//     ],
//     fuelTypeOptions: [
//       { value: "Petrol", label: "Petrol" },
//       { value: "Diesel", label: "Diesel" },
//       { value: "CNG", label: "CNG" },
//       { value: "Electric", label: "Electric" },
//     ],
//     currentStatusOptions: [
//       { value: "Available", label: "Available" },
//       { value: "Unavailable", label: "Unavailable" }
//     ],
//   };

//   const showUnavailableFields = formData.currentStatus === "Unavailable";

//   return (
//     <div
//       className="fixed inset-0 z-99999 flex items-center justify-center overflow-y-auto"
//       style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
//     >
//       <div className="bg-white rounded-xl w-full max-w-4xl mx-4 my-8 dark:bg-gray-800 shadow-2xl">
//         <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
//           <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
//             🚚 {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
//           </h3>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-2xl leading-none"
//           >
//             ×
//           </button>
//         </div>

//         <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
//           <div className="space-y-6">
//             <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
//               <Label>🔢 Registration Number <span className="text-red-500">*</span></Label>
//               <div className="relative">
//                 <Input
//                   type="text"
//                   value={formData.registrationNumber}
//                   onChange={(e) => handleRegNumberChange(e.target.value)}
//                   placeholder="TN 01 AB 1234"
//                   maxLength={13}
//                   className={registrationError ? "border-red-500" : ""}
//                 />
//                 {isCheckingDuplicate && (
//                   <span className="absolute right-3 top-1/2 -translate-y-1/2">
//                     <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//                   </span>
//                 )}
//               </div>
//               {registrationError && (
//                 <p className="mt-1 text-xs text-red-500">{registrationError}</p>
//               )}
//               {!registrationError &&
//                 formData.registrationNumber &&
//                 isValidRegistrationNumber(formData.registrationNumber) && (
//                   <p className="mt-1 text-xs text-green-500">✓ Valid registration number</p>
//                 )}
//             </div>

//             <div>
//               <Label>🆔 Vehicle ID <span className="text-red-500">*</span></Label>
//               <div className="relative">
//                 <Input
//                   type="text"
//                   value={formData.vehicleId || (isGeneratingId ? "Generating..." : "")}
//                   placeholder="Auto generated"
//                   disabled
//                   className={`bg-gray-100 dark:bg-gray-800 cursor-not-allowed ${
//                     isGeneratingId ? 'animate-pulse' : ''
//                   }`}
//                 />
//                 {isGeneratingId && (
//                   <div className="absolute right-3 top-1/2 -translate-y-1/2">
//                     <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//                   </div>
//                 )}
//               </div>
//               <p className="mt-1 text-xs text-gray-400">
//                 {formData.vehicleId 
//                   ? `Vehicle ID: ${formData.vehicleId}` 
//                   : "Vehicle ID will be auto-generated"}
//               </p>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//               <div>
//                 <Label>🏙️ City / Operating Location <span className="text-red-500">*</span></Label>
//                 <div className="relative">
//                   <Select
//                     options={selectOptions.cityOptions}
//                     placeholder="Select City"
//                     value={formData.city}
//                     onChange={(value) => setFormData((prev) => ({ ...prev, city: value }))}
//                   />
//                   <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                     <ChevronDownIcon />
//                   </span>
//                 </div>
//               </div>

//               <div>
//                 <Label>📋 Permit Type </Label>
//                 <div className="relative">
//                   <Select
//                     options={selectOptions.permitOptions}
//                     placeholder="Select Permit"
//                     value={formData.permitType}
//                     onChange={(value) => setFormData((prev) => ({ ...prev, permitType: value }))}
//                   />
//                   <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                     <ChevronDownIcon />
//                   </span>
//                 </div>
//               </div>

//               <div>
//                 <Label>⚙️ Model / Configuration </Label>
//                 <div className="relative">
//                   <Select
//                     options={selectOptions.modelOptions}
//                     placeholder="Select Model"
//                     value={formData.modelConfig}
//                     onChange={(value) => setFormData((prev) => ({ ...prev, modelConfig: value }))}
//                   />
//                   <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                     <ChevronDownIcon />
//                   </span>
//                 </div>
//               </div>

//               <div>
//                 <Label>🏢 Ownership Type </Label>
//                 <div className="relative">
//                   <Select
//                     options={selectOptions.ownershipOptions}
//                     placeholder="Select Ownership"
//                     value={formData.ownershipType}
//                     onChange={(value) => setFormData((prev) => ({ ...prev, ownershipType: value }))}
//                   />
//                   <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                     <ChevronDownIcon />
//                   </span>
//                 </div>
//               </div>

//               <div>
//                 <Label>⛽ Fuel Type <span className="text-red-500">*</span></Label>
//                 <div className="relative">
//                   <Select
//                     options={selectOptions.fuelTypeOptions}
//                     placeholder="Select Fuel Type"
//                     value={formData.fuelType}
//                     onChange={(value) => setFormData((prev) => ({ ...prev, fuelType: value }))}
//                   />
//                   <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                     <ChevronDownIcon />
//                   </span>
//                 </div>
//               </div>

//               <div>
//                 <Label>📅 Manufacturing Year <span className="text-red-500">*</span></Label>
//                 <Input
//                   type="text"
//                   placeholder="e.g. 2023"
//                   maxLength={4}
//                   value={formData.manufacturingYear}
//                   onChange={(e) => {
//                     if (/^\d*$/.test(e.target.value)) {
//                       setFormData((prev) => ({ ...prev, manufacturingYear: e.target.value }));
//                     }
//                   }}
//                 />
//               </div>
//             </div>

//             <div className="border-t pt-6 mt-2">
//               <Label className="text-base font-semibold">📌 Status & Availability</Label>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
//                 <div>
//                   <Label>Current Status <span className="text-red-500">*</span></Label>
//                   <div className="relative">
//                     <Select
//                       options={selectOptions.currentStatusOptions}
//                       placeholder="Select status"
//                       value={formData.currentStatus}
//                       onChange={(value) => setFormData(prev => ({ ...prev, currentStatus: value, availableFrom: "", remarks: "" }))}
//                     />
//                     <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                       <ChevronDownIcon />
//                     </span>
//                   </div>
//                 </div>
                
//                 {showUnavailableFields && (
//                   <>
//                     <div>
//                       <Label>Available From </Label>
//                       <DateInput 
//                         value={formData.availableFrom}
//                         onChange={(e) => setFormData(prev => ({ ...prev, availableFrom: e.target.value }))}
//                       />
//                     </div>
//                     <div className="md:col-span-2">
//                       <Label>Remarks <span className="text-red-500">*</span></Label>
//                       <Textarea
//                         placeholder="Enter remarks about unavailability..."
//                         value={formData.remarks}
//                         onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
//                         rows={2}
//                       />
//                     </div>
//                   </>
//                 )}
//               </div>
//             </div>

//             <div className="flex gap-6 pt-2">
//               <div>
//                 <Label>📡 GPS Enabled <span className="text-red-500">*</span></Label>
//                 <Switch
//                   label={formData.gpsEnabled ? "Enabled" : "Disabled"}
//                   defaultChecked={formData.gpsEnabled}
//                   onChange={(checked) => setFormData((prev) => ({ ...prev, gpsEnabled: checked }))}
//                 />
//               </div>
//               <div>
//                 <Label>✅ Active Status <span className="text-red-500">*</span></Label>
//                 <Switch
//                   label={formData.activeStatus ? "Active" : "Inactive"}
//                   defaultChecked={formData.activeStatus}
//                   onChange={(checked) => setFormData((prev) => ({ ...prev, activeStatus: checked }))}
//                 />
//               </div>
//             </div>

//             <div className="border-t pt-6 mt-2">
//               <Label className="text-base font-semibold">👤 Driver Details (Optional) </Label>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
//                 <div>
//                   <Label>Driver Name</Label>
//                   <Input placeholder="Enter driver name" value={formData.driverName} onChange={(e) => setFormData(prev => ({ ...prev, driverName: e.target.value }))} />
//                 </div>
//                 <div>
//                   <Label>Driver Phone</Label>
//                   <Input placeholder="Enter 10-digit phone number" maxLength={10} value={formData.driverPhone} onChange={(e) => setFormData(prev => ({ ...prev, driverPhone: e.target.value }))} />
//                 </div>
//                 <div>
//                   <Label>Backup Driver (Optional)</Label>
//                   <Input placeholder="Enter backup driver name" value={formData.backupDriver} onChange={(e) => setFormData(prev => ({ ...prev, backupDriver: e.target.value }))} />
//                 </div>
//                 <div>
//                   <Label>Backup Driver Phone (Optional)</Label>
//                   <Input placeholder="Enter 10-digit phone number" maxLength={10} value={formData.backupDriverPhone} onChange={(e) => setFormData(prev => ({ ...prev, backupDriverPhone: e.target.value }))} />
//                 </div>
//                 <div>
//                   <Label>Driver Charges (₹) (Optional)</Label>
//                   <Input placeholder="e.g. 800" value={formData.driverCharges} onChange={(e) => setFormData(prev => ({ ...prev, driverCharges: e.target.value }))} />
//                 </div>
//               </div>
//             </div>

//             <div className="border-t pt-6 mt-2">
//               <Label className="text-base font-semibold">🔧 Maintenance Details (Optional) </Label>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
//                 <div>
//                   <Label>Last Service Date</Label>
//                   <DateInput value={formData.lastServiceDate} onChange={(e) => setFormData(prev => ({ ...prev, lastServiceDate: e.target.value }))} />
//                 </div>
//                 <div>
//                   <Label>Insurance Expiry Date</Label>
//                   <DateInput value={formData.insuranceExpiryDate} onChange={(e) => setFormData(prev => ({ ...prev, insuranceExpiryDate: e.target.value }))} />
//                 </div>
//                 <div>
//                   <Label>Pollution Expiry Date</Label>
//                   <DateInput value={formData.pollutionExpiryDate} onChange={(e) => setFormData(prev => ({ ...prev, pollutionExpiryDate: e.target.value }))} />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="flex justify-end gap-3 p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-xl">
//           <button
//             type="button"
//             onClick={onClose}
//             className="px-5 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
//           >
//             Cancel
//           </button>
//           <button
//             type="button"
//             onClick={handleSubmit}
//             disabled={loading}
//             className="px-5 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
//           >
//             {loading ? "Saving..." : editingVehicle ? "Update Vehicle" : "Add Vehicle"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ─── Maintenance Modal ───────────────────────────────────────────────────────
// const MaintenanceModal = ({ isOpen, onClose, vehicle, onSave }) => {
//   const [maintenanceData, setMaintenanceData] = useState({
//     lastServiceDate: "",
//     insuranceExpiryDate: "",
//     pollutionExpiryDate: "",
//   });
//   const [driverData, setDriverData] = useState({
//     driverName: "",
//     driverPhone: "",
//     backupDriver: "",
//     backupDriverPhone: "",
//     driverCharges: "",
//   });
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (vehicle) {
//       setMaintenanceData({
//         lastServiceDate: vehicle.lastServiceDate || "",
//         insuranceExpiryDate: vehicle.insuranceExpiryDate || "",
//         pollutionExpiryDate: vehicle.pollutionExpiryDate || "",
//       });
//       setDriverData({
//         driverName: vehicle.driverName || "",
//         driverPhone: vehicle.driverPhone || "",
//         backupDriver: vehicle.backupDriver || "",
//         backupDriverPhone: vehicle.backupDriverPhone || "",
//         driverCharges: vehicle.driverCharges || "",
//       });
//     }
//   }, [vehicle, isOpen]);

//   const handleSubmit = () => {
//     setLoading(true);
//     onSave(vehicle.registrationNumber, { ...maintenanceData, ...driverData });
//     setTimeout(() => {
//       setLoading(false);
//       onClose();
//     }, 500);
//   };

//   if (!isOpen) return null;

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
//       style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
//     >
//       <div className="bg-white rounded-xl w-full max-w-3xl mx-4 my-8 dark:bg-gray-800 shadow-2xl">
//         <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
//           <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
//             🔧 Driver & Maintenance Details: <span className="font-mono text-blue-600">{formatRegistrationNumber(vehicle?.registrationNumber)}</span>
//           </h3>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-2xl leading-none"
//           >
//             ×
//           </button>
//         </div>

//         <div className="p-6">
//           <div className="mb-6">
//             <Label className="text-base font-semibold">👤 Driver Details</Label>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
//               <div>
//                 <Label>Driver Name</Label>
//                 <Input value={driverData.driverName} onChange={(e) => setDriverData(prev => ({ ...prev, driverName: e.target.value }))} />
//               </div>
//               <div>
//                 <Label>Driver Phone</Label>
//                 <Input value={driverData.driverPhone} onChange={(e) => setDriverData(prev => ({ ...prev, driverPhone: e.target.value }))} />
//               </div>
//               <div>
//                 <Label>Backup Driver</Label>
//                 <Input value={driverData.backupDriver} onChange={(e) => setDriverData(prev => ({ ...prev, backupDriver: e.target.value }))} />
//               </div>
//               <div>
//                 <Label>Backup Driver Phone</Label>
//                 <Input value={driverData.backupDriverPhone} onChange={(e) => setDriverData(prev => ({ ...prev, backupDriverPhone: e.target.value }))} />
//               </div>
//               <div>
//                 <Label>Driver Charges (₹)</Label>
//                 <Input value={driverData.driverCharges} onChange={(e) => setDriverData(prev => ({ ...prev, driverCharges: e.target.value }))} />
//               </div>
//             </div>
//           </div>

//           <div className="border-t pt-6">
//             <Label className="text-base font-semibold">🔧 Maintenance Details</Label>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
//               <div>
//                 <Label>Last Service Date</Label>
//                 <DateInput
//                   value={maintenanceData.lastServiceDate}
//                   onChange={(e) => setMaintenanceData(prev => ({ ...prev, lastServiceDate: e.target.value }))}
//                 />
//               </div>
//               <div>
//                 <Label>Insurance Expiry Date</Label>
//                 <DateInput
//                   value={maintenanceData.insuranceExpiryDate}
//                   onChange={(e) => setMaintenanceData(prev => ({ ...prev, insuranceExpiryDate: e.target.value }))}
//                 />
//               </div>
//               <div>
//                 <Label>Pollution Certificate Expiry Date</Label>
//                 <DateInput
//                   value={maintenanceData.pollutionExpiryDate}
//                   onChange={(e) => setMaintenanceData(prev => ({ ...prev, pollutionExpiryDate: e.target.value }))}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="flex justify-end gap-3 p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-xl">
//           <button
//             type="button"
//             onClick={onClose}
//             className="px-5 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
//           >
//             Cancel
//           </button>
//           <button
//             type="button"
//             onClick={handleSubmit}
//             disabled={loading}
//             className="px-5 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
//           >
//             {loading ? "Saving..." : "Save Details"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ─── Main Component ───────────────────────────────────────────────────────────
// export default function VehicleOnboardingForm() {
//   const [vehicles, setVehicles] = useState([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
//   const [selectedVehicle, setSelectedVehicle] = useState(null);
//   const [editingVehicle, setEditingVehicle] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [currentStep, setCurrentStep] = useState(1);
//   const [vehicleTypes, setVehicleTypes] = useState([]);
//   const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
//   const [editingType, setEditingType] = useState(null);
//   const [existingRegNumbersSet, setExistingRegNumbersSet] = useState(new Set());

//   const [commonInfo, setCommonInfo] = useState({
//     customizedType: "Non-Customized",
//     vehicleType: "",
//     vehicleName: "",
//   });

//   const [techSpecs, setTechSpecs] = useState({
//     screenType: "LED Only",
//     numberOfScreens: "",
//     screenSizeWidth: "",
//     screenSizeHeight: "",
//     backScreenWidth: "",
//     backScreenHeight: "",
//     resolution: "",
//     backResolution: "",
//     brightness: "",
//     displayVersion: "",
//     // screenSizeWidth: "",
//     // screenSizeHeight: "",
//     // resolution: "",
//     soundQuality: "",
//     generatorCapacity: "",
//     additionalFeatures: "",
//   });

//   const [showMoreTech, setShowMoreTech] = useState(false);

//   const [pricing, setPricing] = useState({
//     basePriceType: "Per Day",
//     costPerDay: "",
//     overtimeCharges: "",
//     waitingCharges: "",
//     minBookingDuration: "",
//   });

//   // Media files state with preview support
//   const [mediaFiles, setMediaFiles] = useState({
//     frontViewImage: null,
//     leftSideImage: null,
//     rightSideImage: null,
//     rearViewImage: null,
//     interiorImage: null,
//     demoVideo: null,
//   });

//   const [mediaPreviews, setMediaPreviews] = useState({
//     frontViewImage: null,
//     leftSideImage: null,
//     rightSideImage: null,
//     rearViewImage: null,
//     interiorImage: null,
//     demoVideo: null,
//   });

//   const [validationErrors, setValidationErrors] = useState({});
//   const [uploadProgress, setUploadProgress] = useState(0);

//   // Handle file upload with preview
//   const handleMediaUpload = (field, file) => {
//     if (!file) return;
    
//     const isVideo = field === 'demoVideo';
//     const maxSize = isVideo ? 10 * 1024 * 1024 : 3 * 1024 * 1024;
    
//     if (file.size > maxSize) {
//       toast.error(`File size exceeds ${isVideo ? '10MB' : '3MB'} limit`, {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//       return;
//     }
    
//     const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
//     const validVideoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm'];
    
//     if (isVideo && !validVideoTypes.includes(file.type)) {
//       toast.error("Please select a valid video file", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//       return;
//     }
    
//     if (!isVideo && !validImageTypes.includes(file.type)) {
//       toast.error("Please select a valid image file", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//       return;
//     }
    
//     // Create preview URL
//     const previewUrl = URL.createObjectURL(file);
    
//     setMediaPreviews(prev => ({
//       ...prev,
//       [field]: previewUrl
//     }));
    
//     setMediaFiles(prev => ({
//       ...prev,
//       [field]: file
//     }));
//   };

//   // Handle remove media
//   const handleRemoveMedia = (field) => {
//     if (mediaPreviews[field] && mediaPreviews[field].startsWith('blob:')) {
//       URL.revokeObjectURL(mediaPreviews[field]);
//     }
//     setMediaPreviews(prev => ({ ...prev, [field]: null }));
//     setMediaFiles(prev => ({ ...prev, [field]: null }));
//   };

//   // Clean up previews on unmount
//   useEffect(() => {
//     return () => {
//       Object.values(mediaPreviews).forEach(preview => {
//         if (preview && preview.startsWith('blob:')) {
//           URL.revokeObjectURL(preview);
//         }
//       });
//     };
//   }, []);

//   const fetchExistingRegNumbers = async () => {
//     try {
//       const response = await axios.get(`${baseUrl}/api/getNewVehicles?page=1&limit=1000`);
//       if (response.data.success) {
//         const allRegNumbers = new Set();
//         response.data.data.forEach(vehicle => {
//           if (vehicle.registrationVehicles) {
//             vehicle.registrationVehicles.forEach(rv => {
//               allRegNumbers.add(rv.registrationNumber);
//             });
//           }
//         });
//         setExistingRegNumbersSet(allRegNumbers);
//       }
//     } catch (error) {
//       console.error("Error fetching existing registration numbers:", error);
//     }
//   };

//   const checkDuplicateRegistration = async (regNumber) => {
//     const cleanReg = unformatRegistrationNumber(regNumber);
//     const localDuplicate = vehicles.some(v => unformatRegistrationNumber(v.registrationNumber) === cleanReg);
//     if (localDuplicate) return true;
//     if (existingRegNumbersSet.has(cleanReg)) return true;
//     return false;
//   };

//   const fetchVehicleTypes = async () => {
//     try {
//       const response = await axios.get(`${baseUrl}/api/vehicle-types`);
//       if (response.data.success) {
//         setVehicleTypes(response.data.data);
//       }
//     } catch (error) {
//       console.error("Error fetching vehicle types:", error);
//     }
//   };

//   const fetchVehicleByType = async (typeId) => {
//     if (!typeId) return;
//     try {
//       const response = await axios.get(`${baseUrl}/api/getNewVehicles?page=1&limit=100`);
//       if (response.data.success) {
//         const matchingVehicle = response.data.data.find(v => 
//           v.basicInfo.vehicleType === typeId
//         );
//         if (matchingVehicle) {
//           setTechSpecs({
//             screenType: matchingVehicle.techSpecs?.screenType || "LED Only",
//             numberOfScreens: matchingVehicle.techSpecs?.numberOfScreens || "",
//             screenSizeWidth: matchingVehicle.techSpecs?.screenSizeWidth || "",
//             screenSizeHeight: matchingVehicle.techSpecs?.screenSizeHeight || "",
//             resolution: matchingVehicle.techSpecs?.resolution || "",
//             soundQuality: matchingVehicle.techSpecs?.soundQuality || "",
//             generatorCapacity: matchingVehicle.techSpecs?.generatorCapacity || "",
//             additionalFeatures: matchingVehicle.techSpecs?.additionalFeatures || "",
//           });
//           setPricing({
//             basePriceType: matchingVehicle.pricing?.basePriceType || "Per Day",
//             costPerDay: matchingVehicle.pricing?.costPerDay || "",
//             overtimeCharges: matchingVehicle.pricing?.overtimeCharges || "",
//             waitingCharges: matchingVehicle.pricing?.waitingCharges || "",
//             minBookingDuration: matchingVehicle.pricing?.minBookingDuration || "",
//           });
//           toast.info("Loaded existing vehicle details for this type");
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching vehicle by type:", error);
//     }
//   };

//   const createVehicleType = async (typeName) => {
//     try {
//       const response = await axios.post(`${baseUrl}/api/vehicle-types`, { typeName });
//       if (response.data.success) {
//         toast.success("Vehicle type created successfully");
//         await fetchVehicleTypes();
//         return response.data.data;
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Error creating vehicle type", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//       throw error;
//     }
//   };

//   const updateVehicleType = async (id, typeName) => {
//     try {
//       const response = await axios.put(`${baseUrl}/api/vehicle-types/${id}`, { typeName });
//       if (response.data.success) {
//         toast.success("Vehicle type updated successfully");
//         await fetchVehicleTypes();
//         return response.data.data;
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Error updating vehicle type", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//       throw error;
//     }
//   };

//   const deleteVehicleType = async (id) => {
//     try {
//       const response = await axios.delete(`${baseUrl}/api/vehicle-types/${id}`);
//       if (response.data.success) {
//         toast.success("Vehicle type deleted successfully");
//         await fetchVehicleTypes();
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Error deleting vehicle type", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//       throw error;
//     }
//   };

//   useEffect(() => {
//     fetchVehicleTypes();
//     fetchExistingRegNumbers();
//   }, []);

//   useEffect(() => {
//     if (commonInfo.vehicleType) {
//       fetchVehicleByType(commonInfo.vehicleType);
//     }
//   }, [commonInfo.vehicleType]);

//   const steps = [
//     { number: 1, title: "Basic Information" },
//     { number: 2, title: "Technical Specification" },
//     { number: 3, title: "Pricing & Charges" },
//     { number: 4, title: "Media & Description" },
//     { number: 5, title: "Drivers & Maintenance" },
//     { number: 6, title: "Vehicle Summary" },
//   ];

//   const canAccessStep6 = commonInfo.vehicleType && vehicles.length > 0 && pricing.costPerDay;

//   const handleAddVehicle = (vehicleData) => {
//     const newVehicle = {
//       registrationNumber: vehicleData.registrationNumber,
//       vehicleId: vehicleData.vehicleId,
//       city: vehicleData.city,
//       permitType: vehicleData.permitType,
//       modelConfig: vehicleData.modelConfig,
//       ownershipType: vehicleData.ownershipType,
//       fuelType: vehicleData.fuelType,
//       manufacturingYear: vehicleData.manufacturingYear,
//       gpsEnabled: vehicleData.gpsEnabled,
//       activeStatus: vehicleData.activeStatus,
//       currentStatus: vehicleData.currentStatus,
//       availableFrom: vehicleData.availableFrom,
//       remarks: vehicleData.remarks,
//       driverName: vehicleData.driverName,
//       driverPhone: vehicleData.driverPhone,
//       backupDriver: vehicleData.backupDriver,
//       backupDriverPhone: vehicleData.backupDriverPhone,
//       driverCharges: vehicleData.driverCharges,
//       lastServiceDate: vehicleData.lastServiceDate,
//       insuranceExpiryDate: vehicleData.insuranceExpiryDate,
//       pollutionExpiryDate: vehicleData.pollutionExpiryDate,
//     };

//     if (editingVehicle) {
//       setVehicles((prev) =>
//         prev.map((v) =>
//           v.registrationNumber === editingVehicle.registrationNumber ? newVehicle : v
//         )
//       );
//       toast.success("Vehicle updated successfully");
//     } else {
//       const exists = vehicles.some((v) => v.registrationNumber === vehicleData.registrationNumber);
//       if (exists) {
//         toast.error("Vehicle with this registration number already exists", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//         return;
//       }
//       setVehicles((prev) => [...prev, newVehicle]);
//       setExistingRegNumbersSet(prev => new Set([...prev, vehicleData.registrationNumber]));
//       toast.success("Vehicle added successfully");
//     }
//     setEditingVehicle(null);
//   };

//   const handleEditVehicle = (vehicle) => {
//     setEditingVehicle(vehicle);
//     setIsModalOpen(true);
//   };

//   const handleDeleteVehicle = (registrationNumber) => {
//     if (window.confirm("Are you sure you want to remove this vehicle?")) {
//       setVehicles((prev) => prev.filter((v) => v.registrationNumber !== registrationNumber));
//       toast.success("Vehicle removed successfully");
//     }
//   };

//   const handleSaveMaintenance = (registrationNumber, data) => {
//     setVehicles((prev) =>
//       prev.map((v) =>
//         v.registrationNumber === registrationNumber
//           ? { 
//               ...v, 
//               driverName: data.driverName,
//               driverPhone: data.driverPhone,
//               backupDriver: data.backupDriver,
//               backupDriverPhone: data.backupDriverPhone,
//               driverCharges: data.driverCharges,
//               lastServiceDate: data.lastServiceDate,
//               insuranceExpiryDate: data.insuranceExpiryDate,
//               pollutionExpiryDate: data.pollutionExpiryDate,
//             }
//           : v
//       )
//     );
//     toast.success(`Driver & Maintenance details saved for ${formatRegistrationNumber(registrationNumber)}`);
//   };

//   const validateForm = () => {
//     const errors = {};
//     if (!commonInfo.vehicleType) errors.vehicleType = "Vehicle Type is required";
//     if (vehicles.length === 0) errors.vehicles = "At least one vehicle is required";
//     if (!pricing.costPerDay) errors.costPerDay = "Base Cost is required";
//     setValidationErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (currentStep !== 6) {
//       return;
//     }

//     if (!validateForm()) {
//       toast.error("Please fix the validation errors before submitting", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//       return;
//     }

//     setLoading(true);
//     setUploadProgress(0);

//     try {
//       const formData = new FormData();

//       const registrationVehicles = vehicles.map(vehicle => ({
//         registrationNumber: vehicle.registrationNumber,
//         vehicleId: vehicle.vehicleId,
//         city: vehicle.city,
//         modelConfig: vehicle.modelConfig,
//         permitType: vehicle.permitType,
//         ownershipType: vehicle.ownershipType,
//         fuelType: vehicle.fuelType,
//         manufacturingYear: vehicle.manufacturingYear,
//         gpsEnabled: vehicle.gpsEnabled,
//         activeStatus: vehicle.activeStatus,
//         currentStatus: vehicle.currentStatus,
//         availableFrom: vehicle.availableFrom,
//         remarks: vehicle.remarks,
//         lastServiceDate: vehicle.lastServiceDate,
//         insuranceExpiryDate: vehicle.insuranceExpiryDate,
//         pollutionExpiryDate: vehicle.pollutionExpiryDate,
//         driverName: vehicle.driverName,
//         driverPhone: vehicle.driverPhone,
//         backupDriver: vehicle.backupDriver,
//         backupDriverPhone: vehicle.backupDriverPhone,
//         driverCharges: vehicle.driverCharges
//       }));

//       const payload = {
//         basicInfo: {
//           customizedType: commonInfo.customizedType,
//           vehicleType: commonInfo.vehicleType,
//         },
//         techSpecs: techSpecs,
//         pricing: pricing,
//         registrationVehicles: registrationVehicles,
//       };

//       formData.append('data', JSON.stringify(payload));

//       // Append media files
//       Object.keys(mediaFiles).forEach(key => {
//         if (mediaFiles[key] && mediaFiles[key] instanceof File) {
//           formData.append(key, mediaFiles[key]);
//         }
//       });

//       const response = await axios.post(`${baseUrl}/api/createVehicle`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//         onUploadProgress: (progressEvent) => {
//           const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//           setUploadProgress(percentCompleted);
//         },
//       });

//       if (response.data.success) {
//         toast.success(response.data.message);
//         // Reset form
//         setVehicles([]);
//         setCommonInfo({ customizedType: "Non-Customized", vehicleType: "", vehicleName: "" });
//         setTechSpecs({
//           screenType: "LED Only",
//           numberOfScreens: "",
//           screenSizeWidth: "",
//           screenSizeHeight: "",
//           resolution: "",
//           soundQuality: "",
//           generatorCapacity: "",
//           additionalFeatures: "",
//         });
//         setPricing({
//           basePriceType: "Per Day",
//           costPerDay: "",
//           overtimeCharges: "",
//           waitingCharges: "",
//           minBookingDuration: "",
//         });
        
//         // Reset media files and previews
//         Object.keys(mediaPreviews).forEach(key => {
//           if (mediaPreviews[key] && mediaPreviews[key].startsWith('blob:')) {
//             URL.revokeObjectURL(mediaPreviews[key]);
//           }
//         });
//         setMediaFiles({
//           frontViewImage: null,
//           leftSideImage: null,
//           rightSideImage: null,
//           rearViewImage: null,
//           interiorImage: null,
//           demoVideo: null,
//         });
//         setMediaPreviews({
//           frontViewImage: null,
//           leftSideImage: null,
//           rightSideImage: null,
//           rearViewImage: null,
//           interiorImage: null,
//           demoVideo: null,
//         });
        
//         setCurrentStep(1);
//         setUploadProgress(0);
//         fetchExistingRegNumbers();
//       }
//     } catch (error) {
//       console.error("Error submitting form:", error);
//       toast.error(error.response?.data?.message || "Error saving vehicle. Please try again.", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const mediaItems = [
//     { key: "frontViewImage", label: "Front View", icon: "📸", accept: "image/*" },
//     { key: "leftSideImage", label: "Left Side View", icon: "⬅️", accept: "image/*" },
//     { key: "rightSideImage", label: "Right Side View", icon: "➡️", accept: "image/*" },
//     { key: "rearViewImage", label: "Rear View", icon: "🔭", accept: "image/*" },
//     { key: "interiorImage", label: "Interior", icon: "🖼️", accept: "image/*" },
//     { key: "demoVideo", label: "Demo Video", icon: "🎬", accept: "video/*" },
//   ];

//   const getSelectOptions = () => ({
//     customizedVehiclesOptions: [
//       { value: "Non-Customized", label: "Non-Customized" },
//     ],
//     vehicleTypeOptions: vehicleTypes.map((vt) => ({ value: vt._id, label: vt.typeName })),
//     screenTypeOptions: [
//       { value: "LED Only", label: "LED Only" },
//       { value: "Flex Only", label: "Flex Only" },
//       { value: "Flex + LED", label: "Flex + LED" },
//     ],
//     soundQualityOptions: [
//       { value: "Standard", label: "Standard" },
//       { value: "High", label: "High" },
//       { value: "Studio", label: "Studio" },
//     ],
//     basePriceTypeOptions: [
//       { value: "Per Day", label: "Per Day" },
//       { value: "Per Hour", label: "Per Hour" },
//       { value: "Per KM", label: "Per KM" },
//     ],
//   });

//   const selectOptions = getSelectOptions();

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
//       <ToastContainer position="top-right" />

//       <div className="px-6 pt-6">
//         <div className="text-sm text-gray-500 dark:text-gray-400">
//           🏠 Dashboard &gt; Vehicle Management &gt; Onboarding
//         </div>
//       </div>

//       <div className="px-6 py-4">
//         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
//           🚌 Vehicle Onboarding Management
//         </h1>
//         <p className="text-gray-500 dark:text-gray-400 mt-1">
//           Add and manage your advertising vehicles with complete details
//         </p>
//       </div>

//       <AddVehicleModal
//         isOpen={isModalOpen}
//         onClose={() => {
//           setIsModalOpen(false);
//           setEditingVehicle(null);
//         }}
//         onSave={handleAddVehicle}
//         editingVehicle={editingVehicle}
//         existingRegNumbers={vehicles.map(v => v.registrationNumber)}
//         onCheckDuplicate={checkDuplicateRegistration}
//       />

//       <MaintenanceModal
//         isOpen={isMaintenanceModalOpen}
//         onClose={() => {
//           setIsMaintenanceModalOpen(false);
//           setSelectedVehicle(null);
//         }}
//         vehicle={selectedVehicle}
//         onSave={handleSaveMaintenance}
//       />

//       <VehicleTypeModal
//         isOpen={isTypeModalOpen}
//         onClose={() => {
//           setIsTypeModalOpen(false);
//           setEditingType(null);
//         }}
//         onSave={createVehicleType}
//         onUpdate={updateVehicleType}
//         onDelete={deleteVehicleType}
//         editingType={editingType}
//         vehicleTypes={vehicleTypes}
//         setEditingType={setEditingType}
//       />

//       <form onSubmit={handleSubmit}>
//         <div className="px-6 pb-10">
//           <StepperHeader
//             steps={steps}
//             currentStep={currentStep}
//             onStepClick={setCurrentStep}
//             canAccessStep6={canAccessStep6}
//           />

//           {currentStep === 1 && (
//             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
//               <div className="flex justify-between items-center mb-6">
//                 <SectionHeader number={1} title="Basic Information" icon="📋" />
//                 <button
//                   type="button"
//                   onClick={() => setIsTypeModalOpen(true)}
//                   className="text-sm text-blue-600 hover:text-blue-700"
//                 >
//                   Manage Vehicle Types
//                 </button>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <Label>⚙️ Customized  <span className="text-red-500">*</span></Label>
//                   <div className="relative">
//                     <Select
//                       options={selectOptions.customizedVehiclesOptions}
//                       placeholder="Select"
//                       value={commonInfo.customizedType}
//                       onChange={(value) => setCommonInfo((prev) => ({ ...prev, customizedType: value }))}
//                     />
//                     <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                       <ChevronDownIcon />
//                     </span>
//                   </div>
//                 </div>

//                 <div>
//                   <Label>🚍 Vehicle Type <span className="text-red-500">*</span></Label>
//                   <div className="relative">
//                     <Select
//                       options={selectOptions.vehicleTypeOptions}
//                       placeholder="Select Type"
//                       value={commonInfo.vehicleType}
//                       onChange={(value) => {
//                         setCommonInfo((prev) => ({ ...prev, vehicleType: value }));
//                       }}
//                     />
//                     <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                       <ChevronDownIcon />
//                     </span>
//                   </div>
//                   {validationErrors.vehicleType && (
//                     <p className="mt-1 text-xs text-red-500">{validationErrors.vehicleType}</p>
//                   )}
//                   <p className="mt-1 text-xs text-gray-400">
//                     Selecting a vehicle type will auto-fill technical specs and pricing if previously configured
//                   </p>
//                 </div>
//               </div>

//               <div className="mt-8">
//                 <Label className="text-base font-semibold">
//                   🔢 Registration Numbers <span className="text-red-500">*</span>
//                 </Label>
//                 <p className="text-sm text-gray-500 mb-4">
//                   Add one or more registration numbers (Format: XX NN XX NNNN)
//                 </p>

//                 {vehicles.length > 0 ? (
//                   <div className="overflow-x-auto border rounded-lg">
//                     <table className="w-full text-sm">
//                       <thead className="bg-gray-50 dark:bg-gray-700">
//                         <tr>
//                           <th className="px-4 py-3 text-left">Reg. Number</th>
//                           <th className="px-4 py-3 text-left">Vehicle ID</th>
//                           <th className="px-4 py-3 text-left">City</th>
//                           <th className="px-4 py-3 text-left">Permit</th>
//                           <th className="px-4 py-3 text-left">Fuel</th>
//                           <th className="px-4 py-3 text-left">Status</th>
//                           <th className="px-4 py-3 text-center">Actions</th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y">
//                         {vehicles.map((vehicle) => (
//                           <tr key={vehicle.registrationNumber} className="hover:bg-gray-50">
//                             <td className="px-4 py-3 font-mono font-semibold text-blue-700">{formatRegistrationNumber(vehicle.registrationNumber)}</td>
//                             <td className="px-4 py-3 text-sm text-gray-600">{vehicle.vehicleId}</td>
//                             <td className="px-4 py-3">{vehicle.city}</td>
//                             <td className="px-4 py-3">{vehicle.permitType}</td>
//                             <td className="px-4 py-3">{vehicle.fuelType}</td>
//                             <td className="px-4 py-3"><StatusBadge status={vehicle.currentStatus || "Available"} /></td>
//                             <td className="px-4 py-3 text-center">
//                               <div className="flex justify-center gap-3">
//                                 <button
//                                   type="button"
//                                   onClick={() => handleEditVehicle(vehicle)}
//                                   className="text-blue-500 hover:text-blue-700"
//                                   title="Edit"
//                                 >
//                                   <NotebookPen size={16} />
//                                 </button>
//                                 <button
//                                   type="button"
//                                   onClick={() => handleDeleteVehicle(vehicle.registrationNumber)}
//                                   className="text-red-500 hover:text-red-700"
//                                   title="Delete"
//                                 >
//                                   <Trash2 size={16} />
//                                 </button>
//                               </div>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 ) : (
//                   <div className="text-center py-10 border-2 border-dashed rounded-lg text-gray-400">
//                     <div className="text-4xl mb-2">🚚</div>
//                     <p>No vehicles added yet</p>
//                   </div>
//                 )}

//                 <button
//                   type="button"
//                   onClick={() => setIsModalOpen(true)}
//                   className="flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700 font-medium"
//                 >
//                   <PlusIcon className="w-4 h-4" />
//                   Add Another Vehicle
//                 </button>
//                 {validationErrors.vehicles && (
//                   <p className="mt-1 text-xs text-red-500">{validationErrors.vehicles}</p>
//                 )}
//               </div>
//             </div>
//           )}

//           {currentStep === 2 && (
//             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
//               <SectionHeader number={2} title="Technical Specifications" icon="🖥️" />

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                 <div>
//                   <Label>📺 Screen Type <span className="text-red-500">*</span></Label>
//                   <div className="relative">
//                     <Select
//                       options={selectOptions.screenTypeOptions}
//                       placeholder="LED Only"
//                       value={techSpecs.screenType}
//                       onChange={(value) => setTechSpecs((prev) => ({ ...prev, screenType: value }))}
//                     />
//                     <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                       <ChevronDownIcon />
//                     </span>
//                   </div>
//                 </div>
//                 <div>
//                   <Label>🔢 Number of Screens <span className="text-red-500">*</span></Label>
//                   <Input
//                     type="text"
//                     placeholder="e.g. 2"
//                     value={techSpecs.numberOfScreens}
//                     onChange={(e) => setTechSpecs((prev) => ({ ...prev, numberOfScreens: e.target.value }))}
//                   />
//                 </div>
//                 {/* <div>
//                   <Label>📐 Screen Size (Width) <span className="text-red-500">*</span></Label>
//                   <Input placeholder="Width (ft)" value={techSpecs.screenSizeWidth} onChange={(e) => setTechSpecs((prev) => ({ ...prev, screenSizeWidth: e.target.value }))} />
//                 </div>
//                 <div>
//                   <Label>📐 Screen Size (Height) <span className="text-red-500">*</span></Label>
//                   <Input placeholder="Height (ft)" value={techSpecs.screenSizeHeight} onChange={(e) => setTechSpecs((prev) => ({ ...prev, screenSizeHeight: e.target.value }))} />
//                 </div>
//                 <div>
//                   <Label>🖥️ Resolution <span className="text-red-500">*</span></Label>
//                   <Input placeholder="e.g. 1920x1080" value={techSpecs.resolution} onChange={(e) => setTechSpecs((prev) => ({ ...prev, resolution: e.target.value }))} />
//                 </div>
//                 <div>
//                   <Label>🎚️ Sound Quality <span className="text-red-500">*</span></Label>
//                   <div className="relative">
//                     <Select options={selectOptions.soundQualityOptions} placeholder="Select Quality" value={techSpecs.soundQuality} onChange={(value) => setTechSpecs((prev) => ({ ...prev, soundQuality: value }))} />
//                     <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                       <ChevronDownIcon />
//                     </span>
//                   </div>
//                 </div>
//                 <div>
//                   <Label>⚡ Generator Capacity <span className="text-red-500">*</span></Label>
//                   <Input placeholder="e.g. 7 KV" value={techSpecs.generatorCapacity} onChange={(e) => setTechSpecs((prev) => ({ ...prev, generatorCapacity: e.target.value }))} />
//                 </div> */}




                
//                               <div>
//                                 <Label>Left/Right Screen Size <span className="text-red-500">*</span></Label>
//                                 <div className="flex gap-2">
//                                   <Input
//                                     type="text"
//                                     value={techSpecs.screenSizeWidth}
//                                     placeholder="Width (ft)"
//                                     className="flex-1"
//                                     onChange={handleInputChange(setTechSpecs, "screenSizeWidth")}
//                                   />
//                                   <Input
//                                     type="text"
//                                     value={techSpecs.screenSizeHeight}
//                                     placeholder="Height (ft)"
//                                     className="flex-1"
//                                     onChange={handleInputChange(setTechSpecs, "screenSizeHeight")}
//                                   />
//                                 </div>
//                               </div>
                
//                               <div>
//                                 <Label>Back Screen Size <span className="text-red-500">*</span></Label>
//                                 <div className="flex gap-2">
//                                   <Input
//                                     type="text"
//                                     value={techSpecs.backScreenWidth}
//                                     placeholder="Width (ft)"
//                                     className="flex-1"
//                                     onChange={handleInputChange(setTechSpecs, "backScreenWidth")}
//                                   />
//                                   <Input
//                                     type="text"
//                                     value={techSpecs.backScreenHeight}
//                                     placeholder="Height (ft)"
//                                     className="flex-1"
//                                     onChange={handleInputChange(setTechSpecs, "backScreenHeight")}
//                                   />
//                                 </div>
//                               </div>
                
//                               <div>
//                                 <Label>Front Resolution <span className="text-red-500">*</span></Label>
//                                 <Input
//                                   type="text"
//                                   value={techSpecs.resolution}
//                                   placeholder="e.g., 1920x1080"
//                                   onChange={handleInputChange(setTechSpecs, "resolution")}
//                                 />
//                               </div>
                
//                               <div>
//                                 <Label>Back Resolution <span className="text-red-500">*</span></Label>
//                                 <Input
//                                   type="text"
//                                   value={techSpecs.backResolution}
//                                   placeholder="e.g., 480x520"
//                                   onChange={handleInputChange(setTechSpecs, "backResolution")}
//                                 />
//                               </div>
                
//                               <div>
//                                 <Label>Front Video Size <span className="text-red-500">*</span></Label>
//                                 <Input
//                                   type="text"
//                                   value={techSpecs.videoSize}
//                                   placeholder="e.g., 1920x1080 px"
//                                   onChange={handleInputChange(setTechSpecs, "videoSize")}
//                                 />
//                               </div>
                
//                               <div>
//                                 <Label>Back Video Size <span className="text-red-500">*</span></Label>
//                                 <Input
//                                   type="text"
//                                   value={techSpecs.backVideoSize}
//                                   placeholder="e.g., 480x520 px"
//                                   onChange={handleInputChange(setTechSpecs, "backVideoSize")}
//                                 />
//                               </div>
                
//                               <div>
//                                 <Label>Audio Output <span className="text-red-500">*</span></Label>
//                                 <Input
//                                   type="text"
//                                   value={techSpecs.audioOutput}
//                                   placeholder="e.g., 600 watts"
//                                   onChange={handleInputChange(setTechSpecs, "audioOutput")}
//                                 />
//                               </div>
                
//                               <div>
//                                 <Label>Generator Capacity <span className="text-red-500">*</span></Label>
//                                 <Input
//                                   type="text"
//                                   value={techSpecs.generatorCapacity}
//                                   placeholder="e.g., 7 KV"
//                                   onChange={handleInputChange(setTechSpecs, "generatorCapacity")}
//                                 />
//                               </div>
                
//                               <div>
//                                 <Label>Brightness (Nits)</Label>
//                                 <Input
//                                   type="text"
//                                   value={techSpecs.brightness}
//                                   placeholder="e.g. 5500"
//                                   onChange={handleInputChange(setTechSpecs, "brightness")}
//                                 />
//                               </div>
                
//                               <div>
//                                 <Label>Display Version / Controller <span className="text-red-500">*</span></Label>
//                                 <Input
//                                   type="text"
//                                   value={techSpecs.displayVersion}
//                                   placeholder="e.g. NovaStar A8s"
//                                   onChange={handleInputChange(setTechSpecs, "displayVersion")}
//                                 />
//                               </div> 

//                 <div className="md:col-span-2">
//                   <Label>✨ Additional Features </Label>
//                   <Input placeholder="e.g. Built-in Amplifier, USB, WiFi" value={techSpecs.additionalFeatures} onChange={(e) => setTechSpecs((prev) => ({ ...prev, additionalFeatures: e.target.value }))} />
//                 </div>
//               </div>

//               <button
//                 type="button"
//                 onClick={() => setShowMoreTech(!showMoreTech)}
//                 className="mt-6 text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
//               >
//                 {showMoreTech ? "▲" : "▼"} Show More Technical Options
//               </button>

//               {showMoreTech && (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6 pt-6 border-t">
//                   <div>
//                     <Label>🎬 Video Format</Label>
//                     <Input placeholder="e.g. MP4" />
//                   </div>
//                   <div>
//                     <Label>🔉 Audio Output</Label>
//                     <Input placeholder="e.g. 600 watts" />
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {currentStep === 3 && (
//             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
//               <SectionHeader number={3} title="Pricing & Charges" icon="💰" />

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <Label>📊 Base Price Type <span className="text-red-500">*</span></Label>
//                   <div className="relative">
//                     <Select options={selectOptions.basePriceTypeOptions} placeholder="Per Day" value={pricing.basePriceType} onChange={(value) => setPricing((prev) => ({ ...prev, basePriceType: value }))} />
//                     <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                       <ChevronDownIcon />
//                     </span>
//                   </div>
//                 </div>
//                 <div>
//                   <Label>💵 Per Day Cost (₹) <span className="text-red-500">*</span></Label>
//                   <Input type="text" placeholder="e.g. 5000" value={pricing.costPerDay} onChange={(e) => setPricing((prev) => ({ ...prev, costPerDay: e.target.value }))} />
//                   {validationErrors.costPerDay && <p className="mt-1 text-xs text-red-500">{validationErrors.costPerDay}</p>}
//                 </div>
//                 {/* <div>
//                   <Label>⏰ Additional Hour Charges (₹) <span className="text-red-500">*</span></Label>
//                   <Input type="text" placeholder="e.g. 300" value={pricing.overtimeCharges} onChange={(e) => setPricing((prev) => ({ ...prev, overtimeCharges: e.target.value }))} />
//                 </div>
//                 <div>
//                   <Label>⌚ Waiting Charges (₹/hr) <span className="text-red-500">*</span></Label>
//                   <Input placeholder="e.g. 200" value={pricing.waitingCharges} onChange={(e) => setPricing((prev) => ({ ...prev, waitingCharges: e.target.value }))} />
//                 </div>
//                 <div>
//                   <Label>📅 Min Booking Duration <span className="text-red-500">*</span></Label>
//                   <Input placeholder="e.g. 4 hours" value={pricing.minBookingDuration} onChange={(e) => setPricing((prev) => ({ ...prev, minBookingDuration: e.target.value }))} />
//                 </div> */}


//                  <div>
//                 <Label>Average KM Per Day <span className="text-red-500">*</span></Label>
//                 <Input
//                   type="text"
//                   value={vehicleDetails.avgKmPerDay}
//                   placeholder="e.g. 60"
//                   onChange={handleInputChange(setVehicleDetails, "avgKmPerDay")}
//                 />
//               </div>

//               <div>
//                 <Label>Extra Charges (₹ / Km) <span className="text-red-500">*</span></Label>
//                 <Input
//                   type="text"
//                   value={vehicleDetails.extraKmPrice}
//                   placeholder="e.g. 12"
//                   onChange={handleInputChange(setVehicleDetails, "extraKmPrice")}
//                 />
//               </div>

//               <div>
//                 <Label>Average Booking Hours <span className="text-red-500">*</span></Label>
//                 <Input
//                   type="text"
//                   value={vehicleDetails.avgBookingHrs}
//                   placeholder="e.g. 8"
//                   onChange={handleInputChange(setVehicleDetails, "avgBookingHrs")}
//                 />
//               </div>

//               <div>
//                 <Label>Extra Charges (₹ / hr) <span className="text-red-500">*</span></Label>
//                 <Input
//                   type="text"
//                   value={vehicleDetails.extraHrPrice}
//                   placeholder="e.g. 500"
//                   onChange={handleInputChange(setVehicleDetails, "extraHrPrice")}
//                 />
//               </div>

//               <div>
//                 <Label>RTO Charges (₹) <span className="text-red-500">*</span></Label>
//                 <Input
//                   type="text"
//                   value={vehicleDetails.rtoCharges}
//                   placeholder="e.g. 10,000"
//                   onChange={handleInputChange(setVehicleDetails, "rtoCharges")}
//                 />
//               </div>

//               <div>
//                 <Label>Fuel Efficiency (km/l)</Label>
//                 <Input
//                   type="text"
//                   value={vehicleDetails.fuelEfficiency}
//                   placeholder="e.g. 6.5"
//                   onChange={handleInputChange(setVehicleDetails, "fuelEfficiency")}
//                 />
//               </div>

//               <div>
//                 <Label>Minimum Booking Duration <span className="text-red-500">*</span></Label>
//                 <Input
//                   type="text"
//                   value={pricing.minBookingDuration}
//                   placeholder="e.g. 4 hrs"
//                   onChange={handleInputChange(setPricing, "minBookingDuration")}
//                 />
//               </div>

//               <div>
//                 <Label>Overtime Charges (₹ / hr)</Label>
//                 <Input
//                   type="text"
//                   value={pricing.overtimeCharges}
//                   placeholder="e.g. 500"
//                   onChange={handleInputChange(setPricing, "overtimeCharges")}
//                 />
//               </div>

//               <div>
//                 <Label>Waiting Charges (₹ / hr)</Label>
//                 <Input
//                   type="text"
//                   value={pricing.waitingCharges}
//                   placeholder="e.g. 300"
//                   onChange={handleInputChange(setPricing, "waitingCharges")}
//                 />
//               </div>
//               </div>
//             </div>
//           )}

//           {currentStep === 4 && (
//             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
//               <SectionHeader number={4} title="Media & Description" icon="🎞️" />

//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {mediaItems.map(({ key, label, icon, accept }) => (
//                   <MediaPreviewCard
//                     key={key}
//                     label={label}
//                     icon={icon}
//                     accept={accept}
//                     file={mediaFiles[key]}
//                     previewUrl={mediaPreviews[key]}
//                     onUpload={(file) => handleMediaUpload(key, file)}
//                     onRemove={() => handleRemoveMedia(key)}
//                   />
//                 ))}
//               </div>

//               <div className="mt-6">
//                 <Label>📝 Vehicle Description <span className="text-red-500">*</span></Label>
//                 <textarea 
//                   rows={4} 
//                   className="w-full mt-1 rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white" 
//                   placeholder="Enter detailed description about the vehicle..." 
//                 />
//               </div>
//             </div>
//           )}

//           {currentStep === 5 && (
//             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
//               <SectionHeader number={5} title="Drivers & Maintenance" icon="🧑‍✈️" />

//               {vehicles.length === 0 ? (
//                 <div className="text-center py-10 text-gray-500">Please add vehicles in Basic Info section first</div>
//               ) : (
//                 <div className="space-y-6">
//                   <div className="overflow-x-auto border rounded-lg">
//                     <table className="w-full text-sm">
//                       <thead className="bg-gray-50 dark:bg-gray-700">
//                         <tr>
//                           <th className="px-4 py-3 text-left">Reg. Number</th>
//                           <th className="px-4 py-3 text-left">Driver Name</th>
//                           <th className="px-4 py-3 text-left">Driver Phone</th>
//                           <th className="px-4 py-3 text-left">Last Service</th>
//                           <th className="px-4 py-3 text-left">Insurance Expiry</th>
//                           <th className="px-4 py-3 text-left">Pollution Expiry</th>
//                           <th className="px-4 py-3 text-center">Actions</th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y">
//                         {vehicles.map((vehicle) => (
//                           <tr key={vehicle.registrationNumber} className="hover:bg-gray-50">
//                             <td className="px-4 py-3 font-mono font-semibold text-blue-600">{formatRegistrationNumber(vehicle.registrationNumber)}</td>
//                             <td className="px-4 py-3">{vehicle.driverName || "-"}</td>
//                             <td className="px-4 py-3">{vehicle.driverPhone || "-"}</td>
//                             <td className="px-4 py-3">{vehicle.lastServiceDate || "-"}</td>
//                             <td className="px-4 py-3">{vehicle.insuranceExpiryDate || "-"}</td>
//                             <td className="px-4 py-3">{vehicle.pollutionExpiryDate || "-"}</td>
//                             <td className="px-4 py-3 text-center">
//                               <button
//                                 type="button"
//                                 onClick={() => {
//                                   setSelectedVehicle(vehicle);
//                                   setIsMaintenanceModalOpen(true);
//                                 }}
//                                 className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
//                               >
//                                 Edit Details
//                               </button>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {currentStep === 6 && (
//             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
//               <SectionHeader number={6} title="Vehicle Summary" icon="📊" />

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div className="bg-blue-50 rounded-lg p-4">
//                   <p className="text-sm text-gray-500">🚚 Total Vehicles</p>
//                   <p className="text-2xl font-bold text-blue-600">{vehicles.length}</p>
//                 </div>
//                 <div className="bg-green-50 rounded-lg p-4">
//                   <p className="text-sm text-gray-500">💵 Base Price</p>
//                   <p className="text-2xl font-bold text-green-600">₹{pricing.costPerDay || 0}</p>
//                 </div>
//                 <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-100">
//                   <p className="text-sm text-gray-500">🚍 Vehicle Type</p>
//                   <p className="text-lg font-semibold text-purple-600">
//                     {commonInfo.vehicleType || "Not selected"}
//                   </p>
//                 </div>
//               </div>

//               {vehicles.length > 0 && (
//                 <div className="mt-6">
//                   <Label className="font-semibold">🔢 Vehicles to be onboarded:</Label>
//                   <div className="mt-2 space-y-2">
//                     {vehicles.map((v, idx) => (
//                       <div key={idx} className="flex items-center gap-2 text-sm p-3 bg-gray-50 rounded-lg">
//                         <span className="w-6 text-gray-400">{idx + 1}.</span>
//                         <span className="font-mono font-semibold text-blue-600">{formatRegistrationNumber(v.registrationNumber)}</span>
//                         <span className="text-gray-400">—</span>
//                         <span className="text-gray-600">{v.city}</span>
//                         <span className="text-gray-400">·</span>
//                         <span className="text-gray-500">{v.fuelType}</span>
//                         <span className="ml-auto"><StatusBadge status={v.currentStatus || "Available"} /></span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
//                 <p className="text-sm text-yellow-800">⚠️ Please review all details before submitting. Click the Submit button below to save all vehicles.</p>
//               </div>
//             </div>
//           )}

//           {uploadProgress > 0 && uploadProgress < 100 && (
//             <div className="mt-6">
//               <div className="flex justify-between mb-1">
//                 <span className="text-sm text-gray-600">Uploading...</span>
//                 <span className="text-sm text-gray-600">{uploadProgress}%</span>
//               </div>
//               <div className="w-full bg-gray-200 rounded-full h-2">
//                 <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
//               </div>
//             </div>
//           )}

//           <div className="flex justify-between gap-4 mt-8">
//             <button type="button" onClick={() => window.location.reload()} className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">× Cancel</button>
//             <div className="flex gap-3">
//               {currentStep > 1 && (
//                 <button type="button" onClick={() => setCurrentStep((prev) => prev - 1)} className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
//                   ← Previous
//                 </button>
//               )}
//               {currentStep < 6 ? (
//                 <button 
//                   type="button" 
//                   onClick={() => {
//                     if (currentStep === 1 && (!commonInfo.vehicleType || vehicles.length === 0)) {
//                       toast.error("Please select vehicle type and add at least one vehicle", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//                       return;
//                     }
//                     if (currentStep === 3 && !pricing.costPerDay) {
//                       toast.error("Please set the base price", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//                       return;
//                     }
//                     setCurrentStep((prev) => prev + 1);
//                   }} 
//                   className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
//                 >
//                   Save & Next →
//                 </button>
//               ) : (
//                 <button 
//                   type="button"
//                   onClick={handleSubmit}
//                   disabled={loading} 
//                   className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
//                 >
//                   {loading ? "Saving..." : `✅ Submit ${vehicles.length} Vehicle(s)`}
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// } 








// /* eslint-disable */
// // @ts-nocheck

// "use client";

// import React, { useState, useEffect, useCallback } from "react";
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import Label from "@/components/form/Label";
// import Input from "@/components/form/input/InputField";
// import Select from "@/components/form/Select";
// import { ChevronDownIcon, PlusIcon } from "@/icons";
// import Switch from "@/components/form/switch/Switch";
// import axios from "axios";
// import { baseUrl } from '../../../../../BaseUrl';
// import { NotebookPen, Trash2, Calendar, Upload, X, Eye } from 'lucide-react';

// // ─── Validation Helpers ───────────────────────────────────────────────────────
// const validateYear = (year) => {
//   if (!year) return true;
//   const currentYear = new Date().getFullYear();
//   const yearNum = parseInt(year);
//   if (isNaN(yearNum)) return false;
//   return yearNum <= currentYear && yearNum >= 1900;
// };

// const validateNumber = (value, allowDecimal = false) => {
//   if (!value || value === "") return true;
//   if (allowDecimal) {
//     return /^\d*\.?\d*$/.test(value);
//   }
//   return /^\d*$/.test(value);
// };

// const validatePhoneNumber = (phone) => {
//   if (!phone || phone === "") return true;
//   return /^\d{10}$/.test(phone);
// };

// // ─── Inline Textarea ───────────────────────────────────────────────────────────
// const Textarea = ({ rows = 3, placeholder, value, onChange, className = "", disabled = false }) => (
//   <textarea
//     rows={rows}
//     className={`w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white disabled:bg-gray-100 disabled:cursor-not-allowed dark:disabled:bg-gray-800 ${className}`}
//     placeholder={placeholder}
//     value={value}
//     onChange={onChange}
//     disabled={disabled}
//   />
// );

// // ─── Date Input with Calendar Icon ───────────────────────────────────────────
// const DateInput = ({ value, onChange, placeholder, disabled = false, required = false }) => {
//   return (
//     <div className="relative">
//       <Input
//         type="date"
//         value={value}
//         onChange={onChange}
//         placeholder={placeholder}
//         disabled={disabled}
//         className={`${disabled ? 'bg-gray-100 dark:bg-gray-800' : ''} pr-10`}
//       />
//       <span className="absolute text-gray-400 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-500">
//         <Calendar size={16} />
//       </span>
//       {required && value && <span className="absolute text-green-500 right-3 top-1/2 -translate-y-1/2">✓</span>}
//     </div>
//   );
// };

// // ─── Image/Video Preview Component ───────────────────────────────────────────
// const MediaPreviewCard = ({ label, file, previewUrl, onUpload, onRemove, icon, accept }) => {
//   const [showPreview, setShowPreview] = useState(false);
  
//   const getPreviewContent = () => {
//     if (previewUrl) {
//       if (accept === "video/*") {
//         return (
//           <video 
//             src={previewUrl} 
//             className="w-full h-32 object-cover rounded-lg"
//             controls={showPreview}
//           />
//         );
//       } else {
//         return (
//           <img 
//             src={previewUrl} 
//             alt={label}
//             className="w-full h-32 object-cover rounded-lg"
//           />
//         );
//       }
//     }
//     return (
//       <div className="w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
//         <span className="text-4xl">{icon}</span>
//       </div>
//     );
//   };

//   return (
//     <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-200">
//       <div className="relative group">
//         {/* Preview */}
//         <div className="mb-3">
//           {getPreviewContent()}
//         </div>
        
//         {/* File Info */}
//         {file && (
//           <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 truncate">
//             {file.name}
//           </div>
//         )}
        
//         {/* Action Buttons */}
//         <div className="flex gap-2 justify-center mt-3">
//           <label className="cursor-pointer">
//             <span className="inline-flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors">
//               <Upload size={12} />
//               Upload
//             </span>
//             <input 
//               type="file" 
//               className="hidden" 
//               accept={accept}
//               onChange={(e) => {
//                 const selectedFile = e.target.files?.[0];
//                 if (selectedFile) {
//                   onUpload(selectedFile);
//                 }
//               }} 
//             />
//           </label>
          
//           {(previewUrl || file) && (
//             <>
//               <button
//                 type="button"
//                 onClick={() => setShowPreview(!showPreview)}
//                 className="inline-flex items-center gap-1 text-xs bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg transition-colors"
//               >
//                 <Eye size={12} />
//                 {showPreview ? "Hide" : "Preview"}
//               </button>
              
//               <button
//                 type="button"
//                 onClick={onRemove}
//                 className="inline-flex items-center gap-1 text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-colors"
//               >
//                 <X size={12} />
//                 Remove
//               </button>
//             </>
//           )}
//         </div>
//       </div>
//       <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-2">{label}</p>
//     </div>
//   );
// };

// // ─── Stepper Header ─────────────────────────────────────────────────────────
// const StepperHeader = ({ steps, currentStep, onStepClick, canAccessStep6 }) => {
//   return (
//     <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-6 px-6 py-4 overflow-x-auto">
//       <div className="flex items-center min-w-max gap-0">
//         {steps.map((step, idx) => {
//           const isCompleted = currentStep > step.number;
//           const isActive = currentStep === step.number;
//           const isDisabled = step.number === 6 && !canAccessStep6;
          
//           return (
//             <React.Fragment key={step.number}>
//               <button
//                 type="button"
//                 onClick={() => !isDisabled && onStepClick(step.number)}
//                 className="flex items-center gap-2 group focus:outline-none"
//                 disabled={isDisabled}
//               >
//                 <div
//                   className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all duration-200 flex-shrink-0 ${
//                     isCompleted
//                       ? "bg-blue-600 text-white"
//                       : isActive
//                       ? "bg-blue-600 text-white ring-4 ring-blue-100"
//                       : isDisabled
//                       ? "bg-gray-300 text-gray-400 cursor-not-allowed dark:bg-gray-700"
//                       : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
//                   }`}
//                 >
//                   {isCompleted ? (
//                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
//                       <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
//                     </svg>
//                   ) : (
//                     step.number
//                   )}
//                 </div>
//                 <span
//                   className={`text-sm font-medium whitespace-nowrap transition-colors ${
//                     isActive
//                       ? "text-blue-600 dark:text-blue-400"
//                       : isCompleted
//                       ? "text-blue-500 dark:text-blue-400"
//                       : isDisabled
//                       ? "text-gray-400 cursor-not-allowed"
//                       : "text-gray-400 dark:text-gray-500"
//                   }`}
//                 >
//                   {step.title}
//                 </span>
//               </button>
//               {idx < steps.length - 1 && (
//                 <div className="flex items-center mx-2 flex-shrink-0">
//                   <div
//                     className={`h-0.5 w-10 rounded transition-colors duration-300 ${
//                       currentStep > step.number ? "bg-blue-400" : "bg-gray-200 dark:bg-gray-700"
//                     }`}
//                   />
//                 </div>
//               )}
//             </React.Fragment>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// // ─── Section Card Header ────────────────────────────────────────────
// const SectionHeader = ({ number, title, icon }) => (
//   <div className="flex items-center gap-3 mb-6">
//     <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-600 text-white text-sm font-bold shadow-md">
//       {number}
//     </div>
//     <div>
//       <h2 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
//         {icon && <span className="mr-2">{icon}</span>}
//         {title}
//       </h2>
//     </div>
//   </div>
// );

// // ─── Status Badge ─────────────────────────────────────────────────────────────
// const StatusBadge = ({ status }) => {
//   const styles = {
//     Available: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
//     Unavailable: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
//   };
//   return (
//     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.Available}`}>
//       {status}
//     </span>
//   );
// };

// // ─── Validation helpers ───────────────────────────────────────────────────────
// const isValidRegistrationNumber = (regNumber) => {
//   if (!regNumber || regNumber.trim() === "") return false;
//   const clean = regNumber.replace(/\s/g, "");
//   if (clean.length !== 10) return false;
//   return /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/.test(clean);
// };

// const formatRegistrationNumber = (regNumber) => {
//   if (!regNumber) return "";
//   const clean = regNumber.replace(/\s/g, "").toUpperCase();
//   if (clean.length !== 10) return regNumber;
//   return `${clean.slice(0,2)} ${clean.slice(2,4)} ${clean.slice(4,6)} ${clean.slice(6,10)}`;
// };

// const unformatRegistrationNumber = (regNumber) => {
//   if (!regNumber) return "";
//   return regNumber.replace(/\s/g, "").toUpperCase();
// };

// // ─── Vehicle Type Management Modal ───────────────────────────────────────────
// const VehicleTypeModal = ({ isOpen, onClose, onSave, onUpdate, onDelete, editingType, vehicleTypes, setEditingType }) => {
//   const [typeName, setTypeName] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showAddForm, setShowAddForm] = useState(false);

//   useEffect(() => {
//     if (editingType) {
//       setTypeName(editingType.typeName);
//       setShowAddForm(true);
//     } else {
//       setTypeName("");
//     }
//   }, [editingType, isOpen]);

//   const handleSubmit = async () => {
//     if (!typeName.trim()) {
//       toast.error("Please enter vehicle type name", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//       return;
//     }
//     setLoading(true);
//     try {
//       if (editingType) {
//         await onUpdate(editingType._id, typeName);
//         setEditingType(null);
//       } else {
//         await onSave(typeName);
//       }
//       setTypeName("");
//       setShowAddForm(false);
//       onClose();
//     } catch (error) {
//       console.error("Error saving vehicle type:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to permanently delete this vehicle type?")) {
//       setLoading(true);
//       try {
//         await onDelete(id);
//         onClose();
//       } catch (error) {
//         console.error("Error deleting vehicle type:", error);
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
//       style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
//     >
//       <div className="bg-white rounded-xl w-full max-w-2xl mx-4 my-8 dark:bg-gray-800 shadow-2xl">
//         <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
//           <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
//             📋 Manage Vehicle Types
//           </h3>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-2xl leading-none"
//           >
//             ×
//           </button>
//         </div>

//         <div className="p-6">
//           <button
//             onClick={() => setShowAddForm(!showAddForm)}
//             className="flex items-center gap-2 mb-4 text-blue-600 hover:text-blue-700"
//           >
//             <PlusIcon className="w-4 h-4" />
//             Add New Vehicle Type
//           </button>

//           {showAddForm && (
//             <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
//               <Label>Vehicle Type Name</Label>
//               <div className="flex gap-2 mt-2">
//                 <Input
//                   type="text"
//                   placeholder="e.g., Standard, Premium, Deluxe"
//                   value={typeName}
//                   onChange={(e) => setTypeName(e.target.value)}
//                   className="flex-1"
//                 />
//                 <button
//                   onClick={handleSubmit}
//                   disabled={loading}
//                   className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                 >
//                   {loading ? "Saving..." : editingType ? "Update" : "Add"}
//                 </button>
//               </div>
//             </div>
//           )}

//           <div className="mt-4">
//             <Label>Existing Vehicle Types</Label>
//             <div className="mt-2 space-y-2 max-h-80 overflow-y-auto">
//               {vehicleTypes.map((type) => (
//                 <div key={type._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
//                   <span className="text-gray-800 dark:text-white">{type.typeName}</span>
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => {
//                         setEditingType(type);
//                         setTypeName(type.typeName);
//                         setShowAddForm(true);
//                       }}
//                       className="text-blue-500 hover:text-blue-700"
//                     >
//                       <NotebookPen size={16} />
//                     </button>
//                     <button
//                       onClick={() => handleDelete(type._id)}
//                       className="text-red-500 hover:text-red-700"
//                     >
//                       <Trash2 size={16} />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ─── Add Vehicle Modal ───────────────────────────────────────────────────────
// const AddVehicleModal = ({ isOpen, onClose, onSave, editingVehicle, existingRegNumbers, onCheckDuplicate }) => {
//   const [formData, setFormData] = useState({
//     registrationNumber: "",
//     vehicleId: "", 
//     city: "",
//     permitType: "",
//     modelConfig: "",
//     ownershipType: "",
//     fuelType: "",
//     manufacturingYear: "",
//     gpsEnabled: true,
//     activeStatus: true,
//     currentStatus: "Available",
//     availableFrom: "",
//     remarks: "",
//     driverName: "",
//     driverPhone: "",
//     backupDriver: "",
//     backupDriverPhone: "",
//     driverCharges: "",
//     lastServiceDate: "",
//     insuranceExpiryDate: "",
//     pollutionExpiryDate: "",
//   });
  
//   const [registrationError, setRegistrationError] = useState("");
//   const [yearError, setYearError] = useState("");
//   const [phoneError, setPhoneError] = useState("");
//   const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [isGeneratingId, setIsGeneratingId] = useState(false);

//   const generateVehicleIdFromBackend = async () => {
//     setIsGeneratingId(true);
//     try {
//       const response = await axios.get(`${baseUrl}/api/generate-vehicle-id`);
//       if (response.data.success) {
//         return response.data.vehicleId;
//       }
//     } catch (error) {
//       console.error("Error generating vehicle ID:", error);
//       const now = new Date();
//       const day = String(now.getDate()).padStart(2, '0');
//       const month = String(now.getMonth() + 1).padStart(2, '0');
//       const year = String(now.getFullYear()).slice(-2);
//       const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
//       return `${day}${month}${year}${random}`;
//     } finally {
//       setIsGeneratingId(false);
//     }
//   };

//   useEffect(() => {
//     if (!editingVehicle && isOpen) {
//       const generateId = async () => {
//         const newVehicleId = await generateVehicleIdFromBackend();
//         setFormData(prev => ({ ...prev, vehicleId: newVehicleId }));
//       };
//       generateId();
//     }
//   }, [isOpen, editingVehicle]);

//   useEffect(() => {
//     if (editingVehicle) {
//       setFormData({
//         registrationNumber: formatRegistrationNumber(editingVehicle.registrationNumber) || "",
//         vehicleId: editingVehicle.vehicleId || "",
//         city: editingVehicle.city || "",
//         permitType: editingVehicle.permitType || "",
//         modelConfig: editingVehicle.modelConfig || "",
//         ownershipType: editingVehicle.ownershipType || "",
//         fuelType: editingVehicle.fuelType || "",
//         manufacturingYear: editingVehicle.manufacturingYear || "",
//         gpsEnabled: editingVehicle.gpsEnabled !== undefined ? editingVehicle.gpsEnabled : true,
//         activeStatus: editingVehicle.activeStatus !== undefined ? editingVehicle.activeStatus : true,
//         currentStatus: editingVehicle.currentStatus || "Available",
//         availableFrom: editingVehicle.availableFrom || "",
//         remarks: editingVehicle.remarks || "",
//         driverName: editingVehicle.driverName || "",
//         driverPhone: editingVehicle.driverPhone || "",
//         backupDriver: editingVehicle.backupDriver || "",
//         backupDriverPhone: editingVehicle.backupDriverPhone || "",
//         driverCharges: editingVehicle.driverCharges || "",
//         lastServiceDate: editingVehicle.lastServiceDate || "",
//         insuranceExpiryDate: editingVehicle.insuranceExpiryDate || "",
//         pollutionExpiryDate: editingVehicle.pollutionExpiryDate || "",
//       });
//     } else {
//       setFormData({
//         registrationNumber: "",
//         vehicleId: "",
//         city: "",
//         permitType: "",
//         modelConfig: "",
//         ownershipType: "",
//         fuelType: "",
//         manufacturingYear: "",
//         gpsEnabled: true,
//         activeStatus: true,
//         currentStatus: "Available",
//         availableFrom: "",
//         remarks: "",
//         driverName: "",
//         driverPhone: "",
//         backupDriver: "",
//         backupDriverPhone: "",
//         driverCharges: "",
//         lastServiceDate: "",
//         insuranceExpiryDate: "",
//         pollutionExpiryDate: "",
//       });
//     }
//     setRegistrationError("");
//     setYearError("");
//     setPhoneError("");
//   }, [editingVehicle, isOpen]);

//   const handleYearChange = (value) => {
//     const currentYear = new Date().getFullYear();
//     if (value === "" || /^\d*$/.test(value)) {
//       if (value && parseInt(value) > currentYear) {
//         setYearError(`Year cannot exceed ${currentYear}`);
//       } else if (value && parseInt(value) < 1900) {
//         setYearError("Year must be 1900 or later");
//       } else {
//         setYearError("");
//       }
//       setFormData((prev) => ({ ...prev, manufacturingYear: value }));
//     }
//   };

//   const handlePhoneChange = (field, value) => {
//     if (value === "" || /^\d*$/.test(value)) {
//       if (value && value.length > 10) return;
//       setFormData((prev) => ({ ...prev, [field]: value }));
//       if (field === "driverPhone" && value && value.length === 10) {
//         setPhoneError("");
//       } else if (field === "driverPhone" && value && value.length !== 10 && value.length > 0) {
//         setPhoneError("Phone number must be 10 digits");
//       } else {
//         setPhoneError("");
//       }
//     }
//   };

//   const checkDuplicateRealTime = useCallback(async (value) => {
//     const cleanValue = unformatRegistrationNumber(value);
//     if (cleanValue.length === 10 && isValidRegistrationNumber(value)) {
//       setIsCheckingDuplicate(true);
//       try {
//         const isDuplicate = await onCheckDuplicate(cleanValue);
//         if (isDuplicate && !editingVehicle) {
//           setRegistrationError("This registration number already exists");
//         } else {
//           setRegistrationError("");
//         }
//       } catch (error) {
//         console.error("Duplicate check error:", error);
//       } finally {
//         setIsCheckingDuplicate(false);
//       }
//     } else {
//       setRegistrationError("");
//     }
//   }, [editingVehicle, onCheckDuplicate]);

//   const handleRegNumberChange = (value) => {
//     let cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
//     let validated = "";
//     let pos = 0;
//     for (let i = 0; i < cleaned.length && pos < 10; i++) {
//       const char = cleaned[i];
//       if (pos < 2 && /[A-Z]/.test(char)) { validated += char; pos++; }
//       else if (pos >= 2 && pos < 4 && /[0-9]/.test(char)) { validated += char; pos++; }
//       else if (pos >= 4 && pos < 6 && /[A-Z]/.test(char)) { validated += char; pos++; }
//       else if (pos >= 6 && pos < 10 && /[0-9]/.test(char)) { validated += char; pos++; }
//     }
//     let formatted = validated.slice(0, 2);
//     if (validated.length > 2) formatted += " " + validated.slice(2, 4);
//     if (validated.length > 4) formatted += " " + validated.slice(4, 6);
//     if (validated.length > 6) formatted += " " + validated.slice(6, 10);
    
//     setFormData((prev) => ({ ...prev, registrationNumber: formatted }));
    
//     const clean = unformatRegistrationNumber(formatted);
//     if (clean.length === 10 && isValidRegistrationNumber(formatted)) {
//       checkDuplicateRealTime(formatted);
//     } else if (clean.length > 0 && clean.length < 10) {
//       setRegistrationError(`Need ${10 - clean.length} more character(s)`);
//     } else if (clean.length === 10 && !isValidRegistrationNumber(formatted)) {
//       setRegistrationError("Invalid format. Use: XX NN XX NNNN");
//     } else {
//       setRegistrationError("");
//     }
//   };

//   const handleSubmit = async () => {
//     const cleanReg = unformatRegistrationNumber(formData.registrationNumber);
//     if (!cleanReg || cleanReg.length !== 10 || !isValidRegistrationNumber(formData.registrationNumber)) {
//       toast.error("Please enter a valid registration number", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//       return;
//     }
//     if (!formData.city) { toast.error("City is required", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             }); return; }
//     if (!formData.permitType) { toast.error("Permit Type is required", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             }); return; }
//     // if (!formData.modelConfig) { toast.error("Model Configuration is required", {
//     //             position: "bottom-right",
//     //             autoClose: 2000,
//     //         }); return; }
//     if (!formData.ownershipType) { toast.error("Ownership Type is required", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             }); return; }
//     if (!formData.fuelType) { toast.error("Fuel Type is required", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             }); return; }
    
//     if (formData.manufacturingYear) {
//       const currentYear = new Date().getFullYear();
//       const yearNum = parseInt(formData.manufacturingYear);
//       if (isNaN(yearNum) || yearNum > currentYear) {
//         toast.error(`Manufacturing year cannot exceed ${currentYear}`, {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//         return;
//       }
//     }
    
//     if (formData.driverPhone && formData.driverPhone.length !== 10) {
//       toast.error("Driver phone number must be 10 digits", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//       return;
//     }
    
//     if (formData.backupDriverPhone && formData.backupDriverPhone.length !== 10 && formData.backupDriverPhone.length > 0) {
//       toast.error("Backup driver phone number must be 10 digits", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//       return;
//     }
    
//     if (formData.currentStatus === "Unavailable" && !formData.availableFrom) {
//       toast.error("Please provide Available From date for Unavailable status", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//       return;
//     }
//     if (formData.currentStatus === "Unavailable" && !formData.remarks) {
//       toast.error("Please provide remarks for Unavailable status", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//       return;
//     }
    
//     const isDuplicate = await onCheckDuplicate(cleanReg);
//     if (isDuplicate && !editingVehicle) {
//       toast.error("This registration number already exists", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//       return;
//     }
    
//     setLoading(true);
//     try {
//       onSave({ ...formData, registrationNumber: cleanReg });
//       onClose();
//     } catch (error) {
//       console.error("Error saving vehicle:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   const selectOptions = {
//     cityOptions: [
//       { value: "Chennai", label: "Chennai" },
//       { value: "Madurai", label: "Madurai" },
//       { value: "Coimbatore", label: "Coimbatore" },
//     ],
//     permitOptions: [
//       { value: "Local", label: "Local" },
//       { value: "State", label: "State" },
//       { value: "National", label: "National" },
//     ],
//     modelOptions: [
//       { value: "Standard", label: "Standard" },
//       { value: "Premium", label: "Premium" },
//       { value: "Deluxe", label: "Deluxe" },
//     ],
//     ownershipOptions: [
//       { value: "Owned", label: "Owned" },
//       { value: "Leased", label: "Leased" },
//       { value: "Rented", label: "Rented" },
//     ],
//     fuelTypeOptions: [
//       { value: "Petrol", label: "Petrol" },
//       { value: "Diesel", label: "Diesel" },
//       { value: "CNG", label: "CNG" },
//       { value: "Electric", label: "Electric" },
//     ],
//     currentStatusOptions: [
//       { value: "Available", label: "Available" },
//       { value: "Unavailable", label: "Unavailable" }
//     ],
//   };

//   const showUnavailableFields = formData.currentStatus === "Unavailable";

//   return (
//     <div
//       className="fixed inset-0 z-99999 flex items-center justify-center overflow-y-auto"
//       style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
//     >
//       <div className="bg-white rounded-xl w-full max-w-4xl mx-4 my-8 dark:bg-gray-800 shadow-2xl">
//         <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
//           <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
//             🚚 {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
//           </h3>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-2xl leading-none"
//           >
//             ×
//           </button>
//         </div>

//         <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
//           <div className="space-y-6">
//             <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
//               <Label>🔢 Registration Number <span className="text-red-500">*</span></Label>
//               <div className="relative">
//                 <Input
//                   type="text"
//                   value={formData.registrationNumber}
//                   onChange={(e) => handleRegNumberChange(e.target.value)}
//                   placeholder="TN 01 AB 1234"
//                   maxLength={13}
//                   className={registrationError ? "border-red-500" : ""}
//                 />
//                 {isCheckingDuplicate && (
//                   <span className="absolute right-3 top-1/2 -translate-y-1/2">
//                     <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//                   </span>
//                 )}
//               </div>
//               {registrationError && (
//                 <p className="mt-1 text-xs text-red-500">{registrationError}</p>
//               )}
//               {!registrationError &&
//                 formData.registrationNumber &&
//                 isValidRegistrationNumber(formData.registrationNumber) && (
//                   <p className="mt-1 text-xs text-green-500">✓ Valid registration number</p>
//                 )}
//             </div>

//             <div>
//               <Label>🆔 Vehicle ID <span className="text-red-500">*</span></Label>
//               <div className="relative">
//                 <Input
//                   type="text"
//                   value={formData.vehicleId || (isGeneratingId ? "Generating..." : "")}
//                   placeholder="Auto generated"
//                   disabled
//                   className={`bg-gray-100 dark:bg-gray-800 cursor-not-allowed ${
//                     isGeneratingId ? 'animate-pulse' : ''
//                   }`}
//                 />
//                 {isGeneratingId && (
//                   <div className="absolute right-3 top-1/2 -translate-y-1/2">
//                     <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//                   </div>
//                 )}
//               </div>
//               <p className="mt-1 text-xs text-gray-400">
//                 {formData.vehicleId 
//                   ? `Vehicle ID: ${formData.vehicleId}` 
//                   : "Vehicle ID will be auto-generated"}
//               </p>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//               <div>
//                 <Label>🏙️ City / Operating Location <span className="text-red-500">*</span></Label>
//                 <div className="relative">
//                   <Select
//                     options={selectOptions.cityOptions}
//                     placeholder="Select City"
//                     value={formData.city}
//                     onChange={(value) => setFormData((prev) => ({ ...prev, city: value }))}
//                   />
//                   <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                     <ChevronDownIcon />
//                   </span>
//                 </div>
//               </div>

//               <div>
//                 <Label>📋 Permit Type </Label>
//                 <div className="relative">
//                   <Select
//                     options={selectOptions.permitOptions}
//                     placeholder="Select Permit"
//                     value={formData.permitType}
//                     onChange={(value) => setFormData((prev) => ({ ...prev, permitType: value }))}
//                   />
//                   <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                     <ChevronDownIcon />
//                   </span>
//                 </div>
//               </div>

//               <div>
//                 <Label>⚙️ Model / Configuration </Label>
//                 <div className="relative">
//                   <Select
//                     options={selectOptions.modelOptions}
//                     placeholder="Select Model"
//                     value={formData.modelConfig}
//                     onChange={(value) => setFormData((prev) => ({ ...prev, modelConfig: value }))}
//                   />
//                   <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                     <ChevronDownIcon />
//                   </span>
//                 </div>
//               </div>

//               <div>
//                 <Label>🏢 Ownership Type </Label>
//                 <div className="relative">
//                   <Select
//                     options={selectOptions.ownershipOptions}
//                     placeholder="Select Ownership"
//                     value={formData.ownershipType}
//                     onChange={(value) => setFormData((prev) => ({ ...prev, ownershipType: value }))}
//                   />
//                   <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                     <ChevronDownIcon />
//                   </span>
//                 </div>
//               </div>

//               <div>
//                 <Label>⛽ Fuel Type <span className="text-red-500">*</span></Label>
//                 <div className="relative">
//                   <Select
//                     options={selectOptions.fuelTypeOptions}
//                     placeholder="Select Fuel Type"
//                     value={formData.fuelType}
//                     onChange={(value) => setFormData((prev) => ({ ...prev, fuelType: value }))}
//                   />
//                   <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                     <ChevronDownIcon />
//                   </span>
//                 </div>
//               </div>

//               <div>
//                 <Label>📅 Manufacturing Year <span className="text-red-500">*</span></Label>
//                 <Input
//                   type="text"
//                   placeholder="e.g. 2023"
//                   maxLength={4}
//                   value={formData.manufacturingYear}
//                   onChange={(e) => handleYearChange(e.target.value)}
//                   className={yearError ? "border-red-500" : ""}
//                 />
//                 {yearError && <p className="mt-1 text-xs text-red-500">{yearError}</p>}
//               </div>
//             </div>

//             <div className="border-t pt-6 mt-2">
//               <Label className="text-base font-semibold">📌 Status & Availability</Label>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
//                 <div>
//                   <Label>Current Status <span className="text-red-500">*</span></Label>
//                   <div className="relative">
//                     <Select
//                       options={selectOptions.currentStatusOptions}
//                       placeholder="Select status"
//                       value={formData.currentStatus}
//                       onChange={(value) => setFormData(prev => ({ ...prev, currentStatus: value, availableFrom: "", remarks: "" }))}
//                     />
//                     <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                       <ChevronDownIcon />
//                     </span>
//                   </div>
//                 </div>
                
//                 {showUnavailableFields && (
//                   <>
//                     <div>
//                       <Label>Available From </Label>
//                       <DateInput 
//                         value={formData.availableFrom}
//                         onChange={(e) => setFormData(prev => ({ ...prev, availableFrom: e.target.value }))}
//                       />
//                     </div>
//                     <div className="md:col-span-2">
//                       <Label>Remarks <span className="text-red-500">*</span></Label>
//                       <Textarea
//                         placeholder="Enter remarks about unavailability..."
//                         value={formData.remarks}
//                         onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
//                         rows={2}
//                       />
//                     </div>
//                   </>
//                 )}
//               </div>
//             </div>

//             <div className="flex gap-6 pt-2">
//               <div>
//                 <Label>📡 GPS Enabled <span className="text-red-500">*</span></Label>
//                 <Switch
//                   label={formData.gpsEnabled ? "Enabled" : "Disabled"}
//                   defaultChecked={formData.gpsEnabled}
//                   onChange={(checked) => setFormData((prev) => ({ ...prev, gpsEnabled: checked }))}
//                 />
//               </div>
//               <div>
//                 <Label>✅ Active Status <span className="text-red-500">*</span></Label>
//                 <Switch
//                   label={formData.activeStatus ? "Active" : "Inactive"}
//                   defaultChecked={formData.activeStatus}
//                   onChange={(checked) => setFormData((prev) => ({ ...prev, activeStatus: checked }))}
//                 />
//               </div>
//             </div>

//             <div className="border-t pt-6 mt-2">
//               <Label className="text-base font-semibold">👤 Driver Details (Optional) </Label>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
//                 <div>
//                   <Label>Driver Name</Label>
//                   <Input placeholder="Enter driver name" value={formData.driverName} onChange={(e) => setFormData(prev => ({ ...prev, driverName: e.target.value }))} />
//                 </div>
//                 <div>
//                   <Label>Driver Phone</Label>
//                   <Input 
//                     placeholder="Enter 10-digit phone number" 
//                     maxLength={10} 
//                     value={formData.driverPhone} 
//                     onChange={(e) => handlePhoneChange("driverPhone", e.target.value)}
//                     className={phoneError && formData.driverPhone ? "border-red-500" : ""}
//                   />
//                   {phoneError && formData.driverPhone && <p className="mt-1 text-xs text-red-500">{phoneError}</p>}
//                 </div>
//                 <div>
//                   <Label>Backup Driver (Optional)</Label>
//                   <Input placeholder="Enter backup driver name" value={formData.backupDriver} onChange={(e) => setFormData(prev => ({ ...prev, backupDriver: e.target.value }))} />
//                 </div>
//                 <div>
//                   <Label>Backup Driver Phone (Optional)</Label>
//                   <Input 
//                     placeholder="Enter 10-digit phone number" 
//                     maxLength={10} 
//                     value={formData.backupDriverPhone} 
//                     onChange={(e) => handlePhoneChange("backupDriverPhone", e.target.value)} 
//                   />
//                 </div>
//                 <div>
//                   <Label>Driver Charges (₹) (Optional)</Label>
//                   <Input 
//                     placeholder="e.g. 800" 
//                     value={formData.driverCharges} 
//                     onChange={(e) => {
//                       if (validateNumber(e.target.value, false)) {
//                         setFormData(prev => ({ ...prev, driverCharges: e.target.value }));
//                       }
//                     }} 
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="border-t pt-6 mt-2">
//               <Label className="text-base font-semibold">🔧 Maintenance Details (Optional) </Label>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
//                 <div>
//                   <Label>Last Service Date</Label>
//                   <DateInput value={formData.lastServiceDate} onChange={(e) => setFormData(prev => ({ ...prev, lastServiceDate: e.target.value }))} />
//                 </div>
//                 <div>
//                   <Label>Insurance Expiry Date</Label>
//                   <DateInput value={formData.insuranceExpiryDate} onChange={(e) => setFormData(prev => ({ ...prev, insuranceExpiryDate: e.target.value }))} />
//                 </div>
//                 <div>
//                   <Label>Pollution Expiry Date</Label>
//                   <DateInput value={formData.pollutionExpiryDate} onChange={(e) => setFormData(prev => ({ ...prev, pollutionExpiryDate: e.target.value }))} />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="flex justify-end gap-3 p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-xl">
//           <button
//             type="button"
//             onClick={onClose}
//             className="px-5 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
//           >
//             Cancel
//           </button>
//           <button
//             type="button"
//             onClick={handleSubmit}
//             disabled={loading}
//             className="px-5 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
//           >
//             {loading ? "Saving..." : editingVehicle ? "Update Vehicle" : "Add Vehicle"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ─── Maintenance Modal ───────────────────────────────────────────────────────
// const MaintenanceModal = ({ isOpen, onClose, vehicle, onSave }) => {
//   const [maintenanceData, setMaintenanceData] = useState({
//     lastServiceDate: "",
//     insuranceExpiryDate: "",
//     pollutionExpiryDate: "",
//   });
//   const [driverData, setDriverData] = useState({
//     driverName: "",
//     driverPhone: "",
//     backupDriver: "",
//     backupDriverPhone: "",
//     driverCharges: "",
//   });
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (vehicle) {
//       setMaintenanceData({
//         lastServiceDate: vehicle.lastServiceDate || "",
//         insuranceExpiryDate: vehicle.insuranceExpiryDate || "",
//         pollutionExpiryDate: vehicle.pollutionExpiryDate || "",
//       });
//       setDriverData({
//         driverName: vehicle.driverName || "",
//         driverPhone: vehicle.driverPhone || "",
//         backupDriver: vehicle.backupDriver || "",
//         backupDriverPhone: vehicle.backupDriverPhone || "",
//         driverCharges: vehicle.driverCharges || "",
//       });
//     }
//   }, [vehicle, isOpen]);

//   const handleSubmit = () => {
//     setLoading(true);
//     onSave(vehicle.registrationNumber, { ...maintenanceData, ...driverData });
//     setTimeout(() => {
//       setLoading(false);
//       onClose();
//     }, 500);
//   };

//   if (!isOpen) return null;

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
//       style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
//     >
//       <div className="bg-white rounded-xl w-full max-w-3xl mx-4 my-8 dark:bg-gray-800 shadow-2xl">
//         <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
//           <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
//             🔧 Driver & Maintenance Details: <span className="font-mono text-blue-600">{formatRegistrationNumber(vehicle?.registrationNumber)}</span>
//           </h3>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-2xl leading-none"
//           >
//             ×
//           </button>
//         </div>

//         <div className="p-6">
//           <div className="mb-6">
//             <Label className="text-base font-semibold">👤 Driver Details</Label>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
//               <div>
//                 <Label>Driver Name</Label>
//                 <Input value={driverData.driverName} onChange={(e) => setDriverData(prev => ({ ...prev, driverName: e.target.value }))} />
//               </div>
//               <div>
//                 <Label>Driver Phone</Label>
//                 <Input value={driverData.driverPhone} onChange={(e) => setDriverData(prev => ({ ...prev, driverPhone: e.target.value }))} maxLength={10} />
//               </div>
//               <div>
//                 <Label>Backup Driver</Label>
//                 <Input value={driverData.backupDriver} onChange={(e) => setDriverData(prev => ({ ...prev, backupDriver: e.target.value }))} />
//               </div>
//               <div>
//                 <Label>Backup Driver Phone</Label>
//                 <Input value={driverData.backupDriverPhone} onChange={(e) => setDriverData(prev => ({ ...prev, backupDriverPhone: e.target.value }))} maxLength={10} />
//               </div>
//               <div>
//                 <Label>Driver Charges (₹)</Label>
//                 <Input value={driverData.driverCharges} onChange={(e) => setDriverData(prev => ({ ...prev, driverCharges: e.target.value }))} />
//               </div>
//             </div>
//           </div>

//           <div className="border-t pt-6">
//             <Label className="text-base font-semibold">🔧 Maintenance Details</Label>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
//               <div>
//                 <Label>Last Service Date</Label>
//                 <DateInput
//                   value={maintenanceData.lastServiceDate}
//                   onChange={(e) => setMaintenanceData(prev => ({ ...prev, lastServiceDate: e.target.value }))}
//                 />
//               </div>
//               <div>
//                 <Label>Insurance Expiry Date</Label>
//                 <DateInput
//                   value={maintenanceData.insuranceExpiryDate}
//                   onChange={(e) => setMaintenanceData(prev => ({ ...prev, insuranceExpiryDate: e.target.value }))}
//                 />
//               </div>
//               <div>
//                 <Label>Pollution Certificate Expiry Date</Label>
//                 <DateInput
//                   value={maintenanceData.pollutionExpiryDate}
//                   onChange={(e) => setMaintenanceData(prev => ({ ...prev, pollutionExpiryDate: e.target.value }))}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="flex justify-end gap-3 p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-xl">
//           <button
//             type="button"
//             onClick={onClose}
//             className="px-5 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
//           >
//             Cancel
//           </button>
//           <button
//             type="button"
//             onClick={handleSubmit}
//             disabled={loading}
//             className="px-5 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
//           >
//             {loading ? "Saving..." : "Save Details"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ─── Main Component ───────────────────────────────────────────────────────────
// export default function VehicleOnboardingForm() {
//   const [vehicles, setVehicles] = useState([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
//   const [selectedVehicle, setSelectedVehicle] = useState(null);
//   const [editingVehicle, setEditingVehicle] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [currentStep, setCurrentStep] = useState(1);
//   const [vehicleTypes, setVehicleTypes] = useState([]);
//   const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
//   const [editingType, setEditingType] = useState(null);
//   const [existingRegNumbersSet, setExistingRegNumbersSet] = useState(new Set());
//   const [selectedVehicleTypeData, setSelectedVehicleTypeData] = useState(null);
//   const [isLoadingVehicleData, setIsLoadingVehicleData] = useState(false);

//   const [commonInfo, setCommonInfo] = useState({
//     customizedType: "Non-Customized",
//     vehicleType: "",
//     vehicleName: "",
//   });

//   const [techSpecs, setTechSpecs] = useState({
//     screenType: "LED Only",
//     numberOfScreens: "",
//     screenSizeWidth: "",
//     screenSizeHeight: "",
//     backScreenWidth: "",
//     backScreenHeight: "",
//     resolution: "",
//     backResolution: "",
//     videoSize: "",
//     backVideoSize: "",
//     audioOutput: "",
//     brightness: "",
//     displayVersion: "",
//     soundQuality: "",
//     generatorCapacity: "",
//     additionalFeatures: "",
//   });

//   const [showMoreTech, setShowMoreTech] = useState(false);

//   const [pricing, setPricing] = useState({
//     basePriceType: "Per Day",
//     costPerDay: "",
//     avgKmPerDay: "",
//     extraKmPrice: "",
//     avgBookingHrs: "",
//     extraHrPrice: "",
//     rtoCharges: "",
//     fuelEfficiency: "",
//     minBookingDuration: "",
//     overtimeCharges: "",
//     waitingCharges: "",
//   });

//   // Media files state with preview support
//   const [mediaFiles, setMediaFiles] = useState({
//     frontViewImage: null,
//     leftSideImage: null,
//     rightSideImage: null,
//     rearViewImage: null,
//     interiorImage: null,
//     demoVideo: null,
//   });

//   const [mediaPreviews, setMediaPreviews] = useState({
//     frontViewImage: null,
//     leftSideImage: null,
//     rightSideImage: null,
//     rearViewImage: null,
//     interiorImage: null,
//     demoVideo: null,
//   });

//   const [validationErrors, setValidationErrors] = useState({});
//   const [uploadProgress, setUploadProgress] = useState(0);

//   // Handle file upload with preview
//   const handleMediaUpload = (field, file) => {
//     if (!file) return;
    
//     const isVideo = field === 'demoVideo';
//     const maxSize = isVideo ? 10 * 1024 * 1024 : 3 * 1024 * 1024;
    
//     if (file.size > maxSize) {
//       toast.error(`File size exceeds ${isVideo ? '10MB' : '3MB'} limit`, {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//       return;
//     }
    
//     const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
//     const validVideoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm'];
    
//     if (isVideo && !validVideoTypes.includes(file.type)) {
//       toast.error("Please select a valid video file", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//       return;
//     }
    
//     if (!isVideo && !validImageTypes.includes(file.type)) {
//       toast.error("Please select a valid image file", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//       return;
//     }
    
//     // Create preview URL
//     const previewUrl = URL.createObjectURL(file);
    
//     setMediaPreviews(prev => ({
//       ...prev,
//       [field]: previewUrl
//     }));
    
//     setMediaFiles(prev => ({
//       ...prev,
//       [field]: file
//     }));
//   };

//   // Handle remove media
//   const handleRemoveMedia = (field) => {
//     if (mediaPreviews[field] && mediaPreviews[field].startsWith('blob:')) {
//       URL.revokeObjectURL(mediaPreviews[field]);
//     }
//     setMediaPreviews(prev => ({ ...prev, [field]: null }));
//     setMediaFiles(prev => ({ ...prev, [field]: null }));
//   };

//   // Clean up previews on unmount
//   useEffect(() => {
//     return () => {
//       Object.values(mediaPreviews).forEach(preview => {
//         if (preview && preview.startsWith('blob:')) {
//           URL.revokeObjectURL(preview);
//         }
//       });
//     };
//   }, []);

//   const fetchExistingRegNumbers = async () => {
//     try {
//       const response = await axios.get(`${baseUrl}/api/getNewVehicles?page=1&limit=1000`);
//       if (response.data.success) {
//         const allRegNumbers = new Set();
//         response.data.data.forEach(vehicle => {
//           if (vehicle.registrationVehicles) {
//             vehicle.registrationVehicles.forEach(rv => {
//               allRegNumbers.add(rv.registrationNumber);
//             });
//           }
//         });
//         setExistingRegNumbersSet(allRegNumbers);
//       }
//     } catch (error) {
//       console.error("Error fetching existing registration numbers:", error);
//     }
//   };

//   const checkDuplicateRegistration = async (regNumber) => {
//     const cleanReg = unformatRegistrationNumber(regNumber);
//     const localDuplicate = vehicles.some(v => unformatRegistrationNumber(v.registrationNumber) === cleanReg);
//     if (localDuplicate) return true;
//     if (existingRegNumbersSet.has(cleanReg)) return true;
//     return false;
//   };

//   const fetchVehicleTypes = async () => {
//     try {
//       const response = await axios.get(`${baseUrl}/api/vehicle-types`);
//       if (response.data.success) {
//         setVehicleTypes(response.data.data);
//       }
//     } catch (error) {
//       console.error("Error fetching vehicle types:", error);
//     }
//   };

//   // Fetch complete vehicle details by type (including all registration vehicles)
//   const fetchVehicleByType = async (typeId) => {
//     if (!typeId) return;
    
//     setIsLoadingVehicleData(true);
//     try {
//       // Fetch all vehicles and filter by vehicle type
//       const response = await axios.get(`${baseUrl}/api/getNewVehicles?page=1&limit=100`);
//       if (response.data.success) {
//         const matchingVehicles = response.data.data.filter(v => 
//           v.basicInfo.vehicleType === typeId
//         );
        
//         if (matchingVehicles.length > 0) {
//           const selectedVehicleData = matchingVehicles[0];
//           setSelectedVehicleTypeData(selectedVehicleData);
          
//           // Populate tech specs
//           if (selectedVehicleData.techSpecs) {
//             setTechSpecs({
//               screenType: selectedVehicleData.techSpecs.screenType || "LED Only",
//               numberOfScreens: selectedVehicleData.techSpecs.numberOfScreens || "",
//               screenSizeWidth: selectedVehicleData.techSpecs.screenSizeWidth || "",
//               screenSizeHeight: selectedVehicleData.techSpecs.screenSizeHeight || "",
//               backScreenWidth: selectedVehicleData.techSpecs.backScreenWidth || "",
//               backScreenHeight: selectedVehicleData.techSpecs.backScreenHeight || "",
//               resolution: selectedVehicleData.techSpecs.resolution || "",
//               backResolution: selectedVehicleData.techSpecs.backResolution || "",
//               videoSize: selectedVehicleData.techSpecs.videoSize || "",
//               backVideoSize: selectedVehicleData.techSpecs.backVideoSize || "",
//               audioOutput: selectedVehicleData.techSpecs.audioOutput || "",
//               brightness: selectedVehicleData.techSpecs.brightness || "",
//               displayVersion: selectedVehicleData.techSpecs.displayVersion || "",
//               soundQuality: selectedVehicleData.techSpecs.soundQuality || "",
//               generatorCapacity: selectedVehicleData.techSpecs.generatorCapacity || "",
//               additionalFeatures: selectedVehicleData.techSpecs.additionalFeatures || "",
//             });
//           }
          
//           // Populate pricing
//           if (selectedVehicleData.pricing) {
//             setPricing({
//               basePriceType: selectedVehicleData.pricing.basePriceType || "Per Day",
//               costPerDay: selectedVehicleData.pricing.costPerDay || "",
//               avgKmPerDay: selectedVehicleData.pricing.avgKmPerDay || "",
//               extraKmPrice: selectedVehicleData.pricing.extraKmPrice || "",
//               avgBookingHrs: selectedVehicleData.pricing.avgBookingHrs || "",
//               extraHrPrice: selectedVehicleData.pricing.extraHrPrice || "",
//               rtoCharges: selectedVehicleData.pricing.rtoCharges || "",
//               fuelEfficiency: selectedVehicleData.pricing.fuelEfficiency || "",
//               minBookingDuration: selectedVehicleData.pricing.minBookingDuration || "",
//               overtimeCharges: selectedVehicleData.pricing.overtimeCharges || "",
//               waitingCharges: selectedVehicleData.pricing.waitingCharges || "",
//             });
//           }
          
//           // Populate vehicles list
//           if (selectedVehicleData.registrationVehicles && selectedVehicleData.registrationVehicles.length > 0) {
//             const formattedVehicles = selectedVehicleData.registrationVehicles.map(rv => ({
//               registrationNumber: rv.registrationNumber,
//               vehicleId: rv.vehicleId,
//               city: rv.city,
//               permitType: rv.permitType || "",
//               modelConfig: rv.modelConfig || "",
//               ownershipType: rv.ownershipType || "",
//               fuelType: rv.fuelType || "",
//               manufacturingYear: rv.manufacturingYear || "",
//               gpsEnabled: rv.gpsEnabled !== undefined ? rv.gpsEnabled : true,
//               activeStatus: rv.activeStatus !== undefined ? rv.activeStatus : true,
//               currentStatus: rv.statusAvailability?.currentStatus || "Available",
//               availableFrom: rv.statusAvailability?.availableFrom || "",
//               remarks: rv.statusAvailability?.remarks || "",
//               driverName: rv.driverDetails?.driverName || "",
//               driverPhone: rv.driverDetails?.driverPhone || "",
//               backupDriver: rv.driverDetails?.backupDriver || "",
//               backupDriverPhone: rv.driverDetails?.backupDriverPhone || "",
//               driverCharges: rv.driverDetails?.driverCharges || "",
//               lastServiceDate: rv.maintenance?.lastServiceDate || "",
//               insuranceExpiryDate: rv.maintenance?.insuranceExpiryDate || "",
//               pollutionExpiryDate: rv.maintenance?.pollutionExpiryDate || "",
//             }));
//             setVehicles(formattedVehicles);
            
//             // Update existing registration numbers set
//             const regNumbers = new Set(existingRegNumbersSet);
//             formattedVehicles.forEach(v => regNumbers.add(v.registrationNumber));
//             setExistingRegNumbersSet(regNumbers);
//           }
          
//           // Populate media previews (if any)
//           if (selectedVehicleData.mediaFiles) {
//             // For existing media, we would need URLs - store them for display
//             // This would require additional handling for preview from URLs
//           }
          
//           toast.success(`Loaded ${selectedVehicleData.registrationVehicles?.length || 0} vehicle(s) for this type`, {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//         } else {
//           // No existing vehicles found - clear previous data
//           setSelectedVehicleTypeData(null);
//           setVehicles([]);
//           toast.info("No existing vehicles found for this type. You can add new ones.", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching vehicle by type:", error);
//       toast.error("Error loading vehicle details", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//     } finally {
//       setIsLoadingVehicleData(false);
//     }
//   };

//   const createVehicleType = async (typeName) => {
//     try {
//       const response = await axios.post(`${baseUrl}/api/vehicle-types`, { typeName });
//       if (response.data.success) {
//         toast.success("Vehicle type created successfully");
//         await fetchVehicleTypes();
//         return response.data.data;
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Error creating vehicle type", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//       throw error;
//     }
//   };

//   const updateVehicleType = async (id, typeName) => {
//     try {
//       const response = await axios.put(`${baseUrl}/api/vehicle-types/${id}`, { typeName });
//       if (response.data.success) {
//         toast.success("Vehicle type updated successfully");
//         await fetchVehicleTypes();
//         return response.data.data;
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Error updating vehicle type", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//       throw error;
//     }
//   };

//   const deleteVehicleType = async (id) => {
//     try {
//       const response = await axios.delete(`${baseUrl}/api/vehicle-types/${id}`);
//       if (response.data.success) {
//         toast.success("Vehicle type deleted successfully");
//         await fetchVehicleTypes();
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Error deleting vehicle type", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//       throw error;
//     }
//   };

//   useEffect(() => {
//     fetchVehicleTypes();
//     fetchExistingRegNumbers();
//   }, []);

//   // Load vehicle data when type is selected
//   useEffect(() => {
//     if (commonInfo.vehicleType) {
//       fetchVehicleByType(commonInfo.vehicleType);
//     } else {
//       // Clear vehicles when no type selected
//       setVehicles([]);
//       setSelectedVehicleTypeData(null);
//     }
//   }, [commonInfo.vehicleType]);

//   const steps = [
//     { number: 1, title: "Basic Information" },
//     { number: 2, title: "Technical Specification" },
//     { number: 3, title: "Pricing & Charges" },
//     { number: 4, title: "Media & Description" },
//     { number: 5, title: "Drivers & Maintenance" },
//     { number: 6, title: "Vehicle Summary" },
//   ];

//   const canAccessStep6 = commonInfo.vehicleType && vehicles.length > 0 && pricing.costPerDay;

//   const handleAddVehicle = (vehicleData) => {
//     const newVehicle = {
//       registrationNumber: vehicleData.registrationNumber,
//       vehicleId: vehicleData.vehicleId,
//       city: vehicleData.city,
//       permitType: vehicleData.permitType,
//       modelConfig: vehicleData.modelConfig,
//       ownershipType: vehicleData.ownershipType,
//       fuelType: vehicleData.fuelType,
//       manufacturingYear: vehicleData.manufacturingYear,
//       gpsEnabled: vehicleData.gpsEnabled,
//       activeStatus: vehicleData.activeStatus,
//       currentStatus: vehicleData.currentStatus,
//       availableFrom: vehicleData.availableFrom,
//       remarks: vehicleData.remarks,
//       driverName: vehicleData.driverName,
//       driverPhone: vehicleData.driverPhone,
//       backupDriver: vehicleData.backupDriver,
//       backupDriverPhone: vehicleData.backupDriverPhone,
//       driverCharges: vehicleData.driverCharges,
//       lastServiceDate: vehicleData.lastServiceDate,
//       insuranceExpiryDate: vehicleData.insuranceExpiryDate,
//       pollutionExpiryDate: vehicleData.pollutionExpiryDate,
//     };

//     if (editingVehicle) {
//       setVehicles((prev) =>
//         prev.map((v) =>
//           v.registrationNumber === editingVehicle.registrationNumber ? newVehicle : v
//         )
//       );
//       toast.success("Vehicle updated successfully", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//     } else {
//       const exists = vehicles.some((v) => v.registrationNumber === vehicleData.registrationNumber);
//       if (exists) {
//         toast.error("Vehicle with this registration number already exists", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//         return;
//       }
//       setVehicles((prev) => [...prev, newVehicle]);
//       setExistingRegNumbersSet(prev => new Set([...prev, vehicleData.registrationNumber]));
//       toast.success("Vehicle added successfully", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//     }
//     setEditingVehicle(null);
//   };

//   const handleEditVehicle = (vehicle) => {
//     setEditingVehicle(vehicle);
//     setIsModalOpen(true);
//   };

//   const handleDeleteVehicle = (registrationNumber) => {
//     if (window.confirm("Are you sure you want to remove this vehicle?")) {
//       setVehicles((prev) => prev.filter((v) => v.registrationNumber !== registrationNumber));
//       toast.success("Vehicle removed successfully", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//     }
//   };

//   const handleSaveMaintenance = (registrationNumber, data) => {
//     setVehicles((prev) =>
//       prev.map((v) =>
//         v.registrationNumber === registrationNumber
//           ? { 
//               ...v, 
//               driverName: data.driverName,
//               driverPhone: data.driverPhone,
//               backupDriver: data.backupDriver,
//               backupDriverPhone: data.backupDriverPhone,
//               driverCharges: data.driverCharges,
//               lastServiceDate: data.lastServiceDate,
//               insuranceExpiryDate: data.insuranceExpiryDate,
//               pollutionExpiryDate: data.pollutionExpiryDate,
//             }
//           : v
//       )
//     );
//     toast.success(`Driver & Maintenance details saved for ${formatRegistrationNumber(registrationNumber)}`, {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//   };

//   const validateForm = () => {
//     const errors = {};
//     if (!commonInfo.vehicleType) errors.vehicleType = "Vehicle Type is required";
//     if (vehicles.length === 0) errors.vehicles = "At least one vehicle is required";
//     if (!pricing.costPerDay) errors.costPerDay = "Base Cost is required";
    
//     // Validate manufacturing year for each vehicle
//     const currentYear = new Date().getFullYear();
//     for (const vehicle of vehicles) {
//       if (vehicle.manufacturingYear) {
//         const yearNum = parseInt(vehicle.manufacturingYear);
//         if (isNaN(yearNum) || yearNum > currentYear) {
//           errors.manufacturingYear = `Manufacturing year cannot exceed ${currentYear}`;
//           break;
//         }
//       }
//     }
    
//     setValidationErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (currentStep !== 6) {
//       return;
//     }

//     if (!validateForm()) {
//       toast.error("Please fix the validation errors before submitting", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//       return;
//     }

//     setLoading(true);
//     setUploadProgress(0);

//     try {
//       const formData = new FormData();

//       const registrationVehicles = vehicles.map(vehicle => ({
//         registrationNumber: vehicle.registrationNumber,
//         vehicleId: vehicle.vehicleId,
//         city: vehicle.city,
//         modelConfig: vehicle.modelConfig,
//         permitType: vehicle.permitType,
//         ownershipType: vehicle.ownershipType,
//         fuelType: vehicle.fuelType,
//         manufacturingYear: vehicle.manufacturingYear,
//         gpsEnabled: vehicle.gpsEnabled,
//         activeStatus: vehicle.activeStatus,
//         currentStatus: vehicle.currentStatus,
//         availableFrom: vehicle.availableFrom,
//         remarks: vehicle.remarks,
//         lastServiceDate: vehicle.lastServiceDate,
//         insuranceExpiryDate: vehicle.insuranceExpiryDate,
//         pollutionExpiryDate: vehicle.pollutionExpiryDate,
//         driverName: vehicle.driverName,
//         driverPhone: vehicle.driverPhone,
//         backupDriver: vehicle.backupDriver,
//         backupDriverPhone: vehicle.backupDriverPhone,
//         driverCharges: vehicle.driverCharges
//       }));

//       const payload = {
//         basicInfo: {
//           customizedType: commonInfo.customizedType,
//           vehicleType: commonInfo.vehicleType,
//         },
//         techSpecs: techSpecs,
//         pricing: pricing,
//         registrationVehicles: registrationVehicles,
//       };

//       formData.append('data', JSON.stringify(payload));

//       // Append media files
//       Object.keys(mediaFiles).forEach(key => {
//         if (mediaFiles[key] && mediaFiles[key] instanceof File) {
//           formData.append(key, mediaFiles[key]);
//         }
//       });

//       const response = await axios.post(`${baseUrl}/api/createVehicle`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//         onUploadProgress: (progressEvent) => {
//           const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//           setUploadProgress(percentCompleted);
//         },
//       });

//       if (response.data.success) {
//         toast.success(response.data.message, {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//         // Reset form
//         setVehicles([]);
//         setCommonInfo({ customizedType: "Non-Customized", vehicleType: "", vehicleName: "" });
//         setTechSpecs({
//           screenType: "LED Only",
//           numberOfScreens: "",
//           screenSizeWidth: "",
//           screenSizeHeight: "",
//           backScreenWidth: "",
//           backScreenHeight: "",
//           resolution: "",
//           backResolution: "",
//           videoSize: "",
//           backVideoSize: "",
//           audioOutput: "",
//           brightness: "",
//           displayVersion: "",
//           soundQuality: "",
//           generatorCapacity: "",
//           additionalFeatures: "",
//         });
//         setPricing({
//           basePriceType: "Per Day",
//           costPerDay: "",
//           avgKmPerDay: "",
//           extraKmPrice: "",
//           avgBookingHrs: "",
//           extraHrPrice: "",
//           rtoCharges: "",
//           fuelEfficiency: "",
//           minBookingDuration: "",
//           overtimeCharges: "",
//           waitingCharges: "",
//         });
        
//         // Reset media files and previews
//         Object.keys(mediaPreviews).forEach(key => {
//           if (mediaPreviews[key] && mediaPreviews[key].startsWith('blob:')) {
//             URL.revokeObjectURL(mediaPreviews[key]);
//           }
//         });
//         setMediaFiles({
//           frontViewImage: null,
//           leftSideImage: null,
//           rightSideImage: null,
//           rearViewImage: null,
//           interiorImage: null,
//           demoVideo: null,
//         });
//         setMediaPreviews({
//           frontViewImage: null,
//           leftSideImage: null,
//           rightSideImage: null,
//           rearViewImage: null,
//           interiorImage: null,
//           demoVideo: null,
//         });
        
//         setCurrentStep(1);
//         setUploadProgress(0);
//         fetchExistingRegNumbers();
//       }
//     } catch (error) {
//       console.error("Error submitting form:", error);
//       toast.error(error.response?.data?.message || "Error saving vehicle. Please try again.", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const mediaItems = [
//     { key: "frontViewImage", label: "Front View", icon: "📸", accept: "image/*" },
//     { key: "leftSideImage", label: "Left Side View", icon: "⬅️", accept: "image/*" },
//     { key: "rightSideImage", label: "Right Side View", icon: "➡️", accept: "image/*" },
//     { key: "rearViewImage", label: "Rear View", icon: "🔭", accept: "image/*" },
//     { key: "interiorImage", label: "Interior", icon: "🖼️", accept: "image/*" },
//     { key: "demoVideo", label: "Demo Video", icon: "🎬", accept: "video/*" },
//   ];

//   const getSelectOptions = () => ({
//     customizedVehiclesOptions: [
//       { value: "Non-Customized", label: "Non-Customized" },
//     ],
//     vehicleTypeOptions: vehicleTypes.map((vt) => ({ value: vt._id, label: vt.typeName })),
//     screenTypeOptions: [
//       { value: "LED Only", label: "LED Only" },
//       { value: "Flex Only", label: "Flex Only" },
//       { value: "Flex + LED", label: "Flex + LED" },
//     ],
//     soundQualityOptions: [
//       { value: "Standard", label: "Standard" },
//       { value: "High", label: "High" },
//       { value: "Studio", label: "Studio" },
//     ],
//     basePriceTypeOptions: [
//       { value: "Per Day", label: "Per Day" },
//       { value: "Per Hour", label: "Per Hour" },
//       { value: "Per KM", label: "Per KM" },
//     ],
//   });

//   const selectOptions = getSelectOptions();

//   const handleInputChange = (setter, field) => (e) => {
//     setter(prev => ({ ...prev, [field]: e.target.value }));
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
//       <ToastContainer position="top-right" />

//       <div className="px-6 pt-6">
//         <div className="text-sm text-gray-500 dark:text-gray-400">
//           🏠 Dashboard &gt; Vehicle Management &gt; Onboarding
//         </div>
//       </div>

//       <div className="px-6 py-4">
//         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
//           🚌 Vehicle Onboarding Management
//         </h1>
//         <p className="text-gray-500 dark:text-gray-400 mt-1">
//           Add and manage your advertising vehicles with complete details
//         </p>
//       </div>

//       <AddVehicleModal
//         isOpen={isModalOpen}
//         onClose={() => {
//           setIsModalOpen(false);
//           setEditingVehicle(null);
//         }}
//         onSave={handleAddVehicle}
//         editingVehicle={editingVehicle}
//         existingRegNumbers={vehicles.map(v => v.registrationNumber)}
//         onCheckDuplicate={checkDuplicateRegistration}
//       />

//       <MaintenanceModal
//         isOpen={isMaintenanceModalOpen}
//         onClose={() => {
//           setIsMaintenanceModalOpen(false);
//           setSelectedVehicle(null);
//         }}
//         vehicle={selectedVehicle}
//         onSave={handleSaveMaintenance}
//       />

//       <VehicleTypeModal
//         isOpen={isTypeModalOpen}
//         onClose={() => {
//           setIsTypeModalOpen(false);
//           setEditingType(null);
//         }}
//         onSave={createVehicleType}
//         onUpdate={updateVehicleType}
//         onDelete={deleteVehicleType}
//         editingType={editingType}
//         vehicleTypes={vehicleTypes}
//         setEditingType={setEditingType}
//       />

//       <form onSubmit={handleSubmit}>
//         <div className="px-6 pb-10">
//           <StepperHeader
//             steps={steps}
//             currentStep={currentStep}
//             onStepClick={setCurrentStep}
//             canAccessStep6={canAccessStep6}
//           />

//           {isLoadingVehicleData && (
//             <div className="text-center py-4">
//               <div className="inline-flex items-center gap-2 text-blue-600">
//                 <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//                 Loading vehicle details...
//               </div>
//             </div>
//           )}

//           {currentStep === 1 && (
//             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
//               <div className="flex justify-between items-center mb-6">
//                 <SectionHeader number={1} title="Basic Information" icon="📋" />
//                 <button
//                   type="button"
//                   onClick={() => setIsTypeModalOpen(true)}
//                   className="text-sm text-blue-600 hover:text-blue-700"
//                 >
//                   Manage Vehicle Types
//                 </button>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <Label>⚙️ Customized  <span className="text-red-500">*</span></Label>
//                   <div className="relative">
//                     <Select
//                       options={selectOptions.customizedVehiclesOptions}
//                       placeholder="Select"
//                       value={commonInfo.customizedType}
//                       onChange={(value) => setCommonInfo((prev) => ({ ...prev, customizedType: value }))}
//                     />
//                     <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                       <ChevronDownIcon />
//                     </span>
//                   </div>
//                 </div>

//                 <div>
//                   <Label>🚍 Vehicle Type <span className="text-red-500">*</span></Label>
//                   <div className="relative">
//                     <Select
//                       options={selectOptions.vehicleTypeOptions}
//                       placeholder="Select Type"
//                       value={commonInfo.vehicleType}
//                       onChange={(value) => {
//                         setCommonInfo((prev) => ({ ...prev, vehicleType: value }));
//                       }}
//                     />
//                     <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                       <ChevronDownIcon />
//                     </span>
//                   </div>
//                   {validationErrors.vehicleType && (
//                     <p className="mt-1 text-xs text-red-500">{validationErrors.vehicleType}</p>
//                   )}
//                   <p className="mt-1 text-xs text-gray-400">
//                     Selecting a vehicle type will auto-fill technical specs, pricing, and existing vehicles if previously configured
//                   </p>
//                 </div>
//               </div>

//               <div className="mt-8">
//                 <Label className="text-base font-semibold">
//                   🔢 Registration Numbers <span className="text-red-500">*</span>
//                 </Label>
//                 <p className="text-sm text-gray-500 mb-4">
//                   Add one or more registration numbers (Format: XX NN XX NNNN)
//                 </p>

//                 {vehicles.length > 0 ? (
//                   <div className="overflow-x-auto border rounded-lg">
//                     <table className="w-full text-sm">
//                       <thead className="bg-gray-50 dark:bg-gray-700">
//                         <tr>
//                           <th className="px-4 py-3 text-left">Reg. Number</th>
//                           <th className="px-4 py-3 text-left">Vehicle ID</th>
//                           <th className="px-4 py-3 text-left">City</th>
//                           <th className="px-4 py-3 text-left">Permit</th>
//                           <th className="px-4 py-3 text-left">Fuel</th>
//                           <th className="px-4 py-3 text-left">Status</th>
//                           <th className="px-4 py-3 text-center">Actions</th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y">
//                         {vehicles.map((vehicle) => (
//                           <tr key={vehicle.registrationNumber} className="hover:bg-gray-50">
//                             <td className="px-4 py-3 font-mono font-semibold text-blue-700">{formatRegistrationNumber(vehicle.registrationNumber)}</td>
//                             <td className="px-4 py-3 text-sm text-gray-600">{vehicle.vehicleId}</td>
//                             <td className="px-4 py-3">{vehicle.city}</td>
//                             <td className="px-4 py-3">{vehicle.permitType}</td>
//                             <td className="px-4 py-3">{vehicle.fuelType}</td>
//                             <td className="px-4 py-3"><StatusBadge status={vehicle.currentStatus || "Available"} /></td>
//                             <td className="px-4 py-3 text-center">
//                               <div className="flex justify-center gap-3">
//                                 <button
//                                   type="button"
//                                   onClick={() => handleEditVehicle(vehicle)}
//                                   className="text-blue-500 hover:text-blue-700"
//                                   title="Edit"
//                                 >
//                                   <NotebookPen size={16} />
//                                 </button>
//                                 <button
//                                   type="button"
//                                   onClick={() => {
//                                     setSelectedVehicle(vehicle);
//                                     setIsMaintenanceModalOpen(true);
//                                   }}
//                                   className="text-green-500 hover:text-green-700"
//                                   title="Maintenance"
//                                 >
//                                   🔧
//                                 </button>
//                                 <button
//                                   type="button"
//                                   onClick={() => handleDeleteVehicle(vehicle.registrationNumber)}
//                                   className="text-red-500 hover:text-red-700"
//                                   title="Delete"
//                                 >
//                                   <Trash2 size={16} />
//                                 </button>
//                               </div>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 ) : (
//                   <div className="text-center py-10 border-2 border-dashed rounded-lg text-gray-400">
//                     <div className="text-4xl mb-2">🚚</div>
//                     <p>No vehicles added yet</p>
//                   </div>
//                 )}

//                 <button
//                   type="button"
//                   onClick={() => setIsModalOpen(true)}
//                   className="flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700 font-medium"
//                 >
//                   <PlusIcon className="w-4 h-4" />
//                   Add Another Vehicle
//                 </button>
//                 {validationErrors.vehicles && (
//                   <p className="mt-1 text-xs text-red-500">{validationErrors.vehicles}</p>
//                 )}
//               </div>
//             </div>
//           )}

//           {currentStep === 2 && (
//             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
//               <SectionHeader number={2} title="Technical Specifications" icon="🖥️" />

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                 <div>
//                   <Label>📺 Screen Type <span className="text-red-500">*</span></Label>
//                   <div className="relative">
//                     <Select
//                       options={selectOptions.screenTypeOptions}
//                       placeholder="LED Only"
//                       value={techSpecs.screenType}
//                       onChange={(value) => setTechSpecs((prev) => ({ ...prev, screenType: value }))}
//                     />
//                     <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                       <ChevronDownIcon />
//                     </span>
//                   </div>
//                 </div>
//                 <div>
//                   <Label>🔢 Number of Screens <span className="text-red-500">*</span></Label>
//                   <Input
//                     type="text"
//                     placeholder="e.g. 2"
//                     value={techSpecs.numberOfScreens}
//                     onChange={(e) => {
//                       if (validateNumber(e.target.value, false)) {
//                         setTechSpecs((prev) => ({ ...prev, numberOfScreens: e.target.value }));
//                       }
//                     }}
//                   />
//                 </div>

//                 <div>
//                   <Label>Left/Right Screen Size <span className="text-red-500">*</span></Label>
//                   <div className="flex gap-2">
//                     <Input
//                       type="text"
//                       value={techSpecs.screenSizeWidth}
//                       placeholder="Width (ft)"
//                       className="flex-1"
//                       onChange={(e) => {
//                         if (validateNumber(e.target.value, true)) {
//                           setTechSpecs((prev) => ({ ...prev, screenSizeWidth: e.target.value }));
//                         }
//                       }}
//                     />
//                     <Input
//                       type="text"
//                       value={techSpecs.screenSizeHeight}
//                       placeholder="Height (ft)"
//                       className="flex-1"
//                       onChange={(e) => {
//                         if (validateNumber(e.target.value, true)) {
//                           setTechSpecs((prev) => ({ ...prev, screenSizeHeight: e.target.value }));
//                         }
//                       }}
//                     />
//                   </div>
//                 </div>
      
//                 <div>
//                   <Label>Back Screen Size <span className="text-red-500">*</span></Label>
//                   <div className="flex gap-2">
//                     <Input
//                       type="text"
//                       value={techSpecs.backScreenWidth}
//                       placeholder="Width (ft)"
//                       className="flex-1"
//                       onChange={(e) => {
//                         if (validateNumber(e.target.value, true)) {
//                           setTechSpecs((prev) => ({ ...prev, backScreenWidth: e.target.value }));
//                         }
//                       }}
//                     />
//                     <Input
//                       type="text"
//                       value={techSpecs.backScreenHeight}
//                       placeholder="Height (ft)"
//                       className="flex-1"
//                       onChange={(e) => {
//                         if (validateNumber(e.target.value, true)) {
//                           setTechSpecs((prev) => ({ ...prev, backScreenHeight: e.target.value }));
//                         }
//                       }}
//                     />
//                   </div>
//                 </div>
      
//                 <div>
//                   <Label>Front Resolution <span className="text-red-500">*</span></Label>
//                   <Input
//                     type="text"
//                     value={techSpecs.resolution}
//                     placeholder="e.g., 1920x1080"
//                     onChange={handleInputChange(setTechSpecs, "resolution")}
//                   />
//                 </div>
      
//                 <div>
//                   <Label>Back Resolution <span className="text-red-500">*</span></Label>
//                   <Input
//                     type="text"
//                     value={techSpecs.backResolution}
//                     placeholder="e.g., 480x520"
//                     onChange={handleInputChange(setTechSpecs, "backResolution")}
//                   />
//                 </div>
      
//                 <div>
//                   <Label>Front Video Size <span className="text-red-500">*</span></Label>
//                   <Input
//                     type="text"
//                     value={techSpecs.videoSize}
//                     placeholder="e.g., 1920x1080 px"
//                     onChange={handleInputChange(setTechSpecs, "videoSize")}
//                   />
//                 </div>
      
//                 <div>
//                   <Label>Back Video Size <span className="text-red-500">*</span></Label>
//                   <Input
//                     type="text"
//                     value={techSpecs.backVideoSize}
//                     placeholder="e.g., 480x520 px"
//                     onChange={handleInputChange(setTechSpecs, "backVideoSize")}
//                   />
//                 </div>
      
//                 <div>
//                   <Label>Audio Output <span className="text-red-500">*</span></Label>
//                   <Input
//                     type="text"
//                     value={techSpecs.audioOutput}
//                     placeholder="e.g., 600 watts"
//                     onChange={(e) => {
//                       if (validateNumber(e.target.value, true)) {
//                         setTechSpecs((prev) => ({ ...prev, audioOutput: e.target.value }));
//                       }
//                     }}
//                   />
//                 </div>
      
//                 <div>
//                   <Label>Generator Capacity <span className="text-red-500">*</span></Label>
//                   <Input
//                     type="text"
//                     value={techSpecs.generatorCapacity}
//                     placeholder="e.g., 7 KV"
//                     onChange={handleInputChange(setTechSpecs, "generatorCapacity")}
//                   />
//                 </div>
      
//                 <div>
//                   <Label>Brightness (Nits)</Label>
//                   <Input
//                     type="text"
//                     value={techSpecs.brightness}
//                     placeholder="e.g. 5500"
//                     onChange={(e) => {
//                       if (validateNumber(e.target.value, false)) {
//                         setTechSpecs((prev) => ({ ...prev, brightness: e.target.value }));
//                       }
//                     }}
//                   />
//                 </div>
      
//                 <div>
//                   <Label>Display Version / Controller <span className="text-red-500">*</span></Label>
//                   <Input
//                     type="text"
//                     value={techSpecs.displayVersion}
//                     placeholder="e.g. NovaStar A8s"
//                     onChange={handleInputChange(setTechSpecs, "displayVersion")}
//                   />
//                 </div>
                
//                 <div>
//                   <Label>🎚️ Sound Quality <span className="text-red-500">*</span></Label>
//                   <div className="relative">
//                     <Select 
//                       options={selectOptions.soundQualityOptions} 
//                       placeholder="Select Quality" 
//                       value={techSpecs.soundQuality} 
//                       onChange={(value) => setTechSpecs((prev) => ({ ...prev, soundQuality: value }))} 
//                     />
//                     <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                       <ChevronDownIcon />
//                     </span>
//                   </div>
//                 </div>

//                 <div className="md:col-span-2">
//                   <Label>✨ Additional Features </Label>
//                   <Input 
//                     placeholder="e.g. Built-in Amplifier, USB, WiFi" 
//                     value={techSpecs.additionalFeatures} 
//                     onChange={(e) => setTechSpecs((prev) => ({ ...prev, additionalFeatures: e.target.value }))} 
//                   />
//                 </div>
//               </div>

//               <button
//                 type="button"
//                 onClick={() => setShowMoreTech(!showMoreTech)}
//                 className="mt-6 text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
//               >
//                 {showMoreTech ? "▲" : "▼"} Show More Technical Options
//               </button>

//               {showMoreTech && (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6 pt-6 border-t">
//                   <div>
//                     <Label>🎬 Video Format</Label>
//                     <Input placeholder="e.g. MP4" />
//                   </div>
//                   <div>
//                     <Label>🔉 Audio Output</Label>
//                     <Input placeholder="e.g. 600 watts" />
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {currentStep === 3 && (
//             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
//               <SectionHeader number={3} title="Pricing & Charges" icon="💰" />

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <Label>📊 Base Price Type <span className="text-red-500">*</span></Label>
//                   <div className="relative">
//                     <Select 
//                       options={selectOptions.basePriceTypeOptions} 
//                       placeholder="Per Day" 
//                       value={pricing.basePriceType} 
//                       onChange={(value) => setPricing((prev) => ({ ...prev, basePriceType: value }))} 
//                     />
//                     <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                       <ChevronDownIcon />
//                     </span>
//                   </div>
//                 </div>
                
//                 <div>
//                   <Label>💵 Per Day Cost (₹) <span className="text-red-500">*</span></Label>
//                   <Input 
//                     type="text" 
//                     placeholder="e.g. 5000" 
//                     value={pricing.costPerDay} 
//                     onChange={(e) => {
//                       if (validateNumber(e.target.value, false)) {
//                         setPricing((prev) => ({ ...prev, costPerDay: e.target.value }));
//                       }
//                     }} 
//                   />
//                   {validationErrors.costPerDay && <p className="mt-1 text-xs text-red-500">{validationErrors.costPerDay}</p>}
//                 </div>

//                 <div>
//                   <Label>Average KM Per Day <span className="text-red-500">*</span></Label>
//                   <Input
//                     type="text"
//                     value={pricing.avgKmPerDay}
//                     placeholder="e.g. 60"
//                     onChange={(e) => {
//                       if (validateNumber(e.target.value, false)) {
//                         setPricing((prev) => ({ ...prev, avgKmPerDay: e.target.value }));
//                       }
//                     }}
//                   />
//                 </div>

//                 <div>
//                   <Label>Extra Charges (₹ / Km) <span className="text-red-500">*</span></Label>
//                   <Input
//                     type="text"
//                     value={pricing.extraKmPrice}
//                     placeholder="e.g. 12"
//                     onChange={(e) => {
//                       if (validateNumber(e.target.value, false)) {
//                         setPricing((prev) => ({ ...prev, extraKmPrice: e.target.value }));
//                       }
//                     }}
//                   />
//                 </div>

//                 <div>
//                   <Label>Average Booking Hours <span className="text-red-500">*</span></Label>
//                   <Input
//                     type="text"
//                     value={pricing.avgBookingHrs}
//                     placeholder="e.g. 8"
//                     onChange={(e) => {
//                       if (validateNumber(e.target.value, false)) {
//                         setPricing((prev) => ({ ...prev, avgBookingHrs: e.target.value }));
//                       }
//                     }}
//                   />
//                 </div>

//                 <div>
//                   <Label>Extra Charges (₹ / hr) <span className="text-red-500">*</span></Label>
//                   <Input
//                     type="text"
//                     value={pricing.extraHrPrice}
//                     placeholder="e.g. 500"
//                     onChange={(e) => {
//                       if (validateNumber(e.target.value, false)) {
//                         setPricing((prev) => ({ ...prev, extraHrPrice: e.target.value }));
//                       }
//                     }}
//                   />
//                 </div>

//                 <div>
//                   <Label>RTO Charges (₹) <span className="text-red-500">*</span></Label>
//                   <Input
//                     type="text"
//                     value={pricing.rtoCharges}
//                     placeholder="e.g. 10,000"
//                     onChange={(e) => {
//                       if (validateNumber(e.target.value, false)) {
//                         setPricing((prev) => ({ ...prev, rtoCharges: e.target.value }));
//                       }
//                     }}
//                   />
//                 </div>

//                 <div>
//                   <Label>Fuel Efficiency (km/l)</Label>
//                   <Input
//                     type="text"
//                     value={pricing.fuelEfficiency}
//                     placeholder="e.g. 6.5"
//                     onChange={(e) => {
//                       if (validateNumber(e.target.value, true)) {
//                         setPricing((prev) => ({ ...prev, fuelEfficiency: e.target.value }));
//                       }
//                     }}
//                   />
//                 </div>

//                 <div>
//                   <Label>Minimum Booking Duration <span className="text-red-500">*</span></Label>
//                   <Input
//                     type="text"
//                     value={pricing.minBookingDuration}
//                     placeholder="e.g. 4 hrs"
//                     onChange={handleInputChange(setPricing, "minBookingDuration")}
//                   />
//                 </div>

//                 <div>
//                   <Label>Overtime Charges (₹ / hr)</Label>
//                   <Input
//                     type="text"
//                     value={pricing.overtimeCharges}
//                     placeholder="e.g. 500"
//                     onChange={(e) => {
//                       if (validateNumber(e.target.value, false)) {
//                         setPricing((prev) => ({ ...prev, overtimeCharges: e.target.value }));
//                       }
//                     }}
//                   />
//                 </div>

//                 <div>
//                   <Label>Waiting Charges (₹ / hr)</Label>
//                   <Input
//                     type="text"
//                     value={pricing.waitingCharges}
//                     placeholder="e.g. 300"
//                     onChange={(e) => {
//                       if (validateNumber(e.target.value, false)) {
//                         setPricing((prev) => ({ ...prev, waitingCharges: e.target.value }));
//                       }
//                     }}
//                   />
//                 </div>
//               </div>
//             </div>
//           )}

//           {currentStep === 4 && (
//             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
//               <SectionHeader number={4} title="Media & Description" icon="🎞️" />

//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {mediaItems.map(({ key, label, icon, accept }) => (
//                   <MediaPreviewCard
//                     key={key}
//                     label={label}
//                     icon={icon}
//                     accept={accept}
//                     file={mediaFiles[key]}
//                     previewUrl={mediaPreviews[key]}
//                     onUpload={(file) => handleMediaUpload(key, file)}
//                     onRemove={() => handleRemoveMedia(key)}
//                   />
//                 ))}
//               </div>

//               <div className="mt-6">
//                 <Label>📝 Vehicle Description <span className="text-red-500">*</span></Label>
//                 <textarea 
//                   rows={4} 
//                   className="w-full mt-1 rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white" 
//                   placeholder="Enter detailed description about the vehicle..." 
//                 />
//               </div>
//             </div>
//           )}

//           {currentStep === 5 && (
//             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
//               <SectionHeader number={5} title="Drivers & Maintenance" icon="🧑‍✈️" />

//               {vehicles.length === 0 ? (
//                 <div className="text-center py-10 text-gray-500">Please add vehicles in Basic Info section first</div>
//               ) : (
//                 <div className="space-y-6">
//                   <div className="overflow-x-auto border rounded-lg">
//                     <table className="w-full text-sm">
//                       <thead className="bg-gray-50 dark:bg-gray-700">
//                         <tr>
//                           <th className="px-4 py-3 text-left">Reg. Number</th>
//                           <th className="px-4 py-3 text-left">Driver Name</th>
//                           <th className="px-4 py-3 text-left">Driver Phone</th>
//                           <th className="px-4 py-3 text-left">Last Service</th>
//                           <th className="px-4 py-3 text-left">Insurance Expiry</th>
//                           <th className="px-4 py-3 text-left">Pollution Expiry</th>
//                           <th className="px-4 py-3 text-center">Actions</th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y">
//                         {vehicles.map((vehicle) => (
//                           <tr key={vehicle.registrationNumber} className="hover:bg-gray-50">
//                             <td className="px-4 py-3 font-mono font-semibold text-blue-600">{formatRegistrationNumber(vehicle.registrationNumber)}</td>
//                             <td className="px-4 py-3">{vehicle.driverName || "-"}</td>
//                             <td className="px-4 py-3">{vehicle.driverPhone || "-"}</td>
//                             <td className="px-4 py-3">{vehicle.lastServiceDate || "-"}</td>
//                             <td className="px-4 py-3">{vehicle.insuranceExpiryDate || "-"}</td>
//                             <td className="px-4 py-3">{vehicle.pollutionExpiryDate || "-"}</td>
//                             <td className="px-4 py-3 text-center">
//                               <button
//                                 type="button"
//                                 onClick={() => {
//                                   setSelectedVehicle(vehicle);
//                                   setIsMaintenanceModalOpen(true);
//                                 }}
//                                 className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
//                               >
//                                 Edit Details
//                               </button>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {currentStep === 6 && (
//             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
//               <SectionHeader number={6} title="Vehicle Summary" icon="📊" />

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div className="bg-blue-50 rounded-lg p-4">
//                   <p className="text-sm text-gray-500">🚚 Total Vehicles</p>
//                   <p className="text-2xl font-bold text-blue-600">{vehicles.length}</p>
//                 </div>
//                 <div className="bg-green-50 rounded-lg p-4">
//                   <p className="text-sm text-gray-500">💵 Base Price</p>
//                   <p className="text-2xl font-bold text-green-600">₹{pricing.costPerDay || 0}</p>
//                 </div>
//                 <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-100">
//                   <p className="text-sm text-gray-500">🚍 Vehicle Type</p>
//                   <p className="text-lg font-semibold text-purple-600">
//                     {vehicleTypes.find(vt => vt._id === commonInfo.vehicleType)?.typeName || "Not selected"}
//                   </p>
//                 </div>
//               </div>

//               {vehicles.length > 0 && (
//                 <div className="mt-6">
//                   <Label className="font-semibold">🔢 Vehicles to be onboarded:</Label>
//                   <div className="mt-2 space-y-2">
//                     {vehicles.map((v, idx) => (
//                       <div key={idx} className="flex items-center gap-2 text-sm p-3 bg-gray-50 rounded-lg">
//                         <span className="w-6 text-gray-400">{idx + 1}.</span>
//                         <span className="font-mono font-semibold text-blue-600">{formatRegistrationNumber(v.registrationNumber)}</span>
//                         <span className="text-gray-400">—</span>
//                         <span className="text-gray-600">{v.city}</span>
//                         <span className="text-gray-400">·</span>
//                         <span className="text-gray-500">{v.fuelType}</span>
//                         <span className="ml-auto"><StatusBadge status={v.currentStatus || "Available"} /></span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
//                 <p className="text-sm text-yellow-800">⚠️ Please review all details before submitting. Click the Submit button below to save all vehicles.</p>
//               </div>
//             </div>
//           )}

//           {uploadProgress > 0 && uploadProgress < 100 && (
//             <div className="mt-6">
//               <div className="flex justify-between mb-1">
//                 <span className="text-sm text-gray-600">Uploading...</span>
//                 <span className="text-sm text-gray-600">{uploadProgress}%</span>
//               </div>
//               <div className="w-full bg-gray-200 rounded-full h-2">
//                 <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
//               </div>
//             </div>
//           )}

//           <div className="flex justify-between gap-4 mt-8">
//             <button type="button" onClick={() => window.location.reload()} className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">× Cancel</button>
//             <div className="flex gap-3">
//               {currentStep > 1 && (
//                 <button type="button" onClick={() => setCurrentStep((prev) => prev - 1)} className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
//                   ← Previous
//                 </button>
//               )}
//               {currentStep < 6 ? (
//                 <button 
//                   type="button" 
//                   onClick={() => {
//                     if (currentStep === 1 && (!commonInfo.vehicleType || vehicles.length === 0)) {
//                       toast.error("Please select vehicle type and add at least one vehicle", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//                       return;
//                     }
//                     if (currentStep === 3 && !pricing.costPerDay) {
//                       toast.error("Please set the base price", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//                       return;
//                     }
//                     setCurrentStep((prev) => prev + 1);
//                   }} 
//                   className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
//                 >
//                   Save & Next →
//                 </button>
//               ) : (
//                 <button 
//                   type="button"
//                   onClick={handleSubmit}
//                   disabled={loading} 
//                   className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
//                 >
//                   {loading ? "Saving..." : `✅ Submit ${vehicles.length} Vehicle(s)`}
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// }




// //Radio group for no.of screens, fetch the vehicle details based on the vehicle type but autosubmit error in the 5th step 

// /* eslint-disable */
// // @ts-nocheck

// "use client";

// import React, { useState, useEffect, useCallback } from "react";
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import Label from "@/components/form/Label";
// import Input from "@/components/form/input/InputField";
// import Select from "@/components/form/Select";
// import { ChevronDownIcon, PlusIcon } from "@/icons";
// import Switch from "@/components/form/switch/Switch";
// import axios from "axios";
// import { baseUrl } from '../../../../../BaseUrl';
// import { NotebookPen, Trash2, Calendar, Upload, X, Eye } from 'lucide-react';

// // ─── Validation Helpers ───────────────────────────────────────────────────────
// const validateYear = (year) => {
//   if (!year) return true;
//   const currentYear = new Date().getFullYear();
//   const yearNum = parseInt(year);
//   if (isNaN(yearNum)) return false;
//   return yearNum <= currentYear && yearNum >= 1900;
// };

// const validateNumber = (value, allowDecimal = false) => {
//   if (!value || value === "") return true;
//   if (allowDecimal) {
//     return /^\d*\.?\d*$/.test(value);
//   }
//   return /^\d*$/.test(value);
// };

// const validatePhoneNumber = (phone) => {
//   if (!phone || phone === "") return true;
//   return /^\d{10}$/.test(phone);
// };

// // ─── Radio Button Group Component ───────────────────────────────────────────
// const RadioGroup = ({ label, options, value, onChange, required = false }) => {
//   return (
//     <div>
//       <Label className="mb-2 block">
//         {label} {required && <span className="text-red-500">*</span>}
//       </Label>
//       <div className="flex gap-4">
//         {options.map((option) => (
//           <label key={option.value} className="flex items-center gap-2 cursor-pointer">
//             <input
//               type="radio"
//               name={label}
//               value={option.value}
//               checked={value === option.value}
//               onChange={(e) => onChange(e.target.value)}
//               className="w-4 h-4 text-blue-600 focus:ring-blue-500"
//             />
//             <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
//           </label>
//         ))}
//       </div>
//     </div>
//   );
// };

// // ─── Inline Textarea ───────────────────────────────────────────────────────────
// const Textarea = ({ rows = 3, placeholder, value, onChange, className = "", disabled = false }) => (
//   <textarea
//     rows={rows}
//     className={`w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white disabled:bg-gray-100 disabled:cursor-not-allowed dark:disabled:bg-gray-800 ${className}`}
//     placeholder={placeholder}
//     value={value}
//     onChange={onChange}
//     disabled={disabled}
//   />
// );

// // ─── Date Input with Calendar Icon ───────────────────────────────────────────
// const DateInput = ({ value, onChange, placeholder, disabled = false, required = false }) => {
//   return (
//     <div className="relative">
//       <Input
//         type="date"
//         value={value}
//         onChange={onChange}
//         placeholder={placeholder}
//         disabled={disabled}
//         className={`${disabled ? 'bg-gray-100 dark:bg-gray-800' : ''} pr-10`}
//       />
//       <span className="absolute text-gray-400 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-500">
//         <Calendar size={16} />
//       </span>
//       {required && value && <span className="absolute text-green-500 right-3 top-1/2 -translate-y-1/2">✓</span>}
//     </div>
//   );
// };

// // ─── Image/Video Preview Component with URL support ─────────────────────────
// const MediaPreviewCard = ({ label, file, previewUrl, existingUrl, onUpload, onRemove, icon, accept }) => {
//   const [showPreview, setShowPreview] = useState(false);
  
//   const getPreviewContent = () => {
//     const displayUrl = previewUrl || existingUrl;
//     if (displayUrl) {
//       if (accept === "video/*") {
//         return (
//           <video 
//             src={displayUrl} 
//             className="w-full h-32 object-cover rounded-lg"
//             controls={showPreview}
//           />
//         );
//       } else {
//         return (
//           <img 
//             src={displayUrl} 
//             alt={label}
//             className="w-full h-32 object-cover rounded-lg"
//             onError={(e) => { e.target.src = ''; e.target.parentElement.innerHTML = '<div class="text-gray-400">No preview</div>'; }}
//           />
//         );
//       }
//     }
//     return (
//       <div className="w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
//         <span className="text-4xl">{icon}</span>
//       </div>
//     );
//   };

//   const hasMedia = !!(file || existingUrl);

//   return (
//     <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-200">
//       <div className="relative group">
//         <div className="mb-3">
//           {getPreviewContent()}
//         </div>
        
//         {file && (
//           <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 truncate">
//             {file.name}
//           </div>
//         )}
        
//         <div className="flex gap-2 justify-center mt-3 flex-wrap">
//           <label className="cursor-pointer">
//             <span className="inline-flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors">
//               <Upload size={12} />
//               {hasMedia ? "Change" : "Upload"}
//             </span>
//             <input 
//               type="file" 
//               className="hidden" 
//               accept={accept}
//               onChange={(e) => {
//                 const selectedFile = e.target.files?.[0];
//                 if (selectedFile) {
//                   onUpload(selectedFile);
//                 }
//               }} 
//             />
//           </label>
          
//           {hasMedia && (
//             <>
//               <button
//                 type="button"
//                 onClick={() => setShowPreview(!showPreview)}
//                 className="inline-flex items-center gap-1 text-xs bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg transition-colors"
//               >
//                 <Eye size={12} />
//                 {showPreview ? "Hide" : "Preview"}
//               </button>
              
//               <button
//                 type="button"
//                 onClick={onRemove}
//                 className="inline-flex items-center gap-1 text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-colors"
//               >
//                 <X size={12} />
//                 Remove
//               </button>
//             </>
//           )}
//         </div>
//       </div>
//       <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-2">{label}</p>
//     </div>
//   );
// };

// // ─── Stepper Header ─────────────────────────────────────────────────────────
// const StepperHeader = ({ steps, currentStep, onStepClick, canAccessStep6 }) => {
//   return (
//     <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-6 px-6 py-4 overflow-x-auto">
//       <div className="flex items-center min-w-max gap-0">
//         {steps.map((step, idx) => {
//           const isCompleted = currentStep > step.number;
//           const isActive = currentStep === step.number;
//           const isDisabled = step.number === 6 && !canAccessStep6;
          
//           return (
//             <React.Fragment key={step.number}>
//               <button
//                 type="button"
//                 onClick={() => !isDisabled && onStepClick(step.number)}
//                 className="flex items-center gap-2 group focus:outline-none"
//                 disabled={isDisabled}
//               >
//                 <div
//                   className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all duration-200 flex-shrink-0 ${
//                     isCompleted
//                       ? "bg-blue-600 text-white"
//                       : isActive
//                       ? "bg-blue-600 text-white ring-4 ring-blue-100"
//                       : isDisabled
//                       ? "bg-gray-300 text-gray-400 cursor-not-allowed dark:bg-gray-700"
//                       : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
//                   }`}
//                 >
//                   {isCompleted ? (
//                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
//                       <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
//                     </svg>
//                   ) : (
//                     step.number
//                   )}
//                 </div>
//                 <span
//                   className={`text-sm font-medium whitespace-nowrap transition-colors ${
//                     isActive
//                       ? "text-blue-600 dark:text-blue-400"
//                       : isCompleted
//                       ? "text-blue-500 dark:text-blue-400"
//                       : isDisabled
//                       ? "text-gray-400 cursor-not-allowed"
//                       : "text-gray-400 dark:text-gray-500"
//                   }`}
//                 >
//                   {step.title}
//                 </span>
//               </button>
//               {idx < steps.length - 1 && (
//                 <div className="flex items-center mx-2 flex-shrink-0">
//                   <div
//                     className={`h-0.5 w-10 rounded transition-colors duration-300 ${
//                       currentStep > step.number ? "bg-blue-400" : "bg-gray-200 dark:bg-gray-700"
//                     }`}
//                   />
//                 </div>
//               )}
//             </React.Fragment>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// // ─── Section Card Header ────────────────────────────────────────────
// const SectionHeader = ({ number, title, icon }) => (
//   <div className="flex items-center gap-3 mb-6">
//     <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-600 text-white text-sm font-bold shadow-md">
//       {number}
//     </div>
//     <div>
//       <h2 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
//         {icon && <span className="mr-2">{icon}</span>}
//         {title}
//       </h2>
//     </div>
//   </div>
// );

// // ─── Status Badge ─────────────────────────────────────────────────────────────
// const StatusBadge = ({ status }) => {
//   const styles = {
//     Available: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
//     Unavailable: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
//   };
//   return (
//     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.Available}`}>
//       {status}
//     </span>
//   );
// };

// // ─── Validation helpers ───────────────────────────────────────────────────────
// const isValidRegistrationNumber = (regNumber) => {
//   if (!regNumber || regNumber.trim() === "") return false;
//   const clean = regNumber.replace(/\s/g, "");
//   if (clean.length !== 10) return false;
//   return /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/.test(clean);
// };

// const formatRegistrationNumber = (regNumber) => {
//   if (!regNumber) return "";
//   const clean = regNumber.replace(/\s/g, "").toUpperCase();
//   if (clean.length !== 10) return regNumber;
//   return `${clean.slice(0,2)} ${clean.slice(2,4)} ${clean.slice(4,6)} ${clean.slice(6,10)}`;
// };

// const unformatRegistrationNumber = (regNumber) => {
//   if (!regNumber) return "";
//   return regNumber.replace(/\s/g, "").toUpperCase();
// };

// // ─── Vehicle Type Management Modal ───────────────────────────────────────────
// const VehicleTypeModal = ({ isOpen, onClose, onSave, onUpdate, onDelete, editingType, vehicleTypes, setEditingType }) => {
//   const [typeName, setTypeName] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showAddForm, setShowAddForm] = useState(false);

//   useEffect(() => {
//     if (editingType) {
//       setTypeName(editingType.typeName);
//       setShowAddForm(true);
//     } else {
//       setTypeName("");
//     }
//   }, [editingType, isOpen]);

//   const handleSubmit = async () => {
//     if (!typeName.trim()) {
//       toast.error("Please enter vehicle type name");
//       return;
//     }
//     setLoading(true);
//     try {
//       if (editingType) {
//         await onUpdate(editingType._id, typeName);
//         setEditingType(null);
//       } else {
//         await onSave(typeName);
//       }
//       setTypeName("");
//       setShowAddForm(false);
//       onClose();
//     } catch (error) {
//       console.error("Error saving vehicle type:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to permanently delete this vehicle type?")) {
//       setLoading(true);
//       try {
//         await onDelete(id);
//         onClose();
//       } catch (error) {
//         console.error("Error deleting vehicle type:", error);
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
//       style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
//     >
//       <div className="bg-white rounded-xl w-full max-w-2xl mx-4 my-8 dark:bg-gray-800 shadow-2xl">
//         <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
//           <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
//             📋 Manage Vehicle Types
//           </h3>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-2xl leading-none"
//           >
//             ×
//           </button>
//         </div>

//         <div className="p-6">
//           <button
//             onClick={() => setShowAddForm(!showAddForm)}
//             className="flex items-center gap-2 mb-4 text-blue-600 hover:text-blue-700"
//           >
//             <PlusIcon className="w-4 h-4" />
//             Add New Vehicle Type
//           </button>

//           {showAddForm && (
//             <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
//               <Label>Vehicle Type Name</Label>
//               <div className="flex gap-2 mt-2">
//                 <Input
//                   type="text"
//                   placeholder="e.g., Standard, Premium, Deluxe"
//                   value={typeName}
//                   onChange={(e) => setTypeName(e.target.value)}
//                   className="flex-1"
//                 />
//                 <button
//                   onClick={handleSubmit}
//                   disabled={loading}
//                   className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                 >
//                   {loading ? "Saving..." : editingType ? "Update" : "Add"}
//                 </button>
//               </div>
//             </div>
//           )}

//           <div className="mt-4">
//             <Label>Existing Vehicle Types</Label>
//             <div className="mt-2 space-y-2 max-h-80 overflow-y-auto">
//               {vehicleTypes.map((type) => (
//                 <div key={type._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
//                   <span className="text-gray-800 dark:text-white">{type.typeName}</span>
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => {
//                         setEditingType(type);
//                         setTypeName(type.typeName);
//                         setShowAddForm(true);
//                       }}
//                       className="text-blue-500 hover:text-blue-700"
//                     >
//                       <NotebookPen size={16} />
//                     </button>
//                     <button
//                       onClick={() => handleDelete(type._id)}
//                       className="text-red-500 hover:text-red-700"
//                     >
//                       <Trash2 size={16} />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ─── Add Vehicle Modal with Full Field Support ─────────────────────────────────
// const AddVehicleModal = ({ isOpen, onClose, onSave, editingVehicle, existingRegNumbers, onCheckDuplicate, vehicleTypes }) => {
//   const [formData, setFormData] = useState({
//     registrationNumber: "",
//     vehicleId: "", 
//     city: "",
//     permitType: "",
//     modelConfig: "",
//     ownershipType: "",
//     fuelType: "",
//     manufacturingYear: "",
//     gpsEnabled: true,
//     activeStatus: true,
//     currentStatus: "Available",
//     availableFrom: "",
//     remarks: "",
//     driverName: "",
//     driverPhone: "",
//     backupDriver: "",
//     backupDriverPhone: "",
//     driverCharges: "",
//     lastServiceDate: "",
//     insuranceExpiryDate: "",
//     pollutionExpiryDate: "",
//   });
  
//   const [registrationError, setRegistrationError] = useState("");
//   const [yearError, setYearError] = useState("");
//   const [phoneError, setPhoneError] = useState("");
//   const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [isGeneratingId, setIsGeneratingId] = useState(false);
//   const [cityFilter, setCityFilter] = useState("");
//   const [customCities, setCustomCities] = useState([]);

//   const generateVehicleIdFromBackend = async () => {
//     setIsGeneratingId(true);
//     try {
//       const response = await axios.get(`${baseUrl}/api/generate-vehicle-id`);
//       if (response.data.success) {
//         return response.data.vehicleId;
//       }
//     } catch (error) {
//       console.error("Error generating vehicle ID:", error);
//       const now = new Date();
//       const day = String(now.getDate()).padStart(2, '0');
//       const month = String(now.getMonth() + 1).padStart(2, '0');
//       const year = String(now.getFullYear()).slice(-2);
//       const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
//       return `${day}${month}${year}${random}`;
//     } finally {
//       setIsGeneratingId(false);
//     }
//   };

//   useEffect(() => {
//     if (!editingVehicle && isOpen) {
//       const generateId = async () => {
//         const newVehicleId = await generateVehicleIdFromBackend();
//         setFormData(prev => ({ ...prev, vehicleId: newVehicleId }));
//       };
//       generateId();
//     }
//   }, [isOpen, editingVehicle]);

//   useEffect(() => {
//     if (editingVehicle) {
//       setFormData({
//         registrationNumber: formatRegistrationNumber(editingVehicle.registrationNumber) || "",
//         vehicleId: editingVehicle.vehicleId || "",
//         city: editingVehicle.city || "",
//         permitType: editingVehicle.permitType || "",
//         modelConfig: editingVehicle.modelConfig || "",
//         ownershipType: editingVehicle.ownershipType || "",
//         fuelType: editingVehicle.fuelType || "",
//         manufacturingYear: editingVehicle.manufacturingYear || "",
//         gpsEnabled: editingVehicle.gpsEnabled !== undefined ? editingVehicle.gpsEnabled : true,
//         activeStatus: editingVehicle.activeStatus !== undefined ? editingVehicle.activeStatus : true,
//         currentStatus: editingVehicle.currentStatus || "Available",
//         availableFrom: editingVehicle.availableFrom || "",
//         remarks: editingVehicle.remarks || "",
//         driverName: editingVehicle.driverName || "",
//         driverPhone: editingVehicle.driverPhone || "",
//         backupDriver: editingVehicle.backupDriver || "",
//         backupDriverPhone: editingVehicle.backupDriverPhone || "",
//         driverCharges: editingVehicle.driverCharges || "",
//         lastServiceDate: editingVehicle.lastServiceDate || "",
//         insuranceExpiryDate: editingVehicle.insuranceExpiryDate || "",
//         pollutionExpiryDate: editingVehicle.pollutionExpiryDate || "",
//       });
//     } else {
//       setFormData({
//         registrationNumber: "",
//         vehicleId: "",
//         city: "",
//         permitType: "",
//         modelConfig: "",
//         ownershipType: "",
//         fuelType: "",
//         manufacturingYear: "",
//         gpsEnabled: true,
//         activeStatus: true,
//         currentStatus: "Available",
//         availableFrom: "",
//         remarks: "",
//         driverName: "",
//         driverPhone: "",
//         backupDriver: "",
//         backupDriverPhone: "",
//         driverCharges: "",
//         lastServiceDate: "",
//         insuranceExpiryDate: "",
//         pollutionExpiryDate: "",
//       });
//     }
//     setRegistrationError("");
//     setYearError("");
//     setPhoneError("");
//   }, [editingVehicle, isOpen]);

//   const handleYearChange = (value) => {
//     const currentYear = new Date().getFullYear();
//     if (value === "" || /^\d*$/.test(value)) {
//       if (value && parseInt(value) > currentYear) {
//         setYearError(`Year cannot exceed ${currentYear}`);
//       } else if (value && parseInt(value) < 1900) {
//         setYearError("Year must be 1900 or later");
//       } else {
//         setYearError("");
//       }
//       setFormData((prev) => ({ ...prev, manufacturingYear: value }));
//     }
//   };

//   const handlePhoneChange = (field, value) => {
//     if (value === "" || /^\d*$/.test(value)) {
//       if (value && value.length > 10) return;
//       setFormData((prev) => ({ ...prev, [field]: value }));
//       if (field === "driverPhone" && value && value.length === 10) {
//         setPhoneError("");
//       } else if (field === "driverPhone" && value && value.length !== 10 && value.length > 0) {
//         setPhoneError("Phone number must be 10 digits");
//       } else {
//         setPhoneError("");
//       }
//     }
//   };

//   const checkDuplicateRealTime = useCallback(async (value) => {
//     const cleanValue = unformatRegistrationNumber(value);
//     if (cleanValue.length === 10 && isValidRegistrationNumber(value)) {
//       setIsCheckingDuplicate(true);
//       try {
//         const isDuplicate = await onCheckDuplicate(cleanValue, editingVehicle?.registrationNumber);
//         if (isDuplicate && !editingVehicle) {
//           setRegistrationError("This registration number already exists");
//         } else {
//           setRegistrationError("");
//         }
//       } catch (error) {
//         console.error("Duplicate check error:", error);
//       } finally {
//         setIsCheckingDuplicate(false);
//       }
//     } else {
//       setRegistrationError("");
//     }
//   }, [editingVehicle, onCheckDuplicate]);

//   const handleRegNumberChange = (value) => {
//     let cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
//     let validated = "";
//     let pos = 0;
//     for (let i = 0; i < cleaned.length && pos < 10; i++) {
//       const char = cleaned[i];
//       if (pos < 2 && /[A-Z]/.test(char)) { validated += char; pos++; }
//       else if (pos >= 2 && pos < 4 && /[0-9]/.test(char)) { validated += char; pos++; }
//       else if (pos >= 4 && pos < 6 && /[A-Z]/.test(char)) { validated += char; pos++; }
//       else if (pos >= 6 && pos < 10 && /[0-9]/.test(char)) { validated += char; pos++; }
//     }
//     let formatted = validated.slice(0, 2);
//     if (validated.length > 2) formatted += " " + validated.slice(2, 4);
//     if (validated.length > 4) formatted += " " + validated.slice(4, 6);
//     if (validated.length > 6) formatted += " " + validated.slice(6, 10);
    
//     setFormData((prev) => ({ ...prev, registrationNumber: formatted }));
    
//     const clean = unformatRegistrationNumber(formatted);
//     if (clean.length === 10 && isValidRegistrationNumber(formatted)) {
//       checkDuplicateRealTime(formatted);
//     } else if (clean.length > 0 && clean.length < 10) {
//       setRegistrationError(`Need ${10 - clean.length} more character(s)`);
//     } else if (clean.length === 10 && !isValidRegistrationNumber(formatted)) {
//       setRegistrationError("Invalid format. Use: XX NN XX NNNN");
//     } else {
//       setRegistrationError("");
//     }
//   };

//   const handleAddCity = () => {
//     if (cityFilter && !selectOptions.cityOptions.some(opt => opt.value === cityFilter)) {
//       setCustomCities(prev => [...prev, { value: cityFilter, label: cityFilter }]);
//       setFormData(prev => ({ ...prev, city: cityFilter }));
//       setCityFilter("");
//     }
//   };

//   const selectOptions = {
//     cityOptions: [
//       { value: "Chennai", label: "Chennai" },
//       { value: "Madurai", label: "Madurai" },
//       { value: "Coimbatore", label: "Coimbatore" },
//       { value: "Bangalore", label: "Bangalore" },
//       { value: "Hyderabad", label: "Hyderabad" },
//       { value: "Mumbai", label: "Mumbai" },
//       { value: "Delhi", label: "Delhi" },
//       { value: "Kolkata", label: "Kolkata" },
//       ...customCities
//     ],
//     permitOptions: [
//       { value: "Local", label: "Local" },
//       { value: "State", label: "State" },
//       { value: "National", label: "National" },
//     ],
//     modelOptions: [
//       { value: "Standard", label: "Standard" },
//       { value: "Premium", label: "Premium" },
//       { value: "Deluxe", label: "Deluxe" },
//     ],
//     ownershipOptions: [
//       { value: "Owned", label: "Owned" },
//       { value: "Leased", label: "Leased" },
//       { value: "Rented", label: "Rented" },
//     ],
//     fuelTypeOptions: [
//       { value: "Petrol", label: "Petrol" },
//       { value: "Diesel", label: "Diesel" },
//       { value: "CNG", label: "CNG" },
//       { value: "Electric", label: "Electric" },
//     ],
//     currentStatusOptions: [
//       { value: "Available", label: "Available" },
//       { value: "Unavailable", label: "Unavailable" }
//     ],
//   };

//   const handleSubmit = async () => {
//     const cleanReg = unformatRegistrationNumber(formData.registrationNumber);
//     if (!cleanReg || cleanReg.length !== 10 || !isValidRegistrationNumber(formData.registrationNumber)) {
//       toast.error("Please enter a valid registration number");
//       return;
//     }
//     if (!formData.city) { toast.error("City is required"); return; }
//     if (!formData.permitType) { toast.error("Permit Type is required"); return; }
//     if (!formData.modelConfig) { toast.error("Model Configuration is required"); return; }
//     if (!formData.ownershipType) { toast.error("Ownership Type is required"); return; }
//     if (!formData.fuelType) { toast.error("Fuel Type is required"); return; }
    
//     if (formData.manufacturingYear) {
//       const currentYear = new Date().getFullYear();
//       const yearNum = parseInt(formData.manufacturingYear);
//       if (isNaN(yearNum) || yearNum > currentYear) {
//         toast.error(`Manufacturing year cannot exceed ${currentYear}`);
//         return;
//       }
//     }
    
//     if (formData.driverPhone && formData.driverPhone.length !== 10) {
//       toast.error("Driver phone number must be 10 digits");
//       return;
//     }
    
//     if (formData.backupDriverPhone && formData.backupDriverPhone.length !== 10 && formData.backupDriverPhone.length > 0) {
//       toast.error("Backup driver phone number must be 10 digits");
//       return;
//     }
    
//     if (formData.currentStatus === "Unavailable" && !formData.availableFrom) {
//       toast.error("Please provide Available From date for Unavailable status");
//       return;
//     }
//     if (formData.currentStatus === "Unavailable" && !formData.remarks) {
//       toast.error("Please provide remarks for Unavailable status");
//       return;
//     }
    
//     const isDuplicate = await onCheckDuplicate(cleanReg, editingVehicle?.registrationNumber);
//     if (isDuplicate && !editingVehicle) {
//       toast.error("This registration number already exists");
//       return;
//     }
    
//     setLoading(true);
//     try {
//       onSave({ ...formData, registrationNumber: cleanReg });
//       onClose();
//     } catch (error) {
//       console.error("Error saving vehicle:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   const showUnavailableFields = formData.currentStatus === "Unavailable";

//   return (
//     <div
//       className="fixed inset-0 z-99999 flex items-center justify-center overflow-y-auto"
//       style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
//     >
//       <div className="bg-white rounded-xl w-full max-w-4xl mx-4 my-8 dark:bg-gray-800 shadow-2xl">
//         <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
//           <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
//             🚚 {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
//           </h3>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-2xl leading-none"
//           >
//             ×
//           </button>
//         </div>

//         <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
//           <div className="space-y-6">
//             <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
//               <Label>🔢 Registration Number <span className="text-red-500">*</span></Label>
//               <div className="relative">
//                 <Input
//                   type="text"
//                   value={formData.registrationNumber}
//                   onChange={(e) => handleRegNumberChange(e.target.value)}
//                   placeholder="TN 01 AB 1234"
//                   maxLength={13}
//                   className={registrationError ? "border-red-500" : ""}
//                 />
//                 {isCheckingDuplicate && (
//                   <span className="absolute right-3 top-1/2 -translate-y-1/2">
//                     <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//                   </span>
//                 )}
//               </div>
//               {registrationError && (
//                 <p className="mt-1 text-xs text-red-500">{registrationError}</p>
//               )}
//               {!registrationError &&
//                 formData.registrationNumber &&
//                 isValidRegistrationNumber(formData.registrationNumber) && (
//                   <p className="mt-1 text-xs text-green-500">✓ Valid registration number</p>
//                 )}
//             </div>

//             <div>
//               <Label>🆔 Vehicle ID <span className="text-red-500">*</span></Label>
//               <div className="relative">
//                 <Input
//                   type="text"
//                   value={formData.vehicleId || (isGeneratingId ? "Generating..." : "")}
//                   placeholder="Auto generated"
//                   disabled
//                   className={`bg-gray-100 dark:bg-gray-800 cursor-not-allowed ${
//                     isGeneratingId ? 'animate-pulse' : ''
//                   }`}
//                 />
//                 {isGeneratingId && (
//                   <div className="absolute right-3 top-1/2 -translate-y-1/2">
//                     <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//                   </div>
//                 )}
//               </div>
//               <p className="mt-1 text-xs text-gray-400">
//                 {formData.vehicleId 
//                   ? `Vehicle ID: ${formData.vehicleId}` 
//                   : "Vehicle ID will be auto-generated"}
//               </p>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//               <div>
//                 <Label>🏙️ City / Operating Location <span className="text-red-500">*</span></Label>
//                 <div className="relative">
//                   <Select
//                     options={selectOptions.cityOptions}
//                     placeholder="Select City"
//                     value={formData.city}
//                     onChange={(value) => setFormData((prev) => ({ ...prev, city: value }))}
//                   />
//                   <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                     <ChevronDownIcon />
//                   </span>
//                 </div>
//                 <div className="mt-2 flex gap-2">
//                   <Input
//                     type="text"
//                     placeholder="Add new city"
//                     value={cityFilter}
//                     onChange={(e) => setCityFilter(e.target.value)}
//                     className="flex-1 text-sm"
//                   />
//                   <button
//                     type="button"
//                     onClick={handleAddCity}
//                     className="px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
//                   >
//                     Add
//                   </button>
//                 </div>
//               </div>

//               <div>
//                 <Label>📋 Permit Type </Label>
//                 <div className="relative">
//                   <Select
//                     options={selectOptions.permitOptions}
//                     placeholder="Select Permit"
//                     value={formData.permitType}
//                     onChange={(value) => setFormData((prev) => ({ ...prev, permitType: value }))}
//                   />
//                   <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                     <ChevronDownIcon />
//                   </span>
//                 </div>
//               </div>

//               <div>
//                 <Label>⚙️ Model / Configuration </Label>
//                 <div className="relative">
//                   <Select
//                     options={selectOptions.modelOptions}
//                     placeholder="Select Model"
//                     value={formData.modelConfig}
//                     onChange={(value) => setFormData((prev) => ({ ...prev, modelConfig: value }))}
//                   />
//                   <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                     <ChevronDownIcon />
//                   </span>
//                 </div>
//               </div>

//               <div>
//                 <Label>🏢 Ownership Type </Label>
//                 <div className="relative">
//                   <Select
//                     options={selectOptions.ownershipOptions}
//                     placeholder="Select Ownership"
//                     value={formData.ownershipType}
//                     onChange={(value) => setFormData((prev) => ({ ...prev, ownershipType: value }))}
//                   />
//                   <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                     <ChevronDownIcon />
//                   </span>
//                 </div>
//               </div>

//               <div>
//                 <Label>⛽ Fuel Type <span className="text-red-500">*</span></Label>
//                 <div className="relative">
//                   <Select
//                     options={selectOptions.fuelTypeOptions}
//                     placeholder="Select Fuel Type"
//                     value={formData.fuelType}
//                     onChange={(value) => setFormData((prev) => ({ ...prev, fuelType: value }))}
//                   />
//                   <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                     <ChevronDownIcon />
//                   </span>
//                 </div>
//               </div>

//               <div>
//                 <Label>📅 Manufacturing Year <span className="text-red-500">*</span></Label>
//                 <Input
//                   type="text"
//                   placeholder="e.g. 2023"
//                   maxLength={4}
//                   value={formData.manufacturingYear}
//                   onChange={(e) => handleYearChange(e.target.value)}
//                   className={yearError ? "border-red-500" : ""}
//                 />
//                 {yearError && <p className="mt-1 text-xs text-red-500">{yearError}</p>}
//                 <p className="mt-1 text-xs text-gray-400">Cannot exceed current year</p>
//               </div>
//             </div>

//             <div className="border-t pt-6 mt-2">
//               <Label className="text-base font-semibold">📌 Status & Availability</Label>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
//                 <div>
//                   <Label>Current Status <span className="text-red-500">*</span></Label>
//                   <div className="relative">
//                     <Select
//                       options={selectOptions.currentStatusOptions}
//                       placeholder="Select status"
//                       value={formData.currentStatus}
//                       onChange={(value) => setFormData(prev => ({ ...prev, currentStatus: value, availableFrom: "", remarks: "" }))}
//                     />
//                     <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                       <ChevronDownIcon />
//                     </span>
//                   </div>
//                 </div>
                
//                 {showUnavailableFields && (
//                   <>
//                     <div>
//                       <Label>Available From </Label>
//                       <DateInput 
//                         value={formData.availableFrom}
//                         onChange={(e) => setFormData(prev => ({ ...prev, availableFrom: e.target.value }))}
//                       />
//                     </div>
//                     <div className="md:col-span-2">
//                       <Label>Remarks <span className="text-red-500">*</span></Label>
//                       <Textarea
//                         placeholder="Enter remarks about unavailability..."
//                         value={formData.remarks}
//                         onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
//                         rows={2}
//                       />
//                     </div>
//                   </>
//                 )}
//               </div>
//             </div>

//             <div className="flex gap-6 pt-2">
//               <div>
//                 <Label>📡 GPS Enabled <span className="text-red-500">*</span></Label>
//                 <Switch
//                   label={formData.gpsEnabled ? "Enabled" : "Disabled"}
//                   defaultChecked={formData.gpsEnabled}
//                   onChange={(checked) => setFormData((prev) => ({ ...prev, gpsEnabled: checked }))}
//                 />
//               </div>
//               <div>
//                 <Label>✅ Active Status <span className="text-red-500">*</span></Label>
//                 <Switch
//                   label={formData.activeStatus ? "Active" : "Inactive"}
//                   defaultChecked={formData.activeStatus}
//                   onChange={(checked) => setFormData((prev) => ({ ...prev, activeStatus: checked }))}
//                 />
//               </div>
//             </div>

//             <div className="border-t pt-6 mt-2">
//               <Label className="text-base font-semibold">👤 Driver Details (Optional) </Label>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
//                 <div>
//                   <Label>Driver Name</Label>
//                   <Input placeholder="Enter driver name" value={formData.driverName} onChange={(e) => setFormData(prev => ({ ...prev, driverName: e.target.value }))} />
//                 </div>
//                 <div>
//                   <Label>Driver Phone</Label>
//                   <Input 
//                     placeholder="Enter 10-digit phone number" 
//                     maxLength={10} 
//                     value={formData.driverPhone} 
//                     onChange={(e) => handlePhoneChange("driverPhone", e.target.value)}
//                     className={phoneError && formData.driverPhone ? "border-red-500" : ""}
//                   />
//                   {phoneError && formData.driverPhone && <p className="mt-1 text-xs text-red-500">{phoneError}</p>}
//                 </div>
//                 <div>
//                   <Label>Backup Driver (Optional)</Label>
//                   <Input placeholder="Enter backup driver name" value={formData.backupDriver} onChange={(e) => setFormData(prev => ({ ...prev, backupDriver: e.target.value }))} />
//                 </div>
//                 <div>
//                   <Label>Backup Driver Phone (Optional)</Label>
//                   <Input 
//                     placeholder="Enter 10-digit phone number" 
//                     maxLength={10} 
//                     value={formData.backupDriverPhone} 
//                     onChange={(e) => handlePhoneChange("backupDriverPhone", e.target.value)} 
//                   />
//                 </div>
//                 <div>
//                   <Label>Driver Charges (₹) (Optional)</Label>
//                   <Input 
//                     placeholder="e.g. 800" 
//                     value={formData.driverCharges} 
//                     onChange={(e) => {
//                       if (validateNumber(e.target.value, false)) {
//                         setFormData(prev => ({ ...prev, driverCharges: e.target.value }));
//                       }
//                     }} 
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="border-t pt-6 mt-2">
//               <Label className="text-base font-semibold">🔧 Maintenance Details (Optional) </Label>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
//                 <div>
//                   <Label>Last Service Date</Label>
//                   <DateInput value={formData.lastServiceDate} onChange={(e) => setFormData(prev => ({ ...prev, lastServiceDate: e.target.value }))} />
//                 </div>
//                 <div>
//                   <Label>Insurance Expiry Date</Label>
//                   <DateInput value={formData.insuranceExpiryDate} onChange={(e) => setFormData(prev => ({ ...prev, insuranceExpiryDate: e.target.value }))} />
//                 </div>
//                 <div>
//                   <Label>Pollution Expiry Date</Label>
//                   <DateInput value={formData.pollutionExpiryDate} onChange={(e) => setFormData(prev => ({ ...prev, pollutionExpiryDate: e.target.value }))} />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="flex justify-end gap-3 p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-xl">
//           <button
//             type="button"
//             onClick={onClose}
//             className="px-5 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
//           >
//             Cancel
//           </button>
//           <button
//             type="button"
//             onClick={handleSubmit}
//             disabled={loading}
//             className="px-5 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
//           >
//             {loading ? "Saving..." : editingVehicle ? "Update Vehicle" : "Add Vehicle"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ─── Maintenance Modal ───────────────────────────────────────────────────────
// const MaintenanceModal = ({ isOpen, onClose, vehicle, onSave }) => {
//   const [maintenanceData, setMaintenanceData] = useState({
//     lastServiceDate: "",
//     insuranceExpiryDate: "",
//     pollutionExpiryDate: "",
//   });
//   const [driverData, setDriverData] = useState({
//     driverName: "",
//     driverPhone: "",
//     backupDriver: "",
//     backupDriverPhone: "",
//     driverCharges: "",
//   });
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (vehicle) {
//       setMaintenanceData({
//         lastServiceDate: vehicle.lastServiceDate || "",
//         insuranceExpiryDate: vehicle.insuranceExpiryDate || "",
//         pollutionExpiryDate: vehicle.pollutionExpiryDate || "",
//       });
//       setDriverData({
//         driverName: vehicle.driverName || "",
//         driverPhone: vehicle.driverPhone || "",
//         backupDriver: vehicle.backupDriver || "",
//         backupDriverPhone: vehicle.backupDriverPhone || "",
//         driverCharges: vehicle.driverCharges || "",
//       });
//     }
//   }, [vehicle, isOpen]);

//   const handleSubmit = () => {
//     setLoading(true);
//     onSave(vehicle.registrationNumber, { ...maintenanceData, ...driverData });
//     setTimeout(() => {
//       setLoading(false);
//       onClose();
//     }, 500);
//   };

//   if (!isOpen) return null;

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
//       style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
//     >
//       <div className="bg-white rounded-xl w-full max-w-3xl mx-4 my-8 dark:bg-gray-800 shadow-2xl">
//         <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
//           <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
//             🔧 Driver & Maintenance Details: <span className="font-mono text-blue-600">{formatRegistrationNumber(vehicle?.registrationNumber)}</span>
//           </h3>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-2xl leading-none"
//           >
//             ×
//           </button>
//         </div>

//         <div className="p-6">
//           <div className="mb-6">
//             <Label className="text-base font-semibold">👤 Driver Details</Label>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
//               <div>
//                 <Label>Driver Name</Label>
//                 <Input value={driverData.driverName} onChange={(e) => setDriverData(prev => ({ ...prev, driverName: e.target.value }))} />
//               </div>
//               <div>
//                 <Label>Driver Phone</Label>
//                 <Input value={driverData.driverPhone} onChange={(e) => setDriverData(prev => ({ ...prev, driverPhone: e.target.value }))} maxLength={10} />
//               </div>
//               <div>
//                 <Label>Backup Driver</Label>
//                 <Input value={driverData.backupDriver} onChange={(e) => setDriverData(prev => ({ ...prev, backupDriver: e.target.value }))} />
//               </div>
//               <div>
//                 <Label>Backup Driver Phone</Label>
//                 <Input value={driverData.backupDriverPhone} onChange={(e) => setDriverData(prev => ({ ...prev, backupDriverPhone: e.target.value }))} maxLength={10} />
//               </div>
//               <div>
//                 <Label>Driver Charges (₹)</Label>
//                 <Input value={driverData.driverCharges} onChange={(e) => setDriverData(prev => ({ ...prev, driverCharges: e.target.value }))} />
//               </div>
//             </div>
//           </div>

//           <div className="border-t pt-6">
//             <Label className="text-base font-semibold">🔧 Maintenance Details</Label>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
//               <div>
//                 <Label>Last Service Date</Label>
//                 <DateInput
//                   value={maintenanceData.lastServiceDate}
//                   onChange={(e) => setMaintenanceData(prev => ({ ...prev, lastServiceDate: e.target.value }))}
//                 />
//               </div>
//               <div>
//                 <Label>Insurance Expiry Date</Label>
//                 <DateInput
//                   value={maintenanceData.insuranceExpiryDate}
//                   onChange={(e) => setMaintenanceData(prev => ({ ...prev, insuranceExpiryDate: e.target.value }))}
//                 />
//               </div>
//               <div>
//                 <Label>Pollution Certificate Expiry Date</Label>
//                 <DateInput
//                   value={maintenanceData.pollutionExpiryDate}
//                   onChange={(e) => setMaintenanceData(prev => ({ ...prev, pollutionExpiryDate: e.target.value }))}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="flex justify-end gap-3 p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-xl">
//           <button
//             type="button"
//             onClick={onClose}
//             className="px-5 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
//           >
//             Cancel
//           </button>
//           <button
//             type="button"
//             onClick={handleSubmit}
//             disabled={loading}
//             className="px-5 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
//           >
//             {loading ? "Saving..." : "Save Details"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ─── Main Component ───────────────────────────────────────────────────────────
// export default function VehicleOnboardingForm() {
//   const [vehicles, setVehicles] = useState([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
//   const [selectedVehicle, setSelectedVehicle] = useState(null);
//   const [editingVehicle, setEditingVehicle] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [currentStep, setCurrentStep] = useState(1);
//   const [vehicleTypes, setVehicleTypes] = useState([]);
//   const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
//   const [editingType, setEditingType] = useState(null);
//   const [existingRegNumbersSet, setExistingRegNumbersSet] = useState(new Set());
//   const [selectedVehicleTypeData, setSelectedVehicleTypeData] = useState(null);
//   const [isLoadingVehicleData, setIsLoadingVehicleData] = useState(false);
//   const [currentEditingGroupId, setCurrentEditingGroupId] = useState(null);

//   const [commonInfo, setCommonInfo] = useState({
//     customizedType: "Non-Customized",
//     vehicleType: "",
//     vehicleName: "",
//   });

//   const [techSpecs, setTechSpecs] = useState({
//     screenType: "LED Only",
//     numberOfScreens: "",
//     screenSizeWidth: "",
//     screenSizeHeight: "",
//     backScreenWidth: "",
//     backScreenHeight: "",
//     resolution: "",
//     backResolution: "",
//     videoSize: "",
//     backVideoSize: "",
//     audioOutput: "",
//     brightness: "",
//     displayVersion: "",
//     soundQuality: "",
//     generatorCapacity: "",
//     additionalFeatures: "",
//   });

//   const [showMoreTech, setShowMoreTech] = useState(false);

//   const [pricing, setPricing] = useState({
//     basePriceType: "Per Day",
//     costPerDay: "",
//     avgKmPerDay: "",
//     extraKmPrice: "",
//     avgBookingHrs: "",
//     extraHrPrice: "",
//     rtoCharges: "",
//     fuelEfficiency: "",
//     minBookingDuration: "",
//     overtimeCharges: "",
//     waitingCharges: "",
//   });

//   // Media files state with preview support
//   const [mediaFiles, setMediaFiles] = useState({
//     frontViewImage: null,
//     leftSideImage: null,
//     rightSideImage: null,
//     rearViewImage: null,
//     interiorImage: null,
//     demoVideo: null,
//   });

//   const [mediaPreviews, setMediaPreviews] = useState({
//     frontViewImage: null,
//     leftSideImage: null,
//     rightSideImage: null,
//     rearViewImage: null,
//     interiorImage: null,
//     demoVideo: null,
//   });

//   const [existingMediaUrls, setExistingMediaUrls] = useState({
//     frontViewImage: "",
//     leftSideImage: "",
//     rightSideImage: "",
//     rearViewImage: "",
//     interiorImage: "",
//     demoVideo: "",
//   });

//   const [validationErrors, setValidationErrors] = useState({});
//   const [uploadProgress, setUploadProgress] = useState(0);

//   // Handle file upload with preview
//   const handleMediaUpload = (field, file) => {
//     if (!file) return;
    
//     const isVideo = field === 'demoVideo';
//     const maxSize = isVideo ? 10 * 1024 * 1024 : 3 * 1024 * 1024;
    
//     if (file.size > maxSize) {
//       toast.error(`File size exceeds ${isVideo ? '10MB' : '3MB'} limit`);
//       return;
//     }
    
//     const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
//     const validVideoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm'];
    
//     if (isVideo && !validVideoTypes.includes(file.type)) {
//       toast.error("Please select a valid video file");
//       return;
//     }
    
//     if (!isVideo && !validImageTypes.includes(file.type)) {
//       toast.error("Please select a valid image file");
//       return;
//     }
    
//     const previewUrl = URL.createObjectURL(file);
    
//     setMediaPreviews(prev => ({
//       ...prev,
//       [field]: previewUrl
//     }));
    
//     setMediaFiles(prev => ({
//       ...prev,
//       [field]: file
//     }));
    
//     // Clear existing URL when new file is uploaded
//     setExistingMediaUrls(prev => ({
//       ...prev,
//       [field]: ""
//     }));
//   };

//   // Handle remove media
//   const handleRemoveMedia = (field) => {
//     if (mediaPreviews[field] && mediaPreviews[field].startsWith('blob:')) {
//       URL.revokeObjectURL(mediaPreviews[field]);
//     }
//     setMediaPreviews(prev => ({ ...prev, [field]: null }));
//     setMediaFiles(prev => ({ ...prev, [field]: null }));
//     setExistingMediaUrls(prev => ({ ...prev, [field]: "" }));
//   };

//   // Clean up previews on unmount
//   useEffect(() => {
//     return () => {
//       Object.values(mediaPreviews).forEach(preview => {
//         if (preview && preview.startsWith('blob:')) {
//           URL.revokeObjectURL(preview);
//         }
//       });
//     };
//   }, []);

//   const fetchExistingRegNumbers = async () => {
//     try {
//       const response = await axios.get(`${baseUrl}/api/getNewVehicles?page=1&limit=1000`);
//       if (response.data.success) {
//         const allRegNumbers = new Set();
//         response.data.data.forEach(vehicle => {
//           if (vehicle.registrationVehicles) {
//             vehicle.registrationVehicles.forEach(rv => {
//               allRegNumbers.add(rv.registrationNumber);
//             });
//           }
//         });
//         setExistingRegNumbersSet(allRegNumbers);
//       }
//     } catch (error) {
//       console.error("Error fetching existing registration numbers:", error);
//     }
//   };

//   const checkDuplicateRegistration = async (regNumber, excludeRegNumber = null) => {
//     const cleanReg = unformatRegistrationNumber(regNumber);
    
//     // Check local duplicates
//     const localDuplicate = vehicles.some(v => 
//       unformatRegistrationNumber(v.registrationNumber) === cleanReg && 
//       v.registrationNumber !== excludeRegNumber
//     );
//     if (localDuplicate) return true;
    
//     // Check database duplicates
//     if (existingRegNumbersSet.has(cleanReg) && cleanReg !== excludeRegNumber) return true;
    
//     return false;
//   };

//   const fetchVehicleTypes = async () => {
//     try {
//       const response = await axios.get(`${baseUrl}/api/vehicle-types`);
//       if (response.data.success) {
//         setVehicleTypes(response.data.data);
//       }
//     } catch (error) {
//       console.error("Error fetching vehicle types:", error);
//     }
//   };

//   // Fetch complete vehicle details by type (including all registration vehicles)
//   const fetchVehicleByType = async (typeId) => {
//     if (!typeId) return;
    
//     setIsLoadingVehicleData(true);
//     try {
//       const response = await axios.get(`${baseUrl}/api/getVehicleGroupByType/${typeId}`);
//       if (response.data.success && response.data.data) {
//         const vehicleData = response.data.data;
//         setSelectedVehicleTypeData(vehicleData);
//         setCurrentEditingGroupId(vehicleData._id);
        
//         // Populate tech specs
//         if (vehicleData.techSpecs) {
//           setTechSpecs({
//             screenType: vehicleData.techSpecs.screenType || "LED Only",
//             numberOfScreens: vehicleData.techSpecs.numberOfScreens || "",
//             screenSizeWidth: vehicleData.techSpecs.screenSizeWidth || "",
//             screenSizeHeight: vehicleData.techSpecs.screenSizeHeight || "",
//             backScreenWidth: vehicleData.techSpecs.backScreenWidth || "",
//             backScreenHeight: vehicleData.techSpecs.backScreenHeight || "",
//             resolution: vehicleData.techSpecs.resolution || "",
//             backResolution: vehicleData.techSpecs.backResolution || "",
//             videoSize: vehicleData.techSpecs.videoSize || "",
//             backVideoSize: vehicleData.techSpecs.backVideoSize || "",
//             audioOutput: vehicleData.techSpecs.audioOutput || "",
//             brightness: vehicleData.techSpecs.brightness || "",
//             displayVersion: vehicleData.techSpecs.displayVersion || "",
//             soundQuality: vehicleData.techSpecs.soundQuality || "",
//             generatorCapacity: vehicleData.techSpecs.generatorCapacity || "",
//             additionalFeatures: vehicleData.techSpecs.additionalFeatures || "",
//           });
//         }
        
//         // Populate pricing
//         if (vehicleData.pricing) {
//           setPricing({
//             basePriceType: vehicleData.pricing.basePriceType || "Per Day",
//             costPerDay: vehicleData.pricing.costPerDay || "",
//             avgKmPerDay: vehicleData.pricing.avgKmPerDay || "",
//             extraKmPrice: vehicleData.pricing.extraKmPrice || "",
//             avgBookingHrs: vehicleData.pricing.avgBookingHrs || "",
//             extraHrPrice: vehicleData.pricing.extraHrPrice || "",
//             rtoCharges: vehicleData.pricing.rtoCharges || "",
//             fuelEfficiency: vehicleData.pricing.fuelEfficiency || "",
//             minBookingDuration: vehicleData.pricing.minBookingDuration || "",
//             overtimeCharges: vehicleData.pricing.overtimeCharges || "",
//             waitingCharges: vehicleData.pricing.waitingCharges || "",
//           });
//         }
        
//         // Populate media URLs
//         if (vehicleData.mediaFiles) {
//           setExistingMediaUrls({
//             frontViewImage: vehicleData.mediaFiles.frontViewImage || "",
//             leftSideImage: vehicleData.mediaFiles.leftSideImage || "",
//             rightSideImage: vehicleData.mediaFiles.rightSideImage || "",
//             rearViewImage: vehicleData.mediaFiles.rearViewImage || "",
//             interiorImage: vehicleData.mediaFiles.interiorImage || "",
//             demoVideo: vehicleData.mediaFiles.demoVideo || "",
//           });
//         }
        
//         // Populate vehicles list with all fields
//         if (vehicleData.registrationVehicles && vehicleData.registrationVehicles.length > 0) {
//           const formattedVehicles = vehicleData.registrationVehicles.map(rv => ({
//             registrationNumber: rv.registrationNumber,
//             vehicleId: rv.vehicleId,
//             city: rv.city || "",
//             permitType: rv.permitType || "",
//             modelConfig: rv.modelConfig || "",
//             ownershipType: rv.ownershipType || "",
//             fuelType: rv.fuelType || "",
//             manufacturingYear: rv.manufacturingYear || "",
//             gpsEnabled: rv.gpsEnabled !== undefined ? rv.gpsEnabled : true,
//             activeStatus: rv.activeStatus !== undefined ? rv.activeStatus : true,
//             currentStatus: rv.statusAvailability?.currentStatus || "Available",
//             availableFrom: rv.statusAvailability?.availableFrom ? rv.statusAvailability.availableFrom.split('T')[0] : "",
//             remarks: rv.statusAvailability?.remarks || "",
//             driverName: rv.driverDetails?.driverName || "",
//             driverPhone: rv.driverDetails?.driverPhone || "",
//             backupDriver: rv.driverDetails?.backupDriver || "",
//             backupDriverPhone: rv.driverDetails?.backupDriverPhone || "",
//             driverCharges: rv.driverDetails?.driverCharges || "",
//             lastServiceDate: rv.maintenance?.lastServiceDate ? rv.maintenance.lastServiceDate.split('T')[0] : "",
//             insuranceExpiryDate: rv.maintenance?.insuranceExpiryDate ? rv.maintenance.insuranceExpiryDate.split('T')[0] : "",
//             pollutionExpiryDate: rv.maintenance?.pollutionExpiryDate ? rv.maintenance.pollutionExpiryDate.split('T')[0] : "",
//           }));
//           setVehicles(formattedVehicles);
          
//           // Update existing registration numbers set
//           const regNumbers = new Set(existingRegNumbersSet);
//           formattedVehicles.forEach(v => regNumbers.add(v.registrationNumber));
//           setExistingRegNumbersSet(regNumbers);
//         }
        
//         toast.success(`Loaded ${vehicleData.registrationVehicles?.length || 0} vehicle(s) for this type`);
//       } else {
//         setSelectedVehicleTypeData(null);
//         setCurrentEditingGroupId(null);
//         setVehicles([]);
//         toast.info("No existing vehicles found for this type. You can add new ones.");
//       }
//     } catch (error) {
//       console.error("Error fetching vehicle by type:", error);
//       setSelectedVehicleTypeData(null);
//       setCurrentEditingGroupId(null);
//       setVehicles([]);
//     } finally {
//       setIsLoadingVehicleData(false);
//     }
//   };

//   const createVehicleType = async (typeName) => {
//     try {
//       const response = await axios.post(`${baseUrl}/api/vehicle-types`, { typeName });
//       if (response.data.success) {
//         toast.success("Vehicle type created successfully");
//         await fetchVehicleTypes();
//         return response.data.data;
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Error creating vehicle type");
//       throw error;
//     }
//   };

//   const updateVehicleType = async (id, typeName) => {
//     try {
//       const response = await axios.put(`${baseUrl}/api/vehicle-types/${id}`, { typeName });
//       if (response.data.success) {
//         toast.success("Vehicle type updated successfully");
//         await fetchVehicleTypes();
//         return response.data.data;
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Error updating vehicle type");
//       throw error;
//     }
//   };

//   const deleteVehicleType = async (id) => {
//     try {
//       const response = await axios.delete(`${baseUrl}/api/vehicle-types/${id}`);
//       if (response.data.success) {
//         toast.success("Vehicle type deleted successfully");
//         await fetchVehicleTypes();
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Error deleting vehicle type");
//       throw error;
//     }
//   };

//   useEffect(() => {
//     fetchVehicleTypes();
//     fetchExistingRegNumbers();
//   }, []);

//   // Load vehicle data when type is selected
//   useEffect(() => {
//     if (commonInfo.vehicleType) {
//       fetchVehicleByType(commonInfo.vehicleType);
//     } else {
//       setVehicles([]);
//       setSelectedVehicleTypeData(null);
//       setCurrentEditingGroupId(null);
//     }
//   }, [commonInfo.vehicleType]);

//   const steps = [
//     { number: 1, title: "Basic Information" },
//     { number: 2, title: "Technical Specification" },
//     { number: 3, title: "Pricing & Charges" },
//     { number: 4, title: "Media & Description" },
//     { number: 5, title: "Drivers & Maintenance" },
//     { number: 6, title: "Vehicle Summary" },
//   ];

//   const canAccessStep6 = commonInfo.vehicleType && vehicles.length > 0 && pricing.costPerDay;

//   const handleAddVehicle = (vehicleData) => {
//     const newVehicle = {
//       registrationNumber: vehicleData.registrationNumber,
//       vehicleId: vehicleData.vehicleId,
//       city: vehicleData.city,
//       permitType: vehicleData.permitType,
//       modelConfig: vehicleData.modelConfig,
//       ownershipType: vehicleData.ownershipType,
//       fuelType: vehicleData.fuelType,
//       manufacturingYear: vehicleData.manufacturingYear,
//       gpsEnabled: vehicleData.gpsEnabled,
//       activeStatus: vehicleData.activeStatus,
//       currentStatus: vehicleData.currentStatus,
//       availableFrom: vehicleData.availableFrom,
//       remarks: vehicleData.remarks,
//       driverName: vehicleData.driverName,
//       driverPhone: vehicleData.driverPhone,
//       backupDriver: vehicleData.backupDriver,
//       backupDriverPhone: vehicleData.backupDriverPhone,
//       driverCharges: vehicleData.driverCharges,
//       lastServiceDate: vehicleData.lastServiceDate,
//       insuranceExpiryDate: vehicleData.insuranceExpiryDate,
//       pollutionExpiryDate: vehicleData.pollutionExpiryDate,
//     };

//     if (editingVehicle) {
//       setVehicles((prev) =>
//         prev.map((v) =>
//           v.registrationNumber === editingVehicle.registrationNumber ? newVehicle : v
//         )
//       );
//       toast.success("Vehicle updated successfully");
//     } else {
//       const exists = vehicles.some((v) => v.registrationNumber === vehicleData.registrationNumber);
//       if (exists) {
//         toast.error("Vehicle with this registration number already exists");
//         return;
//       }
//       setVehicles((prev) => [...prev, newVehicle]);
//       setExistingRegNumbersSet(prev => new Set([...prev, vehicleData.registrationNumber]));
//       toast.success("Vehicle added successfully");
//     }
//     setEditingVehicle(null);
//   };

//   const handleEditVehicle = (vehicle) => {
//     setEditingVehicle(vehicle);
//     setIsModalOpen(true);
//   };

//   const handleDeleteVehicle = (registrationNumber) => {
//     if (window.confirm("Are you sure you want to remove this vehicle?")) {
//       setVehicles((prev) => prev.filter((v) => v.registrationNumber !== registrationNumber));
//       toast.success("Vehicle removed successfully");
//     }
//   };

//   const handleSaveMaintenance = (registrationNumber, data) => {
//     setVehicles((prev) =>
//       prev.map((v) =>
//         v.registrationNumber === registrationNumber
//           ? { 
//               ...v, 
//               driverName: data.driverName,
//               driverPhone: data.driverPhone,
//               backupDriver: data.backupDriver,
//               backupDriverPhone: data.backupDriverPhone,
//               driverCharges: data.driverCharges,
//               lastServiceDate: data.lastServiceDate,
//               insuranceExpiryDate: data.insuranceExpiryDate,
//               pollutionExpiryDate: data.pollutionExpiryDate,
//             }
//           : v
//       )
//     );
//     toast.success(`Driver & Maintenance details saved for ${formatRegistrationNumber(registrationNumber)}`);
//   };

//   const validateForm = () => {
//     const errors = {};
//     if (!commonInfo.vehicleType) errors.vehicleType = "Vehicle Type is required";
//     if (vehicles.length === 0) errors.vehicles = "At least one vehicle is required";
//     if (!pricing.costPerDay) errors.costPerDay = "Base Cost is required";
    
//     const currentYear = new Date().getFullYear();
//     for (const vehicle of vehicles) {
//       if (vehicle.manufacturingYear) {
//         const yearNum = parseInt(vehicle.manufacturingYear);
//         if (isNaN(yearNum) || yearNum > currentYear) {
//           errors.manufacturingYear = `Manufacturing year cannot exceed ${currentYear}`;
//           break;
//         }
//       }
//       if (vehicle.driverPhone && vehicle.driverPhone.length !== 10) {
//         errors.driverPhone = "Driver phone must be 10 digits";
//         break;
//       }
//     }
    
//     setValidationErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (currentStep !== 6) {
//       return;
//     }

//     if (!validateForm()) {
//       toast.error("Please fix the validation errors before submitting");
//       return;
//     }

//     setLoading(true);
//     setUploadProgress(0);

//     try {
//       const formData = new FormData();

//       const registrationVehicles = vehicles.map(vehicle => ({
//         registrationNumber: vehicle.registrationNumber,
//         vehicleId: vehicle.vehicleId,
//         city: vehicle.city,
//         modelConfig: vehicle.modelConfig,
//         permitType: vehicle.permitType,
//         ownershipType: vehicle.ownershipType,
//         fuelType: vehicle.fuelType,
//         manufacturingYear: vehicle.manufacturingYear,
//         gpsEnabled: vehicle.gpsEnabled,
//         activeStatus: vehicle.activeStatus,
//         currentStatus: vehicle.currentStatus,
//         availableFrom: vehicle.availableFrom,
//         remarks: vehicle.remarks,
//         lastServiceDate: vehicle.lastServiceDate,
//         insuranceExpiryDate: vehicle.insuranceExpiryDate,
//         pollutionExpiryDate: vehicle.pollutionExpiryDate,
//         driverName: vehicle.driverName,
//         driverPhone: vehicle.driverPhone,
//         backupDriver: vehicle.backupDriver,
//         backupDriverPhone: vehicle.backupDriverPhone,
//         driverCharges: vehicle.driverCharges
//       }));

//       const payload = {
//         basicInfo: {
//           customizedType: commonInfo.customizedType,
//           vehicleType: commonInfo.vehicleType,
//         },
//         techSpecs: techSpecs,
//         pricing: pricing,
//         registrationVehicles: registrationVehicles,
//       };

//       formData.append('data', JSON.stringify(payload));

//       // Append media files (only new files)
//       Object.keys(mediaFiles).forEach(key => {
//         if (mediaFiles[key] && mediaFiles[key] instanceof File) {
//           formData.append(key, mediaFiles[key]);
//         }
//       });

//       let response;
//       if (currentEditingGroupId) {
//         // Update existing group
//         response = await axios.put(`${baseUrl}/api/updateVehicle/${currentEditingGroupId}`, formData, {
//           headers: { "Content-Type": "multipart/form-data" },
//           onUploadProgress: (progressEvent) => {
//             const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//             setUploadProgress(percentCompleted);
//           },
//         });
//       } else {
//         // Create new group
//         response = await axios.post(`${baseUrl}/api/createVehicle`, formData, {
//           headers: { "Content-Type": "multipart/form-data" },
//           onUploadProgress: (progressEvent) => {
//             const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//             setUploadProgress(percentCompleted);
//           },
//         });
//       }

//       if (response.data.success) {
//         toast.success(response.data.message);
//         // Reset form after successful submission
//         setVehicles([]);
//         setCommonInfo({ customizedType: "Non-Customized", vehicleType: "", vehicleName: "" });
//         setTechSpecs({
//           screenType: "LED Only",
//           numberOfScreens: "",
//           screenSizeWidth: "",
//           screenSizeHeight: "",
//           backScreenWidth: "",
//           backScreenHeight: "",
//           resolution: "",
//           backResolution: "",
//           videoSize: "",
//           backVideoSize: "",
//           audioOutput: "",
//           brightness: "",
//           displayVersion: "",
//           soundQuality: "",
//           generatorCapacity: "",
//           additionalFeatures: "",
//         });
//         setPricing({
//           basePriceType: "Per Day",
//           costPerDay: "",
//           avgKmPerDay: "",
//           extraKmPrice: "",
//           avgBookingHrs: "",
//           extraHrPrice: "",
//           rtoCharges: "",
//           fuelEfficiency: "",
//           minBookingDuration: "",
//           overtimeCharges: "",
//           waitingCharges: "",
//         });
        
//         // Reset media files and previews
//         Object.keys(mediaPreviews).forEach(key => {
//           if (mediaPreviews[key] && mediaPreviews[key].startsWith('blob:')) {
//             URL.revokeObjectURL(mediaPreviews[key]);
//           }
//         });
//         setMediaFiles({
//           frontViewImage: null,
//           leftSideImage: null,
//           rightSideImage: null,
//           rearViewImage: null,
//           interiorImage: null,
//           demoVideo: null,
//         });
//         setMediaPreviews({
//           frontViewImage: null,
//           leftSideImage: null,
//           rightSideImage: null,
//           rearViewImage: null,
//           interiorImage: null,
//           demoVideo: null,
//         });
//         setExistingMediaUrls({
//           frontViewImage: "",
//           leftSideImage: "",
//           rightSideImage: "",
//           rearViewImage: "",
//           interiorImage: "",
//           demoVideo: "",
//         });
//         setCurrentEditingGroupId(null);
//         setCurrentStep(1);
//         setUploadProgress(0);
//         fetchExistingRegNumbers();
//       }
//     } catch (error) {
//       console.error("Error submitting form:", error);
//       toast.error(error.response?.data?.message || "Error saving vehicle. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const mediaItems = [
//     { key: "frontViewImage", label: "Front View", icon: "📸", accept: "image/*" },
//     { key: "leftSideImage", label: "Left Side View", icon: "⬅️", accept: "image/*" },
//     { key: "rightSideImage", label: "Right Side View", icon: "➡️", accept: "image/*" },
//     { key: "rearViewImage", label: "Rear View", icon: "🔭", accept: "image/*" },
//     { key: "interiorImage", label: "Interior", icon: "🖼️", accept: "image/*" },
//     { key: "demoVideo", label: "Demo Video", icon: "🎬", accept: "video/*" },
//   ];

//   const getSelectOptions = () => ({
//     customizedVehiclesOptions: [
//       { value: "Non-Customized", label: "Non-Customized" },
//     ],
//     vehicleTypeOptions: vehicleTypes.map((vt) => ({ value: vt._id, label: vt.typeName })),
//     screenTypeOptions: [
//       { value: "LED Only", label: "LED Only" },
//       { value: "Flex Only", label: "Flex Only" },
//       { value: "Flex + LED", label: "Flex + LED" },
//     ],
//     soundQualityOptions: [
//       { value: "Standard", label: "Standard" },
//       { value: "High", label: "High" },
//       { value: "Studio", label: "Studio" },
//     ],
//     basePriceTypeOptions: [
//       { value: "Per Day", label: "Per Day" },
//       { value: "Per Hour", label: "Per Hour" },
//       { value: "Per KM", label: "Per KM" },
//     ],
//     numberOfScreensOptions: [
//       { value: "1", label: "1 Screen" },
//       { value: "2", label: "2 Screens" },
//       { value: "3", label: "3 Screens" },
//       { value: "4", label: "4 Screens" },
//     ],
//     displayVersionOptions: [
//       { value: "P2", label: "P2" },
//       { value: "P3", label: "P3" },
//       { value: "P4", label: "P4" },
//       { value: "P5", label: "P5" },
//       { value: "P6", label: "P6" },
//       { value: "P8", label: "P8" },
//       { value: "P10", label: "P10" },
//       { value: "NovaStar A8s", label: "NovaStar A8s" },
//       { value: "NovaStar VX4S", label: "NovaStar VX4S" },
//       { value: "Linsn", label: "Linsn" },
//       { value: "ColorLight", label: "ColorLight" },
//     ],
//   });

//   const selectOptions = getSelectOptions();

//   const handleInputChange = (setter, field) => (e) => {
//     setter(prev => ({ ...prev, [field]: e.target.value }));
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
//       <ToastContainer position="top-right" />

//       <div className="px-6 pt-6">
//         <div className="text-sm text-gray-500 dark:text-gray-400">
//           🏠 Dashboard &gt; Vehicle Management &gt; Onboarding
//         </div>
//       </div>

//       <div className="px-6 py-4">
//         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
//           🚌 Vehicle Onboarding Management
//         </h1>
//         <p className="text-gray-500 dark:text-gray-400 mt-1">
//           Add and manage your advertising vehicles with complete details
//         </p>
//       </div>

//       <AddVehicleModal
//         isOpen={isModalOpen}
//         onClose={() => {
//           setIsModalOpen(false);
//           setEditingVehicle(null);
//         }}
//         onSave={handleAddVehicle}
//         editingVehicle={editingVehicle}
//         existingRegNumbers={vehicles.map(v => v.registrationNumber)}
//         onCheckDuplicate={checkDuplicateRegistration}
//         vehicleTypes={vehicleTypes}
//       />

//       <MaintenanceModal
//         isOpen={isMaintenanceModalOpen}
//         onClose={() => {
//           setIsMaintenanceModalOpen(false);
//           setSelectedVehicle(null);
//         }}
//         vehicle={selectedVehicle}
//         onSave={handleSaveMaintenance}
//       />

//       <VehicleTypeModal
//         isOpen={isTypeModalOpen}
//         onClose={() => {
//           setIsTypeModalOpen(false);
//           setEditingType(null);
//         }}
//         onSave={createVehicleType}
//         onUpdate={updateVehicleType}
//         onDelete={deleteVehicleType}
//         editingType={editingType}
//         vehicleTypes={vehicleTypes}
//         setEditingType={setEditingType}
//       />

//       <form onSubmit={handleSubmit}>
//         <div className="px-6 pb-10">
//           <StepperHeader
//             steps={steps}
//             currentStep={currentStep}
//             onStepClick={setCurrentStep}
//             canAccessStep6={canAccessStep6}
//           />

//           {isLoadingVehicleData && (
//             <div className="text-center py-4">
//               <div className="inline-flex items-center gap-2 text-blue-600">
//                 <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//                 Loading vehicle details...
//               </div>
//             </div>
//           )}

//           {currentStep === 1 && (
//             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
//               <div className="flex justify-between items-center mb-6">
//                 <SectionHeader number={1} title="Basic Information" icon="📋" />
//                 <button
//                   type="button"
//                   onClick={() => setIsTypeModalOpen(true)}
//                   className="text-sm text-blue-600 hover:text-blue-700"
//                 >
//                   Manage Vehicle Types
//                 </button>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <Label>⚙️ Customized  <span className="text-red-500">*</span></Label>
//                   <div className="relative">
//                     <Select
//                       options={selectOptions.customizedVehiclesOptions}
//                       placeholder="Select"
//                       value={commonInfo.customizedType}
//                       onChange={(value) => setCommonInfo((prev) => ({ ...prev, customizedType: value }))}
//                     />
//                     <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                       <ChevronDownIcon />
//                     </span>
//                   </div>
//                 </div>

//                 <div>
//                   <Label>🚍 Vehicle Type <span className="text-red-500">*</span></Label>
//                   <div className="relative">
//                     <Select
//                       options={selectOptions.vehicleTypeOptions}
//                       placeholder="Select Type"
//                       value={commonInfo.vehicleType}
//                       onChange={(value) => {
//                         setCommonInfo((prev) => ({ ...prev, vehicleType: value }));
//                       }}
//                     />
//                     <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                       <ChevronDownIcon />
//                     </span>
//                   </div>
//                   {validationErrors.vehicleType && (
//                     <p className="mt-1 text-xs text-red-500">{validationErrors.vehicleType}</p>
//                   )}
//                   <p className="mt-1 text-xs text-gray-400">
//                     Selecting a vehicle type will auto-fill technical specs, pricing, and existing vehicles if previously configured
//                   </p>
//                 </div>
//               </div>

//               <div className="mt-8">
//                 <Label className="text-base font-semibold">
//                   🔢 Registration Numbers <span className="text-red-500">*</span>
//                 </Label>
//                 <p className="text-sm text-gray-500 mb-4">
//                   Add one or more registration numbers (Format: XX NN XX NNNN)
//                 </p>

//                 {vehicles.length > 0 ? (
//                   <div className="overflow-x-auto border rounded-lg">
//                     <table className="w-full text-sm">
//                       <thead className="bg-gray-50 dark:bg-gray-700">
//                         <tr>
//                           <th className="px-4 py-3 text-left">Reg. Number</th>
//                           <th className="px-4 py-3 text-left">Vehicle ID</th>
//                           <th className="px-4 py-3 text-left">City</th>
//                           <th className="px-4 py-3 text-left">Permit</th>
//                           <th className="px-4 py-3 text-left">Fuel</th>
//                           <th className="px-4 py-3 text-left">Status</th>
//                           <th className="px-4 py-3 text-center">Actions</th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y">
//                         {vehicles.map((vehicle) => (
//                           <tr key={vehicle.registrationNumber} className="hover:bg-gray-50">
//                             <td className="px-4 py-3 font-mono font-semibold text-blue-700">{formatRegistrationNumber(vehicle.registrationNumber)}</td>
//                             <td className="px-4 py-3 text-sm text-gray-600">{vehicle.vehicleId}</td>
//                             <td className="px-4 py-3">{vehicle.city}</td>
//                             <td className="px-4 py-3">{vehicle.permitType}</td>
//                             <td className="px-4 py-3">{vehicle.fuelType}</td>
//                             <td className="px-4 py-3"><StatusBadge status={vehicle.currentStatus || "Available"} /></td>
//                             <td className="px-4 py-3 text-center">
//                               <div className="flex justify-center gap-3">
//                                 <button
//                                   type="button"
//                                   onClick={() => handleEditVehicle(vehicle)}
//                                   className="text-blue-500 hover:text-blue-700"
//                                   title="Edit"
//                                 >
//                                   <NotebookPen size={16} />
//                                 </button>
//                                 <button
//                                   type="button"
//                                   onClick={() => {
//                                     setSelectedVehicle(vehicle);
//                                     setIsMaintenanceModalOpen(true);
//                                   }}
//                                   className="text-green-500 hover:text-green-700"
//                                   title="Maintenance"
//                                 >
//                                   🔧
//                                 </button>
//                                 <button
//                                   type="button"
//                                   onClick={() => handleDeleteVehicle(vehicle.registrationNumber)}
//                                   className="text-red-500 hover:text-red-700"
//                                   title="Delete"
//                                 >
//                                   <Trash2 size={16} />
//                                 </button>
//                               </div>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 ) : (
//                   <div className="text-center py-10 border-2 border-dashed rounded-lg text-gray-400">
//                     <div className="text-4xl mb-2">🚚</div>
//                     <p>No vehicles added yet</p>
//                   </div>
//                 )}

//                 <button
//                   type="button"
//                   onClick={() => setIsModalOpen(true)}
//                   className="flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700 font-medium"
//                 >
//                   <PlusIcon className="w-4 h-4" />
//                   Add Another Vehicle
//                 </button>
//                 {validationErrors.vehicles && (
//                   <p className="mt-1 text-xs text-red-500">{validationErrors.vehicles}</p>
//                 )}
//               </div>
//             </div>
//           )}

//           {currentStep === 2 && (
//             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
//               <SectionHeader number={2} title="Technical Specifications" icon="🖥️" />

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                 <div>
//                   <Label>📺 Screen Type <span className="text-red-500">*</span></Label>
//                   <div className="relative">
//                     <Select
//                       options={selectOptions.screenTypeOptions}
//                       placeholder="LED Only"
//                       value={techSpecs.screenType}
//                       onChange={(value) => setTechSpecs((prev) => ({ ...prev, screenType: value }))}
//                     />
//                     <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                       <ChevronDownIcon />
//                     </span>
//                   </div>
//                 </div>
                
//                 <div>
//                   <Label>🔢 Number of Screens <span className="text-red-500">*</span></Label>
//                   <RadioGroup
//                     options={selectOptions.numberOfScreensOptions}
//                     value={techSpecs.numberOfScreens}
//                     onChange={(value) => setTechSpecs((prev) => ({ ...prev, numberOfScreens: value }))}
//                     // required={true}
//                   />
//                 </div>

//                 <div>
//                   <Label>Left/Right Screen Size <span className="text-red-500">*</span></Label>
//                   <div className="flex gap-2">
//                     <Input
//                       type="text"
//                       value={techSpecs.screenSizeWidth}
//                       placeholder="Width (ft)"
//                       className="flex-1"
//                       onChange={(e) => {
//                         if (validateNumber(e.target.value, true)) {
//                           setTechSpecs((prev) => ({ ...prev, screenSizeWidth: e.target.value }));
//                         }
//                       }}
//                     />
//                     <Input
//                       type="text"
//                       value={techSpecs.screenSizeHeight}
//                       placeholder="Height (ft)"
//                       className="flex-1"
//                       onChange={(e) => {
//                         if (validateNumber(e.target.value, true)) {
//                           setTechSpecs((prev) => ({ ...prev, screenSizeHeight: e.target.value }));
//                         }
//                       }}
//                     />
//                   </div>
//                 </div>
      
//                 <div>
//                   <Label>Back Screen Size <span className="text-red-500">*</span></Label>
//                   <div className="flex gap-2">
//                     <Input
//                       type="text"
//                       value={techSpecs.backScreenWidth}
//                       placeholder="Width (ft)"
//                       className="flex-1"
//                       onChange={(e) => {
//                         if (validateNumber(e.target.value, true)) {
//                           setTechSpecs((prev) => ({ ...prev, backScreenWidth: e.target.value }));
//                         }
//                       }}
//                     />
//                     <Input
//                       type="text"
//                       value={techSpecs.backScreenHeight}
//                       placeholder="Height (ft)"
//                       className="flex-1"
//                       onChange={(e) => {
//                         if (validateNumber(e.target.value, true)) {
//                           setTechSpecs((prev) => ({ ...prev, backScreenHeight: e.target.value }));
//                         }
//                       }}
//                     />
//                   </div>
//                 </div>
      
//                 <div>
//                   <Label>Front Resolution <span className="text-red-500">*</span></Label>
//                   <Input
//                     type="text"
//                     value={techSpecs.resolution}
//                     placeholder="e.g., 1920x1080"
//                     onChange={handleInputChange(setTechSpecs, "resolution")}
//                   />
//                 </div>
      
//                 <div>
//                   <Label>Back Resolution <span className="text-red-500">*</span></Label>
//                   <Input
//                     type="text"
//                     value={techSpecs.backResolution}
//                     placeholder="e.g., 480x520"
//                     onChange={handleInputChange(setTechSpecs, "backResolution")}
//                   />
//                 </div>
      
//                 <div>
//                   <Label>Front Video Size <span className="text-red-500">*</span></Label>
//                   <Input
//                     type="text"
//                     value={techSpecs.videoSize}
//                     placeholder="e.g., 1920x1080 px"
//                     onChange={handleInputChange(setTechSpecs, "videoSize")}
//                   />
//                 </div>
      
//                 <div>
//                   <Label>Back Video Size <span className="text-red-500">*</span></Label>
//                   <Input
//                     type="text"
//                     value={techSpecs.backVideoSize}
//                     placeholder="e.g., 480x520 px"
//                     onChange={handleInputChange(setTechSpecs, "backVideoSize")}
//                   />
//                 </div>
      
//                 <div>
//                   <Label>Audio Output <span className="text-red-500">*</span></Label>
//                   <Input
//                     type="text"
//                     value={techSpecs.audioOutput}
//                     placeholder="e.g., 600 watts"
//                     onChange={(e) => {
//                       if (validateNumber(e.target.value, true)) {
//                         setTechSpecs((prev) => ({ ...prev, audioOutput: e.target.value }));
//                       }
//                     }}
//                   />
//                 </div>
      
//                 <div>
//                   <Label>Generator Capacity <span className="text-red-500">*</span></Label>
//                   <Input
//                     type="text"
//                     value={techSpecs.generatorCapacity}
//                     placeholder="e.g., 7 KV"
//                     onChange={handleInputChange(setTechSpecs, "generatorCapacity")}
//                   />
//                 </div>
      
//                 <div>
//                   <Label>Brightness (Nits)</Label>
//                   <Input
//                     type="text"
//                     value={techSpecs.brightness}
//                     placeholder="e.g. 5500"
//                     onChange={(e) => {
//                       if (validateNumber(e.target.value, false)) {
//                         setTechSpecs((prev) => ({ ...prev, brightness: e.target.value }));
//                       }
//                     }}
//                   />
//                 </div>
      
//                 <div>
//                   <Label>Display Version / Controller <span className="text-red-500">*</span></Label>
//                   <div className="relative">
//                     <Select
//                       options={selectOptions.displayVersionOptions}
//                       placeholder="Select Display Version"
//                       value={techSpecs.displayVersion}
//                       onChange={(value) => setTechSpecs((prev) => ({ ...prev, displayVersion: value }))}
//                     />
//                     <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                       <ChevronDownIcon />
//                     </span>
//                   </div>
//                 </div>
                
//                 <div>
//                   <Label>🎚️ Sound Quality <span className="text-red-500">*</span></Label>
//                   <div className="relative">
//                     <Select 
//                       options={selectOptions.soundQualityOptions} 
//                       placeholder="Select Quality" 
//                       value={techSpecs.soundQuality} 
//                       onChange={(value) => setTechSpecs((prev) => ({ ...prev, soundQuality: value }))} 
//                     />
//                     <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                       <ChevronDownIcon />
//                     </span>
//                   </div>
//                 </div>

//                 <div className="md:col-span-2">
//                   <Label>✨ Additional Features </Label>
//                   <Input 
//                     placeholder="e.g. Built-in Amplifier, USB, WiFi" 
//                     value={techSpecs.additionalFeatures} 
//                     onChange={(e) => setTechSpecs((prev) => ({ ...prev, additionalFeatures: e.target.value }))} 
//                   />
//                 </div>
//               </div>

//               <button
//                 type="button"
//                 onClick={() => setShowMoreTech(!showMoreTech)}
//                 className="mt-6 text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
//               >
//                 {showMoreTech ? "▲" : "▼"} Show More Technical Options
//               </button>

//               {showMoreTech && (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6 pt-6 border-t">
//                   <div>
//                     <Label>🎬 Video Format</Label>
//                     <Input placeholder="e.g. MP4" />
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {currentStep === 3 && (
//             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
//               <SectionHeader number={3} title="Pricing & Charges" icon="💰" />

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <Label>📊 Base Price Type <span className="text-red-500">*</span></Label>
//                   <div className="relative">
//                     <Select 
//                       options={selectOptions.basePriceTypeOptions} 
//                       placeholder="Per Day" 
//                       value={pricing.basePriceType} 
//                       onChange={(value) => setPricing((prev) => ({ ...prev, basePriceType: value }))} 
//                     />
//                     <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                       <ChevronDownIcon />
//                     </span>
//                   </div>
//                 </div>
                
//                 <div>
//                   <Label>💵 Per Day Cost (₹) <span className="text-red-500">*</span></Label>
//                   <Input 
//                     type="text" 
//                     placeholder="e.g. 5000" 
//                     value={pricing.costPerDay} 
//                     onChange={(e) => {
//                       if (validateNumber(e.target.value, false)) {
//                         setPricing((prev) => ({ ...prev, costPerDay: e.target.value }));
//                       }
//                     }} 
//                   />
//                   {validationErrors.costPerDay && <p className="mt-1 text-xs text-red-500">{validationErrors.costPerDay}</p>}
//                 </div>

//                 <div>
//                   <Label>Average KM Per Day <span className="text-red-500">*</span></Label>
//                   <Input
//                     type="text"
//                     value={pricing.avgKmPerDay}
//                     placeholder="e.g. 60"
//                     onChange={(e) => {
//                       if (validateNumber(e.target.value, false)) {
//                         setPricing((prev) => ({ ...prev, avgKmPerDay: e.target.value }));
//                       }
//                     }}
//                   />
//                 </div>

//                 <div>
//                   <Label>Extra Charges (₹ / Km) <span className="text-red-500">*</span></Label>
//                   <Input
//                     type="text"
//                     value={pricing.extraKmPrice}
//                     placeholder="e.g. 12"
//                     onChange={(e) => {
//                       if (validateNumber(e.target.value, false)) {
//                         setPricing((prev) => ({ ...prev, extraKmPrice: e.target.value }));
//                       }
//                     }}
//                   />
//                 </div>

//                 <div>
//                   <Label>Average Booking Hours <span className="text-red-500">*</span></Label>
//                   <Input
//                     type="text"
//                     value={pricing.avgBookingHrs}
//                     placeholder="e.g. 8"
//                     onChange={(e) => {
//                       if (validateNumber(e.target.value, false)) {
//                         setPricing((prev) => ({ ...prev, avgBookingHrs: e.target.value }));
//                       }
//                     }}
//                   />
//                 </div>

//                 <div>
//                   <Label>Extra Charges (₹ / hr) <span className="text-red-500">*</span></Label>
//                   <Input
//                     type="text"
//                     value={pricing.extraHrPrice}
//                     placeholder="e.g. 500"
//                     onChange={(e) => {
//                       if (validateNumber(e.target.value, false)) {
//                         setPricing((prev) => ({ ...prev, extraHrPrice: e.target.value }));
//                       }
//                     }}
//                   />
//                 </div>

//                 <div>
//                   <Label>RTO Charges (₹) <span className="text-red-500">*</span></Label>
//                   <Input
//                     type="text"
//                     value={pricing.rtoCharges}
//                     placeholder="e.g. 10,000"
//                     onChange={(e) => {
//                       if (validateNumber(e.target.value, false)) {
//                         setPricing((prev) => ({ ...prev, rtoCharges: e.target.value }));
//                       }
//                     }}
//                   />
//                 </div>

//                 <div>
//                   <Label>Fuel Efficiency (km/l)</Label>
//                   <Input
//                     type="text"
//                     value={pricing.fuelEfficiency}
//                     placeholder="e.g. 6.5"
//                     onChange={(e) => {
//                       if (validateNumber(e.target.value, true)) {
//                         setPricing((prev) => ({ ...prev, fuelEfficiency: e.target.value }));
//                       }
//                     }}
//                   />
//                 </div>

//                 <div>
//                   <Label>Minimum Booking Duration <span className="text-red-500">*</span></Label>
//                   <Input
//                     type="text"
//                     value={pricing.minBookingDuration}
//                     placeholder="e.g. 4 hrs"
//                     onChange={handleInputChange(setPricing, "minBookingDuration")}
//                   />
//                 </div>

//                 <div>
//                   <Label>Overtime Charges (₹ / hr)</Label>
//                   <Input
//                     type="text"
//                     value={pricing.overtimeCharges}
//                     placeholder="e.g. 500"
//                     onChange={(e) => {
//                       if (validateNumber(e.target.value, false)) {
//                         setPricing((prev) => ({ ...prev, overtimeCharges: e.target.value }));
//                       }
//                     }}
//                   />
//                 </div>

//                 <div>
//                   <Label>Waiting Charges (₹ / hr)</Label>
//                   <Input
//                     type="text"
//                     value={pricing.waitingCharges}
//                     placeholder="e.g. 300"
//                     onChange={(e) => {
//                       if (validateNumber(e.target.value, false)) {
//                         setPricing((prev) => ({ ...prev, waitingCharges: e.target.value }));
//                       }
//                     }}
//                   />
//                 </div>
//               </div>
//             </div>
//           )}

//           {currentStep === 4 && (
//             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
//               <SectionHeader number={4} title="Media & Description" icon="🎞️" />

//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {mediaItems.map(({ key, label, icon, accept }) => (
//                   <MediaPreviewCard
//                     key={key}
//                     label={label}
//                     icon={icon}
//                     accept={accept}
//                     file={mediaFiles[key]}
//                     previewUrl={mediaPreviews[key]}
//                     existingUrl={existingMediaUrls[key]}
//                     onUpload={(file) => handleMediaUpload(key, file)}
//                     onRemove={() => handleRemoveMedia(key)}
//                   />
//                 ))}
//               </div>

//               <div className="mt-6">
//                 <Label>📝 Vehicle Description <span className="text-red-500">*</span></Label>
//                 <textarea 
//                   rows={4} 
//                   className="w-full mt-1 rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white" 
//                   placeholder="Enter detailed description about the vehicle..." 
//                 />
//               </div>
//             </div>
//           )}

//           {currentStep === 5 && (
//             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
//               <SectionHeader number={5} title="Drivers & Maintenance" icon="🧑‍✈️" />

//               {vehicles.length === 0 ? (
//                 <div className="text-center py-10 text-gray-500">Please add vehicles in Basic Info section first</div>
//               ) : (
//                 <div className="space-y-6">
//                   <div className="overflow-x-auto border rounded-lg">
//                     <table className="w-full text-sm">
//                       <thead className="bg-gray-50 dark:bg-gray-700">
//                         <tr>
//                           <th className="px-4 py-3 text-left">Reg. Number</th>
//                           <th className="px-4 py-3 text-left">Driver Name</th>
//                           <th className="px-4 py-3 text-left">Driver Phone</th>
//                           <th className="px-4 py-3 text-left">Last Service</th>
//                           <th className="px-4 py-3 text-left">Insurance Expiry</th>
//                           <th className="px-4 py-3 text-left">Pollution Expiry</th>
//                           <th className="px-4 py-3 text-center">Actions</th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y">
//                         {vehicles.map((vehicle) => (
//                           <tr key={vehicle.registrationNumber} className="hover:bg-gray-50">
//                             <td className="px-4 py-3 font-mono font-semibold text-blue-600">{formatRegistrationNumber(vehicle.registrationNumber)}</td>
//                             <td className="px-4 py-3">{vehicle.driverName || "-"}</td>
//                             <td className="px-4 py-3">{vehicle.driverPhone || "-"}</td>
//                             <td className="px-4 py-3">{vehicle.lastServiceDate || "-"}</td>
//                             <td className="px-4 py-3">{vehicle.insuranceExpiryDate || "-"}</td>
//                             <td className="px-4 py-3">{vehicle.pollutionExpiryDate || "-"}</td>
//                             <td className="px-4 py-3 text-center">
//                               <button
//                                 type="button"
//                                 onClick={() => {
//                                   setSelectedVehicle(vehicle);
//                                   setIsMaintenanceModalOpen(true);
//                                 }}
//                                 className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
//                               >
//                                 Edit Details
//                               </button>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {currentStep === 6 && (
//             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
//               <SectionHeader number={6} title="Vehicle Summary" icon="📊" />

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div className="bg-blue-50 rounded-lg p-4">
//                   <p className="text-sm text-gray-500">🚚 Total Vehicles</p>
//                   <p className="text-2xl font-bold text-blue-600">{vehicles.length}</p>
//                 </div>
//                 <div className="bg-green-50 rounded-lg p-4">
//                   <p className="text-sm text-gray-500">💵 Base Price</p>
//                   <p className="text-2xl font-bold text-green-600">₹{pricing.costPerDay || 0}</p>
//                 </div>
//                 <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-100">
//                   <p className="text-sm text-gray-500">🚍 Vehicle Type</p>
//                   <p className="text-lg font-semibold text-purple-600">
//                     {vehicleTypes.find(vt => vt._id === commonInfo.vehicleType)?.typeName || "Not selected"}
//                   </p>
//                 </div>
//               </div>

//               {vehicles.length > 0 && (
//                 <div className="mt-6">
//                   <Label className="font-semibold">🔢 Vehicles to be onboarded:</Label>
//                   <div className="mt-2 space-y-2">
//                     {vehicles.map((v, idx) => (
//                       <div key={idx} className="flex items-center gap-2 text-sm p-3 bg-gray-50 rounded-lg">
//                         <span className="w-6 text-gray-400">{idx + 1}.</span>
//                         <span className="font-mono font-semibold text-blue-600">{formatRegistrationNumber(v.registrationNumber)}</span>
//                         <span className="text-gray-400">—</span>
//                         <span className="text-gray-600">{v.city}</span>
//                         <span className="text-gray-400">·</span>
//                         <span className="text-gray-500">{v.fuelType}</span>
//                         <span className="ml-auto"><StatusBadge status={v.currentStatus || "Available"} /></span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
//                 <p className="text-sm text-yellow-800">⚠️ Please review all details before submitting. Click the Submit button below to save all vehicles.</p>
//               </div>
//             </div>
//           )}

//           {uploadProgress > 0 && uploadProgress < 100 && (
//             <div className="mt-6">
//               <div className="flex justify-between mb-1">
//                 <span className="text-sm text-gray-600">Uploading...</span>
//                 <span className="text-sm text-gray-600">{uploadProgress}%</span>
//               </div>
//               <div className="w-full bg-gray-200 rounded-full h-2">
//                 <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
//               </div>
//             </div>
//           )}

//           <div className="flex justify-between gap-4 mt-8">
//             <button type="button" onClick={() => window.location.reload()} className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">× Cancel</button>
//             <div className="flex gap-3">
//               {currentStep > 1 && (
//                 <button type="button" onClick={() => setCurrentStep((prev) => prev - 1)} className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
//                   ← Previous
//                 </button>
//               )}
//               {currentStep < 6 ? (
//                 <button 
//                   type="button" 
//                   onClick={() => {
//                     if (currentStep === 1 && (!commonInfo.vehicleType || vehicles.length === 0)) {
//                       toast.error("Please select vehicle type and add at least one vehicle", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//                       return;
//                     }
//                     if (currentStep === 3 && !pricing.costPerDay) {
//                       toast.error("Please set the base price", {
//                 position: "bottom-right",
//                 autoClose: 2000,
//             });
//                       return;
//                     }
//                     setCurrentStep((prev) => prev + 1);
//                   }} 
//                   className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
//                 >
//                   Save & Next →
//                 </button>
//               ) : (
//                 <button 
//                   type="submit"
//                   disabled={loading} 
//                   className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
//                 >
//                   {loading ? "Saving..." : `✅ Submit ${vehicles.length} Vehicle(s)`}
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// }










/* eslint-disable */
// @ts-nocheck

"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  // Already a proper URL (http/https)
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  // Windows absolute path (e.g. D:\Roadshow-Backend\...\filename.jpg)
  // Convert to a relative path served by the backend
  // Extract the "public/uploads/..." portion
  const match = url.replace(/\\/g, "/").match(/public\/uploads\/.+/);
  if (match) {
    return `${baseUrl}/${match[0]}`;
  }
  // Unix absolute path
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

  // Normalize the existing URL so Windows paths become proper HTTP URLs
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
                // Reset input so same file can be re-selected
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
const StepperHeader = ({ steps, currentStep, onStepClick, canAccessStep6 }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-6 px-6 py-4 overflow-x-auto">
      <div className="flex items-center min-w-max gap-0">
        {steps.map((step, idx) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;
          const isDisabled = step.number === 6 && !canAccessStep6;

          return (
            <React.Fragment key={step.number}>
              <button
                type="button"
                onClick={() => !isDisabled && onStepClick(step.number)}
                className="flex items-center gap-2 group focus:outline-none"
                disabled={isDisabled}
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all duration-200 flex-shrink-0 ${
                    isCompleted
                      ? "bg-blue-600 text-white"
                      : isActive
                      ? "bg-blue-600 text-white ring-4 ring-blue-100"
                      : isDisabled
                      ? "bg-gray-300 text-gray-400 cursor-not-allowed dark:bg-gray-700"
                      : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : isCompleted
                      ? "text-blue-500 dark:text-blue-400"
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
                    className={`h-0.5 w-10 rounded transition-colors duration-300 ${
                      currentStep > step.number
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
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        styles[status] || styles.Available
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
const validateStep = (step, { commonInfo, vehicles, pricing, techSpecs }) => {
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
    if (!techSpecs.screenSizeWidth || !techSpecs.screenSizeHeight)
      errors.screenSize = "Screen size (Width & Height) is required";
    if (!techSpecs.resolution) errors.resolution = "Front Resolution is required";
    if (!techSpecs.audioOutput) errors.audioOutput = "Audio Output is required";
    if (!techSpecs.generatorCapacity)
      errors.generatorCapacity = "Generator Capacity is required";
    if (!techSpecs.displayVersion)
      errors.displayVersion = "Display Version is required";
    if (!techSpecs.soundQuality)
      errors.soundQuality = "Sound Quality is required";
  }

  if (step === 3) {
    if (!pricing.costPerDay) errors.costPerDay = "Base Cost Per Day is required";
    if (!pricing.avgKmPerDay) errors.avgKmPerDay = "Average KM Per Day is required";
    if (!pricing.extraKmPrice) errors.extraKmPrice = "Extra KM Price is required";
    if (!pricing.avgBookingHrs)
      errors.avgBookingHrs = "Average Booking Hours is required";
    if (!pricing.extraHrPrice) errors.extraHrPrice = "Extra Hour Price is required";
    if (!pricing.rtoCharges) errors.rtoCharges = "RTO Charges is required";
    if (!pricing.minBookingDuration)
      errors.minBookingDuration = "Minimum Booking Duration is required";
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
      toast.error("Please enter vehicle type name");
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
    // Only allow digits
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
    // Only allow digits
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
      if (cleanValue.length === 10 && isValidRegistrationNumber(value)) {
        setIsCheckingDuplicate(true);
        try {
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

  const handleAddCity = () => {
    if (
      cityFilter &&
      !selectOptions.cityOptions.some((opt) => opt.value === cityFilter)
    ) {
      setCustomCities((prev) => [
        ...prev,
        { value: cityFilter, label: cityFilter },
      ]);
      setFormData((prev) => ({ ...prev, city: cityFilter }));
      setCityFilter("");
    }
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

  // FIX: Prevent form submit — use type="button" on all buttons and stop propagation
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
      toast.error("Please enter a valid registration number");
      return;
    }
    if (!formData.city) {
      toast.error("City is required");
      return;
    }
    if (!formData.fuelType) {
      toast.error("Fuel Type is required");
      return;
    }

    if (formData.manufacturingYear) {
      const currentYear = new Date().getFullYear();
      const yearNum = parseInt(formData.manufacturingYear);
      if (isNaN(yearNum) || yearNum > currentYear || yearNum < 1900) {
        toast.error(`Manufacturing year must be between 1900 and ${currentYear}`);
        return;
      }
    }

    if (formData.driverPhone && formData.driverPhone.length !== 10) {
      toast.error("Driver phone number must be 10 digits");
      return;
    }

    if (
      formData.backupDriverPhone &&
      formData.backupDriverPhone.length !== 10 &&
      formData.backupDriverPhone.length > 0
    ) {
      toast.error("Backup driver phone number must be 10 digits");
      return;
    }

    if (
      formData.currentStatus === "Unavailable" &&
      !formData.availableFrom
    ) {
      toast.error(
        "Please provide Available From date for Unavailable status"
      );
      return;
    }
    if (formData.currentStatus === "Unavailable" && !formData.remarks) {
      toast.error("Please provide remarks for Unavailable status");
      return;
    }

    const isDuplicate = await onCheckDuplicate(
      cleanReg,
      editingVehicle?.registrationNumber
    );
    if (isDuplicate && !editingVehicle) {
      toast.error("This registration number already exists");
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
    // FIX: stop click propagation so inner buttons don't bubble to outer form
    <div
      className="fixed inset-0 z-99999 flex items-center justify-center overflow-y-auto"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="bg-white rounded-xl w-full max-w-4xl mx-4 my-8 dark:bg-gray-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
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

        {/* IMPORTANT: No <form> tag here — modal is inside the outer <form> */}
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
                  className={`bg-gray-100 dark:bg-gray-800 cursor-not-allowed ${
                    isGeneratingId ? "animate-pulse" : ""
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

  // FIX: type="button" to prevent form submit
  const handleSubmit = () => {
    setLoading(true);
    onSave(vehicle.registrationNumber, { ...maintenanceData, ...driverData });
    setTimeout(() => {
      setLoading(false);
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
            onClick={handleSubmit}
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
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [existingRegNumbersSet, setExistingRegNumbersSet] = useState(new Set());
  const [selectedVehicleTypeData, setSelectedVehicleTypeData] = useState(null);
  const [isLoadingVehicleData, setIsLoadingVehicleData] = useState(false);
  const [currentEditingGroupId, setCurrentEditingGroupId] = useState(null);
  // Track which steps are completed for step indicator
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [stepErrors, setStepErrors] = useState({});

  const [commonInfo, setCommonInfo] = useState({
    customizedType: "Non-Customized",
    vehicleType: "",
    vehicleName: "",
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
    videoSize: "",
    backVideoSize: "",
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

  // Media files state with preview support
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

  // Handle file upload with preview
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
      toast.error("Please select a valid video file");
      return;
    }

    if (!isVideo && !validImageTypes.includes(file.type)) {
      toast.error("Please select a valid image file");
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

    // Clear existing URL when new file is uploaded
    setExistingMediaUrls((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  // Handle remove media
  const handleRemoveMedia = (field) => {
    if (mediaPreviews[field] && mediaPreviews[field].startsWith("blob:")) {
      URL.revokeObjectURL(mediaPreviews[field]);
    }
    setMediaPreviews((prev) => ({ ...prev, [field]: null }));
    setMediaFiles((prev) => ({ ...prev, [field]: null }));
    setExistingMediaUrls((prev) => ({ ...prev, [field]: "" }));
  };

  // Clean up previews on unmount
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
      const response = await axios.get(
        `${baseUrl}/api/getNewVehicles?page=1&limit=1000`
      );
      if (response.data.success) {
        const allRegNumbers = new Set();
        response.data.data.forEach((vehicle) => {
          if (vehicle.registrationVehicles) {
            vehicle.registrationVehicles.forEach((rv) => {
              allRegNumbers.add(rv.registrationNumber);
            });
          }
        });
        setExistingRegNumbersSet(allRegNumbers);
      }
    } catch (error) {
      console.error("Error fetching existing registration numbers:", error);
    }
  };

  const checkDuplicateRegistration = async (
    regNumber,
    excludeRegNumber = null
  ) => {
    const cleanReg = unformatRegistrationNumber(regNumber);

    // Check local duplicates
    const localDuplicate = vehicles.some(
      (v) =>
        unformatRegistrationNumber(v.registrationNumber) === cleanReg &&
        v.registrationNumber !== excludeRegNumber
    );
    if (localDuplicate) return true;

    // Check database duplicates
    if (
      existingRegNumbersSet.has(cleanReg) &&
      cleanReg !== excludeRegNumber
    )
      return true;

    return false;
  };

  const fetchVehicleTypes = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/vehicle-types`);
      if (response.data.success) {
        setVehicleTypes(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching vehicle types:", error);
    }
  };

  // Fetch complete vehicle details by type
  const fetchVehicleByType = async (typeId) => {
    if (!typeId) return;

    setIsLoadingVehicleData(true);
    try {
      const response = await axios.get(
        `${baseUrl}/api/getVehicleGroupByType/${typeId}`
      );
      if (response.data.success && response.data.data) {
        const vehicleData = response.data.data;
        setSelectedVehicleTypeData(vehicleData);
        setCurrentEditingGroupId(vehicleData._id);

        // Populate tech specs
        if (vehicleData.techSpecs) {
          setTechSpecs({
            screenType: vehicleData.techSpecs.screenType || "LED Only",
            numberOfScreens: vehicleData.techSpecs.numberOfScreens || "",
            screenSizeWidth: vehicleData.techSpecs.screenSizeWidth || "",
            screenSizeHeight: vehicleData.techSpecs.screenSizeHeight || "",
            backScreenWidth: vehicleData.techSpecs.backScreenWidth || "",
            backScreenHeight: vehicleData.techSpecs.backScreenHeight || "",
            resolution: vehicleData.techSpecs.resolution || "",
            backResolution: vehicleData.techSpecs.backResolution || "",
            videoSize: vehicleData.techSpecs.videoSize || "",
            backVideoSize: vehicleData.techSpecs.backVideoSize || "",
            audioOutput: vehicleData.techSpecs.audioOutput || "",
            brightness: vehicleData.techSpecs.brightness || "",
            displayVersion: vehicleData.techSpecs.displayVersion || "",
            soundQuality: vehicleData.techSpecs.soundQuality || "",
            generatorCapacity: vehicleData.techSpecs.generatorCapacity || "",
            additionalFeatures: vehicleData.techSpecs.additionalFeatures || "",
          });
        }

        // Populate pricing
        if (vehicleData.pricing) {
          setPricing({
            basePriceType: vehicleData.pricing.basePriceType || "Per Day",
            costPerDay: vehicleData.pricing.costPerDay
              ? String(vehicleData.pricing.costPerDay)
              : "",
            avgKmPerDay: vehicleData.pricing.avgKmPerDay
              ? String(vehicleData.pricing.avgKmPerDay)
              : "",
            extraKmPrice: vehicleData.pricing.extraKmPrice
              ? String(vehicleData.pricing.extraKmPrice)
              : "",
            avgBookingHrs: vehicleData.pricing.avgBookingHrs
              ? String(vehicleData.pricing.avgBookingHrs)
              : "",
            extraHrPrice: vehicleData.pricing.extraHrPrice
              ? String(vehicleData.pricing.extraHrPrice)
              : "",
            rtoCharges: vehicleData.pricing.rtoCharges
              ? String(vehicleData.pricing.rtoCharges)
              : "",
            fuelEfficiency: vehicleData.pricing.fuelEfficiency
              ? String(vehicleData.pricing.fuelEfficiency)
              : "",
            minBookingDuration: vehicleData.pricing.minBookingDuration || "",
            overtimeCharges: vehicleData.pricing.overtimeCharges
              ? String(vehicleData.pricing.overtimeCharges)
              : "",
            waitingCharges: vehicleData.pricing.waitingCharges
              ? String(vehicleData.pricing.waitingCharges)
              : "",
          });
        }

        // Populate media URLs — normalize paths for local file system paths
        if (vehicleData.mediaFiles) {
          setExistingMediaUrls({
            frontViewImage: vehicleData.mediaFiles.frontViewImage || "",
            leftSideImage: vehicleData.mediaFiles.leftSideImage || "",
            rightSideImage: vehicleData.mediaFiles.rightSideImage || "",
            rearViewImage: vehicleData.mediaFiles.rearViewImage || "",
            interiorImage: vehicleData.mediaFiles.interiorImage || "",
            demoVideo: vehicleData.mediaFiles.demoVideo || "",
          });
        }

        // Populate vehicles list with ALL fields properly mapped from nested schema
        if (
          vehicleData.registrationVehicles &&
          vehicleData.registrationVehicles.length > 0
        ) {
          const formattedVehicles = vehicleData.registrationVehicles.map(
            (rv) => ({
              registrationNumber: rv.registrationNumber,
              vehicleId: rv.vehicleId,
              city: rv.city || "",
              permitType: rv.permitType || "",
              modelConfig: rv.modelConfig || "",
              ownershipType: rv.ownershipType || "",
              fuelType: rv.fuelType || "",
              manufacturingYear: rv.manufacturingYear || "",
              gpsEnabled:
                rv.gpsEnabled !== undefined ? rv.gpsEnabled : true,
              activeStatus:
                rv.activeStatus !== undefined ? rv.activeStatus : true,
              // FIX: Properly map nested statusAvailability
              currentStatus:
                rv.statusAvailability?.currentStatus || "Available",
              availableFrom: rv.statusAvailability?.availableFrom
                ? rv.statusAvailability.availableFrom.split("T")[0]
                : "",
              remarks: rv.statusAvailability?.remarks || "",
              // FIX: Properly map nested driverDetails
              driverName: rv.driverDetails?.driverName || "",
              driverPhone: rv.driverDetails?.driverPhone || "",
              backupDriver: rv.driverDetails?.backupDriver || "",
              backupDriverPhone: rv.driverDetails?.backupDriverPhone || "",
              driverCharges: rv.driverDetails?.driverCharges
                ? String(rv.driverDetails.driverCharges)
                : "",
              // FIX: Properly map nested maintenance
              lastServiceDate: rv.maintenance?.lastServiceDate
                ? rv.maintenance.lastServiceDate.split("T")[0]
                : "",
              insuranceExpiryDate: rv.maintenance?.insuranceExpiryDate
                ? rv.maintenance.insuranceExpiryDate.split("T")[0]
                : "",
              pollutionExpiryDate: rv.maintenance?.pollutionExpiryDate
                ? rv.maintenance.pollutionExpiryDate.split("T")[0]
                : "",
            })
          );
          setVehicles(formattedVehicles);

          // Update existing registration numbers set
          const regNumbers = new Set(existingRegNumbersSet);
          formattedVehicles.forEach((v) =>
            regNumbers.add(
              unformatRegistrationNumber(v.registrationNumber)
            )
          );
          setExistingRegNumbersSet(regNumbers);
        }

        toast.success(
          `Loaded ${vehicleData.registrationVehicles?.length || 0} vehicle(s) for this type`
        );
      } else {
        setSelectedVehicleTypeData(null);
        setCurrentEditingGroupId(null);
        setVehicles([]);
        toast.info(
          "No existing vehicles found for this type. You can add new ones."
        );
      }
    } catch (error) {
      console.error("Error fetching vehicle by type:", error);
      setSelectedVehicleTypeData(null);
      setCurrentEditingGroupId(null);
      setVehicles([]);
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
        toast.success("Vehicle type created successfully");
        await fetchVehicleTypes();
        return response.data.data;
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error creating vehicle type"
      );
      throw error;
    }
  };

  const updateVehicleType = async (id, typeName) => {
    try {
      const response = await axios.put(`${baseUrl}/api/vehicle-types/${id}`, {
        typeName,
      });
      if (response.data.success) {
        toast.success("Vehicle type updated successfully");
        await fetchVehicleTypes();
        return response.data.data;
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error updating vehicle type"
      );
      throw error;
    }
  };

  const deleteVehicleType = async (id) => {
    try {
      const response = await axios.delete(
        `${baseUrl}/api/vehicle-types/${id}`
      );
      if (response.data.success) {
        toast.success("Vehicle type deleted successfully");
        await fetchVehicleTypes();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error deleting vehicle type"
      );
      throw error;
    }
  };

  useEffect(() => {
    fetchVehicleTypes();
    fetchExistingRegNumbers();
  }, []);

  // Load vehicle data when type is selected
  useEffect(() => {
    if (commonInfo.vehicleType) {
      fetchVehicleByType(commonInfo.vehicleType);
    } else {
      setVehicles([]);
      setSelectedVehicleTypeData(null);
      setCurrentEditingGroupId(null);
    }
  }, [commonInfo.vehicleType]);

  const steps = [
    { number: 1, title: "Basic Information" },
    { number: 2, title: "Technical Specification" },
    { number: 3, title: "Pricing & Charges" },
    { number: 4, title: "Media & Description" },
    { number: 5, title: "Drivers & Maintenance" },
    { number: 6, title: "Vehicle Summary" },
  ];

  const canAccessStep6 =
    commonInfo.vehicleType && vehicles.length > 0 && pricing.costPerDay;

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
      toast.success("Vehicle updated successfully");
    } else {
      const exists = vehicles.some(
        (v) =>
          unformatRegistrationNumber(v.registrationNumber) ===
          vehicleData.registrationNumber
      );
      if (exists) {
        toast.error("Vehicle with this registration number already exists");
        return;
      }
      setVehicles((prev) => [...prev, newVehicle]);
      setExistingRegNumbersSet(
        (prev) => new Set([...prev, vehicleData.registrationNumber])
      );
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
      setVehicles((prev) =>
        prev.filter((v) => v.registrationNumber !== registrationNumber)
      );
      toast.success("Vehicle removed successfully");
    }
  };

  // FIX: handleSaveMaintenance updates vehicles list in local state correctly
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
      )}`
    );
  };

  // ─── Per-step validation before advancing ──────────────────────────────────
  const handleNextStep = () => {
    const errors = validateStep(currentStep, {
      commonInfo,
      vehicles,
      pricing,
      techSpecs,
    });

    if (Object.keys(errors).length > 0) {
      setStepErrors(errors);
      // Show first error as toast
      toast.error(Object.values(errors)[0], {
        position: "bottom-right",
        autoClose: 3000,
      });
      return;
    }

    setStepErrors({});
    // Mark step as completed
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    setCurrentStep((prev) => prev + 1);
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

  // FIX: handleSubmit is only triggered at step 6; prevented at all other steps
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Critical guard — only submit on step 6
    if (currentStep !== 6) {
      return;
    }

    if (!validateForm()) {
      toast.error("Please fix the validation errors before submitting");
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();

      // FIX: Build registrationVehicles with proper nested structure for the backend
      const registrationVehicles = vehicles.map((vehicle) => ({
        registrationNumber: unformatRegistrationNumber(
          vehicle.registrationNumber
        ),
        vehicleId: vehicle.vehicleId,
        city: vehicle.city,
        modelConfig: vehicle.modelConfig,
        permitType: vehicle.permitType,
        ownershipType: vehicle.ownershipType,
        fuelType: vehicle.fuelType,
        manufacturingYear: vehicle.manufacturingYear,
        gpsEnabled: vehicle.gpsEnabled,
        activeStatus: vehicle.activeStatus,
        // FIX: Nest statusAvailability correctly
        statusAvailability: {
          currentStatus: vehicle.currentStatus || "Available",
          availableFrom: vehicle.availableFrom || null,
          remarks: vehicle.remarks || "",
        },
        // FIX: Nest maintenance correctly
        maintenance: {
          lastServiceDate: vehicle.lastServiceDate || null,
          insuranceExpiryDate: vehicle.insuranceExpiryDate || null,
          pollutionExpiryDate: vehicle.pollutionExpiryDate || null,
        },
        // FIX: Nest driverDetails correctly
        driverDetails: {
          driverName: vehicle.driverName || "",
          driverPhone: vehicle.driverPhone || "",
          backupDriver: vehicle.backupDriver || "",
          backupDriverPhone: vehicle.backupDriverPhone || "",
          driverCharges: vehicle.driverCharges
            ? Number(vehicle.driverCharges)
            : 0,
        },
      }));

      const payload = {
        basicInfo: {
          customizedType: commonInfo.customizedType,
          vehicleType: commonInfo.vehicleType,
        },
        techSpecs: techSpecs,
        pricing: {
          ...pricing,
          // Ensure numeric fields are numbers
          costPerDay: Number(pricing.costPerDay) || 0,
          avgKmPerDay: Number(pricing.avgKmPerDay) || 0,
          extraKmPrice: Number(pricing.extraKmPrice) || 0,
          avgBookingHrs: Number(pricing.avgBookingHrs) || 0,
          extraHrPrice: Number(pricing.extraHrPrice) || 0,
          rtoCharges: Number(pricing.rtoCharges) || 0,
          fuelEfficiency: Number(pricing.fuelEfficiency) || 0,
          overtimeCharges: Number(pricing.overtimeCharges) || 0,
          waitingCharges: Number(pricing.waitingCharges) || 0,
        },
        registrationVehicles: registrationVehicles,
      };

      formData.append("data", JSON.stringify(payload));

      // Append media files (only new files)
      Object.keys(mediaFiles).forEach((key) => {
        if (mediaFiles[key] && mediaFiles[key] instanceof File) {
          formData.append(key, mediaFiles[key]);
        }
      });

      let response;
      if (currentEditingGroupId) {
        response = await axios.put(
          `${baseUrl}/api/updateVehicle/${currentEditingGroupId}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percentCompleted);
            },
          }
        );
      } else {
        response = await axios.post(
          `${baseUrl}/api/createVehicle`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percentCompleted);
            },
          }
        );
      }

      if (response.data.success) {
        toast.success(response.data.message);
        // Reset form after successful submission
        setVehicles([]);
        setCommonInfo({
          customizedType: "Non-Customized",
          vehicleType: "",
          vehicleName: "",
        });
        setTechSpecs({
          screenType: "LED Only",
          numberOfScreens: "",
          screenSizeWidth: "",
          screenSizeHeight: "",
          backScreenWidth: "",
          backScreenHeight: "",
          resolution: "",
          backResolution: "",
          videoSize: "",
          backVideoSize: "",
          audioOutput: "",
          brightness: "",
          displayVersion: "",
          soundQuality: "",
          generatorCapacity: "",
          additionalFeatures: "",
        });
        setPricing({
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

        // Reset media
        Object.keys(mediaPreviews).forEach((key) => {
          if (mediaPreviews[key] && mediaPreviews[key].startsWith("blob:")) {
            URL.revokeObjectURL(mediaPreviews[key]);
          }
        });
        setMediaFiles({
          frontViewImage: null,
          leftSideImage: null,
          rightSideImage: null,
          rearViewImage: null,
          interiorImage: null,
          demoVideo: null,
        });
        setMediaPreviews({
          frontViewImage: null,
          leftSideImage: null,
          rightSideImage: null,
          rearViewImage: null,
          interiorImage: null,
          demoVideo: null,
        });
        setExistingMediaUrls({
          frontViewImage: "",
          leftSideImage: "",
          rightSideImage: "",
          rearViewImage: "",
          interiorImage: "",
          demoVideo: "",
        });
        setCurrentEditingGroupId(null);
        setCompletedSteps(new Set());
        setCurrentStep(1);
        setUploadProgress(0);
        fetchExistingRegNumbers();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(
        error.response?.data?.message ||
          "Error saving vehicle. Please try again."
      );
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
    basePriceTypeOptions: [
      { value: "Per Day", label: "Per Day" },
      { value: "Per Hour", label: "Per Hour" },
      { value: "Per KM", label: "Per KM" },
    ],
    numberOfScreensOptions: [
      { value: "1", label: "1 Screen" },
      { value: "2", label: "2 Screens" },
      { value: "3", label: "3 Screens" },
      { value: "4", label: "4 Screens" },
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
      <ToastContainer position="top-right" />

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
      />

      {/* FIX: onSubmit only fires on explicit submit button in step 6 */}
      <form onSubmit={handleSubmit}>
        <div className="px-6 pb-10">
          <StepperHeader
            steps={steps}
            currentStep={currentStep}
            onStepClick={(stepNum) => {
              // Prevent jumping forward beyond completed steps + 1
              if (stepNum <= Math.max(...Array.from(completedSteps), 0) + 1 || stepNum <= currentStep) {
                if (stepNum === 6 && !canAccessStep6) return;
                setCurrentStep(stepNum);
              }
            }}
            canAccessStep6={canAccessStep6}
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
                  {(validationErrors.vehicleType ||
                    stepErrors.vehicleType) && (
                    <p className="mt-1 text-xs text-red-500">
                      {validationErrors.vehicleType || stepErrors.vehicleType}
                    </p>
                  )}
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
                {(validationErrors.vehicles || stepErrors.vehicles) && (
                  <p className="mt-1 text-xs text-red-500">
                    {validationErrors.vehicles || stepErrors.vehicles}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {currentStep === 2 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <SectionHeader
                number={2}
                title="Technical Specifications"
                icon="🖥️"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label>
                    📺 Screen Type <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Select
                      options={selectOptions.screenTypeOptions}
                      placeholder="LED Only"
                      value={techSpecs.screenType}
                      onChange={(value) =>
                        setTechSpecs((prev) => ({
                          ...prev,
                          screenType: value,
                        }))
                      }
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                  {stepErrors.screenType && (
                    <p className="mt-1 text-xs text-red-500">
                      {stepErrors.screenType}
                    </p>
                  )}
                </div>

                <div>
                  <Label>
                    🔢 Number of Screens{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <RadioGroup
                    options={selectOptions.numberOfScreensOptions}
                    value={techSpecs.numberOfScreens}
                    onChange={(value) =>
                      setTechSpecs((prev) => ({
                        ...prev,
                        numberOfScreens: value,
                      }))
                    }
                  />
                  {stepErrors.numberOfScreens && (
                    <p className="mt-1 text-xs text-red-500">
                      {stepErrors.numberOfScreens}
                    </p>
                  )}
                </div>

                <div>
                  <Label>
                    Left/Right Screen Size{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={techSpecs.screenSizeWidth}
                      placeholder="Width (ft)"
                      className="flex-1"
                      onChange={(e) => {
                        if (validateNumber(e.target.value, true)) {
                          setTechSpecs((prev) => ({
                            ...prev,
                            screenSizeWidth: e.target.value,
                          }));
                        }
                      }}
                    />
                    <Input
                      type="text"
                      value={techSpecs.screenSizeHeight}
                      placeholder="Height (ft)"
                      className="flex-1"
                      onChange={(e) => {
                        if (validateNumber(e.target.value, true)) {
                          setTechSpecs((prev) => ({
                            ...prev,
                            screenSizeHeight: e.target.value,
                          }));
                        }
                      }}
                    />
                  </div>
                  {stepErrors.screenSize && (
                    <p className="mt-1 text-xs text-red-500">
                      {stepErrors.screenSize}
                    </p>
                  )}
                </div>

                <div>
                  <Label>
                    Back Screen Size <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={techSpecs.backScreenWidth}
                      placeholder="Width (ft)"
                      className="flex-1"
                      onChange={(e) => {
                        if (validateNumber(e.target.value, true)) {
                          setTechSpecs((prev) => ({
                            ...prev,
                            backScreenWidth: e.target.value,
                          }));
                        }
                      }}
                    />
                    <Input
                      type="text"
                      value={techSpecs.backScreenHeight}
                      placeholder="Height (ft)"
                      className="flex-1"
                      onChange={(e) => {
                        if (validateNumber(e.target.value, true)) {
                          setTechSpecs((prev) => ({
                            ...prev,
                            backScreenHeight: e.target.value,
                          }));
                        }
                      }}
                    />
                  </div>
                </div>

                <div>
                  <Label>
                    Front Resolution <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={techSpecs.resolution}
                    placeholder="e.g., 1920x1080"
                    onChange={handleInputChange(setTechSpecs, "resolution")}
                  />
                  {stepErrors.resolution && (
                    <p className="mt-1 text-xs text-red-500">
                      {stepErrors.resolution}
                    </p>
                  )}
                </div>

                <div>
                  <Label>
                    Back Resolution <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={techSpecs.backResolution}
                    placeholder="e.g., 480x520"
                    onChange={handleInputChange(setTechSpecs, "backResolution")}
                  />
                </div>

                <div>
                  <Label>
                    Front Video Size <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={techSpecs.videoSize}
                    placeholder="e.g., 1920x1080 px"
                    onChange={handleInputChange(setTechSpecs, "videoSize")}
                  />
                </div>

                <div>
                  <Label>
                    Back Video Size <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={techSpecs.backVideoSize}
                    placeholder="e.g., 480x520 px"
                    onChange={handleInputChange(setTechSpecs, "backVideoSize")}
                  />
                </div>

                <div>
                  <Label>
                    Audio Output <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={techSpecs.audioOutput}
                    placeholder="e.g., 600 watts"
                    onChange={(e) => {
                      if (validateNumber(e.target.value, true)) {
                        setTechSpecs((prev) => ({
                          ...prev,
                          audioOutput: e.target.value,
                        }));
                      }
                    }}
                  />
                  {stepErrors.audioOutput && (
                    <p className="mt-1 text-xs text-red-500">
                      {stepErrors.audioOutput}
                    </p>
                  )}
                </div>

                <div>
                  <Label>
                    Generator Capacity{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={techSpecs.generatorCapacity}
                    placeholder="e.g., 7 KV"
                    onChange={handleInputChange(
                      setTechSpecs,
                      "generatorCapacity"
                    )}
                  />
                  {stepErrors.generatorCapacity && (
                    <p className="mt-1 text-xs text-red-500">
                      {stepErrors.generatorCapacity}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Brightness (Nits)</Label>
                  <Input
                    type="text"
                    value={techSpecs.brightness}
                    placeholder="e.g. 5500"
                    onChange={(e) => {
                      if (validateNumber(e.target.value, false)) {
                        setTechSpecs((prev) => ({
                          ...prev,
                          brightness: e.target.value,
                        }));
                      }
                    }}
                  />
                </div>

                <div>
                  <Label>
                    Display Version / Controller{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Select
                      options={selectOptions.displayVersionOptions}
                      placeholder="Select Display Version"
                      value={techSpecs.displayVersion}
                      onChange={(value) =>
                        setTechSpecs((prev) => ({
                          ...prev,
                          displayVersion: value,
                        }))
                      }
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                  {stepErrors.displayVersion && (
                    <p className="mt-1 text-xs text-red-500">
                      {stepErrors.displayVersion}
                    </p>
                  )}
                </div>

                <div>
                  <Label>
                    🎚️ Sound Quality{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Select
                      options={selectOptions.soundQualityOptions}
                      placeholder="Select Quality"
                      value={techSpecs.soundQuality}
                      onChange={(value) =>
                        setTechSpecs((prev) => ({
                          ...prev,
                          soundQuality: value,
                        }))
                      }
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                  {stepErrors.soundQuality && (
                    <p className="mt-1 text-xs text-red-500">
                      {stepErrors.soundQuality}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label>✨ Additional Features </Label>
                  <Input
                    placeholder="e.g. Built-in Amplifier, USB, WiFi"
                    value={techSpecs.additionalFeatures}
                    onChange={(e) =>
                      setTechSpecs((prev) => ({
                        ...prev,
                        additionalFeatures: e.target.value,
                      }))
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6 pt-6 border-t">
                  <div>
                    <Label>🎬 Video Format</Label>
                    <Input placeholder="e.g. MP4" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3 ── */}
          {currentStep === 3 && (
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
          )}

          {/* ── STEP 4 ── */}
          {currentStep === 4 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <SectionHeader
                number={4}
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
                <textarea
                  rows={4}
                  className="w-full mt-1 rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                  placeholder="Enter detailed description about the vehicle..."
                />
              </div>
            </div>
          )}

          {/* ── STEP 5 ── */}
          {currentStep === 5 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <SectionHeader
                number={5}
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
                              {/* FIX: type="button" prevents form submit */}
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

          {/* ── STEP 6 ── */}
          {currentStep === 6 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <SectionHeader number={6} title="Vehicle Summary" icon="📊" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">🚚 Total Vehicles</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {vehicles.length}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">💵 Base Price</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{pricing.costPerDay || 0}
                  </p>
                </div>
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
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  ← Previous
                </button>
              )}
              {/* FIX: Only show Submit on step 6; Next on all other steps */}
              {currentStep < 6 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Save & Next →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                >
                  {loading
                    ? "Saving..."
                    : `✅ Submit ${vehicles.length} Vehicle(s)`}
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}