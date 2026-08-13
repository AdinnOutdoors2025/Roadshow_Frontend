// /* eslint-disable */
// // @ts-nocheck
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import axios from "axios";
// import toast from "react-hot-toast";
// import {
//   Truck, User, RefreshCw, ChevronDown, ChevronRight as ChevronRightIcon,
//   ArrowRightLeft, AlertTriangle, Gauge, XCircle, Clock,
// } from "lucide-react";
// import { getToken } from "../../utils/auth";
// import API_BASE from "../../../../baseurl";

// const fmtDatetime = (s?: string) => {
//   if (!s) return "—";
//   return new Date(s).toLocaleString("en-IN", {
//     day: "2-digit", month: "short", year: "numeric",
//     hour: "2-digit", minute: "2-digit",
//   });
// };

// const fmtTime = (s?: string) => {
//   if (!s) return "";
//   return new Date(s).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
// };

// const fmtDateLabel = (dateKey: string) =>
//   new Date(dateKey + "T00:00:00.000Z").toLocaleDateString("en-IN", {
//     day: "2-digit", month: "short", year: "numeric", weekday: "short",
//   });

// const getImageUrl = (url: string) => {
//   if (!url) return "";
//   if (url.startsWith("http")) return url;
//   return `${API_BASE.replace("/api", "")}${url}`;
// };

// // Unified per-category presentation metadata: icon, accent color, timestamp field, title/body renderer.
// const CATEGORY_META: Record<string, any> = {
//   driverChangeHistory: {
//     icon: ArrowRightLeft,
//     color: "sky",
//     getTimestamp: (e: any) => e.changedAt,
//     getTitle: (e: any) => e.eventType || "Driver Change",
//     renderBody: (e: any) => (
//       <>
//         {(e.oldDriverName || e.newDriverName) ? (
//           <div className="grid grid-cols-2 gap-2 mt-1.5 text-xs">
//             <div>
//               <p className="text-gray-400">Old Driver</p>
//               <p className="font-semibold text-gray-700 dark:text-gray-300">{e.oldDriverName || "—"} · {fmtPhone(e.oldDriverPhone) || "—"}</p>
//               {e.oldVehicleRegistrationNumber && <p className="font-mono text-gray-500">{e.oldVehicleRegistrationNumber}</p>}
//             </div>
//             <div>
//               <p className="text-gray-400">New Driver</p>
//               <p className="font-semibold text-gray-700 dark:text-gray-300">{e.newDriverName || "—"} · {fmtPhone(e.newDriverPhone) || "—"}</p>
//               {e.newVehicleRegistrationNumber && <p className="font-mono text-gray-500">{e.newVehicleRegistrationNumber}</p>}
//             </div>
//           </div>
//         ) : (
//           <p className="text-xs text-gray-500 mt-1">
//             {e.driverName} · {e.driverPhone} — <span className="font-mono">{e.vehicleRegistrationNumber}</span>
//           </p>
//         )}
//         {e.comments && <p className="text-xs text-gray-400 mt-1.5">Comments: {e.comments}</p>}
//         <p className="text-xs text-gray-400 mt-1">Updated by {e.changedBy || "—"}</p>
//       </>
//     ),
//   },
//   issueHistory: {
//     icon: AlertTriangle,
//     color: "amber",
//     getTimestamp: (e: any) => (e.status === "resolved-today" ? e.resolvedAt || e.createdAt : e.createdAt),
//     getTitle: (e: any) => (e.status === "resolved-today" ? "Issue Resolved" : e.status === "open" ? "Issue Reported" : "Issue"),
//     renderBody: (e: any) => (
//       <>
//         <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{e.issueDescription}</p>
//         {e.issuePhoto && (
//           <a href={getImageUrl(e.issuePhoto)} target="_blank" rel="noreferrer">
//             <img src={getImageUrl(e.issuePhoto)} className="w-14 h-12 rounded-lg object-cover border mt-1.5" alt="issue" />
//           </a>
//         )}
//         {e.resolveDescription && (
//           <div className="mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-800/50">
//             <p className="text-xs text-emerald-600 font-semibold">Resolution</p>
//             <p className="text-xs text-gray-600 dark:text-gray-400">{e.resolveDescription}</p>
//             <p className="text-xs text-gray-400 mt-0.5">By {e.resolvedBy} · {fmtDatetime(e.resolvedAt)}</p>
//           </div>
//         )}
//         <p className="text-xs text-gray-400 mt-1.5">Created by {e.createdBy}</p>
//       </>
//     ),
//   },
//   extraKmHistory: {
//     icon: Gauge,
//     color: "fuchsia",
//     getTimestamp: (e: any) => e.updatedAt,
//     getTitle: (e: any) => `${e.extraKm} km / ${e.extraHours} hrs`,
//     renderBody: (e: any) => (
//       <>
//         <p className="text-xs text-gray-500 mt-1">Logged for period: {e.loggedFor}</p>
//         <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
//           ₹ {Number(e.totalCost || 0).toLocaleString("en-IN")}
//         </p>
//         <p className="text-xs text-gray-400 mt-1">Updated by {e.updatedBy}</p>
//       </>
//     ),
//   },
//   dailyHoursHistory: {
//     icon: Clock,
//     color: "indigo",
//     getTimestamp: (e: any) => e.loggedAt,
//     getTitle: (e: any) => `${e.runningHours} hrs logged`,
//     renderBody: (e: any) => (
//       <>
//         <p className="text-xs text-gray-500 mt-1">
//           {fmtTime(e.startTime)} – {fmtTime(e.endTime)}
//         </p>
//         <div className="flex items-center gap-3 mt-1 text-xs">
//           <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Running: {e.runningHours} hrs</span>
//           {e.absentHours > 0 && <span className="text-amber-600 font-semibold">Absent: {e.absentHours} hrs</span>}
//         </div>
//         {e.remarks && <p className="text-xs text-gray-400 mt-1.5">Remarks: {e.remarks}</p>}
//         <p className="text-xs text-gray-400 mt-1">Logged by {e.loggedBy}</p>
//       </>
//     ),
//   },
//   unavailableHistory: {
//     icon: XCircle,
//     color: "rose",
//     getTimestamp: (e: any) => e.reportedAt,
//     getTitle: (e: any) =>
//       e.eventType === "replaced" ? "Vehicle Replaced" : e.status === "unavailable" ? "Marked Unavailable" : "Marked Available",
//     renderBody: (e: any) => (
//       <>
//         <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{e.reason}</p>
//         {e.photo && (
//           <a href={getImageUrl(e.photo)} target="_blank" rel="noreferrer">
//             <img src={getImageUrl(e.photo)} className="w-14 h-12 rounded-lg object-cover border mt-1.5" alt="unavailable" />
//           </a>
//         )}
//         {e.eventType === "replaced" && (
//           <div className="mt-2 pt-2 border-t border-rose-200 dark:border-rose-800/50 grid grid-cols-2 gap-2 text-xs">
//             <div>
//               <p className="text-gray-400">Old Vehicle</p>
//               <p className="font-mono font-semibold text-gray-700 dark:text-gray-300">{e.vehicleRegistrationNumber}</p>
//             </div>
//             <div>
//               <p className="text-amber-600">Replacement</p>
//               <p className="font-mono font-semibold text-gray-700 dark:text-gray-300">{e.replacementVehicleRegistrationNumber}</p>
//               <p className="text-gray-500">{e.replacementDriverName} · {fmtPhone(e.replacementDriverPhone)}</p>
//             </div>
//           </div>
//         )}
//         {e.resolveDescription && (
//           <div className="mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-800/50">
//             <p className="text-xs text-emerald-600 font-semibold">Resolution</p>
//             <p className="text-xs text-gray-600 dark:text-gray-400">{e.resolveDescription}</p>
//           </div>
//         )}
//         <p className="text-xs text-gray-400 mt-1.5">Reported by {e.reportedBy}</p>
//       </>
//     ),
//   },
// };

