"use client";

import React, { useEffect, useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-hot-toast";
import API_BASE from "../../../../baseurl";
import { inputClass } from "../../../components/reusableFormField";
import FormField from "../../../components/reusableFormField";
import { getToken } from "../../utils/auth";
import DatePicker from "../../utils/datepicker";

const DRIVER_GENDER_OPTIONS = ["Male", "Female", "Other"];

export interface Driver {
    _id?: string;
    name: string;
    dob: string;
    gender: string;
    aadharNo: string;
    house: string;
    dist: string;
    state: string;
    country: string;
    pincode: string;
    panNumber: string;
    drivingLicenseNo: string;
}

interface Props {
    editingDriver: Driver | null;
    onSuccess: () => void;
    onClose: () => void;
}

const defaultForm: Driver = {
    name: "",
    dob: "",
    gender: "",
    aadharNo: "",
    house: "",
    dist: "",
    state: "",
    country: "India",
    pincode: "",
    panNumber: "",
    drivingLicenseNo: "",
};

export default function DriverFormModal({ editingDriver, onSuccess, onClose }: Props) {
    const [form, setForm] = useState<Driver>(defaultForm);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof Driver, string>>>({});
    const [genderDropdownOpen, setGenderDropdownOpen] = useState(false);
    const genderDropdownRef = useRef<HTMLDivElement>(null);

    const isEdit = !!editingDriver;

    useEffect(() => {
        if (editingDriver) {
            setForm({ ...editingDriver });
        } else {
            setForm(defaultForm);
        }
        setErrors({});
        setGenderDropdownOpen(false);
    }, [editingDriver]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (
                genderDropdownRef.current &&
                !genderDropdownRef.current.contains(e.target as Node)
            )
                setGenderDropdownOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const set = (field: keyof Driver, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof Driver, string>> = {};

        if (!form.name.trim()) newErrors.name = "Name is required";

        // if (!form.dob.trim()) newErrors.dob = "Date of birth is required";

        if (!form.dob.trim()) {
            newErrors.dob = "Date of birth is required";
        } else {
            const today = new Date();
            const dob = new Date(form.dob);
            const age = today.getFullYear() - dob.getFullYear();
            const monthDiff = today.getMonth() - dob.getMonth();
            const actualAge =
                monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())
                    ? age - 1
                    : age;
            if (actualAge < 18) {
                newErrors.dob = "Driver must be at least 18 years old";
            }
        }

        if (!form.gender) newErrors.gender = "Gender is required";

        if (!form.aadharNo.trim()) {
            newErrors.aadharNo = "Aadhar number is required";
        } else if (!/^\d{12}$/.test(form.aadharNo.replace(/\s/g, ""))) {
            newErrors.aadharNo = "Enter a valid 12-digit Aadhar number";
        }

        if (!form.house.trim()) newErrors.house = "House/Door number is required";

        if (!form.dist.trim()) newErrors.dist = "District is required";

        if (!form.state.trim()) newErrors.state = "State is required";

        if (!form.country.trim()) newErrors.country = "Country is required";

        if (!form.pincode.trim()) {
            newErrors.pincode = "Pincode is required";
        } else if (!/^\d{6}$/.test(form.pincode)) {
            newErrors.pincode = "Enter a valid 6-digit pincode";
        }

        if (!form.panNumber.trim()) {
            newErrors.panNumber = "PAN number is required";
        } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNumber.toUpperCase())) {
            newErrors.panNumber = "Enter a valid PAN (e.g. ABCDE1234F)";
        }

        if (!form.drivingLicenseNo.trim()) {
            newErrors.drivingLicenseNo = "Driving license number is required";
        } else if (!/^[A-Z]{2}\d{2}\s?\d{11}$/.test(form.drivingLicenseNo.toUpperCase())) {
            newErrors.drivingLicenseNo = "Enter a valid license number (e.g. TN0120110012345)";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        try {
            setLoading(true);
            const token = getToken();
            const payload: Driver = {
                name: form.name.trim(),
                dob: form.dob.trim(),
                gender: form.gender,
                aadharNo: form.aadharNo.replace(/\s/g, ""),
                house: form.house.trim(),
                dist: form.dist.trim(),
                state: form.state.trim(),
                country: form.country.trim(),
                pincode: form.pincode.trim(),
                panNumber: form.panNumber.toUpperCase().trim(),
                drivingLicenseNo: form.drivingLicenseNo.trim()
            };

            const url = isEdit
                ? `${API_BASE}drivers/${editingDriver!._id}`
                : `${API_BASE}drivers/`;

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
                if (msg.toLowerCase().includes("aadhar")) {
                    toast.error("Aadhar number already exists!");
                } else if (msg.toLowerCase().includes("pan")) {
                    toast.error("PAN number already exists!");
                } else {
                    toast.error(msg);
                }
                return;
            }

            toast.success(isEdit ? "Driver updated successfully!" : "Driver added successfully!");
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
                            <svg
                                className="h-4 w-4 text-blue-600 dark:text-blue-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                        </span>
                        <h2 className="text-base font-semibold text-gray-800 dark:text-white">
                            {isEdit ? "Edit Driver" : "Add Driver"}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:text-gray-400"
                    >
                        <IoMdClose />
                    </button>
                </div>

                {/* Form Body */}
                <div className="px-6 py-5 grid grid-cols-2 gap-4">

                    {/* Name — full width */}
                    <div className="col-span-2">
                        <FormField label="Full Name" error={errors.name} required>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                                    set("name", val);
                                }}
                                placeholder="e.g. Rahul Singh"
                                className={inputClass(!!errors.name)}
                            />
                        </FormField>
                    </div>

                    {/* DOB */}
                    <div>
                        {/*  <FormField label="Date of Birth" error={errors.dob} required>
                            <input
                                type="date"
                                value={form.dob}
                                onChange={(e) => set("dob", e.target.value)}
                                max={new Date().toISOString().split("T")[0]}
                                className={inputClass(!!errors.dob)}
                            />
                        </FormField>  */}

                        <div>
                            <FormField label="Date of Birth" error={errors.dob} required>
                                <DatePicker
                                    value={form.dob}
                                    onChange={(val: string) => set("dob", val)}
                                    label="Date of Birth"
                                    required={true}
                                />
                            </FormField>
                        </div>
                    </div>

                    {/* Gender */}
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
                                        <path
                                            fillRule="evenodd"
                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>

                                {genderDropdownOpen && (
                                    <div className="absolute z-50 w-full mt-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg overflow-hidden">
                                        {DRIVER_GENDER_OPTIONS.map((g) => (
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
                                                    <svg
                                                        className="w-3.5 h-3.5 text-blue-600 shrink-0"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l7.879-7.879a1 1 0 011.414 0z"
                                                            clipRule="evenodd"
                                                        />
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

                    {/* Driving License Number */}
                    <div className="col-span-2">
                        <FormField label="Driving License Number" error={errors.drivingLicenseNo} required>
                            <input
                                type="text"
                                value={form.drivingLicenseNo}
                                onChange={(e) => {
                                    const val = e.target.value.toUpperCase().slice(0, 16);
                                    set("drivingLicenseNo", val);
                                }}
                                placeholder="e.g. TN0120110012345"
                                maxLength={16}
                                className={`font-mono ${inputClass(!!errors.drivingLicenseNo)}`}
                            />
                        </FormField>
                    </div>

                    {/* Aadhar No */}
                    <div>
                        <FormField label="Aadhar Number" error={errors.aadharNo} required>
                            <input
                                type="text"
                                value={form.aadharNo}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, "").slice(0, 12);
                                    set("aadharNo", val);
                                }}
                                placeholder="12-digit Aadhar number"
                                maxLength={12}
                                className={`font-mono ${inputClass(!!errors.aadharNo)}`}
                            />
                        </FormField>
                    </div>

                    {/* PAN Number */}
                    <div>
                        <FormField label="PAN Number" error={errors.panNumber} required>
                            <input
                                type="text"
                                value={form.panNumber}
                                onChange={(e) => {
                                    const val = e.target.value.toUpperCase().slice(0, 10);
                                    set("panNumber", val);
                                }}
                                placeholder="e.g. ABCDE1234F"
                                maxLength={10}
                                className={`font-mono ${inputClass(!!errors.panNumber)}`}
                            />
                        </FormField>
                    </div>

                    {/* House */}
                    <div className="col-span-2">
                        <FormField label="House / Door No" error={errors.house} required>
                            <input
                                type="text"
                                value={form.house}
                                onChange={(e) => set("house", e.target.value)}
                                placeholder="e.g. 1/204, Nehru Street"
                                className={inputClass(!!errors.house)}
                            />
                        </FormField>
                    </div>



                    {/* State */}
                    <div>
                        <FormField label="State" error={errors.state} required>
                            <input
                                type="text"
                                value={form.state}
                                onChange={(e) => set("state", e.target.value)}
                                placeholder="e.g. Uttar Pradesh"
                                className={inputClass(!!errors.state)}
                            />
                        </FormField>
                    </div>

                    {/* Locality — optional, no validation */}
                    <div>
                        <FormField label="District" error={errors.dist} required>
                            <input
                                type="text"
                                value={form.dist}
                                onChange={(e) => set("dist", e.target.value)}
                                placeholder="e.g. Aligarh"
                                className={inputClass(!!errors.dist)}
                            />
                        </FormField>
                    </div>

                    {/* Country */}
                    <div>
                        <FormField label="Country" error={errors.country} required>
                            <input
                                type="text"
                                value={form.country}
                                onChange={(e) => set("country", e.target.value)}
                                placeholder="e.g. India"
                                className={inputClass(!!errors.country)}
                            />
                        </FormField>
                    </div>

                    {/* Pincode */}
                    <div>
                        <FormField label="Pincode" error={errors.pincode} required>
                            <input
                                type="text"
                                value={form.pincode}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                                    set("pincode", val);
                                }}
                                placeholder="6-digit pincode"
                                maxLength={6}
                                className={`font-mono ${inputClass(!!errors.pincode)}`}
                            />
                        </FormField>
                    </div>

                </div>

                {/* Footer */}
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
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8H4z"
                                />
                            </svg>
                        )}
                        {isEdit ? "Update" : "Add Driver"}
                    </button>
                </div>

            </div>
        </div>
    );
}
