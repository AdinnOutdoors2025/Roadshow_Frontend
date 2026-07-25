
/* eslint-disable */
// @ts-nocheck

"use client";

import React, { useRef } from "react";

// ─── Types (keep existing types) ─────────────────────────────────────────────────
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
  vehicleTypes: any;
  showHistory?: boolean;
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
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: #f4f6f9;
    color: #1a1f36;
    font-size: 13px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  .pdf-modal-backdrop {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(15, 23, 42, 0.7);
    backdrop-filter: blur(8px);
    display: flex; align-items: flex-start; justify-content: center;
    padding: 24px; overflow-y: auto;
  }

  .pdf-modal-container {
    background: #ffffff;
    width: 100%; max-width: 960px;
    border-radius: 20px;
    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.25);
    overflow: hidden;
    margin: auto;
  }

  /* Toolbar */
  .pdf-toolbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 24px;
    background: #ffffff;
    border-bottom: 1px solid #e5e7eb;
    gap: 16px;
  }
  .pdf-toolbar-left {
    display: flex; align-items: center; gap: 12px;
  }
  .pdf-toolbar-icon {
    width: 40px; height: 40px; border-radius: 10px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 18px; font-weight: 700;
  }
  .pdf-toolbar-title {
    font-size: 16px; font-weight: 700; color: #1f2937;
  }
  .pdf-toolbar-subtitle {
    font-size: 12px; color: #6b7280; font-weight: 500;
  }
  .pdf-toolbar-actions {
    display: flex; gap: 10px; align-items: center;
  }
  .pdf-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 600;
    cursor: pointer; border: none; transition: all 0.2s ease;
    letter-spacing: 0.3px;
  }
  .pdf-btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
  .pdf-btn-primary:hover { 
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }
  .pdf-btn-secondary {
    background: #fff; color: #374151;
    border: 2px solid #e5e7eb;
  }
  .pdf-btn-secondary:hover { 
    background: #f9fafb;
    border-color: #d1d5db;
  }

  /* PDF Content */
  .pdf-content {
    background: #fff;
    padding: 0;
    max-height: calc(100vh - 160px);
    overflow-y: auto;
  }

  /* Header */
  .pdf-header {
    background: linear-gradient(135deg, #1e293b 0%, #312e81 100%);
    padding: 40px 48px;
    color: #fff;
    position: relative;
    overflow: hidden;
  }
  .pdf-header::before {
    content: '';
    position: absolute; top: -80px; right: -80px;
    width: 280px; height: 280px;
    border-radius: 50%;
    
  }
  .pdf-header::after {
    content: '';
    position: absolute; bottom: -50px; left: 30%;
    width: 200px; height: 200px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(167, 139, 250, 0.1) 0%, transparent 70%);
  }
  .pdf-header-content {
    position: relative; z-index: 1;
  }
  .pdf-header-top {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 32px;
  }
  .pdf-company-info h1 {
    font-size: 28px; font-weight: 800; color: #fff;
    letter-spacing: -0.5px; margin-bottom: 4px;
  }
  .pdf-company-info p {
    font-size: 12px; color: rgba(255, 255, 255, 0.6);
    font-weight: 500; letter-spacing: 1px;
    text-transform: uppercase;
  }
  .pdf-order-info {
    text-align: right;
  }
  .pdf-order-id {
    font-size: 24px; font-weight: 800; color: #a78bfa;
    font-family: 'Courier New', monospace; letter-spacing: 0.5px;
  }
  .pdf-order-date {
    font-size: 11px; color: rgba(255, 255, 255, 0.5);
    margin-top: 4px;
  }

  .pdf-header-stats {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  .pdf-stat-card {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px; padding: 16px 20px;
    backdrop-filter: blur(10px);
    transition: all 0.2s ease;
  }
  .pdf-stat-card:hover {
    background: rgba(255, 255, 255, 0.12);
  }
  .pdf-stat-label {
    font-size: 10px; font-weight: 600; color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;
  }
  .pdf-stat-value {
    font-size: 18px; font-weight: 800; color: #fff;
  }
  .pdf-stat-value.primary { color: #a78bfa; }

  /* Body Sections */
  .pdf-body {
    padding: 40px 48px;
    background: #fafbfc;
  }

  .pdf-section {
    margin-bottom: 36px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  }
  .pdf-section-header {
    display: flex; align-items: center; gap: 12px;
    padding: 20px 24px;
    background: #f8fafc;
    border-bottom: 1px solid #e5e7eb;
  }
  .pdf-section-icon {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; flex-shrink: 0; font-weight: 700;
  }
  .pdf-section-title {
    font-size: 14px; font-weight: 700; color: #1f2937;
  }
  .pdf-section-count {
    font-size: 12px; color: #6b7280; font-weight: 500;
    margin-left: auto;
  }
  .pdf-section-body {
    padding: 24px;
  }

  /* Info Grid */
  .pdf-info-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  .pdf-info-grid.two-col { grid-template-columns: repeat(2, 1fr); }
  .pdf-info-grid.four-col { grid-template-columns: repeat(4, 1fr); }
  
  .pdf-info-item {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 10px; padding: 14px 16px;
    transition: all 0.2s ease;
  }
  .pdf-info-item:hover { background: #f3f4f6; }
  .pdf-info-item.full-width { grid-column: 1 / -1; }
  
  .pdf-info-label {
    font-size: 10px; font-weight: 600; color: #6b7280;
    text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px;
  }
  .pdf-info-value {
    font-size: 13px; font-weight: 600; color: #1f2937;
    word-break: break-word;
  }
  .pdf-info-value.accent { color: #7c3aed; }

  /* Badges */
  .pdf-badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 4px 12px; border-radius: 20px;
    font-size: 11px; font-weight: 600;
  }
  .badge-success { background: #dcfce7; color: #166534; }
  .badge-info { background: #dbeafe; color: #1e40af; }
  .badge-warning { background: #fef3c7; color: #92400e; }
  .badge-danger { background: #fee2e2; color: #991b1b; }
  .badge-purple { background: #ede9fe; color: #5b21b6; }
  .badge-neutral { background: #f3f4f6; color: #374151; }

  /* Vehicle Card */
  .vehicle-card {
    border: 1px solid #e5e7eb;
    border-radius: 14px; overflow: hidden;
    margin-bottom: 20px;
    transition: all 0.2s ease;
  }
  .vehicle-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }
  .vehicle-card-header {
    display: flex; align-items: center; gap: 16px;
    padding: 18px 24px;
    background: linear-gradient(to right, #f8fafc 0%, #f0f4ff 100%);
    border-bottom: 1px solid #e0e7ff;
  }
  .vehicle-number {
    width: 42px; height: 42px; border-radius: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; font-weight: 800; color: #fff;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    flex-shrink: 0;
  }
  .vehicle-info {
    flex: 1;
  }
  .vehicle-name {
    font-size: 16px; font-weight: 700; color: #1f2937;
    margin-bottom: 2px;
  }
  .vehicle-meta {
    font-size: 11px; color: #6b7280; font-weight: 500;
  }
  .vehicle-total {
    text-align: right;
  }
  .vehicle-total-label {
    font-size: 10px; color: #6b7280; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.5px;
  }
  .vehicle-total-value {
    font-size: 20px; font-weight: 800; color: #6366f1;
  }
  
  .vehicle-card-body {
    padding: 20px 24px;
  }
  .vehicle-details {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }
  .detail-item {
    background: #f9fafb;
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
  }
  .detail-label {
    font-size: 9px; font-weight: 600; color: #9ca3af;
    text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;
  }
  .detail-value {
    font-size: 12px; font-weight: 600; color: #374151;
  }

  /* Pricing Table */
  .pricing-table {
    width: 100%; border-collapse: collapse;
    margin-top: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 10px; overflow: hidden;
  }
  .pricing-table thead th {
    background: #f8fafc;
    padding: 12px 16px;
    font-size: 10px; font-weight: 700; color: #6b7280;
    text-transform: uppercase; letter-spacing: 0.5px;
    text-align: left; border-bottom: 2px solid #e5e7eb;
  }
  .pricing-table thead th:last-child { text-align: right; }
  .pricing-table tbody td {
    padding: 12px 16px;
    font-size: 12px; color: #374151;
    border-bottom: 1px solid #f3f4f6;
    font-weight: 500;
  }
  .pricing-table tbody td:last-child { 
    text-align: right; 
    font-weight: 600;
    font-family: 'Courier New', monospace;
  }
  .pricing-table tbody tr:last-child td { border-bottom: none; }
  .pricing-table .subtotal-row td {
    background: #f0f4ff;
    font-weight: 700; color: #4338ca;
    border-top: 2px solid #c7d2fe;
    font-size: 13px;
  }
  .pricing-table .deduction-row td { color: #dc2626; }

  /* Promoter Box */
  .promoter-box {
    background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
    border: 1px solid #d8b4fe;
    border-radius: 12px; padding: 16px 20px;
    margin-top: 16px;
  }
  .promoter-title {
    font-size: 11px; font-weight: 700; color: #7c3aed;
    text-transform: uppercase; letter-spacing: 0.8px;
    margin-bottom: 12px; padding-bottom: 10px;
    border-bottom: 1px solid #e9d5ff;
  }
  .promoter-grid {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }

  /* Summary Box */
  .summary-box {
    background: linear-gradient(135deg, #f0f4ff 0%, #eef2ff 100%);
    border: 2px solid #c7d2fe;
    border-radius: 16px; padding: 24px;
  }
  .summary-title {
    font-size: 13px; font-weight: 800; color: #4338ca;
    text-transform: uppercase; letter-spacing: 1px;
    margin-bottom: 20px; padding-bottom: 12px;
    border-bottom: 2px solid #c7d2fe;
  }
  .summary-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 0;
  }
  .summary-row:not(:last-child) {
    border-bottom: 1px solid rgba(199, 210, 254, 0.5);
  }
  .summary-label {
    font-size: 13px; color: #4b5563; font-weight: 500;
  }
  .summary-value {
    font-size: 14px; font-weight: 700; color: #1f2937;
    font-family: 'Courier New', monospace;
  }
  .summary-row.grand-total {
    padding-top: 16px; margin-top: 8px;
    border-top: 2px solid #a5b4fc;
  }
  .summary-row.grand-total .summary-label {
    font-size: 18px; font-weight: 800; color: #1e293b;
  }
  .summary-row.grand-total .summary-value {
    font-size: 24px; font-weight: 900; color: #4338ca;
  }
  .summary-value.negative { color: #dc2626; }
  .summary-value.positive { color: #059669; }

  /* History Items */
  .history-item {
    display: flex; align-items: flex-start; gap: 16px;
    padding: 14px 18px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    margin-bottom: 10px;
    transition: all 0.2s ease;
  }
  .history-item:hover { background: #f3f4f6; }
  .history-badge {
    width: 32px; height: 32px; border-radius: 8px;
    background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 800; color: #fff;
    flex-shrink: 0;
  }
  .history-content { flex: 1; }
  .history-title { font-size: 13px; font-weight: 700; color: #1f2937; }
  .history-date { font-size: 11px; color: #6b7280; margin-top: 4px; }
  .history-amount {
    font-size: 16px; font-weight: 800;
    color: #dc2626; text-align: right;
    font-family: 'Courier New', monospace;
  }

  /* PO Item */
  .po-item {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 18px;
    background: #f9fafb;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    margin-bottom: 10px;
    transition: all 0.2s ease;
  }
  .po-item:hover { background: #f3f4f6; }
  .po-icon {
    width: 40px; height: 40px; border-radius: 10px;
    background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; color: #fff; flex-shrink: 0;
    font-weight: 700;
  }
  .po-content { flex: 1; }
  .po-name { font-size: 13px; font-weight: 700; color: #1f2937; }
  .po-meta { font-size: 11px; color: #6b7280; margin-top: 3px; }

  /* Footer */
  .pdf-footer {
    background: #1e293b;
    padding: 20px 48px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .footer-text {
    font-size: 11px; color: rgba(255, 255, 255, 0.5);
    font-weight: 500;
  }
  .footer-watermark {
    font-size: 10px; color: rgba(255, 255, 255, 0.3);
    letter-spacing: 1.5px; text-transform: uppercase;
  }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .pdf-modal-backdrop { position: static; background: none; padding: 0; }
    .pdf-modal-container { border-radius: 0; box-shadow: none; max-width: 100%; }
    .pdf-toolbar { display: none !important; }
    .pdf-content { max-height: none; overflow: visible; }
    .pdf-body { background: #fff; }
    .vehicle-card { break-inside: avoid; }
    .summary-box { break-inside: avoid; }
    .pdf-section { break-inside: avoid; }
  }
`;

// ─── Main Component ────────────────────────────────────────────────────────────
export default function OrderPDFView({ order, onClose, vehicleTypes, showHistory = false }: OrderPDFViewProps) {
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
  const grandTotal = taxable + gstAmt;
  const totalAdvance = paymentLogs.reduce((s, l) => s + (l.advancePayment || 0), 0);
  const balanceDue = grandTotal - totalAdvance;

  const handlerName = order.handlerName || order.handlername;

  const getVehicleTypeName = (vehicleTypeId: string) => {
    if (!vehicleTypeId || !vehicleTypes) return '';
    const vehicle = vehicleTypes.find((vt: any) => vt._id === vehicleTypeId);
    return vehicle?.typeName || vehicleTypeId;
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=960,height=700");
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
      <style>{PRINT_STYLES}</style>

      <div className="pdf-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="pdf-modal-container">

          {/* Modern Toolbar */}
          <div className="pdf-toolbar">
            <div className="pdf-toolbar-left">
              <div className="pdf-toolbar-icon">VO</div>
              <div>
                <div className="pdf-toolbar-title">Order Summary</div>
                <div className="pdf-toolbar-subtitle">{order.orderId}</div>
              </div>
            </div>
            <div className="pdf-toolbar-actions">
              <button className="pdf-btn pdf-btn-primary" onClick={handlePrint}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                Print Document
              </button>
              <button className="pdf-btn pdf-btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>

          {/* PDF Content */}
          <div className="pdf-content">
            <div ref={printRef}>

              {/* Header */}
              <div className="pdf-header">
                <div className="pdf-header-content">
                  <div className="pdf-header-top">
                    <div className="pdf-company-info">
                      <h1>Vehicle</h1>
                      <p>Order Summary Document</p>
                    </div>
                    <div className="pdf-order-info">
                      <div className="pdf-order-id">{order.orderId}</div>
                      <div className="pdf-order-date">
                        Created: {fmtDate(order.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="pdf-header-stats">
                    <div className="pdf-stat-card">
                      <div className="pdf-stat-label">Grand Total</div>
                      <div className="pdf-stat-value primary">₹{fmt(grandTotal)}</div>
                    </div>
                    <div className="pdf-stat-card">
                      <div className="pdf-stat-label">Total Vehicle Models</div>
                      <div className="pdf-stat-value">{bookingItems.length}</div>
                    </div>
                    <div className="pdf-stat-card">
                      <div className="pdf-stat-label">Order Status</div>
                      <div className="pdf-stat-value" style={{ fontSize: '14px' }}>
                        {order.orderStatus || "—"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="pdf-body">

                {/* Customer Information */}
                <div className="pdf-section">
                  <div className="pdf-section-header">
                    <div className="pdf-section-icon" style={{ background: '#dbeafe', color: '#1e40af' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <div className="pdf-section-title">Customer Information</div>
                  </div>
                  <div className="pdf-section-body">
                    <div className="pdf-info-grid">
                      <div className="pdf-info-item">
                        <div className="pdf-info-label">Full Name</div>
                        <div className="pdf-info-value">{order.name}</div>
                      </div>
                      <div className="pdf-info-item">
                        <div className="pdf-info-label">Phone Number</div>
                        <div className="pdf-info-value">+91 {order.phone}</div>
                      </div>
                      <div className="pdf-info-item">
                        <div className="pdf-info-label">Email Address</div>
                        <div className="pdf-info-value">{order.email || "—"}</div>
                      </div>
                           {order.companyName && (
                       <div className="pdf-info-item">
                        <div className="pdf-info-label">Company Name</div>
                        <div className="pdf-info-value">{order.companyName}</div>
                      </div>
                         )}
                          {order.designation && (
                       <div className="pdf-info-item">
                        <div className="pdf-info-label">Designation</div>
                        <div className="pdf-info-value">{order.designation}</div>
                      </div>
                         )}
                          {order.gstNumber && (
                       <div className="pdf-info-item">
                        <div className="pdf-info-label">GstNumber</div>
                        <div className="pdf-info-value">{order.gstNumber}</div>
                      </div>
                         )}
                          {order.panNumber && (
                       <div className="pdf-info-item">
                        <div className="pdf-info-label">PAN Number</div>
                        <div className="pdf-info-value">{order.panNumber}</div>
                      </div>
                         )}

                      <div className="pdf-info-item full-width">
                        <div className="pdf-info-label">Address</div>
                        <div className="pdf-info-value">{order.address || "—"}</div>
                      </div>
                      <div className="pdf-info-item">
                        <div className="pdf-info-label">Customer Type</div>
                        <div className="pdf-info-value">
                          {order.customerType === 1 ? (
                            <span className="pdf-badge badge-success">Organization</span>
                          ) : order.customerType === 0 ? (
                            <span className="pdf-badge badge-info">Individual</span>
                          ) : (
                            <span className="pdf-badge badge-neutral">Not Set</span>
                          )}
                        </div>
                      </div>
                      {handlerName && (
                        <div className="pdf-info-item">
                          <div className="pdf-info-label">Assigned Handler</div>
                          <div className="pdf-info-value">{handlerName}</div>
                        </div>
                      )}
                      {order.isAdminCreated && (
                        <div className="pdf-info-item">
                          <div className="pdf-info-label">Order Source</div>
                          <div className="pdf-info-value">
                            <span className="pdf-badge badge-purple">Admin Created</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Vehicle Bookings */}
                <div className="pdf-section">
                  <div className="pdf-section-header">
                    <div className="pdf-section-icon" style={{ background: '#e0e7ff', color: '#4338ca' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 17h14M5 12h14M5 7h14" />
                      </svg>
                    </div>
                    <div className="pdf-section-title">Vehicle Bookings</div>
                    <div className="pdf-section-count">{bookingItems.length} vehicle(s)</div>
                  </div>
                  <div className="pdf-section-body">
                    {bookingItems.map((item: any, i) => {
                      const campaignLabel =
                        item.campaignType === "Other"
                          ? item.otherCampaignType || "Other"
                          : item.campaignType || "—";
                      const promoterTypeLabel =
                        item.promoterType === "Other"
                          ? item.otherPromoterType || "Other"
                          : item.promoterType || "—";
                      const location = [item.state, item.city].filter(Boolean).join(" / ") || "—";

                      return (
                        <div key={i} className="vehicle-card">
                          <div className="vehicle-card-header">
                            <div className="vehicle-number">{i + 1}</div>
                            <div className="vehicle-info">
                              <div className="vehicle-name">
                                {getVehicleTypeName(item.vehicleType)}
                              </div>
                              <div className="vehicle-meta">
                                Quantity: {item.quantity || 1} &bull; {item.totalDays} days &bull; {location}
                              </div>
                            </div>
                            <div className="vehicle-total">
                              <div className="vehicle-total-label">Vehicle Total</div>
                              <div className="vehicle-total-value">
                                ₹{fmt(item.subtotal || item.totalAmount)}
                              </div>
                            </div>
                          </div>

                          <div className="vehicle-card-body">
                            <div className="vehicle-details">
                              {item.bookingFor && (
                                <div className="detail-item">
                                  <div className="detail-label">Booking For</div>
                                  <div className="detail-value">{item.bookingFor}</div>
                                </div>
                              )}
                              <div className="detail-item">
                                <div className="detail-label">Campaign Type</div>
                                <div className="detail-value">{campaignLabel}</div>
                              </div>
                               <div className="detail-item">
                                <div className="detail-label">Campaign Name</div>
                                <div className="detail-value">{item.campaignName}</div>
                              </div>
                              <div className="detail-item">
                                <div className="detail-label">Location</div>
                                <div className="detail-value">{location}</div>
                              </div>
                               <div className="detail-item">
                                <div className="detail-label">Driving Route</div>
                                <div className="detail-value">{item.fromLocation && item.toLocation
                                                                ? `${item.fromLocation} → ${item.toLocation}`
                                                                : "—"}</div>
                              </div>
                              <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                                <div className="detail-label">Duration</div>
                                <div className="detail-value">
                                  {fmtDate(item.fromDate)} → {fmtDate(item.toDate)} ({item.totalDays} days)
                                </div>
                              </div>
                              {item.extraKm > 0 && (
                                <div className="detail-item">
                                  <div className="detail-label">Extra KM</div>
                                  <div className="detail-value">{item.extraKm} km</div>
                                </div>
                              )}
                              {item.extraHours > 0 && (
                                <div className="detail-item">
                                  <div className="detail-label">Extra Hours</div>
                                  <div className="detail-value">{item.extraHours} hrs</div>
                                </div>
                              )}
                              {item.extraDays > 0 && (
                                <div className="detail-item">
                                  <div className="detail-label">Extra Days</div>
                                  <div className="detail-value">{item.extraDays} days</div>
                                </div>
                              )}
                              {item.gstNumber && (
                                <div className="detail-item">
                                  <div className="detail-label">GST Number</div>
                                  <div className="detail-value">{item.gstNumber}</div>
                                </div>
                              )}
                            </div>

                            {/* Promoter Details */}
                            {item.needPromoter && (
                              <div className="promoter-box">
                                <div className="promoter-title">Promoter Details</div>
                                <div className="promoter-grid">
                                  <div className="detail-item">
                                    <div className="detail-label">Type</div>
                                    <div className="detail-value">{promoterTypeLabel}</div>
                                  </div>
                                  <div className="detail-item">
                                    <div className="detail-label">Gender</div>
                                    <div className="detail-value">{item.promoterGender || "—"}</div>
                                  </div>
                                

                                  <div className="detail-item">
                                     <div className="detail-label">Language</div>
                                  <div className="detail-value">
                                    {typeof item.promoterLanguage === "string"
                                      ? item.promoterLanguage.replace(/([a-z])([A-Z])/g, '$1 $2') 
                                      : Array.isArray(item.promoterLanguage)
                                        ? item.promoterLanguage.join(" ")
                                        : "—"}
                                  </div>
                                   </div>
                                  <div className="detail-item">
                                    <div className="detail-label">Quantity</div>
                                    <div className="detail-value">{item.promoterQuantity || 0}</div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Price Breakdown */}
                            <div style={{ marginTop: 20 }}>
                              <div style={{
                                fontSize: '11px', fontWeight: 700, color: '#6b7280',
                                textTransform: 'uppercase', letterSpacing: '0.5px',
                                marginBottom: 10
                              }}>
                                Price Breakdown
                              </div>
                              <table className="pricing-table">
                                <thead>
                                  <tr>
                                    <th>Description</th>
                                    <th>Amount</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {item.rentalCost > 0 && (
                                    <tr>
                                      <td>Rental & Driver Charges</td>
                                      <td>₹{fmt(item.rentalCost)}</td>
                                    </tr>
                                  )}
                                  {item.promoterCost > 0 && (
                                    <tr>
                                      <td>
                                        Promoter Charges ({item.totalDays}D × ₹{fmt(item.promoterChargePerDay)} × {item.promoterQuantity})
                                      </td>
                                      <td>₹{fmt(item.promoterCost)}</td>
                                    </tr>
                                  )}
                                  {item.rtoCost > 0 && (
                                    <tr>
                                      <td>RTO Charges</td>
                                      <td>₹{fmt(item.rtoCost)}</td>
                                    </tr>
                                  )}
                                  {item.extraKmCost > 0 && (
                                    <tr>
                                      <td>Extra KM ({item.extraKm} km × ₹{fmt(item.dailyKmcharges)})</td>
                                      <td>₹{fmt(item.extraKmCost)}</td>
                                    </tr>
                                  )}
                                  {item.extraHourCost > 0 && (
                                    <tr>
                                      <td>Extra Hours ({item.extraHours} hrs × ₹{fmt(item.additionalHourCharges)})</td>
                                      <td>₹{fmt(item.extraHourCost)}</td>
                                    </tr>
                                  )}
                                  {(item.additionalFields || []).filter((f) => f.label).map((f, fi) => (
                                    <tr key={fi} className={f.mode === "-" ? "deduction-row" : ""}>
                                      <td>{f.label}</td>
                                      <td>{f.mode === "-" ? "−" : "+"}₹{fmt(Number(f.amount))}</td>
                                    </tr>
                                  ))}
                                  <tr className="subtotal-row">
                                    <td>Subtotal (excluding GST)</td>
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
                </div>




                {/* Financial Summary */}
                <div className="pdf-section" style={{ border: '2px solid #c7d2fe' }}>
                  <div className="pdf-section-header" style={{
                    background: 'linear-gradient(135deg, #f0f4ff 0%, #eef2ff 100%)',
                    borderBottom: '2px solid #c7d2fe'
                  }}>
                    <div className="pdf-section-icon" style={{ background: '#dcfce7', color: '#166534' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="1" x2="12" y2="23" />
                        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                      </svg>
                    </div>
                    <div className="pdf-section-title">Financial Summary</div>
                  </div>
                  <div className="pdf-section-body">
                    <div className="summary-box">
                      <div className="summary-title">Grand Total Breakdown</div>

                      <div className="summary-row">
                        <div className="summary-label">Subtotal (excluding GST)</div>
                        <div className="summary-value">₹{fmt(subtotal)}</div>
                      </div>

                      {totalDiscount > 0 && (
                        <div className="summary-row">
                          <div className="summary-label" style={{ color: '#dc2626' }}>
                            Total Discount Applied
                          </div>
                          <div className="summary-value negative">
                            −₹{fmt(totalDiscount)}
                          </div>
                        </div>
                      )}

                      <div className="summary-row">
                        <div className="summary-label">Taxable Amount</div>
                        <div className="summary-value">₹{fmt(taxable)}</div>
                      </div>

                      <div className="summary-row">
                        <div className="summary-label">GST (18%)</div>
                        <div className="summary-value">₹{fmt(gstAmt)}</div>
                      </div>

                      {totalAdvance > 0 && (
                        <div className="summary-row">
                          <div className="summary-label" style={{ color: '#ea580c' }}>
                            Advance Paid
                          </div>
                          <div className="summary-value" style={{ color: '#ea580c' }}>
                            −₹{fmt(totalAdvance)}
                          </div>
                        </div>
                      )}

                      <div className="summary-row grand-total">
                        <div className="summary-label">Grand Total</div>
                        <div className="summary-value">₹{fmt(grandTotal)}</div>
                      </div>

                      {totalAdvance > 0 && (
                        <div className="summary-row" style={{ marginTop: 12, paddingTop: 12, borderTop: '2px solid #a5b4fc' }}>
                          <div className="summary-label" style={{ fontWeight: 700, color: '#059669' }}>
                            Balance Due
                          </div>
                          <div className="summary-value positive">
                            ₹{fmt(balanceDue)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {showHistory && (negotiationLogs.length > 0 || poLogs.length > 0 || paymentLogs.length > 0) && (
                  <div style={{
                    padding: '24px 0 8px 0',
                    fontSize: '18px',
                    fontWeight: 800,
                    color: '#1e293b',
                    letterSpacing: '-0.3px',
                    borderBottom: '2px solid #e5e7eb',
                    marginBottom: '24px',
                  }}>
                    All History Status
                  </div>
                )}


                {showHistory && negotiationLogs.length > 0 && (
                  <div className="pdf-section">
                    <div className="pdf-section-header">
                      <div className="pdf-section-icon" style={{ background: '#fef3c7', color: '#92400e' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                      </div>
                      <div className="pdf-section-title">Discount Negotiation History</div>
                    </div>
                    <div className="pdf-section-body">
                      {negotiationLogs.map((log, i) => (
                        <div key={i} className="history-item">
                          <div className="history-badge">{i + 1}</div>
                          <div className="history-content">
                            <div className="history-title">{log.movedBy || "Unknown"}</div>
                            <div className="history-date">{fmtDate(log.movedAt)}</div>
                            {log.discountNotes && (
                              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
                                Notes: {log.discountNotes}
                              </div>
                            )}
                          </div>
                          <div className="history-amount">
                            −₹{fmt(log.discountAmount)}
                          </div>
                        </div>
                      ))}

                      {negotiationLogs.length > 1 && (
                        <div style={{
                          display: 'flex', justifyContent: 'flex-end', marginTop: 12
                        }}>
                          <div style={{
                            background: '#fee2e2', border: '2px solid #fca5a5',
                            borderRadius: 10, padding: '10px 20px'
                          }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#991b1b' }}>
                              Total Discount: −₹{fmt(totalDiscount)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}


                {/* {poLogs.length > 0 && ( */}
                {showHistory && poLogs.length > 0 && (
                  <div className="pdf-section">
                    <div className="pdf-section-header">
                      <div className="pdf-section-icon" style={{ background: '#fef3c7', color: '#92400e' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      </div>
                      <div className="pdf-section-title">PO Documents</div>
                      <div className="pdf-section-count">{poLogs.length} document(s)</div>
                    </div>
                    <div className="pdf-section-body">
                      {poLogs.map((log, i) => (
                        <div key={log._id} className="po-item">
                          <div className="po-icon">PO</div>
                          <div className="po-content">
                            <div className="po-name">Purchase Order {i + 1}</div>
                            <div className="po-meta">
                              Date: {fmtDate(log.poDate)}
                              {log.uploadedBy ? ` • By: ${log.uploadedBy}` : ""}
                            </div>
                            {log.poNotes && (
                              <div className="po-meta" style={{ marginTop: 3 }}>
                                Notes: {log.poNotes}
                              </div>
                            )}
                          </div>
                          <span className="pdf-badge badge-success">Uploaded</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}


                {/* {paymentLogs.length > 0 && ( */}
                {showHistory && paymentLogs.length > 0 && (
                  <div className="pdf-section">
                    <div className="pdf-section-header">
                      <div className="pdf-section-icon" style={{ background: '#fed7aa', color: '#9a3412' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                          <line x1="1" y1="10" x2="23" y2="10" />
                        </svg>
                      </div>
                      <div className="pdf-section-title">Payment History</div>
                    </div>
                    <div className="pdf-section-body">
                      {paymentLogs.map((log, i) => (
                        <div key={log._id} className="history-item">
                          <div className="history-badge" style={{
                            background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)'
                          }}>
                            {i + 1}
                          </div>
                          <div className="history-content">
                            <div className="history-title">Payment {i + 1}</div>
                            <div className="history-date">
                              Date: {fmtDate(log.paymentDate)}
                              {log.uploadedBy ? ` • By: ${log.uploadedBy}` : ""}
                            </div>
                            {log.paymentNotes && (
                              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
                                Notes: {log.paymentNotes}
                              </div>
                            )}
                            <span className={`pdf-badge ${log.paymentVerification === "Verified" ? "badge-success" : "badge-warning"}`}
                              style={{ marginTop: 6, display: 'inline-flex' }}>
                              {log.paymentVerification === "Verified" ? "Verified" : "Pending"}
                            </span>
                          </div>
                          <div className="history-amount" style={{ color: '#ea580c' }}>
                            ₹{fmt(log.advancePayment)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}


              </div>



              {/* Footer */}
              <div className="pdf-footer">
                <div className="footer-text">
                  Generated on {fmtDate(new Date().toISOString())}
                </div>
                <div>
                  <div className="footer-text" style={{ textAlign: 'right' }}>
                    Order: <strong style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{order.orderId}</strong>
                  </div>
                  <div className="footer-watermark" style={{ marginTop: 4 }}>
                    VehicleOps Order Management System
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}