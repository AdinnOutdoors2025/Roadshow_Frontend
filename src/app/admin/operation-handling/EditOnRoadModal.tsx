import { useState } from "react";
import { X} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import API_BASE from "../../../../baseurl";
import { getToken } from "../../utils/auth";

export default function EditOnRoadModal({ entry, orderId, onClose, onSuccess }: {
  entry: any; orderId: string;
  onClose: () => void; onSuccess: () => void;
}) {
  const [driverName, setDriverName] = useState(entry.driverName || "");
  const [driverPhone, setDriverPhone] = useState(
    (entry.driverPhone || "")
  );
  const [driverAlternatePhone, setDriverAlternatePhone] = useState(
    (entry.driverAlternatePhone || "")
  );
  const [vehicleRegNo, setVehicleRegNo] = useState(entry.vehicleRegistrationNumber || "");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!driverName.trim()) errs.driverName = "Driver name is required";
    if (!driverPhone.trim()) errs.driverPhone = "Phone is required";
    else if (driverPhone.length !== 10) errs.driverPhone = "Must be 10 digits";
    if (driverAlternatePhone && driverAlternatePhone.length !== 10)
      errs.driverAlternatePhone = "Must be 10 digits";
    if (!vehicleRegNo.trim()) errs.vehicleRegNo = "Registration number is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

const original = {
  driverName: entry.driverName || "",
  driverPhone: (entry.driverPhone || ""),
  driverAlternatePhone: (entry.driverAlternatePhone || ""),
  vehicleRegNo: entry.vehicleRegistrationNumber || "",
};

const hasChanges = () => {
  return (
    driverName.trim() !== original.driverName.trim() ||
    driverPhone.trim() !== original.driverPhone.trim() ||
    driverAlternatePhone.trim() !== original.driverAlternatePhone.trim() ||
    vehicleRegNo.trim() !== original.vehicleRegNo.trim()
  );
};
  

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const token = getToken();
      await axios.put(
        `${API_BASE}admin/pipeline/${orderId}/onroad-details/${entry._id}`,
        {
          driverName: driverName.trim(),
          driverPhone: `${driverPhone.trim()}`,
          driverAlternatePhone: driverAlternatePhone ? `${driverAlternatePhone}` : "",
          vehicleRegistrationNumber: vehicleRegNo.trim().toUpperCase(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Details updated successfully!");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Edit On Road Details</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>

        {/* Driver Name */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Driver Name *</label>
          <input
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
            className={`mt-1 w-full border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.driverName ? "border-red-400" : "border-gray-300 dark:border-gray-600"}`}
            placeholder="Driver full name"
          />
          {errors.driverName && <p className="text-red-500 text-xs mt-1">{errors.driverName}</p>}
        </div>

        {/* Driver Phone */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Driver Phone *</label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">+91</span>
            <input
              value={driverPhone}
              onChange={(e) => setDriverPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              className={`w-full border rounded-xl pl-12 pr-4 py-2.5 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.driverPhone ? "border-red-400" : "border-gray-300 dark:border-gray-600"}`}
              placeholder="9876543210"
            />
          </div>
          {errors.driverPhone && <p className="text-red-500 text-xs mt-1">{errors.driverPhone}</p>}
        </div>

        {/* Alternate Phone */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Alternate Phone <span className="text-gray-400 text-xs">(Optional)</span></label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">+91</span>
            <input
              value={driverAlternatePhone}
              onChange={(e) => setDriverAlternatePhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              className={`w-full border rounded-xl pl-12 pr-4 py-2.5 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.driverAlternatePhone ? "border-red-400" : "border-gray-300 dark:border-gray-600"}`}
              placeholder="9876543210"
            />
          </div>
          {errors.driverAlternatePhone && <p className="text-red-500 text-xs mt-1">{errors.driverAlternatePhone}</p>}
        </div>

        {/* Vehicle Reg No */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Vehicle Registration Number *</label>
          <input
            value={vehicleRegNo}
            onChange={(e) => setVehicleRegNo(e.target.value.toUpperCase())}
            className={`mt-1 w-full border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 uppercase focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.vehicleRegNo ? "border-red-400" : "border-gray-300 dark:border-gray-600"}`}
            placeholder="TN01AB1234"
          />
          {errors.vehicleRegNo && <p className="text-red-500 text-xs mt-1">{errors.vehicleRegNo}</p>}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
           disabled={loading || !hasChanges()}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}