// const ACCENT = {
//   sky: { dot: "bg-sky-500", border: "border-sky-100 dark:border-sky-900/40", chip: "bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300" },
//   amber: { dot: "bg-amber-500", border: "border-amber-100 dark:border-amber-900/40", chip: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300" },
//   fuchsia: { dot: "bg-fuchsia-500", border: "border-fuchsia-100 dark:border-fuchsia-900/40", chip: "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-900/20 dark:text-fuchsia-300" },
//   rose: { dot: "bg-rose-500", border: "border-rose-100 dark:border-rose-900/40", chip: "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300" },
//   indigo: { dot: "bg-indigo-500", border: "border-indigo-100 dark:border-indigo-900/40", chip: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300" },
// };

// const STATUS_CHIP: Record<string, string> = {
//   "On Road": "bg-emerald-100 text-emerald-700",
//   Unavailable: "bg-red-100 text-red-700",
//   Released: "bg-gray-200 text-gray-600",
//   // Replaced: "bg-amber-100 text-amber-700",
//   Replaced: "bg-red-100 text-red-700",
//   Removed: "bg-gray-200 text-gray-600",
// };

// // Walking a reg's own chronological events, decide status/driver "as of" a given day (inclusive).
// // Also returns the day the current (terminal) status took effect, so callers can decide
// // whether a Removed/Unavailable/Replaced vehicle should still be shown "today" or not.
// // A "vehicle replaced" action fires as 3 separate raw log rows (driverChangeHistory
// // "Vehicle Removed", driverChangeHistory "Vehicle Replaced (Outgoing)", and an
// // unavailableHistory "replaced" row) — collapse them into one Old-Vehicle /
// // Replacement-Vehicle card instead of showing 3 near-duplicate entries for one event.
// // function mergeReplacementEvents(events: any[]) {
// //   const used = new Set<number>();
// //   const merged: any[] = [];
// //   events.forEach((e, i) => {
// //     if (used.has(i)) return;
// //     if (e._category === "unavailableHistory" && e.eventType === "replaced") {
// //       const removedIdx = events.findIndex(
// //         (o, j) => !used.has(j) && j !== i && o._category === "driverChangeHistory" && /removed/i.test(o.eventType || "")
// //       );
// //       const outgoingIdx = events.findIndex(
// //         (o, j) => !used.has(j) && j !== i && o._category === "driverChangeHistory" && /replaced/i.test(o.eventType || "")
// //       );
// //       if (removedIdx !== -1) used.add(removedIdx);
// //       if (outgoingIdx !== -1) used.add(outgoingIdx);
// //       used.add(i);
// //       const removedEv = removedIdx !== -1 ? events[removedIdx] : null;
// //       const outgoingEv = outgoingIdx !== -1 ? events[outgoingIdx] : null;
// //       merged.push({
// //         _merged: "replacement",
// //         _timestamp: e._timestamp,
// //         reason: e.reason,
// //         oldReg: e.vehicleRegistrationNumber,
// //         oldDriverName: removedEv?.oldDriverName || removedEv?.driverName || outgoingEv?.oldDriverName || outgoingEv?.driverName || "",
// //         oldDriverPhone: removedEv?.oldDriverPhone || removedEv?.driverPhone || outgoingEv?.oldDriverPhone || outgoingEv?.driverPhone || "",
// //         newReg: e.replacementVehicleRegistrationNumber,
// //         newDriverName: e.replacementDriverName || outgoingEv?.newDriverName || "",
// //         newDriverPhone: e.replacementDriverPhone || outgoingEv?.newDriverPhone || "",
// //         reportedBy: e.reportedBy,
// //       });
// //       return;
// //     }
// //     merged.push(e);
// //   });
// //   return merged;
// // }

// function mergeReplacementEvents(events: any[]) {
//   const used = new Set<number>();
//   const mergeMap = new Map<number, any>();

//   // Pass 1: find merge groups first, don't push anything yet
//   events.forEach((e, i) => {
//     if (e._category === "unavailableHistory" && e.eventType === "replaced") {
//       const removedIdx = events.findIndex(
//         (o, j) => !used.has(j) && j !== i && o._category === "driverChangeHistory" && /removed/i.test(o.eventType || "")
//       );
//       const outgoingIdx = events.findIndex(
//         (o, j) => !used.has(j) && j !== i && o._category === "driverChangeHistory" && /replaced/i.test(o.eventType || "")
//       );
//       if (removedIdx !== -1) used.add(removedIdx);
//       if (outgoingIdx !== -1) used.add(outgoingIdx);
//       used.add(i);
//       const removedEv = removedIdx !== -1 ? events[removedIdx] : null;
//       const outgoingEv = outgoingIdx !== -1 ? events[outgoingIdx] : null;
//       mergeMap.set(i, {
//         _merged: "replacement",
//         _timestamp: e._timestamp,
//         reason: e.reason,
//         oldReg: e.vehicleRegistrationNumber,
//         oldDriverName: removedEv?.oldDriverName || removedEv?.driverName || outgoingEv?.oldDriverName || outgoingEv?.driverName || "",
//         oldDriverPhone: removedEv?.oldDriverPhone || removedEv?.driverPhone || outgoingEv?.oldDriverPhone || outgoingEv?.driverPhone || "",
//         newReg: e.replacementVehicleRegistrationNumber,
//         newDriverName: e.replacementDriverName || outgoingEv?.newDriverName || "",
//         newDriverPhone: e.replacementDriverPhone || outgoingEv?.newDriverPhone || "",
//         reportedBy: e.reportedBy,
//       });
//     }
//   });

//   // Pass 2: build final ordered list, skipping consumed events
//   const merged: any[] = [];
//   events.forEach((e, i) => {
//     if (mergeMap.has(i)) {
//       merged.push(mergeMap.get(i));
//       return;
//     }
//     if (used.has(i)) return;
//     merged.push(e);
//   });

//   return merged;
// }

