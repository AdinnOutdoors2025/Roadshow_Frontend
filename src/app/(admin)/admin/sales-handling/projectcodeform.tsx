import { getToken } from "@/utils/auth";
import { useState } from "react";
import {  SalesOrder } from "./page";
import axios from "axios";
import toast from "react-hot-toast";
import API_BASE from "../../../../../baseurl";
import { AlertCircle, CheckCircle2, PlusCircle } from "lucide-react";

 export default function ProjectCodeForm({ order, onRefresh }: { order: SalesOrder; onRefresh: () => Promise<void> }) {
  const [projectCode, setProjectCode] = useState("");
  const [estimationCode, setEstimationCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    if (!projectCode.trim() || !estimationCode.trim()) {
      setError("Both Project Code and Estimation Code required");
      return;
    }
    setSaving(true);
    try {
      const token = getToken();
      const fd = new FormData();
      fd.append("stage", "projectCodeCreation");
      fd.append("projectCode", projectCode.trim());
      fd.append("estimationCode", estimationCode.trim());
      await axios.post(`${API_BASE}sales/pipeline/${order._id}/documents`, fd, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Project codes saved!");
      setProjectCode("");
      setEstimationCode("");
      await onRefresh();
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Something went wrong";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3 mt-3 bg-teal-50/50">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
        <PlusCircle size={13} /> Add Project Codes
      </p>
      <div>
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
          Project Code <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={projectCode}
          onChange={(e) => setProjectCode(e.target.value)}
          placeholder="Enter project code"
          className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
          Estimation Code <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={estimationCode}
          onChange={(e) => setEstimationCode(e.target.value)}
          placeholder="Enter estimation code"
          className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
      </div>
      {error && (
        <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2 flex items-center gap-1.5">
          <AlertCircle size={13} /> {error}
        </p>
      )}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-bold transition-all flex items-center justify-center gap-2"
      >
        {saving ? (
          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
        ) : (
          <><CheckCircle2 size={15} /> Save Codes</>
        )}
      </button>
    </div>
  );
}