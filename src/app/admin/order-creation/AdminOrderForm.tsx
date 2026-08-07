"use client";

import React, { useState, useRef } from "react";
import { toast, Toaster } from "react-hot-toast";
import { IoMdClose } from "react-icons/io";
import { HiOutlineUser, HiOutlineTruck, HiOutlineClipboardList, HiOutlinePhone } from "react-icons/hi";
import CustomerDetailsStep from "./CustomerDetailsStep";
import VehicleListStep from "./VehicleListStep";
import OrderSummaryStep from "./OrderSummaryStep";
import API_BASE from "../../../../baseurl";
import { getToken } from "../../utils/auth";
export interface CustomerFormData {
  name: string;
  phone: string;
  address: string;
  email?: string;
  companyName?: string;
  clientName?: string;
  designation?: string;
  gstNumber?: string;
  panNumber?: string;
}

export interface CustomerSelection {
  type: "existing" | "new" | "";
  customer: any;
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
  campaignLocation: string;
  quantity: number;
  extraKm: number;
  extraDays: number;
  needPromoter: boolean;
  promoterType: string;
  otherPromoterType: string;
  campaignImages: File[];
  campaignVideos: File[];
  additionalCharges: AdditionalCharge[];
  pricing: any;
  gstNumber: string;
  extraHours: number;
  promoterGender: string;
  promoterLanguage: string[];
  promoterQuantity: number;
  dailyKmcharges: any;
  campaignName: string;
  existingImages?: string[];
  existingVideos?: string[];
}

export interface GstDetail {
  gstDetailId: string;
  gst_number: string;
  business_name: string;
  business_pan?: string;
  business_address?: string;
}
export interface OrderState {
  customerForm: CustomerFormData;
  customerSelection: CustomerSelection;
  customerCategory: "individual" | "organization";
  vehicles: VehicleConfig[];
  individualForm: CustomerFormData;
  organizationForm: CustomerFormData;
  gstDetails: GstDetail[];
  selectedClientOrder: any | null;
}

const STEPS = [
  { label: "Customer Details", icon: HiOutlineUser },
  { label: "Vehicles", icon: HiOutlineTruck },
  { label: "Summary", icon: HiOutlineClipboardList },
];

const defaultOrder: OrderState = {
  customerForm: {
    name: "", phone: "", address: "", email: "",
    companyName: "", clientName: "", designation: "", gstNumber: "", panNumber: ""
  },
  customerSelection: { type: "", customer: null },
  customerCategory: "individual",
  vehicles: [],
  individualForm: {
    name: "", phone: "", address: "", email: ""
  },
  organizationForm: {
    name: "", phone: "", address: "", email: "",
    companyName: "", clientName: "", designation: "", gstNumber: "", panNumber: ""
  },

  gstDetails: [],
  selectedClientOrder: null,
};



interface Props {
  onClose: () => void;
  onSuccess: (orderId: string) => void;
  editingOrder?: any;
  getVehicleTypeName?:any
}

  const uid = () => Math.random().toString(36).slice(2, 9);

