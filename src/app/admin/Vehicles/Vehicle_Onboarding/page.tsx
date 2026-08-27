// /* eslint-disable */
// // @ts-nocheck

// "use client";

// import React, { useState, useEffect, useCallback, useRef } from "react";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import Label from "@/components/form/Label";
// import Input from "@/components/form/input/InputField";
// import Select from "@/components/form/Select";
// import Switch from "@/components/form/switch/Switch";
// import axios from "axios";
// import { baseUrl } from "../../../../BaseUrl";
// import AdminSelectOptions from "../../AdminSelectOptions.json";
// import { useAuthGuard } from "../../../utils/useAuthGuard";

// // ── CHANGE A: Replace emoji icons with Lucide React icons ──────────────────
// import {
//   Truck,
//   Trash2,
//   Calendar,
//   Upload,
//   X,
//   Eye,
//   Plus,
//   ChevronDown,
//   PenLine,
//   Monitor,
//   Film,
//   BarChart2,
//   Settings,
//   Wifi,
//   WifiOff,
//   ClipboardList,
//   Info,
//   AlertTriangle,
//   CheckCircle2,
//   Wrench,
//   User,
//   Phone,
//   Fuel,
//   Hash,
//   MapPin,
//   Camera,
//   FileText,
//   Layers,
//   Activity,
//   Save,
//   RotateCcw,
//   ChevronLeft,
//   ChevronRight,
// } from "lucide-react";

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

// // ─── Helper: Convert backend file path to accessible URL ─────────────────────
// const normalizeMediaUrl = (url) => {
//   if (!url) return "";
//   if (url.startsWith("http://") || url.startsWith("https://")) return url;
//   const match = url.replace(/\\/g, "/").match(/public\/uploads\/.+/);
//   if (match) {
//     return `${baseUrl}/${match[0]}`;
//   }
//   if (url.startsWith("/")) {
//     return `${baseUrl}${url}`;
//   }
//   return url;
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
//           <label
//             key={option.value}
//             className="flex items-center gap-2 cursor-pointer"
//           >
//             <input
//               type="radio"
//               name={label}
//               value={option.value}
//               checked={value === option.value}
//               onChange={(e) => onChange(e.target.value)}
//               className="w-4 h-4 text-blue-600 focus:ring-blue-500"
//             />
//             <span className="text-sm text-gray-700 dark:text-gray-300">
//               {option.label}
//             </span>
//           </label>
//         ))}
//       </div>
//     </div>
//   );
// };

// // ─── Inline Textarea ───────────────────────────────────────────────────────────
// const Textarea = ({
//   rows = 3,
//   placeholder,
//   value,
//   onChange,
//   className = "",
//   disabled = false,
// }) => (
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
// const DateInput = ({
//   value,
//   onChange,
//   placeholder,
//   disabled = false,
//   required = false,
// }) => {
//   return (
//     <div className="relative">
//       <Input
//         type="date"
//         value={value}
//         onChange={onChange}
//         placeholder={placeholder}
//         disabled={disabled}
//         className={`${disabled ? "bg-gray-100 dark:bg-gray-800" : ""} pr-10`}
//       />
//       <span className="absolute text-gray-400 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-500">
//         <Calendar size={16} />
//       </span>
//       {required && value && (
//         <span className="absolute text-green-500 right-3 top-1/2 -translate-y-1/2">
//           <CheckCircle2 size={14} />
//         </span>
//       )}
//     </div>
//   );
// };

// // ─── Image/Video Preview Component with URL support ─────────────────────────
// const MediaPreviewCard = ({
//   label,
//   file,
//   previewUrl,
//   existingUrl,
//   onUpload,
//   onRemove,
//   icon,
//   accept,
// }) => {
//   const [showPreview, setShowPreview] = useState(false);

//   const normalizedExistingUrl = normalizeMediaUrl(existingUrl);
//   const displayUrl = previewUrl || normalizedExistingUrl;

//   const getPreviewContent = () => {
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
//             onError={(e) => {
//               e.currentTarget.style.display = "none";
//               const parent = e.currentTarget.parentElement;
//               if (parent && !parent.querySelector(".img-fallback")) {
//                 const fallback = document.createElement("div");
//                 fallback.className =
//                   "img-fallback w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 text-sm";
//                 fallback.innerText = "Preview unavailable";
//                 parent.appendChild(fallback);
//               }
//             }}
//           />
//         );
//       }
//     }
//     return (
//       <div className="w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
//         {/* CHANGE A: replaced emoji icon with lucide icon component */}
//         <span className="text-gray-400">{icon}</span>
//       </div>
//     );
//   };

//   const hasMedia = !!(file || normalizedExistingUrl);

//   return (
//     <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-200">
//       <div className="relative group">
//         <div className="mb-3">{getPreviewContent()}</div>

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
//                 e.target.value = "";
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
//       <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-2">
//         {label}
//       </p>
//     </div>
//   );
// };

// // ─── Stepper Header ─────────────────────────────────────────────────────────
// const StepperHeader = ({ steps, currentStep, onStepClick, canAccessStep6, stepCompletionStatus }) => {
//   return (
//     <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-6 px-6 py-4 overflow-x-auto">
//       <div className="flex items-center min-w-max gap-0">
//         {steps.map((step, idx) => {
//           const isCompleted = currentStep > step.number;
//           const isActive = currentStep === step.number;
//           const isDisabled = step.number === 5 && !canAccessStep6;

//           return (
//             <React.Fragment key={step.number}>
//               <button
//                 type="button"
//                 onClick={() => !isDisabled && onStepClick(step.number)}
//                 className="flex items-center gap-2 group focus:outline-none"
//                 disabled={isDisabled}
//               >
//                 <div
//                   className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all duration-200 shrink-0 ${stepCompletionStatus[step.number] || (currentStep > step.number)
//                     ? "bg-green-600 text-white"
//                     : isActive
//                       ? "bg-blue-600 text-white ring-4 ring-blue-100"
//                       : isDisabled
//                         ? "bg-gray-300 text-gray-400 cursor-not-allowed dark:bg-gray-700"
//                         : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
//                     }`}
//                 >
//                   {(stepCompletionStatus[step.number] || (currentStep > step.number)) ? (
//                     <CheckCircle2 size={16} />
//                   ) : (
//                     step.number
//                   )}
//                 </div>
//                 <span
//                   className={`text-sm font-medium whitespace-nowrap transition-colors ${isActive
//                     ? "text-blue-600 dark:text-blue-400"
//                     : (stepCompletionStatus[step.number] || (currentStep > step.number))
//                       ? "text-green-600 dark:text-green-400"
//                       : isDisabled
//                         ? "text-gray-400 cursor-not-allowed"
//                         : "text-gray-400 dark:text-gray-500"
//                     }`}
//                 >
//                   {step.title}
//                 </span>
//               </button>
//               {idx < steps.length - 1 && (
//                 <div className="flex items-center mx-2 shrink-0">
//                   <div
//                     className={`h-0.5 w-10 rounded transition-colors duration-300 ${currentStep > step.number
//                       ? "bg-blue-400"
//                       : "bg-gray-200 dark:bg-gray-700"
//                       }`}
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
// // CHANGE A: icon prop now accepts JSX (Lucide component) instead of emoji string
// const SectionHeader = ({ number, title, icon }) => (
//   <div className="flex items-center gap-3 mb-6">
//     <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-600 text-white text-sm font-bold shadow-md">
//       {number}
//     </div>
//     <div>
//       <h2 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight flex items-center gap-2">
//         {icon && <span className="text-blue-600">{icon}</span>}
//         {title}
//       </h2>
//     </div>
//   </div>
// );

// // ─── Status Badge ─────────────────────────────────────────────────────────────
// const StatusBadge = ({ status }) => {
//   const styles = {
//     Available: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
//     Unavailable: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
//     "Waiting for Status": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
//     Maintenance: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
//     Booked: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
//     Damaged: "bg-red-200 text-red-900 dark:bg-red-900/40 dark:text-red-300",
//   };
//   return (
//     <span
//       className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles["Waiting for Status"]
//         }`}
//     >
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
//   return `${clean.slice(0, 2)} ${clean.slice(2, 4)} ${clean.slice(4, 6)} ${clean.slice(6, 10)}`;
// };

// const unformatRegistrationNumber = (regNumber) => {
//   if (!regNumber) return "";
//   return regNumber.replace(/\s/g, "").toUpperCase();
// };

// // ─── Step validation rules ────────────────────────────────────────────────────
// const validateStep = (step, { commonInfo, vehicles, techSpecs, vehicleDescription }) => {
//   const errors = {};

//   if (step === 1) {
//     if (!commonInfo.vehicleType) errors.vehicleType = "Vehicle Type is required";
//     if (vehicles.length === 0)
//       errors.vehicles = "At least one vehicle is required";
//   }

//   if (step === 2) {
//     if (!techSpecs.screenType) errors.screenType = "Screen Type is required";
//     if (!techSpecs.numberOfScreens)
//       errors.numberOfScreens = "Number of Screens is required";

//     const num = techSpecs.numberOfScreens;

//     if (num === "1") {
//       // 1 screen = back screen only
//       if (!techSpecs.backScreenWidth || !techSpecs.backScreenHeight)
//         errors.backScreenSize = "Back Screen size (Width & Height) is required";
//       if (!techSpecs.backResolutionWidth || !techSpecs.backResolutionHeight)
//         errors.backResolution = "Back Resolution (Width & Height) is required";
//     } else if (num === "2") {
//       // 2 screens = left + right (no back)
//       if (!techSpecs.leftScreenWidth || !techSpecs.leftScreenHeight)
//         errors.leftScreenSize = "Left Screen size (Width & Height) is required";
//       if (!techSpecs.rightScreenWidth || !techSpecs.rightScreenHeight)
//         errors.rightScreenSize = "Right Screen size (Width & Height) is required";
//       if (!techSpecs.leftResolutionWidth || !techSpecs.leftResolutionHeight)
//         errors.leftResolution = "Left Resolution (Width & Height) is required";
//       if (!techSpecs.rightResolutionWidth || !techSpecs.rightResolutionHeight)
//         errors.rightResolution = "Right Resolution (Width & Height) is required";
//     } else if (num === "3") {
//       // 3 screens = left/right (shared) + back
//       if (!techSpecs.leftRightScreenWidth || !techSpecs.leftRightScreenHeight)
//         errors.leftRightScreenSize = "Left/Right Screen size (Width & Height) is required";
//       if (!techSpecs.leftRightResolutionWidth || !techSpecs.leftRightResolutionHeight)
//         errors.leftRightResolution = "Left/Right Resolution (Width & Height) is required";
//     }

//     if (!techSpecs.audioOutput) errors.audioOutput = "Audio Output is required";
//     if (!techSpecs.generatorCapacity)
//       errors.generatorCapacity = "Generator Capacity is required";
//     if (!techSpecs.displayVersion)
//       errors.displayVersion = "Display Version is required";
//     // CHANGE C: soundQuality removed from required validation
//   }

//   if (step === 3) {
//     if (!vehicleDescription) errors.vehicleDescription = "Vehicle Description is required";
//   }

//   return errors;
// };

// // ─── Vehicle Type Management Modal ───────────────────────────────────────────
// const VehicleTypeModal = ({
//   isOpen,
//   onClose,
//   onSave,
//   onUpdate,
//   onDelete,
//   editingType,
//   vehicleTypes,
//   setEditingType,
// }) => {
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
//       toast.error("Please enter vehicle type name", { position: "bottom-right", autoClose: 3000 });
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
//           <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
//             <ClipboardList size={20} className="text-blue-600" />
//             Manage Vehicle Types
//           </h3>
//           <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
//             <X size={20} />
//           </button>
//         </div>

//         <div className="p-6">
//           <button
//             type="button"
//             onClick={() => setShowAddForm(!showAddForm)}
//             className="flex items-center gap-2 mb-4 text-blue-600 hover:text-blue-700"
//           >
//             <Plus size={16} />
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
//                   type="button"
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
//                 <div
//                   key={type._id}
//                   className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
//                 >
//                   <span className="text-gray-800 dark:text-white">{type.typeName}</span>
//                   <div className="flex gap-2">
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setEditingType(type);
//                         setTypeName(type.typeName);
//                         setShowAddForm(true);
//                       }}
//                       className="text-blue-500 hover:text-blue-700"
//                     >
//                       <PenLine size={16} />
//                     </button>
//                     <button
//                       type="button"
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

// // ─── Add Vehicle Modal ─────────────────────────────────────────────────────────
// const AddVehicleModal = ({
//   isOpen,
//   onClose,
//   onSave,
//   editingVehicle,
//   existingRegNumbers,
//   onCheckDuplicate,
//   vehicleTypes,
// }) => {
//   const [formData, setFormData] = useState({
//     registrationNumber: "",
//     vehicleId: "",
//     city: "Tamil Nadu, Madurai",
//     permitType: "",
//     modelConfig: "",
//     ownershipType: "",
//     fuelType: "",
//     manufacturingYear: "",
//     gpsEnabled: true,
//     activeStatus: true,
//     currentStatus: "Waiting for Status",
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
//       const day = String(now.getDate()).padStart(2, "0");
//       const month = String(now.getMonth() + 1).padStart(2, "0");
//       const year = String(now.getFullYear()).slice(-2);
//       const random = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
//       return `${day}${month}${year}${random}`;
//     } finally {
//       setIsGeneratingId(false);
//     }
//   };

//   useEffect(() => {
//     if (!editingVehicle && isOpen) {
//       const generateId = async () => {
//         const newVehicleId = await generateVehicleIdFromBackend();
//         setFormData((prev) => ({ ...prev, vehicleId: newVehicleId }));
//       };
//       generateId();
//     }
//   }, [isOpen, editingVehicle]);

//   useEffect(() => {
//     if (editingVehicle) {
//       setFormData({
//         registrationNumber: formatRegistrationNumber(editingVehicle.registrationNumber) || "",
//         vehicleId: editingVehicle.vehicleId || "",
//         city: editingVehicle.city || "Tamil Nadu, Madurai",
//         permitType: editingVehicle.permitType || "",
//         modelConfig: editingVehicle.modelConfig || "",
//         ownershipType: editingVehicle.ownershipType || "",
//         fuelType: editingVehicle.fuelType || "",
//         manufacturingYear: editingVehicle.manufacturingYear || "",
//         gpsEnabled: editingVehicle.gpsEnabled !== undefined ? editingVehicle.gpsEnabled : true,
//         activeStatus: editingVehicle.activeStatus !== undefined ? editingVehicle.activeStatus : true,
//         currentStatus: editingVehicle.currentStatus || "Waiting for Status",
//         availableFrom: editingVehicle.availableFrom || "",
//         remarks: editingVehicle.remarks || "",
//         driverName: editingVehicle.driverName || "",
//         driverPhone: editingVehicle.driverPhone || "",
//         backupDriver: editingVehicle.backupDriver || "",
//         backupDriverPhone: editingVehicle.backupDriverPhone || "",
//         driverCharges: editingVehicle.driverCharges ? String(editingVehicle.driverCharges) : "",
//         lastServiceDate: editingVehicle.lastServiceDate || "",
//         insuranceExpiryDate: editingVehicle.insuranceExpiryDate || "",
//         pollutionExpiryDate: editingVehicle.pollutionExpiryDate || "",
//       });
//     } else if (!editingVehicle && isOpen) {
//       setFormData((prev) => ({
//         ...prev,
//         registrationNumber: "",
//         city: "Tamil Nadu, Madurai",
//         permitType: "",
//         modelConfig: "",
//         ownershipType: "",
//         fuelType: "",
//         manufacturingYear: "",
//         gpsEnabled: true,
//         activeStatus: true,
//         currentStatus: "Waiting for Status",
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
//       }));
//     }
//     setRegistrationError("");
//     setYearError("");
//     setPhoneError("");
//   }, [editingVehicle, isOpen]);

//   const handleYearChange = (value) => {
//     const currentYear = new Date().getFullYear();
//     if (value !== "" && !/^\d*$/.test(value)) return;
//     if (value && parseInt(value) > currentYear) {
//       setYearError(`Manufacturing year must be ${currentYear} or earlier`);
//     } else if (value && parseInt(value) < 1900 && value.length === 4) {
//       setYearError("Year must be 1900 or later");
//     } else {
//       setYearError("");
//     }
//     setFormData((prev) => ({ ...prev, manufacturingYear: value }));
//   };

//   const handlePhoneChange = (field, value) => {
//     if (value !== "" && !/^\d*$/.test(value)) return;
//     if (value.length > 10) return;
//     setFormData((prev) => ({ ...prev, [field]: value }));
//     if (field === "driverPhone") {
//       if (value && value.length === 10) {
//         setPhoneError("");
//       } else if (value && value.length > 0 && value.length !== 10) {
//         setPhoneError("Phone number must be 10 digits");
//       } else {
//         setPhoneError("");
//       }
//     }
//   };

//   const checkDuplicateRealTime = useCallback(
//     async (value) => {
//       const cleanValue = unformatRegistrationNumber(value);
//       if (cleanValue.length === 10 && isValidRegistrationNumber(value)) {
//         setIsCheckingDuplicate(true);
//         try {
//           const isDuplicate = await onCheckDuplicate(cleanValue, editingVehicle?.registrationNumber);
//           if (isDuplicate && !editingVehicle) {
//             setRegistrationError("This registration number already exists");
//           } else {
//             setRegistrationError("");
//           }
//         } catch (error) {
//           console.error("Duplicate check error:", error);
//         } finally {
//           setIsCheckingDuplicate(false);
//         }
//       } else {
//         setRegistrationError("");
//       }
//     },
//     [editingVehicle, onCheckDuplicate]
//   );

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
//     if (!cityFilter.trim()) return;
//     const baseCities = AdminSelectOptions.cities;
//     const alreadyExists =
//       baseCities.includes(cityFilter) ||
//       customCities.some((c) => c.value === cityFilter);
//     if (!alreadyExists) {
//       setCustomCities((prev) => [...prev, { value: cityFilter, label: cityFilter }]);
//     }
//     setFormData((prev) => ({ ...prev, city: cityFilter }));
//     setCityFilter("");
//   };

//   const selectOptions = {
//     cityOptions: [
//       ...AdminSelectOptions.cities.map((city) => ({ value: city, label: city })),
//       ...customCities,
//     ],
//     permitOptions: [...AdminSelectOptions.permitOptions.map((option) => ({ value: option.value, label: option.label }))],
//     modelOptions: [...AdminSelectOptions.modelOptions.map((option) => ({ value: option.value, label: option.label }))],
//     ownershipOptions: [...AdminSelectOptions.ownershipOptions.map((option) => ({ value: option.value, label: option.label }))],
//     fuelTypeOptions: [...AdminSelectOptions.fuelTypeOptions.map((option) => ({ value: option.value, label: option.label }))],
//   };

