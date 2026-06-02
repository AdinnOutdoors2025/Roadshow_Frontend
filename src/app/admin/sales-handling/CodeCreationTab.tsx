
import { getToken } from "../../utils/auth";
import { CheckCircle2, Mail, RefreshCw, Clock, Send } from "lucide-react";
import { toast } from "react-toastify";
import API_BASE from "../../../../baseurl";
import { useState } from "react";
import { SALES_STAGE_MAP, SALES_STAGES, SalesOrder } from "./page";
import axios from "axios";

// ── Types ────────────────────────────────────────────────────────────────────
interface ProjectMailLog {
  _id: string;
  sentTo: string;
  sentCc: string;
  subject: string;
  sentBy: string;
  sentAt: string;
  isResend: boolean;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const formatDateTime = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// ════════════════════════════════════════════════════════════════════════════
export default function CodeCreationTab({
  order,
  onRefresh,
}: {
  order: SalesOrder;
  onRefresh: () => Promise<void>;
}) {
  const [from, setFrom] = useState("automation@adinn.co.in");
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [sending, setSending] = useState(false);
  const [mailSentSuccess, setMailSentSuccess] = useState(false);
  const [mobileView, setMobileView] = useState<"form" | "preview">("form");
  const [subject, setSubject] = useState(
    `Project Code Creation Request - ${order.orderId} - ${order.name}`
  );
  const [toError, setToError] = useState("");
  const [ccError, setCcError] = useState("");
  const [showCodeForm, setShowCodeForm] = useState(false);
  const [projectCode, setProjectCode] = useState("");
  const [estimationCode, setEstimationCode] = useState("");
  const [projectCodeError, setProjectCodeError] = useState("");
  const [estimationCodeError, setEstimationCodeError] = useState("");
  const [codeSaving, setCodeSaving] = useState(false);
  const [codeSavedSuccess, setCodeSavedSuccess] = useState(false);
  const [rightPanel, setRightPanel] = useState<"preview" | "codeForm">("preview");

  // ── Mail logs from order ─────────────────────────────────────────────────
  const mailLogs: ProjectMailLog[] = (order as any).projectMailLogs || [];
  const hasSentBefore = mailLogs.length > 0;
  const lastSent = hasSentBefore ? mailLogs[mailLogs.length - 1] : null;

  const fmt = (n?: number | null) =>
    n != null ? `₹ ${n.toLocaleString("en-IN")}` : "—";

  const first = order.bookingItems?.[0];

  const subtotal = order.bookingItems.reduce(
    (s: number, i: any) => s + (i.totalAmount || 0),
    0
  );
  const totalNegotiated = (order.salesNegotiationArray || []).reduce(
    (s, n) => s + (n.amount || 0),
    0
  );
  const taxable = subtotal - totalNegotiated;
  const gstAmt = Math.floor(taxable * 0.18);
  const finalAmt = taxable + gstAmt;

  const hasPoDoc = (order.closedWonArray || []).some(
    (i: any) => i.salesPoDocument
  );
  const senderName = order.salesHandlerName || "Team";

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());



  const isValidEmailField = (value: string) => {
    const emails = value.split(",").map((e) => e.trim()).filter(Boolean);
    if (emails.length === 0) return false;
    return emails.every((e) => isValidEmail(e));
  };

  // ── Send / Resend handler ────────────────────────────────────────────────
  const handleSendMail = async () => {
    setToError("");
    setCcError("");

    if (!to.trim()) {
      setToError("To email is required");
      return;
    }
    if (!isValidEmailField(to)) {
      setToError("Enter a valid email address");
      return;
    }

    if (cc.trim() && !isValidEmailField(cc)) {
      setCcError("Enter a valid email address");
      return;
    }

    setSending(true);
    try {
      await axios.post(
        `${API_BASE}sales/pipeline/${order._id}/send-project-mail`,
        { from, to, cc, additionalNotes, subject }
      );
      toast.success(
        hasSentBefore
          ? "Project mail resent successfully!"
          : "Project creation mail sent!"
      );
      setMailSentSuccess(true);
      await onRefresh();
    } catch (e: any) {
      const errMsg =
        e?.response?.data?.message ||
        "Mail sending failed. Please try again.";

      toast.error(errMsg);
      setMailSentSuccess(false);
    } finally {
      setSending(false);
    }
  };

