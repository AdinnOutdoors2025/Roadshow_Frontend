
/* eslint-disable */
// @ts-nocheck

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Download,
  Save,
  Plus,
  Trash2,
  ReceiptText,
  FileText,
  User2,
  ListChecks,
  Percent,
  PenLine,
  ShieldCheck,
  Maximize  ,
  X,
} from "lucide-react";
import API_BASE from "../../../../baseurl";
import { getToken } from "../../utils/auth";
import DatePicker from "../../utils/datepicker";

const COMPANY = {
  name: "Adinn Advertising Services Limited",
  shortName: "Adinn Advertising Services Ltd.",
  gstin: "33AAGCA2094M1ZK",
  pan: "AAGCA2094M",
  addressLine1: "No.29, 1st Cross Street, Vanamamalai Nagar,",
  addressLine2: "Madurai-625010 Tamil Nadu",
};


const INK = "#000000";
const MUTED = "#3f3f3f";
const ACCENT = "#DC2626"; 
const ACCENT_TINT = "#cacaca";
const LINE = "#D9D9D9";
const LINE_SOFT = "#E9E9E9";
const PAPER_ALT = "#FBE1DF";

/*
 * html2canvas does not support CSS oklch() values.  This style is injected
 * only into its temporary cloned document while a PDF is generated.  The
 * visible application and global theme are never changed.
 */
const PDF_CAPTURE_SAFE_COLORS = `
  :root, :root.dark, :root.dark *, .dark, .dark * {
    --background: #ffffff !important;
    --foreground: #09090b !important;
    --card: #ffffff !important;
    --card-foreground: #09090b !important;
    --popover: #ffffff !important;
    --popover-foreground: #09090b !important;
    --primary: #18181b !important;
    --primary-foreground: #fafafa !important;
    --secondary: #f4f4f5 !important;
    --secondary-foreground: #18181b !important;
    --muted: #f4f4f5 !important;
    --muted-foreground: #71717a !important;
    --accent: #f4f4f5 !important;
    --accent-foreground: #18181b !important;
    --destructive: #e7000b !important;
    --border: #e4e4e7 !important;
    --input: #e4e4e7 !important;
    --ring: #a1a1aa !important;
    --chart-1: #d4d4d8 !important;
    --chart-2: #71717a !important;
    --chart-3: #52525b !important;
    --chart-4: #3f3f46 !important;
    --chart-5: #27272a !important;
    --sidebar: #fafafa !important;
    --sidebar-foreground: #09090b !important;
    --sidebar-primary: #18181b !important;
    --sidebar-primary-foreground: #fafafa !important;
    --sidebar-accent: #f4f4f5 !important;
    --sidebar-accent-foreground: #18181b !important;
    --sidebar-border: #e4e4e7 !important;
    --sidebar-ring: #a1a1aa !important;
  }
`;

const addPdfCaptureSafeColors = (clonedDocument) => {
  const style = clonedDocument.createElement("style");
  style.setAttribute("data-pdf-capture-safe-colors", "true");
  style.textContent = PDF_CAPTURE_SAFE_COLORS;
  clonedDocument.head.appendChild(style);
};

const uid = () => Math.random().toString(36).slice(2, 9);

const getVehicleTypeName = (id, vehicleTypes) => {
  if (!id || !vehicleTypes) return "Vehicle";
  const v = vehicleTypes.find((vt) => vt._id === id);
  return v?.typeName || "Vehicle";
};


const toTitleCase = (str) =>
  str.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