//   const handleSubmit = async (e) => {
//     if (e) { e.preventDefault(); e.stopPropagation(); }

//     const cleanReg = unformatRegistrationNumber(formData.registrationNumber);
//     if (!cleanReg || cleanReg.length !== 10 || !isValidRegistrationNumber(formData.registrationNumber)) {
//       toast.error("Please enter a valid registration number", { position: "bottom-right", autoClose: 3000 });
//       return;
//     }
//     if (!formData.city) {
//       toast.error("City is required", { position: "bottom-right", autoClose: 3000 });
//       return;
//     }
//     if (!formData.fuelType) {
//       toast.error("Fuel Type is required", { position: "bottom-right", autoClose: 3000 });
//       return;
//     }

//     if (formData.manufacturingYear) {
//       const currentYear = new Date().getFullYear();
//       const yearNum = parseInt(formData.manufacturingYear);
//       if (isNaN(yearNum) || yearNum > currentYear || yearNum < 1900) {
//         toast.error(`Manufacturing year must be between 1900 and ${currentYear}`, { position: "bottom-right", autoClose: 3000 });
//         return;
//       }
//     }

//     if (formData.driverPhone && formData.driverPhone.length !== 10) {
//       toast.error("Driver phone number must be 10 digits", { position: "bottom-right", autoClose: 3000 });
//       return;
//     }

//     if (formData.backupDriverPhone && formData.backupDriverPhone.length !== 10 && formData.backupDriverPhone.length > 0) {
//       toast.error("Backup driver phone number must be 10 digits", { position: "bottom-right", autoClose: 3000 });
//       return;
//     }

//     if (formData.currentStatus === "Unavailable" && !formData.availableFrom) {
//       toast.error("Please provide Available From date for Unavailable status", { position: "bottom-right", autoClose: 3000 });
//       return;
//     }
//     if (formData.currentStatus === "Unavailable" && !formData.remarks) {
//       toast.error("Please provide remarks for Unavailable status", { position: "bottom-right", autoClose: 3000 });
//       return;
//     }

//     const isDuplicate = await onCheckDuplicate(cleanReg, editingVehicle?.registrationNumber);
//     if (isDuplicate && !editingVehicle) {
//       toast.error("This registration number already exists", { position: "bottom-right", autoClose: 3000 });
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
//       onClick={(e) => e.stopPropagation()}
//     >
//       <div
//         className="bg-white rounded-xl w-full max-w-4xl mx-4 my-8 dark:bg-gray-800 shadow-2xl"
//         onClick={(e) => e.stopPropagation()}
//         onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); }}
//       >
//         <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
//           <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
//             <Truck size={20} className="text-blue-600" />
//             {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
//           </h3>
//           <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
//             <X size={20} />
//           </button>
//         </div>

//         <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
//           <div className="space-y-6">
//             <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
//               <Label>
//                 <span className="flex items-center gap-1"><Hash size={14} /> Registration Number <span className="text-red-500">*</span></span>
//               </Label>
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
//               {registrationError && <p className="mt-1 text-xs text-red-500">{registrationError}</p>}
//               {!registrationError && formData.registrationNumber && isValidRegistrationNumber(formData.registrationNumber) && (
//                 <p className="mt-1 text-xs text-green-500 flex items-center gap-1"><CheckCircle2 size={12} /> Valid registration number</p>
//               )}
//             </div>

//             <div>
//               <Label><span className="flex items-center gap-1"><Hash size={14} /> Vehicle ID <span className="text-red-500">*</span></span></Label>
//               <div className="relative">
//                 <Input
//                   type="text"
//                   value={formData.vehicleId || (isGeneratingId ? "Generating..." : "")}
//                   placeholder="Auto generated"
//                   disabled
//                   className={`bg-gray-100 dark:bg-gray-800 cursor-not-allowed ${isGeneratingId ? "animate-pulse" : ""}`}
//                 />
//                 {isGeneratingId && (
//                   <div className="absolute right-3 top-1/2 -translate-y-1/2">
//                     <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//                   </div>
//                 )}
//               </div>
//               <p className="mt-1 text-xs text-gray-400">
//                 {formData.vehicleId ? `Vehicle ID: ${formData.vehicleId}` : "Vehicle ID will be auto-generated"}
//               </p>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//               {/* City field hidden per original code */}
//               <div style={{ display: "none" }}>
//                 <Label><span className="flex items-center gap-1"><MapPin size={14} /> City / Operating Location <span className="text-red-500">*</span></span></Label>
//                 <div className="relative">
//                   <Select
//                     options={selectOptions.cityOptions}
//                     placeholder="Select City"
//                     value={formData.city}
//                     onChange={(value) => setFormData((prev) => ({ ...prev, city: value }))}
//                   />
//                   <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                     <ChevronDown size={16} />
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
//                   <button type="button" onClick={handleAddCity} className="px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">
//                     Add
//                   </button>
//                 </div>
//               </div>

//               <div>
//                 <Label><span className="flex items-center gap-1"><Fuel size={14} /> Fuel Type <span className="text-red-500">*</span></span></Label>
//                 <div className="relative">
//                   <Select
//                     options={selectOptions.fuelTypeOptions}
//                     placeholder="Select Fuel Type"
//                     value={formData.fuelType}
//                     onChange={(value) => setFormData((prev) => ({ ...prev, fuelType: value }))}
//                   />
//                   <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                     <ChevronDown size={16} />
//                   </span>
//                 </div>
//               </div>

//               <div>
//                 <Label><span className="flex items-center gap-1"><Calendar size={14} /> Manufacturing Year <span className="text-red-500">*</span></span></Label>
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

//             <div className="flex gap-6 pt-2">
//               <div>
//                 <Label><span className="flex items-center gap-1"><Wifi size={14} /> GPS Enabled <span className="text-red-500">*</span></span></Label>
//                 <Switch
//                   label={formData.gpsEnabled ? "Enabled" : "Disabled"}
//                   defaultChecked={formData.gpsEnabled}
//                   onChange={(checked) => setFormData((prev) => ({ ...prev, gpsEnabled: checked }))}
//                 />
//               </div>
//             </div>

//             <div className="border-t pt-6 mt-2">
//               <Label className="text-base font-semibold flex items-center gap-2">
//                 <Wrench size={16} /> Maintenance Details (Optional)
//               </Label>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
//                 <div>
//                   <Label>Insurance Expiry Date</Label>
//                   <DateInput
//                     value={formData.insuranceExpiryDate}
//                     onChange={(e) => setFormData((prev) => ({ ...prev, insuranceExpiryDate: e.target.value }))}
//                   />
//                 </div>
//                 <div>
//                   <Label>Pollution Expiry Date</Label>
//                   <DateInput
//                     value={formData.pollutionExpiryDate}
//                     onChange={(e) => setFormData((prev) => ({ ...prev, pollutionExpiryDate: e.target.value }))}
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="flex justify-end gap-3 p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-xl">
//           <button
//             type="button"
//             onClick={onClose}
//             className="px-5 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
//           >
//             <X size={16} /> Cancel
//           </button>
//           <button
//             type="button"
//             onClick={handleSubmit}
//             disabled={loading}
//             className="px-5 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
//           >
//             <Save size={16} />
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
//         driverCharges: vehicle.driverCharges ? String(vehicle.driverCharges) : "",
//       });
//     }
//   }, [vehicle, isOpen]);

//   const handleSubmit = (e) => {
//     if (e) { e.preventDefault(); e.stopPropagation(); }
//     if (!vehicle) return;
//     setLoading(true);
//     onSave(vehicle.registrationNumber, { ...maintenanceData, ...driverData });
//     setTimeout(() => {
//       setLoading(false);
//       if (document.activeElement) document.activeElement.blur();
//       onClose();
//     }, 500);
//   };

//   if (!isOpen) return null;

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
//       style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
//       onClick={(e) => e.stopPropagation()}
//     >
//       <div
//         className="bg-white rounded-xl w-full max-w-3xl mx-4 my-8 dark:bg-gray-800 shadow-2xl"
//         onClick={(e) => e.stopPropagation()}
//         onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); }}
//       >
//         <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
//           <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
//             <Wrench size={20} className="text-blue-600" />
//             Driver & Maintenance Details:{" "}
//             <span className="font-mono text-blue-600">{formatRegistrationNumber(vehicle?.registrationNumber)}</span>
//           </h3>
//           <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
//             <X size={20} />
//           </button>
//         </div>

//         <div className="p-6">
//           <div className="mb-6">
//             <Label className="text-base font-semibold flex items-center gap-2"><User size={16} /> Driver Details</Label>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
//               <div>
//                 <Label>Driver Name</Label>
//                 <Input value={driverData.driverName} onChange={(e) => setDriverData((prev) => ({ ...prev, driverName: e.target.value }))} />
//               </div>
//               <div>
//                 <Label>Driver Phone</Label>
//                 <Input
//                   value={driverData.driverPhone}
//                   onChange={(e) => {
//                     const val = e.target.value.replace(/\D/g, "").slice(0, 10);
//                     setDriverData((prev) => ({ ...prev, driverPhone: val }));
//                   }}
//                   maxLength={10}
//                 />
//               </div>
//               <div>
//                 <Label>Backup Driver</Label>
//                 <Input value={driverData.backupDriver} onChange={(e) => setDriverData((prev) => ({ ...prev, backupDriver: e.target.value }))} />
//               </div>
//               <div>
//                 <Label>Backup Driver Phone</Label>
//                 <Input
//                   value={driverData.backupDriverPhone}
//                   onChange={(e) => {
//                     const val = e.target.value.replace(/\D/g, "").slice(0, 10);
//                     setDriverData((prev) => ({ ...prev, backupDriverPhone: val }));
//                   }}
//                   maxLength={10}
//                 />
//               </div>
//               <div>
//                 <Label>Driver Charges (₹)</Label>
//                 <Input
//                   value={driverData.driverCharges}
//                   onChange={(e) => {
//                     if (validateNumber(e.target.value, false)) {
//                       setDriverData((prev) => ({ ...prev, driverCharges: e.target.value }));
//                     }
//                   }}
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="border-t pt-6">
//             <Label className="text-base font-semibold flex items-center gap-2"><Wrench size={16} /> Maintenance Details</Label>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
//               <div>
//                 <Label>Last Service Date</Label>
//                 <DateInput
//                   value={maintenanceData.lastServiceDate}
//                   onChange={(e) => setMaintenanceData((prev) => ({ ...prev, lastServiceDate: e.target.value }))}
//                 />
//               </div>
//               <div>
//                 <Label>Insurance Expiry Date</Label>
//                 <DateInput
//                   value={maintenanceData.insuranceExpiryDate}
//                   onChange={(e) => setMaintenanceData((prev) => ({ ...prev, insuranceExpiryDate: e.target.value }))}
//                 />
//               </div>
//               <div>
//                 <Label>Pollution Certificate Expiry Date</Label>
//                 <DateInput
//                   value={maintenanceData.pollutionExpiryDate}
//                   onChange={(e) => setMaintenanceData((prev) => ({ ...prev, pollutionExpiryDate: e.target.value }))}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="flex justify-end gap-3 p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-xl">
//           <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 flex items-center gap-2">
//             <X size={16} /> Cancel
//           </button>
//           <button
//             type="button"
//             onClick={(e) => handleSubmit(e)}
//             disabled={loading}
//             className="px-5 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
//           >
//             <Save size={16} />
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
//   const currentStepRef = useRef(1);
//   const [vehicleTypes, setVehicleTypes] = useState([]);
//   const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
//   const [editingType, setEditingType] = useState(null);
//   const [existingRegNumbersSet, setExistingRegNumbersSet] = useState(new Set());
//   const [selectedVehicleTypeData, setSelectedVehicleTypeData] = useState(null);
//   const [isLoadingVehicleData, setIsLoadingVehicleData] = useState(false);
//   const [currentEditingGroupId, setCurrentEditingGroupId] = useState(null);
//   const [completedSteps, setCompletedSteps] = useState(new Set());
//   const [stepErrors, setStepErrors] = useState({});

//   //TO PROTECT THE ROUTE
//   useAuthGuard();

//   // FIX 3: vehicleDescription state
//   const [vehicleDescription, setVehicleDescription] = useState("");

//   const [commonInfo, setCommonInfo] = useState({
//     customizedType: "Non-Customized",
//     vehicleType: "",
//     vehicleName: "",
//   });

//   // CHANGE C + B: techSpecs now includes all dynamic screen fields
//   // soundQuality REMOVED from state (deprecated 22/05/2026)
//   const [techSpecs, setTechSpecs] = useState({
//     screenType: "",
//     numberOfScreens: "",
//     // Shared Left/Right fields (used when numberOfScreens === "3")
//     leftRightScreenWidth: "",
//     leftRightScreenHeight: "",
//     backScreenWidth: "",
//     backScreenHeight: "",
//     leftRightResolutionWidth: "",
//     leftRightResolutionHeight: "",
//     backResolutionWidth: "",
//     backResolutionHeight: "",
//     // Separate Left fields (used when numberOfScreens === "2")
//     leftScreenWidth: "",
//     leftScreenHeight: "",
//     leftResolutionWidth: "",
//     leftResolutionHeight: "",
//     // Separate Right fields (used when numberOfScreens === "2")
//     rightScreenWidth: "",
//     rightScreenHeight: "",
//     rightResolutionWidth: "",
//     rightResolutionHeight: "",
//     audioOutput: "",
//     brightness: "",
//     displayVersion: "",
//     generatorCapacity: "",
//     additionalFeatures: "",
//     // soundQuality: "",  // REMOVED — deprecated as of 22/05/2026
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

//   const [stepCompletionStatus, setStepCompletionStatus] = useState({
//     1: false,
//     2: false,
//     3: false,
//     4: false,
//     5: false,
//     6: false,
//   });

//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       if (e.key === "Enter" && currentStep !== 6) {
//         const activeElement = document.activeElement;
//         const isTextarea = activeElement?.tagName === "TEXTAREA";
//         const isSubmitButton = activeElement?.type === "submit";
//         if (!isTextarea && !isSubmitButton) {
//           e.preventDefault();
//           e.stopPropagation();
//         }
//       }
//     };
//     document.addEventListener("keydown", handleKeyDown);
//     return () => document.removeEventListener("keydown", handleKeyDown);
//   }, [currentStep]);

//   useEffect(() => {
//     const initializeData = async () => {
//       await fetchVehicleTypes();
//       await fetchExistingRegNumbers();
//     };
//     initializeData();
//   }, []);

//   useEffect(() => {
//     if (!isModalOpen) {
//       fetchExistingRegNumbers();
//     }
//   }, [vehicles.length]);

//   // ── CHANGE E + CHANGE D: saveCurrentStep updated ────────────────────────────
//   // Key fixes:
//   // 1. Step 3 now sends media files via multipart/form-data correctly
//   // 2. vehiclesOverride param allows passing updated vehicles array directly
//   //    (needed for Add Vehicle auto-save so we don't read stale state)
//   const saveCurrentStep = async (stepNumber, nextStep = null, vehiclesOverride = null) => {
//     const currentVehicles = vehiclesOverride ?? vehicles;

//     if (!commonInfo.vehicleType && stepNumber !== 1) {
//       toast.error("Please select a vehicle type first");
//       return false;
//     }

//     try {
//       // ── Step 3: use multipart/form-data to send both media files AND description
//       if (stepNumber === 3) {
//         const formData = new FormData();
//         const stepData = {
//           vehicleDescription,
//           // Also include any existing media URLs so they're preserved
//           mediaFiles: existingMediaUrls,
//         };
//         formData.append(
//           "data",
//           JSON.stringify({ step: 3, stepData, completed: true })
//         );
//         // Append any new file uploads
//         Object.keys(mediaFiles).forEach((key) => {
//           if (mediaFiles[key] instanceof File) {
//             formData.append(key, mediaFiles[key]);
//           }
//         });

//         if (!currentEditingGroupId) {
//           toast.error("Please complete Step 1 first");
//           return false;
//         }

//         const res = await axios.put(
//           `${baseUrl}/api/updateVehicleStep/${currentEditingGroupId}`,
//           formData,
//           { headers: { "Content-Type": "multipart/form-data" } }
//         );
//         if (res.data.success) {
//           setStepCompletionStatus((prev) => ({ ...prev, [stepNumber]: true }));
//           toast.success("Media & Description saved", { position: "bottom-right", autoClose: 3000 });
//           if (nextStep) setCurrentStep(nextStep);
//           return true;
//         }
//         return false;
//       }

//       // ── All other steps: send JSON
//       let stepData = {};

//       if (stepNumber === 1) {
//         stepData = {
//           basicInfo: commonInfo,
//           registrationVehicles: currentVehicles.map((v) => ({
//             registrationNumber: unformatRegistrationNumber(v.registrationNumber),
//             vehicleId: v.vehicleId,
//             city: v.city,
//             modelConfig: v.modelConfig,
//             permitType: v.permitType,
//             ownershipType: v.ownershipType,
//             fuelType: v.fuelType,
//             manufacturingYear: v.manufacturingYear,
//             gpsEnabled: v.gpsEnabled,
//             activeStatus: v.activeStatus,
//             statusAvailability: {
//               currentStatus: v.currentStatus || "Available",
//               availableFrom: v.availableFrom || null,
//               remarks: v.remarks || "",
//             },
//             maintenance: {
//               lastServiceDate: v.lastServiceDate || null,
//               insuranceExpiryDate: v.insuranceExpiryDate || null,
//               pollutionExpiryDate: v.pollutionExpiryDate || null,
//             },
//             driverDetails: {
//               driverName: v.driverName || "",
//               driverPhone: v.driverPhone || "",
//               backupDriver: v.backupDriver || "",
//               backupDriverPhone: v.backupDriverPhone || "",
//               driverCharges: Number(v.driverCharges) || 0,
//             },
//           })),
//           totalVehicles: currentVehicles.length,
//         };
//       } else if (stepNumber === 2) {
//         stepData = { techSpecs };
//       } else if (stepNumber === 4) {
//         stepData = {
//           registrationVehicles: currentVehicles.map((v) => ({
//             registrationNumber: unformatRegistrationNumber(v.registrationNumber),
//             vehicleId: v.vehicleId,
//             city: v.city,
//             modelConfig: v.modelConfig,
//             permitType: v.permitType,
//             ownershipType: v.ownershipType,
//             fuelType: v.fuelType,
//             manufacturingYear: v.manufacturingYear,
//             gpsEnabled: v.gpsEnabled,
//             activeStatus: v.activeStatus,
//             statusAvailability: {
//               currentStatus: v.currentStatus || "Available",
//               availableFrom: v.availableFrom || null,
//               remarks: v.remarks || "",
//             },
//             driverDetails: {
//               driverName: v.driverName || "",
//               driverPhone: v.driverPhone || "",
//               backupDriver: v.backupDriver || "",
//               backupDriverPhone: v.backupDriverPhone || "",
//               driverCharges: Number(v.driverCharges) || 0,
//             },
//             maintenance: {
//               lastServiceDate: v.lastServiceDate || null,
//               insuranceExpiryDate: v.insuranceExpiryDate || null,
//               pollutionExpiryDate: v.pollutionExpiryDate || null,
//             },
//           })),
//         };
//       }

