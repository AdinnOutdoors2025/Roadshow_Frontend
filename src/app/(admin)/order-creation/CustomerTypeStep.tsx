"use client";

import React, { useState, useCallback } from "react";
import { CustomerFormData, CustomerSelection } from "./AdminOrderForm";
import { Customer, createCustomer, searchCustomers } from "./../../../utils/Adminorderapi";
import FormField, { inputClass } from "../../../components/reusableFormField";

interface Props {
  formData: CustomerFormData;     
  data: CustomerSelection;
  onChange: (d: Partial<CustomerSelection>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function CustomerTypeStep({ formData, data, onChange, onNext, onBack }: Props) {
  const [error, setError] = useState("");

 
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);


  const handleSearch = useCallback(async (q: string) => {
    setSearchQ(q);
    setSearchError("");
    if (q.trim().length < 2) { setSearchResults([]); return; }
    try {
      setSearching(true);
      const { customers } = await searchCustomers(q);
      setSearchResults(customers);
    } catch (e: any) {
      setSearchError(e.message);
    } finally {
      setSearching(false);
    }
  }, []);

  
  const handleCreateCustomer = async () => {
    try {
      setCreating(true);
      setError("");
      const { customer } = await createCustomer({
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        email: formData.email,
      });
      onChange({ customer });
      setCreated(true);
    } catch (e: any) {
     
      if (e.message.includes("already exists")) {
        setError("This  phone number customer already exists. 'Existing Customer");
      } else {
        setError(e.message);
      }
    } finally {
      setCreating(false);
    }
  };

  const handleNext = () => {
    if (!data.type) { setError("Please select a customer type"); return; }
    if (!data.customer) {
      if (data.type === "existing") setError("Please select an existing customer");
      else setError("Please create the customer first");
      return;
    }
    onNext();
  };

  const selectType = (t: "existing" | "new") => {
    onChange({ type: t, customer: null });
    setError("");
    setCreated(false);
    setSearchResults([]);
    setSearchQ("");
  };

  return (
    <div className="space-y-5">
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Stage 2 · Customer Type</h3>

      </div>

      {/* Type selector */}
      <div className="grid grid-cols-2 gap-3">
        {(["existing", "new"] as const).map((t) => (
          <button key={t} type="button" onClick={() => selectType(t)}
            className={`rounded-xl border-2 px-4 py-4 text-sm font-medium transition-all text-left
              ${data.type === t ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"}`}>
            <div className={`h-3.5 w-3.5 rounded-full border-2 mb-2 transition-all ${data.type === t ? "border-blue-500 bg-blue-500" : "border-gray-300"}`} />
            <p className="font-semibold">{t === "existing" ? "Existing Customer" : "New Customer"}</p>
           
          </button>
        ))}
      </div>

      {/* ── Existing Customer: Search ── */}
      {data.type === "existing" && (
        <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer Search</p>
          <div className="relative">
            <input
              type="text"
              value={searchQ}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Phone number or name..."
              className={inputClass(false) + " pr-8"}
            />
            {searching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
              </div>
            )}
          </div>

          {searchError && <p className="text-xs text-red-500">{searchError}</p>}

          {searchResults.length > 0 && (
            <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
              {searchResults.map((c) => (
                <button key={c._id} type="button"
                  onClick={() => { onChange({ customer: c }); setError(""); }}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/10 ${data.customer?._id === c._id ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.phone}{c.address ? ` · ${c.address}` : ""}</p>
                    </div>
                    {data.customer?._id === c._id && (
                      <span className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {searchQ.length >= 2 && !searching && searchResults.length === 0 && !searchError && (
            <p className="text-xs text-gray-400">No customers found for "{searchQ}"</p>
          )}

          {data.customer && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2 dark:bg-green-900/20 dark:border-green-800">
              <svg className="h-4 w-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-xs font-medium text-green-700 dark:text-green-400">
                Selected: {data.customer.name} · {data.customer.phone}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── New Customer: Create ── */}
      {data.type === "new" && (
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">New Customer Details (Stage 1)</p>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-gray-400 text-xs">Name</span><p className="font-medium text-gray-800 dark:text-gray-200">{formData.name}</p></div>
            <div><span className="text-gray-400 text-xs">Phone</span><p className="font-medium text-gray-800 dark:text-gray-200">{formData.phone}</p></div>
            <div className="col-span-2"><span className="text-gray-400 text-xs">Address</span><p className="font-medium text-gray-800 dark:text-gray-200">{formData.address}</p></div>
          </div>

          {!created ? (
            <button
              onClick={handleCreateCustomer}
              disabled={creating}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {creating && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
              {creating ? "Creating..." : "Create Customer & Get ID"}
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2 dark:bg-green-900/20 dark:border-green-800">
              <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-xs font-medium text-green-700 dark:text-green-400">
                Customer created! ID: {data.customer?._id?.slice(-8)}
              </p>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex items-center justify-between pt-2">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
        <button onClick={handleNext} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
          Next
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}
