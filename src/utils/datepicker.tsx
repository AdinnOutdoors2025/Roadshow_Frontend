import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";

// ─── DatePicker Component ───────────────────────────────────────────────────────
export default function DatePicker({
  value,
  onChange,
  label,
  required
}: {
  value: string;
  onChange: (val: string) => void;
  label:string
  required:any
}) {
  const [open, setOpen] = useState(false);
  const [curYear, setCurYear] = useState(new Date().getFullYear());
  const [curMonth, setCurMonth] = useState(new Date().getMonth());
  const ref = useRef<HTMLDivElement>(null);

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  const today = new Date();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open && value) {
      const d = new Date(value + "T00:00:00");
      setCurYear(d.getFullYear());
      setCurMonth(d.getMonth());
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

  const selectDay = (d: number) => {
    const iso = `${curYear}-${String(curMonth + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    onChange(iso);
    setOpen(false);
  };

  const displayValue = selected
    ? selected.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })
    : "Select date";

  const years = Array.from({ length: 16 }, (_, i) => today.getFullYear() - 10 + i);

  return (
    <div ref={ref} className="relative">
      {/* ── Trigger button ── */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center gap-2 px-3 py-2.5 border rounded-xl text-sm
          bg-white dark:bg-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-orange-400
          ${value
            ? "border-orange-400 text-gray-900 dark:text-white"
            : "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500"
          }`}
      >
        <Calendar size={14} className="flex-shrink-0 text-gray-400" />
        <span className="flex-1 text-left">{displayValue}</span>
        <ChevronDown
          size={14}
          className={`flex-shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* ── Dropdown calendar ── */}
      {open && (
        <div className="absolute z-50 top-[calc(100%+4px)] left-0 right-0
          bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700
          rounded-xl shadow-lg p-3">

          {/* Month / Year nav */}
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg
                hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-all"
            >
              <ChevronLeft size={14} />
            </button>

            <div className="flex gap-1">
              <select
                value={curMonth}
                onChange={(e) => setCurMonth(Number(e.target.value))}
                className="text-xs font-semibold border border-gray-200 dark:border-gray-700
                  rounded-lg px-1.5 py-1 bg-white dark:bg-gray-800
                  text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-400"
              >
                {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
              <select
                value={curYear}
                onChange={(e) => setCurYear(Number(e.target.value))}
                className="text-xs font-semibold border border-gray-200 dark:border-gray-700
                  rounded-lg px-1.5 py-1 bg-white dark:bg-gray-800
                  text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-400"
              >
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg
                hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-all"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-0.5">
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
              <div key={d} className="text-center text-[10px] font-semibold
                text-gray-400 dark:text-gray-500 py-1">{d}</div>
            ))}
          </div>

          {/* Day cells — compact */}
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
              const isoD = `${curYear}-${String(curMonth+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
              const isSel = value === isoD;
              const isToday =
                d === today.getDate() &&
                curMonth === today.getMonth() &&
                curYear === today.getFullYear();
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => selectDay(d)}
                  className={`h-7 w-full rounded-lg text-xs font-medium transition-all
                    ${isSel
                      ? "bg-orange-500 text-white"
                      : isToday
                      ? "border border-orange-300 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                >
                  {d}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex justify-between mt-2.5 pt-2 border-t border-dashed
            border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); }}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => {
                const d = today;
                const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
                onChange(iso); setOpen(false);
              }}
              className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}