//       // ── Step 1: create group if not exists, else update
//       if (stepNumber === 1 && !currentEditingGroupId) {
//         const payload = {
//           basicInfo: commonInfo,
//           registrationVehicles: stepData.registrationVehicles,
//           totalVehicles: currentVehicles.length,
//           techSpecs: {},
//           vehicleDescription: "",
//           mediaFiles: {},
//           completedSteps: { step1: true },
//         };
//         const createRes = await axios.post(`${baseUrl}/api/createVehicle`, payload);
//         if (createRes.data.success) {
//           setCurrentEditingGroupId(createRes.data.data._id);
//           setStepCompletionStatus((prev) => ({ ...prev, [stepNumber]: true }));
//           toast.success("Basic info saved", { position: "bottom-right", autoClose: 3000 });
//           if (nextStep) setCurrentStep(nextStep);
//           return true;
//         }
//         return false;
//       }

//       // ── Update existing group
//       const res = await axios.put(
//         `${baseUrl}/api/updateVehicleStep/${currentEditingGroupId}`,
//         { step: stepNumber, stepData, completed: true }
//       );
//       if (res.data.success) {
//         setStepCompletionStatus((prev) => ({ ...prev, [stepNumber]: true }));
//         if (nextStep) setCurrentStep(nextStep);
//         return true;
//       }
//       return false;
//     } catch (error) {
//       console.error("Save step error:", error);
//       toast.error("Failed to save step", { position: "bottom-right", autoClose: 3000 });
//       return false;
//     }
//   };

//   const handleMediaUpload = (field, file) => {
//     if (!file) return;
//     const isVideo = field === "demoVideo";
//     const maxSize = isVideo ? 10 * 1024 * 1024 : 3 * 1024 * 1024;
//     if (file.size > maxSize) {
//       toast.error(`File size exceeds ${isVideo ? "10MB" : "3MB"} limit`);
//       return;
//     }
//     const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
//     const validVideoTypes = ["video/mp4", "video/mov", "video/avi", "video/mkv", "video/webm"];
//     if (isVideo && !validVideoTypes.includes(file.type)) {
//       toast.error("Please select a valid video file", { position: "bottom-right", autoClose: 3000 });
//       return;
//     }
//     if (!isVideo && !validImageTypes.includes(file.type)) {
//       toast.error("Please select a valid image file", { position: "bottom-right", autoClose: 3000 });
//       return;
//     }
//     const previewUrl = URL.createObjectURL(file);
//     setMediaPreviews((prev) => ({ ...prev, [field]: previewUrl }));
//     setMediaFiles((prev) => ({ ...prev, [field]: file }));
//     setExistingMediaUrls((prev) => ({ ...prev, [field]: "" }));
//   };

//   const handleRemoveMedia = (field) => {
//     if (mediaPreviews[field] && mediaPreviews[field].startsWith("blob:")) {
//       URL.revokeObjectURL(mediaPreviews[field]);
//     }
//     setMediaPreviews((prev) => ({ ...prev, [field]: null }));
//     setMediaFiles((prev) => ({ ...prev, [field]: null }));
//     setExistingMediaUrls((prev) => ({ ...prev, [field]: "" }));
//   };

//   useEffect(() => {
//     return () => {
//       Object.values(mediaPreviews).forEach((preview) => {
//         if (preview && preview.startsWith("blob:")) {
//           URL.revokeObjectURL(preview);
//         }
//       });
//     };
//   }, []);

//   const fetchExistingRegNumbers = async () => {
//     try {
//       const response = await axios.get(`${baseUrl}/api/getNewVehicles?page=1&limit=10000`);
//       if (response.data.success) {
//         const allRegNumbers = new Set();
//         response.data.data.forEach((vehicle) => {
//           if (vehicle.registrationVehicles) {
//             vehicle.registrationVehicles.forEach((rv) => {
//               allRegNumbers.add(rv.registrationNumber.replace(/\s/g, "").toUpperCase());
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
//     const cleanExclude = excludeRegNumber ? unformatRegistrationNumber(excludeRegNumber) : null;
//     const localDuplicate = vehicles.some(
//       (v) =>
//         unformatRegistrationNumber(v.registrationNumber) === cleanReg &&
//         unformatRegistrationNumber(v.registrationNumber) !== cleanExclude
//     );
//     if (localDuplicate) return true;
//     if (existingRegNumbersSet.has(cleanReg) && cleanReg !== cleanExclude) return true;
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
//     setIsLoadingVehicleData(true);
//     try {
//       const res = await axios.get(`${baseUrl}/api/getVehicleGroupByType/${typeId}`);
//       if (res.data.success && res.data.data) {
//         const data = res.data.data;
//         setSelectedVehicleTypeData(data);
//         setCurrentEditingGroupId(data._id);
//         setCommonInfo(data.basicInfo);
//         setTechSpecs(
//           data.techSpecs || {
//             screenType: "LED Only",
//             numberOfScreens: "",
//             leftRightScreenWidth: "",
//             leftRightScreenHeight: "",
//             backScreenWidth: "",
//             backScreenHeight: "",
//             leftRightResolutionWidth: "",
//             leftRightResolutionHeight: "",
//             backResolutionWidth: "",
//             backResolutionHeight: "",
//             leftScreenWidth: "",
//             leftScreenHeight: "",
//             leftResolutionWidth: "",
//             leftResolutionHeight: "",
//             rightScreenWidth: "",
//             rightScreenHeight: "",
//             rightResolutionWidth: "",
//             rightResolutionHeight: "",
//             audioOutput: "",
//             brightness: "",
//             displayVersion: "",
//             generatorCapacity: "",
//             additionalFeatures: "",
//             // soundQuality: "",  // REMOVED
//           }
//         );
//         setVehicleDescription(data.vehicleDescription || "");
//         setExistingMediaUrls(data.mediaFiles || {});

//         if (data.registrationVehicles && data.registrationVehicles.length > 0) {
//           const formatted = data.registrationVehicles.map((rv) => ({
//             registrationNumber: rv.registrationNumber,
//             vehicleId: rv.vehicleId,
//             city: rv.city,
//             permitType: rv.permitType,
//             modelConfig: rv.modelConfig,
//             ownershipType: rv.ownershipType,
//             fuelType: rv.fuelType,
//             manufacturingYear: rv.manufacturingYear,
//             gpsEnabled: rv.gpsEnabled,
//             activeStatus: rv.activeStatus,
//             currentStatus: rv.statusAvailability?.currentStatus || "Available",
//             availableFrom: rv.statusAvailability?.availableFrom?.split("T")[0] || "",
//             remarks: rv.statusAvailability?.remarks || "",
//             driverName: rv.driverDetails?.driverName || "",
//             driverPhone: rv.driverDetails?.driverPhone || "",
//             backupDriver: rv.driverDetails?.backupDriver || "",
//             backupDriverPhone: rv.driverDetails?.backupDriverPhone || "",
//             driverCharges: String(rv.driverDetails?.driverCharges || ""),
//             lastServiceDate: rv.maintenance?.lastServiceDate?.split("T")[0] || "",
//             insuranceExpiryDate: rv.maintenance?.insuranceExpiryDate?.split("T")[0] || "",
//             pollutionExpiryDate: rv.maintenance?.pollutionExpiryDate?.split("T")[0] || "",
//           }));
//           setVehicles(formatted);
//         } else {
//           setVehicles([]);
//         }

//         const comp = data.completedSteps || {};
//         setStepCompletionStatus({
//           1: comp.step1 || false,
//           2: comp.step2 || false,
//           3: comp.step3 || false,
//           4: comp.step4 || false,
//           5: comp.step5 || false,
//         });

//         const typeName = vehicleTypes.find((t) => t._id === data.basicInfo.vehicleType)?.typeName || "";
//         setCommonInfo((prev) => ({ ...prev, vehicleName: typeName }));
//         toast.success(`Loaded ${data.registrationVehicles?.length || 0} vehicle(s) for "${typeName}"`, {
//           position: "bottom-right",
//           autoClose: 3000,
//         });
//       } else {
//         resetFormForNewVehicleType();
//         toast.info("No existing data found for this vehicle type", { position: "bottom-right", autoClose: 3000 });
//       }
//     } catch (err) {
//       console.error(err);
//       resetFormForNewVehicleType();
//       toast.error("Error loading vehicle data", { position: "bottom-right", autoClose: 3000 });
//     } finally {
//       setIsLoadingVehicleData(false);
//     }
//   };

//   const createVehicleType = async (typeName) => {
//     try {
//       const response = await axios.post(`${baseUrl}/api/vehicle-types`, { typeName });
//       if (response.data.success) {
//         toast.success("Vehicle type created successfully", { position: "bottom-right", autoClose: 3000 });
//         await fetchVehicleTypes();
//         return response.data.data;
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Error creating vehicle type", { position: "bottom-right", autoClose: 3000 });
//       throw error;
//     }
//   };

//   const updateVehicleType = async (id, typeName) => {
//     try {
//       const response = await axios.put(`${baseUrl}/api/vehicle-types/${id}`, { typeName });
//       if (response.data.success) {
//         toast.success("Vehicle type updated successfully", { position: "bottom-right", autoClose: 3000 });
//         await fetchVehicleTypes();
//         return response.data.data;
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Error updating vehicle type", { position: "bottom-right", autoClose: 3000 });
//       throw error;
//     }
//   };

//   const deleteVehicleType = async (id) => {
//     try {
//       const response = await axios.delete(`${baseUrl}/api/vehicle-types/${id}`);
//       if (response.data.success) {
//         toast.success("Vehicle type deleted successfully", { position: "bottom-right", autoClose: 3000 });
//         await fetchVehicleTypes();
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Error deleting vehicle type", { position: "bottom-right", autoClose: 3000 });
//       throw error;
//     }
//   };

//   useEffect(() => {
//     fetchVehicleTypes();
//     fetchExistingRegNumbers();
//   }, []);

//   const resetFormForNewVehicleType = () => {
//     setVehicles([]);
//     setTechSpecs({
//       screenType: "",
//       numberOfScreens: "",
//       leftRightScreenWidth: "",
//       leftRightScreenHeight: "",
//       backScreenWidth: "",
//       backScreenHeight: "",
//       leftRightResolutionWidth: "",
//       leftRightResolutionHeight: "",
//       backResolutionWidth: "",
//       backResolutionHeight: "",
//       leftScreenWidth: "",
//       leftScreenHeight: "",
//       leftResolutionWidth: "",
//       leftResolutionHeight: "",
//       rightScreenWidth: "",
//       rightScreenHeight: "",
//       rightResolutionWidth: "",
//       rightResolutionHeight: "",
//       audioOutput: "",
//       brightness: "",
//       displayVersion: "",
//       generatorCapacity: "",
//       additionalFeatures: "",
//       // soundQuality: "",  // REMOVED
//     });
//     setVehicleDescription("");
//     setMediaFiles({ frontViewImage: null, leftSideImage: null, rightSideImage: null, rearViewImage: null, interiorImage: null, demoVideo: null });
//     setMediaPreviews({ frontViewImage: null, leftSideImage: null, rightSideImage: null, rearViewImage: null, interiorImage: null, demoVideo: null });
//     setExistingMediaUrls({ frontViewImage: "", leftSideImage: "", rightSideImage: "", rearViewImage: "", interiorImage: "", demoVideo: "" });
//     setCurrentEditingGroupId(null);
//     setStepCompletionStatus({ 1: false, 2: false, 3: false, 4: false });
//   };

//   useEffect(() => {
//     if (commonInfo.vehicleType) {
//       resetFormForNewVehicleType();
//       fetchVehicleByType(commonInfo.vehicleType);
//     } else {
//       resetFormForNewVehicleType();
//     }
//   }, [commonInfo.vehicleType]);

//   const steps = [
//     { number: 1, title: "Basic Information" },
//     { number: 2, title: "Technical Specification" },
//     { number: 3, title: "Media & Description" },
//     { number: 4, title: "Vehicle Summary" },
//   ];

//   const canAccessStep6 = stepCompletionStatus[4] === true;

//   // ── CHANGE D: handleAddVehicle auto-saves Step 1 to DB ─────────────────────
//   // The key fix: pass updatedVehicles directly to saveCurrentStep via vehiclesOverride
//   // so we don't read stale React state (setVehicles is async)
//   const handleAddVehicle = async (vehicleData) => {
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

//     let updatedVehicles;

//     if (editingVehicle) {
//       // Edit existing vehicle in local state
//       updatedVehicles = vehicles.map((v) =>
//         unformatRegistrationNumber(v.registrationNumber) ===
//           unformatRegistrationNumber(editingVehicle.registrationNumber)
//           ? newVehicle
//           : v
//       );
//       setVehicles(updatedVehicles);
//       toast.success("Vehicle updated successfully", { position: "bottom-right", autoClose: 3000 });
//     } else {
//       // Add new vehicle
//       const exists = vehicles.some(
//         (v) =>
//           unformatRegistrationNumber(v.registrationNumber) ===
//           vehicleData.registrationNumber
//       );
//       if (exists) {
//         toast.error("Vehicle with this registration number already exists", { position: "bottom-right", autoClose: 3000 });
//         return;
//       }
//       updatedVehicles = [...vehicles, newVehicle];
//       setVehicles(updatedVehicles);
//       setExistingRegNumbersSet((prev) => new Set([...prev, vehicleData.registrationNumber]));
//       toast.success("Vehicle added successfully", { position: "bottom-right", autoClose: 3000 });
//     }

//     setEditingVehicle(null);

//     // ── Auto-save Step 1 to DB immediately after adding/editing a vehicle
//     // Pass updatedVehicles directly (vehiclesOverride) to avoid stale state issue
//     if (commonInfo.vehicleType) {
//       await saveCurrentStep(1, null, updatedVehicles);
//     }
//   };

//   const handleEditVehicle = (vehicle) => {
//     setEditingVehicle(vehicle);
//     setIsModalOpen(true);
//   };

//   // CHANGE 3: Hard delete from DB (not just local state)
//   const handleDeleteVehicle = async (registrationNumber) => {
//     if (!window.confirm(`Delete vehicle ${registrationNumber}?`)) return;

//     if (currentEditingGroupId) {
//       try {
//         const cleanReg = registrationNumber.replace(/\s/g, "");
//         const res = await axios.delete(
//           `${baseUrl}/api/deleteRegistrationVehicle/${currentEditingGroupId}/${encodeURIComponent(cleanReg)}`
//         );
//         if (res.data.success) {
//           setVehicles((prev) =>
//             prev.filter((v) => v.registrationNumber.replace(/\s/g, "") !== cleanReg)
//           );
//           toast.success("Vehicle deleted from database");
//           return;
//         }
//       } catch (err) {
//         toast.error("Delete failed");
//         return;
//       }
//     }
//     // Fallback: local only if no groupId yet
//     setVehicles((prev) =>
//       prev.filter(
//         (v) =>
//           unformatRegistrationNumber(v.registrationNumber) !==
//           unformatRegistrationNumber(registrationNumber)
//       )
//     );
//   };

//   const handleSaveMaintenance = (registrationNumber, data) => {
//     setVehicles((prev) =>
//       prev.map((v) => {
//         const vReg = unformatRegistrationNumber(v.registrationNumber);
//         const targetReg = unformatRegistrationNumber(registrationNumber);
//         if (vReg === targetReg) {
//           return {
//             ...v,
//             driverName: data.driverName ?? v.driverName,
//             driverPhone: data.driverPhone ?? v.driverPhone,
//             backupDriver: data.backupDriver ?? v.backupDriver,
//             backupDriverPhone: data.backupDriverPhone ?? v.backupDriverPhone,
//             driverCharges: data.driverCharges ?? v.driverCharges,
//             lastServiceDate: data.lastServiceDate ?? v.lastServiceDate,
//             insuranceExpiryDate: data.insuranceExpiryDate ?? v.insuranceExpiryDate,
//             pollutionExpiryDate: data.pollutionExpiryDate ?? v.pollutionExpiryDate,
//           };
//         }
//         return v;
//       })
//     );
//     toast.success(`Driver & Maintenance details saved for ${formatRegistrationNumber(registrationNumber)}`, {
//       position: "bottom-right",
//       autoClose: 3000,
//     });
//   };

//   const handleNextStep = async () => {
//     const errors = validateStep(currentStep, { commonInfo, vehicles, techSpecs, vehicleDescription });
//     if (Object.keys(errors).length > 0) {
//       setStepErrors(errors);
//       toast.error(Object.values(errors)[0], { position: "bottom-right", autoClose: 3000 });
//       return;
//     }
//     setStepErrors({});
//     const success = await saveCurrentStep(currentStep, currentStep + 1);
//     if (!success && currentStep !== 1) return;
//     if (currentStep === 1 && !currentEditingGroupId) return;
//     if (currentStep < 4) setCurrentStep(currentStep + 1);
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
//           errors.manufacturingYear = `Manufacturing year must be ${currentYear} or earlier`;
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
//     if (currentStep !== 4) {
//       toast.info("Please complete all steps before submitting");
//       return;
//     }
//     setLoading(true);
//     try {
//       const formData = new FormData();
//       const payload = {
//         basicInfo: commonInfo,
//         techSpecs,
//         vehicleDescription,
//         registrationVehicles: vehicles.map((v) => ({
//           registrationNumber: unformatRegistrationNumber(v.registrationNumber),
//           vehicleId: v.vehicleId,
//           city: v.city,
//           modelConfig: v.modelConfig,
//           permitType: v.permitType,
//           ownershipType: v.ownershipType,
//           fuelType: v.fuelType,
//           manufacturingYear: v.manufacturingYear,
//           gpsEnabled: v.gpsEnabled,
//           activeStatus: v.activeStatus,
//           statusAvailability: {
//             currentStatus: v.currentStatus || "Available",
//             availableFrom: v.availableFrom || null,
//             remarks: v.remarks || "",
//           },
//           maintenance: {
//             lastServiceDate: v.lastServiceDate || null,
//             insuranceExpiryDate: v.insuranceExpiryDate || null,
//             pollutionExpiryDate: v.pollutionExpiryDate || null,
//           },
//           driverDetails: {
//             driverName: v.driverName || "",
//             driverPhone: v.driverPhone || "",
//             backupDriver: v.backupDriver || "",
//             backupDriverPhone: v.backupDriverPhone || "",
//             driverCharges: Number(v.driverCharges) || 0,
//           },
//         })),
//         totalVehicles: vehicles.length,
//         completedSteps: { step1: true, step2: true, step3: true, step4: true, step5: true },
//         completedOnboarding: true,
//       };
//       formData.append("data", JSON.stringify(payload));
//       Object.keys(mediaFiles).forEach((key) => {
//         if (mediaFiles[key] instanceof File) formData.append(key, mediaFiles[key]);
//       });

