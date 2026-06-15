
/* eslint-disable */
// @ts-nocheck

"use client";

import {
    X, ChevronRight, ChevronDown, Clock, Phone, Mail,
    MapPin, Hash, User, Tag, Calendar, Building2,
    IndianRupee, ReceiptText, Percent, Download,
    Upload, FileText, CheckCircle2, AlertCircle,
    StickyNote, Eye, Trash2, ImageIcon,
    PlusCircle, MessageSquare, MoreHorizontal,
    AlertTriangle, History, XCircle,
    Folder,
} from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import axios from "axios";
import { getToken } from "../../utils/auth";
import toast from "react-hot-toast";
import API_BASE from "../../../../baseurl";
import { useVehicle } from '../../../context/vehicletypecontext';
import { ChevronLeft } from "lucide-react";


// ─── Types ─────────────────────────────────────────────────────────────────────
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
    todoArray?: any[];
    todoUploadedBy?: string;
    projectMailLogs?: any[];
    OnRoadTab?: any[];
    isAdminCreated?: boolean;
    companyName?: string;
    clientName?: string;
    designation?: string;
    gstNumber?: string;
    customerCategory?: string;
}

export default function OverviewTab({ order, onRefresh, onStageMove }: {
    order: Order; onRefresh: () => Promise<void>;
    onStageMove: (order: Order, toStage: string) => void;
}) {

    const { vehicleTypes, fetchVehicleTypes } = useVehicle();
    const [openItems, setOpenItems] = useState<Record<number, boolean>>({});
    const [activeVehicleTab, setActiveVehicleTab] = useState<number>(0);
    const tabsContainerRef = useRef<HTMLDivElement>(null);
    const toggleItem = (idx: number) => {
        setOpenItems(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    const fmt = (n?: number | null) =>
    n != null ? `₹ ${n.toLocaleString("en-IN")}` : "—";

const fmtDatetime = (s?: string) =>
    s
        ? new Date(s).toLocaleString("en-IN", {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        })
        : "—";

const fmtRelative = (s?: string) => {
    if (!s) return "";
    const diff = Date.now() - new Date(s).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
};

    useEffect(() => {
        fetchVehicleTypes()
    }, [])


    const currentVehicle = order.bookingItems[activeVehicleTab];

    const scrollTabs = (direction: 'left' | 'right') => {
        if (tabsContainerRef.current) {
            const scrollAmount = 200;
            const newScrollLeft = tabsContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
            tabsContainerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };


    useEffect(() => {
        if (tabsContainerRef.current) {
            const activeTabElement = tabsContainerRef.current.children[activeVehicleTab] as HTMLElement;
            if (activeTabElement) {
                activeTabElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            }
        }
    }, [activeVehicleTab]);



    const formatINR = (value: string | number) => {
        const num = parseFloat(String(value).replace(/[^0-9.]/g, ""));
        if (isNaN(num) || value === "" || value === undefined) return "";
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(num);
    };


    const subtotal = order.bookingItems.reduce((s: number, i: any) => s + (i.totalAmount || 0), 0);
    const totalDiscount = (order.negotiationLogs || []).reduce((s, l) => s + (l.discountAmount || 0), 0);
    const taxable = subtotal - totalDiscount;
    const gstAmt = Math.floor(taxable * 0.18);
    const finalAmt = taxable + gstAmt;


    const projectCodes = order.projectCodeArray || [];

    const getVehicleTypeName = (vehicleTypeId: string) => {
        if (!vehicleTypeId || !vehicleTypes) return "";
        const vehicle = vehicleTypes.find((vt: any) => vt._id === vehicleTypeId);
        return vehicle?.typeName || vehicleTypeId;
    };

    return (

        <div className="p-4 space-y-4">
            {/* Customer Details */}
            <div className="rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                    <User size={15} className="text-gray-400" />
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Customer Details</h3>
                </div>
                <div className="p-4">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <div>
                            <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Order ID</p>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{order.orderId}</p>
                        </div>
                        <div>
                            <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Customer Name</p>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{order.name}</p>
                        </div>
                        <div>
                            <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Customer Type</p>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                {order.customerType === 1 ? "Organization" : order.customerType === 0 ? "Individual" : "—"}
                            </p>
                        </div>

                        <div>
                            <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Phone</p>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">+91 {order.phone}</p>
                        </div>
                        {order.email && (
                            <div>
                                <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Email</p>
                                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{order.email}</p>
                            </div>
                        )}
                        {order.address && (
                            <div className="col-span-2">
                                <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Address</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{order.address}</p>
                            </div>
                        )}
                        {order.companyName && (
                            <div>
                                <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Company Name</p>
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{order.companyName}</p>
                            </div>
                        )}
                        {order.gstNumber && (
                            <div>
                                <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Gst Number</p>
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{order.gstNumber}</p>
                            </div>
                        )}
                        {order.designation && (
                            <div>
                                <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Designation</p>
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{order.designation}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Order Created At</p>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{fmtDatetime(order.createdAt)}</p>
                        </div>


                    </div>
                </div>
            </div>

            {/* Order Details */}

            <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">

                <div className="relative flex items-center bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">

                    <button
                        onClick={() => scrollTabs('left')}
                        className="absolute left-0 z-10 flex items-center justify-center w-8 h-full bg-gradient-to-r from-gray-50 dark:from-gray-800/50 to-transparent hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all disabled:opacity-30"
                        style={{ left: 0 }}
                    >
                        <ChevronLeft size={18} className="text-gray-600 dark:text-gray-400" />
                    </button>


                    <div
                        ref={tabsContainerRef}
                        className="flex overflow-x-auto scrollbar-hide gap-1 px-8"
                        style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            WebkitOverflowScrolling: 'touch'
                        }}
                    >
                        <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
                        {order.bookingItems.map((vehicle: any, idx: number) => {
                            const vehicleCount = vehicle.quantity;
                            const vehicleName = getVehicleTypeName(vehicle.vehicleType);
                            const campaignName = vehicle.campaignType === "Other" ? vehicle.otherCampaignType : vehicle.campaignType;

                            return (
                                <button
                                    key={idx}
                                    onClick={() => setActiveVehicleTab(idx)}
                                    className={`
              flex-shrink-0 flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all whitespace-nowrap
              ${activeVehicleTab === idx
                                            ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500"
                                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        }
            `}
                                >
                                    <span className="flex items-center justify-center w-10 h-6 text-sm font-bold text-blue-600">
                                        {idx + 1} vehicle
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Right Scroll Button */}
                    <button
                        onClick={() => scrollTabs('right')}
                        className="absolute right-0 z-10 flex items-center justify-center w-8 h-full bg-gradient-to-l from-gray-50 dark:from-gray-800/50 to-transparent hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all"
                        style={{ right: 0 }}
                    >
                        <ChevronRight size={18} className="text-gray-600 dark:text-gray-400" />
                    </button>
                </div>


                {currentVehicle && (
                    <div className="p-4 space-y-3">

                        <div className="space-y-1.5 bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg">
                            {(
                                [
                                    ["Vehicle Model", getVehicleTypeName(currentVehicle.vehicleType)], // Fixed: changed 'vehicle' to 'currentVehicle'
                                    ["Booking For", order.customerCategory],
                                    ["Campaign", currentVehicle.campaignType === "Other" ? currentVehicle.otherCampaignType : currentVehicle.campaignType],
                                    ["Duration", currentVehicle.fromDate && currentVehicle.toDate
                                        ? `${new Date(currentVehicle.fromDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} → ${new Date(currentVehicle.toDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} (${Math.ceil((new Date(currentVehicle.toDate).getTime() - new Date(currentVehicle.fromDate).getTime()) / 86400000)}D base${currentVehicle.extraDays > 0 ? ` +${currentVehicle.extraDays} D = ${Math.ceil((new Date(currentVehicle.toDate).getTime() - new Date(currentVehicle.fromDate).getTime()) / 86400000) + currentVehicle.extraDays}D total` : ""})`
                                        : "—"],
                                    ["Driving route", `${currentVehicle.fromLocation} → ${currentVehicle.toLocation}`],
                                    ["State / City", `${currentVehicle.state} / ${currentVehicle.city}`],
                                    ["Vehicle Count", `${currentVehicle.quantity} ${currentVehicle.quantity === 1 ? "Vehicle" : "Vehicles"}`],
                                    currentVehicle.extraKm > 0 ? ["Extra KM", `${currentVehicle.extraKm} km`] : null,
                                    currentVehicle.extraHours > 0 ? ["Extra Hours", `${currentVehicle.extraHours} hours`] : null,
                                    currentVehicle.needPromoter ? ["Promoter", `${currentVehicle.promoterType === "Other" ? currentVehicle.otherPromoterType : currentVehicle.promoterType} · ${currentVehicle.promoterGender} · ${currentVehicle.promoterLanguage} · Qty ${currentVehicle.promoterQuantity}`] : null,
                                    currentVehicle.gstNumber ? ["GST", currentVehicle.gstNumber] : null,
                                ] as ([string, string] | null)[]
                            )
                                .filter((item): item is [string, string] => item !== null)
                                .map(([label, value], i) => (
                                    <div key={i} className="flex justify-between text-md gap-4">
                                        <span className="text-gray-500 shrink-0">{label}</span>
                                        <span className="text-gray-800 dark:text-gray-200 font-medium text-right">{value}</span>
                                    </div>
                                ))
                            }
                        </div>

                        {/* Pricing Breakdown */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                            <p className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                <IndianRupee size={14} />
                                Price Breakdown
                            </p>
                            <div className="space-y-2">
                                {currentVehicle.rentalCost > 0 && (
                                    <div className="flex justify-between items-center py-1">
                                        <span className="text-gray-600 dark:text-gray-400 text-md">
                                            Rental ({currentVehicle.totalDays}D × {formatINR(currentVehicle.perDayRentalCost)} × {currentVehicle.quantity})
                                        </span>
                                        <span className="text-gray-800 dark:text-gray-200 font-medium">
                                            {formatINR(currentVehicle.rentalCost)}
                                        </span>
                                    </div>
                                )}

                                {(currentVehicle.promoterCost ?? 0) > 0 && (
                                    <div className="flex justify-between items-center py-1">
                                        <span className="text-gray-600 dark:text-gray-400 text-md">
                                            Promoter Charges ({currentVehicle.totalDays}D × {formatINR(currentVehicle.promoterChargePerDay)} × {currentVehicle.promoterQuantity})
                                        </span>
                                        <span className="text-gray-800 dark:text-gray-200 font-medium">
                                            {formatINR(currentVehicle.promoterCost)}
                                        </span>
                                    </div>
                                )}

                                {(currentVehicle.rtoCost ?? 0) > 0 && (
                                    <div className="flex justify-between items-center py-1">
                                        <span className="text-gray-600 dark:text-gray-400 text-md">RTO Charges</span>
                                        <span className="text-gray-800 dark:text-gray-200 font-medium">
                                            {formatINR(currentVehicle.rtoCost)}
                                        </span>
                                    </div>
                                )}

                                {(currentVehicle.extraKmCost ?? 0) > 0 && (
                                    <div className="flex justify-between items-center py-1">
                                        <span className="text-gray-600 dark:text-gray-400 text-md">
                                            Extra KM Charges ({currentVehicle.extraKm} km × {formatINR(currentVehicle.dailyKmcharges)})
                                        </span>
                                        <span className="text-gray-800 dark:text-gray-200 font-medium">
                                            {formatINR(currentVehicle.extraKmCost)}
                                        </span>
                                    </div>
                                )}

                                {(currentVehicle.extraHourCost ?? 0) > 0 && (
                                    <div className="flex justify-between items-center py-1">
                                        <span className="text-gray-600 dark:text-gray-400 text-md">
                                            Extra Hours Charges ({currentVehicle.extraHours} hrs × {formatINR(currentVehicle.additionalHourCharges)})
                                        </span>
                                        <span className="text-gray-800 dark:text-gray-200 font-medium">
                                            {formatINR(currentVehicle.extraHourCost)}
                                        </span>
                                    </div>
                                )}

                                {(currentVehicle.additionalCharges || []).filter((c: any) => c.label).map((c: any, fIdx: number) => (
                                    <div key={fIdx} className="flex justify-between items-center py-1">
                                        <span className={c.mode === "-" ? "text-red-500 text-md" : "text-gray-600 dark:text-gray-400 text-md"}>
                                            {c.label}
                                        </span>
                                        <span className={c.mode === "-" ? "text-red-600 font-medium" : "text-gray-800 dark:text-gray-200 font-medium"}>
                                            {c.mode === "-" ? "-" : "+"}
                                            {formatINR(c.amount)}
                                        </span>
                                    </div>
                                ))}

                                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                                    <div className="flex justify-between items-center py-1">
                                        <span className="text-gray-700 dark:text-gray-300 font-semibold text-md">Subtotal</span>
                                        <span className="text-gray-900 dark:text-white font-bold text-base">
                                            {formatINR(currentVehicle.subtotal)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-1">
                                        <span className="text-gray-900 dark:text-white font-bold text-md">Total (excl. GST)</span>
                                        <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                                            {formatINR(currentVehicle.totalAmount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Price Breakdown */}
            <div className="rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">

                <div className="rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                        <IndianRupee size={13} className="text-gray-400" />
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider"> Price Breakdown</h3>
                    </div>
                    <div className="p-4">
                        <table className="w-full text-md">
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                <tr className=" border-t border-gray-200 dark:border-gray-700">
                                    <td colSpan={2} className="py-2 text-gray-500 font-medium ">Subtotal (Excl. GST)</td>
                                    <td className="py-2 text-right font-bold text-gray-800 dark:text-gray-200">{fmt(subtotal)}</td>
                                </tr>
                                <tr>
                                    <td colSpan={2} className="py-1.5 text-gray-500">Taxable Amount</td>
                                    <td className="py-1.5 text-right font-bold text-gray-800 dark:text-gray-200">{fmt(taxable)}</td>
                                </tr>
                                <tr>
                                    <td colSpan={2} className="py-1.5 text-gray-500">GST (18%)</td>
                                    <td className="py-1.5 text-right font-bold text-gray-800 dark:text-gray-200">{fmt(gstAmt)}</td>
                                </tr>
                                <tr className="border-t-2 border-red-100 dark:border-red-900/30">
                                    <td colSpan={2} className="py-2 text-red-600 font-bold">Final Amount</td>
                                    <td className="py-2 text-right font-bold text-red-600 text-base">{fmt(finalAmt)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Closed Lost */}
            {order.salesPipelineStatus === "closedLost" && (order.closedLostArray || []).length > 0 && (
                <div className="rounded-xl border border-rose-100 dark:border-rose-800/50 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 dark:bg-rose-900/20 border-b border-rose-100 dark:border-rose-800/50">
                        <XCircle size={13} className="text-rose-500" />
                        <h3 className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">Closed Lost — Reason</h3>
                    </div>
                    <div className="p-4 space-y-2">
                        {order.closedLostArray.map((item, i) => (
                            <div key={i} className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200/50">
                                <p className="text-sm font-semibold text-rose-700 flex items-center gap-1.5 mb-1">
                                    <AlertTriangle size={12} /> Reason:
                                </p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{item.reason}</p>
                                <p className="text-[11px] text-gray-400 mt-1">By {item.uploadedBy} · {fmtDatetime(item.uploadedAt)}</p>
                                {item.document && <div className="mt-2"><DocItem docPath={item.document} label="Supporting Document" /></div>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

    );
}