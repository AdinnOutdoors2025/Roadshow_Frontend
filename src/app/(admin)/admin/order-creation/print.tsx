"use client";

import React, { useRef } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface AdditionalField {
  label: string;
  mode: "+" | "-";
  amount: number;
}

interface BookingItem {
  vehicleModel: string;
  vehicleType?: string;
  city: string;
  state?: string;
  quantity: number;
  fromDate: string;
  toDate: string;
  totalDays: number;
  totalAmount: number;
  subtotal?: number;
  perDayRentalCost?: number;
  bookingFor?: string;
  campaignType?: string;
  otherCampaignType?: string;
  fromLocation?: string;
  toLocation?: string;
  extraKm?: number;
  extraHours?: number;
  extraDays?: number;
  extraKmCost?: number;
  extraHourCost?: number;
  needPromoter?: boolean;
  promoterType?: string;
  otherPromoterType?: string;
  promoterGender?: string;
  promoterLanguage?: string;
  promoterQuantity?: number;
  promoterCost?: number;
  promoterChargePerDay?: number;
  rentalCost?: number;
  driverCost?: number;
  driverCharges?: number;
  rtoCost?: number;
  dailyKmcharges?: number;
  additionalHourCharges?: number;
  additionalFields?: AdditionalField[];
  campaignImages?: string[];
  campaignVideos?: string[];
  gstNumber?: string;
}

interface NegotiationLog {
  fromStage?: string;
  toStage?: string;
  amount?: number;
  discountAmount?: number;
  movedBy: string;
  movedAt: string;
  discountNotes?: any;
}

interface PoDocumentLog {
  _id: string;
  poDocument: string;
  poDate: string;
  poNotes?: string;
  uploadedBy?: string;
  uploadedAt: string;
}

interface PaymentStageFirst {
  _id: string;
  advancePayment: number;
  paymentProofDocument: string;
  paymentDate: string;
  paymentVerification: string;
  paymentNotes?: string;
  uploadedBy?: string;
  uploadedAt: string;
}

interface Order {
  _id: string;
  orderId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  customerType?: number;
  pipelineStatus: string;
  orderStatus?: string;
  handlerName?: string;
  handlername?: string;
  updatedAt?: string;
  grandTotal: number;
  grandGst?: number;
  grandNegotiationTotal?: number;
  bookingItems: BookingItem[];
  negotiationLogs?: NegotiationLog[];
  pipelineLogs?: any[];
  poDocument?: string;
  poDocumentLogs?: PoDocumentLog[];
  paymentStageFirst?: PaymentStageFirst[];
  createdAt: string;
  isAdminCreated?: boolean;
  campaignType?: string;
}

interface OrderPDFViewProps {
  order: Order;
  onClose: () => void;
  vehicleTypes: any
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n?: number | null): string =>
  n != null
    ? new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n)
    : "0";

