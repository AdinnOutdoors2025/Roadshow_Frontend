
"use client";

import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { HiOutlineUser, HiOutlineTruck, HiOutlineClipboardList, HiOutlinePhone } from "react-icons/hi";
import CustomerDetailsStep from "./CustomerDetailsStep";
import VehicleListStep from "./VehicleListStep";
import OrderSummaryStep from "./OrderSummaryStep";
import { Customer, PricingPreview } from "../../../../utils/Adminorderapi";
import API_BASE from "../../../../../baseurl";
import { getToken } from "@/utils/auth";
export interface CustomerFormData {
  name: string;
  phone: string;
  address: string;
  email?: string;
}

export interface CustomerSelection {
  type: "existing" | "new" | "";
  customer: Customer | null;
}

export interface AdditionalCharge {
  id: string;
  label: string;
  mode: "+" | "-";
  amount: number;
  reduceType?: "amount" | "percent";
  discountPercent?: number;
}

export interface VehicleConfig {
  id: string;
  packageId: string;
  vehicleType: string;
  vehicleModel: string;
  bookingFor: string;
  campaignType: string;
  otherCampaignType: string;
  fromDate: string;
  toDate: string;
  state: string;
  city: string;
  fromLocation: string;
  toLocation: string;
  quantity: number;
  extraKm: number;
  extraDays: number;
  needPromoter: boolean;
  promoterType: string;
  otherPromoterType: string;
  campaignImages: File[];
  campaignVideos: File[];
  additionalCharges: AdditionalCharge[];
  pricing: PricingPreview | null;
  gstNumber: string;
  extraHours: number;
  promoterGender: string;
  promoterLanguage: string;
  promoterQuantity: number;
  dailyKmcharges: any,
}

export interface OrderState {
  customerForm: CustomerFormData;
  customerSelection: CustomerSelection;
  vehicles: VehicleConfig[];
}

const STEPS = [
  { label: "Customer Details", icon: HiOutlineUser },
  { label: "Vehicles", icon: HiOutlineTruck },
  { label: "Summary", icon: HiOutlineClipboardList },
];

const defaultOrder: OrderState = {
  customerForm: { name: "", phone: "", address: "" },
  customerSelection: { type: "", customer: null },
  vehicles: [],
};

interface Props {
  onClose: () => void;
  onSuccess: (orderId: string) => void;
}

export default function AdminOrderForm({ onClose, onSuccess }: Props) {
  const [step, setStep] = useState(0);
  const [order, setOrder] = useState<OrderState>(defaultOrder);
  const [submitting, setSubmitting] = useState(false);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));



const handleSubmit = async () => {
  const { customerSelection, vehicles } = order;
  if (!customerSelection.customer) return;
  try {
    setSubmitting(true);
    const token = getToken();
    const formData = new FormData();

    formData.append("customerName", order.customerForm.name);
    formData.append("customerPhone", order.customerForm.phone);
    formData.append("customerAddress", order.customerForm.address);
    formData.append("customerEmail", order.customerForm.email || "");
    formData.append("customerType", order.customerSelection.type === "existing" ? "0" : "1");

    vehicles.forEach((v, i) => {
      const vData = {
        packageId: v.packageId,
        bookingFor: v.bookingFor,
        gstNumber: v.gstNumber || "",
        campaignType: v.campaignType,
        otherCampaignType: v.otherCampaignType,
        fromDate: v.fromDate,
        toDate: v.toDate,
        state: v.state,
        city: v.city,
        fromLocation: v.fromLocation,
        toLocation: v.toLocation,
        quantity: v.quantity,
        extraKm: v.extraKm,
        extraDays: v.extraDays,
        extraHours: v.extraHours,
        needPromoter: v.needPromoter,
        promoterType: v.promoterType,
        promoterGender: v.promoterGender,
        promoterLanguage: v.promoterLanguage,
        promoterQuantity: v.promoterQuantity,
        otherPromoterType: v.otherPromoterType,
        additionalCharges: v.additionalCharges.map((c) => ({
          label: c.label,
          mode: c.mode,
          amount: c.amount,
        })),
      };

      formData.append(`vehicle_${i}`, JSON.stringify(vData));

      (v.campaignImages as File[]).forEach((file) => {
        formData.append(`campaignImages_${i}`, file);
      });
      (v.campaignVideos as File[]).forEach((file) => {
        formData.append(`campaignVideos_${i}`, file);
      });
    });

    const res = await fetch(`${API_BASE}admin/orders/create`, {
      method: "POST",
      body: formData,
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");
    onSuccess(data.data.orderId); // ✅ successResponse wraps in data
  } catch (err: any) {
    alert(err.message || "Failed to create order");
  } finally {
    setSubmitting(false);
  }
};
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2" >
      <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">


        <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-4">


            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Create Admin Order
              </h2>

              {order.customerSelection.customer && (
                <p className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                  <HiOutlineUser size={16} className="inline-block text-gray-500" />

                  <span className="font-medium text-blue-600">
                    {order.customerForm.name}
                  </span>

                  {" · "}

                  <HiOutlinePhone size={16} className="inline-block text-gray-500" />

                  {order.customerForm.phone}
                </p>
              )}
            </div>
            <button onClick={onClose} disabled={submitting} className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
              <IoMdClose />
            </button>
          </div>

          <div className="flex items-center">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === step;
              const isDone = i < step;
              return (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center min-w-0">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${isDone ? "bg-blue-600 text-white" : isActive ? "bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/40" : "bg-gray-100 text-gray-400 dark:bg-gray-800"}`}>
                      {isDone
                        ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                        : <Icon className="h-4 w-4" />}
                    </div>
                    <span className={`mt-1 text-[10px] font-medium hidden sm:block whitespace-nowrap ${isActive ? "text-blue-600" : isDone ? "text-blue-400" : "text-gray-400"}`}>{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 mb-4 rounded transition-all ${i < step ? "bg-blue-500" : "bg-gray-200 dark:bg-gray-700"}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>


        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 0 && (
            <CustomerDetailsStep
              data={order.customerForm}
              customerSelection={order.customerSelection}
              // customerForm={order.customerForm}
              onChange={(d) => setOrder((p) => ({ ...p, customerForm: { ...p.customerForm, ...d } }))}
              onCustomerChange={(d) => setOrder((p) => ({ ...p, customerSelection: { ...p.customerSelection, ...d } }))}
              onNext={next}
            />
          )}
          {step === 1 && (
            <VehicleListStep
              vehicles={order.vehicles}
              onChange={(vehicles) => setOrder((p) => ({ ...p, vehicles }))}
              onNext={next}
              onBack={back}
            />
          )}
          {step === 2 && (
            <OrderSummaryStep
              order={order}
              onBack={back}
              onSubmit={handleSubmit}
              loading={submitting}
            />
          )}
        </div>
      </div>
    </div>
  );
}