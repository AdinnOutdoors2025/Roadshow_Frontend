/* eslint-disable */
// @ts-nocheck

"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { ReceiptText, History } from "lucide-react";
import API_BASE from "../../../../baseurl";
import { getToken } from "../../utils/auth";
import { useVehicle } from "../../../context/vehicletypecontext";

import InvoiceHistoryTab from "./InvoiceHistoryTab";
import InvoiceTab from "./InvoiceTab";
import ProjectCodeCombobox from "./ProjectCodeCombobox";

type Tab = "invoice" | "history";

const EMPTY_ORDER = {
  _id: "",
  orderId: "",
  name: "",
  address: "",
  companyName: "",
  clientName: "",
  gstNumber: "",
  panNumber: "",
  bookingItems: [],
  projectCodeArray: [],
  invoiceData: null,
  invoiceHistory: [],
};

export default function InvoiceGenerationPage() {
  const { vehicleTypes, fetchVehicleTypes } = useVehicle();

  const [projectCodeOrders, setProjectCodeOrders] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const [selectedId, setSelectedId] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>("invoice");

  const fetchProjectCodeOrders = async () => {
    try {
      setLoadingList(true);
      const token = getToken();
      const { data } = await axios.get(`${API_BASE}admin/pipeline/project-codes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjectCodeOrders(data.data?.data || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fetch project codes");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchProjectCodeOrders();
    if (!vehicleTypes?.length) fetchVehicleTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrderDetails = async (id: string) => {
    try {
      setLoadingOrder(true);
      const token = getToken();
      const { data } = await axios.get(`${API_BASE}admin/orders/by-id/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrder(data.data?.order || null);
      setActiveTab("invoice");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fetch order details");
    } finally {
      setLoadingOrder(false);
    }
  };

  const handleSelect = (picked: any) => {
    setSelectedId(picked._id);
    setSelectedLabel(`${picked.projectCode} · ${picked.name}`);
    setOrder(null);
    fetchOrderDetails(picked._id);
  };

  const handleRefreshOrder = async () => {
    if (selectedId) await fetchOrderDetails(selectedId);
  };

  return (
    <div className="p-4 md:p-6">
      <Toaster position="top-right" />
      <div className="mb-5 flex items-center gap-2">
        <ReceiptText className="text-2xl text-red-600" />
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Invoice Generation
        </h1>
      </div>

      <div className="mb-6 max-w-xl rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Project Code
        </label>

        <ProjectCodeCombobox
          options={projectCodeOrders}
          loading={loadingList}
          selectedLabel={selectedLabel}
          onSelect={handleSelect}
        />
      </div>

      {loadingOrder && (
        <div className="py-16 text-center text-gray-400">Loading order details...</div>
      )}

      {!loadingOrder && (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-1 border-b border-gray-100 dark:border-gray-800 px-4">
            <button
              onClick={() => setActiveTab("invoice")}
              className={
                "flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors " +
                (activeTab === "invoice"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300")
              }
            >
              <ReceiptText size={14} /> Invoice
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={
                "flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors " +
                (activeTab === "history"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300")
              }
            >
              <History size={14} /> Invoice History
            </button>
          </div>

          <div>
            {activeTab === "invoice" && (
              <InvoiceTab
                key={selectedId || "empty"}
                order={order || EMPTY_ORDER}
                vehicleTypes={vehicleTypes}
                onRefresh={handleRefreshOrder}
                disabled={!order}
              />
            )}
            {activeTab === "history" && (
              <InvoiceHistoryTab invoiceHistory={order?.invoiceHistory} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
