
"use client";

import { Clock, Car, User, ReceiptText, GitBranch, Percent, History, X, FileText, Phone, Mail, MapPin, Building2, Calendar, Hash, IndianRupee, Package, ChevronRight, Download, Tag } from "lucide-react";
import NegotiationForm from "./customernegotiationForm";
import { WaitingForPOSection } from "./waitingforpo";
import { PaymentStage1Section } from "./PaymentStagefirst";


// ─── Types ────────────────────────────────────────────────────────────────────
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
    grandTotal: number;
    grandGst?: number;
    grandNegotiationTotal?: number;
    bookingItems: BookingItem[];
    negotiationLogs?: NegotiationLog[];
    pipelineLogs: PipelineLog[];
    poDocument?: string;
    poDocumentLogs?: PoDocumentLog[];
    paymentStageFirst?: PaymentStageFirst[];
}

interface PoDocumentLog {
    _id: string;
    poDocument: string;
    poDate: string;
    poNotes?: string;
    uploadedBy?: string;
    uploadedAt: string;
}

interface PaymentStageFirst {
    _id: string;
    advancePayment: number;
    paymentProofDocument: string;
    paymentDate: string;
    paymentVerification: string;
    paymentNotes?: string;
    uploadedBy?: string;
    uploadedAt: string;
}

interface BookingItem {
    vehicleModel: string;
    city: string;
    quantity: number;
    fromDate: string;
    toDate: string;
    totalDays: number;
    totalAmount: number;
    perDayRentalCost?: number;
}

interface NegotiationLog {
    fromStage: string;
    toStage: string;
    amount?: number;
    discountAmount?: number;
    movedBy: string;
    movedAt: string;
    discountNotes:any
    
}

interface PipelineLog {
    fromStage?: string;
    toStage: string;
    handlerName?: string;
    movedBy: string;
    movedAt: string;
}



