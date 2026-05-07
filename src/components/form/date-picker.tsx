// 'use client'

// import { useEffect } from 'react';
// import flatpickr from 'flatpickr';
// import 'flatpickr/dist/flatpickr.css';
// import Label from './Label';
// import { CalenderIcon } from '../../icons';
// import Hook = flatpickr.Options.Hook;
// import DateOption = flatpickr.Options.DateOption;

// type PropsType = {
//   id: string;
//   mode?: "single" | "multiple" | "range" | "time";
//   onChange?: Hook | Hook[];
//   defaultDate?: DateOption;
//   label?: string;
//   placeholder?: string;
//   value?: any;
//   error?: string;
//   required?: boolean;
//   minDate?: DateOption;
// };

// export default function DatePicker({
//   id,
//   mode,
//   onChange,
//   label,
//   defaultDate,
//   placeholder,
//   error,
//   required,
//   minDate,
//    value, 
// }: PropsType) {
// // useEffect(() => {
// //   let fp: flatpickr.Instance;

// //   fp = flatpickr(`#${id}`, {
// //     mode: mode || "single",
// //     static: false,
// //     monthSelectorType: "static",
// //     dateFormat: "Y-m-d",
// //     defaultDate,
// //     minDate,
// //     onChange,
// //     disableMobile: true,
// //     appendTo: document.body,
// //     positionElement: document.getElementById(id) ?? undefined,
// //   }) as flatpickr.Instance;


// //   if (value) {
// //     fp.setDate(value, false); 
// //   }

// //   return () => {
// //     if (fp) fp.destroy();
// //   };
// // }, [mode, onChange, id, defaultDate, minDate, value]); 
//   useEffect(() => {
//   let fp: flatpickr.Instance;

//   // Convert Date object → "YYYY-MM-DD" string to avoid timezone issues
//   const safeDate = value instanceof Date
//     ? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`
//     : value;

//   fp = flatpickr(`#${id}`, {
//     mode: mode || "single",
//     static: false,
//     monthSelectorType: "static",
//     dateFormat: "Y-m-d",
//     defaultDate: safeDate,   // ← use safeDate here instead of defaultDate
//     minDate,
//     onChange,
//     disableMobile: true,
//     appendTo: document.body,
//     positionElement: document.getElementById(id) ?? undefined,
//   }) as flatpickr.Instance;

//   // ← Remove the separate fp.setDate(value) call — defaultDate handles it now

//   return () => {
//     if (fp) fp.destroy();
//   };
// }, [mode, onChange, id, minDate, value]);


// return (
//     <div className="w-full">
//       {label && (
//         <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
//           {label}
//           {required && <span className="text-red-500 ml-0.5">*</span>}
//         </label>
//       )}

//       <div className="relative w-full">
//         <input
//           id={id}
//           placeholder={placeholder || "YYYY-MM-DD"}
//           readOnly               
//           className={`h-10 w-full rounded-lg border appearance-none px-4 pr-10 py-2.5 text-sm
//             placeholder:text-gray-400 focus:outline-none focus:ring-2
//             dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30
//             bg-white text-gray-800 cursor-pointer
//             ${error
//               ? "border-red-400 focus:border-red-400 focus:ring-red-200 dark:border-red-500"
//               : "border-gray-300 focus:border-blue-400 focus:ring-blue-100 dark:border-gray-700 dark:focus:border-blue-600"
//             }`}
//         />
//         <span className="absolute text-gray-400 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-500">
//           <CalenderIcon className="size-5" />
//         </span>
//       </div>

//       {error && (
//         <p className="mt-1 text-xs text-red-500">{error}</p>
//       )}
//     </div>
//   );
// }


'use client'

import { useEffect } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';
import Label from './Label';
import { CalenderIcon } from '../../icons';
import Hook = flatpickr.Options.Hook;
import DateOption = flatpickr.Options.DateOption;

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time";
  onChange?: Hook | Hook[];
  defaultDate?: DateOption;
  label?: string;
  placeholder?: string;
  value?: any;
  error?: string;
  required?: boolean;
  minDate?: DateOption;
};

// ── Helper: safely converts any date value to "YYYY-MM-DD" string ──
function toLocalDateString(val: DateOption | undefined): string | undefined {
  if (!val) return undefined;
  if (typeof val === "string") {
    // Already a string like "2026-05-29" — use directly, no Date() parsing
    return val;
  }
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, "0");
    const d = String(val.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return undefined;
}

export default function DatePicker({
  id,
  mode,
  onChange,
  label,
  defaultDate,
  placeholder,
  error,
  required,
  minDate,
  value,
}: PropsType) {

useEffect(() => {
  const fp = flatpickr(`#${id}`, {
    mode: mode || "single",
    static: false,
    monthSelectorType: "static",
    dateFormat: "Y-m-d",
    defaultDate: value ?? defaultDate,  // plain string, flatpickr handles it correctly
    minDate: minDate,                   // plain string, no UTC shift
    onChange,
    disableMobile: true,
    appendTo: document.body,
    positionElement: document.getElementById(id) ?? undefined,
  }) as flatpickr.Instance;

  return () => { if (fp) fp.destroy(); };
}, [mode, onChange, id, defaultDate, minDate, value]);
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative w-full">
        <input
          id={id}
          placeholder={placeholder || "YYYY-MM-DD"}
          readOnly
          className={`h-10 w-full rounded-lg border appearance-none px-4 pr-10 py-2.5 text-sm
            placeholder:text-gray-400 focus:outline-none focus:ring-2
            dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30
            bg-white text-gray-800 cursor-pointer
            ${error
              ? "border-red-400 focus:border-red-400 focus:ring-red-200 dark:border-red-500"
              : "border-gray-300 focus:border-blue-400 focus:ring-blue-100 dark:border-gray-700 dark:focus:border-blue-600"
            }`}
        />
        <span className="absolute text-gray-400 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-500">
          <CalenderIcon className="size-5" />
        </span>
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}