// // OrderDatePicker.tsx
// import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
// import { useState, useRef, useEffect } from "react";

// export default function OrderDatePicker({
//   value,
//   onChange,
//   placeholder = "Select date",
//   minDate,
//   maxDate,
// }: {
//   value: string;
//   onChange: (val: string) => void;
//   placeholder?: string;
//   minDate?: string;
//   maxDate?: string;
// }) {
//   const [open, setOpen] = useState(false);
//   const [curYear, setCurYear] = useState(new Date().getFullYear());
//   const [curMonth, setCurMonth] = useState(new Date().getMonth());
//   const ref = useRef<HTMLDivElement>(null);

//   const months = ["January","February","March","April","May","June",
//     "July","August","September","October","November","December"];
//   const today = new Date();

//   const years = Array.from(
//     { length: today.getFullYear() + 2 - 2020 },
//     (_, i) => 2020 + i
//   );

//   useEffect(() => {
//     const handler = (e: MouseEvent) => {
//       if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   useEffect(() => {
//     if (open) {
//       if (value) {
//         const d = new Date(value + "T00:00:00");
//         setCurYear(d.getFullYear());
//         setCurMonth(d.getMonth());
//       } else {
//         setCurYear(today.getFullYear());
//         setCurMonth(today.getMonth());
//       }
//     }
//   }, [open]);

//   const selected = value ? new Date(value + "T00:00:00") : null;
//   const daysInMonth = new Date(curYear, curMonth + 1, 0).getDate();
//   const firstDay = new Date(curYear, curMonth, 1).getDay();

//   const changeMonth = (dir: number) => {
//     let m = curMonth + dir, y = curYear;
//     if (m > 11) { m = 0; y++; }
//     if (m < 0)  { m = 11; y--; }
//     setCurMonth(m); setCurYear(y);
//   };

//   const isDaySelectable = (day: number): boolean => {
//     const iso = `${curYear}-${String(curMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
//     if (minDate && iso < minDate) return false;
//     if (maxDate && iso > maxDate) return false;
//     return true;
//   };

//   const selectDay = (d: number) => {
//     if (!isDaySelectable(d)) return;
//     const iso = `${curYear}-${String(curMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
//     onChange(iso);
//     setOpen(false);
//   };

//   const displayValue = selected
//     ? selected.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
//     : placeholder;

//   return (
//     <div ref={ref} className="relative">
//       <button
//         type="button"
//         onClick={() => setOpen((o) => !o)}
//         className={`w-full flex items-center gap-2 px-3 py-2 border rounded-lg text-sm
//           bg-white dark:bg-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500
//           ${value
//             ? "border-blue-300 dark:border-blue-600 text-gray-900 dark:text-white"
//             : "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500"
//           }`}
//       >
//         <Calendar size={14} className="flex-shrink-0 text-gray-400" />
//         <span className="flex-1 text-left text-xs">{displayValue}</span>
//         <ChevronDown
//           size={14}
//           className={`flex-shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
//         />
//       </button>

//       {open && (
//         <div className="absolute z-50 top-[calc(100%+4px)] left-0 min-w-[260px]
//           bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700
//           rounded-xl shadow-lg p-3">

//           {/* Month / Year nav */}
//           <div className="flex items-center justify-between mb-2">
//             <button type="button" onClick={() => changeMonth(-1)}
//               className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-all">
//               <ChevronLeft size={14} />
//             </button>
//             <div className="flex gap-1">
//               <select value={curMonth} onChange={(e) => setCurMonth(Number(e.target.value))}
//                 className="text-xs font-semibold border border-gray-200 dark:border-gray-700 rounded-lg px-1.5 py-1 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-400">
//                 {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
//               </select>
//               <select value={curYear} onChange={(e) => setCurYear(Number(e.target.value))}
//                 className="text-xs font-semibold border border-gray-200 dark:border-gray-700 rounded-lg px-1.5 py-1 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-400">
//                 {years.map((y) => <option key={y} value={y}>{y}</option>)}
//               </select>
//             </div>
//             <button type="button" onClick={() => changeMonth(1)}
//               className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-all">
//               <ChevronRight size={14} />
//             </button>
//           </div>

  
//           <div className="grid grid-cols-7 mb-0.5">
//             {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
//               <div key={d} className="text-center text-[10px] font-semibold text-gray-400 dark:text-gray-500 py-1">{d}</div>
//             ))}
//           </div>

//           {/* Days grid */}
//           <div className="grid grid-cols-7 gap-0.5">
//             {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
//             {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
//               const iso = `${curYear}-${String(curMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
//               const isSel = value === iso;
//               const isToday = d === today.getDate() && curMonth === today.getMonth() && curYear === today.getFullYear();
//               const selectable = isDaySelectable(d);

//               return (
//                 <button key={d} type="button"
//                   onClick={() => selectable && selectDay(d)}
//                   disabled={!selectable}
//                   className={`h-7 w-full rounded-lg text-xs font-medium transition-all
//                     ${!selectable
//                       ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
//                       : isSel
//                         ? "bg-blue-500 text-white"
//                         : isToday
//                           ? "border border-blue-300 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
//                           : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
//                     }`}
//                 >
//                   {d}
//                 </button>
//               );
//             })}
//           </div>

    
//           <div className="flex justify-between mt-2.5 pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
//             <button type="button" onClick={() => { onChange(""); setOpen(false); }}
//               className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
//               Clear
//             </button>
//             <button type="button" onClick={() => {
//               const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
//               onChange(iso); setOpen(false);
//             }} className="text-xs font-semibold text-blue-500 hover:text-blue-600 transition-colors">
//               Today
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