const fmtDate = (d?: string): string => {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const fmtDateShort = (d?: string): string => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const PIPELINE_LABELS: Record<string, string> = {
  newOrder: "New Order",
  inProgress: "In Progress",
  customerConfirmation: "Customer Confirmation",
  waitingForPO: "Waiting for PO",
  paymentStage1: "Payment Stage 1",
  projectCodeCreation: "Project Code Creation",
  projectExecution: "Project Execution",
  onRoad: "On Road",
  campaignRunning: "Campaign Running",
  vehicleUnavailable: "Vehicle Unavailable",
  clientClosure: "Client Closure",
  invoiceGeneration: "Invoice Generation",
  paymentStage2: "Payment Stage 2",
  closedWon: "Closed Won",
  closedLost: "Closed Lost",
};

// ─── Print Styles ──────────────────────────────────────────────────────────────
const PRINT_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', 'Segoe UI', sans-serif;
    background: #f8fafc;
    color: #0f172a;
    font-size: 13px;
    line-height: 1.5;
  }

  .pdf-modal-backdrop {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(0,0,0,0.65);
    backdrop-filter: blur(6px);
    display: flex; align-items: flex-start; justify-content: center;
    padding: 20px; overflow-y: auto;
  }

  .pdf-modal-container {
    background: #fff;
    width: 100%; max-width: 900px;
    border-radius: 16px;
    box-shadow: 0 25px 60px rgba(0,0,0,0.4);
    overflow: hidden;
    margin: auto;
  }

  /* Toolbar */
  .pdf-toolbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px;
    background: #1e293b;
    color: #fff;
    gap: 12px;
  }
  .pdf-toolbar-title {
    font-size: 14px; font-weight: 700; color: #f1f5f9;
    display: flex; align-items: center; gap: 8px;
  }
  .pdf-toolbar-actions {
    display: flex; gap: 8px; align-items: center;
  }
  .pdf-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600;
    cursor: pointer; border: none; transition: all 0.15s;
  }
  .pdf-btn-print {
    background: #3b82f6; color: #fff;
  }
  .pdf-btn-print:hover { background: #2563eb; }
  .pdf-btn-close {
    background: rgba(255,255,255,0.12); color: #e2e8f0; 
    border: 1px solid rgba(255,255,255,0.15);
  }
  .pdf-btn-close:hover { background: rgba(255,255,255,0.2); }

  /* PDF Content */
  .pdf-content {
    background: #fff;
    padding: 0;
  }

  /* Header */
  .pdf-header {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 40%, #1e3a5f 100%);
    padding: 36px 44px 32px;
    color: #fff;
    position: relative;
    overflow: hidden;
  }
  .pdf-header::before {
    content: '';
    position: absolute; top: -60px; right: -60px;
    width: 220px; height: 220px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%);
  }
  .pdf-header::after {
    content: '';
    position: absolute; bottom: -40px; left: 40%;
    width: 140px; height: 140px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%);
  }
  .pdf-header-top {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 28px; position: relative; z-index: 1;
  }
  .pdf-company-logo {
    display: flex; align-items: center; gap: 12px;
  }
  .pdf-logo-icon {
    width: 52px; height: 52px; border-radius: 14px;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    display: flex; align-items: center; justify-content: center;
    font-size: 24px; box-shadow: 0 8px 20px rgba(59,130,246,0.4);
  }
  .pdf-company-name {
    font-size: 22px; font-weight: 900; color: #fff;
    letter-spacing: -0.5px;
  }
  .pdf-company-sub {
    font-size: 11px; color: rgba(255,255,255,0.55);
    font-weight: 500; margin-top: 2px; letter-spacing: 0.5px;
  }
  .pdf-order-badge {
    text-align: right; position: relative; z-index: 1;
  }
  .pdf-order-label {
    font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.5);
    letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px;
  }
  .pdf-order-id {
    font-size: 20px; font-weight: 900; color: #60a5fa;
    font-family: 'Courier New', monospace; letter-spacing: 1px;
  }
  .pdf-order-date {
    font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 4px;
  }

  .pdf-header-stats {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 16px; position: relative; z-index: 1;
  }
  .pdf-stat-card {
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px; padding: 14px 16px;
    backdrop-filter: blur(10px);
  }
  .pdf-stat-label {
    font-size: 9px; font-weight: 700; color: rgba(255,255,255,0.45);
    text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px;
  }
  .pdf-stat-value {
    font-size: 16px; font-weight: 800; color: #fff;
  }
  .pdf-stat-value.accent { color: #34d399; }
  .pdf-stat-value.blue { color: #60a5fa; }
  .pdf-stat-value.amber { color: #fbbf24; }

  /* Body */
  .pdf-body {
    padding: 32px 44px;
    background: #f8fafc;
  }

  /* Section */
  .pdf-section {
    margin-bottom: 28px;
  }
  .pdf-section-header {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 14px;
  }
  .pdf-section-icon {
    width: 32px; height: 32px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; flex-shrink: 0;
  }
  .pdf-section-title {
    font-size: 11px; font-weight: 800; color: #475569;
    text-transform: uppercase; letter-spacing: 1.5px;
  }
  .pdf-section-line {
    flex: 1; height: 1px; background: linear-gradient(to right, #e2e8f0, transparent);
  }

  /* Info Grid */
  .pdf-info-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
  .pdf-info-grid.cols-2 { grid-template-columns: repeat(2, 1fr); }
  .pdf-info-grid.cols-4 { grid-template-columns: repeat(4, 1fr); }
  .pdf-info-card {
    background: #fff; border: 1px solid #e8ecf0;
    border-radius: 10px; padding: 12px 14px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  }
  .pdf-info-card.span-2 { grid-column: span 2; }
  .pdf-info-label {
    font-size: 9px; font-weight: 700; color: #94a3b8;
    text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;
  }
  .pdf-info-value {
    font-size: 13px; font-weight: 600; color: #1e293b;
    word-break: break-word;
  }
  .pdf-info-value.mono { font-family: 'Courier New', monospace; color: #3b82f6; }
  .pdf-info-value.accent { color: #059669; }
  .pdf-info-value.blue { color: #2563eb; }

  /* Badge */
  .pdf-badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 10px; border-radius: 20px;
    font-size: 10px; font-weight: 700;
  }
  .pdf-badge-green { background: #dcfce7; color: #166534; }
  .pdf-badge-blue { background: #dbeafe; color: #1d4ed8; }
  .pdf-badge-amber { background: #fef3c7; color: #92400e; }
  .pdf-badge-red { background: #fee2e2; color: #991b1b; }
  .pdf-badge-violet { background: #ede9fe; color: #5b21b6; }
  .pdf-badge-gray { background: #f1f5f9; color: #475569; }
  .pdf-badge-cyan { background: #cffafe; color: #0e7490; }

  /* Vehicle Card */
  .pdf-vehicle-card {
    background: #fff; border: 1px solid #e2e8f0;
    border-radius: 14px; overflow: hidden;
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
  .pdf-vehicle-header {
    display: flex; align-items: center; gap: 14px;
    padding: 16px 20px;
    background: linear-gradient(135deg, #eff6ff 0%, #eef2ff 100%);
    border-bottom: 1px solid #e0e7ff;
  }
  .pdf-vehicle-num {
    width: 40px; height: 40px; border-radius: 12px;
    background: linear-gradient(135deg, #3b82f6, #6366f1);
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 800; color: #fff;
    box-shadow: 0 4px 10px rgba(59,130,246,0.3);
    flex-shrink: 0;
  }
  .pdf-vehicle-name {
    font-size: 16px; font-weight: 800; color: #1e293b;
  }
  .pdf-vehicle-sub {
    font-size: 11px; color: #64748b; margin-top: 2px;
  }
  .pdf-vehicle-total {
    margin-left: auto; text-align: right;
  }
  .pdf-vehicle-total-label {
    font-size: 9px; color: #94a3b8; font-weight: 600;
    text-transform: uppercase; letter-spacing: 1px;
  }
  .pdf-vehicle-total-value {
    font-size: 18px; font-weight: 900; color: #2563eb;
  }

  .pdf-vehicle-body { padding: 16px 20px; }
  .pdf-vehicle-details { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .pdf-detail-item { }
  .pdf-detail-label {
    font-size: 9px; font-weight: 700; color: #94a3b8;
    text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px;
  }
  .pdf-detail-value {
    font-size: 12px; font-weight: 600; color: #334155;
  }

  /* Pricing Table */
  .pdf-pricing-table {
    width: 100%; border-collapse: collapse;
    background: #fff; border-radius: 12px; overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    border: 1px solid #e2e8f0;
  }
  .pdf-pricing-table th {
    background: #f8fafc; padding: 10px 16px;
    font-size: 9px; font-weight: 800; color: #64748b;
    text-transform: uppercase; letter-spacing: 1px;
    text-align: left; border-bottom: 1px solid #e2e8f0;
  }
  .pdf-pricing-table th:last-child { text-align: right; }
  .pdf-pricing-table td {
    padding: 10px 16px; font-size: 12px; color: #334155;
    border-bottom: 1px solid #f1f5f9;
  }
  .pdf-pricing-table td:last-child { text-align: right; font-weight: 600; }
  .pdf-pricing-table tr:last-child td { border-bottom: none; }
  .pdf-pricing-table tr.subtotal-row td {
    background: #eff6ff; font-weight: 700; color: #1e40af;
    border-top: 2px solid #bfdbfe;
  }
  .pdf-pricing-table tr.negative-row td { color: #dc2626; }
  .pdf-pricing-table tr.negative-row td:last-child { color: #dc2626; }

  /* Summary Box */
  .pdf-summary-box {
    background: linear-gradient(135deg, #eff6ff 0%, #eef2ff 100%);
    border: 2px solid #bfdbfe;
    border-radius: 14px; padding: 20px 24px;
    margin-top: 20px;
  }
  .pdf-summary-title {
    font-size: 11px; font-weight: 800; color: #3b82f6;
    text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px;
    display: flex; align-items: center; gap: 6px;
  }
  .pdf-summary-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid rgba(191,219,254,0.5);
  }
  .pdf-summary-row:last-child { border-bottom: none; }
  .pdf-summary-row-label { font-size: 12px; color: #475569; font-weight: 500; }
  .pdf-summary-row-value { font-size: 13px; font-weight: 700; color: #1e293b; }
  .pdf-summary-row.grand { padding-top: 14px; margin-top: 6px; border-top: 2px solid #93c5fd; }
  .pdf-summary-row.grand .pdf-summary-row-label {
    font-size: 16px; font-weight: 800; color: #1e293b;
  }
  .pdf-summary-row.grand .pdf-summary-row-value {
    font-size: 22px; font-weight: 900; color: #1d4ed8;
  }
  .pdf-summary-row.negative .pdf-summary-row-value { color: #dc2626; }
  .pdf-summary-row.positive .pdf-summary-row-value { color: #059669; }

  /* Negotiation / Payment History */
  .pdf-history-item {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 12px 14px; background: #fff;
    border: 1px solid #e8ecf0; border-radius: 10px;
    margin-bottom: 8px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.03);
  }
  .pdf-history-num {
    width: 28px; height: 28px; border-radius: 8px;
    background: linear-gradient(135deg, #f59e0b, #ef4444);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 800; color: #fff;
    flex-shrink: 0;
  }
  .pdf-history-content { flex: 1; }
  .pdf-history-by { font-size: 12px; font-weight: 700; color: #1e293b; }
  .pdf-history-date { font-size: 10px; color: #94a3b8; margin-top: 2px; }
  .pdf-history-amount {
    font-size: 14px; font-weight: 800;
    color: #dc2626; text-align: right;
  }

  /* PO Document */
  .pdf-po-item {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 16px; background: #fff;
    border: 1px solid #e0e7ff; border-radius: 10px;
    margin-bottom: 8px;
  }
  .pdf-po-icon {
    width: 36px; height: 36px; border-radius: 8px;
    background: linear-gradient(135deg, #f59e0b, #f97316);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; flex-shrink: 0;
  }
  .pdf-po-name { font-size: 12px; font-weight: 700; color: #1e293b; }
  .pdf-po-meta { font-size: 10px; color: #64748b; margin-top: 2px; }

  /* Footer */
  .pdf-footer {
    background: #1e293b; padding: 20px 44px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .pdf-footer-left {
    font-size: 10px; color: rgba(255,255,255,0.4);
  }
  .pdf-footer-right {
    font-size: 10px; color: rgba(255,255,255,0.4); text-align: right;
  }
  .pdf-watermark {
    font-size: 9px; color: rgba(255,255,255,0.25);
    letter-spacing: 2px; text-transform: uppercase; margin-top: 3px;
  }

  /* Divider */
  .pdf-divider {
    height: 1px; background: linear-gradient(to right, transparent, #e2e8f0, transparent);
    margin: 20px 0;
  }

  /* Promoter box */
  .pdf-promoter-box {
    background: linear-gradient(135deg, #f5f3ff, #ede9fe);
    border: 1px solid #c4b5fd; border-radius: 10px;
    padding: 12px 16px; margin-top: 12px;
  }
  .pdf-promoter-title {
    font-size: 10px; font-weight: 800; color: #6d28d9;
    text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;
  }
  .pdf-promoter-grid {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;
  }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .pdf-modal-backdrop { position: static; background: none; padding: 0; }
    .pdf-modal-container { border-radius: 0; box-shadow: none; max-width: 100%; }
    .pdf-toolbar { display: none !important; }
    .pdf-body { background: #fff; }
    .pdf-vehicle-card { break-inside: avoid; }
    .pdf-summary-box { break-inside: avoid; }
    .pdf-section { break-inside: avoid; }
  }
`;

// ─── Main Component ────────────────────────────────────────────────────────────
export default function OrderPDFView({ order, onClose ,vehicleTypes}: OrderPDFViewProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const bookingItems = order.bookingItems || [];
  const negotiationLogs = (order.negotiationLogs || []).filter(
    (l) => (l.discountAmount || 0) > 0
  );
  const poLogs = order.poDocumentLogs || [];
  const paymentLogs = order.paymentStageFirst || [];

  const subtotal = bookingItems.reduce((s, i) => s + (i.subtotal || i.totalAmount || 0), 0);
  const totalDiscount = negotiationLogs.reduce((s, l) => s + (l.discountAmount || 0), 0);
  const taxable = subtotal - totalDiscount;
  const gstAmt = Math.floor(taxable * 0.18);
  const grandTotal =  taxable + gstAmt;
  const totalAdvance = paymentLogs.reduce((s, l) => s + (l.advancePayment || 0), 0);
  const balanceDue = grandTotal - totalAdvance;

  const handlerName = order.handlerName || order.handlername;

  
  const getVehicleTypeName = (vehicleTypeId: string) => {
    if (!vehicleTypeId || !vehicleTypes) return '';
    const vehicle = vehicleTypes.find((vt: any) => vt._id === vehicleTypeId);
    return vehicle?.typeName || vehicleTypeId;
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow || !printRef.current) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Order ${order.orderId}</title>
          <style>${PRINT_STYLES}</style>
        </head>
        <body>
          <div class="pdf-content">
            ${printRef.current.innerHTML}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 600);
  };

  const pipelineLabel = PIPELINE_LABELS[order.pipelineStatus] || order.pipelineStatus;

  return (
    <>
      {/* Inject styles */}
      <style>{PRINT_STYLES}</style>

      {/* Backdrop */}
      <div className="pdf-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="pdf-modal-container">

          {/* Toolbar */}
          <div className="pdf-toolbar">
            <div className="pdf-toolbar-title">
              <span>📄</span>
              Order Summary — {order.orderId}
            </div>
            <div className="pdf-toolbar-actions">
              <button className="pdf-btn pdf-btn-print" onClick={handlePrint}>
                🖨️ Print / Save PDF
              </button>
              <button className="pdf-btn pdf-btn-close" onClick={onClose}>
                ✕ Close
              </button>
            </div>
          </div>

          {/* Scrollable PDF Content */}
          <div style={{ maxHeight: "calc(100vh - 120px)", overflowY: "auto" }}>
            <div ref={printRef}>

              {/* ── HEADER ── */}
              <div className="pdf-header">
                <div className="pdf-header-top">
                  <div className="pdf-company-logo">
                    <div className="pdf-logo-icon">🚗</div>
                    <div>
                      <div className="pdf-company-name">VehicleOps</div>
                      <div className="pdf-company-sub">ORDER SUMMARY DOCUMENT</div>
                    </div>
                  </div>
                  <div className="pdf-order-badge">
                    <div className="pdf-order-label">Order ID</div>
                    <div className="pdf-order-id">{order.orderId}</div>
                    <div className="pdf-order-date">Created: {fmtDate(order.createdAt)}</div>
                  </div>
                </div>

                <div className="pdf-header-stats">
                  <div className="pdf-stat-card">
                    <div className="pdf-stat-label">Grand Total</div>
                    <div className="pdf-stat-value accent">₹{fmt(grandTotal)}</div>
                  </div>
                  <div className="pdf-stat-card">
                    <div className="pdf-stat-label">Vehicles</div>
                    <div className="pdf-stat-value blue">{bookingItems.length}</div>
                  </div>
                  {/* <div className="pdf-stat-card">
                    <div className="pdf-stat-label">Pipeline</div>
                    <div className="pdf-stat-value" style={{ fontSize: 12 }}>{pipelineLabel}</div>
                  </div> */}
                  <div className="pdf-stat-card">
                    <div className="pdf-stat-label">Order Status</div>
                    <div className="pdf-stat-value amber">{order.orderStatus || "—"}</div>
                  </div>
                </div>
              </div>

              {/* ── BODY ── */}
              <div className="pdf-body">

                {/* 1. Customer Info */}
                <div className="pdf-section">
                  <div className="pdf-section-header">
                    <div className="pdf-section-icon" style={{ background: "#dbeafe" }}>👤</div>
                    <div className="pdf-section-title">Customer Information</div>
                    <div className="pdf-section-line" />
                  </div>

                  <div className="pdf-info-grid">
                    <div className="pdf-info-card">
                      <div className="pdf-info-label">Full Name</div>
                      <div className="pdf-info-value">{order.name}</div>
                    </div>
                    <div className="pdf-info-card">
                      <div className="pdf-info-label">Phone Number</div>
                      <div className="pdf-info-value">+91 {order.phone}</div>
                    </div>
                    <div className="pdf-info-card">
                      <div className="pdf-info-label">Email Address</div>
                      <div className="pdf-info-value">{order.email || "—"}</div>
                    </div>
                    <div className="pdf-info-card span-2">
                      <div className="pdf-info-label">Address</div>
                      <div className="pdf-info-value">{order.address || "—"}</div>
                    </div>
                    <div className="pdf-info-card">
                      <div className="pdf-info-label">Customer Type</div>
                      <div className="pdf-info-value">
                        {order.customerType === 1 ? (
                          <span className="pdf-badge pdf-badge-green">🆕 New Customer</span>
                        ) : order.customerType === 0 ? (
                          <span className="pdf-badge pdf-badge-blue">🔄 Existing Customer</span>
                        ) : (
                          <span className="pdf-badge pdf-badge-gray">❓ Not Set</span>
                        )}
                      </div>
                    </div>
                    {handlerName && (
                      <div className="pdf-info-card">
                        <div className="pdf-info-label">Assigned Handler</div>
                        <div className="pdf-info-value">{handlerName}</div>
                      </div>
                    )}
                    {order.isAdminCreated && (
                      <div className="pdf-info-card">
                        <div className="pdf-info-label">Order Source</div>
                        <div className="pdf-info-value">
                          <span className="pdf-badge pdf-badge-violet">🏷️ Admin Created</span>
                        </div>
                      </div>
                    )}
                    <div className="pdf-info-card">
                      <div className="pdf-info-label">Created At</div>
                      <div className="pdf-info-value" style={{ fontSize: 11 }}>{fmtDate(order.createdAt)}</div>
                    </div>
                  </div>
                </div>

                {/* 2. Vehicle Bookings */}
                <div className="pdf-section">
                  <div className="pdf-section-header">
                    <div className="pdf-section-icon" style={{ background: "#e0e7ff" }}>🚗</div>
                    <div className="pdf-section-title">Vehicle Bookings ({bookingItems.length})</div>
                    <div className="pdf-section-line" />
                  </div>

                  {bookingItems.map((item, i) => {
                    const campaignLabel =
                      item.campaignType === "Other"
                        ? item.otherCampaignType || "Other"
                        : item.campaignType || "—";
                    const promoterTypeLabel =
                      item.promoterType === "Other"
                        ? item.otherPromoterType || "Other"
                        : item.promoterType || "—";
                    const location = [item.state, item.city].filter(Boolean).join(" / ") || "—";
                    const route =
                      item.fromLocation && item.toLocation
                        ? `${item.fromLocation} → ${item.toLocation}`
                        : null;

                    return (
                      <div key={i} className="pdf-vehicle-card">
                        <div className="pdf-vehicle-header">
                          <div className="pdf-vehicle-num">V{i + 1}</div>
                          <div>
                            {/* <div className="pdf-vehicle-name">{item.vehicleModel || "Vehicle"}</div> */}
                               <div className="pdf-vehicle-name">{getVehicleTypeName(item.vehicleType)}</div>
                            <div className="pdf-vehicle-sub">Qty: {item.quantity || 1} · {item.totalDays} days · {location}</div>
                          </div>
                          <div className="pdf-vehicle-total">
                            <div className="pdf-vehicle-total-label">Vehicle Total</div>
                            <div className="pdf-vehicle-total-value">₹{fmt(item.subtotal || item.totalAmount)}</div>
                          </div>
                        </div>

                        <div className="pdf-vehicle-body">
                          {/* Basic Details */}
                          <div className="pdf-vehicle-details">
                            {item.bookingFor && (
                              <div className="pdf-detail-item">
                                <div className="pdf-detail-label">Booking For</div>
                                <div className="pdf-detail-value">{item.bookingFor}</div>
                              </div>
                            )}
                            <div className="pdf-detail-item">
                              <div className="pdf-detail-label">Campaign Type</div>
                              <div className="pdf-detail-value">{campaignLabel}</div>
                            </div>
                            <div className="pdf-detail-item">
                              <div className="pdf-detail-label">Location</div>
                              <div className="pdf-detail-value">{location}</div>
                            </div>
                            <div className="pdf-detail-item" style={{ gridColumn: "span 2" }}>
                              <div className="pdf-detail-label">Duration</div>
                              <div className="pdf-detail-value">
                                {fmtDate(item.fromDate)} → {fmtDate(item.toDate)} ({item.totalDays} days)
                              </div>
                            </div>
                            {/* {route && (
                              <div className="pdf-detail-item">
                                <div className="pdf-detail-label">Driving Route</div>
                                <div className="pdf-detail-value">{route}</div>
                              </div>
                            )} */}
                            {item.extraKm && item.extraKm > 0 ? (
                              <div className="pdf-detail-item">
                                <div className="pdf-detail-label">Extra KM</div>
                                <div className="pdf-detail-value">{item.extraKm} km</div>
                              </div>
                            ) : null}
                            {item.extraHours && item.extraHours > 0 ? (
                              <div className="pdf-detail-item">
                                <div className="pdf-detail-label">Extra Hours</div>
                                <div className="pdf-detail-value">{item.extraHours} hrs</div>
                              </div>
                            ) : null}
                            {item.extraDays && item.extraDays > 0 ? (
                              <div className="pdf-detail-item">
                                <div className="pdf-detail-label">Extra Days</div>
                                <div className="pdf-detail-value">{item.extraDays} days</div>
                              </div>
                            ) : null}
                            {item.gstNumber && (
                              <div className="pdf-detail-item">
                                <div className="pdf-detail-label">GST Number</div>
                                <div className="pdf-detail-value">{item.gstNumber}</div>
                              </div>
                            )}
                          </div>

                          {/* Promoter Box */}
                          {item.needPromoter && (
                            <div className="pdf-promoter-box">
                              <div className="pdf-promoter-title">🎤 Promoter Details</div>
                              <div className="pdf-promoter-grid">
                                <div className="pdf-detail-item">
                                  <div className="pdf-detail-label">Type</div>
                                  <div className="pdf-detail-value">{promoterTypeLabel}</div>
                                </div>
                                <div className="pdf-detail-item">
                                  <div className="pdf-detail-label">Gender</div>
                                  <div className="pdf-detail-value">{item.promoterGender || "—"}</div>
                                </div>
                                <div className="pdf-detail-item">
                                  <div className="pdf-detail-label">Language</div>
                                  <div className="pdf-detail-value">{item.promoterLanguage || "—"}</div>
                                </div>
                                <div className="pdf-detail-item">
                                  <div className="pdf-detail-label">Quantity</div>
                                  <div className="pdf-detail-value">{item.promoterQuantity || 0}</div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Price Breakdown per vehicle */}
                          <div style={{ marginTop: 16 }}>
                            <div style={{ fontSize: 9, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
                              💰 Price Breakdown
                            </div>
                            <table className="pdf-pricing-table">
                              <thead>
                                <tr>
                                  <th>Description</th>
                                  <th>Amount</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(item.rentalCost) ? (
                                  <tr>
                                    <td>Rental &amp; Driver Charges</td>
                                    <td>₹{fmt((item.rentalCost || 0))}</td>
                                  </tr>
                                ) : null}
                                {item.promoterCost && item.promoterCost > 0 ? (
                                  <tr>
                                    <td>
                                      Promoter Charges ({item.totalDays}D × ₹{fmt(item.promoterChargePerDay)} × {item.promoterQuantity})
                                    </td>
                                    <td>₹{fmt(item.promoterCost)}</td>
                                  </tr>
                                ) : null}
                                {item.rtoCost && item.rtoCost > 0 ? (
                                  <tr>
                                    <td>RTO Charges</td>
                                    <td>₹{fmt(item.rtoCost)}</td>
                                  </tr>
                                ) : null}
                                {item.extraKmCost && item.extraKmCost > 0 ? (
                                  <tr>
                                    <td>Extra KM ({item.extraKm} km × ₹{fmt(item.dailyKmcharges)})</td>
                                    <td>₹{fmt(item.extraKmCost)}</td>
                                  </tr>
                                ) : null}
                                {item.extraHourCost && item.extraHourCost > 0 ? (
                                  <tr>
                                    <td>Extra Hours ({item.extraHours} hrs × ₹{fmt(item.additionalHourCharges)})</td>
                                    <td>₹{fmt(item.extraHourCost)}</td>
                                  </tr>
                                ) : null}
                                {(item.additionalFields || []).filter((f) => f.label).map((f, fi) => (
                                  <tr key={fi} className={f.mode === "-" ? "negative-row" : ""}>
                                    <td>{f.label}</td>
                                    <td>{f.mode === "-" ? "−" : "+"}₹{fmt(Number(f.amount))}</td>
                                  </tr>
                                ))}
                                <tr className="subtotal-row">
                                  <td>Subtotal (excl. GST)</td>
                                  <td>₹{fmt(item.subtotal || item.totalAmount)}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 3. Negotiation / Discount History */}
                {negotiationLogs.length > 0 && (
                  <div className="pdf-section">
                    <div className="pdf-section-header">
                      <div className="pdf-section-icon" style={{ background: "#fef3c7" }}>💬</div>
                      <div className="pdf-section-title">Discount Negotiation History</div>
                      <div className="pdf-section-line" />
                    </div>

                    {negotiationLogs.map((log, i) => (
                      <div key={i} className="pdf-history-item">
                        <div className="pdf-history-num">{i + 1}</div>
                        <div className="pdf-history-content">
                          <div className="pdf-history-by">{log.movedBy || "Unknown"}</div>
                          <div className="pdf-history-date">{fmtDate(log.movedAt)}</div>
                          {log.discountNotes && (
                            <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                              📝 {log.discountNotes}
                            </div>
                          )}
                        </div>
                        <div className="pdf-history-amount">
                          −₹{fmt(log.discountAmount)}
                        </div>
                      </div>
                    ))}

                    {negotiationLogs.length > 1 && (
                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                        <div style={{ background: "#fee2e2", border: "2px solid #fca5a5", borderRadius: 8, padding: "8px 16px" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#991b1b" }}>
                            Total Discount: −₹{fmt(totalDiscount)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. PO Documents */}
                {poLogs.length > 0 && (
                  <div className="pdf-section">
                    <div className="pdf-section-header">
                      <div className="pdf-section-icon" style={{ background: "#fef3c7" }}>📋</div>
                      <div className="pdf-section-title">PO Documents ({poLogs.length})</div>
                      <div className="pdf-section-line" />
                    </div>

                    {poLogs.map((log, i) => (
                      <div key={log._id} className="pdf-po-item">
                        <div className="pdf-po-icon">📄</div>
                        <div>
                          <div className="pdf-po-name">PO Document {i + 1}</div>
                          <div className="pdf-po-meta">
                            Date: {fmtDate(log.poDate)}
                            {log.uploadedBy ? ` · By: ${log.uploadedBy}` : ""}
                          </div>
                          {log.poNotes && (
                            <div className="pdf-po-meta" style={{ marginTop: 3 }}>📝 {log.poNotes}</div>
                          )}
                        </div>
                        <span className="pdf-badge pdf-badge-green" style={{ marginLeft: "auto" }}>✓ Uploaded</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 5. Payment History */}
                {paymentLogs.length > 0 && (
                  <div className="pdf-section">
                    <div className="pdf-section-header">
                      <div className="pdf-section-icon" style={{ background: "#fed7aa" }}>💳</div>
                      <div className="pdf-section-title">Payment Stage 1 History</div>
                      <div className="pdf-section-line" />
                    </div>

                    {paymentLogs.map((log, i) => (
                      <div key={log._id} className="pdf-history-item">
                        <div className="pdf-history-num" style={{ background: "linear-gradient(135deg, #f97316, #fb923c)" }}>
                          {i + 1}
                        </div>
                        <div className="pdf-history-content">
                          <div className="pdf-history-by">Payment {i + 1}</div>
                          <div className="pdf-history-date">
                            Date: {fmtDate(log.paymentDate)}
                            {log.uploadedBy ? ` · By: ${log.uploadedBy}` : ""}
                          </div>
                          {log.paymentNotes && (
                            <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>📝 {log.paymentNotes}</div>
                          )}
                          <span className={`pdf-badge ${log.paymentVerification === "Verified" ? "pdf-badge-green" : "pdf-badge-amber"}`}
                            style={{ marginTop: 4 }}>
                            {log.paymentVerification === "Verified" ? "✓ Verified" : "⏳ Pending"}
                          </span>
                        </div>
                        <div className="pdf-history-amount" style={{ color: "#ea580c" }}>
                          ₹{fmt(log.advancePayment)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 6. Order Total Summary */}
                <div className="pdf-section">
                  <div className="pdf-section-header">
                    <div className="pdf-section-icon" style={{ background: "#dcfce7" }}>💰</div>
                    <div className="pdf-section-title">Order Financial Summary</div>
                    <div className="pdf-section-line" />
                  </div>

                  <div className="pdf-summary-box">
                    <div className="pdf-summary-title">
                      💵 Grand Total Breakdown
                    </div>

                    <div className="pdf-summary-row">
                      <div className="pdf-summary-row-label">Subtotal (excl. GST)</div>
                      <div className="pdf-summary-row-value">₹{fmt(subtotal)}</div>
                    </div>

                    {totalDiscount > 0 && (
                      <div className="pdf-summary-row negative">
                        <div className="pdf-summary-row-label" style={{ color: "#dc2626" }}>
                          Total Discount Applied
                        </div>
                        <div className="pdf-summary-row-value" style={{ color: "#dc2626" }}>
                          −₹{fmt(totalDiscount)}
                        </div>
                      </div>
                    )}

                    <div className="pdf-summary-row">
                      <div className="pdf-summary-row-label">Taxable Amount</div>
                      <div className="pdf-summary-row-value">₹{fmt(taxable)}</div>
                    </div>

                    <div className="pdf-summary-row">
                      <div className="pdf-summary-row-label">GST (18%)</div>
                      <div className="pdf-summary-row-value">₹{fmt(gstAmt)}</div>
                    </div>

                    {totalAdvance > 0 && (
                      <div className="pdf-summary-row negative">
                        <div className="pdf-summary-row-label" style={{ color: "#ea580c" }}>
                          Advance Paid
                        </div>
                        <div className="pdf-summary-row-value" style={{ color: "#ea580c" }}>
                          −₹{fmt(totalAdvance)}
                        </div>
                      </div>
                    )}

                    <div className="pdf-summary-row grand">
                      <div className="pdf-summary-row-label">Grand Total</div>
                      <div className="pdf-summary-row-value">₹{fmt(grandTotal)}</div>
                    </div>

                    {totalAdvance > 0 && (
                      <div className="pdf-summary-row positive" style={{ marginTop: 8 }}>
                        <div className="pdf-summary-row-label" style={{ fontWeight: 700, color: "#059669" }}>
                          Balance Due
                        </div>
                        <div className="pdf-summary-row-value" style={{ color: "#059669" }}>
                          ₹{fmt(balanceDue)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* ── FOOTER ── */}
              <div className="pdf-footer">
                <div className="pdf-footer-left">
                  <div>Generated on {fmtDate(new Date().toISOString())}</div>
                  {/* <div className="pdf-watermark">CONFIDENTIAL — INTERNAL USE ONLY</div> */}
                </div>
                <div className="pdf-footer-right">
                  <div>Order: <strong style={{ color: "rgba(255,255,255,0.7)" }}>{order.orderId}</strong></div>
                  {/* <div className="pdf-watermark">Page 1 of 1</div> */}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
