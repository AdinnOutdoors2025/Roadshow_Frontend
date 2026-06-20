/* eslint-disable */
// @ts-nocheck
"use client";


export default function AttendanceSummaryCard({ vehicleEntries, order, vehicleIndex }) {
 
  const driverEntry = vehicleEntries.find(e => e.onRoadStatus === 1) || vehicleEntries[0];


  const promoterEntry = (order.onRoadExecutionArray || []).find(
    e => e.vehicleIndex === vehicleIndex && e.role === "promoter"
  );

  const fmtAttTime = (s) => {
    if (!s) return "--:-- --";
    return new Date(s).toLocaleTimeString("en-IN", {
      hour: "2-digit", minute: "2-digit", hour12: true,
    }).toUpperCase();
  };

  const calcWorkingHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "--:--";
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    if (diff <= 0) return "--:--";
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  };

  const getStatus = (entry) => {
    if (!entry) return { label: "Off Duty", color: "text-gray-400" };
    if (entry.checkIn && !entry.checkOut) return { label: "On Duty", color: "text-emerald-500" };
    if (entry.checkIn && entry.checkOut) return { label: "Checked Out", color: "text-blue-500" };
    return { label: "Off Duty", color: "text-gray-400" };
  };

  const driverStatus = getStatus(driverEntry);
  const promoterStatus = getStatus(promoterEntry);

  const rows = [
    {
      label: "Check-in",
      driver: fmtAttTime(driverEntry?.checkIn),
      promoter: fmtAttTime(promoterEntry?.checkIn),
      colored: true,
    },
    {
      label: "Check-out",
      driver: fmtAttTime(driverEntry?.checkOut),
      promoter: fmtAttTime(promoterEntry?.checkOut),
      colored: false,
    },
    {
      label: "Working Hours",
      driver: calcWorkingHours(driverEntry?.checkIn, driverEntry?.checkOut),
      promoter: calcWorkingHours(promoterEntry?.checkIn, promoterEntry?.checkOut),
      colored: false,
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100">
          Attendance Summary
        </h3>
        <button className="text-sm font-medium text-blue-500 hover:underline">
          View All
        </button>
      </div>

   
      <div className="p-4">
        <div className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
       
          <div className="grid grid-cols-3 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide"></span>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Driver</span>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Promoter</span>
          </div>

      
          {rows.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-3 px-4 py-2.5 border-t border-gray-100 dark:border-gray-800"
            >
              <span className="text-sm text-gray-500 dark:text-gray-400">{row.label}</span>
              <span className={`text-sm font-semibold ${row.colored ? "text-emerald-500" : "text-gray-700 dark:text-gray-300"}`}>
                {row.driver}
              </span>
              <span className={`text-sm font-semibold ${row.colored ? "text-emerald-500" : "text-gray-700 dark:text-gray-300"}`}>
                {row.promoter}
              </span>
            </div>
          ))}

         
          <div className="grid grid-cols-3 px-4 py-2.5 border-t border-gray-100 dark:border-gray-800">
            <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
            <span className={`text-sm font-bold ${driverStatus.color}`}>
              {driverStatus.label}
            </span>
            <span className={`text-sm font-bold ${promoterStatus.color}`}>
              {promoterStatus.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}