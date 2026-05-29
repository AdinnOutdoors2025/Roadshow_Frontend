"use client";

import React, { useEffect, useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-hot-toast";
import API_BASE from "../../../../baseurl";
import { inputClass } from "../../../components/reusableFormField";
import FormField from "../../../components/reusableFormField";
import { getToken } from "../../utils/auth";
import { languages } from "../../utils/collection.json";

const PROMOTER_GENDER_OPTIONS = ["Male", "Female", "Other"];

export interface Promoter {
    _id?: string;
    name: string;
    phone: string | number;
    email: string;
    language: string[];
    gender: string;
    promoterCharge: number | string;
    status: "active" | "inactive";
}

interface Props {
    editingPromoter: Promoter | null;
    onSuccess: () => void;
    onClose: () => void;
}

const defaultForm: Promoter = {
    name: "",
    phone: "",
    email: "",
    language: [],
    gender: "",
    promoterCharge: "",
    status: "active",
};

export default function PromoterFormModal({ editingPromoter, onSuccess, onClose }: Props) {
    const [form, setForm] = useState<Promoter>(defaultForm);
    const [displayCharge, setDisplayCharge] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof Promoter, string>>>({});
    const [langDropdownOpen, setLangDropdownOpen] = useState(false);
    const [genderDropdownOpen, setGenderDropdownOpen] = useState(false);
    const langDropdownRef = useRef<HTMLDivElement>(null);
    const genderDropdownRef = useRef<HTMLDivElement>(null);

    const isEdit = !!editingPromoter;

    useEffect(() => {
        if (editingPromoter) {
            setForm({ ...editingPromoter });
            const raw = String(editingPromoter.promoterCharge ?? "").replace(/,/g, "");
            setDisplayCharge(raw ? Number(raw).toLocaleString("en-IN") : "");
        } else {
            setForm(defaultForm);
            setDisplayCharge("");
        }
        setErrors({});
        setLangDropdownOpen(false);
        setGenderDropdownOpen(false);
    }, [editingPromoter]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node))
                setLangDropdownOpen(false);
            if (genderDropdownRef.current && !genderDropdownRef.current.contains(e.target as Node))
                setGenderDropdownOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const set = (field: keyof Promoter, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const handleChargeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/,/g, "").replace(/\D/g, "");
        if (raw === "") {
            setDisplayCharge("");
            set("promoterCharge", "");
            return;
        }
        const formatted = Number(raw).toLocaleString("en-IN");
        setDisplayCharge(formatted);
        set("promoterCharge", raw);
        if (errors.promoterCharge) setErrors((prev) => ({ ...prev, promoterCharge: undefined }));
    };

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof Promoter, string>> = {};
        if (!form.name.trim()) newErrors.name = "Name is required";
        if (!String(form.phone).trim()) newErrors.phone = "Phone NO is required";
        else if (!/^\d{10}$/.test(String(form.phone))) newErrors.phone = "Enter a valid 10-digit phone number";
        if (!form.email.trim()) newErrors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Enter a valid email";
        if (!form.gender) newErrors.gender = "Gender is required";
        if (form.language.length === 0) newErrors.language = "Select at least one language";
        if (form.promoterCharge === "" || form.promoterCharge === undefined)
            newErrors.promoterCharge = "Promoter charge is required";
        else if (isNaN(Number(form.promoterCharge)) || Number(form.promoterCharge) < 0)
            newErrors.promoterCharge = "Enter a valid charge amount";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        try {
            setLoading(true);
            const token = getToken();
            const payload = {
                name: form.name.trim(),
                phone: String(form.phone).trim(),
                email: form.email.trim(),
                language: form.language,
                gender: form.gender,
                promoterCharge: Number(form.promoterCharge),
                status: form.status,
            };

            const url = isEdit
                ? `${API_BASE}promoters/${editingPromoter!._id}`
                : `${API_BASE}promoters/`;

            const res = await fetch(url, {
                method: isEdit ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const resData = await res.json().catch(() => ({}));

            if (!res.ok) {
                const msg: string = resData?.message || "Failed to save";
                if (msg.toLowerCase().includes("email")) {
                    toast.error("Email already exists!");
                } else if (msg.toLowerCase().includes("phone")) {
                    toast.error("Phone number already exists!");
                } else {
                    toast.error(msg);
                }
                return;
            }

            toast.success(isEdit ? "Promoter updated successfully!" : "Promoter added successfully!");
            onSuccess();
        } catch (err: any) {
            toast.error(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">

                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
                    <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30">
                            <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </span>
                        <h2 className="text-base font-semibold text-gray-800 dark:text-white">
                            {isEdit ? "Edit Promoter" : "Add Promoter"}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:text-gray-400"
                    >
                        <IoMdClose />
                    </button>
                </div>

               
                <div className="px-6 py-5 grid grid-cols-2 gap-4">

                  
                    <div className="col-span-2">
                        <FormField label="Name" error={errors.name} required>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                                    set("name", val);
                                }}
                                placeholder="e.g. Ravi Kumar"
                                className={inputClass(!!errors.name)}
                            />
                        </FormField>
                    </div>

                  
                    <div>
                        <FormField label="Phone Number" error={errors.phone} required>
                            <div className="flex">
                                <span
                                    className={`inline-flex items-center px-3 rounded-l-lg border border-r-0 bg-gray-50 text-gray-500 text-sm font-medium dark:bg-gray-800 dark:text-gray-400 ${errors.phone ? "border-red-400" : "border-gray-200 dark:border-gray-700"
                                        }`}
                                >
                                    +91
                                </span>
                                <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                                        set("phone", val);
                                    }}
                                    placeholder="9876543210"
                                    maxLength={10}
                                    className={`flex-1 rounded-l-none rounded-r-lg ${inputClass(!!errors.phone)}`}
                                />
                            </div>
                        </FormField>
                    </div>

                    <div>
                        <FormField label="Email" error={errors.email} required>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => set("email", e.target.value)}
                                placeholder="e.g. ravi@example.com"
                                className={inputClass(!!errors.email)}
                            />
                        </FormField>
                    </div>

                  
                    <div>
                        <FormField label="Gender" error={errors.gender} required>
                            <div className="relative" ref={genderDropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setGenderDropdownOpen((o) => !o)}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition-colors ${errors.gender
                                        ? "border-red-400 bg-red-50 dark:bg-red-900/10"
                                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                        } ${form.gender ? "text-gray-800 dark:text-gray-100" : "text-gray-400"}`}
                                >
                                    <span>{form.gender || "Select gender"}</span>
                                    <svg
                                        className={`w-4 h-4 text-gray-400 transition-transform ${genderDropdownOpen ? "rotate-180" : ""}`}
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>

                                {genderDropdownOpen && (
                                    <div className="absolute z-50 w-full mt-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg overflow-hidden">
                                        {PROMOTER_GENDER_OPTIONS.map((g) => (
                                            <button
                                                key={g}
                                                type="button"
                                                onClick={() => {
                                                    set("gender", g);
                                                    setGenderDropdownOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors text-left ${form.gender === g
                                                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                                                    : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                                                    }`}
                                            >
                                                {form.gender === g ? (
                                                    <svg className="w-3.5 h-3.5 text-blue-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l7.879-7.879a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                ) : (
                                                    <span className="w-3.5" />
                                                )}
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </FormField>
                    </div>

                    <div>
                        <FormField label="Language" error={errors.language} required>
                            <div className="relative" ref={langDropdownRef}>
                                <div
                                    onClick={() => setLangDropdownOpen((o) => !o)}
                                    className={`min-h-[42px] flex flex-wrap gap-1 p-2 rounded-lg border cursor-pointer ${errors.language
                                        ? "border-red-400 bg-red-50"
                                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                        }`}
                                >
                                    {form.language.length === 0 && (
                                        <span className="text-gray-400 text-sm self-center pl-1">Select languages</span>
                                    )}
                                    {form.language.map((lang) => (
                                        <span
                                            key={lang}
                                            className="inline-flex items-center gap-1 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 text-xs font-medium"
                                        >
                                            {lang}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    set("language", form.language.filter((l) => l !== lang));
                                                }}
                                                className="hover:text-blue-900"
                                            >
                                                <IoMdClose className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                    <svg
                                        className={`ml-auto self-center w-4 h-4 text-gray-400 shrink-0 transition-transform ${langDropdownOpen ? "rotate-180" : ""}`}
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </div>

                                {langDropdownOpen && (
                                    <div className="absolute z-50 w-full mt-1 max-h-40 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg">
                                        {(languages as string[]).map((lang) => {
                                            const selected = form.language.includes(lang);
                                            return (
                                                <label
                                                    key={lang}
                                                    className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-sm transition-colors ${selected
                                                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                                                        : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selected}
                                                        onChange={() => {
                                                            if (selected) {
                                                                set("language", form.language.filter((l) => l !== lang));
                                                            } else {
                                                                set("language", [...form.language, lang]);
                                                            }
                                                        }}
                                                        className="accent-blue-600 rounded"
                                                    />
                                                    {lang}
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </FormField>
                    </div>

                   
                    <div className="col-span-2">
                        <FormField label="Promoter Charge (per day)" error={errors.promoterCharge} required>
                            <div className="relative">
                                <span
                                    className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold pointer-events-none ${errors.promoterCharge ? "text-red-400" : "text-gray-500 dark:text-gray-400"
                                        }`}
                                >
                                    ₹
                                </span>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={displayCharge}
                                    onChange={handleChargeChange}
                                    placeholder="e.g. 1,500"
                                    className={`pl-7 ${inputClass(!!errors.promoterCharge)}`}
                                />
                            </div>
                        </FormField>
                    </div>

                 
                    <div className="col-span-2">
                        <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</p>
                            <button
                                type="button"
                                onClick={() => set("status", form.status === "active" ? "inactive" : "active")}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.status === "active" ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${form.status === "active" ? "translate-x-6" : "translate-x-1"
                                        }`}
                                />
                            </button>
                            <span className={`text-sm font-medium ${form.status === "active" ? "text-green-600" : "text-red-500"}`}>
                                {form.status === "active" ? "Active" : "Inactive"}
                            </span>
                        </div>
                    </div>

                </div>

             
                <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-gray-100 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-lg border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
                    >
                        {loading && (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                        )}
                        {isEdit ? "Update" : "Add Promoter"}
                    </button>
                </div>
            </div>
        </div>
    );
}
