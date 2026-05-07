import { useState, useEffect, useRef } from "react";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function pad(n: number) { return String(n).padStart(2, "0"); }
function toKey(y: number, m: number, d: number) { return `${y}-${pad(m + 1)}-${pad(d)}`; }
function fmt(k: string) {
  const [y, m, d] = k.split("-").map(Number);
  return `${pad(d)} ${MONTHS[m - 1].slice(0, 3)} ${y}`;
}
function todayKey() {
  const n = new Date();
  return toKey(n.getFullYear(), n.getMonth(), n.getDate());
}

interface DatePickerProps {
  value: string;
  onChange: (val: string) => void;
  minDate?: string;
  placeholder?: string;
  error?: string;
  label: string;
  required?: boolean;
}

function DatePicker({ value, onChange, minDate, placeholder = "Select date", error, label, required }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const min = minDate || todayKey();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const navMonth = (dir: number) => {
    let m = viewMonth + dir, y = viewYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setViewMonth(m);
    setViewYear(y);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div ref={ref} className="relative">
        <div
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-2 px-3 h-9 border rounded-lg cursor-pointer select-none text-sm
            ${open ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-300"}
            ${error ? "border-red-400" : ""}
            bg-white`}
        >
          <CalendarIcon />
          <span className={value ? "text-gray-900" : "text-gray-400"}>
            {value ? fmt(value) : placeholder}
          </span>
        </div>

        {open && (
          <div className="absolute top-full mt-1.5 left-0 z-50 bg-white border border-gray-200 rounded-xl p-4 min-w-[272px] shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => navMonth(-1)} className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 text-sm">&#8592;</button>
              <span className="text-sm font-medium">{MONTHS[viewMonth]} {viewYear}</span>
              <button onClick={() => navMonth(1)} className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 text-sm">&#8594;</button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-0.5">
              {Array(firstDay).fill(null).map((_, i) => <div key={i} />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                const key = toKey(viewYear, viewMonth, d);
                const disabled = key < min;
                const isSelected = key === value;
                const isToday = key === todayKey();
                return (
                  <button
                    key={d}
                    disabled={disabled}
                    onClick={() => { onChange(key); setOpen(false); }}
                    className={`text-xs text-center py-1.5 rounded-lg border-none transition-colors
                      ${isSelected ? "bg-blue-600 text-white" : ""}
                      ${isToday && !isSelected ? "text-blue-600 font-semibold" : ""}
                      ${disabled ? "text-gray-300 cursor-not-allowed" : !isSelected ? "hover:bg-gray-100 cursor-pointer" : ""}
                    `}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-gray-400">
      <rect x="1" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M1 7h14" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M5 1v4M11 1v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}