// function computeRegSnapshot(eventsUpToDay: any[]) {
//   let status = "On Road";
//   let statusReason = "";
//   let statusTime: string | null = null;
//   let statusDay: string | null = null;
//   for (let i = eventsUpToDay.length - 1; i >= 0; i--) {
//     const e = eventsUpToDay[i];
//     if (e._category === "unavailableHistory") {
//       status = e.eventType === "replaced" ? "Replaced" : e.status === "unavailable" ? "Unavailable" : "On Road";
//       statusReason = e.reason || "";
//       statusTime = e._timestamp;
//       statusDay = e._day;
//       break;
//     }
//     if (e._category === "driverChangeHistory" && /removed/i.test(e.eventType || "")) {
//       status = "Removed";
//       statusReason = e.comments || "";
//       statusTime = e.changedAt;
//       statusDay = e._day;
//       break;
//     }
//   }
//   let driverName = "";
//   let driverPhone = "";
//   for (let i = eventsUpToDay.length - 1; i >= 0; i--) {
//     const e = eventsUpToDay[i];
//     if (e._category === "driverChangeHistory") {
//       driverName = e.newDriverName || e.driverName || "";
//       driverPhone = e.newDriverPhone || e.driverPhone || "";
//       break;
//     }
//   }
//   return { status, statusReason, statusTime, statusDay, driverName, driverPhone };
// }

// export default function DayByDayHistoryTab({ order, vehicleTypes }: { order: { _id: string }, vehicleTypes: any }) {
//   const [loading, setLoading] = useState(true);
//   const [data, setData] = useState<any>(null);
//   const [expanded, setExpanded] = useState<Record<number, boolean>>({});
//   const [dayTab, setDayTab] = useState<Record<number, string>>({});
//   const [regTab, setRegTab] = useState<Record<string, string>>({});


//   const fmtPhone = (p?: string) => {
//     if (!p) return "";
//     const digits = String(p).replace(/\D/g, "");
//     if (!digits) return "";
//     return `+91 ${digits}`;
//   };

//   const fetchHistory = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(
//         `${API_BASE}admin/pipeline/${order._id}/day-by-day-history`,
//         { headers: { Authorization: `Bearer ${getToken()}` } }
//       );
//       const payload = res.data?.data;
//       setData(payload);
//       const firstVt = payload?.vehicleTypes?.[0];
//       if (firstVt) setExpanded({ [firstVt.vehicleIndex]: true });
//     } catch (err: any) {
//       toast.error(err?.response?.data?.message || "Failed to load day-by-day history");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchHistory();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [order._id]);


//   const getVehicleTypeName = (vehicleTypeId) => {
//     if (!vehicleTypeId || !vehicleTypes) return "";
//     const v = vehicleTypes.find((vt) => vt._id === vehicleTypeId);
//     return v?.typeName || vehicleTypeId;
//   };


//   // Per vehicle type: full campaign day list + every event tagged & grouped by registration number.
//   const perVehicleType = useMemo(() => {
//     if (!data?.vehicleTypes) return {};
//     const out: Record<number, { days: string[]; eventsByReg: Record<string, any[]> }> = {};

//     data.vehicleTypes.forEach((vt: any) => {
//       const allEvents: any[] = [];
//       Object.keys(CATEGORY_META).forEach((catKey) => {
//         (data[catKey] || []).forEach((e: any) => {
//           if (e.vehicleIndex !== vt.vehicleIndex) return;
//           const meta = CATEGORY_META[catKey];
//           allEvents.push({ ...e, _category: catKey, _timestamp: meta.getTimestamp(e), _day: e.day });
//         });
//       });
//       allEvents.sort((a, b) => new Date(a._timestamp || 0).getTime() - new Date(b._timestamp || 0).getTime());

//       // Group by entryId, NOT by reg no. — a reg no. can be reused across
//       // multiple distinct entries over the campaign (replaced out, later
//       // reused as a replacement elsewhere). Grouping by reg text would merge
//       // two unrelated lifecycles into one tab. Each entryId is one lifecycle
//       // instance and gets its own tab, even if the reg no. repeats.
//       // Note: the replacement entry's own "Vehicle Added" / "Vehicle
//       // Replaced (Incoming)" driverChangeHistory records (built server-side,
//       // tagged with the new entryId) already cover its introduction — no
//       // synthetic event needs to be added here.
//       const eventsByReg: Record<string, any[]> = {};
//       allEvents.forEach((e) => {
//         const key = e.entryId || e.vehicleRegistrationNumber;
//         if (!key) return;
//         if (!eventsByReg[key]) eventsByReg[key] = [];
//         eventsByReg[key].push(e);
//       });

//       const days: string[] = [];
//       const from = vt.fromDate?.slice(0, 10);
//       const to = vt.toDate?.slice(0, 10);
//       if (from && to) {
//         let cur = from;
//         while (cur <= to) {
//           days.push(cur);
//           const d = new Date(cur + "T00:00:00.000Z");
//           d.setUTCDate(d.getUTCDate() + 1);
//           cur = d.toISOString().slice(0, 10);
//         }
//       }
//       allEvents.forEach((e) => {
//         if (e._day && !days.includes(e._day)) days.push(e._day);
//       });
//       days.sort();

//       out[vt.vehicleIndex] = { days, eventsByReg };
//     });
//     return out;
//   }, [data]);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
//       </div>
//     );
//   }

//   if (!data || !data.vehicleTypes?.length) {
//     return (
//       <div className="flex flex-col items-center justify-center h-64 text-center px-6">
//         <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
//         <p className="text-sm text-gray-500">No day-by-day history available for this order yet.</p>
//         <button
//           onClick={fetchHistory}
//           className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold"
//         >
//           <RefreshCw size={12} /> Retry
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 sm:p-6 space-y-3">
//       {data.vehicleTypes.map((vt: any) => {
//         const isOpen = !!expanded[vt.vehicleIndex];
//         const { days, eventsByReg } = perVehicleType[vt.vehicleIndex] || { days: [], eventsByReg: {} };
//         const activeDay = dayTab[vt.vehicleIndex] || days[0];

//         // Build the day's vehicle roster: every reg active on activeDay. Vehicles whose status
//         // turned Removed/Unavailable/Replaced on an earlier day are dropped — only On Road
//         // vehicles (or ones whose status just changed today) carry forward.
//         const dayRows = Object.keys(eventsByReg)
//           .map((entryKey) => {
//             const events = eventsByReg[entryKey];
//             const eventsUpToDay = events.filter((e) => (e._day || "") <= activeDay);
//             if (eventsUpToDay.length === 0) return null;
//             const snapshot = computeRegSnapshot(eventsUpToDay);
//             if (snapshot.status !== "On Road" && snapshot.statusDay !== activeDay) return null;
//             const todaysEvents = events.filter((e) => e._day === activeDay);
//             // Display reg no. — most recent one known for this entry (a
//             // driver "updated" event can change the reg within the same entry).
//             const displayReg = [...eventsUpToDay].reverse().find((e) => e.vehicleRegistrationNumber)?.vehicleRegistrationNumber
//               || events[0]?.vehicleRegistrationNumber || entryKey;
//             return { reg: displayReg, entryKey, firstDay: eventsUpToDay[0]._day, todaysEvents, ...snapshot };
//           })
//           .filter(Boolean)
//           .sort((a: any, b: any) => (a.firstDay || "").localeCompare(b.firstDay || ""));