export default function AdminOrderForm({ onClose, onSuccess, editingOrder ,getVehicleTypeName }: Props) {
  const [step, setStep] = useState(0);
  // const [order, setOrder] = useState<OrderState>(defaultOrder);
  const [order, setOrder] = useState<OrderState>(
    editingOrder ? buildStateFromOrder(editingOrder) : defaultOrder
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string[] | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  // const [gstVerified, setGstVerified] = useState(false);
  const [gstVerified, setGstVerified] = useState(
  !!editingOrder && editingOrder.customerType === 1
);


  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));





  function buildStateFromOrder(o: any): OrderState {
    const isOrg = o.customerType === 1;

    const customerForm: CustomerFormData = {
      name: isOrg ? "" : o.name || "",
      phone: o.phone || "",
      address: o.address || "",
      email: o.email || "",
      companyName: o.companyName || "",
      clientName: isOrg ? (o.clientName || o.name || "") : "",
      designation: o.designation || "",
      gstNumber: o.gstNumber || "",
      panNumber: o.panNumber || "",
    };

    return {
      customerForm,
      customerSelection: {
        type: "existing",
        customer: {
          name: o.name,
          phone: o.phone,
          email: o.email,
          address: o.address || "",
        },
      },
      customerCategory: isOrg ? "organization" : "individual",
      individualForm: isOrg ? defaultOrder.individualForm : customerForm,
      organizationForm: isOrg ? customerForm : defaultOrder.organizationForm,
      gstDetails: (o.gstVerifyDetails || []).map((g: any) => ({
        gstDetailId: g.gstDetailId,
        gst_number: g.gst_number,
        business_name: g.business_name,
        business_pan: g.business_pan,
      })),
      selectedClientOrder: null,
    
      vehicles: (o.bookingItems || []).map((item: any) => {
 

  const additionalCuts = (item.additionalFields || [])
    .filter((f: any) => f.mode === "-")
    .reduce((s: number, f: any) => s + (Number(f.amount) || 0), 0);

  return {
    id: uid(),
    packageId: String(item.packageId?._id || item.packageId || ""),
    vehicleType: item.vehicleType || "",
    vehicleModel: item.vehicleModel || "",
    bookingFor: item.bookingFor || "",
    campaignType: item.campaignType || "",
    otherCampaignType: item.otherCampaignType || "",
    campaignName: item.campaignName || "",
    fromDate: item.fromDate ? String(item.fromDate).slice(0, 10) : "",
    toDate: item.toDate ? String(item.toDate).slice(0, 10) : "",
    state: item.state || "",
    city: item.city || "",
    campaignLocation: item.campaignLocation || (item.fromLocation && item.toLocation ? `${item.fromLocation} → ${item.toLocation}` : ""),
    quantity: item.quantity || 1,
    extraKm: item.extraKm || 0,
    extraDays: item.extraDays || 0,
    extraHours: item.extraHours || 0,
    needPromoter: !!item.needPromoter,
    promoterType: item.promoterType || "",
    otherPromoterType: item.otherPromoterType || "",
    promoterGender: item.promoterGender || "",
    promoterLanguage: item.promoterLanguage || [],
    promoterQuantity: item.promoterQuantity || 0,
    campaignImages: [],
    campaignVideos: [],
    existingImages: item.campaignImages || [],
    existingVideos: item.campaignVideos || [],
    additionalCharges: (item.additionalFields || []).map((f: any) => ({
      id: uid(),
      label: f.label || "",
      mode: f.mode || "+",
      amount: f.amount || 0,
      reduceType: "amount" as const,
      discountPercent: 0,
    })),


    pricing: {
      totalDays: item.totalDays || 0,
      perDayRentalCost: item.perDayRentalCost || 0,
      driverCharges: item.driverCharges || 0,
      promoterChargePerDay: item.promoterChargePerDay || 0,
      rtoCharges: item.rtoCharges || 0,
      additionalHourCharges: item.additionalHourCharges || 0,
      dailyKmLimit: item.dailyKmLimit || 0,
      dailyKmcharges: item.dailyKmcharges || 0,
      rentalCost: item.rentalCost || 0,
      driverCost: item.driverCost || 0,
      promoterCost: item.promoterCost || 0,
      rtoCost: item.rtoCost || 0,
      extraKmCost: item.extraKmCost || 0,
      extraHourCost: item.extraHourCost || 0,
      subtotal: item.subtotal || 0,
      taxableAmount: item.totalAmount || 0,
      additionalCuts,
      additionalNet: item.additionalNet || 0,
      gstAmount: 0,
      totalAmount: item.totalAmount || 0,
    },

    gstNumber: item.gstNumber || "",
    dailyKmcharges: item.dailyKmcharges || 0,
  };
}),
    };
  }

  const handleSubmit = async () => {
    const { customerSelection, vehicles } = order;
    if (!customerSelection.customer) {
      toast.error("Customer details missing — please go back and fill Customer Details again.");
      return;
    }
    try {
      setSubmitting(true);
      setSubmitError(null);
      const token = getToken();
      const formData = new FormData();
    
      formData.append(
        "gstVerifyDetails",
        JSON.stringify(
          order.gstDetails.map((g) => ({
            gstDetailId: g.gstDetailId,
            gst_number: g.gst_number,
            business_name: g.business_name,
            business_pan: g.business_pan,
          }))
        )
      );

      formData.append("customerName", order.customerForm.name || order.customerForm.clientName || "");
      formData.append("customerPhone", order.customerForm.phone);
      formData.append("customerAddress", order.customerForm.address || "");
      formData.append("customerEmail", order.customerForm.email || "");
      formData.append("customerCategory", order.customerCategory);
      formData.append("customerType", order.customerCategory === "individual" ? "0" : "1");
      formData.append("companyName", order.customerForm.companyName || "");
      formData.append("clientName", order.customerForm.clientName || "");
      formData.append("designation", order.customerForm.designation || "");
      formData.append("gstNumber", order.customerForm.gstNumber || "");
      formData.append("panNumber", order.customerForm.panNumber || "");

      vehicles.forEach((v, i) => {
        const vData = {
          packageId: v.packageId,
          bookingFor: v.bookingFor,
          gstNumber: v.gstNumber || "",
          campaignType: v.campaignType,
          otherCampaignType: v.otherCampaignType,
          campaignName: v.campaignName,
          fromDate: v.fromDate,
          toDate: v.toDate,
          state: v.state,
          city: v.city,
          campaignLocation: v.campaignLocation,
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

        formData.append(`existingImages_${i}`, JSON.stringify(v.existingImages || []));
        formData.append(`existingVideos_${i}`, JSON.stringify(v.existingVideos || []));

        formData.append(`vehicle_${i}`, JSON.stringify(vData));

        (v.campaignImages as File[]).forEach((file) => {
          formData.append(`campaignImages_${i}`, file);
        });
        (v.campaignVideos as File[]).forEach((file) => {
          formData.append(`campaignVideos_${i}`, file);
        });
      });

      const url = editingOrder
        ? `${API_BASE}admin/orders/${editingOrder._id}`
        : `${API_BASE}admin/orders/create`;

      const res = await fetch(url, {
        method: editingOrder ? "PUT" : "POST",
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");

      if (order.selectedClientOrder?._id) {
        try {
          await fetch(`${API_BASE}client-requests/${order.selectedClientOrder._id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: 2 }),
          });
        } catch (err) {
          console.error("Failed to update client request status", err);
        }
      }

      onSuccess(data.data.orderId);
    } catch (err: any) {
      const msg = err.message || "Failed to create order";
      const lines = msg.split("\n").filter((l: string) => l.trim());
      if (lines.length > 1) {
        lines.forEach((line: string) => toast.error(line, { duration: 6000 }));
      } else {
        toast.error(msg, { duration: 6000 });
      }
      setSubmitError(lines);
      contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };


  const displayName =
    order.customerCategory === "individual"
      ? order.customerForm.name
      : order.customerForm.clientName ?? "";

  return (
    // <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2">
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-2">
      <Toaster position="top-right" />

      <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">

        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                {editingOrder ? `Edit Order · ${editingOrder.orderId}` : "Create Admin Order"}
              </h2>
              {order.customerSelection.customer && (
                <p className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                  <HiOutlineUser size={16} className="inline-block text-gray-500" />
                  <span className="font-medium text-blue-600">{displayName}</span>
                  {" · "}
                  <HiOutlinePhone size={16} className="inline-block text-gray-500" />
                  {order.customerForm.phone}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              disabled={submitting}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              <IoMdClose />
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === step;
              const isDone = i < step;
              return (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center min-w-0">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${isDone
                        ? "bg-blue-600 text-white"
                        : isActive
                          ? "bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/40"
                          : "bg-gray-100 text-gray-400 dark:bg-gray-800"
                        }`}
                    >
                      {isDone ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>
                    <span
                      className={`mt-1 text-[10px] font-medium hidden sm:block whitespace-nowrap ${isActive ? "text-blue-600" : isDone ? "text-blue-400" : "text-gray-400"
                        }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-1 mb-4 rounded transition-all ${i < step ? "bg-blue-500" : "bg-gray-200 dark:bg-gray-700"
                        }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div ref={contentRef} className="flex-1 overflow-y-auto px-6 py-5">


          {step === 0 && (
            <CustomerDetailsStep
              gstDetails={order.gstDetails}
              selectedClientOrder={order.selectedClientOrder}
              onSelectClientOrder={(co) =>
                setOrder((p) => ({ ...p, selectedClientOrder: co }))
              }

              onGstVerified={(detail) =>
                setOrder((p) => ({
                  ...p,
                  gstDetails: [detail],
                }))
              }
              onGstDetailsReset={() =>
                setOrder((p) => ({ ...p, gstDetails: [] }))
              }
              gstVerified={gstVerified}
              onGstVerifiedChange={(val) => setGstVerified(val)}
              data={order.customerForm}
              customerSelection={order.customerSelection}
              onChange={(d) =>
                setOrder((p) => ({ ...p, customerForm: { ...p.customerForm, ...d } }))
              }
              onCustomerChange={(d) =>
                setOrder((p) => ({ ...p, customerSelection: { ...p.customerSelection, ...d } }))
              }
              onNext={next}
              customerCategory={order.customerCategory}
              onCategoryChange={(cat) => {
                setOrder((p) => {
                  const updatedIndividual =
                    p.customerCategory === "individual" ? p.customerForm : p.individualForm;
                  const updatedOrganization =
                    p.customerCategory === "organization" ? p.customerForm : p.organizationForm;

                  const nextForm =
                    cat === "individual" ? updatedIndividual : updatedOrganization;

                  return {
                    ...p,
                    customerCategory: cat,
                    customerForm: nextForm,
                    individualForm: updatedIndividual,
                    organizationForm: updatedOrganization,
                    customerSelection: { type: "", customer: null },
                  };
                });
                setGstVerified(false);
                
              }}
               editingOrder={editingOrder}
            />
          )}
          {step === 1 && (
            <VehicleListStep
              vehicles={order.vehicles}
              onChange={(vehicles) => setOrder((p) => ({ ...p, vehicles }))}
              onNext={next}
              onBack={back}
              selectedClientOrder={order.selectedClientOrder}
              getVehicleTypeName={getVehicleTypeName}
              editingOrder={editingOrder}
            />
          )}
          {step === 2 && (
            <OrderSummaryStep
              order={order}
              onBack={back}
              onSubmit={handleSubmit}
              loading={submitting}
               getVehicleTypeName={getVehicleTypeName}
              editingOrder={editingOrder}
              submitError={submitError}
            />
          )}
        </div>
      </div>
    </div>
  );
}
