"use client";

import React from "react";
import { MdOutlineDelete } from "react-icons/md";

interface Props {
    loading: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function DeleteConfirmModal({ loading, onConfirm, onCancel }: Props) {
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !loading) onCancel();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={handleBackdropClick}
        >
            <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
                {/* Icon */}
                <div className="flex flex-col items-center px-6 pt-8 pb-4 text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                        <MdOutlineDelete className="h-7 w-7 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                        Are You Sure You Want to Delete?
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        This action cannot be undone. The package will be permanently removed.
                    </p>
                </div>

         
                <div className="flex items-center gap-3 border-t border-gray-100 px-6 py-4 dark:border-gray-700">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-60"
                    >
                        {loading && (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                        )}
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