const fmtMoney = (n) =>
  (Number(n) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");

const addDaysIso = (isoDate, days) => {
  if (!isoDate) return "";
  const d = new Date(isoDate + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const fmtDateDisplay = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

function numberToWords(input) {
  let num = Math.round(input);
  if (num === 0) return "Rupees Zero Only";

  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
  ];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const twoDigits = (n) => {
    if (n < 20) return ones[n];
    return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
  };
  const threeDigits = (n) => {
    if (n >= 100) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + twoDigits(n % 100) : "");
    return twoDigits(n);
  };

  const crore = Math.floor(num / 10000000); num %= 10000000;
  const lakh = Math.floor(num / 100000); num %= 100000;
  const thousand = Math.floor(num / 1000); num %= 1000;
  const hundred = num;

  const parts = [];
  if (crore) parts.push(threeDigits(crore) + " Crore");
  if (lakh) parts.push(threeDigits(lakh) + " Lakh");
  if (thousand) parts.push(threeDigits(thousand) + " Thousand");
  if (hundred) parts.push(threeDigits(hundred));

  return "Rupees " + parts.join(" ") + " Only";
}


function buildDefaultLineItems(order, vehicleTypes) {
  const items = [];
  (order.bookingItems || []).forEach((b) => {
    const vname = getVehicleTypeName(b.vehicleType, vehicleTypes);
    const vehicleQty = b.quantity || 1;
    const groupLabel = vname;
    const rentalRatePerVehicle = Math.round((b.perDayRentalCost || 0) * (b.totalDays || 0));

    items.push({
      id: uid(),
      groupLabel,
      description: `${vname} (${b.bookingFor || "Campaign"}) - Vehicle Rent & Fuel Cost - ${b.totalDays || 0} Days`,
      hsnSac: "998361",
      qty: vehicleQty,
      rate: rentalRatePerVehicle,
    });
    if (b.promoterChargePerDay) {
      const promoterQty = b.promoterQuantity || 1;
      items.push({
        id: uid(),
        groupLabel,
        description: `Promoter Charges (${b.totalDays || 0}D × ₹${b.promoterChargePerDay || 0} × ${promoterQty})`,
        hsnSac: "998361",
        qty: promoterQty,
        rate: Math.round((b.promoterChargePerDay || 0) * (b.totalDays || 0)),
      });
    }
    if (b.extraKmCost) {
      items.push({
        id: uid(),
        groupLabel,
        description: `Extra Kilometers: ${b.extraKm || 0} km (Rs-${b.dailyKmcharges || 0} per km)`,
        hsnSac: "998361",
        qty: b.extraKm || 0,
        rate: b.dailyKmcharges || 0,
      });
    }
    if (b.extraHourCost) {
      items.push({
        id: uid(),
        groupLabel,
        description: `Extra Hours: ${b.extraHours || 0} H (Rs-${b.additionalHourCharges || 0} per hours)`,
        hsnSac: "998361",
        qty: b.extraHours || 0,
        rate: b.additionalHourCharges || 0,
      });
    }
    (b.additionalFields || []).forEach((f) => {
      items.push({
        id: uid(),
        groupLabel,
        description: f.label || "Additional Charge",
        hsnSac: "998361",
        qty: 1,
        rate: f.mode === "-" ? -(Number(f.amount) || 0) : Number(f.amount) || 0,
      });
    });
  });
  return items.length ? items : [{ id: uid(), groupLabel: "General", description: "", hsnSac: "998361", qty: 1, rate: 0 }];
}

export default function InvoiceTab({ order, vehicleTypes, onRefresh, disabled = false }) {
  const existing = order.invoiceData;

  const [invoiceDate, setInvoiceDate] = useState(fmtDateInput(existing?.invoiceDate) || fmtDateInput(new Date().toISOString()));
  const [dueDate, setDueDate] = useState(
    fmtDateInput(existing?.dueDate) || addDaysIso(fmtDateInput(existing?.invoiceDate) || fmtDateInput(new Date().toISOString()), 45)
  );

  const handleInvoiceDateChange = (val) => {
    setInvoiceDate(val);
    setDueDate(addDaysIso(val, 45));
  };
  const [poNumber, setPoNumber] = useState(existing?.poNumber || order.projectCodeArray?.[0]?.estimationCode || "");
  const [projectName, setProjectName] = useState(existing?.projectName || order.projectCodeArray?.[0]?.projectCode || "");
  const [placeOfSupply, setPlaceOfSupply] = useState(existing?.placeOfSupply || order.bookingItems?.[0]?.state || "");
  const [stateOptions, setStateOptions] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}locations`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.locations?.length > 0) {
          const raw = d.data.locations[0];
          const states = Object.entries(raw)
            .filter(([key, value]) => key !== "_id" && key !== "cities" && key !== "__v" && Array.isArray(value))
            .map(([key]) => key)
            .sort();
          setStateOptions(states);
        }
      })
      .catch(() => {});
  }, []);
  const [billToName, setBillToName] = useState(existing?.billToName || order.companyName || order.clientName || order.name || "");
  const [billToAddress, setBillToAddress] = useState(existing ? (existing.billToAddress || "") : (order.address || ""));
  const [billToGstin, setBillToGstin] = useState(existing ? (existing.billToGstin || "") : (order.gstNumber || ""));
  const [billToPan, setBillToPan] = useState(existing ? (existing.billToPan || "") : (order.panNumber || ""));
  const [cgstPercent, setCgstPercent] = useState(existing?.cgstPercent ?? 9);
  const [sgstPercent, setSgstPercent] = useState(existing?.sgstPercent ?? 9);
  const [igstPercent, setIgstPercent] = useState(existing?.igstPercent ?? 18);


  const isTamilNadu = (placeOfSupply || "").trim().toLowerCase() === "tamil nadu";
  const [discounts, setDiscounts] = useState(() => {
    if (existing?.discounts?.length) {
      return existing.discounts.map((d) => ({
        id: uid(),
        // Real Mongo _id from a previously-saved row — sent back on save so
        // the backend can match this exact row across edits (by id, not by
        // label text) instead of misattributing changes to the wrong row
        // when two discounts share a label.
        _id: d._id || undefined,
        label: d.label || "Discount",
        mode: d.mode || "decrease",
        type: d.type || "percent",
        value: d.value ?? 0,
      }));
    }
    if (existing?.discountLabel || existing?.discountValue) {
      return [{
        id: uid(),
        label: existing.discountLabel || "Discount",
        mode: existing.discountMode || "decrease",
        type: existing.discountType || "percent",
        value: existing.discountValue ?? 0,
      }];
    }
    // Blank label by default — admin types their own name rather than every
    // discount starting out pre-filled with the literal text "Discount".
    return [{ id: uid(), label: "", mode: "decrease", type: "percent", value: 0 }];
  });

  const updateDiscount = (id, patch) =>
    setDiscounts((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  const addDiscount = () =>
    setDiscounts((prev) => [{ id: uid(), label: "", mode: "decrease", type: "percent", value: 0 }, ...prev]);
  const removeDiscount = (id) =>
    setDiscounts((prev) => (prev.length > 1 ? prev.filter((d) => d.id !== id) : prev));
  const [signatureMode, setSignatureMode] = useState(existing?.signatureMode || "signed");
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [lineItems, setLineItems] = useState(() =>
    existing?.lineItems?.length
      ? existing.lineItems.map((li) => ({
        id: uid(),
        groupLabel: li.groupLabel || "General",
        description: li.description,
        hsnSac: li.hsnSac,
        qty: li.qty,
        rate: li.rate,
      }))
      : buildDefaultLineItems(order, vehicleTypes)
  );

  const previewRef = useRef(null);
  const [previewExpanded, setPreviewExpanded] = useState(false);

  const updateItem = (id, patch) =>
    setLineItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  const addItemToGroup = (groupLabel) =>
    setLineItems((prev) => {
      const newItem = { id: uid(), groupLabel, description: "", hsnSac: "998361", qty: 1, rate: 0 };
      const lastIndex = prev.map((it) => it.groupLabel).lastIndexOf(groupLabel);
      if (lastIndex === -1) return [...prev, newItem];
      const next = [...prev];
      next.splice(lastIndex + 1, 0, newItem);
      return next;
    });

  const addNewVehicleGroup = () => {
    const label = window.prompt("Vehicle type name for this new group (e.g. Tata Ace, Tempo Traveller)");
    if (!label) return;
    setLineItems((prev) => [...prev, { id: uid(), groupLabel: label, description: "", hsnSac: "998361", qty: 1, rate: 0 }]);
  };

  const removeItem = (id) => setLineItems((prev) => prev.filter((it) => it.id !== id));

  const subtotal = useMemo(
    () => lineItems.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.rate) || 0), 0),
    [lineItems]
  );


  const groupedLineItems = useMemo(() => {
    const orderSeen = [];
    const map = new Map();
    lineItems.forEach((it) => {
      const key = it.groupLabel || "General";
      if (!map.has(key)) {
        map.set(key, []);
        orderSeen.push(key);
      }
      map.get(key).push(it);
    });
    let runningIndex = 0;
    return orderSeen.map((label) => {
      const items = map.get(label).map((it) => ({ ...it, _rowNo: ++runningIndex }));
      return {
        label,
        items,
        groupSubtotal: items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.rate) || 0), 0),
      };
    });
  }, [lineItems]);

  const showGroupHeadings = groupedLineItems.length > 1;

  const discountsComputed = useMemo(
    () =>
      discounts.map((d) => {
        const magnitude =
          d.type === "percent"
            ? Math.round(subtotal * (Number(d.value) || 0)) / 100
            : Number(d.value) || 0;
        const amt = d.mode === "add" ? magnitude : -magnitude;
        return { ...d, magnitude, amt };
      }),
    [discounts, subtotal]
  );
  const totalDiscountAmt = discountsComputed.reduce((s, d) => s + d.amt, 0);
  const subtotalAfterDiscount = Math.max(subtotal + totalDiscountAmt, 0);

  const cgstAmt = isTamilNadu ? Math.round(subtotalAfterDiscount * (Number(cgstPercent) || 0)) / 100 : 0;
  const sgstAmt = isTamilNadu ? Math.round(subtotalAfterDiscount * (Number(sgstPercent) || 0)) / 100 : 0;
  const igstAmt = !isTamilNadu ? Math.round(subtotalAfterDiscount * (Number(igstPercent) || 0)) / 100 : 0;
  const rawTotal = subtotalAfterDiscount + cgstAmt + sgstAmt + igstAmt;
  const roundedTotal = Math.floor(rawTotal);
  const rounding = Math.round((roundedTotal - rawTotal) * 100) / 100;
  const totalInWords = numberToWords(roundedTotal);

  const [invoiceNumber, setInvoiceNumber] = useState(existing?.invoiceNumber || `ASI-${order.orderId}`);

  const buildPayload = () => ({
    invoiceNumber,
    invoiceDate,
    dueDate,
    poNumber,
    projectName,
    placeOfSupply,
    billToName,
    billToAddress,
    billToGstin,
    billToPan,
    lineItems: lineItems.map(({ id, _rowNo, ...rest }) => rest),
    discounts: discounts.map(({ id, ...rest }) => rest),
    cgstPercent,
    sgstPercent,
    igstPercent,
    rounding,
    signatureMode,
  });

  const lastSavedSnapshotRef = useRef(JSON.stringify(buildPayload()));
  const currentSnapshot = JSON.stringify(buildPayload());
  const isDirty = currentSnapshot !== lastSavedSnapshotRef.current;

  const handleSave = async (silent = false) => {
    if (disabled) return;
    if (!silent) {
      const requiredFields = [
        [invoiceNumber, "Invoice Number is required"],
        [invoiceDate, "Invoice Date is required"],
        [dueDate, "Due Date is required"],
        [poNumber, "P.O.# is required"],
        [projectName, "Project Name is required"],
        [placeOfSupply, "Place of Supply is required"],
        [billToName, "Bill To Name / Company is required"],
      ];
      for (const [value, message] of requiredFields) {
        if (!String(value || "").trim()) {
          toast.error(message);
          return;
        }
      }
    }
    setSaving(true);
    try {
      const payload = buildPayload();
      // Only true for the very first silent auto-save that fires the moment
      // a Project Code is selected (see the mount effect below) — tells the
      // backend this invoiceData is still an untouched draft, so the
      // admin's actual first fill-in doesn't get diffed against it and
      // logged as a confusing "Edited" entry instead of being treated as
      // the real first save.
      if (silent) payload.isAutoSave = true;
      await axios.patch(`${API_BASE}admin/pipeline/${order._id}/invoice`, payload, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!silent) toast.success("Invoice saved");
      lastSavedSnapshotRef.current = JSON.stringify(payload);
      if (onRefresh) await onRefresh();
    } catch (err) {
      if (!silent) toast.error(err?.response?.data?.message || "Failed to save invoice");
    } finally {
      setSaving(false);
    }
  };


  const autoSavedRef = useRef(false);
  useEffect(() => {
    if (!disabled && !existing && order?._id && !autoSavedRef.current) {
      autoSavedRef.current = true;
      handleSave(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownload = async () => {
    if (disabled) return;
    setDownloading(true);
    try {
      const content = previewRef.current;
      if (!content) {
        toast.error("Invoice preview not ready — please try again.");
        return;
      }

      const { default: jsPDF } = await import("jspdf");
      const { default: html2canvas } = await import("html2canvas");

      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        onclone: addPdfCaptureSafeColors,
      });

      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();
      const ratio = pdfWidth / canvas.width;
      const sliceHeight = Math.floor(pdfPageHeight / ratio);


      const avoidBreakEls = content.querySelectorAll("[data-avoid-break]");
      const contentRect = content.getBoundingClientRect();
      const scale = canvas.width / content.offsetWidth;

      const getSmartBreaks = () => {
        const breaks = [];
        let y = sliceHeight;
        let iterations = 0;
        while (y < canvas.height && iterations < 200) {
          iterations++;
          let nudge = 0;
          avoidBreakEls.forEach((el) => {
            const r = el.getBoundingClientRect();
            const elTop = (r.top - contentRect.top) * scale;
            const elBot = (r.bottom - contentRect.top) * scale;
            const elHeight = elBot - elTop;
            if (elHeight >= sliceHeight) return;
            if (y > elTop && y < elBot) {
              nudge = Math.max(nudge, y - elTop);
            }
          });
          const proposedBreak = nudge > 0 ? y - nudge : y;
          const safeBreak = proposedBreak > (breaks[breaks.length - 1] ?? 0) + 20 ? proposedBreak : y;
          breaks.push(safeBreak);
          y = safeBreak + sliceHeight;
        }
        return breaks;
      };

      const pageBreaks = canvas.height > sliceHeight ? getSmartBreaks() : [];
      const allBreaks = [...pageBreaks, canvas.height];

      let yOffset = 0;
      let pageNum = 0;
      for (const breakY of allBreaks) {
        const height = Math.min(breakY - yOffset, canvas.height - yOffset);
        if (height <= 0) continue;
        if (pageNum > 0) pdf.addPage();

        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = height;
        const ctx = pageCanvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(canvas, 0, yOffset, canvas.width, height, 0, 0, canvas.width, height);
        }
        pdf.addImage(pageCanvas.toDataURL("image/png"), "PNG", 0, 0, pdfWidth, height * ratio);

        yOffset = breakY;
        pageNum++;
      }

      const downloadName = (order.companyName || order.clientName || order.name || "Invoice")
        .trim()
        .replace(/[\\/:*?"<>|#]/g, "-");
      pdf.save(`${downloadName} - TAX invoice.pdf`);
      toast.success("Invoice downloaded");

      // Save the invoice details after the PDF has been generated/downloaded.
      try {
        await axios.patch(`${API_BASE}admin/pipeline/${order._id}/invoice`, buildPayload(), {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (onRefresh) await onRefresh();
      } catch (saveErr) {
        toast.error(saveErr?.response?.data?.message || "Invoice downloaded, but failed to save the details");
      }
    } catch (err) {
      console.error("Invoice PDF error:", err);
      toast.error("Failed to generate invoice PDF");
    } finally {
      setDownloading(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-400 transition-colors";
  const labelCls = "text-[10.5px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block";
  const cardCls =
    "rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]";
  const sectionTitleCls =
    "text-[13px] font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2 pb-1";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pl-4">

      <div
        className={
          previewExpanded
            ? "fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            : "min-w-0 lg:sticky lg:top-4 self-start"
        }
        onClick={() => previewExpanded && setPreviewExpanded(false)}
      >
        {!previewExpanded && (
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Preview</p>
            <button
              type="button"
              onClick={() => setPreviewExpanded(true)}
              className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-red-600 transition-colors"
              title="Expand preview"
            >
              <Maximize  size={20} />
            </button>
          </div>
        )}
        <div
          onClick={(e) => previewExpanded && e.stopPropagation()}
          className={
            previewExpanded
              ? "relative rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-950 p-3 w-full max-w-[820px] max-h-[95vh] overflow-auto"
              : "rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-950 p-3 lg:max-h-[calc(100vh-2rem)] overflow-auto"
          }
        >
          {previewExpanded && (
            <button
              type="button"
              onClick={() => setPreviewExpanded(false)}
              className="sticky top-0 float-right z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-red-600 shadow-sm"
              title="Close"
            >
              <X size={16} />
            </button>
          )}
          <div
            ref={previewRef}
            style={{
              position: "relative",
              background: "#fff",
              padding: "40px 40px",
              width: "720px",
              fontFamily: "Arial, Helvetica, sans-serif",
              color: INK,
              overflow: "hidden",
            }}
          >
            

            {/* Header: logo + TAX INVOICE + invoice no */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <img src="/images/AdinnLogo.svg" alt="Adinn" style={{ height: "50px", objectFit: "contain" }} />
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontFamily: "Arial, Helvetica, sans-serif",
                    fontSize: "28px",
                    fontWeight: 700,
                    letterSpacing: "1px",
                    color: INK,
                  }}
                >
                  TAX <span style={{ color: ACCENT }}>INVOICE</span>
                </div>
                <div style={{ marginTop: "8px", fontSize: "11.5px", color: INK }}>
                  Invoice No: <span style={{ fontWeight: 700 }}># {invoiceNumber}</span>
                </div>
              </div>
            </div>

            {/* <div style={{ height: "2px", background: ACCENT, marginTop: "12px" }} /> */}

            {/* Company letterhead + meta table */}
            <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", marginTop: "16px" }}>
              <div style={{ flex: 1, paddingRight: "16px" }}>
                <div style={{ fontWeight: 700, fontSize: "14px", color: ACCENT, marginBottom: "4px" }}>
                  {COMPANY.name}
                </div>
                <div style={{ fontSize: "11px", lineHeight: 1.7, color: INK }}>
                  <div>GSTIN: {COMPANY.gstin}</div>
                  <div>PAN: {COMPANY.pan}</div>
                  <div>{COMPANY.addressLine1}</div>
                  <div>{COMPANY.addressLine2}</div>
                </div>
              </div>
              <div style={{ width: "230px", fontSize: "11px" }}>
                {[
                  ["Invoice Date", fmtDateDisplay(invoiceDate)],
                  ["Due Date", fmtDateDisplay(dueDate)],
                  ["P.O #", poNumber || "—"],
                  ["Project Name", projectName || "—"],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", color: INK }}>
                    <span>{label} :</span>
                    <span style={{ textAlign: "right", marginLeft: "10px" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ height: "1px", background: LINE, marginTop: "18px" }} />

            {/* Bill To, with Place of Supply directly underneath it */}
            <div style={{ marginTop: "16px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
                Bill To
              </div>
              <div style={{ fontWeight: 700, fontSize: "13px", color: INK, lineHeight: 1.4 }}>{billToName || "—"}</div>
              <div style={{ fontSize: "11px", color: INK, marginTop: "3px", lineHeight: 1.6, maxWidth: "320px", whiteSpace: "pre-line" }}>{billToAddress || "—"}</div>
              <div style={{ fontSize: "11px", color: INK, marginTop: "5px", lineHeight: 1.6 }}>
                {billToGstin && <div>GSTIN - {billToGstin}</div>}
                {billToPan && <div>PAN - {billToPan}</div>}
              </div>
              <div style={{ fontSize: "11.5px", color: INK, marginTop: "10px" }}>
                Place Of Supply: <span style={{ fontWeight: 700 }}>{placeOfSupply || "—"}</span>
              </div>
            </div>

            {/* Line item groups — one mini table per vehicle type, shared running # */}
            {groupedLineItems.map((group, gIdx) => (
              <div key={group.label} data-avoid-break="true" style={{ marginTop: gIdx === 0 ? "14px" : "10px" }}>
                {showGroupHeadings && (
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: ACCENT,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      marginBottom: "8px",
                    }}
                  >
                    {group.label}
                  </div>
                )}
                {(gIdx === 0 || showGroupHeadings) && (
                  <svg viewBox="0 0 640 32" width="100%" height="32" style={{ display: "block" }}>
                    <rect x="0" y="0" width="640" height="32" fill={ACCENT} />
                    <text x="6" y="16" dominantBaseline="middle" textAnchor="start" fill="#fff" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="10.8">#</text>
                    <text x="30" y="16" dominantBaseline="middle" textAnchor="start" fill="#fff" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="10.8">Description</text>
                    <text x="386" y="16" dominantBaseline="middle" textAnchor="start" fill="#fff" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="10.8">HSN/SAC</text>
                    <text x="482" y="16" dominantBaseline="middle" textAnchor="end" fill="#fff" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="10.8">Qty</text>
                    <text x="554" y="16" dominantBaseline="middle" textAnchor="end" fill="#fff" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="10.8">Rate</text>
                    <text x="634" y="16" dominantBaseline="middle" textAnchor="end" fill="#fff" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="10.8">Amount</text>
                  </svg>
                )}
                <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", fontSize: "10.8px" }}>
                  <colgroup>
                    <col style={{ width: "24px" }} />
                    <col />
                    <col style={{ width: "60px" }} />
                    <col style={{ width: "48px" }} />
                    <col style={{ width: "72px" }} />
                    <col style={{ width: "80px" }} />
                  </colgroup>
                  <tbody>
                    {group.items.map((it) => (
                      <tr key={it.id} style={{ borderBottom: `1px solid ${LINE_SOFT}` }}>
                        <td style={{ padding: "8px 6px", color: INK }}>{it._rowNo}</td>
                        <td style={{ padding: "8px 6px", color: INK }}>{it.description || "—"}</td>
                        <td style={{ padding: "8px 6px", color: INK }}>{it.hsnSac}</td>
                        <td style={{ padding: "8px 6px", textAlign: "right", color: INK }}>{Number(it.qty || 0).toFixed(2)}</td>
                        <td style={{ padding: "8px 6px", textAlign: "right", color: INK }}>{fmtMoney(it.rate)}</td>
                        <td style={{ padding: "8px 6px", textAlign: "right", fontWeight: 700, color: INK }}>
                          {fmtMoney((Number(it.qty) || 0) * (Number(it.rate) || 0))}
                        </td>
                      </tr>
                    ))}
                    {showGroupHeadings && (
                      <tr>
                        <td colSpan={5} style={{ padding: "6px 6px", textAlign: "right", fontWeight: 700, color: INK }}>
                          {group.label} Subtotal
                        </td>
                        <td style={{ padding: "6px 6px", textAlign: "right", fontWeight: 800, color: INK }}>
                          ₹{fmtMoney(group.groupSubtotal)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ))}
            {/* <div style={{ height: "1.5px", background: ACCENT, marginTop: "2px" }} /> */}


            <div data-avoid-break="true">
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
                <div style={{ width: "240px", fontSize: "11.5px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 4px", color: INK }}>
                    <span>Sub Total</span><span>{fmtMoney(subtotal)}</span>
                  </div>
                  {discountsComputed.some((d) => d.magnitude > 0) && (
                    <>
                      {discountsComputed
                        .filter((d) => d.magnitude > 0)
                        .map((d) => (
                          <div
                            key={d.id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              padding: "3px 4px",
                              color: d.mode === "decrease" ? "#DC2626" : "#15803d",
                            }}
                          >
                            <span>{d.label || "Discount"} {d.type === "percent" ? `(${d.value}%)` : ""}</span>
                            <span>{d.mode === "decrease" ? "-" : "+"}{fmtMoney(d.magnitude)}</span>
                          </div>
                        ))}
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 4px", color: INK, fontWeight: 700 }}>
                        <span>Sub Total After Discount</span><span>{fmtMoney(subtotalAfterDiscount)}</span>
                      </div>
                    </>
                  )}
                  {isTamilNadu ? (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 4px", color: INK }}>
                        <span>CGST9 ({cgstPercent}%)</span><span>{fmtMoney(cgstAmt)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 4px", color: INK }}>
                        <span>SGST9 ({sgstPercent}%)</span><span>{fmtMoney(sgstAmt)}</span>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 4px", color: INK }}>
                      <span>IGST18 ({igstPercent}%)</span><span>{fmtMoney(igstAmt)}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 4px", color: INK }}>
                    <span>Rounding</span><span>{fmtMoney(rounding)}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 4px",
                      marginTop: "4px",
                      // background: ACCENT_TINT,
                      fontWeight: 700,
                      fontSize: "13.5px",
                      color: INK,
                    }}
                  >
                    <span>Total</span><span>₹{fmtMoney(roundedTotal)}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "12px", fontSize: "11px", color: INK }}>
                <span style={{ fontWeight: 700 }}>Total in Words: &nbsp;</span>
                <span style={{ fontStyle: "italic" }}>{totalInWords}</span>
              </div>

              {/* Footer: signature mode switches this block */}
              {signatureMode === "unsigned" ? (
                <div style={{ marginTop: "24px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: INK, lineHeight: 1.6 }}>
                    Thank You For Adinn Roadshow. This Is A System-Generated Invoice And Does Not Require A Digital Signature.
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: "24px" }}>
                  <div style={{ fontSize: "11px", marginBottom: "6px" }}>
                    <span style={{ color: INK }}>For </span>
                    <span style={{ color: ACCENT, fontWeight: 700 }}>{COMPANY.shortName}</span>
                  </div>
                  {/* reserved blank space for a physical / scanned signature */}
                  <div style={{ height: "36px" }} />
                  <div style={{ fontSize: "11px", color: INK }}>Authorized Signature</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


      <div className="min-w-0 space-y-5 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:pr-1 self-start">
        <div className="flex items-center justify-between sticky top-0 z-10 bg-gray-50/95 dark:bg-gray-950/95 backdrop-blur -mx-1 px-1 py-2 rounded-xl">
          <div>
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <ReceiptText size={17} className="text-red-600" /> Invoice Details
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">{invoiceNumber}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving || disabled}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-60 transition-colors"
            >
              <Save size={13} /> {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => handleDownload()}
              disabled={downloading || disabled || isDirty}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-60 transition-colors"
            >
              <Download size={13} /> {downloading ? "Generating…" : "Download Invoice"}
            </button>
          </div>
        </div>

        <fieldset disabled={disabled} className="space-y-5 border-0 p-0 m-0 disabled:opacity-60">

        <div className={cardCls}>
          <p className={sectionTitleCls}>
            <FileText size={14} className="text-gray-400" /> Invoice Meta
          </p>
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className={labelCls}>Invoice Number <span className="text-red-500">*</span></label>
              <input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Invoice Date <span className="text-red-500">*</span></label>
              <DatePicker
                value={invoiceDate}
                onChange={handleInvoiceDateChange}
                minDate="2020-01-01"
                maxDate="2035-12-31"
                forceDown
              />
            </div>
            <div>
              <label className={labelCls}>Due Date <span className="text-red-500">*</span></label>
              <DatePicker
                value={dueDate}
                onChange={setDueDate}
                minDate="2020-01-01"
                maxDate="2035-12-31"
                forceDown
              />
            </div>
            <div>
              <label className={labelCls}>P.O.# <span className="text-red-500">*</span></label>
              <input value={poNumber} onChange={(e) => setPoNumber(e.target.value)} placeholder="PO Number" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Project Name <span className="text-red-500">*</span></label>
              <input value={projectName} onChange={(e) => setProjectName(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Place of Supply <span className="text-red-500">*</span></label>
              <select
                value={placeOfSupply}
                onChange={(e) => setPlaceOfSupply(e.target.value)}
                className={inputCls}
              >
                <option value="">Select state</option>
                {placeOfSupply && !stateOptions.includes(placeOfSupply) && (
                  <option value={placeOfSupply}>{placeOfSupply}</option>
                )}
                {stateOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className={cardCls}>
          <p className={sectionTitleCls}>
            <User2 size={14} className="text-gray-400" /> Bill To
          </p>
          <div>
            <label className={labelCls}>Name / Company <span className="text-red-500">*</span></label>
            <input value={billToName} onChange={(e) => setBillToName(toTitleCase(e.target.value))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Address</label>
            <textarea value={billToAddress} onChange={(e) => setBillToAddress(toTitleCase(e.target.value))} rows={2} autoComplete="off" name="invoice-bill-to-address" className={inputCls + " resize-none"} />
          </div>
          <div className="grid grid-cols-2 gap-3.5">
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

        <div className={cardCls}>
          <div className="flex items-center justify-between">
            <p className={sectionTitleCls}>
              <Percent size={14} className="text-gray-400" /> Label
            </p>
            <button
              type="button"
              onClick={addDiscount}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700"
            >
              <Plus size={13} /> Add Label
            </button>
          </div>

          {discountsComputed.map((d) => (
            <div key={d.id} className="rounded-xl border border-gray-150 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 p-3 space-y-2.5">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <label className={labelCls}>Label</label>
                  <input
                    value={d.label}
                    onChange={(e) => updateDiscount(d.id, { label: toTitleCase(e.target.value) })}
                    placeholder="Discount"
                    className={inputCls + " bg-white dark:bg-gray-900"}
                  />
                </div>
                {discounts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDiscount(d.id)}
                    className="shrink-0 mt-5 rounded-lg border border-red-200 text-red-500 p-2 hover:bg-red-50 transition-colors"
                    aria-label="Remove discount"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={labelCls}>Mode</label>
                  <select value={d.mode} onChange={(e) => updateDiscount(d.id, { mode: e.target.value })} className={inputCls + " bg-white dark:bg-gray-900"}>
                    <option value="decrease">Decrease</option>
                    <option value="add">Add</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Type</label>
                  <select value={d.type} onChange={(e) => updateDiscount(d.id, { type: e.target.value })} className={inputCls + " bg-white dark:bg-gray-900"}>
                    <option value="percent">%</option>
                    <option value="amount">₹</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Value</label>
                  <input
                    type="number"
                    value={d.value === 0 ? "" : d.value}
                    placeholder="0"
                    onChange={(e) => updateDiscount(d.id, { value: e.target.value === "" ? 0 : Number(e.target.value) || 0 })}
                    className={inputCls + " bg-white dark:bg-gray-900 text-right tabular-nums"}
                  />
                </div>
              </div>
              {d.magnitude > 0 && (
                <div className="flex items-center justify-between rounded-lg bg-white dark:bg-gray-900 px-3 py-2">
                  <span className="text-xs font-semibold text-gray-500">Discount Amount</span>
                  <span className={"text-sm font-bold tabular-nums " + (d.mode === "decrease" ? "text-red-600" : "text-green-700 dark:text-green-400")}>
                    {d.mode === "decrease" ? "-" : "+"}₹{fmtMoney(d.magnitude)}
                  </span>
                </div>
              )}
            </div>
          ))}

          {discounts.length > 1 && (
            <div className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-800/40 px-3 py-2 mt-1">
              <span className="text-xs font-semibold text-gray-500">Total Discount</span>
              <span className={"text-sm font-bold tabular-nums " + (totalDiscountAmt < 0 ? "text-red-600" : "text-green-700 dark:text-green-400")}>
                {totalDiscountAmt < 0 ? "-" : "+"}₹{fmtMoney(Math.abs(totalDiscountAmt))}
              </span>
            </div>
          )}
        </div>

        <div className={cardCls}>
          <div className="flex items-center justify-between">
            <p className={sectionTitleCls}>
              <ListChecks size={14} className="text-gray-400" /> Line Items by Vehicle Type
            </p>
            {/* <button
              onClick={addNewVehicleGroup}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700"
            >
              <Plus size={13} /> Add vehicle type
            </button> */}
          </div>

          <div className="space-y-6">
            {groupedLineItems.map((group) => (
              <div key={group.label} className="space-y-2.5">
                <div className="flex items-center justify-between rounded-lg bg-red-50/70 dark:bg-red-950/20 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                    <p className="text-[12px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wide">{group.label}</p>
                    <span className="text-[10.5px] text-gray-400 font-medium">· {group.items.length} item{group.items.length > 1 ? "s" : ""}</span>
                  </div>
                  <button
                    onClick={() => addItemToGroup(group.label)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700"
                  >
                    <Plus size={13} /> Add row
                  </button>
                </div>
                <div className="space-y-2.5">
                  {group.items.slice().reverse().map((it) => (
                    <div
                      key={it.id}
                      className="rounded-xl border border-gray-150 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 p-3 space-y-2.5"
                    >
                      <div className="flex items-start gap-2">
                        <textarea
                          value={it.description}
                          onChange={(e) => updateItem(it.id, { description: toTitleCase(e.target.value) })}
                          placeholder="Description"
                          rows={2}
                          className={inputCls + " resize-none flex-1 bg-white"}
                        />
                        <button
                          onClick={() => removeItem(it.id)}
                          className="shrink-0 rounded-lg border border-red-200 text-red-500 p-2 hover:bg-red-50 transition-colors"
                          aria-label="Remove line item"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className={labelCls}>HSN/SAC</label>
                          <input value={it.hsnSac} onChange={(e) => updateItem(it.id, { hsnSac: e.target.value })} className={inputCls + " bg-white"} />
                        </div>
                        <div>
                          <label className={labelCls}>Qty</label>
                          <input
                            type="number"
                            value={it.qty === 0 ? "" : it.qty}
                            placeholder="0"
                            onChange={(e) => updateItem(it.id, { qty: e.target.value === "" ? 0 : Number(e.target.value) || 0 })}
                            className={inputCls + " bg-white text-right tabular-nums"}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Rate</label>
                          <input
                            type="number"
                            value={it.rate === 0 ? "" : it.rate}
                            placeholder="0"
                            onChange={(e) => updateItem(it.id, { rate: e.target.value === "" ? 0 : Number(e.target.value) || 0 })}
                            className={inputCls + " bg-white text-right tabular-nums"}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end border-t border-gray-200/70 dark:border-gray-700/50 pt-2">
                        <p className="text-xs font-bold text-gray-700 dark:text-gray-200 tabular-nums">
                          ₹{fmtMoney((Number(it.qty) || 0) * (Number(it.rate) || 0))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 tabular-nums">
                    {group.label} Subtotal&nbsp; ₹{fmtMoney(group.groupSubtotal)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={cardCls}>
          <p className={sectionTitleCls}>
            <Percent size={14} className="text-gray-400" /> Tax
          </p>
          {isTamilNadu ? (
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className={labelCls}>CGST %</label>
                <input
                  type="number"
                  value={cgstPercent}
                  onChange={(e) => setCgstPercent(Number(e.target.value) || 0)}
                  className={inputCls + " text-right tabular-nums"}
                />
              </div>
              <div>
                <label className={labelCls}>SGST %</label>
                <input
                  type="number"
                  value={sgstPercent}
                  onChange={(e) => setSgstPercent(Number(e.target.value) || 0)}
                  className={inputCls + " text-right tabular-nums"}
                />
              </div>
            </div>
          ) : (
            <div>
              <label className={labelCls}>IGST %</label>
              <input
                type="number"
                value={igstPercent}
                onChange={(e) => setIgstPercent(Number(e.target.value) || 0)}
                className={inputCls + " text-right tabular-nums"}
              />
            </div>
          )}
          <div className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-800/40 px-3 py-2.5 mt-1">
            <span className="text-xs font-semibold text-gray-500">Grand Total</span>
            <span className="text-sm font-bold text-red-600 tabular-nums">₹{fmtMoney(roundedTotal)}</span>
          </div>
        </div>

        {/* Signature mode toggle */}
        <div className={cardCls}>
          <p className={sectionTitleCls}>
            <PenLine size={14} className="text-gray-400" /> Signature
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSignatureMode("unsigned")}
              className={
                "rounded-xl border p-3 text-left transition-colors " +
                (signatureMode === "unsigned"
                  ? "border-red-400 bg-red-50/70 dark:bg-red-950/20"
                  : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40")
              }
            >
              <div className="flex items-center gap-1.5 mb-1">
                <ShieldCheck size={14} className={signatureMode === "unsigned" ? "text-red-600" : "text-gray-400"} />
                <span className="text-[12px] font-bold text-gray-800 dark:text-gray-100">No Signature</span>
              </div>
              <p className="text-[10.5px] text-gray-400 leading-snug">
                System-generated notice, no signature block printed.
              </p>
            </button>
            <button
              onClick={() => setSignatureMode("signed")}
              className={
                "rounded-xl border p-3 text-left transition-colors " +
                (signatureMode === "signed"
                  ? "border-red-400 bg-red-50/70 dark:bg-red-950/20"
                  : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40")
              }
            >
              <div className="flex items-center gap-1.5 mb-1">
                <PenLine size={14} className={signatureMode === "signed" ? "text-red-600" : "text-gray-400"} />
                <span className="text-[12px] font-bold text-gray-800 dark:text-gray-100">With Signature</span>
              </div>
              <p className="text-[10.5px] text-gray-400 leading-snug">
                Reserves blank space + line for an authorized signature.
              </p>
            </button>
          </div>
        </div>
        </fieldset>
      </div>
    </div>
  );
}