const STAGE_MAP: Record<string, { label: string; gradient: string; icon: string }> = {
    todo:                    { label: "To-Do",                              gradient: "from-slate-400 to-slate-500",    icon: "📋" },
    inProgress:              { label: "In Progress",                        gradient: "from-blue-400 to-blue-600",      icon: "🔄" },
    customerConfirmation:    { label: "Customer Confirmation & Negotiation", gradient: "from-violet-400 to-violet-600",  icon: "🤝" },
    waitingForPO:            { label: "Waiting for PO",                     gradient: "from-amber-400 to-amber-600",    icon: "⏳" },
    paymentStage1:           { label: "Payment Processing Stage 1",         gradient: "from-orange-400 to-orange-600",  icon: "💳" },
    projectCodeCreation:     { label: "Project Code Creation",              gradient: "from-cyan-400 to-cyan-600",      icon: "🔢" },
    projectExecution:        { label: "Project Execution",                  gradient: "from-teal-400 to-teal-600",      icon: "⚙️" },
    onRoad:                  { label: "On Road",                            gradient: "from-sky-400 to-sky-600",        icon: "🚗" },
    campaignRunning:         { label: "Campaign Running",                   gradient: "from-indigo-400 to-indigo-600",  icon: "📣" },
    vehicleUnavailable:      { label: "Vehicle Unavailable",               gradient: "from-red-400 to-red-500",        icon: "🚫" },
    clientClosure:           { label: "Client Closure & Feedback",          gradient: "from-pink-400 to-pink-600",      icon: "📝" },
    invoiceGeneration:       { label: "Invoice Generation",                 gradient: "from-fuchsia-400 to-fuchsia-600",icon: "🧾" },
    paymentStage2:           { label: "Payment Processing Stage 2",         gradient: "from-purple-400 to-purple-600",  icon: "💰" },
    closedWon:               { label: "Closed Won",                         gradient: "from-green-400 to-green-600",    icon: "🎉" },
    closedLost:              { label: "Closed Lost",                        gradient: "from-rose-400 to-rose-600",      icon: "❌" },

   
    newOrder:                { label: "New Order",                          gradient: "from-violet-500 to-purple-600",  icon: "✨" },
    inquiry:                 { label: "Inquiry",                            gradient: "from-amber-400 to-orange-500",   icon: "🔍" },
    followUp:                { label: "Follow-up",                          gradient: "from-orange-400 to-red-500",     icon: "📞" },
    booked:                  { label: "Booked",                             gradient: "from-green-400 to-green-600",    icon: "✅" },
    cancelled:               { label: "Cancelled",                          gradient: "from-red-400 to-red-600",        icon: "🚫" },
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


function Section({ icon, title, accent, children }: { icon: React.ReactNode; title: string; accent?: string; children: React.ReactNode }) {
    return (
        <div className="bg-white dark:bg-gray-800/50 rounded-xl md:rounded-2xl border border-gray-200/60 dark:border-gray-700/50 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
            <div className={`flex items-center gap-2 md:gap-2.5 px-3 md:px-5 py-2.5 md:py-3 bg-gradient-to-r ${accent || 'from-gray-50 to-gray-100'} dark:from-gray-800/80 dark:to-gray-800/40 border-b border-gray-100 dark:border-gray-700/50`}>
                <span className="text-base md:text-lg">{icon}</span>
                <h3 className="text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {title}
                </h3>
            </div>
            <div className="p-3 md:p-5">{children}</div>
        </div>
    );
}

function InfoChip({ icon, label, value, full, highlight }: { icon?: React.ReactNode; label: string; value: React.ReactNode; full?: boolean; highlight?: boolean }) {
    return (
        <div className={`group ${full ? "col-span-2" : ""} ${highlight ? "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700" : "bg-gray-50/80 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50"} rounded-lg md:rounded-xl p-2.5 md:p-3.5 hover:shadow-md transition-all duration-200`}>
            <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                {icon && <span className="text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors text-xs md:text-sm">{icon}</span>}
                <p className="text-[9px] md:text-[12px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</p>
            </div>
            <div className="text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200 break-words">{value}</div>
        </div>
    );
}

function PricingRow({ label, value, highlight, icon }: { label: string; value: string; highlight?: boolean; icon?: React.ReactNode }) {
    return (
        <div className={`flex items-center justify-between py-2.5 md:py-3 px-3 md:px-4 rounded-lg transition-all duration-200 ${highlight ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700' : 'hover:bg-gray-50 dark:hover:bg-gray-800/40'}`}>
            <div className="flex items-center gap-1.5 md:gap-2">
                {icon && <span className="text-gray-400 text-xs md:text-sm">{icon}</span>}
                <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{label}</span>
            </div>
            <span className={`text-xs md:text-sm font-bold ${highlight ? 'text-blue-700 dark:text-blue-300 md:text-lg' : 'text-gray-800 dark:text-gray-200'}`}>
                {value}
            </span>
        </div>
    );
}

function TimelineItem({ dotColor, children, isLast }: { dotColor: string; children: React.ReactNode; isLast: boolean }) {
    return (
        <div className="flex items-start gap-2 md:gap-3 group">
            <div className="flex flex-col items-center pt-1 md:pt-1.5">
                <div className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-gradient-to-br ${dotColor} ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ring-gray-100 dark:ring-gray-700 group-hover:scale-110 transition-transform`} />
                {!isLast && <div className="w-0.5 flex-1 bg-gradient-to-b from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-800 mt-1 md:mt-1.5" style={{ minHeight: 24 }} />}
            </div>
            <div className="flex-1 pb-3 md:pb-4 group-hover:translate-x-1 transition-transform">{children}</div>
        </div>
    );
}


export default function DetailDrawer({
    order,
    onClose,
    onRefresh,
}: {
    order: Order;
    onClose: () => void;
    onRefresh: () => Promise<void>;
}) {




    const stage = STAGE_MAP[order.pipelineStatus];
    const logs: PaymentStageFirst[] = order.paymentStageFirst || [];
    const totalAdvance = logs.reduce((sum, log) => sum + (log.advancePayment || 0), 0);


    const subtotal = order.bookingItems.reduce((s, i) => s + (i.totalAmount || 0), 0);
    const totalDiscount = (order.negotiationLogs || []).reduce((s, l) => s + (l.discountAmount || 0), 0);
    const taxable = subtotal - totalDiscount;
    const gstAmt = Math.floor(taxable * 0.18);
    const finalNet = taxable + gstAmt;
    const balanceAmount = finalNet - totalAdvance;
    const discountPercentage = Math.round((totalDiscount / subtotal) * 100);


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900/60 to-black/70 backdrop-blur-md p-2 md:p-4">
            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 w-full max-w-4xl h-full md:max-h-[85vh] flex flex-col shadow-2xl rounded-xl md:rounded-3xl border border-gray-200/60 dark:border-gray-700/50 overflow-hidden animate-in fade-in zoom-in duration-300">


                <div className="relative flex-shrink-0 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 dark:from-gray-800 dark:via-gray-750 dark:to-gray-800 text-white px-3 md:px-6 py-3 md:py-5">

                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-blue-500 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-36 md:w-48 h-36 md:h-48 bg-purple-500 rounded-full blur-3xl" />
                    </div>

                    <div className="relative flex items-start justify-between gap-3 md:gap-4">

                        <div className="flex items-center gap-2 md:gap-4 min-w-0">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20">
                                <span className="text-xl md:text-2xl">🚗</span>
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 md:gap-3 mb-1 flex-wrap">
                                    <h2 className="text-base md:text-xl font-bold tracking-tight truncate">Order Details</h2>
                                    {stage && (
                                        <span className={`inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-semibold bg-white/20 backdrop-blur-sm border border-white/30 text-white whitespace-nowrap`}>
                                            <span className="hidden md:inline">{stage.icon}</span>
                                            {stage.label}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5 md:gap-2 text-[11px] md:text-sm text-white/70 flex-wrap">
                                    {/* <Hash size={12} className="md:w-[14px] md:h-[14px]" /> */}
                                    <span className="font-mono text-xs md:text-sm">{order.orderId}</span>
                                    <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-white/30 hidden sm:inline" />
                                    <Clock size={12} className="md:w-[14px] md:h-[14px] hidden sm:inline" />
                                    <span className="hidden sm:inline">{fmtDatetime(order.updatedAt)}</span>
                                </div>
                            </div>
                        </div>


                        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                            {order.handlerName && (
                                <div className="hidden sm:flex items-center gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-xs md:text-sm font-bold">
                                        {order.handlerName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-[10px] md:text-xs text-white/70">Handler</p>
                                        <p className="text-xs md:text-sm font-semibold">{order.handlerName}</p>
                                    </div>
                                </div>
                            )}
                            <button
                                onClick={onClose}
                                className="w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white flex items-center justify-center transition-all hover:rotate-90 duration-300"
                            >
                                <X size={16} className="md:w-[18px] md:h-[18px]" />
                            </button>
                        </div>
                    </div>

                    {order.handlerName && (
                        <div className="sm:hidden mt-2 flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-xs font-bold">
                                {order.handlerName.charAt(0)}
                            </div>
                            <div>
                                <p className="text-[10px] text-white/70">Handler</p>
                                <p className="text-xs font-semibold">{order.handlerName}</p>
                            </div>
                        </div>
                    )}
                </div>


                <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-3 md:space-y-5 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">


                    <Section icon="👤" title="Customer Information" accent="from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                            <InfoChip icon={<Hash size={14} />} label="Order ID" value={order.orderId} />
                            <InfoChip icon={<Phone size={14} />} label="Phone" value={`+91${order.phone}`} />
                            <InfoChip icon={<User size={14} />} label="Name" value={order.name} highlight />
                            {order.email && <InfoChip icon={<Mail size={14} />} label="Email" value={order.email} />}
                            <InfoChip
                                icon={<Tag size={14} />}
                                label="Customer Type"
                                value={
                                    <span className={`inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-semibold ${order.customerType === 1
                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                        }`}>
                                        {order.customerType === 1 ? "🆕 New" : order.customerType === 0 ? "🔄 Existing" : "❓ Not Set"}
                                    </span>
                                }
                            />
                            {order.address && <InfoChip icon={<MapPin size={14} />} label="Address" value={order.address} full />}
                        </div>
                    </Section>


                    <Section icon="📅" title="Vehicle Bookings" accent="from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                        {/* Mobile Card View */}
                        <div className="block sm:hidden space-y-3">
                            {order.bookingItems.map((item, i) => (
                                <div key={i} className="bg-gray-50 dark:bg-gray-800/40 rounded-lg p-3 border border-gray-100 dark:border-gray-700/50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-sm">
                                            🚘
                                        </div>
                                        <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{item.vehicleModel}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <span className="text-gray-400">City:</span>
                                            <span className="ml-1 text-gray-600 dark:text-gray-300">{item.city}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Qty:</span>
                                            <span className="ml-1 font-semibold text-gray-700 dark:text-gray-300">{item.quantity}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">From:</span>
                                            <span className="ml-1 text-gray-600 dark:text-gray-300">{fmtDatetime(item.fromDate)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">To:</span>
                                            <span className="ml-1 text-gray-600 dark:text-gray-300">{fmtDatetime(item.toDate)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Days:</span>
                                            <span className="ml-1 text-gray-600 dark:text-gray-300">{item.totalDays} days</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Total:</span>
                                            <span className="ml-1 font-bold text-blue-600 dark:text-blue-400">{fmt(item.totalAmount)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>


                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700/50 dark:to-gray-800/50">
                                        {["🚗 Vehicle", "🏙️ City", "📦 Qty", "📅 From", "📅 To", "⏱️ Days", "💰 Total"].map((h) => (
                                            <th key={h} className="text-left px-3 md:px-4 py-2.5 md:py-3 text-[10px] md:text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider first:rounded-l-xl last:rounded-r-xl whitespace-nowrap">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                    {order.bookingItems.map((item, i) => (
                                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors group">
                                            <td className="px-3 md:px-4 py-3 md:py-3.5">
                                                <div className="flex items-center gap-1.5 md:gap-2">
                                                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs md:text-sm">
                                                        🚘
                                                    </div>
                                                    <span className="font-semibold text-gray-800 dark:text-gray-200 text-xs md:text-sm">{item.vehicleModel}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 md:px-4 py-3 md:py-3.5 text-gray-600 dark:text-gray-400 text-xs md:text-sm">{item.city}</td>
                                            <td className="px-3 md:px-4 py-3 md:py-3.5">
                                                <span className="px-2 md:px-2.5 py-0.5 md:py-1 rounded-lg bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 font-semibold text-xs md:text-sm">
                                                    {item.quantity}
                                                </span>
                                            </td>
                                            <td className="px-3 md:px-4 py-3 md:py-3.5 text-gray-600 dark:text-gray-400 text-xs md:text-sm whitespace-nowrap">{fmtDatetime(item.fromDate)}</td>
                                            <td className="px-3 md:px-4 py-3 md:py-3.5 text-gray-600 dark:text-gray-400 text-xs md:text-sm whitespace-nowrap">{fmtDatetime(item.toDate)}</td>
                                            <td className="px-3 md:px-4 py-3 md:py-3.5 text-gray-600 dark:text-gray-400 text-xs md:text-sm">{item.totalDays} days</td>
                                            <td className="px-3 md:px-4 py-3 md:py-3.5">
                                                <span className="font-bold text-blue-600 dark:text-blue-400 text-xs md:text-sm">{fmt(item.totalAmount)}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* <div className="flex justify-end mt-3 md:mt-4 pt-3 md:pt-4 border-t-2 border-dashed border-gray-200 dark:border-gray-700">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl md:rounded-2xl px-4 md:px-6 py-2 md:py-3">
                                <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mr-2 md:mr-3">Booking Total</span>
                                <span className="text-lg md:text-xl font-bold text-blue-700 dark:text-blue-300">{fmt(order.grandTotal)}</span>
                            </div>
                        </div> */}
                    </Section>

                    <NegotiationForm order={order} onNegotiationSaved={onRefresh} />

                    <WaitingForPOSection order={order} onRefresh={onRefresh} />
                    <PaymentStage1Section order={order} onRefresh={onRefresh} />

                     <Section icon="💰" title="Pricing Breakdown" accent="from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                        <div className="space-y-1">
                            <PricingRow label="Subtotal" value={fmt(subtotal)} icon={<IndianRupee size={16} />} />
                            {/* {totalDiscount > 0 && (
                                <PricingRow label="Discount Applied"  value={`− ${fmt(totalDiscount)}`} icon={<Percent size={16} />} />
                            )} */}
                            {totalDiscount > 0 && (
                                <PricingRow
                                    label={`Discount Applied (${discountPercentage}%)`}
                                    value={`− ${fmt(totalDiscount)}`}
                                    icon={<Percent size={16} />}
                                />
                            )}
                            <PricingRow label="Taxable Amount" value={fmt(taxable)} icon={<ReceiptText size={16} />} />
                            <PricingRow label="GST (18%)" value={fmt(gstAmt)} icon={<Building2 size={16} />} />
                            {totalAdvance > 0 && (
                                <PricingRow label="Advance Paid" value={`− ${fmt(totalAdvance)}`} icon={<IndianRupee size={16} />} />
                            )}
                        </div>



                        <div className="mt-3 md:mt-4 p-4 md:p-5 rounded-xl md:rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700/50">
                            <div className="flex items-center justify-between">

                                {/* Emoji at Start */}
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-green-500 flex items-center justify-center text-xl md:text-2xl shadow-lg mr-3">
                                    💵
                                </div>

                                {/* Text + Amount at End */}
                                <div className="flex-1 text-right">
                                    <p className="text-[10px] md:text-xs text-green-600 dark:text-green-400 font-semibold uppercase tracking-wider mb-0.5 md:mb-1">
                                        Final Amount
                                    </p>
                                    <p className="text-xl md:text-2xl font-bold text-green-700 dark:text-green-300">
                                        {fmt(finalNet)}
                                    </p>

                                    {totalAdvance > 0 && (
                                        <div className="mt-2 pt-2 border-t border-green-200 dark:border-green-700">
                                            <p className="text-[10px] md:text-xs text-orange-600 dark:text-orange-400 font-semibold uppercase tracking-wider mb-0.5">
                                                Balance Due
                                            </p>
                                            <p className="text-base md:text-lg font-bold text-orange-600 dark:text-orange-400">
                                                {fmt(balanceAmount)} 💵
                                            </p>
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>

                    </Section>

                  

<Section icon="📝" title="Notes" accent="from-yellow-50 to-amber-50 
  dark:from-yellow-900/20 dark:to-amber-900/20">
  
  {/* Discount Negotiation Notes */}
  {(order.negotiationLogs || []).filter(l => l.discountNotes).length > 0 && (
    <div className="mb-4">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
        💬 Discount Negotiation Notes
      </p>
      <div className="space-y-2">
        {order.negotiationLogs
          .filter((l: any) => l.discountNotes)
          .map((log: any, i: number) => (
            <div key={i} className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 
              border border-amber-200 dark:border-amber-800/50">
              <p className="text-sm text-gray-700 dark:text-gray-300">{log.discountNotes}</p>
              <p className="text-xs text-gray-400 mt-1">
                By {log.movedBy} • {fmtDatetime(log.movedAt)}
              </p>
            </div>
          ))}
      </div>
    </div>
  )}

  {/* PO Notes */}
  {(order.poDocumentLogs || []).filter(l => l.poNotes).length > 0 && (
    <div className="mb-4">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
        📄 PO Notes
      </p>
      <div className="space-y-2">
        {order.poDocumentLogs
          .filter((l: any) => l.poNotes)
          .map((log: any, i: number) => (
            <div key={i} className="p-3 rounded-xl bg-sky-50 dark:bg-sky-900/20 
              border border-sky-200 dark:border-sky-800/50">
              <p className="text-sm text-gray-700 dark:text-gray-300">{log.poNotes}</p>
              <p className="text-xs text-gray-400 mt-1">
                By {log.uploadedBy} • {fmtDatetime(log.poDate)}
              </p>
            </div>
          ))}
      </div>
    </div>
  )}

  {/* Payment Notes */}
  {(order.paymentStageFirst || []).filter(l => l.paymentNotes).length > 0 && (
    <div>
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
        💳 Payment Notes
      </p>
      <div className="space-y-2">
        {order.paymentStageFirst
          .filter((l: any) => l.paymentNotes)
          .map((log: any, i: number) => (
            <div key={i} className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 
              border border-green-200 dark:border-green-800/50">
              <p className="text-sm text-gray-700 dark:text-gray-300">{log.paymentNotes}</p>
              <p className="text-xs text-gray-400 mt-1">
                By {log.uploadedBy} • {fmtDatetime(log.paymentDate)}
              </p>
            </div>
          ))}
      </div>
    </div>
  )}

  {/* No notes fallback */}
  {(order.negotiationLogs || []).filter(l => l.discountNotes).length === 0 &&
   (order.poDocumentLogs || []).filter(l => l.poNotes).length === 0 &&
   (order.paymentStageFirst || []).filter(l => l.paymentNotes).length === 0 && (
    <p className="text-sm text-gray-400 text-center py-4">No notes added yet</p>
  )}
</Section>

                 
                    <Section icon="🔄" title="Pipeline Journey" accent="from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
                        <div className="space-y-0">
                            {(() => {
                                // Build merged timeline
                                const timelineItems: {
                                    type: 'pipeline' | 'negotiation';
                                    label: string;
                                    sub?: string;
                                    by: string;
                                    at: string;
                                    dotColor: string;
                                }[] = [];

                                // Add non-customerConfirmation pipeline logs normally
                                // For customerConfirmation → customerConfirmation, SKIP from pipelineLogs
                                // Instead use negotiationLogs for those
                                const pipelineEntries = order.pipelineLogs.filter(log =>
                                    !(log.fromStage === 'customerConfirmation' && log.toStage === 'customerConfirmation')
                                );

                                pipelineEntries.forEach(log => {
                                    const toStage = STAGE_MAP[log.toStage];
                                    const fromLabel = log.fromStage ? (STAGE_MAP[log.fromStage]?.label || log.fromStage) : 'Start';
                                    const toLabel = toStage?.label || log.toStage;
                                    timelineItems.push({
                                        type: 'pipeline',
                                        label: `${fromLabel} → ${toLabel}`,
                                        by: log.movedBy,
                                        at: log.movedAt,
                                        dotColor: toStage?.gradient || 'from-gray-400 to-gray-500',
                                    });
                                });

                           

                                // Merge all negotiation logs into ONE entry with total discount + latest date
                                const negLogs = order.negotiationLogs || [];
                                if (negLogs.length > 0) {
                                    const totalDiscount = negLogs.reduce((sum, n) => sum + (n.discountAmount || 0), 0);
                                    const latest = negLogs.reduce((prev, curr) =>
                                        new Date(curr.movedAt) > new Date(prev.movedAt) ? curr : prev
                                    );
                                    timelineItems.push({
                                        type: 'negotiation',
                                        label: 'Customer Confirmation',
                                        sub: `Total Discount: ${fmt(totalDiscount)}`,
                                        by: latest.movedBy,
                                        at: latest.movedAt,
                                        dotColor: 'from-violet-400 to-purple-500',
                                    });
                                }

                                // Sort by date descending (latest first)
                                timelineItems.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

                                return timelineItems.map((item, i, arr) => {
                                    const isLast = i === arr.length - 1;
                                    return (
                                        <TimelineItem key={i} dotColor={item.dotColor} isLast={isLast}>
                                            <div className="bg-gray-50 dark:bg-gray-800/40 rounded-lg md:rounded-xl p-2.5 md:p-3.5 border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition-all">
                                                <p className="text-md font-semibold text-gray-800 dark:text-gray-200">
                                                    {item.label}
                                                </p>
                                                {item.type === 'negotiation' && item.sub && (
                                                    <div className="flex items-center gap-1.5 mt-1.5">
                                                        <span className="text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 px-2 py-0.5 rounded-full">
                                                            {item.sub}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-400 flex-wrap">
                                                    <span>By {item.by}</span>
                                                    <span>•</span>
                                                    <span>{fmtDatetime(item.at)}</span>
                                                </div>
                                            </div>
                                        </TimelineItem>
                                    );
                                });
                            })()}
                        </div>
                    </Section>

                   

                    {/* PO Document */}
                    {order.poDocument && (
                        <Section icon="📄" title="Purchase Order" accent="from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20">
                            <a
                                href={order.poDocument}
                                target="_blank"
                                rel="noreferrer"
                                className="group flex items-center justify-between p-3 md:p-4 rounded-lg md:rounded-xl bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 border-2 border-sky-200 dark:border-sky-700/50 hover:shadow-lg transition-all"
                            >
                                <div className="flex items-center gap-2 md:gap-3">
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-sky-500 flex items-center justify-center text-lg md:text-xl shadow-md">
                                        📎
                                    </div>
                                    <div>
                                        <p className="text-sm md:text-base font-semibold text-sky-700 dark:text-sky-300">View Document</p>
                                        <p className="text-[10px] md:text-xs text-sky-500 dark:text-sky-400">Click to open in new tab</p>
                                    </div>
                                </div>
                                <Download size={16} className="md:w-[18px] md:h-[18px] text-sky-600 dark:text-sky-400 group-hover:translate-y-1 transition-transform" />
                            </a>
                        </Section>
                    )}
                </div>
            </div>
        </div>
    );
}