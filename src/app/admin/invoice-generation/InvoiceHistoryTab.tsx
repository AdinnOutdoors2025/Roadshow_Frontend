"use client";
import { History, ReceiptText, PlusCircle, MinusCircle, PencilLine } from "lucide-react";

interface InvoiceHistoryChange {
  section: string;
  field: string;
  oldValue: any;
  newValue: any;
}

interface LineItemFieldChange {
  field: string;
  oldValue: any;
  newValue: any;
}

interface LineItemChange {
  groupLabel: string;
  action: "added" | "removed" | "edited";
  description: string;
  hsnSac: string;
  qty: number;
  rate: number;
  fieldChanges: LineItemFieldChange[];
}

interface InvoiceHistoryEntry {
  action: "created" | "updated";
  changes: InvoiceHistoryChange[];
  lineItemChanges?: LineItemChange[];
  editedBy?: string;
  editedAt: string;
}

interface Props {
  invoiceHistory?: InvoiceHistoryEntry[];
}

const SECTION_ORDER = ["Invoice Meta", "Bill To", "Discount", "Tax", "Signature"];

const fmtDatetime = (s?: string) =>
  s
    ? new Date(s).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}(T[\d:.Z]+)?$/;

const fmtHistoryDate = (v: string) => {
  const d = new Date(v);
  if (isNaN(d.getTime())) return v;
  const yyyy = d.getFullYear();
  const mon = d.toLocaleString("en-US", { month: "short" });
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mon}-${dd}`;
};

const DISCOUNT_MODE_LABELS: Record<string, string> = {
  add: "Increase",
  decrease: "Decrease",
};

const fmtMoney = (n: number) =>
  (Number(n) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Discount "Value" row — signed ₹/% display matching the Invoice Details
// form's own "+₹1,000.00" (increase) / "-₹1,000.00" (decrease) styling.
const formatDiscountAmount = (value: any, mode?: string, type?: string) => {
  if (value === null || value === undefined || value === "") return "—";
  const sign = mode === "add" ? "+" : "-";
  const amountText = type === "percent" ? `${value}%` : `₹${fmtMoney(value)}`;
  return `${sign}${amountText}`;
};

const displayVal = (v: any, field?: string) => {
  if (v === null || v === undefined || v === "") return "—";
  if (field === "Mode" && typeof v === "string" && DISCOUNT_MODE_LABELS[v]) {
    return DISCOUNT_MODE_LABELS[v];
  }
  if (typeof v === "number") return String(v);
  if (typeof v === "string" && ISO_DATE_RE.test(v)) return fmtHistoryDate(v);
  return String(v);
};

export default function InvoiceHistoryTab({ invoiceHistory }: Props) {
  const history = [...(invoiceHistory || [])].sort(
    (a, b) => new Date(b.editedAt).getTime() - new Date(a.editedAt).getTime()
  );

  if (history.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400">
        <History size={32} className="mx-auto mb-2 opacity-30" />
        <p className="text-sm">No invoice changes recorded yet</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {history.map((h, idx) => {
        const changesBySection: Record<string, InvoiceHistoryChange[]> = {};
        (h.changes || []).forEach((c) => {
          const key = c.section || "Other";
          if (!changesBySection[key]) changesBySection[key] = [];
          changesBySection[key].push(c);
        });
        const sectionKeys = [
          ...SECTION_ORDER.filter((s) => changesBySection[s]),
          ...Object.keys(changesBySection).filter((s) => !SECTION_ORDER.includes(s)),
        ];

        const lineItemGroups: Record<string, LineItemChange[]> = {};
        (h.lineItemChanges || []).forEach((li) => {
          const key = li.groupLabel || "General";
          if (!lineItemGroups[key]) lineItemGroups[key] = [];
          lineItemGroups[key].push(li);
        });

        return (
          <div key={idx} className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                {h.action === "created" ? (
                  <ReceiptText size={14} className="text-green-500" />
                ) : (
                  <History size={14} className="text-blue-500" />
                )}
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {h.action === "created" ? "Invoice created" : "Invoice updated"} by {h.editedBy || "Admin"}
                </span>
              </div>
              <span className="text-xs text-gray-400">{fmtDatetime(h.editedAt)}</span>
            </div>

            {sectionKeys.length === 0 && Object.keys(lineItemGroups).length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-400">Invoice generated — no field changes.</div>
            ) : (
              <div className="p-4 space-y-4">
                {sectionKeys.map((section) => (
                  <div key={section}>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{section}</p>
                    <div className="space-y-1.5">
                      {changesBySection[section].map((c, i) => {
                        if (section === "Discount" && c.field === "Value") {
                          const modeC = changesBySection[section].find((x) => x.field === "Mode");
                          const typeC = changesBySection[section].find((x) => x.field === "Type");
                          const oldText = formatDiscountAmount(c.oldValue, modeC?.oldValue, typeC?.oldValue);
                          const newText = formatDiscountAmount(c.newValue, modeC?.newValue, typeC?.newValue);
                          return (
                            <div
                              key={i}
                              className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-800/40 rounded-lg px-3 py-2"
                            >
                              <span className="text-gray-500">{c.field}</span>
                              <span className="text-right">
                                <span className="text-red-500 line-through mr-2">{oldText}</span>
                                <span className="text-green-600 font-medium">{newText}</span>
                              </span>
                            </div>
                          );
                        }
                        return (
                          <div
                            key={i}
                            className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-800/40 rounded-lg px-3 py-2"
                          >
                            <span className="text-gray-500">{c.field}</span>
                            <span className="text-right">
                              <span className="text-red-500 line-through mr-2">{displayVal(c.oldValue, c.field)}</span>
                              <span className="text-green-600 font-medium">{displayVal(c.newValue, c.field)}</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {Object.keys(lineItemGroups).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                      Line Items by Vehicle Type
                    </p>
                    <div className="space-y-2">
                      {Object.entries(lineItemGroups).map(([group, items]) => (
                        <div key={group} className="rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-500 bg-gray-50 dark:bg-gray-800/60">
                            {group}
                          </div>
                          <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {items.map((li, i) => (
                              <div key={i} className="px-3 py-2">
                                <div
                                  className={
                                    "flex items-center gap-1.5 text-xs font-semibold mb-1 " +
                                    (li.action === "added"
                                      ? "text-green-600"
                                      : li.action === "removed"
                                        ? "text-red-500"
                                        : "text-amber-600")
                                  }
                                >
                                  {li.action === "added" && <PlusCircle size={12} />}
                                  {li.action === "removed" && <MinusCircle size={12} />}
                                  {li.action === "edited" && <PencilLine size={12} />}
                                  {li.action === "added" ? "Added" : li.action === "removed" ? "Removed" : "Edited"}
                                  <span className="text-gray-500 font-normal">— {li.description || "Line item"}</span>
                                </div>

                                {li.action === "edited" ? (
                                  <div className="space-y-1 ml-4">
                                    {li.fieldChanges.map((fc, j) => (
                                      <div
                                        key={j}
                                        className="flex items-center justify-between text-[12.5px] bg-gray-50 dark:bg-gray-800/40 rounded px-2 py-1"
                                      >
                                        <span className="text-gray-500">{fc.field}</span>
                                        <span className="text-right">
                                          <span className="text-red-500 line-through mr-2">{displayVal(fc.oldValue)}</span>
                                          <span className="text-green-600 font-medium">{displayVal(fc.newValue)}</span>
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="ml-4 text-[12.5px] text-gray-500">
                                    HSN/SAC: {li.hsnSac || "—"} &nbsp;·&nbsp; Qty: {li.qty} &nbsp;·&nbsp; Rate: ₹{li.rate}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