//       let response;
//       if (currentEditingGroupId) {
//         response = await axios.put(
//           `${baseUrl}/api/updateVehicle/${currentEditingGroupId}`,
//           formData,
//           { headers: { "Content-Type": "multipart/form-data" } }
//         );
//       } else {
//         response = await axios.post(`${baseUrl}/api/createVehicle`, formData, {
//           headers: { "Content-Type": "multipart/form-data" },
//         });
//       }

//       if (response.data.success) {
//         toast.success("Onboarding completed successfully!", { position: "bottom-right", autoClose: 3000 });
//         window.location.reload();
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Submission failed", { position: "bottom-right", autoClose: 3000 });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // CHANGE A: mediaItems now use Lucide icon components instead of emoji strings
//   const mediaItems = [
//     { key: "frontViewImage", label: "Front View", icon: <Camera size={32} />, accept: "image/*" },
//     { key: "leftSideImage", label: "Left Side View", icon: <Camera size={32} />, accept: "image/*" },
//     { key: "rightSideImage", label: "Right Side View", icon: <Camera size={32} />, accept: "image/*" },
//     { key: "rearViewImage", label: "Rear View", icon: <Camera size={32} />, accept: "image/*" },
//     { key: "interiorImage", label: "Interior", icon: <Camera size={32} />, accept: "image/*" },
//     { key: "demoVideo", label: "Demo Video", icon: <Film size={32} />, accept: "video/*" },
//   ];

//   const getSelectOptions = () => ({
//     ...AdminSelectOptions,
//     vehicleTypeOptions: vehicleTypes.map((vt) => ({
//       value: vt._id,
//       label: vt.typeName,
//     })),
//   });
//   const selectOptions = getSelectOptions();

//   const handleInputChange = (setter, field) => (e) => {
//     setter((prev) => ({ ...prev, [field]: e.target.value }));
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
//       <ToastContainer position="bottom-right" />

//       <div className="px-6 pt-6">
//         <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
//           <Activity size={14} /> Dashboard &gt; Vehicle Management &gt; Onboarding
//         </div>
//       </div>

//       <div className="px-6 py-4">
//         <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
//           <Truck size={24} className="text-blue-600" />
//           Vehicle Onboarding Management
//         </h1>
//         <p className="text-gray-500 dark:text-gray-400 mt-1">
//           Add and manage your advertising vehicles with complete details
//         </p>
//       </div>

//       {/* Modals */}
//       <AddVehicleModal
//         isOpen={isModalOpen}
//         onClose={() => { setIsModalOpen(false); setEditingVehicle(null); }}
//         onSave={handleAddVehicle}
//         editingVehicle={editingVehicle}
//         existingRegNumbers={vehicles.map((v) => v.registrationNumber)}
//         onCheckDuplicate={checkDuplicateRegistration}
//         vehicleTypes={vehicleTypes}
//       />
//       <MaintenanceModal
//         isOpen={isMaintenanceModalOpen}
//         onClose={() => { setIsMaintenanceModalOpen(false); setSelectedVehicle(null); }}
//         vehicle={selectedVehicle}
//         onSave={handleSaveMaintenance}
//       />
//       <VehicleTypeModal
//         isOpen={isTypeModalOpen}
//         onClose={() => { setIsTypeModalOpen(false); setEditingType(null); }}
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
//             onStepClick={(num) => { if (num <= currentStep) setCurrentStep(num); }}
//             canAccessStep6={canAccessStep6}
//             stepCompletionStatus={stepCompletionStatus}
//           />

//           {isLoadingVehicleData && (
//             <div className="text-center py-4">
//               <div className="inline-flex items-center gap-2 text-blue-600">
//                 <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//                 Loading vehicle details...
//               </div>
//             </div>
//           )}

//           {/* ── STEP 1 ── */}
//           {currentStep === 1 && (
//             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
//               <div className="flex justify-between items-center mb-6">
//                 {/* CHANGE A: emoji replaced with Lucide ClipboardList icon */}
//                 <SectionHeader number={1} title="Basic Information" icon={<ClipboardList size={18} />} />
//                 <button
//                   type="button"
//                   onClick={() => setIsTypeModalOpen(true)}
//                   className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
//                 >
//                   <Settings size={14} /> Manage Vehicle Types
//                 </button>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <Label>
//                     <span className="flex items-center gap-1"><Settings size={14} /> Customized <span className="text-red-500">*</span></span>
//                   </Label>
//                   <div className="relative">
//                     <Select
//                       options={selectOptions.customizedVehiclesOptions}
//                       placeholder="Select"
//                       value={commonInfo.customizedType}
//                       onChange={(value) => setCommonInfo((prev) => ({ ...prev, customizedType: value }))}
//                     />
//                     <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                       <ChevronDown size={16} />
//                     </span>
//                   </div>
//                 </div>

//                 <div>
//                   <Label>
//                     <span className="flex items-center gap-1"><Truck size={14} /> Vehicle Type <span className="text-red-500">*</span></span>
//                   </Label>
//                   <div className="relative">
//                     <Select
//                       options={selectOptions.vehicleTypeOptions}
//                       placeholder="Select Type"
//                       value={commonInfo.vehicleType}
//                       onChange={(value) => {
//                         const typeName = vehicleTypes.find((t) => t._id === value)?.typeName || "";
//                         setCommonInfo((prev) => ({ ...prev, vehicleType: value, vehicleName: typeName }));
//                       }}
//                     />
//                     <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                       <ChevronDown size={16} />
//                     </span>
//                   </div>
//                   {stepErrors.vehicleType && <p className="text-red-500 text-xs mt-1">{stepErrors.vehicleType}</p>}
//                   <p className="mt-1 text-xs text-gray-400">
//                     Selecting a vehicle type will auto-fill technical specs and existing vehicles if previously configured
//                   </p>
//                 </div>
//               </div>

//               <div className="mt-8">
//                 <Label className="text-base font-semibold flex items-center gap-2">
//                   <Hash size={16} /> Registration Numbers <span className="text-red-500">*</span>
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
//                           <th className="px-4 py-3 text-left">Fuel</th>
//                           <th className="px-4 py-3 text-left">Status</th>
//                           <th className="px-4 py-3 text-center">Actions</th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y">
//                         {vehicles.map((vehicle) => (
//                           <tr key={vehicle.registrationNumber} className="hover:bg-gray-50">
//                             <td className="px-4 py-3 font-mono font-semibold text-blue-700">
//                               {formatRegistrationNumber(vehicle.registrationNumber)}
//                             </td>
//                             <td className="px-4 py-3 text-sm text-gray-600">{vehicle.vehicleId}</td>
//                             <td className="px-4 py-3">{vehicle.city}</td>
//                             <td className="px-4 py-3">{vehicle.fuelType}</td>
//                             <td className="px-4 py-3">
//                               <StatusBadge status={vehicle.currentStatus || "Available"} />
//                             </td>
//                             <td className="px-4 py-3 text-center">
//                               <div className="flex justify-center gap-3">
//                                 <button
//                                   type="button"
//                                   onClick={() => handleEditVehicle(vehicle)}
//                                   className="text-blue-500 hover:text-blue-700"
//                                   title="Edit"
//                                 >
//                                   <PenLine size={16} />
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
//                     <Truck size={40} className="mx-auto mb-2 opacity-40" />
//                     <p>No vehicles added yet</p>
//                   </div>
//                 )}

//                 <button
//                   type="button"
//                   onClick={() => setIsModalOpen(true)}
//                   className="flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700 font-medium"
//                 >
//                   <Plus size={16} />
//                   Add Another Vehicle
//                 </button>
//                 {stepErrors.vehicles && <p className="text-red-500 text-xs mt-1">{stepErrors.vehicles}</p>}
//               </div>
//             </div>
//           )}

//           {/* ── STEP 2 ── */}
//           {currentStep === 2 && (
//             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
//               {/* CHANGE A: emoji replaced with Monitor icon */}
//               <SectionHeader number={2} title="Technical Specifications" icon={<Monitor size={18} />} />

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                 <div>
//                   <Label>Screen Type <span className="text-red-500">*</span></Label>
//                   <div className="relative">
//                     <Select
//                       options={selectOptions.screenTypeOptions}
//                       placeholder="Select"
//                       value={techSpecs.screenType}
//                       onChange={(value) => setTechSpecs((prev) => ({ ...prev, screenType: value }))}
//                     />
//                     <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                       <ChevronDown size={16} />
//                     </span>
//                   </div>
//                   {stepErrors.screenType && <p className="mt-1 text-xs text-red-500">{stepErrors.screenType}</p>}
//                 </div>

//                 <div>
//                   <Label>Number of Screens <span className="text-red-500">*</span></Label>
//                   <RadioGroup
//                     options={selectOptions.numberOfScreensOptions}
//                     value={techSpecs.numberOfScreens}
//                     onChange={(value) =>
//                       setTechSpecs((prev) => ({
//                         ...prev,
//                         numberOfScreens: value,
//                         // Reset all screen-specific fields when changing screen count
//                         leftRightScreenWidth: "",
//                         leftRightScreenHeight: "",
//                         backScreenWidth: "",
//                         backScreenHeight: "",
//                         leftRightResolutionWidth: "",
//                         leftRightResolutionHeight: "",
//                         backResolutionWidth: "",
//                         backResolutionHeight: "",
//                         leftScreenWidth: "",
//                         leftScreenHeight: "",
//                         leftResolutionWidth: "",
//                         leftResolutionHeight: "",
//                         rightScreenWidth: "",
//                         rightScreenHeight: "",
//                         rightResolutionWidth: "",
//                         rightResolutionHeight: "",
//                       }))
//                     }
//                   />
//                   {stepErrors.numberOfScreens && <p className="mt-1 text-xs text-red-500">{stepErrors.numberOfScreens}</p>}
//                 </div>

//                 {/* ── CHANGE B: Dynamic screen fields based on numberOfScreens ── */}

//                 {/* ── 1 Screen: Back screen only ── */}
//                 {techSpecs.numberOfScreens === "1" && (
//                   <>
//                     <div>
//                       <Label>Back Screen Size (ft) <span className="text-red-500">*</span></Label>
//                       <div className="flex gap-2 items-center">
//                         <Input
//                           type="text"
//                           value={techSpecs.backScreenWidth}
//                           placeholder="Width"
//                           className="flex-1"
//                           onChange={(e) => { if (validateNumber(e.target.value, true)) setTechSpecs((prev) => ({ ...prev, backScreenWidth: e.target.value })); }}
//                         />
//                         <span className="text-gray-500">x</span>
//                         <Input
//                           type="text"
//                           value={techSpecs.backScreenHeight}
//                           placeholder="Height"
//                           className="flex-1"
//                           onChange={(e) => { if (validateNumber(e.target.value, true)) setTechSpecs((prev) => ({ ...prev, backScreenHeight: e.target.value })); }}
//                         />
//                       </div>
//                       {stepErrors.backScreenSize && <p className="mt-1 text-xs text-red-500">{stepErrors.backScreenSize}</p>}
//                     </div>

//                     <div>
//                       <Label>Back Resolution (px) <span className="text-red-500">*</span></Label>
//                       <div className="flex gap-2 items-center">
//                         <Input
//                           type="text"
//                           value={techSpecs.backResolutionWidth}
//                           placeholder="Width (px)"
//                           className="flex-1"
//                           onChange={(e) => { if (validateNumber(e.target.value, false)) setTechSpecs((prev) => ({ ...prev, backResolutionWidth: e.target.value })); }}
//                         />
//                         <span className="text-gray-500">x</span>
//                         <Input
//                           type="text"
//                           value={techSpecs.backResolutionHeight}
//                           placeholder="Height (px)"
//                           className="flex-1"
//                           onChange={(e) => { if (validateNumber(e.target.value, false)) setTechSpecs((prev) => ({ ...prev, backResolutionHeight: e.target.value })); }}
//                         />
//                       </div>
//                       {stepErrors.backResolution && <p className="mt-1 text-xs text-red-500">{stepErrors.backResolution}</p>}
//                     </div>
//                   </>
//                 )}

//                 {/* ── 2 Screens: Left + Right separately, no back ── */}
//                 {techSpecs.numberOfScreens === "2" && (
//                   <>
//                     <div>
//                       <Label>Left Screen Size (ft) <span className="text-red-500">*</span></Label>
//                       <div className="flex gap-2 items-center">
//                         <Input
//                           type="text"
//                           value={techSpecs.leftScreenWidth}
//                           placeholder="Width"
//                           className="flex-1"
//                           onChange={(e) => { if (validateNumber(e.target.value, true)) setTechSpecs((prev) => ({ ...prev, leftScreenWidth: e.target.value })); }}
//                         />
//                         <span className="text-gray-500">x</span>
//                         <Input
//                           type="text"
//                           value={techSpecs.leftScreenHeight}
//                           placeholder="Height"
//                           className="flex-1"
//                           onChange={(e) => { if (validateNumber(e.target.value, true)) setTechSpecs((prev) => ({ ...prev, leftScreenHeight: e.target.value })); }}
//                         />
//                       </div>
//                       {stepErrors.leftScreenSize && <p className="mt-1 text-xs text-red-500">{stepErrors.leftScreenSize}</p>}
//                     </div>

//                     <div>
//                       <Label>Left Screen Resolution (px) <span className="text-red-500">*</span></Label>
//                       <div className="flex gap-2 items-center">
//                         <Input
//                           type="text"
//                           value={techSpecs.leftResolutionWidth}
//                           placeholder="Width (px)"
//                           className="flex-1"
//                           onChange={(e) => { if (validateNumber(e.target.value, false)) setTechSpecs((prev) => ({ ...prev, leftResolutionWidth: e.target.value })); }}
//                         />
//                         <span className="text-gray-500">x</span>
//                         <Input
//                           type="text"
//                           value={techSpecs.leftResolutionHeight}
//                           placeholder="Height (px)"
//                           className="flex-1"
//                           onChange={(e) => { if (validateNumber(e.target.value, false)) setTechSpecs((prev) => ({ ...prev, leftResolutionHeight: e.target.value })); }}
//                         />
//                       </div>
//                       {stepErrors.leftResolution && <p className="mt-1 text-xs text-red-500">{stepErrors.leftResolution}</p>}
//                     </div>

//                     <div>
//                       <Label>Right Screen Size (ft) <span className="text-red-500">*</span></Label>
//                       <div className="flex gap-2 items-center">
//                         <Input
//                           type="text"
//                           value={techSpecs.rightScreenWidth}
//                           placeholder="Width"
//                           className="flex-1"
//                           onChange={(e) => { if (validateNumber(e.target.value, true)) setTechSpecs((prev) => ({ ...prev, rightScreenWidth: e.target.value })); }}
//                         />
//                         <span className="text-gray-500">x</span>
//                         <Input
//                           type="text"
//                           value={techSpecs.rightScreenHeight}
//                           placeholder="Height"
//                           className="flex-1"
//                           onChange={(e) => { if (validateNumber(e.target.value, true)) setTechSpecs((prev) => ({ ...prev, rightScreenHeight: e.target.value })); }}
//                         />
//                       </div>
//                       {stepErrors.rightScreenSize && <p className="mt-1 text-xs text-red-500">{stepErrors.rightScreenSize}</p>}
//                     </div>

//                     <div>
//                       <Label>Right Screen Resolution (px) <span className="text-red-500">*</span></Label>
//                       <div className="flex gap-2 items-center">
//                         <Input
//                           type="text"
//                           value={techSpecs.rightResolutionWidth}
//                           placeholder="Width (px)"
//                           className="flex-1"
//                           onChange={(e) => { if (validateNumber(e.target.value, false)) setTechSpecs((prev) => ({ ...prev, rightResolutionWidth: e.target.value })); }}
//                         />
//                         <span className="text-gray-500">x</span>
//                         <Input
//                           type="text"
//                           value={techSpecs.rightResolutionHeight}
//                           placeholder="Height (px)"
//                           className="flex-1"
//                           onChange={(e) => { if (validateNumber(e.target.value, false)) setTechSpecs((prev) => ({ ...prev, rightResolutionHeight: e.target.value })); }}
//                         />
//                       </div>
//                       {stepErrors.rightResolution && <p className="mt-1 text-xs text-red-500">{stepErrors.rightResolution}</p>}
//                     </div>
//                   </>
//                 )}

//                 {/* ── 3 Screens: Shared Left/Right + Back ── */}
//                 {techSpecs.numberOfScreens === "3" && (
//                   <>
//                     <div>
//                       <Label>Left/Right Screen Size (ft) <span className="text-red-500">*</span></Label>
//                       <div className="flex gap-2 items-center">
//                         <Input
//                           type="text"
//                           value={techSpecs.leftRightScreenWidth}
//                           placeholder="Width"
//                           className="flex-1"
//                           onChange={(e) => { if (validateNumber(e.target.value, true)) setTechSpecs((prev) => ({ ...prev, leftRightScreenWidth: e.target.value })); }}
//                         />
//                         <span className="text-gray-500">x</span>
//                         <Input
//                           type="text"
//                           value={techSpecs.leftRightScreenHeight}
//                           placeholder="Height"
//                           className="flex-1"
//                           onChange={(e) => { if (validateNumber(e.target.value, true)) setTechSpecs((prev) => ({ ...prev, leftRightScreenHeight: e.target.value })); }}
//                         />
//                       </div>
//                       {stepErrors.leftRightScreenSize && <p className="mt-1 text-xs text-red-500">{stepErrors.leftRightScreenSize}</p>}
//                     </div>