// OrderDatePicker.tsx
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";

export default function OrderDatePicker({
  value,
  onChange,
  placeholder = "Select date",
  minDate,
  maxDate,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
}) {
  const [open, setOpen] = useState(false);
  const [curYear, setCurYear] = useState(new Date().getFullYear());
  const [curMonth, setCurMonth] = useState(new Date().getMonth());
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const months = ["January","February","March","April","May","June",
    "July","August","September","October","November","December"];
  const today = new Date();

  const years = Array.from(
    { length: today.getFullYear() + 2 - 2020 },
    (_, i) => 2020 + i
  );

  // Compute popover position relative to viewport (fixed positioning avoids
  // affecting any ancestor's scrollHeight since it's rendered via portal)
  const updateCoords = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setCoords({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  };

  useLayoutEffect(() => {
    if (open) updateCoords();
  }, [open]);

  // Reposition on scroll/resize so it tracks the input if the page scrolls
  useEffect(() => {
    if (!open) return;
    const handle = () => updateCoords();
    window.addEventListener("scroll", handle, true);
    window.addEventListener("resize", handle);
    return () => {
      window.removeEventListener("scroll", handle, true);
      window.removeEventListener("resize", handle);
    };
  }, [open]);

  // Click outside (checks both trigger and portal content)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        popoverRef.current && !popoverRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      if (value) {
        const d = new Date(value + "T00:00:00");
        setCurYear(d.getFullYear());
        setCurMonth(d.getMonth());
      } else {
        setCurYear(today.getFullYear());
        setCurMonth(today.getMonth());
      }
    }
  }, [open]);

  const selected = value ? new Date(value + "T00:00:00") : null;
  const daysInMonth = new Date(curYear, curMonth + 1, 0).getDate();
  const firstDay = new Date(curYear, curMonth, 1).getDay();

  const changeMonth = (dir: number) => {
    let m = curMonth + dir, y = curYear;
    if (m > 11) { m = 0; y++; }
    if (m < 0)  { m = 11; y--; }
    setCurMonth(m); setCurYear(y);
  };

  const isDaySelectable = (day: number): boolean => {
    const iso = `${curYear}-${String(curMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (minDate && iso < minDate) return false;
    if (maxDate && iso > maxDate) return false;
    return true;
  };

  const selectDay = (d: number) => {
    if (!isDaySelectable(d)) return;
    const iso = `${curYear}-${String(curMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    onChange(iso);
    setOpen(false);
  };

  const displayValue = selected
    ? selected.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : placeholder;

  const popover = open && coords && (
    <div
      ref={popoverRef}
      style={{
        position: "fixed",
        top: coords.top,
        left: coords.left,
        minWidth: 260,
        zIndex: 9999,
      }}
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700
        rounded-xl shadow-lg p-3"
    >
      {/* Month / Year nav */}
      <div className="flex items-center justify-between mb-2">
        <button type="button" onClick={() => changeMonth(-1)}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-all">
          <ChevronLeft size={14} />
        </button>
        <div className="flex gap-1">
          <select value={curMonth} onChange={(e) => setCurMonth(Number(e.target.value))}
            className="text-xs font-semibold border border-gray-200 dark:border-gray-700 rounded-lg px-1.5 py-1 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-400">
            {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select value={curYear} onChange={(e) => setCurYear(Number(e.target.value))}
            className="text-xs font-semibold border border-gray-200 dark:border-gray-700 rounded-lg px-1.5 py-1 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-400">
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <button type="button" onClick={() => changeMonth(1)}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-all">
          <ChevronRight size={14} />
        </button>
      </div>


      <div className="grid grid-cols-7 mb-0.5">
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-gray-400 dark:text-gray-500 py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
          const iso = `${curYear}-${String(curMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const isSel = value === iso;
          const isToday = d === today.getDate() && curMonth === today.getMonth() && curYear === today.getFullYear();
          const selectable = isDaySelectable(d);

          return (
            <button key={d} type="button"
              onClick={() => selectable && selectDay(d)}
              disabled={!selectable}
              className={`h-7 w-full rounded-lg text-xs font-medium transition-all
                ${!selectable
                  ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                  : isSel
                    ? "bg-blue-500 text-white"
                    : isToday
                      ? "border border-blue-300 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
            >
              {d}
            </button>
          );
        })}
      </div>


      <div className="flex justify-between mt-2.5 pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
        <button type="button" onClick={() => { onChange(""); setOpen(false); }}
          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          Clear
        </button>
        {/* <button type="button" onClick={() => {
          const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
          onChange(iso); setOpen(false);
        }} className="text-xs font-semibold text-blue-500 hover:text-blue-600 transition-colors">
          Today
        </button> */}
      </div>
    </div>
  );

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center gap-2 px-3 py-2 border rounded-lg text-sm
          bg-white dark:bg-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500
          ${value
            ? "border-blue-300 dark:border-blue-600 text-gray-900 dark:text-white"
            : "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500"
          }`}
      >
        <Calendar size={14} className="flex-shrink-0 text-gray-400" />
        <span className="flex-1 text-left text-xs">{displayValue}</span>
        <ChevronDown
          size={14}
          className={`flex-shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && coords && createPortal(popover, document.body)}
    </div>
  );
}
