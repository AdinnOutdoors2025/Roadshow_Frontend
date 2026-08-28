
/* eslint-disable */
// @ts-nocheck

"use client";

import { useEffect, useRef, useState } from "react";
import { Search, ChevronDown } from "lucide-react";

// Generic searchable/type-to-filter dropdown — a drop-in replacement for a
// plain <select> wherever the option list can get long enough that typing
// to filter is faster than scrolling. Selection value/behavior mirrors a
// normal <select>: `value` holds the selected option's `value`, `onChange`
// fires only when an option is actually picked (typing alone never changes
// the selected value).
export default function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Search...",
  disabled = false,
  className = "",
  noResultsText = "No results found",
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  noResultsText?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label || "";

  useEffect(() => {
    if (!open) setQuery(selectedLabel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery(selectedLabel);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLabel]);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div
        className={`flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 ${disabled ? "opacity-60" : ""}`}
      >
        <Search size={14} className="text-gray-400 flex-shrink-0" />
        <input
          type="text"
          value={open ? query : selectedLabel}
          disabled={disabled}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => {
            if (disabled) return;
            setOpen(true);
            setQuery("");
          }}
          placeholder={placeholder}
          className="flex-1 min-w-0 text-sm bg-transparent outline-none text-gray-700 dark:text-gray-200"
        />
        <ChevronDown size={14} className={`text-gray-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </div>
      {open && (
        <div className="absolute z-[70] left-0 right-0 top-[calc(100%+4px)] max-h-56 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-400">{noResultsText}</div>
          ) : (
            filtered.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setQuery(o.label);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${o.value === value ? "font-semibold text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-200"}`}
              >
                {o.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