//                     <div>
//                       <Label>Left/Right Resolution (px) <span className="text-red-500">*</span></Label>
//                       <div className="flex gap-2 items-center">
//                         <Input
//                           type="text"
//                           value={techSpecs.leftRightResolutionWidth}
//                           placeholder="Width (px)"
//                           className="flex-1"
//                           onChange={(e) => { if (validateNumber(e.target.value, false)) setTechSpecs((prev) => ({ ...prev, leftRightResolutionWidth: e.target.value })); }}
//                         />
//                         <span className="text-gray-500">x</span>
//                         <Input
//                           type="text"
//                           value={techSpecs.leftRightResolutionHeight}
//                           placeholder="Height (px)"
//                           className="flex-1"
//                           onChange={(e) => { if (validateNumber(e.target.value, false)) setTechSpecs((prev) => ({ ...prev, leftRightResolutionHeight: e.target.value })); }}
//                         />
//                       </div>
//                       {stepErrors.leftRightResolution && <p className="mt-1 text-xs text-red-500">{stepErrors.leftRightResolution}</p>}
//                     </div>

//                     <div>
//                       <Label>Back Screen Size (ft)</Label>
//                       <div className="flex gap-2 items-center">
//                         <Input
//                           type="text"
//                           value={techSpecs.backScreenWidth}
//                           placeholder="Width"
//                           className="flex-1"
//                           onChange={(e) => { if (validateNumber(e.target.value, true)) setTechSpecs((prev) => ({ ...prev, backScreenWidth: e.target.value })); }}
//                         />
//                         <span className="text-gray-500">x</span>
//                         <Input
//                           type="text"
//                           value={techSpecs.backScreenHeight}
//                           placeholder="Height"
//                           className="flex-1"
//                           onChange={(e) => { if (validateNumber(e.target.value, true)) setTechSpecs((prev) => ({ ...prev, backScreenHeight: e.target.value })); }}
//                         />
//                       </div>
//                     </div>

//                     <div>
//                       <Label>Back Resolution (px)</Label>
//                       <div className="flex gap-2 items-center">
//                         <Input
//                           type="text"
//                           value={techSpecs.backResolutionWidth}
//                           placeholder="Width (px)"
//                           className="flex-1"
//                           onChange={(e) => { if (validateNumber(e.target.value, false)) setTechSpecs((prev) => ({ ...prev, backResolutionWidth: e.target.value })); }}
//                         />
//                         <span className="text-gray-500">x</span>
//                         <Input
//                           type="text"
//                           value={techSpecs.backResolutionHeight}
//                           placeholder="Height (px)"
//                           className="flex-1"
//                           onChange={(e) => { if (validateNumber(e.target.value, false)) setTechSpecs((prev) => ({ ...prev, backResolutionHeight: e.target.value })); }}
//                         />
//                       </div>
//                     </div>
//                   </>
//                 )}

//                 {/* ── Common fields always shown ── */}
//                 <div>
//                   <Label>Audio Output (Watts) <span className="text-red-500">*</span></Label>
//                   <Input
//                     type="text"
//                     value={techSpecs.audioOutput}
//                     placeholder="e.g., 600"
//                     onChange={(e) => { if (validateNumber(e.target.value, true)) setTechSpecs((prev) => ({ ...prev, audioOutput: e.target.value })); }}
//                   />
//                   {stepErrors.audioOutput && <p className="mt-1 text-xs text-red-500">{stepErrors.audioOutput}</p>}
//                 </div>

//                 <div>
//                   <Label>Generator Capacity (KVA) <span className="text-red-500">*</span></Label>
//                   <Input
//                     type="text"
//                     value={techSpecs.generatorCapacity}
//                     placeholder="e.g., 7 KV"
//                     onChange={handleInputChange(setTechSpecs, "generatorCapacity")}
//                   />
//                   {stepErrors.generatorCapacity && <p className="mt-1 text-xs text-red-500">{stepErrors.generatorCapacity}</p>}
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
//                       <ChevronDown size={16} />
//                     </span>
//                   </div>
//                   {stepErrors.displayVersion && <p className="mt-1 text-xs text-red-500">{stepErrors.displayVersion}</p>}
//                 </div>

//                 <div>
//                   <Label>Brightness (Nits)</Label>
//                   <Input
//                     type="text"
//                     value={techSpecs.brightness}
//                     placeholder="e.g. 5500"
//                     onChange={(e) => { if (validateNumber(e.target.value, false)) setTechSpecs((prev) => ({ ...prev, brightness: e.target.value })); }}
//                   />
//                 </div>

//                 {/* CHANGE C: Sound Quality field REMOVED */}
//                 {/* soundQuality field was here — removed as per 22/05/2026 requirement */}
//                 {/* <div>
//                   <Label>Sound Quality <span className="text-red-500">*</span></Label>
//                   <Select options={selectOptions.soundQualityOptions} ... />
//                 </div> */}
//               </div>

//               <button
//                 type="button"
//                 onClick={() => setShowMoreTech(!showMoreTech)}
//                 className="mt-6 text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
//               >
//                 <Layers size={16} />
//                 {showMoreTech ? "Show Less Options" : "Show More Technical Options"}
//               </button>

//               {showMoreTech && (
//                 <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mt-6 pt-6 border-t">
//                   <div className="md:col-span-2">
//                     <Label>Additional Features</Label>
//                     <Input
//                       placeholder="e.g. Built-in Amplifier, USB, WiFi"
//                       value={techSpecs.additionalFeatures}
//                       onChange={(e) => setTechSpecs((prev) => ({ ...prev, additionalFeatures: e.target.value }))}
//                     />
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* ── STEP 3 ── */}
//           {currentStep === 3 && (
//             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
//               {/* CHANGE A: emoji replaced with Film icon */}
//               <SectionHeader number={3} title="Media & Description" icon={<Film size={18} />} />

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
//                 <Label>
//                   <span className="flex items-center gap-1">
//                     <FileText size={14} /> Vehicle Description <span className="text-red-500">*</span>
//                   </span>
//                 </Label>
//                 <textarea
//                   rows={4}
//                   className="w-full mt-1 rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
//                   placeholder="Enter detailed description about the vehicle..."
//                   value={vehicleDescription}
//                   onChange={(e) => setVehicleDescription(e.target.value)}
//                 />
//                 {stepErrors.vehicleDescription && (
//                   <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
//                     <AlertTriangle size={12} /> {stepErrors.vehicleDescription}
//                   </p>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* ── STEP 4 ── */}
//           {currentStep === 4 && (
//             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
//               {/* CHANGE A: emoji replaced with BarChart2 icon */}
//               <SectionHeader number={4} title="Vehicle Summary" icon={<BarChart2 size={18} />} />

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div className="bg-blue-50 rounded-lg p-4">
//                   <p className="text-sm text-gray-500 flex items-center gap-1"><Truck size={14} /> Total Vehicles</p>
//                   <p className="text-2xl font-bold text-blue-600">{vehicles.length}</p>
//                 </div>
//                 <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-100">
//                   <p className="text-sm text-gray-500 flex items-center gap-1"><Layers size={14} /> Vehicle Type</p>
//                   <p className="text-lg font-semibold text-purple-600">
//                     {vehicleTypes.find((vt) => vt._id === commonInfo.vehicleType)?.typeName || "Not selected"}
//                   </p>
//                 </div>
//               </div>

//               {vehicles.length > 0 && (
//                 <div className="mt-6">
//                   <Label className="font-semibold flex items-center gap-2">
//                     <Hash size={16} /> Vehicles to be onboarded:
//                   </Label>
//                   <div className="mt-2 space-y-2">
//                     {vehicles.map((v, idx) => (
//                       <div key={idx} className="flex items-center gap-2 text-sm p-3 bg-gray-50 rounded-lg">
//                         <span className="w-6 text-gray-400">{idx + 1}.</span>
//                         <span className="font-mono font-semibold text-blue-600">
//                           {formatRegistrationNumber(v.registrationNumber)}
//                         </span>
//                         <span className="text-gray-400">—</span>
//                         <span className="text-gray-600">{v.city}</span>
//                         <span className="text-gray-400">·</span>
//                         <span className="text-gray-500">{v.fuelType}</span>
//                         <span className="ml-auto">
//                           <StatusBadge status={v.currentStatus || "Available"} />
//                         </span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               <div className="mt-6 p-4 bg-yellow-50 rounded-lg flex items-start gap-2">
//                 <AlertTriangle size={16} className="text-yellow-600 mt-0.5 shrink-0" />
//                 <p className="text-sm text-yellow-800">
//                   Please review all details before submitting. Click the Submit button below to save all vehicles.
//                 </p>
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
//                 <div
//                   className="bg-blue-600 h-2 rounded-full transition-all duration-300"
//                   style={{ width: `${uploadProgress}%` }}
//                 />
//               </div>
//             </div>
//           )}

//           {/* Navigation Buttons */}
//           <div className="flex justify-between gap-4 mt-8">
//             <button
//               type="button"
//               onClick={() => window.location.reload()}
//               className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
//             >
//               <X size={16} /> Cancel
//             </button>
//             <div className="flex gap-3">
//               {currentStep > 1 && (
//                 <button
//                   type="button"
//                   onClick={() => {
//                     const prev = currentStep - 1;
//                     currentStepRef.current = prev;
//                     setCurrentStep(prev);
//                   }}
//                   className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
//                 >
//                   <ChevronLeft size={16} /> Previous
//                 </button>
//               )}
//               {currentStep < 4 ? (
//                 <button
//                   type="button"
//                   onClick={handleNextStep}
//                   className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
//                 >
//                   <Save size={16} /> Save & Next <ChevronRight size={16} />
//                 </button>
//               ) : (
//                 <button
//                   type="submit"
//                   disabled={loading || !stepCompletionStatus[3]}
//                   className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
//                 >
//                   <CheckCircle2 size={16} />
//                   {loading ? "Submitting..." : `Submit ${vehicles.length} Vehicle(s)`}
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
import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";
import axios from "axios";
import { baseUrl } from "../../../../BaseUrl";
import AdminSelectOptions from "../../AdminSelectOptions.json";
import { useAuthGuard } from "../../../utils/useAuthGuard";

