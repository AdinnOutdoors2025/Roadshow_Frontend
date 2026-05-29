import { useEffect, useRef, useState } from "react";
import { HiOutlinePlus } from "react-icons/hi";
import API_BASE from "../../../../baseurl";

export default function CitySelect({
  value,
  options,
  disabled,
  error,
  stateName,
  onChange,
  onAddCity,
}: {
  value: string;
  options: string[];
  disabled: boolean;
  error?: string;
  stateName: string;
  onChange: (city: string) => void;
  onAddCity: (city: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [newCity, setNewCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const newCityRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setAdding(false);
        setSearch("");
        setNewCity("");
        setAddError("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (adding && newCityRef.current) {
      setTimeout(() => newCityRef.current?.focus(), 50);
    }
  }, [adding]);

  const filtered = options.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    if (!newCity.trim()) { setAddError("Enter city name"); return; }

    setLoading(true);
    setAddError("");
    try {
      const res = await fetch(`${API_BASE}locations/${encodeURIComponent(stateName)}/cities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: newCity.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");

      onAddCity(newCity.trim());
      onChange(newCity.trim());
      setNewCity("");
      setAdding(false);
      setOpen(false);
      setSearch("");
    } catch (err: any) {
      setAddError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={ref} className="relative">
   
      <button
        type="button"
        disabled={disabled}
        onClick={() => { if (!disabled) setOpen((o) => !o); }}
        className={inputClass(!!error) + " flex items-center justify-between w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"}
      >
        <span className={value ? "text-gray-900 dark:text-white" : "text-gray-400"}>
          {value || (disabled ? "Select state first" : "Select city")}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20" fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

     
      {open && (
        <div className="absolute z-50 w-full mt-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl overflow-hidden">

         
          {!adding && (
            <div className="p-2 border-b border-gray-100 dark:border-gray-700">
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search city..."
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 outline-none focus:border-blue-400"
              />
            </div>
          )}

          
          {adding ? (
            <div className="p-3 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                Add city to {stateName}
              </p>
              <input
                ref={newCityRef}
                type="text"
                value={newCity}
                onChange={(e) => { setNewCity(e.target.value); setAddError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") { setAdding(false); setNewCity(""); setAddError(""); } }}
                placeholder="e.g. Coimbatore"
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 outline-none focus:border-blue-400"
              />
              {addError && <p className="text-[10px] text-red-500">{addError}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setAdding(false); setNewCity(""); setAddError(""); }}
                  className="flex-1 rounded-lg border border-gray-200 dark:border-gray-600 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={loading}
                  className="flex-1 rounded-lg bg-blue-600 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
                >
                  {loading ? "Adding..." : "Add"}
                </button>
              </div>
            </div>
          ) : (
            <>
             
              <div className="max-h-44 overflow-y-auto">
                {filtered.length === 0 ? (
                  <p className="px-3 py-3 text-xs text-gray-400 text-center">No cities found</p>
                ) : (
                  filtered.map((city, idx) => (
                    <div
                      key={`${city}-${idx}`}
                      onClick={() => { onChange(city); setOpen(false); setSearch(""); }}
                      className={`px-3 py-2 text-sm cursor-pointer transition-colors
      ${city === value
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                    >
                      {city}
                    </div>
                  ))
                )}
              </div>

             
              <div
                onClick={() => setAdding(true)}
                className="flex items-center gap-2 px-3 py-2.5 border-t border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 group-hover:bg-blue-200 transition-colors">
                  <HiOutlinePlus className="h-3 w-3 text-blue-600 dark:text-blue-400 stroke-2" />
                </div>
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  Add new city
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}


export function inputClass(hasError: boolean) {
  return `w-full rounded-lg border px-3 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none transition-colors focus:ring-2 dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500 ${
    hasError
      ? "border-red-400 focus:border-red-400 focus:ring-red-100 dark:border-red-600 dark:focus:ring-red-900/30"
      : "border-gray-200 focus:border-blue-400 focus:ring-blue-100 dark:border-gray-700 dark:focus:border-blue-500 dark:focus:ring-blue-900/30"
  }`;
}

export function selectClass(hasError: boolean) {
  return `w-full rounded-lg border px-3 py-2 text-sm text-gray-700 outline-none transition-colors focus:ring-2 dark:bg-gray-800 dark:text-gray-200 ${
    hasError
      ? "border-red-400 focus:border-red-400 focus:ring-red-100 dark:border-red-600 dark:focus:ring-red-900/30"
      : "border-gray-200 focus:border-blue-400 focus:ring-blue-100 dark:border-gray-700 dark:focus:border-blue-500 dark:focus:ring-blue-900/30"
  }`;
}