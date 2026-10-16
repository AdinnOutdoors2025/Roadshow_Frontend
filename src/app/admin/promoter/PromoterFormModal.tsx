"use client";

import React, { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-hot-toast";
import API_BASE from "../../../../baseurl";
import { inputClass, selectClass } from "../../../components/reusableFormField";
import FormField from "../../../components/reusableFormField";
import { getToken } from "../../utils/auth";

export interface Promoter {
    _id?: string;
    state: string;
    promoterCharge: number | string;
}

interface Props {
    editingPromoter: Promoter | null;
    /** The 5 allowed state names (dynamic, from the Location collection), minus ones already configured — unless editing, where the current state is kept so it still renders (disabled). */
    availableStates: string[];
    onSuccess: () => void;
    onClose: () => void;
}

const defaultForm: Promoter = {
    state: "",
    promoterCharge: "",
};

export default function PromoterFormModal({ editingPromoter, availableStates, onSuccess, onClose }: Props) {
    const [form, setForm] = useState<Promoter>(defaultForm);
    const [displayCharge, setDisplayCharge] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof Promoter, string>>>({});

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
    }, [editingPromoter]);

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
    };

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof Promoter, string>> = {};
        if (!form.state) newErrors.state = "State is required";
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
                state: form.state,
                promoterCharge: Number(form.promoterCharge),
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
                toast.error(resData?.message || "Failed to save");
                return;
            }

            toast.success(isEdit ? "Promoter charge updated successfully!" : "Promoter charge added successfully!");
            onSuccess();
        } catch (err: any) {
            toast.error(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">

                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
                    <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30">
                            <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </span>
                        <h2 className="text-base font-semibold text-gray-800 dark:text-white">
                            {isEdit ? "Edit Promoter Charge" : "Add Promoter Charge"}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:text-gray-400"
                    >
                        <IoMdClose />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-4">
                    <FormField label="State" error={errors.state} required>
                        <select
                            value={form.state}
                            onChange={(e) => set("state", e.target.value)}
                            className={selectClass(!!errors.state)}
                            disabled={isEdit}
                        >
                            <option value="">Select state</option>
                            {/* Editing keeps the current state in the list even though it's
                                no longer in availableStates (it's already taken by this row). */}
                            {(isEdit && editingPromoter && !availableStates.includes(editingPromoter.state)
                                ? [editingPromoter.state, ...availableStates]
                                : availableStates
                            ).map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        {isEdit && (
                            <p className="text-xs text-gray-400 mt-1">State can't be changed once set — only the charge amount can be updated.</p>
                        )}
                    </FormField>

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
                        {isEdit ? "Update" : "Add"}
                    </button>
                </div>
            </div>
        </div>
    );
}
