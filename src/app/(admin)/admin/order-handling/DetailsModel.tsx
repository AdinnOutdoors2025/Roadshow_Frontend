// "use client";

// import { Clock, Car, User, ReceiptText, GitBranch, Percent, History, X, FileText } from "lucide-react";
// import NegotiationForm from "./customernegotiationForm";

// // ─── Types ────────────────────────────────────────────────────────────────────
// interface Order {
//     _id: string;
//     orderId: string;
//     name: string;
//     phone: string;
//     email?: string;
//     address?: string;
//     customerType?: number;
//     pipelineStatus: string;
//     handlerName?: string;
//     updatedAt: string;
//     grandTotal: number;
//     grandGst?: number;
//     grandNegotiationTotal?: number;
//     bookingItems: BookingItem[];
//     negotiationLogs?: NegotiationLog[];
//     pipelineLogs: PipelineLog[];
//     poDocument?: string;
// }

// interface BookingItem {
//     vehicleModel: string;
//     city: string;
//     quantity: number;
//     fromDate: string;
//     toDate: string;
//     totalDays: number;
//     totalAmount: number;
//     perDayRentalCost?: number;
// }

// interface NegotiationLog {
//     fromStage: string;
//     toStage: string;
//     amount?: number;
//     discountAmount?: number;
//     movedBy: string;
//     movedAt: string;
// }

// interface PipelineLog {
//     fromStage?: string;
//     toStage: string;
//     handlerName?: string;
//     movedBy: string;
//     movedAt: string;
// }

// // ─── Stage Map ────────────────────────────────────────────────────────────────
// const STAGE_MAP: Record<string, { label: string; dot: string; color: string }> = {
//     todo:                 { label: "To Do",                 dot: "bg-gray-400",   color: "#888780" },
//     inProgress:           { label: "In Progress",           dot: "bg-blue-500",   color: "#378ADD" },
//     newOrder:             { label: "New Order",             dot: "bg-violet-500", color: "#7F77DD" },
//     inquiry:              { label: "Inquiry",               dot: "bg-amber-400",  color: "#EF9F27" },
//     followUp:             { label: "Follow-up",             dot: "bg-orange-400", color: "#D85A30" },
//     customerConfirmation: { label: "Customer Confirmation", dot: "bg-teal-500",   color: "#1D9E75" },
//     booked:               { label: "Booked",                dot: "bg-green-500",  color: "#639922" },
//     cancelled:            { label: "Cancelled",             dot: "bg-red-500",    color: "#E24B4A" },
// };

// // ─── Formatters ───────────────────────────────────────────────────────────────
// const fmt = (n?: number | null) =>
//     n != null ? `₹ ${n.toLocaleString("en-IN")}` : "—";

// const fmtDate = (s?: string) =>
//     s ? new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

// const fmtDatetime = (s?: string) =>
//     s
//         ? new Date(s).toLocaleString("en-IN", {
//               day: "2-digit", month: "short", year: "numeric",
//               hour: "2-digit", minute: "2-digit",
//           })
//         : "—";

// // ─── Sub-components ───────────────────────────────────────────────────────────
// function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
//     return (
//         <div className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
//             <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800">
//                 <span className="text-blue-500">{icon}</span>
//                 <h3 className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
//                     {title}
//                 </h3>
//             </div>
//             <div className="bg-white dark:bg-gray-900 p-4">{children}</div>
//         </div>
//     );
// }

// function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
//     return (
//         <div className="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-gray-800 last:border-0 gap-4">
//             <span className="text-xs text-gray-400 dark:text-gray-500">{label}</span>
//             <span className={`text-xs font-medium text-right ${highlight ? "text-blue-600 dark:text-blue-400 font-bold text-sm" : "text-gray-700 dark:text-gray-300"}`}>
//                 {value}
//             </span>
//         </div>
//     );
// }

// function InfoChip({ label, value, full }: { label: string; value: React.ReactNode; full?: boolean }) {
//     return (
//         <div className={`bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 ${full ? "col-span-2" : ""}`}>
//             <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">{label}</p>
//             <div className="text-[13px] font-medium text-gray-700 dark:text-gray-200">{value}</div>
//         </div>
//     );
// }

// // ─── Main Component ───────────────────────────────────────────────────────────
// export default function DetailDrawer({
//     order,
//     onClose,
//     onRefresh,
// }: {
//     order: Order;
//     onClose: () => void;
//     onRefresh: () => Promise<void>;
// }) {
//     const stage = STAGE_MAP[order.pipelineStatus];

//     // Pricing calculations
//     const subtotal = order.bookingItems.reduce((s, i) => s + (i.totalAmount || 0), 0);
//     const totalDiscount = (order.negotiationLogs || []).reduce((s, l) => s + (l.discountAmount || 0), 0);
//     const taxable = subtotal - totalDiscount;
//     const gstAmt = Math.floor(taxable * 0.18);
//     const finalNet = taxable + gstAmt;

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
//             <div className="bg-white dark:bg-gray-900 w-full max-w-3xl max-h-[70vh] flex flex-col shadow-2xl rounded-2xl border border-gray-100 dark:border-gray-800">

//                 {/* ── Header ────────────────────────────────────────────────── */}
//                 <div className="flex-shrink-0 px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between gap-3">
//                     {/* Left: icon + title */}
//                     <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
//                             <FileText size={20} className="text-blue-500" />
//                         </div>
//                         <div>
//                             <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white leading-tight">
//                                 Order details
//                             </h2>
//                             <p className="text-xs text-gray-400 mt-0.5">{order.orderId}</p>
//                         </div>
//                     </div>

