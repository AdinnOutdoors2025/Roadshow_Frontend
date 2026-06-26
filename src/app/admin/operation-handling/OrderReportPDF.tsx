

/* eslint-disable */
// @ts-nocheck
import { useRef, useState } from "react";

const fmtDate = (s?: string) => {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};
const fmtDatetime = (s?: string) => {
  if (!s) return "—";
  return new Date(s).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};
const fmt = (n?: number | null) => n != null ? `₹ ${n.toLocaleString("en-IN")}` : "—";
const getVehicleTypeName = (vehicleTypeId: string, vehicleTypes: any[]) => {
  if (!vehicleTypeId || !vehicleTypes) return "Vehicle";
  const v = vehicleTypes.find((vt: any) => vt._id === vehicleTypeId);
  return v?.typeName || "Vehicle";
};
const STAGE_LABELS: Record<string, string> = {
  todo: "To-Do", projectCodeCreation: "Project Code Creation", projectExecution: "Project Execution",
  onRoad: "On Road", campaignRunning: "Campaign Running", vehicleUnavailable: "Vehicle Unavailable",
  clientClosure: "Client Closure & Feedback", invoiceGeneration: "Invoice Generation",
  paymentStage2: "Payment Processing Stage 2", closedWon: "Closed Won", closedLost: "Closed Lost",
};

