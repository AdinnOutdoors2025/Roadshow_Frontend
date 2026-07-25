
/* eslint-disable */
// @ts-nocheck

"use client";

import { useMemo, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Download, Save, Plus, Trash2, ReceiptText } from "lucide-react";
import API_BASE from "../../../../baseurl";
import { getToken } from "../../utils/auth";

const COMPANY = {
  name: "Adinn Advertising Services Limited",
  gstin: "33AAGCA2094M1ZK",
  pan: "AAGCA2094M",
  address: "No.29, 1st Cross Street, Vanamamalai Nagar, Madurai-625010 Tamil Nadu",
};

const uid = () => Math.random().toString(36).slice(2, 9);

const getVehicleTypeName = (id: string, vehicleTypes: any[]) => {
  if (!id || !vehicleTypes) return "Vehicle";
  const v = vehicleTypes.find((vt: any) => vt._id === id);
  return v?.typeName || "Vehicle";
};

const fmtMoney = (n: number) =>
  (Number(n) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDateInput = (d?: string | null) => (d ? new Date(d).toISOString().slice(0, 10) : "");

const fmtDateDisplay = (d?: string) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

function numberToWords(input: number): string {
  let num = Math.round(input);
  if (num === 0) return "Rupees Zero Only";

  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
  ];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const twoDigits = (n: number): string => {
    if (n < 20) return ones[n];
    return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
  };
  const threeDigits = (n: number): string => {
    if (n >= 100) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + twoDigits(n % 100) : "");
    return twoDigits(n);
  };

  const crore = Math.floor(num / 10000000); num %= 10000000;
  const lakh = Math.floor(num / 100000); num %= 100000;
  const thousand = Math.floor(num / 1000); num %= 1000;
  const hundred = num;

  const parts: string[] = [];
  if (crore) parts.push(threeDigits(crore) + " Crore");
  if (lakh) parts.push(threeDigits(lakh) + " Lakh");
  if (thousand) parts.push(threeDigits(thousand) + " Thousand");
  if (hundred) parts.push(threeDigits(hundred));

  return "Rupees " + parts.join(" ") + " Only";
}

function buildDefaultLineItems(order: any, vehicleTypes: any[]) {
  const items: any[] = [];
  (order.bookingItems || []).forEach((b: any) => {
    const vname = getVehicleTypeName(b.vehicleType, vehicleTypes);
    const perVehicleTotal = Math.round(((b.perDayRentalCost || 0) + (b.driverCharges || 0)) * (b.totalDays || 0));
    items.push({
      id: uid(),
      description: `${vname} (${b.bookingFor || "Campaign"}) - Vehicle Rent, Driver & Fuel Cost - ${b.totalDays || 0} Days`,
      hsnSac: "998361",
      qty: b.quantity || 1,
      rate: perVehicleTotal,
    });
    if (b.rtoCharges) {
      items.push({ id: uid(), description: "RTO Charges", hsnSac: "998361", qty: 1, rate: b.rtoCharges });
    }
    if (b.promoterChargePerDay) {
      items.push({
        id: uid(),
        description: `Promoter Charges - ${b.totalDays || 0} Days`,
        hsnSac: "998361",
        qty: 1,
        rate: Math.round((b.promoterChargePerDay || 0) * (b.totalDays || 0)),
      });
    }
    if (b.extraKmCost) {
      items.push({
        id: uid(),
        description: `Extra Kilometers Charges (${b.extraKm || 0} km)`,
        hsnSac: "998361",
        qty: 1,
        rate: b.extraKmCost,
      });
    }
    if (b.extraHourCost) {
      items.push({
        id: uid(),
        description: `Extra Hours Charges (${b.extraHours || 0} hrs)`,
        hsnSac: "998361",
        qty: 1,
        rate: b.extraHourCost,
      });
    }
  });
  return items.length ? items : [{ id: uid(), description: "", hsnSac: "998361", qty: 1, rate: 0 }];
}

