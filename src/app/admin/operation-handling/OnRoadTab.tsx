

import { useState } from "react";
import { X, User, Truck, Camera, UserCheck, MapPin, Clock, FileText, Eye, ZoomIn, AlertCircle, CheckCircle, Shield, Navigation } from "lucide-react";

interface Order {
    _id: string;
    orderId: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
    customerType?: number;
    pipelineStatus: string;
    handlerName?: string;
    updatedAt: string;
    createdAt: string;
    grandTotal: number;
    grandGst?: number;
    grandNegotiationTotal?: number;
    bookingItems: any[];
    negotiationLogs?: any[];
    pipelineLogs: any[];
    projectCodeArray?: any[];
    projectExecutionArray?: any[];
    onRoadExecutionArray?: any[];
    projectMailLogs?: any[];
    isAdminCreated?: boolean;
    companyName?: string;
    clientName?: string;
    designation?: string;
    gstNumber?: string;
    customerCategory?: string;
}


const getFileUrl = (p: string) => {
    if (!p) return "";
    if (p.startsWith("http")) return p;
    return `http://localhost:3001${p.startsWith("/") ? p : `/${p}`}`;
};


export default function OnRoadTab({ order }: { order: Order }) {
    const entries = order.onRoadExecutionArray || [];

    if (entries.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center mb-6 shadow-inner">
                        <Truck className="w-10 h-10 text-gray-400 dark:text-gray-600" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                        <X className="w-3 h-3 text-gray-500" />
                    </div>
                </div>
                <p className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    No On Road Details
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center max-w-xs leading-relaxed">
                    On Road execution details will appear here once the vehicle is dispatched from the Project Execution stage.
                </p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header Stats */}
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Truck className="w-5 h-5 text-sky-500" />
                        Vehicle Records
                    </h3>
                 
                </div>
            </div>

            {entries.map((entry: any, idx: number) => (
                <div
                    key={entry._id || idx}
                    className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-blue-600" />

                 
                    <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                                    {idx + 1}
                                </div>
                                {idx === entries.length - 1 && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-900 animate-pulse" />
                                )}
                            </div>
                            {/* <div>
                                <span className="text-sm font-bold text-gray-800 dark:text-white">
                                    Dispatch #{idx + 1}
                                </span>
                                {idx === entries.length - 1 && (
                                    <span className="ml-2 text-[10px] font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                                        Latest
                                    </span>
                                )}
                            </div> */}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(entry.uploadedAt).toLocaleString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })}</span>
                        </div>
                    </div>

                  
                    <div className="p-6">
                      
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          
                            <div className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30 rounded-xl p-4 border border-sky-200 dark:border-sky-800">
                                <div className="flex items-center gap-2 mb-3">
                                    <User className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                                    <span className="text-sm font-semibold text-sky-700 dark:text-sky-300 uppercase tracking-wide">
                                        Driver Information
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Full Name</span>
                                        <span className="text-md font-semibold text-gray-900 dark:text-white">
                                            {entry.driverName || "—"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Primary Phone</span>
                                        <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">
                                            {entry.driverPhone || "—"}
                                        </span>
                                    </div>
                                    {entry.driverAlternatePhone && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Alternate Phone</span>
                                            <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">
                                                {entry.driverAlternatePhone}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                         
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                                <div className="flex items-center gap-2 mb-3">
                                    <Truck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    <span className="text-sm font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide">
                                        Vehicle Information
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Registration Number</span>
                                        <span className="text-sm font-bold font-mono text-purple-700 dark:text-purple-400">
                                            {entry.vehicleRegistrationNumber || "—"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                       
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                            <UserCheck className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Recorded by: <span className="font-medium text-gray-700 dark:text-gray-300">{entry.uploadedBy || "System"}</span>
                            </span>
                        </div>

                      
                        {(entry.gatepassPhoto ||
                            entry.vehicleFrontPhoto ||
                            entry.vehicleBackPhoto ||
                            entry.vehicleLeftPhoto ||
                            entry.vehicleRightPhoto) && (
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Camera className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                        Vehicle Documentation
                                    </span>
                                    <span className="text-[13px] text-gray-400">({[
                                        entry.gatepassPhoto, entry.vehicleFrontPhoto, entry.vehicleBackPhoto,
                                        entry.vehicleLeftPhoto, entry.vehicleRightPhoto
                                    ].filter(Boolean).length} photos)</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                    {entry.gatepassPhoto && (
                                        <PhotoCard url={getFileUrl(entry.gatepassPhoto)} label="Gate Pass" icon={<FileText className="w-4 h-4" />} />
                                    )}
                                    {entry.vehicleFrontPhoto && (
                                        <PhotoCard url={getFileUrl(entry.vehicleFrontPhoto)} label="Front View" icon={<Navigation className="w-4 h-4" />} />
                                    )}
                                    {entry.vehicleBackPhoto && (
                                        <PhotoCard url={getFileUrl(entry.vehicleBackPhoto)} label="Rear View" icon={<Shield className="w-4 h-4" />} />
                                    )}
                                    {entry.vehicleLeftPhoto && (
                                        <PhotoCard url={getFileUrl(entry.vehicleLeftPhoto)} label="Left Side" icon={<Truck className="w-4 h-4" />} />
                                    )}
                                    {entry.vehicleRightPhoto && (
                                        <PhotoCard url={getFileUrl(entry.vehicleRightPhoto)} label="Right Side" icon={<Truck className="w-4 h-4" />} />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}




function PhotoCard({ url, label, icon }: { url: string; label: string; icon?: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    if (!url) return null;

    return (
        <>
            <div
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="relative group cursor-pointer rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 hover:border-sky-400 dark:hover:border-sky-500 transition-all duration-200 shadow-sm hover:shadow-md"
            >
                <div className="aspect-square relative">
                    {isLoading && !hasError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                            <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                    <img
                        src={url}
                        alt={label}
                        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'
                            }`}
                        onLoad={() => setIsLoading(false)}
                        onError={(e) => {
                            setIsLoading(false);
                            setHasError(true);
                            console.error("Image load failed:", url);
                            (e.target as HTMLImageElement).style.display = "none";
                        }}
                        onClick={() => setIsOpen(true)}
                    />
                    {hasError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800">
                            {icon ? icon : <Camera className="w-6 h-6 text-gray-400 mb-1" />}
                            <span className="text-[10px] text-gray-400 mt-1">Failed to load</span>
                        </div>
                    )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-2">
                    <span className="text-[11px] font-medium text-white flex items-center justify-center gap-1">
                        {icon && <span className="inline-flex">{icon}</span>}
                        {label}
                    </span>
                </div>
                
               
                {showTooltip && !hasError && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                        <button
                            onClick={() => setIsOpen(true)}
                            className="bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-all duration-200 transform hover:scale-110"
                        >
                            <ZoomIn className="w-4 h-4 text-white" />
                        </button>
                        <a
                            href={url}
                            download
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-all duration-200 transform hover:scale-110"
                        >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                        </a>
                    </div>
                )}
                
                {/* Tooltip text */}
                {showTooltip && !hasError && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap pointer-events-none z-10">
                        Click to view or download
                    </div>
                )}
            </div>

          
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
                >
                    <div className="relative max-w-5xl w-full">
                        <img
                            src={url}
                            alt={label}
                            className="w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
                            onError={(e) => {
                                console.error("Preview image load failed:", url);
                            }}
                        />
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-3">
                            {icon && <span className="text-white">{icon}</span>}
                            <span className="text-sm text-white font-medium">{label}</span>
                            <a
                                href={url}
                                download
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="ml-2 bg-white/20 hover:bg-white/30 rounded-full p-1.5 transition-all duration-200"
                                title="Download image"
                            >
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                            </a>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all duration-200 backdrop-blur-sm hover:scale-110"
                    >
                        <X size={20} />
                    </button>
                </div>
            )}
        </>
    );
}