//                     {/* Right: badges + close */}
//                     <div className="flex items-start gap-2 flex-wrap justify-end">
//                         {stage && (
//                             <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300">
//                                 <span className={`w-1.5 h-1.5 rounded-full ${stage.dot}`} />
//                                 {stage.label}
//                             </span>
//                         )}
//                         {order.handlerName && (
//                             <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300">
//                                 <User size={10} />
//                                 {order.handlerName}
//                             </span>
//                         )}
//                         <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 px-2.5 py-1 rounded-full bg-gray-50 dark:bg-gray-800">
//                             <Clock size={10} />
//                             {fmtDatetime(order.updatedAt)}
//                         </span>
//                         <button
//                             onClick={onClose}
//                             className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-500 flex items-center justify-center transition-colors"
//                         >
//                             <X size={14} />
//                         </button>
//                     </div>
//                 </div>

//                 {/* ── Scrollable body ───────────────────────────────────────── */}
//                 <div className="flex-1 overflow-y-auto p-5 space-y-4">

//                     {/* 1. Customer Information */}
//                     <Section icon={<User size={14} />} title="Customer information">
//                         <div className="grid grid-cols-2 gap-2">
//                             <InfoChip label="Order ID" value={order.orderId} />
//                             <InfoChip label="Phone" value={order.phone} />
//                             <InfoChip label="Name" value={order.name} />
//                             {order.email && <InfoChip label="Email" value={order.email} />}
//                             <InfoChip
//                                 label="Customer type"
//                                 value={
//                                     <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full inline-block ${
//                                         order.customerType === 1
//                                             ? "bg-emerald-50 text-emerald-700"
//                                             : "bg-blue-50 text-blue-700"
//                                     }`}>
//                                         {order.customerType === 1 ? "New customer" : order.customerType === 0 ? "Existing customer" : "Not set"}
//                                     </span>
//                                 }
//                             />
//                             {order.address && <InfoChip label="Address" value={order.address} full />}
//                         </div>
//                     </Section>