//         const dayKey = `${vt.vehicleIndex}:${activeDay}`;
//         const activeEntryKey = regTab[dayKey] || dayRows[0]?.entryKey;
//         const activeRow = dayRows.find((r: any) => r.entryKey === activeEntryKey);

//         return (
//           <div key={vt.vehicleIndex} className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900">
//             <button
//               onClick={() => setExpanded((p) => ({ ...p, [vt.vehicleIndex]: !p[vt.vehicleIndex] }))}
//               className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-all"
//             >
//               <div className="flex items-center gap-2.5 min-w-0">
//                 <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
//                   <Truck size={15} className="text-blue-500" />
//                 </div>
//                 <div className="text-left min-w-0">
//                   <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
//                     {getVehicleTypeName(vt.vehicleType)}
//                   </p>
//                   <p className="text-xs text-gray-400">
//                     {vt.registrationNumbers.length} vehicle{vt.registrationNumbers.length !== 1 ? "s" : ""} · {days.length} day{days.length !== 1 ? "s" : ""}
//                   </p>
//                 </div>
//               </div>
//               {isOpen ? <ChevronDown size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronRightIcon size={16} className="text-gray-400 flex-shrink-0" />}
//             </button>

//             {isOpen && (
//               <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3 space-y-3">
//                 {days.length === 0 ? (
//                   <p className="text-sm text-gray-400 text-center py-8">No campaign days found.</p>
//                 ) : (
//                   <>
//                     <div className="flex gap-1.5 overflow-x-auto pb-1 border-b border-gray-100 dark:border-gray-800">
//                       {days.map((day) => (
//                         <button
//                           key={day}
//                           onClick={() => setDayTab((p) => ({ ...p, [vt.vehicleIndex]: day }))}
//                           className={`flex-shrink-0 px-3 py-2 text-xs font-semibold border-b-2 transition-all -mb-px whitespace-nowrap ${activeDay === day
//                             ? "border-violet-500 text-violet-600 dark:text-violet-400"
//                             : "border-transparent text-gray-400 hover:text-gray-600"
//                             }`}
//                         >
//                           {fmtDateLabel(day)}
//                         </button>
//                       ))}
//                     </div>

//                     <div className="pt-1 space-y-3">
//                       {dayRows.length === 0 ? (
//                         <p className="text-sm text-gray-400 text-center py-8">No vehicles active on this day.</p>
//                       ) : (
//                         <>
//                           <div className="flex flex-wrap gap-1.5">
//                             {dayRows.map((row: any) => (
//                               <button
//                                 key={row.entryKey}
//                                 onClick={() => setRegTab((p) => ({ ...p, [dayKey]: row.entryKey }))}
//                                 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-all ${activeEntryKey === row.entryKey
//                                   ? row.status === "Replaced"
//                                     ? "bg-red-600 border-red-600 text-white"
//                                     : "bg-teal-600 border-teal-600 text-white"
//                                   : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
//                                   }`}
//                               >
//                                 {row.reg}
//                                 <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeEntryKey === row.entryKey ? "bg-white/20 text-white" : STATUS_CHIP[row.status] || "bg-blue-100 text-blue-700"}`}>
//                                   {row.status}
//                                 </span>
//                               </button>
//                             ))}
//                           </div>

//                           {activeRow && (
//                             <div className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
//                               <div className="flex items-center justify-between gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/50">
//                                 <div className="flex items-center gap-2 min-w-0">
//                                   <span className="font-mono text-sm font-bold text-gray-800 dark:text-gray-100">{activeRow.reg}</span>
//                                   <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_CHIP[activeRow.status] || "bg-blue-100 text-blue-700"}`}>
//                                     {activeRow.status}
//                                   </span>
//                                 </div>
//                                 {activeRow.driverName && (
//                                   <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
//                                     <User size={11} /> {activeRow.driverName}{activeRow.driverPhone ? ` · ${fmtPhone(activeRow.driverPhone)}` : ""}
//                                   </div>
//                                 )}
//                               </div>

//                               {activeRow.status === "Unavailable" && activeRow.statusReason && (
//                                 <p className="px-3 pt-2 text-xs text-red-600 dark:text-red-400">
//                                   Unavailable since {fmtTime(activeRow.statusTime)}: {activeRow.statusReason}
//                                 </p>
//                               )}
//                               {activeRow.status === "Replaced" && activeRow.statusReason && (
//                                 <p className="px-3 pt-2 text-xs text-amber-600 dark:text-amber-400">
//                                   Replaced at {fmtTime(activeRow.statusTime)}: {activeRow.statusReason}
//                                 </p>
//                               )}

//                               {activeRow.todaysEvents.length === 0 ? (
//                                 <p className="px-3 py-2 text-xs text-gray-400">Continued from previous day — no new activity.</p>
//                               ) : (
//                                 <div className="p-3 space-y-2">
//                                   {[...mergeReplacementEvents(activeRow.todaysEvents)].reverse().map((e: any, i: number) => {
//                                     if (e._merged === "replacement") {
//                                       return (
//                                         <div key={i} className="rounded-lg border border-red-200 dark:border-red-800/60 bg-red-50 dark:bg-red-900/20 p-2.5">
//                                           <div className="flex items-center justify-between gap-2">
//                                             <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
//                                               <RefreshCw size={10} /> Vehicle Replaced
//                                             </span>
//                                             <span className="text-xs text-gray-400 whitespace-nowrap">{fmtTime(e._timestamp)}</span>
//                                           </div>
//                                           {e.reason && (
//                                             <p className="text-xs text-red-600 dark:text-red-400 mt-1">
//                                               Comments: {e.reason}
//                                             </p>
//                                           )}
//                                           <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
//                                             <div>
//                                               <p className="text-gray-400">Old Vehicle</p>
//                                               <p className="font-mono font-semibold text-gray-700 dark:text-gray-300">{e.oldReg || "—"}</p>
//                                               <p className="text-gray-500">{e.oldDriverName || "—"}{e.oldDriverPhone ? ` · ${e.oldDriverPhone}` : ""}</p>
//                                             </div>
//                                             <div>
//                                               <p className="text-red-500 font-semibold">Replacement</p>
//                                               <p className="font-mono font-semibold text-gray-700 dark:text-gray-300">{e.newReg || "—"}</p>
//                                               <p className="text-gray-500">{e.newDriverName || "—"}{e.newDriverPhone ? ` · ${e.newDriverPhone}` : ""}</p>
//                                             </div>
//                                           </div>
//                                           {e.reportedBy && <p className="text-xs text-gray-400 mt-1.5">Reported by {e.reportedBy}</p>}
//                                         </div>
//                                       );
//                                     }
//                                     const meta = CATEGORY_META[e._category];
//                                     const accent = ACCENT[meta.color];
//                                     const Icon = meta.icon;
//                                     return (
//                                       <div key={i} className={`rounded-lg border p-2.5 ${accent.border}`}>
//                                         <div className="flex items-center justify-between gap-2">
//                                           <span className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${accent.chip}`}>
//                                             <Icon size={10} /> {meta.getTitle(e)}
//                                           </span>
//                                           <span className="text-xs text-gray-400 whitespace-nowrap">{fmtTime(e._timestamp)}</span>
//                                         </div>
//                                         {meta.renderBody(e)}
//                                       </div>
//                                     );
//                                   })}
//                                 </div>
//                               )}
//                             </div>
//                           )}
//                         </>
//                       )}
//                     </div>
//                   </>
//                 )}
//               </div>
//             )}
//           </div>
//         );
//       })}
//     </div>
//   );
// }


