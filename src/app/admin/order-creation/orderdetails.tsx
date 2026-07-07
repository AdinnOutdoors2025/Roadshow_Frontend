
/* eslint-disable */
// @ts-nocheck

import { useRef, useState } from "react";
import {
    HiOutlineShoppingBag,
    HiOutlineEye,
    HiOutlineDocumentText,
    HiOutlineUser,
    HiOutlinePhone,
    HiOutlineMail,
    HiOutlineLocationMarker,
    HiOutlineTag,
    HiOutlineBriefcase,
    HiOutlineCalendar,
    HiOutlineMap,
    HiOutlineTruck,
    HiOutlineCurrencyRupee,
    HiOutlinePhotograph,
    HiOutlineVideoCamera,
    HiOutlineCreditCard,
    HiOutlineClipboardList,
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineX,
    HiOutlineOfficeBuilding,
    HiOutlineSparkles,
    HiOutlineInformationCircle,
    HiOutlineBadgeCheck,
    HiOutlineUserGroup,
} from "react-icons/hi";
import {
    HiOutlinePlus,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
} from "react-icons/hi2";


interface Order {
    _id: string;
    orderId: string;
    name: string;
    phone: string;
    address?: string;
    email?: string;
    grandTotal: number;
    orderStatus: "Pending" | "Confirmed" | "Cancelled";
    pipelineStatus: "newOrder" | "proposal" | "negotiation" | "closedWon" | "closedLoss";
    isAdminCreated?: boolean;
    bookingItems: BookingItem[];
    createdAt: string;
    handlername?: string;
    grandNegotiationTotal?: number;
    campaignType?: number
    grandGst?: number
    dailyKmcharges?: number
    customerType: number

}

interface BookingItem {
    vehicleModel: string;
    vehicleType: string;
    campaignType: string;
    otherCampaignType?: string;
    fromDate: string;
    toDate: string;
    state: string;
    city: string;
    quantity: number;
    totalDays: number;
    extraDays?: number;
    extraKm?: number;
    extraHours?: number;
    subtotal: number;
    gstAmount: number;
    totalAmount: number;
    needPromoter: boolean;
    fromLocation?: string;
    toLocation?: string;
    promoterType?: string;
    otherPromoterType?: string;
    promoterGender?: string;
    promoterLanguage?: string;
    promoterQuantity?: number;
    bookingFor?: string;
    gstNumber?: string;
    perDayRentalCost?: number;
    driverCharges?: number;
    promoterChargePerDay?: number;
    rtoCharges?: number;
    additionalHourCharges?: number;
    rentalCost?: number;
    driverCost?: number;
    promoterCost?: number;
    rtoCost?: number;
    extraKmCost?: number;
    extraHourCost?: number;
    campaignImages?: string[];
    campaignVideos?: string[];
    additionalCharges?: { id: string; label: string; amount: number; mode: "+" | "-" }[];
    additionalFields?: { id: string; label: string; amount: number; mode: "+" | "-" }[];
    dailyKmcharges?: number
}