// ── Inline style constants ────────────────────────────────────── ────────────
const S = {
  page: { fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "12px", color: "#1a1a1a", background: "#fff", lineHeight: "1.5", padding: "32px 36px", maxWidth: "860px", margin: "0 auto" } as React.CSSProperties,
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", paddingBottom: "16px", borderBottom: "2.5px solid #1e3a5f", marginBottom: "24px" } as React.CSSProperties,
  brandName: { fontSize: "22px", fontWeight: 800, color: "#1e3a5f", letterSpacing: "-0.5px" } as React.CSSProperties,
  brandSub: { fontSize: "11px", color: "#6b7280", marginTop: "2px" } as React.CSSProperties,
  reportMeta: { textAlign: "right" as const },
  reportTitle: { fontSize: "16px", fontWeight: 700, color: "#1e3a5f" } as React.CSSProperties,
  reportSub: { fontSize: "13px", color: "#9ca3af", marginTop: "2px" } as React.CSSProperties,
  codeBadge: { display: "inline-block", background: "#eff6ff", color: "#1d4ed8", fontFamily: "monospace", fontSize: "12px", fontWeight: 700, paddingBottom: "10px", paddingLeft: "10px", paddingRight: "10px", borderRadius: "6px", border: "1px solid #bfdbfe", marginTop: "10px" } as React.CSSProperties,

  // section: { marginBottom: "22px" } as React.CSSProperties,
  section: { marginBottom: "22px", pageBreakInside: "avoid", breakInside: "avoid" } as React.CSSProperties,
  sectionTitleBase: { display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.8px", color: "#fff", padding: "8px 14px", borderRadius: "8px 8px 0 0" } as React.CSSProperties,
  sectionBody: { border: "1px solid #e5e7eb", borderTop: "none", borderRadius: "0 0 8px 8px", padding: "14px" } as React.CSSProperties,

  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" } as React.CSSProperties,
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px 16px" } as React.CSSProperties,
  grid4: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px" } as React.CSSProperties,

  fieldLabel: { fontSize: "9.5px", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.5px", color: "#9ca3af", marginBottom: "2px" } as React.CSSProperties,
  fieldValue: { fontSize: "12px", fontWeight: 600, color: "#111827" } as React.CSSProperties,

  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: "11px" } as React.CSSProperties,
  th: { background: "#f3f4f6", color: "#6b7280", fontSize: "9.5px", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.5px", padding: "7px 10px", textAlign: "left" as const, borderBottom: "1px solid #e5e7eb" } as React.CSSProperties,
  td: { padding: "7px 10px", borderBottom: "1px solid #f3f4f6", color: "#374151", verticalAlign: "top" as const } as React.CSSProperties,
  tdRight: { padding: "7px 10px", borderBottom: "1px solid #f3f4f6", color: "#374151", verticalAlign: "top" as const, textAlign: "right" as const } as React.CSSProperties,

  divider: { border: "none", borderTop: "1px solid #e5e7eb", margin: "12px 0" } as React.CSSProperties,

  // vehicleCard: { border: "1px solid #e5e7eb", borderRadius: "8px", marginBottom: "12px", overflow: "hidden" } as React.CSSProperties,
  vehicleCard: { border: "1px solid #e5e7eb", borderRadius: "8px", marginBottom: "12px", overflow: "hidden", pageBreakInside: "avoid", breakInside: "avoid" } as React.CSSProperties,
  vehicleCardHeader: { background: "#f0f9ff", padding: "8px 12px", borderBottom: "1px solid #bae6fd", display: "flex", alignItems: "center", justifyContent: "space-between" } as React.CSSProperties,
  vehicleCardTitle: { fontWeight: 700, fontSize: "12px", color: "#075985" } as React.CSSProperties,
  vehicleCardBody: { padding: "12px" } as React.CSSProperties,

  statCard: { border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px 12px", textAlign: "center" as const } as React.CSSProperties,
  statLabel: { fontSize: "9.5px", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.4px" } as React.CSSProperties,
  statValue: { fontSize: "18px", fontWeight: 800, color: "#111827", marginTop: "3px" } as React.CSSProperties,
  statSub: { fontSize: "9.5px", color: "#6b7280", marginTop: "2px" } as React.CSSProperties,

  timelineItem: { display: "flex", gap: "12px", marginBottom: "10px" } as React.CSSProperties,
  timelineDot: { width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: 800, color: "#fff", flexShrink: 0, marginTop: "1px", paddingBottom: "10px" } as React.CSSProperties,
  timelineContent: { flex: 1, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "8px 12px", marginBottom: "2px" } as React.CSSProperties,
  timelineStage: { fontSize: "11px", fontWeight: 700, color: "#111827" } as React.CSSProperties,
  timelineMeta: { fontSize: "10px", color: "#9ca3af", marginTop: "2px" } as React.CSSProperties,

  issueCardOpen: { borderRadius: "8px", padding: "10px 12px", marginBottom: "8px", background: "#fff7ed", border: "1px solid #fed7aa" } as React.CSSProperties,
  issueCardResolved: { borderRadius: "8px", padding: "10px 12px", marginBottom: "8px", background: "#f0fdf4", border: "1px solid #bbf7d0" } as React.CSSProperties,
  unavailCard: { borderRadius: "8px", padding: "10px 12px", marginBottom: "8px", background: "#fff1f2", border: "1px solid #fecdd3" } as React.CSSProperties,
  availCard: { borderRadius: "8px", padding: "10px 12px", marginBottom: "8px", background: "#f0fdf4", border: "1px solid #bbf7d0" } as React.CSSProperties,

  footer: { marginTop: "28px", paddingTop: "12px", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#9ca3af" } as React.CSSProperties,
};

const Badge = ({ children, color }: { children: React.ReactNode; color: "green" | "red" | "blue" | "amber" | "gray" | "sky" | "violet" }) => {
  const colors = {
    green: { background: "#d1fae5", color: "#065f46" },
    red: { background: "#fee2e2", color: "#991b1b" },
    blue: { background: "#dbeafe", color: "#1e40af" },
    amber: { background: "#fef3c7", color: "#92400e" },
    gray: { background: "#f3f4f6", color: "#374151" },
    sky: { background: "#e0f2fe", color: "#075985" },
    violet: { background: "#ede9fe", color: "#5b21b6" },
  };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      borderRadius: "20px",
      fontSize: "10px", fontWeight: 700, lineHeight: 1.4,
      whiteSpace: "nowrap",
      verticalAlign: "middle", paddingBottom: "15px", paddingLeft: "10px", paddingRight: "10px",
      ...colors[color]
    }}>
      {children}
    </span>
  );
};

const SectionTitle = ({ children, bg }: { children: React.ReactNode; bg: string }) => (
  <div style={{ ...S.sectionTitleBase, background: bg }}>{children}</div>
);

export default function OrderReportPDF({ order, vehicleTypes, gpsData }: { order: any; vehicleTypes: any[]; gpsData: any[] }) {
  const printRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const handlePrint = async () => {
    const content = printRef.current;
    if (!content) return;
    setLoading(true);

    content.style.display = "block";
    content.style.position = "fixed";
    content.style.top = "-99999px";
    content.style.left = "0";
    content.style.width = "900px";
    content.style.zIndex = "-1";

    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: html2canvas } = await import("html2canvas");

      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: 900,
        scrollX: 0,
        scrollY: 0,
      });


      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = pdfWidth / canvasWidth;
      const sliceHeight = Math.floor(pdfHeight / ratio);


      const avoidBreakEls = content.querySelectorAll<HTMLElement>("[data-avoid-break]");
      const contentRect = content.getBoundingClientRect();
      const scale = canvas.width / content.offsetWidth;

     

      const getSmartBreaks = () => {
        const breaks: number[] = [];
        let y = sliceHeight;
        const maxIterations = 200;
        let iterations = 0;

        while (y < canvasHeight && iterations < maxIterations) {
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
          const safeBreak = proposedBreak > (breaks[breaks.length - 1] ?? 0) + 20
            ? proposedBreak
            : y;

          breaks.push(safeBreak);
          y = safeBreak + sliceHeight;
        }
        return breaks;
      };

      const pageBreaks = getSmartBreaks();
      const allBreaks = [...pageBreaks, canvasHeight];
      let yOffset = 0;
      let pageNum = 0;

   

      const topPaddingPx = 40;

      for (const breakY of allBreaks) {
        const height = Math.min(breakY - yOffset, canvasHeight - yOffset);
        if (height <= 0) continue;
        if (pageNum > 0) pdf.addPage();

        const isFirstPage = pageNum === 0;
        const extraTop = isFirstPage ? 0 : topPaddingPx;

        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvasWidth;
        pageCanvas.height = height + extraTop;

        const ctx = pageCanvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

          ctx.drawImage(canvas, 0, yOffset, canvasWidth, height, 0, extraTop, canvasWidth, height);
        }

        pdf.addImage(
          pageCanvas.toDataURL("image/png"),
          "PNG",
          0, 0,
          pdfWidth,
          pageCanvas.height * ratio
        );

        yOffset = breakY;
        pageNum++;
      }

      const code = order.projectCodeArray?.[0]?.projectCode || order.orderId;
      pdf.save(`Order_Report_${code}.pdf`);
    } catch (err) {
      console.error("PDF error:", err);
    } finally {
      content.style.display = "none";
      content.style.position = "";
      content.style.top = "";
      content.style.left = "";
      content.style.width = "";
      content.style.zIndex = "";
      setLoading(false);
    }
  };

  // ── Computed ─────────────────────────────────────────────────────────────
  const subtotal = order.bookingItems.reduce((s: number, i: any) => s + (i.totalAmount || 0), 0);
  const totalDiscount = (order.negotiationLogs || []).reduce((s: number, l: any) => s + (l.discountAmount || 0), 0);
  const taxable = subtotal - totalDiscount;
  const gstAmt = Math.floor(taxable * 0.18);
  const finalAmt = taxable + gstAmt;
  const pipelineLogs = [...(order.pipelineLogs || [])].reverse();
  const driverEntries = order.onRoadExecutionArray || [];
  const driverHistory = order.onRoadDriverHistory || [];
  const unavailHistory = order.onRoadUnavailableHistory || [];
  const allIssues = order.onRoadIssues || [];

  return (
    <>
      {/* ── Hidden PDF content ── */}
      <div ref={printRef} style={{ display: "none" }}>
        <div style={S.page}>

          {/* ══ HEADER ══ */}
          <div style={S.header}>
            <div>
              <img
                src="/images/logo.png"
                alt="Adinn Logo"
                className="h-12 object-contain"
              />
              {/* <div style={S.brandName}>Adinn Outdoors</div>
              <div style={S.brandSub}>RoadshowAdinn — Operations Report</div> */}
            </div>
            <div style={S.reportMeta}>
              <div style={S.reportTitle}>Order Report</div>
              <div style={S.reportSub}>Generated: {fmtDatetime(new Date().toISOString())}</div>
              {order.projectCodeArray?.[0]?.projectCode && (
                <div style={S.codeBadge}>{order.projectCodeArray[0].projectCode}</div>
              )}
            </div>
          </div>

          {/* ══ SECTION 1: OVERVIEW ══ */}
          <div style={S.section}>
            <SectionTitle bg="#1d4ed8">Customer Overview</SectionTitle>
            <div style={S.sectionBody}>
              <div style={S.grid2}>
                {([
                  // ["Order ID", order.orderId],
                  ["Customer Name", order.name],
                  ["Customer Type", order.customerType === 1 ? "Organization" : "Individual"],
                  ["Phone", `+91 ${order.phone}`],
                  ["Email", order.email || "—"],
                  // ["Pipeline Status", STAGE_LABELS[order.pipelineStatus] || order.pipelineStatus],
                  ["Handler BY", order.handlerName || "—"],
                  // ["Customer Category", order.customerCategory || "—"],
                  order.companyName ? ["Company", order.companyName] : null,
                  order.gstNumber ? ["GST Number", order.gstNumber] : null,
                  order.designation ? ["Designation", order.designation] : null,
                  ["Order Created At", fmtDatetime(order.createdAt)],
                  ["Last Updated", fmtDatetime(order.updatedAt)],
                ] as ([string, string] | null)[])
                  .filter(Boolean)
                  .map(([label, value]: any, i) => (
                    <div key={i}>
                      <div style={S.fieldLabel}>{label}</div>
                      <div style={S.fieldValue}>{value}</div>
                    </div>
                  ))}
              </div>

              {(order.projectCodeArray || []).length > 0 && (
                <>
                  <hr style={S.divider} />
                  <div style={{ ...S.fieldLabel, marginBottom: 8 }}>Project Codes</div>
                  <table style={S.table}>
                    <thead>
                      <tr>
                        {["#", "Project Code", "Estimation Code", "Created By", "Created At"].map(h => (
                          <th key={h} style={S.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {order.projectCodeArray.map((c: any, i: number) => (
                        <tr key={i}>
                          <td style={S.td}>{i + 1}</td>
                          <td style={{ ...S.td, fontFamily: "monospace", fontWeight: 700, color: "#1d4ed8" }}>{c.projectCode}</td>
                          <td style={{ ...S.td, fontFamily: "monospace", color: "#0f766e" }}>{c.estimationCode}</td>
                          <td style={S.td}>{c.savedBy}</td>
                          <td style={S.td}>{fmtDatetime(c.savedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </div>

          {/* ══ SECTION 2: BOOKING ITEMS ══ */}
          <div style={S.section}>
            <SectionTitle bg="#0f766e">Booking Items & Pricing</SectionTitle>
            <div style={S.sectionBody}>
              {order.bookingItems.map((item: any, idx: number) => (
                <div key={idx} style={S.vehicleCard} data-avoid-break="true">
                  <div style={S.vehicleCardHeader}>
                    <div style={S.vehicleCardTitle}>
                      Vehicle {idx + 1} — {getVehicleTypeName(item.vehicleType, vehicleTypes)}
                    </div>
                    <Badge color="sky">{item.campaignType}</Badge>
                  </div>
                  <div style={S.vehicleCardBody}>
                    <div style={{ ...S.grid3, marginBottom: 10 }}>
                    
                      {([
                        ["Campaign Name", item.campaignName],

                        ["Campaign Type", item.campaignType === "Other"
                          ? item.otherCampaignType
                          : item.campaignType],

                        ["Duration", `${fmtDate(item.fromDate)} → ${fmtDate(item.toDate)}`],

                        ["Total Days",
                          `${item.totalDays}D${item.extraDays > 0 ? ` + ${item.extraDays}D` : ""}`],

                        ["Route", `${item.fromLocation} → ${item.toLocation}`],

                        ["City / State", `${item.city || ""} / ${item.state || ""}`],

                        ["Quantity", `${item.quantity} Vehicle${item.quantity > 1 ? "s" : ""}`],

                        ...(item.extraKm > 0
                          ? [["Extra KM", `${item.extraKm} km`]]
                          : []),

                        ...(item.extraHours > 0
                          ? [["Extra Hours", `${item.extraHours} hours`]]
                          : []),

                        ...(item.needPromoter
                          ? [[
                            "Promoter",
                            `${item.promoterType === "Other"
                              ? item.otherPromoterType
                              : item.promoterType} · ${item.promoterGender} · ${item.promoterLanguage} · Qty ${item.promoterQuantity}`
                          ]]
                          : []),
                      ] as [string, string][])
                        .map(([l, v], i) => (
                          <div key={i}>
                            <div style={S.fieldLabel}>{l}</div>
                            <div style={{ ...S.fieldValue, fontSize: "11px" }}>{v}</div>
                          </div>
                        ))}
                    </div>
                    <table style={S.table}>
                      <thead>
                        <tr>
                          <th style={S.th}>Item</th>
                          <th style={{ ...S.th, textAlign: "right" }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.rentalCost > 0 && (
                          <tr>
                            <td style={S.td}>Rental ({item.totalDays}D × ₹{item.perDayRentalCost?.toLocaleString("en-IN")} × {item.quantity})</td>
                            <td style={S.tdRight}>{fmt(item.rentalCost)}</td>
                          </tr>
                        )}
                        {(item.promoterCost ?? 0) > 0 && (
                          <tr>
                            <td style={S.td}>Promoter ({item.totalDays}D × ₹{item.promoterChargePerDay?.toLocaleString("en-IN")} × {item.promoterQuantity})</td>
                            <td style={S.tdRight}>{fmt(item.promoterCost)}</td>
                          </tr>
                        )}
                        {(item.rtoCost ?? 0) > 0 && (
                          <tr><td style={S.td}>RTO Charges</td><td style={S.tdRight}>{fmt(item.rtoCost)}</td></tr>
                        )}
                        {(item.extraKmCost ?? 0) > 0 && (
                          <tr>
                            <td style={S.td}>Extra KM ({item.extraKm}km × ₹{item.dailyKmcharges})</td>
                            <td style={S.tdRight}>{fmt(item.extraKmCost)}</td>
                          </tr>
                        )}
                        {(item.extraHourCost ?? 0) > 0 && (
                          <tr>
                            <td style={S.td}>Extra Hours ({item.extraHours}hrs × ₹{item.additionalHourCharges})</td>
                            <td style={S.tdRight}>{fmt(item.extraHourCost)}</td>
                          </tr>
                        )}
                        {(item.additionalCharges || []).filter((c: any) => c.label).map((c: any, i: number) => (
                          <tr key={i}>
                            <td style={{ ...S.td, color: c.mode === "-" ? "#dc2626" : undefined }}>{c.label}</td>
                            <td style={{ ...S.tdRight, color: c.mode === "-" ? "#dc2626" : undefined }}>
                              {c.mode === "-" ? "-" : "+"}{fmt(c.amount)}
                            </td>
                          </tr>
                        ))}
                        <tr>
                          <td style={{ ...S.td, fontWeight: 700, color: "#1d4ed8" }}>Total (excl. GST)</td>
                          <td style={{ ...S.tdRight, fontWeight: 700, color: "#1d4ed8" }}>{fmt(item.totalAmount)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              {/* Grand total */}
              <table style={{ ...S.table, marginTop: 8 }}>
                <tbody>
                  <tr><td style={S.td}>Subtotal (Excl. GST)</td><td style={{ ...S.tdRight, fontWeight: 700 }}>{fmt(subtotal)}</td></tr>
                  <tr><td style={S.td}>Taxable Amount</td><td style={{ ...S.tdRight, fontWeight: 700 }}>{fmt(taxable)}</td></tr>
                  <tr><td style={S.td}>GST (18%)</td><td style={{ ...S.tdRight, fontWeight: 700 }}>{fmt(gstAmt)}</td></tr>
                  <tr>
                    <td style={{ ...S.td, fontWeight: 700, color: "#dc2626", fontSize: "13px", borderTop: "2px solid #fee2e2" }}>Final Amount</td>
                    <td style={{ ...S.tdRight, fontWeight: 700, color: "#dc2626", fontSize: "13px", borderTop: "2px solid #fee2e2" }}>{fmt(finalAmt)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>



          {/* ══ SECTION 4: EXECUTION HISTORY ══ */}
          {driverEntries.length > 0 && (
            <div style={S.section}>
              <SectionTitle bg="#0284c7">Execution — Driver HISTORY</SectionTitle>
              <div style={S.sectionBody}>

                {driverHistory.length > 0 && (
                  <>
                    {/* <hr style={S.divider} /> */}
                    <div style={{ ...S.fieldLabel, marginBottom: 8, marginTop: 8 }}>
                      Driver Change History ({driverHistory.length} records)
                    </div>


                    {order.bookingItems.map((bookingItem: any, bIdx: number) => {
                      const entriesForBooking = driverEntries.filter((e: any) => e.vehicleIndex === bIdx);
                      const historyForBooking = driverHistory.filter((h: any) => h.vehicleIndex === bIdx);
                      if (historyForBooking.length === 0) return null;

                      return (
                        <div key={bIdx} data-avoid-break="true" style={{ marginBottom: 16 }}>
                          {/* Booking item header */}
                          <div style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                            background: "#f0f9ff", border: "1px solid #bae6fd",
                            borderRadius: "6px", padding: "8px 12px", marginBottom: 8, height: "44px"
                          }}>
                            <div style={{
                              display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0
                            }}>
                              <div style={{
                                width: 32, height: 32, borderRadius: "50%",
                                background: "#0284c7", display: "flex", alignItems: "center",
                                justifyContent: "center", fontSize: "11px", fontWeight: 800, color: "#fff",
                                flexShrink: 0, lineHeight: 1, paddingBottom: "15px"
                              }}>V{bIdx + 1}</div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 1.5, minWidth: 0 }}>
                                <span style={{ fontWeight: 700, fontSize: "12px", color: "#075985", lineHeight: 1.2 }}>
                                  {getVehicleTypeName(bookingItem.vehicleType, vehicleTypes)}
                                </span>
                                <span style={{ fontSize: "10px", color: "#6b7280", lineHeight: 1.2 }}>
                                  {bookingItem.campaignType} · {bookingItem.city}
                                </span>
                              </div>
                            </div>
                            <span style={{
                              fontSize: "10px", fontWeight: 700,
                              background: "#e0f2fe", color: "#075985",
                              padding: "4px 12px", borderRadius: "20px", whiteSpace: "nowrap",
                              display: "inline-flex", alignItems: "center", justifyContent: "center",
                              flexShrink: 0, paddingBottom: "15px"
                            }}>
                              {historyForBooking.length} records
                            </span>
                          </div>




                          {entriesForBooking.map((entry: any, eIdx: number) => {
                            const regHistory = [...historyForBooking].reverse().filter((h: any) =>
                              h.vehicleRegistrationNumber === entry.vehicleRegistrationNumber ||
                              h.changedFields?.vehicleRegistrationNumber?.old === entry.vehicleRegistrationNumber ||
                              h.changedFields?.vehicleRegistrationNumber?.new === entry.vehicleRegistrationNumber
                            );
                            if (regHistory.length === 0) return null;

                            return (
                              <div key={eIdx} data-avoid-break="true" style={{
                                marginBottom: 12,
                                border: "1px solid #e0f2fe",
                                borderRadius: "8px",
                                overflow: "hidden",
                              }}>

                                {/* Reg No header — full card header */}
                                <div style={{
                                  display: "flex", alignItems: "center", gap: 10,
                                  padding: "8px 8px",
                                  background: "#f0f9ff",
                                  borderBottom: "1px solid #bae6fd",
                                  flexWrap: "nowrap",
                                }}>


                                  <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",  // Add this
                                    gap: 6,
                                    background: "#fff",
                                    border: "1px solid #bae6fd",
                                    borderRadius: "6px",
                                    flexShrink: 0,
                                  }}>
                                    <div style={{
                                      width: 7, height: 7, borderRadius: "50%",
                                      background: entry.onRoadStatus === 1 ? "#22c55e" : "#9ca3af"
                                    }} />
                                    <span style={{
                                      fontFamily: "monospace",
                                      fontWeight: 800,
                                      fontSize: "11px",
                                      color: "#075985",
                                      letterSpacing: "0.3px",
                                      paddingBottom: "13px",
                                      paddingRight: "5px"
                                      // No text-align needed for inline-flex
                                    }}>
                                      {entry.vehicleRegistrationNumber}
                                    </span>
                                  </div>

                                  {/* Driver name */}
                                  <span style={{
                                    fontSize: "11px", fontWeight: 700, color: "#374151", paddingBottom: "10px",
                                    flexShrink: 0,
                                  }}>
                                    {entry.driverName}
                                  </span>

                                  {/* Dot separator */}
                                  <span style={{ fontSize: "10px", color: "#d1d5db", flexShrink: 0, }}>·</span>

                                  {/* Phone */}
                                  <span style={{
                                    fontSize: "10px", color: "#6b7280", paddingBottom: "10px",
                                    flexShrink: 0,
                                  }}>
                                    {entry.driverPhone}
                                  </span>

                                  {/* Status badge — pushed to right */}
                                  <div style={{ marginLeft: "auto" }}>
                                    <span style={{
                                      display: "inline-flex", alignItems: "center", gap: 5,
                                      fontSize: "10px", fontWeight: 700,
                                      borderRadius: "20px",
                                      background: entry.onRoadStatus === 1 ? "#d1fae5" : "#f3f4f6",
                                      // color: entry.onRoadStatus === 1 ? "#065f46" : "#6b7280",
                                      border: `1px solid ${entry.onRoadStatus === 1 ? "#bbf7d0" : "#e5e7eb"}`,
                                      lineHeight: 1, paddingBottom: "15px", paddingRight: "10px"
                                    }}>
                                      <span style={{
                                        width: 7, height: 7, borderRadius: "50%",
                                        // background: entry.onRoadStatus === 1 ? "#22c55e" : "#9ca3af",
                                        display: "inline-block",
                                      }} />
                                      {entry.onRoadStatus === 1 ? "On Road" : "Off Road"}
                                    </span>
                                  </div>
                                </div>

                                {/* Table inside card */}
                                <table style={{ ...S.table, margin: 0 }}>
                                  <thead>
                                    <tr>
                                      {["Action", "Driver Name", "Phone", "Reg. No", "Changed By", "Changed At", "What Changed"].map(h => (
                                        <th key={h} style={{ ...S.th, background: "#f8fafc" }}>{h}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {regHistory.map((h: any, i: number) => (
                                      <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                                        <td style={{ ...S.td, verticalAlign: "middle", textAlign: "center", width: "70px", paddingTop: "20px" }}>
                                          <Badge color={h.action === "created" ? "blue" : "amber"}>
                                            {h.action === "created" ? "Added" : "Updated"}
                                          </Badge>
                                        </td>
                                        <td style={{ ...S.td, verticalAlign: "middle", fontWeight: 700 }}>{h.driverName}</td>
                                        <td style={{ ...S.td, verticalAlign: "middle" }}>{h.driverPhone}</td>
                                        <td style={{ ...S.td, verticalAlign: "middle", fontFamily: "monospace" }}>{h.vehicleRegistrationNumber}</td>
                                        <td style={{ ...S.td, verticalAlign: "middle" }}>{h.changedBy}</td>
                                        <td style={{ ...S.td, verticalAlign: "middle", fontSize: "10px" }}>{fmtDatetime(h.changedAt)}</td>
                                        <td style={{ ...S.td, verticalAlign: "middle", fontSize: "10px" }}>
                                          {h.changedFields && Object.keys(h.changedFields).length > 0
                                            ? Object.entries(h.changedFields).map(([field, val]: any, fi: number) => (
                                              <div key={fi} style={{ marginBottom: fi < Object.keys(h.changedFields).length - 1 ? 4 : 0 }}>
                                                <span style={{ fontWeight: 700, color: "#374151" }}>
                                                  {field === "driverName" ? "Driver Name"
                                                    : field === "driverPhone" ? "Phone"
                                                      : field === "vehicleRegistrationNumber" ? "Reg. No"
                                                        : field}:
                                                </span>{" "}
                                                <span style={{ color: "#dc2626", textDecoration: "line-through" }}>{val.old}</span>
                                                {" → "}
                                                <span style={{ color: "#16a34a", fontWeight: 600 }}>{val.new}</span>
                                              </div>
                                            ))
                                            : <span style={{ color: "#9ca3af" }}>—</span>}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          )}

          {/* ══ SECTION 3: COMMENTS ══ */}
          {(() => {
            const allComments: any[] = [];
            (order.todoArray || []).forEach((item: any) => {
              if (item.notes || item.document) {
                allComments.push({ text: item.notes || "", by: item.uploadedBy || "—", at: item.uploadedAt, stage: "To-Do" });
              }
            });
            (order.projectExecutionArray || []).forEach((item: any) => {
              if (item.notes || item.document) {
                allComments.push({ text: item.notes || "", by: item.uploadedBy || "—", at: item.uploadedAt, stage: "Project Execution" });
              }
            });
            (order.onRoadCommentsArray || []).forEach((item: any) => {
              if (item.notes || item.document) {
                allComments.push({ text: item.notes || "", by: item.uploadedBy || "—", at: item.uploadedAt, stage: "On Road" });
              }
            });
            allComments.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
            if (allComments.length === 0) return null;

            const stageColors: Record<string, string> = {
              "To-Do": "#6b7280",
              "Project Execution": "#0f766e",
              "On Road": "#0284c7",
            };

            return (
              <div style={S.section}>
                <SectionTitle bg="#6d28d9">Comments History ({allComments.length} comments)</SectionTitle>
                <div style={S.sectionBody}>
                  {allComments.map((c: any, i: number) => (
                    <div key={i} data-avoid-break="true" style={{
                      display: "flex", gap: 10, padding: "10px 0",
                      borderBottom: i < allComments.length - 1 ? "1px solid #f3f4f6" : "none"
                    }}>

                      <div style={{
                        width: 32, height: 32, borderRadius: "50%", background: "#4f46e5",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "11px", fontWeight: 800, color: "#fff", flexShrink: 0, paddingBottom: "10px"
                      }}>
                        {(c.by || "?").charAt(0).toUpperCase()}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "#111827" }}>{c.by}</span>
                          <span style={{
                            fontSize: "9.5px", fontWeight: 700, padding: "1px 7px", borderRadius: "20px",
                            background: "#f3f4f6", color: stageColors[c.stage] || "#6b7280"
                          }}>
                            {c.stage}
                          </span>
                          <span style={{ fontSize: "10px", color: "#9ca3af", marginLeft: "auto" }}>
                            {fmtDatetime(c.at)}
                          </span>
                        </div>
                        {c.text && (
                          <p style={{ fontSize: "11px", color: "#374151", margin: 0, lineHeight: 1.5 }}>{c.text}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}



          {/* ══ SECTION 3: PIPELINE HISTORY ══ */}
          <div style={S.section}>
            <SectionTitle bg="#7c3aed">Pipeline History ({pipelineLogs.length} events)</SectionTitle>
            <div style={S.sectionBody}>
              {pipelineLogs.length === 0 ? (
                <p style={{ color: "#9ca3af", fontSize: "11px" }}>No pipeline history</p>
              ) : (
                <div>
                  {pipelineLogs.map((log: any, i: number) => (
                    <div key={i} style={S.timelineItem} data-avoid-break="true">
                      <div style={{ ...S.timelineDot, background: "#7c3aed" }}>{i + 1}</div>
                      <div style={S.timelineContent}>
                        <div style={S.timelineStage}>
                          {log.fromStage
                            ? `${STAGE_LABELS[log.fromStage] || log.fromStage} → ${STAGE_LABELS[log.toStage] || log.toStage}`
                            : `Started at ${STAGE_LABELS[log.toStage] || log.toStage}`}
                        </div>
                        <div style={S.timelineMeta}>
                          By {log.movedBy || "—"}
                          {log.handlerName ? ` · Handler: ${log.handlerName}` : ""}
                          {" · "}{fmtDatetime(log.movedAt)}
                        </div>
                        {log.notes?.trim() && (
                          <div style={{ fontSize: "10px", color: "#2563eb", marginTop: "3px", fontStyle: "italic" }}>
                            "{log.notes}"
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ══ SECTION 5: UNAVAILABLE HISTORY ══ */}
          {unavailHistory.length > 0 && (
            <div style={S.section}>
              <SectionTitle bg="#dc2626">Vehicle Unavailable History ({unavailHistory.length} records)</SectionTitle>
              <div style={S.sectionBody}>
                {[...unavailHistory].reverse().map((h: any, i: number) => (
                  <div key={i} data-avoid-break="true" style={h.status === "unavailable" ? S.unavailCard : S.availCard}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: "12px" }}>
                          {h.driverName} — <span style={{ fontFamily: "monospace" }}>{h.vehicleRegNo}</span>
                        </span>
                        <span style={{ marginLeft: 8 }}>
                          <Badge color={h.status === "unavailable" ? "red" : "green"}>
                            {h.status === "unavailable" ? "Unavailable" : "Available"}
                          </Badge>
                        </span>
                      </div>
                      <span style={{ fontSize: "10px", color: "#9ca3af" }}>{fmtDatetime(h.reportedAt)}</span>
                    </div>
                    <p style={{ fontSize: "11px", color: "#374151" }}><strong>Reason:</strong> {h.reason}</p>
                    <p style={{ fontSize: "10px", color: "#9ca3af", marginTop: 3 }}>Reported by {h.reportedBy}</p>
                    {h.status === "available" && (
                      <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #bbf7d0" }}>
                        {h.resolveDescription && <p style={{ fontSize: "11px" }}><strong>Resolution:</strong> {h.resolveDescription}</p>}
                        <p style={{ fontSize: "10px", color: "#9ca3af", marginTop: 3 }}>Resolved by {h.resolvedBy} · {fmtDatetime(h.resolvedAt)}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ SECTION 6: ISSUES ══ */}
          {allIssues.length > 0 && (
            <div data-avoid-break="true" style={S.section}>
              <SectionTitle bg="#d97706">Issue / Escalation History ({allIssues.length} total)</SectionTitle>
              <div style={S.sectionBody}>
                <div data-avoid-break="true" style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                  {[
                    { label: "Issue", value: allIssues.filter((i: any) => i.status === "open").length, color: "#dc2626" },
                    { label: "Resolved", value: allIssues.filter((i: any) => i.status === "resolved").length, color: "#16a34a" },
                    { label: "Total", value: allIssues.length, color: "#111827" },
                  ].map((s, i) => (
                    <div key={i} style={{ ...S.statCard, flex: 1 }}>
                      <div style={S.statLabel}>{s.label}</div>
                      <div style={{ ...S.statValue, color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>
                {[...allIssues].reverse().map((iss: any, i: number) => (
                  <div key={i} data-avoid-break="true" style={iss.status === "open" ? S.issueCardOpen : S.issueCardResolved}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: iss.status === "open" ? "#c2410c" : "#15803d" }}>
                        {iss.driverName} — <span style={{ fontFamily: "monospace" }}>{iss.vehicleRegNo}</span>
                      </div>
                      <Badge color={iss.status === "open" ? "amber" : "green"}>
                        {iss.status === "open" ? "Issue" : "Resolved"}
                      </Badge>
                    </div>
                    <p style={{ fontSize: "11px", marginTop: 4, color: "#374151" }}><strong>Issue:</strong> {iss.issueDescription}</p>
                    <p style={{ fontSize: "10px", color: "#9ca3af", marginTop: 3 }}>Reported by {iss.reportedBy} · {fmtDatetime(iss.reportedAt)}</p>
                    {iss.status === "resolved" && (
                      <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #bbf7d0" }}>
                        <p style={{ fontSize: "11px" }}><strong>Resolution:</strong> {iss.resolveDescription}</p>
                        <p style={{ fontSize: "10px", color: "#9ca3af", marginTop: 3 }}>Resolved by {iss.resolvedBy} · {fmtDatetime(iss.resolvedAt)}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ FOOTER ══ */}
          <div style={S.footer}>
            <span> RoadshowAdinn Platform</span>
            <span>Generated: {fmtDatetime(new Date().toISOString())}</span>
            {/* <span>Order: {order.orderId}</span> */}
          </div>

        </div>
      </div>

      {/* ── Download Button ── */}
      <button
        onClick={handlePrint}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold transition-all whitespace-nowrap"
      >
        {loading ? (
          <>
            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download PDF
          </>
        )}
      </button>
    </>
  );
}