/* eslint-disable */
// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Truck, User, RefreshCw, ChevronDown, ChevronRight as ChevronRightIcon,
  ArrowRightLeft, AlertTriangle, Gauge, XCircle, Clock,
} from "lucide-react";
import { getToken } from "../../utils/auth";
import API_BASE from "../../../../baseurl";

const fmtDatetime = (s?: string) => {
  if (!s) return "—";
  return new Date(s).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const fmtTime = (s?: string) => {
  if (!s) return "";
  return new Date(s).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

const fmtDateLabel = (dateKey: string) =>
  new Date(dateKey + "T00:00:00.000Z").toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", weekday: "short",
  });

    const fmtPhone = (p?: string) => {
    if (!p) return "";
    const digits = String(p).replace(/\D/g, "");
    if (!digits) return "";
    return `+91 ${digits}`;
  };


const getImageUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_BASE.replace("/api", "")}${url}`;
};

// Unified per-category presentation metadata: icon, accent color, timestamp field, title/body renderer.
const CATEGORY_META: Record<string, any> = {
  driverChangeHistory: {
    icon: ArrowRightLeft,
    color: "sky",
    getTimestamp: (e: any) => e.changedAt,
    getTitle: (e: any) => e.eventType || "Driver Change",
    renderBody: (e: any) => (
      <>
        {(e.oldDriverName || e.newDriverName) ? (
          <div className="grid grid-cols-2 gap-2 mt-1.5 text-sm">
            <div>
              <p className="text-gray-400">Old Driver</p>
              <p className="font-semibold text-gray-700 dark:text-gray-300">{e.oldDriverName || "—"} · {fmtPhone(e.oldDriverPhone) || "—"}</p>
              {e.oldVehicleRegistrationNumber && <p className="font-mono text-gray-500">{e.oldVehicleRegistrationNumber}</p>}
            </div>
            <div>
              <p className="text-gray-400">New Driver</p>
              <p className="font-semibold text-gray-700 dark:text-gray-300">{e.newDriverName || "—"} · {fmtPhone(e.newDriverPhone) || "—"}</p>
              <p className="font-mono text-gray-500">{e.newVehicleRegistrationNumber || e.vehicleRegistrationNumber || "—"}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 mt-1">
            {e.driverName} · {fmtPhone(e.driverPhone)} — <span className="font-mono">{e.vehicleRegistrationNumber}</span>
          </p>
        )}
        {e.comments && <p className="text-sm text-gray-400 mt-1.5">Comments: {e.comments}</p>}
        <p className="text-sm text-gray-400 mt-1">Updated by {e.changedBy || "—"}</p>
      </>
    ),
  },
  issueHistory: {
    icon: AlertTriangle,
    color: "amber",
    getTimestamp: (e: any) => (e.status === "resolved-today" ? e.resolvedAt || e.createdAt : e.createdAt),
    getTitle: (e: any) => (e.status === "resolved-today" ? "Issue Resolved" : e.status === "open" ? "Issue Reported" : "Issue"),
    renderBody: (e: any) => (
      <>
        <p className="text-base text-gray-700 dark:text-gray-300 mt-1">{e.issueDescription}</p>
        {e.issuePhoto && (
          <a href={getImageUrl(e.issuePhoto)} target="_blank" rel="noreferrer">
            <img src={getImageUrl(e.issuePhoto)} className="w-14 h-12 rounded-lg object-cover border mt-1.5" alt="issue" />
          </a>
        )}
        {e.resolveDescription && (
          <div className="mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-800/50">
            <p className="text-sm text-emerald-600 font-semibold">Resolved</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{e.resolveDescription}</p>
            <p className="text-sm text-gray-400 mt-0.5">By {e.resolvedBy} · {fmtDatetime(e.resolvedAt)}</p>
          </div>
        )}
        <p className="text-sm text-gray-400 mt-1.5">Created by {e.createdBy}</p>
      </>
    ),
  },
  extraKmHistory: {
    icon: Gauge,
    color: "fuchsia",
    getTimestamp: (e: any) => e.updatedAt,
    getTitle: (e: any) => `${e.extraKm} km / ${e.extraHours} hrs`,
    renderBody: (e: any) => (
      <>
        <p className="text-sm text-gray-500 mt-1">Logged for period: {e.loggedFor}</p>
        <p className="text-base font-bold text-gray-900 dark:text-white mt-1">
          ₹ {Number(e.totalCost || 0).toLocaleString("en-IN")}
        </p>
        <p className="text-sm text-gray-400 mt-1">Updated by {e.updatedBy}</p>
      </>
    ),
  },
  dailyHoursHistory: {
    icon: Clock,
    color: "indigo",
    getTimestamp: (e: any) => e.loggedAt,
    getTitle: (e: any) => `${e.runningHours} hrs logged`,
    renderBody: (e: any) => (
      <>
        <p className="text-sm text-gray-500 mt-1">
          {fmtTime(e.startTime)} – {fmtTime(e.endTime)}
        </p>
        <div className="flex items-center gap-3 mt-1 text-sm">
          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Running: {e.runningHours} hrs</span>
          {e.absentHours > 0 && <span className="text-amber-600 font-semibold">Absent: {e.absentHours} hrs</span>}
        </div>
        {e.remarks && <p className="text-sm text-gray-400 mt-1.5">Remarks: {e.remarks}</p>}
        <p className="text-sm text-gray-400 mt-1">Logged by {e.loggedBy}</p>
      </>
    ),
  },
  unavailableHistory: {
    icon: XCircle,
    color: "rose",
    getTimestamp: (e: any) => e.reportedAt,
    getTitle: (e: any) =>
      e.eventType === "replaced" ? "Vehicle Replaced" : e.status === "unavailable" ? "Marked Unavailable" : "Marked Available",
    renderBody: (e: any) => (
      <>
        <p className="text-base text-gray-700 dark:text-gray-300 mt-1">{e.reason}</p>
        {e.photo && (
          <a href={getImageUrl(e.photo)} target="_blank" rel="noreferrer">
            <img src={getImageUrl(e.photo)} className="w-14 h-12 rounded-lg object-cover border mt-1.5" alt="unavailable" />
          </a>
        )}
        {e.eventType === "replaced" && (
          <div className="mt-2 pt-2 border-t border-rose-200 dark:border-rose-800/50 grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-gray-400">Old Vehicle</p>
              <p className="font-mono font-semibold text-gray-700 dark:text-gray-300">{e.vehicleRegistrationNumber}</p>
            </div>
            <div>
              <p className="text-amber-600">Replacement</p>
              <p className="font-mono font-semibold text-gray-700 dark:text-gray-300">{e.replacementVehicleRegistrationNumber}</p>
              <p className="text-gray-500">{e.replacementDriverName} · {fmtPhone(e.replacementDriverPhone)}</p>
            </div>
          </div>
        )}
        {e.resolveDescription && (
          <div className="mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-800/50">
            <p className="text-sm text-emerald-600 font-semibold">Resolution</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{e.resolveDescription}</p>
          </div>
        )}
        <p className="text-sm text-gray-400 mt-1.5">Reported by {e.reportedBy}</p>
      </>
    ),
  },
};

const ACCENT = {
  sky: { dot: "bg-sky-500", border: "border-sky-100 dark:border-sky-900/40", chip: "bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300" },
  amber: { dot: "bg-amber-500", border: "border-amber-100 dark:border-amber-900/40", chip: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300" },
  fuchsia: { dot: "bg-fuchsia-500", border: "border-fuchsia-100 dark:border-fuchsia-900/40", chip: "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-900/20 dark:text-fuchsia-300" },
  rose: { dot: "bg-rose-500", border: "border-rose-100 dark:border-rose-900/40", chip: "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300" },
  indigo: { dot: "bg-indigo-500", border: "border-indigo-100 dark:border-indigo-900/40", chip: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300" },
};

const STATUS_CHIP: Record<string, string> = {
  "On Road": "bg-emerald-100 text-emerald-700",
  Unavailable: "bg-red-100 text-red-700",
  Released: "bg-gray-200 text-gray-600",
  Replaced: "bg-red-100 text-red-700",
  Removed: "bg-gray-200 text-gray-600",
};

// Walking a reg's own chronological events, decide status/driver "as of" a given day (inclusive).
// Also returns the day the current (terminal) status took effect, so callers can decide
// whether a Removed/Unavailable/Replaced vehicle should still be shown "today" or not.
// A "vehicle replaced" action fires as 3 separate raw log rows (driverChangeHistory
// "Vehicle Removed", driverChangeHistory "Vehicle Replaced (Outgoing)", and an
// unavailableHistory "replaced" row) — collapse them into one Old-Vehicle /
// Replacement-Vehicle card instead of showing 3 near-duplicate entries for one event.

function mergeReplacementEvents(events: any[]) {
  const used = new Set<number>();
  const mergeMap = new Map<number, any>();

  // Pass 1: find merge groups first, don't push anything yet
  events.forEach((e, i) => {
    if (e._category === "unavailableHistory" && e.eventType === "replaced") {
      const removedIdx = events.findIndex(
        (o, j) => !used.has(j) && j !== i && o._category === "driverChangeHistory" && /removed/i.test(o.eventType || "")
      );
      const outgoingIdx = events.findIndex(
        (o, j) => !used.has(j) && j !== i && o._category === "driverChangeHistory" && /replaced/i.test(o.eventType || "")
      );
      if (removedIdx !== -1) used.add(removedIdx);
      if (outgoingIdx !== -1) used.add(outgoingIdx);
      used.add(i);
      const removedEv = removedIdx !== -1 ? events[removedIdx] : null;
      const outgoingEv = outgoingIdx !== -1 ? events[outgoingIdx] : null;
      mergeMap.set(i, {
        _merged: "replacement",
        _timestamp: e._timestamp,
        reason: e.reason,
        oldReg: e.vehicleRegistrationNumber,
        oldDriverName: removedEv?.oldDriverName || removedEv?.driverName || outgoingEv?.oldDriverName || outgoingEv?.driverName || "",
        oldDriverPhone: removedEv?.oldDriverPhone || removedEv?.driverPhone || outgoingEv?.oldDriverPhone || outgoingEv?.driverPhone || "",
        newReg: e.replacementVehicleRegistrationNumber,
        newDriverName: e.replacementDriverName || outgoingEv?.newDriverName || "",
        newDriverPhone: e.replacementDriverPhone || outgoingEv?.newDriverPhone || "",
        reportedBy: e.reportedBy,
      });
    }
  });

  // A "Vehicle Replaced (Incoming)" driverChangeHistory record already carries
  // both the old and new driver+vehicle details in one card — the separate
  // "Vehicle Added" record for that same incoming entry is a redundant
  // duplicate of the same action and should not render alongside it.
  const hasIncomingReplace = events.some(
    (o) => o._category === "driverChangeHistory" && /replaced.*incoming/i.test(o.eventType || "")
  );
  if (hasIncomingReplace) {
    events.forEach((e, i) => {
      if (e._category === "driverChangeHistory" && /^vehicle added$/i.test(e.eventType || "")) {
        used.add(i);
      }
    });
  }

  // Pass 2: build final ordered list, skipping consumed events
  const merged: any[] = [];
  events.forEach((e, i) => {
    if (mergeMap.has(i)) {
      merged.push(mergeMap.get(i));
      return;
    }
    if (used.has(i)) return;
    merged.push(e);
  });

  return merged;
}

function computeRegSnapshot(eventsUpToDay: any[]) {
  let status = "On Road";
  let statusReason = "";
  let statusTime: string | null = null;
  let statusDay: string | null = null;
  for (let i = eventsUpToDay.length - 1; i >= 0; i--) {
    const e = eventsUpToDay[i];
    if (e._category === "unavailableHistory") {
      status = e.eventType === "replaced" ? "Replaced" : e.status === "unavailable" ? "Unavailable" : "On Road";
      statusReason = e.reason || "";
      statusTime = e._timestamp;
      statusDay = e._day;
      break;
    }
    if (e._category === "driverChangeHistory" && /removed/i.test(e.eventType || "")) {
      status = "Removed";
      statusReason = e.comments || "";
      statusTime = e.changedAt;
      statusDay = e._day;
      break;
    }
  }
  let driverName = "";
  let driverPhone = "";
  for (let i = eventsUpToDay.length - 1; i >= 0; i--) {
    const e = eventsUpToDay[i];
    if (e._category === "driverChangeHistory") {
      driverName = e.newDriverName || e.driverName || "";
      driverPhone = e.newDriverPhone || e.driverPhone || "";
      break;
    }
  }
  return { status, statusReason, statusTime, statusDay, driverName, driverPhone };
}

export default function DayByDayHistoryTab({ order, vehicleTypes }: { order: { _id: string }, vehicleTypes: any }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [dayTab, setDayTab] = useState<Record<number, string>>({});
  const [regTab, setRegTab] = useState<Record<string, string>>({});


  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE}admin/pipeline/${order._id}/day-by-day-history`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      const payload = res.data?.data;
      setData(payload);
      const firstVt = payload?.vehicleTypes?.[0];
      if (firstVt) setExpanded({ [firstVt.vehicleIndex]: true });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load day-by-day history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order._id]);

  const getVehicleTypeName = (vehicleTypeId) => {
    if (!vehicleTypeId || !vehicleTypes) return "";
    const v = vehicleTypes.find((vt) => vt._id === vehicleTypeId);
    return v?.typeName || vehicleTypeId;
  };

  const fmtDateOnly = (s) =>
    s ? new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  // Compensation requests (FOC compensation-hours / compensation-days) raised
  // from the Campaign Calculator for this vehicle-type slot — both the
  // request and (once approved) the acceptance details live on the same
  // campaignClosureArray record, so no separate lookup is needed for either.
  const getCompensationEntries = (vehicleIndex: number) =>
    (order.campaignClosureArray || [])
      .filter(
        (c: any) =>
          c.type === "foc" &&
          (c.focPurpose === "compensation-hours" || c.focPurpose === "compensation-days") &&
          c.compensationVehicleIndex === vehicleIndex
      )
      .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  const getEntryRegNo = (entryId: string | null) => {
    if (!entryId) return null;
    const e = (order.onRoadExecutionArray || []).find((x: any) => String(x._id) === String(entryId));
    return e?.vehicleRegistrationNumber || null;
  };

  // Per vehicle type: full campaign day list + every event tagged & grouped by registration number.
  const perVehicleType = useMemo(() => {
    if (!data?.vehicleTypes) return {};
    const out: Record<number, { days: string[]; eventsByReg: Record<string, any[]> }> = {};

    data.vehicleTypes.forEach((vt: any) => {
      const allEvents: any[] = [];
      Object.keys(CATEGORY_META).forEach((catKey) => {
        (data[catKey] || []).forEach((e: any) => {
          if (e.vehicleIndex !== vt.vehicleIndex) return;
          const meta = CATEGORY_META[catKey];
          allEvents.push({ ...e, _category: catKey, _timestamp: meta.getTimestamp(e), _day: e.day });
        });
      });
      allEvents.sort((a, b) => new Date(a._timestamp || 0).getTime() - new Date(b._timestamp || 0).getTime());

      // Group by entryId, NOT by reg no. — a reg no. can be reused across
      // multiple distinct entries over the campaign (replaced out, later
      // reused as a replacement elsewhere). Grouping by reg text would merge
      // two unrelated lifecycles into one tab. Each entryId is one lifecycle
      // instance and gets its own tab, even if the reg no. repeats.
      // Note: the replacement entry's own "Vehicle Added" / "Vehicle
      // Replaced (Incoming)" driverChangeHistory records (built server-side,
      // tagged with the new entryId) already cover its introduction — no
      // synthetic event needs to be added here.
      const eventsByReg: Record<string, any[]> = {};
      allEvents.forEach((e) => {
        const key = e.entryId || e.vehicleRegistrationNumber;
        if (!key) return;
        if (!eventsByReg[key]) eventsByReg[key] = [];
        eventsByReg[key].push(e);
      });

      const days: string[] = [];
      const from = vt.fromDate?.slice(0, 10);
      const to = vt.toDate?.slice(0, 10);
      if (from && to) {
        let cur = from;
        while (cur <= to) {
          days.push(cur);
          const d = new Date(cur + "T00:00:00.000Z");
          d.setUTCDate(d.getUTCDate() + 1);
          cur = d.toISOString().slice(0, 10);
        }
      }
      allEvents.forEach((e) => {
        if (e._day && !days.includes(e._day)) days.push(e._day);
      });
      days.sort();

      out[vt.vehicleIndex] = { days, eventsByReg };
    });
    return out;
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data || !data.vehicleTypes?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-6">
        <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
        <p className="text-base text-gray-500">No day-by-day history available for this order yet.</p>
        <button
          onClick={fetchHistory}
          className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-sm font-semibold"
        >
          <RefreshCw size={12} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-3">
      {data.vehicleTypes.map((vt: any) => {
        const isOpen = !!expanded[vt.vehicleIndex];
        const { days, eventsByReg } = perVehicleType[vt.vehicleIndex] || { days: [], eventsByReg: {} };
        const activeDay = dayTab[vt.vehicleIndex] || days[0];

        // Build the day's vehicle roster: every reg active on activeDay. Vehicles whose status
        // turned Removed/Unavailable/Replaced on an earlier day are dropped — only On Road
        // vehicles (or ones whose status just changed today) carry forward.
        const dayRows = Object.keys(eventsByReg)
          .map((entryKey) => {
            const events = eventsByReg[entryKey];
            const eventsUpToDay = events.filter((e) => (e._day || "") <= activeDay);
            if (eventsUpToDay.length === 0) return null;
            const snapshot = computeRegSnapshot(eventsUpToDay);
            if (snapshot.status !== "On Road" && snapshot.statusDay !== activeDay) return null;
            const todaysEvents = events.filter((e) => e._day === activeDay);
            // Display reg no. — most recent one known for this entry (a
            // driver "updated" event can change the reg within the same entry).
            const displayReg = [...eventsUpToDay].reverse().find((e) => e.vehicleRegistrationNumber)?.vehicleRegistrationNumber
              || events[0]?.vehicleRegistrationNumber || entryKey;
            return { reg: displayReg, entryKey, firstDay: eventsUpToDay[0]._day, todaysEvents, ...snapshot };
          })
          .filter(Boolean)
          .sort((a: any, b: any) => (a.firstDay || "").localeCompare(b.firstDay || ""));

        const dayKey = `${vt.vehicleIndex}:${activeDay}`;
        const activeEntryKey = regTab[dayKey] || dayRows[0]?.entryKey;
        const activeRow = dayRows.find((r: any) => r.entryKey === activeEntryKey);

        return (
          <div key={vt.vehicleIndex} className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900">
            <button
              onClick={() => setExpanded((p) => ({ ...p, [vt.vehicleIndex]: !p[vt.vehicleIndex] }))}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <Truck size={15} className="text-blue-500" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-base font-semibold text-gray-800 dark:text-gray-100 truncate">
                    {getVehicleTypeName(vt.vehicleType)}
                  </p>
                  <p className="text-sm text-gray-400">
                    {vt.registrationNumbers.length} vehicle{vt.registrationNumbers.length !== 1 ? "s" : ""} · {days.length} day{days.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              {isOpen ? <ChevronDown size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronRightIcon size={16} className="text-gray-400 flex-shrink-0" />}
            </button>

            {isOpen && (
              <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3 space-y-3">
                {days.length === 0 ? (
                  <p className="text-base text-gray-400 text-center py-8">No campaign days found.</p>
                ) : (
                  <>
                    <div className="flex gap-1.5 overflow-x-auto pb-1 border-b border-gray-100 dark:border-gray-800">
                      {days.map((day) => (
                        <button
                          key={day}
                          onClick={() => setDayTab((p) => ({ ...p, [vt.vehicleIndex]: day }))}
                          className={`flex-shrink-0 px-3 py-2 text-sm font-semibold border-b-2 transition-all -mb-px whitespace-nowrap ${activeDay === day
                            ? "border-violet-500 text-violet-600 dark:text-violet-400"
                            : "border-transparent text-gray-400 hover:text-gray-600"
                            }`}
                        >
                          {fmtDateLabel(day)}
                        </button>
                      ))}
                    </div>

                    <div className="pt-1 space-y-3">
                      {dayRows.length === 0 ? (
                        <p className="text-base text-gray-400 text-center py-8">No vehicles active on this day.</p>
                      ) : (
                        <>
                          <div className="flex flex-wrap gap-1.5">
                            {dayRows.map((row: any) => (
                              <button
                                key={row.entryKey}
                                onClick={() => setRegTab((p) => ({ ...p, [dayKey]: row.entryKey }))}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-mono font-semibold transition-all ${activeEntryKey === row.entryKey
                                  ? row.status === "Replaced"
                                    ? "bg-red-600 border-red-600 text-white"
                                    : "bg-teal-600 border-teal-600 text-white"
                                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                  }`}
                              >
                                {row.reg}
                                <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${activeEntryKey === row.entryKey ? "bg-white/20 text-white" : STATUS_CHIP[row.status] || "bg-blue-100 text-blue-700"}`}>
                                  {row.status}
                                </span>
                              </button>
                            ))}
                          </div>

                          {activeRow && (
                            <div className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                              <div className="flex items-center justify-between gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/50">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="font-mono text-base font-bold text-gray-800 dark:text-gray-100">{activeRow.reg}</span>
                                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${STATUS_CHIP[activeRow.status] || "bg-blue-100 text-blue-700"}`}>
                                    {activeRow.status}
                                  </span>
                                </div>
                                {activeRow.driverName && (
                                  <div className="flex items-center gap-1 text-sm text-gray-500 flex-shrink-0">
                                    <User size={11} /> {activeRow.driverName}{activeRow.driverPhone ? ` · ${fmtPhone(activeRow.driverPhone)}` : ""}
                                  </div>
                                )}
                              </div>

                              {activeRow.status === "Unavailable" && activeRow.statusReason && (
                                <p className="px-3 pt-2 text-sm text-red-600 dark:text-red-400">
                                  Unavailable since {fmtTime(activeRow.statusTime)}: {activeRow.statusReason}
                                </p>
                              )}
                              {activeRow.status === "Replaced" && activeRow.statusReason && (
                                <p className="px-3 pt-2 text-sm text-amber-600 dark:text-amber-400">
                                  Replaced at {fmtTime(activeRow.statusTime)}: {activeRow.statusReason}
                                </p>
                              )}

                              {activeRow.todaysEvents.length === 0 ? (
                                <p className="px-3 py-2 text-sm text-gray-400">Continued from previous day — no new activity.</p>
                              ) : (
                                <div className="p-3 space-y-2">
                                  {[...mergeReplacementEvents(activeRow.todaysEvents)].reverse().map((e: any, i: number) => {
                                    if (e._merged === "replacement") {
                                      return (
                                        <div key={i} className="rounded-lg border border-red-200 dark:border-red-800/60 bg-red-50 dark:bg-red-900/20 p-2.5">
                                          <div className="flex items-center justify-between gap-2">
                                            <span className="flex items-center gap-1 text-sm font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                                              <RefreshCw size={10} /> Vehicle Replaced
                                            </span>
                                            <span className="text-sm text-gray-400 whitespace-nowrap">{fmtTime(e._timestamp)}</span>
                                          </div>
                                          {e.reason && (
                                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                              Comments: {e.reason}
                                            </p>
                                          )}
                                          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                            <div>
                                              <p className="text-gray-400">Old Vehicle</p>
                                              <p className="font-mono font-semibold text-gray-700 dark:text-gray-300">{e.oldReg || "—"}</p>
                                              <p className="text-gray-500">{e.oldDriverName || "—"}{e.oldDriverPhone ? ` · ${fmtPhone(e.oldDriverPhone)}` : ""}</p>
                                            </div>
                                            <div>
                                              <p className="text-red-500 font-semibold">Replacement</p>
                                              <p className="font-mono font-semibold text-gray-700 dark:text-gray-300">{e.newReg || "—"}</p>
                                              <p className="text-gray-500">{e.newDriverName || "—"}{e.newDriverPhone ? ` · ${fmtPhone(e.newDriverPhone)}` : ""}</p>
                                            </div>
                                          </div>
                                          {e.reportedBy && <p className="text-sm text-gray-400 mt-1.5">Reported by {e.reportedBy}</p>}
                                        </div>
                                      );
                                    }
                                    const meta = CATEGORY_META[e._category];
                                    const accent = ACCENT[meta.color];
                                    const Icon = meta.icon;
                                    return (
                                      <div key={i} className={`rounded-lg border p-2.5 ${accent.border}`}>
                                        <div className="flex items-center justify-between gap-2">
                                          <span className={`flex items-center gap-1 text-sm font-bold px-2 py-0.5 rounded-full ${accent.chip}`}>
                                            <Icon size={10} /> {meta.getTitle(e)}
                                          </span>
                                          <span className="text-sm text-gray-400 whitespace-nowrap">{fmtTime(e._timestamp)}</span>
                                        </div>
                                        {meta.renderBody(e)}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </>
                )}

                {(() => {
                  const compEntries = getCompensationEntries(vt.vehicleIndex);
                  if (compEntries.length === 0) return null;
                  return (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                      <p className="text-sm font-semibold text-gray-500 mb-2">
                        Compensation History ({compEntries.length})
                      </p>
                      <div className="space-y-2">
                        {compEntries.map((c: any) => {
                          const reg = getEntryRegNo(c.compensationEntryId);
                          const value =
                            c.focPurpose === "compensation-hours"
                              ? `${c.compensationHoursValue ?? 0} hrs/day compensation`
                              : `${c.compensationDaysValue ?? 0} extra campaign day(s)`;
                          const isApproved = c.status === "approved";
                          return (
                            <div
                              key={c._id}
                              className={`rounded-lg border p-2.5 ${isApproved ? "border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-900/10" : "border-amber-200 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-900/10"}`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="flex items-center gap-1 text-sm font-bold px-2 py-0.5 rounded-full bg-white/70 dark:bg-black/20 text-gray-700 dark:text-gray-200">
                                  Compensation Request {c.focPurpose === "compensation-hours" ? "(Hours)" : "(Days)"}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isApproved ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"}`}>
                                  {isApproved ? "Accepted" : "Pending"}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500 mt-1.5">
                                Vehicle: <span className="font-mono font-semibold text-gray-700 dark:text-gray-300">{reg || "All vehicles in this slot"}</span>
                              </p>
                              <p className="text-sm text-gray-500">
                                Period: {fmtDateOnly(c.fromDate)} → {fmtDateOnly(c.toDate)}
                              </p>
                              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-0.5">{value}</p>
                              {c.reason && <p className="text-sm text-gray-400 mt-1">Reason: {c.reason}</p>}
                              <p className="text-sm text-gray-400 mt-1.5">
                                Requested by {c.createdBy || "—"} · {fmtDatetime(c.createdAt)}
                              </p>
                              {isApproved && (
                                <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                                  Accepted by {c.approvedBy || "—"} · {fmtDatetime(c.approvedAt)}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}