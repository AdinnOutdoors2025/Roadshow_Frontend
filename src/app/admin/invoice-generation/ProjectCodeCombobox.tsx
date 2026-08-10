"use client";

import { useEffect, useRef, useState } from "react";
import { ReceiptText } from "lucide-react";

interface ProjectCodeOrder {
  _id: string;
  orderId: string;
  name: string;
  projectCode: string;
  estimationCode: string;
}

interface Props {
  options: ProjectCodeOrder[];
  loading: boolean;
  selectedLabel: string;
  onSelect: (order: ProjectCodeOrder) => void;
}

export default function ProjectCodeCombobox({ options, loading, selectedLabel, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const normalize = (s: string) => (s || "").replace(/\s+/g, "").toLowerCase();

  const filtered = query.trim()
    ? options.filter(
        (o) =>
          normalize(o.projectCode).includes(normalize(query)) ||
          normalize(o.name).includes(normalize(query))
      )
    : options;

  const handleSelect = (o: ProjectCodeOrder) => {
    onSelect(o);
    setQuery("");
    setOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <ReceiptText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
      <input
        type="text"
        value={open ? query : selectedLabel}
        onChange={(e) => {
          setQuery(e.target.value);
          if (!open) setOpen(true);
        }}
        onFocus={() => {
          setQuery("");
          setOpen(true);
        }}
        placeholder="Type or search project code..."
        autoComplete="off"
        className="w-full border rounded-lg pl-9 pr-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 transition-all"
      />

      {open && (
        <div className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
          {loading ? (
            <div className="px-3 py-3 text-sm text-gray-400 flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
              Loading project codes...
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-3 py-3 text-sm text-gray-400">
              {options.length === 0 ? "No project codes found" : "No match found"}
            </div>
          ) : (
            filtered.map((o) => (
              <button
                type="button"
                key={o._id}
                onClick={() => handleSelect(o)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between gap-2"
              >
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  {o.projectCode}
                </span>
                {o.name && (
                  <span className="text-[11px] text-gray-400 truncate max-w-[160px]">{o.name}</span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