const PIPELINE_CONFIG: Record<string, { label: string; color: string }> = {
    newOrder: { label: "New Order", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
    proposal: { label: "Proposal", color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" },
    negotiation: { label: "Negotiation", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
    closedWon: { label: "Closed Won", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
    closedLoss: { label: "Closed Loss", color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
};

const STATUS_CONFIG: Record<string, { color: string; dot: string }> = {
    Pending: { color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", dot: "bg-amber-400 animate-pulse" },
    Confirmed: { color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", dot: "bg-green-500" },
    Cancelled: { color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400", dot: "bg-red-400" },
};


export default function OrderDetailDrawer({
    order,
    onClose,
    vehicleTypes,
}: {
    order: Order;
    onClose: () => void;
    vehicleTypes: any;
}) {

    const [activeVehicleTab, setActiveVehicleTab] = useState(0);
    const tabScrollRef = useRef(null);

    const scrollTabs = (dir) => {
        if (tabScrollRef.current) {
            tabScrollRef.current.scrollBy({ left: dir * 150, behavior: "smooth" });
        }
    };

    const pipeline = PIPELINE_CONFIG[order.pipelineStatus] || {
        label: order.pipelineStatus,
        color: "bg-gray-100 text-gray-500",
    };
    const statusCfg = STATUS_CONFIG[order.orderStatus] || {
        color: "bg-gray-100 text-gray-500",
        dot: "bg-gray-400",
    };

    const displayTotal =
        order.grandNegotiationTotal && order.grandNegotiationTotal > 0
            ? order.grandNegotiationTotal
            : order.grandTotal;

    function formatINR(amount: number): string {
        return new Intl.NumberFormat("en-IN", {
            maximumFractionDigits: 0,
        }).format(amount);
    }

    function formatDate(d: string) {
        if (!d) return "—";
        return new Date(d).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    }


    const getImageUrl = (path: string) => {
        if (!path) return "";
        if (path.startsWith("http")) return path;
        return `http://localhost:3001${path.startsWith("/") ? path : `/${path}`}`;
    };

    const getVehicleTypeName = (vehicleTypeId: string) => {
        if (!vehicleTypeId || !vehicleTypes) return "";
        const vehicle = vehicleTypes.find((vt: any) => vt._id === vehicleTypeId);
        return vehicle?.typeName || vehicleTypeId;
    };

    const fmtDate = (d?: string): string => {
        if (!d) return "—";
        return new Date(d).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div
            className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="w-full max-w-2xl h-full overflow-y-auto bg-white shadow-2xl dark:bg-gray-900 flex flex-col animate-in slide-in-from-right duration-300">

                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-5 dark:border-gray-700 dark:bg-gray-900 shadow-sm">
                    <div>
                        <p className="font-mono text-base font-bold text-blue-600 dark:text-blue-400">
                            {order.orderId}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            {formatDate(order.createdAt)}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${statusCfg.color}`}
                        >
                            <span className={`h-2 w-2 rounded-full ${statusCfg.dot}`} />
                            {order.orderStatus}
                        </span>
                        <button
                            onClick={onClose}
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-all"
                        >
                            <HiOutlineX className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 px-6 py-6 space-y-6">

                    {/* Customer Information Section */}
                    <section>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="h-6 w-1 bg-blue-500 rounded-full"></div>
                            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                                Customer Information
                            </p>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 p-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Customer Information Fields - Only show if value exists */}
                                {order.name && (
                                    <div className="flex items-start gap-3 text-sm">
                                        <HiOutlineUser className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div className="flex-1 min-w-0">
                                            <span className="text-gray-500 block text-sm mb-0.5">Full Name</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200 text-sm break-words">
                                                {order.name}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {order.companyName && (
                                    <div className="flex items-start gap-3 text-sm">
                                        <HiOutlineOfficeBuilding className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div className="flex-1 min-w-0">
                                            <span className="text-gray-500 block text-sm mb-0.5">Company Name</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200 text-sm break-words">
                                                {order.companyName}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {order.designation && (
                                    <div className="flex items-start gap-3 text-sm">
                                        <HiOutlineBriefcase className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div className="flex-1 min-w-0">
                                            <span className="text-gray-500 block text-sm mb-0.5">Designation</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200 text-sm break-words">
                                                {order.designation}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {order.gstNumber && (
                                    <div className="flex items-start gap-3 text-sm">
                                        <HiOutlineDocumentText className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div className="flex-1 min-w-0">
                                            <span className="text-gray-500 block text-sm mb-0.5">GST Number</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200 text-sm break-words">
                                                {order.gstNumber}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {order.phone && (
                                    <div className="flex items-start gap-3 text-sm">
                                        <HiOutlinePhone className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div className="flex-1 min-w-0">
                                            <span className="text-gray-500 block text-sm mb-0.5">Phone Number</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200 text-sm break-words">
                                                {order.phone}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {order.email && (
                                    <div className="flex items-start gap-3 text-sm">
                                        <HiOutlineMail className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div className="flex-1 min-w-0">
                                            <span className="text-gray-500 block text-sm mb-0.5">Email Address</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200 text-sm break-words">
                                                {order.email}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {order.address && (
                                    <div className="flex items-start gap-3 text-sm">
                                        <HiOutlineLocationMarker className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div className="flex-1 min-w-0">
                                            <span className="text-gray-500 block text-sm mb-0.5">Address</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200 text-sm break-words">
                                                {order.address}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Customer Type - Always shown */}
                                <div className="flex items-start gap-3 text-sm">
                                    <HiOutlineTag className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <span className="text-gray-500 block text-sm mb-0.5">Customer Type</span>
                                        <span
                                            className={`font-medium text-sm inline-flex items-center gap-2 ${order.customerType === 1
                                                ? "text-green-600 dark:text-green-400"
                                                : "text-blue-600 dark:text-blue-400"
                                                }`}
                                        >
                                            <span
                                                className={`w-2 h-2 rounded-full ${order.customerType === 1 ? "bg-green-500" : "bg-blue-500"
                                                    }`}
                                            ></span>
                                            {order.customerType === 1 ? "Organization" : "Individual"}
                                        </span>
                                    </div>
                                </div>

                                {/* Assigned Handler - Conditional */}
                                {order.handlername && (
                                    <div className="flex items-start gap-3 text-sm">
                                        <HiOutlineUserGroup className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div className="flex-1 min-w-0">
                                            <span className="text-gray-500 block text-sm mb-0.5">Assigned Handler</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                                                {order.handlername}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Order Source - Conditional */}
                                {order.isAdminCreated && (
                                    <div className="flex items-start gap-3 text-sm">
                                        <HiOutlineBadgeCheck className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div className="flex-1 min-w-0">
                                            <span className="text-gray-500 block text-sm mb-0.5">Order Source</span>
                                            <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-2 py-1 rounded inline-block">
                                                Admin Created
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Vehicles Section */}
                    <section>

                        {/* Vehicle Tabs */}
                        <div className="relative flex items-center border-b border-gray-200 dark:border-gray-700 mb-4">
                            <button
                                type="button"
                                onClick={() => scrollTabs(-1)}
                                className="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            >
                                <HiOutlineChevronLeft className="w-4 h-4" />
                            </button>

                            <div
                                ref={tabScrollRef}
                                className="flex-1 flex items-center gap-6 overflow-x-auto scrollbar-hide scroll-smooth"
                            >
                                {(order.bookingItems || []).map((_, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => setActiveVehicleTab(i)}
                                        className={`whitespace-nowrap pb-2.5 pt-2 text-sm font-semibold transition-all border-b-2 -mb-px ${activeVehicleTab === i
                                            ? "border-blue-500 text-blue-600 dark:text-blue-400"
                                            : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                            }`}
                                    >
                                        {i + 1} vehicle
                                    </button>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={() => scrollTabs(1)}
                                className="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            >
                                <HiOutlineChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="h-6 w-1 bg-green-500 rounded-full"></div>
                            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                                Vehicles ({order.bookingItems?.length || 0})
                            </p>
                        </div>
                        <div className="space-y-4">
                            {(() => {
                                const item = (order.bookingItems || [])[activeVehicleTab];
                                const i = activeVehicleTab;
                                if (!item) return null;

                                const baseDays =
                                    item.fromDate && item.toDate
                                        ? Math.ceil(
                                            (new Date(item.toDate).getTime() -
                                                new Date(item.fromDate).getTime()) /
                                            86400000
                                        )
                                        : 0;
                                const extraDays = item.extraDays || 0;
                                const totalDays = baseDays + extraDays;

                                const durationLabel =
                                    item.fromDate && item.toDate
                                        ? `${formatDate(item.fromDate)} → ${formatDate(item.toDate)}`
                                        : "—";

                                return (
                                    <div
                                        key={i}
                                        className="rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 overflow-hidden"
                                    >
                                        {/* Vehicle Header */}
                                        <div className="bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800/50 p-4 border-b border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                                        V{i + 1}
                                                    </span>
                                                </div>
                                                <div className="flex-1">
                                                    {/* <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                                                        {item.vehicleModel || "Vehicle Details"}
                                                    </p> */}
                                                    {item.vehicleType && (
                                                        <p className="text-md text-gray-500 mt-0.5">
                                                            {getVehicleTypeName(item.vehicleType)}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500">Quantity</p>
                                                    <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                                        {item.quantity || 1}x
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Booking Details Grid */}
                                        <div className="p-4 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {[
                                                    {
                                                        icon: (
                                                            <HiOutlineTag className="w-4 h-4 text-gray-400" />
                                                        ),
                                                        label: "Campaign",
                                                        value:
                                                            item.campaignType === "Other"
                                                                ? item.otherCampaignType || "Other"
                                                                : item.campaignType || "—",
                                                    },
                                                    {
                                                        icon: (
                                                            <HiOutlineTag className="w-4 h-4 text-gray-400" />
                                                        ),
                                                        label: "Campaign Name",
                                                        value:
                                                            item.campaignName
                                                    },
                                                    {
                                                        icon: (
                                                            <HiOutlineCalendar className="w-4 h-4 text-gray-400" />
                                                        ),
                                                        label: "Duration",
                                                        value:
                                                            durationLabel && item.totalDays
                                                                ? `${durationLabel} (${item.totalDays} Days Total)`
                                                                : "—",
                                                    },
                                                    {
                                                        icon: (
                                                            <HiOutlineLocationMarker className="w-4 h-4 text-gray-400" />
                                                        ),
                                                        label: "Location",
                                                        value:
                                                            [item.state, item.city]
                                                                .filter(Boolean)
                                                                .join(" / ") || "—",
                                                    },
                                                    {
                                                        icon: (
                                                            <HiOutlineMap className="w-4 h-4 text-gray-400" />
                                                        ),
                                                        label: "Driving Route",
                                                        value:
                                                            item.fromLocation && item.toLocation
                                                                ? `${item.fromLocation} → ${item.toLocation}`
                                                                : "—",
                                                    },
                                                    item.extraKm && item.extraKm > 0
                                                        ? {
                                                            icon: (
                                                                <HiOutlinePlus className="w-4 h-4 text-gray-400" />
                                                            ),
                                                            label: "Extra KM",
                                                            value: `${item.extraKm} km`,
                                                        }
                                                        : null,
                                                    item.extraHours && item.extraHours > 0
                                                        ? {
                                                            icon: (
                                                                <HiOutlineClock className="w-4 h-4 text-gray-400" />
                                                            ),
                                                            label: "Extra Hours",
                                                            value: `${item.extraHours} hrs`,
                                                        }
                                                        : null,
                                                    item.extraDays && item.extraDays > 0
                                                        ? {
                                                            icon: (
                                                                <HiOutlineCalendar className="w-4 h-4 text-gray-400" />
                                                            ),
                                                            label: "Extra Days",
                                                            value: `${item.extraDays} days`,
                                                        }
                                                        : null,
                                                ]
                                                    .filter(Boolean)
                                                    .map((field: any, idx) => (
                                                        <div key={idx} className="flex items-start gap-2">
                                                            <span className="mt-0.5">{field.icon}</span>
                                                            <div className="flex-1">
                                                                <span className="text-gray-500 block text-sm">
                                                                    {field.label}
                                                                </span>
                                                                <span className="text-gray-800 dark:text-gray-200 font-medium text-sm">
                                                                    {field.value}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>

                                            {/* Promoter Details */}
                                            {item.needPromoter && (
                                                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                                                    <p className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-2">
                                                        <HiOutlineUser className="w-4 h-4" />
                                                        Promoter Details
                                                    </p>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <span className="text-gray-500 block text-sm">
                                                                Type
                                                            </span>
                                                            <span className="text-gray-800 dark:text-gray-200 text-sm">
                                                                {item.promoterType === "Other"
                                                                    ? item.otherPromoterType || "Other"
                                                                    : item.promoterType || "—"}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500 block text-sm">
                                                                Gender
                                                            </span>
                                                            <span className="text-gray-800 dark:text-gray-200 text-sm">
                                                                {item.promoterGender || "—"}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500 block text-sm pb-[4px]">
                                                                Language
                                                            </span>

                                                            <span className="text-gray-800 dark:text-gray-200 text-sm flex gap-2 flex-wrap">
                                                                {(() => {
                                                                    let langs = item.promoterLanguage;

                                                                    // If array → use it directly
                                                                    if (Array.isArray(langs)) {
                                                                        return langs;
                                                                    }

                                                                    // If string and has commas
                                                                    if (typeof langs === "string") {
                                                                        if (langs.includes(",")) {
                                                                            return langs.split(",");
                                                                        }

                                                                        // Split based on capital letters (TeluguEnglish → Telugu English)
                                                                        return langs.replace(/([a-z])([A-Z])/g, "$1 $2").split(" ");
                                                                    }

                                                                    return ["—"];
                                                                })().map((lang, index) => (
                                                                    <span
                                                                        key={index}
                                                                        className="px-2 py-1 rounded-full border border-gray-400 text-xs"
                                                                    >
                                                                        {lang}
                                                                    </span>
                                                                ))}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500 block text-sm">
                                                                Quantity
                                                            </span>
                                                            <span className="text-gray-800 dark:text-gray-200 text-sm">
                                                                {item.promoterQuantity || 0}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {item.gstNumber && (
                                                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                                                    <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 mb-1 flex items-center gap-2">
                                                        <HiOutlineDocumentText className="w-4 h-4" />
                                                        GST Information
                                                    </p>
                                                    <p className="text-gray-800 dark:text-gray-200 text-sm">
                                                        GST Number: {item.gstNumber}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Pricing Breakdown */}
                                            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                                    <HiOutlineCurrencyRupee className="w-4 h-4" />
                                                    Price Breakdown
                                                </p>
                                                <div className="space-y-2">
                                                    {item.rentalCost ? (
                                                        <div className="flex justify-between items-center py-1">
                                                            <span className="text-gray-600 dark:text-gray-400 text-sm">
                                                                Rental
                                                            </span>
                                                            <span className="text-gray-800 dark:text-gray-200 font-medium text-sm ">
                                                                ₹{(item.rentalCost || 0).toLocaleString("en-IN")}
                                                            </span>
                                                        </div>
                                                    ) : null}

                                                    {(item.promoterCost ?? 0) > 0 && (
                                                        <div className="flex justify-between items-center py-1">
                                                            <span className="text-gray-600 dark:text-gray-400 text-sm">
                                                                Promoter Charges ({item.totalDays}D × ₹
                                                                {item.promoterChargePerDay?.toLocaleString(
                                                                    "en-IN"
                                                                )}{" "}
                                                                × {item.promoterQuantity})
                                                            </span>
                                                            <span className="text-gray-800 dark:text-gray-200 font-medium text-sm">
                                                                ₹{item.promoterCost.toLocaleString("en-IN")}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {(item.rtoCost ?? 0) > 0 && (
                                                        <div className="flex justify-between items-center py-1">
                                                            <span className="text-gray-600 dark:text-gray-400 text-sm">
                                                                RTO Charges
                                                            </span>
                                                            <span className="text-gray-800 dark:text-gray-200 font-medium text-sm">
                                                                ₹{item.rtoCost.toLocaleString("en-IN")}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {(item.extraKmCost ?? 0) > 0 && (
                                                        <div className="flex justify-between items-center py-1">
                                                            <span className="text-gray-600 dark:text-gray-400 text-sm">
                                                                Extra KM Charges ({item.extraKm} km × ₹
                                                                {item.dailyKmcharges?.toLocaleString("en-IN")})
                                                            </span>
                                                            <span className="text-gray-800 dark:text-gray-200 font-medium text-sm">
                                                                ₹{item.extraKmCost.toLocaleString("en-IN")}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {(item.extraHourCost ?? 0) > 0 && (
                                                        <div className="flex justify-between items-center py-1">
                                                            <span className="text-gray-600 dark:text-gray-400 text-sm">
                                                                Extra Hours Charges ({item.extraHours} hrs × ₹
                                                                {item.additionalHourCharges?.toLocaleString(
                                                                    "en-IN"
                                                                )}
                                                                )
                                                            </span>
                                                            <span className="text-gray-800 dark:text-gray-200 font-medium text-sm">
                                                                ₹{item.extraHourCost.toLocaleString("en-IN")}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {(item.additionalFields || [])
                                                        .filter((f: any) => f.label)
                                                        .map((f: any, fIdx: number) => (
                                                            <div
                                                                key={fIdx}
                                                                className="flex justify-between items-center py-1"
                                                            >
                                                                <span
                                                                    className={
                                                                        f.mode === "-"
                                                                            ? "text-red-500 text-sm"
                                                                            : "text-gray-600 dark:text-gray-400 text-sm"
                                                                    }
                                                                >
                                                                    {f.label}
                                                                </span>
                                                                <span
                                                                    className={
                                                                        f.mode === "-"
                                                                            ? "text-red-600 font-medium text-sm"
                                                                            : "text-gray-800 dark:text-gray-200 font-medium text-sm"
                                                                    }
                                                                >
                                                                    {f.mode === "-" ? "-" : "+"}₹
                                                                    {Number(f.amount).toLocaleString("en-IN")}
                                                                </span>
                                                            </div>
                                                        ))}

                                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                                                        <div className="flex justify-between items-center py-1">
                                                            <span className="text-gray-700 dark:text-gray-300 font-semibold text-sm">
                                                                Subtotal
                                                            </span>
                                                            <span className="text-gray-900 dark:text-white font-bold text-md">
                                                                ₹{formatINR(item.subtotal || 0)}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-center py-1">
                                                            <span className="text-gray-900 dark:text-white font-bold text-base">
                                                                Total (excl. GST)
                                                            </span>
                                                            <span className="text-blue-600 dark:text-blue-400 font-bold text-md">
                                                                ₹{formatINR(item.totalAmount || 0)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Campaign Media */}
                                            {((item.campaignImages?.length ?? 0) > 0 ||
                                                (item.campaignVideos?.length ?? 0) > 0) && (
                                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                                            <HiOutlinePhotograph className="w-4 h-4" />
                                                            Campaign Media
                                                        </p>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            {/* Images — click opens new tab */}
                                                            {(item.campaignImages || []).map(
                                                                (img: string, imgIdx: number) => (
                                                                    <div key={imgIdx} className="relative group">
                                                                        <img
                                                                            src={getImageUrl(img)}
                                                                            alt={`Campaign ${imgIdx + 1}`}
                                                                            className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-90 transition"
                                                                            onClick={() =>
                                                                                window.open(getImageUrl(img), "_blank")
                                                                            }
                                                                        />
                                                                        <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                                                            <HiOutlinePhotograph className="w-3 h-3" />
                                                                            Image {imgIdx + 1}
                                                                        </span>
                                                                    </div>
                                                                )
                                                            )}

                                                            {/* Videos — click opens in new tab (not download) */}
                                                            {(item.campaignVideos || []).map(
                                                                (vid: string, vidIdx: number) => (
                                                                    <div
                                                                        key={vidIdx}
                                                                        className="relative group cursor-pointer"
                                                                        onClick={() =>
                                                                            window.open(getImageUrl(vid), "_blank")
                                                                        }
                                                                    >
                                                                        <video
                                                                            src={getImageUrl(vid)}
                                                                            className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700 pointer-events-none"
                                                                        // No controls — clicking the wrapper opens new tab
                                                                        />
                                                                        {/* Play icon overlay */}
                                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                                            <div className="bg-black/50 rounded-full p-2 group-hover:bg-black/70 transition">
                                                                                <HiOutlineEye className="w-5 h-5 text-white" />
                                                                            </div>
                                                                        </div>
                                                                        <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                                                            <HiOutlineVideoCamera className="w-3 h-3" />
                                                                            Video {vidIdx + 1}
                                                                        </span>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </section>

                    {/* Order Total Summary */}
                    {(() => {
                        const bookingItems = order.bookingItems || [];
                        const subtotal = bookingItems.reduce(
                            (s, item) => s + (item.subtotal || item.totalAmount || 0),
                            0
                        );
                        const negotiationLogs = (order.negotiationLogs || []).filter(
                            (l) => (l.discountAmount || 0) > 0
                        );
                        const totalDiscount = negotiationLogs.reduce(
                            (s, l) => s + (l.discountAmount || 0),
                            0
                        );
                        const taxable = subtotal - totalDiscount;
                        const gstAmt = Math.floor(taxable * 0.18);
                        const grandTotal = taxable + gstAmt;
                        const paymentLogs = order.paymentStageFirst || [];
                        const totalAdvance = paymentLogs.reduce(
                            (s, l) => s + (l.advancePayment || 0),
                            0
                        );
                        const balanceDue = grandTotal - totalAdvance;

                        return (
                            <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-5 shadow-lg">
                                <p className="text-base font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300 mb-4 flex items-center gap-2">
                                    <HiOutlineCurrencyRupee className="w-5 h-5" />
                                    Financial Summary ({bookingItems.length} vehicle
                                    {bookingItems.length > 1 ? "s" : ""})
                                </p>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center py-2 border-b border-blue-200 dark:border-blue-800">
                                        <span className="text-gray-700 dark:text-gray-300 text-sm">
                                            Subtotal (excl. GST)
                                        </span>
                                        <span className="text-gray-900 dark:text-white font-semibold text-base">
                                            ₹{formatINR(subtotal)}
                                        </span>
                                    </div>

                                    {totalDiscount > 0 && (
                                        <div className="flex justify-between items-center py-2 border-b border-blue-200 dark:border-blue-800">
                                            <span className="text-red-600 dark:text-red-400 text-sm font-medium">
                                                Total Discount Applied
                                            </span>
                                            <span className="text-red-600 dark:text-red-400 font-bold text-base">
                                                −₹{formatINR(totalDiscount)}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center py-2 border-b border-blue-200 dark:border-blue-800">
                                        <span className="text-gray-700 dark:text-gray-300 text-sm">
                                            Taxable Amount
                                        </span>
                                        <span className="text-gray-900 dark:text-white font-semibold text-base">
                                            ₹{formatINR(taxable)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center py-2 border-b border-blue-200 dark:border-blue-800">
                                        <span className="text-gray-700 dark:text-gray-300 text-sm">
                                            GST (18%)
                                        </span>
                                        <span className="text-gray-900 dark:text-white font-semibold text-base">
                                            ₹{formatINR(order.grandGst || gstAmt)}
                                        </span>
                                    </div>

                                    {totalAdvance > 0 && (
                                        <div className="flex justify-between items-center py-2 border-b border-blue-200 dark:border-blue-800">
                                            <span className="text-orange-600 dark:text-orange-400 text-sm font-medium">
                                                Advance Paid
                                            </span>
                                            <span className="text-orange-600 dark:text-orange-400 font-bold text-base">
                                                −₹{formatINR(totalAdvance)}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center pt-3 mt-2 border-t-2 border-blue-300 dark:border-blue-700">
                                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                                            Grand Total
                                        </span>
                                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                            ₹{formatINR(grandTotal)}
                                        </span>
                                    </div>

                                    {totalAdvance > 0 && (
                                        <div className="flex justify-between items-center pt-2 border-t border-blue-200 dark:border-blue-700">
                                            <span className="text-base font-bold text-green-700 dark:text-green-400">
                                                Balance Due
                                            </span>
                                            <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                                ₹{formatINR(balanceDue)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })()}

                    {/* History Section */}
                    {(() => {
                        const negotiationLogs = (order.negotiationLogs || []).filter(
                            (l) => (l.discountAmount || 0) > 0
                        );
                        const poLogs = order.poDocumentLogs || [];
                        const paymentLogs = order.paymentStageFirst || [];
                        const totalDiscount = negotiationLogs.reduce(
                            (s, l) => s + (l.discountAmount || 0),
                            0
                        );

                        if (
                            negotiationLogs.length === 0 &&
                            poLogs.length === 0 &&
                            paymentLogs.length === 0
                        )
                            return null;

                        return (
                            <div className="space-y-4">
                                <div className="pt-2 pb-3 border-b-2 border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                                        <HiOutlineClipboardList className="w-5 h-5 text-gray-500" />
                                        All History Status
                                    </h3>
                                </div>

                                {/* Negotiation Logs */}
                                {negotiationLogs.length > 0 && (
                                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border-b border-gray-200 dark:border-gray-700">
                                            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                                                <HiOutlineTag className="w-4 h-4 text-amber-600" />
                                            </div>
                                            <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                                                Discount Negotiation History
                                            </span>
                                        </div>
                                        <div className="p-4 space-y-3">
                                            {negotiationLogs.map((log, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-red-400 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-xs font-bold text-white">
                                                            {i + 1}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                                            {log.movedBy || "Unknown"}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                            {fmtDate(log.movedAt)}
                                                        </p>
                                                        {log.discountNotes && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Notes: {log.discountNotes}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className="text-base font-bold text-red-600 dark:text-red-400 font-mono flex-shrink-0">
                                                        −₹{formatINR(log.discountAmount || 0)}
                                                    </span>
                                                </div>
                                            ))}

                                            {negotiationLogs.length > 1 && (
                                                <div className="flex justify-end mt-2">
                                                    <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg px-4 py-2">
                                                        <span className="text-sm font-bold text-red-700 dark:text-red-400">
                                                            Total Discount: −₹{formatINR(totalDiscount)}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* PO Documents */}
                                {poLogs.length > 0 && (
                                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border-b border-gray-200 dark:border-gray-700">
                                            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                                                <HiOutlineDocumentText className="w-4 h-4 text-amber-600" />
                                            </div>
                                            <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                                                PO Documents
                                            </span>
                                            <span className="ml-auto text-xs text-gray-500">
                                                {poLogs.length} document(s)
                                            </span>
                                        </div>
                                        <div className="p-4 space-y-3">
                                            {poLogs.map((log, i) => (
                                                <div
                                                    key={log._id}
                                                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
                                                >
                                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-xs font-bold text-white">
                                                            PO
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                                            Purchase Order {i + 1}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                            Date: {fmtDate(log.poDate)}
                                                            {log.uploadedBy ? ` • By: ${log.uploadedBy}` : ""}
                                                        </p>
                                                        {log.poNotes && (
                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                Notes: {log.poNotes}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                        <HiOutlineCheckCircle className="w-3 h-3" />
                                                        Uploaded
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Payment History */}
                                {paymentLogs.length > 0 && (
                                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                        <div className="flex items-center gap-3 px-4 py-3 bg-orange-50 dark:bg-orange-900/20 border-b border-gray-200 dark:border-gray-700">
                                            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                                                <HiOutlineCreditCard className="w-4 h-4 text-orange-600" />
                                            </div>
                                            <span className="text-sm font-semibold text-orange-800 dark:text-orange-300">
                                                Payment History
                                            </span>
                                        </div>
                                        <div className="p-4 space-y-3">
                                            {paymentLogs.map((log, i) => (
                                                <div
                                                    key={log._id}
                                                    className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-xs font-bold text-white">
                                                            {i + 1}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                                            Payment {i + 1}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                            Date: {fmtDate(log.paymentDate)}
                                                            {log.uploadedBy
                                                                ? ` • By: ${log.uploadedBy}`
                                                                : ""}
                                                        </p>
                                                        {log.paymentNotes && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Notes: {log.paymentNotes}
                                                            </p>
                                                        )}
                                                        <span
                                                            className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-semibold ${log.paymentVerification === "Verified"
                                                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                                }`}
                                                        >
                                                            {log.paymentVerification === "Verified" ? (
                                                                <>
                                                                    <HiOutlineCheckCircle className="w-3 h-3" />
                                                                    Verified
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <HiOutlineClock className="w-3 h-3" />
                                                                    Pending
                                                                </>
                                                            )}
                                                        </span>
                                                    </div>
                                                    <span className="text-base font-bold text-orange-600 dark:text-orange-400 font-mono flex-shrink-0">
                                                        ₹{formatINR(log.advancePayment)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
}