  const handleSaveProjectCode = async () => {
    setProjectCodeError("");
    setEstimationCodeError("");

    let valid = true;
    if (!projectCode.trim()) { setProjectCodeError("Project code is required"); valid = false; }
    if (!estimationCode.trim()) { setEstimationCodeError("Estimation code is required"); valid = false; }
    if (!valid) return;

    setCodeSaving(true);
    try {
      await axios.post(
        `${API_BASE}sales/pipeline/${order._id}/save-project-code`,
        { projectCode, estimationCode }
      );
      toast.success("Project code saved successfully!");
      setCodeSavedSuccess(true);
      await onRefresh();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to save project code");
    } finally {
      setCodeSaving(false);
    }
  };

  // ── Derived: updated logs after refresh ─────────────────────────────────
  const updatedLogs: ProjectMailLog[] = (order as any).projectMailLogs || [];
  const updatedHasSent = updatedLogs.length > 0;
  const updatedLastSent = updatedHasSent
    ? updatedLogs[updatedLogs.length - 1]
    : null;

  return (
    <div className="h-full flex flex-col">
      {/* ── Page Header ── */}
      <div className="flex-shrink-0 flex items-start justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div>
          <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-0.5">
            Zoho Project Mail
          </p>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Project Code Creation
          </h2>
          {/* Mail sent count badge */}
          {updatedHasSent && (
            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-[10px] font-bold">
              <CheckCircle2 size={9} />
              Mail sent {updatedLogs.length} time{updatedLogs.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="flex sm:hidden gap-2">
          <button
            onClick={() => setMobileView("form")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${mobileView === "form"
              ? "bg-red-600 text-white"
              : "border border-gray-200 text-gray-500"
              }`}
          >
            Mail Details
          </button>
        </div>

        {/* Desktop send button */}
        <div className="hidden sm:flex items-center gap-2">


          {(mailSentSuccess || updatedHasSent) && (
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
              <button
                onClick={() => setRightPanel("preview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${rightPanel === "preview"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                <Mail size={12} /> Mail Preview
              </button>
              <button
                onClick={() => setRightPanel("codeForm")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${rightPanel === "codeForm"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                Enter Project Code
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="flex-1 overflow-hidden flex flex-col sm:flex-row gap-0">
        {/* ── LEFT: Mail Form ── */}

        <div
          className={`sm:flex-1 overflow-y-auto p-5 space-y-4 bg-white dark:bg-gray-950 ${mobileView === "preview" ? "hidden sm:block" : "block"
            }`}
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 space-y-4 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Mail Details
            </h3>

            {/* ── Last sent info banner ── */}
            {updatedLastSent && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                <CheckCircle2
                  size={15}
                  className="text-green-600 mt-0.5 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-green-700 dark:text-green-300">
                    {updatedLastSent.isResend
                      ? "Mail Resent Successfully"
                      : "Mail Sent Successfully"}
                  </p>
                  <p className="text-[11px] text-green-600/80 dark:text-green-400/80 mt-0.5">
                    {formatDateTime(updatedLastSent.sentAt)} · by{" "}
                    {updatedLastSent.sentBy}
                  </p>
                  <p className="text-[11px] text-green-600/80 dark:text-green-400/80 truncate">
                    To: {updatedLastSent.sentTo}
                  </p>
                </div>
              </div>
            )}


            {mailSentSuccess ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 size={28} className="text-green-600" />
                </div>
                <p className="text-base font-bold text-green-700 dark:text-green-300">
                  Thank you! Mail sent successfully.
                </p>
                <p className="text-xs text-gray-400 text-center">
                  Your project creation mail has been sent to the team.
                </p>
                <button
                  onClick={() => setMailSentSuccess(false)}
                  className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-all"
                >
                  <RefreshCw size={14} /> Resend Project Creation Mail
                </button>
              </div>
            ) : (
              <>

                {/* To */}
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    To *
                  </label>
                  <input
                    value={to}
                    placeholder="adinn@gmail.com"
                    onChange={(e) => {
                      setTo(e.target.value);
                      if (!e.target.value.trim()) {
                        setToError("To email is required");
                      } else if (!isValidEmailField(e.target.value)) {
                        setToError("Enter a valid email address");
                      } else {
                        setToError("");
                      }
                    }}
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 transition-all ${toError
                      ? "border-red-400 focus:ring-red-400"
                      : "border-gray-200 dark:border-gray-700 focus:ring-red-400"
                      }`}
                  />
                  {toError && (
                    <p className="mt-1 text-xs text-red-500">{toError}</p>
                  )}
                </div>

                {/* CC */}
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    CC
                  </label>
                  <input
                    value={cc}
                    placeholder="adinn1@gmail.com"
                    onChange={(e) => {
                      setCc(e.target.value);
                      if (!e.target.value.trim()) {
                        setCcError("");
                      } else if (!isValidEmailField(e.target.value)) {
                        setCcError("Enter a valid email address");
                      } else {
                        setCcError("");
                      }
                    }}
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 transition-all ${ccError
                      ? "border-red-400 focus:ring-red-400"
                      : "border-gray-200 dark:border-gray-700 focus:ring-red-400"
                      }`}
                  />
                  {ccError && (
                    <p className="mt-1 text-xs text-red-500">{ccError}</p>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Subject
                  </label>
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Project Code Creation Request - ..."
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    rows={4}
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Add any additional notes for the project team..."
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                  />
                </div>

              </>
            )}

            {/* ── Send button (mobile) ── */}
            <button
              onClick={handleSendMail}
              disabled={sending}
              className="sm:hidden w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-bold transition-all flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : updatedHasSent ? (
                <>
                  <RefreshCw size={14} /> Resend Project Mail
                </>
              ) : (
                <>
                  <Mail size={14} /> Raise Project Creation Mail
                </>
              )}
            </button>

            {/* ── Send button (desktop — bottom of form) ── */}

            {!mailSentSuccess && (
              <button
                onClick={handleSendMail}
                disabled={sending}
                className="hidden sm:flex w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-bold transition-all items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : updatedHasSent ? (
                  <>
                    <RefreshCw size={14} /> Resend Project Creation Mail
                  </>
                ) : (
                  <>
                    <Mail size={14} /> Raise Project Creation Mail
                  </>
                )}
              </button>
            )}
          </div>

          {/* ── Mail History Section ── */}
          {updatedLogs.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={13} className="text-gray-400" />
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Mail History ({updatedLogs.length})
                </h3>
              </div>
              <div className="space-y-2.5">
                {[...updatedLogs].reverse().map((log, idx) => (
                  <div
                    key={log._id || idx}
                    className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <Send size={10} className="text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                          {log.isResend ? "Resent" : "Sent"}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {formatDateTime(log.sentAt)}
                        </span>
                        {idx === 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[9px] font-bold">
                            Latest
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">
                        To: {log.sentTo}
                      </p>
                      {log.sentCc && (
                        <p className="text-[11px] text-gray-400 truncate">
                          CC: {log.sentCc}
                        </p>
                      )}
                      <p className="text-[11px] text-gray-400">
                        By: {log.sentBy}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>


        {rightPanel === "preview" ? (

          <div
            className={`sm:flex-1 overflow-y-auto bg-gray-50/60 dark:bg-gray-900/40 ${mobileView === "form" ? "hidden sm:block" : "block"
              }`}
          >
            <div className="flex items-center justify-between py-2 px-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Mail Preview
              </h3>
              {hasPoDoc && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-[11px] font-bold">
                  <CheckCircle2 size={10} /> PO Attached
                </span>
              )}
            </div>


            {/* Subject — bordered card */}
            <div className="mx-4 mt-4 mb-3 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Subject
              </p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {subject}
              </p>
            </div>

            {/* Hi Team intro */}
            <div className="px-4 pb-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900">
              <p className="text-sm text-gray-600 dark:text-gray-400">Hi Team,</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Please create a Zoho project code for the below confirmed roadshow campaign.
              </p>
            </div>



            <div className="bg-white dark:bg-gray-900 rounded-none sm:rounded-2xl shadow-sm overflow-hidden">
              {/* Header Banner */}
              <div className="relative bg-gray-100 dark:bg-gray-800 h-40 flex items-center px-6 overflow-hidden">
                <div className="z-10">
                  <img
                    src="/images/logo.png"
                    alt="Adinn Logo"
                    className="h-12 object-contain"
                  />
                  {/* <p className="text-2xl font-black text-gray-900 dark:text-white mt-3 leading-tight">
                  Order
                  <br />
                  Summary
                </p> */}
                </div>
                <img
                  src="/images/vehiclesnew.png"
                  alt="Vehicles"
                  className="absolute right-7 top-5 h-46 object-contain"
                />
              </div>

              {/* Customer Details */}
              <div className="rounded-none border-b border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Customer Details
                  </span>
                </div>
                <div className="p-4 grid grid-cols-2 gap-x-6 gap-y-3">
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                      Order ID
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {order.orderId}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                      Customer Name
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {order.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                      Customer Type
                    </p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {order.customerType === 1
                        ? "Organization"
                        : order.customerType === 0
                          ? "Individual"
                          : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                      Phone
                    </p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      +91 {order.phone}
                    </p>
                  </div>
                  {order.email && (
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                        Email
                      </p>
                      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {order.email}
                      </p>
                    </div>
                  )}
                  {order.address && (
                    <div className="col-span-2">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                        Address
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {order.address}
                      </p>
                    </div>
                  )}
                  {order.companyName && (
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                        Company
                      </p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {order.companyName}
                      </p>
                    </div>
                  )}
                  {order.gstNumber && (
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                        GST Number
                      </p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {order.gstNumber}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Items */}
              {order.bookingItems.map((v: any, idx: number) => (
                <div
                  key={idx}
                  className="border-b border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-xs font-bold text-blue-600">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Order Details — Vehicle {idx + 1}
                    </span>
                    <span className="ml-auto text-xs font-bold text-blue-600">
                      {v.quantity} {v.quantity === 1 ? "Vehicle" : "Vehicles"}
                    </span>
                  </div>

                  <div className="p-4 space-y-1.5 bg-gray-50/40 dark:bg-gray-800/20">
                    {[
                      [
                        "Campaign",
                        v.campaignType === "Other"
                          ? v.otherCampaignType
                          : v.campaignType,
                      ],
                      [
                        "Duration",
                        v.fromDate && v.toDate
                          ? `${new Date(v.fromDate).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })} → ${new Date(v.toDate).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )} (${v.totalDays}D)`
                          : "—",
                      ],
                      [
                        "Route",
                        v.fromLocation && v.toLocation
                          ? `${v.fromLocation} → ${v.toLocation}`
                          : null,
                      ],
                      [
                        "State / City",
                        v.state && v.city ? `${v.state} / ${v.city}` : null,
                      ],
                      v.extraKm > 0 ? ["Extra KM", `${v.extraKm} km`] : null,
                      v.extraHours > 0
                        ? ["Extra Hours", `${v.extraHours} hrs`]
                        : null,
                      v.needPromoter
                        ? [
                          "Promoter",
                          `${v.promoterType === "Other"
                            ? v.otherPromoterType
                            : v.promoterType
                          } · ${v.promoterGender} · Qty ${v.promoterQuantity}`,
                        ]
                        : null,
                    ]
                      .filter(
                        (item): item is [string, string] =>
                          item !== null && item[1] != null
                      )
                      .map(([label, value], i) => (
                        <div key={i} className="flex justify-between text-sm gap-4">
                          <span className="text-gray-500 shrink-0">{label}</span>
                          <span className="text-gray-800 dark:text-gray-200 font-medium text-right">
                            {value}
                          </span>
                        </div>
                      ))}
                  </div>

                  <div className="px-4 pb-4 space-y-1">
                    {v.rentalCost > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">
                          Rental ({v.totalDays}D × ₹
                          {v.perDayRentalCost?.toLocaleString("en-IN")} ×{" "}
                          {v.quantity})
                        </span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          ₹{v.rentalCost?.toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}
                    {(v.promoterCost ?? 0) > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Promoter</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          ₹{v.promoterCost?.toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}
                    {(v.rtoCost ?? 0) > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">RTO</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          ₹{v.rtoCost?.toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}
                    {(v.extraKmCost ?? 0) > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Extra KM</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          ₹{v.extraKmCost?.toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}
                    {(v.extraHourCost ?? 0) > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Extra Hours</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          ₹{v.extraHourCost?.toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs font-bold pt-1 border-t border-gray-100 dark:border-gray-700 mt-1">
                      <span className="text-gray-700 dark:text-gray-300">
                        Vehicle {idx + 1} Total
                      </span>
                      <span className="text-blue-600">
                        ₹{v.totalAmount?.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Price Breakdown */}
              <div className="border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Price Breakdown
                  </span>
                </div>
                <div className="p-4">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                      <tr>
                        <td className="py-1.5 text-gray-500">
                          Subtotal (Excl. GST)
                        </td>
                        <td className="py-1.5 text-right font-bold text-gray-800 dark:text-gray-200">
                          {fmt(subtotal)}
                        </td>
                      </tr>
                      {totalNegotiated > 0 && (
                        <tr>
                          <td className="py-1.5 text-red-500">Discount</td>
                          <td className="py-1.5 text-right font-bold text-red-500">
                            −{fmt(totalNegotiated)}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td className="py-1.5 text-gray-500">Taxable Amount</td>
                        <td className="py-1.5 text-right font-bold text-gray-800 dark:text-gray-200">
                          {fmt(taxable)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1.5 text-gray-500">GST (18%)</td>
                        <td className="py-1.5 text-right font-bold text-gray-800 dark:text-gray-200">
                          {fmt(gstAmt)}
                        </td>
                      </tr>
                      <tr className="border-t-2 border-red-100 dark:border-red-900/30">
                        <td className="py-2 text-red-600 font-bold">
                          Final Amount
                        </td>
                        <td className="py-2 text-right font-bold text-red-600 text-base">
                          {fmt(finalAmt)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>



              {/* Additional Notes + Signoff */}
              {additionalNotes && (
                <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                    Additional Notes
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {additionalNotes}
                  </p>
                </div>
              )}
              <div className="px-5 py-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Thanks,
                </p>
                <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                  {senderName}
                </p>
              </div>
            </div>
          </div>

        ) : (
          <div className="flex-1 overflow-y-auto bg-gray-50/60 dark:bg-gray-900/40 p-6 flex items-start justify-center">
            <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">

              {/* Card Header */}
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20">
                <p className="text-[13px] font-bold text-teal-600 uppercase tracking-widest mb-0.5">
                  Zoho Project Code
                </p>
                {/* <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Enter Project Code
                </h3> */}
                <p className="text-sm text-gray-400 mt-0.5">
                  {order.orderId} — {order.name}
                </p>
              </div>

              {/* Already saved codes — order-ல் இருந்தா show பண்ணு */}
              {((order as any).projectCodeArray || []).length > 0 && (
                <div className="px-6 py-3 bg-teal-50 dark:bg-teal-900/20 border-b border-teal-100 dark:border-teal-800">
                  {[...(order as any).projectCodeArray].reverse().slice(0, 1).map((c: any, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-teal-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-teal-700 dark:text-teal-300">
                          Last Saved Code
                        </p>
                        <p className="text-[14px] text-teal-700/80 mt-0.5">
                         <span className="text-[14px]">Project Code:</span>  <span className="font-semibold">{c.projectCode}</span>
                          &nbsp;·&nbsp;
                         <span className="text-[14px]">Estimation Code:</span>  <span className="font-semibold">{c.estimationCode}</span>
                        </p>
                        <p className="text-[13px] mt-0.5">
                          By {c.savedBy} · {formatDateTime(c.savedAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Form Body */}
              {codeSavedSuccess ? (
                /* ── Success Screen ── */
                <div className="flex flex-col items-center justify-center py-12 px-6 gap-3">
                  <div className="w-14 h-14 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                    <CheckCircle2 size={28} className="text-teal-600" />
                  </div>
                  <p className="text-base font-bold text-teal-700 dark:text-teal-300">
                    Project Code Saved!
                  </p>
                  <p className="text-xs text-gray-400 text-center">
                    Project code and estimation code have been saved successfully.
                  </p>
                  <button
                    onClick={() => {
                      setCodeSavedSuccess(false);
                      setProjectCode("");
                      setEstimationCode("");
                    }}
                    className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold transition-all"
                  >
                    <RefreshCw size={14} /> Update Code
                  </button>
                </div>
              ) : (
                /* ── Input Form ── */
                <div className="p-6 space-y-4">
                  {/* Project Code */}
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      Project Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={projectCode}
                      placeholder="e.g. PROJ-2024-001"
                      onChange={(e) => {
                        setProjectCode(e.target.value);
                        if (!e.target.value.trim()) setProjectCodeError("Project code is required");
                        else setProjectCodeError("");
                      }}
                      className={`w-full border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 transition-all ${projectCodeError
                          ? "border-red-400 focus:ring-red-400"
                          : "border-gray-200 dark:border-gray-700 focus:ring-teal-400"
                        }`}
                    />
                    {projectCodeError && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                       {projectCodeError}
                      </p>
                    )}
                  </div>

                  {/* Estimation Code */}
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      Estimation Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={estimationCode}
                      placeholder="e.g. EST-2024-001"
                      onChange={(e) => {
                        setEstimationCode(e.target.value);
                        if (!e.target.value.trim()) setEstimationCodeError("Estimation code is required");
                        else setEstimationCodeError("");
                      }}
                      className={`w-full border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 transition-all ${estimationCodeError
                          ? "border-red-400 focus:ring-red-400"
                          : "border-gray-200 dark:border-gray-700 focus:ring-teal-400"
                        }`}
                    />
                    {estimationCodeError && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      {estimationCodeError}
                      </p>
                    )}
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={handleSaveProjectCode}
                    disabled={codeSaving}
                    className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    {codeSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={15} /> Save Project Code
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
