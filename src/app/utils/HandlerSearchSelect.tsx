
/* eslint-disable */
// @ts-nocheck

"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

// Type-to-filter handler picker used by Sales/Operation (non-admin) logins
// in place of the plain <select> dropdown. Admin login keeps the existing
// dropdown untouched — this component is only mounted for staff users.
export default function HandlerSearchSelect({
  value,
  onChange,
  options,
  placeholder = "Type to search handler...",
}: {
  value: string;
  onChange: (username: string) => void;
  options: { username: string }[];
  placeholder?: string;
}) {
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter((o) =>
    o.username.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div ref={ref} className="relative">
      <div className="mt-1 flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2">
        <Search size={14} className="text-gray-400 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (e.target.value.trim() === "") onChange("");
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="flex-1 text-sm bg-transparent outline-none"
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-[70] left-0 right-0 top-[calc(100%+4px)] max-h-48 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg">
          {filtered.map((o) => (
            <button
              key={o.username}
              type="button"
              onClick={() => {
                onChange(o.username);
                setQuery(o.username);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
            >
              {o.username}
            </button>
          ))}
        </div>
      )}
      {open && filtered.length === 0 && (
        <div className="absolute z-[70] left-0 right-0 top-[calc(100%+4px)] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg px-3 py-2 text-sm text-gray-400">
          No matching handler
        </div>
      )}
    </div>
  );
}