export default function InvoiceTab({
  order,
  vehicleTypes,
  onRefresh,
}: {
  order: any;
  vehicleTypes: any[];
  onRefresh?: () => Promise<void>;
}) {
  const existing = order.invoiceData;

  const [invoiceDate, setInvoiceDate] = useState(fmtDateInput(existing?.invoiceDate) || fmtDateInput(new Date().toISOString()));
  const [dueDate, setDueDate] = useState(fmtDateInput(existing?.dueDate));
  const [poNumber, setPoNumber] = useState(existing?.poNumber || "");
  const [projectName, setProjectName] = useState(existing?.projectName || order.projectCodeArray?.[0]?.projectCode || "");
  const [placeOfSupply, setPlaceOfSupply] = useState(existing?.placeOfSupply || order.bookingItems?.[0]?.state || "");
  const [billToName, setBillToName] = useState(existing?.billToName || order.companyName || order.clientName || order.name || "");
  const [billToAddress, setBillToAddress] = useState(existing?.billToAddress || order.address || "");
  const [billToGstin, setBillToGstin] = useState(existing?.billToGstin || order.gstNumber || "");
  const [billToPan, setBillToPan] = useState(existing?.billToPan || order.panNumber || "");
  const [cgstPercent, setCgstPercent] = useState<number>(existing?.cgstPercent ?? 9);
  const [sgstPercent, setSgstPercent] = useState<number>(existing?.sgstPercent ?? 9);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [lineItems, setLineItems] = useState(() =>
    existing?.lineItems?.length
      ? existing.lineItems.map((li: any) => ({
          id: uid(),
          description: li.description,
          hsnSac: li.hsnSac,
          qty: li.qty,
          rate: li.rate,
        }))
      : buildDefaultLineItems(order, vehicleTypes)
  );

  const previewRef = useRef<HTMLDivElement>(null);

  const updateItem = (id: string, patch: any) =>
    setLineItems((prev: any[]) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const addItem = () =>
    setLineItems((prev: any[]) => [...prev, { id: uid(), description: "", hsnSac: "998361", qty: 1, rate: 0 }]);
  const removeItem = (id: string) => setLineItems((prev: any[]) => prev.filter((it) => it.id !== id));

  const subtotal = useMemo(
    () => lineItems.reduce((s: number, it: any) => s + (Number(it.qty) || 0) * (Number(it.rate) || 0), 0),
    [lineItems]
  );
  const cgstAmt = Math.round(subtotal * (Number(cgstPercent) || 0)) / 100;
  const sgstAmt = Math.round(subtotal * (Number(sgstPercent) || 0)) / 100;
  const rawTotal = subtotal + cgstAmt + sgstAmt;
  const roundedTotal = Math.round(rawTotal);
  const rounding = Math.round((roundedTotal - rawTotal) * 100) / 100;
  const totalInWords = numberToWords(roundedTotal);

  const invoiceNumber = existing?.invoiceNumber || `ASI-${order.orderId}`;

  const buildPayload = () => ({
    invoiceDate,
    dueDate,
    poNumber,
    projectName,
    placeOfSupply,
    billToName,
    billToAddress,
    billToGstin,
    billToPan,
    lineItems: lineItems.map(({ id, ...rest }: any) => rest),
    cgstPercent,
    sgstPercent,
    rounding,
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.patch(`${API_BASE}admin/pipeline/${order._id}/invoice`, buildPayload(), {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      toast.success("Invoice saved");
      if (onRefresh) await onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save invoice");
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await axios.patch(`${API_BASE}admin/pipeline/${order._id}/invoice`, buildPayload(), {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (onRefresh) await onRefresh();

      const content = previewRef.current;
      if (!content) return;

      const { default: jsPDF } = await import("jspdf");
      const { default: html2canvas } = await import("html2canvas");

      const canvas = await html2canvas(content, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });

      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();
      const ratio = pdfWidth / canvas.width;
      const pageHeightPx = pdfPageHeight / ratio;

      let yOffset = 0;
      let first = true;
      while (yOffset < canvas.height) {
        const sliceH = Math.min(pageHeightPx, canvas.height - yOffset);
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = sliceH;
        const ctx = pageCanvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(canvas, 0, yOffset, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
        }
        if (!first) pdf.addPage();
        pdf.addImage(pageCanvas.toDataURL("image/png"), "PNG", 0, 0, pdfWidth, sliceH * ratio);
        yOffset += sliceH;
        first = false;
      }

      pdf.save(`Invoice-${invoiceNumber}.pdf`);
      toast.success("Invoice downloaded");
    } catch (err) {
      console.error("Invoice PDF error:", err);
      toast.error("Failed to generate invoice PDF");
    } finally {
      setDownloading(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const labelCls = "text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ── LEFT: Fully editable form ─────────────────────────────── */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <ReceiptText size={16} /> Invoice Details
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60"
            >
              <Save size={13} /> {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              <Download size={13} /> {downloading ? "Generating..." : "Download Invoice"}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Invoice Meta</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Invoice Number</label>
              <input value={invoiceNumber} readOnly className={inputCls + " bg-gray-50 dark:bg-gray-800 cursor-not-allowed"} />
            </div>
            <div>
              <label className={labelCls}>Invoice Date</label>
              <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>P.O.#</label>
              <input value={poNumber} onChange={(e) => setPoNumber(e.target.value)} placeholder="PO Number" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Project Name</label>
              <input value={projectName} onChange={(e) => setProjectName(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Place of Supply</label>
              <input value={placeOfSupply} onChange={(e) => setPlaceOfSupply(e.target.value)} className={inputCls} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Bill To</p>
          <div>
            <label className={labelCls}>Name / Company</label>
            <input value={billToName} onChange={(e) => setBillToName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Address</label>
            <textarea value={billToAddress} onChange={(e) => setBillToAddress(e.target.value)} rows={2} className={inputCls + " resize-none"} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>GSTIN</label>
              <input value={billToGstin} onChange={(e) => setBillToGstin(e.target.value.toUpperCase())} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>PAN</label>
              <input value={billToPan} onChange={(e) => setBillToPan(e.target.value.toUpperCase())} className={inputCls} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Line Items</p>
            <button
              onClick={addItem}
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              <Plus size={13} /> Add Item
            </button>
          </div>

          <div className="space-y-3">
            {lineItems.map((it: any) => (
              <div key={it.id} className="rounded-lg border border-gray-100 dark:border-gray-800 p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <textarea
                    value={it.description}
                    onChange={(e) => updateItem(it.id, { description: e.target.value })}
                    placeholder="Description"
                    rows={2}
                    className={inputCls + " resize-none flex-1"}
                  />
                  <button
                    onClick={() => removeItem(it.id)}
                    className="shrink-0 rounded-lg border border-red-200 text-red-500 p-1.5 hover:bg-red-50"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className={labelCls}>HSN/SAC</label>
                    <input value={it.hsnSac} onChange={(e) => updateItem(it.id, { hsnSac: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Qty</label>
                    <input
                      type="number"
                      value={it.qty}
                      onChange={(e) => updateItem(it.id, { qty: Number(e.target.value) || 0 })}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Rate</label>
                    <input
                      type="number"
                      value={it.rate}
                      onChange={(e) => updateItem(it.id, { rate: Number(e.target.value) || 0 })}
                      className={inputCls}
                    />
                  </div>
                </div>
                <p className="text-right text-xs font-semibold text-gray-600 dark:text-gray-300">
                  Amount: ₹{fmtMoney((Number(it.qty) || 0) * (Number(it.rate) || 0))}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Tax</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>CGST %</label>
              <input
                type="number"
                value={cgstPercent}
                onChange={(e) => setCgstPercent(Number(e.target.value) || 0)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>SGST %</label>
              <input
                type="number"
                value={sgstPercent}
                onChange={(e) => setSgstPercent(Number(e.target.value) || 0)}
                className={inputCls}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Live preview (this is what gets downloaded) ──────── */}
      <div className="lg:sticky lg:top-4 self-start">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Preview</p>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-950 p-3 max-h-[80vh] overflow-auto">
          <div ref={previewRef} style={{ background: "#fff", padding: "32px", width: "700px", fontFamily: "Arial, sans-serif", color: "#111" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #dc2626", paddingBottom: "12px" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <img src="/images/logo.png" alt="Adinn" style={{ height: "48px", objectFit: "contain" }} />
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "1px" }}>TAX INVOICE</div>
                <div style={{ fontSize: "11px", color: "#555" }}># {invoiceNumber}</div>
              </div>
            </div>

            <div style={{ marginTop: "14px", fontSize: "11px", lineHeight: 1.6 }}>
              <div style={{ fontWeight: 700, fontSize: "13px" }}>{COMPANY.name}</div>
              <div>GSTIN {COMPANY.gstin}</div>
              <div>PAN {COMPANY.pan}</div>
              <div>{COMPANY.address}</div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "18px", fontSize: "11px" }}>
              <div style={{ maxWidth: "320px" }}>
                <div style={{ fontWeight: 700, marginBottom: "4px" }}>Bill To</div>
                <div style={{ fontWeight: 700 }}>{billToName || "—"}</div>
                <div>{billToAddress || "—"}</div>
                {billToGstin && <div>GSTIN: {billToGstin}</div>}
                {billToPan && <div>PAN: {billToPan}</div>}
              </div>
              <div style={{ textAlign: "right", lineHeight: 1.9 }}>
                <div><b>Invoice Date:</b> {fmtDateDisplay(invoiceDate)}</div>
                <div><b>Due Date:</b> {fmtDateDisplay(dueDate)}</div>
                <div><b>P.O.#:</b> {poNumber || "—"}</div>
                <div><b>Project Name:</b> {projectName || "—"}</div>
              </div>
            </div>

            <div style={{ marginTop: "10px", fontSize: "11px" }}>
              <b>Place Of Supply:</b> {placeOfSupply || "—"}
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "14px", fontSize: "11px" }}>
              <thead>
                <tr style={{ background: "#f3f4f6" }}>
                  <th style={{ padding: "6px 8px", textAlign: "left", border: "1px solid #e5e7eb" }}>#</th>
                  <th style={{ padding: "6px 8px", textAlign: "left", border: "1px solid #e5e7eb" }}>Description</th>
                  <th style={{ padding: "6px 8px", textAlign: "left", border: "1px solid #e5e7eb" }}>HSN/SAC</th>
                  <th style={{ padding: "6px 8px", textAlign: "right", border: "1px solid #e5e7eb" }}>Qty</th>
                  <th style={{ padding: "6px 8px", textAlign: "right", border: "1px solid #e5e7eb" }}>Rate</th>
                  <th style={{ padding: "6px 8px", textAlign: "right", border: "1px solid #e5e7eb" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((it: any, idx: number) => (
                  <tr key={it.id}>
                    <td style={{ padding: "6px 8px", border: "1px solid #e5e7eb" }}>{idx + 1}</td>
                    <td style={{ padding: "6px 8px", border: "1px solid #e5e7eb" }}>{it.description || "—"}</td>
                    <td style={{ padding: "6px 8px", border: "1px solid #e5e7eb" }}>{it.hsnSac}</td>
                    <td style={{ padding: "6px 8px", border: "1px solid #e5e7eb", textAlign: "right" }}>{Number(it.qty || 0).toFixed(2)}</td>
                    <td style={{ padding: "6px 8px", border: "1px solid #e5e7eb", textAlign: "right" }}>{fmtMoney(it.rate)}</td>
                    <td style={{ padding: "6px 8px", border: "1px solid #e5e7eb", textAlign: "right" }}>
                      {fmtMoney((Number(it.qty) || 0) * (Number(it.rate) || 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
              <div style={{ width: "260px", fontSize: "11px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                  <span>Sub Total</span><span>{fmtMoney(subtotal)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                  <span>CGST ({cgstPercent}%)</span><span>{fmtMoney(cgstAmt)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                  <span>SGST ({sgstPercent}%)</span><span>{fmtMoney(sgstAmt)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                  <span>Rounding</span><span>{fmtMoney(rounding)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: "1px solid #111", fontWeight: 800 }}>
                  <span>Total</span><span>₹{fmtMoney(roundedTotal)}</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: "12px", fontSize: "11px" }}>
              <b>Total In Words:</b> <i>{totalInWords}</i>
            </div>

            <div style={{ marginTop: "60px", display: "flex", justifyContent: "flex-end" }}>
              <div style={{ textAlign: "center", fontSize: "11px" }}>
                <div style={{ marginBottom: "4px" }}>For {COMPANY.name}</div>
                <div style={{ height: "40px" }} />
                <div>Authorized Signature</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