// ── CHANGE A: Replace emoji icons with Lucide React icons ──────────────────
import {
  Truck,
  Trash2,
  Calendar,
  Upload,
  X,
  Eye,
  Plus,
  ChevronDown,
  PenLine,
  Monitor,
  Film,
  BarChart2,
  Settings,
  Wifi,
  WifiOff,
  ClipboardList,
  Info,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  User,
  Phone,
  Fuel,
  Hash,
  MapPin,
  Camera,
  FileText,
  Layers,
  Activity,
  Save,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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

// Today in YYYY-MM-DD, used as the `min` for expiry-date pickers (native
// <input type="date"> requires this exact format for the min attribute).
const todayDateStr = () => new Date().toISOString().slice(0, 10);

// ─── Date Input with Calendar Icon ───────────────────────────────────────────
const DateInput = ({
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  min,
}) => {
  return (
    <div className="relative">
      <Input
        type="date"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        className={`${disabled ? "bg-gray-100 dark:bg-gray-800" : ""} pr-10`}
      />
      <span className="absolute text-gray-400 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-500">
        <Calendar size={16} />
      </span>
      {required && value && (
        <span className="absolute text-green-500 right-3 top-1/2 -translate-y-1/2">
          <CheckCircle2 size={14} />
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
        {/* CHANGE A: replaced emoji icon with lucide icon component */}
        <span className="text-gray-400">{icon}</span>
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
                onClick={() => setShowPreview(true)}
                className="inline-flex items-center gap-1 text-xs bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                <Eye size={12} />
                Preview
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

      {showPreview && displayUrl && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowPreview(false)}
        >
          <div className="relative max-w-3xl max-h-[85vh] w-full" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className="absolute -top-10 right-0 inline-flex items-center gap-1 text-xs bg-white/90 hover:bg-white text-gray-800 px-3 py-1.5 rounded-lg transition-colors"
            >
              <X size={12} />
              Close
            </button>
            {accept === "video/*" ? (
              <video
                src={displayUrl}
                className="w-full max-h-[85vh] rounded-lg bg-black"
                controls
                autoPlay
              />
            ) : (
              <img
                src={displayUrl}
                alt={label}
                className="w-full max-h-[85vh] object-contain rounded-lg bg-white"
              />
            )}
          </div>
        </div>
      )}
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
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all duration-200 shrink-0 ${stepCompletionStatus[step.number] || (currentStep > step.number)
                    ? "bg-green-600 text-white"
                    : isActive
                      ? "bg-blue-600 text-white ring-4 ring-blue-100"
                      : isDisabled
                        ? "bg-gray-300 text-gray-400 cursor-not-allowed dark:bg-gray-700"
                        : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                    }`}
                >
                  {(stepCompletionStatus[step.number] || (currentStep > step.number)) ? (
                    <CheckCircle2 size={16} />
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
                <div className="flex items-center mx-2 shrink-0">
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
// CHANGE A: icon prop now accepts JSX (Lucide component) instead of emoji string
const SectionHeader = ({ number, title, icon }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-600 text-white text-sm font-bold shadow-md">
      {number}
    </div>
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight flex items-center gap-2">
        {icon && <span className="text-blue-600">{icon}</span>}
        {title}
      </h2>
    </div>
  </div>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styles = {
    Available: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    Unavailable: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    "Waiting for Status": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    Maintenance: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    Booked: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    Damaged: "bg-red-200 text-red-900 dark:bg-red-900/40 dark:text-red-300",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles["Waiting for Status"]
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
  return `${clean.slice(0, 2)} ${clean.slice(2, 4)} ${clean.slice(4, 6)} ${clean.slice(6, 10)}`;
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

    if (techSpecs.screenType === "Flex + LED") {
      if (!techSpecs.flexHeight) errors.flexHeight = "Flex Height is required";
      if (!techSpecs.flexWidth) errors.flexWidth = "Flex Width is required";
    }

    const num = techSpecs.numberOfScreens;

    if (num === "1") {
      // 1 screen = back screen only
      if (!techSpecs.singleBackScreenWidth || !techSpecs.singleBackScreenHeight)
        errors.backScreenSize = "Back Screen size (Width & Height) is required";
      if (!techSpecs.singleBackResolutionWidth || !techSpecs.singleBackResolutionHeight)
        errors.backResolution = "Back Resolution (Width & Height) is required";
    } else if (num === "2") {
      // 2 screens = left + right (no back)
      if (!techSpecs.leftScreenWidth || !techSpecs.leftScreenHeight)
        errors.leftScreenSize = "Left Screen size (Width & Height) is required";
      if (!techSpecs.rightScreenWidth || !techSpecs.rightScreenHeight)
        errors.rightScreenSize = "Right Screen size (Width & Height) is required";
      if (!techSpecs.leftResolutionWidth || !techSpecs.leftResolutionHeight)
        errors.leftResolution = "Left Resolution (Width & Height) is required";
      if (!techSpecs.rightResolutionWidth || !techSpecs.rightResolutionHeight)
        errors.rightResolution = "Right Resolution (Width & Height) is required";
    } else if (num === "3") {
      // 3 screens = left/right (shared) + back
      if (!techSpecs.leftRightScreenWidth || !techSpecs.leftRightScreenHeight)
        errors.leftRightScreenSize = "Left/Right Screen size (Width & Height) is required";
      if (!techSpecs.leftRightResolutionWidth || !techSpecs.leftRightResolutionHeight)
        errors.leftRightResolution = "Left/Right Resolution (Width & Height) is required";
    }

    if (!techSpecs.audioOutput) errors.audioOutput = "Audio Output is required";
    if (!techSpecs.generatorCapacity)
      errors.generatorCapacity = "Generator Capacity is required";
    if (!techSpecs.displayVersion)
      errors.displayVersion = "Display Version is required";
    // CHANGE C: soundQuality removed from required validation
  }

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
      toast.error("Please enter vehicle type name", { position: "bottom-right", autoClose: 3000 });
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
    if (window.confirm("Are you sure you want to permanently delete this vehicle type?")) {
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
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <ClipboardList size={20} className="text-blue-600" />
            Manage Vehicle Types
          </h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 mb-4 text-blue-600 hover:text-blue-700"
          >
            <Plus size={16} />
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
                  <span className="text-gray-800 dark:text-white">{type.typeName}</span>
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
                      <PenLine size={16} />
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
    city: "Tamil Nadu, Madurai",
    permitType: "",
    modelConfig: "",
    ownershipType: "",
    fuelType: "",
    manufacturingYear: "",
    gpsEnabled: true,
    activeStatus: true,
    currentStatus: "Waiting for Status",
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
        registrationNumber: formatRegistrationNumber(editingVehicle.registrationNumber) || "",
        vehicleId: editingVehicle.vehicleId || "",
        city: editingVehicle.city || "Tamil Nadu, Madurai",
        permitType: editingVehicle.permitType || "",
        modelConfig: editingVehicle.modelConfig || "",
        ownershipType: editingVehicle.ownershipType || "",
        fuelType: editingVehicle.fuelType || "",
        manufacturingYear: editingVehicle.manufacturingYear || "",
        gpsEnabled: editingVehicle.gpsEnabled !== undefined ? editingVehicle.gpsEnabled : true,
        activeStatus: editingVehicle.activeStatus !== undefined ? editingVehicle.activeStatus : true,
        currentStatus: editingVehicle.currentStatus || "Waiting for Status",
        availableFrom: editingVehicle.availableFrom || "",
        remarks: editingVehicle.remarks || "",
        driverName: editingVehicle.driverName || "",
        driverPhone: editingVehicle.driverPhone || "",
        backupDriver: editingVehicle.backupDriver || "",
        backupDriverPhone: editingVehicle.backupDriverPhone || "",
        driverCharges: editingVehicle.driverCharges ? String(editingVehicle.driverCharges) : "",
        lastServiceDate: editingVehicle.lastServiceDate || "",
        insuranceExpiryDate: editingVehicle.insuranceExpiryDate || "",
        pollutionExpiryDate: editingVehicle.pollutionExpiryDate || "",
      });
    } else if (!editingVehicle && isOpen) {
      setFormData((prev) => ({
        ...prev,
        registrationNumber: "",
        city: "Tamil Nadu, Madurai",
        permitType: "",
        modelConfig: "",
        ownershipType: "",
        fuelType: "",
        manufacturingYear: "",
        gpsEnabled: true,
        activeStatus: true,
        currentStatus: "Waiting for Status",
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
      setYearError(`Manufacturing year must be ${currentYear} or earlier`);
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
      if (cleanValue.length === 10 && isValidRegistrationNumber(value)) {
        setIsCheckingDuplicate(true);
        try {
          const isDuplicate = await onCheckDuplicate(cleanValue, editingVehicle?.registrationNumber);
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
    if (!cityFilter.trim()) return;
    const baseCities = AdminSelectOptions.cities;
    const alreadyExists =
      baseCities.includes(cityFilter) ||
      customCities.some((c) => c.value === cityFilter);
    if (!alreadyExists) {
      setCustomCities((prev) => [...prev, { value: cityFilter, label: cityFilter }]);
    }
    setFormData((prev) => ({ ...prev, city: cityFilter }));
    setCityFilter("");
  };

  const selectOptions = {
    cityOptions: [
      ...AdminSelectOptions.cities.map((city) => ({ value: city, label: city })),
      ...customCities,
    ],
    permitOptions: [...AdminSelectOptions.permitOptions.map((option) => ({ value: option.value, label: option.label }))],
    modelOptions: [...AdminSelectOptions.modelOptions.map((option) => ({ value: option.value, label: option.label }))],
    ownershipOptions: [...AdminSelectOptions.ownershipOptions.map((option) => ({ value: option.value, label: option.label }))],
    fuelTypeOptions: [...AdminSelectOptions.fuelTypeOptions.map((option) => ({ value: option.value, label: option.label }))],
  };

  const handleSubmit = async (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }

    const cleanReg = unformatRegistrationNumber(formData.registrationNumber);
    if (!cleanReg || cleanReg.length !== 10 || !isValidRegistrationNumber(formData.registrationNumber)) {
      toast.error("Please enter a valid registration number", { position: "bottom-right", autoClose: 3000 });
      return;
    }
    if (!formData.city) {
      toast.error("City is required", { position: "bottom-right", autoClose: 3000 });
      return;
    }
    if (!formData.fuelType) {
      toast.error("Fuel Type is required", { position: "bottom-right", autoClose: 3000 });
      return;
    }

    if (formData.manufacturingYear) {
      const currentYear = new Date().getFullYear();
      const yearNum = parseInt(formData.manufacturingYear);
      if (isNaN(yearNum) || yearNum > currentYear || yearNum < 1900) {
        toast.error(`Manufacturing year must be between 1900 and ${currentYear}`, { position: "bottom-right", autoClose: 3000 });
        return;
      }
    }

    if (formData.driverPhone && formData.driverPhone.length !== 10) {
      toast.error("Driver phone number must be 10 digits", { position: "bottom-right", autoClose: 3000 });
      return;
    }

    if (formData.backupDriverPhone && formData.backupDriverPhone.length !== 10 && formData.backupDriverPhone.length > 0) {
      toast.error("Backup driver phone number must be 10 digits", { position: "bottom-right", autoClose: 3000 });
      return;
    }

    if (formData.currentStatus === "Unavailable" && !formData.availableFrom) {
      toast.error("Please provide Available From date for Unavailable status", { position: "bottom-right", autoClose: 3000 });
      return;
    }
    if (formData.currentStatus === "Unavailable" && !formData.remarks) {
      toast.error("Please provide remarks for Unavailable status", { position: "bottom-right", autoClose: 3000 });
      return;
    }

    const isDuplicate = await onCheckDuplicate(cleanReg, editingVehicle?.registrationNumber);
    if (isDuplicate && !editingVehicle) {
      toast.error("This registration number already exists", { position: "bottom-right", autoClose: 3000 });
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
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Truck size={20} className="text-blue-600" />
            {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
          </h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <Label>
                <span className="flex items-center gap-1"><Hash size={14} /> Registration Number <span className="text-red-500">*</span></span>
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
              {registrationError && <p className="mt-1 text-xs text-red-500">{registrationError}</p>}
              {!registrationError && formData.registrationNumber && isValidRegistrationNumber(formData.registrationNumber) && (
                <p className="mt-1 text-xs text-green-500 flex items-center gap-1"><CheckCircle2 size={12} /> Valid registration number</p>
              )}
            </div>

            <div>
              <Label><span className="flex items-center gap-1"><Hash size={14} /> Vehicle ID <span className="text-red-500">*</span></span></Label>
              <div className="relative">
                <Input
                  type="text"
                  value={formData.vehicleId || (isGeneratingId ? "Generating..." : "")}
                  placeholder="Auto generated"
                  disabled
                  className={`bg-gray-100 dark:bg-gray-800 cursor-not-allowed ${isGeneratingId ? "animate-pulse" : ""}`}
                />
                {isGeneratingId && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-400">
                {formData.vehicleId ? `Vehicle ID: ${formData.vehicleId}` : "Vehicle ID will be auto-generated"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* City field hidden per original code */}
              <div style={{ display: "none" }}>
                <Label><span className="flex items-center gap-1"><MapPin size={14} /> City / Operating Location <span className="text-red-500">*</span></span></Label>
                <div className="relative">
                  <Select
                    options={selectOptions.cityOptions}
                    placeholder="Select City"
                    value={formData.city}
                    onChange={(value) => setFormData((prev) => ({ ...prev, city: value }))}
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDown size={16} />
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
                  <button type="button" onClick={handleAddCity} className="px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">
                    Add
                  </button>
                </div>
              </div>

              <div>
                <Label><span className="flex items-center gap-1"><Fuel size={14} /> Fuel Type <span className="text-red-500">*</span></span></Label>
                <div className="relative">
                  <Select
                    options={selectOptions.fuelTypeOptions}
                    placeholder="Select Fuel Type"
                    value={formData.fuelType}
                    onChange={(value) => setFormData((prev) => ({ ...prev, fuelType: value }))}
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDown size={16} />
                  </span>
                </div>
              </div>

              <div>
                <Label><span className="flex items-center gap-1"><Calendar size={14} /> Manufacturing Year <span className="text-red-500"></span></span></Label>
                <Input
                  type="text"
                  placeholder="e.g. 2023"
                  maxLength={4}
                  value={formData.manufacturingYear}
                  onChange={(e) => handleYearChange(e.target.value)}
                  className={yearError ? "border-red-500" : ""}
                />
                {yearError && <p className="mt-1 text-xs text-red-500">{yearError}</p>}
              </div>
            </div>

            <div className="flex gap-6 pt-2">
              <div>
                <Label><span className="flex items-center gap-1"><Wifi size={14} /> GPS Enabled <span className="text-red-500">*</span></span></Label>
                <Switch
                  label={formData.gpsEnabled ? "Enabled" : "Disabled"}
                  defaultChecked={formData.gpsEnabled}
                  onChange={(checked) => setFormData((prev) => ({ ...prev, gpsEnabled: checked }))}
                />
              </div>
            </div>

            <div className="border-t pt-6 mt-2">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Wrench size={16} /> Maintenance Details (Optional)
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
                <div>
                  <Label>Insurance Expiry Date</Label>
                  <DateInput
                    value={formData.insuranceExpiryDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, insuranceExpiryDate: e.target.value }))}
                    min={todayDateStr()}
                  />
                </div>
                <div>
                  <Label>Pollution Expiry Date</Label>
                  <DateInput
                    value={formData.pollutionExpiryDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, pollutionExpiryDate: e.target.value }))}
                    min={todayDateStr()}
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
            className="px-5 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <X size={16} /> Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <Save size={16} />
            {loading ? "Saving..." : editingVehicle ? "Update Vehicle" : "Add Vehicle"}
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
        driverCharges: vehicle.driverCharges ? String(vehicle.driverCharges) : "",
      });
    }
  }, [vehicle, isOpen]);

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
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Wrench size={20} className="text-blue-600" />
            Driver & Maintenance Details:{" "}
            <span className="font-mono text-blue-600">{formatRegistrationNumber(vehicle?.registrationNumber)}</span>
          </h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <Label className="text-base font-semibold flex items-center gap-2"><User size={16} /> Driver Details</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
              <div>
                <Label>Driver Name</Label>
                <Input value={driverData.driverName} onChange={(e) => setDriverData((prev) => ({ ...prev, driverName: e.target.value }))} />
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
                <Input value={driverData.backupDriver} onChange={(e) => setDriverData((prev) => ({ ...prev, backupDriver: e.target.value }))} />
              </div>
              <div>
                <Label>Backup Driver Phone</Label>
                <Input
                  value={driverData.backupDriverPhone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setDriverData((prev) => ({ ...prev, backupDriverPhone: val }));
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
                      setDriverData((prev) => ({ ...prev, driverCharges: e.target.value }));
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <Label className="text-base font-semibold flex items-center gap-2"><Wrench size={16} /> Maintenance Details</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
              <div>
                <Label>Last Service Date</Label>
                <DateInput
                  value={maintenanceData.lastServiceDate}
                  onChange={(e) => setMaintenanceData((prev) => ({ ...prev, lastServiceDate: e.target.value }))}
                />
              </div>
              <div>
                <Label>Insurance Expiry Date</Label>
                <DateInput
                  value={maintenanceData.insuranceExpiryDate}
                  onChange={(e) => setMaintenanceData((prev) => ({ ...prev, insuranceExpiryDate: e.target.value }))}
                  min={todayDateStr()}
                />
              </div>
              <div>
                <Label>Pollution Certificate Expiry Date</Label>
                <DateInput
                  value={maintenanceData.pollutionExpiryDate}
                  onChange={(e) => setMaintenanceData((prev) => ({ ...prev, pollutionExpiryDate: e.target.value }))}
                  min={todayDateStr()}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-xl">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 flex items-center gap-2">
            <X size={16} /> Cancel
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e)}
            disabled={loading}
            className="px-5 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Save size={16} />
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

  //TO PROTECT THE ROUTE
  useAuthGuard();

  // FIX 3: vehicleDescription state
  const [vehicleDescription, setVehicleDescription] = useState("");
  // Tracks the last value actually persisted to the server for step 3 —
  // used to discard unsaved edits if the user navigates away (Previous)
  // without clicking Save & Next on this step.
  const [savedVehicleDescription, setSavedVehicleDescription] = useState("");

  const [commonInfo, setCommonInfo] = useState({
    customizedType: "Non-Customized",
    vehicleType: "",
    vehicleName: "",
  });

  // CHANGE C + B: techSpecs now includes all dynamic screen fields
  // soundQuality REMOVED from state (deprecated 22/05/2026)
  const [techSpecs, setTechSpecs] = useState({
    screenType: "",
    numberOfScreens: "",
    // Flex Height/Width — shown only when screenType === "Flex + LED"
    flexHeight: "",
    flexWidth: "",
    // Back screen fields (used when numberOfScreens === "1") — separate from
    // the "3 screens" back fields below so switching 1↔3 doesn't cross-populate.
    singleBackScreenWidth: "",
    singleBackScreenHeight: "",
    singleBackResolutionWidth: "",
    singleBackResolutionHeight: "",
    // Shared Left/Right fields (used when numberOfScreens === "3")
    leftRightScreenWidth: "",
    leftRightScreenHeight: "",
    backScreenWidth: "",
    backScreenHeight: "",
    leftRightResolutionWidth: "",
    leftRightResolutionHeight: "",
    backResolutionWidth: "",
    backResolutionHeight: "",
    // Separate Left fields (used when numberOfScreens === "2")
    leftScreenWidth: "",
    leftScreenHeight: "",
    leftResolutionWidth: "",
    leftResolutionHeight: "",
    // Separate Right fields (used when numberOfScreens === "2")
    rightScreenWidth: "",
    rightScreenHeight: "",
    rightResolutionWidth: "",
    rightResolutionHeight: "",
    audioOutput: "",
    brightness: "",
    displayVersion: "",
    generatorCapacity: "",
    additionalFeatures: "",
    // soundQuality: "",  // REMOVED — deprecated as of 22/05/2026
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
    6: false,
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && currentStep !== 6) {
        const activeElement = document.activeElement;
        const isTextarea = activeElement?.tagName === "TEXTAREA";
        const isSubmitButton = activeElement?.type === "submit";
        if (!isTextarea && !isSubmitButton) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [currentStep]);

  useEffect(() => {
    const initializeData = async () => {
      await fetchVehicleTypes();
      await fetchExistingRegNumbers();
    };
    initializeData();
  }, []);

  useEffect(() => {
    if (!isModalOpen) {
      fetchExistingRegNumbers();
    }
  }, [vehicles.length]);

  // ── CHANGE E + CHANGE D: saveCurrentStep updated ────────────────────────────
  // Key fixes:
  // 1. Step 3 now sends media files via multipart/form-data correctly
  // 2. vehiclesOverride param allows passing updated vehicles array directly
  //    (needed for Add Vehicle auto-save so we don't read stale state)
  const saveCurrentStep = async (stepNumber, nextStep = null, vehiclesOverride = null) => {
    const currentVehicles = vehiclesOverride ?? vehicles;

    if (!commonInfo.vehicleType && stepNumber !== 1) {
      toast.error("Please select a vehicle type first");
      return false;
    }

    try {
      // ── Step 3: use multipart/form-data to send both media files AND description
      if (stepNumber === 3) {
        const formData = new FormData();
        const stepData = {
          vehicleDescription,
          // Also include any existing media URLs so they're preserved
          mediaFiles: existingMediaUrls,
        };
        formData.append(
          "data",
          JSON.stringify({ step: 3, stepData, completed: true })
        );
        // Append any new file uploads
        Object.keys(mediaFiles).forEach((key) => {
          if (mediaFiles[key] instanceof File) {
            formData.append(key, mediaFiles[key]);
          }
        });

        if (!currentEditingGroupId) {
          toast.error("Please complete Step 1 first");
          return false;
        }

        const res = await axios.put(
          `${baseUrl}/api/updateVehicleStep/${currentEditingGroupId}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        if (res.data.success) {
          setStepCompletionStatus((prev) => ({ ...prev, [stepNumber]: true }));
          setSavedVehicleDescription(vehicleDescription);
          toast.success("Media & Description saved", { position: "bottom-right", autoClose: 3000 });
          if (nextStep) setCurrentStep(nextStep);
          return true;
        }
        return false;
      }

      // ── All other steps: send JSON
      let stepData = {};

      if (stepNumber === 1) {
        stepData = {
          basicInfo: commonInfo,
          registrationVehicles: currentVehicles.map((v) => ({
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
          totalVehicles: currentVehicles.length,
        };
      } else if (stepNumber === 2) {
        stepData = { techSpecs };
      } else if (stepNumber === 4) {
        stepData = {
          registrationVehicles: currentVehicles.map((v) => ({
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
        };
      }

      // ── Step 1: create group if not exists, else update
      if (stepNumber === 1 && !currentEditingGroupId) {
        const payload = {
          basicInfo: commonInfo,
          registrationVehicles: stepData.registrationVehicles,
          totalVehicles: currentVehicles.length,
          techSpecs: {},
          vehicleDescription: "",
          mediaFiles: {},
          completedSteps: { step1: true },
        };
        const createRes = await axios.post(`${baseUrl}/api/createVehicle`, payload);
        if (createRes.data.success) {
          setCurrentEditingGroupId(createRes.data.data._id);
          setStepCompletionStatus((prev) => ({ ...prev, [stepNumber]: true }));
          toast.success("Basic info saved", { position: "bottom-right", autoClose: 3000 });
          if (nextStep) setCurrentStep(nextStep);
          return true;
        }
        return false;
      }

      // ── Update existing group
      const res = await axios.put(
        `${baseUrl}/api/updateVehicleStep/${currentEditingGroupId}`,
        { step: stepNumber, stepData, completed: true }
      );
      if (res.data.success) {
        setStepCompletionStatus((prev) => ({ ...prev, [stepNumber]: true }));
        if (nextStep) setCurrentStep(nextStep);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Save step error:", error);
      toast.error("Failed to save step", { position: "bottom-right", autoClose: 3000 });
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
    const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    const validVideoTypes = ["video/mp4", "video/mov", "video/avi", "video/mkv", "video/webm"];
    if (isVideo && !validVideoTypes.includes(file.type)) {
      toast.error("Please select a valid video file", { position: "bottom-right", autoClose: 3000 });
      return;
    }
    if (!isVideo && !validImageTypes.includes(file.type)) {
      toast.error("Please select a valid image file", { position: "bottom-right", autoClose: 3000 });
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setMediaPreviews((prev) => ({ ...prev, [field]: previewUrl }));
    setMediaFiles((prev) => ({ ...prev, [field]: file }));
    setExistingMediaUrls((prev) => ({ ...prev, [field]: "" }));
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
    const cleanReg = unformatRegistrationNumber(regNumber);
    const cleanExclude = excludeRegNumber ? unformatRegistrationNumber(excludeRegNumber) : null;
    const localDuplicate = vehicles.some(
      (v) =>
        unformatRegistrationNumber(v.registrationNumber) === cleanReg &&
        unformatRegistrationNumber(v.registrationNumber) !== cleanExclude
    );
    if (localDuplicate) return true;
    if (existingRegNumbersSet.has(cleanReg) && cleanReg !== cleanExclude) return true;
    return false;
  };

  const fetchVehicleTypes = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/vehicle-types`);

      if (response.data.success) {
        const latestVehicleTypes = Array.isArray(response.data.data)
          ? response.data.data
          : [];

        setVehicleTypes(latestVehicleTypes);

        // Keep vehicleName only as a synchronized compatibility value.
        // vehicleType ID remains the actual selected value.
        setCommonInfo((previous) => {
          if (!previous.vehicleType) return previous;

          const selectedType = latestVehicleTypes.find(
            (type) => String(type._id) === String(previous.vehicleType)
          );

          if (
            !selectedType ||
            previous.vehicleName === selectedType.typeName
          ) {
            return previous;
          }

          return {
            ...previous,
            vehicleName: selectedType.typeName,
          };
        });

        return latestVehicleTypes;
      }

      return [];
    } catch (error) {
      console.error("Error fetching vehicle types:", error);
      return [];
    }
  };

  const fetchVehicleByType = async (typeId) => {
    if (!typeId) return;

    setIsLoadingVehicleData(true);

    try {
      const res = await axios.get(
        `${baseUrl}/api/getVehicleGroupByType/${typeId}`
      );

      const selectedType =
        vehicleTypes.find(
          (type) => String(type._id) === String(typeId)
        ) ||
        res.data?.data?.vehicleTypeDetails ||
        null;

      const resolvedTypeName =
        selectedType?.typeName ||
        res.data?.data?.basicInfo?.vehicleTypeName ||
        res.data?.data?.basicInfo?.vehicleName ||
        "";

      if (res.data.success && res.data.data) {
        const data = res.data.data;

        setSelectedVehicleTypeData(data);
        setCurrentEditingGroupId(data._id);

        // Never copy a stale basicInfo.vehicleName directly.
        // Resolve the current name using the selected VehicleType ID.
        setCommonInfo({
          customizedType:
            data.basicInfo?.customizedType || "Non-Customized",
          vehicleType: String(typeId),
          vehicleName: resolvedTypeName,
        });

        setTechSpecs(
          data.techSpecs || {
            screenType: "LED Only",
            numberOfScreens: "",
            flexHeight: "",
            flexWidth: "",
            singleBackScreenWidth: "",
            singleBackScreenHeight: "",
            singleBackResolutionWidth: "",
            singleBackResolutionHeight: "",
            leftRightScreenWidth: "",
            leftRightScreenHeight: "",
            backScreenWidth: "",
            backScreenHeight: "",
            leftRightResolutionWidth: "",
            leftRightResolutionHeight: "",
            backResolutionWidth: "",
            backResolutionHeight: "",
            leftScreenWidth: "",
            leftScreenHeight: "",
            leftResolutionWidth: "",
            leftResolutionHeight: "",
            rightScreenWidth: "",
            rightScreenHeight: "",
            rightResolutionWidth: "",
            rightResolutionHeight: "",
            audioOutput: "",
            brightness: "",
            displayVersion: "",
            generatorCapacity: "",
            additionalFeatures: "",
          }
        );

        setVehicleDescription(data.vehicleDescription || "");
        setSavedVehicleDescription(data.vehicleDescription || "");
        setExistingMediaUrls(data.mediaFiles || {});

        if (
          data.registrationVehicles &&
          data.registrationVehicles.length > 0
        ) {
          const formatted = data.registrationVehicles.map((rv) => ({
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
            currentStatus:
              rv.statusAvailability?.currentStatus || "Available",
            availableFrom:
              rv.statusAvailability?.availableFrom?.split("T")[0] ||
              "",
            remarks: rv.statusAvailability?.remarks || "",
            driverName: rv.driverDetails?.driverName || "",
            driverPhone: rv.driverDetails?.driverPhone || "",
            backupDriver: rv.driverDetails?.backupDriver || "",
            backupDriverPhone:
              rv.driverDetails?.backupDriverPhone || "",
            driverCharges: String(
              rv.driverDetails?.driverCharges || ""
            ),
            lastServiceDate:
              rv.maintenance?.lastServiceDate?.split("T")[0] ||
              "",
            insuranceExpiryDate:
              rv.maintenance?.insuranceExpiryDate?.split("T")[0] ||
              "",
            pollutionExpiryDate:
              rv.maintenance?.pollutionExpiryDate?.split("T")[0] ||
              "",
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

        toast.success(
          `Loaded ${
            data.registrationVehicles?.length || 0
          } vehicle(s) for "${resolvedTypeName}"`,
          {
            position: "bottom-right",
            autoClose: 3000,
          }
        );
      } else {
        resetFormForNewVehicleType();

        // Preserve the newly selected ID/name after resetting form data.
        setCommonInfo((previous) => ({
          ...previous,
          vehicleType: String(typeId),
          vehicleName: resolvedTypeName,
        }));

        toast.info(
          "No existing data found for this vehicle type",
          {
            position: "bottom-right",
            autoClose: 3000,
          }
        );
      }
    } catch (err) {
      console.error(err);
      resetFormForNewVehicleType();

      const selectedType = vehicleTypes.find(
        (type) => String(type._id) === String(typeId)
      );

      setCommonInfo((previous) => ({
        ...previous,
        vehicleType: String(typeId),
        vehicleName: selectedType?.typeName || "",
      }));

      toast.error("Error loading vehicle data", {
        position: "bottom-right",
        autoClose: 3000,
      });
    } finally {
      setIsLoadingVehicleData(false);
    }
  };

  const createVehicleType = async (typeName) => {
    try {
      const response = await axios.post(`${baseUrl}/api/vehicle-types`, { typeName });
      if (response.data.success) {
        toast.success("Vehicle type created successfully", { position: "bottom-right", autoClose: 3000 });
        await fetchVehicleTypes();
        return response.data.data;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating vehicle type", { position: "bottom-right", autoClose: 3000 });
      throw error;
    }
  };

  const updateVehicleType = async (id, typeName) => {
    try {
      const response = await axios.put(
        `${baseUrl}/api/vehicle-types/${id}`,
        { typeName }
      );

      if (response.data.success) {
        const updatedType = response.data.data;

        setVehicleTypes((previous) =>
          previous.map((type) =>
            String(type._id) === String(updatedType._id)
              ? updatedType
              : type
          )
        );

        if (
          String(commonInfo.vehicleType) ===
          String(updatedType._id)
        ) {
          setCommonInfo((previous) => ({
            ...previous,
            vehicleName: updatedType.typeName,
          }));
        }

        toast.success("Vehicle type updated successfully", {
          position: "bottom-right",
          autoClose: 3000,
        });

        await fetchVehicleTypes();
        return updatedType;
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Error updating vehicle type",
        {
          position: "bottom-right",
          autoClose: 3000,
        }
      );

      throw error;
    }
  };

  const deleteVehicleType = async (id) => {
    try {
      const response = await axios.delete(`${baseUrl}/api/vehicle-types/${id}`);
      if (response.data.success) {
        toast.success("Vehicle type deleted successfully", { position: "bottom-right", autoClose: 3000 });
        await fetchVehicleTypes();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting vehicle type", { position: "bottom-right", autoClose: 3000 });
      throw error;
    }
  };

  useEffect(() => {
    fetchVehicleTypes();
    fetchExistingRegNumbers();
  }, []);

  const resetFormForNewVehicleType = () => {
    setVehicles([]);
    setTechSpecs({
      screenType: "",
      numberOfScreens: "",
      flexHeight: "",
      flexWidth: "",
      singleBackScreenWidth: "",
      singleBackScreenHeight: "",
      singleBackResolutionWidth: "",
      singleBackResolutionHeight: "",
      leftRightScreenWidth: "",
      leftRightScreenHeight: "",
      backScreenWidth: "",
      backScreenHeight: "",
      leftRightResolutionWidth: "",
      leftRightResolutionHeight: "",
      backResolutionWidth: "",
      backResolutionHeight: "",
      leftScreenWidth: "",
      leftScreenHeight: "",
      leftResolutionWidth: "",
      leftResolutionHeight: "",
      rightScreenWidth: "",
      rightScreenHeight: "",
      rightResolutionWidth: "",
      rightResolutionHeight: "",
      audioOutput: "",
      brightness: "",
      displayVersion: "",
      generatorCapacity: "",
      additionalFeatures: "",
      // soundQuality: "",  // REMOVED
    });
    setVehicleDescription("");
    setMediaFiles({ frontViewImage: null, leftSideImage: null, rightSideImage: null, rearViewImage: null, interiorImage: null, demoVideo: null });
    setMediaPreviews({ frontViewImage: null, leftSideImage: null, rightSideImage: null, rearViewImage: null, interiorImage: null, demoVideo: null });
    setExistingMediaUrls({ frontViewImage: "", leftSideImage: "", rightSideImage: "", rearViewImage: "", interiorImage: "", demoVideo: "" });
    setCurrentEditingGroupId(null);
    setStepCompletionStatus({ 1: false, 2: false, 3: false, 4: false });
  };

  useEffect(() => {
    if (!commonInfo.vehicleType) return;

    const selectedType = vehicleTypes.find(
      (type) =>
        String(type._id) === String(commonInfo.vehicleType)
    );

    if (
      selectedType &&
      selectedType.typeName !== commonInfo.vehicleName
    ) {
      setCommonInfo((previous) => ({
        ...previous,
        vehicleName: selectedType.typeName,
      }));
    }
  }, [
    vehicleTypes,
    commonInfo.vehicleType,
    commonInfo.vehicleName,
  ]);

  useEffect(() => {
    if (commonInfo.vehicleType) {
      resetFormForNewVehicleType();
      fetchVehicleByType(commonInfo.vehicleType);
    } else {
      resetFormForNewVehicleType();
    }
  }, [commonInfo.vehicleType]);

  const steps = [
    { number: 1, title: "Basic Information" },
    { number: 2, title: "Technical Specification" },
    { number: 3, title: "Media & Description" },
    { number: 4, title: "Vehicle Summary" },
  ];

  const canAccessStep6 = stepCompletionStatus[4] === true;

  // ── CHANGE D: handleAddVehicle auto-saves Step 1 to DB ─────────────────────
  // The key fix: pass updatedVehicles directly to saveCurrentStep via vehiclesOverride
  // so we don't read stale React state (setVehicles is async)
  const handleAddVehicle = async (vehicleData) => {
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

    let updatedVehicles;

    if (editingVehicle) {
      // Edit existing vehicle in local state
      updatedVehicles = vehicles.map((v) =>
        unformatRegistrationNumber(v.registrationNumber) ===
          unformatRegistrationNumber(editingVehicle.registrationNumber)
          ? newVehicle
          : v
      );
      setVehicles(updatedVehicles);
      toast.success("Vehicle updated successfully", { position: "bottom-right", autoClose: 3000 });
    } else {
      // Add new vehicle
      const exists = vehicles.some(
        (v) =>
          unformatRegistrationNumber(v.registrationNumber) ===
          vehicleData.registrationNumber
      );
      if (exists) {
        toast.error("Vehicle with this registration number already exists", { position: "bottom-right", autoClose: 3000 });
        return;
      }
      updatedVehicles = [...vehicles, newVehicle];
      setVehicles(updatedVehicles);
      setExistingRegNumbersSet((prev) => new Set([...prev, vehicleData.registrationNumber]));
      toast.success("Vehicle added successfully", { position: "bottom-right", autoClose: 3000 });
    }

    setEditingVehicle(null);

    // ── Auto-save Step 1 to DB immediately after adding/editing a vehicle
    // Pass updatedVehicles directly (vehiclesOverride) to avoid stale state issue
    if (commonInfo.vehicleType) {
      await saveCurrentStep(1, null, updatedVehicles);
    }
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  };

  // CHANGE 3: Hard delete from DB (not just local state)
  const handleDeleteVehicle = async (registrationNumber) => {
    if (!window.confirm(`Delete vehicle ${registrationNumber}?`)) return;

    if (currentEditingGroupId) {
      try {
        const cleanReg = registrationNumber.replace(/\s/g, "");
        const res = await axios.delete(
          `${baseUrl}/api/deleteRegistrationVehicle/${currentEditingGroupId}/${encodeURIComponent(cleanReg)}`
        );
        if (res.data.success) {
          setVehicles((prev) =>
            prev.filter((v) => v.registrationNumber.replace(/\s/g, "") !== cleanReg)
          );
          toast.success("Vehicle deleted from database");
          return;
        }
      } catch (err) {
        toast.error("Delete failed");
        return;
      }
    }
    // Fallback: local only if no groupId yet
    setVehicles((prev) =>
      prev.filter(
        (v) =>
          unformatRegistrationNumber(v.registrationNumber) !==
          unformatRegistrationNumber(registrationNumber)
      )
    );
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
            insuranceExpiryDate: data.insuranceExpiryDate ?? v.insuranceExpiryDate,
            pollutionExpiryDate: data.pollutionExpiryDate ?? v.pollutionExpiryDate,
          };
        }
        return v;
      })
    );
    toast.success(`Driver & Maintenance details saved for ${formatRegistrationNumber(registrationNumber)}`, {
      position: "bottom-right",
      autoClose: 3000,
    });
  };

  const handleNextStep = async () => {
    const errors = validateStep(currentStep, { commonInfo, vehicles, techSpecs, vehicleDescription });
    if (Object.keys(errors).length > 0) {
      setStepErrors(errors);
      toast.error(Object.values(errors)[0], { position: "bottom-right", autoClose: 3000 });
      return;
    }
    setStepErrors({});
    const success = await saveCurrentStep(currentStep, currentStep + 1);
    if (!success && currentStep !== 1) return;
    if (currentStep === 1 && !currentEditingGroupId) return;
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const validateForm = () => {
    const errors = {};
    if (!commonInfo.vehicleType) errors.vehicleType = "Vehicle Type is required";
    if (vehicles.length === 0) errors.vehicles = "At least one vehicle is required";
    if (!pricing.costPerDay) errors.costPerDay = "Base Cost is required";
    const currentYear = new Date().getFullYear();
    for (const vehicle of vehicles) {
      if (vehicle.manufacturingYear) {
        const yearNum = parseInt(vehicle.manufacturingYear);
        if (isNaN(yearNum) || yearNum > currentYear) {
          errors.manufacturingYear = `Manufacturing year must be ${currentYear} or earlier`;
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
    if (currentStep !== 4) {
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
        registrationVehicles: vehicles.map((v) => ({
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
      Object.keys(mediaFiles).forEach((key) => {
        if (mediaFiles[key] instanceof File) formData.append(key, mediaFiles[key]);
      });

      let response;
      if (currentEditingGroupId) {
        response = await axios.put(
          `${baseUrl}/api/updateVehicle/${currentEditingGroupId}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        response = await axios.post(`${baseUrl}/api/createVehicle`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (response.data.success) {
        toast.success("Onboarding completed successfully!", { position: "bottom-right", autoClose: 3000 });
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      toast.error("Submission failed", { position: "bottom-right", autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  // CHANGE A: mediaItems now use Lucide icon components instead of emoji strings
  const mediaItems = [
    { key: "frontViewImage", label: "Front View", icon: <Camera size={32} />, accept: "image/*" },
    { key: "leftSideImage", label: "Left Side View", icon: <Camera size={32} />, accept: "image/*" },
    { key: "rightSideImage", label: "Right Side View", icon: <Camera size={32} />, accept: "image/*" },
    { key: "rearViewImage", label: "Rear View", icon: <Camera size={32} />, accept: "image/*" },
    { key: "interiorImage", label: "Interior", icon: <Camera size={32} />, accept: "image/*" },
    { key: "demoVideo", label: "Demo Video", icon: <Film size={32} />, accept: "video/*" },
  ];

  const getSelectOptions = () => ({
    ...AdminSelectOptions,
    vehicleTypeOptions: vehicleTypes.map((vt) => ({
      value: vt._id,
      label: vt.typeName,
    })),
  });
  const selectOptions = getSelectOptions();

  const handleInputChange = (setter, field) => (e) => {
    setter((prev) => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ToastContainer position="bottom-right" />

      <div className="px-6 pt-6">
        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <Activity size={14} /> Dashboard &gt; Vehicle Management &gt; Onboarding
        </div>
      </div>

      <div className="px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Truck size={24} className="text-blue-600" />
          Vehicle Onboarding Management
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Add and manage your advertising vehicles with complete details
        </p>
      </div>

      {/* Modals */}
      <AddVehicleModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingVehicle(null); }}
        onSave={handleAddVehicle}
        editingVehicle={editingVehicle}
        existingRegNumbers={vehicles.map((v) => v.registrationNumber)}
        onCheckDuplicate={checkDuplicateRegistration}
        vehicleTypes={vehicleTypes}
      />
      <MaintenanceModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => { setIsMaintenanceModalOpen(false); setSelectedVehicle(null); }}
        vehicle={selectedVehicle}
        onSave={handleSaveMaintenance}
      />
      <VehicleTypeModal
        isOpen={isTypeModalOpen}
        onClose={() => { setIsTypeModalOpen(false); setEditingType(null); }}
        onSave={createVehicleType}
        onUpdate={updateVehicleType}
        onDelete={deleteVehicleType}
        editingType={editingType}
        vehicleTypes={vehicleTypes}
        setEditingType={setEditingType}
      />

      <form onSubmit={handleSubmit}>
        <div className="px-6 pb-10">
          <StepperHeader
            steps={steps}
            currentStep={currentStep}
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
                {/* CHANGE A: emoji replaced with Lucide ClipboardList icon */}
                <SectionHeader number={1} title="Basic Information" icon={<ClipboardList size={18} />} />
                <button
                  type="button"
                  onClick={() => setIsTypeModalOpen(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Settings size={14} /> Manage Vehicle Types
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>
                    <span className="flex items-center gap-1"><Settings size={14} /> Customized <span className="text-red-500">*</span></span>
                  </Label>
                  <div className="relative">
                    <Select
                      options={selectOptions.customizedVehiclesOptions}
                      placeholder="Select"
                      value={commonInfo.customizedType}
                      onChange={(value) => setCommonInfo((prev) => ({ ...prev, customizedType: value }))}
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <ChevronDown size={16} />
                    </span>
                  </div>
                </div>

                <div>
                  <Label>
                    <span className="flex items-center gap-1"><Truck size={14} /> Vehicle Type <span className="text-red-500">*</span></span>
                  </Label>
                  <div className="relative">
                    <Select
                      options={selectOptions.vehicleTypeOptions}
                      placeholder="Select Type"
                      value={commonInfo.vehicleType}
                      onChange={(value) => {
                        const typeName = vehicleTypes.find((t) => t._id === value)?.typeName || "";
                        setCommonInfo((prev) => ({ ...prev, vehicleType: value, vehicleName: typeName }));
                      }}
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <ChevronDown size={16} />
                    </span>
                  </div>
                  {stepErrors.vehicleType && <p className="text-red-500 text-xs mt-1">{stepErrors.vehicleType}</p>}
                  <p className="mt-1 text-xs text-gray-400">
                    Selecting a vehicle type will auto-fill technical specs and existing vehicles if previously configured
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Hash size={16} /> Registration Numbers <span className="text-red-500">*</span>
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
                          <th className="px-4 py-3 text-left">Fuel</th>
                          <th className="px-4 py-3 text-left">Status</th>
                          <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {vehicles.map((vehicle) => (
                          <tr key={vehicle.registrationNumber} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-semibold text-blue-700">
                              {formatRegistrationNumber(vehicle.registrationNumber)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{vehicle.vehicleId}</td>
                            <td className="px-4 py-3">{vehicle.city}</td>
                            <td className="px-4 py-3">{vehicle.fuelType}</td>
                            <td className="px-4 py-3">
                              <StatusBadge status={vehicle.currentStatus || "Available"} />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex justify-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => handleEditVehicle(vehicle)}
                                  className="text-blue-500 hover:text-blue-700"
                                  title="Edit"
                                >
                                  <PenLine size={16} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteVehicle(vehicle.registrationNumber)}
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
                    <Truck size={40} className="mx-auto mb-2 opacity-40" />
                    <p>No vehicles added yet</p>
                  </div>
                )}

                {commonInfo.vehicleType ? (
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <Plus size={16} />
                    Add Another Vehicle
                  </button>
                ) : (
                  <p className="mt-4 text-sm text-gray-400">Select a Vehicle Type first</p>
                )}
                {stepErrors.vehicles && <p className="text-red-500 text-xs mt-1">{stepErrors.vehicles}</p>}
              </div>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {currentStep === 2 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              {/* CHANGE A: emoji replaced with Monitor icon */}
              <SectionHeader number={2} title="Technical Specifications" icon={<Monitor size={18} />} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label>Screen Type <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Select
                      options={selectOptions.screenTypeOptions}
                      placeholder="Select"
                      value={techSpecs.screenType}
                      onChange={(value) => setTechSpecs((prev) => ({
                        ...prev,
                        screenType: value,
                        // Flex Height/Width only apply to "Flex + LED" — clear
                        // them immediately on switching away so a stale value
                        // never stays attached to a non-Flex+LED vehicle.
                        ...(value !== "Flex + LED" ? { flexHeight: "", flexWidth: "" } : {}),
                      }))}
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <ChevronDown size={16} />
                    </span>
                  </div>
                  {stepErrors.screenType && <p className="mt-1 text-xs text-red-500">{stepErrors.screenType}</p>}
                </div>

                <div>
                  <Label>Number of Screens <span className="text-red-500">*</span></Label>
                  <RadioGroup
                    options={selectOptions.numberOfScreensOptions}
                    value={techSpecs.numberOfScreens}
                    onChange={(value) =>
                      setTechSpecs((prev) => ({
                        ...prev,
                        numberOfScreens: value,
                        // Each screen-count option reads its own dedicated fields
                        // (1/2/3 screens use different field names), so switching
                        // between them just shows/hides sections — no reset needed,
                        // values already entered for any option are preserved.
                      }))
                    }
                  />
                  {stepErrors.numberOfScreens && <p className="mt-1 text-xs text-red-500">{stepErrors.numberOfScreens}</p>}
                </div>

                {/* ── Flex Height/Width: shown only for Screen Type = "Flex + LED" ── */}
                {techSpecs.screenType === "Flex + LED" && (
                  <>
                    <div>
                      <Label>Flex Height <span className="text-red-500">*</span></Label>
                      <Input
                        value={techSpecs.flexHeight}
                        placeholder="Enter flex height"
                        onChange={(e) => { if (validateNumber(e.target.value, true)) setTechSpecs((prev) => ({ ...prev, flexHeight: e.target.value })); }}
                      />
                      {stepErrors.flexHeight && <p className="mt-1 text-xs text-red-500">{stepErrors.flexHeight}</p>}
                    </div>
                    <div>
                      <Label>Flex Width <span className="text-red-500">*</span></Label>
                      <Input
                        value={techSpecs.flexWidth}
                        placeholder="Enter flex width"
                        onChange={(e) => { if (validateNumber(e.target.value, true)) setTechSpecs((prev) => ({ ...prev, flexWidth: e.target.value })); }}
                      />
                      {stepErrors.flexWidth && <p className="mt-1 text-xs text-red-500">{stepErrors.flexWidth}</p>}
                    </div>
                  </>
                )}

                {/* ── CHANGE B: Dynamic screen fields based on numberOfScreens ── */}

                {/* ── 1 Screen: Back screen only ── */}
                {techSpecs.numberOfScreens === "1" && (
                  <>
                    <div>
                      <Label>Back Screen Size (ft) <span className="text-red-500">*</span></Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          type="text"
                          value={techSpecs.singleBackScreenWidth}
                          placeholder="Width"
                          className="flex-1"
                          onChange={(e) => { if (validateNumber(e.target.value, true)) setTechSpecs((prev) => ({ ...prev, singleBackScreenWidth: e.target.value })); }}
                        />
                        <span className="text-gray-500">x</span>
                        <Input
                          type="text"
                          value={techSpecs.singleBackScreenHeight}
                          placeholder="Height"
                          className="flex-1"
                          onChange={(e) => { if (validateNumber(e.target.value, true)) setTechSpecs((prev) => ({ ...prev, singleBackScreenHeight: e.target.value })); }}
                        />
                      </div>
                      {stepErrors.backScreenSize && <p className="mt-1 text-xs text-red-500">{stepErrors.backScreenSize}</p>}
                    </div>

                    <div>
                      <Label>Back Resolution (px) <span className="text-red-500">*</span></Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          type="text"
                          value={techSpecs.singleBackResolutionWidth}
                          placeholder="Width (px)"
                          className="flex-1"
                          onChange={(e) => { if (validateNumber(e.target.value, false)) setTechSpecs((prev) => ({ ...prev, singleBackResolutionWidth: e.target.value })); }}
                        />
                        <span className="text-gray-500">x</span>
                        <Input
                          type="text"
                          value={techSpecs.singleBackResolutionHeight}
                          placeholder="Height (px)"
                          className="flex-1"
                          onChange={(e) => { if (validateNumber(e.target.value, false)) setTechSpecs((prev) => ({ ...prev, singleBackResolutionHeight: e.target.value })); }}
                        />
                      </div>
                      {stepErrors.backResolution && <p className="mt-1 text-xs text-red-500">{stepErrors.backResolution}</p>}
                    </div>
                  </>
                )}

                {/* ── 2 Screens: Left + Right separately, no back ── */}
                {techSpecs.numberOfScreens === "2" && (
                  <>
                    <div>
                      <Label>Left Screen Size (ft) <span className="text-red-500">*</span></Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          type="text"
                          value={techSpecs.leftScreenWidth}
                          placeholder="Width"
                          className="flex-1"
                          onChange={(e) => { if (validateNumber(e.target.value, true)) setTechSpecs((prev) => ({ ...prev, leftScreenWidth: e.target.value })); }}
                        />
                        <span className="text-gray-500">x</span>
                        <Input
                          type="text"
                          value={techSpecs.leftScreenHeight}
                          placeholder="Height"
                          className="flex-1"
                          onChange={(e) => { if (validateNumber(e.target.value, true)) setTechSpecs((prev) => ({ ...prev, leftScreenHeight: e.target.value })); }}
                        />
                      </div>
                      {stepErrors.leftScreenSize && <p className="mt-1 text-xs text-red-500">{stepErrors.leftScreenSize}</p>}
                    </div>

                    <div>
                      <Label>Left Screen Resolution (px) <span className="text-red-500">*</span></Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          type="text"
                          value={techSpecs.leftResolutionWidth}
                          placeholder="Width (px)"
                          className="flex-1"
                          onChange={(e) => { if (validateNumber(e.target.value, false)) setTechSpecs((prev) => ({ ...prev, leftResolutionWidth: e.target.value })); }}
                        />
                        <span className="text-gray-500">x</span>
                        <Input
                          type="text"
                          value={techSpecs.leftResolutionHeight}
                          placeholder="Height (px)"
                          className="flex-1"
                          onChange={(e) => { if (validateNumber(e.target.value, false)) setTechSpecs((prev) => ({ ...prev, leftResolutionHeight: e.target.value })); }}
                        />
                      </div>
                      {stepErrors.leftResolution && <p className="mt-1 text-xs text-red-500">{stepErrors.leftResolution}</p>}
                    </div>

                    <div>
                      <Label>Right Screen Size (ft) <span className="text-red-500">*</span></Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          type="text"
                          value={techSpecs.rightScreenWidth}
                          placeholder="Width"
                          className="flex-1"
                          onChange={(e) => { if (validateNumber(e.target.value, true)) setTechSpecs((prev) => ({ ...prev, rightScreenWidth: e.target.value })); }}
                        />
                        <span className="text-gray-500">x</span>
                        <Input
                          type="text"
                          value={techSpecs.rightScreenHeight}
                          placeholder="Height"
                          className="flex-1"
                          onChange={(e) => { if (validateNumber(e.target.value, true)) setTechSpecs((prev) => ({ ...prev, rightScreenHeight: e.target.value })); }}
                        />
                      </div>
                      {stepErrors.rightScreenSize && <p className="mt-1 text-xs text-red-500">{stepErrors.rightScreenSize}</p>}
                    </div>

                    <div>
                      <Label>Right Screen Resolution (px) <span className="text-red-500">*</span></Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          type="text"
                          value={techSpecs.rightResolutionWidth}
                          placeholder="Width (px)"
                          className="flex-1"
                          onChange={(e) => { if (validateNumber(e.target.value, false)) setTechSpecs((prev) => ({ ...prev, rightResolutionWidth: e.target.value })); }}
                        />
                        <span className="text-gray-500">x</span>
                        <Input
                          type="text"
                          value={techSpecs.rightResolutionHeight}
                          placeholder="Height (px)"
                          className="flex-1"
                          onChange={(e) => { if (validateNumber(e.target.value, false)) setTechSpecs((prev) => ({ ...prev, rightResolutionHeight: e.target.value })); }}
                        />
                      </div>
                      {stepErrors.rightResolution && <p className="mt-1 text-xs text-red-500">{stepErrors.rightResolution}</p>}
                    </div>
                  </>
                )}

                {/* ── 3 Screens: Shared Left/Right + Back ── */}
                {techSpecs.numberOfScreens === "3" && (
                  <>
                    <div>
                      <Label>Left/Right Screen Size (ft) <span className="text-red-500">*</span></Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          type="text"
                          value={techSpecs.leftRightScreenWidth}
                          placeholder="Width"
                          className="flex-1"
                          onChange={(e) => { if (validateNumber(e.target.value, true)) setTechSpecs((prev) => ({ ...prev, leftRightScreenWidth: e.target.value })); }}
                        />
                        <span className="text-gray-500">x</span>
                        <Input
                          type="text"
                          value={techSpecs.leftRightScreenHeight}
                          placeholder="Height"
                          className="flex-1"
                          onChange={(e) => { if (validateNumber(e.target.value, true)) setTechSpecs((prev) => ({ ...prev, leftRightScreenHeight: e.target.value })); }}
                        />
                      </div>
                      {stepErrors.leftRightScreenSize && <p className="mt-1 text-xs text-red-500">{stepErrors.leftRightScreenSize}</p>}
                    </div>

                    <div>
                      <Label>Left/Right Resolution (px) <span className="text-red-500">*</span></Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          type="text"
                          value={techSpecs.leftRightResolutionWidth}
                          placeholder="Width (px)"
                          className="flex-1"
                          onChange={(e) => { if (validateNumber(e.target.value, false)) setTechSpecs((prev) => ({ ...prev, leftRightResolutionWidth: e.target.value })); }}
                        />
                        <span className="text-gray-500">x</span>
                        <Input
                          type="text"
                          value={techSpecs.leftRightResolutionHeight}
                          placeholder="Height (px)"
                          className="flex-1"
                          onChange={(e) => { if (validateNumber(e.target.value, false)) setTechSpecs((prev) => ({ ...prev, leftRightResolutionHeight: e.target.value })); }}
                        />
                      </div>
                      {stepErrors.leftRightResolution && <p className="mt-1 text-xs text-red-500">{stepErrors.leftRightResolution}</p>}
                    </div>

                    <div>
                      <Label>Back Screen Size (ft)</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          type="text"
                          value={techSpecs.backScreenWidth}
                          placeholder="Width"
                          className="flex-1"
                          onChange={(e) => { if (validateNumber(e.target.value, true)) setTechSpecs((prev) => ({ ...prev, backScreenWidth: e.target.value })); }}
                        />
                        <span className="text-gray-500">x</span>
                        <Input
                          type="text"
                          value={techSpecs.backScreenHeight}
                          placeholder="Height"
                          className="flex-1"
                          onChange={(e) => { if (validateNumber(e.target.value, true)) setTechSpecs((prev) => ({ ...prev, backScreenHeight: e.target.value })); }}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Back Resolution (px)</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          type="text"
                          value={techSpecs.backResolutionWidth}
                          placeholder="Width (px)"
                          className="flex-1"
                          onChange={(e) => { if (validateNumber(e.target.value, false)) setTechSpecs((prev) => ({ ...prev, backResolutionWidth: e.target.value })); }}
                        />
                        <span className="text-gray-500">x</span>
                        <Input
                          type="text"
                          value={techSpecs.backResolutionHeight}
                          placeholder="Height (px)"
                          className="flex-1"
                          onChange={(e) => { if (validateNumber(e.target.value, false)) setTechSpecs((prev) => ({ ...prev, backResolutionHeight: e.target.value })); }}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* ── Common fields always shown ── */}
                <div>
                  <Label>Audio Output (Watts) <span className="text-red-500">*</span></Label>
                  <Input
                    type="text"
                    value={techSpecs.audioOutput}
                    placeholder="e.g., 600"
                    onChange={(e) => { if (validateNumber(e.target.value, true)) setTechSpecs((prev) => ({ ...prev, audioOutput: e.target.value })); }}
                  />
                  {stepErrors.audioOutput && <p className="mt-1 text-xs text-red-500">{stepErrors.audioOutput}</p>}
                </div>

                <div>
                  <Label>Generator Capacity (KVA) <span className="text-red-500">*</span></Label>
                  <Input
                    type="text"
                    value={techSpecs.generatorCapacity}
                    placeholder="e.g., 7 KV"
                    onChange={(e) => { if (validateNumber(e.target.value, false)) setTechSpecs((prev) => ({ ...prev, generatorCapacity: e.target.value })); }}
                  />
                  {stepErrors.generatorCapacity && <p className="mt-1 text-xs text-red-500">{stepErrors.generatorCapacity}</p>}
                </div>

                <div>
                  <Label>Display Version / Controller <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Select
                      options={selectOptions.displayVersionOptions}
                      placeholder="Select Display Version"
                      value={techSpecs.displayVersion}
                      onChange={(value) => setTechSpecs((prev) => ({ ...prev, displayVersion: value }))}
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <ChevronDown size={16} />
                    </span>
                  </div>
                  {stepErrors.displayVersion && <p className="mt-1 text-xs text-red-500">{stepErrors.displayVersion}</p>}
                </div>

                <div>
                  <Label>Brightness (Nits)</Label>
                  <Input
                    type="text"
                    value={techSpecs.brightness}
                    placeholder="e.g. 5500"
                    onChange={(e) => { if (validateNumber(e.target.value, false)) setTechSpecs((prev) => ({ ...prev, brightness: e.target.value })); }}
                  />
                </div>

                {/* CHANGE C: Sound Quality field REMOVED */}
                {/* soundQuality field was here — removed as per 22/05/2026 requirement */}
                {/* <div>
                  <Label>Sound Quality <span className="text-red-500">*</span></Label>
                  <Select options={selectOptions.soundQualityOptions} ... />
                </div> */}
              </div>

              <button
                type="button"
                onClick={() => setShowMoreTech(!showMoreTech)}
                className="mt-6 text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
              >
                <Layers size={16} />
                {showMoreTech ? "Show Less Options" : "Show More Technical Options"}
              </button>

              {showMoreTech && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mt-6 pt-6 border-t">
                  <div className="md:col-span-2">
                    <Label>Additional Features</Label>
                    <Input
                      placeholder="e.g. Built-in Amplifier, USB, WiFi"
                      value={techSpecs.additionalFeatures}
                      onChange={(e) => setTechSpecs((prev) => ({ ...prev, additionalFeatures: e.target.value }))}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3 ── */}
          {currentStep === 3 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              {/* CHANGE A: emoji replaced with Film icon */}
              <SectionHeader number={3} title="Media & Description" icon={<Film size={18} />} />

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
                  <span className="flex items-center gap-1">
                    <FileText size={14} /> Vehicle Description <span className="text-red-500">*</span>
                  </span>
                </Label>
                <textarea
                  rows={4}
                  className="w-full mt-1 rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                  placeholder="Enter detailed description about the vehicle..."
                  value={vehicleDescription}
                  onChange={(e) => setVehicleDescription(e.target.value)}
                />
                {stepErrors.vehicleDescription && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertTriangle size={12} /> {stepErrors.vehicleDescription}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 4 ── */}
          {currentStep === 4 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              {/* CHANGE A: emoji replaced with BarChart2 icon */}
              <SectionHeader number={4} title="Vehicle Summary" icon={<BarChart2 size={18} />} />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 flex items-center gap-1"><Truck size={14} /> Total Vehicles</p>
                  <p className="text-2xl font-bold text-blue-600">{vehicles.length}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-100">
                  <p className="text-sm text-gray-500 flex items-center gap-1"><Layers size={14} /> Vehicle Type</p>
                  <p className="text-lg font-semibold text-purple-600">
                    {vehicleTypes.find((vt) => vt._id === commonInfo.vehicleType)?.typeName || "Not selected"}
                  </p>
                </div>
              </div>

              {vehicles.length > 0 && (
                <div className="mt-6">
                  <Label className="font-semibold flex items-center gap-2">
                    <Hash size={16} /> Vehicles to be onboarded:
                  </Label>
                  <div className="mt-2 space-y-2">
                    {vehicles.map((v, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm p-3 bg-gray-50 rounded-lg">
                        <span className="w-6 text-gray-400">{idx + 1}.</span>
                        <span className="font-mono font-semibold text-blue-600">
                          {formatRegistrationNumber(v.registrationNumber)}
                        </span>
                        <span className="text-gray-400">—</span>
                        <span className="text-gray-600">{v.city}</span>
                        <span className="text-gray-400">·</span>
                        <span className="text-gray-500">{v.fuelType}</span>
                        <span className="ml-auto">
                          <StatusBadge status={v.currentStatus || "Available"} />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg flex items-start gap-2">
                <AlertTriangle size={16} className="text-yellow-600 mt-0.5 shrink-0" />
                <p className="text-sm text-yellow-800">
                  Please review all details before submitting. Click the Submit button below to save all vehicles.
                </p>
              </div>
            </div>
          )}

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
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <X size={16} /> Cancel
            </button>
            <div className="flex gap-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    if (currentStep === 3) {
                      // Discard any unsaved Vehicle Description edit —
                      // only the last actually-saved value should persist.
                      setVehicleDescription(savedVehicleDescription);
                    }
                    const prev = currentStep - 1;
                    currentStepRef.current = prev;
                    setCurrentStep(prev);
                  }}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <ChevronLeft size={16} /> Previous
                </button>
              )}
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
                >
                  <Save size={16} /> Save & Next <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !stepCompletionStatus[3]}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <CheckCircle2 size={16} />
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