//                     {/* 2. Vehicle Bookings */}
//                     <Section icon={<Car size={14} />} title="Vehicle bookings">
//                         <div className="overflow-x-auto -mx-1">
//                             <table className="w-full text-xs">
//                                 <thead>
//                                     <tr className="bg-gray-50 dark:bg-gray-800/60">
//                                         {["Vehicle", "City", "Qty", "From", "To", "Days", "Total"].map((h) => (
//                                             <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap first:rounded-l-lg last:rounded-r-lg">
//                                                 {h}
//                                             </th>
//                                         ))}
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {order.bookingItems.map((item, i) => (
//                                         <tr key={i} className="border-b border-gray-50 dark:border-gray-800 last:border-0">
//                                             <td className="px-3 py-2.5 font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">{item.vehicleModel}</td>
//                                             <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{item.city}</td>
//                                             <td className="px-3 py-2.5 text-gray-500">{item.quantity}</td>
//                                             <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{fmtDate(item.fromDate)}</td>
//                                             <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{fmtDate(item.toDate)}</td>
//                                             <td className="px-3 py-2.5 text-gray-500">{item.totalDays}</td>
//                                             <td className="px-3 py-2.5 font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">{fmt(item.totalAmount)}</td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                         <div className="flex justify-end mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
//                             <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
//                                 Total: <span className="text-blue-600">{fmt(order.grandTotal)}</span>
//                             </span>
//                         </div>
//                     </Section>

//                     {/* 3. Customer Negotiation Form */}
//                     <NegotiationForm order={order} onNegotiationSaved={onRefresh} />

//                     {/* 4. Negotiation History */}
//                     {order.negotiationLogs && order.negotiationLogs.length > 0 && (
//                         <Section icon={<History size={14} />} title="Negotiation history">
//                             <div className="space-y-2">
//                                 {order.negotiationLogs
//                                     .filter((log) => (log.discountAmount || 0) > 0)
//                                     .map((log, i) => (
//                                         <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
//                                             <div className="flex items-center gap-2.5">
//                                                 <span className="w-6 h-6 rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
//                                                     {i + 1}
//                                                 </span>
//                                                 <div>
//                                                     <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
//                                                         {log.fromStage} → {log.toStage}
//                                                     </p>
//                                                     <p className="text-[10px] text-gray-400 mt-0.5">
//                                                         {log.movedBy} · {fmtDate(log.movedAt)}
//                                                     </p>
//                                                 </div>
//                                             </div>
//                                             <span className="text-xs font-semibold text-red-600">
//                                                 − {fmt(log.discountAmount)}
//                                             </span>
//                                         </div>
//                                     ))}
//                                 <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-800">
//                                     <span className="text-xs text-gray-500">Negotiation total</span>
//                                     <span className="text-sm font-bold text-gray-800 dark:text-white">
//                                         {fmt(order.grandNegotiationTotal ?? order.grandTotal)}
//                                     </span>
//                                 </div>
//                             </div>
//                         </Section>
//                     )}

//                     {/* 5. Pipeline History */}
//                     <Section icon={<GitBranch size={14} />} title="Pipeline history">
//                         <div className="space-y-0">
//                             {[...order.pipelineLogs].reverse().map((log, i, arr) => {
//                                 const toStage = STAGE_MAP[log.toStage];
//                                 const isLast = i === arr.length - 1;
//                                 return (
//                                     <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
//                                         <div className="flex flex-col items-center gap-0 pt-1">
//                                             <span
//                                                 className="w-2.5 h-2.5 rounded-full flex-shrink-0"
//                                                 style={{ background: toStage?.color || "#888780" }}
//                                             />
//                                             {!isLast && (
//                                                 <span className="w-px flex-1 bg-gray-100 dark:bg-gray-800 mt-1" style={{ minHeight: 16 }} />
//                                             )}
//                                         </div>
//                                         <div className="pb-1">
//                                             <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
//                                                 {log.fromStage
//                                                     ? `${STAGE_MAP[log.fromStage]?.label || log.fromStage} → ${toStage?.label || log.toStage}`
//                                                     : `Start → ${toStage?.label || log.toStage}`}
//                                             </p>
//                                             {log.handlerName && (
//                                                 <p className="text-[10px] text-violet-500 mt-0.5">Handler: {log.handlerName}</p>
//                                             )}
//                                             <p className="text-[10px] text-gray-400 mt-0.5">
//                                                 {log.movedBy} · {fmtDate(log.movedAt)}
//                                             </p>
//                                         </div>
//                                     </div>
//                                 );
//                             })}
//                         </div>
//                     </Section>

//                     {/* 6. Pricing */}
//                     <Section icon={<ReceiptText size={14} />} title="Pricing">
//                         <div className="space-y-0">
//                             <Row label="Subtotal" value={fmt(subtotal)} />
//                             {totalDiscount > 0 && (
//                                 <Row label="Discount" value={`− ${fmt(totalDiscount)}`} />
//                             )}
//                             <Row label="Taxable amount" value={fmt(taxable)} />
//                             <Row label="GST (18%)" value={fmt(gstAmt)} />
//                         </div>
//                         <div className="mt-3 flex items-center justify-between px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
//                             <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Final net total</span>
//                             <span className="text-base font-bold text-blue-700 dark:text-blue-300">{fmt(finalNet)}</span>
//                         </div>
//                     </Section>

//                     {/* PO Document */}
//                     {order.poDocument && (
//                         <Section icon={<FileText size={14} />} title="PO document">
//                             <a
//                                 href={order.poDocument}
//                                 target="_blank"
//                                 rel="noreferrer"
//                                 className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
//                             >
//                                 📄 View PO Document
//                             </a>
//                         </Section>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }



// "use client";

// import { X } from "lucide-react";
// import NegotiationForm from "./customernegotiationForm";

// // ─── Types ────────────────────────────────────────────────────────────────────
// interface Order {
//     _id: string;
//     orderId: string;
//     name: string;
//     phone: string;
//     email?: string;
//     address?: string;
//     customerType?: number;
//     pipelineStatus: string;
//     handlerName?: string;
//     updatedAt: string;
//     grandTotal: number;
//     grandGst?: number;
//     grandNegotiationTotal?: number;
//     bookingItems: BookingItem[];
//     negotiationLogs?: NegotiationLog[];
//     pipelineLogs: PipelineLog[];
//     poDocument?: string;
// }

// interface BookingItem {
//     vehicleModel: string;
//     city: string;
//     quantity: number;
//     fromDate: string;
//     toDate: string;
//     totalDays: number;
//     totalAmount: number;
//     perDayRentalCost?: number;
// }

// interface NegotiationLog {
//     fromStage: string;
//     toStage: string;
//     amount?: number;
//     discountAmount?: number;
//     movedBy: string;
//     movedAt: string;
// }

// interface PipelineLog {
//     fromStage?: string;
//     toStage: string;
//     handlerName?: string;
//     movedBy: string;
//     movedAt: string;
// }

// // ─── Stage Map ────────────────────────────────────────────────────────────────
// const STAGE_MAP: Record<string, { label: string; emoji: string; dot: string; color: string; bg: string; text: string }> = {
//     todo:                 { label: "To Do",                 emoji: "📋", dot: "bg-gray-400",   color: "#888780", bg: "bg-gray-100 dark:bg-gray-800",       text: "text-gray-600 dark:text-gray-300" },
//     inProgress:           { label: "In Progress",           emoji: "🔄", dot: "bg-blue-500",   color: "#378ADD", bg: "bg-blue-50 dark:bg-blue-900/30",     text: "text-blue-700 dark:text-blue-300" },
//     newOrder:             { label: "New Order",             emoji: "🆕", dot: "bg-violet-500", color: "#7F77DD", bg: "bg-violet-50 dark:bg-violet-900/30", text: "text-violet-700 dark:text-violet-300" },
//     inquiry:              { label: "Inquiry",               emoji: "🔍", dot: "bg-amber-400",  color: "#EF9F27", bg: "bg-amber-50 dark:bg-amber-900/30",   text: "text-amber-700 dark:text-amber-300" },
//     followUp:             { label: "Follow-up",             emoji: "📞", dot: "bg-orange-400", color: "#D85A30", bg: "bg-orange-50 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300" },
//     customerConfirmation: { label: "Customer Confirmation", emoji: "✅", dot: "bg-teal-500",   color: "#1D9E75", bg: "bg-teal-50 dark:bg-teal-900/30",     text: "text-teal-700 dark:text-teal-300" },
//     booked:               { label: "Booked",                emoji: "🎉", dot: "bg-green-500",  color: "#639922", bg: "bg-green-50 dark:bg-green-900/30",   text: "text-green-700 dark:text-green-300" },
//     cancelled:            { label: "Cancelled",             emoji: "❌", dot: "bg-red-500",    color: "#E24B4A", bg: "bg-red-50 dark:bg-red-900/30",       text: "text-red-700 dark:text-red-300" },
// };

// // ─── Formatters ───────────────────────────────────────────────────────────────
// const fmt = (n?: number | null) =>
//     n != null ? `₹ ${n.toLocaleString("en-IN")}` : "—";

// const fmtDate = (s?: string) =>
//     s ? new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

// const fmtDatetime = (s?: string) =>
//     s
//         ? new Date(s).toLocaleString("en-IN", {
//               day: "2-digit", month: "short", year: "numeric",
//               hour: "2-digit", minute: "2-digit",
//           })
//         : "—";

// // ─── Sub-components ───────────────────────────────────────────────────────────
// function Section({ emoji, title, children, accent = "blue" }: {
//     emoji: string;
//     title: string;
//     children: React.ReactNode;
//     accent?: "blue" | "violet" | "amber" | "green" | "rose" | "teal";
// }) {
//     const accents: Record<string, string> = {
//         blue:   "from-blue-500/10 to-blue-500/5 border-blue-100 dark:border-blue-900/50",
//         violet: "from-violet-500/10 to-violet-500/5 border-violet-100 dark:border-violet-900/50",
//         amber:  "from-amber-500/10 to-amber-500/5 border-amber-100 dark:border-amber-900/50",
//         green:  "from-green-500/10 to-green-500/5 border-green-100 dark:border-green-900/50",
//         rose:   "from-rose-500/10 to-rose-500/5 border-rose-100 dark:border-rose-900/50",
//         teal:   "from-teal-500/10 to-teal-500/5 border-teal-100 dark:border-teal-900/50",
//     };
//     const headerAccents: Record<string, string> = {
//         blue:   "from-blue-50 to-blue-50/40 dark:from-blue-900/20 dark:to-transparent border-blue-100 dark:border-blue-900/40",
//         violet: "from-violet-50 to-violet-50/40 dark:from-violet-900/20 dark:to-transparent border-violet-100 dark:border-violet-900/40",
//         amber:  "from-amber-50 to-amber-50/40 dark:from-amber-900/20 dark:to-transparent border-amber-100 dark:border-amber-900/40",
//         green:  "from-green-50 to-green-50/40 dark:from-green-900/20 dark:to-transparent border-green-100 dark:border-green-900/40",
//         rose:   "from-rose-50 to-rose-50/40 dark:from-rose-900/20 dark:to-transparent border-rose-100 dark:border-rose-900/40",
//         teal:   "from-teal-50 to-teal-50/40 dark:from-teal-900/20 dark:to-transparent border-teal-100 dark:border-teal-900/40",
//     };

//     return (
//         <div className={`rounded-2xl border overflow-hidden shadow-sm ${accents[accent]}`}>
//             <div className={`flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r border-b ${headerAccents[accent]}`}>
//                 <span className="text-xl leading-none">{emoji}</span>
//                 <h3 className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
//                     {title}
//                 </h3>
//             </div>
//             <div className="bg-white dark:bg-gray-900 p-4">{children}</div>
//         </div>
//     );
// }

// function Row({ label, value, highlight, emoji }: { label: string; value: string; highlight?: boolean; emoji?: string }) {
//     return (
//         <div className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800/80 last:border-0 gap-4">
//             <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
//                 {emoji && <span>{emoji}</span>}
//                 {label}
//             </span>
//             <span className={`text-xs font-semibold text-right ${highlight ? "text-blue-600 dark:text-blue-400 font-bold text-sm" : "text-gray-700 dark:text-gray-300"}`}>
//                 {value}
//             </span>
//         </div>
//     );
// }

// function InfoChip({ label, value, full, emoji }: { label: string; value: React.ReactNode; full?: boolean; emoji?: string }) {
//     return (
//         <div className={`bg-gray-50 dark:bg-gray-800/60 rounded-xl p-3 border border-gray-100 dark:border-gray-800 ${full ? "col-span-2" : ""}`}>
//             <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
//                 {emoji && <span>{emoji}</span>}
//                 {label}
//             </p>
//             <div className="text-[13px] font-semibold text-gray-800 dark:text-gray-100">{value}</div>
//         </div>
//     );
// }

// // ─── Main Component ───────────────────────────────────────────────────────────
// export default function DetailDrawer({
//     order,
//     onClose,
//     onRefresh,
// }: {
//     order: Order;
//     onClose: () => void;
//     onRefresh: () => Promise<void>;
// }) {
//     const stage = STAGE_MAP[order.pipelineStatus];

//     // Pricing calculations
//     const subtotal = order.bookingItems.reduce((s, i) => s + (i.totalAmount || 0), 0);
//     const totalDiscount = (order.negotiationLogs || []).reduce((s, l) => s + (l.discountAmount || 0), 0);
//     const taxable = subtotal - totalDiscount;
//     const gstAmt = Math.floor(taxable * 0.18);
//     const finalNet = taxable + gstAmt;

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
//             <div className="bg-white dark:bg-gray-950 w-full max-w-3xl max-h-[70vh] flex flex-col shadow-2xl rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden">

//                 {/* ── Header ────────────────────────────────────────────────── */}
//                 <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between gap-3 bg-gradient-to-r from-slate-50 to-white dark:from-gray-900 dark:to-gray-950">
//                     {/* Left: icon + title */}
//                     <div className="flex items-center gap-3.5">
//                         <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-200 dark:shadow-blue-900/40">
//                             <span className="text-2xl">📄</span>
//                         </div>
//                         <div>
//                             <h2 className="text-[16px] font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
//                                 Order Details
//                             </h2>
//                             <p className="text-xs text-gray-400 mt-0.5 font-mono">#{order.orderId}</p>
//                         </div>
//                     </div>

//                     {/* Right: badges + close */}
//                     <div className="flex items-start gap-2 flex-wrap justify-end">
//                         {stage && (
//                             <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full ${stage.bg} ${stage.text} shadow-sm`}>
//                                 <span>{stage.emoji}</span>
//                                 {stage.label}
//                             </span>
//                         )}
//                         {order.handlerName && (
//                             <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 shadow-sm">
//                                 👤 {order.handlerName}
//                             </span>
//                         )}
//                         <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-400 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-800 shadow-sm">
//                             🕒 {fmtDatetime(order.updatedAt)}
//                         </span>
//                         <button
//                             onClick={onClose}
//                             className="w-9 h-9 rounded-full bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-500 flex items-center justify-center transition-all hover:scale-110 shadow-sm"
//                         >
//                             <X size={15} />
//                         </button>
//                     </div>
//                 </div>

//                 {/* ── Scrollable body ───────────────────────────────────────── */}
//                 <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/50 dark:bg-gray-950">

//                     {/* 1. Customer Information */}
//                     <Section emoji="👤" title="Customer Information" accent="blue">
//                         <div className="grid grid-cols-2 gap-2.5">
//                             <InfoChip emoji="🪪" label="Order ID" value={<span className="font-mono text-blue-600 dark:text-blue-400">{order.orderId}</span>} />
//                             <InfoChip emoji="📱" label="Phone" value={order.phone} />
//                             <InfoChip emoji="🙋" label="Name" value={order.name} />
//                             {order.email && <InfoChip emoji="📧" label="Email" value={order.email} />}
//                             <InfoChip
//                                 emoji="🏷️"
//                                 label="Customer Type"
//                                 value={
//                                     <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${
//                                         order.customerType === 1
//                                             ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
//                                             : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
//                                     }`}>
//                                         {order.customerType === 1 ? "🌟 New Customer" : order.customerType === 0 ? "🔁 Existing Customer" : "❓ Not Set"}
//                                     </span>
//                                 }
//                             />
//                             {order.address && <InfoChip emoji="📍" label="Address" value={order.address} full />}
//                         </div>
//                     </Section>

//                     {/* 2. Vehicle Bookings */}
//                     <Section emoji="🚗" title="Vehicle Bookings" accent="violet">
//                         <div className="overflow-x-auto -mx-1 rounded-xl">
//                             <table className="w-full text-xs">
//                                 <thead>
//                                     <tr className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
//                                         {[
//                                             { h: "🚙 Vehicle", k: "Vehicle" },
//                                             { h: "📍 City", k: "City" },
//                                             { h: "🔢 Qty", k: "Qty" },
//                                             { h: "📅 From", k: "From" },
//                                             { h: "📅 To", k: "To" },
//                                             { h: "⏳ Days", k: "Days" },
//                                             { h: "💰 Total", k: "Total" },
//                                         ].map(({ h, k }) => (
//                                             <th key={k} className="text-left px-3 py-2.5 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap first:rounded-l-lg last:rounded-r-lg">
//                                                 {h}
//                                             </th>
//                                         ))}
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {order.bookingItems.map((item, i) => (
//                                         <tr key={i} className="border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-violet-50/40 dark:hover:bg-violet-900/10 transition-colors">
//                                             <td className="px-3 py-3 font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap">{item.vehicleModel}</td>
//                                             <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{item.city}</td>
//                                             <td className="px-3 py-3 text-gray-500 font-semibold">{item.quantity}</td>
//                                             <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{fmtDate(item.fromDate)}</td>
//                                             <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{fmtDate(item.toDate)}</td>
//                                             <td className="px-3 py-3 text-gray-500 font-semibold">{item.totalDays}d</td>
//                                             <td className="px-3 py-3 font-bold text-violet-600 dark:text-violet-400 whitespace-nowrap">{fmt(item.totalAmount)}</td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                         <div className="flex justify-end mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
//                             <div className="flex items-center gap-2 bg-violet-50 dark:bg-violet-900/20 px-4 py-2 rounded-xl border border-violet-100 dark:border-violet-800">
//                                 <span className="text-sm text-violet-600 dark:text-violet-400 font-semibold">💼 Grand Total:</span>
//                                 <span className="text-base font-bold text-violet-700 dark:text-violet-300">{fmt(order.grandTotal)}</span>
//                             </div>
//                         </div>
//                     </Section>

//                     {/* 3. Customer Negotiation Form */}
//                     <NegotiationForm order={order} onNegotiationSaved={onRefresh} />

//                     {/* 4. Negotiation History */}
//                     {order.negotiationLogs && order.negotiationLogs.length > 0 && (
//                         <Section emoji="🤝" title="Negotiation History" accent="amber">
//                             <div className="space-y-2.5">
//                                 {order.negotiationLogs
//                                     .filter((log) => (log.discountAmount || 0) > 0)
//                                     .map((log, i) => (
//                                         <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-100 dark:border-amber-800/40 shadow-sm">
//                                             <div className="flex items-center gap-3">
//                                                 <span className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
//                                                     {i + 1}
//                                                 </span>
//                                                 <div>
//                                                     <p className="text-xs font-bold text-gray-700 dark:text-gray-200">
//                                                         🔀 {log.fromStage} → {log.toStage}
//                                                     </p>
//                                                     <p className="text-[10px] text-gray-400 mt-0.5">
//                                                         👤 {log.movedBy} · 📅 {fmtDate(log.movedAt)}
//                                                     </p>
//                                                 </div>
//                                             </div>
//                                             <span className="text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-lg border border-red-100 dark:border-red-800/40">
//                                                 🔻 {fmt(log.discountAmount)}
//                                             </span>
//                                         </div>
//                                     ))}
//                                 <div className="flex justify-between items-center pt-3 border-t border-amber-100 dark:border-amber-900/40 mt-2">
//                                     <span className="text-xs text-gray-500 font-semibold flex items-center gap-1.5">🧮 Negotiation Total</span>
//                                     <span className="text-sm font-bold text-gray-800 dark:text-white">
//                                         {fmt(order.grandNegotiationTotal ?? order.grandTotal)}
//                                     </span>
//                                 </div>
//                             </div>
//                         </Section>
//                     )}

//                     {/* 5. Pipeline History */}
//                     <Section emoji="🔀" title="Pipeline History" accent="teal">
//                         <div className="space-y-0">
//                             {[...order.pipelineLogs].reverse().map((log, i, arr) => {
//                                 const toStage = STAGE_MAP[log.toStage];
//                                 const fromStageMeta = log.fromStage ? STAGE_MAP[log.fromStage] : null;
//                                 const isLast = i === arr.length - 1;
//                                 return (
//                                     <div key={i} className="flex items-start gap-3.5 py-2.5 border-b border-gray-50 dark:border-gray-800 last:border-0">
//                                         <div className="flex flex-col items-center gap-0 pt-1">
//                                             <span
//                                                 className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm ring-2 ring-white dark:ring-gray-900"
//                                                 style={{ background: toStage?.color || "#888780" }}
//                                             />
//                                             {!isLast && (
//                                                 <span className="w-px flex-1 bg-gray-100 dark:bg-gray-800 mt-1" style={{ minHeight: 20 }} />
//                                             )}
//                                         </div>
//                                         <div className="pb-1">
//                                             <p className="text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1 flex-wrap">
//                                                 {log.fromStage
//                                                     ? <><span>{fromStageMeta?.emoji || "📌"}</span><span>{STAGE_MAP[log.fromStage]?.label || log.fromStage}</span><span className="text-gray-400 mx-0.5">→</span><span>{toStage?.emoji || "📌"}</span><span>{toStage?.label || log.toStage}</span></>
//                                                     : <><span>🚀</span><span>Start</span><span className="text-gray-400 mx-0.5">→</span><span>{toStage?.emoji || "📌"}</span><span>{toStage?.label || log.toStage}</span></>
//                                                 }
//                                             </p>
//                                             {log.handlerName && (
//                                                 <p className="text-[10px] text-violet-500 mt-0.5 font-semibold">🙋 Handler: {log.handlerName}</p>
//                                             )}
//                                             <p className="text-[10px] text-gray-400 mt-0.5">
//                                                 👤 {log.movedBy} · 📅 {fmtDate(log.movedAt)}
//                                             </p>
//                                         </div>
//                                     </div>
//                                 );
//                             })}
//                         </div>
//                     </Section>

//                     {/* 6. Pricing */}
//                     <Section emoji="🧾" title="Pricing Summary" accent="green">
//                         <div className="space-y-0 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800">
//                             <Row emoji="📊" label="Subtotal" value={fmt(subtotal)} />
//                             {totalDiscount > 0 && (
//                                 <Row emoji="🎁" label="Discount" value={`− ${fmt(totalDiscount)}`} />
//                             )}
//                             <Row emoji="💼" label="Taxable Amount" value={fmt(taxable)} />
//                             <Row emoji="🏛️" label="GST (18%)" value={fmt(gstAmt)} />
//                         </div>
//                         <div className="mt-3 flex items-center justify-between px-5 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg shadow-green-200 dark:shadow-green-900/30">
//                             <span className="text-sm font-bold text-white flex items-center gap-2">
//                                 💰 Final Net Total
//                             </span>
//                             <span className="text-xl font-extrabold text-white">{fmt(finalNet)}</span>
//                         </div>
//                     </Section>

//                     {/* PO Document */}
//                     {order.poDocument && (
//                         <Section emoji="📎" title="PO Document" accent="rose">
//                             <a
//                                 href={order.poDocument}
//                                 target="_blank"
//                                 rel="noreferrer"
//                                 className="inline-flex items-center gap-2.5 text-sm font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-4 py-2.5 rounded-xl border border-rose-100 dark:border-rose-800/40 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors shadow-sm"
//                             >
//                                 📄 View PO Document
//                                 <span className="text-xs text-rose-400">→</span>
//                             </a>
//                         </Section>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }


"use client";

import { Clock, Car, User, ReceiptText, GitBranch, Percent, History, X, FileText } from "lucide-react";
import NegotiationForm from "./customernegotiationForm";

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
}

interface PipelineLog {
    fromStage?: string;
    toStage: string;
    handlerName?: string;
    movedBy: string;
    movedAt: string;
}

// ─── Stage Map ────────────────────────────────────────────────────────────────
const STAGE_MAP: Record<string, { label: string; dot: string; color: string; emoji: string }> = {
    todo:                 { label: "To Do",                 dot: "bg-gray-400",   color: "#888780", emoji: "📝" },
    inProgress:           { label: "In Progress",           dot: "bg-blue-500",   color: "#378ADD", emoji: "⚡" },
    newOrder:             { label: "New Order",             dot: "bg-violet-500", color: "#7F77DD", emoji: "🆕" },
    inquiry:              { label: "Inquiry",               dot: "bg-amber-400",  color: "#EF9F27", emoji: "🔍" },
    followUp:             { label: "Follow-up",             dot: "bg-orange-400", color: "#D85A30", emoji: "📞" },
    customerConfirmation: { label: "Customer Confirmation", dot: "bg-teal-500",   color: "#1D9E75", emoji: "✅" },
    booked:               { label: "Booked",                dot: "bg-green-500",  color: "#639922", emoji: "🎉" },
    cancelled:            { label: "Cancelled",             dot: "bg-red-500",    color: "#E24B4A", emoji: "❌" },
};

// ─── Section color themes ─────────────────────────────────────────────────────
const SECTION_THEMES = {
    purple: {
        header: "bg-[#EEEDFE] dark:bg-[#26215C]/40 border-[#CECBF6] dark:border-[#3C3489]",
        icon: "text-[#534AB7] dark:text-[#AFA9EC]",
    },
    blue: {
        header: "bg-[#E6F1FB] dark:bg-[#042C53]/40 border-[#B5D4F4] dark:border-[#185FA5]",
        icon: "text-[#185FA5] dark:text-[#85B7EB]",
    },
    green: {
        header: "bg-[#EAF3DE] dark:bg-[#173404]/40 border-[#C0DD97] dark:border-[#3B6D11]",
        icon: "text-[#3B6D11] dark:text-[#97C459]",
    },
    amber: {
        header: "bg-[#FAEEDA] dark:bg-[#412402]/40 border-[#FAC775] dark:border-[#854F0B]",
        icon: "text-[#854F0B] dark:text-[#EF9F27]",
    },
    teal: {
        header: "bg-[#E1F5EE] dark:bg-[#04342C]/40 border-[#9FE1CB] dark:border-[#0F6E56]",
        icon: "text-[#0F6E56] dark:text-[#5DCAA5]",
    },
    coral: {
        header: "bg-[#FAECE7] dark:bg-[#4A1B0C]/40 border-[#F5C4B3] dark:border-[#993C1D]",
        icon: "text-[#993C1D] dark:text-[#F0997B]",
    },
};

// ─── Formatters ───────────────────────────────────────────────────────────────
const fmt = (n?: number | null) =>
    n != null ? `₹ ${n.toLocaleString("en-IN")}` : "—";

const fmtDate = (s?: string) =>
    s ? new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const fmtDatetime = (s?: string) =>
    s
        ? new Date(s).toLocaleString("en-IN", {
              day: "2-digit", month: "short", year: "numeric",
              hour: "2-digit", minute: "2-digit",
          })
        : "—";

// ─── Sub-components ───────────────────────────────────────────────────────────
function Section({
    icon,
    title,
    emoji,
    theme = "blue",
    children,
}: {
    icon: React.ReactNode;
    title: string;
    emoji: string;
    theme?: keyof typeof SECTION_THEMES;
    children: React.ReactNode;
}) {
    const t = SECTION_THEMES[theme];
    return (
        <div className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className={`flex items-center gap-2 px-4 py-2.5 border-b ${t.header}`}>
                <span className={t.icon}>{icon}</span>
                <span className="text-sm">{emoji}</span>
                <h3 className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    {title}
                </h3>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4">{children}</div>
        </div>
    );
}

function Row({ label, value, emoji, highlight }: { label: string; value: string; emoji?: string; highlight?: boolean }) {
    return (
        <div className="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-gray-800 last:border-0 gap-4">
            <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                {emoji && <span>{emoji}</span>}
                {label}
            </span>
            <span className={`text-xs font-medium text-right ${highlight ? "text-blue-600 dark:text-blue-400 font-bold text-sm" : "text-gray-700 dark:text-gray-300"}`}>
                {value}
            </span>
        </div>
    );
}

function InfoChip({ label, value, emoji, full }: { label: string; value: React.ReactNode; emoji?: string; full?: boolean }) {
    return (
        <div className={`bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 ${full ? "col-span-2" : ""}`}>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                {emoji && <span>{emoji}</span>}
                {label}
            </p>
            <div className="text-[13px] font-medium text-gray-700 dark:text-gray-200">{value}</div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
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

    // Pricing calculations
    const subtotal = order.bookingItems.reduce((s, i) => s + (i.totalAmount || 0), 0);
    const totalDiscount = (order.negotiationLogs || []).reduce((s, l) => s + (l.discountAmount || 0), 0);
    const taxable = subtotal - totalDiscount;
    const gstAmt = Math.floor(taxable * 0.18);
    const finalNet = taxable + gstAmt;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 w-full max-w-3xl max-h-[70vh] flex flex-col shadow-2xl rounded-2xl border border-gray-100 dark:border-gray-800">

                {/* ── Header ─────────────────────────────────────────────── */}
                <div className="flex-shrink-0 px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-xl">📋</span>
                        </div>
                        <div>
                            <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white leading-tight">
                                Order details
                            </h2>
                            <p className="text-xs text-gray-400 mt-0.5">{order.orderId}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-2 flex-wrap justify-end">
                        {stage && (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300">
                                <span className={`w-1.5 h-1.5 rounded-full ${stage.dot}`} />
                                {stage.emoji} {stage.label}
                            </span>
                        )}
                        {order.handlerName && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300">
                                👤 {order.handlerName}
                            </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 px-2.5 py-1 rounded-full bg-gray-50 dark:bg-gray-800">
                            <Clock size={10} />
                            {fmtDatetime(order.updatedAt)}
                        </span>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-500 flex items-center justify-center transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>

                {/* ── Scrollable body ───────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">

                    {/* 1. Customer Information */}
                    <Section icon={<User size={14} />} title="Customer information" emoji="👤" theme="purple">
                        <div className="grid grid-cols-2 gap-2">
                            <InfoChip label="Order ID"    emoji="🆔" value={order.orderId} />
                            <InfoChip label="Phone"       emoji="📞" value={order.phone} />
                            <InfoChip label="Name"        emoji="👤" value={order.name} />
                            {order.email && <InfoChip label="Email" emoji="📧" value={order.email} />}
                            <InfoChip
                                label="Customer type"
                                emoji="🏷️"
                                value={
                                    <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full inline-block ${
                                        order.customerType === 1
                                            ? "bg-emerald-50 text-emerald-700"
                                            : "bg-blue-50 text-blue-700"
                                    }`}>
                                        {order.customerType === 1 ? "🌱 New customer" : order.customerType === 0 ? "🔄 Existing customer" : "❓ Not set"}
                                    </span>
                                }
                            />
                            {order.address && <InfoChip label="Address" emoji="📍" value={order.address} full />}
                        </div>
                    </Section>

                    {/* 2. Vehicle Bookings */}
                    <Section icon={<Car size={14} />} title="Vehicle bookings" emoji="🚗" theme="blue">
                        <div className="overflow-x-auto -mx-1">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800/60">
                                        {[
                                            { h: "Vehicle", e: "🚙" },
                                            { h: "City", e: "🏙️" },
                                            { h: "Qty", e: "🔢" },
                                            { h: "From", e: "📅" },
                                            { h: "To", e: "📅" },
                                            { h: "Days", e: "⏱️" },
                                            { h: "Total", e: "💰" },
                                        ].map(({ h, e }) => (
                                            <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap first:rounded-l-lg last:rounded-r-lg">
                                                {e} {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.bookingItems.map((item, i) => (
                                        <tr key={i} className="border-b border-gray-50 dark:border-gray-800 last:border-0">
                                            <td className="px-3 py-2.5 font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">🚗 {item.vehicleModel}</td>
                                            <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">📍 {item.city}</td>
                                            <td className="px-3 py-2.5 text-gray-500">{item.quantity}</td>
                                            <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{fmtDate(item.fromDate)}</td>
                                            <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{fmtDate(item.toDate)}</td>
                                            <td className="px-3 py-2.5 text-gray-500">{item.totalDays}d</td>
                                            <td className="px-3 py-2.5 font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">{fmt(item.totalAmount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-end mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                💵 Total: <span className="text-blue-600">{fmt(order.grandTotal)}</span>
                            </span>
                        </div>
                    </Section>

                    {/* 3. Customer Negotiation Form */}
                    <NegotiationForm order={order} onNegotiationSaved={onRefresh} />

                    {/* 4. Negotiation History */}
                    {order.negotiationLogs && order.negotiationLogs.length > 0 && (
                        <Section icon={<History size={14} />} title="Negotiation history" emoji="🤝" theme="amber">
                            <div className="space-y-2">
                                {order.negotiationLogs
                                    .filter((log) => (log.discountAmount || 0) > 0)
                                    .map((log, i) => (
                                        <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-amber-50/60 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
                                            <div className="flex items-center gap-2.5">
                                                <span className="w-6 h-6 rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                                                    {i + 1}
                                                </span>
                                                <div>
                                                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                        📍 {log.fromStage} → {log.toStage}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                                        👤 {log.movedBy} · 📅 {fmtDate(log.movedAt)}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-semibold text-red-600">
                                                🏷️ − {fmt(log.discountAmount)}
                                            </span>
                                        </div>
                                    ))}
                                <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-800">
                                    <span className="text-xs text-gray-500">🧮 Negotiation total</span>
                                    <span className="text-sm font-bold text-gray-800 dark:text-white">
                                        {fmt(order.grandNegotiationTotal ?? order.grandTotal)}
                                    </span>
                                </div>
                            </div>
                        </Section>
                    )}

                    {/* 5. Pipeline History */}
                    <Section icon={<GitBranch size={14} />} title="Pipeline history" emoji="🔀" theme="teal">
                        <div className="space-y-0">
                            {[...order.pipelineLogs].reverse().map((log, i, arr) => {
                                const toStage = STAGE_MAP[log.toStage];
                                const fromStage = log.fromStage ? STAGE_MAP[log.fromStage] : null;
                                const isLast = i === arr.length - 1;
                                return (
                                    <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                                        <div className="flex flex-col items-center gap-0 pt-1">
                                            <span
                                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                                style={{ background: toStage?.color || "#888780" }}
                                            />
                                            {!isLast && (
                                                <span className="w-px flex-1 bg-gray-100 dark:bg-gray-800 mt-1" style={{ minHeight: 16 }} />
                                            )}
                                        </div>
                                        <div className="pb-1">
                                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                {log.fromStage
                                                    ? `${fromStage?.emoji || ""} ${STAGE_MAP[log.fromStage]?.label || log.fromStage} → ${toStage?.emoji || ""} ${toStage?.label || log.toStage}`
                                                    : `🚀 Start → ${toStage?.emoji || ""} ${toStage?.label || log.toStage}`}
                                            </p>
                                            {log.handlerName && (
                                                <p className="text-[10px] text-violet-500 mt-0.5">🧑‍💼 Handler: {log.handlerName}</p>
                                            )}
                                            <p className="text-[10px] text-gray-400 mt-0.5">
                                                👤 {log.movedBy} · 📅 {fmtDate(log.movedAt)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Section>

                    {/* 6. Pricing */}
                    <Section icon={<ReceiptText size={14} />} title="Pricing breakdown" emoji="💰" theme="green">
                        <div className="space-y-0">
                            <Row label="Subtotal"        emoji="🧾" value={fmt(subtotal)} />
                            {totalDiscount > 0 && (
                                <Row label="Discount"   emoji="🏷️" value={`− ${fmt(totalDiscount)}`} />
                            )}
                            <Row label="Taxable amount" emoji="📊" value={fmt(taxable)} />
                            <Row label="GST (18%)"      emoji="🏛️" value={fmt(gstAmt)} />
                        </div>
                        <div className="mt-3 flex items-center justify-between px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">✅ Final net total</span>
                            <span className="text-base font-bold text-blue-700 dark:text-blue-300">{fmt(finalNet)}</span>
                        </div>
                    </Section>

                    {/* 7. PO Document */}
                    {order.poDocument && (
                        <Section icon={<FileText size={14} />} title="PO document" emoji="📄" theme="coral">
                            <a
                                href={order.poDocument}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                            >
                                📄 View PO Document
                            </a>
                        </Section>
                    )}
                </div>
            </div>
        </div>
    );
}
